import { Vector3 } from "cfx-client";
import { Collision } from "./Collision";
import * as natives from "cfx-natives";

export class CollisionSphere extends Collision {
	radius: number;
	constructor(pos: Vector3, radius: number) {
		super(pos);
		this.radius = radius;
	}

	protected isPosInside(pos: Vector3) {
		return this.pos.distance(pos) <= this.radius;
	}

	protected isEntityInside(entity: number) {
		const position = natives.getEntityCoords(entity, false);
		return this.isPosInside(position);
	}
}
