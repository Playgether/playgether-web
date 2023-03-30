#This file holds all functions used in models.py
from datetime import datetime
import uuid
import os
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.contenttypes.models import ContentType



#Test if a file is a image
def is_image(type):
    if type == "mp4" or type == "mov":
        return False
    else:
        return True

#Return a path for profile images
def get_file_profile_path(_instance, filename):
    ext = filename.split('.')[-1]
    now = datetime.now()
    filename = f'{uuid.uuid4()}{now}.{ext}'
    return f"profile/{filename}"

#Return a relative path for posts(images or videos) 
def get_file_post_media_path(_instance, filename):
    ext = filename.split('.')[-1]
    now = datetime.now()
    filename = f'{uuid.uuid4()}{now}.{ext}'
    type = is_image(ext)

    if type == True:
        return f"posts/images/{filename}"
    else:
        return f"posts/videos/{filename}"
    

#Validade if a extesion of post file is accepted
def validate_file_extension(value):
    ext = os.path.splitext(value.name)[1]  # [0] returns path+filename
    valid_extensions = ['.jpg', '.png', '.gif', '.mp4', '.mov']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file extension.')

#Update likes quantity of posts
def add_like_quantity(post):
    post.quantity_likes = post.quantity_likes + 1
    post.save()
    return

#Update comment quantity for posts
def add_comment_quantity(post):
    post.quantity_comment = post.quantity_comment + 1
    post.save()
    return 

#Subtract comment quantity when some comment is exclude
def subtract_comment_quantity(post):
    if post.quantity_comment == 0:
        pass
    else:
        post.quantity_comment = post.quantity_comment - 1
        post.save()
    return 

#Subtract like quantity when some like is removed
def subtract_like_quantity(post):
    if post.quantity_likes == 0:
        pass
    else:
        post.quantity_likes = post.quantity_likes - 1
        post.save()
    return 

def create_generic_notification(instance, classContentType, classStrategyNotification, Notification):
    obj = classStrategyNotification()
    content_type = ContentType.objects.get_for_model(classContentType)
    Notification.objects.create(user=instance.user, message = obj.get_notification(instance.user.name, instance.post.subtitle), content_type = content_type, object_id = instance.id)
    return

def delete_generic_notification(Notification, instance, classContentType):
    content_type = ContentType.objects.get_for_model(classContentType)
    Notification.objects.filter(content_type = content_type, object_id = instance.id).delete()
    return