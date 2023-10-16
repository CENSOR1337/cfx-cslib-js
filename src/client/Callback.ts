import { randomUUID } from "./utils/uuid";
import { Event } from "@censor1337/cfx-api/client";
import { Callback as CallbackShared } from "../shared/Callback";

export class Callback extends CallbackShared {
    public static emit<T>(eventName: string, ...args: any[]): Promise<T> {
        const cbId = randomUUID();
        const promise = new Promise<T>((resolve) => {
            Event.onServer(cbId, (data: any) => {
                resolve(data as T);
            });
        });
        Event.emitServer(`${this.serverNamespace}:${eventName}`, cbId, ...args);
        return promise;
    }

    public static register(eventName: string, handler: (...args: any[]) => void): Event {
        return Event.onServer(`${this.clientNamespace}:${eventName}`, (cbId: string, ...args: any[]) => {
            Event.emitServer(cbId, handler(...args));
        });
    }
}
