import { Area } from "../domain/area";
import { Field, configFrom, decapitalize, Dict } from "../util";

export interface ModifierConfig { }

export interface AreaModifier<C extends ModifierConfig> {
    (area: Area, config: C): Area;
}

export interface ModifierWithConfig<C extends ModifierConfig> {
    readonly modifier: AreaModifier<C>;
    readonly config?: C;
}

const _modifiers: Dict<AreaModifier<any>> = {};
const _configFields: Dict<Field[]> = {};

export function modifiers(): Array<[AreaModifier<any>, Field[] | undefined]> {
    let result: Array<[AreaModifier<any>, Field[] | undefined]> = [];
    for (let name in _modifiers) {
        result.push([_modifiers[name], _configFields[name]]);
    }
    return result;
}

export function registerModifier(modifier: AreaModifier<any>, configFields?: Field[] | undefined) {
    const modifierName = modifier.name;
    _modifiers[modifierName] = modifier;
    if (configFields !== undefined) {
        _configFields[modifierName] = configFields;
    }
}

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
    if (configData !== undefined && _configFields.hasOwnProperty(modifierName)) {
        try {
            config = configFrom(configData, _configFields[modifierName]);
        } catch (error) {
            throw new Error(`Error parsing generator ${_modifier.name}: ${error.message}`);
        }
    }
    return {modifier: _modifier, config: config};
}

export function modifier<C extends ModifierConfig>(name: string): AreaModifier<C> {
    let cleanedName = decapitalize(name);
    const modifier = _modifiers[cleanedName];
    if (modifier === undefined) {
        throw new Error(`No modifier with name ${name} could be found`);
    }
    return modifier;
}