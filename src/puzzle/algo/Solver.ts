import { Board, getLayout } from "./Board";
import { Day, Month } from "./Date";
import { allPieces, Permutation, Piece } from "./Piece";
import { Queue } from "./Queue";
import { Stack } from "./Stack";

function solverHelper(
    board: Board,
    remainingPieces: Queue<Piece>,
    solutions: Board[]
) {
    if (board.isSolved()) {
        solutions.push(board.clone());
        return;
    }
    const layout = getLayout();
    for (let rowIdx = 0; rowIdx < layout.length; rowIdx++) {
        for (let colIdx = 0; colIdx < layout[rowIdx].length; colIdx++) {}
    }
}

export function solver(month: Month, day: Day) {
    const board = new Board(month, day);
    const queue = new Queue<Piece>();
    allPieces.forEach((piece) => queue.enqueue(piece));

    /*
    while the highest open cell in board exists
        if (solved) 
            push a solution onto the stack
        else 
            for each piece in queue  of remaining pieces
                dequeue piece off queue
                for each permutation of queue(piece.permutations)
                    pop permutation
                    for each coord in the permutation
                        attempt to place permutation
                        if legal:
                            recurse starting at next available cell with a copy of all the remaining pieces
                        else
                            remove permutation
                enqueue piece
    */
}
