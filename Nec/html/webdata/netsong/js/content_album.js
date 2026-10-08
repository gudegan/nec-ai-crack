
var currentObj;
var albumId;
var artistId;
var pn = 0;
var rn = 1000;
var from;
var currentName;
var currentName2;
var currentArtistName;
var psrc = "";
var showSimilarAlbum = true;//根据需求若专辑歌曲数超过100首，则不显示相关专辑
var oldurl=decodeURIComponent(window.location.href).split('?')[0];
var oldmsg='';
var csrc="";
window.onload = function(){
	callClientNoReturn('domComplete');
	var url=decodeURIComponent(window.location.href).replace(/###/g,'');
	var msg=getUrlMsg(url);
	var searchKey = getStringKey(msg,'searchKey');
	if(searchKey!=""){
		$("body").attr("log-searchKey",searchKey);
	}
	oldmsg=msg;
	centerLoadingStart("content");
    //currentObj = fobj.goldjson;
    albumId = url2data(msg,'sourceid');
	currentName2 =url2data(msg,'name');
    currentAlbumId = albumId;
    from = getStringKey(msg,'from');
   	psrc = getStringKey(msg,'psrc');
   	csrc = getStringKey(msg,'csrc');
   	bread = getStringKey(msg,'bread');
	sortby = getStringKey(msg,'sortby') || 0;
	tabType = getStringKey(msg,'tabType') || 'song';
	pn = getStringKey(msg,'pn') || 0;
    //createBread(currentObj,"album");

    if(albumId=="client"){
        getAlbumByName(currentObj);
    }else{
        getSomeData();
    }
    // 新手引导分享下载外链
    if(getDataByConfig('copyLink', 'isNewUser')==""){
		$(".IsNewInstallUser,.isNewUserTips").show();
		setDataToConfig('copyLink', 'isNewUser','false');
		$(".copyLink").addClass("thisNew");
	}
    if(!$(".IsNewInstallUser").is(":hidden")){
		$("body").css({"overflow-y":"hidden","margin":"0px"});
    }else{
    	$(".copyLink").css("z-index","1")
    }
	objBindFn();
};
function getAlbumByName(nodeobj){
	var name = nodeobj.name;
	name = decodeURIComponent(name);
	var namearray = name.split("|");
	if(namearray.length<2){
		return;
	}
	var artist = namearray[0];
	var album = namearray[1];
	var url = "https://search.kuwo.cn/r.s?pn="+pn+"&rn="+rn+"&stype=albuminfo&album="+encodeURIComponent(album)+"&artist="+encodeURIComponent(artist)+"&alflac=1&pcmp4=1&encoding=utf8&newver=1";
	//getScriptData(url);
	$.ajax({
        url:url,
        dataType:'jsonp',
		success:function(json){
			getSomeAlbum(json);
		}
    });
}
function getSomeAlbum(jsondata){
	if(typeof(jsondata)=="undefined"||!jsondata||typeof(jsondata.albumid)=="undefined"){
        return;
	}
	albumId = jsondata.albumid;
	currentAlbumId = albumId;
	getSomeData();
}

$(window).resize(function(){
    checkJianJie();
	iframeObj.refresh();
});
String.prototype.gblen = function() {
	var len = 0;
	for ( var i = 0; i < this.length; i++) {
		if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {
			len += 2;
		} else {
			len++;
		}
	}
	return len;
};
function cutStrByGblen(str, gblen){
	if (str.gblen() <= gblen) {
		return str;
	} else {
		var baseCut = Math.floor((gblen - 1) / 2);
		var result = str.substring(0, baseCut);
		var nowGblen = result.gblen();
		if (nowGblen < gblen) {
			for ( var i = baseCut, len = str.length; i < len; i++) {
				var charGblen = str.charAt(i).gblen();
				if (nowGblen + charGblen <= gblen - 1) {
					result += str.charAt(i);
					nowGblen += charGblen;
				} else {
					var dotNum = gblen - nowGblen;
					if(dotNum>0){
						result += '...';
					}
					return result;
				}
			}
		}
	}
}
// 获取专辑数据
function getSomeData() {
	var url = 'https://search.kuwo.cn/r.s?pn='+pn+'&rn='+rn+'&stype=albuminfo&albumid='+albumId+'&show_copyright_off=1&alflac=1&pcmp4=1&encoding=utf8&newver=1';
	//getScriptData(getChargeURL(url));
	url = getChargeURL(url);
	$.ajax({
        url:url,
        dataType:'jsonp',
		success:function(json){
			getAlbumInfoData(json);
		},
		complete:function(){
			// 专辑评论入口
			init_comment_model('.channelContent',13,albumId);
		}
    });
}
var currentAlbumName = "";
var currentAlbumId = "";
var currentAlbumPic = "";
var currentAlbumInfo = "";
var iframeInFo = "";
// 创建专辑内容
function getAlbumInfoData(jsondata) {
	var data = jsondata;
	var albumId  = data.albumid;
	if(typeof(data.name)=="undefined"){
	    //var name = currentObj.name;
	    var name = currentName2;
		name = checkSpecialChar(name,"disname");
	    if(name.indexOf("|")>-1){
	        name = name.split("|")[1];
	    }
	    $(".bread span").html(name);
	    $(".checkall font").html("共0首");
	    $(".kw_music_list").hide();
	    $(".w_nothing").html($(".nothing").css("padding-top","50px").show());
	    var bread = '<span>'+cutStrByGblen(checkSpecialChar(name,"disname"),32)+'</span>';
	    $(".bread i").html(bread);
	    $(".album_head .name b").html(cutStrByGblen(checkSpecialChar(name,"disname"),32)).attr("title",checkSpecialChar(name,"disname"));
	    iframeInFo = "暂无";
	    $(".w_jianjie div").html(iframeInFo);
	    centerLoadingEnd("content");
	    iframeObj.refresh();
	    return;
	}
	if(data.pay&&data.pay>0){
		$(".kw_ugcInfoIconAlbum").hide();
		var albumIsPayUrl = "http://vip1.kuwo.cn/musicpay?op=policy&src=mbox&albumids="+albumId+"&encoding=utf8&time="+Math.random();
		$.ajax({
	        url:albumIsPayUrl,
	        dataType:"text",
	        type:"get",
	        crossDomain:false,
	        success:function(paydata){
	        	paydata = eval('('+paydata+')');
	            if(paydata.albums && paydata.albums[0].rules){
					realTimeLog("MUSIC_FEE","FEE_TYPE:ALBUM_PAGE_BTN_SHOW|"+psrc);
	                $(".w_buyalbum").attr("data-id",albumId).show();
	            }
	        },
	        error:function(){
	            $(".w_loading").html('<a href="###" onclick="window.location.reload();return false;">点此刷新</a>');
	        }
	    });
	}else{
		$(".kw_ugcInfoIconAlbum").show();
	}
	var name = data.name;
	currentAlbumName = name;
	currentName = name;
	var artist = data.artist;
	currentArtistName = artist;
	if(csrc==""){
		csrc = "曲库->歌手->"+artist+"->"+name;
	}
	$("body").attr("data-csrc",csrc);
	var lang = data.lang;
	var pub = data.pub;
	var pic = getAlbumPic(data.pic) || 'img/default.jpg';
	pic = pic.replace("albumcover/100","albumcover/150").replace("albumcover/120","albumcover/150");
	currentAlbumPic = pic;
	var info = data.info;
	if (from == 'index') {
		psrc = '首页->最新专辑->'+currentName;
	} else  if(psrc!=""){
		psrc = psrc;
	}else{
		psrc = '歌手->' + currentArtistName +'->'+currentName;
	}
    if($(".toolbar .all_down").size()>0){
        $(".toolbar .all_down").attr("data-psrc",psrc)
    }
	artistId = data.artistid;
	iframeInFo = "<label class='allowSelect'>"+info.replace(/(^\s*)|(\s*$)/g,"").replace(/&lt;br&gt;/gi,'<br/>')+"</label>";
	if(iframeInFo==""){
	    iframeInFo = "暂无";
	}
	currentAlbumInfo = iframeInFo;
	var child = data.musiclist;
	var len = child.length;
	if(len==0){
		$(".kw_music_list").hide();
	    $(".w_nothing").html($(".nothing").css("padding-top","50px").show());
	}
	if(len >= 100){
		showSimilarAlbum = false;
	}
	var arr = [];
	var atriststr = '<a href="###" hidefocus onclick="'+commonClickString(new Node(4,data.artistid,checkSpecialChar(artist,"name"),4))+'">'+checkSpecialChar(artist,"disname")+'</a>';
	MUSICLISTOBJ = {};
	for (var i = 0; i < len; i++) {
        child[i]['albumid'] = data.albumid;
		arr[arr.length] = createAlbumMusicList(child[i],i,psrc);
	}
	$(".checkall font").html(len);
	$(".album_head .pic img").attr("src",pic);
	$(".album_head .pic").attr("data-albumid",albumId);

	$(".album_head .name b").html(cutStrByGblen(checkSpecialChar(name,"disname"),32)).attr("title",checkSpecialChar(name,"disname"));

	if(atriststr){
		$(".album_head .artist").show().append("<span>"+ atriststr + "</span>");
	}else{
		$(".album_head .artist").hide();
	}
	if(lang){
//		$(".album_head .lang").show().append("<span class='icon icon_info'><span>")
		$(".album_head .lang").show().append("<span>"+lang+"</span>");
	}else{
		$(".album_head .lang").hide();
	}
	if (pub){
		$(".album_head .datetime").show().append("<span>"+pub+"<span>");
	}else{
		$(".album_head .datetime").hide();
	}
	//信息加载完毕后显示
	$(".InfoBox").show();
	var breadartist = checkSpecialChar(artist,"disname");
	var breadalbum = cutStrByGblen(checkSpecialChar(name,"disname"),32);
	if(breadalbum.indexOf("...")>-1){
	    breadartist = cutStrByGblen(breadartist,18);
	}else{
	    if(breadalbum.length+breadartist.length>20){
	        breadartist = cutStrByGblen(breadartist,18);
	    }
	}
	var bread = '<a id="w_artist" href="###" hidefocus onclick="'+commonClickString(new Node(4,data.artistid,checkSpecialChar(artist,"name"),4))+'">'+breadartist+'</a> &gt; <span>'+breadalbum+'</span>';
	$(".bread i").html(bread);
	$(".breadback").html("返回到"+breadartist);
	checkJianJie();
	getSimilarData();
	$(".kw_music_list").html(arr.join(''));
	$(".like_btn").attr("c-id",albumId);
	getLikeStatus('7');
	if(!showSimilarAlbum){
		centerLoadingEnd("content");
		iframeObj.refresh();
	}else{
		iframeObj.refresh();
	}
	// 下载外链
	if(callClient("GetDownlink").indexOf("ch:10003")>-1){
		$(".all_down").click();
	}
	if(len==0){
		$(".copyLink").addClass("noSong");
	}else{
		$(".copyLink").removeClass("noSong");
	}
}

function getSimilarData(){
	if(showSimilarAlbum){
		var url = 'https://search.kuwo.cn/r.s?stype=albumlist&artistid='+artistId+'&sortby=1&rn=20&pn=0&show_copyright_off=1&pcmp4=1&encoding=utf8&newver=1';
		//getScriptData(url);
		$.ajax({
	        url:getChargeURL(url),
	        dataType:'jsonp',
			success:function(json){
				showArtisthotAlbum(json);
			}
	    });
	}

}
function allAlbum(){
    var other = '|psrc=|bread=|tabType=album|pn=0|csrc=曲库->歌手->'+currentArtistName;
    commonClick(new Node(4,artistId,currentArtistName,4,'',other));
}
//加载歌手相关热门专辑
function showArtisthotAlbum(jsondata){
	try{
	var data = jsondata;
	if (!data) return;
	var child = data.albumlist;
	var len = child.length;
	if (len < 2){
		centerLoadingEnd("content");
		return;
	}
	var arr = [];
	var albumarr = [];
	for (var i=0; i < Math.min(len,9); i++){
	    if(child[i].albumid != albumId){
	    	albumarr.push(child[i]);
	    }
	}
	albumarr.shuffle();
	for (var i=0; i < albumarr.length; i++){
		arr[arr.length] = createAlbumBlock(albumarr[i],'artist',null,"about");
	}
	$(".kw_album_list").html(arr.join('')).show().prev().show();
	centerLoadingEnd("content");
	iframeObj.refresh();
	}catch(e){}
}

//数组打乱顺序方法
Array.prototype.shuffle=function(){
    var arr=this;
	for(var j,x,i=arr.length;i;j=parseInt(Math.random()*i),x=arr[--i],arr[i]=arr[j],arr[j]=x);
	return arr;
}

var oInfoIframe;
function iframeShow(obj){
    $(".w_jianjie").hide().find(".w_jianjie_con").remove();
    $(".w_jianjie").append("<div class='w_jianjie_con'></div>");
    $(".w_jianjie_con").html(iframeInFo);
    $(".w_jianjie").show();
    $(".w_jianjie_con").height("auto");
    var h = $(".w_jianjie_con").get(0).scrollHeight;
    if(h>255){
        $(".w_jianjie_con").height(255);
        $(".w_jianjie").height(285);
    }else{
        $(".w_jianjie_con").height(h);
        $(".w_jianjie").height(h+30);
    }
    if($(".max_content").height()<360){
        $(".max_content").height(360);
    }
}
function iframeHide(){
    $(".w_jianjie").hide();
}
function checkJianJie(){
    $(".jianjie_z").show();
    var ww = $(window).width();
    if($(".max_content").width()-$(".jianjie_z").offset().left<275){
    //if(ww<557){
       $(".jianjie_z,.w_jianjie").hide();
    }else{
       $(".jianjie_z").show();
    }
}

function objBindFn() {
	$(".copyLink").live("click",function(){
		if($(this).hasClass("noSong")||$(this).hasClass("thisNew"))return;
		var url = "http://www.kuwo.cn/down/album/"+albumId;
	    callClientNoReturn("WebClipboard?" + url);
	    $(".tipsBox").show();
	    setTimeout(function(){
	        $(".tipsBox").hide();
	    },2000);
	});
	$(".isNewUserTips .closeTips").live("click",function(){
		$(".IsNewInstallUser,.isNewUserTips").hide();
		$("body").css("overflow-y","auto");
		$(".copyLink").removeClass("thisNew").css("z-index","1");
	});
}

$(function(){
	$(".w_buyalbum").live("click",function(){
        var chargePath = $(".toolbar .w_buyalbum").attr("data-psrc")
        saveDataToCache("chargeAlbumPsrc",chargePath)
		callClientNoReturn("BuyAlbum?albumid=" + $(this).attr("data-id")+"&psrc="+chargePath);
	});
});
