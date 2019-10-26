import { Size, Direction, Point, Vector } from "./common";

export class Tile {
    static readonly Empty = Tile.impassable("Empty");

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
        return this;
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

    forEach(consumer: (t: Tile, p?: Vector) => void) {
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

    neighbours(point: Vector): Neighbours {
        let neighbours: Neighbours = {};
        for (let direction of Direction.values()) {
            let newPoint = point.translate(direction);
            if (this.contains(newPoint)) {
                neighbours[direction.name] = this.get(newPoint);
            }
        }
        return neighbours;
    }
}

export interface Neighbours {
    [direction: string]: Tile
}