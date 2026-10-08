var $skinConfig = {};
// 909新增关闭个性化，得去掉私人FM（猜你喜欢） 取配置
var ifColseRcm = getDataByConfig('Setting', 'personalrecom') === '0';
$(function(){
	// 适配
	windowWidth = window.screen.width;
	// 结束
	getRcmRadioData();
	radioBind();
	$skinConfig = JSON.parse(window.parent.document.getElementById('radio_iframe').getAttribute("data-config"));
});

// 适配
var windowWidth = 0;
$(window).resize(function(){
	windowWidth = window.screen.width;
	setRadioLen();
    var radioIframe = window.parent.document.getElementById('radio_iframe');
    radioIframe.height = $("body").height();
});
// 设置适配尺寸
function setRadioLen(){
	var num = 0;
	target = $(".indexRadioBox  .br_wrap");
	if(windowWidth>=700&&windowWidth<=1116){
		num = 4;
	}else if(windowWidth>=1117&&windowWidth<=1430){
		num = 5;
	}else if(windowWidth>=1431){
		num = 6;
	}
	target.show();
	if(num!=6)$(".indexRadioBox  .br_wrap:gt("+num+")").css("display","none");
}



//获取个性化电台数据并创建个性化电台
function getRcmRadioData(){
	var uid = getUserID("uid");
    var kid = getUserID("devid");
    var login = 0;
    if(uid!=0){
        login = 1;
		}
		var url="http://gxh2.kuwo.cn/newradio.nr?type=22&uid="+uid+"&login="+login+"&kid="+kid+"&size=10&ver="+getVersion()+"&is_new=1&time="+Math.random() + `&notrace=${ifColseRcm ? 1 : 0}`;
		
		// var url="http://60.28.199.23:61000/192.168.204.141.80/newradio.nr?type=22&uid="+uid+"&login="+login+"&kid="+kid+"&size=10&ver="+getVersion()+"&is_new=1&time="+Math.random() + `&notrace=${ifColseRcm ? 1 : 0}`;

		$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(radiodata){
			try{
				var radioobj = eval('('+radiodata+')');
			    if(typeof(radioobj)=="object"&&radioobj.length>0){
			    	createIndexRadio(radioobj);
			    	//刷新、进入页面时获取电台状态
					loadRadioStatus();
					if (radioid) {
						initRadioStatus(parseInt(status,10),radioid);
					}else{
                        initRadioStatus(3);
                    }
			    }else{
			    	$('.indexRadioBox').hide();
			    }
			}catch(e){
				$('.indexRadioBox').hide();
			}
		},
		error:function(){
			//隐藏该模块
			$('.indexRadioBox').hide();
		}
    });
}

function createIndexRadio(data){
	//模板样式(注意用用原生获取)
	//解析一次模板
	var model = loadTemplate('#kw_radiolistModel');

	var len =data.length;
	if(len>6) {
		// 个性化关闭 取前7个
		data.length = ifColseRcm ? 7 : 6;
	}
	for(var i=0; i<data.length; i++){
		data[i].indexnum = i;
	}
	//获取数据拼接完成后的html字符串
	var str;
	// 909新增关闭个性化，得去掉私人FM 取配置
	if (ifColseRcm) {
		str = drawListTemplate(data, model, proIndexRadioData);
	} else {
		str = CreatePrivFMBlock()+drawListTemplate(data, model, proIndexRadioData);
	}

	$('.kw_indexRadio').html(str);
	// 适配
	setRadioLen();
	var flag = true;
	$(".kw_indexListBox img").load(function(){
		if(flag){
			flag = false;
			var radioIframe = window.parent.document.getElementById('radio_iframe');
	    	radioIframe.height = $("body").height();
	    	$('.br_name').show();
		}
	});
	onSkinChange($skinConfig);
}
function proIndexRadioData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
  var disname = checkSpecialChar(obj.disname,"disname") || checkSpecialChar(name,"disname");
  var titlename = checkSpecialChar(disname,"titlename");
  var pic = obj.pic;
  var index = obj.indexnum+1;
  var radioClass = 'radio_' + obj.sourceid.split(',')[0];
  var id = obj.sourceid.split(',')[0];
  obj.extend = obj.extend+ "|RADIO_PIC=" + pic + "|DIS_NAME=" + disname + "|" ;

  var r = Math.ceil(index/5);
  var l = index%5 || 5;
	var pos = r + ',' + l;
	var gps = "2,1";
	var fpage = "首页";
	var dtid = obj.sourceid.split(",")[0];
  var listen = FormatRadioListenersNum(obj.info);
	var click = commonClickString(new Node(obj.source,obj.sourceid.replace(/\'/g,"\\'"),disname.replace(/\'/g,"\\'"),id,obj.extend.replace(/\'/g,"\\'")));
	var log = 'radioLog(\'POSITION:'+pos+'|GPOSITION:'+gps+'|FROMPAGE:'+fpage+'|RADIOID:'+dtid+'|CSRCTAG:'+disname.replace(/\'/g,"\\'")+'\'); ';
	// 图片高斯处理
	pic = 'http://star.kwcdn.kuwo.cn/star/radio/blur/' + dtid + '.jpg?' + GenRadioRandomsufix(6);
	var	imgstr = `<img class="lazy" src="${pic}" onerror="imgOnError(this,150)" />`;
	json = {
		'name':name,
		'disname':disname,
		'titlename':titlename,
		'imgstr':imgstr,
		'radioClass':radioClass,
		'click':click,
		'log':log,
    'listnum':listen,
	};
	return json;
}
//个性化电台结束

//电台部分
var radioid = 0;
var status = '';
function loadRadioStatus() {
	var call = "GetRadioNowPlaying";
    var str = callClient(call);
	radioid = getValue(str,'radioid');
	status = getValue(str,'playstatus');
}

function radioBind(){
	$(".kw_indexRadio .br_name a").live("mouseenter",function(){
		$(this).css("color",$skinConfig.linkColor);
	});
	$(".kw_indexRadio .br_name a").live("mouseleave",function(){
		$(this).css("color",'');
	});
}
//电台部分结束

//登录退出相关
// 客户端登录成功后 回调网页方法
function OnLogin_radio(param) {
    var userid = getUserID("uid");
    if(userid!=0){
		getRcmRadioData();
	}
}

// 客户端登录后退出 回调
function OnLogout_radio() {
	getRcmRadioData();
}
//结束

function onSkinChange(skinConfig) {
	$skinConfig = skinConfig;
	$(".kw_indexRadio .br_name a").removeClass().addClass(skinConfig.type);
}

// 私人电台
function CreatePrivFMBlock(){
    var info = GetFMInfo();
    if( info == '' || info == null ){
        return;
    }
    var infoObj = eval('(' + info + ')');
    var desObj = infoObj.musicradiolists[0];
    return BuildFMString(desObj);
}
function GetFMInfo(){
    var call = 'GetPrivFMInfo';
    var rst = callClient(call);
    return rst;
}
function BuildFMString(jsonObj){

    var clickstr = '';
    var strId = '';
    var strImg = '';

    if( jsonObj == '' || jsonObj == null ){
        clickstr = BuildFMClickStr(0);
        strId = PRIV_FM_ID;
    }else{
        clickstr = BuildFMClickStr(1,jsonObj);
        strId = jsonObj.id;
    }

    strImg = 'http://star.kwcdn.kuwo.cn/star/radio/blur/' + strId + '.jpg?' + GenRadioRandomsufix(6);
    var ClkStr = clickstr;

    var radiolist = [];
    radiolist[radiolist.length] = '<li class="br_wrap radio_' + strId + '" id="' + strId + '"';
    radiolist[radiolist.length] = '>';
    radiolist[radiolist.length] = '<a _onclick="' + ClkStr + '"' + 'onclick="' + ClkStr + '"' + 'title="猜你喜欢" bTypeSec="1" class="br_pic"  href="###" hidefocus>';
    radiolist[radiolist.length] = '<div class="cover"><img class="lazy lazyorig" src="'+strImg+'" onerror="imgOnError(this,150)"/></div>';
    radiolist[radiolist.length] = '<span class="br_shade"></span>';
    radiolist[radiolist.length] = '<i title="直接播放" class="i_play"></i>';
    radiolist[radiolist.length] = '<i class="i_playing"></i>';
    radiolist[radiolist.length] = '<i title="暂停播放" class="i_pause"></i>';
    radiolist[radiolist.length] = '<i title="" class="i_stop"></i>';
    radiolist[radiolist.length] = '</a><p class="br_name"><a href="javascript:void(0)" onclick="'+ ClkStr + '"' + 'title="猜你喜欢">猜你喜欢</a></p>';
    radiolist[radiolist.length] = '<p id="scroll_info" class="br_info"><a id="songinfo_' + strId + '"></a></p></li>';

    var str = radiolist.join("");
    radiolist = [];
    return str;
}
function BuildFMClickStr(ntype,jsondata){
    if( ntype = '0' ){
        var log = "radioLog('POSITION:1,3|GPOSITION:2,1|FROMPAGE:我的电台|RADIOID:-26711|CSRCTAG:猜你喜欢');"
		var radioclick = "commonClick({'source':'9','sourceid':'-26711,猜你喜欢,http://img1.kwcdn.kuwo.cn:81/star/tags/201510/1446035835261.jpg,http://img1.kwcdn.kuwo.cn:81/star/tags/201510/1446035849351.jpg,2008-08-08,2014-06-16,4,0~24,907,4,1','name':'猜你喜欢','id':'-26711','extend':'|RADIO_PIC=http://img1.sycdn.kuwo.cn/star/rcm/radio/26711.png|DIS_NAME=猜你喜欢|'})";
        return (log + radioclick);
    }else if( ntype == '1' ){

        var onclick = "radioLog('POSITION:1,1|GPOSITION:1,1| FROMPAGE:我的电台| RADIOID:" + jsondata.id + '|CSRCTAG:' + jsondata.name + "');";
        var commonclick = "commonClick({'source':'4','sourceid':'" + jsondata.id + ",";
        commonclick += jsondata.name + "," + jsondata.radiopicnp + "," + jsondata.radiopicpl + ",";
        commonclick += jsondata.upatetime + "," + jsondata.latesttime + "," + jsondata.type + ",";
        commonclick += jsondata.playtime + "," + jsondata.listeners + "," + jsondata.type + ",";
        commonclick += "1',";
        commonclick += "'name'" + ":" + "'" + jsondata.name + "'" + "," + "'id'" + ":" + "'" + jsondata.listeners + "'" + ",";
        commonclick += "'extend'" + ":" + "'|" + 'RADIO_PIC=' + jsondata.radiopic + '|' + 'DIS_NAME=' + jsondata.name + "|','tagIndex':'1'";
        commonclick += "})";
        onclick += commonclick;
        return onclick;
    }
}
function GenRadioRandomsufix(nlen) {
    var randomnum = '';
    var len = parseInt(nlen);
    if (len <= 0) {
        return randomnum;
    }
    for (var index = 0; index < nlen; index++) {
        randomnum += Math.floor(Math.random() * 10);
    }
    return randomnum;
}
