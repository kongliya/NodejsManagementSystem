const express = require('express');
const router = express.Router();
const mongoClient = require("mongodb").MongoClient;
// 针对 mongodb之中的 Object(_id);
const ObjectId = require("mongodb").ObjectID;

router.get("/goods/:type",(req,res) => {
	// 获取数据库之中的内容;
	let start = req.query.start ? req.query.start : 0;
	let count = req.query.count;
	if(req.params.type == "data"){
		getDatas(start,count)
		.then((arr) => {
			res.send({
				count : arr.length,
				start : start,
				subjects : arr
			});
		},(err) => {
			res.send(err,"错误");
		})
	}else if(req.params.type == "page"){
		getDatas(start,count)
		.then((arr) => {
			res.render("mi",{list : arr});
		},(err) => {
			res.send(err,"错误");
		})
	}else{
		res.send("参数错误");
	}
})

let dbname = "mi";
let url = "mongodb://localhost:27017";
function getDatas(start,count){
	start = Number(start);
	count = Number(count);
	
	return new Promise((resolve,reject) => {
		mongoClient.connect(url,(err,client) => {
			if(err) return reject(err);
			// 连接数据库;
			let db = client.db(dbname);
			let collection = db.collection("goodLists");
			collection.find({},{_id:0}).skip(start).limit(count).toArray((err,data) => {
				if(err) return reject(err);
				// 成功了;
				resolve(data);
			})
			client.close();
		})
	})
}

// 数据库的修改路由;
router.get("/changeData",(req,res) => {
	// res.send("hello kongli");
	let sPrice = req.query.price;
	let sName = req.query.name;
	let sId = req.query.id;
	// 前边加 ! 表示强制转为布尔值;
	if(!(sPrice && sName && sId)) return res.json({status : "error" , statusCode : 2})
	searchData({
		price : sPrice,
		name : sName,
		id : sId
	})
	.then((obj) => {
		console.log("成功",obj.result);
		res.send({status : "success",statusCode : 1});
	})
})

// 更新数据库中的数据操作;
function searchData(options){
	return new Promise((resolve,reject) => {
		mongoClient.connect(url,(err,client) => {
			if(err) return reject(3);
			const db = client.db(dbname);
			const collection = db.collection("goodLists");
			// 更新数据库当中的数据;
			// 通过id 找到数据 用 $set 更新里面的每一项;
			collection.update({"_id":ObjectId(options.id)},{
				$set:{
					goods_name : options.name,
					goods_price : options.price
				}
				},{},(err,result)=>{
					if(err) return reject(3.1);
					resolve(result)
					client.close();
			});
		})
	})
}
// 数据库的删除路由;
router.get("/deleteData",(req,res) => {
	let sId = req.query.id;
	deleteData({
		id : sId
	})
	.then((obj) => {
		res.send({status : "success"});
	},(status) => {
		res.send({status : "error"});
	})
})
// 删除数据库中的数据;
function deleteData(options){
	return new Promise((resolve,reject) => {
		mongoClient.connect(url,(err,client) => {
			if(err) return reject(3);
			const db = client.db(dbname);
			const collection = db.collection("goodLists");
			// 更新数据库当中的数据;
			// 通过id 找到数据 用 $set 更新里面的每一项;
			collection.deleteOne({"_id":ObjectId(options.id)},(err,result)=>{
				if(err) return reject(3.1);
				resolve(result);
			});
			client.close();
		})
	})
}

// 数据库的添加路由;
router.get("/addData",(req,res) => {
	// res.send("hello kongli");
	let sGoodId = req.query.goodId;
	let sName = req.query.name;
	let sPrice = req.query.price;
	let sSke = req.query.ske;
	let sDesc = req.query.desc;
	// 前边加 ! 表示强制转为布尔值;
	if(!(sGoodId && sName && sPrice && sSke && sDesc)) return res.json({status : "error" , statusCode : 2})
	addData({
		goodId : sGoodId,
		name : sName,
		price : sPrice,
		ske : sSke,
		desc : sDesc,
	})
	.then((obj) => {
		console.log("成功",obj.result);
		res.send({status : "success",statusCode : 1});
	},(err)=>{
		console.log(err);
	})
})

// 添加数据库中的数据;
function addData(options){
	return new Promise((resolve,reject) => {
		mongoClient.connect(url,(err,client) => {
			if(err) return reject(3);
			const db = client.db(dbname);
			const collection = db.collection("goodLists");
			collection.find({title:options.name}).toArray((err,data) => {
				if(data.length == 0){
					collection.insertOne({
						goods_id : options.goodId,
						goods_name : options.name,
						goods_price : options.price,
						seckill_Price : options.ske,
						desc : options.desc
					},(err,result)=>{
						if(err) return reject(3.1);
						resolve(result);
						// 注意不能在外边先关闭数据库 因为 find 操作后 再进行 insert ;
						// 等find 回来以后 数据库已经关闭是无法再去插入数据的;
						client.close();
					});
				}
			})
		})
	})
}
module.exports = router;