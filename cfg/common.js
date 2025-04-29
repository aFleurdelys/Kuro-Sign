import _ from 'lodash';


/** 公共函数 */
const common = {
    /** 休眠  */
    async sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    },

    /** 打印 */
    async makeMessage (data) {
        let { gameId, serverName, serverTime, signInTxt, energyData, livenessData, dailyData } = data

        console.log("-".repeat(50));
        console.log(`游戏：${ serverName }`);
        console.log(`时间：${ new Date(serverTime * 1000).toLocaleString() }`);
        console.log(`签到：${ signInTxt }`);
        console.log("-".repeat(50));

        // 收集需要遍历的对象
        const datas = [ energyData, livenessData, ...[].concat(dailyData) ];  // dailyData可能是数组

        _.each(datas, (data) => {
            if (!data) return;  // 防止异常
            let name = data.name || data.key;
            if (name === '血清') name = ' 血　清 '; // 美化对齐

            let cur = data.cur ?? 0;
            let max = data.total || 100; // 有些数据 total 可能缺失，默认100
            if (gameId === 3) {
                if (name.includes('结晶波片')) max = 240;
                if (name.includes('活跃度')) max = 100;
                if (name.includes('电台等级')) max = 70;
                if (name.includes('本周经验')) max = 10000;
            }
            if (cur > max) cur = max;  // 防止溢出
            const bar = progBar(cur, max);

            console.log(`${ name.padEnd(4, '　') }: [${ bar }] ${ cur }/${ max } `);
        });
        console.log("-".repeat(50));
        if (data.bossData) {
            await bossData(data.bossData)
            await monthData(data.monthData)
        }
    }
}

function progBar (cur, max) {
    const filled = Math.round((cur / max) * 25);
    return '█'.repeat(filled) + '═'.repeat(25 - filled);
}

async function bossData (bossData) {
    bossData.forEach(boss => {
        let {
            name, key, value,
            cur, total,
            expireTimeStamp, refreshTimeStamp
        } = boss
        if (total === 0) total = 100;
        const times = expireTimeStamp ?? refreshTimeStamp ?? null;
        const bossBar = progBar(cur, total)
        console.log(`${ name ?? '' }(${ key ?? '' }) |${ bossBar }| ${ value ?? '' }`.trim());
        if (times !== null) {
            console.log(` >>> 刷新时间：${ new Date(times * 1000).toLocaleString() }`);
        }
    });
    console.log("-".repeat(50));
}

async function monthData (monthData) {
    let {
        gameLevel, currentBlackCard,
        currentDevelopResource, currentTradeCredit,
        currentMonth, monthBlackCard,
        monthDevelopResource, monthTradeCredit
    } = monthData

    console.log(`游戏等级：${ gameLevel ?? 0 }`);
    console.log("-".repeat(50));
    console.log('当前资源：');
    console.log(` > 黑　　卡 - ${ currentBlackCard ?? 0 }`);
    console.log(` > 研发资源 - ${ currentDevelopResource ?? 0 }`);
    console.log(` > 贸易凭据 - ${ currentTradeCredit ?? 0 }`);
    console.log("-".repeat(50));
    console.log(`${ currentMonth ?? '' }月资源情况：`);
    console.log(` > 黑　　卡 - ${ monthBlackCard ?? 0 }`);
    console.log(` > 研发资源 - ${ monthDevelopResource ?? 0 }`);
    console.log(` > 贸易凭据 - ${ monthTradeCredit ?? 0 }`);
    console.log("-".repeat(50));
}

export default common
