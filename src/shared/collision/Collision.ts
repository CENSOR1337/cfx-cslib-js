import { WordObject } from "../WordObject";
import { Vector3 } from "@censor1337/cfx-api/shared";
import { Dispatcher } from "../utils/Dispatcher";
import { Shape } from "../Shape";
import { Timer, setTimeout, setInterval, clearInterval, everyTick, clearTick } from "@censor1337/cfx-api/shared";
import { isServer } from "@censor1337/cfx-api/shared";

interface listenerType {
	id: number | undefined;
	type: "enter" | "exit" | "overlapping";
}

export abstract class Collision extends WordObject {
	public static readonly all = new Array<Collision>();
	public playersOnly: boolean = false;
	public readonly id: string;
	private collidingEntities: Set<number> = new Set();
	private destroyed: boolean = false;
	private listeners = {
		enter: new Dispatcher(),
		exit: new Dispatcher(),
		overlapping: new Dispatcher(),
	};
	protected readonly shape: Shape;
	private overlapTick: Timer | undefined;

	protected constructor(id: string, shape: Shape) {
		super(shape.pos);
		this.shape = shape;
		this.id = id;
		Collision.all.push(this);
	}

	public onBeginOverlap(callback: (entity: number) => void): listenerType {
		const id = this.listeners.enter.add(callback);
		return { id: id, type: "enter" };
	}

	public onOverlapping(callback: (entity: number) => void): listenerType {
		const id = this.listeners.overlapping.add(callback);

		// start tick if not already started
		if (!this.overlapTick) {
			this.overlapTick = everyTick(() => {
				for (const handle of this.collidingEntities) {
					this.listeners.overlapping.broadcast(handle);
				}
			});
		}

		return { id: id, type: "overlapping" };
	}

	public onEndOverlap(callback: (entity: number) => void): listenerType {
		const id = this.listeners.exit.add(callback);
		return { id: id, type: "exit" };
	}

	public off(listener: listenerType) {
		const dispatcher = this.listeners[listener.type];
		if (!dispatcher) return;
		if (listener.id === undefined) return;
		dispatcher.remove(listener.id);

		// clear tick if no more overlapping listeners
		if (listener.type !== "overlapping") return;
		if (this.listeners.overlapping.size > 0) return;
		if (!this.overlapTick) return;
		clearTick(this.overlapTick);
	}

	public destroy() {
		// Clear all listeners and entities
		for (const handle of this.collidingEntities) {
			this.listeners.exit.broadcast(handle);
		}
		this.collidingEntities.clear();

		this.destroyed = true;
		const index = Collision.all.indexOf(this);
		if (index < 0) return;
		Collision.all.splice(index, 1);
	}

	protected processEntity(dimension: number, entity: number, pos: Vector3) {
		if (this.destroyed) return;

		const isSameDimension = this.dimension === dimension;
		const isInside = this.isPointIn(pos) && isSameDimension;

		if (isInside) {
			if (!this.collidingEntities.has(entity)) {
				this.collidingEntities.add(entity);
				this.listeners.enter.broadcast(entity);
			}
		} else {
			if (this.collidingEntities.has(entity)) {
				this.collidingEntities.delete(entity);
				this.listeners.exit.broadcast(entity);
			}
		}
	}

	public isPointIn(pos: Vector3): boolean {
		return this.shape.isPointIn(pos);
	}
}
