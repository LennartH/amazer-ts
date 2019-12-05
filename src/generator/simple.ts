import _ from "lodash";
import { Area, Tile } from "../domain/area";
import { AreaGenerator, GeneratorConfig, VisitedTile, registerGenerator } from "./base";
import { Direction, Vector } from "../domain/common";


export const RecursiveBacktracker: AreaGenerator<GeneratorConfig> = recursiveBacktracker;
registerGenerator(RecursiveBacktracker);

function recursiveBacktracker(config: GeneratorConfig): Area {
    const area = new Area(config.size, Tile.Wall);

    const start = Vector.random(area.size, p => p.x % 2 == 0 && p.y % 2 == 0);
    recursiveBacktrack(area, start);
    return area;
}

export function recursiveBacktrack(area: Area, start: Vector) {
    let stack: VisitedTile[] = [new VisitedTile(start, Direction.straights())];
    while (stack.length > 0) {
        let tile = stack.pop()!;
        area.set(tile.point, Tile.Floor);
        while (tile.hasNext()) {
            let direction = tile.next();
            let nextPoint = tile.point.translate(direction, 2);
            if (area.contains(nextPoint) && !area.get(nextPoint).passable) {
                area.set(tile.point.translate(direction), Tile.Floor);
                stack.push(tile);
                stack.push(new VisitedTile(nextPoint, Direction.straights()));
                break;
            }
        }
    }
}


export const RandomizedKruskal: AreaGenerator<GeneratorConfig> = randomizedKruskal;
registerGenerator(RandomizedKruskal);

function randomizedKruskal(config: GeneratorConfig): Area {
    const area = new Area(config.size);

    const subSets: Array<Set<Vector>> = [];
    let walls: Array<VisitedTile> = [];
    for (let point of area.points()) {
        if (point.x % 2 == 1 || point.y % 2 == 1) {
            area.set(point, Tile.Wall);
            walls.push(new VisitedTile(point, [Direction.Up, Direction.Right]));
        } else {
            area.set(point, Tile.Floor);
            let subSet: Set<Vector> = new Set();
            subSet.add(point);
            subSets.push(subSet);
        }
    }
    walls = _.shuffle(walls);

    const findSubSet = (p: Vector) => {
        for (let s of subSets) {
            for (let pS of s) {
                if (_.isEqual(p, pS)) {
                    return s;
                }
            }
        }
        return undefined;
    };
    
    while (walls.length > 0) {
        let wall = walls.pop()!;
        if (wall.hasNext()) {
            let direction = wall.next();
            let set1 = findSubSet(wall.point.translate(direction));
            let set2 = findSubSet(wall.point.translate(direction.opposite()));
            if (set1 !== undefined && set2 !== undefined && set1 !== set2) {
                area.set(wall.point, Tile.Floor);
                set2.forEach(p => set1!.add(p));
                _.remove(subSets, s => s === set2);
            }
            walls.push(wall);
        }
        walls = _.shuffle(walls);
    }

    return area;
}


export const RandomizedPrim: AreaGenerator<GeneratorConfig> = randomizedPrim;
registerGenerator(RandomizedPrim);

function randomizedPrim(config: GeneratorConfig): Area {
    const area = new Area(config.size, Tile.Wall);

    const walls: VisitedTile[] = [];
    const point = Vector.random(area.size, p => p.x % 2 == 0 && p.y % 2 == 0);
    area.set(point, Tile.Floor);
    // TODO Remove duplicated code
    Direction.straights().forEach(d => {
        const p = point.translate(d);
        if (area.contains(p)) {
            walls.push(new VisitedTile(p, [Direction.Up, Direction.Right]));
        }
    });

    while (walls.length > 0) {
        let index = _.random(walls.length - 1);
        let wall = walls[index];
        let direction = wall.next();
        let neighbour1 = wall.point.translate(direction);
        let neighbour2 = wall.point.translate(direction.opposite());
        if (area.contains(neighbour1) && area.contains(neighbour2) && area.get(neighbour1).passable !== area.get(neighbour2).passable) {
            let unvisited = area.get(neighbour1).passable ? neighbour2 : neighbour1;
            area.set(wall.point, Tile.Floor);
            area.set(unvisited, Tile.Floor);
            // TODO Remove duplicated code
            Direction.straights().forEach(d => {
                const p = unvisited.translate(d);
                if (area.contains(p)) {
                    walls.push(new VisitedTile(p, [Direction.Up, Direction.Right]));
                }
            });
        }
        if (!wall.hasNext()) {
            walls.splice(index, 1);
        }
    }

    return area;
}


export const RandomArea: AreaGenerator<GeneratorConfig> = random;
registerGenerator(RandomArea);

function random(config: GeneratorConfig): Area {
    const area = new Area(config.size);
    let points = _.shuffle(Array.from(area.points()));
    points.forEach(p => area.set(p, _.random() > 0.5 ? Tile.Floor : Tile.Wall));
    return area;
}