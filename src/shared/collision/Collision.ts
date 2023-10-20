import { WordObject } from "../WordObject";
import { Vector3 } from "@censor1337/cfx-api/shared";
import { Dispatcher } from "../utils/Dispatcher";
import { Shape } from "../Shape";
import { Timer, setInterval, clearInterval, everyTick, clearTick } from "@censor1337/cfx-api/shared";
import { isServer } from "@censor1337/cfx-api/shared";

export interface ICollisionEntity {
    handle: number;
    pos: Vector3;
    dimension: number;
    type?: string;
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
    private readonly dispatcher: Dispatcher<[Map<number, ICollisionEntity>]>;
    private readonly dispatcherListenerId: number | undefined;

    protected constructor(id: string, shape: Shape, relevantOnly: boolean, dispatcher: Dispatcher<[Map<number, ICollisionEntity>]>) {
        super(shape.pos);
        this.shape = shape;
        this.id = id;
        this.isRelevantOnly = relevantOnly;
        this.dispatcher = dispatcher;

        if (this.isRelevantOnly) {
            const delayMs = isServer ? 500 : 250;
            this.interval = setInterval(() => {
                const entities = this.getRelevantEntities();
                const entitiesMap = new Map<number, ICollisionEntity>();
                for (const entity of entities) {
                    entitiesMap.set(entity.entity, {
                        handle: entity.entity,
                        pos: entity.pos,
                        dimension: entity.dimension,
                    });
                }
                this.processEntities(entitiesMap);
            }, delayMs);
        } else {
            const onValidateEntities = dispatcher.add(this.processEntities.bind(this));
            this.dispatcherListenerId = onValidateEntities;
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
        if (this.dispatcherListenerId) this.dispatcher.remove(this.dispatcherListenerId);

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

    private processEntities(entities: Map<number, ICollisionEntity>) {
        if (this.destroyed) return;

        // Remove entities that are no longer relevant
        for (const entityHandle of this.collidingEntities) {
            if (entities.has(entityHandle)) continue;
            this.collidingEntities.delete(entityHandle);
            this.listeners.exit.broadcast(entityHandle);
        }

        // Add entities that are now relevant
        for (const [entityHandle, entity] of entities) {
            if (!this.isRelevantOnly && this.playersOnly && entity.type !== "player") continue;
            const handle = entityHandle;
            const isSameDimension = this.dimension === entity.dimension;
            const isInside = this.shape.isPointIn(entity.pos);

            if (isInside && isSameDimension) {
                if (!this.collidingEntities.has(handle)) {
                    this.collidingEntities.add(handle);
                    this.listeners.enter.broadcast(handle);
                }
            } else {
                if (this.collidingEntities.has(handle)) {
                    this.collidingEntities.delete(handle);
                    this.listeners.exit.broadcast(handle);
                }
            }
        }
    }

    protected abstract getRelevantEntities(): Array<{ dimension: number; entity: number; pos: Vector3 }>;
}
