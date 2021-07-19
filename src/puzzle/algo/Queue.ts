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
}
