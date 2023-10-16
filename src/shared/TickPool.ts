import { Timer, onTick, clearTick } from "@censor1337/cfx-api/shared";

class Tickpool {
    handlers = new Map<number, () => void>();
    currentId: number;
    tick: Timer | undefined;
    private _destroyed: boolean = false;

    constructor() {
        this.currentId = 0;
    }

    public get destroyed() {
        return this._destroyed;
    }

    public add(handler: () => void): number {
        this.currentId++;
        this.handlers.set(this.currentId, handler);
        if (!this.tick) {
            this.tick = onTick(() => {
                for (const [_id, handler] of this.handlers) {
                    handler();
                }
            });
        }
        return this.currentId;
    }

    public remove(id: number) {
        const handler = this.handlers.get(id);
        if (!handler) return;
        this.handlers.delete(id);
        if (this.handlers.size > 0) return;
        this.pauseTick();
    }

    private pauseTick() {
        if (this.tick) clearTick(this.tick);
        this.tick = undefined;
    }

    public destroy() {
        this.pauseTick();
        this._destroyed = true;
    }
}

export { Tickpool };
