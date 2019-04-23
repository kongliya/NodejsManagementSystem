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

let url = "mongodb://localhost:27017";
let dbName = "miUsers";

// 加密; (加密的明文, 秘钥);
let Encrypt = (data, key) => {
	const cipher = crypto.createCipher('aes192', key);
	var crypted = cipher.update(data, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

router.post('/:type',register);
router.post('/:type',register1);

// 注册逻辑;
function register(req,res,next){
	if(req.params.type == "register1") return next();
  if(req.params.type == "register"){
    const body = req.body;
    let usr = body.username;
    let pwd = body.password;
    const params = {
      usr : usr,
      pwd : pwd,
      req : req,
      res : res
    }
    me.emit("searchUsers",params);
  }
}
me.on("searchUsers",(e) => {
  mongoClient.connect(url,(err,client) => {
    if(err) return e.res.send(err + "数据库错误");
    const db = client.db(dbName);
    const collection = db.collection("userLists");
    collection.find({"username" : e.usr}).toArray((err,data) => {
      if(data.length == 0){
        e.res.cookie("phone",e.usr);
        client.close();
        // 必须return 出去;
        return e.res.send("没有重复用户名");
      }else{
        e.res.send("用户名已注册 前往登录");
        client.close();
      }
    })
  })
})
// 注册2;
function register1(req,res,next){
  if(req.params.type == "register1"){
    const body = req.body;
    let usr = body.username;
    let pwd = body.password;
    const params = {
      usr : usr,
      pwd : pwd,
      req : req,
      res : res
    }
    me.emit("insertUser",params);
  }
}
me.on("insertUser" , (e) => {
  mongoClient.connect(url,(err,client) => {
    if(err) return e.res.send(err + "数据库错误");
    const db = client.db(dbName);
    const collection = db.collection("userLists");

    let pemKey = fs.readFileSync("./server.pem");
    let cryPwd = Encrypt(e.pwd , pemKey);
    collection.insertOne({
      username : e.usr,
      password : cryPwd,
      admin:true
    })
    // 关闭数据库连接;
    client.close();
  })
  e.res.send("注册成功");
})

module.exports = router;
