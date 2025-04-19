import fetch from 'node-fetch'

// 取绑定游戏账号列表
let findRoleList =  `https://api.kurobbs.com/user/role/findRoleList`
// 取签到配置信息 V2
let initSignIn =  'https://api.kurobbs.com/encourage/signIn/initSignInV2'
// 游戏签到 V2
let gameSignIn =  'https://api.kurobbs.com/encourage/signIn/v2'
// 社区签到
let forumSignIn =  'https://api.kurobbs.com/user/signIn'

class KuroAutoSign {
  constructor (token) {
    this.token = token;
    this.headers = {
      "source": "android",
      "token": this.token,
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 12; PCLM10 Build/SKQ1.211113.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36 Kuro/2.2.7 KuroGameBox/2.2.7"
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
    try {
      // 社区签到
      await this.post(forumSignIn, { gameId: 3 })

      // 取绑定游戏账号列表
      const data = await this.post(findRoleList, { gameId: 3 })

      const params = {
        gameId: data.gameId || 2,
        serverId: data.serverId,
        roleId: data.roleId || 0,
        userId: data.userId || 0
      };
      // 加载签到
      await this.post(initSignIn, params)

      const now = new Date();
      params.reqMonth = String(now.getMonth() + 1).padStart(2, "0");

      return await this.post(gameSignIn, params);
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
