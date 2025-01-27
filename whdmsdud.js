const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();



//아티클 이미지 및 파일 저장하기, ID 12
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'uploads/');  //저장 디렉토리
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },   
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024}, //최대 파일 크기: 5MB
}).array('files',10);

//API 엔드포인트
app.post('/articles/:articleId/files',(req,res) => {
    const { articleId }= req.params;

    if (!articleId){
        return res.status(400).json({
            isSuccess: false,
            code: '400',
            message: '아티클 ID가 유효하지 않습니다.',
        });
    }

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if(err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    isSuccess: false,
                    code: '413',
                    message: '파일 크기가 최대 한도를 초과했습니다.'
                });
            }
            return res.status(400).json({
                isSuccess: false,
                code: '400',
                message: `파일 업로드 오류: ${err.message}`,
            });
        }else if (err){
            return res.status(400).json({
                isSuccess: false,
                code: '400',
                message: `파일 업로드에 실패했습니다. (${err.message})`,
            });
        }

        //파일 업로드 성공
        const uploadedFiles = req.files.map((file,index) => ({
            fileId: index + 101,  //파일 아이디 예시임!
            fileName: file.originalname,
            fileUrl: `https://example.com/uploads/${file.filename}`,
        }));

        res.status(201).json({
            isSuccess: true,
            code: '201',
            timestamp: new Date().toISOString(),
            result: {
                articleId: parseInt(articleId, 10),
                uploadedFiles,
            },
        });
    });
});

app.listen(3000);


//아티클 이미지 및 파일 삭제하기, ID 13
app.delete('/articels/:articleId/files/:fileId', (req, res) => {
    const { articleId, fileId } = req.params;

    // 권한 확인
    const authorization = req.headers['authorization'];
    if (!authorization || !authorization.startsWith('Bearer ')){
        return res.status(403).json({
            isSuccess: false,
            code: '403',
            message: '파일 삭제 권한이 없습니다.'
        });
    }

    //아티클 ID, 파일 ID 유효한지 확인
    if(!articleId || !fileId){
        return res.status(400).json({
            isSuccess: false,
            code: '400',
            message: '유효하지 않은 요청입니다.'
        });
    }

    //파일 존재 여부 확인 (db 조회)
    const fileExists = true;
})

