import { Timer, Vector3 } from "@censor1337/cfx-api/client";
import { Collision as CollisionBase, Dispatcher } from "../../shared";
import { randomUUID } from "../utils/uuid";
import { Shape } from "../../shared";
import * as cfx from "@censor1337/cfx-api/client";
import * as natives from "@censor1337/cfx-core/natives";

let interval: Timer | undefined;

const entityDispatcher = new Dispatcher<[number, Vector3, string]>();

function processEntities() {
	const playersOnly = Collision.all.every((collision) => collision.playersOnly);
	const entities = new Array<{ handle: number; type: string }>();

	const peds = playersOnly ? cfx.getActivePlayers().map((playerId: number) => natives.getPlayerPed(playerId)) : cfx.getGamePool("CPed");
	for (const ped of peds) {
		entities.push({ handle: ped, type: "ped" });
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

	for (const entity of entities) {
		const pos = natives.getEntityCoords(entity.handle, false);
		entityDispatcher.broadcast(entity.handle, pos, entity.type);
	}
}

export class Collision extends CollisionBase {
	private readonly entityPatcherId: number;

	constructor(shape: Shape, relevantOnly: boolean) {
		const id = randomUUID();
		super(id, shape, relevantOnly);

		// Add the entity dispatcher
		this.entityPatcherId = entityDispatcher.add((entity: number, pos: Vector3, type: string) => {
			if (this.playersOnly && type != "ped") return;
			// for now there is no dimension getter in client side
			this.processEntity(0, entity, pos);
		});

		if (this.isRelevantOnly) return;
		// Create the interval if it doesn't exist
		if (interval) return;
		interval = cfx.setInterval(processEntities, 250);
	}

	public destroy(): void {
		super.destroy();

		// Destroy the interval if there are no more collisions
		if (!interval) return;
		entityDispatcher.remove(this.entityPatcherId);
		if (entityDispatcher.size > 0) return;
		cfx.clearInterval(interval);
		interval = undefined;
	}

	protected getRelevantEntities(): Array<{ dimension: number; entity: number; pos: Vector3 }> {
		return [];
	}
}
