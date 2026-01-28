const API_POSTS = 'http://localhost:3000/posts';
const API_COMMENTS = 'http://localhost:3000/comments';

// --- PHẦN POSTS ---

async function GetData() {
    try {
        let res = await fetch(API_POSTS);
        if (res.ok) {
            let posts = await res.json();
            let bodyTable = document.getElementById('body-table');
            bodyTable.innerHTML = '';
            for (const post of posts) {
                bodyTable.innerHTML += convertObjToHTML(post);
            }
        }
    } catch (error) { console.error("Lỗi tải posts:", error); }
}

function convertObjToHTML(post) {
    const style = post.isDeleted ? 'style="text-decoration: line-through; color: gray;"' : '';
    const actionBtn = post.isDeleted ? '<span>Đã xóa</span>' : 
        `<button onclick="editPost('${post.id}', '${post.title}', '${post.views}')">Sửa</button>
         <button onclick="DeletePost('${post.id}')">Xóa</button>`;

    return `<tr ${style}>
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.views}</td>
        <td>${actionBtn}</td>
    </tr>`;
}

async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;

    if (!id) { // Tạo mới: ID tự tăng (maxId + 1)
        let posts = await (await fetch(API_POSTS)).json();
        let maxId = posts.length > 0 ? Math.max(...posts.map(p => parseInt(p.id))) : 0;
        await fetch(API_POSTS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: (maxId + 1).toString(), title, views, isDeleted: false })
        });
    } else { // Cập nhật
        await fetch(`${API_POSTS}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, views })
        });
    }
    clearPostForm();
    GetData();
}

async function DeletePost(id) { // Xóa mềm
    await fetch(`${API_POSTS}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });
    GetData();
}

function editPost(id, title, views) {
    document.getElementById("id_txt").value = id;
    document.getElementById("title_txt").value = title;
    document.getElementById("views_txt").value = views;
}

function clearPostForm() {
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("views_txt").value = "";
}

// --- PHẦN COMMENTS (CRUD ĐẦY ĐỦ) ---

async function GetComments() {
    try {
        let res = await fetch(API_COMMENTS);
        if (res.ok) {
            let comments = await res.json();
            let bodyComments = document.getElementById('body-comments');
            bodyComments.innerHTML = comments.map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.postId}</td>
                    <td>${c.text}</td>
                    <td>
                        <button onclick="editComment('${c.id}', '${c.postId}', '${c.text}')">Sửa</button>
                        <button onclick="DeleteComment('${c.id}')">Xóa</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) { console.error("Lỗi tải comments:", error); }
}

async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let postId = document.getElementById("comment_postid_txt").value;
    let text = document.getElementById("comment_text_txt").value;

    if (!id) { // Tạo mới comment
        let comments = await (await fetch(API_COMMENTS)).json();
        let maxId = comments.length > 0 ? Math.max(...comments.map(c => parseInt(c.id))) : 0;
        await fetch(API_COMMENTS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: (maxId + 1).toString(), postId, text })
        });
    } else { // Cập nhật comment
        await fetch(`${API_COMMENTS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId, text })
        });
    }
    clearCommentForm();
    GetComments();
}

async function DeleteComment(id) {
    if(confirm("Xóa vĩnh viễn bình luận này?")) {
        await fetch(`${API_COMMENTS}/${id}`, { method: "DELETE" });
        GetComments();
    }
}

function editComment(id, postId, text) {
    document.getElementById("comment_id_txt").value = id;
    document.getElementById("comment_postid_txt").value = postId;
    document.getElementById("comment_text_txt").value = text;
}

function clearCommentForm() {
    document.getElementById("comment_id_txt").value = "";
    document.getElementById("comment_postid_txt").value = "";
    document.getElementById("comment_text_txt").value = "";
}

// Khởi chạy ban đầu
GetData();
GetComments();