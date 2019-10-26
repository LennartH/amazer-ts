import _ from "lodash";
import { Area, Tile } from "../domain/area";
import { AreaGenerator, GeneratorConfig } from "./base";
import { Direction, Vector } from "../domain/common";


export const RecursiveBacktracker: AreaGenerator = recursiveBacktracker;

// TODO Cleanup
function recursiveBacktracker(config: GeneratorConfig): Area {
    const tileSet = config.tileSet;
    const initialTile = tileSet.tiles.find(t => !t.passable);
    if (initialTile === undefined) {
        throw new Error("The given tile set does not contain impassable tiles")
    }
    const area = new Area(config.size, initialTile);
    let walkableDirections = _.shuffle([Direction.Up, Direction.Right, Direction.Down, Direction.Left]);  // TODO this shouldn't be hardcoded
    let stack: Vector[] = [Vector.random(area.size)];

    while (stack.length > 0) {
        let p = stack.pop()!;
        // TODO This call should be simplified
        area.set(p, tileSet.getMatching(area.neighbours(p), t => t.passable)[0])  // TODO Conflict resolve strategy
        for (let direction of walkableDirections) {
            let nextP = p.translate(direction, 2);
            if (area.contains(nextP) && !area.get(nextP).passable) {
                let wallP = p.translate(direction);
                area.set(wallP, tileSet.getMatching(area.neighbours(wallP), t => t.passable)[0])

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
    points.forEach(p => {
        let neighbours = area.neighbours(p);
        let tile: Tile = _.sample(config.tileSet.getMatching(neighbours))!;
        area.set(p, tile);
    });
    return area;
}