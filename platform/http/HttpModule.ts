import BaseModule from "../framework/BaseModule";
import Common from "../utils/Common";
import { PlatformType } from "../enum/PlatformType";
import { MSG } from "../config/MSG";
import { ENGINE_TYPE } from "../enum/ENGINE_TYPE";


let ErrorType = {
    ONERROR: "HTTP协议链接出错",
    ONTIMEOUT: "HTTP协议链接超时",
    POSTERROR: "HTTP协议请求出错",
    RETURNERROR: "服务器返回错误code"
};
let GAME_COMMAND = {
    VERIFY_USER: 1,
    CREATE_ROLE: 2,
    CAPTAIN: 3
}


export class HttpModule extends BaseModule {

    private appid: string = "";
    private secret: string = "";
    private versionNumber: string = "";
    public version: string = "2.0.4";
    public baseUrl: string = "https://api.liteplay.com.cn/";
    private _cdnUrl = "https://liteplay-1253992229.cos.ap-guangzhou.myqcloud.com";

    constructor() {
        super();



        let versionUrl = `${this._cdnUrl}/SDK/version.json?t=` + Date.now();
        if (Common.platform == PlatformType.PC) {
            this.request(versionUrl, {}, 'GET', (res) => {
                if (this.version < res.version) {
                    console.warn(`您的SDK版本号[${this.version}]不是最新版本，请尽快升级，最新版本[${res.version}]  下载地址：${res.download}`)
                    if (!Common.isEmpty(res.memo))
                        console.warn(`${res.memo}`)
                }

            })
        }
        else if (Common.platform == PlatformType.WX && window["wx"]) {
            this.request(versionUrl, {}, 'GET', (res) => {
                let aldVersion = window["wx"]["aldVersion"]
                if (!aldVersion || (aldVersion && aldVersion < res.aldVersion))
                    console.warn(`阿拉丁文件错误，请重新下载${res.aldUrl}`)
            })
        }



        this.getShareInfo((data) => {
            moosnow.platform.initShare(data);
        });

        this.loadCfg((res) => {
            console.log('remote config ', res)
        })

    }


    private mLaunchOptions: any = {};
    private get appLaunchOptions() {
        if (!this.mLaunchOptions) {
            if (moosnow.platform && moosnow.platform.getLaunchOption)
                this.mLaunchOptions = moosnow.platform.getLaunchOption();
        }

        return this.mLaunchOptions;
    }




    /**
     * 请求服务
     * @param {*} url 
     * @param {*} data 
     * @param {*} method 
     * @param {*} success 
     * @param {*} fail 
     * @param {*} complete 
     */
    public request(url: string, data: any, method: 'POST' | 'GET', success?: Function, fail?: Function, complete?: Function) {
        let newUrl = "";
        // if (moosnow && moosnow.platform && moosnow.platform.getSystemInfoSync) {
        //     let sys = moosnow.platform.getSystemInfoSync();
        //     if (sys && sys.brand && sys.brand.toLocaleLowerCase().indexOf("vivo") != -1) {
        //         let originUrl = "https://liteplay-1253992229.cos.ap-guangzhou.myqcloud.com/"
        //         let cdnUrl = "https://cdn.liteplay.com.cn/"
        //         newUrl = url.replace(originUrl, cdnUrl);
        //         if (newUrl.indexOf('?') == -1) {
        //             newUrl += '?t1=' + Date.now();
        //         }
        //         else
        //             newUrl += '&t1=' + Date.now();
        //     }
        //     else
        //         newUrl = url;
        // }
        // else
        newUrl = url;


        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var response = xhr.responseText;
                if (xhr.status >= 200 && xhr.status < 400) {
                    var result = {};
                    try {
                        result = JSON.parse(response)
                    }
                    catch (e) {
                        console.error('json parse error ', response)
                        if (fail)
                            fail(e);
                    }
                    // }
                    if (success)
                        success(result);
                }
                else {
                    console.warn('error ', response)
                    if (fail)
                        fail(response);
                }
            }
            else {
                // cc.log('caller state change  ', xhr)
                // console.log('caller state change  ', xhr)
            }
        };
        xhr.timeout = 10000;
        xhr.ontimeout = function (event) {
            console.error('error ', event)
            if (fail)
                fail(event);
        }

        if (method == "POST") {
            xhr.open('POST', newUrl);
            xhr.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
            xhr.send(this._object2Query(data));
        }
        else {
            xhr.open(method, newUrl, true);
            xhr.send();
        }
    }
    public _object2Query(obj) {
        var args = []
        for (var k in obj)
            args.push(k + "=" + obj[k])
        return args.join("&"); // 返回对象  
    }

    public isDisableArea(callback) {

    }

    /**
       * Loading加载完成
       */
    public finishLoading() {
        this.postData('api/channel/validUser.html')
    }
    /**
      * 点击了banner
      */
    public clickBanner() {
        this.postData('api/channel/clickBanner.html')
    }

    /**
     * 看完了视频
     */
    public clickVideo() {
        this.postData('api/channel/clickVideo.html')
    }

    /**
     * 导出跳转
     */
    public exportUser() {
        this.postData('api/channel/exportUser.html')
    }

    /**
     * 跳转记录
     * @param jump_appid 
     * @param callback 
     */
    public navigate(jump_appid: string, callback: Function) {
        let userToken = moosnow.data.getToken();
        this.request(`${this.baseUrl}api/jump/record`, {
            appid: Common.config.moosnowAppId,
            uid: userToken,
            jump_appid,
        }, "POST", (respone) => {
            console.log('navigate', respone)
            if (callback)
                callback(respone.data)
        });
    }


    /**
     * 跳转完成
     * @param code 
     */
    public navigateEnd(code: string) {
        this.request(`${this.baseUrl}api/jump/status`, {
            code
        }, "POST", (respone) => {
            console.log('navigateEnd code ', code, respone)
        });
    }


    /**
     * 
     * @param url 
     */
    private postData(url) {
        let userToken = moosnow.data.getToken();

        if (!Common.isEmpty(userToken) && moosnow.data.getChannelId() != "0" && moosnow.data.getChannelAppId() != "0") {
            try {
                this.request(`${this.baseUrl}${url}`, {
                    appid: Common.config.moosnowAppId,
                    user_id: userToken,
                    channel_id: moosnow.data.getChannelId(),
                    channel_appid: moosnow.data.getChannelAppId()
                }, "POST", (respone) => {

                });
            }
            catch (e) {
                console.log('postData error ', e)
            }

        }
    }



    /**
     * 数据打点
     * @param name  打点名称
     */
    public point(name: string, data: any = null) {
        if (Common.platform == PlatformType.WX) {
            if (window['wx'] && window['wx'].aldSendEvent)
                (window['wx'] as any).aldSendEvent(name, data);
        }
    }

    /**
    * 统计开始游戏
    * @param {string} level 关卡数 必须是1 || 2 || 1.1 || 12.2 格式
    */
    public startGame(level: string) {
        if (Common.platform == PlatformType.WX)
            if (window['wx'] && window['wx'].aldStage)
                window['wx'].aldStage.onStart({
                    stageId: level, //关卡ID， 必须是1 || 2 || 1.1 || 12.2 格式  该字段必传
                    stageName: level,//关卡名称，该字段必传
                    userId: moosnow.data.getToken() //用户ID
                });
            else
                console.warn(MSG.ALD_FILE_NO_IMPORT)
    }
    /**
     * 统计结束游戏
     * @param {string} level 关卡数 必须是1 || 2 || 1.1 || 12.2 格式
     * @param {boolean} isWin 是否成功
     */
    public endGame(level: string, isWin: boolean) {
        if (Common.platform != PlatformType.WX) return;

        var event = isWin ? "complete" : "fail";
        var desc = isWin ? "关卡完成" : "关卡失败";
        if (window['wx'] && window['wx'].aldStage)
            window['wx'].aldStage.onEnd({
                stageId: level, //关卡ID， 必须是1 || 2 || 1.1 || 12.2 格式  该字段必传
                stageName: level,//关卡名称，该字段必传
                userId: moosnow.data.getToken(), //用户ID
                event: event,   //关卡完成  关卡进行中，用户触发的操作    该字段必传
                params: {
                    desc: desc   //描述
                }
            });
        else
            console.warn(MSG.ALD_FILE_NO_IMPORT)
    }
    /**
     * 视频统计
     * @param {number} type 0：视频点击 1：视频观看完成
     * @param {string} info 信息 ex:“领取三倍金币”
     * @param {string} level 关卡数
     */
    public videoPoint(type, info: string, level: string) {
        if (Common.platform != PlatformType.WX) return;
        var name = type == 0 ? "点击视频" : "观看完成视频";
        if (window['wx'] && window['wx'].aldSendEvent)
            window['wx'].aldSendEvent(name, { info, level: level + "" });
        else
            console.warn(MSG.ALD_FILE_NO_IMPORT)

    }

    /**
     * 
     * @param callback 
     */
    public getAllConfig(callback: Function) {
        this.loadCfg(res => {
            this.loadArea(res2 => {
                this.disableAd(res, res2, (disable) => {
                    let exportAutoNavigate = 0;
                    if (disable) {
                        //exportAutoNavigate 是否自动唤起跳转（强导） 0 关闭 1 开启(受屏蔽地区影响) 2开启（不受屏蔽地区影响）

                        if (res.exportAutoNavigate == 1)
                            exportAutoNavigate = 0
                        if (res.exportAutoNavigate == 2)
                            exportAutoNavigate = 1
                        callback({
                            ...res,
                            mistouchNum: 0,
                            mistouchPosNum: 0,
                            mistouchInterval: 0,
                            exportBtnNavigate: 0,
                            exportAutoNavigate,
                            bannerShowCountLimit: 1,
                            isLimitArea: 1
                        })
                    }
                    else {
                        if (res.exportAutoNavigate == 2)
                            exportAutoNavigate = 1;
                        callback({
                            ...res,
                            exportAutoNavigate,
                            isLimitArea: 0
                        })
                    }
                })
            })
        })
    }


    public cfgData = null;
    public areaData = null;
    public _cfgQuene = [];
    public loadCfg(callback) {
        if (!Common.isEmpty(this.cfgData)) {
            callback(this.cfgData);
        }
        else {
            this._cfgQuene.push(callback);
            if (this._cfgQuene.length > 1)
                return

            var url = "";
            if (Common.config.url)
                url = Common.config.url + "?t=" + Date.now();
            else
                url = `${this._cdnUrl}/config/${Common.config.moosnowAppId}.json?t=${Date.now()}`;


            if (Common.platform == PlatformType.WX) {
                let options = this.appLaunchOptions();
                [1005]
            }

            this.request(url, {}, 'GET',
                (res) => {
                    //总开关控制
                    let mistouchOn = res && res.mistouchOn == 1 ? true : false;
                    this.cfgData = {
                        ...Common.deepCopy(res),
                        zs_native_click_switch: res && res.mx_native_click_switch ? res.mx_native_click_switch : 0,
                        zs_jump_switch: res && res.mx_jump_switch ? res.mx_jump_switch : 0,
                        mistouchNum: mistouchOn ? res.mistouchNum : 0,
                        mistouchPosNum: mistouchOn ? res.mistouchPosNum : 0,
                        mistouchInterval: mistouchOn ? res.mistouchInterval : 0,
                        exportAutoNavigate: mistouchOn ? res.exportAutoNavigate : 0,
                        exportBtnNavigate: mistouchOn ? res.exportBtnNavigate : 0,

                    };
                    if (moosnow.platform) {
                        moosnow.platform.bannerShowCountLimit = parseInt(res.bannerShowCountLimit);
                    }
                    this._cfgQuene.forEach(item => {
                        item(this.cfgData);
                    })
                    this._cfgQuene = [];
                },
                () => {
                    this._cfgQuene.forEach(item => {
                        item({
                            mistouchNum: 0,
                            mistouchPosNum: 0,
                            bannerShowCountLimit: 1,
                            exportAutoNavigate: 0
                        });
                    })
                    this._cfgQuene = [];
                    console.log('load config json fail');
                }
            );
        }

    }
    private _localQuene = [];
    public loadArea(callback) {
        if (this.areaData) {
            callback(this.areaData)
        }
        else {

            this._localQuene.push(callback);
            if (this._localQuene.length > 1)
                return;

            let ipUrl = `${this.baseUrl}admin/wx_config/getLocation`;
            this.request(ipUrl, {}, 'GET', (res2) => {
                this.areaData = res2;
                this._localQuene.forEach(item => {
                    item(this.areaData)
                })
                this._localQuene = [];
            }, () => {
                this._localQuene.forEach(item => {
                    item(this.areaData)
                })
                this._localQuene = [];
            })
        }

    }

    public getForceExport(callback) {
        this.loadCfg(res => {
            this.loadArea(res2 => {
                this.disabledForceExport(res, res2, (disable) => {
                    callback(disable)
                })
            })
        })

    }

    public disabledForceExport(res, res2, callback) {
        let curTime = Common.formatTime(new Date())
        let inDisabledRegion = false;
        if (res.disabledForceExport) {
            for (let i = 0; i < res.disabledForceExport.length; i++) {
                let region = res.disabledForceExport[i];
                if (res2.data.city.indexOf(region) != -1
                    || res2.data.province.indexOf(region) != -1
                    || res2.data.area.indexOf(region) != -1) {
                    inDisabledRegion = true;
                    break;
                }
            }
        }

        if (inDisabledRegion) {
            if (res.forceExportTime && res.forceExportTime.length == 2) {
                if (curTime > res.forceExportTime[0] && curTime < res.forceExportTime[1]) {
                    callback(true)
                }
                else {
                    callback(false)
                }
            }

            else {
                callback(true)
            }
        }
        else {
            callback(false)
        }
    }



    /**
     * 获取误点间隔次数，启动游戏时调用
     * @param {Funtion} callback 回调参数为misTouchNum:int，当misTouchNum=0时关闭误点，当misTouchNum=n(0除外)时，每隔n次，触发误点1次
     */
    public getMisTouchNum(callback) {
        this.loadCfg(res => {
            this.loadArea(res2 => {
                this.disableAd(res, res2, (disable) => {
                    if (disable) {
                        callback(0)
                        console.log('getMisTouchNum', 0, 'disableAd', disable)
                    }
                    else {
                        callback(parseInt(res.mistouchNum))
                        console.log('getMisTouchNum', res.mistouchNum, 'disableAd', disable)
                    }
                })
            })
        })
    }
    /**
      * 获取位移间隔次数，启动游戏时调用
      * @param {Funtion} callback 回调参数为mistouchPosNum:int，当misTouchNum=0时关闭误点，当mistouchPosNum=n(0除外)时，每隔n次，触发误点1次
      */
    public getMistouchPosNum(callback) {
        this.loadCfg(res => {
            this.loadArea(res2 => {
                this.disableAd(res, res2, (disable) => {
                    if (disable) {
                        callback(0)
                        console.log('getMistouchPosNum', 0, 'disableAd', disable)
                    }
                    else {
                        callback(parseInt(res.mistouchPosNum))
                        console.log('getMistouchPosNum', res.mistouchPosNum, 'disableAd', disable)
                    }
                })
            })
        })
    }

    public getBannerShowCountLimit(callback) {
        this.loadCfg(res => {
            if (isNaN(res.bannerShowCountLimit))
                callback(5);
            else
                callback(parseInt(res.bannerShowCountLimit))
        })
    }



    private disableAd(res, res2, callback) {
        let curTime = Common.formatTime(new Date())
        let inDisabledRegion = false;
        if (res && res.disabledRegion) {
            for (let i = 0; i < res.disabledRegion.length; i++) {
                let region = res.disabledRegion[i];
                if (res2 && res2.data && (res2.data.city.indexOf(region) != -1
                    || res2.data.province.indexOf(region) != -1
                    || res2.data.area.indexOf(region) != -1)) {
                    inDisabledRegion = true;
                    break;
                }
            }
        }
        if (this.appLaunchOptions && res) {
            if ((res.seachEntryOn == 1 && res.seachEntryScene && res.seachEntryScene.indexOf(this.appLaunchOptions.scene) != -1)
                || (res.shareEntryOn == 1 && res.shareEntryScene && res.shareEntryScene.indexOf(this.appLaunchOptions.scene) != -1)) {
                callback(true)
                console.log('appLaunchOptions', this.appLaunchOptions);
                return;
            }
        }
        if (inDisabledRegion) {
            if (res.disabledTime && res.disabledTime.length == 2) {
                if (curTime > res.disabledTime[0] && curTime < res.disabledTime[1]) {
                    callback(true)
                }
                else {
                    callback(false)
                }
            }

            else {
                callback(true)
            }
        }
        else {
            callback(false)
        }

    }

    public getShareInfo(cb) {
        this.request(`${this._cdnUrl}/share/${Common.config.moosnowAppId}.json`, {
            appid: Common.config.moosnowAppId
        }, "GET", (res) => {
            cb(res);
            moosnow.platform.initShare(res);
        }, () => {
            this.request(`${this.baseUrl}admin/wx_share/getShare`, {
                appid: Common.config.moosnowAppId
            }, "POST", (res) => {
                console.log('分享数据', res.data)
                cb(res.data);
                moosnow.platform.initShare(res.data);
            });
        });
    }
}

