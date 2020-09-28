//参考椭球
export let ReferenceEllipsoid = {
    //CGCS2000椭球
    // Semimajor_Axis: 6378137,
    // Semiminor_Axis: 6356752.31414,
    // f:1 / 298.257222101

    //WGS84椭球
    Semimajor_Axis: 6378137,
    Semiminor_Axis: 6356752.314,
    f: 1 / 298.257223565
};

export function GetCoordinatesDistance(coordinates) {
    let length = 0;
    for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        let p1 = coordinates[i];
        let p2 = coordinates[i + 1];
        length += GetCogoDistance(p1[0], p1[1], p2[0], p2[1]);
    }
    return length;
};

export function GetCogoDistance(lng1, lat1, lng2, lat2) {
    let radLat1 = lat1 * Math.PI / 180.0;
    let radLat2 = lat2 * Math.PI / 180.0;
    let a = radLat1 - radLat2;
    let b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));

    s = s * ReferenceEllipsoid.Semimajor_Axis; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
};

export function GetCogoArea(path) {
    //传入path：{
    //     [{lat:,lng:}],[{lat:,lng:}],[{lat:,lng:}]
    // }
    let radius = ReferenceEllipsoid.Semimajor_Axis;
    let len = path.length;

    if (len < 3) return 0;
    let total = 0;
    let prev = path[len - 1];
    let prev_lat = prev[1];
    let prev_lng = prev[0];

    let prevTanLat = Math.tan(((Math.PI / 2 - prev_lat / 180 * Math.PI) / 2));
    let prevLng = (prev_lng) / 180 * Math.PI;

    for (let i in path) {
        let pathi_lat = path[i][1];
        let pathi_lng = path[i][0];
        let tanLat = Math.tan((Math.PI / 2 -
            (pathi_lat) / 180 * Math.PI) / 2);
        let lng = (pathi_lng) / 180 * Math.PI;
        total += polarTriangleArea(tanLat, lng, prevTanLat, prevLng);
        prevTanLat = tanLat;
        prevLng = lng;
    }
    return Math.abs(total * (radius * radius));
};

export function polarTriangleArea(tan1, lng1, tan2, lng2) {
    let deltaLng = lng1 - lng2;
    let t = tan1 * tan2;
    return 2 * Math.atan2(t * Math.sin(deltaLng), 1 + t * Math.cos(deltaLng));
};


export function  GetCenterOfExtent(extent) {
    let x = extent[0] + (extent[2] - extent[0]) / 2;
    let y = extent[1] + (extent[3] - extent[1]) / 2;

    return [x, y];
};