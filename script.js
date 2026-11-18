
const postInput = document.getElementById("postInput");
const postButton = document.getElementById("postButton");
const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const filterPosts = document.getElementById("filterPosts");
const charCount = document.getElementById("charCount");
const emptyMessage = document.getElementById("emptyMessage");

// Current user
const currentUser = {
    name: "Nishanth",
    username: "nishanth",
    avatar: "N"
};

// Generate unique IDs
function generateId() {
    return Date.now().toString() + Math.random().toString(36).slice(2);
}

// Sample posts
const samplePosts = [
    {
        id: generateId(),
        name: "Alex",
        username: "alex_dev",
        avatar: "A",
        content: "Learning JavaScript is exciting! Every day brings a new opportunity to improve my coding skills. 🚀",
        likes: 5,
        likedBy: [],
        createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: generateId(),
        name: "Sarah",
        username: "sarah_tech",
        avatar: "S",
        content: "Building projects is one of the best ways to improve programming knowledge. Keep learning and keep growing! 💻",
        likes: 12,
        likedBy: [],
        createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: generateId(),
        name: "Nishanth",
        username: "nishanth",
        avatar: "N",
        content: "Hello everyone! Welcome to my MiniTweet micro-blogging platform. Happy to share my thoughts here! 🎉",
        likes: 3,
        likedBy: [],
        createdAt: new Date(Date.now() - 1800000).toISOString()
    }
];

// Load posts from Local Storage
let posts;

try {
    const savedPosts = localStorage.getItem("miniTweetPosts");
    posts = savedPosts ? JSON.parse(savedPosts) : null;

    if (!Array.isArray(posts)) {
        posts = samplePosts;
    }
} catch (error) {
    posts = samplePosts;
}

// Save posts
function savePosts() {
    localStorage.setItem("miniTweetPosts", JSON.stringify(posts));
}

// Escape HTML to prevent user content being interpreted as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// Format date
function formatDate(date) {
    const postDate = new Date(date);

    if (Number.isNaN(postDate.getTime())) {
        return "Unknown date";
    }

    return postDate.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Render posts
function displayPosts() {

    const searchText = searchInput.value.toLowerCase().trim();
    const filter = filterPosts.value;

    let filteredPosts = [...posts];

    // Search posts
    if (searchText) {
        filteredPosts = filteredPosts.filter(post =>
            post.content.toLowerCase().includes(searchText) ||
            post.name.toLowerCase().includes(searchText) ||
            post.username.toLowerCase().includes(searchText)
        );
    }

    // Filter posts
    if (filter === "my") {
        filteredPosts = filteredPosts.filter(
            post => post.username === currentUser.username
        );
    }

    if (filter === "liked") {
        filteredPosts = filteredPosts.filter(
            post => Array.isArray(post.likedBy) &&
            post.likedBy.includes(currentUser.username)
        );
    }

    // Latest posts first
    filteredPosts.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    postsContainer.innerHTML = "";

    emptyMessage.style.display =
        filteredPosts.length === 0 ? "block" : "none";

    // Create post cards
    filteredPosts.forEach(post => {

        const liked = Array.isArray(post.likedBy) &&
            post.likedBy.includes(currentUser.username);

        const isOwner = post.username === currentUser.username;

        const card = document.createElement("article");
        card.className = "post-card";

        card.innerHTML = `
            <div class="post-header">

                <div class="post-user">

                    <div class="avatar">
                        ${escapeHTML(post.avatar)}
                    </div>

                    <div>
                        <h4>${escapeHTML(post.name)}</h4>
                        <span>
                            @${escapeHTML(post.username)}
                            · ${escapeHTML(formatDate(post.createdAt))}
                        </span>
                    </div>

                </div>

            </div>

            <div class="post-content">
                ${escapeHTML(post.content)}
            </div>

            <div class="post-actions">

                <button
                    class="${liked ? "liked" : ""}"
                    data-action="like"
                    data-id="${escapeHTML(post.id)}"
                    aria-label="Like post"
                    aria-pressed="${liked}"
                >
                    <i class="${liked ? "fas" : "far"} fa-heart"></i>
                    ${post.likes} Likes
                </button>

                ${
                    isOwner
                    ? `
                    <button
                        class="delete-btn"
                        data-action="delete"
                        data-id="${escapeHTML(post.id)}"
                    >
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                    `
                    : ""
                }

            </div>
        `;

        postsContainer.appendChild(card);
    });
}

// Create post
postButton.addEventListener("click", () => {

    const content = postInput.value.trim();

    if (!content) {
        alert("Please write something before posting!");
        return;
    }

    if (content.length > 280) {
        alert("Your post cannot exceed 280 characters.");
        return;
    }

    const newPost = {
        id: generateId(),
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        content: content,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);

    savePosts();

    postInput.value = "";

    charCount.textContent = "0 / 280";

    // Show new post in feed
    searchInput.value = "";
    filterPosts.value = "all";

    displayPosts();

});

// Character counter
postInput.addEventListener("input", () => {

    const count = postInput.value.length;

    charCount.textContent = `${count} / 280`;

    charCount.style.color =
        count >= 260 ? "#e0245e" : "#8899a6";

});

// Like and Delete posts
postsContainer.addEventListener("click", event => {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const postId = button.dataset.id;
    const action = button.dataset.action;

    const post = posts.find(item => item.id === postId);

    if (!post) return;

    if (action === "like") {

        if (!Array.isArray(post.likedBy)) {
            post.likedBy = [];
        }

        const likedIndex =
            post.likedBy.indexOf(currentUser.username);

        if (likedIndex === -1) {
            post.likedBy.push(currentUser.username);
            post.likes++;
        } else {
            post.likedBy.splice(likedIndex, 1);
            post.likes = Math.max(0, post.likes - 1);
        }

        savePosts();
        displayPosts();
    }

    if (action === "delete") {

        if (post.username !== currentUser.username) {
            alert("You can only delete your own posts.");
            return;
        }

        const confirmDelete = confirm(
            "Are you sure you want to delete this post?"
        );

        if (confirmDelete) {

            posts = posts.filter(item => item.id !== postId);

            savePosts();
            displayPosts();

        }
    }

});

// Search posts
searchInput.addEventListener("input", displayPosts);

// Clear search
clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    displayPosts();
});

// Filter posts
filterPosts.addEventListener("change", displayPosts);

// Initial display
displayPosts();
