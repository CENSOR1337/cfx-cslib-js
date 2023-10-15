import { Vector3 } from "@censor1337/cfx-api/client";
import { Collision as CollisionBase } from "../../shared";
import { randomUUID } from "../utils/uuid";
import { Shape } from "../../shared";
import * as cfx from "@censor1337/cfx-api/client";
import * as natives from "@censor1337/cfx-core/natives";

export class Collision extends CollisionBase {
	constructor(shape: Shape) {
		const id = randomUUID();
		super(id, shape);
	}
}
