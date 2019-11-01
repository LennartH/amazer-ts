import { Area } from "../domain/area";
import { Emmure } from "./simple";
import { RemoveDeadends } from "./removeDeadends";

export interface ModifierConfig {
    readonly [k: string]: any
}

export interface AreaModifier<C extends ModifierConfig> {
    (area: Area, config: C): Area;
}

const modifiers: AreaModifier<any>[] = [
    Emmure, RemoveDeadends
]

export function modifier<C extends ModifierConfig>(name: string): AreaModifier<C> {
    let cleanedName = name.charAt(0).toLowerCase() + name.slice(1);
    const modifier = modifiers.find(g => g.name == cleanedName);
    if (modifier === undefined) {
        throw new Error(`No modifier with name ${name} could be found`);
    }
    return modifier;
}