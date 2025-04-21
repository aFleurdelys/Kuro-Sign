import fetch from 'node-fetch'

// 取绑定游戏账号列表
let gameRoles = `https://api.kurobbs.com/gamer/role/default`
// 取签到配置信息 V2
let initSignIn = 'https://api.kurobbs.com/encourage/signIn/initSignInV2'
// 游戏签到 V2
let gameSignIn = 'https://api.kurobbs.com/encourage/signIn/v2'
// 社区签到
let forumSignIn = 'https://api.kurobbs.com/user/signIn'

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

    let access_token = await fetch(process.env.ACCESSTOKENURL).access_token

    return await fetch(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${ access_token }`, {
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
      "source": "h5",
      "token": this.token,
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0"
    };
  }

  async post (url, data = {}) {
    const body = new URLSearchParams(data);
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body,
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
        result.push(`【${ role.serverName }】\n ` + response.success ? '✅' : '❌' + response.data)
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
