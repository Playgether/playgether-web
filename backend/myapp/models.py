from django.db import models
from stdimage import StdImageField
from .functions import *
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.auth.models import User
from .patterns.strategy.notifications import CommentPostNotification, LikeCommentNotification, LikePostNotification, LikeProfileNotification, LikeRepostNotification, CommentOtherComment, CommentProfileNotification, CommentRepost, RepostNotification

  
# Create your models here.
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    follows = models.ManyToManyField("self", related_name="followed_by", symmetrical=False, blank=True)
    bio = models.TextField("Bio", blank=True, null=True, max_length=500)
    profile_photo = StdImageField('Foto de perfil', null=True, blank=True, upload_to=get_file_profile_path, variations={'thumb': {'width': 480, 'height': 480, 'crop': True}})
    hours_played = models.FloatField("Horas jogadas", default=0)
    matches_played = models.IntegerField("Número de partidas jogadas", default=0)
    performance = models.CharField("Performance", max_length=30, default="Iniciante")
    gamer_nivel = models.IntegerField("Nível gamer", default=1)
    verified = models.BooleanField("Verified", default=False)
    quantity_comment = models.IntegerField("Quantidade de comentários", default=0)
    quantity_likes = models.IntegerField("Quantidade de curtidas", default=0)  

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"

    def __str__(self):
        return f"Usuário: {self.user.username} ID: {self.id}"
    
        
    def get_like_notification_interface(self):
        return LikeProfileNotification.LikeProfileNotification()
    
    def get_comment_notification_interface(self):
        return CommentProfileNotification.CommentProfileNotification()

class Post (models.Model):
    created_by_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    timestamp = models.DateTimeField(auto_now_add=True)
    quantity_visualization = models.IntegerField("Quantidade de visualizações", default=0)
    quantity_comment = models.IntegerField("Quantidade de comentários", default=0)
    quantity_likes = models.IntegerField("Quantidade de curtidas", default=0)  
    quantity_reposts = models.IntegerField("Quantidade de compartilhamentos", default=0)
    comment = models.TextField("Legenda", null=True, blank=True)
    has_post_media = models.BooleanField("Post Media", default=False)
    link = models.CharField("Link", max_length=1000)

    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __str__(self):
        if self.comment == "":
            return f'Este post não tem uma legenda. Usuário: {self.created_by_user.username}'
        else:
            return f'{self.comment} / Quem Postou: {self.created_by_user.username} '
        
    def get_like_notification_interface(self):
        return LikePostNotification.LikePostNotification()
    
    def get_comment_notification_interface(self):
        return CommentPostNotification.CommentPostNotification()
    
    def get_repost_notification_interface(self):
        return RepostNotification.RepostNotification()
        

class PostMedia (models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='medias')
    media_file = models.FileField("Media File", upload_to=get_file_post_media_path, unique=True, validators=[validate_file_extension])
    position = models.IntegerField("Position")

    class Meta:
        verbose_name = "PostMedia"
        verbose_name_plural = "PostMedias"

    def __str__(self):
        return self.post.__str__()

    def clean(self):
        is_post_media_exists = PostMedia.objects.filter(post=self.post.id, position = self.position).exists()
        if is_post_media_exists:
            raise ValidationError('Já existe um aquivo de media nesta posição para este post')

    def save(self, *args, **kwargs):
        try:
            super(PostMedia, self).save(*args, **kwargs)
        except IndexError:
            raise ValidationError

class Comment(models.Model):
    limit = models.Q(app_label = 'myapp', model = 'post') | models.Q(app_label = 'myapp', model = 'comment') | models.Q(app_label = 'myapp', model = 'profile') | models.Q(app_label = 'myapp', model = 'repost')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to = limit)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    comment = models.TextField("Comentário", max_length=2200)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    quantity_likes = models.IntegerField("Quantidades de curtidas", default=0)
    quantity_comment = models.IntegerField("Quantidade de comentários", default=0)

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return f'Post: {self.content_object.__str__()} / Comentado por: {self.user.username} / Comentário: {self.comment} / ID: {self.id}'
    
    def get_like_notification_interface(self):
        return LikeCommentNotification.LikeCommentNotification()
    
    def get_comment_notification_interface(self):
        return CommentOtherComment.CommentOtherNotification()

class Like(models.Model):
    limit = models.Q(app_label = 'myapp', model = 'post') | models.Q(app_label = 'myapp', model = 'comment') | models.Q(app_label = 'myapp', model = 'repost') | models.Q(app_label = 'myapp', model = 'profile')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to = limit)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Like"
        verbose_name_plural = "Likes"

    def __str__(self):
        return f'Post: {self.content_object.__str__()} / Curtido por: {self.user.username} / ID: {self.id}'

    def clean(self):
        is_like_exists = Like.objects.filter(object_id=self.object_id, user=self.user.id).exists()
        if is_like_exists:
            raise ValidationError('Este usuário já curtiu esta publicação')

    def save(self, *args, **kwargs):
        try:
            super(Like, self).save(*args, **kwargs)
        except IndexError:
            raise ValidationError

class Repost(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    limit = models.Q(app_label = 'myapp', model = 'post')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to = limit)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shares")
    quantity_visualization = models.IntegerField("Quantidade de visualizações", default=0)
    quantity_comment = models.IntegerField("Quantidade de comentários", default=0)
    quantity_likes = models.IntegerField("Quantidade de curtidas", default=0)  
    quantity_shares = models.IntegerField("Quantidade de compartilhamentos", default=0)
    comment = models.TextField("Legenda", null=True, blank=True)
    

    class Meta:
        verbose_name = "Repost"
        verbose_name_plural = "Reposts"

    def clean(self):
        is_repost_exists = Repost.objects.filter(content_type=self.content_type, user=self.user.id, comment=self.comment).exists()
        if is_repost_exists:
            raise ValidationError('Você já compartilhou esta publicação dizendo a mesma coisa')

    def save(self, *args, **kwargs):
        try:
            super(Repost, self).save(*args, **kwargs)
        except IndexError:
            raise ValidationError
    
    def __str__(self):
        return f'Repostado por: {self.user.username} / Comentário do repost: {self.comment} Post: {self.content_object.comment} / ID: {self.id}'
    
    def get_like_notification_interface(self):
        return LikeRepostNotification.LikeRepostNotification()
    
    def get_comment_notification_interface(self):
        return CommentRepost.CommentRepostNotification()

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    is_read = models.BooleanField(default=False)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['timestamp']

    def clean(self):
        is_notification_exists = Notification.objects.filter(content_type=self.content_type, object_id=self.content_object.id).exists()
        if is_notification_exists:
            raise ValidationError('Já existe uma notificação sobre isso')
        
    def save(self, *args, **kwargs):
        try:
            super(Notification, self).save(*args, **kwargs)
        except IndexError:
            raise ValidationError
        
    



