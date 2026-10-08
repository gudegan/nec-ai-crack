var currentObj;
var gedanId;
var infoTxt = '';
var txtLen = 0;
var pn = 0;
var rn = 100;
var psrc;
var bread;
var currentName;
var oldurl=decodeURIComponent(window.location.href).split('?')[0];
var oldmsg='';
var csrc = "";
window.onload = function(){
	callClientNoReturn('domComplete');
	var url=decodeURIComponent(window.location.href).replace(/###/g,'');
	var msg=getUrlMsg(url);
	oldmsg=msg;
	centerLoadingStart("content");
	//iframeObj.refresh();
	//currentObj = fobj.goldjson;
	// gedanId = currentObj.sourceid;
	// psrc = getStringKey(currentObj.other,'psrc');
	// bread = getStringKey(currentObj.other,'bread');
	// pn = getStringKey(currentObj.other,'pn') || 0;
	// createBread(currentObj,"playlist");
	gedanId = url2data(msg,'sourceid');
	psrc = getStringKey(msg,'psrc');
	csrc = getStringKey(msg,'csrc');
	$("body").attr("data-csrc",csrc);
	pn = getStringKey(msg,'pn') || 0;
	getSomeData();
	objBindFn();
};

$(window).resize(function(){
	iframeObj.refresh();
});

// 获取歌单数据
function getSomeData() {
	//var url = 'http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid='+gedanId+'&pn='+pn+'&rn='+rn+'&encode=utf-8&&keyset=mvpl&identity=kuwo&callback=getGedanInfoData';
	//getScriptData(getChargeURL(url));
	var url = 'http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid='+gedanId+'&pn='+pn+'&rn='+rn+'&encode=utf-8&&keyset=mvpl&identity=kuwo&pcmp4=1&newver=1';
	url = getChargeURL(url);
	$.ajax({
        url:url,
        dataType:'jsonp',
        crossDomain:false,
		success:function(json){
			getGedanInfoData(json);
		}
    });
}

// 创建歌单内容
function getGedanInfoData(jsondata) {
	var data = jsondata;
	var id = data.id;
	var child = data.musiclist;
	var pic = data.pic;
	var info = data.info;
	var title = data.title;
	currentName = checkSpecialChar(title,"disname")
	var len = child.length;
	var arr = [];
	var currentPn = parseInt(data.pn);
	var total = data.total;
	var totalPage = Math.ceil(total/rn);
	MUSICLISTOBJ = {};
	for (var i = 0; i < len; i++) {
		arr[arr.length] = createMVBlock(child[i],'MVGedan','',psrc+currentName,i);
	}
	var tags = '';
	var tagstr = '';
	if (data.tag) {
		if(data.tag.indexOf(',')>0){
			tags = data.tag.split(",");
		}else{
			tags = data.tag.split(" ");
		}

		var tagList= '<span class="icon icon_tag"></span>';
		for(var i=0;i<tags.length;i++) {
			if(i>4)break;
			tagList += '<a class="tag_item">'+tags[i].split(":")[0]+'</a>';
		}
		$(".classify").append(tagList).show();
	} else {
		if ($(".bread a").eq($(".bread a").length >2)) tagstr += $(".bread a").eq($(".bread a").length -2).html();
	}
	var pageStr = createPage(totalPage, currentPn+1);
//	$(".classify").html(tagstr);
	if(info=='')$(".info").hide();
	$(".info").append('<span class="icon icon_info"></span>'+info);
	$(".checkall font").html("共"+data.total+"首");
	$(".def").find(".checkall").show();
	$(".def").find(".bnew").hide();
	$(".bread span").html(checkSpecialChar(title,"disname"));
	$(".gedan_head .pic img").attr("src",pic);
	$(".gedan_head .name").html(checkSpecialChar(title,"disname"));
	$(".kw_mv_list").html(arr.join(''));
	/*数据加载完显示*/
	$(".max_content").show();
	if(pageStr) $(".page").html(pageStr).show();
	$(".like_btn").attr("c-id",gedanId);
	showLike('PLAYLIST','8','get');
	centerLoadingEnd("content");
	iframeObj.refresh();
}

function objBindFn() {
	$(".open").live("click",function(){
		$(".info").addClass("on");
		$(".info span").html(infoTxt + '<a href="###" hidefocuss class="fold">[收起]</a>');
	});
	$(".fold").live("click",function(){
		$(".info").removeClass("on");
		refreshInfoTxt();
	});
	$(".page a").live("click",function(){
		var oClass = $(this).attr("class");
		if (oClass.indexOf("no") > -1) return;
		var pn = 0;
		var goPnNum = $(this).html();
		if (goPnNum == '上一页') {
			pn = parseInt($(".page .current").html()) - 2;
		} else if (goPnNum == '下一页'){
			pn = parseInt($(".page .current").html());
		} else {
			pn = parseInt($(this).html()) -1;
		}
		var other = '|pn='+pn+'|psrc='+psrc+'|csrc='+csrc+'|bread='+bread;
		var source = url2data(oldmsg,'source');
		var sourceid = url2data(oldmsg,'sourceid');
		var name = url2data(oldmsg,'name');
		var extend = url2data(oldmsg,'extend');
		commonClick(new Node(source,sourceid,name,0,extend,other));
	});
}
