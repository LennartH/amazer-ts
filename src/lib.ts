import { Arguments } from "./main";
import fs from "fs";
import yaml from "js-yaml";
import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { AreaGenerator } from "./generator/base";

export class Config {

    constructor(
        readonly size: Size,
        readonly generator: AreaGenerator
    ) { }

    static fromArgs(args: Arguments): Config {
        if (args.config) {
            // TODO Handle/Merge other args
            return Config.fromFile(args.config);
        } else {
            return new Config(
                Config.sizeFromArgs(args),
                args.generator!
            );
        }
    }

    static fromFile(path: string): Config {
        let [fileType] = path.split(".").slice(-1);
        let fileContent: string = fs.readFileSync(path, "utf8");
        let args: Arguments;
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