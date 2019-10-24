import { Arguments } from "./main";
import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { AreaGenerator } from "./generator/base";
import { TileSet } from "./domain/tileset";
import { readStructuredFile } from "./util";

export class Config {

    constructor(
        readonly size: Size,
        readonly generator: AreaGenerator,
        readonly tileSet: TileSet
    ) { }

    static fromArgs(args: Arguments): Config {
        if (args.config) {
            // TODO Handle/Merge other args
            return Config.fromFile(args.config);
        } else {
            let tileSetFile = args.tileSet || "resources/simple-tileset.yml"
            return new Config(
                Config.sizeFromArgs(args),
                args.generator!,
                TileSet.fromFile(tileSetFile)
            );
        }
    }

    static fromFile(path: string): Config {
        let args: Arguments = readStructuredFile(path);
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
        return this.config.generator(this.config);
    }
}

// TODO Builder Pattern for Amazer
export function amazer(config: Config): Amazer {
    return new Amazer(config);
}