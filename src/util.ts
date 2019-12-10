import { Area, Tile } from "./domain/area";


/**
 * Utility interface for fields of {@link GeneratorConfig} or {@link ModifierConfig}.
 */
export interface Field {
    name: string,
    parser: Parser<any>
}

/**
 * Utility interface specifying a function that parses a given string to a value.
 */
export interface Parser<T> {
    (value: string): T
}

/**
 * Utility interface for better control of an objects content.
 */
export interface Dict<T> {
    [name: string]: T
}

/**
 * Create an object from the given data for the given {@link Field fields}.
 * 
 * The data can be a string where the fields are separated by `,`: `"value1, value2, field1=value3, field2=value4"`
 * The values are mapped to the fields by position or by name, if provided.
 * 
 * The data can also be a {@link Dict Dict<string>}, where the keys are the field names and the values are the field
 * values to be parsed.
 * 
 * @param data The data to parse the object from
 * @param fields The fields to retrieve and parse the data entries
 * 
 * @throws An error, if data is a string and positional arguments are used after keyword arguments.
 * @throws An error, if data is a string and an unknown field name is given.
 * @throws An error, if a field value can not be parsed.
 */
// TODO Write tests
export function configFrom<C>(data: string | Dict<string>, fields: Field[]): C {
    if (typeof data === "string") {
        return configFromArgs(data, fields);
    } else {
        return configFromObject(data, fields);
    }
}

/**
 * Create an object from the given string for the given {@link Field fields}.
 * 
 * Must be of the form `"value1, value2, field1=value3, field2=value4"`. The field separator, value separator and
 * ignore symbol can be provided. The values are mapped to the fields by position or by name, if provided.
 * 
 * @param args The string to parse the object from
 * @param fields The fields to retrieve and parse the values
 * @param fieldsSeparator The symbol to split fields by
 * @param valueSeparator The symbol to split field names and values by
 * @param ignoreField The symbol to ignore positional arguments
 * 
 * @throws An error, if positional arguments are used after keyword arguments.
 * @throws An error, if an unknown field name is given.
 * @throws An error, if a field value can not be parsed.
 */
export function configFromArgs<C>(args: string, fields: Field[], fieldsSeparator=",", valueSeparator="=", ignoreField="_"): C {
    const fieldsByName: Dict<Field> = {};
    fields.forEach(f => fieldsByName[f.name] = f);
    
    const configData: Dict<string> = {};
    const fieldArgs = args.split(fieldsSeparator);
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
            const fieldArgSplit = fieldArg.split(valueSeparator);
            const fieldName = fieldArgSplit[0];
            if (!(fieldName in fieldsByName)) {
                throw new Error(`Unknown field '${fieldName}'`)
            }
            field = fieldsByName[fieldName];
            value = fieldArgSplit[1];
            inKwargs = true;
        } else {
            field = fields[i];
            value = fieldArg;
        }

        if (value !== ignoreField) {
            configData[field.name] = value;
        }
    }

    return configFromObject(configData, fields);
}

/**
 * Create an object from the given data for the given {@link Field fields}.
 * 
 * The datas keys are the field names and the values are the field values to be parsed.
 * 
 * @param data The data to parse the object from
 * @param fields The fields to retrieve and parse the data entries
 * 
 * @throws An error, if a field value can not be parsed.
 */
export function configFromObject<C>(data: Dict<string>, fields: Field[]): C {
    const fieldsByName: Dict<Field> = {};
    fields.forEach(f => fieldsByName[f.name] = f);

    const config: any = {};
    for (let fieldName in data) {
        const value = data[fieldName];
        const field = fieldsByName[fieldName];
        try {
            config[field.name] = field.parser(value);
        } catch (error) {
            throw new Error(`Error parsing field ${field.name}: ${error.message}`);
        }
    }
    return config;
}

/**
 * Parse the given string as number and throw an error if the result is `NaN`.
 * 
 * @throws An error, if the number can not be parsed.
 */
export function parseNumber(number: string): number {
    const value = Number(number);
    if (isNaN(value)) {
        throw new Error(`The given value '${number}' is not a number`);
    }
    return value;
}

export function capitalize(s: string): string {
    return s[0].toUpperCase() + s.substring(1);
}

export function decapitalize(s: string): string {
    return s[0].toLowerCase() + s.substring(1);
}

/**
 * Utility method to create the string representation of an {@link Area}.
 */
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

function _symbolFor(tile: Tile): string {
    if (tile === Tile.Empty) {
        return "╳";
    } else if (tile.passable) {
        return " ";
    } else {
        return "#";
    }
}