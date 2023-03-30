from .INotification import NotificationInterface

class ShareNotification(NotificationInterface):

    def get_notification(self, user, post):
        return f"{user} compartilhou sua postagem: {post}"
    