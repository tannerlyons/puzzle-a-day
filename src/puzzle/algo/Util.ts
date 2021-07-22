import { Coord } from "./Board";
import { Permutation } from "./Piece";

export function getPlacementCoords(
    permutation: Permutation,
    target: Coord
): Coord[] {
    return permutation.layout
        .flatMap((row, rowIdx) =>
            row.map((_, colIdx) => ({
                row: target.row - rowIdx,
                col: target.col - colIdx,
            }))
        )
        .filter((coord) => coord.row >= 0 && coord.col >= 0);
}

export function padRight(str: string, num: number, char = " "): string {
    const padding = num - str.length;
    return str + new Array(padding >= 0 ? padding : 0).fill(char).join("");
}

export function padLeft(str: string, num: number, char = " "): string {
    const padding = num - str.length;
    return new Array(padding >= 0 ? padding : 0).fill(char).join("") + str;
}
