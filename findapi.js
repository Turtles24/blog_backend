const express = require("express");
const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(express.json());

// 예제 데이터
const articles = [
  {
    articleId: 1,
    data: { userName: "JohnDoe" },
    theme: "Technology",
    title: "The Future of AI",
    content: "Artificial intelligence is transforming technology.",
    subTitle: "Understanding its impact",
  },
  {
    articleId: 2,
    data: { userName: "JaneSmith" },
    theme: "Health",
    title: "The Future of AI",
    content: "Health trends like mindfulness are on the rise.",
    subTitle: "Trends to watch",
  },
];

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
