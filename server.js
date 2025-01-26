const express = require('express')
const app = express()
var cors = require('cors')

app.use(cors())

app.use(express.json());



//테마별 아티클 조회, ID 1
app.get('/articles/theme/:theme', (req, res) => {

    const theme = req.params.theme
    const { page } = req.query

    if (!theme || !page || !["weekly", "organization", "technology"].includes(theme)) {
        return res.status(400).json({
            "isSuccess": false,
            "code": "400",
            "message": "테마별 아티클 조회를 실패했습니다.(오류코드: 400)"
        });
    }
    let response;

    if(theme == "weekly"){
        response = {
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
                        "subTitle": "string"
                    },
                    {
                        "articleId": 2,
                        "data": {
                            "userName": "string"
                        },
                        "title": "string",
                        "subTitle": "string"
                    },
                    {
                        "articleId": 3,
                        "data": {
                            "userName": "string"
                        },
                        "title": "string",
                        "subTitle": "string"
                    }
                ]
            }
        }
    }else if(theme == "organization"){
        response = {
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
                        "subTitle": "string"
                    },
                    {
                        "articleId": 2,
                        "data": {
                            "userName": "string"
                        },
                        "title": "string",
                        "subTitle": "string"
                    },
                    {
                        "articleId": 3,
                        "data": {
                            "userName": "string"
                        },
                        "title": "string",
                        "subTitle": "string"
                    }
                ]
            }
        }
    }else if(theme == "technology"){
        response = {
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
                        "subTitle": "string"
                    },
                    {
                        "articleId": 2,
                        "data": {
                            "userName": "string"
                        },
                        "title": "string",
                        "subTitle": "string"
                    },
                    {
                        "articleId": 3,
                        "data": {
                            "userName": "string"
                        },
                        "title": "string",
                        "subTitle": "string"
                    }
                ]
            }
        }
    }
    response.result.page = page;
    res.json(response);
}) //주소창 예시: http://localhost:3000/articles/theme/weekly/?page=3



//아티클 삭제하기, ID 11, 테스트 완료
app.delete('/articles/:articleId', (req, res) => {
    const articleId = req.params.articleId

    if (!articleId) {
        return res.status(400).json({
            "isSuccess": false,
            "code": "400",
            "message": "요청한 아티클 아이디가 유효하지 않습니다.(오류코드: 400)"
        });
    }

    const articleExists = false; //실제론 DB에서 가져올 값

    if(!articleExists){
        return res.status(404).json({
            isSuccess: false,
            code: "404",
            message: "아티클을 찾을 수 없습니다.(오류코드: 404)"
        });
    }

    //DB에서 아티클을 삭제한 후

    res.send({ "message": "Article with ID 1 deleted." });
}); //주소창 예시: http://localhost:3000/articles/30



//아티클 등록, ID 4, 테스트 완료
app.post('/articles', (req, res) => {
    const { theme, title, content, userName } = req.body;

    if (!theme || !title || !content || !userName) {
        return res.status(400).json({
            "isSuccess": false,
            "code": "400",
            "message": "아티클 등록에 실패했습니다.(오류코드: 400)"
        });
    }

    const response = {
        "isSuccess": true,
        "code": "200",
        "timestamp": "2024-11-14",
        "result": {
            "articleId": 1,
            "data": {
                "userName": "string",
            },
            "theme": "string",
            "title": "string",
            "content": "string",
            "uploadData": "2024-11-14"
        }
    }
    response.result.theme = theme;
    response.result.title = title;
    response.result.content = content;
    response.result.data.userName = userName;

    res.json(response);
})//주소창 예시: http://localhost:3000/articles



//예외처리, 테스트 완료
app.use((req, res) => {
    res.status(404).json({
        "isSuccess": false,
        "code": "404",
        "message": "요청하신 경로를 찾을 수 없습니다.(오류코드: 404)"
    });
});



app.listen(3000);