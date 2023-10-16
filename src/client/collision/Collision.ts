import { Timer, Vector3 } from "@censor1337/cfx-api/client";
import { Collision as CollisionBase, Dispatcher } from "../../shared";
import { randomUUID } from "../utils/uuid";
import { Shape } from "../../shared";
import * as cfx from "@censor1337/cfx-api/client";
import * as natives from "@censor1337/cfx-core/natives";

let interval: Timer | undefined;

const dispatchers = {
    validateEntities: new Dispatcher<[Array<number>]>(),
    processEntity: new Dispatcher<[number, number, Vector3, string]>(),
};

function processEntities() {
    const playersOnly = Collision.all.every((collision) => collision.playersOnly);
    const entities = new Array<{ handle: number; type: string }>();

    const peds = playersOnly ? cfx.getActivePlayers().map((playerId: number) => natives.getPlayerPed(playerId)) : cfx.getGamePool("CPed");
    for (const ped of peds) {
        const pedType = natives.isPedAPlayer(ped) ? "player" : "ped";
        entities.push({ handle: ped, type: pedType });
    }

    if (!playersOnly) {
        const vehicles = cfx.getGamePool("CVehicle");
        for (const vehicle of vehicles) {
            entities.push({ handle: vehicle, type: "veh" });
        }

        const props = cfx.getGamePool("CObject");
        for (const prop of props) {
            entities.push({ handle: prop, type: "prop" });
        }
    }

    dispatchers.validateEntities.broadcast(entities.map((entity) => entity.handle));
    for (const entity of entities) {
        const pos = natives.getEntityCoords(entity.handle, false);
        const dimension = 0; // There no dimension getter in client side
        dispatchers.processEntity.broadcast(dimension, entity.handle, pos, entity.type);
    }
}

export class Collision extends CollisionBase {
    constructor(shape: Shape, relevantOnly: boolean) {
        const id = randomUUID();
        super(id, shape, relevantOnly, dispatchers);

        // Create the interval if it doesn't exist
        if (interval) return;
        interval = cfx.setInterval(processEntities, 500);
    }

    public destroy(): void {
        super.destroy();

        // Destroy the interval if there are no more collisions
        if (!interval) return;
        if (dispatchers.validateEntities.size > 0) return;
        cfx.clearInterval(interval);
        interval = undefined;
    }

    protected getRelevantEntities(): Array<{ dimension: number; entity: number; pos: Vector3 }> {
        return [];
    }
}
