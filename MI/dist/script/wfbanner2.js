function WFBanner2(){}
$.extend(WFBanner2.prototype,{
    init : function(options){
        // 所有的图片;
        this.item_list = $(options.item_list);
        this.left_btn = $(options.left_btn);
        this.right_btn = $(options.right_btn);
        this.btn_list = $(options.btn_list);
        this.ul = $(options.ul);
        // 核心下标;
        this.nowIndex = 0;
        this.item_num = this.item_list.length - 1;
        this.item_width = this.item_list.width();
        this.bindEvent();
    },
    bindEvent(){
        this.left_btn.click($.proxy(this.prev,this));
        this.right_btn.click($.proxy(this.next,this));
        this.btn_list.mouseenter($.proxy(this.toIndex,this));
    },
    next(){
        if(this.nowIndex == this.item_num){
            this.nowIndex = 1;
            this.ul.css({
                left : 0
            })
        }else{
            this.nowIndex ++;
        }
        this.animate();
    },
    prev(){
        if(this.nowIndex == 0){
            this.nowIndex = this.item_num - 1;
            this.ul.css({
                left : - this.item_num * this.item_width
            })
            console.log(left)
        }else{
            this.nowIndex --;
        }
        this.animate();
    },
    toIndex(event){
        var target = event.target;
        this.nowIndex = $(target).index();
        this.animate();
    }
})