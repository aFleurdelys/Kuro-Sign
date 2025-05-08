import fetch from 'node-fetch'


export class KuroApi {
  constructor () {
    this.token = process.env.token
    this.kuroApiUrl = 'https://api.kurobbs.com'
  }

  async getData (key = '', data = {}) {
    let { url, body = '' } = await this.getKuroApi(key, data)
    let headers = this.headers || await this.getHeaders(url)
    try {
      let response = await fetch(url, {
        method: 'post',
        headers: headers,
        body: body
      })
      if (!response.ok) {
        return { code: response.status, msg: response.statusText }
      }
      return await response.json()
    } catch (e) {
      return { code: e.code, msg: e.msg }
    }
  }

  async getKuroApi (name, data) {
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
        url: `${ this.kuroApiUrl }/user/mineV2`,
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
    return ApiMap[name]
  }

  async getHeaders (url = '') {
    let headers = {
      Host: 'api.kurobbs.com',
      Connection: 'keep-alive',
      source: 'android',
      token: this.token,
      devCode: '171.37.188.39, Mozilla/5.0 (... Chrome/97 Mobile Safari/537.36 Kuro/2.4.2 KuroGameBox/2.4.2)',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'Mozilla/5.0 (... Chrome/97 Mobile Safari/537.36 Kuro/2.4.2 KuroGameBox/2.4.2)',
      Accept: 'application/json, text/plain, */*',
      Origin: 'https://web-static.kurobbs.com',
      'X-Requested-With': 'com.kurogame.kjq',
      'Accept-Language': 'zh-CN,zhq=0.9,en-USq=0.8,enq=0.7'
    }
    if (/(default|user|forum|level|gold)/.test(url)) {
      headers.devCode = ''
      headers.version = '2.4.2'
      headers.versionCode = '2420'
      headers.model = 'PCLM10'
      headers.Cookie = `user_token=${ this.token }`
      headers['User-Agent'] = 'okhttp/3.11.0'
    }
    return this.headers = headers
  }

}


export default new KuroApi()

