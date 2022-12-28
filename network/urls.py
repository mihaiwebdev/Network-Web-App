
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create-post", views.create_post, name="create-post"),


    # API Routes
    path("show/<str:posts>/<int:page_num>", views.posts, name="all_posts"),
    path("profile/<str:username>/<int:page_num>", views.profile, name="profile"),
    path("follow/<str:follow_user>", views.follow_user, name="follow_user"),
    path("edit-post/<int:post_id>", views.edit_post, name='edit_post'),
    
]
