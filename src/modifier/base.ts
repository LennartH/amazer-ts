import { TileSet } from "../domain/tileset";
import { Area } from "../domain/area";
import { Emmure } from "./simple";

export interface ModifierConfig {
    readonly tileSet: TileSet;
}

export interface AreaModifier {
    (area: Area, config: ModifierConfig): Area;
}

const modifiers: AreaModifier[] = [
    Emmure
]

export function modifier(name: string): AreaModifier {
    let cleanedName = name.charAt(0).toLowerCase() + name.slice(1);
    const modifier = modifiers.find(g => g.name == cleanedName);
    if (modifier === undefined) {
        throw new Error(`No modifier with name ${name} could be found`);
    }
    return modifier;
}