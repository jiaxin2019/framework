/**
 * ResLoader2，封装资源的加载和卸载接口，隐藏新老资源底层差异
 * 1. 加载资源接口
 * 2. 卸载资源接口
 * 
 * 2021-1-24 by 宝爷
 */

import ResManager from "./ResManager";

// 资源加载的处理回调
export type ProcessCallback = (completedCount: number, totalCount: number, item: any) => void;
// 资源加载的完成回调
export type CompletedCallback = (error: Error, resource: any | any[], urls?: string[]) => void;

// load方法的参数结构
export interface LoadArgs {
    bundle?: string;
    url?: string | string[];
    type?: typeof cc.Asset;
    onCompleted?: CompletedCallback;
    onProgess?: ProcessCallback;
}

// release方法的参数结构
export interface ReleaseArgs {
    bundle?: string;
    url?: string | string[] | cc.Asset | cc.Asset[],
    type?: typeof cc.Asset,
}

// 兼容性处理
let isChildClassOf = cc.js["isChildClassOf"]
if (!isChildClassOf) {
    isChildClassOf = cc["isChildClassOf"];
}

export default class ResLoader {

    public static getLoader(): any {
        return cc.loader;
    }

    public static makeLoadArgs(): LoadArgs {
        do {
            if (arguments.length < 2) {
                break;
            }
            let ret: LoadArgs = {};
            if (typeof arguments[1] == "string" || arguments[1] instanceof Array) {
                if (typeof arguments[0] == "string") {
                    ret.bundle = arguments[0];
                    ret.url = arguments[1];
                    if (arguments.length > 2 && isChildClassOf(arguments[2], cc.RawAsset)) {
                        ret.type = arguments[2];
                    }
                } else {
                    break;
                }
            } else if (typeof arguments[0] == "string" || arguments[0] instanceof Array) {
                ret.url = arguments[0];
                if (isChildClassOf(arguments[1], cc.RawAsset)) {
                    ret.type = arguments[1];
                }
            } else {
                break;
            }

            if (typeof arguments[arguments.length - 1] == "function") {
                ret.onCompleted = arguments[arguments.length - 1];
                if (typeof arguments[arguments.length - 2] == "function" 
                    && !isChildClassOf(arguments[arguments.length - 2], cc.RawAsset)) {
                    ret.onProgess = arguments[arguments.length - 2];
                }
            }

            return ret;
        } while (false);

        console.error(`makeLoadArgs error ${arguments}`);
        return null;
    }

    public static makeReleaseArgs(): ReleaseArgs {
        do {
            if (arguments.length < 1) {
                break;
            }

            let ret: ReleaseArgs = {};
            if (isChildClassOf(arguments[arguments.length - 1], cc.RawAsset)) {
                ret.type = arguments[arguments.length - 1];
            }

            if (arguments.length > 1 && typeof arguments[0] == "string" &&
                (typeof arguments[1] == "string" || arguments[1] instanceof Array)) {
                ret.bundle = arguments[0];
                ret.url = arguments[1];
            } else {
                ret.url = arguments[0];
            }
            return ret;
        } while (false);

        console.error(`makeLoadArgs error ${arguments}`);
        return null;
    }

    private static makeFinishCallback(resArgs: LoadArgs): CompletedCallback {
        console.time("load|" + resArgs.url);
        let finishCallback = (error: Error, resource: any) => {
            if (!error) {
                if (resource instanceof Array) {
                    resource.forEach(element => {
                        ResManager.Instance.cacheAsset(element);
                    });
                } else {
                    ResManager.Instance.cacheAsset(resource);
                }
            }
            if (resArgs.onCompleted) {
                resArgs.onCompleted(error, resource);
            }
            console.timeEnd("load|" + resArgs.url);
        };
        return finishCallback;
    }

    private static getUuid(url: string, type: typeof cc.Asset) {
        let ccloader = ResLoader.getLoader();
        let uuid = ccloader._getResUuid(url, type, false);
        return uuid;
    }

    /**
     * 开始加载资源
     * @param bundle        assetbundle的路径
     * @param url           资源url或url数组
     * @param type          资源类型，默认为null
     * @param onProgess     加载进度回调
     * @param onCompleted   加载完成回调
     */
    public static load(url: string, onCompleted: CompletedCallback);
    public static load(url: string, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static load(url: string, type: typeof cc.Asset, onCompleted: CompletedCallback);
    public static load(url: string, type: typeof cc.Asset, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static load(url: string[], onCompleted: CompletedCallback);
    public static load(url: string[], onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static load(url: string[], type: typeof cc.Asset, onCompleted: CompletedCallback);
    public static load(url: string[], type: typeof cc.Asset, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static load(bundle: string, url: string, onCompleted: CompletedCallback);
    public static load(bundle: string, url: string, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static load(bundle: string, url: string, type: typeof cc.Asset, onCompleted: CompletedCallback);
    public static load(bundle: string, url: string, type: typeof cc.Asset, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static load(bundle: string, url: string[], onCompleted: CompletedCallback);
    public static load(bundle: string, url: string[], onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static load(bundle: string, url: string[], type: typeof cc.Asset, onCompleted: CompletedCallback);
    public static load(bundle: string, url: string[], type: typeof cc.Asset, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static load() {
        let resArgs: LoadArgs = ResLoader.makeLoadArgs.apply(ResLoader, arguments);
        let finishCallback = ResLoader.makeFinishCallback(resArgs);
        let ccloader = ResLoader.getLoader();
        if (typeof resArgs.url == "string") {
            if (typeof (ccloader['_getResUuid']) == "function") {
                let uuid = ccloader._getResUuid(resArgs.url, resArgs.type, false);
                if (uuid) {
                    ccloader.loadRes(resArgs.url, resArgs.type, resArgs.onProgess, finishCallback);
                } else {
                    ccloader.load(resArgs.url, resArgs.onProgess, finishCallback);
                }
            }
        } else {
            ccloader.loadResArray(resArgs.url, resArgs.type, resArgs.onProgess, finishCallback);
        }
    }

    public static loadDir(url: string, onCompleted: CompletedCallback);
    public static loadDir(url: string, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static loadDir(url: string, type: typeof cc.Asset, onCompleted: CompletedCallback);
    public static loadDir(url: string, type: typeof cc.Asset, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static loadDir(bundle: string, url: string, onCompleted: CompletedCallback);
    public static loadDir(bundle: string, url: string, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static loadDir(bundle: string, url: string, type: typeof cc.Asset, onCompleted: CompletedCallback);
    public static loadDir(bundle: string, url: string, type: typeof cc.Asset, onProgess: ProcessCallback, onCompleted: CompletedCallback);
    public static loadDir() {
        let resArgs: LoadArgs = ResLoader.makeLoadArgs.apply(ResLoader, arguments);
        let finishCallback = ResLoader.makeFinishCallback(resArgs);
        let ccloader = ResLoader.getLoader();
        ccloader.loadResDir(resArgs.url, resArgs.type, resArgs.onProgess, finishCallback);
    }

    public static release(url: string)
    public static release(url: string, type: typeof cc.Asset)
    public static release(url: string[])
    public static release(url: string[], type: typeof cc.Asset)
    public static release(bundle: string, url: string)
    public static release(bundle: string, url: string, type: typeof cc.Asset)
    public static release(bundle: string, url: string[])
    public static release(bundle: string, url: string[], type: typeof cc.Asset)
    public static release(asset: cc.Asset)
    public static release(asset: cc.Asset[])
    public static release() {
        let resArgs: ReleaseArgs = ResLoader.makeReleaseArgs.apply(ResLoader, arguments);
        if (resArgs.url instanceof Array) {
            resArgs.url.forEach(element => {
                if (resArgs.type) {
                    ResManager.Instance.releaseAsset(ResLoader.getUuid(element, resArgs.type));
                } else {
                    ResManager.Instance.releaseAsset(element);
                }
            });
        } else {
            if (resArgs.type && typeof resArgs.url == "string") {
                ResManager.Instance.releaseAsset(ResLoader.getUuid(resArgs.url, resArgs.type));
            } else {
                ResManager.Instance.releaseAsset(resArgs.url);
            }
        }
    }
}

export let resLoader = ResLoader;