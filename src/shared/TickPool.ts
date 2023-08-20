import * as cfx from "cfx-shared";
import { Tick, onTick, clearTick } from "cfx-shared";

class Tickpool {
	handlers = new Map<number, () => void>();
	currentId: number;
	tick: Tick | undefined;

	constructor() {
		this.currentId = 0;
	}

	add(handler: () => void): number {
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

	remove(id: number) {
		const handler = this.handlers.get(id);
		if (!handler) return;
		this.handlers.delete(id);
		if (this.handlers.size > 0) return;
		this.destroy();
	}

	destroy() {
		this.tick?.destroy();
	}
}

export { Tickpool };
