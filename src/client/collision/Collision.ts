import { Timer, Vector3 } from "@censor1337/cfx-api/client";
import { Collision as CollisionBase, Dispatcher } from "../../shared";
import { randomUUID } from "../utils/uuid";
import { Shape } from "../../shared";
import * as cfx from "@censor1337/cfx-api/client";
import * as natives from "@censor1337/cfx-core/natives";
import { ICollisionEntity } from "../../shared/collision/Collision";

let interval: Timer | undefined;
const FOnProcessEntities = new Dispatcher<[Map<number, ICollisionEntity>]>();

function getNonPlayerPeds(): Array<number> {
    const gamePeds = cfx.getGamePool("CPed") as Array<number>;
    return gamePeds.filter((ped: number) => !natives.isPedAPlayer(ped));
}

function processEntities() {
    const playersOnly = Collision.all.every((collision) => collision.playersOnly);
    const entitiesToProcess = new Map<number, ICollisionEntity>();
    const entityies = new Map<string, Array<number>>();

    const playerPeds = cfx.getActivePlayers().map((playerId: number) => natives.getPlayerPed(playerId));
    entityies.set("player", playerPeds);

    if (!playersOnly) {
        entityies.set("ped", getNonPlayerPeds());
        entityies.set("veh", cfx.getGamePool("CVehicle"));
        entityies.set("prop", cfx.getGamePool("CObject"));
    }

    for (const [type, entityHandles] of entityies) {
        for (const entityHandle of entityHandles) {
            const collisionEntity = {
                type,
                handle: entityHandle,
                pos: natives.getEntityCoords(entityHandle, false),
                dimension: 0, // There no dimension getter in client side
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
        interval = cfx.setInterval(processEntities, 250);
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
