import { Size } from "./common";

export class Tile {
    static readonly Empty = Tile.impassable("Empty", " ");

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
    
    get(x: number, y: number): Tile {
        return this.tiles[x][y];
    }

    set(x: number, y: number, tile: Tile) {
        this.tiles[x][y] = tile;
    }
}