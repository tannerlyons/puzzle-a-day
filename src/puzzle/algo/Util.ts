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

export function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
  