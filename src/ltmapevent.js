import Feature from 'ol/Feature';


import { datetimeformat } from './utility';
import { GetWfsLayer, GetlayernameByFeatrueID, GetFieldContent } from './ltmapfactory';
import { ListTableWriteFeatures, CreateListTableWithHeader } from './ltmapui';

export function MapEventRegist(map) {


    //关闭鼠标双击事件
    map.on('dblclick', function () { return false; });

    //显示要素属性
    map.on('click', function (evt) {
        popupFeatureInfo(map, evt);
    });

    map.on("zoomend", function (e) {
        let loadinginfo = document.getElementById("loadinginfo");
        loadinginfo.innerHTML = "";
    });
    map.on("moveend", function (e) {
        let loadinginfo = document.getElementById("loadinginfo");
        loadinginfo.innerHTML = "";
    });

}

// export function GetWfsLayer(layername) {
//     for (let i = 0; i < config.wfslayers.length; i++) {
//         if (IsIncludeStrings(layername, [config.wfslayers[i].name])) {
//             return config.wfslayers[i];
//         }
//     }
//     return null;
// }



// //根据图层要素ID获取图层名称
// function GetlayernameByFeatrueID(layerfeatureid) {
//     if (!IsIncludeStrings(layerfeatureid, ['.'])) return null;
//     var words = layerfeatureid.split('.');
//     let layername = words[0];

//     return layername;
// }


function popupFeatureInfo(map, evt) {

    let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    });
    if (feature) {
        console.log(feature);

        let fid = feature.getId()
        map.MapSelectedFeatureID = fid;
        map.MapSelectedFeature = feature;


        let MapFeatureSelected = new CustomEvent('OnMapFeatureSelected', {
            detail: { featureid: map.MapSelectedFeatureID },
        });

        // //地图要素点击选择事件 
        if (window.dispatchEvent) {
            window.dispatchEvent(MapFeatureSelected);

        } else {
            window.fireEvent(MapFeatureSelected);
        }




        map.selectedLayer.getSource().clear();

        //判断图层是否允许显示信息（过滤图层）
        let layername = GetlayernameByFeatrueID(fid);
        if (layername == undefined || layername == null) return;
        let wfslayer = GetWfsLayer(layername);
        // console.log(layername);
        // console.log(wfslayer);
        if (wfslayer == undefined || wfslayer == null) return;
        if (!wfslayer.ShowInfo) return;

        let selectFeature = new Feature({ geometry: feature.getGeometry(), });
        map.selectedLayer.getSource().addFeature(selectFeature);


        //判断menuInfo工具条是否按下（是否显示信息）
        if (document.getElementById("menuInfo").getAttribute("menustatus") == "false") return;
        let coordinate = evt.coordinate;
        let msg = '<table border="0" cellspacing="2" cellpadding="3"';
        msg += '<tr><td>FID</td><td>:</td><td style="width:180px; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:1;overflow:hidden;">' + fid + '</td></tr>';
        let properties = feature.getProperties();
        for (let key in wfslayer.fields) {
            let name = wfslayer.fields[key];
            if (name == undefined || name == null || name == "") continue;
            let content = "-";
            let fieldvalue = properties[key];
            // if (fieldvalue != undefined && fieldvalue != null && fieldvalue != "") {
                content = GetFieldContent(fieldvalue);

            // }
            // if (typeof (fieldvalue) == "boolean")
            //     content = fieldvalue ? '是' : '否';
            msg += '<tr><td>' + name + '</td><td>:</td><td style="width:180px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden;">' + content + '</td></tr>';

        }
        msg += '</table>'
        map.popupoverlay.popupcontent.innerHTML = msg;
        map.popupoverlay.setPosition(coordinate);

        let lblTable = document.getElementById("lblTable");

        lblTable.innerText = wfslayer.chinesename + "信息";

        let divListTable = document.getElementById("divListTable");
        divListTable.innerHTML = "";
        let listtable = CreateListTableWithHeader(wfslayer.fields, true);

        listtable = ListTableWriteFeatures(listtable, [feature], wfslayer.fields, true, map);
        divListTable.appendChild(listtable);

    }
}


