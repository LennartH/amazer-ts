import _ from "lodash";
import serialize from "../src/serialize";
import { Area, Tile } from "../src/domain/area";
import { RandomArea } from "../src/generator/simple";

test("small area to base64", () => {
    const area = new Area({width: 2, height: 2}, Tile.Wall);
    area.set({x: 0, y: 0}, Tile.Floor);
    area.set({x: 0, y: 1}, Tile.Floor);

    expect(serialize.toBase64(area)).toBe("AAIAAqA=");
});

test("area with odd size to base64", () => {
    const area = new Area({width: 3, height: 3}, Tile.Floor);
    area.set({x: 2, y: 0}, Tile.Wall);
    area.set({x: 0, y: 1}, Tile.Wall);
    area.set({x: 0, y: 2}, Tile.Wall);

    expect(serialize.toBase64(area)).toBe("AAMAA82A");
});

test("large area to base64", () => {
    const area = new Area({width: 300, height: 300}, Tile.Floor);
    expect(serialize.toBase64(area).substring(0, 7)).toBe("ASwBLP/");
});

test("base64 to small area", () => {
    const area = serialize.fromBase64("AAIAAqA=");

    const expectedArea = new Area({width: 2, height: 2}, Tile.Wall);
    expectedArea.set({x: 0, y: 0}, Tile.Floor);
    expectedArea.set({x: 0, y: 1}, Tile.Floor);
    expect(area).toEqual(expectedArea);
});

test("base64 to area with odd size", () => {
    const area = serialize.fromBase64("AAMAA82A");

    const expectedArea = new Area({width: 3, height: 3}, Tile.Floor);
    expectedArea.set({x: 2, y: 0}, Tile.Wall);
    expectedArea.set({x: 0, y: 1}, Tile.Wall);
    expectedArea.set({x: 0, y: 2}, Tile.Wall);
    expect(area).toEqual(expectedArea);
});

test("serialization and deserialization of random area", () => {
    const area = RandomArea({size: {width: 50, height: 50}});
    const base64 = serialize.toBase64(area);
    const deserializedArea = serialize.fromBase64(base64);
    expect(deserializedArea).toEqual(area);
});