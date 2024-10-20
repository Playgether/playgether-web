#This file holds some functions used in the entire project
from datetime import datetime
import uuid
import os
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from django import forms
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError



#Test if a file is a image
def is_image(type):
    if type == "mp4" or type == "mov":
        return False
    else:
        return True

def post_media_type(filename):
    pass

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

def define_media_type_of_post_media(filename):
    parts = filename.split('.')[-1]
    type = is_image(parts)
    if type == True:
        media_type = 'image'
    else:
        media_type = 'video'
    return media_type


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
#Add comment quantity when a new comment id added
def add_comment_quantity(instance):
    related_object = instance.content_object
    related_object.quantity_comment += 1
    related_object.save()
    return
#Subtract comments quantity when a comment is deleted
def subtract_comment_quantity(instance):
    related_object = instance.content_object
    if related_object.quantity_comment > 0:
        related_object.quantity_comment -= 1
        related_object.save()
        return

#Subtract like quantity when some like is removed
def subtract_like_quantity(instance):
    if instance.content_object.quantity_likes > 0:
        instance.content_object.quantity_likes = instance.content_object.quantity_likes - 1
        instance.content_object.save()
        return 

def add_repost_quantity(instance):
    instance.content_object.quantity_reposts = instance.content_object.quantity_reposts + 1
    instance.content_object.save()
    return 

def subtract_repost_quantity(instance):
    if instance.content_object.quantity_reposts > 0:
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
    # if not classProfile.objects.filter(user=instance).exists():
        user_profile = classProfile(user=instance)
        user_profile.save()
        user_profile.follows.set([instance.profile.id])
        user_profile.save()

#clean password of User table before save
def clean_password_implementation(password):
    if len(password) < 8:
        raise forms.ValidationError("A senha precisa ter pelo menos 8 caracteres.")
    if not any(char.isdigit() for char in password):
        raise forms.ValidationError("A senha precisa conter pelo menos um número.")
    if not any(char.isupper() for char in password):
        raise forms.ValidationError("A senha precisa conter pelo menos uma letra maiúscula.")
    if not any(char.islower() for char in password):
        raise forms.ValidationError("A senha precisa conter pelo menos uma letra minúscula.")
    if len(password) > 128:
        raise forms.ValidationError("A senha pode ter no máximo 128 caracteres")
    return password

#clean email data of table User before save
def clean_email_implementation(email):
    if len(email) > 254:
        raise forms.ValidationError("O email não pode ter mais de 254 caracteres.")
    try:
        validate_email(email)
    except ValidationError:
        raise forms.ValidationError("O email informado não é válido.")
    return email

#clean first_name of table User before save
def clean_first_name_implementation(first_name):
    if len(first_name) > 150:
        raise forms.ValidationError("O nome não pode ter mais de 150 caracteres.")
    if not first_name.isalpha():
        raise forms.ValidationError("O nome só pode conter letras.")
    return first_name

#clean last_name of table User before save
def clean_last_name_implementation(last_name):
    if len(last_name) > 150:
        raise forms.ValidationError("O sobrenome não pode ter mais de 150 caracteres.")
    if not last_name.isalpha():
        raise forms.ValidationError("O sobrenome só pode conter letras.")
    return last_name

#clean username of table User before save
def clean_username_implementation(username):
    if not username.isalnum():
        raise forms.ValidationError("O nome de usuário só pode conter letras e números.")
    return username

#generate data for lol creating a dict
def generate_data_lol(data):
    winRate0 = (data[0]["wins"] / (data[0]["wins"] + data[0]["losses"])) * 100
    winRate1 = (data[1]["wins"] / (data[1]["wins"] + data[1]["losses"])) * 100
    newDict = [
        {
            "queueType": data[0]["queueType"],
            "tier": data[0]["tier"],
            "rank": data[0]["rank"],
            "leaguePoints": data[0]["leaguePoints"],
            "wins": data[0]["wins"],
            "losses": data[0]["losses"],
            "winRate": str(int(round(winRate0, 0))) + "%",
        },
        {
            "queueType": data[1]["queueType"],
            "tier": data[1]["tier"],
            "rank": data[1]["rank"],
            "leaguePoints": data[1]["leaguePoints"],
            "wins": data[1]["wins"],
            "losses": data[1]["losses"],
            "winRate": str(int(round(winRate1, 0))) + "%",
        }
    ]
    return newDict