import path from "path";
import fs from "fs";
import yargs from "yargs";
import readlineSync from "readline-sync";
import _ from "lodash";
import yaml from "js-yaml";
import amazer, { Config } from "../amazer";
import { areaToString, Dict, capitalize } from "../util";
import { Size } from "../domain/common";
import { Area } from "../domain/area";
import { areaToFile, writeStructuredFile, areaFromFile } from "./files";
import { cliOptions, displayOptions, interactiveOptions, CliArgs, DisplayArgs, InteractiveArgs } from "./options";


// TODO Add logging
// TODO Cleanup the config mess

const version = "0.1.0"

const cli = yargs
    .version(version)
    .showHelpOnFail(true)
    .command(["generate [file]", "$0"], "Generate areas", cliOptions, main)
    .usage("Usage: $0 [-c FILE|-s WIDTHxHEIGHT] [OPTIONS] [FILE]")
    .command("interactive [directory]", "Start an interactive session", interactiveOptions, interactive)
    .usage("       $0 interactive [OPTIONS] [DIRECTORY]")
    .command("display <file>", "Read file and print area to console", displayOptions, (argv) => display(argv as any as DisplayArgs))
    .usage("       $0 display [OPTIONS] <FILE>");

// TODO Add commands
const interactiveCommands = yargs
    .version(version)
    .showHelpOnFail(false)
    .options(interactiveOptions);

// This executes the parsing of process.argv
cli.argv;


function main(argv: CliArgs) {
    let config = Config.fromObject(argv);
    const area = amazer(config).generate();
    if (!argv.silent) {
        console.log(areaToString(area));
    }
    if (argv.file !== undefined) {
        areaToFile(area, argv.file, argv.format);
    }
    const configOutputPath = getConfigOutputPath(argv);
    if (configOutputPath !== undefined) {
        writeStructuredFile(configOutputPath, prepareAmazerConfig(config));
    }
}


function display(argv: DisplayArgs) {
    const area: Area = areaFromFile(argv.file, argv.format);
    console.log(areaToString(area));
}


// TODO Enable history usable with arrows
// TODO Add revert command
function interactive(argv: InteractiveArgs) {
    // TODO Transform to commands of interactiveYargs
    const interactiveCmds = ["save", "s", "save-config", "sc", "exit", "quit", "q", "next", "n", "help", "h", "show-config", "c"];
    const targetDirectory = argv.directory === undefined || argv.directory.length <= 0 ? "." : argv.directory;

    let exit = false;
    let generateArea = true;
    let args: InteractiveArgs = argv;
    let config: Config | undefined = undefined;
    let area: Area | undefined = undefined;
    do {
        if (generateArea) {
            try {
                config = Config.fromObject(args);
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
            if (interactiveCmds.includes(commands[0])) {
                switch (commands[0]) {
                    case "s":
                    case "save":
                        if (area !== undefined) {
                            const areaPath = determinePath(targetDirectory, commands[1]);
                            areaToFile(area, areaPath, argv.format);
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
                let otherArgs = interactiveCommands.parse(commands);
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

function getConfigOutputPath(args: CliArgs): string | undefined {
    if (args.saveConfig === undefined) {
        return undefined;
    }
    const dotIndex = args.saveConfig.indexOf(".");
    if (dotIndex <= 0 && args.file === undefined) {
        return undefined;
    }
    if (dotIndex > 0) {
        return args.saveConfig;
    }

    const saveConfig = args.saveConfig.length == 0 ? "yml" : args.saveConfig.substr(dotIndex + 1);
    if (saveConfig === "yml" || saveConfig === "yaml" || saveConfig === "json") {
        const outputPath: string = args.file!;
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