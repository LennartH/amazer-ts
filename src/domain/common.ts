import _ from "lodash";

export interface Size {
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export class Vector implements Point {
    constructor(readonly x: number, readonly y: number) { }

    static from(point: Point): Vector {
        return new Vector(point.x, point.y);
    }

    static random(size: Size): Vector {
        return new Vector(_.random(size.width - 1), _.random(size.height - 1))
    }

    translate(direction: {dx?: number, dy?: number}, times=1): Vector {
        return new Vector(this.x + (direction.dx || 0) * times, this.y + (direction.dy || 0) * times);
    }
}

export class Direction {
    private constructor(
        readonly name: string,
        readonly dx: number,
        readonly dy: number
    ) { }

    static readonly None = new Direction("None", 0, 0);

    static readonly Up = new Direction("Up", 0, -1);
    static readonly UpRight = new Direction("UpRight", 1, -1);
    static readonly Right = new Direction("Right", 1, 0);
    static readonly DownRight = new Direction("DownRight", 1, 1);
    static readonly Down = new Direction("Down", 0, 1);
    static readonly DownLeft = new Direction("DownLeft", -1, 1);
    static readonly Left = new Direction("Left", -1, 0);
    static readonly UpLeft = new Direction("UpLeft", -1, 1);

    isHorizontal(): boolean {
        if (this === Direction.Left || this === Direction.Right) {
            return true;
        } else {
            return false;
        }
    }

    isVertical(): boolean {
        if (this === Direction.Up || this === Direction.Down) {
            return true;
        } else {
            return false;
        }
    }

    isDiagonal(): boolean {
        return Direction.diagonals().includes(this);
    }

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

    static forName(name: string): Direction {
        let direction = Direction.values().find(d => d.name === name);
        if (direction === undefined) {
            throw new Error(`No direction available for name ${name}`)
        }
        return direction;
    }

    static values(): ReadonlyArray<Direction> {
        return Direction._values;
    }

    static all(): ReadonlyArray<Direction> {
        return Direction._all;
    }

    static straights(): ReadonlyArray<Direction> {
        return Direction._straights;
    }

    static diagonals(): ReadonlyArray<Direction> {
        return Direction._diagonals;
    }
}