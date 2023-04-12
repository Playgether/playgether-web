from .INotification import NotificationInterface
from django.contrib.contenttypes.models import ContentType

class LikeRepostNotification(NotificationInterface):

    def generate_notification(self, instance, classNotification):
        content_type = ContentType.objects.get_for_model(instance.content_type)
        classNotification.objects.create(user=instance.user, message = f'{instance.content_object.user.first_name}, {instance.user.first_name} curtiu seu repost: {instance.content_object.comment}', content_type = content_type, object_id = instance.id)
        return
    