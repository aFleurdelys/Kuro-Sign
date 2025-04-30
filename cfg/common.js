import lodash from 'lodash';


/** 公共函数 */
const common = {

  single: '-'.repeat(50),

  /** 休眠  */
  async sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /** 打印 */
  async makeMessage (data) {
    let { gameId, serverName, serverTime, signInTxt, energyData, livenessData, storeEnergyData,
      weeklyData, battlePassData, bossData, monthData, towerData, slashTowerData } = data

    console.log(common.single);
    console.log(`游戏：${ serverName }`);
    console.log(`时间：${ new Date(serverTime * 1000).toLocaleString() }`);
    console.log(`签到：${ signInTxt }`);
    console.log(common.single);

    // 收集需要遍历的对象
    const datas = [ energyData, storeEnergyData, livenessData, weeklyData, ...[].concat(battlePassData) ];  // dailyData可能是数组
    let maxMap = lodash.map(datas, data => {
      if (!data) return
      if (data.name === '电台等级' && data.total === 0) return 70
      return data.total || 100
    }).filter(Boolean)

    lodash.each(datas, (data, i) => {
      if (!data) return;  // 防止异常
      let name = data.name || data.key;
      if (name === '血清') name = ' 血　清 '; // 美化对齐
      let cur = data.cur || 0;
      let max = maxMap[i];
      const bar = progBar(cur, max);
      console.log(`${ name.padEnd(4, '　') }: [${ bar }] ${ cur }/${ max } `);
    });
    console.log(common.single);
    if (gameId === 2) {
      await makeMonthMsg(monthData)
    }
    bossData = [ towerData, slashTowerData ] || bossData
    await makeBossMsg(gameId, bossData)
  }
}

function progBar (cur, max) {
  if (cur > max) cur = max;  // 防止溢出
  const filled = Math.round((cur / max) * 20);
  return '█'.repeat(filled) + '═'.repeat(20 - filled);
}

async function makeBossMsg (gameId, bossData) {
  bossData.forEach(boss => {
    let { name, key, value, cur, total, timePreDesc, expireTimeStamp, refreshTimeStamp } = boss
    if (total === 0) total = 100;
    const times = expireTimeStamp || refreshTimeStamp || null;
    const bossBar = progBar(cur, total)
    if (gameId === 3) {
      name = name.split('·')[0]
      key = timePreDesc
      value = `${cur}/${total}`
    }
    const common = `${name}(${key})`.padEnd(gameId === 3 ? 10 : 0, '　');
    console.log(`${common} |${ bossBar }| ${ value }`.trim());
    if (times !== null) {
      console.log(` >>> 刷新时间：${ new Date(times * 1000).toLocaleString() }`);
    }
  });
  console.log(common.single);
}

async function makeMonthMsg (monthData) {
  let { gameLevel, currentBlackCard, currentDevelopResource, currentTradeCredit,
    currentMonth, monthBlackCard, monthDevelopResource, monthTradeCredit } = monthData

  console.log(`游戏等级：${ gameLevel || 0 }`);
  console.log(common.single);
  console.log('当前资源：');
  console.log(` >  黑　卡  - ${ currentBlackCard || 0 }`);
  console.log(` > 研发资源 - ${ currentDevelopResource || 0 }`);
  console.log(` > 贸易凭据 - ${ currentTradeCredit || 0 }`);
  console.log(common.single);
  console.log(`${ currentMonth || '' }月资源情况：`);
  console.log(` >  黑　卡   - ${ monthBlackCard || 0 }`);
  console.log(` > 研发资源 - ${ monthDevelopResource || 0 }`);
  console.log(` > 贸易凭据 - ${ monthTradeCredit || 0 }`);
  console.log(common.single);
}

export default common
