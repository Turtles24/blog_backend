const express = require("express");
const app = express();

app.use(express.json());

// Mock data
const articles = [
  {
    articleId: 1,
    theme: "Technology",
    title: "The Rise of AI",
    content: "Artificial Intelligence is transforming the world.",
    subTitle: "AI in a nutshell",
    userName: "John Doe",
    uploadDate: "2024-11-14",
  },
  // Add more articles here as needed
];

// PATCH /articles/:articleId
app.patch("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;
  const { theme, title, content, subTitle } = req.body;

  // Find the article by ID
  const article = articles.find(
    (item) => item.articleId === parseInt(articleId)
  );

  if (!article) {
    return res.status(404).json({
      isSuccess: false,
      code: "404",
      message: "해당 게시글을 찾을 수 없습니다.",
    });
  }

  // Update the article properties if provided
  if (theme !== undefined) article.theme = theme;
  if (title !== undefined) article.title = title;
  if (content !== undefined) article.content = content;
  if (subTitle !== undefined) article.subTitle = subTitle;

  // Send the success response
  res.status(200).json({
    isSuccess: true,
    code: "200",
    timestamp: new Date().toISOString(),
    result: {
      articleId: article.articleId,
      data: {
        userName: article.userName,
      },
      theme: article.theme,
      title: article.title,
      content: article.content,
      subTitle: article.subTitle,
      uploadDate: article.uploadDate,
    },
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});