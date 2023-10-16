import { WordObject } from "../WordObject";
import { Vector3 } from "@censor1337/cfx-api/shared";
import { Dispatcher } from "../utils/Dispatcher";
import { Shape } from "../Shape";
import { Timer, setTimeout, setInterval, clearInterval, everyTick, clearTick } from "@censor1337/cfx-api/shared";
import { isServer } from "@censor1337/cfx-api/shared";

export interface ICollisionDispatcher {
	validateEntities: Dispatcher<[Array<number>]>;
	processEntity: Dispatcher<[number, number, Vector3, string]>;
}

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
	private interval: Timer | undefined;
	public readonly isRelevantOnly: boolean;
	private readonly dispatcherIds: { validateEntities: number; processEntity: number } | undefined;
	private readonly dispatchers: ICollisionDispatcher;

	protected constructor(id: string, shape: Shape, relevantOnly: boolean, dispatchers: ICollisionDispatcher) {
		super(shape.pos);
		this.shape = shape;
		this.id = id;
		this.isRelevantOnly = relevantOnly;
		this.dispatchers = dispatchers;

		if (this.isRelevantOnly) {
			const delayMs = isServer ? 500 : 250;
			this.interval = setInterval(() => {
				const entities = this.getRelevantEntities();
				this.validateEntities(entities.map((entity) => entity.entity));
				for (const entity of entities) {
					this.processEntity(entity.dimension, entity.entity, entity.pos);
				}
			}, delayMs);
		} else {
			const onValidateEntities = dispatchers.validateEntities.add(this.validateEntities.bind(this));
			const onProcessEntity = dispatchers.processEntity.add((dimension: number, entity: number, pos: Vector3, type: string) => {
				if (this.playersOnly && type != "player") return;
				this.processEntity(dimension, entity, pos);
			});
			this.dispatcherIds = { validateEntities: onValidateEntities, processEntity: onProcessEntity };
		}

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
		this.destroyed = true;

		// clear dispatcher listeners
		if (this.dispatcherIds) {
			this.dispatchers.validateEntities.remove(this.dispatcherIds.validateEntities);
			this.dispatchers.processEntity.remove(this.dispatcherIds.processEntity);
		}

		// Clear interval if it exists
		if (this.interval) {
			clearInterval(this.interval);
		}

		// Clear all listeners and entities
		for (const handle of this.collidingEntities) {
			this.listeners.exit.broadcast(handle);
		}
		this.collidingEntities.clear();

		// Remove instance from all
		const index = Collision.all.indexOf(this);
		if (index >= 0) {
			Collision.all.splice(index, 1);
		}
	}

	protected validateEntities(entities: Array<number>) {
		for (const entity of this.collidingEntities) {
			if (entities.includes(entity)) continue;
			this.collidingEntities.delete(entity);
			this.listeners.exit.broadcast(entity);
		}
	}

	protected processEntity(dimension: number, entity: number, pos: Vector3) {
		if (this.destroyed) return;

		const isSameDimension = this.dimension === dimension;
		const isInside = this.shape.isPointIn(pos);

		if (isInside && isSameDimension) {
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

	protected abstract getRelevantEntities(): Array<{ dimension: number; entity: number; pos: Vector3 }>;
}
