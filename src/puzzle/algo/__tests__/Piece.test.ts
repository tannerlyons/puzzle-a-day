import { allPieces } from "../Piece";

describe("Piece", () => {
    it("creates all combinations", () => {
        for (const piece of allPieces) {
            expect(piece.debug()).toMatchSnapshot(piece.name);
        }
    });
});
