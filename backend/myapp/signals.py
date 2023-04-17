from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .functions import *
from .models import Like, Comment, Notification, Profile, Repost, Post
from django.contrib.contenttypes.models import ContentType

def post_save_repost(sender, instance, created, **kwargs):
    strategy = instance.content_object.get_repost_notification_interface()
    add_repost_quantity(instance)
    create_generic_notification(instance, Notification, strategy)

def post_save_created_user(sender, instance, created, **kwargs):
    if created:
        post_save_created_user_definition(Profile, instance)

def post_save_like(sender, instance, created, **kwargs):
    if created:
        strategy = instance.content_object.get_like_notification_interface()
        create_generic_notification(instance, Notification, strategy)
        add_like_quantity(instance)

def post_save_comment(sender, instance, created, **kwargs):
    if created:
        strategy = instance.content_object.get_comment_notification_interface()
        create_generic_notification(instance, Notification, strategy)
        add_comment_quantity(instance, Post)

@receiver(post_delete, sender = Like)
def post_delete_like(sender, instance, **kwargs):
    subtract_like_quantity(instance)
    delete_generic_notification(Notification, instance)

@receiver(post_delete, sender = Comment)
def post_delete_comment(sender, instance, **kwargs):
    subtract_comment_quantity(instance, Post)
    delete_generic_notification(Notification, instance)

@receiver(post_delete, sender = Repost)
def post_delete_repost(sender, instance, **kwargs):
    subtract_repost_quantity(instance)
    delete_generic_notification(Notification, instance)

post_save.connect(post_save_like, sender=Like)
post_save.connect(post_save_comment, sender=Comment)
post_save.connect(post_save_created_user, sender=User)
post_save.connect(post_save_repost, sender= Repost)