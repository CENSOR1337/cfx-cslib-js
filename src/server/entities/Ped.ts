import * as cfx from "@censor1337/cfx-api/server";
import { Entity } from "./Entity";

export class Ped extends Entity {
	public static all(): Array<Ped> {
		const gamePeds = cfx.getAllPeds();
		const peds = new Array<Ped>();

		for (const entity of gamePeds) {
			const ped = new Ped(entity);
			peds.push(ped);
		}

		return peds;
	}

	public isPlayer(): boolean {
		return cfx.isPedAPlayer(this.handle);
	}
}
