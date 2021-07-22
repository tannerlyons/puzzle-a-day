import { allPieces } from "../Piece";
import { getPlacementCoords } from "../Util";

describe("Util", () => {
    describe("getPlacementCoords", () => {
        it("generates coordinates for a 3x3 piece", () => {
            const snek = allPieces.filter((p) => p.name === "snek")[0];
            const placements = getPlacementCoords(snek.permutations[0], {
                col: 3,
                row: 4,
            });
            expect(placements).toEqual([
                {
                    col: 3,
                    row: 4,
                },
                {
                    col: 2,
                    row: 4,
                },
                {
                    col: 1,
                    row: 4,
                },
                {
                    col: 3,
                    row: 3,
                },
                {
                    col: 2,
                    row: 3,
                },
                {
                    col: 1,
                    row: 3,
                },
                {
                    col: 3,
                    row: 2,
                },
                {
                    col: 2,
                    row: 2,
                },
                {
                    col: 1,
                    row: 2,
                },
            ]);
        });

        it("generates coordinates for a 4x2 piece", () => {
            const snek = allPieces.filter((p) => p.name === "fork")[0];
            const placements = getPlacementCoords(snek.permutations[0], {
                col: 3,
                row: 4,
            });
            expect(placements).toEqual([
                {
                    col: 3,
                    row: 4,
                },
                {
                    col: 2,
                    row: 4,
                },
                {
                    col: 3,
                    row: 3,
                },
                {
                    col: 2,
                    row: 3,
                },
                {
                    col: 3,
                    row: 2,
                },
                {
                    col: 2,
                    row: 2,
                },
                {
                    col: 3,
                    row: 1,
                },
                {
                    col: 2,
                    row: 1,
                },
            ]);
        });

        it("won't generate out of bounds coordinates", () => {
            const snek = allPieces.filter((p) => p.name === "fork")[0];
            const placements = getPlacementCoords(snek.permutations[0], {
                col: 2,
                row: 2,
            });
            expect(placements).toEqual([
                {
                    col: 2,
                    row: 2,
                },
                {
                    col: 1,
                    row: 2,
                },
                {
                    col: 2,
                    row: 1,
                },
                {
                    col: 1,
                    row: 1,
                },
                {
                    col: 2,
                    row: 0,
                },
                {
                    col: 1,
                    row: 0,
                },
            ]);
        });
    });
});
