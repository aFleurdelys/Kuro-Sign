import KuroApi from './cfg/KuroApi.js'
import lodash from "lodash"
import common from "./cfg/common.js"


export class App {
  constructor () {
  }

  // 社区签到和任务
  async forumSignIn () {
    try {
      // 获取个人信息
      const mine = await KuroApi.getData('mine')
      const userId = mine?.data?.mine?.userId
      if (!mine.success || !userId) {
        console.error(`[${ mine.code }]: ${ mine.msg }`)
        return
      }
      // 2. 获取任务列表
      const taskList = await KuroApi.getData('taskList', {
        userId: userId
      })
      let { dailyTask, maxDailyGold } = taskList?.data
      if (!taskList.success || !dailyTask.length) {
        console.error(`[${ mine.code }]: ${ mine.msg }`)
        return
      }
      // 找出 v.needActionTimes - v.completeTimes 的最大值
      let max = Math.max(...dailyTask.map(v => v.needActionTimes - v.completeTimes))

      // 帖子列表
      const forumList = await KuroApi.getData('forumList', {
        forumId: 9,
        gameId: 3,
        pageIndex: 1,
        pageSize: 20,
      })
      const postList = forumList?.data?.postList?.slice(0, max) || [] // 数组
      if (!forumList.success || !postList.length) {
        console.error(`[${ forumList.code }]: ${ forumList.msg }`)
        return
      }
      // 5. 任务映射关系
      const taskMap = {
        '社区签到': (post) => KuroApi.getData('forumSignIn', { gameId: 3 }),
        '浏览3篇帖子': (post) => KuroApi.getData('postDetail', { postId: post.postId }),
        '点赞5次': (post) => KuroApi.getData('like', { postId: post.postId, toUserId: post.userId }),
        '分享1次帖子': (post) => KuroApi.getData('shareTask', { postId: post.postId }),
      }
      // 6. 执行任务
      console.log(common.single)
      for (const task of dailyTask) {
        const { remark, process } = task
        if (process >= 1.0) {
          console.log(`>>>[${ remark }]: ✅已完成`)
          continue // 已完成，跳过
        }
        const action = taskMap[remark]
        for (const post of postList) {
          await action(post)
          // 每次操作后休眠3秒，防止频繁请求
          await common.sleep(3000)
        }
        console.log(`>>>[${ remark }]: ✅已完成`)
      }
      console.log(common.single)
      // 6. 查询总库洛币
      const data = await KuroApi.getData('totalGold')
      console.log(`今日库洛币: ${ maxDailyGold } 个`)
      if (data?.data) {
        console.log(`总库洛币: ${ data.data.goldNum } 个`)
      }
      console.log(common.single)
    } catch (error) {
      console.error('执行出错:', error.message)
    }
  }


  // 游戏签到
  async gameSignIn (data = {}) {
    const baseParams = {
      gameId: data.gameId,
      serverId: data.serverId,
      roleId: data.roleId,
      userId: data.userId
    }
    if (data.hasSignIn) {
      return `❌ ${ data.signInTxt }`
    }
    // 初始化签到
    await KuroApi.getData('initSignIn', baseParams)
    // 执行签到
    const signInParams = {
      ...baseParams,
      reqMonth: new Date().toISOString().slice(5, 7) // 自动生成MM格式月份
    }
    await KuroApi.getData('signin', signInParams)
    // 查询签到结果
    const { data: [ { goodsName, goodsNum } ] } = await KuroApi.getData('queryRecord', baseParams)
    // 签到物品
    return `✅ ${ goodsName } * ${ goodsNum }`
  }


  static async run () {
    let id = Number(process.env.id)
    let app = new App()
    try {
      // 社区签到 --- 暂时不可用
      if (id === 1) {
        return await app.forumSignIn()
      }
      // 游戏 -- Gray Raven(战双)
      const isGr = id === 2
      let params = {
        type: isGr ? 1 : 2,
        sizeType: isGr ? 2 : 1,
        gameId: id
      }
      // 获取游戏小组件
      let result = await KuroApi.getData('widget', params)

      if (!result.success || !result.data) {
        console.error(`[${ result.code }]: ${ result.msg }`)
        return
      }
      let data = result.data
      // 签到
      data.signInTxt = await app.gameSignIn(data)
      // 数据处理
      if (isGr) {
        data.serverName = '战双: 帕弥什'
        let temp = { actionData: 'energyData', dormData: 'livenessData', activeData: 'battlePassData' }
        data = lodash.mapKeys(data, (value, key) => {
          return temp[key] || key
        })
        data.monthData = (await KuroApi.getData('month', { roleId: data.roleId })).data
      }
      // 输出日志
      await common.makeMessage(data)
    } catch (error) {
      console.error('执行出错:', error.message)
    }
  }
}


await App.run()
