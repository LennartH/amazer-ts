import _ from "lodash";
import { Area } from "../domain/area";
import { Vector, Direction, Size } from "../domain/common";
import { Field, configFrom, decapitalize, Dict } from "../util";


export interface GeneratorConfig {
    readonly size: Size;
}

export interface AreaGenerator<C extends GeneratorConfig> {
    (config: C): Area;
}

export interface GeneratorWithConfig<C extends GeneratorConfig> {
    readonly generator: AreaGenerator<C>;
    readonly config?: C;
}

const _generators: Dict<AreaGenerator<any>> = {};
const _configFields: Dict<Field[]> = {};

export function generators(): Array<[AreaGenerator<any>, Field[] | undefined]> {
    let result: Array<[AreaGenerator<any>, Field[] | undefined]> = [];
    for (let name in _generators) {
        result.push([_generators[name], _configFields[name]]);
    }
    return result;
}

export function registerGenerator(generator: AreaGenerator<any>, configFields?: Field[] | undefined) {
    const generatorName = generator.name;
    _generators[generatorName] = generator;
    if (configFields !== undefined) {
        _configFields[generatorName] = configFields;
    }
}

export function parseGenerator<C extends GeneratorConfig>(arg: any): GeneratorWithConfig<C> {
    let generatorName: string;
    let configData: any;
    if (typeof arg === "string") {
        const parts = arg.split(":");
        generatorName = parts[0];
        configData = parts[1];
    } else {
        generatorName = Object.keys(arg)[0];
        configData = arg[generatorName];
    }

    const _generator = generator<C>(generatorName);
    let config: any = undefined;
    if (configData !== undefined && _configFields.hasOwnProperty(generatorName)) {
        try {
            config = configFrom(configData, _configFields[generatorName]);
        } catch (error) {
            throw new Error(`Error parsing generator ${_generator.name}: ${error.message}`);
        }
    }
    return {generator: _generator, config: config};
}

export function generator<C extends GeneratorConfig>(name: string): AreaGenerator<C> {
    let cleanedName = decapitalize(name);
    const generator = _generators[cleanedName];
    if (generator === undefined) {
        throw new Error(`No generator with name ${name} could be found`);
    }
    return generator;
}

export class VisitedTile {
    private readonly walkableDirections: Direction[];

    constructor(
        readonly point: Vector,
        walkableDirections: Iterable<Direction>
    ) {
        this.walkableDirections = _.shuffle(walkableDirections);
    }

    hasNext(): boolean {
        return this.walkableDirections.length > 0;
    }

    next(): Direction {
        let next = this.walkableDirections.pop();
        if (next === undefined) {
            throw new Error("No walkable directions left")
        }
        return next;
    }
}