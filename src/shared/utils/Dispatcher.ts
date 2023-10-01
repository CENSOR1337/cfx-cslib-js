class Dispatcher {
	private listenerId = 0;
	private listeners: Map<number, (...args: any[]) => void> = new Map();
	private _destroyed = false;

	public add(listener: (...args: any[]) => void): number | undefined {
		if (this._destroyed) return undefined;
		this.listenerId++;
		this.listeners.set(this.listenerId, listener);
		return this.listenerId;
	}

	public get size() {
        return this.listeners.size;
    }

	public remove(id: number) {
		if (this._destroyed) return;
		this.listeners.delete(id);
	}

	public broadcast(...args: any[]) {
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
