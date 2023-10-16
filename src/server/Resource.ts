import { Resource as sharedResource } from "../shared/Resource";
import { Event } from "@censor1337/cfx-api/server";
import { Callback } from "./Callback";

class ResourceCallback extends Callback {
    public static register(eventName: string, handler: (source: number, ...args: any[]) => void): Event {
        return super.register(Resource.getEventName(eventName), handler);
    }

    public static emit<T>(eventName: string, source: number, ...args: any[]): Promise<T> {
        return super.emit(Resource.getEventName(eventName), source, ...args);
    }
}

export class Resource extends sharedResource {
    public static readonly Callback = ResourceCallback;

    public static on(eventName: string, handler: (...args: any[]) => void): Event {
        return Event.on(this.getEventName(eventName), handler);
    }

    public static once(eventName: string, handler: (...args: any[]) => void): Event {
        return Event.once(this.getEventName(eventName), handler);
    }

    public static emitAllClients(eventName: string, ...args: any[]): void {
        return Event.emitAllClients(this.getEventName(eventName), ...args);
    }

    public static emitClient(eventName: string, target: number, ...args: any[]): void {
        return Event.emitClient(this.getEventName(eventName), target, ...args);
    }

    public static onClient(eventName: string, handler: (...args: any[]) => void): Event {
        return Event.onClient(this.getEventName(eventName), handler);
    }

    public static onceClient(eventName: string, handler: (...args: any[]) => void): Event {
        return Event.onceClient(this.getEventName(eventName), handler);
    }
}
