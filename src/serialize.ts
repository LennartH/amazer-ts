import fs from "fs";
import { Area, Tile } from "./domain/area";
import { areaToString, writeFile } from "./util";

export namespace serialize {
    export type ReadableFormat = "binary" | "base64";
    export type WritableFormat = ReadableFormat | "plain";

    export function toFile(area: Area, path: string, format: WritableFormat | undefined = "binary") {
        if (format === undefined) {
            format = "binary";
        }
        let data: any;
        let fileFormat = "utf8";
        if (format === "binary") {
            data = toBytes(area);
            fileFormat = "binary";
        } else if (format === "base64") {
            data = toBase64(area);
        } else if (format === "plain") {
            data = areaToString(area);
        } else {
            throw new Error(`Unsupported format ${format}`)
        }
        writeFile(path, data, fileFormat);
    }

    export function toBase64(area: Area): string {
        return Buffer.from(toBytes(area)).toString("base64");
    }

    export function toBytes(area: Area): Uint8Array {
        return areaToBytes(area);
    }

    export function fromFile(path: string, format: ReadableFormat | undefined = "binary"): Area {
        const encoding: "utf8" | undefined = format === "base64" ? "utf8" : undefined;
        const data: string | Uint8Array = fs.readFileSync(path, encoding);
        if (format === "base64") {
            return fromBase64(data as string);
        } else if (format === "binary") {
            return fromBytes(data as Uint8Array);
        } else {
            throw new Error(`Unsupported format ${format}`)
        }
    }

    export function fromBase64(data: string): Area {
        return fromBytes(Buffer.from(data, "base64"));
    }

    export function fromBytes(bytes: Uint8Array): Area {
        return bytesToArea(bytes);
    }
}

function areaToBytes(area: Area): Uint8Array {
    const bytes = new Uint8Array(4 + Math.ceil((area.width * area.height) / 8));
    bytes.set(int16ToBytes(area.width), 0);
    bytes.set(int16ToBytes(area.height), 2);

    let index = 4;
    let bits = 0;
    let byte = 0;
    for (let y = 0; y < area.height; y++) {
        for (let x = 0; x < area.width; x++) {
            const tile = area.get({x: x, y: y});
            if (bits === 8) {
                bytes[index] = byte;
                index++;
                bits = 0;
                byte = 0;
            }
            byte = (byte << 1) + (tile.passable ? 1 : 0);
            bits++;
        }
    }
    byte = byte << (8 - bits);
    bytes[index] = byte;

    return bytes;
}

function bytesToArea(bytes: Uint8Array): Area {
    const area = new Area({
        width: bytesToNumber(bytes.subarray(0, 2)),
        height: bytesToNumber(bytes.subarray(2, 4))
    });
    
    const tileBytes = bytes.subarray(4);
    let tileIndex = 0;
    for (let i = 0; i < tileBytes.length && tileIndex < area.width * area.height; i++) {
        const byte = tileBytes[i];
        for (let b = 7; b >= 0 && tileIndex < area.width * area.height; b--) {
            const bit = (byte >> b) & 1;
            const tile = bit === 1 ? Tile.Floor : Tile.Wall;
            const tilePoint = {
                x: tileIndex % area.width,
                y: Math.floor(tileIndex / area.width)
            };
            area.set(tilePoint, tile);
            tileIndex++;
        }
    }

    return area;
}

function int16ToBytes(value: number): Uint8Array {
    const bytes = new Uint8Array([
        (value >> 8) & 255,
        value & 255
    ]);
    return bytes;
}

function bytesToNumber(bytes: Uint8Array): number {
    let value = bytes[0];
    for (let i = 1; i < bytes.length; i++) {
        value = value << 8;
        value += bytes[i];
    }
    return value;
}

export default serialize;