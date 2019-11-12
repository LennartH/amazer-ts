import { Options } from "yargs";
import { Dict, capitalize } from "../util";
import { Size } from "../domain/common";
import { parseGenerator } from "../generator/base";
import { RecursiveBacktracker } from "../generator/simple";
import { parseModifier, ModifierWithConfig } from "../modifier/base";


const sizeOption: Dict<Options> = {
    s: {
        alias: "size",
        type: "string",
        coerce: Size.fromString,
        describe: "The areas size as WIDTHxHEIGHT",
        requiresArg: true
    },
}

const formatOption: Dict<Options> = {
    f: {
        alias: "format",
        choices: ["binary", "base64", "plain"],
        describe: "The format of the output file, defaults to binary",
        requiresArg: true
    }
}

function sharedOptions(): Dict<Options> {
    const sizeOptionName: string = Object.keys(sizeOption)[0];
    const sizeOptions: Options = sizeOption[sizeOptionName];
    return {
        c: {
            alias: "config",
            type: "string",
            describe: "The configuration file",
            requiresArg: true
        },
        [sizeOptionName]: {...sizeOptions},
        g: {
            alias: "generator",
            type: "string",
            coerce: parseGenerator,
            describe: `The area generator to use, defaults to ${capitalize(RecursiveBacktracker.name)}`,
            requiresArg: true
        },
        m: {
            alias: "modifier",
            type: "array",
            coerce: parseModifiers,
            describe: "The modifiers to apply after the generation",
            requiresArg: true
        },
        ...formatOption
    }
}

function parseModifiers(modifierArgs: string[]): ModifierWithConfig<any>[] {
    return modifierArgs.map(arg => parseModifier(arg));
}


export const cliOptions: Dict<Options> = {
    ...sharedOptions(),
    silent: {
        type: "boolean",
        describe: "Don't print the generated area"
    },
    saveConfig: {
        type: "string",
        describe: "File type or filename to store the used configuration in",
    }
}
cliOptions.s.demandOption = true;

export const interactiveOptions: Dict<Options> = {
    ...sharedOptions(),
}

export const displayOptions: Dict<Options> = {
    ...formatOption
}