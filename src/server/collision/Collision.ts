import { randomUUID } from "../utils/uuid";
import { Vector3 } from "@censor1337/cfx-api/server";
import { Collision as CollisionBase } from "../../shared";
import { Player } from "../entities/Player";
import { Shape } from "../../shared";
import * as cfx from "@censor1337/cfx-api/server";

export class Collision extends CollisionBase {
	constructor(shape: Shape) {
		const id = randomUUID();
		super(id, shape);
	}

	protected isEntityValid(entity: number) {
		if (!this.isEntityIn(entity)) return false;
		if (cfx.getEntityRoutingBucket(entity) != this.dimension) return false;
		return true;
	}

	protected getRevelantEntities(): Array<number> {
		const entities = new Array<number>();
		const players = Player.all;

		for (const player of players) {
			const ped = player.ped;
			entities.push(ped);
		}

		if (!this.playersOnly) {
			const peds = cfx.getAllPeds();
			for (const handle of peds) {
				if (cfx.isPedAPlayer(handle)) continue;
				entities.push(handle);
			}

			const vehicles = cfx.getAllVehicles();
			const props = cfx.getAllObjects();

			entities.push(...vehicles);
			entities.push(...props);
		}

		return entities;
	}

	public isEntityIn(entity: number): boolean {
		const position = cfx.getEntityCoords(entity);
		return this.isPointIn(position);
	}
}
