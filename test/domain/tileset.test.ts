import { TileSet } from "../../src/domain/tileset";
import { Tile } from "../../src/domain/area";

const floor = Tile.passable("Floor");
const wall = Tile.impassable("Wall");

test("read simple tileset", () => {
    let tileSet = TileSet.fromFile("resources/simple-tileset.yml");

    let expectedTileSet = new TileSet();
    expectedTileSet.add(floor, wall);
    expect(tileSet).toEqual(expectedTileSet);
});