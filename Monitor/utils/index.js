var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (window) {
    if (!sessionStorage) {
        // window.sessionStorage = new Object();
    }
    var 
    // 用fetch方式请求接口时，暂存接口url
    fetchHttpUrl = null
    // 自动上传日志记录的定时器
    , webMonitorUploadTimer = null
    // 暂存本地用于保存日志信息的数组
    , uploadMessageArray = null
    // onerror 错误监控启动状态
    , jsMonitorStarted = false
    // 上传日志的开关，如果为false，则不再上传
    , uploadRemoteServer = true
    // 保存图片对应的描述，同一个描述只保存一次
    , screenShotDescriptions = []
    // 屏幕截图字符串
    // , tempScreenShot = ""
    // 获取当前url
    , defaultLocation = window.location.href.split('?')[0].replace('#', '')
    // 页面加载对象属性
    , timingObj = performance && performance.timing
    // 获取页面加载的具体属性
    , resourcesObj = (function () {
        if (performance && typeof performance.getEntries === 'function') {
            return performance.getEntries();
        }
        return null;
    })();
    /** 常量 **/
    var 
    // 所属项目ID, 用于替换成相应项目的UUID，生成监控代码的时候搜索替换
    WEB_MONITOR_ID = sessionStorage.CUSTOMER_WEB_MONITOR_ID || 'gongpengji'
    // 判断是http或是https的项目
    , WEB_HTTP_TYPE = window.location.href.indexOf('https') === -1 ? 'http://' : 'https://'
    // 获取当前页面的URL
    , WEB_LOCATION = window.location.href
    // 本地IP, 用于区分本地开发环境
    , WEB_LOCAL_IP = 'localhost'
    // 应用的主域名, 用于主域名下共享customerKey
    , MAIN_DOMAIN = '&&&gongpengji&&&'
    // 监控平台地址
    , WEB_MONITOR_IP = '&&&gongpengji&&&'
    // 上传数据的uri, 区分了本地和生产环境
    , HTTP_UPLOAD_URI = WEB_LOCATION.indexOf(WEB_LOCAL_IP) == -1 ? WEB_HTTP_TYPE + WEB_MONITOR_IP : WEB_HTTP_TYPE + WEB_LOCAL_IP + ':8011'
    // 上传数据的接口API
    , HTTP_UPLOAD_LOG_API = '/server/upLog' // '/api/v1/upLog'
    // 上传数据时忽略的uri, 需要过滤掉监控平台上传接口
    , WEB_MONITOR_IGNORE_URL = HTTP_UPLOAD_URI + HTTP_UPLOAD_LOG_API
    // 上传数据的接口
    , HTTP_UPLOAD_LOG_INFO = HTTP_UPLOAD_URI + HTTP_UPLOAD_LOG_API
    // 获取当前项目的参数信息的接口
    , HTTP_PROJECT_INFO = HTTP_UPLOAD_URI + '/server/project/getProject'
    // 上传埋点数据接口
    , HTTP_UPLOAD_RECORD_DATA = HTTP_UPLOAD_URI + ''
    // 用户访问日志类型
    , CUSTOMER_PV = 'CUSTOMER_PV'
    // 用户加载页面信息类型
    , LOAD_PAGE = 'LOAD_PAGE'
    // 接口日志类型
    , HTTP_LOG = 'HTTP_LOG'
    // 接口错误日志类型
    , HTTP_ERROR = 'HTTP_ERROR'
    // js报错日志类型
    , JS_ERROR = 'JS_ERROR'
    // 截屏类型
    , SCREEN_SHOT = 'SCREEN_SHOT'
    // 用户的行为类型
    , ELE_BEHAVIOR = 'ELE_BEHAVIOR'
    // 静态资源类型
    , RESOURCE_LOAD = 'RESOURCE_LOAD'
    // 用户自定义行为类型
    , CUSTOMIZE_BEHAVIOR = 'CUSTOMIZE_BEHAVIOR'
    // 用户录屏事件类型
    , VIDEOS_EVENT = 'VIDEOS_EVENT'
    // 浏览器信息
    , BROWSER_INFO = window.navigator.userAgent
    // 工具类示例化
    // , utils = new MonitorUtils()
    // 设备信息
    // , DEVICE_INFO = utils.getDevice()
    // 监控代码空构造函数
    , WebMonitor = {}
    // 获取用户自定义信息
    , USER_INFO = localStorage.wmUserInfo ? JSON.parse(localStorage.wmUserInfo) : {}
    // 录屏JSON字符简化
    , JSON_KEY = { "type": "≠", "childNodes": "ā", "name": "á", "id": "ǎ", "tagName": "à", "attributes": "ē", "style": "é", "textContent": "ě", "isStyle": "è", "isSVG": "ī", "content": "í", "href": "ǐ", "src": "ì", "class": "ō", "tabindex": "ó", "aria-label": "ǒ", "viewBox": "ò", "focusable": "ū", "data-icon": "ú", "width": "ǔ", "height": "ù", "fill": "ǖ", "aria-hidden": "ǘ", "stroke": "ǚ", "stroke-width": "ǜ", "paint-order": "ü", "stroke-opacity": "ê", "stroke-dasharray": "ɑ", "stroke-linecap": "?", "stroke-linejoin": "ń", "stroke-miterlimit": "ň", "clip-path": "Γ", "alignment-baseline": "Δ", "fill-opacity": "Θ", "transform": "Ξ", "text-anchor": "Π", "offset": "Σ", "stop-color": "Υ", "stop-opacity": "Φ" }, JSON_CSS_KEY = { "background": "≠", "background-attachment": "ā", "background-color": "á", "background-image": "ǎ", "background-position": "à", "background-repeat": "ē", "background-clip": "é", "background-origin": "ě", "background-size": "è", "border": "Г", "border-bottom": "η", "color": "┯", "style": "Υ", "width": "б", "border-color": "ū", "border-left": "ǚ", "border-right": "ň", "border-style": "Δ", "border-top": "З", "border-width": "Ω", "outline": "α", "outline-color": "β", "outline-style": "γ", "outline-width": "δ", "left-radius": "Ж", "right-radius": "И", "border-image": "ω", "outset": "μ", "repeat": "ξ", "repeated": "π", "rounded": "ρ", "stretched": "σ", "slice": "υ", "source": "ψ", "border-radius": "Б", "radius": "Д", "box-decoration": "Й", "break": "К", "box-shadow": "Л", "overflow-x": "Ф", "overflow-y": "У", "overflow-style": "Ц", "rotation": "Ч", "rotation-point": "Щ", "opacity": "Ъ", "height": "Ы", "max-height": "Э", "max-width": "Ю", "min-height": "Я", "min-width": "а", "font": "в", "font-family": "г", "font-size": "ж", "adjust": "з", "aspect": "и", "font-stretch": "й", "font-style": "к", "font-variant": "л", "font-weight": "ф", "content": "ц", "before": "ч", "after": "ш", "counter-increment": "щ", "counter-reset": "ъ", "quotes": "ы", "list-style": "+", "image": "－", "position": "|", "type": "┌", "margin": "┍", "margin-bottom": "┎", "margin-left": "┏", "margin-right": "┐", "margin-top": "┑", "padding": "┒", "padding-bottom": "┓", "padding-left": "—", "padding-right": "┄", "padding-top": "┈", "bottom": "├", "clear": "┝", "clip": "┞", "cursor": "┟", "display": "┠", "float": "┡", "left": "┢", "overflow": "┣", "right": "┆", "top": "┊", "vertical-align": "┬", "visibility": "┭", "z-index": "┮", "direction": "┰", "letter-spacing": "┱", "line-height": "┲", "text-align": "6", "text-decoration": "┼", "text-indent": "┽", "text-shadow": "10", "text-transform": "┿", "unicode-bidi": "╀", "white-space": "╂", "word-spacing": "╁", "hanging-punctuation": "╃", "punctuation-trim": "1", "last": "3", "text-emphasis": "4", "text-justify": "5", "justify": "7", "text-outline": "8", "text-overflow": "9", "text-wrap": "11", "word-break": "12", "word-wrap": "13" }
    // LZString 加载标识
    , LZStringFlag = false;
    var Monitor = /** @class */ (function () {
        function Monitor() {
            this.init();
        }
        Monitor.prototype.init = function () {
            console.log(1);
        };
        return Monitor;
    }());
    var MonitorBaseInfo = /** @class */ (function () {
        function MonitorBaseInfo() {
        }
        MonitorBaseInfo.prototype.handleLogInfo = function (type, logInfo) {
            var tempString = localStorage[type] ? localStorage[type] : "";
            switch (type) {
                case ELE_BEHAVIOR:
                    localStorage[ELE_BEHAVIOR] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                case JS_ERROR:
                    localStorage[JS_ERROR] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                case HTTP_LOG:
                    localStorage[HTTP_LOG] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                case SCREEN_SHOT:
                    localStorage[SCREEN_SHOT] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                case CUSTOMER_PV:
                    localStorage[CUSTOMER_PV] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                case LOAD_PAGE:
                    localStorage[LOAD_PAGE] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                case RESOURCE_LOAD:
                    localStorage[RESOURCE_LOAD] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                case CUSTOMIZE_BEHAVIOR:
                    localStorage[CUSTOMIZE_BEHAVIOR] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                case VIDEOS_EVENT:
                    localStorage[VIDEOS_EVENT] = tempString + JSON.stringify(logInfo) + '$$$';
                    break;
                default: break;
            }
        };
        return MonitorBaseInfo;
    }());
    var CustomerPV = /** @class */ (function (_super) {
        __extends(CustomerPV, _super);
        function CustomerPV(uploadType) {
            var _this = _super.call(this) || this;
            _this.uploadType = uploadType;
            _this.projectVersion = utils.b64EncodeUnicode(USER_INFO.projectVersion || ""); // 版本号， 用来区分监控应用的版本，更有利于排查问题
            _this.pageKey = utils.getPageKey(); // 用于区分页面，所对应唯一的标识，每个新页面对应一个值
            _this.deviceName = DEVICE_INFO.deviceName;
            _this.os = DEVICE_INFO.os + (DEVICE_INFO.osVersion ? " " + DEVICE_INFO.osVersion : "");
            _this.browserName = DEVICE_INFO.browserName;
            _this.browserVersion = DEVICE_INFO.browserVersion;
            // TODO 位置信息, 待处理
            _this.monitorIp = ""; // 用户的IP地址
            _this.country = "china"; // 用户所在国家
            _this.province = ""; // 用户所在省份
            _this.city = ""; // 用户所在城市
            _this.loadType = loadType; // 用以区分首次加载
            _this.loadTime = loadTime; // 加载时间
            return _this;
        }
        return CustomerPV;
    }(MonitorBaseInfo));
    window.gongpengji = {
        /**
         * 埋点上传数据
         * @param url 当前页面的url
         * @param type 埋点类型
         * @param index 埋点顺序
         * @param description 其他信息描述
         */
        wm_upload: function (url, type, index, description) {
            var createTime = new Date().toString();
            var logParams = {
                createTime: encodeURIComponent(createTime),
                happenTime: new Date().getTime(),
                uploadType: 'WM_UPLOAD',
                simpleUrl: encodeURIComponent(encodeURIComponent(url)),
                webMonitorId: WEB_MONITOR_ID,
                recordType: type,
                recordIndex: index,
                description: description
            };
            var http_api = HTTP_UPLOAD_RECORD_DATA;
            var recordDataXmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
            recordDataXmlHttp.open('POST', http_api, true);
            recordDataXmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            recordDataXmlHttp.send('data=' + JSON.stringify([logParams]));
        },
        /**
         * 使用者传入的自定义信息
         *
         * @param userId
         * @param userName
         * @param userTpye
         */
        wm_init_user: function (userId, userTag, secondUserParam) {
            if (!userId)
                console.warn('userId 初始化值为0(不推荐) 或者 未初始化');
            if (!secondUserParam)
                console.warn('secondParam 初始化值为0(不推荐) 或者 未初始化');
            // 如果用户传入了userTag值，重新定义WEB_MONITOR_ID
            if (userTag) {
                WEB_MONITOR_ID = userTag + "_webmonitor";
            }
            localStorage.wmUserInfo = JSON.stringify({
                userId: userId,
                userTag: userTag,
                secondUserParam: secondUserParam
            });
            return 1;
        },
        /**
         * 使用者传入的自定义信息
         *
         * @param userId 用户唯一标识
         * @param projectVersion 应用版本号
         */
        wmInitUser: function (userId, projectVersion) {
            if (!userId)
                console.warn('userId(用户唯一标识) 初始化值为0(不推荐) 或者 未传值, 探针可能无法生效');
            if (!projectVersion)
                console.warn('projectVersion(应用版本号) 初始化值为0(不推荐) 或者 未传值, 探针可能无法生效');
            localStorage.wmUserInfo = JSON.stringify({
                userId: userId,
                projectVersion: projectVersion
            });
            return 1;
        },
        /**
         * 使用者传入的自定义截屏指令, 由探针代码截图
         * @param description  截屏描述
         */
        wm_screen_shot: function (description) {
            utils.screenShot(document.body, description);
        },
        /**
         * 使用者传入图片进行上传
         * @param compressedDataURL 图片的base64编码字符串，description 图片描述
         */
        wm_upload_picture: function (compressedDataURL, description, imgType) {
            var screenShotInfo = new ScreenShotInfo(SCREEN_SHOT, description, compressedDataURL, imgType || "jpeg");
            screenShotInfo.handleLogInfo(SCREEN_SHOT, screenShotInfo);
        },
        /**
         * 使用者自行上传的行为日志
         * @param userId 用户唯一标识
         * @param behaviorType 行为类型
         * @param behaviorResult 行为结果（成功、失败等）
         * @param uploadType 日志类型（分类）
         * @param description 行为描述
         */
        wm_upload_extend_log: function (userId, behaviorType, behaviorResult, uploadType, description) {
            var extendBehaviorInfo = new ExtendBehaviorInfo(userId, behaviorType, behaviorResult, uploadType, description);
            extendBehaviorInfo.handleLogInfo(CUSTOMIZE_BEHAVIOR, extendBehaviorInfo);
        }
    };
    (function () {
        if (typeof window.CustomEvent === "function")
            return false;
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    })();
    new Monitor();
})(window);
