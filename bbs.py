from cfg.KuroApi import KuroApi
import os, time
from cfg.utils import logger


def handle_signin(api, msg_list, post_user_pairs=None):
    signin_result = api.forum_signin()
    msg_list.append(f"签到结果: {signin_result}")


def handle_browse(api, msg_list, post_user_pairs):
    for postid, userid in post_user_pairs[:3]:
        post_detail = api.get_post_detail(postid)
        if isinstance(post_detail, str):
            logger.error(post_detail)
            msg_list.append(post_detail)
        time.sleep(1)


def handle_like(api, msg_list, post_user_pairs):
    for i, (postid, userid) in enumerate(post_user_pairs[:5]):
        like_result = api.like_posts(postid, userid) or "点赞失败"
        logger.info(f"第{i + 1}次点赞结果: {like_result}")
        msg_list.append(f"第{i + 1}次点赞结果: {like_result}")
        time.sleep(1)


def handle_share(api, msg_list, post_user_pairs=None):
    share_result = api.share_posts()
    msg_list.append(f"分享结果: {share_result}")


def main():
    token = os.environ.get('token')
    kuroApi = KuroApi(token)
    # 任务对应关系
    task_map = {
        "用户签到": handle_signin,
        "浏览3篇帖子": handle_browse,
        "点赞5次": handle_like,
        "分享1次帖子": handle_share,
    }
    # 获取任务列表
    task_data = kuroApi.task_process()
    daily_tasks = task_data["data"]["dailyTask"]

    # 处理逻辑
    msg_list = []  # 先用list，最后统一join，性能比 += 高

    for task in daily_tasks:
        if int(task["process"]) != 0:
            continue

        remark = task["remark"]
        logger.info(f"开始处理任务: {remark}")

        handler = task_map.get(remark)

        if remark in ("浏览3篇帖子", "点赞5次"):
            forum_list = kuroApi.forum_list()
            if isinstance(forum_list, str):
                logger.error(forum_list)
                msg_list.append(forum_list)
                continue
            post_user_pairs = [(post["postId"], post["userId"]) for post in forum_list["data"]["postList"]]
            handler(kuroApi, msg_list, post_user_pairs)
        else:
            handler(kuroApi, msg_list)

    # 最后统一合并消息
    msg = "\n".join(msg_list)
    logger.info(msg)
