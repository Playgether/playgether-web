from .INotification import NotificationInterface

class CommentNotification(NotificationInterface):

    def get_notification(self, user, post):
        return f"{user} comentou sua postagem: {post}"
    