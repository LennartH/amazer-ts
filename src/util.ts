import fs from "fs";
import yaml from "js-yaml";
import { Area } from "./domain/area";

export function parseSize(size: string): [number, number] {
    let parts: string[] = size.split("x");
    return [Number(parts[0]), Number(parts[1])]
}

export function areaToString(area: Area): string {
    let row_strings: string[] = [];
    row_strings.push("┏" + "━".repeat(area.width * 2 + 1) + "┓");
    for (let y = 0; y < area.height; y++) {
        let tile_strings: string[] = [];
        for (let x = 0; x < area.width; x++) {
            tile_strings.push(area.get(x, y).symbol);
        }
        // FIXME Joining with space breaks the maze
        row_strings.push("┃ " + tile_strings.join(" ") + " ┃");
    }
    row_strings.push("┗" + "━".repeat(area.width * 2 + 1) + "┛");
    return row_strings.join("\n");
}

export function readStructuredFile(filePath: string): any {
    let [fileType] = filePath.split(".").slice(-1);
    let fileContent: string = fs.readFileSync(filePath, "utf8");
    let result: any;
    switch (fileType) {
        case "yml":
        case "yaml":
            result = yaml.safeLoad(fileContent);
            break;
        case "json":
            result = JSON.parse(fileContent);
            break;
        default:
            throw new Error(`Unable to read file type ${fileType}`);
    }
    return result;
}