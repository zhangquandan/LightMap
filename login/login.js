
function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    var geoserverurl = "http://localhost:8080/geoserver/j_spring_security_check";

    //headers.append('Content-Type', 'text/json');
    var data = {
        username: username,
        password: password
    };
    console.log(data.password);


    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    // myHeaders.append("Cookie", "JSESSIONID=1AB965E975A6D6EF958CF347582043D6");

    var urlencoded = new URLSearchParams();
    urlencoded.append("username", username);
    urlencoded.append("password", password);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
        credentials: 'include',
    };
    deleteCookie("username");

    fetch(geoserverurl, requestOptions)
        .then(function (response) {
            console.log(response.status);
            if (response.status == 200) {
                // document.getElementById("longininfo").innerHTML = '';
                // runmap();
                // window.history.back();
                var qs = getQueryString();
                // setCookie("username", username);
                document.cookie = "username=" + username;
                var qsfrom = qs["from"]; // abc
                if (qsfrom == "geoserver")
                    window.location.href = "http://localhost:8080/geoserver/";
                else
                    // window.location.href = "http://localhost:8080/lightmapv5/index.html?status=logined";
                    window.location.href = "http://localhost:8080/lightmapv5/index.html";
            }
            else {
                document.getElementById("longininfo").innerHTML = '提示：错误的用户名或密码';
            }
            return response.text()
        })
        .then(function (result) {

        })
        .catch(error => console.log('error', error));
}

function getQueryString() {
    var qs = location.search.substr(1), // 获取url中"?"符后的字串  
        args = {}, // 保存参数数据的对象
        items = qs.length ? qs.split("&") : [], // 取得每一个参数项,
        item = null,
        len = items.length;

    for (var i = 0; i < len; i++) {
        item = items[i].split("=");
        var name = decodeURIComponent(item[0]),
            value = decodeURIComponent(item[1]);
        if (name) {
            args[name] = value;
        }
    }
    return args;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// 回车提交表单， 兼容FF和IE和Opera
document.onkeydown = function (e) {
    var theEvent = window.event || e;
    var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
    if (code == 13) {
        login();
    }
}