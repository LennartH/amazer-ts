import { Area } from "../domain/area";
import { Size } from "../domain/common";
import { AreaGenerator } from "./base";


export const RecursiveBacktracker: AreaGenerator = recursiveBacktracker;

function recursiveBacktracker(size: Size): Area {
    const area = new Area(size);
    // TODO Implement me
    return area;
}
