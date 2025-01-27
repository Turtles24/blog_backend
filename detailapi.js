// 필요한 모듈 불러오기
const express = require("express"); // Express 라이브러리
const app = express(); // Express 앱 초기화
const PORT = 3000; // 서버 포트 설정

// JSON 파싱을 위한 미들웨어
app.use(express.json());

// Mock 데이터베이스 (임시로 데이터 관리)
const articles = [
  {
    articleId: 1,
    userName: "John Doe",
    theme: "Technology",
    title: "The Future of AI",
    content: "Artificial intelligence is transforming industries...",
    uploadDate: "2024-11-14",
  },
  {
    articleId: 2,
    userName: "Jane Smith",
    theme: "Health",
    title: "Healthy Living Tips",
    content: "Maintaining a healthy lifestyle is easier than you think...",
    uploadDate: "2024-11-13",
  },
];

// 아티클 상세 조회 API (POST 방식)
app.post("/articles/:articleId", (req, res) => {
  // Path Parameter에서 articleId 추출 및 숫자로 변환
  const articleId = parseInt(req.params.articleId, 10);

  // 요청받은 articleId와 일치하는 아티클 찾기
  const article = articles.find((item) => item.articleId === articleId);

  // 아티클이 존재하는 경우
  if (article) {
    return res.status(200).json({
      isSuccess: true,
      code: "200",
      timestamp: new Date().toISOString().split("T")[0], // 현재 날짜 반환 (YYYY-MM-DD 형식)
      result: article,
    });
  }

  // 아티클이 존재하지 않는 경우
  return res.status(404).json({
    isSuccess: false,
    code: "404",
    message: "아티클 상세 조회에 실패했습니다.",
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
