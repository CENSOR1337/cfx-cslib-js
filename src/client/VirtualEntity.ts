import { Vector3, Event } from "@censor1337/cfx-api/client";
import { Resource } from "./Resource";
import { VirtualEntity as SharedVirtualEntity } from "../shared/VirtualEntity";
import { VirtualEntityEvent } from "../shared/VirtualEntity";

export abstract class VirtualEntity extends SharedVirtualEntity {
    public static readonly instances = new Map<string, VirtualEntity>();
    readonly id: string;
    readonly pos: Vector3;
    readonly syncedMeta: Record<string, any>;
    readonly events = new Array<Event>();

    protected constructor(veType: string, id: string, pos: Vector3, syncedMeta: Record<string, any>) {
        super(veType, pos);
        this.id = id;
        this.pos = new Vector3(pos.x, pos.y, pos.z);
        this.syncedMeta = syncedMeta;
        this.events.push(Resource.onServer(`${VirtualEntityEvent.onSyncedMetaChange}:${this.id}`, this.updateSyncedMeta.bind(this)));
        this.events.push(Resource.onServer(`${VirtualEntityEvent.onStreamOut}:${this.id}`, this.destroy.bind(this)));
        VirtualEntity.instances.set(this.id, this);
        Resource.onResourceStop(this.destroy.bind(this));
        this.onStreamIn();
    }

    public getSyncedMeta(key: string): any {
        return this.syncedMeta[key];
    }

    private updateSyncedMeta(id: string, key: string, value: any): void {
        if (id !== this.id) return;
        this.syncedMeta[key] = value;
        this.onSyncedMetaChange(key, value);
    }

    public destroy() {
        this.events.forEach((event) => event.destroy());
        VirtualEntity.instances.delete(this.id);
        super.destroy();
        this.onStreamOut();
    }

    public static get(obj: any): VirtualEntity | undefined {
        const id = typeof obj === "string" ? obj : obj.id;
        if (!id) return undefined;
        return VirtualEntity.instances.get(id);
    }

    public static initialize(veType: string, classObject: any) {
        Resource.onServer(`${VirtualEntityEvent.onStreamIn}:${veType}`, function (veObject: any) {
            const id = veObject.id;
            const pos = veObject.pos;
            const syncedMeta = veObject.syncedMeta;
            if (VirtualEntity.instances.get(id)) return;
            const instance = new classObject(veType, id, pos, syncedMeta);
            VirtualEntity.instances.set(id, instance);
        });
    }

    protected onSyncedMetaChange(_key: string, _value: any): void {}
    protected abstract onStreamIn(): void;
    protected abstract onStreamOut(): void;
}
