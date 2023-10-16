import { Entity as EntityBase } from "../../shared/entities";
import * as cfx from "@censor1337/cfx-api/server";
import { Vector3 } from "@censor1337/cfx-api/server";
import { Player } from "..";

export abstract class Entity extends EntityBase {
    public get valid(): boolean {
        return cfx.doesEntityExist(this.handle);
    }

    public get exists(): boolean {
        return this.valid;
    }

    public get netOwner(): Player | null {
        const owner = cfx.networkGetEntityOwner(this.handle);
        if (owner <= 0) return null;
        return new Player(owner);
    }

    public get firstOwner(): Player | null {
        const firstOwner = cfx.networkGetFirstEntityOwner(this.handle);
        if (firstOwner <= 0) return null;
        return new Player(firstOwner);
    }

    public get pos(): Vector3 {
        return cfx.getEntityCoords(this.handle);
    }

    public set pos(pos: Vector3) {
        cfx.setEntityCoords(this.handle, pos.x, pos.y, pos.z, false, false, false, false);
    }

    public get rot(): Vector3 {
        return cfx.getEntityRotation(this.handle);
    }

    public set rot(rot: Vector3) {
        cfx.setEntityRotation(this.handle, rot.x, rot.y, rot.z, 0, false);
    }

    public get dimension(): number {
        return cfx.getEntityRoutingBucket(this.handle);
    }

    public set dimension(dimension: number) {
        cfx.setEntityRoutingBucket(this.handle, dimension);
    }

    public get model(): number {
        return cfx.getEntityModel(this.handle);
    }
}
