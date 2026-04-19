const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 프론트엔드 정적 파일 서빙 (repo 루트)
app.use(express.static(path.join(__dirname, '..')));

// PostgreSQL 연결
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 테이블 초기화
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(60) NOT NULL,
      author VARCHAR(20) NOT NULL DEFAULT '익명',
      content TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ DB 초기화 완료');
}

// GET /api/posts - 전체 게시글 조회
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '게시글 조회 실패' });
  }
});

// POST /api/posts - 게시글 작성
app.post('/api/posts', async (req, res) => {
  try {
    const { title, author = '익명', content } = req.body;
    if (!title || !content) return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
    const result = await pool.query(
      'INSERT INTO posts (title, author, content) VALUES ($1, $2, $3) RETURNING *',
      [title, author, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '게시글 작성 실패' });
  }
});

// PUT /api/posts/:id/view - 조회수 증가
app.put('/api/posts/:id/view', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: '게시글 없음' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '조회수 업데이트 실패' });
  }
});

// DELETE /api/posts/:id - 게시글 삭제
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '게시글 삭제 실패' });
  }
});

initDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`)))
  .catch(err => { console.error('DB 초기화 실패:', err); process.exit(1); });
