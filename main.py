import datetime
import os
from cfg.utils import result, month_result, boss_result
from cfg.KuroApi import KuroApi


class KuroAutoSign:
    token = os.environ.get('token')
    gameId = os.environ.get('gameId')
    kuroApi = KuroApi(token)
    # 小组件数据
    widgetData = kuroApi.widget_table(gameId)

    roleData = widgetData.data

    if roleData.gameId == 3:
        energyData = roleData.energyData
        livenessData = roleData.livenessData
        dailyData = roleData.battlePassData
    else:
        energyData = roleData.actionData
        livenessData = roleData.dormData
        dailyData = roleData.activeData
    signInTxt = ''
    # 是否已签到
    if not roleData.hasSignIn:
        # 执行签到
        sign = kuroApi.signin(roleData)
        if sign.secuess:
            recordData = kuroApi.sign_record(roleData)
            recordData = recordData.data
            if isinstance(recordData, list) and len(recordData) > 0:
                goodsName = recordData[0]["goodsName"]
                signInTxt += '✅' + goodsName
        else:
            signInTxt += '❌' + sign.data

    serverTime = datetime.datetime.fromtimestamp(roleData.serverTime)

    # 打印
    result(roleData.gameId, roleData.serverName, serverTime, signInTxt, energyData, livenessData, dailyData)
    # 战双
    if gameId == 2:
        monthData = kuroApi.zs_month(roleData.roleId)
        month_result(monthData.data)
        boss_result(roleData.bossData)

