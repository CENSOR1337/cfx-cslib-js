import { Vector3 } from "@censor1337/cfx-api/shared";
import { WordObject } from "./WordObject";
import { appendNamespace } from "./enum";

export const VirtualEntityEvent = {
    onStreamIn: appendNamespace("on.ve.stream.in"),
    onStreamOut: appendNamespace("on.ve.stream.out"),
    onSyncedMetaChange: appendNamespace("on.ve.synced.meta.change"),
};

export class VirtualEntity extends WordObject {
    public static readonly type = "VIRTUAL_ENTITY";
    public readonly type = "VIRTUAL_ENTITY";
    private _destroyed = false;

    constructor(pos: Vector3, dimension?: number) {
        super(pos, dimension);
    }

    public get destroyed() {
        return this._destroyed;
    }

    public destroy() {
        this._destroyed = true;
    }
}
