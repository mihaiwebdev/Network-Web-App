from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class User_profile(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user")
    following = models.ManyToManyField(
        User, related_name="following", blank=True)
    followers = models.ManyToManyField(
        User, related_name="followers", blank=True)

    def serialize(self):
        return {
            "username": self.user.username,
            "following": [user.username for user in self.following.all()],
            "followers": [user.username for user in self.followers.all()],
        }


class Comment(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_comment")
    comment = models.TextField()


class Post(models.Model):
    text = models.TextField()
    likes = models.ManyToManyField(
        User, related_name="liked_by", blank=True)
    comments = models.ManyToManyField(
        Comment, related_name="post_comments", blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="post_author")

    def serialize(self):
        return {
            "id": self.id,
            "author": self.author.username,
            "text": self.text,
            "likes": [user.username for user in self.likes.all()],
            "comments": [{'comment': comment.comment, 'comment_by': comment.user.username}
                         for comment in self.comments.all()],
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M, %p"),
        }
