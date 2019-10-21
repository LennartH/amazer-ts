import { Area } from "../domain/area";
import { Size } from "../domain/common";
import { RecursiveBacktracker } from "./simple";

export { RecursiveBacktracker } from "./simple";


export interface AreaGenerator {
    (size: Size): Area;
}

const generators: AreaGenerator[] = []
generators.push(RecursiveBacktracker);

export function generator(name: string): AreaGenerator | undefined {
    let cleanName = name.charAt(0).toLowerCase() + name.slice(1);
    return generators.find(generator => {
        return generator.name == cleanName;
    });
}