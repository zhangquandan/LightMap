//辅助图层
import Overlay from 'ol/Overlay';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Circle, Text, Style, Icon } from 'ol/style';


import { MarkerCircleStyle } from './ltmapstyle';

export function CreatePopupOverlay() {

    let popupcontainer = document.getElementById('popup');
    let popupcontent = document.getElementById('popup-content');
    let popupcloser = document.getElementById('popup-closer');
    let popupoverlay = new Overlay({
        element: popupcontainer,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

    popupoverlay.popupcontainer = popupcontainer;
    popupoverlay.popupcontent = popupcontent;


    popupcloser.onclick = function () {
        popupoverlay.setPosition(undefined);
        popupcloser.blur();
        return false;
    };
    // console.log(popupoverlay);
    return popupoverlay;
}


export function CreatePopupmsgOverlay() {
    let PopupmsgOverlay = new Overlay({
        element: document.getElementById("popupmsg"),
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });
    // PopupmsgOverlay.popupcontainer = document.getElementById("popup-contentmsg");
    return PopupmsgOverlay;
}

export function CreateMessureLayer() {
    return new VectorLayer({
        source: new VectorSource(),
        style: new Style({
            fill: new Fill({
                color: 'rgba(255, 250, 250, 0.6)'
            }),
            stroke: new Stroke({
                color: 'red',
                width: 2
            }),
            text: new Text({
                font: '12px Microsoft YaHei',
            })
        })
    });

}


export function CreateSelectLayer() {
    return new VectorLayer({
        source: new VectorSource(),
        style: new Style({
            fill: new Fill({
                color: 'rgba(243, 203, 247, 0.25)'
            }),
            stroke: new Stroke({
                color: config.hightlightcolor,
                width: 3
            }),
            // text: new Text({
            //     font: '12px Calibri,sans-serif',
            //     fill: new Fill({ color: '#000' }),
            //     stroke: new Stroke({ color: '#fff', width: 1 }),
            //     // text: feature.get('Name'),
            // }),
            image: new Circle({
                radius: 8,
                // fill: new ol.style.Fill({
                //     color: 'rgba(100, 0, 0, 0.1)'
                // }),
                stroke: new Stroke({
                    color: 'red',
                    width: 2
                }),
            })
        })
    });
}

//定位标识符层
export function CreateMarkerLayer() {
    return new VectorLayer({
        source: new VectorSource(),
        style: new Style({
            image: new Icon(({
                src: './symbols/MarkerDefault.png',
                radius: 3,
            }))
        })
    });
}

export function CreateMarkerCircleLayer() {
    return new VectorLayer({
        source: new VectorSource(),
        style: MarkerCircleStyle
    });
}

export function CreatePointsLayer() {
    return new VectorLayer({
        source: new VectorSource(),
        style: function (feature) {
            return new Style({
                image: new Circle({
                    radius: Number(feature.get('radius')),
                    // radius: Number(feature.get('radius')),
                    fill: new Fill({
                        color: feature.get('color')
                    }),
                    stroke: new Stroke({
                        color: 'rgba(110, 110, 110, 0.8)',
                        width: 1
                    }),
                    text: new Text({
                        font: '12px Calibri,sans-serif',
                        fill: new Fill({ color: 'rgba(255, 250, 0, 1)' }),
                        stroke: new Stroke({ color: 'rgba(255, 250, 0, 1)', width: 1 }),
                        text: feature.get('label')
                    })
                })
            })
        },
    });
}