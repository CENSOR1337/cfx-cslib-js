import { Vector3, Event } from "@censor1337/cfx-api/client";
import { Resource } from "./Resource";
import { VirtualEntity as SharedVirtualEntity } from "../shared/VirtualEntity";
import { Dispatcher } from "../shared/utils/Dispatcher";
import { VirtualEntityEvent } from "../shared/VirtualEntity";

export class VirtualEntity extends SharedVirtualEntity {
    public static readonly instances = new Map<string, VirtualEntity>();
    readonly id: string;
    readonly pos: Vector3;
    readonly syncedMeta: Record<string, any>;
    readonly events = new Array<Event>();
    private dispatchers = {
        onStreamIn: new Dispatcher(),
        onStreamOut: new Dispatcher(),
    };

    protected constructor(veType: string, id: string, pos: Vector3, syncedMeta: Record<string, any>) {
        super(veType, pos);
        this.id = id;
        this.pos = new Vector3(pos.x, pos.y, pos.z);
        this.syncedMeta = syncedMeta;
        this.events.push(Resource.onServer(this.event.onVirtualEntitySyncedMetaChange, this.updateSyncedMeta.bind(this)));
        if (id == "VE_TEMP_INSTANCE") return;
        VirtualEntity.instances.set(this.id, this);
        Resource.onResourceStop(this.destroy.bind(this));
        this.onStreamIn();
    }

    protected onStreamIn(): void {} // implement this in your class

    protected onStreamOut(): void {} // implement this in your class

    protected onSyncedMetaChange(_key: string, _value: any): void {} // implement this in your class

    public getSyncedMeta(key: string): any {
        return this.syncedMeta[key];
    }

    private updateSyncedMeta(id: string, key: string, value: any): void {
        if (id !== this.id) return;
        this.syncedMeta[key] = value;
        this.onSyncedMetaChange(key, value);
    }

    public destroy() {
        this.onStreamOut();
        this.events.forEach((event) => event.destroy());
        VirtualEntity.instances.delete(this.id);
    }

    public static get(obj: any): VirtualEntity | undefined {
        const id = typeof obj === "string" ? obj : obj.id;
        if (!id) return undefined;
        return VirtualEntity.instances.get(id);
    }

    public static initialize(veType: string, classObject: any) {
        Resource.onServer(`${VirtualEntityEvent.onVirtualEntityStreamIn}:${veType}`, function (veObject: any) {
            const id = veObject.id;
            const pos = veObject.pos;
            const syncedMeta = veObject.syncedMeta;
            if (VirtualEntity.instances.get(id)) return;
            const instance = new classObject(veType, id, pos, syncedMeta);
            VirtualEntity.instances.set(id, instance);
        });

        Resource.onServer(`${VirtualEntityEvent.onVirtualEntityStreamOut}:${veType}`, function (veObject: any) {
            const id = veObject.id;
            const instance = VirtualEntity.instances.get(id);
            if (!instance) return;
            instance.destroy();
        });
    }
}
