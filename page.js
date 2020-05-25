(function ($) {
    function Page(option) {
        this.wrap = option.wrap;
        this.nowPage = option.nowPage;
        this.dataNum = option.dataNum;
        this.pageSize = option.pageSize;
        this.pageNum = Math.ceil(this.dataNum / this.pageSize);
        this.pageCb = option.pageCb;
        if (this.nowPage > this.pageNum || this.nowPage < 1) {
            alert('页数错误!');
            return false;
        }
        this.createDom();
        this.bindEvent();
    }

    Page.prototype.createDom = function () {
        this.wrap.empty();
        $('<div>每页</div>').appendTo(this.wrap);
        $('<input class="size" type="number" value="' + this.pageSize + '"/>').appendTo(this.wrap);
        var oUl = $('<ul/>');
        $('<span class="pre-page">&lt;</span>').appendTo(oUl);
        if (this.nowPage - 2 > 1) {
            $('<li class="num">1</li>').appendTo(oUl);
        }
        if (this.nowPage - 2 > 2) {
            $('<li>...</li>').appendTo(oUl);
        }
        for (var i = this.nowPage - 2; i <= this.nowPage + 2; i++) {
            if (i == this.nowPage) {
                $('<li class="num page-active">' + i + '</li>').appendTo(oUl);
            } else if (i >= 1 && i <= this.pageNum) {
                $('<li class="num">' + i + '</li>').appendTo(oUl);
            }
        }
        if (this.nowPage + 2 <= this.pageNum - 2) {
            $('<li>...</li>').appendTo(oUl);
        }
        if (this.nowPage + 2 <= this.pageNum - 1) {
            $('<li class="num">' + this.pageNum + '</li>').appendTo(oUl);
        }
        $('<span class="next-page">&gt;</span>').appendTo(oUl);
        oUl.appendTo(this.wrap);
    }

    Page.prototype.bindEvent = function () {
        var self = this;
        $('.pre-page', this.wrap).on('click', function () {
            if (self.nowPage == 1) {
                alert('前面没有啦>_<');
            } else {
                self.changePage(self.nowPage - 1);
            }
        })
        $('.next-page', this.wrap).on('click', function () {
            if (self.nowPage == self.pageNum) {
                alert('后面没有啦>_<');
            } else {
                self.changePage(self.nowPage + 1);
            }
        })
        $('.num', this.wrap).on('click', function () {
            self.changePage(parseInt($(this).text()));
        })
        $('.size', this.wrap).change(function () {
            var val = parseInt($(this).val())
            self.pageSize = val;
            self.pageNum = Math.ceil(self.dataNum / self.pageSize);
            self.changePage(self.nowPage);
        })
    }

    Page.prototype.changePage = function (page) {
        this.nowPage = page;
        this.createDom();
        this.bindEvent();
        this.pageCb && this.pageCb(this.nowPage, this.pageSize);
    }

    $.fn.extend({
        page: function (option) {
            option.wrap = this;
            new Page(option);
            return this;
        }
    })
}(jQuery))