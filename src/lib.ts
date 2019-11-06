import { Arguments } from "./main";
import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { GeneratorWithConfig, GeneratorConfig, parseGenerator } from "./generator/base";
import { readStructuredFile, parseSize } from "./util";
import { ModifierWithConfig, parseModifier } from "./modifier/base";

export class Config {

    constructor(
        readonly size: Size,
        readonly generator: GeneratorWithConfig<any>,
        readonly modifiers: ModifierWithConfig<any>[]
    ) { }

    static fromArgs(args: Arguments): Config {
        if (args.config !== undefined) {
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
        const fileContent = readStructuredFile(path);
        const args: Arguments = {};
        args.size = this.sizeFromArgs(fileContent);
        if (fileContent.generator !== undefined) {
            args.generator = parseGenerator(fileContent.generator);
        }
        if (fileContent.modifiers !== undefined) {
            args.modifier = [];
            for (let modifier of fileContent.modifiers) {
                args.modifier.push(parseModifier(modifier));
            }
        }
        return Config.fromArgs(args);
    }
    
    private static sizeFromArgs(args: any): Size {
        if (args.size !== undefined) {
            if (typeof args.size === "string") {
                return parseSize(args.size);
            } else {
                return args.size;
            }
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