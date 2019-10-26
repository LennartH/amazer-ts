import { Area } from "../domain/area";
import { Size, Vector, Direction } from "../domain/common";
import { RecursiveBacktracker, RandomArea } from "./simple";
import { TileSet } from "../domain/tileset";
import _ from "lodash";

export { RecursiveBacktracker } from "./simple";


export interface GeneratorConfig {
    size: Size;
    tileSet: TileSet;
}

export interface AreaGenerator {
    (config: GeneratorConfig): Area;
}

const generators: AreaGenerator[] = []
generators.push(RecursiveBacktracker);
generators.push(RandomArea);

export function generator(name: string): AreaGenerator | undefined {
    let cleanName = name.charAt(0).toLowerCase() + name.slice(1);
    return generators.find(generator => {
        return generator.name == cleanName;
    });
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