

// 用于获取url参数getQueryVariable(letiable) letiable参数名称
// http://www.runoob.com/index.php?id=1&image=awesome.jpg
// 调用 getQueryVariable("id") 返回 1。
// 调用 getQueryVariable("image") 返回 "awesome.jpg"

export function getQueryVariable(letiable) {
  let query = window.location.search.substring(1);
  let lets = query.split("&");
  for (let i = 0; i < lets.length; i++) {
    let pair = lets[i].split("=");
    if (pair[0] == letiable) { return pair[1]; }
  }
  return (false);
}


export function readTextFile(file, callback) {
  let rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

export function IsIncludeStrings(str, includestrs) {
  let isin = false;
  if (str == undefined || str == "" || str == null) return isin;

  for (let i = 0; i < includestrs.length; i++) {
    if (str.indexOf(includestrs[i]) > -1) {
      isin = true;
      break;
    }
  }
  return isin;
}

//获取url参数
//若地址栏URL为：abc.html?id=123&url=http://www.maidq.com
//GetQueryString("id")结果： 123 
//GetQueryString("url")结果：http://www.maidq.com 
export function GetQueryString(name) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");

  let r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
  if (r != null) return decodeURI(r[2]); return null;
}
export function StringFormat() {
  if (arguments.length == 0)
      return null;
  var str = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
      var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
      str = str.replace(re, arguments[i]);
  }
  return str;
}
//封装时间格式
export function datetimeformat(time, format) {
  let t = new Date(time);
  let tf = function (i) {
    return (i < 10 ? '0' : '') + i
  };
  return format.replace(/yyyy|YYYY|yy|YY|MM|DD|dd|HH|mm|ss|SS/g, function (a) {
    switch (a) {
      case "yy":
      case "YY":
        return tf(parseInt(t.getFullYear().toString().slice(2)));
        break;
      case 'yyyy':
      case 'YYYY':
        return tf(t.getFullYear());
        break;
      case 'MM':
        return tf(t.getMonth() + 1);
        break;
      case 'mm':
        return tf(t.getMinutes());
        break;
      case 'dd':
      case 'DD':
        return tf(t.getDate());
        break;
      case 'HH':
      case 'hh':
        return tf(t.getHours());
        break;
      case 'ss':
      case 'SS':
        return tf(t.getSeconds());
        break;
    }
  });
}


//对象数组按指定属性值进行排序。key属性名称（字符串）；isAsc是否升序（布尔值类型）
export function sortExp(key, isAsc) {
  return function (x, y) {
    if (isNaN(key)) {
      if (x[key] > y[key]) return 1 * (isAsc ? 1 : -1);
      else if (x[key] < y[key]) return -1 * (isAsc ? 1 : -1);
      else return 0;
    }
    else
      return (x[key] - y[key]) * (isAsc ? 1 : -1)
  }
}


export function getTableToArray(tb) {
  if (!tb) return null;

  var list = new Array();
  for (let i = 0; i < tb.rows.length; i++) {
    list[i] = new Array();
    for (let j = 0; j < tb.rows[i].cells.length; j++) {
      // console.log(tb.rows[i].cells[j].innerText);
      list[i][j] = tb.rows[i].cells[j].innerText;
    }
  }
  return list;

}
/**
 * 导出时间格式
 * @param {*} date 
 * @param {*} fmt 
 */
export function getdateformat(date) {
  let y = date.getFullYear().toString();                 //月份 
  let zero = function (num) {
    if (num < 10)
      return '0' + num.toString();
    else
      return num.toString();
  }
  let m = zero(date.getMonth() + 1);                  //月份  
  let d = zero(date.getDate());                    //日 
  let hh = zero(date.getHours());                   //小时 
  let mm = zero(date.getMinutes());                 //分 
  let ss = zero(date.getSeconds());                 //秒  
  let ms = zero(date.getMilliseconds());             //毫秒 
  let fmt = y + m + d + hh + mm + ss + ms;

  return fmt;
}


export function getCSVfromTable(table) {
  let arr = getTableToArray(table);
  var CSV = '';
  //拿到的是[1,2,3],[4,5,6]
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      //拿到1,2,3,4,5,6,7,8,9
      // alert(arr[i][j]);
      CSV += arr[i][j] + ',';
    }
    CSV = CSV.substring(0, CSV.length - 1);
    CSV += "\r\n";
  }
  return CSV;
}

export function downloadCSV(csv, filename) {
  var csvFile;
  var downloadLink;

  // CSV file
  csvFile = new Blob([csv], { type: "text/csv" });

  // Download link
  downloadLink = document.createElement("a");

  // File name
  downloadLink.download = filename;

  // Create a link to the file
  downloadLink.href = window.URL.createObjectURL(csvFile);

  // Hide download link
  downloadLink.style.display = "none";

  // Add the link to DOM
  document.body.appendChild(downloadLink);

  // Click download link
  downloadLink.click();
}