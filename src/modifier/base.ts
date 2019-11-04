import { Area } from "../domain/area";
import { Emmure } from "./simple";
import { RemoveDeadends, RemoveDeadendsConfigFields } from "./removeDeadends";
import { BreakPassages, BreakPassagesConfigFields } from "./breakPassages";
import { Field, parseConfig } from "../util";

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
]

const modifierConfigFields: Map<AreaModifier<any>, Field[]> = new Map();
modifierConfigFields.set(RemoveDeadends, RemoveDeadendsConfigFields);
modifierConfigFields.set(BreakPassages, BreakPassagesConfigFields);

export function parseModifier<C extends ModifierConfig>(arg: string): ModifierWithConfig<C> {
    const parts = arg.split(":");
    const mod = modifier<C>(parts[0]);
    let config: any = undefined;
    if (parts.length > 1 && modifierConfigFields.has(mod)) {
        config = parseConfig(parts[1], modifierConfigFields.get(mod)!);
    }
    return {modifier: mod, config: config};
}

export function modifier<C extends ModifierConfig>(name: string): AreaModifier<C> {
    let cleanedName = name.charAt(0).toLowerCase() + name.slice(1);
    const modifier = modifiers.find(g => g.name == cleanedName);
    if (modifier === undefined) {
        throw new Error(`No modifier with name ${name} could be found`);
    }
    return modifier;
}