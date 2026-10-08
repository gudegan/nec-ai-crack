var currentObj;
var gedanId;
var infoTxt = '';
var psrc;

var bread;
var txtLen = 0;
var pn = 0;
var rn = 100;
var isIndex;
var newnum = 0;
var currentName;
var commentPageNum = 1;
var oldurl=decodeURIComponent(window.location.href)[0];
var oldmsg;
var isMyLike = "false";
var csrc = "";
// 来源于新用户首页
var isNewUserIndex = "false";
// 歌单插件
var isAllPlay = "false";
window.onload = function(){
	callClientNoReturn('domComplete');
	var url=decodeURIComponent(window.location.href).replace(/###/g,'');
	var msg=getUrlMsg(url);
	oldmsg=msg;
	centerLoadingStart("content");
	gedanId = url2data(msg,'sourceid');
	currentName = url2data(msg,'name');
	isAllPlay = url2data(msg,'playall');
	psrc = getStringKey(msg,'psrc') || '首页->';
	csrc = getStringKey(msg,'csrc');
	$("body").attr("data-csrc",csrc);
	var searchKey = getStringKey(msg,'searchKey');
	if(searchKey!=""){
		$("body").attr("log-searchKey",searchKey);
	}
	newnum =  getStringKey(msg,'MUSIC_COUNT') || 0;
	pn = getStringKey(msg,'pn') || 0;
	commentPageNum = getStringKey(msg,'cpn') || 1;
	isIndex = getStringKey(msg,'from');
	newsong = getStringKey(msg,'newsong');
	// 来源于新用户首页
    isNewUserIndex = getDataByCache("isNewUserIndex");
    if(eval(isNewUserIndex)&&csrc.indexOf("被动安装")<0){
        var pic = new Image();
        pic.src="http://webstat.kuwo.cn/logtj/comm/commjstj/channelred/pc/new_user_active_plist.jpg?u="+getUserID("devid")+"&gid=&channel=&from=pc&src=";
    }
    // 来源于新用户首页 end

	// 新手引导分享下载外链
	if(getDataByConfig('copyLink', 'isNewUser')==""){
		$(".IsNewInstallUser,.isNewUserTips").show();
		setDataToConfig('copyLink', 'isNewUser','false');
		$(".copyLink").addClass("thisNew");
	}
	if(!$(".IsNewInstallUser").is(":hidden")){
		$("body").css({"overflow-y":"hidden","margin":"0px"});
    }
    // 我收藏的歌单
    isMyLike = url2data(msg,'isMyLike')||"false";
	if(isMyLike=="true"){
		gedanId = url2data(msg,'id');
	}
	objBindFn();
	getSomeData();
};

$(window).resize(function(){
	refreshInfoTxt();
});
var currentPlaylistName = "";
var currentPlaylistId = "";
var currentPlaylistPic = "";
var currentPlaylistInfo = "";
// 获取歌单数据
function getSomeData() {
	//var url = 'http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid='+currentObj.sourceid+'&pn='+pn+'&rn='+rn+'&encode=utf-8&keyset=pl2012&identity=kuwo&callback=getGedanInfoData';
	//getScriptData(getChargeURL(url));
	var url = 'http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid='+gedanId+'&pn='+pn+'&rn='+rn+'&encode=utf-8&keyset=pl2012&identity=kuwo&pcmp4=1&newver=1';
	url=getChargeURL(url);
	var d = new Date();
	var time = d.getFullYear()+d.getMonth()+d.getDate()+d.getHours()+parseInt((d.getMinutes()/20));
	time = ''+d.getFullYear()+d.getMonth()+d.getDate()+time;
	url = url+"&ttime="+time;
	var gedanstrattime=new Date().getTime();
	$.ajax({
        url:url,
        dataType:'jsonp',
        crossDomain:false,
		success:function(json){
			var endtime=new Date().getTime()-gedanstrattime;
			realTimeLog("WEBLOG","url_time:"+endtime+";"+"playlist"+";"+url);
			realShowTimeLog(url,1,endtime,0,0);
			getGedanInfoData(json);
		},
		error:function(xhr){
			var endtime=new Date().getTime()-gedanstrattime;
			loadErrorPage();
			var httpstatus = xhr.status;
		    if(typeof(httpstatus)=="undefined"){
			    httpstatus = "-1";
		    }
		    var sta = httpstatus.toString();
			realTimeLog("WEBLOG","url_error:"+sta+";playlist;"+url);
			webLog("请求失败,url:"+url);
			realShowTimeLog(url,0,endtime,sta,0);
		}
    });
}
// 创建歌单内容
function getGedanInfoData(jsondata) {
	var data = jsondata;
    var createName = data.uname;
	var id = data.id;
	currentPlaylistId = id;
	var pic = data.pic;
	pic = getPlaylistPic(pic,150);
	currentPlaylistPic = pic;
	var info = data.info;
	var title = data.title || currentName;
	currentPlaylistName = title;
	currentName = title;
	var tag = data.tag || '无';
	var child = data.musiclist;
	var len = child.length;
	var arr = [];
	var newarr = [];
	var currentPn = parseInt(data.pn);
	var total = data.total;
	var totalPage = Math.ceil(total/rn);
//	var tagstr = '<font>分类：</font>';
	var tagstr = '';
	var pstr = '';
	// var listRid = [];//云盘打标 歌曲列表rid数组
	infoTxt = info.replace(/<br.[^>]+>/g,'');
	currentPlaylistInfo = infoTxt;
	if(currentPlaylistInfo=='')$(".info").hide();
	txtLen = info.length;
	MUSICLISTOBJ = {};
	// 我收藏的歌单
	if(isMyLike=="true"){
		psrc = "收藏歌单->";
		csrc = "收藏歌单->"+title;
		$("body").attr("data-csrc",csrc);
	}
	// end
	if (len < 1) {
		$(".kw_music_list").hide();
	    $(".w_nothing").html($(".nothing").css("padding-top","50px").show());
	}

	if(psrc.indexOf("歌单页")>-1){
	    pstr = psrc;
	}else{
		pstr = psrc + currentName;
	}
	if(isIndex == 'index(algorithm)'){
		pstr = psrc + currentName + '(algorithm)';
	}
	if(isIndex == 'index(editor)'){
		pstr = psrc + currentName + '(editor)';
	}
	if(isIndex == 'indexmore(editor)'){
		pstr = psrc + currentName + '(moreeditor)';
	}
	if(isIndex == 'indexmore(algorithm)'){
		pstr = psrc + currentName + '(morealgorithm)';
	}
	var musicNum = 0;
	for (var i = 0; i < len; i++) {
		var online = child[i].online;
		if(typeof(online)!="undefined"&&online.length==1&&online==0){
			continue;
		}
		// listRid.push(child[i].id);
		if (i < newnum && pn == 0) {
			newarr[newarr.length] = createGedanMusicList(child[i],musicNum,rn,currentPn,pstr);

		} else {
			arr[arr.length] = createGedanMusicList(child[i],musicNum,rn,currentPn,pstr);

		}
		musicNum++;
	}
	$(".toolbar").show();
	$(".selall").show();
	var newListStr = '';
	var pageStr = createPage(totalPage, currentPn+1);
	//---位置不对
	if (newnum > 0 && pn == 0) {
		$(".sub").css({"position":"relative","left":"0px"});
		var date = new Date();
		var month = date.getMonth();
		var date = date.getDate();
		$(".bnew").html((month+1) + "月"+date+"日 / 更新" + newnum + "首新歌").show();
		newListStr = '<li class="newlist"><ul style="display:inline; overflow:auto;">'+newarr.join('')+'<div style="clear:both"></div></ul></li>';
	} else {
		$(".def").find(".checkall").show();
		$(".def").find(".bnew").hide();
		newListStr = '';
	}
	var bigStr = newListStr + arr.join('');
	var tags;
	if(data.tag.indexOf(',')>0){
		 tags = data.tag.split(",");
	}else{
		tags = data.tag.split(" ");
	}
	if (isIndex) {
		for(var i=0,j=tags.length;i<j;i++) {
			var oDate = new Date();
			var oYear = oDate.getFullYear();
			var oMonth = oDate.getMonth() + 1;
			var oDate = oDate.getDate();
			tagstr = oYear + '-' + oMonth + '-' + oDate;
		}
	}
	var tagList= '<span class="icon icon_tag"></span>';
	for(var i=0,j=tags.length;i<j;i++) {
		if(i>4)break;
		if(tags[i].split(":")[0]=='')continue;
	    tagList += '<a class="tag_item">'+tags[i].split(":")[0]+'</a>';
	}
	if(tags.length>0&&tags[0]!=""){
		$(".gedan_head .classify").show();
	}else{
		$(".gedan_head .classify").hide();
	}
    if(createName  && !tagstr && createName.length != '0'){
        $(".gedan_head .user").show().html('<span class="icon icon_u"></span><span class="c_name">'+ createName +'</span>'+ tagstr+ '</font>');
    }else if(createName.length == '0'){
		$(".user").remove();
	}else {
		$(".gedan_head .user").show().html('<span class="icon icon_u"></span><span class="c_name">'+ createName +'</span>'+ tagstr+ '更新</font>');
	}
	$(".classify").append(tagList);
	$(".bread span").html(checkSpecialChar(title,"disname"));
	$(".gedan_head .pic img").attr("src",pic);
	$(".gedan_head .name span").html(checkSpecialChar(title,"disname"));
	$(".gedan_head").show()
	$(".kw_music_list").html(bigStr);
	$(".checkall font").html(total);
	// 云盘打标
	// setCloudIcon(listRid);

	//每次都会改动
	//$(".checkall font").html($('.music_wrap').length);
	if (pageStr) $(".page").html(pageStr).show();
	$(".like_btn").attr("c-id",gedanId);
	showLike('PLAYLIST','8','get');
	//commentModel();// 歌单评论
    try{
        if(typeof(eval(init_comment_model)) == "function") {
           init_comment_model('.channelContent',8,gedanId);
        }
    }catch(e) {}
    // 下载外链
	if(callClient("GetDownlink").indexOf("ch:10002")>-1){
		$(".all_down").click();
	}
	centerLoadingEnd("content");
	//来源于新用户首页
    if(eval(isNewUserIndex)){
        $(".all_play").click();
    }
    // 歌单插件
    if(isAllPlay=="true"){
    	$(".all_play").click();
    }
	iframeObj.refresh();
	refreshInfoTxt();
}
function refreshInfoTxt() {
	if ($(".info").hasClass("on")) return;
	var num = Math.floor(parseInt($(".info").width()) / 12.6) * 2 - 6;
	var text = '';
	if (txtLen > num){
		text = '<span class="allowSelect">'+infoTxt.substring(0,num)+'</span>...<a href="###" hidefocus class="open">[更多]</a>';
	} else {
		text = infoTxt;
	}
	if (isIndex) {
		if (newsong) {
			text = '今日看点：' + text;
		} else {
			text =  text;
		}
	} else {
		text = text;
	}
	$(".info").html('<span class="icon icon_info"></span><span class="allowSelect">'+text+'</span>');
}
function objBindFn() {
	$(".open").live("click",function(){
		$(".info").addClass("on");
		var ttxt = infoTxt;
		if(isIndex&&newsong){
		    ttxt = "今日看点："+ttxt;
		}else{
		    ttxt = ttxt;
		}
		$(".info").html('<span class="icon icon_info"></span><span class="allowSelect">'+ttxt + '</span><a href="###" hidefocus class="fold">[收起]</a>');
	});
	$(".fold").live("click",function(){
		$(".info").removeClass("on");
		refreshInfoTxt();
	});
	$(".page a").live("click",function(){
		var oClass = $(this).attr("class");
		if (oClass.indexOf("no") > -1) return;
		var goPnNum = $(this).html();
		if (goPnNum == '上一页') {
			pn = parseInt($(".page .current").html()) - 2;
		} else if (goPnNum == '下一页'){
			pn = parseInt($(".page .current").html());
		} else {
			pn = parseInt($(this).html()) -1;
		}
		if(url2data(oldmsg,'isMyLike')=='true'){
			getSomeData();
		}else{
			var other = '|psrc='+psrc+'|bread='+bread+'|pn='+pn+'|cpn='+commentPageNum+'|from='+getStringKey(oldmsg,'from')+'|csrc='+csrc;
			var source = url2data(oldmsg,'source');
			var sourceid = url2data(oldmsg,'sourceid');
			var name = url2data(oldmsg,'name');
			var extend = url2data(oldmsg,'extend');
			commonClick(new Node(source,sourceid,name,0,extend,other));
		}
    $(window).scrollTop(0);
	});
	$(".copyLink").live("click",function(){
		if($(this).hasClass("thisNew"))return;
		var url = "http://www.kuwo.cn/down/playlist/"+gedanId;
	    callClientNoReturn("WebClipboard?" + url);
	    $(".tipsBox").show();
	    setTimeout(function(){
	        $(".tipsBox").hide();
	    },2000);
	});
	$(".isNewUserTips .closeTips").live("click",function(){
		$(".IsNewInstallUser,.isNewUserTips").hide();
		$("body").css("overflow-y","auto");
		$(".copyLink").removeClass("thisNew");
	});
}

/*左侧收藏列表回调方法*/
function UserOp(op){
	if(op=="play"){
		$(".all_play").click();
	}else if(op=="playnext"){
		$(".all_play").addClass("playnext").click();
	}else if(op=="downall"){
		$(".all_down").click();
	}else if(op=="copylink"){
		$(".copyLink").click();
	}else if(op=="unfav"){
		$(".like_btn").click();
	}
}
