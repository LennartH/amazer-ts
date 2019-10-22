export interface Size {
    width: number;
    height: number;
    [name: string]: any;
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

    private static readonly _values = [
        Direction.Up, Direction.UpRight, Direction.Right, Direction.DownRight,
        Direction.Down, Direction.DownLeft, Direction.Left, Direction.UpLeft
    ]

    static forName(name: string): Direction {
        let direction = Direction.all().find(d => d.name === name);
        if (direction === undefined) {
            throw new Error(`No direction available for name ${name}`)
        }
        return direction;
    }

    static values(): ReadonlyArray<Direction> {
        return Direction._values;
    }

    static all(): ReadonlyArray<Direction> {
        return [Direction.None, ...Direction.values()]
    }
}