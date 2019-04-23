var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 自定义路由;
var indexRouter = require('./routes/index');
// 注册路由;
var usersRouter = require('./routes/users');
// 后台路由;
var houtaiRouter = require('./routes/houtaiUser');
// 小米路由;
var miRouter = require('./routes/mi');
// 登录路由;
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
// 引擎模板目标文件夹;
// path.join 以路径的方式进行两端字符串的拼接;

// 给整个 views文件夹做简写; views === C:// ...../views 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 使用外部中间件;
// 打印日志的中间件;
app.use(logger('dev'));
// 对请求数据的解析;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 静态资源配置; 我们是把所有的静态资源全部放在了public 里边;
// script src路径的起点就在public 中;
app.use(express.static(path.join(__dirname, 'public')));

// 路由封装;
app.use('/', indexRouter);
// 我们的登录注册功能用usersRouter即可;
app.use('/users', usersRouter);
app.use('/mi',miRouter);
app.use('/login', loginRouter);
app.use('/houtaiUser', houtaiRouter);
// 错误处理;
// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
