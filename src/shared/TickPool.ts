import * as cfx from "cfx-shared";
import { Tick, onTick, clearTick } from "cfx-shared";

class Tickpool {
	handlers = new Map<number, () => void>();
	currentId: number;
	tick: Tick | undefined;
	private _destroyed: boolean = false;

	constructor() {
		this.currentId = 0;
	}

	public get destroyed() {
		return this._destroyed;
	}

	public add(handler: () => void): number {
		this.currentId++;
		this.handlers.set(this.currentId, handler);
		if (!this.tick) {
			this.tick = onTick(() => {
				this.handlers.forEach((handler) => {
					handler();
				});
			});
		}
		return this.currentId;
	}

	public remove(id: number) {
		const handler = this.handlers.get(id);
		if (!handler) return;
		this.handlers.delete(id);
		if (this.handlers.size > 0) return;
		this.pauseTick();
	}

	private pauseTick() {
		this.tick?.destroy();
		this.tick = undefined;
	}

	public destroy() {
		this.pauseTick();
		this._destroyed = true;
	}
}

export { Tickpool };
