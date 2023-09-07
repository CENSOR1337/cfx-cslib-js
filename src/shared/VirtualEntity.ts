import { Vector3 } from "cfx-shared";
import { WordObject } from "./WordObject";
import { appendInternalNamespace } from "./enum";

export const VirtualEntityEvent = {
	onVirtualEntityStreamIn: appendInternalNamespace("onVirtualEntityStreamIn"),
	onVirtualEntityStreamOut: appendInternalNamespace("onVirtualEntityStreamOut"),
	onVirtualEntitySyncedMetaChange: appendInternalNamespace("onVirtualEntitySyncedMetaChange"),
};

interface veEvent {
	onVirtualEntityStreamIn: string;
	onVirtualEntityStreamOut: string;
	onVirtualEntitySyncedMetaChange: string;
}

export class VirtualEntity extends WordObject {
	public static readonly type = "VIRTUAL_ENTITY";
	public readonly type = "VIRTUAL_ENTITY";
	protected readonly veType: string;
	public readonly event: veEvent;

	constructor(veType: string, pos: Vector3, dimension?: number) {
		super(pos, dimension);
		if (!veType) throw new Error("VirtualEntity must have a virtualEntityType");
        this.veType = veType;
		this.event = {
			onVirtualEntityStreamIn: `${VirtualEntityEvent.onVirtualEntityStreamIn}:${this.veType}`,
			onVirtualEntityStreamOut: `${VirtualEntityEvent.onVirtualEntityStreamOut}:${this.veType}`,
			onVirtualEntitySyncedMetaChange: `${VirtualEntityEvent.onVirtualEntitySyncedMetaChange}:${this.veType}`,
		};
	}
}
