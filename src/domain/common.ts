import _ from "lodash";
import { parseNumber, Dict } from "../util";

export interface Size {
    width: number;
    height: number;
}

/** Utility functions for {@link Size} */
export namespace Size {
    /** Format `size` as a string: `<width>x<height>` */
    export function stringify(size: Size): string {
        return `${size.width}x${size.height}`;
    }

    /**
     * Creates a new {@link Size} object from the given data.
     * 
     * `data` must be an object with attribute `size` or
     * `width` **and** `height`. The value for `size` can
     * be a string parseable by {@link fromString} or another
     * object with `width` and `height` attributes.
     * 
     * @throws An error, if the `data` has no size information.
     */
    export function fromObject(data: Dict<any>): Size {
        if (data.size !== undefined) {
            if (typeof data.size === "string") {
                return Size.fromString(data.size);
            } else {
                return {width: data.size.width, height: data.size.height};
            }
        } else if (data.width !== undefined && data.height !== undefined) {
            return {width: data.width, height: data.height};
        } else {
            throw new Error("No size information could be found");
        }
    }

    /**
     * Creates a new {@link Size} object from the given string.
     * 
     * The string must have the format `<width>x<height>`, where
     * width and height are valid numbers.
     * 
     * @throws An error, if `value` does not match the format
     */
    export function fromString(value: string): Size {
        let parts: string[] = value.split("x");
        if (parts.length != 2) {
            throw new Error(`The given value '${value}' does not match the required format WIDTHxHEIGHT`);
        }
        try {
            return {width: parseNumber(parts[0]), height: parseNumber(parts[1])}
        } catch (error) {
            throw new Error(`The values of the given size '${value}' can not be parsed as number`);
        }
    }
}

// TODO Unify Point and Vector
export interface Point {
    x: number;
    y: number;
}

/**
 * Extension class for {@link Point} providing additional
 * utility methods.
 */
export class Vector implements Point {
    constructor(readonly x: number, readonly y: number) { }

    /** Creates a new vector from the given {@link Point} */
    static from(point: Point): Vector {
        return new Vector(point.x, point.y);
    }

    /**
     * Creates a random vector with `0 <= x < size.width` and
     * `0 <= y < size.height` that matches the given predicate.
     * 
     * May result in an infinite loop, if `predicate` never returns
     * `true`.
     * 
     * @param size The upper bound of the resulting vector
     * @param predicate Function that checks if a random point is valid.
     */
    static random(size: Size, predicate?: (p: Vector) => boolean): Vector {
        let point: Vector;
        do {
            point = new Vector(_.random(size.width - 1), _.random(size.height - 1));
        } while (predicate !== undefined && !predicate(point))
        return point;
    }

    /**
     * Translates this vector by the given delta x and delta y
     * multiplied by `times`, creating a new vector instance.
     * 
     * If `by` doesn't have `dx`/`dy` 0 is used.
     * 
     * @param by The amount to move by 
     * @param times Factor used to multiply `by` by
     * 
     * @returns A new vector instance translated by `by * times`
     */
    translate(by: {dx?: number, dy?: number}, times=1): Vector {
        return new Vector(this.x + (by.dx || 0) * times, this.y + (by.dy || 0) * times);
    }

    /** Calculated the euclidean distance to the given {@link Point}. */
    distance(other: Point): number {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    /**
     * Checks if `x` and `y` of the given {@link Point} are strictly
     * equal to this vector.
     */
    equals(other: Point): boolean {
        return this.x === other.x && this.y === other.y;
    }
}

export class Rectangle {
    readonly topLeft: Vector;
    readonly topRight: Vector;
    readonly bottomLeft: Vector;
    readonly bottomRight: Vector;

    /**
     * @param topLeft Top left coordinates of the rectangle
     * @param size Size of the rectangle
     */
    constructor(topLeft: Point, readonly size: Size) {
        this.topLeft = new Vector(topLeft.x, topLeft.y);
        this.topRight = new Vector(topLeft.x + size.width - 1, topLeft.y);
        this.bottomLeft = new Vector(topLeft.x, topLeft.y + size.height - 1);
        this.bottomRight = new Vector(topLeft.x + size.width - 1, topLeft.y + size.height - 1);
    }

    get width(): number {
        return this.size.width;
    }

    get height(): number {
        return this.size.height;
    }

    intersect(other: Rectangle): boolean {
        return this.topLeft.x < other.bottomRight.x && this.bottomRight.x > other.topLeft.x
            && this.topLeft.y < other.bottomRight.y && this.bottomRight.y > other.topLeft.y;
    }

    /**
     * Generates all {@link Vector points} contained by this rectangle.
     */
    *points(): Iterable<Vector> {
        for (let x = this.topLeft.x; x <= this.bottomRight.x; x++) {
            for (let y = this.topLeft.y; y <= this.bottomRight.y; y++) {
                yield new Vector(x, y);
            }
        }
    }

    forEach(consumer: (p: Vector) => void) {
        for (let p of this.points()) {
            consumer(p);
        }
    }
}

/** Utility class for the possible directions */
export class Direction {
    readonly name: string
    readonly dx: number
    readonly dy: number

    private constructor(name: string, dx: number, dy: number) {
        this.name = name;
        this.dx = dx;
        this.dy = dy;
    }

    static readonly None = new Direction("None", 0, 0);

    static readonly Up = new Direction("Up", 0, -1);
    static readonly UpRight = new Direction("UpRight", 1, -1);
    static readonly Right = new Direction("Right", 1, 0);
    static readonly DownRight = new Direction("DownRight", 1, 1);
    static readonly Down = new Direction("Down", 0, 1);
    static readonly DownLeft = new Direction("DownLeft", -1, 1);
    static readonly Left = new Direction("Left", -1, 0);
    static readonly UpLeft = new Direction("UpLeft", -1, 1);

    /**
     * @returns `true`, if the direction is strictly horizontal
     */
    isHorizontal(): boolean {
        if (this === Direction.Left || this === Direction.Right) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @returns `true`, if the direction is strictly vertical
     */
    isVertical(): boolean {
        if (this === Direction.Up || this === Direction.Down) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @returns `true`, if the direction is horizontal or vertical
     */
    isStraight(): boolean {
        return this.isHorizontal() || this.isVertical();
    }

    /**
     * @returns `true`, if the direction is diagonal
     */
    isDiagonal(): boolean {
        return Direction.diagonals().includes(this);
    }

    /**
     * @returns The opposite if this direction.
     */
    opposite(): Direction {
        let index = Direction.all().indexOf(this);
        return Direction.all()[(index + 4) % 8];
    }

    private static readonly _values = [
        Direction.None,
        Direction.Up, Direction.UpRight, Direction.Right, Direction.DownRight,
        Direction.Down, Direction.DownLeft, Direction.Left, Direction.UpLeft
    ]

    private static readonly _all = [
        Direction.Up, Direction.UpRight, Direction.Right, Direction.DownRight,
        Direction.Down, Direction.DownLeft, Direction.Left, Direction.UpLeft
    ]

    private static readonly _straights = [
        Direction.Up, Direction.Right, Direction.Down, Direction.Left
    ]

    private static readonly _diagonals = [
        Direction.UpRight, Direction.DownRight, Direction.DownLeft, Direction.UpLeft
    ]

    /**
     * @returns The direction for the given name
     * 
     * @throws An error, if no direction for the name could be found
     */
    static forName(name: string): Direction {
        let direction = Direction.values().find(d => d.name === name);
        if (direction === undefined) {
            throw new Error(`No direction available for name ${name}`)
        }
        return direction;
    }

    /**
     * @returns All directions, including the `None` direction
     */
    static values(): ReadonlyArray<Direction> {
        return Direction._values;
    }

    /**
     * @returns All actual directions (without the `None` direction)
     */
    static all(): ReadonlyArray<Direction> {
        return Direction._all;
    }

    /**
     * @returns All straight directions
     */
    static straights(): ReadonlyArray<Direction> {
        return Direction._straights;
    }

    /**
     * @returns All diagonal directions
     */
    static diagonals(): ReadonlyArray<Direction> {
        return Direction._diagonals;
    }
}