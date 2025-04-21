import fetch from 'node-fetch'

// 取绑定游戏账号列表
let gameRoles =  `https://api.kurobbs.com/gamer/role/default`
// 取签到配置信息 V2
let initSignIn =  'https://api.kurobbs.com/encourage/signIn/initSignInV2'
// 游戏签到 V2
let gameSignIn =  'https://api.kurobbs.com/encourage/signIn/v2'
// 社区签到
let forumSignIn =  'https://api.kurobbs.com/user/signIn'

async function sendMessage (msg) {
  try {
    let params = {
      "touser": "@all",
      "toparty": "@all",
      "totag": "@all",
      "agentid": 1000002,
      "msgtype": "text",
      "text": {
        "content": msg.join('\n')
      },
      "safe": 0,
      "enable_id_trans": 0,
      "enable_duplicate_check": 0,
      "duplicate_check_interval": 1800
    }

    let res = await fetch(process.env.ACCESSTOKENURL)
    if(!res.ok)
      return false
    const data = await res.json();

    return await fetch(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${ data.access_token }`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
  } catch (e) {
    console.log(e)
  }
}

class KuroAutoSign {
  constructor (token) {
    this.token = token;
    this.headers = {
      "Host": "api.kurobbs.com",
      "Connection": "keep-alive",
      "Content-Length": "83",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Accept": "application/json, text/plain, */*",
      "devCode": "171.37.188.39, Mozilla/5.0 (Linux; Android 12; PCLM10 Build/SKQ1.211113.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36 Kuro/2.2.7 KuroGameBox/2.2.7",
      "source": "android",
      "User-Agent": "Mozilla/5.0 (Linux; Android 12; PCLM10 Build/SKQ1.211113.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36 Kuro/2.2.7 KuroGameBox/2.2.7",
      "token": this.token,
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://web-static.kurobbs.com",
      "X-Requested-With": "com.kurogame.kjq",
      "Sec-Fetch-Site": "same-site",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
    };
  }

  async post (url, data = {}) {
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: data
    });
    const json = await response.json();
    if (!json.success && json.code !== 0) {
      console.error(`❌ API Error: ${ json.msg }`);
    }
    return json;
  }

  async start () {
    let result = []
    try {
      // 社区签到
      const forumSign = await this.post(forumSignIn, { gameId: 3 })

      result.push('【社区签到】: ' + forumSign.success ? '✅成功' : '❌' + forumSign.msg)
      // 取绑定游戏账号列表
      const data = await this.post(gameRoles)

      let gameRoleList = data.data.defaultRoleList

      for (const role of gameRoleList) {
        const params = {
          gameId: role.gameId,
          serverId: role.serverId,
          roleId: role.roleId,
          userId: role.userId
        };
        // 加载签到
        await this.post(initSignIn, params)

        const now = new Date();
        params.reqMonth = String(now.getMonth() + 1).padStart(2, "0");
        // 执行签到
        let response = await this.post(gameSignIn, params)
        // 保存签到结果
        result.push(`【${role.serverName}】\n ` + response.success ? '✅': '❌' + response.data)
      }
      return await sendMessage(result)
    } catch (e) {
      console.error("❌ 出错:", e.message || e);
    }
  }
}

// Main
(async () => {
  try {
    const client = new KuroAutoSign(process.env.TOKEN);
    const msg = await client.start();
    console.log("✅", msg);
  } catch (err) {
    console.error("❌ 出错:", err.message || err);
    process.exit(1);
  }
})();
