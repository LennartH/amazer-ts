import _ from "lodash";
import { Area, Tile } from "../domain/area";
import { AreaGenerator, GeneratorConfig } from "./base";


export const RecursiveBacktracker: AreaGenerator = recursiveBacktracker;

function recursiveBacktracker(config: GeneratorConfig): Area {
    const area = new Area(config.size);
    // TODO Implement me
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