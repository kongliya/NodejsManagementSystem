$(function(){
	token();
	var pop = new Pop();
	pop.init();

	var addPop = new AddPop();
	addPop.init();
	BtnReq();
})

// ******token及渲染页面******
function token(){
var options = {
	url : "http://localhost:8000/api/houtaiUser/token",
	type : "POST"
}
$.ajax(options)
	.then((res) => {
		if(res.status == "success"){
			$(".username").html(res.username);
			renderPage()
		}else{
			$(".username").html('<a href="pages/examples/login.html">请登录</a>');
		}
	})
}
// 退出登录请求;
var outOptions = {
	url : "http://localhost:8000/api/houtaiUser/signOut",
	type : "POST"
}
$("#out").on("click",function(){
	$.ajax(outOptions)
	.then((res) => {
		console.log(res);
		$(".username").html('<a href="pages/examples/login.html">请登录</a>');
		location.href = "pages/examples/login.html";
	})
})
// 渲染第一页的页面和按钮的数量;
function renderPage(){
    var optionsBtn = {
        url : "http://localhost:8000/api/mi/goods/data"
    }
    $.ajax(optionsBtn).then(function(res){
		console.log(res,"数据库之中的全部数据");
        var count = res.count;
        var page = Math.ceil(count / 6);

        // 总页数;
        var button_html = "";
        for(var i = 0;i < page ; i ++){
            button_html += `<li class="paginate_button">
                                <a href="javascript:void(0);" aria-controls="example2" data-id="${i}" tabindex="${i}">${i + 1}</a>
                            </li>`;
        }
        $(".pagination").html(button_html);

        var json = res.subjects;
        var html = "";
        for(var i = 0; i <= 5; i++){
            html += `   <tr role="row" style="text-align:center" class="odd" data-id=${json[i]._id}>
                            <td style="line-height:70px;" class="sorting_1">${json[i].goods_id}</td>
                            <td style="line-height:70px;">${json[i].goods_name}</td>
                            <td style="line-height:70px;">${json[i].seckill_Price}</td>
                            <td style="line-height:70px;">${json[i].goods_price}</td>
                            <td style="line-height:70px;">${json[i].desc}</td>
                            <td style="line-height:70px;">
                                <a style="min-width:60px" class="btn btn-app edit">
                                    <i class="fa fa-edit"></i> 修改
                                </a>
                            </td>
                            <td>
                                <a style="min-width:60px" class="btn btn-app delete">
                                    <i class="fa fa-repeat"></i> 删除
                                </a>
                            </td>
                        </tr>`
        }
        $("#list").html(html);
    })
}

// 点击按钮之后 发送请求重新请求数据并渲染页面;
function BtnReq(){
    var now_page = 0;

    var has_button = false;
    if(has_button) return 0;
    has_button = true;

    $(".pagination").on("click",".paginate_button",btn);

    function btn(event){
        var target = event.target;
        var button = Array.from($(".paginate_button a"));
        if(button.length == 0) return 0;
        if(button.indexOf(target) == -1) return 0;
        now_page = $(target).attr("data-id");
        console.log(now_page);

        $(".paginate_button").eq(now_page).addClass("active")
        .siblings("li").removeClass("active");

        var options = {
            url : "http://localhost:8000/api/mi/goods/data?start="+now_page * 6+"&count=6"
        }
        $.ajax(options).then(function(res){
            console.log(res)
            var json = res.subjects;
            var html = "";
            for(var i = 0; i <= json.length - 1; i++){
                console.log(json)
                html += `   <tr role="row" style="text-align:center" class="odd" data-id=${json[i]._id}>
                                <td style="line-height:70px;" class="sorting_1">${json[i].goods_id}</td>
                                <td style="line-height:70px;">${json[i].goods_name}</td>
                                <td style="line-height:70px;">${json[i].seckill_Price}</td>
                                <td style="line-height:70px;">${json[i].goods_price}</td>
                                <td style="line-height:70px;">${json[i].desc}</td>
                                <td style="line-height:70px;">
                                    <a style="min-width:60px" class="btn btn-app edit">
                                        <i class="fa fa-edit"></i> 修改
                                    </a>
                                </td>
                                <td>
                                    <a style="min-width:60px" class="btn btn-app delete">
                                        <i class="fa fa-repeat"></i> 删除
                                    </a>
                                </td>
                            </tr>`
            }
            $("#list").html(html);
        })
    }
}

// ******弹出框******
function Pop(){}
$.extend(Pop.prototype,{
	init(){
		// 选择元素;
		// 事件父级元素;
		this.$list = $("#list");
		// 弹出层元素;
		this.$pop = $(".modal2");
		this.$close = $(".close_");
		// 保存按钮;
		this.$save = $(".save");
		this.$frame = $(".pop_frame");
		// 修改详情部分;
		this.$changeId = $("#id2");
		this.$changeName = $("#name2");
		this.$changePrice = $("#price2");
		this.$changeSke = $("#ske2");
		this.$changeDesc = $("#desc2");

		this.bindEvent();
	},
	bindEvent(){
		this.$list.on("click",".edit",this.showPop.bind(this));
		this.$list.on("click",".delete",this.deleteReq.bind(this));
		this.$close.on("click",this.hidePop.bind(this));
		this.$save.on("click",this.sendReq.bind(this));
	},
	showPop(event){
		this.$pop.show();
		var target = event.target;
		// 判断事件源是否是a 如果是 a 则 就是目标源元素 若不为a 则目标源指向父级;
		target = target.nodeName == "A" ? target : target.parentNode;
		var tr = $(target).parent().parent();
		var sGoodId = tr.children().eq(0).html();
		var sName = tr.children().eq(1).html();
		var sPrice = tr.children().eq(3).html();
		var sSke = tr.children().eq(2).html();
		var sDesc = tr.children().eq(4).html();
		this.$changeId.val(sGoodId);
		this.$changeName.val(sName);
		this.$changePrice.val(sPrice);
		this.$changeSke.val(sSke);
		this.$changeDesc.val(sDesc);

		this.$save.attr("data-id",tr.attr("data-id"));
	},
	hidePop(){
		this.$pop.hide();
	},
	sendReq(){
		$(".alert").show();
		var options = {
			url : "http://localhost:8000/api/mi/changeData",
			data : {
				name : this.$changeName.val(),
				price : this.$changePrice.val(),
				id : this.$save.attr("data-id")
			},
			context : this
		}
		$.ajax(options)
		.then(function(res){
			console.log(res);
			renderPage();
			$(".alert").hide();
		},(err)=>{
			console.log(err);
		})
		this.hidePop();

	},
	deleteReq(event){
		// 同样获取当前操作的target;
		var target = event.target;
		target = target.nodeName == "A" ? target : target.parentNode;
		var tr = $(target).parent().parent();
		// 移除 tr;
		tr.remove();
		var options = {
			url : "http://localhost:8000/api/mi/deleteData",
			data : {
				// id 为 tr 当前携带的 data-id;
				id : tr.attr("data-id")
			},
			context : this
		}
		$.ajax(options)
		.then(function(res){
			console.log(res);
		},(err)=>{
			console.log(err);
		})
	}
})

// ******添加按钮的弹出框******
function AddPop(){}
$.extend(AddPop.prototype,{
	init(){
		this.$add = $("#add");
		this.$addList = $(".addModal");
		this.$close = $(".close_");
		this.$confirmAdd = $("#confirmAdd");
		this.bindEvent();
	},
	bindEvent(){
		this.$add.on("click",this.showAddPop.bind(this));
		this.$confirmAdd.on("click",this.addList.bind(this));
		this.$close.on("click",this.hideAddPop.bind(this));
	},
	showAddPop(){
		this.$addList.show();
	},
	hideAddPop(){
		this.$addList.hide();
	},
	addList(){
		var options = {
			url : "http://localhost:8000/api/mi/addData",
			// type : "POST",
			data : {
				goodId : $("#goodId").val(),
				name : $("#goodName").val(),
				price : $("#goodPrice").val(),
				ske : $("#goodSke").val(),
				desc : $("#goodDesc").val(),
			},
			context : this
		}
		$.ajax(options)
		.then(function(res){
			console.log(res);
			renderPage();
		},(err) => {
			console.log(err);
		})
		this.hideAddPop();
	}
})