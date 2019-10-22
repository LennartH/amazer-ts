import { Size, Direction } from "./common";

export class Tile {
    static readonly Empty = Tile.impassable("Empty", "╳");

    private readonly _symbol?: string;

    constructor(
        readonly name: string,
        readonly passable: boolean,
        symbol?: string
    ) {
        this._symbol = symbol;
    }

    static passable(name: string, symbol?: string): Tile {
        return new Tile(name, true, symbol)
    }

    static impassable(name: string, symbol?: string): Tile {
        return new Tile(name, false, symbol)
    }

    get symbol(): string {
        return this._symbol || this.name.charAt(0);
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
    
    get(x: number, y: number): Tile {
        return this.tiles[x][y];
    }

    set(x: number, y: number, tile: Tile) {
        this.tiles[x][y] = tile;
    }

    contains(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    neighbours(x: number, y: number): Neighbours {
        let neighbours: Neighbours = {};
        for (let direction of Direction.values()) {
            let newX = x + direction.dx;
            let newY = y + direction.dy;
            if (this.contains(newX, newY)) {
                neighbours[direction.name] = this.get(newX, newY);
            }
        }
        return neighbours;
    }
}

export interface Neighbours {
    [direction: string]: Tile
}