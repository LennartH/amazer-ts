import yargs from "yargs";

const version = "0.1.0"

// interface Arguments {
//     config: string,
//     size: [number, number],
//     width: number,
//     height: number
// }

function parseSize(size: string): [number, number] {
    let parts: string[] = size.split("x");
    return [Number(parts[0]), Number(parts[1])]
}

const cli = yargs
    .version(version)
    .options({
        c: {
            alias: "config",
            type: "string",
            describe: "The configuration file",
            requiresArg: true
        },
        s: {
            alias: "size",
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

const argv = cli.argv

console.log(argv)