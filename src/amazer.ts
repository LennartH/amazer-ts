import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { GeneratorWithConfig, GeneratorConfig, parseGenerator } from "./generator/base";
import { ModifierWithConfig, parseModifier } from "./modifier/base";
import { RecursiveBacktracker } from "./generator/simple";
import { readStructuredFile } from "./cli/files";
import { Dict } from "./util";

export class Config {

    private _size: Size;
    private _generator: GeneratorWithConfig<any>;
    private _modifiers: ModifierWithConfig<any>[];

    constructor(size: Size, generator: GeneratorWithConfig<any>, modifiers: ModifierWithConfig<any>[]) {
        this._size = size;
        this._generator = generator;
        this._modifiers = modifiers;
    }

    get size(): Size {
        return this._size;
    }

    get generator(): GeneratorWithConfig<any> {
        return this._generator;
    }

    get modifiers(): ModifierWithConfig<any>[] {
        return this._modifiers;
    }

    static fromObject(args: Dict<any>): Config {
        if (args.config !== undefined) {
            const config = Config.fromFile(args.config);
            try {
                config._size = Config.sizeFromArgs(args);
            } catch { }
            if (args.generator !== undefined) {
                config._generator = args.generator;
            }
            if (args.modifier !== undefined && args.modifier.length > 0) {
                config._modifiers = args.modifier;
            }
            return config;
        } else {
            let modifiers: ModifierWithConfig<any>[] = [];
            if (args.modifier !== undefined) {
                modifiers.push(...args.modifier);
            }
            return new Config(
                Config.sizeFromArgs(args),
                args.generator || {generator: RecursiveBacktracker, config: undefined},
                modifiers
            );
        }
    }

    // TODO Move to cli/files
    static fromFile(path: string): Config {
        const fileContent = readStructuredFile(path);
        const args: Dict<any> = {};
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
        return Config.fromObject(args);
    }
    
    private static sizeFromArgs(args: any): Size {
        if (args.size !== undefined) {
            if (typeof args.size === "string") {
                return Size.fromString(args.size);
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
export default function amazer(config: Config): Amazer {
    return new Amazer(config);
}