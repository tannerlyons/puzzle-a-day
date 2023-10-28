import sharp, { Color, OverlayOptions, Sharp } from "sharp";
import { join } from "path";
import { Day, Month } from "../puzzle/algo/Date";
import { solver } from "../puzzle/algo/Solver";
import { getXPixel, getYPixel, pieceCoordinateMap } from "./pieceCoordinateMap";
import _ from "lodash";
import { PieceName } from "../puzzle/algo/Piece";
import { getLayout, PlacementMap } from "../puzzle/algo/Board";

const GRID_SIZE = 300;
const SHADOW_OPACITY = 0.8; // 0 to 1
const PIECE_GAP = 2;

const DEBUG = false;

type NorthSouth = "N" | "S";
type EastWest = "E" | "W";
type Direction = NorthSouth | EastWest | `${NorthSouth}${EastWest}`;

export const generateImage = async (
    month: Month,
    day: Day,
    lighting: Direction
) => {
    const solutions = solver(month, day, 1);
    const solutionToUse =
        solutions[Math.floor(Math.random() * solutions.length)];
    console.log(`Using solution: \n${solutionToUse.print()}`);

    const blankCanvas = sharp({
        create: {
            background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0,
            },
            width: 2600,
            height: 2600,
            channels: 4,
        },
    }).png();

    const placements = solutionToUse.getPlacements();

    blankCanvas
        .composite([
            await getTiles(),
            ...(await getShadows(month, day)),
            ...(await getDirectionalTileShadows(month, day, lighting)),
            await getBorder(),
            ...(await getPieces(placements)),
            ...(DEBUG ? await getDebugPoints() : []),
        ])
        .normalize()
        .toFile(join(__dirname, "/output.png"));

    console.log("done!");
};

async function getTiles() {
    const img = await loadImg("source-board-tiles.png");
    return {
        input: await img.toBuffer(),
    };
}

async function getBorder() {
    const img = await loadImg("source-board-border.png");
    return {
        input: await img.toBuffer(),
    };
}

async function getDebugPoints() {
    const debugPoints = [];
    const LINE_WIDTH = 1;
    for (const rowIdx of _.range(8)) {
        // rows
        debugPoints.push({
            input: await sharp({
                create: {
                    background: {
                        r: 255,
                        g: 0,
                        b: 0,
                        alpha: 1,
                    },
                    width: 7 * GRID_SIZE,
                    height: LINE_WIDTH,
                    channels: 4,
                },
            })
                .png()
                .toBuffer(),
            top: getYPixel(rowIdx),
            left: getXPixel(0),
        });
    }
    for (const colIdx of _.range(8)) {
        // columns
        debugPoints.push({
            input: await sharp({
                create: {
                    background: {
                        r: 255,
                        g: 0,
                        b: 0,
                        alpha: 1,
                    },
                    width: LINE_WIDTH,
                    height: 7 * GRID_SIZE,
                    channels: 4,
                },
            })
                .png()
                .toBuffer(),
            top: getYPixel(0),
            left: getXPixel(colIdx),
        });
    }
    return debugPoints;
}

const createBox = async ({
    x,
    y,
    width,
    height,
    alpha = SHADOW_OPACITY,
}: {
    x: number;
    y: number;
    width: number;
    height: number;
    alpha?: number;
}) => {
    return {
        input: await sharp({
            create: {
                background: {
                    r: 0,
                    g: 0,
                    b: 0,
                    alpha,
                },
                width: width * GRID_SIZE,
                height: height * GRID_SIZE,
                channels: 4,
            },
        })
            .png()
            .toBuffer(),
        top: getYPixel(y),
        left: getXPixel(x),
    };
};

async function getShadows(month: Month, day: Day) {
    const shadowGridComposites: Promise<OverlayOptions>[] = [];

    // Months.
    getLayout()
        .slice(0, 2)
        .forEach((row, rowIndex) => {
            row.forEach((item, columnIndex) => {
                if (item !== month) {
                    shadowGridComposites.push(
                        createBox({
                            x: columnIndex,
                            y: rowIndex,
                            width: 1,
                            height: 1,
                        })
                    );
                }
            });
        });

    // Days
    getLayout()
        .slice(2)
        .forEach((row, rowIndex) => {
            row.forEach((item, columnIndex) => {
                if (item !== day) {
                    shadowGridComposites.push(
                        createBox({
                            x: columnIndex,
                            // Don't forget to add 2 to the rowIndex here, we sliced the months off
                            // the layout.
                            y: rowIndex + 2,
                            width: 1,
                            height: 1,
                        })
                    );
                }
            });
        });

    // A few extra shadows cause I was lazy in Gimp.
    // Top-right chunk.
    shadowGridComposites.push(
        createBox({
            x: 6,
            y: 0,
            width: 0.33,
            height: 2,
        })
    );
    // Right edge overlaps a bit
    shadowGridComposites.push(
        createBox({
            x: 7,
            y: 2,
            width: 0.1,
            height: 4,
        })
    );

    // Bottom right cutout shading.
    shadowGridComposites.push(
        createBox({
            x: 3,
            y: 6,
            width: 4,
            height: 0.1,
        })
    );

    return Promise.all(shadowGridComposites);
}

async function getDirectionalTileShadows(
    month: Month,
    day: Day,
    lighting: Direction
) {
    const coords = getCoords(month, day);
    const shadows: OverlayOptions[] = [];

    const createBox = async ({
        x,
        y,
        width,
        height,
    }: {
        x: number;
        y: number;
        width: number;
        height: number;
    }) => {
        return {
            input: await sharp({
                create: {
                    background: {
                        r: 0,
                        g: 0,
                        b: 0,
                        alpha: 0.2,
                    },
                    width: width * GRID_SIZE,
                    height: height * GRID_SIZE,
                    channels: 4,
                },
            })
                .png()
                .blur()
                .toBuffer(),
            top: getYPixel(y),
            left: getXPixel(x),
        };
    };

    for (const { x, y } of [coords.month, coords.day]) {
        const top = {
            x,
            y,
            width: 1,
            height: 0.1,
            alpha: 0.2,
        };

        const right = {
            x: x + 1,
            y,
            width: 1,
            height: 0.1,
            alpha: 0.2,
        };

        const bottom = {
            x,
            y,
            width: 1,
            height: 0.1,
            alpha: 0.2,
        };

        const left = {
            x,
            y,
            width: 1,
            height: 0.1,
            alpha: 0.2,
        };
        shadows.push(
            // await createBox(left),
            // await createBox(right),
            await createBox(top),
            // await createBox(bottom),
        );
    }

    return shadows;
}

const loadImg = async (fileName: string) =>
    sharp(join(__dirname, "..", "img", "extracted", fileName)).withMetadata();

const getPieces = async (placements: PlacementMap) => {
    const pieceNames = [
        "brick",
        "bucket",
        "cactus",
        "elle",
        "fork",
        "hoe",
        "snek",
        "utah",
    ] as const;

    const pairs: [PieceName, Sharp][] = [];

    // Load images and create pairs of [name, Sharp(image)].
    for (const name of pieceNames) {
        const img = await loadImg(`${name}-piece.png`);

        let newImg = img.resize({
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            width: pieceCoordinateMap[name].width * GRID_SIZE - PIECE_GAP,
            height: pieceCoordinateMap[name].height * GRID_SIZE - PIECE_GAP,
        });
        const modulation = getModulation(name);
        if (modulation) {
            newImg = newImg.modulate(modulation);
        }

        pairs.push([name, sharp(await newImg.toBuffer())]);
    }

    const finalPairs: OverlayOptions[] = [];
    for (const [name, img] of pairs) {
        // Rotate/flip the piece per the placement.
        const { flipped, rotation, x, y } = placements[name];
        const flippedPiece = await img
            .flop(flipped)
            // have to buffer this out and then rotate, otherwise the rotate happens
            // before the resize and things get the wrong dimensions.
            .toBuffer();
        const flippedAndRotatedPiece = sharp(flippedPiece).rotate(rotation);

        // Create a sharp composite argument object for each piece.
        finalPairs.push({
            input: await flippedAndRotatedPiece.toBuffer(),
            top: getYPixel(y) + Math.floor((y * PIECE_GAP) / 2),
            left: getXPixel(x) + Math.floor((x * PIECE_GAP) / 2),
        });
    }

    return finalPairs;
};

function getCoords(month: Month, day: Day) {
    const coords = {
        month: {
            x: 0,
            y: 0,
        },
        day: {
            x: 0,
            y: 0,
        },
    };
    getLayout().forEach((row, rowIndex) => {
        row.forEach((item, columnIndex) => {
            if (item === month) {
                coords.month.x = columnIndex;
                coords.month.y = rowIndex;
            }
            if (item === day) {
                coords.day.x = columnIndex;
                coords.day.y = rowIndex;
            }
        });
    });

    return coords;
}

function getModulation(pieceName: PieceName): Parameters<Sharp["modulate"]>[0] {
    switch (pieceName) {
        case "hoe":
            return { lightness: 5 };
        case "snek":
            return { lightness: 3 };
        case "fork":
            return { lightness: 3 };
        case "bucket":
            return { lightness: 1 };
        case "brick":
            return { lightness: 1 };
        default:
            return {};
    }
}
