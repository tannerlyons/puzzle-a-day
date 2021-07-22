import { Board } from "../Board";
import { solver } from "../Solver";

describe("Solver", () => {
    it("Can solve for Jul 11", () => {
        const solutions = solver("Jul", 11);

        console.log(`Found ${solutions.length} solutions:`);
        solutions.forEach((solution, i) => {
            console.log(solution.print());
        });
    });
});
