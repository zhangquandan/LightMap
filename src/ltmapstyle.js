
import { Fill, Stroke, Circle, Text, Style, Icon } from 'ol/style';

export let BuildingStyle = function (feature, resolution) {
    return new Style({
        fill: new Fill({
            color: 'rgba(243, 203, 247, 0.7)'

        }),
        stroke: new Stroke({
            color: 'rgba(110, 110, 110, 0.9)',
            width: 1
        }),
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 1 }),
            text: feature.get('name'),
        })

    });
};



//给水主管样式
export let JS_Line_Style_MainPipe = function (feature, resolution) {
    return new Style({
        stroke: new Stroke({
            color: 'blue',
            width: 2
        })
    });
};
//给水管道、给水支管样式
export let JS_Line_Style_defalut = function (feature, resolution) {
    return new Style({
        stroke: new Stroke({
            color: 'darkblue',
            width: 1
        }),
        text: new Text({
            font: '10px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            placement: 'line',
            // 'bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic'.
            textBaseline: 'bottom',
            stroke: new Stroke({ color: '#fff', width: 1 }),
            text: feature.get('label'),
        })
    });
};
//消防管道样式
export let JS_Line_Style_FirePipe = function (feature, resolution) {
    return new Style({
        stroke: new Stroke({
            color: 'orange',
            width: 2
        })
    });
};

//井水管道样式
export let JS_Line_Style_GroundwaterPipe = function (feature, resolution) {
    return new Style({
        stroke: new Stroke({
            color: 'darkblue',
            width: 1
        })
    });
};


export let PipeLineStyle = function (feature, resolution) {
    let category = feature.get('category');
    let mystyle;
    switch (category) {
        case '消防':
        case '消防管道':
            mystyle = JS_Line_Style_FirePipe(feature, resolution);
            break;
        case '井水':
        case '井水管道':
            mystyle = JS_Line_Style_GroundwaterPipe(feature, resolution);
            break;
        case '主管':
        case '主干管':
        case '给水主管':
            mystyle = JS_Line_Style_MainPipe(feature, resolution);
            break;
        default:
            mystyle = JS_Line_Style_defalut(feature, resolution);
            break;
    }
    return mystyle
}



export let getCirclePointStyle = function (radius, strokecolor, strokewidth) {
    return new Style({
        image: new Circle({
            radius: radius,
            // fill: new Fill({ color: 'blue' }),
            stroke: new Stroke({
                color: strokecolor,
                width: strokewidth
            })
        })
    })
};

function getImagePointStyle(imagefile, pointradius) {

    return new Style({
        image: new Icon(({
            src: imagefile,
            crossOrigin: 'anonymous',
            radius: pointradius,
        }))
        // image: new Circle({
        //     radius: 3,
        //     // fill: new Fill({ color: 'blue' }),
        //     stroke: new Stroke({
        //         color: 'red',
        //         width: 2
        //     })
        // })
    });
}

// export let markerPointStyle = getImagePointStyle('./symbols/MarkerDefault.png', 2);

//先点声明可提高符号加载速度 管点符号包括阀门、水表、消防栓、逆止阀、水源点，其它三通、弯头、变径、堵头等均按一般缺省符号
export let Water_ValveStyle = getImagePointStyle('./symbols/Layer_Water_Valve.png', 5);
export let Water_WaterMeterstyle = getImagePointStyle('./symbols/Layer_Water_WaterMeter.png', 5);
export let Water_Hydrantstyle = getImagePointStyle('./symbols/Layer_Water_Hydrant.png', 0.5);
export let Water_OneWayValveStyle = getImagePointStyle('./symbols/Layer_Water_OneWayValve.png', 0.5);
export let Water_WaterSourcestyle = getImagePointStyle('./symbols/Layer_Water_WaterSource.png', 0.5);

export let defaultpointstyle = getCirclePointStyle(1.5, 'blue', 0.75);


export let PipePointStyle = function (feature, resolution) {
    let pointcategory = feature.get('category');
    let pointstyle;
    switch (pointcategory) {
        case '阀门':
        case '闸阀':
        case '蝶阀':
            pointstyle = Water_ValveStyle;
            break;
        case '水表井':
        case '水表(井)':
        case '水表（井）':
        case '水表':

            pointstyle = Water_WaterMeterstyle;
            break;
        case '消防栓':
        case '消防':
        case '消防接合器':
        case '取水专用栓':            
            pointstyle = Water_Hydrantstyle;
            break;
        case '逆止阀':
        case '逆流阀':
            pointstyle = Water_OneWayValveStyle;
            break;
        case '水源':
        case '水源点':
            pointstyle = Water_WaterSourcestyle;
            break;
        default:

            pointstyle = defaultpointstyle;
            break;
    }
    return pointstyle;
};


export let lyrpumproomStyle = function (feature, resolution) {
    return new Style({
        fill: new Fill({
            color: 'rgba(90, 90, 247, 0.2)'

        }),
        stroke: new Stroke({
            color: 'rgba(110, 110, 110, 0.9)',
            width: 1
        }),
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 1 }),
            text: feature.get('name'),
            offsetX: parseInt(0, 10),
            offsetY: parseInt(0, 10),
            placement: "point", //point 则自动计算面的中心k点然后标注  line 则根据面要素的边进行标注
            overflow: false //超出面的部分不显示
        })

    });
};
// export let lyrpumproomStyle = function (feature, resolution) {
//     return new Style({
//         fill: new Fill({
//             color: 'rgba(90, 90, 255, 0.2);'
//         }),
//         stroke: new Stroke({
//             color: 'rgba(90, 90, 255, 0.8);',
//             width: 1
//         }),
//         // image: new Circle({
//         //     radius: 7,
//         //     fill: new Fill({
//         //         color: '#ffcc33'
//         //     })
//         // }),
//         text: new Text({
//             text: feature.get('name'),
//             font: '10px sans-serif',
//             textAlign: "center",
//             textBaseline: "middle",
//             // //font: 'verdana',
//             // fill: new Fill({
//             //     color: "#ff0000"
//             // }),
//             // backgroundFill: new Fill({
//             //     color: "#ff0000"
//             // }),
           
//             stroke: new Stroke({
//                 color: "rgba(0, 4, 255, 0.8);"
//                 // width: 3
//             }),
//             offsetX: parseInt(0, 10),
//             offsetY: parseInt(0, 10),
//             placement: "point", //point 则自动计算面的中心k点然后标注  line 则根据面要素的边进行标注
//             overflow: false //超出面的部分不显示
//         })
//     })
// };

export let lyrMapRangeStyle = function (feature, resolution) {
    return new Style({
        fill: new Fill({
            color: 'rgba(215, 245, 203, 0.9)'
        }),
        stroke: new Stroke({
            color: 'rgba(110, 110, 110, 1)',
            width: 1
        })
    });
};


export let lyrRoadStyle = function (feature, resolution) {
    return new Style({
        fill: new Fill({
            color: 'rgba(242, 242, 242, 0.9)'
        }),
        stroke: new Stroke({
            color: 'black',
            width: 1
        })
    });
};


export let lyrZoneStyle = function (feature, resolution) {
    return new Style({
        fill: new Fill({
            color: 'rgba(174, 241, 176, 1)'
        }),
        stroke: new Stroke({
            color: 'black',
            width: 1
        })
    });
}


export let lyrTerrainStyle = function (feature, resolution) {
    return new Style({
        fill: new Fill({
            color: 'rgba(174, 241, 176, 1)'
        }),
        stroke: new Stroke({
            color: 'Gray',
            width: 1
        })
    });
}


export let lyrWaterStyle = function (feature, resolution) {
    return new Style({
        fill: new Fill({
            color: 'rgba(151, 219, 242, 0.9)'
        }),
        stroke: new Stroke({
            color: 'blue',
            width: 1
        }),
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 1 }),
            text: feature.get('name'),
        })
    });
}


export function MarkerCircleStyle(feature, resolution) {
    let style = new Style({
        image: new Circle({
            radius: Number(feature.get('Radius')),
            fill: new Fill({
                color: 'rgba(255, 0, 0, 0.5)'
            }),
            stroke: new Stroke({
                color: 'rgba(110, 110, 110, 0.8)',
                width: 1
            }),
            text: new Text({
                font: '12px Calibri,sans-serif',
                fill: new Fill({ color: 'rgba(255, 250, 0, 1)' }),
                stroke: new Stroke({ color: 'rgba(255, 250, 0, 1)', width: 1 }),
                text: '用水量：'
            })
        })
    });
    // style.getText().setText('用水量：' + feature.get('Quantity') + '吨');
    return style;
}