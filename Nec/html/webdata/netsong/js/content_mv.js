var currentObj;
var psrc;
var bread;
var cpn;
var pn;
var ppn;
var rn;
var rrn = 0;
var tabType;
var currentName;
var id;
var sourceid;
var oldurl=decodeURIComponent(window.location.href).split('?')[0];
var oldmsg='';
var csrc = '';
window.onload = function(){
	callClientNoReturn('domComplete');
	var url=decodeURIComponent(window.location.href).replace(/###/g,'');
	var msg=getUrlMsg(url);
	oldmsg=msg;
    centerLoadingStart("content");
    psrc = getStringKey(msg,'psrc');
    csrc = getStringKey(msg,'csrc');
    $("body").attr("data-csrc",csrc);
    cpn = getStringKey(msg,'pn') || 0;
    tabType = getStringKey(msg,'tabType') || 'song';
    sourceid = url2data(msg,'sourceid');
    id = url2data(msg,'id');
	// currentObj = fobj.goldjson;
	// createBread(currentObj,'playlist');
	// psrc = getStringKey(currentObj.other,'psrc');
	// bread = getStringKey(currentObj.other,'bread');
	// tabType = getStringKey(currentObj.other,'tabType') || 'song';
	// cpn = getStringKey(currentObj.other,'pn') || 0;
	if (tabType == 'song') {
		rn = 80; pn = cpn; ppn = 0; rrn = 0;
	} else if (tabType == 'classify') {
		rn = 0; pn = 0; ppn = cpn; rrn = 100;
	}
	getSomeData();
	objBindFn();

};

$(window).resize(function(){
	iframeObj.refresh();
	// var clientH=document.documentElement.clientWidth;
	// if(clientH>=1700){
	// 	$(".kw_mv_list").css("width","100%");
	// }else{
	// 	$(".kw_mv_list").css("width","103%");
	// }
});

// 获取分类数据
function getSomeData() {
	var InternetOnline=window.navigator.onLine;
	if(!InternetOnline){
		loadErrorPage();
		return;
	}

	var oDate=new Date();
	var oT=oDate.getTime();
	var url = 'http://album.kuwo.cn/album/mv2015?type=tag&pn='+pn+'&rn='+rn+'&ppn='+ppn+'&rrn='+rrn+'&tagDbId='+sourceid+'&subType='+id+'&t='+oT;
	//getScriptData(url);
	$.ajax({
        url:url,
        dataType:'jsonp',
        crossDomain:false,
        jsonpCallback:"getMVInfoData",
		success:function(json){
			getMVInfoData(json);
		}
    });
}

// 创建分类内容
var mvTotal = 0;
var mvPn = 0;
var gedanTotal = 0;
var gedanPn = 0;
function getMVInfoData(jsondata) {
	var data = jsondata;
	var name = data.data.title;
	currentName = name;
	var info = data.data.info || '无';
	var pic = data.data.listPagePicUrl || 'img/def70.jpg';
	var MVListData = data.data.mvList;
	var MVPlayListData = data.data.playList;
	mvTotal = data.data.mvTotal;
	mvPn = data.data.pn;
	gedanTotal = data.data.playlistTotal;
	gedanPn = data.data.ppn;
	$(".mv_head .pic img").attr("src",pic);
	$(".mv_head .name").html(name);
	$(".mv_head .info").html('<span class="icon icon_info"></span>'+info);
	$(".bread span").html(name);
	$(".common_list").hide();
	if (tabType == 'song') {
		$(".selall_mv").show();
		$(".tab").find(".song").addClass("current");
		$(".tab").show();
		getSongListData(MVListData);
	} else if (tabType == 'classify') {
		var source = url2data(oldmsg,'source');
		var sourceid = url2data(oldmsg,'sourceid');
		var id = url2data(oldmsg,'id');

		var someObj = {};
		someObj.psrc = psrc + name;
		someObj.bread = bread + ';' + source + ',' + sourceid + ',' + name + ',' + id;
		someObj.csrc = csrc;
		$(".tab").find(".classify").addClass("current");
		$(".tab").show();
		getGedanListData(MVPlayListData,someObj);
	}

	iframeObj.refresh();
}

function getSongListData(jsondata){
	var data = jsondata;
	var child = data;
	var len = child.length;
	var arr = [];
	for (var i = 0; i < len; i++) {
		arr[arr.length] = createMVBlock(child[i],'artist','','MV->'+currentName,i);
	}
	var currentPn = parseInt(mvPn);
	var totalPage = Math.ceil(mvTotal/rn);
	var pageStr = createPage(totalPage, currentPn+1);
	$(".selall_mv .checkall font").html("共"+mvTotal+"首");3
	//$(".kw_mv_list").css({"width":"103%"});
	$(".topBox").show();
	$(".kw_mv_list").html(arr.join('')).show();
	if (pageStr) $(".page").html(pageStr).show();
	centerLoadingEnd("content");
	iframeObj.refresh();
}

function getGedanListData(jsondata ,someObj) {
	var data = jsondata;
	var len = data.length;
	var arr = [];
	for (var i = 0; i < len; i++) {
		data[i].source = 14;
		arr[arr.length] = createMVGedanBlock(data[i],'MVClassify',someObj);
	}
	var totalPage = Math.ceil(gedanTotal/rrn);
	var currentPn = parseInt(gedanPn);
	var pageStr = createPage(totalPage,(currentPn+1));
	if (pageStr) $(".page").html(pageStr).show();
	$(".kw_mv_list").css("width","105%");
	$(".topBox").show();
	if (!len && len < 1) {
		$(".nothing").css("padding-top","100px").show();
		//$(".kw_music_list").hide();
		centerLoadingEnd("content");
		iframeObj.refresh();
		return;
	}
	$(".kw_mv_list").html(arr.join('')).show();
	centerLoadingEnd("content");
	iframeObj.refresh();
}
function objBindFn() {
	$(".tab a").live("click",function(){
		// var source = currentObj.source;
		// var sourceid = currentObj.sourceid;
		// var name = currentObj.name;
		// var id = currentObj.id;
		var source = url2data(oldmsg,'source');
		var sourceid = url2data(oldmsg,'sourceid');
		var name = url2data(oldmsg,'name');
		var id = url2data(oldmsg,'id');
		var type = $(this).attr("c-type");
		var index = $(this).index();
		if(index==0){
			csrc=csrc.replace("歌单","首发");
		}else if(index==1){
			csrc=csrc.replace("首发","歌单");
		}
		var other = '|psrc='+psrc+'|bread='+bread+'|tabType='+type+'|pn=0|csrc='+csrc;;
		commonClick(new Node(source,sourceid,name,id,'',other));
	});
	$(".page a").live("click",function(){
		var oClass = $(this).attr("class");
		if (oClass.indexOf("no") > -1) return;
		// var source = currentObj.source;
		// var sourceid = currentObj.sourceid;
		// var name = currentObj.name;
		// var id = currentObj.id;
		var pn = 0;
		var goPnNum = $(this).html();
		if (goPnNum == '上一页') {
			pn = parseInt($(".page .current").html()) - 2;
		} else if (goPnNum == '下一页'){
			pn = parseInt($(".page .current").html());
		} else {
			pn = parseInt($(this).html()) -1;
		}
		var source = url2data(oldmsg,'source');
		var sourceid = url2data(oldmsg,'sourceid');
		var name = url2data(oldmsg,'name');
		var id = url2data(oldmsg,'id');
		var other = '|psrc='+psrc+'|bread='+bread+'|tabType='+tabType+'|pn='+pn;
		commonClick(new Node(source,sourceid,name,id,'',other));
    $(window).scrollTop(0);
	});
}
