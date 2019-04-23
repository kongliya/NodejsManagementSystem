var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // 因为 设置了 views 资源位置 , 同时也设置了 引擎模板;
  // 找到 views之中的 index.ejs模板 ,  并将参数 {title : "Express"} 传入模板之中;
  res.render('index', { title: 'kongli' , data : [1,2,3,4,5,6,7,8,9,0] });
});


router.get('/login',function(req,res,next){
  res.render('login');
});


router.get("/register",function(req,res,next){
  res.render('register');
});

module.exports = router;
