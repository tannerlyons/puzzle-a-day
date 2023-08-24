import { formatDuration, intervalToDuration } from "date-fns";
import _ from "lodash";
import { Day, days, monthDayCounts, months } from "../../puzzle/algo/Date";
import { solver } from "../../puzzle/algo/Solver";

interface GetStatsOptions {
    sort: "solution-count";
    direction?: "asc" | "desc";
}

/*
1st run:

Solution stats:
  - avg solutions: 72.29234972677595 per day.
  - max solutions: 253 solutions for Jan-25
  - min solutions: 7 solution(s) for Oct-6

Done in 18683.29s.
*/

export function getStats({ sort, direction = "desc" }: GetStatsOptions) {
    const allDates = months.flatMap((month) =>
        _.range(monthDayCounts[month]).map((day) => ({
            month,
            day: (day + 1) as Day,
        }))
    );

    const dateSolutions = allDates.map(function ({ month, day }) {
        const startTime = new Date();
        console.log(`solving for ${month}-${day}`);
        const solutions = solver(month, day);
        const endTime = new Date();
        const formattedDuration = formatDuration(
            intervalToDuration({ end: endTime, start: startTime })
        );
        console.log(`done in ${formattedDuration}`);

        return {
            month,
            day,
            count: solutions.length,
        };
    });

    dateSolutions.sort((left, right) => left.count - right.count);

    const averageSolutions =
        dateSolutions.reduce((agg, { count }) => agg + count, 0) /
        dateSolutions.length;

    const minSolutions = _.first(dateSolutions)!.count;
    const maxSolutions = _.last(dateSolutions)!.count;

    const allMins = _.takeWhile(
        dateSolutions,
        ({ count }) => count === minSolutions
    );
    const allMaxes = _.takeRightWhile(
        dateSolutions,
        ({ count }) => count === maxSolutions
    );

    console.log(
        // prettier-ignore
        `
Solution stats:
  - avg solutions: ${averageSolutions} per day.
  - max solutions: ${maxSolutions} solutions for ${allMaxes.map(({month, day}) => `${month}-${day}`).join(',')}
  - min solutions: ${minSolutions} solution(s) for ${allMins.map(({month, day}) => `${month}-${day}`).join(',')}
`
    );
}
