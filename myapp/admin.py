from django.contrib import admin

from .models import User, Post, PostMedia, Comment, Like

from .forms import UserForm

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'name')
    form = UserForm

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    display = ('created_by_user')

@admin.register(PostMedia)
class PostMediaAdmin(admin.ModelAdmin):
    display = ('media_of_post')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    display = ('comment_of_post')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    display = ('like_of_post')