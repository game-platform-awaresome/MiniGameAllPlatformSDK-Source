import CocosBaseForm from "../form/CocosBaseForm";
import MathUtils from "../../../utils/MathUtils";
import CocosBaseComponent from "./CocosBaseComponent";
import EventType from "../../../utils/EventType";
import { VIDEO_STATUS } from "../../../enum/VIDEO_STATUS";
import { MSG } from "../../../config/MSG";
import { VIDEO_MSG } from "../../../enum/VIDEO_MSG";

export default class CheckboxComponent extends CocosBaseComponent {


    private checkedName: string = "checked";
    private uncheckedName: string = "unchecked";
    /**
     * 变化回调
     * @param isChecked 
     * @param callback 
     */
    constructor(isChecked, callback: (isChecked) => void, checkedName?: string, uncheckedName?: string) {
        super();
        this.toggleCallback = callback;
        this.mCheckedVideo = isChecked;
        this.checkedName = checkedName;
        this.uncheckedName = uncheckedName;
        this[this.checkedName] = null;
        this[this.uncheckedName] = null;
    }


    public initForm(node) {
        super.initForm(node);
    }

    private toggleCallback: Function
    public mCheckedVideo: boolean = true;

    public addListener() {
        this.applyClickAnim(this[this.uncheckedName], () => {
            this.checkToggle(true);
        })
        this.applyClickAnim(this[this.checkedName], () => {
            this.checkToggle(true);
        })
    }
    public removeListener() {
        this.removeClickAnim(this[this.checkedName])
        this.removeClickAnim(this[this.uncheckedName])
    }

    public onReceive() {
        if (this.mCheckedVideo) {
            moosnow.platform.showVideo(res => {
                if (res == VIDEO_STATUS.END) {
                    if (this.FormData.videoCallback)
                        this.FormData.videoCallback();
                }
                else if (res == VIDEO_STATUS.ERR) {
                    moosnow.form.showToast(VIDEO_MSG.ERR)
                }
                else {
                    moosnow.form.showToast(VIDEO_MSG.NOTEND)
                }
            })
        }
        else {
            if (this.FormData.callback)
                this.FormData.callback();
        }
    }

    private mCanNum: number = 0;
    private mCheckBoxMistouch: boolean = false;
    private mClickNum: number = 0;
    private mVideoNum: number = 4;
    public checkToggle(mistouch: boolean = false) {
        if (mistouch && this.mCheckBoxMistouch) {
            this.mClickNum++;
            if (this.mClickNum == this.mVideoNum) {
                moosnow.platform.showVideo(() => { });
            }
            if (this.mClickNum >= this.mCanNum) {
                this[this.checkedName].active = this.mCheckedVideo
                this[this.uncheckedName].active = !this.mCheckedVideo;
                this.checkCallback();
                this.mCheckedVideo = !this.mCheckedVideo

            }
            return;
        }

        this[this.checkedName].active = this.mCheckedVideo
        this[this.uncheckedName].active = !this.mCheckedVideo;
        this.checkCallback();
        this.mCheckedVideo = !this.mCheckedVideo
    }

    public onShow(data) {
        moosnow.http.getAllConfig(res => {
            this.mCanNum = MathUtils.probabilitys(res.checkBoxProbabilitys) + 1;
            this.mCheckBoxMistouch = res.checkBoxMistouch == 1
        })
        this.addListener();
        this.mCheckedVideo = true;
        this.checkToggle();
        this.checkCallback();
    }

    private checkCallback() {
        if (this.toggleCallback)
            this.toggleCallback(this.mCheckedVideo);
    }

    public willHide() {
        this.removeListener();
    }
}