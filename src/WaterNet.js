/*
使用方法：

let Waternet=CreateWaterNet();      //定义Waternet对象
Waternet.Loaddata(jstopos, brokenpipefidlist);  //加载数据（jstopos——管线管点拓扑关系集合；brokenpipefidlist——故障管道fid集合）
Waternet.AnalysisCloseValves();         //关阀分析，获取必须关闭阀门和可以不关的阀门管点MustCloseValves、NotToCloseValves

结果：
Waternet.MustCloseValves    必须关闭阀门管点（WaterNode集合）
Waternet.NotToCloseValves   可以不关的阀门管点（WaterNode集合）

管点WaterNode属性：
fid——要素fid
IsOn——是否开启
Type——管点类型 
Flag——是否有水
Links——连接管点fid

*/






export function CreateWaterNet() {

    let WaterNet = new Object();

    //管道
    WaterNet.jspipes = [];
    WaterNet.jspoints = [];
    //节点
    WaterNet.WaterNodes = [];

    //故障管道拓扑对象集合
    WaterNet.brokenpipefidlist = [];

    //应该关闭的闸门（初步搜索结果）
    WaterNet.ShouldCloseValves = [];

    //必须关闭阀门
    WaterNet.MustCloseValves = [];

    //可不关阀门
    WaterNet.NotToCloseValves = [];

    //无水设施
    WaterNet.NoWaterNodes = [];

    //无水管道
    WaterNet.NoWaterPipes = [];
    WaterNet.brokenpipelinknodeidlist = [];


    // console.log(config.toposetting.nodetype);
    //阀门节点类型名称——FM
    // WaterNet.valvenames = ["阀门", "闸阀", "蝶阀"];
    WaterNet.valvenames = config.toposetting.nodetype.valvenames;
    //水表类型名称——SB
    // WaterNet.meternames = ["水表", "水表井", "水表(井)", "水表（井）", "计量表",];
    WaterNet.meternames = config.toposetting.nodetype.meternames;

    //储水池节点类型名称——SC
    // WaterNet.reservoirnames = ["水池", "水塔", "蓄水池"];
    WaterNet.reservoirnames = config.toposetting.nodetype.reservoirnames;

    //逆止阀节点类型名称——NZ
    // WaterNet.nzvalvenames = ["逆止阀", "单向阀", "止回阀", "回流阀", "隔离阀"];
    WaterNet.nzvalvenames = config.toposetting.nodetype.nzvalvenames;

    //水泵节点类型名称——PB
    // WaterNet.pumpames = ["水泵", "加压泵"];
    WaterNet.pumpames = config.toposetting.nodetype.pumpames;

    //水源节点类型名称——SY
    // WaterNet.sourcenames = ["水源", "水源点", "市政取水点"];
    WaterNet.sourcenames = config.toposetting.nodetype.sourcenames;





    //设置初始数据
    WaterNet.initializedata = function (jspipes, jspoints, brokenpipefidlist) {
        WaterNet.jspipes = jspipes;
        WaterNet.jspoints = jspoints;
        WaterNet.brokenpipefidlist = brokenpipefidlist;

        // console.log("WaterNet.initializedata:");
        // console.log(WaterNet.jspipes);
        // console.log(WaterNet.jspoints);
        // console.log(WaterNet.brokenpipefidlist);
    }


    //根据（管点要素）信息创建拓扑点，定义点类型简称
    WaterNet.CreateWaterNode = function (fid, pointid, nodeison, nodetype) {
        let pnode = new Object();
        pnode.fid = fid;
        // pnode.fid = fid;
        pnode.pointid = pointid;
        pnode.IsOn = nodeison;
        pnode.Flag = false;
        //默认点类型简称为JD——节点 （简称是方便统一节点计算识别）
        pnode.Type = nodetype;

        //设置阀门和水源点节点类型，水源点有水标识
        // console.log(WaterNet.valvenames);


        if (WaterNet.valvenames.findIndex(e => e === nodetype) > -1) pnode.Type = "FM";

        if (WaterNet.meternames.findIndex(e => e === nodetype) > -1) pnode.Type = "SB";

        if (WaterNet.reservoirnames.findIndex(e => e === nodetype) > -1) pnode.Type = "SC";

        if (WaterNet.nzvalvenames.findIndex(e => e === nodetype) > -1) pnode.Type = "NZ";

        if (WaterNet.pumpames.findIndex(e => e === nodetype) > -1) pnode.Type = "PB";

        if (WaterNet.sourcenames.findIndex(e => e === nodetype) > -1) { pnode.Type = "SY"; pnode.Flag = true; }

        // pnode.NZnode = null;
        pnode.Links = new Array();

        return pnode;
    }


    //根据管点要素生成拓扑管点
    WaterNet.CreateWaterNodeByFeature = function (pointfeature) {
        let wn = null;
        let fid = pointfeature.getId();
        let properties = pointfeature.getProperties();
        // let fid = parseInt(properties["fid"]);
        // let pointid = properties["pointid"];
        // let nodeison = properties["ison"];
        // let nodetype = properties["category"];

        // let fid = parseInt(properties[config.toposetting.nodefidfieldname]);
        let pointid = properties[config.toposetting.nodepidfieldname];
        let nodeison = properties[config.toposetting.nodeisonfieldname];
        let nodetype = properties[config.toposetting.nodetypefieldname];

        wn = WaterNet.CreateWaterNode(fid, pointid, nodeison, nodetype);
        return wn;
    }
    //根据管点要素集合生成拓扑管点
    WaterNet.CreateWaterNodesByFeatures = function (jspoints) {
        let WaterNodes = [];
        for (let i = 0, len = jspoints.length; i < len; i++) {
            let wn = WaterNet.CreateWaterNodeByFeature(jspoints[i]);
            WaterNodes.push(wn);
        }
        return WaterNodes;
    }

    //对拓扑管点集合WaterNodes建立自上而下的管点拓扑关系（从水源点开始搜索停水分析）
    WaterNet.CreateWaterNodesTopoDown = function (WaterNodes, jspipes, brokenpipefidlist) {
        if (WaterNodes == undefined || WaterNodes.length < 1) return false;
        if (jspipes == undefined || jspipes.length < 1) return false;

        //清空管点拓扑关系
        for (let i = 0, len = WaterNodes.length; i < len; i++) {
            WaterNodes[i].Links.length = 0;
        }

        //创建拓扑
        for (let i = 0, len = jspipes.length; i < len; i++) {
            let f = jspipes[i];
            let fid = f.getId();
            let properties = f.getProperties();
            // let pipefid = parseInt(properties["fid"]);  //管线pipe的fid 
            // let startpid = properties["startpid"];
            // let endpid = properties["endpid"];
            // let linktype = parseInt(properties["linktype"]);

            // let pipefid = parseInt(properties[config.toposetting.pipefidfieldname]);  //管线pipe的fid 
            let pipefid = fid  //管线pipe的fid 
            let startpid = properties[config.toposetting.startnodeidfieldname];
            let endpid = properties[config.toposetting.endnodeidfieldname];
            let linktype = parseInt(properties[config.toposetting.linktypefieldname]);


            let startwn = WaterNodes.find(p => p.pointid == startpid);

            let endwn = WaterNodes.find(p => p.pointid == endpid);

            if (startwn === null || startwn === undefined) {
                console.log('管线【fid:' + pipefid + '】起点【pointid:' + startpid + '】不在管点数据表中');
            }
            if (endwn === null || endwn === undefined) {
                console.log('管线【fid:' + pipefid + '】止点【pointid:' + endpid + '】不在管点数据表中');
            }

            // console.log(startwn);
            // console.log(endwn);

            if (startwn === undefined || endwn === undefined) continue;

            if (brokenpipefidlist && brokenpipefidlist.length > 0) {
                if (brokenpipefidlist.find(e => e == pipefid)) {
                    WaterNet.brokenpipelinknodeidlist.push(startwn.fid);
                    WaterNet.brokenpipelinknodeidlist.push(endwn.fid);
                    continue;
                }
            }

            ///以下创建自上而下的拓扑关系 

            //如果该管线的连接方式不为0（双向）或1（起点到止点）或2（止点到起点），则不纳入该管线到点拓扑关系
            if (linktype != 0 && linktype != 1 && linktype != 2) continue;



            //起点拓扑点链接点集不包含终点点号，且连接方式为双向0或者单向1（起点到止点），且起点设施开启,则将终点点号添加到点集。
            //三通四通节点有3/4个连接点，末端（管堵、官帽、排水、排泥、水龙头、用水点、消防）仅一个连接点，其它均两个连接点         
            if (startwn.Links.findIndex(e => e.fid == endwn.fid) < 0) {
                if (linktype == 0 || linktype == 1)
                    startwn.Links.push(endwn);
            }


            //终点拓扑点链接点集不包含起点点号，且连接方式为双向0或者单向2（终点到起点），且终点设施开启，则将终点点号添加到点集 
            // if (!endpoint.Links) endpoint.Links = [];
            if (endwn.Links.findIndex(e => e.fid == startwn.fid) < 0) {
                if (linktype == 0 || linktype == 2)
                    endwn.Links.push(startwn);
            }

        }
        return true;
    }
    //对拓扑管点集合WaterNodes建立自下而上的拓扑关系（从节点开始搜索阀门或水源点）
    WaterNet.CreateWaterNodesTopoUp = function (WaterNodes, jspipes, brokenpipefidlist) {
        // console.log(jspipes);
        if (WaterNodes == undefined || WaterNodes.length < 1) return false;
        if (jspipes == undefined || jspipes.length < 1) return false;
        //清空管点拓扑关系
        for (let i = 0, len = WaterNodes.length; i < len; i++) {
            WaterNodes[i].Links.length = 0;
        }

        //创建拓扑
        for (let i = 0, len = jspipes.length; i < len; i++) {
            let f = jspipes[i];
            let fid = f.getId();
            let properties = f.getProperties();
            // let pipefid = parseInt(properties["fid"]);  //管线pipe的fid 
            // let startpid = properties["startpid"];
            // let endpid = properties["endpid"];
            // let linktype = parseInt(properties["linktype"]);


            // let pipefid = parseInt(properties[config.toposetting.pipefidfieldname]);  //管线pipe的fid 
            let pipefid = fid;
            let startpid = properties[config.toposetting.startnodeidfieldname];
            let endpid = properties[config.toposetting.endnodeidfieldname];
            let linktype = parseInt(properties[config.toposetting.linktypefieldname]);

            let startwn = WaterNodes.find(p => p.pointid == startpid);

            let endwn = WaterNodes.find(p => p.pointid == endpid);

            if (startwn == null || startwn == undefined) {
                console.log('管线【fid:' + pipefid + '】起点【pointid:' + startpid + '】不在管点数据表中');
            }
            if (endwn == null || endwn == undefined) {
                console.log('管线【fid:' + pipefid + '】止点【pointid:' + endpid + '】不在管点数据表中');
            }

            // console.log(startwn);
            // console.log(endwn);

            if (startwn == null || endwn == null) continue;

            if (brokenpipefidlist && brokenpipefidlist.length > 0) {
                if (brokenpipefidlist.find(e => e == pipefid)) {
                    WaterNet.brokenpipelinknodeidlist.push(startwn.fid);
                    WaterNet.brokenpipelinknodeidlist.push(endwn.fid);
                    continue;
                }
            }


            ///以下创建自上而下的拓扑关系 

            //如果该管线的连接方式不为0（双向）或1（起点到止点）或2（止点到起点），则不纳入该管线到点拓扑关系
            if (linktype != 0 && linktype != 1 && linktype != 2) continue;

            //起点拓扑点链接点集不包含终点点号，且连接方式为双向0或者单向1（起点到止点），且起点设施开启,则将终点点号添加到点集。
            //三通四通节点有3/4个连接点，末端（管堵、官帽、排水、排泥、水龙头、用水点、消防）仅一个连接点，其它均两个连接点         
            if (startwn.Links.findIndex(e => e.fid == endwn.fid) < 0) {
                if (linktype == 0 || linktype == 2)
                    startwn.Links.push(endwn);
            }


            //终点拓扑点链接点集不包含起点点号，且连接方式为双向0或者单向2（终点到起点），且终点设施开启，则将终点点号添加到点集 
            // if (!endpoint.Links) endpoint.Links = [];
            if (endwn.Links.findIndex(e => e.fid == startwn.fid) < 0) {
                if (linktype == 0 || linktype == 1)
                    endwn.Links.push(startwn);
            }

        }
        return true;
    }



    // 停水（含关阀）分析
    // 停水分析主程序 
    // 用法：调用AnalysisNoWaterNodes()后，再调GetNoWaterNodes("YS") 得到无水的（用水点或其它）节点结果
    WaterNet.AnalysisNoWater = function () {
        WaterNet.ShouldCloseValves.length = 0;
        WaterNet.MustCloseValves.length = 0;
        WaterNet.NotToCloseValves.length = 0;
        WaterNet.NoWaterNodes.length = 0;
        WaterNet.NoWaterPipes.length = 0;


        WaterNet.WaterNodes = WaterNet.CreateWaterNodesByFeatures(WaterNet.jspoints);
        WaterNet.CreateWaterNodesTopoDown(WaterNet.WaterNodes, WaterNet.jspipes, WaterNet.brokenpipefidlist);
        // console.log(WaterNet.WaterNodes);
        WaterNet.ShouldCloseValves = WaterNet.CalShouldCloseValveNodes(WaterNet.WaterNodes);




        WaterNet.MustCloseValves = WaterNet.GetMustCloseValves(WaterNet.WaterNodes, WaterNet.ShouldCloseValves);

        WaterNet.NotToCloseValves = WaterNet.GetNotToCloseValves(WaterNet.ShouldCloseValves, WaterNet.MustCloseValves)

        WaterNet.WaterSuply(WaterNet.WaterNodes, WaterNet.ShouldCloseValves);

        for (let i = 0, len = WaterNet.WaterNodes.length; i < len; i++) {
            let wn = WaterNet.WaterNodes[i];
            if (!wn.Flag) WaterNet.NoWaterNodes.push(wn);
        }

        // console.log("WaterNet.NoWaterNodes");
        // console.log(WaterNet.NoWaterNodes);

        for (let i = 0, len = WaterNet.jspipes.length; i < len; i++) {
            let pipe = WaterNet.jspipes[i];

            let properties = pipe.getProperties();
            // let pipefid = parseInt(properties["fid"]);  //管线pipe的fid 
            // let startpointid = properties["startpid"];
            // let endpointid = properties["endpid"];


            // let pipefid = parseInt(properties[config.toposetting.pipefidfieldname]);  //管线pipe的fid 
            let pipefid = pipe.getId();
            let startpointid = properties[config.toposetting.startnodeidfieldname];
            let endpointid = properties[config.toposetting.endnodeidfieldname];



            if (WaterNet.NoWaterPipes.findIndex(e => e.fid == pipefid) >= 0) continue;
            if (WaterNet.brokenpipefidlist.findIndex(e => e == pipefid) >= 0) {
                WaterNet.NoWaterPipes.push(pipe);
            }
            // let k1 = WaterNet.NoWaterNodes.findIndex(e => e.pointid === startpointid);
            // // if (k1 > -1) {
            // //     if (!WaterNet.NoWaterNodes[k1].Flag) WaterNet.NoWaterPipes.push(pipe);
            // // }

            // let k2 = WaterNet.NoWaterNodes.findIndex(e => e.pointid === endpointid);
            // if (k2 > -1) {
            //     if (!WaterNet.NoWaterNodes[k2].Flag) WaterNet.NoWaterPipes.push(pipe);
            // }

            let k1 = WaterNet.NoWaterNodes.findIndex(e => e.pointid === startpointid);

            let k2 = WaterNet.NoWaterNodes.findIndex(e => e.pointid === endpointid);
            if (k1 > -1 && k2 > -1) {
                if ((WaterNet.NoWaterNodes[k1].Flag == false) && (WaterNet.NoWaterNodes[k2].Flag == false))
                    WaterNet.NoWaterPipes.push(pipe);
            }
        }
        // console.log("停水管线：");
        // console.log(WaterNet.NoWaterPipes);

    }

    //关阀分析
    WaterNet.AnalysisCloseValves = function () {
        //清空结果
        WaterNet.ShouldCloseValves.length = 0;
        WaterNet.MustCloseValves.length = 0;
        WaterNet.NotToCloseValves.length = 0;
        WaterNet.NoWaterNodes.length = 0;
        WaterNet.NoWaterPipes.length = 0;

        if (WaterNet.brokenpipefidlist.length < 1) return;

        WaterNet.WaterNodes = WaterNet.CreateWaterNodesByFeatures(WaterNet.jspoints);
        WaterNet.CreateWaterNodesTopoUp(WaterNet.WaterNodes, WaterNet.jspipes, WaterNet.brokenpipefidlist);


        // WaterNet.WaterNodes.forEach(element => {
        //     if (element.Type === "SY")
        //         console.log(element);
        // });
        // console.log(WaterNet.WaterNodes);
        // return;

        // console.log(WaterNet.brokenpipelinknodeidlist);
        // console.log("关阀分析");
        WaterNet.ShouldCloseValves = WaterNet.CalShouldCloseValveNodes(WaterNet.WaterNodes);

        WaterNet.MustCloseValves = WaterNet.GetMustCloseValves(WaterNet.WaterNodes, WaterNet.ShouldCloseValves);

        WaterNet.NotToCloseValves = WaterNet.GetNotToCloseValves(WaterNet.ShouldCloseValves, WaterNet.MustCloseValves)

        // console.log("关阀分析结束");


    }



    //获取所有应该关闭的阀门集合(类型WaterNode),  brokenpipenodes为故障管线的连接节点fid集合
    WaterNet.CalShouldCloseValveNodes = function (WaterNodes) {

        //网络构建及初始化，需在设置好破损管道后再初始化构建网络       
        let shouldclosevalves = [];
        //下面为广度搜索方法

        // 等待搜索的节点(编号)列表
        // 将爆管管道起止点加入到等待搜索的节点(编号)列表
        let searchList = [];
        for (let i = 0, len = WaterNet.brokenpipelinknodeidlist.length; i < len; i++)
            searchList.push(WaterNet.brokenpipelinknodeidlist[i]);

        // console.log("WaterNet.brokenpipelinknodeidlist");
        // console.log(WaterNet.brokenpipelinknodeidlist);

        // console.log(searchList);

        if (!searchList) return;

        let resultList = [];     //关闭阀门(编号)列表
        let searchedList = [];   //己搜索过的节点(编号)列表 

        // 搜索应关闭阀门
        while (searchList.length != 0) {
            let fid = searchList[searchList.length - 1];         //获得等待搜索的节点集合队尾的节点编号-准备搜索的节点
            // searchList.RemoveAt(searchList.length - 1);              //在等待搜索的节点集合中移除准备搜索的节点                
            searchList.pop();

            //获得准备搜索的节点对象,找不到该点则跳过继续
            // let currentNode = WaterNodes.find(p => p.fid == fid);

            let k = WaterNodes.findIndex(p => p.fid == fid);
            if (k < 0) continue;
            let currentNode = WaterNodes[k];




            //节点为阀门且结果中没有的
            if (currentNode.Type === "FM" && currentNode.IsOn === true && resultList.findIndex(e => e === fid) < 0) {

                resultList.push(fid);                             //节点为阀门且结果中没有的节点  放入关闭阀门结果集
            }
            else {
                searchedList.push(fid);                           //放入己访问过的节点集合 
                // 遍历的当前点的连接点集合，已访问过的节点集合中没有某连接点，就把该连接点放入已访问的节点集合
                for (let i = 0, len = currentNode.Links.length; i < len; i++) {
                    let linknode = currentNode.Links[i];
                    if (searchedList.findIndex(e => e == linknode.fid) < 0)
                        searchList.push(linknode.fid);
                }
                //搜索直到所有点都在已访问的节点集合中，searchList（访问过后每次移除）为空时候为止
            }
        }


        for (let i = 0, len = resultList.length; i < len; i++) {
            let fid = resultList[i];
            let wn = WaterNodes.find(p => p.fid === fid);
            if (!wn) continue;
            shouldclosevalves.push(wn);
        }
        return shouldclosevalves;
    }

    //在应关阀门的基础上查找必关闭阀门
    WaterNet.GetMustCloseValves = function (WaterNodes, shouldCloseValves) {

        let mustCloseValves = [];
        for (let i = 0, len = shouldCloseValves.length; i < len; i++) {
            let valvend = shouldCloseValves[i];
            if (WaterNet.ValveFindSY(valvend, WaterNodes, shouldCloseValves)) {
                mustCloseValves.push(valvend);
            }
        }

        return mustCloseValves;

    }

    //获取可关可不关的阀门
    WaterNet.GetNotToCloseValves = function (shouldCloseValves, mustCloseValves) {
        let NotToCloseValves = [];
        for (let i = 0, len = shouldCloseValves.length; i < len; i++) {
            let wn = shouldCloseValves[i];
            //阀门不包含在必关阀门集合中
            if (mustCloseValves.findIndex(p => p.fid == wn.fid) < 0)
                NotToCloseValves.push(wn);
        }
        return NotToCloseValves;
    }


    //判断节点（阀门）是否可以找到水源（在初步关阀的基础上） 由末端到水源
    WaterNet.ValveFindSY = function (nd, WaterNodes, shouldCloseValveList) {
        let canFindSY = false;

        if (nd.Links.length < 1) return false;

        //下面为广度搜索方法
        let searchList = [];     //等待搜索的节点(编号)列表

        // 将阀门起止点加入到等待搜索的节点(编号)列表
        for (let i = 0, len = nd.Links.length; i < len; i++) {
            searchList.push(nd.Links[i].fid);
        }

        let searchedList = [];   //己搜索过的节点(编号)列表,开始为关闭阀门节点编号集合
        for (let i = 0, len = shouldCloseValveList.length; i < len; i++) {
            searchedList.push(shouldCloseValveList[i].fid);
        }

        // 搜索水源,随便找到哪个水源点就判断为有水
        while (searchList.length != 0) {
            let fid = searchList[searchList.length - 1];         //获得等待搜索的节点集合队尾的节点编号-准备搜索的节点 
            //在等待搜索的节点集合中移除准备搜索的节点
            searchList.pop();
            //获得准备搜索的节点对象 
            let k = WaterNodes.findIndex(p => p.fid == fid);
            let currentNode = WaterNodes[k];

            if (currentNode.Type === "SY") {
                // console.log(currentNode);
                //节点为为水源 
                return true;

            } else {
                searchedList.push(fid);
                //将该节点的连接节点放入到待访问的节点中,如果已经访问过则不放入 
                for (let i = 0, len = currentNode.Links.length; i < len; i++) {
                    let wn = currentNode.Links[i];
                    let c1 = searchedList.findIndex(e => e == wn.fid);
                    let c2 = searchList.findIndex(e => e == wn.fid);
                    if (c1 < 0 && c2 < 0) {
                        // console.log("c1:"+c1+",c2:"+c2,"wn.fid:"+wn.fid);
                        searchList.push(wn.fid);
                    }
                }
            }
        }

        return canFindSY;
    }


    //从应关阀门拓扑点集移除的拓扑连接关系
    WaterNet.ResetWaterNodesTopobyCloseValves = function () {
        //移除应关阀门点的连通关系——首先是本点的连接集合清空；其次本点连接点的连接集合移除本点点号
        if (!WaterNet.ShouldCloseValves || WaterNet.ShouldCloseValves.length < 1) return;
        for (let i = 0, len = WaterNet.ShouldCloseValves.length; i < len; i++) {
            let me = WaterNet.ShouldCloseValves[i];
            //首先是本点的连接集合清空
            me.Links.length = 0;

            //其次遍历本点连接点，将连接点的连接集合移除本点点号
            for (let j = 0, len = me.Links.length; j < len; j++) {
                let wn = me.Links[j];
                if (!wn) continue;
                //连接点的连接集合中移除(过滤)当前阀门点号
                wn.Links = wn.Links.filter(e => e.fid != me.fid);
            }
        }
    }






    /// <summary>
    /// 供水计算，广度搜索 从水源点开始感染计算连通节点有水（未连通的无水)
    /// </summary>
    /// <param name="SourceNodes"></param>
    WaterNet.WaterSuply = function (WaterNodes, ShouldCloseValves) {
        let SearchingNodes = [];
        for (let i = 0, len = WaterNodes.length; i < len; i++) {
            let wn = WaterNodes[i];
            wn.Flag = false;
            if (wn.Type === "SY") {
                wn.Flag = true;
                SearchingNodes.push(wn);
            }
        }


        let SearchedNodes = [];

        while (SearchingNodes.length != 0) {
            let node = SearchingNodes[SearchingNodes.length - 1];
            SearchingNodes.pop(node);
            SearchedNodes.push(node);

            if (ShouldCloseValves.findIndex(e => e.fid == node.fid) >= 0)
                node.Flag = false;
            else {
                for (let i = 0, len = node.Links.length; i < len; i++) {
                    let wn = node.Links[i];
                    if (SearchedNodes.findIndex(e => e.fid == wn.fid) < 0) {
                        if (node.Flag) wn.Flag = true;
                        SearchingNodes.push(wn);

                    }
                }
            }


        }

    }

    return WaterNet;
}

