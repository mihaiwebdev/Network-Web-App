document.addEventListener('DOMContentLoaded', () => {
    
    // Add events for the navbar
    document.querySelector('#home').addEventListener('click', () => load_posts('posts', '1'))
    document.querySelector('#allPosts').addEventListener('click', () => load_posts('posts', '1'))
    if (document.querySelector('#userFollowing') !== null) {
        document.querySelector('#userFollowing').addEventListener('click', () => load_posts('following', '1'))
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

    // Like and unlike logic
    if (post.likes.includes(data[1].logged_user)) {
        
        likeBtn.className = 'fa-solid fa-heart'       
    } else {
        
        likeBtn.className = 'fa-regular fa-heart'
    }

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
    postUser.className = 'mt-3'
    postUser.innerHTML = '<i class="fa-solid fa-user-ninja fa-2x"></i>'

    // Create header with the post author and add event listener
    const postHeader = document.createElement('div')
    postHeader.className = 'd-flex flex-row'
    const postAuthor = document.createElement('h4')
    postAuthor.className = 'post-username'
    postAuthor.setAttribute('id', post.author)
    postAuthor.innerHTML = `${post.author} - `
    postAuthor.onclick = () => show_profile(postAuthor.id)

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
    postComments.innerHTML = `<i class="fa-regular fa-comment mr-2"></i>${post.comments.length}`
    // TODO: add comments functionality

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
    // Display feed layout
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
        
    
        // Get all posts or following posts
        fetch(`${posts}/${page}`)
        .then(res => res.json())
        .then(data => {
        
            if (data.length > 0) {
                
                data[0].posts.forEach(post => {
                    
                    // Make post card for each post
                    post_layout(post, data, 'feed')

                    // Add event listener for cliking the username
                    if (document.getElementById('userProfile') !== null) {
                        const user = document.getElementById('userProfile').innerText
                        document.getElementById('userProfile').onclick = () => show_profile(user)
                    } 

                })

                // Hide prev or next buttons if there are no more pages
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

                document.getElementById('currentPage').innerHTML = `Page ${data[0].page} of ${data[0].num_pages}`

            } else {
                document.getElementById('feed').innerHTML = '<h2>You\'re following list is empty</h2>'
            }

        })
        .catch(err => console.log(err))
    }   

}

// Show the form for creating posts
const create_post = () => {
    
    // Display the form and hide everything else
    document.getElementById('createPost').style.display = 'block'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('showProfile').style.display = 'none'
    document.getElementById('editForm').style.display = 'none'
    document.getElementById('pageNav').style.display = 'none'
    document.getElementById('backBtn').style.display = 'block'

    document.getElementById('backBtn').onclick = () => load_posts('posts', '1')
}


// Create user profile
const show_profile = (name) => {
    
    // Show user profile and hide everything else
    document.getElementById('feed').style.display = 'none'
    document.getElementById('createPost').style.display = 'none'
    document.getElementById('showProfile').style.display = 'block'
    document.getElementById('editForm').style.display = 'none'
    document.getElementById('pageNav').style.display = 'none'
    document.getElementById('backBtn').style.display = 'block'

    document.getElementById('backBtn').onclick = () => load_posts('posts', '1')

    // fetch data of the user
    fetch(`/profile/${name}`)
    .then(res => res.json())
    .then(data => {

        // Get the user data
        const userName = document.getElementById('userName')
        userName.innerHTML = `${data[0].username}'s profile`

        const followers = document.getElementById('followers')
        followers.innerHTML = `Followers - ${data[0].followers.length}`
        

        const following = document.getElementById('following')
        following.innerHTML = `Following - ${data[0].following.length}`

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
            document.getElementById('follow').onclick = () => follow_user(data[0].username, 'unfollow')

        }
        else {

            document.getElementById('follow').innerHTML = 'Follow'    
            document.getElementById('follow').onclick = () => follow_user(data[0].username, 'follow')
            
        }
        
        // Create the html layout with user's data
        data[2].map(post => {

            post_layout(post, data, 'posts')

        })

    })

}


// Follow user
const follow_user = (user, action) => {

    fetch(`/follow/${user}`, {
        method: 'PUT',
        body: JSON.stringify({
            "action": action
        })      
    })
    .then(() => show_profile(user))
}



// Like Post
const like_post = (id, action) => {

    fetch('/posts/1', {
        method: 'PUT',
        body: JSON.stringify({
            "action": [action, id],
        })
    })

}

// Edit post
const edit_post = (post) => {

    document.getElementById('createPost').style.display = 'none'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('showProfile').style.display = 'none'
    document.getElementById('pageNav').style.display = 'none'
    document.getElementById('editForm').style.display = 'block'
    document.getElementById('backBtn').style.display = 'block'

    document.getElementById('backBtn').onclick = () => load_posts('posts', '1')

    // Get post text, id, and textarea and fill in with the text
    const EditedText = document.getElementById('editText')
    const { id, text, } = post
    EditedText.innerHTML = text
    
    document.getElementById('editForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
    
        // Send text change to server
        fetch(`/edit-post/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                "newText": EditedText.value
            })
        })
        .then(() => load_posts('posts', '1'))

    })
}
