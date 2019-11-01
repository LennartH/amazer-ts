import _ from "lodash";

import { AreaModifier, ModifierConfig } from "./base";
import { Area, Tile } from "../domain/area";
import { Vector, Direction } from "../domain/common";


interface RemoveDeadendsConfig extends ModifierConfig {
    readonly deadendsToKeep?: number;
}

const DeadendTile = Tile.impassable("Deadend");

export const RemoveDeadends: AreaModifier<RemoveDeadendsConfig> = removeDeadends;

function removeDeadends(area: Area, config: RemoveDeadendsConfig): Area {
    const collectedDeadends: Vector[] = [];
    const currentDeadends = _.shuffle(findDeadends(area));
    while (currentDeadends.length > 0) {
        const deadend = currentDeadends.pop()!;
        area.set(deadend.point, DeadendTile);
        collectedDeadends.push(deadend.point);
        if (deadend.passableDirection !== undefined) {
            const nextDeadend = asDeadend(area, deadend.point.translate(deadend.passableDirection));
            if (nextDeadend !== undefined) {
                currentDeadends.unshift(nextDeadend);
            }
        }
    }

    let deadendsToKeep = config.deadendsToKeep || 0.3;
    if (deadendsToKeep < 1) {
        deadendsToKeep = deadendsToKeep * collectedDeadends.length;
    }
    let deadendsToRemove = collectedDeadends.length - deadendsToKeep;
    for (let deadend of collectedDeadends) {
        const tile = deadendsToRemove > 0 ? Tile.Wall : Tile.Floor;
        area.set(deadend, tile);
        deadendsToRemove--;
    }
    return area;
}

function findDeadends(area: Area): Deadend[] {
    const deadends: Deadend[] = [];
    for (let point of area.points()) {
        if (area.get(point).passable) {
            const deadend = asDeadend(area, point);
            if (deadend !== undefined) {
                deadends.push(deadend);
            }
        }
    }
    return deadends;
}

function asDeadend(area: Area, point: Vector): Deadend | undefined {
    const neighbours = area.neighbours(point, Direction.straights());
    let wallsCount = 0;
    let passableDirection: Direction | undefined = undefined;
    for (let k in neighbours) {
        if (!neighbours[k].passable) {
            wallsCount++;
        } else {
            passableDirection = Direction.forName(k);
        }
    }
    return wallsCount >= 3 ? {point: point, passableDirection: passableDirection} : undefined;
}

interface Deadend {
    readonly point: Vector;
    readonly passableDirection?: Direction;
}