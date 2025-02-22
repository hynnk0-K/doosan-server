const express = require("express");
const cors = require("cors");
const app = express();
const models = require('./models');
const router = express.Router();

// Express의 내장 미들웨어로 본문 데이터 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 8080;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const { where } = require("sequelize");
const posts = require("./models/post");
const privateKey = crypto.randomBytes(32).toString('hex');


app.use(express.json());
app.use(cors({
    origin: ['https://doosanbears-react.vercel.app','http://localhost:3000'],
    credentials: true
}))

models.sequelize.sync()
    .then(() => {
        console.log('Sequelize synced!');
    })
    .catch((err) => {
        console.error('Error syncing Sequelize:', err);
    });


//로그인 검증
router.get("/status", (req, res) => {
    if(req.session.user){
        req.json({isAuthenticated: true, user: req.session.user})
    }else{
        req.json({isAuthenticated: false})
    }
});

module.exports = router;

//회원가입
app.post('/users', async (req, res) => {
    const { user_id, pw, name, phone, email, birth, sex, marketingChecked } = req.body;

    // 필수 필드 체크
    if (!user_id || !pw || !name || !phone || !email || !marketingChecked) {
        console.log("Missing fields:", req.body);
        return res.status(400).send('모든 필드를 입력해주세요');
    }

    try {
        // 아이디 중복 확인 (비동기 처리)
        const existUser = await models.User.findOne({ where: { user_id } });
        if (existUser) {
            return res.status(400).send({ success: false, message: "이미 사용중인 아이디입니다." });
        }

        // 비밀번호 해싱 (이미 적혀 있는 대로 처리됨)
        const hashedPassword = await bcrypt.hash(pw, 10);

        // 새 사용자 생성
        const newUser = await models.User.create({
            user_id: user_id,
            pw: hashedPassword, // 해시된 비밀번호 저장
            name,
            phone,
            email,
            birth, 
            sex,
            marketingChecked
        });

        // 성공 응답
        res.send({ success: true, user: newUser });
    } catch (err) {
        console.error(err);
        res.status(400).send("회원가입 실패");
    }
});

//로그인
app.post('/users/login', (req, res) => {
    const { user_id, pw } = req.body;

    models.User.findOne({ where: { user_id } })
        .then(async (result) => {
            if (result) {
                const match = await bcrypt.compare(pw, result.pw);
                if(match){
                    const user = { id: result.user_id, username: result.user_id };
                    const accessToken = jwt.sign(user, privateKey, { expiresIn: '1h' });

                    res.send({
                        user: result.user_id,
                        accessToken: accessToken
    
                    });
                }else {
                    res.status(401).send({ message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                res.status(401).send({ message: '사용자를 찾을 수 없습니다.' });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('서버 오류');
        })
});

app.post('/auth', (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.send(false);
    }

    try {
        const decoded = jwt.verify(accessToken, privateKey);
        res.send({ result: decoded });
    } catch (err) {
        res.send({ result: "검증 실패", error: err });
    }
});

app.get("/auth/status", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.json({ isAuthenticated: false });
    }

    const token = authHeader.split(" ")[1]; // Bearer 토큰 추출

    try {
        const decoded = jwt.verify(token, privateKey);
        res.json({ isAuthenticated: true, user: decoded });
    } catch (err) {
        res.json({ isAuthenticated: false });
    }
});


// app.get("/auth/status", (req, res) => {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//         return res.json({ isAuthenticated: false });
//     }

//     try {
//         const decoded = jwt.verify(token, privateKey);
//         res.json({ isAuthenticated: true, user: decoded });
//     } catch (err) {
//         res.json({ isAuthenticated: false });
//     }
// });


app.get('/users/check-id', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).send({ success: false, message: '아아디를 입력해주세요.' })
    }
    //데이터베이스에서 아이디 검색
    models.User.findOne({
        where: { user_id },
    }).then((user) => {
        if (user) {
            res.send({ success: false, message: '이미 사용중인 아이디입니다.' })
        } else {
            res.send({ success: true, message: '사용 가능한 아아디입니다.' })
        }
    }).catch((err) => {
        console.error(err);
        res.send({ success: false, message: '서버 오류가 발생했습니다.' })
    })
})

//아이디 찾기
app.get('/users/find-id', async (req, res) => {
    const { name, email } = req.query;

    if(!name || !email ){
        return res.status(400).send({
            success: false,
            message: "이름과 이메일을 확인주세요."
        });
    }
    try{
        const user = await models.User.findOne({
            where: {name, email},
        });
        if (user) {
            res.send({
                success: true,
                message: "사용자 정보를 찾았습니다.",
                user_id: user.user_id,
            });
        } else {
            res.status(400).send({
                success: false,
                message: "일치하는 사용자 정보를 찾을 수 없습니다."
            });
        }
    }catch(err){
        console.error(err);
        res.status(500).send({
            success: false,
            message: "서버에 오류가 발생했습니다."
        });
    }
});

//게시글 생성
app.post('/posts', async (req, res) => {
    const {post_id, title, user, date, contents, img} = req.body;

    if(!user_id || !title || !contents){
        return res.status(400).send({success:false, message: "필수 항목을 입력해주세요."});
    }
    try{
        const newPost = await models.Post.create({title, user_id, date, contents, img});
        res.status(201).send({success:true, post: newPost});
    } catch(err) {
        console.error(err);
        res.status(500).send({success:false, message: "게시글 작성 실패"});
    }
});


//댓글 생성
app.post('/comments', (req, res) =>{
    const { post_id, content } = req.body;

    models.Comment.create({post_id, content})
    .then((result)=>{
        return res.status(201).json({message: '성공', comment: result});
        // return res.send( {result,} ) //뒤에 내용이 들어올 수 있을때는 "," 비워둠
    })
    .catch((err)=>{
        console.log(err);
        return res.status(500).json({message: '서버 오류 발생'});
    });
});

//댓글 전체 가져오기
app.get('/comments', (req, res) =>{
    models.Comment.findAll()
    .then((result)=>{
        console.log("Comments ===", result);
        res.send({
            comments: result
        })
    })
    .catch((err)=>{
        console.error(err);
        res.send("에러 발생")
    })
});

//댓글 수정
app.put('/comments/:id', (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if(!content){
        return res.status(400).send({success: false, message: "수정할 내용을 입력해주세요"});
    }

    models.Comment.update(
        { content }, 
        { where: { id } }
    )
    .then(([updated])=>{
        if(updated){
            res.status({success: true, message: "댓글이 수정되었습니다."})
        } else{
            res.status(404).send({success: false, message: "해당 댓글을 찾을 수 없습니다."})
        }
    })
    .catch((err)=>{
        console.error(err);
        res.status(500).send({success: false, message: "댓글 수정 중 오류 발생"})
    })
});

//댓글 삭제
app.delete('/comments/:id', (req, res) => {
    const {id} = req.params;

    models.Comment.destroy({
        where: {id},
    })
    .then((deleted) => {
        if(deleted){
            res.send({success: true, message: "댓글이 삭제되었습니다."})
        }else{
            res.send({success: true, message: "해당 댓글을 찾을 수 없습니다."})
        }
    })
    .catch((err)=>{
        console.error(err);
        res.status(500).send({success: false, message: "댓글 삭제 중 오류가 발생했습니다."})
    })
});

app.listen(port, () => {
    console.log('서버가 돌아가고 있습니다.')
    models.sequelize.sync()
        .then(() => {
            console.log('DB연결 성공')
        })
        .catch((err) => {
            console.error(err);
            console.log('DB연결 에러')
            process.exit();
        })
})