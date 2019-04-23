// ***********瀑布流;************
function WaterFall(){}
$.extend(WaterFall.prototype,{
    init(){
        this.ul = $(".waterfall .lists2");
        this.page = 0;
        this.loaded = false;

        this.bindEvent();
        this.loadMsg()
        .then((res)=>{
            // console.log(res);
            res = typeof res == "string" ? JSON.parse(res) : res;
            this.renderPag(res);
        })
    },
    bindEvent(){
        onscroll = this.iflLoad.bind(this);
    },
    loadMsg(){
        return new Promise((succ)=>{
            var xhr = new XMLHttpRequest();
            var path = "http://localhost:88/api/mi/goods/data?start="+this.page * 10 + "&count=10";
            xhr.open("GET",path);
            xhr.send(null);
            xhr.onload = function(){
                succ(xhr.response);
            }
            this.page++;
        })
    },
    renderPag(json){
        var list = json.subjects;
        var html = "";
        for(var i = 0 ; i < list.length ; i ++){
            html += `
                    <li class="con">
                        <img class="large-img" src="${list[i].img}" alt="">
                        <p class="list-title">${list[i].goods_name}</p>
                        <p class="goods-price">${list[i].goods_price} 元</p>
                    </li>
                    `
        }
        this.ul.html(html);
        this.loaded = true;
    },
    iflLoad(){
        if(this.loaded == false){
            return 0;
        }
        var scrollTop = $("html,body").scrollTop();
        var showHeight = document.documentElement.clientHeight + scrollTop;
        var aLi = $(".lists2 li");
        var lastLi = aLi[aLi.length - 1];
        if(lastLi.offsetTop <= showHeight + 800){
            this.loadMsg()
            .then((res)=>{
                res = typeof res == "string" ? JSON.parse(res) : res;
                this.renderPag(res);
            })
            this.loaded = false;
        }
    }
})
function getName(arr){
    var res = "";
    for(var i = 0 ; i < arr.length ; i ++){
        res += "  " + arr[i].name;
    }
    return res;
}

// var waterfall = new WaterFall();
// waterfall.init();

// *********购物车及商品列表;************
function ShopCar(){}
$.extend(ShopCar.prototype,{
	init(){
		this.main = $(".lists");
		this.loadJson()
		.then(function(res){
			this.json = res.subjects;
			this.renderPage();
			// console.log(res.data.list);
		})
		this.bindEvent();
		this.listSum();
	},
	loadJson(){
		var opt = {
			url : "http://localhost:88/api/mi/goods/data",
			type : "GET",
			context : this
		}
		return $.ajax(opt);
	},
	renderPage(){
		console.log(this.json);
		var html = "";
		for(var i = 0; i < this.json.length; i ++){
			html += `<li data-id="${this.json[i].goods_id}" class="con">
						<div class="page">
							<img class="large-img" src="${this.json[i].img}" alt="">
							<p class="list-title">${this.json[i].goods_name}</p>
							<p class="goods-price">${this.json[i].goods_price} 元</p>
						</div>
						<button class="addCart" data-id="${this.json[i].goods_id}">添加到购物车</button>
					</li>`;
					// console.log(this.main)
		}
		this.main.html(html);
	},
	bindEvent(){
		$(".lists").on("click",".addCart",this.addCar.bind(this));
		$(".topbar-cart").on("mouseenter",this.showList.bind(this));
		$(".topbar-cart").on("mouseleave",function(){
			$(".topbar-cart").find(".cart-menu").hide();
		});
		
	},
	addCar(event){
		// 怎么知道将谁加入的购物车 => 通过 goods-id;
		var target = event.target;
		var goodsId = $(target).attr("data-id");
		var cookie;
		if(cookie = $.cookie("shopCar")){
			// 将字符串转换为数组 方便插入操作;
			var cookieArray = JSON.parse(cookie);

			// 判断当前要添加的商品 是否已经存在于购物车之中;
			// 表示是否存在当前商品;
			var hasGoods = false;
			for(var i = 0 ; i < cookieArray.length; i ++){
				if(cookieArray[i].id == goodsId){
					// 表示存在商品;
					hasGoods = true;
					cookieArray[i].num ++;
					break;
				}
			} 

			// 如果没有商品;
			if(hasGoods == false){
				var goods = {
					id : goodsId,
					num : "1"
				}
				cookieArray.push(goods);
			}

			// 将数组 转为字符串 方便储存 cookie;

			// console.log(JSON.stringify(cookieArray));
			$.cookie("shopCar",JSON.stringify(cookieArray));
		}else{
			$.cookie("shopCar",`[{"id":"${goodsId}","num":"1"}]`);
		}
		// console.log($.cookie("shopCar"));
		this.listSum();
	},
	showList(){
		// 判定是否存在购物车，如果不存在购物车就没必要拼接列表了;
		$(".cart-menu").show();
		var cookie;
		if(!(cookie = $.cookie("shopCar"))) return 0;
		var cookieArray = JSON.parse(cookie);
		var html = "";
		// for 购物车里有多少个就拼接多少个;
		for(var i = 0 ; i < cookieArray.length; i++){
			// console.log(cookieArray[i]);
			// for 判断哪一个商品是购物车里的商品;
			for(var j = 0 ; j < this.json.length; j ++){
				if(cookieArray[i].id == this.json[j].goods_id){
					html +=`<li data-id=${cookieArray[i].id} class="carts">
								<img style="width:80px; height:80px;float:left;" src="${this.json[j].img}" alt="">
								<div class="cart-txt">
									<p class="txt">
										<i class="title">${this.json[j].goods_name}</i>
										<em class="goodNo"> X ${cookieArray[i].num}</em>
										<i class="cart-price">${Math.round(this.json[j].goods_price * cookieArray[i].num)} 元</i>
										<a href="javascript:void(0);" onclick="remove(${i})">删除</a>
									</p>
								</div>
							</li>
							`;
					break;
				}
			}
		}
		$(".cart-lists").html(html);
	},
	listSum(){
		var cookie;
		if(!(cookie = $.cookie("shopCar"))){
			$(".topbar-cart").find(".cart-num").html(0);
			return 0;
		};
		var cookieArray = JSON.parse(cookie);
		var sum = 0;
		for(var i = 0 ; i < cookieArray.length; i ++){
			sum += Number(cookieArray[i].num);
		}
		$(".topbar-cart").find(".cart-num").html(`(`+sum+`)`);
	}
	
})

var shopCar = new ShopCar();
shopCar.init();

// ***********页面跳转**********
$(".waterfall .lists").on("click.kl", ".con", function(event) {

	var target = event.target;
	var listt = $(target).parents(".con")[0];
	var list = $(target).parents(".con").find("button");
	var aLi = Array.from($(".lists .con"));
	console.log($(target)[0],list[0]);
	if($(target)[0] != list[0]){
		if (aLi.indexOf(listt) != -1) {
			$.cookie("goodsId", listt.getAttribute("data-id"));
			location.href = "goodDetail.html";
		}else{
			return 0;
		}
	}
})

// ***********购物车删除**********
function remove(i){
	var cookie;
	if(!(cookie = $.cookie("shopCar"))){
		return 0;
	}
	var cookieArray = JSON.parse(cookie);
	cookieArray.splice(i,1);
	$.cookie("shopCar",JSON.stringify(cookieArray));
	shopCar.showList();
	shopCar.listSum();
}