//初始化数据
var allStudentsData = [];
var dataNum = 0;
var size = 19;
var page = 1;

//初始化函数
function init() {
    bindEvent();
    $('.menu-list dd').eq(0).trigger('click');
}
init();

//事件绑定函数
function bindEvent() {
    $('.menu-list dd').on('click', function () {
        $('.menu-list dd').removeClass('menu-active');
        $(this).addClass('menu-active');
        $('.right-content .student-data').fadeOut();
        $('.' + $(this).data('id')).fadeIn();
        if($(this).data('id') == 'student-list-content'){
            getTableData(page, size);
        }
    })
    $('.add-submit').on('click', function (e) {
        e.preventDefault();
        var formData = $('.add-student').serializeArray();
        getData('/api/student/addStudent', transformData(formData), function (res) {
            if(confirm('添加成功 是否跳转至首页?')){
                $('.menu-list dd').eq(0).trigger('click');
            }else {
                $('.add-student')[0].reset();
            }
        });
    })
    $('tbody').on('click', '.edit-btn', function () {
        editStudentData($(this).data('index'));
        $('.edit-student-content').slideDown();
    })
    $('.mask').on('click', function () {
        $('.edit-student-content').slideUp();
    })
    $('.edit-submit').on('click', function (e) {
        e.preventDefault();
        var formData = $('.edit-student').serializeArray();
        getData('/api/student/updateStudent', transformData(formData), function (res) {
            if(confirm('修改成功 是否跳转至首页?')){
                $('.edit-student-content').slideUp();
                $('.menu-list dd').eq(0).trigger('click');
            }
        });
    })
    $('tbody').on('click', '.del-btn', function () {
        var self = this;
        if(confirm('确认删除?')){
            getData('/api/student/delBySno', {
                sNo: allStudentsData[$(self).data('index')].sNo
            }, function () {
                $('.menu-list dd').eq(0).trigger('click');
            })
        }
    })
    $('.searchStudent button').on('click', function () {
        var val = $('.search').val();
        if(val){
            getData('/api/student/searchStudent', {
                sex: -1,
                search: val,
                page: page,
                size: size
            }, function (res) {
                allStudentsData = res.data.searchList;
                page = 1;
                size = 15;
                dataNum = res.data.cont;
                if(dataNum == 0){
                    alert('sorry 检索不到>_<');
                }else {
                    renderData(res.data.searchList);
                }
            })
        }
    })       
}

//编辑回填学生信息
function editStudentData(index) {
    getData('/api/student/findAll', {}, function (res) {
        var data = allStudentsData[index];
        var form = $('.edit-student')[0];
        for(var prop in data){
            if(form[prop]){
                form[prop].value = data[prop];
            }
        }
    })
}

//将数组转换为对象并返回
function transformData(arr) {
    var data = {};
    arr.forEach(function (item) {
        data[item.name] = item.value;
    })
    return data;
}

//数据交互
function getData(url, data, callback) {
    $.ajax({
        url: 'http://api.duyiedu.com' + url,
        type: 'GET',
        data: $.extend(data, {
            appkey: 'dongmeiqi_1547441744650'
        }),
        dataType: 'json',
        success: function (res) {
            if(res.status == 'success'){
                callback(res);
            }else {
                console.log(res.msg);
            }
        }
    })
}

//按页获取表格数据
function getTableData(page, size) {
    getData('/api/student/findByPage', {
        page: page,
        size: size
    }, function (res) {
        dataNum = res.data.cont;
        var val = $('.search').val();
        if(val){
            getData('/api/student/searchStudent', {
                sex: -1,
                search: val,
                page: page,
                size: size
            }, function (res) {
                allStudentsData = res.data.searchList;
                page = 1;
                size = 15;
                dataNum = res.data.cont;
                renderData(res.data.searchList);
            })
        }else {
            renderData(res.data.findByPage);
        }
    })
}


//数据渲染至页面
function renderData(data) {
    var str = '';
    data.forEach(function (item, index) {
        str += '\
                <tr>\
                <td>' + item.sNo + '</td>\
                <td>' + item.name + '</td>\
                <td>' + (item.sex ? '女' : '男') + '</td>\
                <td>' + item.email + '</td>\
                <td>' + (new Date().getFullYear() - item.birth) + '</td>\
                <td>' + item.phone + '</td>\
                <td>' + item.address + '</td>\
                <td>\
                    <button class="edit-btn" data-index = ' + index + '>编辑</button>\
                    <button class="del-btn" data-index = ' + index + '>删除</button>\
                </td>\
            </tr>';
    })
    $('tbody').html(str);

    $('.page-search').page({
        nowPage: page,
        dataNum: dataNum,
        pageSize: size,
        pageCb: function (nowPage, pageSize) {
            page = nowPage;
            size = pageSize;
            getTableData(nowPage, pageSize);
        }
    })
}
