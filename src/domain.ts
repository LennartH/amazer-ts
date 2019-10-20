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
        return this._symbol || this.name[0];
    }
}

export class Area {
    readonly tiles: Tile[][];

    constructor(size: [number, number]) {
        this.tiles = [];
        for (let x = 0; x < size[0]; x++) {
            this.tiles[x] = []
            for (let y = 0; y < size[1]; y++) {
                this.tiles[x][y] = Tile.Empty;
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