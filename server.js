const express = require("express");
const app = express();
var cors = require("cors");
const multer = require("multer");

app.use(cors());

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
    data: { userName: article.data.userName || "string" },
    title: article.title || "string",
    subTitle: article.subTitle || "string",
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
    message: `아티클이 삭제됐습니다. 아티클 아이디: (${parseInt(articleId, 10)})`,
  });

}); //주소창 예시: http://localhost:3000/articles/30

//아티클 등록, ID 4, 테스트 완료
app.post("/articles", (req, res) => {
  const { theme, title, content, userName, subTitle } = req.body;

  if (!theme || !title || !content || !userName || !subTitle) {
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

  // title과 content에서만 필터링
  const results = articles.filter((article) => {
    console.log("현재 비교 중인 글:", article); // 각 글 로그
    const isMatch =
      article.title.toLowerCase().includes(keyword.toLowerCase()) ||
      article.content.toLowerCase().includes(keyword.toLowerCase());
    console.log("매칭 여부:", isMatch); // 매칭 여부 로그
    return isMatch;
  });

  console.log("최종 필터링 결과:", results); // 최종 결과 로그

  return res.status(200).json({
    isSuccess: true,
    code: "200",
    timestamp: new Date().toISOString(),
    result: results,
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 저장 디렉토리
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 파일 크기: 5MB
}).array("files", 10);

// 파일 업로드 API
app.post("/articles/:articleId/files", (req, res) => {
  const { articleId } = req.params;

  if (!articleId) {
    return res.status(400).json({
      isSuccess: false,
      code: "400",
      message: "아티클 ID가 유효하지 않습니다.",
    });
  }

  upload(req, res, (err) => {
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

    // 파일 업로드 성공
    const uploadedFiles = req.files.map((file) => ({
      fileId: `${Date.now()}-${Math.floor(Math.random() * 10000)}`, // 고유 ID 생성
      fileName: file.originalname,
      fileUrl: `https://example.com/uploads/${file.filename}`,
    }));

    res.status(201).json({
      isSuccess: true,
      code: "201",
      timestamp: new Date().toISOString(),
      result: {
        articleId: parseInt(articleId, 10),
        uploadedFiles,
      },
    });
  });
});

// 파일 삭제 API
app.delete("/articles/:articleId/files/:fileId", (req, res) => {
  const { articleId, fileId } = req.params;

  // 권한 확인
  const authorization = req.headers["authorization"];
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(403).json({
      isSuccess: false,
      code: "403",
      message: "파일 삭제 권한이 없습니다.",
    });
  }

  // 유효성 검사
  if (!articleId || !fileId) {
    return res.status(400).json({
      isSuccess: false,
      code: "400",
      message: "유효하지 않은 요청입니다.",
    });
  }

  // 파일 존재 여부 확인
  const filePath = path.join(
    __dirname,
    "uploads",
    `example-file-${fileId}.png`
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      isSuccess: false,
      code: "404",
      message: "파일 또는 아티클을 찾을 수 없습니다.",
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

//예외처리, 테스트 완료
app.use((req, res) => {
  res.status(404).json({
    isSuccess: false,
    code: "404",
    message: "요청하신 경로를 찾을 수 없습니다.(오류코드: 404)",
  });
});

app.listen(3000);
