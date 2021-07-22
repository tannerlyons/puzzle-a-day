import { months, days, Month, Day } from "./Date";
import { Permutation, Piece } from "./Piece";
import { padRight } from "./Util";

export type Coord = { row: number; col: number };
type PieceAndPermutation = {
    piece: Piece;
    permutation: Permutation;
};
export type SourceBoard = Array<PieceAndPermutation | null>[];
type HydtratedBoard = boolean[][];

function coordsEq(coord1: Coord, coord2: Coord): boolean {
    return coord1.col === coord2.col && coord1.row === coord2.row;
}

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

const NUM_COORDS = getLayout().flatMap(() => 1).length;

const monthCache = new Map<string, Coord>();
(getLayout().slice(0, 2) as Month[][]).forEach((row, rowIdx) => {
    row.forEach((monthName, colIdx) => {
        monthCache.set(monthName, { col: colIdx, row: rowIdx });
    });
});

const dayCache = new Map<number, Coord>();
(getLayout().slice(2) as Day[][]).forEach((row, rowIdx) => {
    row.forEach((dayName, colIdx) => {
        // Add 2 to the rowIdx to account for the 1st 2 rows of months
        dayCache.set(dayName, { col: colIdx, row: rowIdx + 2 });
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
        { row, col }: Coord,
        piece: Piece,
        permutation: Permutation
    ): AttemptResult {
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
                    const permutationLayout = piece.permutation.layout;
                    for (
                        let permRowIdx = 0;
                        permRowIdx < permutationLayout.length;
                        permRowIdx++
                    ) {
                        const permRow = permutationLayout[permRowIdx];

                        for (
                            let permColIdx = 0;
                            permColIdx < permRow.length;
                            permColIdx++
                        ) {
                            // Some permutations have empty spaces in them that would overlap the edges.
                            // Ignore them.
                            if (permRow[permColIdx]) {
                                const curBoardRowIdx = rowIdx + permRowIdx;
                                const curBoardColIdx = colIdx + permColIdx;
                                hydrated[curBoardRowIdx][curBoardColIdx] = true;
                            }
                        }
                    }
                }
            }
        }
        return hydrated;
    }

    public remove({ row, col }: Coord): void {
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

        // If there are more than 2 open coords on the board, it's unsolved.
        const openCoords = hydrated
            .flatMap((row) => row)
            .filter((c) => !c).length;
        if (openCoords > 2) {
            return false;
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

    /**
     * @returns the highest coord or null if the board is solved.
     */
    public getHighestOpenCoord(): Coord | null {
        const hydrated = this.getHydrated();
        for (let rowIdx = 0; rowIdx < hydrated.length; rowIdx++) {
            for (let colIdx = 0; colIdx < hydrated[rowIdx].length; colIdx++) {
                if (!hydrated[rowIdx][colIdx]) {
                    const coord = { row: rowIdx, col: colIdx };
                    if (
                        !coordsEq(this.targetMonth, coord) &&
                        !coordsEq(this.targetDay, coord)
                    ) {
                        return coord;
                    }
                }
            }
        }
        return null;
    }

    public __testSetBoard(board: SourceBoard): void {
        (this.board as SourceBoard) = board;
    }

    public print(): string {
        let tableCount = 1;
        const table = this.board
            .map(
                (row) =>
                    "|" +
                    row.map((c) => (c === null ? "-" : tableCount++)).join("") +
                    "|"
            )
            .join("\n");

        const legend = (
            this.board.flatMap((row) =>
                row.filter((c) => c !== null)
            ) as PieceAndPermutation[]
        )
            .map(
                ({ piece, permutation }, i) =>
                    `  ${i + 1}: ${padRight(piece.name, 7)} - rot: ${padRight(
                        permutation.rotation + "",
                        3
                    )}, flip: ${permutation.flipped}`
            )
            .join("\n");

        const line = new Array(this.board[0].length + 2).fill("-").join("");
        return `${line}\n${table}\n${line}\n\n${legend}`;
    }

    private canPlace(
        rowIdx: number,
        colIdx: number,
        piece: Permutation
    ): boolean {
        const hydrated = this.getHydrated();
        // Ensure the piece fits and won't overlap others.
        for (
            let permRowIdx = 0;
            permRowIdx < piece.layout.length;
            permRowIdx++
        ) {
            const permRow = piece.layout[permRowIdx];

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
