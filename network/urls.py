
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create-post", views.create_post, name="create-post"),


    # API Routes
    path("posts", views.all_posts, name="all_posts"),
    path("following", views.following_posts, name="following_posts"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("follow/<str:follow_user>", views.follow_user, name="follow_user"),
    path("edit-post/<int:post_id>", views.edit_post, name='edit_post'),
    
]
