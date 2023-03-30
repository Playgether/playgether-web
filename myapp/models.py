from django.db import models
from stdimage import StdImageField
from .functions import *
from django.utils import timezone
  
# Create your models here.
class User(models.Model):
    name = models.CharField("Nome", max_length = 100)
    username = models.CharField("Nome de usuário", max_length=15, unique=True)
    password = models.CharField("Senha", max_length=88)
    email = models.EmailField("Email", max_length=256, unique=True)
    profile_photo = StdImageField('Foto de perfil', null=True, blank=True, upload_to=get_file_profile_path, variations={'thumb': {'width': 480, 'height': 480, 'crop': True}}, unique=True)
    created_by_date = models.DateField("Data de criação da conta", help_text="Formato DD/MM/AAAA", default=datetime.today)
    bio = models.TextField("Bio", blank=True, null=True, max_length=500)
    hours_played = models.FloatField("Horas jogadas", default=0)
    matches_played = models.IntegerField("Número de partidas jogadas", default=0)
    performance = models.CharField("Performance", max_length=30, default="Iniciante")
    gamer_nivel = models.IntegerField("Nível gamer", default=1)
    verified = models.BooleanField("Verified", default=False)


    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        self.password = make_password(self.password)
        super(User, self).save(*args, **kwargs)
        return

class Post (models.Model):
    created_by_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    created_by_datetime = models.DateTimeField("Data e horário da postagem", help_text="Formato DD/MM/AAAA", default=timezone.now)
    quantity_visualization = models.IntegerField("Quantidade de visualizações", default=0)
    quantity_comment = models.IntegerField("Quantidade de comentários", default=0)
    quantity_likes = models.IntegerField("Quantidade de curtidas", default=0)  
    quantity_shares = models.IntegerField("Quantidade de compartilhamentos", default=0)
    subtitle = models.TextField("Legenda", null=True, blank=True)

    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __str__(self):
        if self.subtitle == "":
            return f'Este post não tem uma legenda. Usuário: {self.created_by_user.username}'
        else:
            return f'{self.subtitle} / Usuário: {self.created_by_user.username} '

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
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    comment = models.TextField("Comentário", max_length=2200)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_by_datetime = models.DateTimeField("Data e hora do comentário", help_text="Formato DD/MM/AAAA", default=timezone.now)
    likes_quantity = models.IntegerField("Quantidades de curtidas", default=0)


    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return f'Post: {self.post.__str__()} / Comentado por: {self.user.username} / Comentário: {self.comment}'

 
class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="users")
    created_by_datetime = models.DateTimeField("Data e hora do comentário", help_text="Formato DD/MM/AAAA", default=timezone.now)

    class Meta:
        verbose_name = "Like"
        verbose_name_plural = "Likes"

    def __str__(self):
        return f'Post: {self.post.__str__()} / Curtido por: {self.user.username}'

    def clean(self):
        is_like_exists = Like.objects.filter(post=self.post.id, user=self.user.id).exists()
        if is_like_exists:
            raise ValidationError('Este usuário já curtiu esta publicação')

    def save(self, *args, **kwargs):
        try:
            super(Like, self).save(*args, **kwargs)
        except IndexError:
            raise ValidationError




