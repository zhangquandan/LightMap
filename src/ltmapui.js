import Feature from 'ol/Feature';

import Point from 'ol/geom/Point';


import WFS from 'ol/format/WFS';
import {
    equalTo as filterequalTo,
    like as filterlike,
    and as filterand,
    lessThan as filterlessThan,
    lessThanOrEqualTo as filterlessThanOrEqualTo,
    greaterThan as filtergreaterThan,
    greaterThanOrEqualTo as filtergreaterThanOrEqualTo,
    within as filterwithin,
    between as filterbetween,
    during as filterduring,
} from 'ol/format/filter';

import GeoJSON from 'ol/format/GeoJSON'
import { getCenter } from 'ol/extent';

import { IsIncludeStrings, sortExp } from './utility';
import { GetCoordinatesDistance, GetCogoArea, GetCenterOfExtent } from './cogo';
import { Fill, Text, Style } from 'ol/style';
import { CreateWaterNet } from './WaterNet';
import { GetWfsLayer, GetFieldContent, GetlayernameByFeatrueID } from './ltmapfactory';
// import * as jsts from 'jsts'

import { getCSVfromTable, downloadCSV, getdateformat, datetimeformat, StringFormat } from './utility'


export function UIEventRegist(map) {




    //显示隐藏菜单按钮
    document.getElementById('menutoolbar').onclick = function () { onShowhidetools(this); };

    //重置地图？
    document.getElementById('menuResetMap').onclick = function () { UiOnResetMap(map); };

    //清理地图？
    document.getElementById('menuClear').onclick = function () { UiOnClearMap(map); };


    //图层管理->

    //显示图层
    document.getElementById('menuLayerShowHide').onclick = function () { UiOnLayerShowHide(this); };

    //图层显示和隐藏
    document.getElementsByName('layercheckbox').forEach(function (chk) { chk.onclick = function () { onlayervisible(chk, map.mylayers); }; });

    //设置图层透明度
    document.getElementsByName('layeropacity').forEach(function (op) { op.onchange = function () { onlayeropacitychange(op, map.mylayers); }; });

    //<-图层管理



    //放大地图
    document.getElementById('menuZoomIn').onclick = function () { UiOnZoomIn(map); };
    //缩小地图
    document.getElementById('menuZoomOut').onclick = function () { UiOnZoomOut(map); };

    //显示隐藏查询框
    document.getElementById('menuSearch').onclick = function () { UiOnClearMap(map); UiOnViewSearch(); };
    document.getElementById('menuSearchComplex').onclick = function () { UiOnClearMap(map); menuSearchComplex_onclick(); };


    //泵房信息
    document.getElementById('menupump').onclick = function () { UiOnClearMap(map); UiOnViewPump(map); };

    //双击关闭系统图
    document.getElementById('divpumpdiagram').ondblclick = function () {
        document.getElementById('divpumpdiagram').style.display = "none";
    };


    //测距离
    document.getElementById('menuDistance').onclick = function () { UiOnDistance(map); };

    //测面积
    document.getElementById('menuArea').onclick = function () { UiOnArea(map); };


    //标记点
    document.getElementById('menuMapMarker').onclick = function () { UiOnMapMarker(map); };

    //是否显示要素信息
    document.getElementById('menuInfo').onclick = function () { UiOnInfo(map); };


    //测距事件
    map.interactionDistance.on('drawend', function (event) { drawDistance(event, map); });
    //测面积事件
    map.interactionArea.on('drawend', function (event) { drawArea(event, map); });


    //查询
    document.getElementById('btnSearch').onclick = function () { UiOnSearch(map); };
    // document.getElementById('btnClear').onclick = function () { btnClear_Click(map); };
    document.getElementById('tbxSearch').onclick = function () { tbxSearch_onclick(map); };

    //复合查询
    document.getElementById('btnSearchComplex').onclick = function () { btnSearchComplex_onclick(map); };




    document.getElementById('menuAnsy').onclick = function () { UiOnAnsyShowHide(map); };



    //关阀分析
    document.getElementById('btnAnsyAddPipe').onclick = function () { btnAnsyAddPipe_Click(map); };
    document.getElementById('btnRemovePipes').onclick = function () { btnRemovePipe_Click(map); };
    document.getElementById('chkAnsyAll').onclick = function () { chkAnsyAll_Click(); };

    document.getElementById('btnCloseValve').onclick = function () { btnCloseValve_Click(map); };
    document.getElementById('btnAnsyNoWater').onclick = function () { btnAnsyNoWater_Click(map); };


    document.getElementById('btnSavetoCsv').onclick = function () { SaveTableToCsv(); };

    //关阀分析数据加载     
    // loaddata_js_topo(map);

    document.getElementById('btnSavepicture').onclick = function () { btnSavepicture_click(map); };

    document.getElementById('lstComplexSelectLayer').onchange = function () { lstComplexSelectLayer_onchange(); };

    //取消勾选查询条件时禁用后面的输入框或选择框
    onEventConditioncheked();

    //选择水表阀门等特殊管点时，显示相应查询条件项
    document.getElementById("sltcategory").onchange = function () { sltcategory_onchange(); }


    document.getElementById("btnhightpipelist").onclick = function () { btnhightpipelist_onclick(map) }

    initselectduringoptions();
}


//初始化设置时间范围选择的option值
function initselectduringoptions() {
    let slts = document.getElementsByName("selectduring");
    let getdatebytoyears = function (myDate, year) {
        let y = myDate.getFullYear() - year;
        let d = new Date(y, 0, 1, 0, 0, 0);
        return d;
    }
    let getdatevalue = function (dt1, dt2) {
        return StringFormat('["{0}","{1}"]',
            datetimeformat(dt1, 'yyyy-MM-ddTHH:mm:ssZ'), datetimeformat(dt2, 'yyyy-MM-ddTHH:mm:ssZ'));
    }
    let getDateAddSecondes = function (myDate, seconds) {
        let yy = myDate.getFullYear();
        let MM = myDate.getMonth();
        let DD = myDate.getDate();
        let HH = myDate.getHours();
        let mm = myDate.getMinutes();
        let ss = myDate.getSeconds();
        let dt = new Date(yy, MM, DD, HH, mm, ss + seconds);
        return dt;
    }
    let appendoption = function (parant, txt, value) {
        let op = document.createElement("option");
        op.innerHTML = txt;
        op.value = value;
        parant.appendChild(op);

        return op;
    }
    for (let index = 0; index < slts.length; index++) {
        let slt = slts[index];
        // console.log(slt);
        slt.innerHTML = "";
        appendoption(slt, "不限", '["1900-1-1T00:00:00Z","2050-1-1T00:00:00Z"]');

        let dt = new Date();
        let dt_10 = getdatebytoyears(dt, 10);
        let dt_20 = getdatebytoyears(dt, 20);
        let dt_30 = getdatebytoyears(dt, 30);
        let dt_40 = getdatebytoyears(dt, 40);
        let dt_50 = getdatebytoyears(dt, 50);
        let seconds = -1;
        let dt_10less = getDateAddSecondes(dt_10, seconds);
        let dt_20less = getDateAddSecondes(dt_20, seconds);
        let dt_30less = getDateAddSecondes(dt_30, seconds);
        let dt_40less = getDateAddSecondes(dt_40, seconds);
        let dt_50less = getDateAddSecondes(dt_50, seconds);
        //小于等于10年（距今）
        appendoption(slt, "Y≤10&nbsp;&nbsp;(Y为距今年份)", getdatevalue(dt_10, new Date(2050, 0, 1)));
        //小于等于20年，大于10年
        appendoption(slt, "10&lt;Y≤20&nbsp;&nbsp;(Y为距今年份)", getdatevalue(dt_20, dt_10less));
        //小于等于30年，大于20年
        appendoption(slt, "20&lt;Y≤30&nbsp;&nbsp;(Y为距今年份)", getdatevalue(dt_30, dt_20less));
        //小于等于40年，大于30年
        appendoption(slt, "30&lt;Y≤40&nbsp;&nbsp;(Y为距今年份)", getdatevalue(dt_40, dt_30less));
        //小于等于50年，大于40年
        appendoption(slt, "40&lt;Y≤50&nbsp;&nbsp;(Y为距今年份)", getdatevalue(dt_50, dt_40less));
        //大于50年 
        appendoption(slt, "Y&gt;50&nbsp;&nbsp;(Y为距今年份)", getdatevalue(new Date(1900, 0, 1), dt_50less));

        slt.onchange = function () {
            let i = slt.selectedIndex;
            console.log(slt.options[i].value);
        }

    }

}


//复合条件复选框选中后其后的输入获取下拉框元素有效/不选中则无效 本函数立即自行
//注意html复合条件查询中的section及其子元素结构不能改变，元素属性字段名和查询类型根据数据库查询需要调整
function onEventConditioncheked() {
    let divQueryCondition = document.getElementById("divQueryCondition");
    let childs = divQueryCondition.children;
    for (let index = 0; index < childs.length; index++) {
        let csecs = childs[index];
        let cs = csecs.children;
        // console.log(cs);
        for (let i = 0; i < cs.length; i++) {
            // console.log(cs[i]);

            let ckbox = cs[i].children[0].children[0];
            // console.log(ckbox);

            let lbl = cs[i].children[1];
            let ipt = cs[i].children[2];
            ckbox.onclick = function () {
                if (ckbox.checked) {
                    lbl.style.color = "black";
                    ipt.disabled = false;
                }
                else {
                    lbl.style.color = "gray";
                    ipt.disabled = true;
                }
                // alert(cs[i].value);  
            }
        }
    }
}

//选择水表查询下拉框相关水表专用查询条件显示和隐藏
function sltcategory_onchange() {
    let sltcategory = document.getElementById("sltcategory");
    let index = sltcategory.selectedIndex;

    let wm = sltcategory[index].value;
    let iswm = wm === "水表" ? true : false;
    let divwatermeters = document.getElementsByName("divwatermeter");
    for (let i = 0; i < divwatermeters.length; i++) {
        console.log(divwatermeters[i].children[0].children[0]);
        if (iswm) {
            divwatermeters[i].style.display = "";
            // divwatermeters[i].children[0].children[0].checked = true;   //保证该项纳入过滤
        }
        else {
            divwatermeters[i].style.display = "none";
            divwatermeters[i].children[0].children[0].checked = false;  //不显示时保证该项不纳入过滤
        }
    }
}

//复合查询
function btnSearchComplex_onclick(map) {
    var lst = document.getElementById("lstComplexSelectLayer");
    var index = lst.selectedIndex;
    var layername = lst.options[index].value;
    let divListTable = document.getElementById("divListTable");
    divListTable.innerHTML = "";
    map.selectedLayer.getSource().clear();
    map.removeInteraction(map.drawregion);

    switch (layername) {
        case "building":
            complexseartch(map, layername, "sec_building");
            // complexseartch_building(map, layername);
            break;
        case "js_pipe":
            complexseartch(map, layername, "sec_js_pipe");
            // complexseartch(map, layername, "sec_js_pipe")
            // complexseartch_js_line(map, layername);
            break;
        case "js_point":
            complexseartch(map, layername, "sec_js_point");
            // complexseartch_js_point(map, layername);
            break;
        case "pumproom":
            complexseartch(map, layername, "sec_pumproom");
            // complexseartch_pumproom(maplayername);
            break;
        default:
            alert("未找到选择项对应的图层名称：" + layername + "!");
            break;
    }

}

//获取地图查询的指定的范围范围（矩形、圆形、多边形范围）
function getSelectRegionInMap(map) {
    let fs = map.regionlayer.getSource().getFeatures();
    if (fs == undefined || fs.length < 1) {
        return null;
    }
    let lastf = fs[fs.length - 1];
    let geometry = lastf.getGeometry();

    //范围过滤
    var spacialfilter = filterwithin('geom', geometry);
    console.log(fs);
    return spacialfilter;
}

//过滤合并
function addfilter(filter, newfilter) {
    if (filter == null) {
        if (newfilter == null)
            return null;
        else
            return newfilter;
    }
    else {
        if (newfilter == null)
            return filter;
        else
            return filterand(filter, newfilter);
    }

}


//获取查询条件集合(根据父div控件名称直接获取其子元素——选择盒checkbox、文本输入input text或者下拉框select的属性)
//属性包含字段名、操作类型（自定义的textlike/selectlike/selectbetween/selectduring）
//操作类型：
//textlike——文本模糊查询，value为input的value，类型为文本
//selectlike——文本模糊查询，value为选择项option的value，类型为文本
//selectbetween——数值范围查询，value为选择项option的value，类型为数组，第一值为数值最小值，第二值为最大值，如 [7,12]
//                <option value="[7,12]"> 6&lt;N≤12&emsp;(N为楼层数) </option>
//selectduring——时间范围查询，value为选择项option的value，类型为数组，第一值为时间最小值，第二值为最大值，如 ['2000-1-1','2019-1-1']

function getconditionsbysectionid(sectionid) {
    var conditions = new Array();

    let sec = document.getElementById(sectionid);
    let build_condition = sec.children;
    for (let i = 0; i < build_condition.length; i++) {
        var div = build_condition[i];
        var checked = div.children[0].children[0].checked;
        if (checked) {

            var element = div.children[div.children.length - 1];
            var condition = new Object();
            condition.field = element.getAttribute("field");
            condition.operator = element.getAttribute("name");

            var operator = condition.operator;
            // console.log(operator);
            switch (operator) {
                case "selectlike":
                case "selectbetween":
                case "selectduring":
                    var index = element.selectedIndex;
                    var option = element.options[index];
                    condition.content = option.value;
                    break;
                case "textlike":
                case "textequeto":
                    condition.content = element.value;
                    break;
            }
            conditions.push(condition);
        }
        // console.log(div.children[0].children[0].checked);
        // console.log(div.children[div.children.length - 1]);
        // console.log(conditions);
    }
    return conditions;
}

//复合查询——给定map对象、图层名称、div名称
function complexseartch(map, selectedlayername, divname) {

    //属性过滤
    var filter = null;
    var conditions = getconditionsbysectionid(divname);
    // console.log("conditions");
    // console.log(conditions);

    for (let index = 0; index < conditions.length; index++) {
        let condition = conditions[index];

        var filter_field = null;
        if (condition.content != undefined && condition.content != "") {
            switch (condition.operator) {
                case "textequalto":
                    filter_field = filterequalTo(condition.field, '*' + condition.content + '*');
                    break;
                case "textlike":
                case "selectlike":
                    filter_field = filterlike(condition.field, '*' + condition.content + '*');
                    // console.log(condition.field + ":" + condition.content); 
                    break;
                case "selectbetween":
                    var arr = JSON.parse(condition.content);
                    // console.log(condition.field + ":arr[0] - " + arr[0] + "  arr[1] - " + arr[1]);
                    filter_field = filterbetween(condition.field, arr[0], arr[1]);
                    // console.log(filter_field);
                    break;
                case "selectduring":
                    // console.log("selectduring");
                    // console.log(condition.content);
                    var dt = JSON.parse(condition.content);
                    // console.log("dt=");
                    // console.log(dt);
                    // console.log(condition.field + ":dt[0] - " + dt[0] + "  dt[1] - " + dt[1]);
                    // filter_field = filterduring(condition.field, new Date(dt[0]), new Date(dt[1]));
                    // filter_field = filterduring(condition.field,  dt[0], dt[1]);
                    filter_field = filterbetween(condition.field, dt[0], dt[1]);
                    // console.log(filter_field);
                    break;
                default:

                    break;
            }
            // console.log(filter_field);
            filter = addfilter(filter, filter_field);
            // console.log(filter);
        }
    }


    // console.log(filter);
    //空间范围合并过滤
    if (map.SelectRegionType != "RegionMap") {
        var spacialfilter = getSelectRegionInMap(map);
        if (spacialfilter == null) {
            alert("请在地图指定查询的范围(矩形、圆形、多边形范围仅最后一个定义的范围有效)！")
            return;
        }
        filter = addfilter(filter, spacialfilter);
    }

    SearchAndShowinlist(map, selectedlayername, filter);

}


// function complexseartch_building(map, selectedlayername) {

//     //属性过滤
//     var filter = null;

//     //建筑名称
//     var field_name = document.getElementById("build_name");
//     if (field_name.checked) {
//         var fieldvalue = document.getElementById("input_build_name").value;
//         var filter_field = filterlike(field_name.value, '*' + fieldvalue + '*');
//         filter = addfilter(filter, filter_field);
//     }

//     //建筑类型
//     var field_category = document.getElementById("build_category");
//     if (field_category.checked) {
//         var slt = document.getElementById("slt_build_category");
//         var index = slt.selectedIndex;
//         var fieldvalue = slt.options[index].value;
//         var filter_field = filterlike(field_category.value, '*' + fieldvalue + '*');
//         filter = addfilter(filter, filter_field);
//     }

//     //建筑楼层，通过value的数组（最小最大值）过滤数值范围
//     var field_floors = document.getElementById("build_floors");
//     if (field_floors.checked) {
//         var slt = document.getElementById("slt_build_floors");
//         var index = slt.selectedIndex;
//         var option = slt.options[index];
//         var arr = JSON.parse(option.value);
//         var filter_field = filterbetween(field_floors.value, arr[0], arr[1]);
//         console.log(arr[1]);
//         filter = addfilter(filter, filter_field);
//     }

//     //空间范围合并过滤
//     if (map.SelectRegionType != "RegionMap") {
//         var spacialfilter = getSelectRegionInMap(map);
//         if (spacialfilter == null) {
//             alert("请在地图指定查询的范围(矩形、圆形、多边形范围仅最后一个定义的范围有效)！")
//             return;
//         }
//         filter = addfilter(filter, spacialfilter);
//     }

//     SearchAndShowinlist(map, selectedlayername, filter);

// }


// // 复合查询——给水管线

// function complexseartch_js_line(map) {

// }
// //复合查询——给水管点
// function complexseartch_js_point(map) {

// }
// //复合查询——泵房
// function complexseartch_pumproom(map, selectedlayername, filter) {

// }

//根据任意图层名称和过滤条件（复合条件或单一条件，包括空间条件的过滤），查询并显示结果到列表。参数：地图map、layername
function SearchAndShowinlist(map, selectedlayername, filter) {
    map.selectedLayer.getSource().clear();
    map.MarkerLayer.getSource().clear();

    //通过属性和值查询要素
    let featureRequest = new WFS().writeGetFeature({
        srsName: config.MapsrsName,
        featureNS: config.Mapnamespace, //必须与geoserver对应工作区的NameSpace一致
        featurePrefix: config.Mapworkspace,
        featureTypes: [selectedlayername],
        outputFormat: 'application/json',
        filter: filter
    });
    // console.log(featureRequest);

    fetch(config.wfsurl, {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest)
    }).then(function (response) {

        return response.json();
    }).then(function (json) {
        let features = new GeoJSON().readFeatures(json);
        // console.log(features);
        // selectAndMarkFeaturesFirst(map, features);
        // getFeaturesSearchResultTable(map, features);
        getFeaturesListtTable(map, selectedlayername, features);

        map.selectedLayer.getSource().addFeatures(features);
        // map.selectedLayer.getSource().addFeature(fbuild);


    }).catch((e) => { map.selectedLayer.getSource().clear(); });
}

// 复合查询图层选择
function lstComplexSelectLayer_onchange() {
    var objS = document.getElementById("lstComplexSelectLayer");

    var value = objS.options[objS.selectedIndex].value;
    switch (value) {
        case "building":
            document.getElementById('sec_building').style.display = 'block';
            document.getElementById('sec_js_pipe').style.display = 'none';
            document.getElementById('sec_js_point').style.display = 'none';
            document.getElementById('sec_pumproom').style.display = 'none';
            break;
        case "js_pipe":
            document.getElementById('sec_building').style.display = 'none';
            document.getElementById('sec_js_pipe').style.display = 'block';
            document.getElementById('sec_js_point').style.display = 'none';
            document.getElementById('sec_pumproom').style.display = 'none';
            break;
        case "js_point":
            document.getElementById('sec_building').style.display = 'none';
            document.getElementById('sec_js_pipe').style.display = 'none';
            document.getElementById('sec_js_point').style.display = 'block';
            document.getElementById('sec_pumproom').style.display = 'none';
            break;
        case "pumproom":
            document.getElementById('sec_building').style.display = 'none';
            document.getElementById('sec_js_pipe').style.display = 'none';
            document.getElementById('sec_js_point').style.display = 'none';
            document.getElementById('sec_pumproom').style.display = 'block';
            break;
    }
}

function btnSavepicture_click(map) {
    var mapCanvas = document.createElement('canvas');
    var size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    var mapContext = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function (canvas) {
        if (canvas.width > 0) {
            var opacity = canvas.parentNode.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
            var transform = canvas.style.transform;
            // Get the transform parameters from the style's transform matrix
            var matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
            mapContext.drawImage(canvas, 0, 0);
        }
    });
    if (navigator.msSaveBlob) {
        // link download attribuute does not work on MS browsers
        navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
    } else {
        var link = document.getElementById('image-download');
        // link.display = "none";
        link.href = mapCanvas.toDataURL();
        link.click();
    }
    // console.log(mapCanvas);

}

function tbxSearch_onclick(map) {
    document.getElementById('divSearchContent').style.display = 'block';

}

// function btnClear_Click(map){
//     document.getElementById('divSearchContent').style.display = 'none' ;
//     map.removeInteraction(map.drawregion);
// }

function drawDistance(event, map) {

    // event.feature 就是当前绘制完成的线的Feature
    let geometry = event.feature.getGeometry();
    let coords = geometry.getCoordinates();

    let distance = GetCoordinatesDistance(event.feature.getGeometry().getCoordinates());

    let coord = coords[coords.length - 1];
    let anchor = new Feature({
        geometry: new Point(coord)
    });

    anchor.setStyle(new Style({
        text: new Text({
            font: '16px sans-serif',
            // font: '20 px',
            text: distance.toFixed(2) + ' m',
            fill: new Fill({
                color: 'red'
            })
        })
    }));

    map.messureLayer.getSource().addFeature(anchor);

    // map.interactionDistance.ison = false;
    // map.removeInteraction(map.interactionDistance);
}

function drawArea(event, map) {

    // event.feature 就是当前绘制完成的线的Feature
    let geometry = event.feature.getGeometry();
    if (geometry == undefined || geometry == null) return;
    let coords = geometry.getCoordinates()[0]; //存在多个面嵌套,第一个嵌套面的点集
    if (coords == undefined) return;

    let area = GetCogoArea(coords);
    let extent = geometry.getExtent();

    let coord = GetCenterOfExtent(extent);

    let anchor = new Feature({
        geometry: new Point(coord)
    });

    map.messureLayer.getSource().addFeature(anchor);
    anchor.setStyle(new Style({
        text: new Text({
            font: '16px sans-serif',
            // font: '20px',
            text: area.toFixed(2) + ' m² ',
            fill: new Fill({
                color: 'red'
            })
        })
    }));
    // map.interactionArea.ison = false;
    // map.removeInteraction(map.interactionArea);
}

//设置按钮状态
function SetButtonEnableStyle(e, status) {
    if (status) {
        e.setAttribute("menustatus", "true");
        e.style.background = "rgba(135,206,250, 0.95)";
    } else {
        e.setAttribute("menustatus", "false");
        e.style.background = "rgba(230, 230, 230, 0.95)";
    }
}

//显示隐藏工具条
function onShowhidetools() {

    let btn = document.getElementById("menutoolbar");
    let div = document.getElementById("divtools");
    let menustatus = btn.getAttribute("menustatus");

    if (menustatus == "true")
        menustatus = "false";
    else
        menustatus = "true";

    if (menustatus == "true") {
        div.style.display = "block";

        SetButtonEnableStyle(btn, true);
    }
    else {
        div.style.display = "none";

        SetButtonEnableStyle(btn, false);
    }

}

//重置地图
export function UiOnResetMap(map) {
    map.getView().setZoom(config.defaultzoom);
    map.getView().setCenter(config.mapcenter);

    UiOnClearMap(map);


}


//清理地图
export function UiOnClearMap(map) {

    // map.popupoverlay.getSource().clear();
    map.messureLayer.getSource().clear();
    map.selectedLayer.getSource().clear();
    map.MarkerLayer.getSource().clear();
    map.MarkerCircleLayer.getSource().clear();
    map.AddPointsLayer.getSource().clear();

    map.popupoverlay.setPosition(undefined);
    map.popupmsgoverlay.setPosition(undefined);

    map.regionlayer.getSource().clear();
    map.removeInteraction(map.drawregion);
    document.getElementById('divpumpdiagram').style.display = "none";
    if (map.interactionMarker.ison) {
        map.interactionMarker.ison = false;
        map.removeInteraction(map.interactionMarker);
    }
    if (map.interactionDistance.ison) {
        map.interactionDistance.ison = false;
        map.removeInteraction(map.interactionDistance);
    }
    if (map.interactionArea.ison) {
        map.interactionArea.ison = false;
        map.removeInteraction(map.interactionArea);
    }
    // document.getElementById('divPanel').style.display = "none";
    SetButtonEnableStyle(document.getElementById("menuDistance"), false);
    SetButtonEnableStyle(document.getElementById("menuArea"), false);
    SetButtonEnableStyle(document.getElementById("menuMapMarker"), false);
    SetButtonEnableStyle(document.getElementById("menuInfo"), false);

    let lblTable = document.getElementById("lblTable");
    lblTable.innerText = "查询信息列表";
    let divListTable = document.getElementById("divListTable");
    divListTable.innerHTML = "<p>--当前无查询结果</p>";
    let chkTable = document.getElementById("chkTable");
    chkTable.checked = false;
}

//显示隐藏图层
function UiOnLayerShowHide(e) {

    let LayerControlBox = document.getElementById("LayerControlBox");

    let menustatus = e.getAttribute("menustatus");

    // console.log(menustatus);

    if (menustatus == "true")
        menustatus = "false";
    else
        menustatus = "true";


    if (menustatus == "true") {
        LayerControlBox.style.visibility = "visible";
        SetButtonEnableStyle(e, true);
    }
    else {
        LayerControlBox.style.visibility = "hidden";
        SetButtonEnableStyle(e, false);

    }
}


//设置图层透明度
function onlayeropacitychange(range, mylayers) {
    let lm = range.getAttribute("layername");


    let layer = mylayers[lm];

    if (layer == null || layer == "undefined") return;
    let opacityvalue = range.value / 100.0;

    layer.setOpacity(opacityvalue);


}


//设置图层是否可见layername为显示选择框的value值，也为图层的stylename
function onlayervisible(layercheckbox, mylayers) {
    let lm = layercheckbox.getAttribute('layername');
    let layer = mylayers[lm];
    if (layer == null || layer == "undefined") return;
    let ckbstatus = layercheckbox.checked;
    layer.setVisible(ckbstatus);

}


//放大地图
function UiOnZoomIn(map) {
    let zoom = map.getView().getZoom();
    zoom += 1;
    map.getView().setZoom(zoom);
}
//缩小地图
function UiOnZoomOut(map) {
    let zoom = map.getView().getZoom();
    zoom -= 1;
    map.getView().setZoom(zoom);
}




function removeInteractions(map) {
    map.MarkerLayer.getSource().clear();
    map.messureLayer.getSource().clear();

    map.popupoverlay.setPosition(undefined);
    map.popupmsgoverlay.setPosition(undefined);

    //关闭交互操作  
    if (map.interactionDistance.ison) {
        map.removeInteraction(map.interactionDistance);
        map.interactionDistance.ison = false;
    }
    if (map.interactionMarker.ison) {
        map.removeInteraction(map.interactionMarker);
        map.interactionMarker.ison = false;
    }
    if (map.interactionArea.ison) {
        map.removeInteraction(map.interactionArea);
        map.interactionArea.ison = false;
    }

    SetButtonEnableStyle(document.getElementById("menuInfo"), false);

}

//测距
function UiOnDistance(map) {

    let btndist = document.getElementById("menuDistance");
    let btnarea = document.getElementById("menuArea");
    let btnMapMarker = document.getElementById("menuMapMarker");

    let distmenustatus = btndist.getAttribute("menustatus");

    // console.log(distmenustatus);

    //关闭交互操作  
    removeInteractions(map);

    if (distmenustatus == "true") {
        distmenustatus = "false";


        //设置按钮状态

        SetButtonEnableStyle(btndist, false);

    }
    else {
        distmenustatus = "true";


        //开启测距交互
        map.interactionDistance.ison = true;
        map.addInteraction(map.interactionDistance);

        //设置测面按钮状态
        SetButtonEnableStyle(btndist, true);
        SetButtonEnableStyle(btnarea, false);
        SetButtonEnableStyle(btnMapMarker, false);

    }

}

//测面积
function UiOnArea(map) {

    let btndist = document.getElementById("menuDistance");
    let btnarea = document.getElementById("menuArea");
    let btnMapMarker = document.getElementById("menuMapMarker");

    let areamenustatus = btnarea.getAttribute("menustatus");

    //关闭交互操作  
    removeInteractions(map);

    if (areamenustatus == "true") {
        areamenustatus = "false";

        //设置按钮状态
        SetButtonEnableStyle(btnarea, false);;


    }
    else {
        areamenustatus = "true";


        //开启测距交互
        map.interactionArea.ison = true;
        map.addInteraction(map.interactionArea);

        //设置测面按钮状态


        SetButtonEnableStyle(btndist, false);
        SetButtonEnableStyle(btnarea, true);
        SetButtonEnableStyle(btnMapMarker, false);

    }
}

function menuSearchComplex_onclick() {

    let menuSearchComplex = document.getElementById("menuSearchComplex");
    let menuSearch = document.getElementById("menuSearch");
    let menupump = document.getElementById("menupump");
    let menustatus = menuSearchComplex.getAttribute("menustatus");



    let e = document.getElementById("divInput");
    let es = document.getElementById("divSearchContent");

    let complexpanel = document.getElementById("divSearchComplex");
    let divpump = document.getElementById("divpump");
    let divPanel = document.getElementById('divPanel');

    if (menustatus == "true")
        menustatus = "false";
    else
        menustatus = "true";

    if (menustatus == "true") {
        SetButtonEnableStyle(menuSearchComplex, true);
        complexpanel.style.display = "block";
        SetButtonEnableStyle(menuSearch, false);
        SetButtonEnableStyle(menupump, false);
        e.style.display = 'none';
        es.style.display = 'none';
        divpump.style.display = 'none';
        divPanel.style.display = "block";
    }
    else {
        SetButtonEnableStyle(menuSearchComplex, false);
        complexpanel.style.display = 'none';
        divPanel.style.display = 'none';

    }
}

function UiOnViewPump(map) {
    let menupump = document.getElementById("menupump");
    let menuSearchComplex = document.getElementById("menuSearchComplex");
    let menuSearch = document.getElementById("menuSearch");

    let divpump = document.getElementById("divpump");
    let divInput = document.getElementById("divInput");
    let divSearchContents = document.getElementById("divSearchContent");
    let divSearchComplex = document.getElementById("divSearchComplex");

    let menustatus = menupump.getAttribute("menustatus");
    if (menustatus == "true")
        menustatus = "false";
    else
        menustatus = "true";

    if (menustatus == "true") {

        SetButtonEnableStyle(menupump, true);
        SetButtonEnableStyle(menuSearch, false);
        SetButtonEnableStyle(menuSearchComplex, false);
        divpump.style.display = "block";
        divSearchComplex.style.display = "none";
        divInput.style.display = "none";
        divSearchContents.style.display = "none";

        Initdivpumptree(map);


    }
    else {
        SetButtonEnableStyle(menupump, false);
        divpump.style.display = 'none';

    }

}

function Initdivpumptree(map) {
    let divpumptree = document.getElementById("divpumptree");
    divpumptree.innerHTML = "";
    let layer = map.mylayers["pumproom"];
    let features = layer.getSource().getFeatures();
    let owner1 = "武昌校区";
    let owner2 = "流芳校区";
    let pumps1 = []
    let pumps2 = []

    for (let i = 0, len = features.length; i < len; i++) {
        let feature = features[i];
        let properties = feature.getProperties();
        let pump = { fid: feature.getId(), objectid: properties["objectid"], name: properties["name"], owner: properties["owner"], category: properties["category"], pression: properties["pression"] }
        if (pump.owner == owner1)
            pumps1.push(pump);
        else
            pumps2.push(pump);
    }
    pumps1.sort((a, b) => { return a.objectid - b.objectid });
    pumps2.sort((a, b) => { return a.objectid - b.objectid });

    console.log(pumps1);
    console.log(pumps2);

    let ul1 = createUlByPumps(owner1, pumps1, map);
    divpumptree.appendChild(ul1);
    let ul2 = createUlByPumps(owner2, pumps2, map);
    divpumptree.appendChild(ul2);

    let fid = pumps1[0]["fid"];
    callpumpinfo(map, fid, showpumpinfo);




}

function createUlByPumps(owner1, pumps1, map) {
    let ul = document.createElement("ul");
    let li1 = document.createElement("li");
    li1.innerText = owner1;
    let ul11 = document.createElement("ul");

    for (let i = 0; i < pumps1.length; i++) {
        let lipump = document.createElement("li");
        // lipump.innerHTML = pumps1[i].name;
        let pumptitle = "[" + pumps1[i].category + "] " + pumps1[i].name
        lipump.appendChild(Createhrefofli(pumptitle, pumps1[i].fid, map));
        ul11.appendChild(lipump);
    }
    li1.appendChild(ul11);
    ul.appendChild(li1);
    return ul;
}


function Createhrefofli(name, featureid, map) {
    var hrefa = document.createElement("a");
    hrefa.setAttribute('href', 'javascript:void(0);');
    var text = document.createTextNode(name);
    hrefa.appendChild(text);
    // hrefa.onclick = function (event) {
    //     // showpumpinfo(featureid, map);
    //     LocationByFeatureIDCallback(map, featureid, showpumpinfo)
    //     let divpumpdiagram = document.getElementById("divpumpdiagram");
    //     divpumpdiagram.style.display = "none";
    //     divpumpdiagram.innerHTML = "";
    // };
    hrefa.onclick = function (event) { callpumpinfo(map, featureid, showpumpinfo); };
    return hrefa;
}

function callpumpinfo(map, featureid, showpumpinfo) {
    LocationByFeatureIDCallback(map, featureid, showpumpinfo)
    let divpumpdiagram = document.getElementById("divpumpdiagram");
    divpumpdiagram.style.display = "none";
    divpumpdiagram.innerHTML = "";
}

function showpumpinfo(feature) {

    let legendpump = document.getElementById("legendpump");
    let divpumpinfo = document.getElementById("divpumpinfo");

    divpumpinfo.innerHTML = "";

    let properties = feature.getProperties();

    let wfslayer = GetWfsLayer("pumproom");
    let msg = "<table  class='pumpinfotable' width='310' border='0' cellspacing='0' cellpadding='0'><tbody>";
    for (let keyv in wfslayer.fields) {
        let content = "-";
        let fieldvalue = properties[keyv];
        if (fieldvalue != undefined && fieldvalue != null && fieldvalue != "") {
            content = GetFieldContent(fieldvalue);
        }
        msg += "<tr><td>" + wfslayer.fields[keyv] + "&nbsp; &nbsp; </td>" + "<td>" + content + "</td></tr>"
    }
    msg += "</tbody><table>"
    divpumpinfo.innerHTML += msg;

    var hrefa = document.createElement("a");
    hrefa.setAttribute('href', 'javascript:void(0);');
    var text = document.createTextNode("查看泵房系统图");
    hrefa.setAttribute("tooltip", "双击泵房系统图关闭")

    hrefa.appendChild(text);
    hrefa.onclick = function (event) {
        let divpumpdiagram = document.getElementById("divpumpdiagram");
        divpumpdiagram.style.display = "inline-block";
        divpumpdiagram.innerHTML = "";
        let img = new Image();
        img.src = properties["diagram"];
        img.style.width = "100%";
        img.style.height = "99.5%";
        divpumpdiagram.appendChild(img);

    };
    let divpumpdiagramcommand = document.getElementById("divpumpdiagramcommand");
    divpumpdiagramcommand.innerHTML = "";
    divpumpdiagramcommand.appendChild(hrefa);
}

function UiOnViewSearch() {
    let menupump = document.getElementById("menupump");
    let menuSearchComplex = document.getElementById("menuSearchComplex");
    let menuSearch = document.getElementById("menuSearch");

    let menustatus = menuSearch.getAttribute("menustatus");

    let e = document.getElementById("divInput");
    let es = document.getElementById("divSearchContent");
    let complexpanel = document.getElementById("divSearchComplex");

    let divpump = document.getElementById("divpump");

    if (menustatus == "true")
        menustatus = "false";
    else
        menustatus = "true";

    if (menustatus == "true") {
        SetButtonEnableStyle(menuSearch, true);
        e.style.display = "block";

        SetButtonEnableStyle(menuSearchComplex, false);
        complexpanel.style.display = "none";
        SetButtonEnableStyle(menupump, false);
        divpump.style.display = "none";

    }
    else {
        SetButtonEnableStyle(menuSearch, false);
        e.style.display = 'none';
        es.style.display = 'none';
    }
}




function UiOnMapMarker(map) {

    let btndist = document.getElementById("menuDistance");
    let btnarea = document.getElementById("menuArea");
    let btnMapMarker = document.getElementById("menuMapMarker");

    let menustatus = btnMapMarker.getAttribute("menustatus");
    // UiOnClearMap(map);
    removeInteractions(map);

    menustatus = (menustatus == "true") ? "false" : "true";

    if (menustatus == "true") {

        map.addInteraction(map.interactionMarker);
        map.interactionMarker.ison = true;

        SetButtonEnableStyle(btnarea, false);
        SetButtonEnableStyle(btndist, false);
        SetButtonEnableStyle(btnMapMarker, true);
    }
    else {
        SetButtonEnableStyle(btnMapMarker, false);

    }
}


//设置信息显示状态e为按钮
function UiOnInfo(map) {
    let e = document.getElementById("menuInfo");
    let menustatus = e.getAttribute("menustatus");

    if (menustatus == "true") {
        menustatus = "false";
        // map.ShowInfo = false;
        SetButtonEnableStyle(e, false);
        // console.log(map.ShowInfo);

    }
    else {
        UiOnClearMap(map)
        menustatus = "true";
        // map.ShowInfo = true;
        SetButtonEnableStyle(e, true);
        map.popupoverlay.popupcontent.innerHTML = "";
        // console.log(map.ShowInfo);
    }

}

function UiOnAnsyShowHide(map) {

    let e = document.getElementById("menuAnsy");
    let AnsyControlBox = document.getElementById("AnsyControlBox");

    let menustatus = e.getAttribute("menustatus");

    // console.log(menustatus);

    if (menustatus == "true") {
        menustatus = "false";
    }
    else {
        menustatus = "true";
    }

    if (menustatus == "true") {
        AnsyControlBox.style.visibility = "visible";
        SetButtonEnableStyle(e, true);
        let zl = 18;
        let buildinglayer = GetWfsLayer("building");
        let pipelayer = GetWfsLayer("js_pipe");
        let pointlayer = GetWfsLayer("js_point");
        // console.log(pipelayer);

        let zlbuilding = buildinglayer.MinZoom;
        let zlpipe = pipelayer.MinZoom;
        let zlpoint = pointlayer.MinZoom;
        zl = zlbuilding > zlpipe ? zlbuilding : zlpipe;
        if (zl < zlpoint) zl = zlpoint;


        map.getView().setZoom(zl + 0.5);

        document.getElementById('divPanel').style.display = "block";

    }
    else {
        AnsyControlBox.style.visibility = "hidden";
        SetButtonEnableStyle(e, false);
        document.getElementById('divPanel').style.display = "none";
    }
}


function GetwfsFeatureUrlByFeatureID(layername, featureid) {
    let url = config.wfsurl + "?service=WFS&version=1.0.0&request=GetFeature&typeName=" + config.Mapworkspace +
        "%3A" + layername + "&maxFeatures=50&&outputFormat=application%2Fjson&featureid=" + featureid;
    return url;
}
// let myfs;
//默认选择建筑FeatureID进行查询，列出查询结果
function UiOnSearch(map) {
    // document.getElementById("divSearchResult").innerHTML = "";
    map.selectedLayer.getSource().clear();
    map.removeInteraction(map.drawregion);
    let divListTable = document.getElementById("divListTable");
    divListTable.innerHTML = "";

    let searchtext = document.getElementById("tbxSearch").value;

    if (searchtext == undefined || searchtext == null || searchtext == "") return;


    let obj = document.getElementById("lstSelectlayers");
    let selectedlayername = obj.options[obj.selectedIndex].value;
    if (selectedlayername == undefined || selectedlayername == null || selectedlayername == "") return;
    // console.log(selectedlayername);
    let fobj = document.getElementById("lstSelectFields");
    let selectField = fobj.options[fobj.selectedIndex].value;
    if (selectField == undefined || selectField == null || selectField == "") return;
    // console.log(selectField);
    let querycontent = "";
    if (selectField == "FeatureID") {
        let r = /^\+?[1-9][0-9]*$/;　　//正整数 
        let flag = r.test(searchtext);
        if (!flag) return;
        querycontent = selectedlayername + "." + searchtext;

        let url = GetwfsFeatureUrlByFeatureID(selectedlayername, querycontent);
        console.log(url);
        fetch(url).then(function (response) {
            return response.json()   //执行成功第一步 
        }).then(function (json) {
            var features = new GeoJSON().readFeatures(json);

            selectAndMarkFeaturesFirst(map, features);
            // getFeaturesSearchResultTable(map, features);
            getFeaturesListtTable(map, selectedlayername, features);
        }).catch((e) => { selectedLayer.getSource().clear(); });


    }
    else {

        //属性过滤
        // let fieldfilter = filterlike(selectField, '*' + searchtext + '*');
        let fieldfilter = filterequalTo(selectField, searchtext);
        var filter = fieldfilter;
        let radiovalue = getSelectRadio();
        // console.log(radiovalue);

        if (radiovalue == "RegionMap") {
            filter = fieldfilter;
        }
        else {

            let fs = map.regionlayer.getSource().getFeatures();
            if (fs == undefined || fs.length < 1) {
                alert("请在地图指定查询的范围！")
                return;
            }
            let lastf = fs[fs.length - 1];
            let geometry = lastf.getGeometry();

            //范围过滤
            var spacialfilter = filterwithin('geom', geometry);
            filter = filterand(fieldfilter, spacialfilter);

        }


        //通过属性和值查询要素
        let featureRequest = new WFS().writeGetFeature({
            srsName: config.MapsrsName,
            featureNS: config.Mapnamespace, //必须与geoserver对应工作区的NameSpace一致
            featurePrefix: config.Mapworkspace,
            featureTypes: [selectedlayername],
            outputFormat: 'application/json',
            filter: filter
        });

        fetch(config.wfsurl, {
            method: 'POST',
            body: new XMLSerializer().serializeToString(featureRequest)
        }).then(function (response) {

            return response.json();
        }).then(function (json) {
            let features = new GeoJSON().readFeatures(json);

            selectAndMarkFeaturesFirst(map, features);
            // getFeaturesSearchResultTable(map, features);
            getFeaturesListtTable(map, selectedlayername, features);

        }).catch((e) => { map.selectedLayer.getSource().clear(); });
    }
}

function getSelectRadio() {
    var radio = document.getElementsByName("MapRegion");
    for (let i = 0; i < radio.length; i++) {
        if (radio[i].checked) return radio[i].value;
    }
    return "";
}

//选择并定位要素集中的第一个
function selectAndMarkFeaturesFirst(map, features) {
    // map.selectedLayer.getSource().clear();
    map.MarkerLayer.getSource().clear();


    if (features == undefined || features == null || features.length < 1) return
    let f = features[0];
    // map.selectedLayer.getSource().addFeature(f);
    // console.log(f);
    let extent = f.getGeometry().getExtent();
    // console.log(extent);
    let center = getCenter(extent);
    // console.log(center);
    let iconFeature = new Feature({ geometry: new Point(center, "XY") });
    map.MarkerLayer.getSource().addFeature(iconFeature);

    let view = map.getView();
    view.fit(map.MarkerLayer.getSource().getExtent());
    view.setZoom(20);
}

function getFeaturesListtTable(map, selectedlayername, features) {

    let chkTable = document.getElementById("chkTable");
    chkTable.checked = true;
    let lblTable = document.getElementById("lblTable");

    let wfslayer = GetWfsLayer(selectedlayername);

    lblTable.innerText = wfslayer.chinesename + "查询结果列表";


    let divListTable = document.getElementById("divListTable");
    divListTable.innerHTML = "";
    let listtable = CreateListTableWithHeader(wfslayer.fields, true);

    listtable = ListTableWriteFeatures(listtable, features, wfslayer.fields, true, map);

    divListTable.appendChild(listtable);
    return listtable;

}
//将选择的要素集合显示到查询结果列表（divSearchResult）
function getFeaturesSearchResultTable(map, features) {

    let divSearchResultelement = document.getElementById("divSearchResult");
    divSearchResultelement.innerHTML = "";

    for (let i = 0; i < features.length; i++) {

        let properties = features[i].getProperties();

        let layerfid = features[i].getId();

        let a = document.createElement('a');
        a.setAttribute('href', "javascript:void(0)");
        a.setAttribute("FeatureID", layerfid);
        a.style.display = "block";
        let no = i + 1;
        let msg = "<div class='markerno'>" + no + "</div>";
        if (properties["Name"])
            msg += '<span>' + properties["Name"] + '&nbsp;</span>'
        if (properties["Category"])
            msg += '<span>' + properties["Category"] + '&nbsp;</span>'
        if (properties["Spec"])
            msg += '<span>' + properties["Spec"] + '&nbsp;</span>'
        if (properties["LineID"])
            msg += '<span>' + properties["LineID"] + '&nbsp;</span>'
        msg += '<span>[' + layerfid + ']</span>'
        a.innerHTML = msg;
        divSearchResultelement.appendChild(a);

        a.onclick = function () { locationByALable(this, map); };

    }
}

function locationByALable(a, map) {
    let fid = a.getAttribute("FeatureID");

    if (fid == undefined) return;

    LocationByFeatureID(map, fid);
}

function LocationByFeatureIDCallback(map, layerfeatureid, callback) {
    if (!IsIncludeStrings(layerfeatureid, ['.'])) return null;

    var words = layerfeatureid.split('.');
    let layername = words[0];
    let featureid = words[1];

    // map.selectedLayer.getSource().clear();
    map.MarkerLayer.getSource().clear();

    let url = GetwfsFeatureUrlByFeatureID(layername, layerfeatureid);


    fetch(url).then(function (response) {
        return response.json()   //执行成功第一步 
    }).then(function (json) {

        let fs = new GeoJSON().readFeatures(json);

        selectAndMarkFeaturesFirst(map, fs);
        callback(fs[0]);

    }).catch((e) => {
        // map.selectedLayer.getSource().clear();
        map.MarkerLayer.getSource().clear();
    });


}
export function LocationByFeatureID(map, layerfeatureid) {
    if (!IsIncludeStrings(layerfeatureid, ['.'])) return null;

    var words = layerfeatureid.split('.');
    let layername = words[0];
    let featureid = words[1];

    // map.selectedLayer.getSource().clear();
    map.MarkerLayer.getSource().clear();

    let url = GetwfsFeatureUrlByFeatureID(layername, layerfeatureid);


    fetch(url).then(function (response) {
        return response.json()   //执行成功第一步 
    }).then(function (json) {

        let fs = new GeoJSON().readFeatures(json);

        selectAndMarkFeaturesFirst(map, fs);
        map.MapSelectedFeature = fs[0];
        console.log("zhao");
        console.log(fs[0]);
        map.MapSelectedFeatureID = fs[0].getId();


    }).catch((e) => {

        // map.selectedLayer.getSource().clear();
        map.MarkerLayer.getSource().clear();
    });


}

// //加载js_topo数据
// function loaddata_js_topo(map) {
//     let featureRequest = new WFS().writeGetFeature({
//         srsName: config.MapsrsName,
//         featureNS: config.Mapnamespace, //必须与geoserver对应工作区的NameSpace一致
//         featurePrefix: config.Mapworkspace,
//         featureTypes: ['js_topo'],
//         outputFormat: 'application/json',

//     });
//     // console.log("加载拓扑数据");
//     // console.log(config.Mapworkspace);
//     // console.log('js_topo');

//     fetch(config.wfsurl, {
//         method: 'POST',
//         body: new XMLSerializer().serializeToString(featureRequest)
//     }).then(function (response) {

//         return response.json();
//     }).then(function (json) {
//         //加载给水拓扑数据
//         let features = new GeoJSON().readFeatures(json);
//         map.jstopos = features;
//         map.jstoposloaded = true;


//         // console.log(map.jstopos);
//         return features;


//     }).catch((e) => { return null });
// }



//关阀分析


function btnCloseValve_Click(map) {
    // if (!map.jstoposloaded) { alert("管网拓扑未加载完成，请稍后再操作!"); return; }
    document.getElementById("divListTable").innerHTML = "";

    let brokenpipeoidlist = getbrokenpipeoidlist();
    // console.log(brokenpipeoidlist);close

    //创建拓扑

    let WaterNet = CreateWaterNet();
    // let jspipelayer = map.mylayers['js_pipe'];
    let jspipelayer = map.mylayers[config.toposetting.pipelayername];

    // let jspointlayer = map.mylayers['js_point'];
    let jspointlayer = map.mylayers[config.toposetting.nodelayername];

    let jspipefeatures = jspipelayer.getSource().getFeatures();
    let jspointfeatues = jspointlayer.getSource().getFeatures();

    // console.log("管线和管点长度");
    // console.log(jspipefeatures);
    // console.log(jspointfeatues);


    if (jspipefeatures.length < 1 || jspointfeatues.length < 1) {
        alert("运行关阀停水分析前，请放大地图加载显示管点管线图层！");
        return;
    }


    WaterNet.initializedata(jspipefeatures, jspointfeatues, brokenpipeoidlist);
    // console.log(WaterNet.WaterNodes);
    // console.log(brokenpipeoidlist);

    WaterNet.AnalysisCloseValves();
    WriteClosevalvesInTable(map, WaterNet.MustCloseValves, WaterNet.NotToCloseValves);

    // console.log(WaterNet.MustCloseValves);
    // console.log(WaterNet.NotToCloseValves);

    showMustCloseValveInMarkLayer(map, WaterNet.MustCloseValves);




}

function showMustCloseValveInMarkLayer(map, MustCloseValves) {
    map.MarkerLayer.getSource().clear();
    let jspointlayer = map.mylayers['js_point'];
    let jspointfeatues = jspointlayer.getSource().getFeatures();

    //从地图给水管点要素中获取必须关闭阀门管点集合 
    for (let i = 0, len = jspointfeatues.length; i < len; i++) {
        let feature = jspointfeatues[i];
        let properties = feature.getProperties();
        let fid = feature.getId();
        // let label = properties["label"];
        // let oid = properties["fid"];

        let fk = MustCloseValves.findIndex(e => e.fid === fid);
        if (fk > -1) {
            map.MarkerLayer.getSource().addFeature(feature);
        }

    }
}
//停水（含关阀）分析
function btnAnsyNoWater_Click(map) {
    // if (!map.jstoposloaded) { alert("管网拓扑未加载完成，请稍后再操作!"); return; }
    // console.log("停水分析");
    let brokenpipeoidlist = getbrokenpipeoidlist();
    // console.log(brokenpipeoidlist);

    //创建管网（拓扑分析）对象 
    let WaterNet = CreateWaterNet();

    //初始化数据--可添加点线分析工具，判断点不在拓扑集合中（孤点）、线的端点不在点集中的情况（不合理的线）、无水源点等情况。孤岛管道交给停水分析

    // let jspipelayer = map.mylayers['js_pipe'];
    let jspipelayer = map.mylayers[config.toposetting.pipelayername];

    // let jspointlayer = map.mylayers['js_point'];
    let jspointlayer = map.mylayers[config.toposetting.nodelayername];

    let jspipefeatures = jspipelayer.getSource().getFeatures();
    let jspointfeatues = jspointlayer.getSource().getFeatures();

    WaterNet.initializedata(jspipefeatures, jspointfeatues, brokenpipeoidlist);

    //停水（含关阀）分析
    WaterNet.AnalysisNoWater();

    //将关阀（必关阀门和应关阀门）结果写入面板列表
    WriteClosevalvesInTable(map, WaterNet.MustCloseValves, WaterNet.NotToCloseValves);
    // console.log('jspointfeatues');
    // console.log(jspointfeatues);
    // console.log('NoWaterNodes');
    // console.log(WaterNet.NoWaterNodes);
    // console.log(WaterNet.NoWaterPipes);

    //WaterNet.NoWaterPipes中的对象为feature对象。在地图中绘制feature，高亮显示无水管线，
    //再用js空间分析库——JSTS和Turf,分析和无水管线要素相交的建筑

    map.selectedLayer.getSource().clear();
    // let olReference = ol;
    // let geometryFactory = new jsts.geom.GeometryFactory();
    // var parser = new jsts.io.OL3Parser(geometryFactory, olReference);

    // parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon);


    // let parser = new jsts.io.OL3Parser();
    // parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection);

    // let buildinglayer = map.mylayers['building'];
    let buildinglayer = map.mylayers[config.toposetting.buildinglayername];
    let buildingfeatures = buildinglayer.getSource().getFeatures();

    // console.log(buildingfeatures);

    let NoWaterBuilds = [];

    let nowaterbuildfidlist = [];
    // console.log(buildingfeatures);
    // console.log(WaterNet.NoWaterNodes);

    for (let i = 0, len = buildingfeatures.length; i < len; i++) {
        let fbuild = buildingfeatures[i];
        let fbproperties = fbuild.getProperties();
        // let fboid = parseInt(fbproperties["fid"]);
        let fboid = fbuild.getId();
        let fgeo = fbuild.getGeometry();

        // let fgeo = fbuild.getGeometry().clone();
        // fgeo.transform('EPSG:4326', 'EPSG:3857');

        // let gbuild = parser.read(fgeo);

        // console.log('fbuild');
        // console.log(fbuild);
        // console.log('fgeo');
        // console.log(fgeo);
        // console.log('gbuild');
        // console.log(gbuild);
        if (fgeo == undefined) continue;
        if (nowaterbuildfidlist.findIndex(p => p == fboid) >= 0) continue;


        for (let j = 0, lenj = jspointfeatues.length; j < lenj; j++) {
            let fnode = jspointfeatues[j];
            // let fnproperties = fnode.getProperties();
            // let oid = parseInt(fnproperties["fid"]);
            // if (WaterNet.NoWaterNodes.findIndex(p => p.fid === oid) < 0) continue;

            let oid = fnode.getId();
            if (WaterNet.NoWaterNodes.findIndex(p => p.fid === oid) < 0) continue;

            let coordinate = getCenter(fnode.getGeometry().getExtent());
            // console.log(fnode);
            // console.log(coordinate);
            // if (fgeo == undefined){
            //      console.log("fgeo找不到"); 
            //      console.log(fbuild);
            // }

            if (coordinate == undefined) continue;


            if (fgeo.intersectsCoordinate(coordinate)) {
                // console.log('fboid:'+fboid);
                // console.log(" -- oid: "+oid); 

                if (nowaterbuildfidlist.findIndex(p => p == fboid) < 0) {
                    nowaterbuildfidlist.push(fboid);
                    NoWaterBuilds.push(fbuild);
                    map.selectedLayer.getSource().addFeature(fbuild);
                    break;
                }
            }
        }
    }
    // console.log("NoWaterPipes：");
    // console.log(WaterNet.NoWaterPipes);
    for (let i = 0, len = WaterNet.NoWaterPipes.length; i < len; i++) {
        let f = WaterNet.NoWaterPipes[i];
        map.selectedLayer.getSource().addFeature(f);
    }


    // console.log(NoWaterBuilds);

    let chkTable = document.getElementById("chkTable");
    chkTable.checked = true;
    let lblTable = document.getElementById("lblTable");
    lblTable.innerText = "停水建筑列表";

    let wfslayer = GetWfsLayer("building");
    // let headertb = writeListTableHeader(wfslayer.fields, true);
    // let contentb = WriteFeaturesInListTable(NoWaterBuilds, wfslayer.fields, true, map);
    let divListTable = document.getElementById("divListTable");
    divListTable.innerHTML = "";
    let listtable = CreateListTableWithHeader(wfslayer.fields, true);

    listtable = ListTableWriteFeatures(listtable, NoWaterBuilds, wfslayer.fields, true, map);
    divListTable.appendChild(listtable);


}


//高亮显示故障管线
function btnhightpipelist_onclick(map) {
    let brokenpipefidlist = getbrokenpipeoidlist();

    map.selectedLayer.getSource().clear();

    let jspipelayer = map.mylayers[config.toposetting.pipelayername];

    let jspipefeatures = jspipelayer.getSource().getFeatures();

    for (let i = 0, len = jspipefeatures.length; i < len; i++) {
        let f = jspipefeatures[i];
        let fid = f.getId();
        if (brokenpipefidlist.find(e => e == fid)) {
            map.selectedLayer.getSource().addFeature(f)
        }
    }
}
function SaveTableToCsv() {
    let div = document.getElementById("divListTable");
    let table = div.children[0];

    if (table.nodeName != "TABLE") {
        alert("列表为空，无法导出数据！");
        return;
    }

    let csv = getCSVfromTable(table);

    let filename = 'export' + getdateformat(new Date()) + '.csv';

    downloadCSV(csv, filename);

}

//创建带表头的表格，样式类固定为btlist-Table，在CSS中定义
export function CreateListTableWithHeader(fields, isWithRowNumber) {
    let tb = document.createElement('table');
    tb.setAttribute("class", "btlist-Table");

    //表头

    if (isWithRowNumber) {
        let thead = document.createElement("thead");
        let tr = document.createElement("tr");
        //序号
        let th = document.createElement("th");
        th.innerText = '序号';
        th.setAttribute("style", "min-width: 30px;width: 30px;");
        tr.appendChild(th);
        //FID 
        let fidth = document.createElement("th");
        fidth.innerText = 'FID';
        // fidth.setAttribute("style", "width: 30px;");
        tr.appendChild(fidth);

        //其它字段
        for (let i in fields) {
            let field = fields[i];
            let td = document.createElement("th");
            td.innerText = field;
            td.setAttribute("style", "min-width: 60px;");
            tr.appendChild(td);
        }
        thead.appendChild(tr);
        tb.appendChild(thead);
    }
    return tb;

}

export function ListTableWriteFeatures(table, features, fields, isWithRowNumber, map) {
    let tb = table;
    let by = document.createElement("tbody");
    for (let i = 0, len = features.length; i < len; i++) {
        let feature = features[i];
        let properties = feature.getProperties();
        let tr = document.createElement("tr");
        //序号列
        if (isWithRowNumber) {
            let tdno = CreateListTableTextTd(i + 1);
            tr.appendChild(tdno);
        }
        //要素id列 
        let tdfid = CreateListTableHrefTd(feature.getId(), map);
        tr.appendChild(tdfid);

        //要素各属性列
        for (let key in fields) {
            let celltext = properties[key];
            // console.log(celltext);
            celltext = GetFieldContent(celltext);
            // console.log(celltext);
            let td = CreateListTableTextTd(celltext);
            // console.log(td);
            tr.appendChild(td);

        }
        by.appendChild(tr);
        // console.log(by);
    }
    tb.appendChild(by);
    // console.log(tb);
    return tb;
}

function CreateListTableTextTd(content) {
    let td = document.createElement("td");
    td.innerText = content;
    return td;
}

function CreateListTableHrefTd(content, map) {
    let featureid = content;
    var td = document.createElement("td");
    var td_a = document.createElement("a");
    td_a.setAttribute('href', 'javascript:void(0);');
    var text = document.createTextNode(featureid);
    td_a.appendChild(text);
    td_a.onclick = function (event) {
        LocationByFeatureID(map, featureid)
    };
    td.appendChild(td_a);
    return td;
}


function WriteClosevalvesInTable(map, MustCloseValves, NotToCloseValves) {

    let jspointlayer = map.mylayers['js_point'];
    let jspointfeatues = jspointlayer.getSource().getFeatures();

    //从地图给水管点要素中获取关闭阀门管点集合
    let closevalves = [];
    for (let i = 0, len = jspointfeatues.length; i < len; i++) {
        let feature = jspointfeatues[i];
        let properties = feature.getProperties();
        let fid = feature.getId();
        let label = properties["label"];


        let fk = MustCloseValves.findIndex(e => e.fid === fid);
        if (fk > -1) {
            let vv = { fid: fid, label: label, fid: fid, closestatus: 0 };
            closevalves.push(vv);
        }
        let fn = NotToCloseValves.findIndex(e => e.fid === fid);
        if (fn > -1) {
            let vv = { fid: fid, label: label, fid: fid, closestatus: 1 };
            closevalves.push(vv);
        }
    }

    //排序，必关阀门（标记为0）在前，可不关阀门（标记为1）在后
    closevalves = closevalves.sort(sortExp("closestatus", true));
    // console.log(closevalves);

    var tb = document.getElementById("tbdAnsyCloseValve");
    tb.innerHTML = "";

    for (let i = 0, len = closevalves.length; i < len; i++) {
        let v = closevalves[i];
        let msg = v.closestatus == 0 ? "必关阀门" : "可不关阀门"
        let tr = WriteClosevalveInTablerow(map, i + 1, v.fid, v.label, msg);
        tb.appendChild(tr);
    }
}

function WriteClosevalveInTablerow(map, i, fid, fname, desc) {

    var tr = document.createElement("tr");
    var tdno = document.createElement("td");
    tdno.innerHTML = '<div class="datagrid-cell cell-c0"><span>' + i + '</span></div>'


    let featureid = fid;

    var tdfeatureid = document.createElement("td");

    var tdfeatureid_div = document.createElement("div");
    tdfeatureid_div.className = "datagrid-cell cell-c1";
    var tdfeatureid_div_span = document.createElement("span");
    var tdfeatureid_div_span_a = document.createElement("a");
    tdfeatureid_div_span_a.setAttribute('href', 'javascript:void(0);');
    var text = document.createTextNode(featureid);
    tdfeatureid_div_span_a.appendChild(text);
    tdfeatureid_div_span_a.onclick = function (event) {
        LocationByFeatureID(map, featureid)
    };

    tdfeatureid_div_span.appendChild(tdfeatureid_div_span_a);
    tdfeatureid_div.appendChild(tdfeatureid_div_span);
    tdfeatureid.appendChild(tdfeatureid_div);



    var tdfeaturename = document.createElement("td");
    tdfeaturename.innerHTML = ' <div class="datagrid-cell cell-c2"><span><a>' + fname + '</a></span></div>'

    var tdfeaturedesc = document.createElement("td");
    tdfeaturedesc.innerHTML = ' <div class="datagrid-cell cell-c3"><span><a>' + desc + '</a></span></div>'

    tr.appendChild(tdno);
    tr.appendChild(tdfeatureid);
    tr.appendChild(tdfeaturename);
    tr.appendChild(tdfeaturedesc);

    return tr;

}

function getbrokenpipeoidlist() {

    var brokenpipeoidlist = [];
    //判断是否已经包含该管线
    var cks = document.getElementsByName("chkAnsyPipes");
    var count = cks.length;
    for (var i = 0; i < count; i++) {
        let fid = cks[i].getAttribute("fid");
        var ischecked = cks[i].checked;
        if (ischecked)
            // brokenpipeoidlist.push(parseInt(fid));
            brokenpipeoidlist.push(fid);
    }
    return brokenpipeoidlist;
}

//添加故障管线到列表
function btnAnsyAddPipe_Click(map) {


    if (map.MapSelectedFeature == null) {
        alert("请在地图中选择故障给水管线！");
        return;
    }

    document.getElementById("divListTable").innerHTML = "";
    document.getElementById("tbdAnsyCloseValve").innerHTML = "";
    map.selectedLayer.getSource().clear();
    map.MarkerLayer.getSource().clear();

    var pipelayername = 'js_pipe';

    var feature = map.MapSelectedFeature;

    let properties = feature.getProperties();

    var fid = feature.getId();

    if (fid.search(pipelayername) < 0) {
        alert("\n所选择要素非给水管线，请在地图中选择故障给水管线！");
        return;
    }

    //判断是否已经包含该管线
    var cks = document.getElementsByName("chkAnsyPipes");
    var count = cks.length;

    for (var i = 0; i < count; i++) {
        if (cks[i].getAttribute("fid") == fid) {
            alert("\n列表中已经包含所选给水管线！");
            return;
        }
    }

    // console.log(feature);

    var featurename = properties["lineid"];
    var featuredesc = properties["label"];
    // var featurefid =featureid;

    var t = document.getElementById("tbdAnsyPipe");
    var tr = document.createElement("tr");


    var tdchk = document.createElement("td");
    var tdchk_input = document.createElement("input");
    tdchk_input.setAttribute("class", "datagrid-cell cell-c0");
    tdchk_input.setAttribute("type", "checkbox");
    tdchk_input.setAttribute("name", 'chkAnsyPipes');
    tdchk_input.setAttribute("fid", fid);
    // tdchk_input.setAttribute("fid", featurefid);     //拓扑线fid与给水管线fid一致


    var chk = document.getElementById("chkAnsyAll");

    var ischecked = chk.checked;
    if (ischecked)
        tdchk_input.checked = true;
    else
        tdchk_input.checked = false;
    tdchk.appendChild(tdchk_input);



    var tdfeatureid = document.createElement("td");

    var tdfeatureid_div = document.createElement("div");
    tdfeatureid_div.className = "datagrid-cell cell-c1";
    var tdfeatureid_div_span = document.createElement("span");
    var tdfeatureid_div_span_a = document.createElement("a");
    tdfeatureid_div_span_a.setAttribute('href', 'javascript:void(0);');
    var text = document.createTextNode(fid);
    tdfeatureid_div_span_a.appendChild(text);
    tdfeatureid_div_span_a.onclick = function (event) {
        LocationByFeatureID(map, fid)
    };

    tdfeatureid_div_span.appendChild(tdfeatureid_div_span_a);
    tdfeatureid_div.appendChild(tdfeatureid_div_span);
    tdfeatureid.appendChild(tdfeatureid_div);



    var tdfeaturename = document.createElement("td");
    tdfeaturename.innerHTML = ' <div class="datagrid-cell cell-c2"><span><a>' + featurename + '</a></span></div>'

    var tdfeaturedesc = document.createElement("td");
    tdfeaturedesc.innerHTML = ' <div class="datagrid-cell cell-c3"><span><a>' + featuredesc + '</a></span></div>'



    tr.appendChild(tdchk);
    tr.appendChild(tdfeatureid);
    tr.appendChild(tdfeaturename);
    tr.appendChild(tdfeaturedesc);

    t.appendChild(tr);

}
//从列表移除选中的故障管线
function btnRemovePipe_Click(map) {
    var otb = document.getElementById("tbdAnsyPipe");
    var cks = document.getElementsByName("chkAnsyPipes");
    var t = cks.length;
    if (t < 0) return;
    var msg = "您确定要删除选择项吗？";
    if (!confirm(msg)) return;


    document.getElementById("divListTable").innerHTML = "";
    document.getElementById("tbdAnsyCloseValve").innerHTML = "";
    map.selectedLayer.getSource().clear(); 
    map.MarkerLayer.getSource().clear();

    for (var i = 0; i < t; i++) {
        if (cks[i] != null && cks[i].checked)
            otb.removeChild(cks[i].parentNode.parentNode);
    }
    for (var i = 0; i < t; i++) {
        if (cks[i] != null && cks[i].checked)
            otb.removeChild(cks[i].parentNode.parentNode);
    }
    for (var i = 0; i < t; i++) {
        if (cks[i] != null && cks[i].checked)
            otb.removeChild(cks[i].parentNode.parentNode);
    }
}
//选中所有列表中的故障管线
function chkAnsyAll_Click() {
    var chk = document.getElementById("chkAnsyAll");
    var ischecked = chk.checked;
    var cks = document.getElementsByName("chkAnsyPipes");
    var t = cks.length;
    for (var i = 0; i < t; i++) {
        cks[i].checked = ischecked;
    }
}
