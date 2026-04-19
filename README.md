# 📋 게시판 홈페이지

Node.js Express + PostgreSQL 기반 게시판입니다.

## 기능
- ✏️ 게시글 작성 (제목 / 작성자 / 내용)
- 📖 게시글 읽기 (조회수 자동 증가)
- 🗑️ 게시글 삭제
- 🔍 검색 (제목 / 작성자 / 내용)
- 🌐 모든 기기에서 공유 가능

---

## 🖥️ 로컬 실행 방법

### 1. PostgreSQL 준비
로컬에 PostgreSQL이 없다면 [Neon.tech](https://neon.tech) (무료)에서 DB를 만드세요.

### 2. 환경변수 설정
```bash
cd backend
echo DATABASE_URL=postgresql://유저:비밀번호@호스트/DB명 > .env
```

### 3. 서버 실행
```bash
cd backend
npm install
npm start
```

### 4. 브라우저에서 접속
```
http://localhost:3000
```

---

## 🚀 Render.com 배포 방법

1. [Render.com](https://render.com) 가입 후 로그인
2. **New → Web Service** 클릭
3. GitHub 연결 후 `ight_anti_mcp` 레포 선택
4. 설정:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **New → PostgreSQL** 로 무료 DB 생성
6. Web Service 환경변수에 `DATABASE_URL` 붙여넣기
7. **Deploy** 클릭 🎉

---

## API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/posts | 전체 게시글 조회 |
| POST | /api/posts | 게시글 작성 |
| PUT | /api/posts/:id/view | 조회수 증가 |
| DELETE | /api/posts/:id | 게시글 삭제 |
