import { Area, Tile, Neighbours } from "../../src/domain/area";
import { Vector } from "../../src/domain/common";

const floor = Tile.passable("Floor");
const wall = Tile.impassable("Wall");

test("default initial tile", () => {
    let area = new Area({width: 10, height: 10});
    area.forEach(t => expect(t).toBe(Tile.Empty));
});

test("custom initial tile", () => {
    let area = new Area({width: 10, height: 10}, floor);
    area.forEach(t => expect(t).toBe(floor));
});

test("changing tiles", () => {
    let area = new Area({width: 10, height: 10}, floor);
    
    area.set({x: 0, y: 0}, wall);
    expect(area.get({x: 0, y: 0})).toBe(wall);

    area.tiles[1][1] = wall;
    expect(area.get({x: 1, y: 1})).toBe(wall);
});

test("contains point", () => {
    let area = new Area({width: 10, height: 10});

    expect(area.contains({x: -1, y: 0})).toBe(false);
    expect(area.contains({x: 0, y: -1})).toBe(false);
    expect(area.contains({x: -1, y: -1})).toBe(false);
    expect(area.contains({x: 10, y: 0})).toBe(false);
    expect(area.contains({x: 0, y: 10})).toBe(false);
    expect(area.contains({x: 10, y: 10})).toBe(false);

    expect(area.contains({x: 0, y: 0})).toBe(true);
    expect(area.contains({x: 9, y: 9})).toBe(true);
});

test("neighbours at corner", () => {
    let area = new Area({width: 4, height: 4});
    area.set({x: 0, y: 1}, floor);
    area.set({x: 1, y: 0}, floor);

    let expectedNeighbours: Neighbours = {
        Right: floor,
        DownRight: Tile.Empty,
        Down: floor
    };
    expect(area.neighbours(new Vector(0, 0))).toEqual(expectedNeighbours);
});

test("neighbours inside", () => {
    let area = new Area({width: 4, height: 4});
    area.set({x: 0, y: 0}, floor);
    area.set({x: 0, y: 1}, floor);
    area.set({x: 0, y: 2}, floor);
    area.set({x: 2, y: 0}, wall);
    area.set({x: 2, y: 1}, wall);
    area.set({x: 2, y: 2}, wall);

    let expectedNeighbours: Neighbours = {
        Up: Tile.Empty,
        UpRight: wall,
        Right: wall,
        DownRight: wall,
        Down: Tile.Empty,
        DownLeft: floor,
        Left: floor,
        UpLeft: floor
    };
    expect(area.neighbours(new Vector(1, 1))).toEqual(expectedNeighbours);
});