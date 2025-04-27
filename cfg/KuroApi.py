import requests
import time


class KuroApi:
    BASE_URLS = {
        "game_roles": "https://api.kurobbs.com/gamer/role/default",
        "init_signin": "https://api.kurobbs.com/encourage/signIn/initSignInV2",
        "game_signin": "https://api.kurobbs.com/encourage/signIn/v2",
        "sign_record": "https://api.kurobbs.com/encourage/signIn/queryRecordV2",
        "mc_widget": "https://api.kurobbs.com/gamer/widget/game3/getData",
        "zs_widget": "https://api.kurobbs.com/gamer/widget/game2/getData",
        'zs_month': "https://api.kurobbs.com/gamer/resource/month",
        "forum_signin": "https://api.kurobbs.com/user/signIn",
        "post_list": "https://api.kurobbs.com/forum/list",
        "post_detail": "https://api.kurobbs.com/forum/getPostDetail",
        "star_post": "https://api.kurobbs.com/forum/like",
        "share_task": "https://api.kurobbs.com/encourage/level/shareTask",
        "task_process": "https://api.kurobbs.com/encourage/level/getTaskProcess",
        "total_gold": "https://api.kurobbs.com/encourage/gold/getTotalGold",
    }

    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "source": "android",
            "token": token,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "okhttp/3.10.0",
            "Origin": "https://web-static.kurobbs.com",
        }

    def get_data(self, key: str, data: dict = None):
        """统一封装post请求"""
        url = self.BASE_URLS.get(key)
        try:
            response = requests.post(url, headers=self.headers, data=data, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    def game_roles(self):
        return self.get_data("game_roles")

    def signin(self, role):
        """执行游戏签到"""
        data = {
            'gameId': role.gameId,
            'serverId': role.serverId,
            'roleId': role.roleId,
            'userId': role.userId,
            "reqMonth": time.strftime("%m")
        }
        self.get_data("init_signin", data)  # 先初始化签到
        return self.get_data("game_signin", data)

    def sign_record(self, role):
        data = {
            'gameId': role.gameId,
            'serverId': role.serverId,
            'roleId': role.roleId,
            'userId': role.userId,
        }
        return self.get_data('sign_record', data)

    def forum_signin(self):
        return self.get_data("forum_signin")

    def widget_table(self, gameId):
        if gameId == 3:
            key = "mc_widget"
            data = {"type": "2", "sizeType": "1"}
        else:
            key = "zs_widget"
            data = {"type": "1", "sizeType": "2"}
        return self.get_data(key, data)

    def zs_month(self, roleId):
        data = {"roleId": roleId}
        return self.get_data('zs_month', data)

    def forum_list(self):
        data = {
            "forumId": "9",
            "gameId": "3",
            "pageIndex": "1",
            "pageSize": "20",
            "searchType": "3",
            "timeType": "0"
        }
        return self.get_data("post_list", data)

    def forum_detail(self, post_id: str):
        data = {
            "isOnlyPublisher": "0",
            "postId": post_id,
            "showOrderTyper": "2"
        }
        return self.get_data("post_detail", data)

    def star_post(self, user_id: str, post_id: str):
        data = {
            "forumId": 11,
            "gameId": 3,
            "likeType": 1,
            "operateType": 1,
            "postCommentId": "",
            "postCommentReplyId": "",
            "postId": post_id,
            "postType": 1,
            "toUserId": user_id
        }
        return self.get_data("star_post", data)

    def share_task(self):
        return self.get_data("share_task", {"gameId": 3})

    def task_process(self):
        return self.get_data("task_process", {"gameId": "0"})

    def total_gold(self):
        return self.get_data("total_gold")
