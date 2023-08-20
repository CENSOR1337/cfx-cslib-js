import { Vector3 } from "cfx-shared";
import { WordObject } from "./WordObject";
import { appendInternalNamespace } from "./enum";

const Event = {
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
	public readonly virtualEntityType: string;
	public readonly event: veEvent;

	constructor(pos: Vector3, dimension?: number) {
		super(pos, dimension);
		this.virtualEntityType = this.constructor.name;
		this.event = {
			onVirtualEntityStreamIn: `${Event.onVirtualEntityStreamIn}:${this.virtualEntityType}`,
			onVirtualEntityStreamOut: `${Event.onVirtualEntityStreamOut}:${this.virtualEntityType}`,
			onVirtualEntitySyncedMetaChange: `${Event.onVirtualEntitySyncedMetaChange}:${this.virtualEntityType}`,
		};
	}
}
