import { randomUUID } from "../utils/uuid";
import { Vector3 } from "@censor1337/cfx-api/server";
import { Collision as CollisionBase } from "../../shared";
import { Player } from "../entities/Player";
import { Shape } from "../../shared";
import { Timer } from "@censor1337/cfx-api/server";
import { Dispatcher } from "../../shared";
import { ICollisionEntity } from "../../shared/collision/Collision";
import * as cfx from "@censor1337/cfx-api/server";

let interval: Timer | undefined;
const FOnProcessEntities = new Dispatcher<[Map<number, ICollisionEntity>]>();

function getNonPlayerPeds(): Array<number> {
    const gamePeds = cfx.getAllPeds() as Array<number>;
    return gamePeds.filter((ped: number) => !cfx.isPedAPlayer(ped));
}

function processEntities() {
    const playersOnly = Collision.all.every((collision) => collision.playersOnly);
    const entitiesToProcess = new Map<number, ICollisionEntity>();
    const entityies = new Map<string, Array<number>>();

    const players = Player.all;
    const playerPeds = [];
    for (const player of players) {
        const ped = player.ped;
        if (!cfx.doesEntityExist(ped)) continue;
        playerPeds.push(ped);
    }
    entityies.set("player", playerPeds);

    if (!playersOnly) {
        entityies.set("ped", getNonPlayerPeds());
        entityies.set("veh", cfx.getAllVehicles());
        entityies.set("prop", cfx.getAllObjects());
    }

    for (const [type, entityHandles] of entityies) {
        for (const entityHandle of entityHandles) {
            const collisionEntity = {
                type,
                handle: entityHandle,
                pos: cfx.getEntityCoords(entityHandle),
                dimension: cfx.getEntityRoutingBucket(entityHandle),
            };
            entitiesToProcess.set(entityHandle, collisionEntity);
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
