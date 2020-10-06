import 'ol/ol.css';
import Map from 'ol/Map';
import { defaults as defaultControls, Zoom, ScaleLine } from 'ol/control';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import BingMaps from 'ol/source/BingMaps';
import VectorSource from 'ol/source/Vector';

import { Fill, Stroke, Circle, Text, Style } from 'ol/style';

import { unByKey } from 'ol/Observable';
import { getArea, getLength } from 'ol/sphere';

import { LineString, Polygon } from 'ol/geom';

import { getCenter } from 'ol/extent';
import Draw, { createRegularPolygon, createBox } from 'ol/interaction/Draw';

import * as mapstyle from './src/ltmapstyle';
import * as mapui from './src/ltmapui';
import * as mapevent from './src/ltmapevent';
import * as ltmapauxlayer from './src/ltmapauxlayer';

import { IsIncludeStrings, GetQueryString } from './src/utility';

import * as mapfactory from './src/ltmapfactory';


let map = new Map({ target: 'map', });

// console.log(config.AppUrl);
// console.log(config.AppLoginUrl);
// console.log(config.Title);

function main(map) {

    document.cookie = "username=1;path=/";
    //地图 
    //设置地图显示
    map.setView(mapfactory.Getdefaultview());
    //添加地图控件（坐标显示和比例尺） 
    map.addControl(mapfactory.CreateMousePositionControl());
    map.addControl(new ScaleLine({}));
    // map.addControl(new ScaleLine({
    //     units: "metric",
    //     bar: true,
    //     steps: 2,
    //     text: true,    
    //     minWidth: 80,
    //     maxWidth:80,
    //   }));
    //移除放大缩小控件
    map.getControls().forEach(function (control) { if (control instanceof Zoom) { map.removeControl(control); } }, this);


    //创建地图图层  次序为图层显示次序  定义所有地图图层到字典，使用：mylayers["MapRange"] key为图层名称
    let mylayers = mapfactory.getLayerDictionary([
        //背景图层
        //地图范围图层
        mapfactory.createvectorlayer('maprange', mapstyle.lyrMapRangeStyle),
        //道路范围图层
        mapfactory.createvectorlayer('road', mapstyle.lyrRoadStyle),
        //地块图层
        mapfactory.createvectorlayer('zone', mapstyle.lyrZoneStyle),

        //水系图层
        mapfactory.createvectorlayer('water', mapstyle.lyrWaterStyle),

        //地形图层
        mapfactory.createvectorlayer('terrain', mapstyle.lyrTerrainStyle),


        //管线管点建筑图层
        //建筑图层(指定数据图层名称和样式)
        mapfactory.createvectorlayerAll('building', mapstyle.BuildingStyle),
        //泵房图层
        mapfactory.createvectorlayerAll('pumproom', mapstyle.lyrpumproomStyle),
        //管线图层
        mapfactory.createvectorlayerAll('js_pipe', mapstyle.PipeLineStyle),
        //管点图层
        mapfactory.createvectorlayerAll('js_point', mapstyle.PipePointStyle),






    ]);


    //添加地图图层 
    for (let key in mylayers) {
        // console.log(mylayers[key].layerinfo.name + ':' + mylayers[key].layerinfo.MinZoom);
        mylayers[key].setMinZoom(mylayers[key].layerinfo.MinZoom);
        map.addLayer(mylayers[key]);

    }

    // mylayers['building'].setMinZoom (19);


    //辅助图层定义
    let popupoverlay = ltmapauxlayer.CreatePopupOverlay()
    let popupmsgoverlay = ltmapauxlayer.CreatePopupmsgOverlay();

    let messureLayer = ltmapauxlayer.CreateMessureLayer();
    let selectedLayer = ltmapauxlayer.CreateSelectLayer();
    let MarkerLayer = ltmapauxlayer.CreateMarkerLayer();

    let MarkerCircleLayer = ltmapauxlayer.CreateMarkerCircleLayer();
    let AddPointsLayer = ltmapauxlayer.CreatePointsLayer();


    let regionsource = new VectorSource({ wrapX: false });

    let regionlayer = new VectorLayer({
        source: regionsource,
    });

    //添加辅助图层 
    map.addLayer(messureLayer);
    map.addLayer(selectedLayer);
    map.addLayer(MarkerLayer);
    map.addLayer(MarkerCircleLayer);
    map.addLayer(AddPointsLayer);
    map.addLayer(regionlayer);

    //添加OverLayer图层
    map.addOverlay(popupoverlay);
    map.addOverlay(popupmsgoverlay);

    //便于调用
    map.mylayers = mylayers;
    map.popupoverlay = popupoverlay;
    map.popupmsgoverlay = popupmsgoverlay;

    map.messureLayer = messureLayer;
    map.selectedLayer = selectedLayer;
    map.MarkerLayer = MarkerLayer;
    map.MarkerCircleLayer = MarkerCircleLayer;
    map.AddPointsLayer = AddPointsLayer;
    //范围选择图层
    map.regionlayer = regionlayer;

    //根据config图层设置，创建图层显示管理面板
    mapfactory.createLayerTable(document.getElementById("layerTable"));
    //根据config地图热点，创建地图热点位置链接
    mapfactory.createHotPoints(map, document.getElementById("divhotpoints"));

    map.jstoposloaded = false;
    map.jstopos = null;
    map.waternet = null;

    map.MapSelectedFeatureID = null;
    map.MapSelectedFeature = null;




    //交互-绘制标记点交互定义，添加到map的属性，方便调用
    map.interactionMarker = new Draw({ type: 'Point', source: MarkerLayer.getSource(), ison: false });

    map.interactionDistance = new Draw({ type: 'LineString', source: messureLayer.getSource(), ison: false });

    map.interactionArea = new Draw({ type: 'Polygon', source: messureLayer.getSource(), ison: false });

    //生成查询条件下拉选择框（图层和属性字段）在UI事件注册之前
    mapfactory.CreateSearchConditionControl(map);

    //UI事件注册（工具条按钮、查询输入等UI）事件
    mapui.UIEventRegist(map);





    //注册地图事件（点击缩放等事件）
    mapevent.MapEventRegist(map);





    map.drawregion = null;
    map.Isdrawregion = false;

    let radio = document.getElementsByName("MapRegion");
    // console.log(radio);
    for (let i = 0; i < radio.length; i++) {
        radio[i].onclick = function () {
            map.removeInteraction(map.drawregion);
            addRegionInteraction(radio[i].value);
        }
    }
    map.SelectRegionType = "RegionMap";
    let radiocomplex = document.getElementsByName("CMapRegion");
    // console.log(radio);
    for (let i = 0; i < radiocomplex.length; i++) {
        radiocomplex[i].onclick = function () {
            map.SelectRegionType = radiocomplex[i].value;
            map.removeInteraction(map.drawregion);
            addRegionInteraction(radiocomplex[i].value);
        }
    }




    function addRegionInteraction(regiontype) {
        regionsource.clear();
        let value = "None";
        if (regiontype == "" || regiontype === "RegionMap") return;
        if (regiontype === 'RegionCircle') {
            // Square
            value = 'Circle';
            map.drawregion = new Draw({
                source: regionsource,
                type: value,
                geometryFunction: function (coordinates, geometry) {
                    let center = coordinates[0];
                    let last = coordinates[1];
                    let dx = center[0] - last[0];
                    let dy = center[1] - last[1];
                    let radius = Math.sqrt(dx * dx + dy * dy);
                    let rotation = Math.atan2(dy, dx);
                    let newCoordinates = [];
                    let numPoints = 48;
                    for (let i = 0; i < numPoints; ++i) {
                        let angle = rotation + i * 2 * Math.PI / numPoints;
                        // let fraction = i % 2 === 0 ? 1 : 0.5;
                        let fraction = 1;
                        let offsetX = radius * fraction * Math.cos(angle);
                        let offsetY = radius * fraction * Math.sin(angle);
                        newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
                    }
                    newCoordinates.push(newCoordinates[0].slice());
                    if (!geometry) {
                        geometry = new Polygon([newCoordinates]);
                    } else {
                        geometry.setCoordinates([newCoordinates]);
                    }
                    return geometry;
                }
            });
        } else if (regiontype === 'RegionRectangle') {
            //Box
            value = 'Circle';
            map.drawregion = new Draw({
                source: regionsource,
                type: value,
                geometryFunction: createBox()
            });
        }
        else if (regiontype === 'RegionPolygon') {
            map.drawregion = new Draw({
                source: regionsource,
                type: "Polygon",
            });
        }

        map.Isdrawregion = true;

        map.addInteraction(map.drawregion);

    }


    //地图接口 Window全局函数，可以打包后保持原函数名称

    //公共接口——地图居中到坐标（坐标为字符串，用逗号分隔，如"104.5, 30.5"）
    Window.ViewLocation = function (location) {
        // alert("地图居中到："+location);
        mapui.UiOnClearMap(map);
        try {
            let center = [104.5, 30.5];
            let ls = location.split(',');
            center[0] = Number(ls[0]);
            center[1] = Number(ls[1]);


            mapfactory.SetMapView(map, center, 20);

        }
        catch (e) {
            console.log(e);
        }
    }


    //公共接口——地图居中到坐标,并在坐标位置标识定位符号（坐标为字符串，用逗号分隔，如"104.5, 30.5"）
    Window.ViewLocationWhitMaker = function (location) {
        mapui.UiOnClearMap(map);
        try {
            map.MarkerLayer.getSource().clear();
            let center = [104.5, 30.5];
            let ls = location.split(',');
            center[0] = Number(ls[0]);
            center[1] = Number(ls[1]);
            let iconFeature = new Feature({
                geometry: new Point(center, "XY"),
            });
            map.MarkerLayer.getSource().addFeature(iconFeature);

            mapfactory.SetMapViewToLayer(map, map.MarkerLayer, 20);

        }
        catch (e) {
            console.log(e);
        }
    }



    //公共接口——清理地图
    Window.RefreshMap = function () {
        mapui.UiOnClearMap(map);
    }

    //公共接口——重置地图
    Window.ResetMap = function () {
        mapui.UiOnResetMap(map);
    }


    //公共接口——地图定位居中到要素ID
    Window.ToSelectFeature = function (featureid) {
        mapui.UiOnClearMap(map);
        mapui.LocationByFeatureID(map, featureid)

    }

    //父页面事件监听
    // window.onload = function () {
    //     document.getElementById("mapiframe").contentWindow.addEventListener('OnMapFeatureSelected',
    //         function (event) {
    //             // alert('子页面事件选中地图要素ID：' + event.detail.featureid);
    //             console.log(event.detail);
    //             document.getElementById("eventFeatureID").innerText = event.detail.featureid;
    //         });
    // }

    //公共接口——地图定位居中到要素ID
    Window.GetSelectedFeatureID = function () {
        return map.MapSelectedFeatureID;

    }



    //公共接口——获取要素信息（字典）
    Window.GetSelectedFeature = function () {
        // console.log("公共接口——获取要素信息（字典）");
        // console.log(map.MapSelectedFeature);
        let feature = map.MapSelectedFeature;

        if (feature == undefined || feature == null) return null;
        let f = new Array();
        f["fid"] = feature.getId();

        let properties = feature.getProperties();

        for (let key in properties) {
            f[key] = properties[key];
        }
        let c = getCenter(feature.getGeometry().getExtent());
        f.location = c;
        return f;
    }


    //公共接口——在单个指定要素上显示信息 
    Window.ShowFeatureMsg = function (layerfeatureid, featuremsg) {

        mapui.UiOnClearMap(map);
        if (!IsIncludeStrings(layerfeatureid, ['.'])) return null;

        let words = layerfeatureid.split('.');
        let layername = words[0];
        let featureid = words[1];
        let url = mapfactory.GetwfsFeatureUrlByFeatureID(layername, layerfeatureid);

        fetch(url).then(function (response) {
            return response.json()   //执行成功第一步 
        }).then(function (json) {

            let features = new GeoJSON().readFeatures(json);

            if (features == null || features == undefined || features.length < 1) return;


            selectedLayer.getSource().addFeatures(features);
            let f = features[0];
            map.MapSelectedFeatureID = f.getId();
            map.MapSelectedFeature = f;
            let c = getCenter(f.getGeometry().getExtent());
            console.log(c);
            let anchor = new Feature({
                geometry: new Point(c, "XY"),
            });

            map.popupmsgoverlay.element.firstElementChild.innerHTML = featuremsg;
            map.popupmsgoverlay.setPosition(c);

            selectedLayer.getSource().addFeature(anchor);
            mapfactory.SetMapViewToLayer(map, map.selectedLayer, 20);


        }).catch((e) => { console.log(e); });

    }

    //公共接口——在指定位置上显示信息
    Window.LocationMsg = function (location, msg) {
        mapui.UiOnClearMap(map);
        try {
            let c = [104.5, 30.5];

            let ls = location.split(',');
            c[0] = Number(ls[0]);
            c[1] = Number(ls[1]);



            let anchor = new Feature({
                geometry: new Point(c, "XY"),
            });
            selectedLayer.getSource().addFeature(anchor);
            mapfactory.SetMapViewToLayer(map, map.selectedLayer, 20);

            let center = getCenter(anchor.getGeometry().getExtent());
            console.log(center);
            map.popupmsgoverlay.setPosition(undefined);
            map.popupmsgoverlay.element.firstElementChild.innerHTML = msg;
            map.popupmsgoverlay.setPosition(center);
        }
        catch (e) {
            console.log(e);
        }

    }



    //排序
    function sortId(a, b) {
        // return a.quantity - b.quantity;//由低到高
        return b.Quantity - a.Quantity;//由高到低
    }

    //公共接口—— 显示建筑水量信息(仅显示地图当前范围内的建筑)

    let fun_ShowbuildingWater = function (BuildingWater) {
        mapui.UiOnClearMap(map);
        console.log(BuildingWater);
        for (let i = 0; i < BuildingWater.length; i++) {
            if (BuildingWater[i].Quantity <= 0)
                BuildingWater.splice(i, 1);
        }

        BuildingWater.sort(sortId);

        let maxnum = BuildingWater[0].Quantity;
        let minnum = BuildingWater[BuildingWater.length - 1].Quantity;

        let cmax = 30.0;
        let cmin = 1.0;

        let nd = maxnum - minnum;
        let cd = cmax - cmin;

        let layername = "building";

        let lyrBuilding = mylayers[layername];
        console.log(lyrBuilding);
        if (lyrBuilding == null || lyrBuilding == undefined) return;

        for (let i = 0; i < BuildingWater.length; i++) {
            let quantity = BuildingWater[i].Quantity;
            let radius = cmin + cd / nd * quantity;
            let layerfeatureid = BuildingWater[i].FeatureID;

            let f = lyrBuilding.getSource().getFeatureById(layerfeatureid);

            if (f == null || f == undefined) {
                let url = mapfactory.GetwfsFeatureUrlByFeatureID(layername, layerfeatureid);
                fetch(url).then(function (response) {
                    return response.json()   //执行成功第一步 
                }).then(function (json) {
                    let fs = new GeoJSON().readFeatures(json);
                    if (fs == undefined || fs == null || fs.length < 1) return;
                    let f = fs[0];
                    drawcircleInMarler(f, quantity, radius);
                });

            }
            else {
                drawcircleInMarler(f, quantity, radius);
            }

        }
    }

    function drawcircleInMarler(f, quantity, radius) {
        let center = getCenter(f.getGeometry().getExtent());
        console.log(center);
        let circleFeature = new Feature({ //路线
            geometry: new Point(center),
            Quantity: quantity,
            Radius: radius,
        });
        // console.log(circleFeature);
        MarkerCircleLayer.getSource().addFeature(circleFeature);
    }

    Window.Showbuildingswater = function (buildingswaterjson) {
        let BuildingWater = JSON.parse(buildingswaterjson).BuildingWater;
        fun_ShowbuildingWater(BuildingWater);


    }
    //公共接口——获取最后一次定点的坐标,没有定点则返回当前地图视野中心坐标
    Window.GetLastMarkerCoordinate = function () {
        let count = MarkerLayer.getSource().getFeatures().length;
        // console.log(count);
        if (count < 1) return map.getView().getCenter();
        let f = MarkerLayer.getSource().getFeatures()[count - 1];
        let coord = f.getGeometry().getCoordinates();
        return coord;
    }



    //公共接口——显示标题
    Window.ShowMapTitle = function () {
        document.getElementById("MyTitle").style.display = "block";
        document.getElementById("divInput").style.top = "40px";
        document.getElementById("divToolbox").style.top = "40px";
        document.getElementById("divSearchContent").style.top = "70px";
    }
    //公共接口——隐藏标题
    Window.HideMapTitle = function () {
        document.getElementById("MyTitle").style.display = "none";
        document.getElementById("divInput").style.top = "10px";
        document.getElementById("divSearchContent").style.top = "40px";
        document.getElementById("divToolbox").style.top = "10px";
    }
    //公共接口——设置标题内容
    Window.SetMapTitle = function (title) {
        document.getElementById("MyTitle").innerText = title;
    }

    Window.Drawpoints = function (drawpointsjson) {
        drawpoints(drawpointsjson);
    }


    fun_url_SetMapTitle();
    fun_url_ViewLocation();
    fun_url_ToSelectFeature();
    fun_url_ShowFeatureMsg();
    fun_url_LocationMsg();
    fun_url_Showbuildingswater();
    fun_url_drawpoints();

    //1、网站嵌入时不显示标题
    function fun_url_SetMapTitle() {
        document.getElementById('MyTitle').innerText = config.Title;
        document.title = config.Title;

        let tp = GetQueryString("type");
        if (tp == undefined || tp == null || tp.toLowerCase() != "iframe") {
            document.getElementById("MyTitle").style.display = "block";
            document.getElementById("divInput").style.top = "40px";
            document.getElementById("divSearchContent").style.top = "80px";
            document.getElementById("divToolbox").style.top = "40px";
        }
        let mtitle = GetQueryString("SetMapTitle");
        if (mtitle != null && mtitle != "") {
            // console.log(mtitle);
            document.getElementById('MyTitle').innerText = mtitle;
        }

    }

    //2、地图居中到指定坐标位置
    function fun_url_ViewLocation() {
        let location = GetQueryString("ViewLocation");
        if (location != undefined && location != null && location != "") {
            Window.ViewLocation(location);
        }
    };


    //3、地图选中要素
    function fun_url_ToSelectFeature() {
        let featureid = GetQueryString("ToSelectFeature");

        if (featureid != undefined && featureid != null && featureid != "") {
            Window.ToSelectFeature(featureid);
        }
    }

    //4、要素显示信息
    function fun_url_ShowFeatureMsg() {
        let featureMsg = GetQueryString("ShowFeatureMsg");
        if (featureMsg != undefined && featureMsg != null && featureMsg != "") {
            if (!IsIncludeStrings(featureMsg, [';'])) return;
            let words = featureMsg.split(';');
            let layerfeatureid = words[0];
            let msg = words[1];
            // console.log(layerfeatureid);
            // console.log(msg);
            Window.ShowFeatureMsg(layerfeatureid, msg);
        }
    }

    //5、在坐标位置显示信息
    function fun_url_LocationMsg() {
        let locationmsg = GetQueryString("LocationMsg");
        if (locationmsg != undefined && locationmsg != null && locationmsg != "") {
            if (!IsIncludeStrings(locationmsg, [';'])) return;
            let words = locationmsg.split(';');
            let location = words[0];
            let msg = words[1];
            // console.log(location);

            Window.LocationMsg(location.toString(), msg);
        }
    }

    //6、显示建筑用水量
    function fun_url_Showbuildingswater() {
        let buildingswaterjson = GetQueryString("Showbuildingswater");

        if (buildingswaterjson != undefined && buildingswaterjson != null && buildingswaterjson != "") {

            fun_ShowbuildingWater(JSON.parse(buildingswaterjson).BuildingWater);
            console.log(buildingswaterjson);
        }
    }


    function fun_url_drawpoints() {
        let drawpointsjson = GetQueryString("drawpoints");
        drawpoints(drawpointsjson);

    }

    function drawpoints(drawpointsjson) {
        map.AddPointsLayer.getSource().clear();
        if (drawpointsjson != undefined && drawpointsjson != null && drawpointsjson != "") {
            let points = JSON.parse(drawpointsjson).points;
            console.log(points);
            for (let i = 0; i < points.length; i++) {
                let p = points[i];
                let pointFeature = new Feature({
                    geometry: new Point(p.location, "XY"),
                });
                let ppvalue = { "pid": p.pid, "label": p.label, "radius": p.radius, "color": p.color, "category": p.category };

                pointFeature.setProperties(ppvalue);

                map.AddPointsLayer.getSource().addFeature(pointFeature);
            }
            mapfactory.SetMapViewToLayer(map, map.AddPointsLayer, 15);
        }
    }

}

// function login(map) {
//     var username = document.getElementById("username").value;
//     var password = document.getElementById("password").value;

//     var geoserverurl = "http://localhost:8080/geoserver/j_spring_security_check";

//     //headers.append('Content-Type', 'text/json');
//     var data = {
//         username: username,
//         password: password
//     };
//     console.log(data.password);


//     var myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
//     // myHeaders.append("Cookie", "JSESSIONID=1AB965E975A6D6EF958CF347582043D6");

//     var urlencoded = new URLSearchParams();
//     urlencoded.append("username", username);
//     urlencoded.append("password", password);

//     var requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: urlencoded,
//         redirect: 'follow',
//         credentials: 'include',
//     };

//     fetch(geoserverurl, requestOptions)
//         .then(function (response) {
//             console.log(response.status);
//             if (response.status == 200) {
//                 // document.getElementById("longininfo").innerHTML = '';
//                 // runmap();
//                 document.getElementById("map").style.display = "block";
//                 document.getElementById("divlogin").style.display = "none";
//             }
//             else {
//                 document.getElementById("longininfo").innerHTML = '提示：错误的用户名或密码';
//             }
//             return response.text()
//         })
//         .then(function (result) {

//         })
//         .catch(error => console.log('error', error));



// }
function loginhere() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/xml");
    // myHeaders.append("X-Requested-With", "XMLHttpRequest");
    // myHeaders.append("Authorization", "basic " + btoa("whit:whit123"));
    // myHeaders.append("Cookie", "JSESSIONID=811D22D3B620BB6EE61AE96E49AD4241");

    var raw = '<GetCapabilities' +
        ' service =\"WFS\"' +
        ' xmlns =\"http://www.opengis.net/wfs\"' +
        ' xmlns: xsi =\"http://www.w3.org/2001/XMLSchema-instance\"' +
        ' xsi: schemaLocation =\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\"/>';

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    // fetch("http://localhost:8080/geoserver/wfs", requestOptions)
    fetch(config.wfsurl, requestOptions)
        .then(function (response) {

            console.log("response.status" + response.status)
            if (response.status == 200) {
                // window.location.href = "http://localhost:8080/lightmapv5/index.html";
                // main(map);
            }
            else {
                window.location.href = config.AppLoginUrl;
                // window.location.href = "http://localhost:8080/lightmapv5/login.html?from=lightmap";
                // console.log("测试Geoserver连接response.status:" + response.status);
            }
            return response.text();
        })
        .then(function (result) {
            if (result.indexOf("欢迎") != -1)
                main(map);
            else {
                // window.location.href = "http://localhost:8080/lightmapv5/login.html?from=lightmap";
                window.location.href = config.AppLoginUrl;
            }

            console.log("response.status:" + result);
        })
        .catch(function (error) {
            // window.location.href = "http://localhost:8080/lightmapv5/login.html?from=lightmap"
            // console.log("geoserver连接失败，地图页面重定向到登录:" + loginurl);
            console.log("地图服务连接失败，请通知管理员检查服务器地图服务及相关配置:");
        });
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
// document.getElementById("btnLogin").onclick=function(){
//     login(map);
// }
// document.getElementById("map").style.display="block";
// document.getElementById("divlogin").style.display="none"; 

// var qs = getQueryString();

// var qsstatus = qs["status"]; // abc
// if (qsstatus == "logined")
//     main(map);
// else
//     loginhere();

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        return true;
    } else {
        return false;
    }
}

var oldTime = new Date().getTime();
var newTime = new Date().getTime();
//设置超时时间： 8分钟
var outTime = config.SleepLoginMinutes;
// var outTime = 180000;

document.onmousemove = function () {
    oldTime = new Date().getTime(); //鼠标移入重置停留的时间
}

document.onkeydown = function () {
    oldTime = new Date().getTime(); //键盘输入重置停留的时间
}

function OutTime() {
    newTime = new Date().getTime(); //更新未进行操作的当前时间
    if (newTime - oldTime > outTime) { //判断是否超时不操作
        window.location.href = config.AppLoginUrl;
    }
}


// var qs = getQueryString();

// var qstype = qs["type"]; // abc
// if (qsstatus == "iframe")
//     main(map);
// else
//     loginhere();

//主程序运行
if (checkCookie()) {
    deleteCookie("username");
    /* 定时器  判断每5秒是否长时间未进行页面操作 */
    window.setInterval(OutTime, 5000);
    if (!config.consolelogOn) console.log = () => { }

    main(map);

}
else {
    deleteCookie("username");
    window.location.href = config.AppLoginUrl;


}
