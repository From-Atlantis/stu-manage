var pageIndex = 1;
//初始化函数
function init() {
    renderTable(1);
    bindEvent();
}
init();
//绑定事件
function bindEvent() {
    var menuList = document.getElementsByClassName('menu-list')[0];
    menuList.addEventListener('click', changeMenuList, false);
    var addStudent = document.getElementsByClassName('add-submit')[0];
    addStudent.addEventListener('click', function (e) {
        changeStudentData(e, '/api/student/addStudent', 'add-student');
    }, false);
    var tBody = document.getElementsByTagName('tbody')[0];
    tBody.addEventListener('click', tBodyClick, false);
    var mask = document.getElementsByClassName('mask')[0];
    mask.onclick = function () {
        var editStudent = document.getElementsByClassName('edit-student-content')[0];
        editStudent.classList.remove('edit-active');    
    }
    var editSubmit = document.getElementsByClassName('edit-submit')[0];
    editSubmit.addEventListener('click', function (e) {
        changeStudentData(e, '/api/student/updateStudent', 'edit-student');
    }, false);
    var previousPage = document.getElementsByClassName('previousPage')[0];
    previousPage.addEventListener('click', function () {
        pageIndex--;
        if(pageIndex == 0){
            pageIndex = 1;
            alert('前面已经没了');
        }
        renderTable(pageIndex);
    }, false)
    var nextPage = document.getElementsByClassName('nextPage')[0];
    nextPage.addEventListener('click', function () {
        pageIndex++;
        tablePageCount = tableData.length % 19 == 0 ? tableData.length / 19 : (parseInt(tableData.length / 19) + 1);
        if(pageIndex > tablePageCount){
            pageIndex = tablePageCount;
            alert('后面已经没了');
        }
        renderTable(pageIndex);
    }, false)
    var firstPage = document.getElementsByClassName('firstPage')[0];
    firstPage.onclick = function () {
        pageIndex = 1;
        renderTable(pageIndex);
    }
    var lastPage = document.getElementsByClassName('lastPage')[0];
    lastPage.onclick = function () {
        pageIndex = tableData.length % 19 == 0 ? tableData.length / 19 : (parseInt(tableData.length / 19) + 1);
        renderTable(pageIndex);
    }
}
//校验学生信息
function checkStudentData(data) {
    var regSno = /\d+/g;
    if(!regSno.test(data.sNo) || data.sNo.length < 4 || data.sNo.length > 8){
        alert('请输入4到8位数字的学号');
        return false;
    }
    if(data.birth >= new Date().getFullYear()){
        alert('请输入正确的年龄');
        return false;
    }
    if(!regSno.test(data.phone) || data.phone.length != 11){
        alert('请输入11位数字的手机号');
        return false;
    }
    return true;
}
//添加以及改变学生信息
function changeStudentData(e, url, className) {
    e.preventDefault();
    var form = document.getElementsByClassName(className)[0];
    var data = getFormData(form);
    if(!checkStudentData(data)){
        return false;
    }
    if(!data) {
        return false;
    }
    transferData(url, data, function () {
        if(className == 'edit-student'){
            if(confirm('提交成功，是否刷新页面？')){
                renderTable(pageIndex);
                var mask = document.getElementsByClassName('mask')[0];
                mask.click();
            }else{
                form.reset();
            }
        }else if(className == 'add-student'){
            if(confirm('提交成功，是否跳转至学生列表页面')){
                var list = document.getElementsByClassName('list')[0];
                list.click();
            }else{
                form.reset();
            }
        }
    })
}
//编辑删除点击事件
function tBodyClick(e) {
    var index = e.target.getAttribute('data-index');
    if(e.target.className.indexOf('edit-btn') > -1){
        var editStudent = document.getElementsByClassName('edit-student-content')[0];
        editStudent.classList.add('edit-active');
        editStudentData(index);
    }else if(e.target.className.indexOf('del-btn') > -1){
        transferData('/api/student/findAll', {}, function (result) {
            var data = result.data[index];
            if(confirm('确定要删除信息吗？')){
                transferData('/api/student/delBySno', data, function () {
                    alert('已删除');
                    pageIndex = 1;
                    renderTable(1);
                })
            }
        })
    }
}
//编辑回填学生信息
function editStudentData(index) {
    transferData('/api/student/findAll', {}, function (result) {
        var data = result.data[index];
        var form = document.getElementsByClassName('edit-student')[0];
        for(var prop in data){
            if(form[prop]){
                form[prop].value = data[prop];
            }
        }
    })
}
//渲染学生信息页面
function renderTable(index) {
    transferData('/api/student/findAll', {}, function (result) {
        tableData = result.data;
        var data = result.data;
        var str = '';
        for(var i = 19 * (index - 1); i < 19 * index; i ++){
            if(data[i]){
                str += '\
                    <tr>\
                    <td>' + data[i].sNo + '</td>\
                    <td>' + data[i].name + '</td>\
                    <td>' + (data[i].sex ? '女' : '男') + '</td>\
                    <td>' + data[i].email + '</td>\
                    <td>' + (new Date().getFullYear() - data[i].birth) + '</td>\
                    <td>' + data[i].phone + '</td>\
                    <td>' + data[i].address + '</td>\
                    <td>\
                        <button class="edit-btn" data-index = ' + i + '>编辑</button>\
                        <button class="del-btn" data-index = ' + i + '>删除</button>\
                    </td>\
                </tr>';
            }
        }
        var tBody = document.getElementsByTagName('tbody')[0];
        tBody.innerHTML = str;
        var pageCount = document.getElementsByClassName('pageIndex')[0];
        pageCount.innerHTML = pageIndex;
    })
}
//获取表单数据
function getFormData(form) {
    var sNo = form.sNo.value;
    var name = form.name.value;
    var sex = form.sex.value;
    var email = form.email.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;
    if(!sNo || !name || !email || !birth || !phone || !address){
        return false;
    }
    return {
        sNo: sNo,
        name: name,
        sex: sex,
        email: email,
        birth: birth,
        phone: phone,
        address: address
    }
}
//数据交互
function transferData(url, data, callback) {
    var result = saveData('http://api.duyiedu.com' + url, Object.assign(data, {
        appkey: 'dongmeiqi_1547441744650'
    }))
    if(result.status == 'success'){
        callback(result);
        return result;
    }else{
        alert(result.msg);
    }
}
//切换左右内容
function changeMenuList(e) {
    var allMenu = document.getElementsByTagName('dd');
    var allContent = document.getElementsByClassName('student-data');
    var target = document.getElementsByClassName(e.target.getAttribute('data-id'))[0];
    if(e.target.tagName == 'DD'){
        for(var i = 0; i < allMenu.length; i ++){
            allMenu[i].classList.remove('menu-active');
        }
        e.target.classList.add('menu-active');
        for(var i = 0; i < allContent.length; i ++){
            allContent[i].classList.remove('student-active');
        }
        target.classList.add('student-active');
    }
    if(e.target.className.indexOf('list') > -1){
        renderTable(1);
        pageIndex = 1;
    }
}
//向后端传输数据
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object'){
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}