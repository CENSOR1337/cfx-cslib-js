import * as cfx from "@censor1337/cfx-api/server";
import { Entity } from "./Entity";

export class Vehicle extends Entity {
	public static get all(): Array<Vehicle> {
		const gameVehicles = cfx.getAllVehicles();
		const vehicles = new Array<Vehicle>();

		for (const entity of gameVehicles) {
			const vehicle = new this(entity);
			vehicles.push(vehicle);
		}

		return vehicles;
	}
}
