export class Entity {
    public readonly _handle: number;

    protected constructor(handle: number) {
        this._handle = handle;
    }

    public get handle(): number {
        return this.handle;
    }
}
