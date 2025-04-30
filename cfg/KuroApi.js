import fetch from "node-fetch";

export class KuroApi {
    constructor() {
        this.token = process.env.token;
        this.headers = {
            "Host": "api.kurobbs.com",
            "Connection": "keep-alive",
            "Content-Length": "85",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            "b-at": "f7158ce6b2234299b8bce6ccf04e37d3",
            "User-Agent": "Mozilla/5.0 (Linux; Android 12; PCLM10 Build/SKQ1.211113.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36 Kuro/2.4.2 KuroGameBox/2.4.2",
            "Content-Type": "application/x-www-form-urlencoded",
            "did": "0A138351777EFC8605D59F7A035452E0D93F0F0F",
            "Accept": "application/json, text/plain, */*",
            "devCode": "171.37.188.39, Mozilla/5.0 (Linux; Android 12; PCLM10 Build/SKQ1.211113.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36 Kuro/2.4.2 KuroGameBox/2.4.2",
            "token": this.token,
            "source": "android",
            "Origin": "https://web-static.kurobbs.com",
            "X-Requested-With": "com.kurogame.kjq",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        };
        this.kuroApiUrl = 'https://api.kurobbs.com'
    }

    async getData(key = '', data = {}) {
        let { url, body = '' } = await this.getKuroApi(key, data)
        try {
            let response = await fetch(url, {
                method: 'post',
                headers: this.headers,
                body: body
            })
            if (!response.ok) {
                return false
            }
            return await response.json()
        } catch (e) {
            console.log(e);
        }
    }

    async getKuroApi(name, data) {
        let ApiMap = {
            // 取绑定游戏账号列表
            roleList: {
                url: `${ this.kuroApiUrl }/gamer/role/default`,
            },
            // 鸣潮、战双小组件
            widget: {
                url: `${ this.kuroApiUrl }/gamer/widget/game${ data.gameId }/getData`,
                body: `type=${ data.type }&sizeType=${ data.sizeType }`
            },
            // 取签到配置信息 V2
            initSignIn: {
                url: `${ this.kuroApiUrl }/encourage/signIn/initSignInV2`,
                body: `gameId=${ data.gameId }&serverId=${ data.serverId }&roleId=${ data.roleId }&userId=${ data.userId }`,
            },
            // 游戏签到 V2
            signin: {
                url: `${ this.kuroApiUrl }/encourage/signIn/v2`,
                body: `gameId=${ data.gameId }&serverId=${ data.serverId }&roleId=${ data.roleId }&userId=${ data.userId }&reqMonth=${ data.reqMonth }`,
            },
            // 取游戏签到记录 V2
            queryRecord: {
                url: `${ this.kuroApiUrl }/encourage/signIn/queryRecordV2`,
                body: `gameId=${ data.gameId }&serverId=${ data.serverId }&roleId=${ data.roleId }&userId=${ data.userId }`,
            },
            // 战双资源
            month: {
                url: `${ this.kuroApiUrl }/haru/resource/currentMonth`,
                body: `roleId=${ data.roleId }`
            },
            // 取个人信息
            mine: {
                url: `${ this.kuroApiUrl }/user/mine`,
            },
            // 社区签到
            forumSignIn: {
                url: `${ this.kuroApiUrl }/user/signIn`,
                body: `gameId=${ data.gameId }`,
            },
            //取帖子列表
            forumList: {
                url: `${ this.kuroApiUrl }/forum/list`,
                body: `forumId=${ data.forumId }&gameId=${ data.gameId }&pageIndex=${ data.pageIndex }&pageSize=${ data.pageSize }`,
            },
            //取帖子详情
            postDetail: {
                url: `${ this.kuroApiUrl }/forum/getPostDetail`,
                body: `postId=${ data.postId }`,
            },
            //通用论坛点赞
            like: {
                url: `${ this.kuroApiUrl }/forum/like`,
                body: `forumId=${ data.forumId }&gameId=${ data.gameId }&postId=${ data.postId }&toUserId=${ data.toUserId }`,
            },
            // 社区分享任务
            shareTask: {
                url: `${ this.kuroApiUrl }/encourage/level/shareTask`,
                body: `gameId=${ data.gameId }&postId=${ data.postId }`,
            },
            // 取任务列表
            taskList: {
                url: `${ this.kuroApiUrl }/encourage/level/getTaskProcess`,
                body: `gameId=0&userId=${ data.userId }`,
            },
            // 取库洛币总数
            totalGold: {
                url: `${ this.kuroApiUrl }/encourage/gold/getTotalGold`,
            },
        }
        return ApiMap[name];
    }
}


export default new KuroApi();

