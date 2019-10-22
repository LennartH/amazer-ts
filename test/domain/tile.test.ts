import { Tile } from "../../src/domain/area";
import _ from "lodash";

test("passable factory method", () => {
    expect(Tile.passable("Floor").passable).toBe(true);
})

test("impassable factory method", () => {
    expect(Tile.impassable("Wall").passable).toBe(false);
})

test("tile with symbol", () => {
    expect(Tile.passable("Floor", " ").symbol).toBe(" ");
});

test("tile symbol from name", () => {
    expect(Tile.passable("Floor").symbol).toBe("F");
});

test("equality", () => {
    expect(Tile.passable("Floor"))
        .toEqual(Tile.passable("Floor"));

    expect(Tile.passable("Floor", " "))
        .not.toEqual(Tile.passable("Floor"));

    expect(Tile.impassable("Floor"))
        .not.toEqual(Tile.passable("Floor"));

    expect(_.isEqual(Tile.passable("Floor"), Tile.passable("Floor"))).toBe(true);
})