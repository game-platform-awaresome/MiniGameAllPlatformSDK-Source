import BaseLogic from "./BaseLogic";
import EventType from "../../utils/EventType";
import moosnowAdRow from "../../model/moosnowAdRow";
import Common from "../../utils/Common";

export default class AdInviteBox extends BaseLogic {

    public logo: any = null;
    public gameName: any = null;
    public userName: any = null;
    public btnConfirm: any = null;
    public btnCancel: any = null;

    private url: string = "https://liteplay-1253992229.cos.ap-guangzhou.myqcloud.com/Avatar";

    private mCurrentAdRow: moosnowAdRow
    willShow(data) {
        super.willShow(data);
        this.addListener();
        moosnow.http.request(`${this.url}/avatar.json`, {}, "GET", (res) => {
            let userName = res.name[Common.randomNumBoth(0, res.name.length - 1)];
            let logo = Common.randomNumBoth(res.logo[0], res.logo[1])
            moosnow.ad.getAd(ad => {
                let idx = Common.randomNumBoth(0, ad.indexLeft.length - 1)
                let adRow: moosnowAdRow = ad.indexLeft[idx];
                this.initBox(userName, `${this.url}/${logo}.png`, adRow.title);
                this.mCurrentAdRow = adRow;
            })

        })

        moosnow.http.getAllConfig(res => {
            if (res) {
                let inviteDelayClose = isNaN(res.inviteDelayClose) ? 0 : parseFloat(res.inviteDelayClose)
                if (inviteDelayClose > 0) {
                    this.unscheduleOnce(this.onCancel)
                    this.scheduleOnce(this.onCancel, inviteDelayClose)
                }
            }
        })

    }

    willHide() {
        this.unscheduleOnce(this.onCancel)
        this.removeListener();
    }

    public initBox(userName, logo, gameName) {

    }

    public addListener() {

    }
    public removeListener() {
    }

    public onConfirm() {
        this.onCancel();
        moosnow.platform.navigate2Mini(this.mCurrentAdRow);
    }
    public onCancel() {
        moosnow.entity.hideAllEntity("inviteBox", null)
    }

}