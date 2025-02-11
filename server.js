const express = require("express");
const app = express();
var cors = require("cors");
const multer = require("multer");

app.use(cors());

const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("'uploads/' 디렉토리가 생성되었습니다.");
}

const sanitizeFilename = (filename) => {
  return filename.replace(/[<>:"/\\|?*]+/g, "");
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("files", 10);

app.use(express.json());

let articles = [];
let articleId = 0;

app.get("/articles/theme/:theme", (req, res) => {
  const { theme } = req.params;
  const { page } = req.query;

  if (
    !theme ||
    !page ||
    !["weekly", "organization", "technology"].includes(theme)
  ) {
    return res.status(400).json({
      isSuccess: false,
      code: "400",
      message: "테마별 아티클 조회를 실패했습니다.(오류코드: 400)",
    });
  }

  const articleList = articles.map((article, index) => ({
    articleId: index + 1,
    data: { userName: article.data.userName },
    title: article.title,
    subTitle: article.subTitle,
    postFileList: article.postFileList,
  }));

  const response = {
    isSuccess: true,
    code: "200",
    timestamp: articles.uploadDate,
    result: {
      page,
      totalPages: Math.ceil(articles.length / 3) || 1,
      hasNext: articles.length > page * 3,
      article_list: articleList.slice((page - 1) * 3, page * 3),
    },
  };

  res.json(response);
});

//아티클 삭제하기, ID 11, 테스트 완료
app.delete("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;

  if (!articleId || articleId < 1 || articles.length < articleId) {
    return res.status(400).json({
      isSuccess: false,
      code: "400",
      message: "요청한 아티클 아이디가 유효하지 않습니다.(오류코드: 400)",
    });
  }

  articles.splice(articleId - 1, 1);

  return res.status(200).json({
    isSuccess: true,
    code: "200",
    timestamp: new Date().toISOString(),
    message: `아티클이 삭제됐습니다. 아티클 아이디: (${parseInt(
      articleId,
      10
    )})`,
  });
}); //주소창 예시: http://localhost:3000/articles/30

//아티클 등록, ID 4, 테스트 완료
app.post("/articles", (req, res) => {
  const { theme, title, content, userName, subTitle, postFileList } = req.body;

  if (!theme || !title || !content || !userName || !subTitle || !postFileList) {
    return res.status(400).json({
      isSuccess: false,
      code: "400",
      message: "아티클 등록에 실패했습니다.(오류코드: 400)",
    });
  }

  const timestamp = new Date().toISOString();
  const newArticle = {
    articleId: ++articleId,
    data: { userName },
    theme,
    title,
    subTitle,
    content,
    uploadDate: timestamp,
    postFileList,
  };

  articles.push(newArticle);

  res.json({
    isSuccess: true,
    code: "200",
    timestamp,
    result: newArticle,
  });
});
//주소창 예시: http://localhost:3000/articles

// 아티클 상세 조회 API (POST 방식)
app.get("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;

  const article = articles.find(
    (item) => item.articleId === parseInt(articleId)
  );

  // 아티클이 존재하는 경우
  if (article) {
    return res.status(200).json({
      isSuccess: true,
      code: "200",
      timestamp: new Date().toISOString().split("T")[0],
      result: article,
    });
  }

  return res.status(404).json({
    isSuccess: false,
    code: "404",
    message: "아티클 상세 조회에 실패했습니다.",
  });
});

// PATCH /articles/:articleId
app.patch("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;
  const { theme, title, content, subTitle } = req.body;

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

  if (theme !== undefined) article.theme = theme;
  if (title !== undefined) article.title = title;
  if (content !== undefined) article.content = content;
  if (subTitle !== undefined) article.subTitle = subTitle;

  res.status(200).json({
    isSuccess: true,
    code: "200",
    timestamp: new Date().toISOString(),
    result: {
      articleId: article.articleId,
      userName: article.userName,
      theme: article.theme,
      title: article.title,
      content: article.content,
      subTitle: article.subTitle,
      uploadDate: article.uploadDate,
    },
  });
});

// Get /articles/search
app.get("/articles/search/:keyword", (req, res) => {
  const { keyword } = req.params;

  console.log("요청된 키워드:", keyword);

  if (!keyword || keyword.trim() === "") {
    return res.status(400).json({
      isSuccess: false,
      code: "400",
      message: "keyword가 비어있습니다",
    });
  }

  const results = articles.filter((article) => {
    console.log("현재 비교 중인 글:", article);
    const isMatch =
      article.title.toLowerCase().includes(keyword.toLowerCase()) ||
      article.content.toLowerCase().includes(keyword.toLowerCase());
    console.log("매칭 여부:", isMatch);
    return isMatch;
  });

  console.log("최종 필터링 결과:", results);

  return res.status(200).json({
    isSuccess: true,
    code: "200",
    timestamp: new Date().toISOString(),
    result: results,
  });
});

// 파일 업로드 API
app.post("/files", (req, res) => {
  upload(req, res, (err) => {
    console.log("업로드된 파일:", req.files);

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          isSuccess: false,
          code: "413",
          message: "파일 크기가 최대 한도를 초과했습니다.",
        });
      }
      return res.status(400).json({
        isSuccess: false,
        code: "400",
        message: `파일 업로드 오류: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        isSuccess: false,
        code: "400",
        message: `파일 업로드에 실패했습니다. (${err.message})`,
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      fileId: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      fileName: file.originalname,
      fileUrl: `https://example.com/uploads/${file.filename}`,
    }));

    res.status(201).json({
      isSuccess: true,
      code: "201",
      timestamp: new Date().toISOString(),
      result: uploadedFiles,
    });
  });
});

/* 사용하지 않음
app.post("/articles/:articleId/files", (req, res) => {
  const { articleId } = req.params;
  const { fileIds } = req.body; 

  if (!articleId || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({
      isSuccess: false,
      code: "400",
      message:
        "유효하지 않은 요청입니다. 아티클 ID와 파일 ID 목록이 필요합니다.",
    });
  }

  // 현재는 성공 메시지만 반환
  res.status(201).json({
    isSuccess: true,
    code: "201",
    timestamp: new Date().toISOString(),
    message: `아티클 ${articleId}에 파일들이 성공적으로 연결되었습니다.`,
    fileIds,
  });
});

// 파일 삭제 API
app.delete("/files/:fileId", (req, res) => {
  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).json({
      isSuccess: false,
      code: "400",
      message: "유효하지 않은 요청입니다. 파일 ID가 필요합니다.",
    });
  }

  // 파일 존재 여부 확인
  const filePath = path.join(__dirname, "uploads", fileId);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      isSuccess: false,
      code: "404",
      message: "파일을 찾을 수 없습니다.",
    });
  }

  // 파일 삭제 처리
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({
        isSuccess: false,
        code: "500",
        message: "파일 삭제 중 서버 오류가 발생했습니다.",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: "200",
      timestamp: new Date().toISOString(),
      message: "파일이 성공적으로 삭제되었습니다.",
    });
  });
});
*/

// 서버 실행
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.use((req, res) => {
  res.status(404).json({
    isSuccess: false,
    code: "404",
    message: "요청하신 경로를 찾을 수 없습니다.(오류코드: 404)",
  });
});
