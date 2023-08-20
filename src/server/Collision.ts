import { randomUUID } from "./utils/uuid";
import { Vector3 } from "cfx-server";
import { Collision as CollisionBase } from "../shared/Collision";
import { Player } from "./Player";
import * as cfx from "cfx-server";

export abstract class Collision extends CollisionBase {
	constructor(pos: Vector3) {
		const id = randomUUID();
		super(id, pos);
	}

	protected isEntityValid(entity: number) {
		if (!cfx.doesEntityExist(entity)) return false;
		if (!this.isEntityInside(entity)) return false;
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

	protected abstract isPositionInside(pos: Vector3): boolean;
	protected abstract isEntityInside(entity: number): boolean;
}
