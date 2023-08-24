import { padLeft, padRight } from "./Util";

export type PieceName =
    | "bucket"
    | "brick"
    | "snek"
    | "fork"
    | "elle"
    | "cactus"
    | "utah"
    | "hoe";

export type Rotation = 0 | 90 | 180 | 270;
export type Permutation = {
    rotation: Rotation;
    layout: boolean[][];
    flipped: boolean;
};

const parseLayout = (layout: string[]): Permutation[] => {
    function parse(layout: string[]): Permutation {
        return {
            flipped: false,
            layout: layout.map((line) =>
                line.split("").map((char) => char === "X")
            ),
            rotation: 0,
        };
    }

    function rotate(
        parsedLayout: Permutation,
        rotateCount: 1 | 2 | 3
    ): Permutation {
        let prev: Permutation["layout"] = parsedLayout.layout;
        let rotated: Permutation["layout"] = parsedLayout.layout;

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
        return {
            ...parsedLayout,
            layout: rotated,
            rotation: (90 * rotateCount) as Rotation,
        };
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
            return perm.layout
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

    function flip(permutation: Permutation): Permutation {
        return {
            ...permutation,
            flipped: !permutation.flipped,
            layout: permutation.layout.map((line) => line.slice().reverse()),
        };
    }

    validate(layout);
    const parsed = parse(layout);
    const permutations: Permutation[] = [
        parsed,
        rotate(parsed, 1),
        rotate(parsed, 2),
        rotate(parsed, 3),
        flip(parsed),
        rotate(flip(parsed), 1),
        rotate(flip(parsed), 2),
        rotate(flip(parsed), 3),
    ];

    return removeDuplicates(permutations);
};

export class Piece {
    public readonly permutations: Permutation[];

    constructor(public readonly name: PieceName, layout: string[]) {
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
                        `${1 + idx}: rot: ${padLeft(
                            "" + perm.rotation,
                            3
                        )}, flip: ${perm.flipped}\n` +
                        perm.layout
                            .map(
                                (line) =>
                                    `   |` +
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
     * XX
     *  X
     * XX
     *
     */
    new Piece("bucket", ["XX", " X", "XX"]),

    /**
     * brick
     *
     * XXX
     * XXX
     *
     */
    new Piece("brick", ["XXX", "XXX"]),

    /**
     * snek
     *
     *  XX
     *  X
     * XX
     *
     */
    new Piece("snek", [" XX", " X ", "XX "]),

    /**
     * fork
     *
     *  XXX 
     * XX
     *
     */
    new Piece("fork", [" XXX", "XX  "]),

    /**
     * elle
     *
     * XXX
     * X
     * X
     *
     */
    new Piece("elle", ["XXX", "X  ", "X  "]),

    /**
     * cactus
     *
     * X
     * X
     * XX
     * X
     *
     */
    new Piece("cactus", ["X ", "X ", "XX", "X "]),

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
     *  X
     *  X
     *  X
     *
     */
    new Piece("hoe" as const, ["XX", " X", " X", " X"]),
];
