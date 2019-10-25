import _ from "lodash";
import { Area, Tile } from "../domain/area";
import { AreaGenerator, GeneratorConfig } from "./base";
import { Direction } from "../domain/common";


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
    let stack: [number, number][] = [[_.random(area.width - 1), _.random(area.height - 1)]];

    while (stack.length > 0) {
        let [x, y] = stack.pop()!;
        // TODO This call should be simplified
        area.set(x, y, tileSet.getMatching(area.neighbours(x, y), t => t.passable)[0])  // TODO Conflict resolve strategy
        for (let direction of walkableDirections) {
            let [nextX, nextY] = [x + direction.dx * 2, y + direction.dy * 2];
            if (area.contains(nextX, nextY) && !area.get(nextX, nextY).passable) {
                let [wallX, wallY] = [x + direction.dx, y + direction.dy];
                area.set(wallX, wallY, tileSet.getMatching(area.neighbours(wallX, wallY), t => t.passable)[0])

                stack.push([x, y]);
                stack.push([nextX, nextY]);

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
    let points: Array<[number, number]> = [];
    for (let x = 0; x < area.width; x++) {
        for (let y = 0; y < area.height; y++) {
            points.push([x, y]);
        }
    }
    points = _.shuffle(points);
    points.forEach(([x, y]) => {
        let neighbours = area.neighbours(x, y);
        let tile: Tile = _.sample(config.tileSet.getMatching(neighbours))!;
        area.set(x, y, tile);
    });
    return area;
}