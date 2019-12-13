import _ from "lodash";
import { Area } from "../domain/area";
import { Vector, Direction, Size } from "../domain/common";
import { Field, configFrom, Dict } from "../util";


/**
 * Base interface containing all general {@link AreaGenerator} config
 * attributes.
 */
export interface GeneratorConfig {
    /** The size of the {@link Area} to generate. */
    readonly size: Size;
}

/** Functional interface for area generators. */
export interface AreaGenerator<C extends GeneratorConfig> {
    (config: C): Area;
}

/** Helper interface for an {@link AreaGenerator} and its config. */
export interface GeneratorWithConfig<C extends GeneratorConfig> {
    readonly generator: AreaGenerator<C>;
    readonly config?: C;
}

/** Helper interface for a registered {@link AreaGenerator}. */
export interface RegisteredGenerator<C extends GeneratorConfig> {
    readonly name: string;
    readonly generator: AreaGenerator<C>;
    readonly configFields?: Field[];
}

const _generators: Dict<AreaGenerator<any>> = {};
const _configFields: Dict<Field[]> = {};

/**
 * Registers the given {@link AreaGenerator} and the fields describing
 * its config (without the fields in {@link GeneratorConfig}). This allows
 * other utility methods to retrieve the registered generator and construct
 * its config.
 * 
 * @see {@link generators}
 * @see {@link generator}
 * @see {@link parseGenerator}
 */
export function registerGenerator(name: string, generator: AreaGenerator<any>, configFields?: Field[] | undefined) {
    _generators[name] = generator;
    if (configFields !== undefined) {
        _configFields[name] = configFields;
    }
}

/**
 * @returns A list of all {@link registerGenerator registered} and their config
 *      {@link Field fields} (if provided) as tuples.
 */
export function generators(): RegisteredGenerator<any>[] {
    let result: RegisteredGenerator<any>[] = [];
    for (let name in _generators) {
        result.push({
            name: name,
            generator: _generators[name],
            configFields: _configFields[name]
        });
    }
    return result;
}

/**
 * Parses the given data as {@link AreaGenerator} with config (if possible).
 * 
 * The given data must be string with format `<generator name>[:<config data>]`
 * or an object, where the first key is the generator name and its value is
 * the config data.
 * 
 * {@link configFrom} is used to create a config object from the config data.
 * 
 * @param data The generator data to be parsed
 * 
 * @throws An error, if the config data can not be parsed.
 */
export function parseGenerator<C extends GeneratorConfig>(data: any): GeneratorWithConfig<C> {
    let generatorName: string;
    let configData: any;
    if (typeof data === "string") {
        const parts = data.split(":");
        generatorName = parts[0];
        configData = parts[1];
    } else {
        generatorName = Object.keys(data)[0];
        configData = data[generatorName];
    }

    const _generator = generator<C>(generatorName);
    let config: any = undefined;
    if (configData !== undefined && _configFields.hasOwnProperty(_generator.name)) {
        try {
            config = configFrom(configData, _configFields[_generator.name]);
        } catch (error) {
            throw new Error(`Error parsing config for generator ${generatorName}: ${error.message}`);
        }
    }
    return {generator: _generator, config: config};
}

/**
 * @param name The algorithm name
 * 
 * @returns The {@link AreaGenerator} with the given name.
 * 
 * @throws An error, if no generator with the given name can be found.
 */
export function generator<C extends GeneratorConfig>(name: string): AreaGenerator<C> {
    const generator = _generators[name];
    if (generator === undefined) {
        throw new Error(`No generator with name ${name} could be found`);
    }
    return generator;
}

/**
 * Utility class representing a tile inside an area that has been
 * visitied, including the walkable directions outgoing from the tile.
 * 
 * Used by several area generation algorithms.
 */
export class VisitedTile {
    private readonly walkableDirections: Direction[];

    constructor(
        readonly point: Vector,
        walkableDirections: Iterable<Direction>
    ) {
        this.walkableDirections = _.shuffle(walkableDirections);
    }

    /**
     * @returns `true`, if there are walkable directions remaining.
     */
    hasNext(): boolean {
        return this.walkableDirections.length > 0;
    }

    /**
     * @returns The next walkable direction, moving the iterator forwards.
     * 
     * @throws An error, if no walkable directions are left (see {@link hasNext}).
     */
    next(): Direction {
        let next = this.walkableDirections.pop();
        if (next === undefined) {
            throw new Error("No walkable directions left")
        }
        return next;
    }
}