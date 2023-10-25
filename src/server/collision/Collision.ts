import { randomUUID } from "../utils/uuid";
import { Vector3 } from "@censor1337/cfx-api/server";
import { Collision as CollisionBase } from "../../shared";
import { Shape } from "../../shared";
import { Timer } from "@censor1337/cfx-api/server";
import { Dispatcher } from "../../shared";
import { ICollisionEntity } from "../../shared/collision/Collision";
import { Player, Entity, Ped, Vehicle, Object } from "@censor1337/cfx-api/server";
import * as cfx from "@censor1337/cfx-api/server";

let interval: Timer | undefined;
const FOnProcessEntities = new Dispatcher<[Map<number, ICollisionEntity>]>();

function processEntities() {
    const playersOnly = Collision.all.every((collision) => collision.playersOnly);
    const entitiesToProcess = new Map<number, ICollisionEntity>();
    const entityies = new Map<string, Array<Entity>>();

    entityies.set("player", Player.all);

    if (!playersOnly) {
        entityies.set("ped", Ped.all);
        entityies.set("veh", Vehicle.all);
        entityies.set("prop", Object.all);
    }

    for (const [type, entityHandles] of entityies) {
        for (const entity of entityHandles) {
            const collisionEntity = {
                type,
                handle: entity.handle,
                pos: entity.pos,
                dimension: entity.dimension,
            } as ICollisionEntity;
            entitiesToProcess.set(entity.handle, collisionEntity);
        }
    }

    FOnProcessEntities.broadcast(entitiesToProcess);
}

export class Collision extends CollisionBase {
    constructor(shape: Shape, relevantOnly: boolean) {
        const id = randomUUID();
        super(id, shape, relevantOnly, FOnProcessEntities);

        // Create the interval if it doesn't exist
        if (interval) return;
        interval = cfx.setInterval(processEntities, 500);
    }

    public destroy(): void {
        super.destroy();

        // Destroy the interval if there are no more collisions
        if (!interval) return;
        if (FOnProcessEntities.size > 0) return;
        cfx.clearInterval(interval);
        interval = undefined;
    }

    protected getRelevantEntities(): Array<{ dimension: number; entity: number; pos: Vector3 }> {
        return [];
    }
}
