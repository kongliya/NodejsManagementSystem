const gulp = require("gulp");
const connect = require("gulp-connect");
const proxy = require("http-proxy-middleware");

gulp.task("connect",() => {
	connect.server({
		port : "8000",
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
})