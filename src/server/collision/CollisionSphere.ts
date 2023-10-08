import { Collision } from "./Collision";
import { Vector3 } from "@censor1337/cfx-api/server";
import { ShapeSphere } from "../../shared";
import * as cfx from "@censor1337/cfx-api/server";

export class CollisionSphere extends Collision {
	radius: number;
	constructor(pos: Vector3, radius: number) {
		const shape = new ShapeSphere(pos, radius);
		super(shape);
		this.radius = radius;
	}
}
