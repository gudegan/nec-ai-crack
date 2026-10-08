var oneObj;
var download = {};
var loadType = '';
var loadTypenum = 0;
download.rn = 4;
download.allpage = 0;
$(function(){
    callClientNoReturn('ShowWindow');
	var locationJson;
	var re=/%26/g;
	var location = window.location.href.replace(re, '&');
	var downloadTypenum;
	if(location.indexOf('download.html?')>-1){
		var somestrmsg = location.split('download.html?')[1];
		var arr = somestrmsg.split('&');
		var jsonstr = '{';
		for(var i=0; i<arr.length;i++){
			var name  = arr[i].split('=')[0];
			var vaule = arr[i].split('=')[1];
			if(i<arr.length-1){
				jsonstr += '"'+name+'":"'+vaule+'",';
			}else{
				jsonstr += '"'+name+'":"'+vaule+'"';
			}
		}
		jsonstr += '}';
		locationJson = eval("(" + jsonstr + ")");
		downloadTypenum = locationJson.page;
	}else{
		downloadTypenum = 0;
	}
	oneObj = $(".downloadall");
	if(downloadTypenum==0){
		loadType = 'downloading';
		downloadingData();
	}else if(downloadTypenum==1){
		loadType = 'downloadfinish';
		downloadfinishData();
	}else if(downloadTypenum==2){
		loadType = 'downloadall';
		downloadallData();
	}else{
		loadType = 'downloading';
		downloadingData();
	}
	$(".allcontent").scroll(function(){
		contentTop = $(this).get(0).scrollTop;
        if (contentTop > 15) {
        	$(".w_rtop").show();
        } else {
        	$(".w_rtop").hide();
        }
	});
});
//下载中推荐列表
function downloadingData(){
	var url = "http://topmusic.sycdn.kuwo.cn/today_recommend/indexDownIng.js?"+Math.random();
	$.getScript(url);
}
//下载完成推荐列表
function downloadfinishData(){
	var url = "http://topmusic.sycdn.kuwo.cn/today_recommend/indexDownFinish.js?"+Math.random();
	$.getScript(url);
}
//下载专区推荐列表
function downloadallData(){
	loadTypenum = 0;
	var url = "http://topmusic.sycdn.kuwo.cn/today_recommend/indexDownAll.js?"+Math.random();
	$.getScript(url);
}
function callClient(call) {
    try {
        return window.external.callkwmusic(call);
    } catch (e) {
        return "";
    }
}
function callClientNoReturn(call){
	try{
		return window.external.callkwmusic(call,0);
	}catch(e){
		return "";
	}
}
function getValue(url, key) {
    url = url.toString();
    if (url.indexOf('#') >= 0) {
        url = url.substring(0, url.length - 1);
    }
    var value = '';
    var begin = url.indexOf(key + '=');
    if (begin >= 0) {
        var tmp = url.substring(begin + key.length + 1);
        var eqIdx = tmp.indexOf('=');
        var end = 0;
        if (eqIdx >= 0) {
            tmp = tmp.substring(0, eqIdx);
            end = tmp.lastIndexOf('&');
        } else {
            end = tmp.length;
        }
        if (end >= 0) {
            try {
                value = decodeURIComponent(tmp.substring(0, end));
            } catch (e) {
                value = tmp.substring(0, end);
            }
        } else {
            try {
                value = decodeURIComponent(tmp);
            } catch (e) {
                value = tmp;
            }
        }
    }
    return value;
}
//数据返回中转……
var bigjson;
var bigjsonarr = [];
var isShowwindow = true;
function handleSearchNoResult(jsondata){
	if(isShowwindow){
		//callClient('ShowWindow');
		isShowwindow = false;
	}
	if(loadType=='downloading'||loadType=='downloadfinish'){
		var total = jsondata.total;
		bigjson = jsondata;
		download.allpage = parseInt(total/download.rn)-1;
		var bigStr = showOnechild(bigjson);
		oneObj.find(".loaded").html(bigStr);
		oneObj.show();
	}
	// loadTypenum == 0下载推荐首页数据（一屏）
	// loadTypenum >0 单独请求该行全部数据（取完存起来 -> bigjsonarr）
	if(loadType=='downloadall'&&loadTypenum==0){
		var bigStr = showAllchild(jsondata);
		oneObj.html(bigStr);
		oneObj.show();
	}else if(loadType=='downloadall'&&loadTypenum>0){
		bigjsonarr[loadTypenum] = jsondata;
		var bigStr = showloadnumchild(jsondata,1);
		oneObj.html(bigStr);
	}
}
//换一批
function loadsomeData(obj){
	var now = parseInt($(obj).attr("data-now"))+1;
	var isgetHttp = parseInt($(obj).attr("data-isget"));
	var downloadpage = parseInt($(obj).attr("data-allpage"));
	var allpage = downloadpage||download.allpage;
	if(now>allpage) now = 0;
	isShowwindow = false;
	if(loadType=='downloadall'){
		loadTypenum =  parseInt($(obj).parent().parent().parent().attr("id").replace('someload',''));
		oneObj = $("#someload"+loadTypenum);
		if(isgetHttp){
			var url = "http://topmusic.sycdn.kuwo.cn/today_recommend/indexDown"+loadTypenum+".js?"+Math.random();
			$.getScript(url);
			$(obj).attr("data-now",now);
			$(obj).attr("data-isget","0");
		}else{
			var bigStr = showloadnumchild(bigjsonarr[loadTypenum],now);
			oneObj.find(".loaded").html(bigStr);
			$(obj).attr("data-now",now);
		}
	}
	//下载中和下完完成不做区分
	if(loadType=='downloading'||loadType=='downloadfinish'){
		var bigStr = showOnechild(bigjson,now);
		oneObj.find(".loaded").html(bigStr);
	}
}
//显示下载推荐首次数据
function showAllchild(jsondata){
	var data = jsondata;
	if(typeof(data)=="undefined"||data==null) return;
	var child = data.allList;
	var len   = child.length;
	var bigArr = [];
	for(var i=0; i<len; i++){
		var someobj = child[i];
		if(someobj.datalist=='') continue;
		var someArr = [];
		var xia = 0;
		var title = someobj.title;
		if(title=='') title = '暂无标题';
		var num = someobj.itemKey;
		var allpage = parseInt(someobj.total/download.rn)-1;
		var bigStr =  combagdownStr(someobj,0);
		var t1 = title.substring(0,title.length-3);
		var t2 = title.substring(title.length-3);
		someArr[xia++] = '<div class="loaded" id="someload'+num+'"><div class="list"><p class="list_t large">';
		someArr[xia++] = '<b>'+t1+'</b>';
		someArr[xia++] = t2;
		someArr[xia++] = '<a href="###" hidefocus class="rec" data-now="0" data-isget="1" ';
		someArr[xia++] = 'data-allpage="'+allpage+'" onclick="abLog(\'SOMEDATA\',\''+title+'\');loadsomeData(this); return false;">换一批</a></p>';
		someArr[xia++] = '<div class="img_list"><ul>'+bigStr+'</ul></div></div></div>';
		bigArr[i] = someArr.join('');
	}
	return bigArr.join('');
}
function showloadnumchild(jsondata,now){
	var data = jsondata;
	if(typeof(data)=="undefined"||data==null) return;
	var someArr = [];
	var xia = 0;
	var title = data.title;
	if(title=='') title = '暂无标题';
	var allpage = parseInt(data.total/download.rn)-1;
	var bigStr =  combagdownStr(data,now);
	var t1 = title.substring(0,title.length-3);
	var t2 = title.substring(title.length-3);
	someArr[xia++] = '<div class="list"><p class="list_t large">';
	someArr[xia++] = '<b>'+t1+'</b>';
	someArr[xia++] = t2;
	someArr[xia++] = '<a href="###" hidefocus class="rec" ';
	someArr[xia++] = 'data-now="'+now+'" data-isget="0" data-allpage="'+allpage+'" onclick="abLog(\'SOMEDATA\',\''+title+'\');loadsomeData(this); return false;">换一批</a></p>';
	someArr[xia++] = '<div class="img_list"><ul>'+bigStr+'</ul></div></div>';
	$("#someload"+loadTypenum).html(someArr.join(''));
}
function showOnechild(jsondata,now){
	var data = jsondata;
	var now = now || 0;
	if(typeof(data)=="undefined"||data==null) return;
	var someArr = [];
	var xia = 0;
	var title = data.title;
	if(title=='') title = '暂无标题';
	var bigStr =  combagdownStr(data,now);
	someArr[xia++] = '<div class="list"><p class="list_t">';
	someArr[xia++] = title+'<span style="color:#ccc; padding:0 2px">/</span><a class="downloadmore" href="javascript:;" hidefocus="true" onclick="callClientNoReturn(\'KwMore\'); return false;">更多</a>';
	someArr[xia++] = '<a href="###" hidefocus data-now="'+now+'" class="rec" onclick="abLog(\'SOMEDATA\',\''+title+'\');loadsomeData(this); return false;">换一批</a></p>';
	someArr[xia++] = '<div class="img_list"><ul>'+bigStr+'</ul></div></div>';
	return someArr.join('');
}
function returnSpecialChar(s) {
    s = '' + s;
    return s.replace(/\&amp;/g, "&").replace(/\&nbsp;/g, " ").replace(/\&apos;/g, "'").replace(/\&quot;/g, "\"").replace(/\%26apos\%3B/g, "'").replace(/\%26quot\%3B/g, "\"").replace(/\%26amp\%3B/g, "&").replace(/&lt;/g,"<").replace(/&gt;/g,">");
}
// 把显示的name特殊字符替换成html编码
function checkSpecialChar(s, usetype) {
    if (!s) return '';
    s = '' + s;
    if (usetype == "titlename") {
        return s.replace(/\&apos;/g, "'").replace(/\"/g, "&quot;").replace(/\&amp;apos;/g, "'");
    } else if (usetype == "name") {
        return s.replace(/\"/g, "&quot;").replace(/\'/g, "\\\'").replace(/\&apos;/g, "\\\'").replace(/\&#039;/g, "\\\'");
    } else if (usetype == "disname") {
        return s.replace(/\&quot;/g, "\"").replace(/\&apos;/g, "\'").replace(/\&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\%26apos\%3B/g, "'").replace(/\%26quot\%3B/g, "\"").replace(/\%26amp\%3B/g, "&");
    }
    return s.replace(/\&/g, "&amp;").replace(/\"/g, "&quot;").replace(/\'/g, "\\\'").replace(/\&amp;apos;/g, "&#039;");
}
//拼单行内容通用方法
function combagdownStr(data,now){
	var child     = data.datalist;
	var childSize = child.length;
	var someArr   = [];
	var parentname = data.title;
	if(childSize>0){
		var someObj;
		var info;
		var click;
		var source;
		var jiaobiao;
		var sourceid;
		var name;
		var titlename;
		var id;
		var pic;
		var disname;
		var listen;
		var like;
		var tips;
		var htmlchildarray;
		var xia;
		var haslike;
		for(var i=(now*download.rn); i<((now*download.rn)+download.rn); i++){
			someObj  = child[i];
			info = someObj.info;
			if(info=="0首歌曲") continue;
			if(parseInt(info)>1000) info = "1000首歌曲";
			if(!info) info = "";
			if(info==""&&(source==4||source==8||source==12||source==13)) info = "10首歌曲";
			source = someObj.source;
			if(source==2) source = 1;
			sourceid = someObj.sourceid;
			if(sourceid=="") sourceid = 0;
			name = someObj.name;
			name = checkSpecialChar(name,"name");
			jiaobiao = "";
			id   = someObj.id;
			pic  = someObj.pic;
			if(pic==""){
				pic = "img/default.png";
			}
			click = 'Jump?channel=songlib&param={"source":"' + source + '","sourceid":"' + sourceid + '","name":"' + name + '","id":"' + id + '","extend":"","other":"' + encodeURIComponent("|from=index") + '"}';
			click = encodeURIComponent(click);
			disname = someObj.disname;
			titlename = checkSpecialChar(disname,"titlename");
			disname = checkSpecialChar(disname,"disname");
			listen = someObj.listen;
			if(typeof(listen)=="undefined"||listen==""||listen==0) listen = parseInt(100000*Math.random(),10);
			like = someObj.like;
			if(typeof(like)=="undefined"||like==""||like==0) like = parseInt(10000*Math.random(),10);
			tips = someObj.tips;
			htmlchildarray = [];
			xia = 0;
			haslike = false;
			if(source==1||source==2||source==4||source==6||source==8||source==12||source==13||source==14) haslike = true;
			htmlchildarray[xia++] = '<li><div class="pic_m">';
			htmlchildarray[xia++] = '<a href="###" hidefocus class="pic100" ';
			htmlchildarray[xia++] = 'title="'+titlename+'" ';
			htmlchildarray[xia++] = 'onclick="jumpClient(\''+click+'\');">';
			htmlchildarray[xia++] = '<img src="' + pic + '" width="100" height="100" /></a>';
			htmlchildarray[xia++] = '<p class="bgtra_txt">'
			htmlchildarray[xia++] = '<a href="###" hidefocus onclick="jumpClient(\'' + click + '\')">' + info + '</a></p>';
			htmlchildarray[xia++] = '<p class="bgtra"></p></div>';
			htmlchildarray[xia++] = '<p class="song"><a href="###" hidefocus ';
			htmlchildarray[xia++] = 'title="'+titlename+'" ';
			htmlchildarray[xia++] = 'onclick="jumpClient(\''+click+'\')">';
			htmlchildarray[xia++] = disname+'</a></p>';
			htmlchildarray[xia++] = '<a href="###" BAGDOWNNAME="'+parentname+'" hidefocus class="load_btn" ';
			htmlchildarray[xia++] = 'onclick="getBagdownmusic(this,\''+source+'\',\''+sourceid+'\')"></a></li>';
			someArr[i] = htmlchildarray.join('');
		}
		return someArr.join('');
	}
}
// 打包下载
var isTimeout;
var BAGDOWNNAME = '';
function getBagdownmusic(obj,source,sourceid){
	var BAGDOWNNAME = $(obj).attr("BAGDOWNNAME");
	if(!BAGDOWNNAME) BAGDOWNNAME = '';
	isTimeout = false;
	setTimeout(function (){
		isTimeout = true;
	}, 5000);
	if(source==13){
		$.getScript("https://search.kuwo.cn/r.s?stype=albuminfo&albumid="+sourceid+"&callback=downFocusAlbum&alflac=1");
	}else if(source==12||source==8){
	    $.getScript("http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid="+sourceid+"&pn=0&rn=1000&encode=utf-8&keyset=pl2012&identity=kuwo&newver=1&callback=downFocusGeDan");
	}
}
//专辑打包下载方法
function downFocusAlbum(jsondata){
	var data = jsondata;
	if(typeof(data)=="undefined"||data==null||typeof(data.musiclist)=="undefined"){
		return;
	}
	var musicList = data.musiclist;
	var musicSize = musicList.length;
	var artistid = data.artistid;
	var albumid = data.albumid;
	for(var i = 0;i < musicSize;i ++){
		musicList[i].artistid = artistid;
		musicList[i].albumid = albumid;
	}
	var bigString = "";
	bigString = downMusicBigString(musicList,true,0,0);
	if(bigString=="") return;
	var picUrl = getAlbumPrefix()+data.pic;
	picUrl = picUrl.replace("albumcover/120","albumcover/100");
	picUrl = picUrl.replace("albumcover/150","albumcover/100");
	callClientNoReturn("PackDown?mv=0&n="+musicSize+bigString+"&packname="+encodeURIComponent(data.name)+"&packpic="+encodeURIComponent(picUrl)+"&packid="+data.albumid+"&packtype=album&packinfo="+encodeURIComponent(data.info)+"&src="+loadType+"->name->"+encodeURIComponent(BAGDOWNNAME));
	callClientNoReturn("LogPackDown "+data.name);
	bigString = null;
	musicList = null;
	data = null;
}
function getAlbumPrefix(pic) {
    var num = getImgNumber(pic);
    var prefix;
    prefix = "http://img" + num + ".sycdn.kuwo.cn/star/albumcover/";
    return prefix;
}
function getImgNumber(pic) {
    var num = (getHashCode(pic + getUserID("devid")) % 10) + 1;
    if (num >= 5) {
        if (num >= 8) {
            num = 4;
        } else {
            num = 3;
        }
    } else {
        if (num >= 2) {
            num = 2;
        }
    }
    return num;
}
function getUserID(s) {
    var clientString = callClient("UserState?src=user");
    var clientid = getValue(clientString, s);
    if (clientid == "") {
        clientid = 0;
    }
    return clientid;
}
function getHashCode(str) {
    var hash = 0;
    var len = str.length;
    if (len == 0) return hash;
    for (i = 0 ; i < len; i++) {
        var ch = "";
        ch = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash = hash & hash;
    }
    if (hash < 0) {
        hash = -hash;
    }
    return hash;
}
//歌单打包下载方法
function downFocusGeDan(jsondata){
	var data = jsondata;
	if(typeof(data)=="undefined"||data==null||typeof(data.musiclist)=="undefined"){
		return;
	}
	var musicList = data.musiclist;
	var musicSize = musicList.length;
	var bigString = "";
	bigString = downMusicBigString(musicList,true,data.id,0);
	if(bigString==""){
		return;
	}
	callClientNoReturn("PackDown?mv=0&n="+musicSize+bigString+"&packname="+encodeURIComponent(data.title)+"&packpic="+encodeURIComponent(data.pic)+"&packid="+data.id+"&packtype=playlist&packinfo="+encodeURIComponent(data.info)+"&src="+loadType+"->name->"+encodeURIComponent(BAGDOWNNAME));
	callClientNoReturn("LogPackDown "+data.title);
	musicList = null;
	bigString = null;
	data = null;
}
//拼打包下载串
function downMusicBigString(objs,flag,pid,phbid,name){
	var musicList = objs;
	var musicSize = musicList.length;
	var bigString = "";
	var bigarray = [];
	var someObj;
	var param;
	var paramArray;
	var childArray;
	var musicString;
	var musicridnum;
	var psrc;
	var musicstringarray;
	var sarray;
	var si;
	var rid;
	var mp3rid;
	var mvrid;
	var psrc;
	var musicstringarray;
	var xia;
	if(flag){
		for(var i = 0; i < musicSize; i++){
			someObj = musicList[i];
			param = someObj.param;
			if(typeof(param)=="undefined"){
				param = someObj.params;
			}
			param = returnSpecialChar(param);
			paramArray = param.split(";");
			childArray = [];
			musicString = "";
			for(var j=0;j<paramArray.length;j++){
				if(j < 3){
					childArray[j] = encodeURIComponent(returnSpecialChar(paramArray[j]));
				}else{
					childArray[j] = paramArray[j];
				}
			}
			musicString = childArray.join('\t');
			musicridnum = paramArray[5];
			if(musicridnum.indexOf("MUSIC")>-1){
				musicridnum = musicridnum.substring(6);
			}
			childArray = null;
			paramArray = null;
			psrc = "";
			musicstringarray = [];
			musicstringarray[0] = musicString;
			musicstringarray[1] = psrc;
			musicstringarray[2] = someObj.formats;
			musicString = musicstringarray.join('\t');
			musicstringarray = null;
			musicString = encodeURIComponent(musicString);
			sarray = [];
			si = 0;
			sarray[si++] = '&s';
			sarray[si++] = (i+1);
			sarray[si++] = '=';
			sarray[si++] = musicString;
			bigarray[i] = sarray.join('');
			sarray = null;
		}
	}else{
		for(var i = 0; i < musicSize; i++){
			someObj = musicList[i];
			rid = "MUSIC_"+ someObj.musicrid;
			mp3rid = "MP3_"+someObj.mp3rid;
			mvrid = "MV_"+someObj.mkvrid;
			psrc = getPSRC(someObj.artistid,someObj.albumid,0,someObj.musicrid,0);
			musicstringarray = [];
			xia = 0;
			musicstringarray[xia++] = encodeURIComponent(returnSpecialChar(someObj.name));
			musicstringarray[xia++] = encodeURIComponent(returnSpecialChar(someObj.artist));
			musicstringarray[xia++] = encodeURIComponent(returnSpecialChar(someObj.album));
			musicstringarray[xia++] = someObj.nsig1;
			musicstringarray[xia++] = someObj.nsig2;
			musicstringarray[xia++] = rid;
			musicstringarray[xia++] = someObj.mp3sig1;
			musicstringarray[xia++] = someObj.mp3sig2;
			musicstringarray[xia++] = mp3rid;
			musicstringarray[xia++] = someObj.mkvnsig1;
			musicstringarray[xia++] = someObj.mkvnsig2;
			musicstringarray[xia++] = mvrid;
			musicstringarray[xia++] = someObj.hasecho;
			musicstringarray[xia++] = psrc;
			musicstringarray[xia++] = someObj.formats;
			musicString = musicstringarray.join('\t');
			musicstringarray = null;
			musicString = encodeURIComponent(musicString);
			sarray = [];
			si = 0;
			sarray[si++] = '&s';
			sarray[si++] = (i+1);
			sarray[si++] = '=';
			sarray[si++] = musicString;
			bigarray[i] = sarray.join('');
			sarray = null;
		}
	}
	bigString = bigarray.join('');
	bigarray = null;
	musicList = null;
	return bigString;
}
function jumpClient(json){
	callClientNoReturn(decodeURIComponent(json));
}
function abLog(type,name){
	//callClient("ABLog?msg="+type+":"+encodeURIComponent(name));
}
function returnTop() {
	$(".allcontent").stop().animate({scrollTop:0},500);
}

window.onresize = function (){
	try{
		if($(window).height()>=$(".downloadall").height()) {
			$(".w_rtop").hide();
		}
		$("#allcontent").height($(window).height());
	}catch(e){
		abLog("scrollerr:"+e.message)
	}
}
