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
    protected readonly veType: string;
    private _destroyed = false;

    constructor(veType: string, pos: Vector3, dimension?: number) {
        super(pos, dimension);
        if (!veType) throw new Error("VirtualEntity must have a virtualEntityType");
        this.veType = veType;
    }

    public get destroyed() {
        return this._destroyed;
    }

    public destroy() {
        this._destroyed = true;
    }
}
