import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import BingMaps from 'ol/source/BingMaps';
import VectorSource from 'ol/source/Vector';
import { createStringXY } from 'ol/coordinate';
import { Fill, Stroke, Circle, Text, Style } from 'ol/style';
import MousePosition from 'ol/control/MousePosition';

// import { config } from '../config';
import { IsIncludeStrings, datetimeformat } from './utility'

//加载视图范围所有要素的创建图层的方法
export function createvectorlayer(layername, layerstyle) {
    let s = this.createVectorSource(layername);
    let l = new VectorLayer({
        source: s,
        style: layerstyle,
    });
    l.layername = layername;
    l.layerinfo = null;

    for (let i = 0; i < config.wfslayers.length; i++) {
        if (config.wfslayers[i].name == layername) {
            l.layerinfo = config.wfslayers[i];
            break;
        }
    }
    return l;
};

//获取图层所有要素的矢量数据源
export function createVectorSource(layername) {
    return new VectorSource({
        format: new GeoJSON(),
        url: function (extent) {
            return GetVectortSourceUrlWithExtent(layername, extent);
            //   config.wfsurl + '?service=wfs&version=1.1.0&request=GetFeature&typeNames='
            //     + config.Mapworkspace + ':' + layername
            //     + '&outputFormat=application/json&srsname=' + config.MapsrsName
            //     + '&bbox=' + extent.join(',') + ',' + config.MapsrsName;
        },
        strategy: bboxStrategy
    });
}
//获取图层的矢量数据源范围内的要素
export function GetVectortSourceUrlWithExtent(layername, extent) {
    return config.wfsurl + '?service=wfs&version=1.1.0&request=GetFeature&typeNames='
        + config.Mapworkspace + ':' + layername
        + '&outputFormat=application/json&srsname=' + config.MapsrsName
        + '&bbox=' + extent.join(',') + ',' + config.MapsrsName;
}

//加载所有要素的矢量数据源
export function createVectorSourceAll(layername) {
    return new VectorSource({
        format: new GeoJSON(),
        url: GetVectortSourceUrl(layername),
        strategy: bboxStrategy
    });
}
//获取图层的矢量数据源所有要素
export function GetVectortSourceUrl(layername) {
    return config.wfsurl + '?service=wfs&version=1.1.0&request=GetFeature&typeNames='
        + config.Mapworkspace + ':' + layername
        + '&outputFormat=application/json&srsname=' + config.MapsrsName;
}
//加载所有要素的创建图层的方法
export function createvectorlayerAll(layername, layerstyle) {
    let s = this.createVectorSourceAll(layername);
    let l = new VectorLayer({
        source: s,
        style: layerstyle,
    });
    l.layername = layername;
    l.layerinfo = null;

    for (let i = 0; i < config.wfslayers.length; i++) {
        if (config.wfslayers[i].name == layername) {
            l.layerinfo = config.wfslayers[i];
            break;
        }
    }
    // console.log(l);
    // console.log(config.wfslayers);
    return l;
};



export function Getdefaultview() {

    return new View({
        center: config.mapcenter,
        zoom: config.defaultzoom,
        maxZoom: config.maxZoom,
        minZoom: config.minZoom,
        projection: config.MapsrsName,
        extent: config.extent
    })
}


//按图层名称建立图层名称、图层字典
export function getLayerDictionary(layers) {
    let layerdic = new Array();
    for (let i = 0; i < layers.length; i++) {
        layerdic[layers[i].layername] = layers[i];
        // console.log(layers[i].layername);
    }
    return layerdic;
}



export function GetwfsFeatureUrlByFeatureID(layername, featureid) {
    let url = config.wfsurl + "?service=WFS&version=1.0.0&request=GetFeature&typeName=" + config.Mapworkspace +
        "%3A" + layername + "&maxFeatures=50&&outputFormat=application%2Fjson&featureid=" + featureid;
    return url;
}



//创建地图图层管理面板，仅显示信息显示图层。图层面板的事件在后面代码定义ltmapui的UIEventRegist定义
export function createLayerTable(element) {
    //    (config.wfslayers);
    if (element == null || element == undefined) return;
    let layerelements = "<tr> <th>显示</th> <th>图层</th> <th>透明度</th> </tr>";
    for (let i = 0; i < config.wfslayers.length; i++) {
        let item = config.wfslayers[i];
        if (!item.ShowInLayerTable) continue;
        // if (!IsIncludeStrings(item.name, config.viewintablelayers)) continue;
        layerelements += '<tr> <td><input type="checkbox" checked="checked" name="layercheckbox" layername="'
            + item.name + '"></td><td>'
            + item.chinesename + '</td><td><input class="layeropacity" type="range" value="100" name="layeropacity" layername="'
            + item.name + '"></td></tr>';

    }
    // console.log(layerelements);
    element.innerHTML = layerelements;

}

//地图创建热点链接标签并注册onclick事件
export function createHotPoints(map, parent) {
    if (parent == null || parent == undefined) return;

    for (let i = 0; i < config.hotpoints.length; i++) {
        let item = config.hotpoints[i];
        let element = document.createElement("a");
        element.href = "#";
        element.innerText = item.name;
        element.style.margin = "0px 7px 0px 0px";
        // element.location=item.location;
        element.onclick = function () { map.getView().setCenter(item.location); }

        parent.appendChild(element);
    }
}

//坐标显示控件定义
export function CreateMousePositionControl() {
    return new MousePosition({
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        coordinateFormat: createStringXY(6),
        // projection: 'EPSG:4326',
        undefinedHTML: '&nbsp;'
    });
}

export function CreateSearchConditionControl(map) {
    let listlayername = document.getElementById("lstSelectlayers");

    let optionshtml = '<option value="' + config.wfslayers[0].name + '">请选择图层... </option>';

    for (let i = 0; i < config.wfslayers.length; i++) {
        if (!config.wfslayers[i].ShowInfo) continue;
        optionshtml += '<option value="' + config.wfslayers[i].name + '">' + config.wfslayers[i].chinesename + '</option>';

    }
    listlayername.innerHTML = optionshtml;


    listlayername.onchange = function (map) { UiOnlstSelectlayerChange(map); };

}


export function GetWfsLayer(layername) {
    for (let i = 0; i < config.wfslayers.length; i++) {
        if (IsIncludeStrings(layername, [config.wfslayers[i].name])) {
            return config.wfslayers[i];
        }
    }
    return null;
}

//根据图层要素ID获取图层名称
export function GetlayernameByFeatrueID(layerfeatureid) {
    if (!IsIncludeStrings(layerfeatureid, ['.'])) return null;
    var words = layerfeatureid.split('.');
    let layername = words[0];

    return layername;
}

export function GetFieldAlias(layername, fieldname) {
    for (let i = 0; i < config.wfslayers.length; i++) {
        if (IsIncludeStrings(layername, [config.wfslayers[i].name])) {
            return config.wfslayers[i].fields[fieldname];
        }
    }
    return fieldname;
}
//选择图层下拉框，改变要素属性下拉框内容
export function UiOnlstSelectlayerChange(map) {
    let obj = document.getElementById("lstSelectlayers");
    let selectedlayername = "";
    selectedlayername = obj.options[obj.selectedIndex].value;
    if (selectedlayername == "") return;


    //获取要素集合的第一条要素
    let wfslayer = GetWfsLayer(selectedlayername);
    let fobj = document.getElementById("lstSelectFields");
    let lst = '<option value="FeatureID">要素ID</option>';
    for (let key in wfslayer.fields) {
        lst += '   <option value="' + key + '">' + wfslayer.fields[key] + '</option>';
    }
    fobj.innerHTML = lst;


};

export function SetMapViewToLayer(map, layer, zoom) {
    let view = map.getView();
    view.fit(layer.getSource().getExtent());
    view.setZoom(zoom);

}

export function SetMapView(map, center, zoom) {
    let view = map.getView()
    view.setCenter(center);
    let z = (arguments.length >= 3) ? zoom : 20;
    view.setZoom(z);
}

export function GetFieldContent(fieldvalue) {
    let content = '-';
    if (fieldvalue == undefined || fieldvalue === null || fieldvalue === "null" || fieldvalue === "NULL" || fieldvalue === "Null")
        return content;

    // if (isNaN(fieldvalue) && !isNaN(Date.parse(fieldvalue))) {
    //     let dt = new Date(String(fieldvalue));
    //     // console.log(dt);
    //     content = datetimeformat(dt, "yyyy年MM月dd日");
    // }
    // if (!isNaN(Date.parse(fieldvalue))) {
    //     let dt = new Date(String(fieldvalue));
    //     // console.log(dt);
    //     content = datetimeformat(dt, "yyyy年MM月dd日");
    // }
    // else 
    if (typeof (fieldvalue) == "number") {
        // let ss = String(fieldvalue);
        // content = ss.substring(0, ss.indexOf('.') + 3);
        var n = Math.round(fieldvalue * 100) / 100;
        return n.toString();

    }
    else if (typeof (fieldvalue) == "boolean") {
        // console.log(typeof (fieldvalue));
        // console.log(fieldvalue);
        content = fieldvalue ? '是' : '否';
        // console.log(content);
    }
    else if (typeof (fieldvalue) == "string") {
        let str = fieldvalue.toLowerCase();
        if (str.toLowerCase() == 'none' || str == '')
            content = ' - ';
        else
            content = fieldvalue;
        // console.log(content);
    }
    else
        content = fieldvalue;
    return content;
}