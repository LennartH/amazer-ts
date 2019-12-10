import { Area, Tile } from "./domain/area";
import { Point, Vector, Direction } from "./domain/common";


/**
 * Searches for the shortest path from `s` to `t` and returns a list of {@link Direction directions}
 * to get from `s` to `t` or `undefined`, if no path could be found.
 * 
 * @param area The area to search
 * @param s The start point
 * @param t The target point
 * @param isWalkable Predicate to decide if a {@link Tile} can be walked. Defaults to {@link Tile.passable}.
 * 
 * @returns A list of {@link Direction directions} to get from `s` to `t` or `undefined`, if no path could be found.
 */
export function findPath(area: Area, s: Point, t: Point, isWalkable?: (t: Tile) => boolean): Direction[] | undefined {
    isWalkable = isWalkable || (t => t.passable);
    const start = Vector.from(s);
    const target = Vector.from(t);
    const openNodes: VisitedNode[] = [];
    const visited: boolean[][] = [];
    for (let x = 0; x < area.width; x++) {
        visited.push(new Array<boolean>(area.height).fill(false));
    }

    let finalNode: VisitedNode | undefined = undefined;
    openNodes.push(createNode(start, 0, target));
    do {
        const node: VisitedNode = openNodes.pop()!;
        if (node.point.equals(target)) {
            finalNode = node;
            break;
        }

        const neighbours = area.neighbours(node.point, Direction.straights());
        visited[node.point.x][node.point.y] = true;
        for (let name in neighbours) {
            const tile = neighbours[name];
            const direction = Direction.forName(name);
            const successorPoint = node.point.translate(direction);
            if (isWalkable(tile) && !visited[successorPoint.x][successorPoint.y]) {
                const successorIndex: number = openNodes.findIndex(n => n.point.equals(successorPoint));
                const successorNode = createNode(successorPoint, node.cost + 1, target, node, direction);
                if (successorIndex === -1) {
                    openNodes.push(successorNode);
                } else if (node.cost + 1 < openNodes[successorIndex].cost) {
                    openNodes[successorIndex] = successorNode;
                }
            }
        }

        openNodes.sort(compareNodes);
    } while(openNodes.length > 0);

    return finalNode === undefined ? undefined : buildPath(finalNode);
}

function createNode(point: Vector, cost: number, target: Vector, predecessor?: VisitedNode, direction?: Direction): VisitedNode {
    return {
        point: point,
        cost: cost,
        distance: point.distance(target),
        predecessor: predecessor,
        direction: direction
    }
}

function compareNodes(node1: VisitedNode, node2: VisitedNode): number {
    const v1 = node1.cost + node1.distance;
    const v2 = node2.cost + node2.distance;
    return (v1 - v2) * -1;
}

function buildPath(node: VisitedNode): Direction[] {
    const path: Direction[] = []
    let currentNode: VisitedNode = node;
    while (currentNode.predecessor !== undefined) {
        if (currentNode.direction === undefined) {
            throw new Error("Node in path does not have a direction")
        }
        path.push(currentNode.direction);
        currentNode = currentNode.predecessor;
    }
    return path;
}

interface VisitedNode {
    readonly point: Vector;
    readonly cost: number;
    readonly distance: number;
    readonly predecessor?: VisitedNode;
    readonly direction?: Direction;
}