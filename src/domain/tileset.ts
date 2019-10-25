import { Tile, Neighbours } from "./area";
import { Direction } from "./common";
import _ from "lodash";
import { readStructuredFile } from "../util";

export class TileMask {
    static readonly Any = new TileMask({});

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
    readonly mask: TileMask;
}

export class TileSet {
    private readonly _tiles: TileWithMask[];

    constructor(tiles?: TileWithMask[]) {
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
            let tileWithMask: TileWithMask = {
                tile: new Tile(entry.name, entry.passable, entry.symbol),
                mask: TileMask.Any  // TODO Read from file (all tiles must be known to parse mask string)
            }
            tileSet.add(tileWithMask);
        }
        return tileSet;
    }

    get tiles(): ReadonlyArray<Tile> {
        return this._tiles.map(t => t.tile);
    }

    add(tile: TileWithMask) {
        this._tiles.push(tile);
    }

    getMatching(neighbours: Neighbours, predicate?: (t: Tile) => boolean): Tile[] {
        // TODO Throw error if no tile matches
        if (predicate === undefined) {
            predicate = _ => true;
        }
        return this._tiles.filter(t => t.mask.matchesAll(neighbours)).map(t => t.tile).filter(predicate);
    }
}