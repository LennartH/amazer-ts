import { Area } from "../domain/area";
import { Size } from "../domain/common";
import { RecursiveBacktracker, RandomArea } from "./simple";
import { TileSet } from "../domain/tileset";

export { RecursiveBacktracker } from "./simple";


export interface GeneratorConfig {
    size: Size;
    tileSet: TileSet;
}

export interface AreaGenerator {
    (config: GeneratorConfig): Area;
}

const generators: AreaGenerator[] = []
generators.push(RecursiveBacktracker);
generators.push(RandomArea);

export function generator(name: string): AreaGenerator | undefined {
    let cleanName = name.charAt(0).toLowerCase() + name.slice(1);
    return generators.find(generator => {
        return generator.name == cleanName;
    });
}