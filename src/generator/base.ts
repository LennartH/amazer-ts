import { Area } from "../domain/area";
import { Size, Vector, Direction } from "../domain/common";
import { RecursiveBacktracker, RandomArea, RandomizedKruskal, RandomizedPrim } from "./simple";
import { TileSet } from "../domain/tileset";
import _ from "lodash";


export interface GeneratorConfig {
    size: Size;
    tileSet: TileSet;
}

export interface AreaGenerator {
    (config: GeneratorConfig): Area;
}

const generators: AreaGenerator[] = []
generators.push(RecursiveBacktracker);
generators.push(RandomizedKruskal);
generators.push(RandomizedPrim);
generators.push(RandomArea);

export function generator(name: string): AreaGenerator | undefined {
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