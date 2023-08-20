import { Collision } from "./Collision";
import { Vector3 } from "cfx-server";
import * as cfx from "cfx-server";

export class CollisionSphere extends Collision {
	radius: number;
	constructor(pos: Vector3, radius: number) {
		super(pos);
		this.radius = radius;
	}

	protected isPositionInside(pos: Vector3) {
		return this.pos.distance(pos) <= this.radius;
	}

	protected isEntityInside(entity: number) {
		const position = cfx.getEntityCoords(entity);
		return this.isPositionInside(position);
	}
}
