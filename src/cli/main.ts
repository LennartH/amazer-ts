import path from "path";
import fs from "fs";
import yargs from "yargs";
import readlineSync from "readline-sync";
import _ from "lodash";
import yaml from "js-yaml";
import { Config, amazer } from "../lib";
import { areaToString, Dict, writeStructuredFile, capitalize } from "../util";
import { GeneratorWithConfig, parseGenerator } from "../generator/base";
import { RecursiveBacktracker } from "../generator/simple";
import { parseModifier, ModifierWithConfig } from "../modifier/base";
import { Size } from "../domain/common";
import serialize from "../serialize";
import { Area } from "../domain/area";


// TODO Add logging
// TODO Cleanup the config mess
// TODO Separate library from CLI?

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
    interactive?: string,
    [name: string]: any
}

function parseModifiers(modifierArgs: string[]): ModifierWithConfig<any>[] {
    return modifierArgs.map(arg => parseModifier(arg));
}

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
        silent: {
            type: "boolean",
            describe: "Don't print the generated area"
        },
        f: {
            alias: "format",
            choices: ["binary", "base64", "plain"],
            describe: "The format of the output file, defaults to binary",
            requiresArg: true
        },
        saveConfig: {
            type: "string",
            describe: "File type or filename to store the used configuration in",
        },
        i: {
            alias: "interactive",
            type: "string",
            describe: "Start an interactive session in the given or current folder"
        }
    });


// TODO Where to place this?
const interactiveCommands = ["save", "s", "save-config", "sc", "exit", "quit", "q", "next", "n", "help", "h", "show-config", "c"];

try {
    if (process.argv.length <= 2) {
        throw new Error("No arguments where given");
    } else {
        let args: Arguments = cli.argv;
        if (args.interactive !== undefined) {
            interactive(args);
        } else {
            let config = Config.fromArgs(args);
            const area = amazer(config).generate();
            if (!args.silent) {
                console.log(areaToString(area));
            }
            const outputPath = args._[0];
            if (outputPath !== undefined) {
                serialize.toFile(area, outputPath, args.format);
            }
            const configOutputPath = getConfigOutputPath(args);
            if (configOutputPath !== undefined) {
                writeStructuredFile(configOutputPath, prepareAmazerConfig(config));
            }
        }
    }
} catch (e) {
    console.log(e.message + "\n");
    cli.showHelp();
    process.exit(1);
}

// TODO Use different yargs instance for interactive commands
// TODO Enable history usable with arrows
// TODO Add revert command
function interactive(args: Arguments) {
    const targetDirectory = args.interactive!.length <= 0 ? "." : args.interactive!;

    let exit = false;
    let generateArea = true;
    let config: Config | undefined = undefined;
    let area: Area | undefined = undefined;
    do {
        if (generateArea) {
            try {
                config = Config.fromArgs(args);
                area = amazer(config).generate();
                console.log(areaToString(area));
            } catch(error) {
                console.log(`Error: ${error.message}`);
                config = undefined;
                area = undefined;
            }
        }
        generateArea = false;

        try {
            const commands = readlineSync.prompt().split(/\s+/);
            if (interactiveCommands.includes(commands[0])) {
                switch (commands[0]) {
                    case "s":
                    case "save":
                        if (area !== undefined) {
                            const areaPath = determinePath(targetDirectory, commands[1]);
                            serialize.toFile(area, areaPath, args.format);
                        } else {
                            console.log("No area could be generated due to previous error. Saving not possible.");
                        }
                        generateArea = true;
                        break;
                    case "sc":
                    case "save-config":
                        if (config !== undefined) {
                            const configPath = determinePath(targetDirectory, commands[1], "area-config", "yml");
                            writeStructuredFile(configPath, prepareAmazerConfig(config));
                        } else {
                            console.log("No config could be created due to previous error. Saving not possible.");
                        }
                        break;
                    case "c":
                    case "show-config":
                        if (config !== undefined) {
                            const configDict = prepareAmazerConfig(config);
                            console.log(yaml.dump(configDict));
                        } else {
                            console.log("No config could be created due to previous error. Showing not possible.");
                        }
                        break
                    case "q":
                    case "quit":
                    case "exit":
                        exit = true;
                        break;
                    case "n":
                    case "next":
                        generateArea = true;
                        break;
                    case "h":
                    case "help":
                        // TODO Implement help text
                        console.log("This should be helpful")
                        break;
                    default:
                        console.log(`Error: The command ${commands[0]} has not yet been implemented`)
                        break;
                }
            } else {
                let otherArgs = cli.parse(commands);
                args = {...args, ...otherArgs};
                generateArea = true;
            }
        } catch(error) {
            console.log(`Error: ${error.message}`)
        }
    } while (!exit);
}

function determinePath(directory: string, name?: string | undefined, fallbackName="area", fallbackType="mz"): string {
    if (name) {
        if (!path.extname(name)) {
            name = `${name}.${fallbackType}`;
        }
        return path.join(directory, name);
    }
    let i = 1;
    let p: string;
    do {
        p = path.join(directory, `${fallbackName}${i}.${fallbackType}`);
        i++;
    } while (fs.existsSync(p));
    return p;
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

// TODO These methods seem out of place here
function prepareAmazerConfig(config: Config): Dict<any> {
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
    return data;
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