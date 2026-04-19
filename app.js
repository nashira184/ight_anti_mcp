// 게시판 앱 - REST API 연결 버전
const API = '/api';

let posts = [];
let currentViewId = null;

// 게시글 전체 불러오기
async function fetchPosts() {
  try {
    const res = await fetch(`${API}/posts`);
    if (!res.ok) throw new Error('서버 오류');
    posts = await res.json();
  } catch (err) {
    posts = [];
    console.error('게시글 불러오기 실패:', err);
  }
  renderPosts();
}

// 게시글 목록 렌더링
function renderPosts() {
  const board = document.getElementById('board');
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.author.toLowerCase().includes(query) ||
    p.content.toLowerCase().includes(query)
  );

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
        <span>🕐 ${formatDate(p.created_at)}</span>
        <span>👁️ ${p.views}</span>
      </div>
    </div>
  `).join('');
}

// 글쓰기 모달 열기
function openModal() {
  document.getElementById('input-title').value = '';
  document.getElementById('input-author').value = '';
  document.getElementById('input-content').value = '';
  document.getElementById('modal-title').textContent = '✏️ 새 글 작성';
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('input-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// 게시글 등록
async function submitPost() {
  const title = document.getElementById('input-title').value.trim();
  const author = document.getElementById('input-author').value.trim() || '익명';
  const content = document.getElementById('input-content').value.trim();
  if (!title) { alert('제목을 입력해주세요.'); return; }
  if (!content) { alert('내용을 입력해주세요.'); return; }

  try {
    const res = await fetch(`${API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, content })
    });
    if (!res.ok) throw new Error('등록 실패');
    closeModal();
    fetchPosts();
  } catch (err) {
    alert('게시글 등록에 실패했습니다.');
  }
}

// 게시글 읽기 (조회수 증가)
async function viewPost(id) {
  try {
    const res = await fetch(`${API}/posts/${id}/view`, { method: 'PUT' });
    if (!res.ok) throw new Error('조회 실패');
    const post = await res.json();
    currentViewId = id;
    document.getElementById('view-title').textContent = post.title;
    document.getElementById('view-meta').innerHTML =
      `<span>👤 ${escHtml(post.author)}</span><span>🕐 ${formatDate(post.created_at)}</span><span>👁️ ${post.views}회</span>`;
    document.getElementById('view-content').textContent = post.content;
    document.getElementById('view-overlay').classList.add('active');
    // 목록의 조회수도 즉시 반영
    const p = posts.find(p => p.id === id);
    if (p) p.views = post.views;
  } catch (err) {
    alert('게시글을 불러오지 못했습니다.');
  }
}

function closeView() {
  document.getElementById('view-overlay').classList.remove('active');
  currentViewId = null;
}

// 게시글 삭제
async function deleteCurrentPost() {
  if (currentViewId === null) return;
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await fetch(`${API}/posts/${currentViewId}`, { method: 'DELETE' });
    closeView();
    fetchPosts();
  } catch (err) {
    alert('삭제에 실패했습니다.');
  }
}

// 유틸
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeView(); }
});

// 검색
document.getElementById('search-input').addEventListener('input', renderPosts);

// 초기 로드
fetchPosts();
