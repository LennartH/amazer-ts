import { Arguments } from "./main";
import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { GeneratorWithConfig, GeneratorConfig } from "./generator/base";
import { readStructuredFile } from "./util";
import { ModifierWithConfig } from "./modifier/base";

export class Config {

    constructor(
        readonly size: Size,
        readonly generator: GeneratorWithConfig<any>,
        readonly modifiers: ModifierWithConfig<any>[]
    ) { }

    static fromArgs(args: Arguments): Config {
        if (args.config) {
            // TODO Handle/Merge other args
            return Config.fromFile(args.config);
        } else {
            let modifiers: ModifierWithConfig<any>[] = [];
            if (args.modifier !== undefined) {
                modifiers.push(...args.modifier);
            }
            return new Config(
                Config.sizeFromArgs(args),
                args.generator!,
                modifiers
            );
        }
    }

    static fromFile(path: string): Config {
        // TODO Allow generator/modifier configs
        let args: Arguments = readStructuredFile(path);
        args.config = undefined;
        return Config.fromArgs(args);
    }
    
    private static sizeFromArgs(args: Arguments): Size {
        if (args.size !== undefined) {
            return args.size;
        } else if (args.width !== undefined && args.height !== undefined) {
            return {width: args.width, height: args.height};
        } else {
            throw new Error("The area size could not be determined");
        }
    }
}

export class Amazer {
    constructor(readonly config: Config) { }

    generate(): Area {
        const generatorConfig: GeneratorConfig = {size: this.config.size, ...this.config.generator.config};
        let area = this.config.generator.generator(generatorConfig);
        for (let m of this.config.modifiers) {
            area = m.modifier(area, {...m.config});
        }
        return area;
    }
}

// TODO Builder Pattern for Amazer
export function amazer(config: Config): Amazer {
    return new Amazer(config);
}