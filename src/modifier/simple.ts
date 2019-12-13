import { AreaModifier, ModifierConfig, registerModifier } from "./base";
import { Area, Tile } from "../domain/area";
import { Direction, Vector } from "../domain/common";

/**
 * Surrounds an area with a solid wall, which may increase the areas size.
 * This modifier has no separate config.
 * 
 * Edges that already are solid (only consist of wall tiles) are skipped.
 * 
 * Example:
 * ```
 *                 ┏━━━━━━━━━━━┓
 * ┏━━━━━━━━━┓     ┃ # # # # # ┃
 * ┃       # ┃     ┃ #       # ┃
 * ┃ # #   # ┃  => ┃ # # #   # ┃
 * ┃       # ┃     ┃ #       # ┃
 * ┃ # # # # ┃     ┃ # # # # # ┃
 * ┗━━━━━━━━━┛     ┗━━━━━━━━━━━┛ 
 * ```  
 * 
 * @returns A new {@link Area} instance that is completely surrounded
 *      by wall tiles.
 */
export const Emmure: AreaModifier<ModifierConfig> = emmure;
registerModifier("Emmure", Emmure);

function emmure(area: Area, _: ModifierConfig): Area {
    let borders: {[direction: string]: [Vector, Direction]} = {
        "Up": [new Vector(0, 0), Direction.Right],
        "Left": [new Vector(0, 0), Direction.Down],
        "Right": [new Vector(area.width - 1, area.height - 1), Direction.Up],
        "Down": [new Vector(area.width - 1, area.height - 1), Direction.Left]
    };
    let wallsNeeded: {[direction: string]: number} = {};
    for (let borderDirection in borders) {
        let [point, walkDirection] = borders[borderDirection];
        let needsWall = 0;
        while (area.contains(point)) {
            if (area.get(point).passable) {
                needsWall = 1;
                break;
            }
            point = point.translate(walkDirection);
        }
        wallsNeeded[borderDirection] = needsWall;
    }

    let xOffset = wallsNeeded["Left"];
    let yOffset = wallsNeeded["Up"];
    let emmuredArea = new Area({
        width: area.width + xOffset + wallsNeeded["Right"],
        height: area.height + yOffset + wallsNeeded["Down"]
    });
    area.forEach((t, p) => emmuredArea.set({x: p.x + xOffset, y: p.y + yOffset}, t));
    for (let point of emmuredArea.points()) {
        if (emmuredArea.get(point) === Tile.Empty) {
            emmuredArea.set(point, Tile.Wall);
        }
    }
    return emmuredArea;
}