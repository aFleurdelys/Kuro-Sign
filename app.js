import KuroApi from './cfg/KuroApi.js'
import lodash from 'lodash'
import common from './cfg/common.js'


export class App {
  constructor () {
  }

  // 社区和任务
  async forumSignIn () {
    try {
      // 获取个人信息
      const mine = await KuroApi.getData('mine')
      const userId = mine?.data?.mine?.userId
      if (!mine.success || !userId) {
        console.error(`[${ mine.code }]: ${ mine.msg }`)
        return
      }
      // 获取任务列表
      const taskList = await KuroApi.getData('taskList', {
        userId: userId
      })
      let { dailyTask, maxDailyGold } = taskList?.data
      if (!taskList.success || !dailyTask.length) {
        console.error(`[${ mine.code }]: ${ mine.msg }`)
        return
      }
      // 帖子列表
      const forumList = await KuroApi.getData('forumList', {
        forumId: 9,
        gameId: 3,
        pageIndex: 1,
        pageSize: 20,
      })
      let postList = forumList?.data?.postList || [] // 数组
      if (!forumList.success || !postList.length) {
        console.error(`[${ forumList.code }]: ${ forumList.msg }`)
        return
      }
      // 任务映射关系
      const taskMap = {
        '用户签到': (post) => [ 'forumSignIn', { gameId: 2 } ],
        '浏览3篇帖子': (post) => [ 'postDetail', { postId: post.postId } ],
        '点赞5次': (post) => [ 'like', {
          forumId: post.gameForumId,
          gameId: post.gameId,
          postId: post.postId,
          toUserId: post.userId,
          postType: post.postType
        } ],
        '分享1次帖子': (post) => [ 'shareTask', { gameId: post.gameId, postId: post.postId } ],
      }
      // 执行任务
      console.log(common.single)
      for (const task of dailyTask) {
        const { remark, process, needActionTimes, completeTimes } = task
        if (process >= 1.0) {
          console.log(`>>>[${ remark }]: ✅已完成`)
          continue // 已完成，跳过
        }
        // 找出任务需要执行的次数
        let max = needActionTimes - completeTimes
        for (const [ i, post ] of postList.entries()) {
          if (i === max) break
          const [ key, params ] = await taskMap[remark](post)
          // 执行
          let result = await KuroApi.getData(key, params)
          if (!result.success) max++
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


  // 游戏
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
    // 初始化
    await KuroApi.getData('initSignIn', baseParams)
    // 执行
    const signInParams = {
      ...baseParams,
      reqMonth: new Date().toISOString().slice(5, 7) // 自动生成MM格式月份
    }
    await KuroApi.getData('signin', signInParams)
    // 查询结果
    const { data: [ { goodsName, goodsNum } ] } = await KuroApi.getData('queryRecord', baseParams)
    // 物品
    return `✅ ${ goodsName } * ${ goodsNum }`
  }


  static async run () {
    let id = Number(process.env.id)
    let app = new App()
    try {
      // 社区
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
      await KuroApi.getData('refresh', params)
      // 获取游戏小组件
      let result = await KuroApi.getData('widget', params)

      if (!result.success || !result.data) {
        console.error(`[${ result.code }]: ${ result.msg }`)
        return
      }
      let data = result.data
      // 游戏
      data.signInTxt = await app.gameSignIn(data)
      // 数据处理
      if (isGr) {
        data.serverName = '战双: 帕弥什'
        let temp = { actionData: 'energyData', dormData: 'livenessData', activeData: 'battlePassData' }
        data = lodash.mapKeys(data, (value, key) => {
          return temp[key] || key
        })
        data.monthData = (await KuroApi.getData('month', { roleId: data.roleId }))?.data
      }
      // 输出日志
      await common.makeMessage(data)
    } catch (error) {
      console.error('执行出错:', error.message)
    }
  }
}


await App.run()
