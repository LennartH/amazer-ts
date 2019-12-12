import _ from "lodash";

import { ModifierConfig, AreaModifier, registerModifier } from "./base";
import { Area, Tile } from "../domain/area";
import { Vector, Direction } from "../domain/common";
import { findPath } from "../solver";
import { Field, parseNumber } from "../util";


export interface BreakPassagesConfig extends ModifierConfig {
    /**
     * The targeted amount of walls to remove. Defaults to
     * `(area.width + area.height) / 2`.
     */
    readonly amount?: number;
    /**
     * The mininum distance of the path between the tiles
     * connected by a removed wall. Defaults to 
     * `Math.sqrt(area.width * area.height)`.
     */
    readonly minimumShortcutDistance?: number;
}

const BreakPassagesConfigFields: Field[] = [
    {name: "amount", parser: parseNumber},
    {name: "minimumShortcutDistance", parser: parseNumber},
]

/**
 * Replaces {@link BreakPassagesConfig.amount} random wall tiles that have
 * exactly 2 floor tiles as neighbours with floor tiles. The path length
 * between the 2 floor tiles must be greater equals than
 * {@link BreakPassagesConfig.minimumShortcutDistance}.
 * 
 * It is possible that less wall tiles than the targeted amount are replaced,
 * if the minimum shortcut distance is too large. 
 * 
 * Example:
 * ```
 * ┏━━━━━━━━━━━┓    ┏━━━━━━━━━━━┓ 
 * ┃           ┃    ┃           ┃
 * ┃   # # # # ┃    ┃   #   # # ┃
 * ┃   #       ┃ => ┃   #       ┃
 * ┃   # # #   ┃    ┃   # # #   ┃
 * ┃           ┃    ┃           ┃
 * ┗━━━━━━━━━━━┛    ┗━━━━━━━━━━━┛
 * ```
 * 
 * @returns The same, but modified area instance.
 */
export const BreakPassages: AreaModifier<BreakPassagesConfig> = breakPassages;
registerModifier(BreakPassages, BreakPassagesConfigFields);

function breakPassages(area: Area, config: BreakPassagesConfig): Area {
    let amount: number = config.amount || (area.width + area.height) / 2;
    const minimumShortcutDistance: number = config.minimumShortcutDistance || Math.sqrt(area.width * area.height);

    const candidates: PassageCandidate[] = _.shuffle(findCandidates(area));
    while (amount >= 0 && candidates.length > 0) {
        const candidate = candidates.pop()!;
        const path = findPath(area, candidate.neighbour1, candidate.neighbour2);
        if (path === undefined || path.length >= minimumShortcutDistance) {
            area.set(candidate.point, Tile.Floor);
            amount--;
        }
    }

    return area;
}

function findCandidates(area: Area): PassageCandidate[] {
    const candidates: PassageCandidate[] = [];
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
                candidates.push(new PassageCandidate(point, passable1, passable2));
            }
        }
    }
    return candidates;
}

class PassageCandidate {
    constructor(
        readonly point: Vector,
        readonly neighbour1: Vector,
        readonly neighbour2: Vector 
    ) { }
}