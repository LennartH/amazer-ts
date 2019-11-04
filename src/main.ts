import yargs from "yargs";
import { Config, amazer } from "./lib";
import { parseSize, areaToString } from "./util";
import { AreaGenerator, generator, GeneratorConfig } from "./generator/base";
import { RecursiveBacktracker } from "./generator/simple";
import { parseModifier, ModifierWithConfig } from "./modifier/base";


// TODO Add logging
const version = "0.1.0"

export interface Arguments {
    config?: string,
    size?: [number, number],
    width?: number,
    height?: number,
    generator?: AreaGenerator<GeneratorConfig>,
    modifier?: ModifierWithConfig<any>[],
    [name: string]: any
}

function parseModifiers(modifierArgs: string[]): ModifierWithConfig<any>[] {
    return modifierArgs.map(arg => parseModifier(arg));
}

// TODO Allow generator/modifier configs
const cli = yargs
    .version(version)
    .showHelpOnFail(true)
    .options({
        c: {
            alias: "config",
            type: "string",
            describe: "The configuration file",
            requiresArg: true
        },
        s: {
            alias: "size",
            type: "string",
            coerce: parseSize,
            describe: "The areas size as WIDTHxHEIGHT",
            conflicts: ["width", "height"],
            requiresArg: true
        },
        w: {
            alias: "width",
            type: "number",
            describe: "The areas width",
            implies: "h",
            conflicts: ["size"],
            requiresArg: true
        },
        h: {
            alias: "height",
            type: "number",
            describe: "The areas height",
            implies: "w",
            conflicts: ["size"],
            requiresArg: true
        },
        g: {
            alias: "generator",
            coerce: generator,
            describe: "The name of the area generator to use",
            default: RecursiveBacktracker.name.charAt(0).toUpperCase() + RecursiveBacktracker.name.slice(1),
            requiresArg: true
        },
        m: {
            alias: "modifier",
            type: "array",
            coerce: parseModifiers,
            describe: "The modifiers to apply after the generation",
            requiresArg: true
        }
    });

try {
    if (process.argv.length <= 2) {
        throw new Error("No arguments where given");
    } else {
        let args: Arguments = cli.argv;
        let config = Config.fromArgs(args);
        let area = amazer(config).generate();
        console.log(areaToString(area));
    }
} catch (e) {
    console.log(e.message + "\n");
    cli.showHelp();
    process.exit(1);
}