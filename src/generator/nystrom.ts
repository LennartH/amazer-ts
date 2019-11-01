import _ from "lodash";

import { AreaGenerator, GeneratorConfig } from "./base";
import { Area, Tile, floodFill } from "../domain/area";
import { Size, Vector, Rectangle, Direction } from "../domain/common";
import { recursiveBacktrack } from "./simple";


export interface NystromConfig extends GeneratorConfig {
    readonly minRoomSize?: Size;
    readonly maxRoomSize?: Size;
    readonly roomPlacementAttempts?: number;
}

export const Nystrom: AreaGenerator<NystromConfig> = nystrom;

function nystrom(c: NystromConfig): Area {
    let config = new _NystromConfig(c);
    const area = new Area(config.size, Tile.Wall);

    for (let i = 0; i < config.roomPlacementAttempts; i++) {
        tryToAddRoom(config, area);
    }
    carvePassages(area);
    connectSections(area);

    return area;
}

function tryToAddRoom(config: _NystromConfig, area: Area): void {
    const room = randomRoom(config);
    for (let point of room.points()) {
        if (!area.contains(point) || area.get(point).passable) {
            return;
        }
    }
    room.forEach(p => area.set(p, Tile.Floor));
}

function randomRoom(config: _NystromConfig) : Rectangle {
    const start = Vector.random(config.size, p => p.x % 2 === 0 && p.y % 2 === 0);
    let size: Size;
    do {
        size = {
            width: _.random(config.minRoomSize.width, config.maxRoomSize.width),
            height: _.random(config.minRoomSize.height, config.maxRoomSize.height)
        }
    } while (size.width % 2 === 0 || size.height % 2 === 0);
    return new Rectangle(start, size);
}

function carvePassages(area: Area): void {
    let start: Vector | undefined;
    do {
        start = undefined;
        for (let point of area.points()) {
            if (!area.get(point).passable && point.x % 2 === 0 && point.y % 2 === 0) {
                start = point;
                break;
            }
        }
        if (start !== undefined) {
            recursiveBacktrack(area, start);
        }
    } while (start !== undefined);
}

function connectSections(area: Area): void {
    const sections = floodFill(area, t => t.passable);
    while (sections.length > 1) {
        const link = _.sample(findSectionLinks(area, sections))!;
        area.set(link.point, Tile.Floor);
        sections[link.section1].push(link.point, ...sections[link.section2]);
        sections.splice(link.section2, 1);
    }
}

function findSectionLinks(area: Area, sections: Vector[][]): SectionLink[] {
    const sectionIndex = (point: Vector) => {
        for (let index = 0; index < sections.length; index++) {
            const section = sections[index];
            if (section.some(p => p.x === point.x && p.y === point.y)) {
                return index;
            }
        }
        return undefined;
    };

    const links: SectionLink[] = [];
    for (let point of area.points()) {
        if (!area.get(point).passable) {
            let neighbours = area.neighbours(point, Direction.straights());
            let passableCount = 0;
            for (let directionName in neighbours) {
                passableCount += neighbours[directionName].passable ? 1 : 0;
            }
            const up = neighbours[Direction.Up.name] || Tile.Empty;
            const down = neighbours[Direction.Down.name] || Tile.Empty;
            const left = neighbours[Direction.Left.name] || Tile.Empty;
            const right = neighbours[Direction.Right.name] || Tile.Empty;
            if (passableCount === 2 && (up.passable && down.passable) !== (left.passable && right.passable)) {
                let [passable1, passable2] = up.passable ? [point.translate(Direction.Up), point.translate(Direction.Down)] :
                                                           [point.translate(Direction.Left), point.translate(Direction.Right)];
                let section1 = sectionIndex(passable1);
                let section2 = sectionIndex(passable2);
                if (section1 !== section2) {
                    links.push({
                        point: point,
                        section1: section1!,
                        section2: section2!
                    });
                }
            }
        }
    }
    return links;
}

interface SectionLink {
    readonly point: Vector;
    readonly section1: number;
    readonly section2: number;
}

class _NystromConfig implements NystromConfig {
    private static readonly defaultMinSizeFactor = 0.04;
    private static readonly defaultMaxSizeFactor = 0.1;
    private static readonly minMinRoomSize = 3;
    private static readonly minMaxRoomSize = 5;

    readonly size: Size;
    readonly minRoomSize: Size;
    readonly maxRoomSize: Size;
    readonly roomPlacementAttempts: number;

    constructor(config: NystromConfig) {
        this.size = config.size;
        this.minRoomSize = config.minRoomSize || this.defaultMinRoomSize();
        this.maxRoomSize = config.maxRoomSize || this.defaultMaxRoomSize();
        this.roomPlacementAttempts = config.roomPlacementAttempts || Math.min(config.size.width * config.size.height * 0.5, 1000);
    }

    private defaultMinRoomSize(): Size {
        const width = this.size.width * _NystromConfig.defaultMinSizeFactor;
        const height = this.size.height * _NystromConfig.defaultMinSizeFactor;
        return {
            width: Math.max(_NystromConfig.minMinRoomSize, width),
            height: Math.max(_NystromConfig.minMinRoomSize, height)
        };
    }

    private defaultMaxRoomSize(): Size {
        const width = this.size.width * _NystromConfig.defaultMaxSizeFactor;
        const height = this.size.height * _NystromConfig.defaultMaxSizeFactor;
        return {
            width: Math.max(_NystromConfig.minMaxRoomSize, width),
            height: Math.max(_NystromConfig.minMaxRoomSize, height)
        };
    }
}