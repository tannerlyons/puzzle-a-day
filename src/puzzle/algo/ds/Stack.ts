export class Stack<E> {
    private stack: E[] = [];

    public push(e: E): void {
        this.stack.push(e);
    }

    public pop(): E {
        if (!this.stack.length) {
            throw new Error("Stack is empty");
        }
        return this.stack.pop()!;
    }

    public size(): number {
        return this.stack.length;
    }
}
