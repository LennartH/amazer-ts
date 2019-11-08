import _ from "lodash";
import { Size, Direction, Point, Vector } from "./common";

export class Tile {
    static readonly Empty = Tile.impassable("Empty");

    static readonly Floor = Tile.passable("Floor");
    static readonly Wall = Tile.impassable("Wall");

    constructor(
        readonly name: string,
        readonly passable: boolean
    ) { }

    static passable(name: string): Tile {
        return new Tile(name, true)
    }

    static impassable(name: string): Tile {
        return new Tile(name, false)
    }
}

export class Area {
    readonly tiles: Tile[][];

    constructor(size: Size, initialTile=Tile.Empty) {
        this.tiles = [];
        for (let x = 0; x < size.width; x++) {
            this.tiles[x] = []
            for (let y = 0; y < size.height; y++) {
                this.tiles[x][y] = initialTile;
            }
        }
    }

    get width(): number {
        return this.tiles.length;
    }

    get height(): number {
        return this.tiles[0].length;
    }

    get size(): Size {
        return {width: this.width, height: this.height};
    }

    *points(): Iterable<Vector> {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                yield new Vector(x, y);
            }
        }
    }

    *cells(): Iterable<[Tile, Vector]> {
        for (let p of this.points()) {
            yield [this.get(p), p];
        }
    }

    forEach(consumer: (t: Tile, p: Vector) => void) {
        for (let [t, p] of this.cells()) {
            consumer(t, p);
        }
    }
    
    get(point: Point): Tile {
        return this.tiles[point.x][point.y];
    }

    set(point: Point, tile: Tile) {
        this.tiles[point.x][point.y] = tile;
    }

    contains(point: Point): boolean {
        const x = point.x;
        const y = point.y;
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    neighbours(point: Vector, directions?: Iterable<Direction>): Neighbours {
        let neighbours: Neighbours = {};
        directions = directions || Direction.all();
        for (let direction of directions) {
            let newPoint = point.translate(direction);
            if (this.contains(newPoint)) {
                neighbours[direction.name] = this.get(newPoint);
            }
        }
        return neighbours;
    }

    fill(tile: Tile) {
        for (let point of this.points()) {
            if (this.get(point) === Tile.Empty) {
                this.set(point, tile);
            }
        }
    }
}

export interface Neighbours {
    [direction: string]: Tile
}

export function floodFill(area: Area, predicate: (t: Tile) => boolean): Array<Array<Vector>> {
    const sections: Array<Array<Vector>> = [];

    const points = _.shuffle(Array.from(area.points()));
    let start = points.find(p => predicate(area.get(p)));
    while (start !== undefined) {
        const section: Vector[] = [];
        const stack: Vector[] = [start];
        while (stack.length > 0) {
            const point = stack.pop()!;
            section.push(point);
            for (let direction of Direction.straights()) {
                const neighbour = point.translate(direction);
                // TODO Can this be cleaned?
                if (area.contains(neighbour) && predicate(area.get(neighbour)) && !section.some(p => p.x === neighbour.x && p.y === neighbour.y)) {
                    stack.push(neighbour);
                }
            }
        }
        sections.push(section);
        // TODO Can this be cleaned?
        start = points.find(s => predicate(area.get(s)) && !sections.some(sec => sec.some(p => p.x === s.x && p.y === s.y)));
    }

    return sections;
}