from .INotification import NotificationInterface

class LikeNotification(NotificationInterface):

    def get_notification(self, user, post):
        return f"{user} curtiu sua postagem: {post}"
    