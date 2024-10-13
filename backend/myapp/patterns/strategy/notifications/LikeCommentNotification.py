from .INotification import NotificationInterface
from django.contrib.contenttypes.models import ContentType


class LikeCommentNotification(NotificationInterface):

    def generate_notification(self, instance, classNotification):
        if instance.content_object.user.id == instance.user.id:
            return
        else:
            content_type = ContentType.objects.get_for_model(instance.content_type)
            classNotification.objects.create(
                actor=instance.user, 
                user=instance.content_object.user, 
                message = f'{instance.user.first_name} curtiu seu comentário: {instance.content_object.comment}', 
                content_type = content_type, 
                object_id = instance.id
            )
            return
        