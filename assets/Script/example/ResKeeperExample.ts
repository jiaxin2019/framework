import { ResLeakChecker } from "../res/ResLeakChecker";
import ResLoader, { resLoader } from "../res/ResLoader";
import { ResUtil } from "../res/ResUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NetExample extends cc.Component {
    @property(cc.Boolean)
    resUtilMode = true;
    @property(cc.Node)
    attachNode: cc.Node = null;
    @property(cc.Label)
    dumpLabel: cc.Label = null;
    checker = new ResLeakChecker();

    start() {
        this.checker.startCheck();
    }

    onAdd() {
        ResLoader.load("prefabDir/HelloWorld", cc.Prefab, (error: Error, prefab: cc.Prefab) => {
            if (!error) {
                let myNode = ResUtil.instantiate(prefab);
                myNode.parent = this.attachNode;
                myNode.setPosition((Math.random() * 500) - 250, myNode.position.y);
                console.log(myNode.position);
                prefab.decRef();
            }
        });
    }

    onSub() {
        if (this.attachNode.childrenCount > 0) {
            this.attachNode.children[this.attachNode.childrenCount - 1].destroy();
        }
    }

    onAssign() {
        ResLoader.load("images/test", cc.SpriteFrame, (error: Error, sp: cc.SpriteFrame) => {
            this.checker.traceAsset(sp);
            if (this.attachNode.childrenCount > 0) {
                let targetNode = this.attachNode.children[this.attachNode.childrenCount - 1];
                targetNode.getComponent(cc.Sprite).spriteFrame = ResUtil.assignWith(sp, targetNode, true);
            }
            sp.decRef();
        });
    }

    onClean() {
        this.attachNode.destroyAllChildren();
    }

    onDump() {
        this.checker.dump();
        let Loader: any = cc.loader;
        this.dumpLabel.string = `当前资源总数:${Object.keys(Loader._cache).length}`;
    }

    onLoadClick() {
        cc.director.loadScene("example_empty");
    }

    onPreloadClick() {
        cc.director.preloadScene("example_empty");
    }
}
