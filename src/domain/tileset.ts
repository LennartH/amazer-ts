import { Tile, Neighbours } from "./area";
import { Direction } from "./common";
import _ from "lodash";
import { readStructuredFile } from "../util";

export class SymbolMask {
    static readonly Any = new SymbolMask({});

    constructor(private readonly allowedNeighbours: {[direction: string]: Tile[] | Tile | undefined}) { }

    matchesAll(neighbours: Neighbours): boolean {
        for (let direction in neighbours) {
            if (!this.matches(Direction.forName(direction), neighbours[direction])) {
                return false;
            }
        }
        return true;
    }

    matches(direction: Direction, tile: Tile): boolean {
        let allowedNeighbours = this.allowedNeighbours[direction.name]
        if (allowedNeighbours instanceof Tile) {
            return _.isEqual(tile, allowedNeighbours);
        } else {
            return allowedNeighbours === undefined || allowedNeighbours.length == 0 || _.some(allowedNeighbours, tile)
        }
    }
}

export interface TileWithMask {
    readonly tile: Tile;
    readonly mask: SymbolMask;
}

export class TileSet {
    private readonly _tiles: Tile[];

    constructor(tiles?: Tile[]) {
        this._tiles = tiles || [];
    }

    static fromFile(filePath: string): TileSet {
        let content = readStructuredFile(filePath);
        if (!(content instanceof Array)) {
            throw new Error("Error reading the file as tile set. Must be a list of tiles with optional mask.")
        }
        
        // TODO Extract fromObject method
        let tileSet = new TileSet();
        for (let entry of content) {
            tileSet.add(new Tile(entry.name, entry.passable));
        }
        return tileSet;
    }

    get tiles(): ReadonlyArray<Tile> {
        return this._tiles;
    }

    get passables(): ReadonlyArray<Tile> {
        return this._tiles.filter(t => t.passable);
    }

    get impassables(): ReadonlyArray<Tile> {
        return this._tiles.filter(t => !t.passable);
    }

    add(...tiles: Tile[]) {
        this._tiles.push(...tiles);
    }
}