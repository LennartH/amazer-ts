import { Arguments } from "./main";
import fs from "fs";
import yaml from "js-yaml";
import { Area } from "./domain";

export class Config {
    static fromArgs(args: Arguments): Config {
        if (args.config) {
            // TODO Handle/Merge other args
            return Config.fromFile(args.config);
        } else {
            return new Config(
                Config.sizeFromArgs(args)
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
    
    private static sizeFromArgs(args: Arguments): [number, number] {
        if (args.size) {
            return args.size;
        } else if (args.width && args.height) {
            return [args.width, args.height];
        } else {
            throw new Error("The area size could not be determined");
        }
    }
    
    constructor(
        readonly size: [number, number]
    ) { }
}

export class Amazer {
    constructor(readonly config: Config) { }

    generate(): Area {
        return new Area(this.config.size);
    }
}

// TODO Builder Pattern for Amazer
export function amazer(config: Config): Amazer {
    return new Amazer(config);
}