// gulp 的插件;
// 1. http插件; (服务器插件);
// gulp connect;
const gulp = require("gulp");
const connect = require("gulp-connect");
const proxy = require("http-proxy-middleware");

// 2. 合并插件;
// var concat = require("gulp-concat");

// 3. gulp 压缩插件;
// var uglify = require("gulp-uglify");

// 4. babel 插件;
var babel = require("gulp-babel");

// 5. css插件;
var cleanCss = require("gulp-clean-css");

// 6. sass 编译插件;
// var sass = require("gulp-sass-china");

gulp.task("html",()=>{
	return gulp.src("*.html").pipe(gulp.dest("dist/")).pipe(connect.reload());
})

gulp.task('connect',function(){
	connect.server({
		port:88,
		root:"dist/",
		livereload:true,
		// 中间件;
		middleware:function(){
			return [
				proxy("/api",{
					target:"http://localhost:3000",
					pathRewrite:{
						'^/api' : '/',  // 重写路径;
					}
				})
			]
		}
	})
});

// 如何发起一个代理请求;
// localhost:88/proxy/目标;

gulp.task("watch",()=>{
	gulp.watch("*.html",["html","sass"]);
	gulp.watch("css/*.css",["html","css"]);
	gulp.watch("js/*.js",["html","script"]);
	gulp.watch("sass/*.scss",["html","sass"]);
})

gulp.task("default",["watch","connect"]);

// script 转存指令;
gulp.task("script", ()=>{
    return gulp.src(["js/*.js","!js/libs/jquery-3.3.1.js"])
    .pipe(gulp.dest("dist/script"));
})

// css 转存指令;
gulp.task("css",()=>{
	return gulp.src(["css/*.css"])
	.pipe(cleanCss())
	.pipe(gulp.dest("dist/css"))
})

// sass 指令;
gulp.task("sass",()=>{
	return gulp.src(["sass/*.scss"])
	// sass 只要出错 connect就会终止;
	// 我们想要的只是报错 但是不退出连接;
	.pipe(sass().on("error",sass.logError))
	.pipe(gulp.dest("dist/css"))
})

// 编译 ? es6 => es5;
gulp.task("es6",()=>{
	return gulp.src("script/es2015/es6.js")
	.pipe(babel({
		presets:['@babel/env']
	}))
	.pipe(gulp.dest("dist/script"));
})
