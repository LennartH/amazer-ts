import { Area } from "../domain/area";
import { Vector, Direction, Size } from "../domain/common";
import { RecursiveBacktracker, RandomArea, RandomizedKruskal, RandomizedPrim } from "./simple";
import _ from "lodash";
import { Nystrom } from "./nystrom";


export interface GeneratorConfig {
    readonly size: Size;
}

export interface AreaGenerator<C extends GeneratorConfig> {
    (config: C): Area;
}

const generators: AreaGenerator<any>[] = [
    RecursiveBacktracker, RandomizedKruskal, RandomizedPrim, RandomArea, Nystrom
];

export function generator<C extends GeneratorConfig>(name: string): AreaGenerator<C> {
    let cleanedName = name.charAt(0).toLowerCase() + name.slice(1);
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