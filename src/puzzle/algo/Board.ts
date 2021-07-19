import { months, days, Month, Day } from "./Date";
import { Permutation, Piece } from "./Piece";

type Coord = { row: number; col: number };
type PieceAndPermutation = {
    piece: Piece;
    permutation: Permutation;
};
type SourceBoard = Array<PieceAndPermutation | null>[];
type HydtratedBoard = boolean[][];

export function getLayout() {
    return [
        months.slice(0, 6),
        months.slice(6),
        days.slice(0, 7),
        days.slice(7, 14),
        days.slice(14, 21),
        days.slice(21, 28),
        days.slice(28, 31),
    ];
}

const monthCache = new Map<string, Coord>();
(getLayout().slice(0, 2) as Month[][]).forEach((row, rowIdx) => {
    row.forEach((monthName, colIdx) => {
        monthCache.set(monthName, { col: colIdx, row: rowIdx });
    });
});

const dayCache = new Map<number, Coord>();
(getLayout().slice(2) as Day[][]).forEach((row, rowIdx) => {
    row.forEach((dayName, colIdx) => {
        dayCache.set(dayName, { col: colIdx, row: rowIdx });
    });
});

const getEmptyBoard = () => getLayout().map((row) => row.map(() => false));

type Placement = Month | Day;

const getCoord = (placement: Placement): Coord => {
    let coord = null;
    if (typeof placement === "string") {
        coord = monthCache.get(placement) || null;
    } else {
        coord = dayCache.get(placement) || null;
    }

    if (coord === null) {
        throw new Error(`Illegal placement request: "${placement}"`);
    }
    return coord;
};

export type AttemptResult =
    // Placement succeeded, Board mutated.
    | "success"
    // Placement failed, Board unchanged.
    | "collision"
    // TODO Placement failed, out of bounds.
    | "illegal";

export class Board {
    private readonly board: SourceBoard = getLayout().map((row) =>
        row.map(() => null)
    );

    private readonly targetMonth!: Coord;
    private readonly targetDay!: Coord;

    constructor(private month: Month, private day: Day) {
        this.targetMonth = monthCache.get(this.month)!;
        this.targetDay = dayCache.get(this.day)!;

        if (!this.targetMonth) {
            throw new Error(`Month "${this.month}" not found.`);
        }
        if (!this.targetDay) {
            throw new Error(`Day "${this.day}" not found.`);
        }
    }

    public attempt(
        placement: Placement,
        piece: Piece,
        permutation: Permutation
    ): AttemptResult {
        const { row, col } = getCoord(placement);
        if (!this.canPlace(row, col, permutation)) {
            return "collision";
        } else {
            this.board[row][col] = {
                piece,
                permutation,
            };
            return "success";
        }
    }

    public getHydrated(): HydtratedBoard {
        const hydrated = getEmptyBoard();

        for (let rowIdx = 0; rowIdx < hydrated.length; rowIdx++) {
            const row = hydrated[rowIdx];
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                const piece = this.board[rowIdx][colIdx];
                if (piece !== null) {
                    const { permutation } = piece;
                    for (
                        let permRowIdx = 0;
                        permRowIdx < permutation.length;
                        permRowIdx++
                    ) {
                        const permRow = permutation[permRowIdx];

                        for (
                            let permColIdx = 0;
                            permColIdx < permRow.length;
                            permColIdx++
                        ) {
                            const curBoardRowIdx = rowIdx + permRowIdx;
                            const curBoardColIdx = colIdx + permColIdx;
                            hydrated[curBoardRowIdx][curBoardColIdx] = true;
                        }
                    }
                }
            }
        }
        return hydrated;
    }

    public remove(placement: Placement): void {
        const { row, col } = getCoord(placement);
        if (this.board[row][col] === null) {
            console.error(`Row: ${row}, col: ${col}`);
            console.error(
                this.board
                    .map((row) =>
                        row.map((col) => (col ? col.piece.name : "X")).join(",")
                    )
                    .join("\n")
            );
            throw new Error(
                `Attempting to remove a piece from an empty tile. See above logs for debugging.`
            );
        }
        this.board[row][col] = null;
    }

    /**
     * @returns true if every square is filled except the target month and day.
     */
    public isSolved(): boolean {
        const hydrated = this.getHydrated();

        // Most common case - one of these is blocked.
        const targetMonthBlocked =
            hydrated[this.targetMonth.row][this.targetMonth.col] === true;
        const targetDayBlocked =
            hydrated[this.targetDay.row][this.targetDay.col] === true;

        if (targetMonthBlocked || targetDayBlocked) {
            return false;
        }

        // Otherwise we need to go looking through everything.
        for (let rowIdx = 0; rowIdx < hydrated.length; rowIdx++) {
            for (let colIdx = 0; colIdx < hydrated[rowIdx].length; colIdx++) {
                const occupied = hydrated[rowIdx][colIdx];
                if (!occupied) {
                    // Allow the target month and day to be uncovered.
                    const isTargetMonth =
                        this.targetMonth.col === colIdx &&
                        this.targetMonth.row === rowIdx;
                    const isTargetDay =
                        this.targetDay.col === colIdx &&
                        this.targetDay.row === rowIdx;
                    if (!isTargetMonth || !isTargetDay) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    public clone(): Board {
        const clone = new Board(this.month, this.day);
        this.board.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                if (cell) {
                    clone.board[rowIdx][colIdx] = cell;
                }
            });
        });
        return clone;
    }

    private canPlace(
        rowIdx: number,
        colIdx: number,
        piece: Permutation
    ): boolean {
        const hydrated = this.getHydrated();
        // Ensure the piece fits and won't overlap others.
        for (let permRowIdx = 0; permRowIdx < piece.length; permRowIdx++) {
            const permRow = piece[permRowIdx];

            for (
                let permColIdx = 0;
                permColIdx < permRow.length;
                permColIdx++
            ) {
                const pieceSlot = permRow[permColIdx];

                if (!pieceSlot) {
                    // This means the permutation has a blank here and it won't overlap.
                    continue;
                }

                const curBoardRowIdx = rowIdx + permRowIdx;
                const curBoardColIdx = colIdx + permColIdx;
                if (
                    !Array.isArray(hydrated[curBoardRowIdx]) ||
                    hydrated[curBoardRowIdx][curBoardColIdx] === undefined
                ) {
                    // This piece is going out of bounds.
                    return false;
                }

                if (hydrated[curBoardRowIdx][curBoardColIdx]) {
                    // Another piece has this spot.
                    return false;
                }
            }
        }

        // If all checks pass, this piece will fit.
        return true;
    }
}
