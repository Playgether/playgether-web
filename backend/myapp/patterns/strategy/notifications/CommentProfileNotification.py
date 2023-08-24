from .INotification import NotificationInterface
from django.contrib.contenttypes.models import ContentType

class CommentProfileNotification(NotificationInterface):

    def generate_notification(self, instance, classNotification):
        content_type = ContentType.objects.get_for_model(instance.content_type)
        classNotification.objects.create(profile=instance.user.profile, message = f'{instance.content_object.user.first_name}, {instance.user.first_name} comentou no seu perfil: {instance.comment}', content_type = content_type, object_id = instance.id)
        return
    