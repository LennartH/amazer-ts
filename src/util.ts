import fs from "fs";
import yaml from "js-yaml";
import { Area, Tile } from "./domain/area";


export interface Field {
    name: string,
    parser: Parser<any>
}

export interface Parser<T> {
    (value: string): T
}

// TODO Split into function that takes a single string and one that takes an object
export function parseConfig<C>(arg: string, fields: Field[], fieldsSeparator=",", valueSeparator="=", ignoreField="_"): C {
    const config: any = {};
    const fieldArgs = arg.split(fieldsSeparator);
    const fieldsByName: any = {};
    fields.forEach(f => fieldsByName[f.name] = f);

    let inKwargs = false;
    for (let i = 0; i < fieldArgs.length; i++) {
        const fieldArg = fieldArgs[i];
        const isKwarg = fieldArg.includes(valueSeparator);
        if (!isKwarg && inKwargs) {
            throw new Error("Using positional arguments as after keyword arguments is forbidden")
        }

        let field: Field;
        let value: string;
        if (isKwarg) {
            // FIXME handle unknown field names
            const fieldArgSplit = fieldArg.split(valueSeparator);
            field = fieldsByName[fieldArgSplit[0]];
            value = fieldArgSplit[1];
            inKwargs = true;
        } else {
            field = fields[i];
            value = fieldArg;
        }

        if (value !== ignoreField) {
            try {
                config[field.name] = field.parser(value);
            } catch (error) {
                throw new Error(`Error parsing field ${field.name}: ${error.message}`);
            }
        }
    }

    return config;
}

// TODO Fail if not a number or more than 2 parts
export function parseSize(size: string): [number, number] {
    let parts: string[] = size.split("x");
    if (parts.length != 2) {
        throw new Error(`The given value '${size}' does not match the required format WIDTHxHEIGHT`);
    }
    try {
        return [Number(parts[0]), Number(parts[1])]
    } catch (error) {
        throw new Error(`The values of the given size '${size}' can not be parsed as number`);
    }
}

export function parseNumber(number: string): number {
    const value = Number(number);
    if (isNaN(value)) {
        throw new Error(`The given value '${number}' is not a number`);
    }
    return value;
}

export function areaToString(area: Area): string {
    let row_strings: string[] = [];
    row_strings.push("┏" + "━".repeat(area.width * 2 + 1) + "┓");
    for (let y = 0; y < area.height; y++) {
        let tile_strings: string[] = [];
        for (let x = 0; x < area.width; x++) {
            const p = { x: x, y: y };
            tile_strings.push(_symbolFor(area.get(p)));
        }
        row_strings.push("┃ " + tile_strings.join(" ") + " ┃");
    }
    row_strings.push("┗" + "━".repeat(area.width * 2 + 1) + "┛");
    return row_strings.join("\n");
}

// TODO Use tile set instead of hard coded symbols
function _symbolFor(tile: Tile): string {
    if (tile === Tile.Empty) {
        return "╳";
    } else if (tile.passable) {
        return " ";
    } else {
        return "#";
    }
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