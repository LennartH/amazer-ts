import { Area, Size } from "./domain";

export interface AreaGenerator {
    (size: Size): Area;
}

const generators: AreaGenerator[] = []

export const RecursiveBacktracker: AreaGenerator = recursiveBacktracker;
generators.push(RecursiveBacktracker);

export function generator(name: string): AreaGenerator | undefined {
    let cleanName = name.charAt(0).toLowerCase() + name.slice(1);
    return generators.find(generator => {
        return generator.name == cleanName;
    });
}

function recursiveBacktracker(size: Size): Area {
    const area = new Area(size);
    // TODO Implement me
    return area;
}