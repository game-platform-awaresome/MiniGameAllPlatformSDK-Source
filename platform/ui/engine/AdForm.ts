import EventType from "../../utils/EventType";
import { AD_POSITION } from "../../enum/AD_POSITION";
import BaseForm from "./BaseForm";
import Common from "../../utils/Common";


export default class AdForm extends BaseForm {


    public pauseContainer: any = null;
    public pauseView: any = null;
    public pauseLayout: any = null;
    public centerContainer: any = null;
    public centerView: any = null;
    public centerLayout: any = null;
    public exportContainer: any = null;
    public exportView: any = null;
    public exportLayout: any = null;
    public exportClose: any = null;
    public exportMask: any = null;
    public exportCloseTxt: any = null;
    public floatContainer: any = null;
    public floatFull: any = null;
    public bannerContainer: any = null;
    public bannerView: any = null;
    public bannerLayout: any = null;
    public endContainer: any = null;
    public endView: any = null;
    public endLayout: any = null;
    public failContainer: any = null;
    public failView: any = null;
    public failLayout: any = null;
    public gameOverContainer: any = null;
    public gameOverView: any = null;
    public gameOverLayout: any = null;
    public respawnContainer: any = null;
    public respawnScrollView: any = null;
    public respawnLayout: any = null;
    public playerDiedContainer: any = null;
    public playerDiedScrollView: any = null;
    public playerDiedLayout: any = null;
    public leftContainer: any = null;
    public leftView: any = null;
    public leftLayout: any = null;
    public rightView: any = null;
    public rightLayout: any = null;
    public sideContainer: any = null;
    public sideView: any = null;
    public sideLayout: any = null;
    public btnSideShow: any = null;
    public btnSideHide: any = null;


    private mAdItemList = [];
    public setPosition(source: Array<moosnowAdRow>, position: string = ""): Array<moosnowAdRow> {
        let retValue = Common.deepCopy(source) as [];
        retValue.forEach((item: moosnowAdRow) => {
            item.position = position;
        })
        return retValue;
    }

    private mScrollVec = [];
    /**
     * 
     * @param scrollView 
     * @param layout 
     * @param positionTag 
     * @param entityName 
     */
    public initView(container: any, scrollView: any, layout: any, position: AD_POSITION, entityName: string | cc.Prefab) {
        if (!entityName) {
            console.warn('entityName is null 无法初始化 ')
            return;
        }
        moosnow.entity.preload(entityName, () => {
            moosnow.ad.getAd((res) => {
                let source = this.setPosition(res.indexLeft, "");

                source.forEach((item, idx) => {
                    let adItemCtl = moosnow.entity.showEntity(entityName, layout.node, item);
                    this.mAdItemList.push(adItemCtl);
                })
                if (layout.type == cc.Layout.Type.GRID) {
                    if (scrollView.vertical) {
                        this.mScrollVec.push({
                            scrollView,
                            move2Up: false
                        })
                    }
                    else {
                        this.mScrollVec.push({
                            scrollView,
                            move2Left: false
                        })
                    }
                }
                else if (layout.type == cc.Layout.Type.HORIZONTAL) {
                    this.mScrollVec.push({
                        scrollView,
                        move2Left: false
                    })
                }
                else if (layout.type == cc.Layout.Type.VERTICAL) {
                    this.mScrollVec.push({
                        scrollView,
                        move2Up: false
                    })
                }
            })

        })
    }



    public addEvent() {
        moosnow.event.addListener(EventType.AD_VIEW_CHANGE, this, this.onAdChange)
    }
    public removeEvent() {
        moosnow.event.removeListener(EventType.AD_VIEW_CHANGE, this)
    }

    public onAdChange(data) {

        this.displayChange(data.showAd, data.callback)

        this.onAfterShow(this.mIndex);

    }

    private mIndex: number = 999;
    /**
     * 
     * @param zindex 
     */
    public onAfterShow(zindex: number) {

    }


    /**
      * 
      * @param data 
      */
    public willShow(data) {

        this.mAdItemList = [];
        this.mScrollVec = [];
        this.addEvent();
        if (data)
            this.displayChange(data.showAd, data.callback)
        else
            this.displayChange(AD_POSITION.NONE, null)

    }

    private mShowAd = moosnow.AD_POSITION.NONE;
    private mBackCall: Function
    public displayChange(data, callback = null) {
        let curApp = moosnow.getAppPlatform()
        if (moosnow.APP_PLATFORM.WX == curApp || curApp == moosnow.APP_PLATFORM.OPPO) {
            this.mShowAd = data;
            this.displayAd(true)
            this.mBackCall = callback;
        }
        else {
            this.onBack();
        }

    }
    public onBack() {
        if (this.mBackCall) {
            this.mBackCall();
        }
    }


    private mMoveSpeed: number = 2;
    public onFwUpdate(dt) {
        for (let i = 0; i < this.mScrollVec.length; i++) {
            let item = this.mScrollVec[i];
            let scrollView = item.scrollView as cc.ScrollView;
            if (scrollView.isScrolling())
                continue;

            let scrollOffset = scrollView.getMaxScrollOffset();
            let maxH = scrollOffset.y / 2 + 20;
            let maxW = scrollOffset.x / 2 + 20;
            let contentPos = scrollView.getContentPosition()
            if (item.move2Up == true) {
                if (contentPos.y > maxH) {
                    item.move2Up = false;
                }
                item.scrollView.setContentPosition(new cc.Vec2(contentPos.x, contentPos.y + this.mMoveSpeed))
            }
            else if (item.move2Up == false) {
                if (contentPos.y < -maxH) {
                    item.move2Up = true;
                }
                item.scrollView.setContentPosition(new cc.Vec2(contentPos.x, contentPos.y - this.mMoveSpeed))
            }
            if (item.move2Left == true) {
                if (contentPos.x > maxW) {
                    item.move2Left = false;
                }
                item.scrollView.setContentPosition(new cc.Vec2(contentPos.x + this.mMoveSpeed, contentPos.y))
            }
            else if (item.move2Left == false) {
                if (contentPos.x < -maxW) {
                    item.move2Left = true;
                }
                item.scrollView.setContentPosition(new cc.Vec2(contentPos.x - this.mMoveSpeed, contentPos.y))
            }
        }

    }
    public sideOut() {
        let wxsys = moosnow.platform.getSystemInfoSync();
        let statusBarHeight = 0;
        let notchHeight = 0;
        if (wxsys) {
            statusBarHeight = wxsys.statusBarHeight || 0;
            notchHeight = wxsys.notchHeight || 0;
        }

        this.sideView.node.runAction(cc.sequence(
            cc.moveTo(1, statusBarHeight + notchHeight + this.sideView.node.width + 20, 0),
            cc.callFunc(() => {
                this.btnSideShow.active = false;
                this.btnSideHide.active = true;
            })
        ))
    }

    public sideIn() {
        this.sideView.node.runAction(cc.sequence(
            cc.moveTo(1, 0, 0),
            cc.callFunc(() => {
                this.btnSideShow.active = true;
                this.btnSideHide.active = false;
            })
        ))
    }
    public willHide() {
        this.removeEvent();
        this.mAdItemList.forEach(item => {
            moosnow.entity.hideEntity(item, null);
        })
        this.mAdItemList = [];
        this.mScrollVec = [];
    }
    private mFloatIndex = 0;
    private mFloatRefresh = 3;
    private mFloatCache = {};
    private mAdData: moosnowResult;
    /**
     * 
     * @param parentNode 父节点
     * @param prefabs 匹配的预制体
     * @param points 需要显示的坐标点
     */
    public initFloatAd(parentNode, prefabs: [], points: []) {
        cc.loader.loadResDir(moosnow.entity.prefabPath, cc.Prefab, () => {
            moosnow.ad.getAd((res: moosnowResult) => {
                this.mAdData = res;
                let source = [...res.indexLeft];

                prefabs.forEach((prefabName, idx) => {
                    let showIndex = idx
                    let point = points[idx] as any;
                    let adRow = { ...source[showIndex], position: "首页浮动", x: point.x, y: point.y }
                    let logic = moosnow.entity.showEntity(prefabName, parentNode, adRow);
                    this.mFloatCache[idx] = {
                        index: showIndex,
                        logic: logic,
                        onCancel: adRow.onCancel
                    };
                    this.floatAnim(logic.node);
                })
                this.updateFloat(Common.deepCopy(res));
                setInterval(() => {
                    this.updateFloat(Common.deepCopy(res));
                }, this.mFloatRefresh * 1000)
            })

        })

    }
    public floatAnim(floatNode) {

    }


    private updateFloat(source) {

        for (let key in this.mFloatCache) {
            let showIndex = this.mFloatCache[key].index;
            let logic = this.mFloatCache[key].logic;
            if (showIndex < source.indexLeft.length - 1)
                showIndex++;
            else
                showIndex = 0;
            this.mFloatCache[key].index = showIndex;

            logic.refreshImg({ ...source.indexLeft[showIndex], onCancel: this.mFloatCache[key].onCancel });

        }


    }
    private hasAd(ad) {
        return (this.mShowAd & ad) == ad;
    }


    private mSecond: number = 3
    private showExportClose() {
        this.mSecond -= 1;
        this.exportCloseTxt.active = true;
        let closeLabel = this.exportCloseTxt.getComponent(cc.Label)
        if (this.mSecond <= 0) {
            this.exportClose.active = true;
            this.exportCloseTxt.active = false;
            this.unschedule(this.showExportClose)
            return;
        }
        closeLabel.string = `剩余${this.mSecond}秒可关闭`


    }


    private displayAd(visible: boolean) {

        this.floatContainer.active = visible && this.hasAd(AD_POSITION.FLOAT);

        this.bannerContainer.active = visible && this.hasAd(AD_POSITION.BANNER);

        this.centerContainer.active = visible && this.hasAd(AD_POSITION.CENTER);

        this.leftContainer.active = visible && this.hasAd(AD_POSITION.LEFTRIGHT);

        this.exportMask.active = visible && this.hasAd(AD_POSITION.MASK);

        this.sideContainer.active = visible && this.hasAd(AD_POSITION.SIDE);


        this.exportClose.active = false;
        this.exportCloseTxt.active = false;

        this.unschedule(this.showExportClose)

        if (this.hasAd(AD_POSITION.BACK)) {
            if (this.hasAd(AD_POSITION.WAIT)) {
                this.mSecond = 3;
                this.showExportClose();
                this.schedule(this.showExportClose, 1);
            }
            else {
                this.exportClose.active = true;
                this.exportCloseTxt.active = false;
            }
        }
        else {
            this.exportClose.active = false;
            this.exportCloseTxt.active = false;
        }

        this.exportContainer.active = visible && this.hasAd(AD_POSITION.EXPORT)
        if (visible && this.hasAd(AD_POSITION.EXPORT)) {
            moosnow.http.getAllConfig(res => {
                if (res.exportAutoNavigate == 1) {
                    moosnow.platform.navigate2Mini(this.mAdData.indexLeft[Common.randomNumBoth(0, this.mAdData.indexLeft.length - 1)])
                }
            })
        }

    }

}