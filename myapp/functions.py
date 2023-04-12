#This file holds all functions used in models.py
from datetime import datetime
import uuid
import os
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User



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
def add_like_quantity(instance):
    instance.content_object.quantity_likes = instance.content_object.quantity_likes + 1
    instance.content_object.save()
    return

#Update comment quantity for posts
def add_comment_quantity(instance, classPost):
    content_type = ContentType.objects.get_for_model(classPost)
    instance_content_type = ContentType.objects.get_for_model(instance.content_object.content_type)
    if isinstance(content_type, type(instance_content_type)):
        instance.content_object.quantity_comment = instance.content_object.quantity_comment + 1
        instance.content_object.save()
        instance.content_object.content_object.quantity_comment = instance.content_object.content_object.quantity_comment + 1
        instance.content_object.content_object.save()
    else:
        instance.content_object.quantity_comment = instance.content_object.quantity_comment + 1
        instance.content_object.save()
    return 

#Subtract comment quantity when some comment is exclude
def subtract_comment_quantity(instance, classPost):
    if instance.content_object.quantity_comment == 0:
        pass
    else:
        try:
            content_type = ContentType.objects.get_for_model(classPost)
            instance_content_type = ContentType.objects.get_for_model(instance.content_object.content_type)
            if isinstance(content_type, type(instance_content_type)):
                instance.content_object.quantity_comment = instance.content_object.quantity_comment - 1
                instance.content_object.save()
                instance.content_object.content_object.quantity_comment = instance.content_object.content_object.quantity_comment - 1
                instance.content_object.content_object.save()
            else:
                instance.content_object.quantity_comment = instance.content_object.quantity_comment - 1
                instance.content_object.save()
        except AttributeError:
            instance.content_object.quantity_comment = instance.content_object.quantity_comment - 1
            instance.content_object.save()
    return 

#Subtract like quantity when some like is removed
def subtract_like_quantity(instance):
    if instance.content_object.quantity_likes == 0:
        pass
    else:
        instance.content_object.quantity_likes = instance.content_object.quantity_likes - 1
        instance.content_object.save()
    return 

def add_repost_quantity(instance):
    instance.content_object.quantity_reposts = instance.content_object.quantity_reposts + 1
    instance.content_object.save()
    return 

def subtract_repost_quantity(instance):
    if instance.content_object.quantity_reposts == 0:
        pass
    else:
        instance.content_object.quantity_reposts = instance.content_object.quantity_reposts - 1
        instance.content_object.save()
        return


#Create a generic notification for all types of generic notifications have (Implements a Design Pattern : Strategy for that).
def create_generic_notification(instance, Notification, strategy):
    strategy.generate_notification(instance, Notification)
    return


#Delete a generic notification for all types of generic notifications have when the event is deleted.
def delete_generic_notification(Notification, instance):
    content_type = ContentType.objects.get_for_model(instance.content_type)
    Notification.objects.filter(content_type = content_type, object_id = instance.id).delete()
    return

#Function "post_save_created_user" in "signals.py" definition
def post_save_created_user_definition(classProfile, instance):
    user_profile = classProfile(user=instance)
    user_profile.save()
    user_profile.follows.set([instance.profile.id])
    user_profile.save()