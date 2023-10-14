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
	private interval: Timer;
	private insideEntities: Set<number> = new Set();
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
		this.interval = setInterval(this.onTick.bind(this), isServer ? 500 : 250);
		setTimeout(this.onTick.bind(this));
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
				for (const handle of this.insideEntities) {
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
		this.destroyed = true;
		this.onTick();
		const index = Collision.all.indexOf(this);
		if (index < 0) return;
		Collision.all.splice(index, 1);
	}

	private onTick() {
		if (this.destroyed) {
			clearInterval(this.interval);
			for (const handle of this.insideEntities) {
				this.listeners.exit.broadcast(handle);
			}
			this.insideEntities.clear();
			return;
		}

		const entities = this.getRevelantEntities();

		for (const handle of this.insideEntities) {
			let isPendingDelete = false;
			const isRelevant = entities.includes(handle);
			isPendingDelete = !isRelevant;

			if (!isPendingDelete) {
				const isInside = this.isEntityIn(handle);
				isPendingDelete = !isInside;
			}

			if (isPendingDelete) {
				this.insideEntities.delete(handle);
				this.listeners.exit.broadcast(handle);
			}
		}

		for (const handle of entities) {
			if (this.insideEntities.has(handle)) continue;
			this.insideEntities.add(handle);
			this.listeners.enter.broadcast(handle);
		}
	}

	public isPointIn(pos: Vector3): boolean {
		return this.shape.isPointIn(pos);
	}

	public abstract isEntityIn(entity: number): boolean;
	protected abstract getRevelantEntities(): number[];
}
