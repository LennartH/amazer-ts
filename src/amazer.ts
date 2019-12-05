import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { GeneratorWithConfig, GeneratorConfig } from "./generator/base";
import { ModifierWithConfig } from "./modifier/base";
import { RecursiveBacktracker } from "./generator/simple";
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
        let modifiers: ModifierWithConfig<any>[] = [];
        if (args.modifier !== undefined) {
            modifiers.push(...args.modifier);
        }
        return new Config(
            Size.fromObject(args),
            args.generator || {generator: RecursiveBacktracker, config: undefined},
            modifiers
        );
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