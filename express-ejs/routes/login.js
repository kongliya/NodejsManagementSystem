const express = require('express');
const router = express.Router();
const mongoClient = require("mongodb").MongoClient;
const event = require("events");
const fs = require("fs");

// 引入 token jwt json web token;
const jwt = require("jwt-simple");

// nodejs 加密模块;
const crypto = require('crypto');

// 继承event模块 然后 写我们自己的东西;
class MyEvent extends event{};
const me = new MyEvent();

// 加密; (加密的明文, 秘钥);
let Encrypt = (data, key) => {
	const cipher = crypto.createCipher('aes192', key);
	var crypted = cipher.update(data, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

let url = "mongodb://localhost:27017";
let dbName = "miUsers";

router.post('/:type',login);
router.post('/:type',(req,res,next)=>{
	// res.send(req.cookies);
	let secret = fs.readFileSync("./server.pem");
	let token = req.cookies["USER.ID"];
	// 若token 不存在;
	if(!token) return res.send({status : "error",statuCode : 0});

	// 退出登录时 清除cookie 并且返回状态值;
	if(req.params.type == "signOut"){
		res.clearCookie("USER.ID");
		res.send({status : "error",statuCode : 0});
	}

	let payload = jwt.decode(token,secret);

	// token 过期;
	if(payload.exp <= Date.now()){
		res.clearCookie("USER.ID");
		res.send({status : "error",statuCode : 0});
	}else{
		res.send(Object.assign(payload,{status:"success",statuCode : 1}));
	}
});

// 登录逻辑;
function login(req,res,next){
    if(req.params.type != "login") return next("route");

    const body = req.body;
    let usr = body.username;
    let pwd = body.password;
    let validePromise = valideUsr(usr,pwd)  // promise;
    
    validePromise.then((user) => {
        // res.send(user);
        // 登录成功;
        // 加密并设置 token;
        let secret = fs.readFileSync("./server.pem");
        let payload = {
            username : user.username,
            admin : user.admin,
            // 设置过期时间; 7h
            exp : Date.now() + 1000 * 60 * 60 * 7
        }
        let token = jwt.encode(payload,secret);
        res.cookie("USER.ID",token);
        // 注意 状态码;
        return res.send(Object.assign(user,{status : "success" , statuCode : 1}));
    },(err) => {
        if(err == 1){
            // res.send("用户不存在");
			res.send({status : "error",statuCode : 5})
			console.log("用户不存在")
        }else if(err == 2){
            res.send({status : "error",statuCode : 4});
        }else{
            res.send({status : "error",statuCode : 3});
        }
    })
}


function valideUsr(usr,pwd){
	// 加密密码;
	let pemKey = fs.readFileSync("./server.pem");
	var cryPwd = Encrypt(pwd,pemKey);

	return new Promise((resolve,reject) => {
		// 连接数据库;
		mongoClient.connect(url,(err,client) => {
			if(err) return reject("连接数据库错误" + err);
			// 连接数据库;
			const db = client.db(dbName);
			const collection = db.collection("userLists");
			// 查询用户名;
			collection.find({username : usr}).toArray((err,data) => {
				if(err) return reject("数据解析错误" + err);
				if(data.length ==0 ) return reject(1);

				let valide = false;
				// 比对密码;
				data.forEach((user,index) => {
					if(user.password == cryPwd){
						valide = true;
						resolve(user);
					}
				})
				if(!valide){
					reject(2);
				}
			})
		})
	})
}


module.exports = router;
