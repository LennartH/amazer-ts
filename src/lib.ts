import { Arguments } from "./main";
import fs from "fs";
import yaml from "js-yaml";
import { Size, Area } from "./domain";
import { AreaGenerator, RecursiveBacktracker } from "./generator";

export class Config {
    static fromArgs(args: Arguments): Config {
        if (args.config) {
            // TODO Handle/Merge other args
            return Config.fromFile(args.config);
        } else {
            return new Config(
                Config.sizeFromArgs(args),
                args.generator || RecursiveBacktracker  // TODO How to resolve AreaGenerator | undefined here?
            );
        }
    }

    static fromFile(path: string): Config {
        let [fileType] = path.split(".").slice(-1);
        let fileContent: string = fs.readFileSync(path, "utf8");
        let args: Arguments = {};
        switch (fileType) {
            case "yml":
            case "yaml":
                args = yaml.safeLoad(fileContent) as Arguments;
                break;
            case "json":
                args = JSON.parse(fileContent);
                break;
            default:
                throw new Error(`Unknown file type ${fileType}`);
        }
        args.config = undefined;
        return Config.fromArgs(args);
    }
    
    private static sizeFromArgs(args: Arguments): Size {
        if (args.size) {
            return {width: args.size[0], height: args.size[1]};
        } else if (args.width && args.height) {
            return {width: args.width, height: args.height};
        } else {
            throw new Error("The area size could not be determined");
        }
    }
    
    constructor(
        readonly size: Size,
        readonly generator: AreaGenerator
    ) { }
}

export class Amazer {
    constructor(readonly config: Config) { }

    generate(): Area {
        return this.config.generator(this.config.size);
    }
}

// TODO Builder Pattern for Amazer
export function amazer(config: Config): Amazer {
    return new Amazer(config);
}