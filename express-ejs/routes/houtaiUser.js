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
let dbName = "HouTaiMiUsers";

// 如果用 get 方法进行一个请求 将数据写在地址栏就可以;
// 并将以下的 body 全部改为 query 获取参数;
router.post('/:type',dis,login);
router.post('/:type',(req,res,next)=>{
	// res.send(req.cookies);
	let secret = fs.readFileSync("./server.pem");
	let token = req.cookies["USER.ID"];
	// 若token 不存在;
	if(!token) return res.send({status : "error",statusCode : 0});

	// 退出登录时 清除cookie 并且返回状态值;
	if(req.params.type == "signOut"){
		res.clearCookie("USER.ID");
		return res.send({status : "error",statusCode : 0});
	}

	let payload = jwt.decode(token,secret);

	// token 过期;
	if(payload.exp <= Date.now()){
		res.clearCookie("USER.ID");
		return res.send({status : "error",statusCode : 0});
	}else{
		return res.send(Object.assign(payload,{status:"success",statusCode : 1}));
	}
});
// 分配需求;
function dis(req,res,next){
	if(req.params.type == "login") return next();
	// 注册逻辑;
	if(req.params.type != "register") return next("route");
	// res.send("欢迎注册");
	const body = req.body;
	let usr = body.username;
	let pwd = body.password;
	console.log(usr,pwd);
	// 1. 用户名重复查询;
	// 传值的时候 建立一个公用的对象;
	const params = {
		usr : usr,
		pwd : pwd,
		req : req,
		res : res
	}
	me.emit("searchUsers",params);
}

me.on("searchUsers",(e) => {
	mongoClient.connect(url,(err,client) => {
		if(err) return e.res.send(err+":"+"数据库错误");
		// 选中数据库;
		const db = client.db(dbName);
		// 选中 collection
		const collection = db.collection("user_collection");
		// 查询;
		collection.find({username : e.usr}).toArray((err,data) => {
			// 通过数组数量的判断来决定是否重名;
			if(data.length == 0){
				// 没有重复用户名;
				// 把用户名 密码放入到数据库之中;
				me.emit("insertUser",Object.assign(e,{collection:collection,client:client}));
			}else{
				// 用户名重名;
				client.close();
				return e.res.send("用户名重名");
			}
		})
	})
})

me.on("insertUser" , (e) => {
	// e.res.send("hello world");
	let pemKey = fs.readFileSync("./server.pem");
	let cryPwd = Encrypt(e.pwd , pemKey);

	e.collection.insert({
		username : e.usr,
		password : cryPwd,
		admin:true
	})
	// 关闭数据库连接;
	e.client.close();
	return e.res.json({
		type:"register",
		status : "success"
	})
})

// 登录逻辑;
function login(req,res,next){
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
		// 1 表示登录成功;
		res.send(Object.assign(user,{status : "success" , statusCode : 1}));
	},(err) => {
		if(err == 1){
			// res.send("用户不存在");
			res.send({status : "error",statusCode : 5})
		}else if(err == 2){
			// 4 表示用户名和密码不符;
			res.send({status : "error",statusCode : 4});
		}else{
			// 3 服务器内部错误;
			res.send({status : "error",statusCode : 3});
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
			const collection = db.collection("user_collection");
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
