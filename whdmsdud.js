const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 저장 디렉토리
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 최대 파일 크기: 5MB
}).array('files', 10);

// 파일 업로드 API
app.post('/files', (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    isSuccess: false,
                    code: '413',
                    message: '파일 크기가 최대 한도를 초과했습니다.',
                });
            }
            return res.status(400).json({
                isSuccess: false,
                code: '400',
                message: `파일 업로드 오류: ${err.message}`,
            });
        } else if (err) {
            return res.status(400).json({
                isSuccess: false,
                code: '400',
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
            code: '201',
            timestamp: new Date().toISOString(),
            result: uploadedFiles,
        });
    });
});

// 아티클에 파일 연결 API
app.post('/articles/:articleId/files', (req, res) => {
    const { articleId } = req.params;
    const { fileIds } = req.body; // 클라이언트에서 파일 ID 리스트를 전달

    if (!articleId || !Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({
            isSuccess: false,
            code: '400',
            message: '유효하지 않은 요청입니다. 아티클 ID와 파일 ID 목록이 필요합니다.',
        });
    }

    // 현재는 성공 메시지만 반환
    res.status(201).json({
        isSuccess: true,
        code: '201',
        timestamp: new Date().toISOString(),
        message: `아티클 ${articleId}에 파일들이 성공적으로 연결되었습니다.`,
        fileIds,
    });
});

// 파일 삭제 API
app.delete('/files/:fileId', (req, res) => {
    const { fileId } = req.params;

    if (!fileId) {
        return res.status(400).json({
            isSuccess: false,
            code: '400',
            message: '유효하지 않은 요청입니다. 파일 ID가 필요합니다.',
        });
    }

    // 파일 존재 여부 확인
    const filePath = path.join(__dirname, 'uploads', fileId);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            isSuccess: false,
            code: '404',
            message: '파일을 찾을 수 없습니다.',
        });
    }

    // 파일 삭제 처리
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({
                isSuccess: false,
                code: '500',
                message: '파일 삭제 중 서버 오류가 발생했습니다.',
            });
        }

        return res.status(200).json({
            isSuccess: true,
            code: '200',
            timestamp: new Date().toISOString(),
            message: '파일이 성공적으로 삭제되었습니다.',
        });
    });
});

// 서버 실행
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
