import _ from "lodash";
import { Size, Direction, Point, Vector } from "./common";


/**
 * Represents tiles inside an {@link Area}. Has a name for
 * identification and the information if it is passable or
 * not, which is used by several algorithms.
 * 
 * Provides default instances for floor, wall and empty
 * tiles.
 */
export class Tile {
    /** Default instance for empty, impassable tiles. */
    static readonly Empty = Tile.impassable("Empty");

    /** Default instance for passable tiles. */
    static readonly Floor = Tile.passable("Floor");
    /** Default instance for impassable tiles. */
    static readonly Wall = Tile.impassable("Wall");

    private constructor(
        readonly name: string,
        readonly passable: boolean
    ) { }

    /**
     * Creates a new passable tile for the given name.
     */
    static passable(name: string): Tile {
        return new Tile(name, true)
    }

    /**
     * Creates a new impassable tile for the given name.
     */
    static impassable(name: string): Tile {
        return new Tile(name, false)
    }
}

export class Area {
    readonly tiles: Tile[][];

    /**
     * Creates a new area with the given {@link Size} filled
     * with {@link Tile tiles} given as `initialTile`.
     */
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

    /**
     * Generates all {@link Vector points} contained by this area.
     */
    *points(): Iterable<Vector> {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                yield new Vector(x, y);
            }
        }
    }

    /**
     * Generates all {@link Tile tile}, {@link Vector point} tuples
     * contained by this area.
     */
    *cells(): Iterable<[Tile, Vector]> {
        for (let p of this.points()) {
            yield [this.get(p), p];
        }
    }

    /**
     * Performs the given action for all tiles contained by
     * this area.
     */
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

    /**
     * Returns all {@link Neighbours} of `point` for the given
     * {@link Direction Directions}.
     * 
     * @param point The point to get the nieghbours for
     * @param directions The directions to select the neighbours.
     *      Defaults to {@link Direction.all}.
     */
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

    /**
     * Set all points containing {@link Tile.Empty} to the given {@link Tile}.
     */
    fill(tile: Tile) {
        for (let point of this.points()) {
            if (this.get(point) === Tile.Empty) {
                this.set(point, tile);
            }
        }
    }
}

/**
 * Indexable type with {@link Direction.name} as keys and the neighbour
 * {@link Tile} as values.
 */
// TODO extend Dict?
export interface Neighbours {
    [direction: string]: Tile
}

/**
 * Performs flood filling on the given {@link Area} using `predicate`
 * to determine if a {@link Tile} is walkable.
 * 
 * Results in an array of *sections*, where a section is a set of
 * {@link Vector points} where any point has a path to any other point.
 * This means, that no section has a path to another section.
 * 
 * @param area The area to flood fill
 * @param predicate A function to determine if a tile is walkable
 * 
 * @returns A two-dimensional array of {@link Vector points}, representing
 *      the sections of the area.
 */
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