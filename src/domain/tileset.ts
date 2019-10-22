import { Tile, Neighbours } from "./area";
import { Direction } from "./common";
import _ from "lodash";

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
            return allowedNeighbours === undefined ||
                   allowedNeighbours.length == 0 ||
                   _.some(allowedNeighbours, tile)
        }
    }
}

export interface TileWithMask {
    readonly tile: Tile;
    readonly mask: TileMask;
}

export class TileSet {
    private readonly tiles: TileWithMask[];

    constructor(tiles?: TileWithMask[]) {
        this.tiles = tiles || [];
    }

    add(tile: TileWithMask) {
        this.tiles.push(tile);
    }

    remove(tile: Tile) {
        this.tiles.forEach((t, i) => {
            if (_.isEqual(t.tile, tile)) {
                this.tiles.splice(i, 1)
            }
        });
    }

    getMatching(neighbours: Neighbours): Tile[] {
        return this.tiles.filter(t => t.mask.matchesAll(neighbours)).map(t => t.tile);
    }

    // TODO Read TileSet from object/file
}