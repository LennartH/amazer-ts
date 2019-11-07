import { Area } from "./domain/area";

export namespace serialize {
    export function dumps(area: Area): string {
        const areaBytes = areaToBytes(area);
        return bytesToBase64(areaBytes);
    }
}

function bytesToBase64(bytes: number[]): string {
    let raw = "";
    for (let i = 0; i < bytes.length; i += 2) {
        const msb = bytes[i];
        const lsb = bytes[i + 1];
        raw += String.fromCharCode((msb << 8) + lsb);
    }
    if (bytes.length % 2 === 1) {
        raw += String.fromCharCode(bytes[bytes.length - 1]);
    }
    return Buffer.from(raw, "binary").toString("base64");
}

function areaToBytes(area: Area): number[] {
    const bytes: number[] = [];
    bytes.push(...int16ToBytes(area.width));
    bytes.push(...int16ToBytes(area.height));

    let i = 0;
    let byte = 0;
    for (let x = 0; x < area.width; x++) {
        for (let y = 0; y < area.height; y++) {
            const tile = area.get({x: x, y: y});
            if (i === 8) {
                bytes.push(byte);
                i = 0;
                byte = 0;
            }
            byte = (byte << 1) + (tile.passable ? 1 : 0);
            i++;
        }
    }
    byte = byte << (8 - i);
    bytes.push(byte);

    return bytes;
}

function int16ToBytes(value: number): number[] {
    const bytes: number[] = [
        (value >> 8) & 255,
        value & 255
    ];
    return bytes;
}

// function bytesToNumber(bytes: number[]): number {
//     let value = bytes[0];
//     for (let i = 1; i < bytes.length; i++) {
//         value = value << 8;
//         value += bytes[i];
//     }
//     return value;
// }

export default serialize;