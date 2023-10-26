import { Vector3, Event } from "@censor1337/cfx-api/client";
import { Resource } from "./Resource";
import { VirtualEntity as SharedVirtualEntity } from "../shared/VirtualEntity";
import { VirtualEntityEvent } from "../shared/VirtualEntity";

export class VirtualEntity extends SharedVirtualEntity {
    public static readonly instances = new Map<string, VirtualEntity>();
    readonly id: string;
    readonly pos: Vector3;
    readonly syncedMeta: Record<string, any> = {};

    constructor(id: string, pos: Vector3, syncedMeta: Record<string, any>) {
        super(pos);
        this.id = id;
        this.pos = pos;
        this.syncedMeta = syncedMeta;
    }

    public getSyncedMeta(key: string): any {
        return this.syncedMeta[key];
    }

    public destroy() {
        super.destroy();
    }

    public static initialize(veType: string, classObject: typeof VirtualEntity) {
        Resource.onServer(`${VirtualEntityEvent.onStreamIn}:${veType}`, function (veObject: any) {
            const id = veObject.id as string;
            const pos = new Vector3(veObject.pos.x, veObject.pos.y, veObject.pos.z);
            const syncedMeta = veObject.syncedMeta as Record<string, any>;

            // Check if instance already exists
            if (VirtualEntity.instances.get(id)) return;

            // Create new instance
            const instance = new classObject(id, pos, syncedMeta);

            // Array for event listeners
            const events = new Array<Event>();

            // Function for synced meta change event
            const syncMetaChanged = (key: string, value: any) => {
                instance.syncedMeta[key] = value;
                instance.onSyncedMetaChange(key, value);
            };

            // Function for destroy event
            const destroy = () => {
                for (const event of events) event.destroy();
                instance.destroy();
                VirtualEntity.instances.delete(id);
            };

            // Bind synced meta change event
            events.push(Resource.onServer(`${VirtualEntityEvent.onSyncedMetaChange}:${id}`, syncMetaChanged));
            // Bind stream out event
            events.push(Resource.onceServer(`${VirtualEntityEvent.onStreamOut}:${id}`, destroy));
            // Bind resource stop event
            events.push(Resource.onResourceStop(destroy));

            // Set instance
            VirtualEntity.instances.set(id, instance);
        });
    }

    protected onSyncedMetaChange(_key: string, _value: any): void {}
}
