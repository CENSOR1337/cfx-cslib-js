import * as cfx from "@censor1337/cfx-api/shared";
import { Vector3 } from "@censor1337/cfx-api/shared";

export class Entity {
	public readonly _handle: number;

	protected constructor(handle: number) {
		this._handle = handle;
	}

	public get handle(): number {
		return this.handle;
	}
}
