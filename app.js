import fetch from 'node-fetch'

// 取绑定游戏账号列表
let gameRoles = 'https://api.kurobbs.com/gamer/role/default'
// 取签到配置信息 V2
let initSignIn = 'https://api.kurobbs.com/encourage/signIn/initSignInV2'
// 游戏签到 V2
let gameSignIn = 'https://api.kurobbs.com/encourage/signIn/v2'
// 社区签到
let forumSignIn = 'https://api.kurobbs.com/user/signIn'

async function sendMessage (message) {
  try {
    let params = {
      "touser": "@all",
      "toparty": "@all",
      "totag": "@all",
      "agentid": 1000002,
      "msgtype": "text",
      "text": {
        "content": message
      },
      "safe": 0,
      "enable_id_trans": 0,
      "enable_duplicate_check": 0,
      "duplicate_check_interval": 1800
    }

    let res = await getAccessToken()
    if (!res.ok) {
      console.log(res.status + res.statusText)
      return { code: res.status, msg: '获取access_token失败~' }
    }
    const data = await res.json();

    let result = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${ data.access_token }`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    if (!result.ok) {
      console.log(result.status + result.statusText)
      return { code: res.status, msg: '发送失败~' }
    }
    result = await result.json()
    result.errmsg === 'ok' ? console.log('✅ 发送成功') : console.log(`❌ 发送失败: ${ result.errcode }\n${ result.errmsg }`)
  } catch (e) {
    console.log("❌", e.message)
    return { code: e.code, msg: e.message }
  }
}

async function getAccessToken(){
  // 生成签名参数
  const API_KEY = process.env.API_KEY;
  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();
  const requestBody = JSON.stringify({}); // 如果有请求体需要参与签名

// 生成签名
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(API_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = encoder.encode(`${timestamp}${nonce}${requestBody}`);
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const hexSign = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // 发送请求
  return await fetch(process.env.ACCESSTOKENURL, {
    method: 'POST', // 或 GET
    headers: {
      'X-Api-Key': API_KEY,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Signature': hexSign,
      'Content-Type': 'application/json'
    },
    body: requestBody
  });
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
    try {
      let body = new URLSearchParams(data)
      const response = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body,
      });
      if (!response.ok) {
        console.log(response.status + response.statusText)
        return { success: false, msg: '签到失败' }
      }
      return await response.json();
    } catch (e) {
      console.error(`❌ API Error: ${ e.msg }`);
      return { success: false, msg: '签到失败' }
    }
  }

  async start () {
    let result = []
    try {
      // 社区签到
      const forumSign = await this.post(forumSignIn, { gameId: 2 })

      result.push(`【社区签到】: ${ forumSign.success ? '✅成功' : '❌' + forumSign.msg }`)
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
        response.data = response.data || response.msg
        result.push(`【${ role.serverName }】\n ${ response.success ? '✅' : '❌' + response.data }`)
      }
      console.log(result.join('\n' + '-'.repeat(30) + '\n'));
      // 企业微信推送
      return await sendMessage(result.join('\n'))
    } catch (e) {
      console.error("❌ 出错:", e.message || e);
      return { code: e.code, msg: e.message }
    }
  }
}

// Main
(async () => {
  try {
    const client = new KuroAutoSign(process.env.TOKEN);
    let data = await client.start();
    console.log(`[${data.code}]: ${data.msg}`)
  } catch (err) {
    console.error("❌ 出错:", err.message || err);
    process.exit(1);
  }
})();
