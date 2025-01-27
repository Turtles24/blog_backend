const express = require('express');
const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(express.json());

// 예제 데이터
const articles = [
  {
    articleId: 1,
    data: { userName: 'JohnDoe' },
    theme: 'Technology',
    title: 'The Future of AI',
    content: 'Artificial intelligence is transforming technology.',
    subTitle: 'Understanding its impact',
  },
  {
    articleId: 2,
    data: { userName: 'JaneSmith' },
    theme: 'Health',
    title: 'The Future of AI',
    content: 'Health trends like mindfulness are on the rise.',
    subTitle: 'Trends to watch',
  },
];

// POST /articles/search
app.post('/articles/search', (req, res) => {
  const { keyword } = req.body;

  console.log('요청된 키워드:', keyword); // 키워드 로그

  if (!keyword || keyword.trim() === '') {
    return res.status(400).json({
      isSuccess: false,
      code: '400',
      message: 'keyword가 비어있습니다',
    });
  }

  // title과 content에서만 필터링
  const results = articles.filter((article) => {
    console.log('현재 비교 중인 글:', article); // 각 글 로그
    const isMatch =
      article.title.toLowerCase().includes(keyword.toLowerCase()) ||
      article.content.toLowerCase().includes(keyword.toLowerCase());
    console.log('매칭 여부:', isMatch); // 매칭 여부 로그
    return isMatch;
  });

  console.log('최종 필터링 결과:', results); // 최종 결과 로그

  return res.status(200).json({
    isSuccess: true,
    code: '200',
    timestamp: new Date().toISOString(),
    result: results,
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
