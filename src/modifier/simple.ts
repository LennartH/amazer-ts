import { AreaModifier, ModifierConfig } from "./base";
import { Area } from "../domain/area";

export const Emmure: AreaModifier = emmure;

function emmure(area: Area, config: ModifierConfig): Area {
    return area;
}