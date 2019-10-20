import yargs from "yargs";
import { Config } from "./lib";

const version = "0.1.0"

export interface Arguments {
    _?: string[],
    config?: string,
    size?: [number, number],
    width?: number,
    height?: number
}

function parseSize(size: string): [number, number] {
    let parts: string[] = size.split("x");
    return [Number(parts[0]), Number(parts[1])]
}

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
        }
    });

if (process.argv.length <= 2) {
    console.log("No arguments where given")
    cli.showHelp();
    process.exit(1);
} else {
    let args: Arguments = cli.argv;
    let config = Config.fromArgs(args);
    console.log(config);
}