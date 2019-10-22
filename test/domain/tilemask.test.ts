import { Tile } from "../../src/domain/area";
import { TileMask } from "../../src/domain/tileset";
import { Direction } from "../../src/domain/common";

const floor = Tile.passable("Floor");
const floorClone = Tile.passable("Floor");
const wall = Tile.impassable("Wall");
const wallClone = Tile.impassable("Wall");
const lava = Tile.impassable("Lava");

const allowedNeighbours = {
    Up: floor,
    Right: [wall, floor],
    Down: []
}

test("matches single tile", () => {
    let mask = new TileMask(allowedNeighbours);

    expect(mask.matches(Direction.Up, wall)).toBe(false);
    expect(mask.matches(Direction.Up, floor)).toBe(true);
    expect(mask.matches(Direction.Up, floorClone)).toBe(true);
});

test("matches multiple tiles", () => {
    let mask = new TileMask(allowedNeighbours);

    expect(mask.matches(Direction.Right, wall)).toBe(true);
    expect(mask.matches(Direction.Right, wallClone)).toBe(true);
    expect(mask.matches(Direction.Right, floor)).toBe(true);
    expect(mask.matches(Direction.Right, lava)).toBe(false);
});

test("matches empty list", () => {
    let mask = new TileMask(allowedNeighbours);

    expect(mask.matches(Direction.Down, lava)).toBe(true);
    expect(mask.matches(Direction.Down, wall)).toBe(true);
    expect(mask.matches(Direction.Down, floor)).toBe(true);
    expect(mask.matches(Direction.Down, Tile.Empty)).toBe(true);
});

test("matches unset direction", () => {
    let mask = new TileMask(allowedNeighbours);

    expect(mask.matches(Direction.UpLeft, lava)).toBe(true);
    expect(mask.matches(Direction.UpLeft, wall)).toBe(true);
    expect(mask.matches(Direction.UpLeft, floor)).toBe(true);
    expect(mask.matches(Direction.UpLeft, Tile.Empty)).toBe(true);
});