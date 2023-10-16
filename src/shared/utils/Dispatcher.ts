class Dispatcher<Args extends any[]> {
    private listenerId = 0;
    private listeners: Map<number, (...args: Args) => void> = new Map();
    private _destroyed = false;

    public add(listener: (...args: Args) => void): number {
        this.listenerId++;
        if (!this._destroyed) {
            this.listeners.set(this.listenerId, listener);
        }
        return this.listenerId;
    }

    public get size() {
        return this.listeners.size;
    }

    public remove(id: number) {
        if (this._destroyed) return;
        this.listeners.delete(id);
    }

    public broadcast(...args: Args) {
        if (this._destroyed) return;
        this.listeners.forEach((listener) => {
            listener(...args);
        });
    }

    public clear() {
        this.listeners.clear();
    }

    public destroy() {
        this._destroyed = true;
        this.clear();
    }

    public get destroyed() {
        return this._destroyed;
    }
}

export { Dispatcher };
