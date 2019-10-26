import { Direction } from "../../src/domain/common";


test("is horizontal", () => {
    expect(Direction.Left.isHorizontal()).toBeTruthy();
    expect(Direction.Right.isHorizontal()).toBeTruthy();

    expect(Direction.Up.isHorizontal()).toBeFalsy();
    expect(Direction.UpRight.isHorizontal()).toBeFalsy();
});

test("is vertical", () => {
    expect(Direction.Up.isVertical()).toBeTruthy();
    expect(Direction.Down.isVertical()).toBeTruthy();

    expect(Direction.Left.isVertical()).toBeFalsy();
    expect(Direction.UpRight.isVertical()).toBeFalsy();
});

test("is diagonal", () => {
    expect(Direction.UpRight.isDiagonal()).toBeTruthy();
    expect(Direction.UpLeft.isDiagonal()).toBeTruthy();
    expect(Direction.DownRight.isDiagonal()).toBeTruthy();
    expect(Direction.DownLeft.isDiagonal()).toBeTruthy();

    expect(Direction.Left.isDiagonal()).toBeFalsy();
    expect(Direction.Up.isDiagonal()).toBeFalsy();
});

test("opposite", () => {
    expect(Direction.Up.opposite()).toBe(Direction.Down);
    expect(Direction.UpRight.opposite()).toBe(Direction.DownLeft);
    expect(Direction.Right.opposite()).toBe(Direction.Left);
    expect(Direction.DownRight.opposite()).toBe(Direction.UpLeft);
    expect(Direction.Down.opposite()).toBe(Direction.Up);
    expect(Direction.DownLeft.opposite()).toBe(Direction.UpRight);
    expect(Direction.Left.opposite()).toBe(Direction.Right);
    expect(Direction.UpLeft.opposite()).toBe(Direction.DownRight);
});