import { Vector3 } from "@censor1337/cfx-api/shared";
import { WordObject } from "./WordObject";
import { appendInternalNamespace } from "./enum";

export const VirtualEntityEvent = {
	onVirtualEntityStreamIn: appendInternalNamespace("on_ve_stream_in"),
	onVirtualEntityStreamOut: appendInternalNamespace("on_ve_stream_out"),
	onVirtualEntitySyncedMetaChange: appendInternalNamespace("on_ve_synced_meta_change"),
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
