#!/usr/bin/env node

import { program, InvalidArgumentError } from "commander";
import { generateImage } from "../generator/generateImage";
import { Day, days, Month, months } from "../puzzle/algo/Date";
import { getStats } from "./commands/getStats";

// For help within this file, see https://github.com/tj/commander.js
program
    .name("puzzle-a-day")
    // https://github.com/tj/commander.js#display-help-after-errors
    .allowExcessArguments(false)
    .showHelpAfterError()
    .parseOptions(process.argv);

program
    .command("generate")
    .description("generate an image for a month and day.")
    .argument(
        "<month>",
        `The 3-letter name for the month of the year: [${months.join(", ")}]`,
        parseMonth
    )
    .argument("<day>", "The day of the month, 1-31.", parseDay)
    .action(async (month, day) => {
        void generateImage(month, day, "N");
    });

program
    .command("stats")
    .description("print out stats about solutions")
    .argument("<sort>", "How to sort: 'solution-count'")
    .action(async (sort) => {
        await getStats({ sort });
    });

program.parseAsync().catch((e) => {
    throw e;
});

function parseMonth(month: unknown) {
    if (typeof month === "string" && !months.includes(month as Month)) {
        throw new InvalidArgumentError(
            `Allowed months: [${months.join(", ")}]`
        );
    }
    return month;
}

function parseDay(day: unknown) {
    if (typeof day === "string") {
        day = Number.parseInt(day, 10);
    }

    if (!days.includes(day as Day)) {
        throw new InvalidArgumentError(`Allowed days: [${days.join(", ")}]`);
    }

    return day;
}
