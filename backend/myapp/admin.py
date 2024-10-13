from django.contrib import admin
from django.contrib.auth.models import User

from .models import Post, PostMedia, Comment, Like, Notification, Profile, Repost

from .forms import UserForm

#Mix profile infor into User info
class ProfileInline(admin.StackedInline):
    model = Profile

class UserAdmin(admin.ModelAdmin):
    model = User
    fields = ['username', 'first_name', 'last_name', 'password']
    inlines = [ProfileInline]

@admin.register(Repost)
class RepostAdmin(admin.ModelAdmin):
    display = ('user', 'post', 'subtitle')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    display = ('user')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    display = ('created_by_user', 'subtitle', 'timestamp')

@admin.register(PostMedia)
class PostMediaAdmin(admin.ModelAdmin):
    display = ('post', 'media_file', 'position')
    exclude = ('media_type',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    display = ('comment_of_post', 'timestamp')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    display = ('like_of_post', 'timestamp')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("message", "timestamp", "content_type", "object_id", "content_object")

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
