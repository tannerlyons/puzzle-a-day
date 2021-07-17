import { months, days, Month, Day } from "./Date";

function getLayout() {
    return [
        months.slice(0, 6),
        months.slice(6),
        days.slice(0, 7),
        days.slice(7, 14),
        days.slice(14, 21),
        days.slice(21, 28),
        days.slice(28, 31),
    ] as const;
}

type Placement = {
    m: Month;
    d: Day;
};

export class Board {
    private board = getLayout();

    constructor(private month: Month, private day: Day) {}

    public attempt(placement: Placement): boolean {}

    public remove(): void {}

    public isSolved(): boolean {}
}
