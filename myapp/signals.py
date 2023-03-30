from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .functions import *
from .models import Like, Comment

def post_save_like(sender, instance, created, **kwargs):
    if created:
        add_like_quantity(instance.post)

def post_save_comment(sender, instance, created, **kwargs):
    if created:
        add_comment_quantity(instance.post)

@receiver(post_delete, sender = Like)
def post_delete_like(sender, instance, **kwargs):
    subtract_like_quantity(instance.post)

@receiver(post_delete, sender = Comment)
def post_delete_comment(sender, instance, **kwargs):
    subtract_comment_quantity(instance.post)

post_save.connect(post_save_like, sender=Like)
post_save.connect(post_save_comment, sender=Comment)