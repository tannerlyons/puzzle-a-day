type Permutation = boolean[][];

const parseLayout = (layout: string[]): Permutation[] => {
    function parse(layout: string[]): Permutation {
        return layout.map((line) => line.split("").map((char) => char === "X"));
    }

    function rotate(
        parsedLayout: Permutation,
        rotateCount: 1 | 2 | 3
    ): Permutation {
        let prev = parsedLayout;
        let rotated = parsedLayout;

        for (let numRotations = 0; numRotations < rotateCount; numRotations++) {
            const oldDimensions = {
                x: prev[0].length,
                y: prev.length,
            };

            rotated = new Array(oldDimensions.x)
                .fill(1)
                .map((i) => new Array(oldDimensions.y).fill(1));

            for (let oldRowIdx = 0; oldRowIdx < oldDimensions.y; oldRowIdx++) {
                for (
                    let oldColIdx = 0;
                    oldColIdx < oldDimensions.x;
                    oldColIdx++
                ) {
                    const newYIdx = oldColIdx;
                    const newXIdx = oldDimensions.y - 1 - oldRowIdx;
                    rotated[newYIdx][newXIdx] = prev[oldRowIdx][oldColIdx];
                }
            }

            prev = rotated;
        }
        return rotated;
    }

    function validate(layout: string[]): void {
        const firstLen = layout[0].length;
        for (let i = 1; i < layout.length; i++) {
            const line = layout[i];
            if (firstLen !== line.length) {
                throw new Error("Invalid layout: " + layout.join(","));
            }
        }
    }

    function removeDuplicates(perms: Permutation[]): Permutation[] {
        function hash(perm: Permutation) {
            return perm
                .map((line) => line.map((c) => (c ? "X" : " ")).join(","))
                .join("n");
        }
        const hashes = perms.map(hash);
        const seen = new Set<string>();
        const ret: Permutation[] = [];
        perms.forEach((perm, idx) => {
            if (!seen.has(hashes[idx])) {
                seen.add(hashes[idx]);
                ret.push(perm);
            }
        });
        return ret;
    }

    function flip(permutation: Permutation) {
        return permutation.map((line) => line.slice().reverse());
    }

    validate(layout);
    const parsed = parse(layout);
    const permutations: Permutation[] = [
        parsed,
        rotate(parsed, 1),
        rotate(parsed, 2),
        rotate(parsed, 3),
        flip(parsed),
        flip(rotate(parsed, 1)),
        flip(rotate(parsed, 2)),
        flip(rotate(parsed, 3)),
    ];

    return removeDuplicates(permutations);
};

export class Piece {
    private permutations: Permutation[];

    constructor(public readonly name: string, layout: string[]) {
        this.permutations = parseLayout(layout);
    }

    public debug(): string {
        return (
            this.name +
            ":\n" +
            "-------------\n" +
            this.permutations
                .map(
                    (perm, idx) =>
                        `${1 + idx}. ` +
                        perm
                            .map(
                                (line, lineIdx) =>
                                    `${lineIdx === 0 ? "" : "   "}|` +
                                    line
                                        .map((ch) => (ch ? "X" : " "))
                                        .join("") +
                                    "|"
                            )
                            .join("\n")
                )
                .join("\n\n")
        );
    }
}

export const allPieces = [
    /**
     * bucket
     *
     * X X
     * XXX
     *
     */
    new Piece("bucket", ["X X", "XXX"]),

    /**
     * brick
     *
     * XX
     * XX
     * XX
     *
     */
    new Piece("brick", ["XX", "XX", "XX"]),

    /**
     * snek
     *
     * XX
     *  X
     *  XX
     *
     */
    new Piece("snek", ["XX ", " X ", " XX"]),

    /**
     * fork
     *
     * X
     * X
     * XX
     *  X
     *
     */
    new Piece("fork", ["X ", "X ", "XX", " X"]),

    /**
     * elle
     *
     *   X
     *   X
     * XXX
     *
     */
    new Piece("elle", ["  X", "  X", "XXX"]),

    /**
     * cactus
     *
     * X
     * XX
     * X
     * X
     *
     */
    new Piece("cactus", ["X ", "XX", "X ", "X "]),

    /**
     * utah
     *
     * X
     * XX
     * XX
     *
     */
    new Piece("utah", ["X ", "XX", "XX"]),

    /**
     * hoe
     *
     * XX
     * X
     * X
     * X
     *
     */
    new Piece("hoe", ["XX", "X ", "X ", "X "]),
];
