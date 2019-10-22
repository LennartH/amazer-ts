import { Area } from "./domain/area";

export function parseSize(size: string): [number, number] {
    let parts: string[] = size.split("x");
    return [Number(parts[0]), Number(parts[1])]
}

export function area_to_string(area: Area): string {
    let row_strings: string[] = [];
    row_strings.push("┏" + "━".repeat(area.width * 2 + 1) + "┓");
    for (let y = 0; y < area.height; y++) {
        let tile_strings: string[] = [];
        for (let x = 0; x < area.width; x++) {
            tile_strings.push(area.get(x, y).symbol);
        }
        row_strings.push("┃ " + tile_strings.join(" ") + " ┃");
    }
    row_strings.push("┗" + "━".repeat(area.width * 2 + 1) + "┛");
    return row_strings.join("\n");
}