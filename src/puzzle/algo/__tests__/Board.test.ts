import { Board, getLayout, SourceBoard } from "../Board";
import { allPieces } from "../Piece";

describe("Board", () => {
    describe("isSolved", () => {
        it("returns true when it is solved", () => {
            const data: SourceBoard = getLayout().map((r) => r.map(() => null));
            [
                { piece: "bucket", permutation: 3, coord: { row: 0, col: 0 } },
                { piece: "brick", permutation: 0, coord: { row: 0, col: 2 } },
                { piece: "snek", permutation: 0, coord: { row: 0, col: 4 } },
                { piece: "fork", permutation: 0, coord: { row: 1, col: 4 } },
                { piece: "hoe", permutation: 0, coord: { row: 3, col: 0 } },
                { piece: "cactus", permutation: 3, coord: { row: 3, col: 1 } },
                { piece: "elle", permutation: 0, coord: { row: 3, col: 4 } },
                { piece: "utah", permutation: 1, coord: { row: 5, col: 1 } },
            ].forEach(({ permutation, piece: pieceName, coord }) => {
                const piece = allPieces.filter((p) => p.name === pieceName)[0];
                data[coord.row][coord.col] = {
                    piece,
                    permutation: piece.permutations[permutation],
                };
            });
            const board = new Board("Jul", 11);
            board.__testSetBoard(data);

            expect(board.isSolved()).toBe(true);
        });

        it("returns false when it isn't solved", () => {
            const data: SourceBoard = getLayout().map((r) => r.map(() => null));
            [
                { piece: "bucket", permutation: 3, coord: { row: 0, col: 0 } },
                { piece: "brick", permutation: 0, coord: { row: 0, col: 2 } },
                { piece: "snek", permutation: 0, coord: { row: 0, col: 4 } },
                { piece: "fork", permutation: 0, coord: { row: 1, col: 4 } },
                { piece: "hoe", permutation: 0, coord: { row: 3, col: 0 } },
                { piece: "cactus", permutation: 3, coord: { row: 3, col: 1 } },
                // { piece: "elle", permutation: 0, coord: { row: 3, col: 4 } },
                { piece: "utah", permutation: 1, coord: { row: 5, col: 1 } },
            ].forEach(({ permutation, piece: pieceName, coord }) => {
                const piece = allPieces.filter((p) => p.name === pieceName)[0];
                data[coord.row][coord.col] = {
                    piece,
                    permutation: piece.permutations[permutation],
                };
            });
            const board = new Board("Jul", 11);
            board.__testSetBoard(data);

            expect(board.isSolved()).toBe(false);
        });
    });
});
