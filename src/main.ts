import yargs from "yargs";
import { Config, amazer } from "./lib";
import { parseSize, areaToString } from "./util";
import { AreaGenerator, generator } from "./generator/base";
import { RecursiveBacktracker } from "./generator/simple";

const version = "0.1.0"

export interface Arguments {
    config?: string,
    size?: [number, number],
    width?: number,
    height?: number,
    generator?: AreaGenerator,
    tileSet?: string,
    modifier?: string[],
    [name: string]: any
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
        },
        g: {
            alias: "generator",
            coerce: generator,
            describe: "The name of the area generator to use",
            default: RecursiveBacktracker.name.charAt(0).toUpperCase() + RecursiveBacktracker.name.slice(1)
        },
        t: {
            alias: "tile-set",
            type: "string",
            describe: "The tile set file (JSON or Yaml)",
            requiresArg: true
        },
        m: {
            alias: "modifier",
            type: "array",
            describe: "The modifiers to apply after the generation",
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
    let area = amazer(config).generate();
    console.log(areaToString(area));
}