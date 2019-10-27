import { TileSet } from "../domain/tileset";
import { Area } from "../domain/area";

export interface ModifierConfig {
    readonly tileSet: TileSet;
}

export interface AreaModifier {
    (area: Area, config: ModifierConfig): Area;
}

const modifiers: AreaModifier[] = []

export function generator(name: string): AreaModifier {
    let cleanedName = name.charAt(0).toLowerCase() + name.slice(1);
    const generator = modifiers.find(g => g.name == cleanedName);
    if (generator === undefined) {
        throw new Error(`No modifier with name ${name} could be found`);
    }
    return generator;
}