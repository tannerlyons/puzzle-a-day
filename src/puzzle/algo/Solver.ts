import { shuffle } from "lodash";
import { Board, Coord, getLayout } from "./Board";
import { Day, Month } from "./Date";
import { allPieces, Permutation, Piece } from "./Piece";
import { getPlacementCoords } from "./Util";

function solverHelper(
    board: Board,
    remainingPieces: Piece[],
    solutions: Board[],
    maxSolutions: number
) {
    if (board.isSolved()) {
        solutions.push(board.clone());
        return;
    }
    const layout = getLayout();
    // Find highest open space that's not one of the target cells.
    let highest = board.getHighestOpenCoord();

    if (highest === null) {
        throw new Error(
            "Illegal case - highest coord not found when puzzle is not solved"
        );
    }

    for (const currentPiece of remainingPieces) {
        for (const permutation of currentPiece.permutations) {
            for (const placementCoord of getPlacementCoords(
                permutation,
                highest
            )) {
                const result = board.attempt(
                    placementCoord,
                    currentPiece,
                    permutation
                );
                if (result === "success") {
                    // move on with the remaining pieces
                    const restPieces = remainingPieces.filter(
                        (p) => p !== currentPiece
                    );
                    solverHelper(board, restPieces, solutions, maxSolutions);
                    board.remove(placementCoord);
                    if (solutions.length >= maxSolutions) {
                        return;
                    }
                }
            }
        }
    }
}

export function solver(
    month: Month,
    day: Day,
    maxSolutions = Number.MAX_SAFE_INTEGER
): Board[] {
    const board = new Board(month, day);
    const solutions: Board[] = [];
    solverHelper(board, shuffle(allPieces.slice()), solutions, maxSolutions);
    return solutions;
}
