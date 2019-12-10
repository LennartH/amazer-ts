import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { GeneratorWithConfig, GeneratorConfig, AreaGenerator } from "./generator/base";
import { ModifierWithConfig, ModifierConfig, AreaModifier } from "./modifier/base";
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

    // TODO Allow simplified object
    static fromObject(data: Dict<any>): Config {
        let modifiers: ModifierWithConfig<any>[] = [];
        if (data.modifier !== undefined) {
            modifiers.push(...data.modifier);
        }
        if (data.modifiers !== undefined) {
            modifiers.push(...data.modifiers);
        }
        return new Config(
            Size.fromObject(data),
            data.generator || {generator: RecursiveBacktracker, config: undefined},
            modifiers
        );
    }
}

export class ConfigBuilder {
    private _size: Size | undefined;
    private _generator: GeneratorWithConfig<any> | undefined;
    private _modifiers: ModifierWithConfig<any>[] = [];

    withSize(size: Size): ConfigBuilder {
        this._size = size;
        return this;
    }

    withWidth(width: number): ConfigBuilder {
        if (this._size === undefined) {
            this._size = {width: 0, height: 0};
        }
        this._size.width = width;
        return this;
    }

    withHeight(height: number): ConfigBuilder {
        if (this._size === undefined) {
            this._size = {width: 0, height: 0};
        }
        this._size.width = height;
        return this;
    }

    using<C extends GeneratorConfig>(generator: AreaGenerator<C>, config?: C | undefined): ConfigBuilder {
        this._generator = {generator: generator, config: config};
        return this;
    }

    andModifier<C extends ModifierConfig>(modifier: AreaModifier<C>, config?: C | undefined): ConfigBuilder {
        this._modifiers.push({modifier: modifier, config: config});
        return this;
    }

    build(): Config {
        if (this._size === undefined || this._size.height === 0 || this._size.width === 0) {
            throw new Error(`Invalid size ${this._size}: Must be set and have values > 0`)
        }
        if (this._generator === undefined) {
            throw new Error("No generator has been set")
        }

        return new Config(this._size, this._generator, this._modifiers);
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

export default function amazer(config?: Config): Amazer | ConfigBuilder {
    if (config === undefined) {
        return new ConfigBuilder();
    } else {
        return new Amazer(config);
    }
}