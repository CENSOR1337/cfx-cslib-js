import { Vector3 } from "@censor1337/cfx-api/shared";

export class WordObject {
	public pos: Vector3;
	protected _dimension: number;

	constructor(pos: Vector3, dimension?: number) {
		this.pos = pos;
		this._dimension = dimension || 0;
	}

	public set dimension(value: number) {
		this._dimension = value;
	}

	public get dimension(): number {
		return this._dimension;
	}
}
