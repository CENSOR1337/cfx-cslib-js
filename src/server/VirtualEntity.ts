import { Vector3, ServerEvent, ServerEventContext } from "@censor1337/cfx-api/server";
import { VirtualEntity as SharedVirtualEntity, VirtualEntityEvent } from "../shared/VirtualEntity";
import { CollisionSphere } from "./collision/CollisionSphere";
import { randomUUID } from "./utils/uuid";
import { Resource } from "./Resource";
import * as cfx from "@censor1337/cfx-api/server";

export class VirtualEntity extends SharedVirtualEntity {
    readonly id = randomUUID();
    readonly collision: CollisionSphere;
    readonly streamingPlayers = new Map<number, number>();
    readonly syncedMeta: Record<string, any>;

    constructor(veType: string, position: Vector3, streamingDistance: number, data?: Record<string, any>) {
        super(veType, position);
        const collision = new CollisionSphere(position, streamingDistance);
        collision.playersOnly = true;
        collision.onBeginOverlap(this.onEnterStreamingRange.bind(this));
        collision.onEndOverlap(this.onLeaveStreamingRange.bind(this));
        this.collision = collision;

        this.syncedMeta = data || {};
        ServerEvent.playerDropped(this.onPlayerDisconnected.bind(this));
    }

    public destroy() {
        this.collision.destroy();
        super.destroy();
    }

    public setSyncedMeta(key: string, value: any) {
        this.syncedMeta[key] = value;
        for (const [_entity, src] of this.streamingPlayers) {
            Resource.emitClient(`${VirtualEntityEvent.onSyncedMetaChange}:${this.id}`, src, this.id, key, value);
        }
    }

    private getSyncData(): Record<string, any> {
        return {
            id: this.id,
            pos: this.pos,
            syncedMeta: this.syncedMeta,
        };
    }

    private onEnterStreamingRange(entity: number) {
        const src = cfx.networkGetEntityOwner(entity);
        this.streamingPlayers.set(entity, src);
        const data = this.getSyncData();
        Resource.emitClient(`${VirtualEntityEvent.onStreamIn}:${this.veType}`, src, data);
    }

    private onLeaveStreamingRange(entity: number) {
        this.streamingPlayers.delete(entity);
        if (!cfx.doesEntityExist(entity)) return;
        const src = cfx.networkGetEntityOwner(entity);
        if (!cfx.doesPlayerExist(String(src))) return;
        const data = this.getSyncData();
        Resource.emitClient(`${VirtualEntityEvent.onStreamOut}:${this.id}`, src, data);
    }

    private onPlayerDisconnected({ source }: ServerEventContext.playerDropped) {
        if (!this.streamingPlayers.has(source)) return;
        this.streamingPlayers.delete(source);
    }
}
