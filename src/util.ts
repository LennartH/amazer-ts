export function parseSize(size: string): [number, number] {
    let parts: string[] = size.split("x");
    return [Number(parts[0]), Number(parts[1])]
}