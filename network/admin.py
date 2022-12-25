from django.contrib import admin

from .models import User, Post, Comment, User_profile
# Register your models here.

admin.site.register(User),
admin.site.register(Comment),
admin.site.register(Post),
admin.site.register(User_profile),
