import yargs from "yargs";
import _ from "lodash";
import { Config, amazer } from "./lib";
import { areaToString, Dict, writeStructuredFile, capitalize } from "./util";
import { GeneratorWithConfig, parseGenerator } from "./generator/base";
import { RecursiveBacktracker } from "./generator/simple";
import { parseModifier, ModifierWithConfig } from "./modifier/base";
import { Size } from "./domain/common";
import serialize from "./serialize";


// TODO Add logging
// TODO Cleanup the config mess

const version = "0.1.0"

export interface Arguments {
    config?: string,
    size?: Size,
    width?: number,
    height?: number,
    generator?: GeneratorWithConfig<any>,
    modifier?: ModifierWithConfig<any>[],
    silent?: boolean,
    format?: serialize.WritableFormat,
    saveConfig?: string,
    [name: string]: any
}

function parseModifiers(modifierArgs: string[]): ModifierWithConfig<any>[] {
    return modifierArgs.map(arg => parseModifier(arg));
}

// TODO Option to save params as config
// TODO Option for interactive session (generate areas until exit and save them on demand)
const cli = yargs
    .version(version)
    .showHelpOnFail(true)
    .usage("Usage: $0 [-c | -s | -w -h] [OPTIONS] [<FILE>]")
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
            coerce: Size.fromString,
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
            coerce: parseGenerator,
            describe: "The area generator to use",
            default: capitalize(RecursiveBacktracker.name),
            requiresArg: true
        },
        m: {
            alias: "modifier",
            type: "array",
            coerce: parseModifiers,
            describe: "The modifiers to apply after the generation",
            requiresArg: true
        },
        silent: {
            type: "boolean",
            describe: "Don't print the generated area"
        },
        f: {
            alias: "format",
            choices: ["binary", "base64", "plain"],
            describe: "The format of the output file",
            default: "binary",
            requiresArg: true
        },
        saveConfig: {
            type: "string",
            describe: "File type or filename to store the used configuration in",
        }
    });

try {
    if (process.argv.length <= 2) {
        throw new Error("No arguments where given");
    } else {
        let args: Arguments = cli.argv;
        let config = Config.fromArgs(args);
        let area = amazer(config).generate();
        if (!args.silent) {
            console.log(areaToString(area));
        }
        const outputPath = args._[0];
        if (outputPath !== undefined) {
            serialize.toFile(area, outputPath, args.format);
        }
        const configOutputPath = getConfigOutputPath(args);
        if (configOutputPath !== undefined) {
            saveConfig(configOutputPath, config);
        }
    }
} catch (e) {
    console.log(e.message + "\n");
    cli.showHelp();
    process.exit(1);
}

function getConfigOutputPath(args: Arguments): string | undefined {
    if (args.saveConfig === undefined) {
        return undefined;
    }
    const dotIndex = args.saveConfig.indexOf(".");
    if (dotIndex <= 0 && args._.length === 0) {
        return undefined;
    }
    if (dotIndex > 0) {
        return args.saveConfig;
    }

    const saveConfig = args.saveConfig.length == 0 ? "yml" : args.saveConfig.substr(dotIndex + 1);
    if (saveConfig === "yml" || saveConfig === "yaml" || saveConfig === "json") {
        const outputPath: string = args._[0];
        const filename = outputPath.substr(0, outputPath.length - outputPath.lastIndexOf(".") + 1);
        return `${filename}.${saveConfig}`
    } else {
        return `${saveConfig}.yml`
    }
}

function saveConfig(path: string, config: Config) {
    const data: Dict<any> = {};
    data.size = Size.stringify(config.size);
    data.generator = prepareFunctionWithConfig(config.generator.generator, config.generator.config);
    const modifiers: any[] = [];
    for (let modWithConfig of config.modifiers) {
        modifiers.push(prepareFunctionWithConfig(modWithConfig.modifier, modWithConfig.config));
    }
    if (modifiers.length > 0) {
        data.modifiers = modifiers;
    }
    writeStructuredFile(path, data);
}

function prepareFunctionWithConfig(func: Function, config: Dict<any> | undefined): any {
    const capitalizedName = capitalize(func.name);
    if (config === undefined) {
        return capitalizedName;
    } else {
        return {[capitalizedName]: prepareConfig(config)};
    }
}

function prepareConfig(config: Dict<any>): Dict<any> {
    const result: Dict<any> = {};
    for (let key in config) {
        const value: any = config[key];
        if (value !== undefined) {
            let resultValue = value;
            if (value instanceof Object && _.difference(Object.keys(value), ["width", "height"]).length === 0) {
                resultValue = Size.stringify(value);
            }
            result[key] = resultValue;
        }
    }
    return result;
}