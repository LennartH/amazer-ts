import { Arguments } from "./main";
import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { AreaGenerator, GeneratorConfig } from "./generator/base";
import { readStructuredFile } from "./util";
import { AreaModifier, modifier } from "./modifier/base";

export class Config {

    constructor(
        readonly size: Size,
        readonly generator: AreaGenerator<GeneratorConfig>,
        readonly modifiers: AreaModifier<any>[]
    ) { }

    static fromArgs(args: Arguments): Config {
        if (args.config) {
            // TODO Handle/Merge other args
            return Config.fromFile(args.config);
        } else {
            let modifiers: AreaModifier<any>[] = [];
            if (args.modifier !== undefined) {
                args.modifier.forEach(name => modifiers.push(modifier(name)))
            }
            return new Config(
                Config.sizeFromArgs(args),
                args.generator!,
                modifiers
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
        let area = this.config.generator(this.config);
        for (let modifier of this.config.modifiers) {
            area = modifier(area, this.config);
        }
        return area;
    }
}

// TODO Builder Pattern for Amazer
export function amazer(config: Config): Amazer {
    return new Amazer(config);
}