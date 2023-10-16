import * as natives from "@censor1337/cfx-core/natives";

function internalRequest(classObj: any, requestFunction: Function, ...args: any[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
        if (classObj.hasLoaded(...args)) {
            resolve();
        }
        if (classObj.isValid(...args)) {
            requestFunction(...args);
            while (!classObj.hasLoaded(...args)) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            resolve();
        } else {
            reject(`${classObj.constructor.name}, ${args} is not valid`);
        }
    });
}
class StreamingModel {
    public static request(modelHash: string | number): Promise<void> {
        const hash = typeof modelHash === "string" ? natives.getHashKey(modelHash) : modelHash;
        return internalRequest(StreamingModel, natives.requestModel, hash);
    }

    public static remove(modelHash: number): void {
        natives.setModelAsNoLongerNeeded(modelHash);
    }

    public static hasLoaded(modelHash: number): boolean {
        return natives.hasModelLoaded(modelHash);
    }

    public static isValid(modelHash: number): boolean {
        return natives.isModelValid(modelHash);
    }
}

class Anim {
    public static request(dict: string): Promise<void> {
        return internalRequest(Anim, natives.requestAnimDict, dict);
    }

    public static remove(dict: string): void {
        natives.removeAnimDict(dict);
    }

    public static hasLoaded(dict: string): boolean {
        return natives.hasAnimDictLoaded(dict);
    }

    public static isValid(dict: string): boolean {
        return natives.doesAnimDictExist(dict);
    }
}

class Ptfx {
    public static request(fxName: string): Promise<void> {
        return internalRequest(Ptfx, natives.requestNamedPtfxAsset, fxName);
    }

    public static remove(fxName: string): void {
        natives.removeNamedPtfxAsset(fxName);
    }

    public static hasLoaded(fxName: string): boolean {
        return natives.hasNamedPtfxAssetLoaded(fxName);
    }

    public static isValid(fxName: string): boolean {
        return true; // Can't find a native for this
    }
}

export class Streaming {
    public static Model = StreamingModel;
    public static Anim = Anim;
    public static Ptfx = Ptfx;
}
