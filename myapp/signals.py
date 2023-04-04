from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .functions import *
from .models import Like, Comment, Notification, Profile
from .patterns.strategy.notifications import LikeNotification, CommentNotification, ShareNotification

def post_save_created_user(sender, instance, created, **kwargs):
    if created:
        post_save_created_user_definition(Profile, instance)

def post_save_like(sender, instance, created, **kwargs):
    if created:
        add_like_quantity(instance.post)
        create_generic_notification(instance, Like, LikeNotification.LikeNotification, Notification)

def post_save_comment(sender, instance, created, **kwargs):
    if created:
        add_comment_quantity(instance.post)
        create_generic_notification(instance, Comment, CommentNotification.CommentNotification, Notification)

@receiver(post_delete, sender = Like)
def post_delete_like(sender, instance, **kwargs):
    subtract_like_quantity(instance.post)
    delete_generic_notification(Notification, instance, Like)

@receiver(post_delete, sender = Comment)
def post_delete_comment(sender, instance, **kwargs):
    subtract_comment_quantity(instance.post)
    delete_generic_notification(Notification, instance, Comment)

post_save.connect(post_save_like, sender=Like)
post_save.connect(post_save_comment, sender=Comment)
post_save.connect(post_save_created_user, sender=User)