import { TileSet, TileMask } from "../../src/domain/tileset";
import { Tile } from "../../src/domain/area";
import { RandomArea } from "../../src/generator/simple";

const floor = Tile.passable("Floor", " ");
const wall = Tile.impassable("Wall", "+");

test("read simple tileset", () => {
    let tileSet = TileSet.fromFile("resources/simple-tileset.yml");

    let expectedTileSet = new TileSet();
    expectedTileSet.add({tile: floor, mask: TileMask.Any});
    expectedTileSet.add({tile: wall, mask: TileMask.Any});

    expect(tileSet).toEqual(expectedTileSet);
});

test("tile set without masks", () => {
    let tileSet = new TileSet();
    tileSet.add({tile: floor, mask: TileMask.Any});
    tileSet.add({tile: wall, mask: TileMask.Any});

    let area = RandomArea({
        size: {width: 10, height: 10},
        tileSet: tileSet
    })

    let expectedMatches = [floor, wall];
    for (let p of area.points()) {
        expect(tileSet.getMatching(area.neighbours(p))).toEqual(expectedMatches);
    }
});