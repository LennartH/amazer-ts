import { Area } from "./domain/area";
import { Size } from "./domain/common";
import { GeneratorWithConfig, GeneratorConfig, AreaGenerator } from "./generator/base";
import { ModifierWithConfig, ModifierConfig, AreaModifier } from "./modifier/base";
import { RecursiveBacktracker } from "./generator/simple";
import { Dict } from "./util";

/**
 * Class defining the necessary configuration for {@link Amazer}.
 */
export class Config {

    private _size: Size;
    private _generator: GeneratorWithConfig<any>;
    private _modifiers: ModifierWithConfig<any>[];

    /**
     * @param size The size of the area to be generated
     * @param generator The generator algorithm to use
     * @param modifiers The modifiers to apply to the generated area. May be empty.
     */
    constructor(size: Size, generator: GeneratorWithConfig<any>, modifiers?: ModifierWithConfig<any>[]) {
        this._size = size;
        this._generator = generator;
        this._modifiers = modifiers || [];
    }

    // TODO Allow simplified object
    // TODO Add docu
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

    get size(): Size {
        return this._size;
    }

    get generator(): GeneratorWithConfig<any> {
        return this._generator;
    }

    get modifiers(): ModifierWithConfig<any>[] {
        return this._modifiers;
    }
}


// TODO Allow simple values for configuration
/**
 * Builder for {@link Config amazer configs}.
 * 
 * Example usage:
 * ```typescript
 * const config: Config = new ConfigBuilder()
 *      .withSize({width: 10, height: 10})
 *      .using(RandomizedPrim)
 *      .andModifier(Emmure)
 *      .andModifier(BreakPassages)
 *      .build()
 * ```
 */
export class ConfigBuilder {
    private _size: Size | undefined;
    private _generator: GeneratorWithConfig<any> | undefined;
    private _modifiers: ModifierWithConfig<any>[] = [];

    /**
     * Sets configs size.
     * 
     * @returns This instance for method chaining.
     */
    withSize(size: Size): ConfigBuilder {
        this._size = size;
        return this;
    }


    /**
     * Sets configs width.
     * 
     * @returns This instance for method chaining.
     */
    withWidth(width: number): ConfigBuilder {
        if (this._size === undefined) {
            this._size = {width: 0, height: 0};
        }
        this._size.width = width;
        return this;
    }


    /**
     * Sets configs height.
     * 
     * @returns This instance for method chaining.
     */
    withHeight(height: number): ConfigBuilder {
        if (this._size === undefined) {
            this._size = {width: 0, height: 0};
        }
        this._size.width = height;
        return this;
    }

    /**
     * Sets the algorithm to generate the area and optionally its config.
     * 
     * @param generator The algorithm to use
     * @param config The algorithms config
     * 
     * @returns This instance for method chaining.
     */
    using<C extends GeneratorConfig>(generator: AreaGenerator<C>, config?: C | undefined): ConfigBuilder {
        this._generator = {generator: generator, config: config};
        return this;
    }

    /**
     * Adds a modifier to be applied to generated areas and optionally its config.
     * 
     * @param generator The modifier to add
     * @param config The modifiers config
     * 
     * @returns This instance for method chaining.
     */
    andModifier<C extends ModifierConfig>(modifier: AreaModifier<C>, config?: C | undefined): ConfigBuilder {
        this._modifiers.push({modifier: modifier, config: config});
        return this;
    }

    /**
     * Creates a new {@link Config} with the current values. The config builder can be used
     * afterwards to create additional configs without modifying the ones already created.
     * 
     * @throws An error if the size has not been set
     * @throws An error if either width or height are 0
     * @throws An error if no generator has been set
     */
    build(): Config {
        if (this._size === undefined || this._size.height === 0 || this._size.width === 0) {
            throw new Error(`Invalid size ${this._size}: Must be set and have values > 0`)
        }
        if (this._generator === undefined) {
            throw new Error("No generator has been set")
        }

        return new Config({...this._size}, this._generator, [...this._modifiers]);
    }
}

/**
 * Root class to generate {@link Area Areas}. Has a single config, but can be reused to generate
 * several areas.
 */
export class Amazer {
    constructor(readonly config: Config) { }

    /**
     * Generate a new area.
     */
    generate(): Area {
        const generatorConfig: GeneratorConfig = {size: this.config.size, ...this.config.generator.config};
        let area = this.config.generator.generator(generatorConfig);
        for (let m of this.config.modifiers) {
            area = m.modifier(area, {...m.config});
        }
        return area;
    }
}

/**
 * Global entrypoint for the amazer library.
 * 
 * Creates a new {@link Amazer} instance for the given {@link Config} or a new {@link ConfigBuilder},
 * if no {@link Config} is provided.
 * 
 * @param config The amazer config
 * 
 * @returns A new {@link Amazer}, if a config is given, a new {@link ConfigBuilder} otherwhise.
 */
export default function amazer(config?: Config): Amazer | ConfigBuilder {
    if (config === undefined) {
        return new ConfigBuilder();
    } else {
        return new Amazer(config);
    }
}