// 复制到dist目录，并修改index.html,去掉config.js的路径
let _OrganizationName = "武汉工程大学";
let _SystemName = '智慧供水管网信息平台';

let config = {
    version: '2020.9.1',

    AppUrl: getRootPath() + '/index.html',

    AppLoginUrl: getRootPath() + '/login.html',

    AppGeoServerj_spring_security_checkUrl: getLocalhostPath() + '/geoserver/j_spring_security_check',

    //组织机构名称
    OrganizationName: _OrganizationName,
    //系统名称
    SystemName: _SystemName,
    //地图默认标题
    // Title: '武汉工程大学供水管网信息系统',
    Title: _OrganizationName + _SystemName,

    //系统未操作未使用待机时间（默认5分钟，超过该时间重新登录）
    SleepLoginMinutes: 24 * 60 * 60 * 1000,

    //地图geoserver的WFS服务url接口
    // wfsurl: 'http://' + location.host + '/geoserver/pggis/wfs',
    wfsurl: getLocalhostPath() + '/geoserver/pggis/wfs',
    //地图命名空间
    // Mapnamespace: 'http://' + location.host + '/map/pggis',
    Mapnamespace: getLocalhostPath() + '/map/pggis',

    //地图图层的工作空间
    Mapworkspace: 'pggis',
    //坐标系代码
    MapsrsName: 'EPSG:4326',

    //控制台调试显示
    consolelogOn:true,

    //默认地图显示位置
    mapcenter: [114.3849, 30.5048],
    //默认地图显示层级
    defaultzoom: 18,
    //地图最大显示层级
    maxZoom: 22,
    //地图最小显示层级
    minZoom: 10,
    //地图显示限制范围
    extent: [114.30, 30.30, 114.50, 30.60],
 
    //高亮颜色
    hightlightcolor: 'rgba(255, 0, 0, 0.85)',

    //地图热点位置
    hotpoints: [
        { name: "武昌校区", location: [114.3849, 30.5048] },
        { name: "流芳校区", location: [114.4269, 30.4650] }

    ],

    //地图图层及其属性字段中文字典,次序为图层面板的次序，显示次序见index.js图层创建次序，
    //name：图层名称
    //chinesename：图层中文别名
    //ShowInfo:是否查询信息时可见
    //ShowInLayerTable:是否在图层控制时可见
    //fields:图层数据库字段及其中文别名字典
    //查询信息时仅显示fields中的字段， 显示顺序按照fields的字段顺序。
    //图层名称和中文名称不允许修改，其它参数根据需要可修改，字段中文别名可根据需要按照数据库表字段对应进行增删或修改
    wfslayers: [
    {
        name: "js_pipe",
        chinesename: "供水管道",
        MinZoom: 17,
        ShowInfo: true,
        ShowInLayerTable: true,
        fields: {           
            // "name": "名称",
            // "lineid": "管线编号",
            // "startpid": "起点编号",
            // "endpid": "终点编号",
            "category": "类型",
            "diameter": "口径",
            "spec": "规格",
            "material": "材质",
            "pression": "压力类型",
            "usetype": "管道用途",
            "setuptype": "埋设方式",
            "shape_leng": "长度",
            "setupdate": "安装日期",
            "road": "所在道路",
            "owner": "权属单位",
            "x1": "起点经度",
            "y1": "起点纬度",
            "z1": "起点高程",
            "x2": "止点经度",
            "y2": "止点纬度",
            "z2": "止点高程",
            // "label": "标签",
            // "remark": "备注",
        }
    },
    {
        name: "js_point",
        chinesename: "供水管点",
        MinZoom: 18.5,
        ShowInfo: true,
        ShowInLayerTable: true,
        fields: {
            "name": "名称",
            "pointid": "管点编号",
            "category": "类型",
            "model": "型号",
            "diameter": "口径",
            "appendages": "附属物",
            "material": "材质",
            "spec": "规格",
            "road": "道路",
            "owner": "权属单位",
            "setupdate": "安装日期",
            "groundz": "地面高程",
            "depth": "埋深",
            "ison": "是否开启",
            // "X": "X",
            // "Y": "Y",
            "label": "标签",
            "remark": "备注"
        }
    },{
        name: "building",
        chinesename: "建筑",
        MinZoom: 14,
        ShowInfo: true,
        ShowInLayerTable: true,
        fields: {
            // "ID": "编号",
            "name": "名称",
            "category": "类型",
            "function": "建筑功能",
            "floors": "楼层",
            "structure": "结构",
            "owner": "权属单位",
            // "Shape_Leng": "长度",
            // "Shape_Area": "面积",
            "area": "占地面积",
            "floorarea": "建筑面积",
            "groundz": "地面高程",
            "height": "建筑净高",
            "builtdate": "建设日期",
            "builder": "建设单位",
            "address": "地址",
            "remark": "备注",
        }

    },
    {
        name: "water",
        chinesename: "水系",
        MinZoom: 10,
        ShowInfo: false,
        ShowInLayerTable: true,
        fields: {
            "name": "名称",
            "category": "类型",
            "shape_leng": "长度",
            "shape_area": "面积",
            "remark": "备注"
        }
    },
    {
        name: "terrain",
        chinesename: "地形地貌",
        MinZoom: 18,
        ShowInfo: false,
        ShowInLayerTable: true,
        fields: {
            "name": "名称",
            "category": "类型",
            "shape_leng": "长度",
            "shape_area": "面积",
            "remark": "备注"
        }
    },
    {
        name: "zone",
        chinesename: "地块",
        MinZoom: 10,
        ShowInfo: false,
        ShowInLayerTable: false,
        fields: {
            "name": "名称",
            "category": "类型",
            "shape_leng": "长度",
            "shape_area": "面积",
            "remark": "备注"
        }
    },
    {
        name: "road",
        chinesename: "道路",
        MinZoom: 10,
        ShowInfo: false,
        ShowInLayerTable: false,
        fields: {
            "name": "名称",
            "category": "类型",
            "shape_leng": "长度",
            "shape_area": "面积",
            "remark": "备注"
        }
    },
    {
        name: "maprange",
        chinesename: "图廓",
        MinZoom: 10,
        ShowInfo: false,
        ShowInLayerTable: false,
        fields: {
            "name": "名称",
            "category": "类型",
            "shape_leng": "长度",
            "shape_area": "面积",
            "remark": "备注"
        }

    },
    {
        name: "pumproom",
        chinesename: "泵房",
        MinZoom: 16,
        ShowInfo: true,
        ShowInLayerTable: true,
        fields: {
            "name": "名称",
            "category": "泵房级别",
            "pression": "转压类型",
            "capacity": "水池容量",
            // "highlevel":"设计最高水位",
            // "lowlevel":"设计最低水位",
            // "stdlevel":"设计正常水位",
            // "pressin":"设计进水压力",
            // "pressout":"设计出水压力",
            "pumpnum": "机组数量",
            "spec": "装机规格",
            "builtdate": "建造年代",
            // "remark": "备注",
            "owner": "权属单位",
        }
    }
    ],

    // 拓扑参数设置
    toposetting: {


        //建筑图层（停水分析需要，注意拓扑分析的三个图层必须完整加载，方便基于前端的拓扑分析计算）
        buildinglayername: "building",

        //拓扑管线图层名称
        pipelayername: "js_pipe",

        //拓扑管点图层名称
        nodelayername: "js_point",


        // //管线要素唯一性标识字段名
        // pipegidfieldname: "gid",
        //管线起止点字段与管点id字段关联一致
        //管线起点字段名
        startnodeidfieldname: "startpid",
        //管线止点字段名
        endnodeidfieldname: "endpid",
        //管线连接类型字段名（点连接关系0表示双向，1表示单向起点至止点，2表示单向止点到起点，3表示断开）
        linktypefieldname: "linktype",




        //管点id字段名（与管线起止点字段内容一致）
        nodepidfieldname: "pointid",

        // //管点要素唯一性标识字段名
        // nodegidfieldname: "gid",

        //管点是否开关字段名
        nodeisonfieldname: "ison",

        //管点图层节点类型字段名
        nodetypefieldname: "category",

        // 管点图层节点类型字段对应的类型内容
        nodetype: {

            //阀门节点类型名称——FM
            valvenames: ["阀门", "闸阀", "蝶阀"],

            //水表类型名称——SB
            meternames: ["水表", "水表井", "水表(井)", "水表（井）", "计量表",],

            //储水池节点类型名称——SC
            reservoirnames: ["水池", "水塔", "蓄水池"],

            //逆止阀节点类型名称——NZ
            nzvalvenames: ["逆止阀", "单向阀", "止回阀", "回流阀", "隔离阀"],

            //水泵节点类型名称——PB
            pumpames: ["水泵", "加压泵"],

            //水源节点类型名称——SY
            sourcenames: ["水源", "水源点", "市政取水点" ],

            //其它节点统一为——JD
        }
    }

};

function getRootPath() {

    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp      
    var curWwwPath = window.document.location.href;
    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp      
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083      
    var localhostPath = curWwwPath.substring(0, pos);
    //获取带"/"的项目名，如：/uimcardprj      
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
    return (localhostPath + projectName);
}

function getLocalhostPath() {
    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp      
    var curWwwPath = window.document.location.href;
    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp      
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083      
    var localhostPath = curWwwPath.substring(0, pos);
    return localhostPath;
}