// 게시판 앱
let posts = JSON.parse(localStorage.getItem('board_posts') || '[]');
let currentViewId = null;
let editMode = false;

function savePosts() {
  localStorage.setItem('board_posts', JSON.stringify(posts));
}

function getNextId() {
  return posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function renderPosts() {
  const board = document.getElementById('board');
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  let filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.author.toLowerCase().includes(query) ||
    p.content.toLowerCase().includes(query)
  );
  filtered = filtered.slice().reverse();

  document.getElementById('post-count').textContent = `전체 ${posts.length}개`;

  if (filtered.length === 0) {
    board.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>${query ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다. 첫 글을 작성해보세요!'}</p></div>`;
    return;
  }

  board.innerHTML = filtered.map(p => `
    <div class="post-card" onclick="viewPost(${p.id})">
      <div class="post-card-header">
        <span class="post-card-title">${escHtml(p.title)}</span>
        <span class="post-card-num">#${p.id}</span>
      </div>
      <div class="post-card-excerpt">${escHtml(p.content)}</div>
      <div class="post-card-meta">
        <span>👤 ${escHtml(p.author)}</span>
        <span>🕐 ${formatDate(p.date)}</span>
        <span>👁️ ${p.views}</span>
      </div>
    </div>
  `).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openModal() {
  document.getElementById('input-title').value = '';
  document.getElementById('input-author').value = '';
  document.getElementById('input-content').value = '';
  document.getElementById('modal-title').textContent = '✏️ 새 글 작성';
  document.getElementById('btn-submit').textContent = '등록';
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('input-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

function submitPost() {
  const title = document.getElementById('input-title').value.trim();
  const author = document.getElementById('input-author').value.trim() || '익명';
  const content = document.getElementById('input-content').value.trim();
  if (!title) { alert('제목을 입력해주세요.'); return; }
  if (!content) { alert('내용을 입력해주세요.'); return; }

  posts.push({ id: getNextId(), title, author, content, date: new Date().toISOString(), views: 0 });
  savePosts();
  closeModal();
  renderPosts();
}

function viewPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  post.views++;
  savePosts();
  currentViewId = id;
  document.getElementById('view-title').textContent = post.title;
  document.getElementById('view-meta').innerHTML = `<span>👤 ${escHtml(post.author)}</span><span>🕐 ${formatDate(post.date)}</span><span>👁️ ${post.views}회</span>`;
  document.getElementById('view-content').textContent = post.content;
  document.getElementById('view-overlay').classList.add('active');
}

function closeView() {
  document.getElementById('view-overlay').classList.remove('active');
  currentViewId = null;
  renderPosts();
}

function deleteCurrentPost() {
  if (currentViewId === null) return;
  if (!confirm('정말 삭제하시겠습니까?')) return;
  posts = posts.filter(p => p.id !== currentViewId);
  savePosts();
  closeView();
}

// 키보드 ESC로 모달 닫기
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeView(); }
});

renderPosts();
