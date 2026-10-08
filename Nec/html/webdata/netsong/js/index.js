//全局变量获取
var uid = 0;
var kid = 0;
var username = "";
var islogin = false; //是否登录初始化
var distarray={//地理信息 其中1、3、24为北上广 其它无用
	"%B1%B1%BE%A9":1,
	"%CC%EC%BD%F2":2,
	"%B9%E3%B6%AB":3,
	"%B8%A3%BD%A8":4,
	"%BC%AA%C1%D6":5,
	"%BA%A3%C4%CF":6,
	"%B9%E3%CE%F7":7,
	"%D5%E3%BD%AD":8,
	"%C9%BD%B6%AB":9,
	"%C4%FE%CF%C4":10,
	"%BA%DA%C1%FA%BD%AD":11,
	"%D4%C6%C4%CF":12,
	"%C9%BD%CE%F7":13,
	"%BA%FE%B1%B1":14,
	"%C9%C2%CE%F7":15,
	"%B8%CA%CB%E0":16,
	"%D6%D8%C7%EC":17,
	"%BA%D3%B1%B1":18,
	"%BD%AD%CB%D5":19,
	"%B0%B2%BB%D5":20,
	"%CB%C4%B4%A8":21,
	"%BA%D3%C4%CF":22,
	"%C7%E0%BA%A3":23,
	"%C9%CF%BA%A3":24,
	"%CE%F7%B2%D8":25,
	"%C4%DA%C3%C9%B9%C5":26,
	"%BD%AD%CE%F7":27,
	"%D0%C2%BD%AE":28,
	"%B9%F3%D6%DD":29,
	"%C1%C9%C4%FE":30,
	"%BA%FE%C4%CF":31
};
var startTime = 0;

// radio use
var BroadcastSlide,
	radio_slideBoxs = [],
	hitListIndex= 0,
	timeSetInterval= null,
	radio_ClientHeight=document.documentElement.clientHeight,
	radio_BoxTop = 850;

$(function(){
	startTime = new Date().getTime()
	// 适配
	windowWidth = $(window).width();
	divWidth = $("#kw_wc").width();
	// 结束
	centerLoadingStart();
	callCreateIndexListFn();
	getRcmRadioData();
	getRcmPlaylistData();
	radioBind();
	rcmBind();
	//  radio use
	setTimeout(function(){
		if(document.getElementsByClassName('indexRadioBox').length>0){
			radio_BoxTop = document.getElementsByClassName('indexRadioBox')[0].offsetTop;
		}
	},1000);
	BroadcastSlide = document.getElementById('BroadcastSlide'),
	hitListIndex= 0;
	window.onscroll = radio_scrollFn;
	try{
		getRadioStation();
	}catch(e){
		console.error('广播电台message Data Error');
	}
	// 加载完成 发送日志确认此模板为白领模板
	var oDate = new Date();
	var month = toDou(oDate.getMonth()+1);
	var day = toDou(oDate.getDate());
	var date = ''+month+day;
	var ISWCCache = getDataByCache('ISWC'+date);
	if(!ISWCCache){
		realTimeLog("MUSICLISTEN_TEST","ISWC:1");
	}
	saveDataToCache('ISWC'+date,'todaysave');
	callClientNoReturn("setVipInfo");
});

// 适配
var windowWidth = 0;
var divWidth = 0;
$(window).resize(function(){
	windowWidth = $(window).width();
	divWidth = $("#kw_wc").width();
	setAllSize();
	set_4_icon_size();
	setFocus();
	var adiframeCon = $("#delay_load_top_2_new iframe").contents().find("a");
	adiframeCon.css("margin-left",($(".adBox").width()-adiframeCon.width())/2+"px");
	loadImagesNew();
    var bannerIframe = window.parent.document.getElementById('banner');
    bannerIframe.height = $("body").height();
});
// 所有适配
function setAllSize(){
	var setSizeArr = ["rcmPl","radio","mv","original","album","musicPeriphery"];
	for(var i=0;i<setSizeArr.length;i++){
		setSize(setSizeArr[i]);
	}
}
// 设置适配尺寸
function setSize(type){
	var num = 0;
	var marginRight = 15;
	var len = 0;
	var persent = 0;
	var target;
	if(type=="rcmPl"){
		target = $(".kw_rcmPl .kw_pl140");
		if(windowWidth>=800&&windowWidth<=1116){
			num = 4;
			len = 9;
		}else if(windowWidth>=1117&&windowWidth<=1429){
			num = 5;
			len = 11;
		}else if(windowWidth>=1430){
			num = 6;
			len = 13;
		}
		persent = ((divWidth-num*marginRight)*100)/((num+1)*divWidth);
		target.show();
		if(len!=13)$(".kw_rcmPl .kw_pl140:gt("+len+")").css("display","none");
		target.css("width",persent+"%");
		target.find("img").css("height",target.width()+"px");
	}else if(type=="radio"){
		target = $(".indexRadioBox  .br_wrap");
		if(windowWidth>=800&&windowWidth<=1116){
			num = 4;
		}else if(windowWidth>=1117&&windowWidth<=1429){
			num = 5;
		}else if(windowWidth>=1430){
			num = 6;
		}
		persent = ((divWidth-num*marginRight)*100)/((num+1)*divWidth);
		target.show();
		if(num!=6)$(".indexRadioBox  .br_wrap:gt("+num+")").css("display","none");
		target.css("width",persent+"%");
	}else if(type=="mv"){
		target = $(".LastMvBox .bmv_wrap");
		if(windowWidth>=800&&windowWidth<=1429){
			num = 3;
		}else if(windowWidth>=1430){
			num = 4;
		}
		persent = ((divWidth-num*marginRight)*100)/((num+1)*divWidth);
		target.show();
		if(num!=4)$(".LastMvBox .bmv_wrap:gt("+num+")").css("display","none");
		target.css("width",persent+"%");
		target.find("img").css("height",target.width()/16*9+"px");
	}else if(type=="original"){
		target = $(".kw_originalBox .kw_owrap");
		if(windowWidth>=800&&windowWidth<=1116){
			num = 1;
			len = 5;
		}else if(windowWidth>=1117&&windowWidth<=1429){
			num = 2;
			len = 5;
		}else if(windowWidth>=1430){
			num = 3;
			len = 7;
		}
		persent = ((divWidth-num*marginRight)*100)/((num+1)*divWidth);
		target.show();
		if(len!=7)$(".kw_originalBox .kw_owrap:gt("+len+")").css("display","none");
		target.css("width",persent+"%");
		target.find("img").css("height",target.find(".leftimg").width()+"px");
	}else if(type=="album"){
		target = $(".newAlbumBox .kw_wc_album");
		if(windowWidth>=800&&windowWidth<=1116){
			num = 3;
		}else if(windowWidth>=1117&&windowWidth<=1429){
			num = 4;
		}else if(windowWidth>=1430){
			num = 5;
		}
		persent = ((divWidth-num*marginRight)*100)/((num+1)*divWidth);
		target.show();
		if(num!=5)$(".newAlbumBox .kw_wc_album:gt("+num+")").css("display","none");
		target.css("width",persent+"%");
	}else if(type=="musicPeriphery"){
		target = $(".musicPeripheryBox .kw_bwrap");
		if(windowWidth>=800&&windowWidth<=1116){
			num = 4;
		}else if(windowWidth>=1117&&windowWidth<=1429){
			num = 5;
		}else if(windowWidth>=1430){
			num = 6;
		}
		persent = ((divWidth-num*marginRight)*100)/((num+1)*divWidth);
		target.show();
		if(num!=6)$(".musicPeripheryBox .kw_bwrap:gt("+num+")").css("display","none");
		target.css("width",persent+"%");
	}
}

// 焦点图下边四个icon的适配
function set_4_icon_size(){
	var divWidth = $("#kw_wc").width();
	$(".recommendListBox li").css("width",(divWidth-45)*100/(4*divWidth)+"%");
	setTimeout(function(){
		var rcmDivIconHeight = $(".iconBg").height();
		$(".recommendListBox li span").css({"font-size":0.3*rcmDivIconHeight+"px","line-height":rcmDivIconHeight/1.4+"px","margin-top":rcmDivIconHeight*(1-1/1.4)/2}).show();
	});
}
//适配结束

//非个性化部分开始
function callCreateIndexListFn(){
	var indexCache = getDataByCache('indexdatacache');
	if(indexCache == ''){
		getIndexData(false);
	}else{
		try{
			var jsondata = eval('('+indexCache+')');
			callMainDataFn(jsondata);
			getIndexData(true);
		}catch(e){
			getIndexData(false);
			realShowTimeLog('http://www.kuwo.cn/pc/index/info',0,(new Date().getTime()-startTime),'fromWeb-callCreateIndexListFn-errorCache:'+indexCache,0);
			indexCache = defIndexCache;
			var jsondata = eval('('+indexCache+')');
		}
		setTimeout(function(){//读取其它频道数据存入缓存
			loadOtherChannel();
		},6000);
	}
}
function getIndexData(flag){
	var url = 'http://www.kuwo.cn/pc/index/info';
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			if(data.lastIndexOf('"status":200')<0){
				var errorData = data;
				//数据异常用缓存 无缓存读错误页面
				// realShowTimeLog('http://www.kuwo.cn/pc/index/info',0,(new Date().getTime()-startTime),'fromWeb-getIndexData-errorData:'+data,0);
				data = getDataByCache('indexdatacache');
				var indexCache = data;
				if(!indexCache){
					//发送错误日志
					realShowTimeLog('http://www.kuwo.cn/pc/index/info',0,(new Date().getTime()-startTime),'fromWeb-getIndexData-errorCacheData:'+errorData,0);
					return;
				}
			}
			var day7 = 604800;//单位是秒
			var jsondata = eval('('+data+')');
			if(!flag){
				//获取数据进行创建模块
				callMainDataFn(jsondata,true);
				setTimeout(function(){//读取其它频道数据存入缓存
					loadOtherChannel();
				},6000);
				saveDataToCache('indexdatacache',data,day7);//存缓存
			}else{
				var indexCache = getDataByCache('indexdatacache');
				saveDataToCache('indexdatacache',data,day7);//存缓存
			}
		},
		error:function(){
			indexDomainChange();
		}
    });
}
function indexDomainChange(){
    var someurl = "http://"+hostConfig+"/pc/index/info?newtime="+Math.random()+"&thost=www.kuwo.cn";
    $.ajax({
	    url:someurl,
	    type:"get",
		dataType:"text",
		crossDomain:false,
	    success:function(data){
		    if(data.indexOf('"status":200')<0){
		        loadErrorPage();
			    return;
		    }
		    var jsondata = eval("("+data+")");
		    callMainDataFn(jsondata,true);
		    saveDataToCache('indexdatacache',data,604800);//存缓存
	    },
	    error:function(xhr){
		    var httpstatus = xhr.status;
		    if(typeof(httpstatus)=="undefined"){
			    httpstatus = "-1";
		    }
		    var sta = httpstatus.toString();
		    loadErrorPage();
			realShowTimeLog('http://www.kuwo.cn/pc/index/info',0,(new Date().getTime()-startTime),'fromWeb-indexDomainChange-errorStatus:'+sta,0);
		    return;
	    }
    });
}


function callMainDataFn(jsondata,notSendLog){//创建完成后发送ServiceLevel日志
	try{
		var bannerArr = jsondata.data.focusPicture.list.reverse();
		var plArr = jsondata.data.playList.list;
		var hotMvArr = jsondata.data.hotMv.list;
		var huodongArr = jsondata.data.huoDong.list;
		var originalArr = jsondata.data.original.list;
		var hotColumnArr = jsondata.data.specialColumn.list;
		var newAlbumArr = jsondata.data.newDiscShelves.list;
		createIndexFocusList(bannerArr);
		//设置4个icon
		set_4_icon(plArr[0]);
		set_4_icon_size();
		// if(!isWc){
		// 	//createindexPlayList(plArr);
		// 	getindexPlayListData();
		// 	createIndexMvList(hotMvArr);
		// }
		createIndexMvList(hotMvArr);
		createHuoDongList(huodongArr);
		createIndexOriginalList(originalArr);
		// createhotColumnList(hotColumnArr);
		createNewAlbumList(newAlbumArr);
		//首页加载完毕
		callClientNoReturn('domComplete');
	}catch(e){
		getIndexData(false);
		loadErrorPage();
		realShowTimeLog('http://www.kuwo.cn/pc/index/info',0,(new Date().getTime()-startTime),'fromWeb-callMainDataFn-catchMsg:'+e.message,0);
	}
	//差ServiceLevel日志
	if(!notSendLog)realShowTimeLog('http://www.kuwo.cn/pc/index/info',1,(new Date().getTime()-startTime),0,0);
	initJDT();
	centerLoadingEnd();
}

// 焦点图相关开始
//创建焦点图
var focusClassArr;
function createIndexFocusList(data){
	focusClassArr=[];
	// 焦点图图片list模板
	var listModel = loadTemplate('#kw_bannerlist .m_bannerImg');
	// 焦点图btnlist模板
	var btnModel = loadTemplate('#kw_bannerlist .m_bannerBtn');
	var item = "";
	if(!data){
		data = [{inFo:"21首歌曲",pic2017:"http://img4.kwcdn.kuwo.cn/star/upload/1/1/1521473597921_.jpg",nodeId:0,source:8,disName:"华语l纪念那些曾经的经典(一)",extend:"|MUSIC_COUNT=0|LABEL_TXT=高音质|LABEL_COLOR=#4c9de8|LABEL_SHOW=1||AL_FLAG=1",isNew:0,name:"华语l纪念那些曾经的经典(一)",pic:"http://img1.kwcdn.kuwo.cn/star/upload/6/6/1521473579254_.jpg",newCount:0,sourceId:"2377302827"},{inFo:"",pic2017:"http://img1.kwcdn.kuwo.cn/star/upload/6/6/1520993477526_.jpg",nodeId:0,source:17,disName:"Mike Angelo《你在我心中》",extend:"|MUSIC_COUNT=0|LABEL_TXT=付费专辑|LABEL_COLOR=#4c9de8|LABEL_SHOW=1|",isNew:0,name:"Mike Angelo《你在我心中》",pic:"http://img4.kwcdn.kuwo.cn/star/upload/10/10/1520993462106_.jpg",newCount:0,sourceId:"http://vip1.kuwo.cn/fans/fans/template/index.html?key=mike20180013&fromSrc=18"},{inFo:"181首歌曲",pic2017:"http://img1.kwcdn.kuwo.cn/star/upload/11/11/1521438909755_.jpg",nodeId:0,source:8,disName:"《声临其境》",extend:"|MUSIC_COUNT=0|LABEL_TXT=综艺|LABEL_COLOR=#ff6749|LABEL_SHOW=1|",isNew:0,name:"《声临其境》",pic:"http://img1.kwcdn.kuwo.cn/star/upload/3/3/1521438897715_.jpg",newCount:0,sourceId:"2427671621"},{inFo:"表哥[主播]",pic2017:"http://img1.kwcdn.kuwo.cn/star/upload/13/13/1521472798109_.jpg",nodeId:0,source:13,disName:"表哥诡话",extend:"|MUSIC_COUNT=0|LABEL_TXT=酷我调频|LABEL_COLOR=#ff6749|LABEL_SHOW=1|",isNew:0,name:"表哥诡话",pic:"http://img3.kwcdn.kuwo.cn/star/upload/8/8/1521472766249_.jpg",newCount:0,sourceId:"5303780"},{inFo:"麦冬",pic2017:"http://img4.kwcdn.kuwo.cn/star/upload/7/7/1521473071527_.jpg",nodeId:0,source:13,disName:"职场情报局",extend:"|AL_FLAG=1|MUSIC_COUNT=0|LABEL_TXT=酷我调频|LABEL_COLOR=#4c9de8|LABEL_SHOW=1|",isNew:0,name:"职场情报局",pic:"http://img1.kwcdn.kuwo.cn/star/upload/6/6/1521473049398_.jpg",newCount:0,sourceId:"4965270"},{inFo:"林志颖",pic2017:"http://img4.kwcdn.kuwo.cn/star/upload/3/3/1521390041155_.jpg",nodeId:0,source:13,disName:"我的骄傲",extend:"|AL_FLAG=1|MUSIC_COUNT=0|LABEL_TXT=独家首发|LABEL_COLOR=#ff6749|LABEL_SHOW=1|",isNew:0,name:"我的骄傲",pic:"http://img1.kwcdn.kuwo.cn/star/upload/11/11/1521390023195_.jpg",newCount:0,sourceId:"5409679"},{inFo:"",pic2017:"http://img1.kwcdn.kuwo.cn/star/upload/7/7/1516187344695_.jpg",nodeId:0,source:17,disName:"酷我秀场 真情点唱",extend:"|XIUOPEN|MUSIC_COUNT=0|LABEL_TXT=酷我聚星|LABEL_COLOR=#ff6749|LABEL_SHOW=1|",isNew:0,name:"酷我秀场 真情点唱",pic:"http://img4.kwcdn.kuwo.cn/star/upload/2/2/1462442656146_.jpg",newCount:0,sourceId:"http://jx.kuwo.cn/KuwoLive/OpenLiveRoomLinkForKw?from=1001003001"},{inFo:"",pic2017:"http://img2.kwcdn.kuwo.cn/star/upload/7/7/1521464315335_.jpg",nodeId:0,source:17,disName:"酷我无线耳机",extend:"|MUSIC_COUNT=0|LABEL_TXT=酷我出品|LABEL_COLOR=#ff6749|LABEL_SHOW=1|",isNew:0,name:"酷我无线耳机",pic:"http://img4.kwcdn.kuwo.cn/star/upload/0/0/1521464304640_.jpg",newCount:0,sourceId:"http://c.kuwo.cn/g.real?aid=text_ad_3036&cid=&url=https://detail.tmall.com/item.htm?spm=a230r.1.14.6.NP89RL&id=522001391451&sku_properties=5919063:6536025"}];
	}
	var count = 0;
	var len = data.length;
	while(count<len){
		if(sourceISOK(data[count].source)){
			data.splice(count,1);
		}else{
			data[count].indexnum=count;
			count++;
		}
		if(count==len-1){
			item = "focusList_2";
		}else if(count==len){
			item = "focusList_1";
		}else if(count==1){
			item = "focusList_last";
		}else{
			item = "";
		}
		data[count-1].itemClassName=item;
		focusClassArr.push(item);
	}
	focusindex = 0;
	var listHtml = drawListTemplate(data, listModel, proIndexFocusData);
	$('#w_focus .focusList').html(listHtml);
	var btnHtml = drawListTemplate(data, btnModel, proIndexFocusData);
	$('#focus_btn').html(btnHtml);
	setTimeout(function(){
		loadImagesNew();
	},1000);
}
function proIndexFocusData(obj){
	var json = {};
	var source = obj.source;
	var sourceid = obj.sourceId;
	var focussourceid = source==21?getValue(sourceid,"id"):sourceid;
	if(source==21 && sourceid.indexOf("?")>-1){
		sourceid = sourceid+"&from=index";
	}
	extend = obj.extend;
	disname = obj.disName;
	disname = checkSpecialChar(disname,"disname");
	titlename = disname;
	titlename = checkSpecialChar(titlename,"titlename");
	name = obj.name;
	name = checkSpecialChar(name,"name");
	if(source==2)source = 1;
	if(source==7)sourceid = encodeURIComponent(sourceid);
	nodeid = obj.nodeId;
	if(nodeid=="")nodeid = 0;
	var other = "";
	if(source==8||source==12){
	    other = "|psrc=首页->焦点图->|from=index";
	}
	other+="|csrc=曲库->首页->焦点图->"+name;
	var click = commonClickString(new Node(source,sourceid,name,nodeid,extend,other));
	var indexnum = obj.indexnum;
	var classname = '';
	if(indexnum==0){
		classname = 'current';
	}
	var pic = obj.pic2017;
	if(!pic){
	    pic = "img/def800.jpg";
	}
	if(pic!=""){
		pic = changeImgDomain(pic);
	}
	json = {
		'source':source,
		'sourceid':sourceid,
		'focussourceid':focussourceid,
		'classname':classname,
		'name':name,
		'titlename':titlename,
		'click':click,
		'indexnum':indexnum,
		'pic':pic,
		'itemClassName':obj.itemClassName,
		'labelText':getStringKey(extend,"LABEL_TXT"),
		'labelColor':getStringKey(extend,"LABEL_COLOR")
	};
	return json;
}
//焦点图相关方法
var focustimer = null;
var focusindex = 0;
function initJDT() {
	checkJDTPlay(0);
	// 进入页面自动开始定时器
	clearInterval(focustimer);
	focustimer=setInterval(nextimg,5000);
	$(".focusList_1 img").load(function(){
		setFocus();
		$("#focus_btn").css("display","block");
	});
	bindJDT();
}
//下一张
function nextimg(){
	$("#focusplay").hide();
	var $item = $(".focusList li");
	focusClassArr.push(focusClassArr[0]);
	focusClassArr.shift();
	$item.each(function(i,e){
		$(e).removeClass().addClass(focusClassArr[i]);
	});
	setFocus();
	focusindex++;
	if (focusindex>$item.length-1) {
		focusindex=0;
	}
	setCurBtn();
}
//上一张
function previmg(){
	$("#focusplay").hide();
	var $item = $(".focusList li");
	focusClassArr.unshift(focusClassArr[focusClassArr.length-1]);
	focusClassArr.pop();
	$item.each(function(i,e){
		$(e).removeClass().addClass(focusClassArr[i]);
	});
	setFocus();
	focusindex--;
	if (focusindex<0) {
		focusindex=$item.length-1;
	}
	setCurBtn();
}
// 设置焦点图的容器高度，各个焦点图的位置
function setFocus(){
	var $w_focus = $('#w_focus');
	var $focusList_1 = $(".focusList_1");
	var $focusList_2 = $(".focusList_2");
	var $focusList_last = $(".focusList_last");
	var $focusItem = $(".focusList li");
	var focusList_1Wdith = $focusList_1.width();
	var focusList_1Height = $focusList_1.height();
	var middlePos = ($w_focus.width()-focusList_1Wdith)/2;
	var middlePosPersent = middlePos*100/focusList_1Wdith;
	$w_focus.css("height",focusList_1Height);
	$focusItem.css("transform","translate3d("+middlePosPersent+"%,5%,0) scale(0.9)");
	$focusList_last.css("transform","translate3d(0,5%,0) scale(0.9)");
	$focusList_1.css("transform","translate3d("+middlePosPersent+"%,0,0) scale(1)");
	$focusList_2.css("transform","translate3d("+(middlePosPersent*2+5)+"%,5%,0) scale(0.9)");
	$(".focus .prev,.focus .next").css("bottom",(focusList_1Height*0.9-26)/2+"px");
	$("#focusplay").css("left",middlePos+focusList_1Wdith-40+"px")
}
// 焦点图绑定事件
function bindJDT() {
	var leaveFocusTimeout = null;
    //点击class为focusList_last的元素触发上一张的函数
	$(".focusList_last,.focus .prev").die("click").live("click",function(){
		previmg();
		return false;
	});
	//点击class为focusList_2的元素触发下一张的函数
	$(".focusList_2,.focus .next").die("click").live("click",function(){
		nextimg();
		return false;
	});
	// 到中间才可以点击
	$(".focusList_1").die("transitionend").live("transitionend",function(){
		var $this = $(this);
		var $focusplay = $("#focusplay");
		$this.addClass("allowClick");
		checkJDTPlay($this.index());
		if($focusplay.hasClass("isEnter"))$focusplay.show();
	});
	// 焦点图跳转
	$(".focusList li a").live("click",function(){
		var parent = $(this).parent();
		if(parent.hasClass("allowClick")){
			eval('('+parent.attr("data-click")+')');
		}
	});
	//鼠标移入w_focus时清除定时器
	$('#focusImg').mouseenter(function(e){
		clearInterval(focustimer);
		$(this).find("i").show();
        $("#focusplay").addClass("isEnter").show();
        e.stopPropagation();
	});
	$('#focusImg').mouseleave(function(){
		clearInterval(focustimer);
		focustimer=setInterval(nextimg,5000);
		$(this).find("i").hide();
		$("#focusplay").removeClass("isEnter").hide();
	});
	//通过底下按钮点击切换
	$("#focus_btn a").mouseenter(function(){
		clearInterval(focustimer);
		var $focusListItem = $(".focusList li");
		var myindex=$(this).index();
		var curIndex=myindex-focusindex;
		if(curIndex==0){
			return;
		}else if(curIndex>0) {
			var newarr=focusClassArr.splice(0,curIndex);
			focusClassArr=$.merge(focusClassArr,newarr);
			$focusListItem.each(function(i,e){
				$(e).removeClass().addClass(focusClassArr[i]);
			});
		}else if(curIndex<0){
			focusClassArr.reverse();
			var oldarr=focusClassArr.splice(0,-curIndex)
			focusClassArr=$.merge(focusClassArr,oldarr);
			focusClassArr.reverse();
			$focusListItem.each(function(i,e){
				$(e).removeClass().addClass(focusClassArr[i]);
			});
		}
		focusindex=myindex;
		setFocus();
		setCurBtn();
	});
	$("#focus_btn a").mouseleave(function(){
		clearInterval(focustimer);
		focustimer=setInterval(nextimg,5000);
	});
}
//改变底下按钮的背景色
function setCurBtn(){
	$("#focus_btn a").eq(focusindex).addClass("current").siblings().removeClass();
}
// 检测焦点图是否可播放
function checkJDTPlay(index){
	var firstsource = $(".focusList li a").eq(index).attr("data-source");
	var firstsourceid = $(".focusList li a").eq(index).attr("data-sourceid");
	var firstname = $(".focusList li a").eq(index).attr("data-name");
	var $focusplay = $("#focusplay");
	if (firstsource == 1 || firstsource == 4 || firstsource == 8 || firstsource == 12 || firstsource == 13 || firstsource == 21) {
		$focusplay.html('<a data-source="' + firstsource + '" data-sourceid="' + firstsourceid + '" data-name="'+firstname+'" href="javascript:;" hidefocus></a>');
		$focusplay.attr("title","直接播放");
		if($focusplay.hasClass("isEnter"))$focusplay.show();
	}else{
		$focusplay.html("").attr("title","");
	}
}
// 首页焦点图全部播放
var dataCsrc="";
function focusPlay() {
    var source = $("#focusplay a").attr("data-source");
    var sourceid = $("#focusplay a").attr("data-sourceid");
    var name = $("#focusplay a").attr("data-name");

    if (source == 21) {
        iPlayPSRC = '首页->焦点图->精选->' + name;
    } else {
        iPlayPSRC = '首页->焦点图->' + name;
    }
    dataCsrc = "曲库->首页->焦点图->"+name;
    if (source == 21) {
    	dataCsrc = "曲库->首页->焦点图->精选->"+name+"精选集";
        $.getScript(album_url + "album/mbox/commhd?flag=1&id=" + sourceid + "&pn=0&rn="+iplaynum+"&callback=playZhuanTiMusic");
    } else if (source == 1) {
        var url = "http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&id=" + sourceid + "&callback=playBangMusic&pn=0&rn=" + iplaynum;
        $.getScript(getChargeURL(url));
    } else if (source == 4) {
        var url = search_url + "r.s?stype=artist2music&artistid=" + sourceid + "&pn=0&rn=" + iplaynum + "&callback=playArtistMusic";
        $.getScript(getChargeURL(url));
    } else if (source == 8 || source == 12) {
        var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=" + sourceid + "&pn=0&rn=" + iplaynum + "&encode=utf-8&keyset=pl2012&identity=kuwo&newver=1&callback=playGeDanMusic";
        $.getScript(getChargeURL(url));
    } else if (source == 13) {
        var url = search_url + "r.s?stype=albuminfo&albumid=" + sourceid + "&callback=playAlbumMusic&alflac=1";
        $.getScript(getChargeURL(url));
    }
}
// 焦点图相关结束

//运营歌单
function createindexPlayList(data){
	var model = loadTemplate('#kw_playlistModel');
	if(data.length == 0){
		$('.recommendPlaylistBox').hide();
	}
	if(data.length>10){
		data.length = 10;
	}
	var htmlStr = drawListTemplate(data, model, proIndexPlayListData);
	$('.kw_rcmPl').html(htmlStr);
	loadImagesNew();
}

function proIndexPlayListData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var titlename = checkSpecialChar(disname,"titlename");
    var pic = obj.pic;
    var new_song_sourceid = 1082685104;
    var csrc = "曲库->首页->个性化推荐->"+name;
    if(obj.sourceId == new_song_sourceid){//新歌速递合并入口
    	var other = '|from=index|psrc=首页->新歌速递->';
    	var ipsrc = '首页->新歌速递->' + disname + '-<PID_'+obj.sourceId+';SEC_-1;POS_-1;DIGEST_8>';
    	var new_song_entrance = 8888;
    	var click = commonClickString(new Node(new_song_entrance,obj.sourceId,name,obj.id,obj.extend,other));
    }else{
    	var other = '|from=index(editor)|psrc=首页->猜你喜欢->';
    	var ipsrc = '首页->猜你喜欢->' + disname + '(editor)-<PID_'+obj.sourceId+';SEC_-1;POS_-1;DIGEST_8>';
    	var click = commonClickString(new Node(obj.source,obj.sourceId,name,obj.id,obj.extend,other));
    }
    var iplay = 'iPlay(arguments[0],8,'+obj.sourceId+',this);return false;';
	pic = changeImgDomain(pic);
	var rnum = getStringKey(obj.extend,'MUSIC_COUNT');
	if(rnum>0){
		rnum = '<span class="r_num">+'+rnum+'</span>';
	}else{
		rnum = '';
	}
	var al_flag = '';
	if(getStringKey(obj.extend,'AL_FLAG')){
		al_flag = '<span class="al_flag">无损</span>';
	}
	var	boxcname = 'kw_pl140';
	var	imgcname = 'kw_pli140';
	var	shadowcname = 'kw_pl140s';
	var	imgstr = `<img class="lazy" src="img/default.png" data-original="${pic}" onerror="imgOnError(this,150);" />`;
	json={
		'name':name,
		'disname':disname,
		'titlename':titlename,
		'pic':pic,
		'click':click,
		'ipsrc':ipsrc,
		'rnum':rnum,
		'iplay':iplay,
		'al_flag':al_flag,
		'boxcname':boxcname,
		'imgcname':imgcname,
		'shadowcname':shadowcname,
		'imgstr':imgstr,
		'csrc':csrc
	}

	return json;
}
//运营歌单结束

//最新mv开始
function createIndexMvList(data){
	var model = loadTemplate('#kw_mvlistModel');
	if(data.length == 0){
		$('.LastMvBox').hide();
	}
	if(data.length>5){
		data.length = 5;
	}
	var htmlStr = drawListTemplate(data, model, proIndexMvData);
	$('.kw_indexMvListBox').html(htmlStr);
	// 适配
	setSize("mv");
}

function proIndexMvData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var titlename = checkSpecialChar(disname,"titlename");
    var info = obj.inFo;
	var pic = obj.pic;
	//var click = 'someMV(this);';
    var psrc = encodeURIComponent('VER=2015;FROM=曲库->首页->最新MV->'+disname);
    var csrc = "曲库->首页->最潮视频->"+name;
    var formats = obj.formats||obj.FORMATS||"";
    var sourceid = obj.sourceId;
    if(obj.sourceidcopy)sourceid = obj.sourceIdcopy;
    var mvs = obj.sourceId.replace(/;/g,"\t");
    var mvinfoArr = [];
    var count = 0;
    mvinfoArr[count++] = mvs;
    mvinfoArr[count++] = psrc;
    mvinfoArr[count++] = formats;
    mvinfoArr[count++] = getMultiVerNum(obj);
    mvinfoArr[count++] = getPointNum(obj);
    mvinfoArr[count++] = getPayNum(obj);
    mvinfoArr[count++] = getArtistID(obj);
    mvinfoArr[count++] = getAlbumID(obj);

    var mvinfo = mvinfoArr.join('\t');
    mvinfo = encodeURIComponent(mvinfo);
    MVLISTOBJ[MVLISTOBJ.length] = mvinfo;
    MVLISTOBJECT[MVLISTOBJECT.length] = obj;
    pic = changeImgDomain(pic);
    var isPoint = parseInt(obj.isPoint);
    var barrageIcon = '';
    if(isPoint){
        barrageIcon = '<span class="tm_mv"></span>';
    }
    var imgstr = `<img class="lazy" src="img/default.png" onerror="imgOnError(this,140);" data-original="${pic}">`;
    json = {
    	'name':name,
    	'mvinfo':mvinfo,
    	'mvna':info,
    	'mvinfo':mvinfo,
    	'imgstr':imgstr,
    	'barrageIcon':barrageIcon,
    	'csrc':csrc
    }
    return json;
}
//最新mv结束

//运营活动开始
function createHuoDongList(data){
	var model = loadTemplate('#kw_huodongModel');
	if(data.length == 0){
		$('.musicPeripheryBox').hide();
	}
	if(data.length>7){
		data.length = 7;
	}
	var htmlStr = drawListTemplate(data, model, proIndexHuoDongData);
	$('.musicPeripheryList').html(htmlStr);
	// 适配
	setSize("musicPeriphery");
}

function proIndexHuoDongData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var titlename = disname;
    titlename = checkSpecialChar(titlename,"titlename");
    obj.sourceId = obj.sourceId.replace("cid=","cid="+getUserID("devid"));
    var click = commonClickString(new Node(obj.source,obj.sourceId,name,obj.id,obj.extend));
    var pic = obj.pic130 || obj.pic;
    if(pic!=""){
	    pic = changeImgDomain(pic);
    }
    var imgstr =`<img src="img/default.png" class="lazy" onerror="imgOnError(this,150);" data-original="${pic}">`;
    json = {
    	'name':name,
    	'disname':disname,
		'titlename':titlename,
		'imgstr':imgstr,
		'click':click
    };

    return json;
}
//运营活动结束

//原创开始
function createIndexOriginalList(data){
	//图文数据
	var picArr = [];
	//文字数据
	var txtArr = [];
	var modelArr = [];
	for(var i= 0; i<data.length; i++){
		var type=getStringKey(data[i].extend,'ORIGINAL_TYPE');
		if(type == 1){
			picArr.push(data[i]);
		}else{
			txtArr.push(data[i]);
		}
	}
	modelArr = picArr.concat(txtArr);
	if(modelArr.length == 0){
		$('.kw_originalBox').hide();
		return;
	}else{
		if(modelArr.length>8){
			modelArr.length = 8;
		}
	}
	//图文list
	var	picModel = loadTemplate('#kw_originalModel');
	var htmlStr = drawListTemplate(modelArr, picModel, proIndexOriginalData);
	$('.kw_originalList').html(htmlStr);
	// 适配
	setSize("original");
}

function proIndexOriginalData(obj){
	var json ={};
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var titlename = disname;
    titlename = checkSpecialChar(titlename,"titlename");
    obj.source = -201;//转换source 进入内容页
    obj.id = obj.sourceId;
    var click = commonClickString(new Node(obj.source,obj.sourceId,name,obj.id,obj.extend));
    var pic = obj.pic130 || obj.pic;
    if(pic!=""){
	    pic = changeImgDomain(pic);
    }
    var	imgstr =`<img src="img/default.png" class="lazy" onerror="imgOnError(this,150);" data-original="${pic}">`;
    json={
    	'name':name,
    	'disname':disname,
		'titlename':titlename,
		'pic':pic,
		'imgstr':imgstr,
		'click':click
    };

    return json;
}
//原创结束

//专栏开始
function createhotColumnList(data){
	var picArr = [];
	var txtArr = [];

	for(var i=0; i<data.length; i++){
		var type = getStringKey(data[i].extend,'ORIGINAL_TYPE');
		if(type == 1){
			picArr.push(data[i]);
		}else{
			txtArr.push(data[i]);
		}
	}
	if(picArr.length>5){
		picArr.length = 5;
	}
	if(picArr.length == 0){
		$('.hotColumnBox').hide();
	}
	//图文数据
	var picModel = loadTemplate('#kw_huodongModel');
	var htmlStr = drawListTemplate(picArr, picModel, proHotColumnData);
	$('.kw_hotColumnList').html(htmlStr);
}

function proHotColumnData(obj){
	var json ={};
	var name = checkSpecialChar(obj.disName,"name");
    var disname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var titlename = disname;
    titlename = checkSpecialChar(titlename,"titlename");
    var click = commonClickString(new Node(obj.source,obj.sourceId,name,obj.id,obj.extend));
    var pic = obj.pic;
    if(pic!=""){
	    pic = changeImgDomain(pic);
    }
    var	imgstr =`<img src="img/default.png" class="lazy" onerror="imgOnError(this,150);" data-original="${pic}">`;
    json={
    	'name':name,
    	'disname':disname,
		'titlename':titlename,
		'imgstr':imgstr,
		'click':click
    };

    return json;
}
//专栏结束

//新碟开始
function createNewAlbumList(data){
	var model = loadTemplate('#kw_rcmalbumlistModel');
	if(data.length == 0){
		$('.kw_albumList').hide();
	}
	var html = drawListTemplate(data,model,proNewAlbumData);
	$('.kw_albumList').html(html);
	// 适配
	setSize("album");
}

function proNewAlbumData(obj){
	var json = {};

	var albumname = checkSpecialChar(obj.name,"name");
    var albumdisname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var albumtitle = checkSpecialChar(albumdisname,"titlename");
    var pic = obj.pic;
    var infoStr = '';
    var albumid = obj.sourceId;
    var artistid = obj.artistId;
    var artistname = checkSpecialChar(obj.artist,"disname");
    var artisttitle = checkSpecialChar(obj.artist,"titlename");
    var multiplename = albumdisname+'-'+artistname;
    var multipletitle = albumtitle+'-'+artisttitle;
    var datapsrc = "最新专辑->"+albumdisname;
    var csrc = "曲库->首页->新碟上架->"+albumdisname;
    var other = '|from=index';
    var click = commonClickString(new Node(obj.source,albumid,albumname,obj.nodeId,obj.extend,other));
    var artistclick = commonClickString(new Node('4',artistid,artistname,'4','',other));
    var iplay = 'iPlay(arguments[0],13,'+albumid+',this);return false;'
    if(!pic){
        pic = default_img;
    }else{
        pic = changeImgDomain(pic.replace('/120/','/300/'));
    }
	pic = pic.replace(/albumcover\/120/,'albumcover\/180');
    json = {
    	'albumtitle':albumtitle,
    	'albumdisname':albumdisname,
    	'artisttitle':artisttitle,
    	'artistname':artistname,
    	'multiplename':multiplename,
    	'multipletitle':multipletitle,
    	'datapsrc':datapsrc,
    	'pic':pic,
    	'click':click,
    	'artistclick':artistclick,
    	'iplay':iplay,
    	'csrc':csrc
    };
	return json;
}
//新碟结束
//非个性化部分结束

//获取个性化电台数据并创建个性化电台
function getRcmRadioData(){
	var uid = getUserID("uid");
    var kid = getUserID("devid");
    var login = 0;
    if(uid!=0){
        login = 1;
    }
    var url="http://gxh2.kuwo.cn/newradio.nr?type=22&uid="+uid+"&login="+login+"&kid="+kid+"&size=10&ver="+getVersion()+"&is_new=1&time="+Math.random();
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
	if(len>7)data.length=7;

	for(var i=0; i<data.length; i++){
		data[i].indexnum = i;
	}
	//获取数据拼接完成后的html字符串
	var str = drawListTemplate(data, model, proIndexRadioData);
	$('.kw_indexRadio').html(str);
	// 适配
	setSize("radio");
	loadImagesNew();
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
	var	imgstr = `<img class="lazy" src="img/default.png" onerror="imgOnError(this,150)"; data-original="${pic}">`;
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

//个性化歌单开始
function getRcmPlaylistData(){
	try{
		var rcmplcache = getDataByCache('rcmpldata');
		var jsondata = eval('('+jsonStr+')');
		var playlistObj = jsondata.playlist;
		createRcmPlaylist(jsondata);
	}catch(e){
		var rcmplcache = '';
	}
	var uid = getUserID("uid");
    var kid = getUserID("devid");
    var testurl = 'http://60.28.220.93:8063/mgxh.s?type=rcm_keyword_playlist&uid='+uid+'&devid='+kid+'&platform=pc';
	var url = 'http://mgxhtj.kuwo.cn/mgxh.s?type=rcm_keyword_playlist&uid='+uid+'&devid='+kid+'&platform=pc';
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(jsonStr){
			try{
				var jsondata = eval('('+jsonStr+')');
				// 个性化歌单
				var playlistObj = jsondata.playlist;
				// 个性化搜索关键词
				var keyObj = jsondata.keyword;
			 	if(typeof(playlistObj)=="object" && playlistObj!=null && playlistObj.length>4){
			 		if(jsonStr != rcmplcache){
				 		createRcmPlaylist(jsondata);
				 		saveDataToCache('rcmpldata',jsonStr);
			 		}
			 	}else{
			 		$('.personalizationBox').hide();
			 	}
		 	}catch(e){
		 		$('.personalizationBox').hide();
		 	}
		},
		error:function(){
			$('.personalizationBox').hide();
		}
    });
}


function createRcmPlaylist(data){
	var plArr = data.playlist;
	var txtArr = [];
	var tmpArr = data.keyword.searchlist || [];
	if(plArr.length>14){
		plArr.length = 14;
	}

	// txtArr[0]={'source':-11,'sourceid':'rcm_pd','name':'口味发现','id':0,'extend':'','other':'|from=index|psrc=首页->为你推荐->口味发现','indexnum':0};
	// for(var i=0; i<tmpArr.length; i++){
	// 	tmpArr[i].indexnum = i+1;
	// 	txtArr.push(tmpArr[i]);
	// }

	//模板样式(注意用用原生获取)
	var plModel = loadTemplate('#kw_playlistModel');
	var str = drawListTemplate(plArr,plModel,proRcmPlData);
	$('.kw_rcmPl').html(str);
	// 适配
	setSize("rcmPl");
	// var txtModel = loadTemplate('#kw_keywordModel');
	// var str = drawListTemplate(txtArr,txtModel,proRcmKeyWordData);
	// $('.personalizationBox .entrance').html(str);
	//$('.personalizationBox .indexTitleBox a').attr('onclick','commonClick({\'source\':\'1001\',\'name\':\'个性化推荐\'});');
	loadImagesNew();
}

function proRcmPlData(obj){
	var json = {};

	//处理数据
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disname,"disname") || checkSpecialChar(name,"disname");
    var titlename = checkSpecialChar(disname,"titlename");
    var info = obj.info;
    var pic = obj.pic || 'img/default.png';
    var rcm_type=obj.rcm_type;
    var newreason=obj.newreason;
    var iplay = 'iPlay(arguments[0],8,'+obj.sourceid+',this);return false;';
    var reasonStr='';
	var ipsrc='首页->猜你喜欢->' + disname+'(algorithm)' + '-<PID_'+obj.sourceid+';SEC_-1;POS_-1;DIGEST_8>';
	var csrc = "曲库->首页->个性化推荐->"+name;
	var other = '|from=index(algorithm)|psrc=首页->猜你喜欢->|csrc='+csrc;
	var click = commonClickString(new Node(obj.source,obj.sourceid,name,obj.id,obj.extend,other));

	pic = changeImgDomain(pic);

	var rcm_class = '';
	var rcm_info_class = '';
	for(var i=0; i<newreason.length; i++){
    	switch(newreason[i].type){
    		case 'txt':
    			reasonStr+=''+newreason[i].desc;
    			break;
    		default:
    			reasonStr+=''+newreason[i].desc;
    			break;
    	}
    }
    var des = '';
	// if(reasonStr!=''){
	// 	if(!isWc){
	// 		var des = '<p class="kw_rcmpldes" title="'+reasonStr+'">'+reasonStr+'</p>';
	// 		rcm_class = 'kw_rcm_pl_box';
	// 		rcm_info_class = 'kw_rcm_pl_info';
	// 	}
	// }
	var al_flag = '';
	if(parseInt(obj.extend)){
		al_flag = '<span class="al_flag">无损</span>';
	}
	var	boxcname = 'kw_pl140';
	var	imgcname = 'kw_pli140';
	var	shadowcname = 'kw_pl140s';
	var	imgstr = `<img class="lazy" src="img/default.png" data-original="${pic}" onerror="imgOnError(this,150);" />`;
	var playcnt = obj.playcnt||0;
	var style = "";
	if(parseInt(playcnt)<=100){
		style = "display:none";
	}
	if(playcnt>100000)playcnt=parseInt(playcnt/10000)+"万";
	json={
		'name':name,
		'disname':disname,
		'titlename':titlename,
		'pic':pic,
		'click':click,
		'ipsrc':ipsrc,
		'des':des,
		'rcm_class':rcm_class,
		'rcm_info_class':rcm_info_class,
		'iplay':iplay,
		'al_flag':al_flag,
		'boxcname':boxcname,
		'imgcname':imgcname,
		'shadowcname':shadowcname,
		'imgstr':imgstr,
		'csrc':csrc,
		'playcnt':playcnt,
		'style':style
	}

	return json;
}

function proRcmKeyWordData(obj){
	var json = {};
	var newIcon = '';
	var classname = '';
	if(obj.indexnum==0){
		var name = checkSpecialChar(obj.name,"name");
		var click = commonClickString(new Node(obj.source,obj.sourceid,name,obj.id,obj.extend,obj.other));
		var oDate = new Date();
		var today = ''+oDate.getFullYear()+toDou(oDate.getMonth()+1)+toDou(oDate.getDate());
		var cache = getDataByCache('j_rcm_entrance'+today);
		if(!cache && oDate.getHours()>6){
			newIcon = '<span class="rcm_new"></span>';
			classname = 'rcm j_rcm_entrance';
		}else{
			classname = 'j_rcm_entrance';
		}
	}else{
		var name = checkSpecialChar(obj.query,"name");
		var click = 'web2pcSearch(\''+name+'\')';
	}

	var titlename = checkSpecialChar(name,"titlename");
	json = {
		'name':name,
		'titlename':titlename,
		'click':click,
		'newIcon':newIcon,
		'classname':classname
	};
	return json;
}

//个性化歌单结束

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
	$(".br_pic").live("mouseenter",function(){
		if ($(this).hasClass("on")) return;
		$(this).addClass("on");
		var status = $(this).attr("c-status");
		//if (!parseInt(status,10)) return;
		var someClass = $(this).parent().attr('class');
		var s = someClass.indexOf("radio_");
		var id = someClass.substring(s + 6);
		var stopicon = '';
		var click = '';
		if (status == 1) {
			if ($(this).find(".radio_pause").size() == 0) {
			    stopicon = '<i title="暂停播放" onclick="" class="radio_pause"></i>';
			}
			click = 'stopRadio(arguments[0],\''+id+'\',true);';
			stopicon = '<i title="暂停播放" onclick="" class="radio_pause"></i>';
			$(this).find(".radio_play").remove();
		} else if (status == 2)	{
		    if ($(this).find(".radio_start").size() == 0) {
			    stopicon = '<i title="继续播放" onclick="" class="radio_start"></i>';
			}
			click = 'continueRadio(arguments[0],\''+id+'\',true);';
			stopicon = '<i title="继续播放" onclick="" class="radio_start"></i>';
			$(this).find(".radio_stop").remove();
		}else{
            stopicon = '<i title="直接播放" onclick="" class="radio_start"></i>';
            click = $(this).attr('_onclick');
        }
		$(this).append(stopicon);
		$(this).removeAttr('onclick');
		$(this).unbind("click").bind("click", function () {
		    if (status != 2 && status != 1 && status != 4) {
		        if ($(this).hasClass('on')) {
		            $(this).removeClass('on');
		        }
		    }
		    eval(click);
		});
		return false;
	});

	$(".br_pic").live("mouseleave",function(){
		$(this).removeClass("on");
		$(this).find(".radio_pause").remove();
		$(this).find(".radio_start").remove();
		var status = $(this).attr("c-status");
		if (status == 1) {
			var stopicon = '<img class="radio_play" src="img/radio_play.gif">';
			$(this).append(stopicon);
		} else if (status == 2)	{
			var playicons = '<i class="radio_stop"></i>';
			$(this).find(".i_play").hide();
			$(this).append(playicons);
		}
		return false;
	});
}
//电台部分结束

// 口味发现点击事件
function rcmBind(){
	$('.j_rcm_entrance').live('click',function(){
		var oDate = new Date();
		var today = ''+oDate.getFullYear()+toDou(oDate.getMonth()+1)+toDou(oDate.getDate());
		saveDataToCache('j_rcm_entrance'+today,'1',86400);
	});
}
$(window).on('scroll',function(){
	loadImagesNew();
});

//登录退出相关
// 客户端登录成功后 回调网页方法
function OnLogin(param) {
    var userid = getUserID("uid");
	var sid = getUserID("sid");

    if(userid==0){
		return;
	}else{
		uid = userid;
		kid = getUserID("devid");
		username = getUserID("name");
		//重新获取个性化数据
		getRcmPlaylistData();
		getRcmRadioData();
		islogin = true;
	}
}

// 客户端登录后退出 回调
function OnLogout() {
	var userid = getUserID("uid");
	if(userid==0){
		uid = 0;
		kid = 0;
		username = "";
		islogin = false;
	}
	//重新获取个性化数据
	getRcmPlaylistData();
	getRcmRadioData();
}
//结束

//  广播电台

/**
 *     跳转界面
 */
function radio_jumpPage(radioName , radioId ){
	commonClick({'source':'10000','sourceid':'10000','name':'radiopage','id':'10000','goRadioName':radioName,'goradioId':radioId});
}

/**
 *     评论播报
 */
function radio_Animate(){
	hitListIndex ++;
	if(hitListIndex > radio_slideBoxs.length){
		hitListIndex=0;
		BroadcastSlide.style.transition = "all 0s";
		BroadcastSlide.style.webkitTransition= "all 0s";
		BroadcastSlide.style.transform = "translateY(0px)";
	}else{
		BroadcastSlide.style.transition = "all 1.2s";
		BroadcastSlide.style.webkitTransition= "all 1.2s";
	}
	BroadcastSlide.style.transform = "translateY(-"+ hitListIndex*22 +"px)";
	BroadcastSlide.style.webkitTransform = "translateY(-"+ hitListIndex*22 +"px)";
}

/**
 *    获取滚动条数数据
 */
function getRadioStation(){
	var url = "http://www.kuwo.cn/pc/radio/playing";
	$.ajax({
        url: url,
        type: "get",
        dataType: "jsonp",
        jsonp: "jpcallback",
        jsonpCallback: "radio_playing",
    	success: function (data) {
    		var radioPlayingStr='';
    		if(data.data &&  data.status===200 && data.data.value !='失败'){
    			if(data.data.city && data.data.city !=undefined){
    				data.data.province = data.data.city;
    			}
    			if(data.data.list){
	     			for(var i=0,len = data.data.list.length ; i<len ;i++){
radioPlayingStr+='<li><i></i><a onclick="radio_jumpPage(\''+data.data.list[i].radioName+'\',\''+data.data.list[i].radioId +'\')" title=\''+returnSpecialChar(data.data.list[i].name)+'&nbsp;来自&nbsp'+returnSpecialChar(data.data.list[i].radioName) +'\' href="javascript:;"><span >'+returnSpecialCharTwo( data.data.list[i].name )+'</span><span >&nbsp;来自&nbsp;'+returnSpecialCharTwo(data.data.list[i].radioName)+'</span></a></li>';
	    			}
	    			$('#BroadcastSlide').html(radioPlayingStr).parent().show();
					$('.radio_locationName').html(data.data.province);

    			}
    		}
			setTimeout(function(){
				radio_slideBoxs = document.querySelectorAll('#BroadcastSlide li');
				if(radio_slideBoxs.length>0){
					var clonedNode = radio_slideBoxs[0].cloneNode(true);// 克隆节点
					BroadcastSlide.appendChild(clonedNode);
					radio_scrollFn();
					$('#BroadcastSlide li a').on('mouseenter',function(){
						clearInterval(timeSetInterval);
					}).on('mouseleave',function(){
						timeSetInterval = setInterval(radio_Animate,2500);
					})
					$('#BroadcastSlide').on('click',function(){
						window.setTimeout(function(){
							var musicImg = new Image();
							musicImg.src='http://webstat.kuwo.cn/logtj/comm/pc/radio/radioEnterNumber.jpg';
						},300);
					});
				}
			},0)
    	}
	})
}

/**
 *    在网页中显示字符串中的特殊字符
 */
function returnSpecialCharTwo(s){
    s = ''+s;
	return s.replace(/\&amp;/g,"&").replace(/\&nbsp;/g," ").replace(/\&apos;/g,"'").replace(/\&quot;/g,"\"").replace(/\%26apos\%3B/g,"'").replace(/\%26quot\%3B/g,"\"").replace(/\%26amp\%3B/g,"&").replace(/‘/g,'\'').replace(/，/,',').replace(/ /g,'&nbsp;').replace(/&lt;/g,"<").replace(/&gt;/g,">");
}

function radio_scrollFn(){
	var radio_scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	if(radio_scrollTop + radio_ClientHeight > radio_BoxTop && radio_scrollTop < 1519 ){
		clearInterval(timeSetInterval);
		timeSetInterval = setInterval(radio_Animate,2500);
	}else{
		clearInterval(timeSetInterval);
	}
}


//加载其它页面数据
function loadOtherChannel(){
	//load radio channel
	var radioChannelUrl = 'http://qukudata.kuwo.cn/q.k?op=query&cont=tree&node=87235&pn=0&rn=100&fmt=json&src=mbox&level=3&sourceset=tag_radio&callback=saveRadioChannelData&extend=gxh&kid='+kid+'&uid='+uid+'&ver='+getVersion()+'&login='+islogin;
	$.getScript(radioChannelUrl);
	var mvChannelUrl = 'http://album.kuwo.cn/album/mv2015?callback=saveMvChannelData';
	$.getScript(mvChannelUrl);
	// var classifyChannelUrl = 'http://qukudata.kuwo.cn/q.k?op=query&cont=tree&node=1&pn=0&rn=20&fmt=json&src=mbox&level=3&callback=saveClassifyChannelData';
	// $.getScript(classifyChannelUrl);
	var artistChannelUrl = 'http://artistlistinfo.kuwo.cn/mb.slist?stype=artistlist&callback=saveArtistChannelData&category=0&order=hot&pn=0&rn=100';
	$.getScript(artistChannelUrl);
	var bangHotChannelUrl = 'http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&id=16&pn=0&rn=20&callback=saveHotBangChannelData';
	$.getScript(bangHotChannelUrl);
	var bangListChannelUrl = 'http://qukudata.kuwo.cn/q.k?op=query&cont=tree&node=2&pn=0&rn=20&fmt=json&src=mbox&level=2&callback=saveBangChannelData'
	$.getScript(bangListChannelUrl);
	var jxjChannelUrl = 'http://album.kuwo.cn/album/jxjPast?typeId=0&callback=saveJxjChannelData&rn=40&pn=0';
	$.getScript(jxjChannelUrl);
}

function saveBangChannelData(data){
	saveDataToCache('bangList-channel',obj2Str(data),3600)
}
// function saveClassifyChannelData(data){
// 	saveDataToCache('classify-channel',obj2Str(data),3600)
// }
function saveHotBangChannelData(data){
	saveDataToCache('bangHot-channel',obj2Str(data),3600)
}
function saveRadioChannelData(data){
	saveDataToCache('radio-channel',obj2Str(data),3600)
}
function saveMvChannelData(data){
	saveDataToCache('mv-channel',obj2Str(data),3600)
}
function saveArtistChannelData(data){
	saveDataToCache('artist-channel',obj2Str(data),3600)
}
function saveJxjChannelData(data){
	saveDataToCache('jxj-channel',obj2Str(data),3600)
}

function go_radio_page(){
	commonClick({'source':'-2','sourceid':'8','name':'1','id':'-2'});
}

function go_rcm_page(){
	commonClick({'source':'-11','sourceid':'rcm_pd','name':'口味发现','id':'0','extend':'','other':'|from=index|psrc=首页->为你推荐->口味发现|csrc=曲库->首页->口味发现'});
}

function go_original_page(){
	commonClick({'source':'33','sourceid':'http://album.kuwo.cn/album/h/mbox?id=911&from=jxfocus','name':'原创电台','id':'87045','other':'|csrc=曲库->首页->口味发现'});
}

function go_channel_mv_page(){
	var channelNode = 'MV';
    var src = 'channel_mv.html?';
    var channelInfo = getChannelInfo("","mv");
    var source = 43;
    var sourceid = 34;
    var param = '{\'source\':\''+source+'\',\'sourceid\':\''+sourceid+'\'}';
    var info = 'source='+source+'&sourceid='+sourceid;
    src = src+info;
	var call = "Jump?channel="+channelNode+"&param="+encodeURIComponent(param) + ";" + encodeURIComponent('url:${netsong}'+src) + ';' + encodeURIComponent('jump:'+channelInfo);
    callClientNoReturn(call);
}

function go_daysong_page(){
	commonClick({'source':'8888','sourceid':'1082685104','name':'每日最新单曲','id':'0','extend':'','other':'|from=index|psrc=首页->新歌速递->'});
}

function go_ukhot_page(){
	commonClick({'source':'1','sourceid':'26','name':'酷我热歌榜','id':'16','extend':'','other':'|psrc=排行榜->|bread=-2,2,排行榜,0|csrc=曲库->排行榜->酷我热歌榜'});
}

function set_4_icon(pldata){
	try{
		var newsongData = pldata || {};
		var oDate = new Date();
		var date = toDou(oDate.getDate());
		var extend = newsongData.extend || '';
		var daysongclick = "commonClick({'source':'8888','sourceid':'1082685104','name':'每日最新单曲','id':'0','extend':'"+extend+"','other':'|from=index|psrc=首页->新歌速递->'});"
        var log = "radioLog('POSITION:1,3|GPOSITION:2,1|FROMPAGE:首页|RADIOID:-26711|CSRCTAG:私人FM');"
		var raidoclick = "commonClick({'source':'9','sourceid':'-26711,私人FM,http://img1.kwcdn.kuwo.cn:81/star/tags/201703/1489548619143.jpg,http://img1.kwcdn.kuwo.cn:81/star/tags/201703/1489548642126.jpg,2008-08-08,2014-06-16,4,0~24,907,4,1','name':'私人FM','id':'-26711','extend':'|RADIO_PIC=http://img1.sycdn.kuwo.cn/star/rcm/radio/26711.png|DIS_NAME=私人FM|'})";
		var iconStr = `<li class="recommendList">
							<a href="javascript:;" class="rcm" onclick="go_rcm_page();"><span>${date}</span><img class="iconBg" src="img/gxh/week.png" /><img class="icon weekIcon" src="img/gxh/weekicon.jpg" /></a>
							<a href="javascript:;" class="info rcminfo" onclick="go_rcm_page();">每日歌曲推荐</a>
						</li>
						<li class="recommendList">
							<a href="javascript:;" class="daysong" onclick="${daysongclick}"><span>新歌</span><img class="iconBg" src="img/gxh/daysong.png" /><img class="icon" src="img/gxh/daysongicon.jpg" /></a>
							<a href="javascript:;" class="info daysonginfo" onclick="${daysongclick}">每日最新单曲</a>
						</li>
						<li class="recommendList">
							<a href="javascript:;" class="ukhot" onclick="go_ukhot_page();"><span>榜单</span><img class="iconBg" src="img/gxh/uk_hot.png" /><img class="icon ukhotIcon" src="img/gxh/uk_hoticon.png" /></a>
							<a href="javascript:;" class="info ukhotinfo" onclick="go_ukhot_page();">酷我热歌榜</a>
						</li>
						<li class="recommendList">
							<a href="javascript:;" class="radio" onclick="${log}${raidoclick}"><span>电台</span><img class="iconBg" src="img/gxh/radio.png" /><img class="icon radioIcon" src="img/gxh/radioicon.jpg" /></a>
							<a href="javascript:;" class="info radioinfo" onclick="${log}${raidoclick}">私人电台</a>
						</li>`;
		$('.recommendListBox').html(iconStr);
	}catch(e){
		$('.recommendBox').hide();
		realTimeLog("MUSICLISTEN_TEST","EMSG:"+e.message);
		var min = oDate.getMinutes();
		realTimeLog("MUSICLISTEN_TEST","EDATA:"+h+min+errorData);
	}
}


// vip及广告
function setVipInfo(levelinfo) {
	setAd();
    try {
	    if(levelinfo.indexOf(",")>-1){
	        var levelarray = levelinfo.split(",");
	        var level = levelarray[0];
	        if(level>0) {
	            $(".adBox").hide();
	        }else{
	        	$(".adBox").show();
	        }
	    }else{
	    	if(levelinfo==0){
	            $(".adBox").show();
	        }else{
	            $(".adBox").hide();
	        }
	    }
    } catch(e) {
    	$(".adBox").show();
        webLog("vip error:"+e.message)
    }
}
function setAd(){
	$.getScript("http://wa.kuwo.cn/lyrics/img/kwgg/kwgg_467.js?time="+Math.random(),function(){
		$("#delay_load_top_2_new iframe").load(function(){
			var $adCon = $(this).contents().find("a");
			$adCon.css("margin-left",($(".adBox").width()-$adCon.width())/2+"px");
		});
	});
}
