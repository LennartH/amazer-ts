import { Area } from "../domain/area";
import { Emmure } from "./simple";
import { RemoveDeadends } from "./removeDeadends";

export interface ModifierConfig { }

export interface AreaModifier<C extends ModifierConfig> {
    (area: Area, config: C): Area;
}

export interface ModifierWithConfig<C extends ModifierConfig> {
    readonly modifier: AreaModifier<C>;
    readonly config?: C;
}

const modifiers: AreaModifier<any>[] = [
    Emmure, RemoveDeadends
]

export function parseModifier<C extends ModifierConfig>(arg: string): ModifierWithConfig<C> {
    const parts = arg.split(":");
    const mod = modifier<C>(parts[0]);
    let config: any = undefined;
    if (parts.length > 1) {
        const configArgs = parts[1].split(",");
        if (mod === RemoveDeadends) {
            const deadendsToRemove = Number(configArgs[0]);
            if (isNaN(deadendsToRemove)) {
                throw new Error(`The parameter for ${RemoveDeadends.name} must be a number but was ${configArgs[0]}`)
            }
            config = {
                deadendsToRemove: deadendsToRemove
            }
        }
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