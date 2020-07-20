import CocosBaseComponent from "./CocosBaseComponent";
export default class CheckboxComponent extends CocosBaseComponent {
    private checkedName;
    private uncheckedName;
    /**
     * 变化回调
     * @param isChecked
     * @param callback
     */
    constructor(isChecked: any, callback: (isChecked: any) => void, checkedName?: string, uncheckedName?: string);
    initForm(node: any): void;
    private toggleCallback;
    mCheckedVideo: boolean;
    addListener(): void;
    removeListener(): void;
    onReceive(): void;
    private mCanNum;
    private mCheckBoxMistouch;
    private mClickNum;
    private mVideoNum;
    checkToggle(mistouch?: boolean): void;
    onShow(data: any): void;
    private checkCallback;
    willHide(): void;
}
