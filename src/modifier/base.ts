import { Area } from "../domain/area";
import { Emmure } from "./simple";
import { RemoveDeadends, RemoveDeadendsConfigFields } from "./removeDeadends";
import { BreakPassages, BreakPassagesConfigFields } from "./breakPassages";
import { Field, configFrom, decapitalize } from "../util";

export interface ModifierConfig { }

export interface AreaModifier<C extends ModifierConfig> {
    (area: Area, config: C): Area;
}

export interface ModifierWithConfig<C extends ModifierConfig> {
    readonly modifier: AreaModifier<C>;
    readonly config?: C;
}

const modifiers: AreaModifier<any>[] = [
    Emmure, RemoveDeadends, BreakPassages
];

const modifierConfigFields: Map<AreaModifier<any>, Field[]> = new Map();
modifierConfigFields.set(RemoveDeadends, RemoveDeadendsConfigFields);
modifierConfigFields.set(BreakPassages, BreakPassagesConfigFields);

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

    const mod = modifier<C>(modifierName);
    let config: any = undefined;
    if (configData !== undefined && modifierConfigFields.has(mod)) {
        try {
            config = configFrom(configData, modifierConfigFields.get(mod)!);
        } catch (error) {
            throw new Error(`Error parsing generator ${mod.name}: ${error.message}`);
        }
    }
    return {modifier: mod, config: config};
}

export function modifier<C extends ModifierConfig>(name: string): AreaModifier<C> {
    let cleanedName = decapitalize(name);
    const modifier = modifiers.find(g => g.name == cleanedName);
    if (modifier === undefined) {
        throw new Error(`No modifier with name ${name} could be found`);
    }
    return modifier;
}