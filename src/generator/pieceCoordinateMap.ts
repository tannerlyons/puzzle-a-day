import { PieceName } from "../puzzle/algo/Piece";

type CoordMap = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export const pieceCoordinateMap: Record<PieceName, CoordMap> = {
    brick: {
        left: 3,
        top: 4,
        width: 3,
        height: 2,
    },
    bucket: {
        left: 1,
        top: 4,
        width: 2,
        height: 3,
    },
    cactus: {
        left: 0,
        top: 3,
        width: 2,
        height: 4,
    },
    elle: {
        left: 0,
        top: 0,
        width: 3,
        height: 3,
    },
    fork: {
        left: 2,
        top: 0,
        width: 4,
        height: 2,
    },
    snek: {
        left: 3,
        top: 1,
        width: 3,
        height: 3,
    },
    hoe: {
        left: 5,
        top: 2,
        width: 2,
        height: 4,
    },
    utah: {
        left: 1,
        top: 1,
        width: 2,
        height: 3,
    },
};

export const getXPixel = (xCoord: number) => 300 * xCoord + 240;
export const getYPixel = (yCoord: number) => 300 * yCoord + 226;
