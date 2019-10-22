import { Area, Tile, Neighbours } from "../../src/domain/area";

const floor = Tile.passable("Floor", " ");
const wall = Tile.impassable("Wall", "+");

test("default initial tile", () => {
    let area = new Area({width: 10, height: 10});
    for (let y = 0; y < area.height; y++) {
        for (let x = 0; x < area.width; x++) {
            expect(area.get(x, y)).toBe(Tile.Empty);
        }
    }
});

test("custom initial tile", () => {
    let area = new Area({width: 10, height: 10}, floor);
    for (let y = 0; y < area.height; y++) {
        for (let x = 0; x < area.width; x++) {
            expect(area.get(x, y)).toBe(floor);
        }
    }
});

test("changing tiles", () => {
    let area = new Area({width: 10, height: 10}, floor);
    
    area.set(0, 0, wall);
    expect(area.get(0, 0)).toBe(wall);

    area.tiles[1][1] = wall;
    expect(area.get(1, 1)).toBe(wall);
});

test("contains point", () => {
    let area = new Area({width: 10, height: 10});

    expect(area.contains(-1, 0)).toBe(false);
    expect(area.contains(0, -1)).toBe(false);
    expect(area.contains(-1, -1)).toBe(false);
    expect(area.contains(10, 0)).toBe(false);
    expect(area.contains(0, 10)).toBe(false);
    expect(area.contains(10, 10)).toBe(false);

    expect(area.contains(0, 0)).toBe(true);
    expect(area.contains(9, 9)).toBe(true);
});

test("neighbours at corner", () => {
    let area = new Area({width: 4, height: 4});
    area.set(0, 1, floor);
    area.set(1, 0, floor);

    let expectedNeighbours: Neighbours = {
        Right: floor,
        DownRight: Tile.Empty,
        Down: floor
    };
    expect(area.neighbours(0, 0)).toEqual(expectedNeighbours);
});

test("neighbours inside", () => {
    let area = new Area({width: 4, height: 4});
    area.set(0, 0, floor);
    area.set(0, 1, floor);
    area.set(0, 2, floor);
    area.set(2, 0, wall);
    area.set(2, 1, wall);
    area.set(2, 2, wall);

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
    expect(area.neighbours(1, 1)).toEqual(expectedNeighbours);
});