import { Fill, Stroke, Circle, Text, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import Draw from 'ol/interaction/Draw';
import * as Cogo from './cogo';


export function CreaterInteraction(type, source) {
    return new Draw({
        type: type,
        source: source,    // 注意设置source，这样绘制好的线，就会添加到这个source里,
        style: new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new Circle ({
                radius: 5,
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        }),
        ison: false
    });
}


// export function drawDistance(event,messureLayer,interactionDistance) {

//     // console.log(event);
//     // // event.feature 就是当前绘制完成的线的Feature
//     // var geometry = event.feature.getGeometry();
//     // var coords = geometry.getCoordinates();

//     // // //简略计算长度
//     // // console.log(geometry.getLength()) 
//     // // var ll = geometry.getLength(); 
//     // // var lll = ll * 111310 * Math.cos(coords[0][1] * Math.PI / 180.0);
//     // // console.log(lll);

//     // var distance = Cogo.GetCoordinatesDistance(event.feature.getGeometry().getCoordinates());

//     // var coord = coords[coords.length - 1];
//     // var anchor = new Feature({
//     //     geometry: new Point(coord)
//     // });

//     // anchor.setStyle(new Style({
//     //     text: new Text({
//     //         font: '16px sans-serif',
//     //         text: distance.toFixed(2) + ' m',
//     //         fill: new Fill({
//     //             color: 'black'
//     //         })
//     //     })
//     // }));

//     // messureLayer.getSource().addFeature(anchor);


//     // interactionDistance.ison = false;
//     // map.removeInteraction(interactionDistance);
// }

// export function drawArea(event,messureLayer,interactionArea) { 

//     // event.feature 就是当前绘制完成的线的Feature
//     var geometry = event.feature.getGeometry();
//     var coords = geometry.getCoordinates()[0]; //存在多个面嵌套
//     if (coords == undefined) return;


//     var area =  Cogo.GetCogoArea(coords);
//     console.log(area);

//     var extent = geometry.getExtent();

//     var coord =  Cogo.CogoGetCenterOfExtent(extent);

//     var anchor = new  Feature({
//         geometry: new Point(coord)
//     });



//     messureLayer.getSource().addFeature(anchor);
//     anchor.setStyle(new ol.style.Style({
//         text: new ol.style.Text({
//             font: '16px Microsoft YaHei',
//             text: area.toFixed(2) + ' m² ',
//             fill: new ol.style.Fill({
//                 color: 'red'
//             })
//         })
//     }));
//     interactionArea.ison = false;
//     map.removeInteraction(interactionArea);

// }