import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post, User_profile


def index(request):

    return render(request, "network/index.html")


@csrf_exempt
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


@csrf_exempt
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            user_profile = User_profile.objects.create(user=user)
            user_profile.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
def posts(request, posts, page_num):

    if request.method == "GET":

        # Get all posts
        if posts == 'posts':

            # Get posts objects to paginate
            all_posts = Post.objects.all().order_by("-timestamp")

            # Create paginator for 10 posts per page
            paginator = Paginator(all_posts, 10)

            page = paginator.page(page_num)

            # Serialize the page's posts to a list of dicts
            serialized_posts = [post.serialize() for post in page.object_list]

            return JsonResponse([{
                "posts": serialized_posts,
                "page": page_num,
                "num_pages": paginator.num_pages,
                "count": paginator.count,
            },
                {"logged_user": request.user.username}], safe=False)

        # Get following posts
        elif posts == 'following':

            if request.user.is_authenticated:

                # Get current user and it's following
                user = User.objects.get(username=request.user)
                user_following = User_profile.objects.get(
                    user=user).following.all()

                if len(user_following) > 0:

                    # Get all following users posts
                    users_posts = Post.objects.filter(
                        author__in=user_following).all().order_by("-timestamp")

                    # Create paginator for 10 posts per page
                    following_paginator = Paginator(users_posts, 10)

                    following_page = following_paginator.page(page_num)

                    serialized_following = [post.serialize()
                                            for post in following_page.object_list]

                    return JsonResponse([{
                        "posts": serialized_following,
                        "page": page_num,
                        "num_pages": following_paginator.num_pages,
                        "count": following_paginator.count,
                    },
                        {"logged_user": request.user.username}], safe=False)

                else:
                    return JsonResponse({"message": "You don't follow any user"})

            else:
                return HttpResponseRedirect(reverse('login'))

        else:
            return JsonResponse({"error": "Page does not exists"})

    # Handle put method for like and unlike
    elif request.method == 'PUT':
        if request.user.is_authenticated:

            # Get the post
            data = json.loads(request.body)
            post_id = data["action"][1]
            post = Post.objects.get(pk=post_id)

            # Add or remove the like
            if data["action"][0] == 'like':
                post.likes.add(User.objects.get(pk=request.user.id))
            elif data["action"][0] == 'unlike':
                post.likes.remove(User.objects.get(pk=request.user.id))

            return HttpResponse(status=201)

        else:
            return HttpResponseRedirect(reverse('login'))

    else:
        return HttpResponse(status=404)


@login_required
def create_post(request):

    # Composing a new post must be via POST
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get and check content
    text = request.POST["text"]

    if len(text) < 1:
        return JsonResponse({"err": "Field can't be empty"})
    else:
        # Create and save the post
        post = Post(author=request.user, text=text)
        post.save()

    return HttpResponseRedirect(reverse("index"))


def profile(request, username, page_num):

    # Send user json data
    if request.method == 'GET':

        # Get user profile
        user = User.objects.filter(username=username).first()

        user_profile = User_profile.objects.filter(user=user).first()

        # Get user posts to paginate
        user_posts = Post.objects.filter(
            author=user).all().order_by("-timestamp")

        # Create paginator for 10 posts per page
        paginator = Paginator(user_posts, 10)

        page = paginator.page(page_num)

        # Serialize the page's posts to a list of dicts
        serialized_posts = [post.serialize() for post in page.object_list]

        return JsonResponse([user_profile.serialize(), {"logged_user": request.user.username},
                             {
            "posts": serialized_posts,
            "page": page_num,
            "num_pages": paginator.num_pages,
            "count": paginator.count,
        }], safe=False)


@csrf_exempt
def follow_user(request, follow_user):

    # Check if user is logged in
    if request.user.is_authenticated:

        if request.method == 'PUT':

            # Get follower and followed profile
            follower = User.objects.get(pk=request.user.id)
            follower_user = User_profile.objects.get(user=follower)
            followed_user = User.objects.get(username=follow_user)
            followed_profile = User_profile.objects.get(user=followed_user)

            # Follow or unfollow based on the data user sends
            data = json.loads(request.body)

            if data['action'] == 'follow':
                followed_profile.followers.add(follower)
                follower_user.following.add(followed_user)

                return HttpResponse(status=201)

            elif data['action'] == 'unfollow':
                followed_profile.followers.remove(follower)
                follower_user.following.remove(followed_user)

                return HttpResponse(status=202)
        else:

            return JsonResponse({
                "error": 'PUT request required'
            })

    else:
        return JsonResponse({
            "error": "You must be logged in"
        })


@login_required
def edit_post(request, post_id):

    if request.method == 'PUT':

        # Get the post text and update it in database with the edited one
        data = json.loads(request.body)

        try:
            post = Post.objects.get(pk=post_id)
            post.text = data['newText']
            post.save()

        except post.DoesNotExist:
            return JsonResponse({
                "error": 'Post does not exist'
            })

        return HttpResponse(status=200)

    return JsonResponse({
        "error": 'PUT request required'
    })
