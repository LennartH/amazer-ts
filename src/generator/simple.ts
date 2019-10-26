import _ from "lodash";
import { Area } from "../domain/area";
import { AreaGenerator, GeneratorConfig, VisitedTile } from "./base";
import { Direction, Vector } from "../domain/common";


export const RecursiveBacktracker: AreaGenerator = recursiveBacktracker;

function recursiveBacktracker(config: GeneratorConfig): Area {
    const tileSet = config.tileSet;
    const passable = tileSet.passables[0];
    const impassable = tileSet.impassables[0];
    const area = new Area(config.size, impassable);
    let stack: VisitedTile[] = [new VisitedTile(Vector.random(area.size), Direction.straights())];

    while (stack.length > 0) {
        let tile = stack.pop()!;
        area.set(tile.point, passable);
        while (tile.hasNext()) {
            let direction = tile.next();
            let nextPoint = tile.point.translate(direction, 2);
            if (area.contains(nextPoint) && !area.get(nextPoint).passable) {
                area.set(tile.point.translate(direction), passable);
                stack.push(tile);
                stack.push(new VisitedTile(nextPoint, Direction.straights()));
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