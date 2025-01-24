const express = require('express') 
const app = express() 
var cors = require('cors')

app.use(cors())

app.get('/articles/theme/:theme', (req, res) => {

    const theme = req.params
    const { page } = req.query

    if (!theme || !page) {
        return res.status(400).json({
            "isSuccess": false,
            "code": "400",
            "message": "테마별 아티클 조회를 실패했습니다.(오류코드: 400)"
        });
    }

    const response = {
        "isSuccess": true,
        "code": "200",
        "timestamp": "2024-11-23",
        "result": {
            "page": 1,
            "totalPages": 6,
            "hasNext": true,
            "article list": [
                {
                    "articleId": 1,
                    "data": {
                        "userName": "string"
                    },
                    "title": "string",
                    "contentPreview": "string"
                },
                {
                    "articleId": 2,
                    "data": {
                        "userName": "string"
                    },
                    "title": "string",
                    "contentPreview": "string"
                },
                {
                    "articleId": 3,
                    "data": {
                        "userName": "string"
                    },
                    "title": "string",
                    "contentPreview": "string"
                }
            ]
        }
    }
    res.json({ 'answer': response })


    console.log("답변 출력됨")
}) //주소창 예시: http://localhost:3000/articles/theme/weekly/?page=3

app.delete('/articles/:articleId', (req, res) => {
    const articleId = req.params
    if (!articleId) {
        return res.status(400).json({
            "isSuccess": false,
            "code": "400",
            "message": "요청한 아티클 아이디가 유효하지 않습니다.(오류코드: 400)"
        });
    }
    res.send({ "message": "Article with ID 1 deleted." });
}); //주소창 예시: http://localhost:3000/articles/30
//delete라 주소창에 예시 입력하면 경로를 찾을 수 없다는 메시지 뜸.
//get으로 바꾸면 "Article with ID 1 deleted." 메시지 뜸.

app.use((req, res) => { //use 메서드: 미들웨어를 추가할 때 사용하는 메서드
    //미들웨어: 요청과 응답 사이에 동작하는 함수
    res.status(404).json({
        "isSuccess": false,
        "code": "404",
        "message": "요청하신 경로를 찾을 수 없습니다.(오류코드: 404)"
    });
});

app.listen(3000)