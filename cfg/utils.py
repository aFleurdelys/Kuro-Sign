import logging
import datetime


class logger:
    # 类属性，保存全局 logger
    _logger = None

    @classmethod
    def init(cls):
        if cls._logger is None:
            cls._logger = logging.getLogger()
            cls._logger.setLevel(logging.DEBUG)

            formatter = logging.Formatter('%(message)s')

            # 控制台输出
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            cls._logger.addHandler(console_handler)

    @classmethod
    def info(cls, message):
        cls.init()
        cls._logger.info(message)

    @classmethod
    def debug(cls, message):
        cls.init()
        cls._logger.debug(message)

    @classmethod
    def warning(cls, message):
        cls.init()
        cls._logger.warning(message)

    @classmethod
    def error(cls, message):
        cls.init()
        cls._logger.error(message)


def result(gameId, gameName, serverTime, signInTxt, energyData, livenessData, dailyData):
    # 基本
    logger.info("-" * 50)
    logger.info('游戏：' + gameName)
    logger.info('时间：' + str(serverTime))
    logger.info('状态：' + signInTxt)
    logger.info("-" * 50)
    # 鸣潮：battlePassData = dailyData
    if gameId == 3:
        name_table = [energyData['name'], livenessData['name'] + '　', dailyData[0]['name'], dailyData[1]['name']]
        num_table = [energyData['cur'], livenessData['cur'], dailyData[0]['cur'], dailyData[1]['cur']]
        max_table = [240, 100, 70, 10000]
    # 战双：actionData = energyData，dormData = livenessData， activeData = dailyData
    else:
        name_table = [energyData['name'], livenessData['name'], dailyData['key']]
        num_table = [energyData['cur'], livenessData['cur'], dailyData['cur']]
        max_table = [energyData['total'], livenessData['total'], dailyData['total']]

    for i in range(len(name_table)):
        name = name_table[i]
        if name == '血清':
            name = '血　　清'
        math_count = max_table[i] / 25
        progress = str(num_table[i]) + '/' + str(max_table[i])
        if num_table[i] > max_table[i]:
            num_table[i] = max_table[i]
        bar = '█' * (int(num_table[i] / math_count)) + '═' * (
                int(max_table[i] / math_count) - int(num_table[i] / math_count))
        logger.info(name + '：[' + bar + ']' + progress)
    logger.info("-" * 50)


def boss_result(bossData):
    for i in range(len(bossData)):
        name = bossData[i]['name']
        goods = bossData[i]['key']
        times = bossData[i].get('expireTimeStamp')
        if times is None:
            times = bossData[i].get('refreshTimeStamp')
        value = bossData[i]['value']
        cur = bossData[i]['cur']
        total = bossData[i]['total']
        if total == 0:
            total = 100
        count = total / 25

        boss_bar = '█' * (int(cur / count)) + '═' * (
                    int(total / count) - int(cur / count))
        content = name + '(' + goods + ')|' + boss_bar + '|' + value
        logger.info(content.rstrip())
        if times is not None:
            logger.info(" >>> 刷新时间：" + str(datetime.datetime.fromtimestamp(times)))
    logger.info("-" * 50)


def month_result(monthData):
    game_level = monthData.gameLevel

    black_card = monthData.currentBlackCard
    dev_resource = monthData.currentDevelopResource
    trade_credit = monthData.currentTradeCredit

    month = monthData.currentMonth
    month_black_card = monthData.monthBlackCard
    month_dev_resource = monthData.monthDevelopResource
    month_trade_credit = monthData.monthTradeCredit
    logger.info('游戏等级：'+str(game_level))
    logger.info("-"*50)
    logger.info('当前资源：')
    logger.info(' > 黑　　卡 - '+str(black_card))
    logger.info(' > 研发资源 - '+str(dev_resource))
    logger.info(' > 贸易凭据 - '+str(trade_credit))
    logger.info("-"*50)
    logger.info(str(month)+'月资源情况：')
    logger.info(' > 黑　　卡 - '+str(month_black_card))
    logger.info(' > 研发资源 - '+str(month_dev_resource))
    logger.info(' > 贸易凭据 - '+str(month_trade_credit))
    logger.info("-"*50)
