export class Queue<E> {
    private readonly queue: E[] = [];

    public enqueue(e: E): void {
        this.queue.push(e);
    }

    public dequeue(): E | null {
        return this.queue.shift() || null;
    }

    public size(): number {
        return this.queue.length;
    }

    [Symbol.iterator] = () => {
        return new QueueIterator(this.queue.slice());
    };
}

class QueueIterator<E> {
    private currentIdx: number;

    constructor(private readonly items: E[]) {
        this.currentIdx = 0;
    }

    public next = () => {
        return {
            done: this.currentIdx >= this.items.length,
            value: this.items[this.currentIdx++],
        };
    };
}
