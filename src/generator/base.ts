import { Area } from "../domain/area";
import { Vector, Direction, Size } from "../domain/common";
import { RecursiveBacktracker, RandomArea, RandomizedKruskal, RandomizedPrim } from "./simple";
import _ from "lodash";
import { Nystrom, NystromConfigFields } from "./nystrom";
import { Field, configFrom, decapitalize } from "../util";


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

// TODO Reverse dependencies: User register function instead of static list
const generators: AreaGenerator<any>[] = [
    RecursiveBacktracker, RandomizedKruskal, RandomizedPrim, RandomArea, Nystrom
];

const generatorConfigFields: Map<AreaGenerator<any>, Field[]> = new Map();
generatorConfigFields.set(Nystrom, NystromConfigFields);

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

    const gen = generator<C>(generatorName);
    let config: any = undefined;
    if (configData !== undefined && generatorConfigFields.has(gen)) {
        try {
            config = configFrom(configData, generatorConfigFields.get(gen)!);
        } catch (error) {
            throw new Error(`Error parsing generator ${gen.name}: ${error.message}`);
        }
    }
    return {generator: gen, config: config};
}

export function generator<C extends GeneratorConfig>(name: string): AreaGenerator<C> {
    let cleanedName = decapitalize(name);
    const generator = generators.find(g => g.name == cleanedName);
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