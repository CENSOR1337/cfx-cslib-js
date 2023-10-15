import { randomUUID } from "../utils/uuid";
import { Vector3 } from "@censor1337/cfx-api/server";
import { Collision as CollisionBase } from "../../shared";
import { Player } from "../entities/Player";
import { Shape } from "../../shared";
import { Timer } from "@censor1337/cfx-api/server";
import { Dispatcher } from "../../shared";
import * as cfx from "@censor1337/cfx-api/server";

let interval: Timer | undefined;

const entityDispatcher = new Dispatcher<[number, number, Vector3, string]>();

function processEntities() {
	const playersOnly = Collision.all.every((collision) => collision.playersOnly);
	const entities = new Array<{ handle: number; type: string }>();

	const players = Player.all;
	for (const player of players) {
		const ped = player.ped;
		entities.push({ handle: ped, type: "player" });
	}

	if (!playersOnly) {
		const peds = cfx.getAllPeds();
		for (const ped of peds) {
			if (cfx.isPedAPlayer(ped)) continue;
			entities.push({ handle: ped, type: "ped" });
		}

		const vehicles = cfx.getAllVehicles();
		for (const vehicle of vehicles) {
			entities.push({ handle: vehicle, type: "veh" });
		}

		const props = cfx.getAllObjects();
		for (const prop of props) {
			entities.push({ handle: prop, type: "prop" });
		}
	}

	for (const entity of entities) {
		const pos = cfx.getEntityCoords(entity.handle);
		const dimension = cfx.getEntityRoutingBucket(entity.handle);
		entityDispatcher.broadcast(dimension, entity.handle, pos, entity.type);
	}
}

export class Collision extends CollisionBase {
	private readonly entityPatcherId: number;

	constructor(shape: Shape) {
		const id = randomUUID();
		super(id, shape);

		// Add the entity dispatcher
		this.entityPatcherId = entityDispatcher.add((dimension: number, entity: number, pos: Vector3, type: string) => {
			if (this.playersOnly && type != "player") return;
			this.processEntity(dimension, entity, pos);
		});

		// Create the interval if it doesn't exist
		if (interval) return;
		interval = cfx.setInterval(processEntities, 500);
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
}
