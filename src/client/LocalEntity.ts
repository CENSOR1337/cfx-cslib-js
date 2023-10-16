import { Vector3 } from "@censor1337/cfx-api/client";
import { Dispatcher } from "../shared/utils/Dispatcher";
import { Streaming } from "./Streaming";
import * as natives from "@censor1337/cfx-core/natives";

export enum EntityType {
    Object = "object",
    Ped = "ped",
    Vehicle = "vehicle",
}
//    constructor(model: string | number, pos: shared.Vector3, rot: shared.Vector3, noOffset?: boolean, dynamic?: boolean, useStreaming?: boolean, streamingDistance?: number);

export class LocalEntity {
    private position = new Vector3(0, 0, 0);
    private rotation = new Vector3(0, 0, 0);
    private readonly hash: number;
    private _handle: number = 0;
    public readonly type: EntityType;
    private _isDestroyed: boolean = false;
    private dispatchers = {
        onCreated: new Dispatcher(),
        onDestroyed: new Dispatcher(),
    };

    constructor(
        modelHash: string | number,
        position: Vector3,
        rotation: Vector3,
        entityType: EntityType
        // noOffset?: boolean,
        // dynamic?: boolean,
        // useStreaming?: boolean,
        // streamingDistance?: number
    ) {
        this.position = position;
        this.rotation = rotation;
        this.hash = typeof modelHash === "string" ? natives.getHashKey(modelHash) : modelHash;
        this.type = entityType;
        this.createEntity(position, rotation);
    }

    public get isDestroyed(): boolean {
        return this._isDestroyed;
    }

    public get handle(): number {
        return this._handle;
    }

    public get id(): number {
        return this.handle;
    }

    public get valid(): boolean {
        return natives.doesEntityExist(this.handle);
    }

    private async createEntity(position: Vector3, rotation: Vector3) {
        await Streaming.Model.request(this.hash);
        if (this.isDestroyed) return;
        switch (this.type) {
            case EntityType.Object:
                this._handle = natives.createObjectNoOffset(this.hash, position.x, position.y, 0.0, false, false, false);
                break;
            case EntityType.Ped:
                this._handle = natives.createPed(0, this.hash, position.x, position.y, 0.0, 0.0, false, false);
                break;
            case EntityType.Vehicle:
                this._handle = natives.createVehicle(this.hash, position.x, position.y, 0.0, 0.0, false, false, false);
                break;
            default:
                throw new Error("Invalid entity type");
        }
        if (!this.valid) {
            this.destroy();
            return;
        }
        this.pos = position;
        this.rot = rotation;
        this.dispatchers.onCreated.broadcast();
    }

    public async waitForCreation(): Promise<void> {
        if (this.valid) return Promise.resolve();
        return new Promise((resolve) => {
            const listener = this.dispatchers.onCreated.add(() => {
                if (listener == undefined) return;
                resolve();
                this.dispatchers.onCreated.remove(listener);
            });
        });
    }

    public onCreated(handler: () => void): void {
        this.dispatchers.onCreated.add(handler);
    }

    public onDestroyed(handler: () => void): void {
        this.dispatchers.onDestroyed.add(handler);
    }

    public destroy() {
        this._isDestroyed = true;
        this.dispatchers.onDestroyed.broadcast();
        if (!this.valid) return;
        natives.deleteEntity(this.id);
    }

    public set pos(pos: Vector3) {
        this.position = pos;
        if (!this.valid) return;
        natives.setEntityCoordsNoOffset(this.handle, pos.x, pos.y, pos.z, false, false, false);
    }

    public get pos(): Vector3 {
        if (!this.valid) return this.position;
        return natives.getEntityCoords(this.handle, false);
    }

    public set rot(rot: Vector3) {
        this.rotation = rot;
        if (!this.valid) return;
        natives.setEntityRotation(this.handle, rot.x, rot.y, rot.z, 0, false);
    }

    public get rot(): Vector3 {
        if (!this.valid) return this.rotation;
        return natives.getEntityRotation(this.handle, 2);
    }

    public set heading(heading: number) {
        if (!this.valid) return;
        natives.setEntityHeading(this.handle, heading);
    }
}
