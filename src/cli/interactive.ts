import yargs from "yargs";
import readlineSync from "readline-sync";
import yaml from "js-yaml";
import path from "path";
import fs from "fs";
import { version } from "./main";
import { interactiveOptions, InteractiveArgs } from "./options";
import amazer, { Config } from "../amazer";
import { Area } from "../domain/area";
import { areaToString } from "../util";
import { areaToFile, writeStructuredFile } from "./files";
import { prepareAmazerConfig } from "./util";


// TODO Add commands
const interactiveCommands = yargs
    .version(version)
    .showHelpOnFail(false)
    .options(interactiveOptions);

    // TODO Enable history usable with arrows
    // TODO Add revert command
export function interactiveLoop(argv: InteractiveArgs) {
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