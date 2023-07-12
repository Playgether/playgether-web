from .INotification import NotificationInterface
from django.contrib.contenttypes.models import ContentType

class LikePostNotification(NotificationInterface):

    def generate_notification(self, instance, classNotification):
        content_type = ContentType.objects.get_for_model(instance.content_type)
        classNotification.objects.create(user=instance.content_object.created_by_user, message = f'{instance.user.first_name} curtiu sua postagem: {instance.content_object.comment}', content_type = content_type, object_id = instance.id)
        return