function Tab(){}
$.extend(Tab.prototype,{
    // 按钮选择器;
    // 内容详情选择器;
    init(btn_selector,item_selector){
        this.aBtn = $(btn_selector);
        this.aItem = $(item_selector);
        // console.log(this.aBtn,this.aItem);
        // 调用核心方法;
        this.handleEvent();
    },
    handleEvent(){
        $.each(this.aBtn,function(index,item){
            $(item).on("mousemove",index,function(){
                console.log(1)
                this.aBtn[index].mouseover = ($.proxy(this.changeIndex,this));
            })
        })
    },
    changeIndex(event){
        var target = event.target;
        this.index = target.index();
        this.show();
    },
    show(){
        $.each(this.aItem,function(index){
            this.aItem[index].show()
            .siblings(this.aItem).hide();
        })
    }
}); 