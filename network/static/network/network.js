document.addEventListener('DOMContentLoaded', () => {
    
    // Add events for the navbar and footer
    
    const forYou = document.querySelector('.for-you')
    const following = document.querySelector('.following')
    document.querySelector('#home').addEventListener('click', () => {
        forYou.classList.add('active')
        following.classList.remove('active')
        load_posts('posts', '1')})
        document.getElementById('feed').classList.add('animate')
    document.querySelector('#allPosts').addEventListener('click', () => {
        forYou.classList.add('active')
        following.classList.remove('active')
        load_posts('posts', '1')})
    
    following.addEventListener('click', () => {
        forYou.classList.remove('active')
        following.classList.add('active')
        load_posts('following', '1')
    })
    
    forYou.onclick = () => {
        forYou.classList.add('active')
        following.classList.remove('active')
        load_posts('posts', '1')
    }
    
    // Check if other features exists and add events to them 
    if (document.getElementById('userProfile') !== null) {
        const user = document.getElementById('userProfile').innerText
        document.getElementById('userProfile').onclick = () => show_profile(user, 1)
        
    } 
    if (document.querySelector('#userFollowing') !== null) {
        document.querySelector('#userFollowing').addEventListener('click', () => {
            forYou.classList.remove('active')
            following.classList.add('active')
            load_posts('following', '1')})
    }
    if (document.querySelector('#create') !== null) {
        document.querySelector('#create').addEventListener('click', create_post)
    }
  
    // By default, load the feed
    load_posts('posts', '1');
   
})

// Create the post layout
const post_layout = (post, data, page) => {
    
    // Make the post container
    const postCard = document.createElement('div')
    postCard.className = 'd-flex flex-row post-card'

    //  Creat Like button and add logic
    const likeBtn = document.createElement('i')
    likeBtn.setAttribute('id', post.id)

    // Likes
    const likeDiv = document.createElement('div')
    likeDiv.className = 'd-flex '
    const postLikes = document.createElement('p')
    postLikes.className = 'ml-2'
    postLikes.innerHTML = post.likes.length
    likeDiv.append(likeBtn,postLikes)

    // Check if post is liked or not by the user 
    if (post.likes.includes(data[1].logged_user)) {
        
        likeBtn.className = 'fa-solid fa-heart'       
    } else {
        
        likeBtn.className = 'fa-regular fa-heart'
    }

    // Like and unlike logic
    if (data[1].logged_user !== '') {

        likeBtn.onclick = () => {
            
            if (likeBtn.className === 'fa-solid fa-heart') {
                
                like_post(post.id, 'unlike')
                
                likeBtn.className = 'fa-regular fa-heart'
                
                postLikes.innerHTML = `${parseInt(postLikes.innerHTML) - 1}`
                
            } else if (likeBtn.className === 'fa-regular fa-heart') {
                
                like_post(post.id, 'like')
                
                likeBtn.className = 'fa-solid fa-heart'
                
                postLikes.innerHTML = `${parseInt(postLikes.innerHTML) + 1 }`
            }
        }
    } else {
        likeBtn.onclick = () => window.location.href ='/login'
    }

    // Create edit button for the author and add event
    const editBtn = document.createElement('p')
    editBtn.innerHTML = 'Edit'

    if (post.author === data[1].logged_user) {

        editBtn.className = 'edit-btn d-block '
    }
    else {
        editBtn.className = 'edit-btn d-none'
    }
    editBtn.onclick = () => edit_post(post)

    // User avatar
    const postUser = document.createElement('div')
    postUser.className = 'mt-2'
    postUser.innerHTML = '<i class="fa-solid fa-user-astronaut fa-2x"></i>'

    // Create header with the post author and add event listener
    const postHeader = document.createElement('div')
    postHeader.className = 'd-flex flex-row'
    const postAuthor = document.createElement('h4')
    postAuthor.className = 'post-username'
    postAuthor.setAttribute('id', post.author)
    postAuthor.innerHTML = `${post.author} - `
    postAuthor.onclick = () => show_profile(postAuthor.id, 1)

    // Create timestamp   
    const postTime = document.createElement('p')
    postTime.innerHTML = post.timestamp
    postTime.className = 'post-timestamp'

    // Append to post header
    postHeader.append(postAuthor, postTime)

    // Create post text
    const postText = document.createElement('p')
    postText.innerHTML = post.text
    postText.className = 'post-text'

    // Comments
    const postComments = document.createElement('p')
    postComments.className = 'post-comments'
    postComments.innerHTML = `<i class="fa-regular fa-comment mr-2"></i>${post.comments.length}`
    postComments.onclick = () => show_comments(post.id)

    // Post actions element
    const postActions = document.createElement('div')
    postActions.className = 'post-actions'
    postActions.append(likeDiv, postComments, editBtn)

    // Create post body container
    const postBody = document.createElement('div')
    postBody.className = 'post-body'

    // Append elements to post body container
    postBody.append(postHeader, postText, postActions)

    // Append all elements to the post container
    postCard.append(postUser, postBody)

    // Display post container on the page
    document.getElementById(page).appendChild(postCard)
}


// Load the requested posts
const load_posts = (posts, page) => {
    

    // Display feed layout and pagination and hide everything else
    if (document.getElementById('createPost') && 
        document.getElementById('feed') !== null)
    {

        document.getElementById('feed').innerHTML = ''
        document.getElementById('createPost').style.display = 'none'
        document.getElementById('feed').style.display = 'block'
        document.getElementById('pageNav').style.display = 'block'
        document.getElementById('showProfile').style.display = 'none'
        document.getElementById('editForm').style.display = 'none'
        document.getElementById('backBtn').style.display = 'none'
        document.getElementById('comments').style.display = 'none'
        
    
        // Get all posts or following posts
        fetch(`/show/${posts}/${page}`)
        .then(res => res.json())
        .then(data => {
        
            if (data.length > 0) {
                
                data[0].posts.forEach(post => {
                    
                    // Make post card for each post
                    post_layout(post, data, 'feed')                  

                })

                // Hide previous or next buttons if there are no more pages
                // else fetch the next pages
                if (data[0].page === data[0].num_pages) {
                    document.getElementById('next').style.display = 'none'
                } else {
                    document.getElementById('next').style.display = 'block'
                    document.getElementById('next').onclick = () => load_posts(posts, data[0].page + 1)
                }
                if (data[0].page === 1) {
                    document.getElementById('prev').style.display = 'none'
                } else {
                    document.getElementById('prev').style.display = 'block'
                    document.getElementById('prev').onclick = () => load_posts(posts, data[0].page - 1)
                }

                // Show the current page
                document.getElementById('currentPage').innerHTML = `Page ${data[0].page} of ${data[0].num_pages}`

            // User doesn't follow anyone
            } else {
                document.getElementById('pageNav').style.display = 'none'
                document.getElementById('feed').innerHTML = '<h3 class="mt-4">You\'r following list is empty</h3>'
            }

        })
        .catch(err => console.log(err))

    }   

}

// Get csrf token
function get_token() {
    
    if (!document.cookie) {
      return null;
    }
    
    // Get cookies and filter out the csrf token
    const xsrfCookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith('csrftoken' + '='));
  
    if (xsrfCookies.length === 0) {
      return null;
    }
    
    // Return the value of the token
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}

// Save the token in variable
const csrf_token = get_token()


// Show the form for creating posts
const create_post = () => {
    
    // Display the form and hide everything else
    document.getElementById('createPost').style.display = 'block'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('showProfile').style.display = 'none'
    document.getElementById('editForm').style.display = 'none'
    document.getElementById('pageNav').style.display = 'none'
    document.getElementById('backBtn').style.display = 'block'
    document.getElementById('comments').style.display = 'none'

    document.getElementById('backBtn').onclick = () => load_posts('posts', '1')
}


// Create user profile
const show_profile = (name, page_num) => {
    
    // Show user profile and hide everything else
    document.getElementById('feed').style.display = 'none'
    document.getElementById('createPost').style.display = 'none'
    document.getElementById('showProfile').style.display = 'block'
    document.getElementById('editForm').style.display = 'none'
    document.getElementById('pageNav').style.display = 'block'
    document.getElementById('backBtn').style.display = 'block'
    document.getElementById('comments').style.display = 'none'

    document.getElementById('backBtn').onclick = () => load_posts('posts', '1')

    // fetch data of the user
    fetch(`/profile/${name}/${page_num}`)
    .then(res => res.json())
    .then(data => {
        
        // Get the user data
        const userName = document.getElementById('userName')
        userName.innerHTML = `${data[0].username}'s profile`

        const followers = document.getElementById('followers')
        followers.innerHTML = `<span>Followers </span>${data[0].followers.length}`
        
        const following = document.getElementById('following')
        following.innerHTML = `<span>Following </span>${data[0].following.length}`
        
        // Empty the page
        document.getElementById('posts').innerHTML = ''
 
        // Show follow button for other users than the author
        if (data[1].logged_user !== data[0].username) {
            document.getElementById('follow').className = 'd-block'
             
        } else {
            document.getElementById('follow').className = 'd-none'
        }

        // Follow and unfollow logic  
        if (data[0].followers.includes(data[1].logged_user)) {

            document.getElementById('follow').innerHTML = 'Unfollow'
            document.getElementById('follow').onclick = () => follow_user(data[0].username, 'unfollow', data[1].logged_user)

        }
        else {

            document.getElementById('follow').innerHTML = 'Follow'    
            document.getElementById('follow').onclick = () => follow_user(data[0].username, 'follow', data[1].logged_user)
            
        }
        
        // Create the html layout with user's data
        data[2].posts.map(post => {

            post_layout(post, data, 'posts')

        })

        // Hide prev or next buttons if there are no more pages
        // else fetch the next pages
        if (data[2].page === data[2].num_pages) {
            document.getElementById('next').style.display = 'none'
        } else {
            document.getElementById('next').style.display = 'block'
            document.getElementById('next').onclick = () => show_profile(name, data[2].page + 1)
        }
        if (data[2].page === 1) {
            document.getElementById('prev').style.display = 'none'
        } else {
            document.getElementById('prev').style.display = 'block'
            document.getElementById('prev').onclick = () => show_profile(name, data[2].page - 1)
        }

        document.getElementById('currentPage').innerHTML = `Page ${data[2].page} of ${data[2].num_pages}`

    })

}


// Follow user
const follow_user = (user, action, logged_user) => {
    
    // check if user is logged in and send the action
    // else show error message
    if (logged_user) {

        fetch(`/follow/${user}`, {
            method: 'PUT',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=UTF-8',
            'X-CSRFToken': csrf_token
            },
            body: JSON.stringify({
                "action": action
            })      
        })
        .then(() => show_profile(user, 1))

    } else {

        fetch(`/follow/${user}`)
        .then(res => res.json())
        .then(data => {
            // create and display err message
            const msg = document.createElement('p')
            msg.innerHTML = data.error
            msg.className = 'err-message'
            document.getElementById('showProfile').appendChild(msg)

            setTimeout(() => {
                msg.remove()
            }, 3000);
        })
    }
}



// Like Post
const like_post = (id, action) => {
    
    // Send to server the action of like or unlike of the specific post
    fetch('show/posts/1', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=UTF-8',
            'X-CSRFToken': csrf_token
            },
        body: JSON.stringify({
            "action": [action, id],
        })
    })

}

// Edit post
const edit_post = (post) => {
    
    // Show edit form and hide everything else
    document.getElementById('createPost').style.display = 'none'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('showProfile').style.display = 'none'
    document.getElementById('pageNav').style.display = 'none'
    document.getElementById('editForm').style.display = 'block'
    document.getElementById('backBtn').style.display = 'block'
    document.getElementById('comments').style.display = 'none'
    document.getElementById('backBtn').onclick = () => load_posts('posts', '1')

    // Get post text, id, and textarea and fill in with the text
    const EditedText = document.getElementById('editText')
    const { id, text, } = post
    EditedText.innerHTML = text
    
    // Handle form submit
    document.getElementById('editForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Send text change to server
        fetch(`/edit-post/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'X-CSRFToken': csrf_token
                },
            body: JSON.stringify({
                "newText": EditedText.value
            })
        })
        .then(() => load_posts('posts', '1'))

    })
}

// Show comments

const show_comments = (postID) => {
    document.querySelector('.comment-card').innerHTML = ''
    document.getElementById('createPost').style.display = 'none'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('showProfile').style.display = 'none'
    document.getElementById('editForm').style.display = 'none'
    document.getElementById('pageNav').style.display = 'none'
    document.getElementById('backBtn').style.display = 'block'
    document.getElementById('comments').style.display = 'block'
    
    document.getElementById('backBtn').onclick = () => load_posts('posts', '1')

    fetch(`/post/${postID}/comments`)
    .then(res => res.json())
    .then(data => {
        
        document.querySelector('.comment-post-user').innerText = data[0].author
        document.querySelector('.comment-post-time').innerText = data[0].timestamp
        document.querySelector('.comment-post-text').innerText = data[0].text

        data[0].comments.map(comment => {

            const author = document.createElement('h4')
            author.innerHTML = comment.comment_by
            author.className = 'comment-author'
            const text = document.createElement('p')
            text.className = 'comment-text'
            text.innerHTML = comment.comment
            const div = document.createElement('div')
            div.className = 'd-flex'
            div.append(author,text)
            document.querySelector('.comment-card').append(div)

        })
    })

    document.getElementById('submitComment').onclick = (e) => send_comment(e, postID)

}


const send_comment = (e, postID) => {
    e.preventDefault()


    const comment = document.querySelector('#commentText')

    fetch(`/post/${postID}/add-comment`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=UTF-8',
            'X-CSRFToken': csrf_token
        },
        body: JSON.stringify({
            'comment': comment.value
        })
    }).then(() => show_comments(postID))

    comment.value = ''

    
}
