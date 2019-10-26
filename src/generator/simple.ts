import _ from "lodash";
import { Area } from "../domain/area";
import { AreaGenerator, GeneratorConfig } from "./base";
import { Direction, Vector } from "../domain/common";


export const RecursiveBacktracker: AreaGenerator = recursiveBacktracker;

// TODO Cleanup
function recursiveBacktracker(config: GeneratorConfig): Area {
    const tileSet = config.tileSet;
    const passable = tileSet.passables[0];
    const impassable = tileSet.impassables[0];
    const area = new Area(config.size, impassable);
    let walkableDirections = _.shuffle([Direction.Up, Direction.Right, Direction.Down, Direction.Left]);  // TODO this shouldn't be hardcoded
    let stack: Vector[] = [Vector.random(area.size)];

    while (stack.length > 0) {
        let p = stack.pop()!;
        area.set(p, passable);
        for (let direction of walkableDirections) {
            let nextP = p.translate(direction, 2);
            if (area.contains(nextP) && !area.get(nextP).passable) {
                let wallP = p.translate(direction);
                area.set(wallP, passable)

                stack.push(p);
                stack.push(nextP);

                walkableDirections = _.shuffle(walkableDirections);
                break;
            }
        }
    }
    return area;
}


export const RandomArea: AreaGenerator = random;

function random(config: GeneratorConfig): Area {
    const area = new Area(config.size);
    let points = _.shuffle(Array.from(area.points()));
    points.forEach(p => area.set(p, _.sample(config.tileSet.tiles)!));
    return area;
}