import BaseForm from "../../engine/BaseForm"
import CocosNodeEvent from "../enum/CocosNodeEvent";
import CocosNodeHelper from "../helper/CocosNodeHelper";
import CocosBaseComponent from "../common/CocosBaseComponent";
import FormFactory from "../../engine/FormFactory";
import CocosFormFactory from "../helper/CocosFormFactory";

export default class CocosBaseForm extends BaseForm {


    private downAnim(node) {
        node.scale = 1;
        node.runAction(
            cc.sequence(
                cc.scaleTo(0.1, 0.7, 0.7),
                cc.callFunc(() => {
                    // this.mouseUpEffect();
                }, this)
            )
        )
    }
    private upAnim(node, callback?: Function) {
        node.stopAllActions();
        node.scale = 0.7;
        node.runAction(
            cc.sequence(
                cc.scaleTo(0.1, 1, 1),
                cc.callFunc(() => {
                    this.mDowning = false;
                    if (callback)
                        callback();
                }, this)
            )
        )
    }
    private mDowning: boolean = false;
    private mClickQuene = {};
    private onTouchStart(e: cc.Event.EventTouch) {
        console.log('onMouseDown')
        this.downAnim(e.getCurrentTarget())
        if (this.mDowning)
            return;
        this.mDowning = true;

    }
    private onTouchEnd(e: cc.Event.EventTouch) {
        console.log('onMouseUp')
        this.upAnim(e.getCurrentTarget(), () => {
            if (this.mClickQuene[e.getCurrentTarget().uuid])
                this.mClickQuene[e.getCurrentTarget().uuid]();
        })
    }

    private onTouchCancel(e: cc.Event.EventTouch) {
        this.upAnim(e.getCurrentTarget())
    }

    public applyClickAnim(node: cc.Node, callback?: Function) {
        if (node && node.uuid) {
            this.mClickQuene[node.uuid] = callback;
            node.on(CocosNodeEvent.TOUCH_START, this.onTouchStart, this);
            node.on(CocosNodeEvent.TOUCH_END, this.onTouchEnd, this);
            node.on(CocosNodeEvent.TOUCH_CANCEL, this.onTouchCancel, this);
        }
        else {
            console.log('缺少对象，无法绑定事件')
        }
    }
    public removeClickAnim(node: cc.Node) {
        if (node && node.uuid) {
            this.mClickQuene[node.uuid] = null;
            delete this.mClickQuene[node.uuid];
            node.off(CocosNodeEvent.TOUCH_START, this.onTouchStart, this)
            node.off(CocosNodeEvent.TOUCH_END, this.onTouchEnd, this);
            node.off(CocosNodeEvent.TOUCH_CANCEL, this.onTouchCancel, this);
        }
    }

    public findNodeByName(node: cc.Node, attrName: string): cc.Node {
        return CocosNodeHelper.findNodeByName(node, attrName)
    }

    public hideForm() {
        if (this.FormData.hideForm) {
            CocosFormFactory.instance.hideFormByLogic(this)
        }
    }

}