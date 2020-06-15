import BaseForm from "./BaseForm";
import Common from "../../utils/Common";
import UIForms from "../../config/UIForms";
import showCoinOptions from "../../model/showCoinOptions";
import BaseModule from "../../framework/BaseModule";


export default class CoinForm extends BaseForm {


    public get rootNode() {
        return {}
    }
    public get FormData(): showCoinOptions {

        return this.mFormData;
    }
    public flyAnim(logic, endVec, callback) {

    }

    onShow(data) {

        let { imgNum, coinNum, starVec, endVec, callback } = this.FormData;

        console.log('showCoin', data);
        cc.loader.loadRes(moosnow.entity.prefabPath + 'coin', cc.Prefab, () => {
            for (let i = 0; i < imgNum; i++) {
                let logic = moosnow.entity.showEntity("coin", this.rootNode, {
                    x: Common.randomNumBoth(starVec.x - data.randomX, starVec.x + data.randomX),
                    y: Common.randomNumBoth(starVec.y - data.randomY, starVec.y + data.randomY)
                });
                this.flyAnim(logic, endVec, callback);

            }
            this.scheduleOnce(() => {
                if (this.FormData.hideForm)
                    moosnow.ui.hideUIForm(UIForms.CoinForm, null);
                if (Common.isFunction(callback))
                    callback();
            }, 2.1)
        })
    }
}
