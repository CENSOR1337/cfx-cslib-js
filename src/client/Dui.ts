import * as cfx from "@censor1337/cfx-api/client";
import { Dispatcher } from ".";

class Dui {
    private _url: string;
    public readonly width: number;
    public readonly height: number;
    public readonly dui: number;
    private onCreated = new Dispatcher();
    constructor(url: string, width: number, height: number) {
        if (width < 0 || height < 0) {
            throw new Error("Width and height must be positive");
        }
        this.width = width;
        this.height = height;
        this._url = url;
        this.dui = cfx.createDui(url, width, height);
        const onTick = cfx.onTick(() => {
            if (!this.isAvailable) return;
            this.onCreated.broadcast();
            cfx.clearTick(onTick);
        });
    }

    public get nuiHandle() {
        return cfx.getDuiHandle(this.dui);
    }

    public onReady(callback: () => void) {
        this.onCreated.add(callback);
    }

    public get isAvailable(): boolean {
        return cfx.isDuiAvailable(this.dui);
    }

    public get url(): string {
        return this._url;
    }

    public set url(url: string) {
        this._url = url;
        cfx.setDuiUrl(this.dui, url);
    }

    emit(eventName: string, ...args: any[]) {
        cfx.sendDuiMessage(this.dui, JSON.stringify({ eventName, args }));
    }

    on(eventName: string, callback: (...args: any[]) => void) {
        cfx.registerNuiCallback(eventName, (...args: any[]) => {
            callback(...args);
        });
    }

    destroy() {
        cfx.destroyDui(this.dui);
    }
}

export { Dui };
