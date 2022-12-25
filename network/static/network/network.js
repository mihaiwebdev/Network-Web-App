document.addEventListener('DOMContentLoaded', () => {
    
    // Add events for the navbar
    document.querySelector('#home').addEventListener('click', () => load_posts('posts'))
    document.querySelector('#allPosts').addEventListener('click', () => load_posts('posts'))
    if (document.querySelector('#userFollowing') !== null) {
        document.querySelector('#userFollowing').addEventListener('click', () => load_posts('following'))
    }
    if (document.querySelector('#create') !== null) {
        document.querySelector('#create').addEventListener('click', create_post)
    }
  
    // By default, load the feed
    load_posts('posts');
   
})


const load_posts = (posts) => {
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
        fetch(`/${posts}`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.length > 0) {
                
                data[0].posts.forEach(post => {
            
                    // Make the post container
                    const postCard = document.createElement('div')
                    postCard.className = 'd-flex flex-column'

                    //  Creat Like button and add logic
                    const likeBtn = document.createElement('button')
                    likeBtn.setAttribute('id', post.id)
                    
                    if (post.likes.includes(data[1].logged_user)) {

                        likeBtn.innerHTML= 'Unlike'
                        likeBtn.className = 'btn btn-danger'
                        likeBtn.onclick = () => like_post(post.id, 'unlike')
                        
                    } else {
                        likeBtn.innerHTML= 'Like'
                        likeBtn.className = 'btn btn-primary'
                        likeBtn.onclick = () => like_post(post.id, 'like')
                    }

                    // Create edit button for the author and add event
                    const editBtn = document.createElement('button')
                    editBtn.innerHTML = 'Edit'

                    if (post.author === data[1].logged_user) {

                        editBtn.className = 'd-block btn btn-secondary'
                    }
                    else {
                        editBtn.className = 'd-none'
                    }
                    editBtn.onclick = () => edit_post(post)

                    // Create header with the psot author and add event listener
                    const postAuthor = document.createElement('h4')
                    postAuthor.className = 'post-username'
                    postAuthor.setAttribute('id', post.author)
                    postAuthor.innerHTML = post.author
                    postAuthor.onclick = () => show_profile(postAuthor.id)

                    // Create post content, timestamp, likes and comments
                    const postBody = document.createElement('p')
                    postBody.innerHTML = post.text

                    const postTime = document.createElement('small')
                    postTime.innerHTML = post.timestamp

                    const postLikes = document.createElement('p')
                    postLikes.innerHTML = post.likes.length

                    const postComments = document.createElement('p')
                    postComments.innerHTML = post.comments.length

                    // Append all elements to the post container
                    postCard.append(postAuthor, postBody, postTime, postLikes, likeBtn, editBtn, postComments)
                
                    // Display post container on the page
                    document.getElementById('feed').appendChild(postCard)

                    // Add event listener for cliking the username
                    if (document.getElementById('userProfile') !== null) {
                        const user = document.getElementById('userProfile').innerText
                        document.getElementById('userProfile').onclick = () => show_profile(user)
                    } 

                })
            } else {
                document.getElementById('feed').innerHTML = '<h2>You\'re following list is empty</h2>'
            }

            document.getElementById('pageNav').innerHTML = `
            <ul class="pagination">
                <li class="page-item"><a class="page-link" href="?page=${data[0].page - 1}">Previous</a></li>
                
    
                <li class="page-item"><a class="page-link" href="?page=${data[0].page + 1}">Next</a></li>
            </ul>
            `

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

    document.getElementById('backBtn').onclick = () => load_posts('posts')
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

    document.getElementById('backBtn').onclick = () => load_posts('posts')

    // fetch data of the user
    fetch(`/profile/${name}`)
    .then(res => res.json())
    .then(data => {
    
        document.getElementById('userName').innerHTML = data[0].username
        document.getElementById('followers').innerHTML = data[0].followers.length
        document.getElementById('following').innerHTML = data[0].following.length

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

                // Create and fill in the post card for every post
                const postCard = document.createElement('div')
                postCard.className = 'd-flex flex-column'

                const likeBtn = document.createElement('button')
                likeBtn.setAttribute('id', post.id)
                likeBtn.innerHTML= 'Like'
                likeBtn.className = 'btn btn-primary'

                // Create edit button for the author and add event
                const editBtn = document.createElement('button')
                editBtn.innerHTML = 'Edit'
                editBtn.onclick = () => edit_post(post)

                // Show edit button for the author and hide for other userr
                if (data[1].logged_user !== data[0].username) {
                    editBtn.className = 'd-none'
                    
                } else {
                    editBtn.className = 'd-block btn btn-secondary'
                }

                const postBody = document.createElement('p')
                postBody.innerHTML = post.text

                const postTime = document.createElement('small')
                postTime.innerHTML = post.timestamp

                const postLikes = document.createElement('p')
                postLikes.innerHTML = post.likes.length

                const postComments = document.createElement('p')
                postComments.innerHTML = post.comments.length

                postCard.append(postBody, postTime, postLikes, likeBtn, editBtn, postComments)

                document.getElementById('posts').append(postCard)
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

    fetch('/posts', {
        method: 'PUT',
        body: JSON.stringify({
            "action": [action, id],
        })
    })
    .then(() => load_posts('posts'))

}

// Edit post
const edit_post = (post) => {

    document.getElementById('createPost').style.display = 'none'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('showProfile').style.display = 'none'
    document.getElementById('pageNav').style.display = 'none'
    document.getElementById('editForm').style.display = 'block'
    document.getElementById('backBtn').style.display = 'block'

    document.getElementById('backBtn').onclick = () => load_posts('posts')

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
        .then(() => load_posts('posts'))

    })
}