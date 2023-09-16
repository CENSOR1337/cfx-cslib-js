import * as cfx from "@censor1337/cfx-api/server";
import { Entity } from "./Entity";

export class Prop extends Entity {
	public static get all(): Array<Prop> {
		const gameProps = cfx.getAllObjects();
		const props = new Array<Prop>();

		for (const entity of gameProps) {
			const prop = new Prop(entity);
			props.push(prop);
		}

		return props;
	}
}
