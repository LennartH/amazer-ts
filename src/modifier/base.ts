import { Area } from "../domain/area";
import { Field, configFrom, Dict } from "../util";

/**
 * Placeholder interface for general {@link AreaModifier} config
 * attributes.
 */
export interface ModifierConfig { }

/** Functional interface for area modifiers. */
export interface AreaModifier<C extends ModifierConfig> {
    (area: Area, config: C): Area;
}

/** Helper interface for an {@link AreaModifier} and its config. */
export interface ModifierWithConfig<C extends ModifierConfig> {
    readonly modifier: AreaModifier<C>;
    readonly config?: C;
}

/** Helper interface for registered {@link AreaModifier}. */
export interface RegisteredModifier<C extends ModifierConfig> {
    readonly name: string;
    readonly modifier: AreaModifier<C>;
    readonly configFields: Field[];
}

const _modifiers: Dict<AreaModifier<any>> = {};
const _configFields: Dict<Field[]> = {};


/**
 * Registers the given {@link AreaModifier} and the fields describing
 * its config (without the fields in {@link ModifierConfig}). This allows
 * other utility methods to retrieve the registered modifier and construct
 * its config.
 * 
 * @see {@link modifiers}
 * @see {@link modifier}
 * @see {@link parseModifier}
 */
export function registerModifier(name: string, modifier: AreaModifier<any>, configFields?: Field[] | undefined) {
    _modifiers[name] = modifier;
    if (configFields !== undefined) {
        _configFields[name] = configFields;
    }
}

/**
 * @returns A list of all {@link registerModifier registered} and their config
 *      {@link Field fields} (if provided) as tuples.
 */
export function modifiers(): RegisteredModifier<any>[] {
    let result: RegisteredModifier<any>[] = [];
    for (let name in _modifiers) {
        result.push({
            name: name,
            modifier: _modifiers[name],
            configFields: _configFields[name]
        });
    }
    return result;
}

/**
 * Parses the given data as {@link AreaModifier} with config (if possible).
 * 
 * The given data must be string with format `<modifier name>[:<config data>]`
 * or an object, where the first key is the modifier name and its value is
 * the config data.
 * 
 * {@link configFrom} is used to create a config object from the config data.
 * 
 * @param data The generator data to be parsed
 * 
 * @throws An error, if the config data can not be parsed.
 */
export function parseModifier<C extends ModifierConfig>(arg: any): ModifierWithConfig<C> {
    let modifierName: string;
    let configData: any;
    if (typeof arg === "string") {
        const parts = arg.split(":");
        modifierName = parts[0];
        configData = parts[1];
    } else {
        modifierName = Object.keys(arg)[0];
        configData = arg[modifierName];
    }

    const _modifier = modifier<C>(modifierName);
    let config: any = undefined;
    if (configData !== undefined && _configFields.hasOwnProperty(_modifier.name)) {
        try {
            config = configFrom(configData, _configFields[_modifier.name]);
        } catch (error) {
            throw new Error(`Error parsing config for modifier ${modifierName}: ${error.message}`);
        }
    }
    return {modifier: _modifier, config: config};
}


/**
 * @param name The modifiers name
 * 
 * @returns The {@link AreaModifier} with the given name.
 * 
 * @throws An error, if no modifier with the given name can be found.
 */
export function modifier<C extends ModifierConfig>(name: string): AreaModifier<C> {
    const modifier = _modifiers[name];
    if (modifier === undefined) {
        throw new Error(`No modifier with name ${name} could be found`);
    }
    return modifier;
}