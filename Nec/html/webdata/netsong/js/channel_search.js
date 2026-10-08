// 全局变量
var host_url = "https://search.kuwo.cn/";
// var host_url = "http://103.79.26.41:8083/";
var isopen = callClient("OpenChargeSong");
var MUSICLISTOBJ = {};
var MVLISTOBJ = [];
var MVLISTOBJECT = [];
var version = "";
var pn = 0;
var searchKey = '';
var searchKeyForLog = '';
var searchLogIsOpen = true;
var searchBeginTime = 0;
var searchBeginNum = -1;
var checkSeverTimes = 1;//检查服务次数
var agentFlag = false;//是否走代理
var csrcWhere = "";//用于csrc
var tabType = "radio";
var startTime = 0;//ServiceLevel日志用起始时间
var uid = 0;
var hitNum = 0;
var devid = 0;
var $skinConfig = {};
// 全局变量结束
$(function(){
	callClientNoReturn('domComplete');
	$skinConfig = JSON.parse(window.parent.document.getElementById('radio_iframe').getAttribute("data-config"));
	// centerLoadingStart();
	//获取key、type等信息
	var url = window.location.href;
	var msg = getUrlMsg(url);
	var type = url2data(msg,'type');
	var key = getStringKey(url,'key');
	searchKey = checkSpecialChar(key + '',"name");
	searchKeyForLog = searchKey.replace(/-/g,"");
	uid = getUserID("uid");
	devid = getUserID("devid");
	// searchBeginNum和searchBeginTime
	setSearchBegin();
	//设置页面公用
	setPageInfo(type,key);
	call_create_search_list_fn(type,encodeURIComponent(key));
	objBind();
	$("body").removeClass().addClass($skinConfig.type);
});
function onSkinChange(skinConfig) {
	$skinConfig = skinConfig;
	$("body").removeClass().addClass(skinConfig.type);
	$(".kw_radiolist .br_name a i").css("color",skinConfig.linkColor);
	upDateSkin();
}
function upDateSkin() {
	$(".page .current").css("background",$skinConfig.skinColor);
}
$(window).resize(function(){
	var radioIframe = window.parent.document.getElementById('radio_iframe');
	radioIframe.height = $("body").height();
});
// 检查服务是否通  先走search.kuwo.cn再走config里的ip 最后走代理
function checkSearchServer(type,key){
	var dns1 = callClient("GetConfig?section=Netsong&key=SearchServerDNS1")+'/';
	// var dns3 = callClient("GetConfig?section=Netsong&key=SearchServerDNS2")+'/';
	// var dns2 = callClient("GetConfig?section=Netsong&key=SearchServerDNS3")+'/';
	var url = dns1;
	$.ajax({
		type: "get",
		url: url,
		cache: false,
		timeout : 5000,
		success:function(){
			host_url = url;
			// 执行创建list方法
			call_create_search_list_fn(type,key);
		},
		error: function() {
			if(checkSeverTimes==2){
				searchDomainChange(key,type);
				return;
			}else{
				checkSeverTimes++;
			}
			checkSearchServer(type,key);
		}
	});
}
// 代理服务
function searchDomainChange(key,type,agent){
	agentFlag = true;
	var rn = 100;
	var url = 'http://'+hostConfig+'/r.s?all='+key+'&ft=music&newsearch=1&alflac=1&itemset=web_2013&client=kt&cluster=0&pn='+pn+'&rn='+rn+'&vermerge=1&rformat=json&encoding=utf8&show_copyright_off=1&pcmp4=1&ver=mbox&thost=search.kuwo.cn';
    if(agent)url = 'http://'+hostConfig+agent+'&thost=search.kuwo.cn';
    startTime = new Date().getTime();//ServiceLevel日志用起始时间
    $.ajax({
	    url:url,
	    type:"get",
		dataType:"text",
		crossDomain:false,
	    success:function(data){
	    	setPageInfo(type,decodeURIComponent(key));
		    switch(type){
		    	case "mv" :
		    		mvSuccess(data);
		    	break;
		    	case "setlist" :
		    		playListSuccess(data);
		    	break;
		    	case "radio" :
		    		radioSuccess(data);
		    	break;
		    	case "artist" :
		    		artistSuccess(data);
		    	break;
		    	case "album" :
		    		albumSuccess(data);
		    	break;
		    	case "lrc" :
		    		lrcSuccess(data);
		    	break;
		    	default:
		    		musicSuccess(data,url);
		    	break;
		    }
	    },
	    error:function(xhr){
			searchNoResult();
		    var httpstatus = xhr.status;
		    if(typeof(httpstatus)=="undefined"){
			    httpstatus = "-1";
		    }
		    var sta = httpstatus.toString();
		    // 接口有问题发url_error日志
			realShowTimeLog(hostConfig+'-searchDomainChange-'+type,0,(new Date().getTime()-startTime),sta,0);
		    return;
	    }
    });
}
function call_create_search_list_fn(type,key){
	switch(type){
		case 'all':
			csrcWhere = "结果列表";
			get_musiclist_data(key);
			$(".all_ckb").attr("checked",false);
			break;
		case 'mv':
			csrcWhere = "MV列表";
			MVLISTOBJ = [];//清空MVLISTOBJ
			get_mv_data(key);
			break;
		case 'setlist':
			csrcWhere = "歌单列表";
			get_playlist_data(key);
			break;
		case 'radio':
			csrcWhere = "电台列表";
			get_radio_data(key);
			break;
		case 'artist':
			csrcWhere = "歌手列表";
			get_artist_data(key);
			break;
		case 'album':
			csrcWhere = "专辑列表";
			get_album_data(key);
			break;
		case 'lrc':
			csrcWhere = "歌词列表";
			get_lrc_data(key);
			$(".all_ckb").attr("checked",false);
			break;
		default:
			get_musiclist_data(key);
			break;
	}
}

// 设置页面公用
function setPageInfo(type,key){
	key = key.toString().replace(/<[^>]+>/g,'');
	setErrorWordTips(key);
	if(key.length>23){
		key.length=23;
		key += '...';
		$('.seach_title span').html(key);
	}else{
		$('.seach_title span').html(key);
	}
	if(type!='all'){
		$('.tabBox a').removeClass('active');
	}
	switch(type){
		case 'mv':
			$('.tabBox a').eq(1).addClass('active');
			break;
		case 'setlist':
			$('.tabBox a').eq(2).addClass('active');
			break;
		case 'radio':
			$('.tabBox a').eq(3).addClass('active');
			break;
		case 'artist':
			$('.tabBox a').eq(4).addClass('active');
			break;
		case 'album':
			$('.tabBox a').eq(5).addClass('active');
			break;
		case 'lrc':
			$('.tabBox a').eq(6).addClass('active');
			break;
	}
}

// 纠错词搜索结果
function setErrorWordTips(key){
	var url = 'http://jiucuo.search.kuwo.cn/correct.s?key='+key;
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			var json = eval('('+data+')');
			if(json['status']=='ok'){
				var dataArr = json['result'];
				if(dataArr.length){
					create_error_word_tips(dataArr);
				}
			}
		},
		error:function(xhr){

		}
    });
}

function create_error_word_tips(data){
	var model = loadTemplate('#kw_otherwordModel');
	var html = drawListTemplate(data,model,proErrorWordTips);
	html = '<span>您要找的是不是：</span>'+html;
	$('.seach_other_word').html(html);
	$('.seach_other_word').show();
}

function proErrorWordTips(obj){
	var json = {};

	var key = obj.name;
	var diskey = '\"'+key+'\"';
	json = {
		'key':key,
		'diskey':diskey
	}

	return json;
}

function clientSearch(obj){
	var key = $(obj).attr('data-key');
	key = encodeURIComponent(key);
	var call = 'ClientSearch?key='+key;
	callClientNoReturn(call);
}

// 搜索单曲部分开始
function get_musiclist_data(key){
	var rn = 100;
	if(agentFlag){
		searchDomainChange(key,"all");
		return;
	}
	var url = host_url+'r.s?all='+key+'&ft=music&newsearch=1&alflac=1&itemset=web_2013&client=kt&cluster=0&pn='+pn+'&rn='+rn+'&vermerge=1&rformat=json&encoding=utf8&show_copyright_off=1&pcmp4=1&ver=mbox';
	url = getChargeURL(url);
	startTime = new Date().getTime();//ServiceLevel日志用起始时间
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			musicSuccess(data,url);
		},
		error:function(xhr){
			checkSearchServer(tabType,key);
			var httpstatus = xhr.status;
		    if(typeof(httpstatus)=="undefined"){
			    httpstatus = "-1";
		    }
		    var sta = httpstatus.toString();
		    // 接口有问题发url_error日志
		}
    });
}
function musicSuccess(data,url){
	try{
		var jsondata = eval('('+data+')');
	}catch(e){
		searchNoResult();
		return;
		// 数据有问题发url_error日志
	}
	// url_time日志
	realShowTimeLog(url,1,(new Date().getTime()-startTime),0,0);
	// 新搜索统计日志 单曲
	hitNum = jsondata.TOTAL;
	sendSearchLog("search","ALL");

	var musicIsShow = musicCheckIsNoResult(jsondata);
	if(musicIsShow){
		searchNoResult();
		return;
	}
	var paramArr = [];
	var count = 0;
	var dataArr = jsondata.abslist;
	for(var i=0; i<dataArr.length; i++){
		var flag = parseInt(dataArr[i].ONLINE);
		if(flag){
			paramArr[count++] = dataArr[i];
		}
	}
	for(var i=0;i<paramArr.length;i++){
		paramArr[i].indexnum = i;
		paramArr[i].PN = jsondata.PN;
		paramArr[i].RN = jsondata.RN;
	}
	if(paramArr.length==0){
		searchNoResult();
		return;
	}
	var firstData = dataArr[0];
	create_musiclist(paramArr);
	create_musiclist_other(jsondata);
	create_xiu_dhj(firstData);//大合集相关创建
	create_dhj(searchKey);
	centerLoadingEnd();
	loadImages();
}

function create_musiclist(data){
	var model = loadTemplate('#kw_musiclistModel');
	var html = drawListTemplate(data,model,proMusicListData);
	$('.w_musiclist .kw_music_list').html(html);
}

function proMusicListData(obj){
	var json = {};
	var name = checkSpecialChar(obj.SONGNAME,"name");
    var disname = checkSpecialChar(obj.SONGNAME,"disname");
    var titlename = checkSpecialChar(obj.SONGNAME,"titlename");
    var showdisname = searchReplaceAll(disname);
	var album = obj.ALBUM;
	var showalbum = searchReplaceAll(checkSpecialChar(album,"disname"));
	var albumTitle = obj.ALBUM;
	var albumid = obj.ALBUMID;
	var artist = obj.ARTIST;
	var showartist = searchReplaceAll(checkSpecialChar(artist,"disname"));
	var artistTitle = obj.ARTIST;
	var artistid = obj.ARTISTID;
	var formats = obj.FORMATS;
	var id = obj.MUSICRID;
	var copyright = obj.copyright || obj.COPYRIGHT;
	var rid = id.replace("MUSIC_","")
	var tips = getMusicTips(name,artist,album,rid);
	var score100 = parseInt(obj.SCORE100) || 2;
	if(score100>100){
	    score100 = 100;
	}
	var indexnum = obj.indexnum;
	var pn = parseInt(obj.PN) || 0;
	var rn = parseInt(obj.RN) || 100;
	var num = rn * pn + indexnum + 1;
	if (num < 10) num = '0' + num;
	var liclass = getCopyrightClass(obj);
	var infoStr = '';
	var pay = obj.PAY;
	var earthBlock = "";
	if(parseInt(copyright)==1){
		earthBlock = `<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>
				    	<p class="sourceTitle">${disname}</p><p class="sourceUrl"></p>
				    	<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p>
			    	</div>`;
		infoStr = '<a title="该歌曲来自第三方网站" class="earth" javascript:;></a>';
	}else if(pay==0){
		infoStr = '<a title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon" javascript:;></a>';
	}
	var hqLevel = getHqLevel(obj);
	var mviconstr = '';
	if(!getTanMuIconStr(obj) && obj.IS_POINT == '0'){
		var mvclass = checkMvIcon(obj);
		mviconstr = `<a hidefocus href="javascript:;" class="${mvclass}" title="观看MV"></a>`;
	}
	if(getTanMuIconStr(obj) && obj.IS_POINT == '1' ){
        var strTm = getTanMuIconStr(obj);
        mviconstr = '<i class="m_score tm">'+ strTm + '</i>';
    }
    var artistclick = '';
    var albumclick = '';
    var other = '|psrc=歌手->|bread=-2,4,歌手,0';
	artistclick = 'jumpQK(4,'+obj.ARTISTID+',\''+checkSpecialChar(artist,"name")+'\',4,\'\',\''+other+'|searchKey='+searchKeyForLog+'-歌手-查看歌手'+'\');searchOperationLog(\'ref\',\'-100\',\'music\',\'refartist\');';
	albumclick = 'jumpQK(13,'+obj.ALBUMID+',\''+checkSpecialChar(album,"name")+'\',13,\'\',\''+'|searchKey='+searchKeyForLog+'-专辑-查看专辑'+'\');searchOperationLog(\'ref\',\'-100\',\'music\',\'refalbum\');';
	var isnew = obj["new"];
	var newhtml = ''
    if(typeof(isnew)!="undefined" && isnew==1){
        newhtml = "<em class='musicnewimg'></em>";
    }
    var moneyIcon = getMoney(obj,"down");
    var vericon = '';
    var verlist = '';
    var verisshow = '';
    var verDataArr = obj['SUBLIST'] || [];
    if(verDataArr.length){//判断如果有多版本歌曲的话 创建多版本歌曲的list
    	verlist = create_ver_list(verDataArr);
    	vericon = '<a hidefocus="" href="javascript:;" class="m_ver" title="展开"></a>';
    }
    var allowDwonClass = "";
    var title = "下载歌曲";
    if(obj.isdownload=="1"){
    	allowDwonClass = "notAllow";
    	title = "应版权方要求暂不能下载";
    }
    json = {
    	'liclass':liclass,
    	'rid':id,
    	'indexnum':indexnum,
    	'tips':tips,
    	'ordinal':num,
    	'infoStr':infoStr,
    	'formats':formats,
    	'hqlevel':hqLevel,
    	'musicname':showdisname,
    	'mviconstr':mviconstr,
    	'isnewstr':newhtml,
    	'artistclick':artistclick,
    	'artistname':showartist,
    	'albumclick':albumclick,
    	'albumname':showalbum,
    	'earthBlock':earthBlock,
    	'moneyIcon':moneyIcon,
    	'score100':score100,
    	'vericon':vericon,
    	'verlist':verlist,
    	'verisshow':verisshow,
    	'allowDwonClass':allowDwonClass,
    	'title':title
    };
    saveMusicInfo(obj,'all');
	return json;
}

function musicCheckIsNoResult(data){
	if(typeof(data)=="undefined" || data==null||typeof(data.abslist)=="undefined"){
	    return true;
	}
	if(parseInt(data.TOTAL,10)==0){
		return true;
	}else{
		return false;
	}
}

function create_musiclist_other(data){
	var searchMusicListTotal = data.TOTAL;
	var searchMusicListRn = 100;
	$(".checkall font").html(searchMusicListTotal);
	var pageStr = createPage(Math.ceil(parseInt(searchMusicListTotal, 10) / searchMusicListRn), pn + 1);
	if (pageStr) $(".page").html(pageStr).show();
	$(".w_musiclist").show();
	searchRequestLog("suc","music",parseInt(pn,10));
}

function create_ver_list(data){
	var model = loadTemplate('#kw_verlistModel');
	var html = drawListTemplate(data,model,proVerListData);
	html = '<ul class="kw_ver_list">'+html+'</ul>';
	return html;
}

function proVerListData(obj){
	var json = {};
	var name = checkSpecialChar(obj.SONGNAME,"name");
    var disname = checkSpecialChar(obj.SONGNAME,"disname");
    var titlename = checkSpecialChar(obj.SONGNAME,"titlename");
    var showdisname = searchReplaceAll(disname);
	var album = obj.ALBUM;
	var showalbum = searchReplaceAll(checkSpecialChar(album,"disname"));
	var albumTitle = obj.ALBUM;
	var albumid = obj.ALBUMID;
	var artist = obj.ARTIST;
	var showartist = searchReplaceAll(checkSpecialChar(artist,"disname"));
	var artistTitle = obj.ARTIST;
	var artistid = obj.ARTISTID;
	var formats = obj.FORMATS;
	var id = obj.MUSICRID;
	var copyright = obj.copyright || obj.COPYRIGHT;
	var rid = id.replace("MUSIC_","")
	var tips = getMusicTips(name,artist,album,rid);
	var score100 = parseInt(obj.SCORE100) || 2;
	if(score100>100){
	    score100 = 100;
	}
	var indexnum = obj.indexnum;
	var pn = parseInt(obj.PN) || 0;
	var rn = parseInt(obj.RN) || 100;
	var num = rn * pn + indexnum + 1;
	if (num < 10) num = '0' + num;
	var liclass = getCopyrightClass(obj);
	var infoStr = '';
	var pay = obj.PAY;
	var earthBlock = "";
	if(parseInt(copyright)==1){
		earthBlock = `<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>
				    	<p class="sourceTitle">${disname}</p><p class="sourceUrl"></p>
				    	<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p>
			    	</div>`;
		infoStr = '<a title="该歌曲来自第三方网站" class="earth" javascript:;></a>';
	}else if(pay==0){
		infoStr = '<a title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon" javascript:;></a>';
	}
	var hqLevel = getHqLevel(obj);
	var mviconstr = '';
	if(!getTanMuIconStr(obj) && obj.IS_POINT == '0'){
		var mvclass = checkMvIcon(obj);
		mviconstr = `<a hidefocus href="javascript:;" class="${mvclass}" title="观看MV"></a>`;
	}
	if(getTanMuIconStr(obj) && obj.IS_POINT == '1' ){
        var strTm = getTanMuIconStr(obj);
        mviconstr = '<i class="m_score tm">'+ strTm + '</i>';
    }
    var artistclick = '';
    var albumclick = '';
    var other = '|psrc=歌手->|bread=-2,4,歌手,0';
	artistclick = 'jumpQK(4,'+obj.ARTISTID+',\''+checkSpecialChar(artist,"name")+'\',4,\'\',\''+other+'\');searchOperationLog(\'ref\',\'-100\',\'music\',\'refartist\');';
	albumclick = 'jumpQK(13,'+obj.ALBUMID+',\''+checkSpecialChar(album,"name")+'\',13,\'\',\'\');searchOperationLog(\'ref\',\'-100\',\'music\',\'refalbum\');';
	var isnew = obj["new"];
	var newhtml = ''
    if(typeof(isnew)!="undefined" && isnew==1){
        newhtml = "<em class='musicnewimg'></em>";
    }
    var moneyIcon = getMoney(obj,"down");
    var allowDwonClass = "";
    var title = "下载歌曲";
    if(obj.isdownload=="1"){
    	allowDwonClass = "notAllow";
    	title = "应版权方要求暂不能下载";
    }
    json = {
    	'liclass':liclass,
    	'rid':id,
    	'indexnum':indexnum,
    	'tips':tips,
    	'ordinal':num,
    	'infoStr':infoStr,
    	'formats':formats,
    	'hqlevel':hqLevel,
    	'musicname':showdisname,
    	'mviconstr':mviconstr,
    	'isnewstr':newhtml,
    	'artistclick':artistclick,
    	'artistname':showartist,
    	'albumclick':albumclick,
    	'albumname':showalbum,
    	'earthBlock':earthBlock,
    	'moneyIcon':moneyIcon,
    	'allowDwonClass':allowDwonClass,
    	'title':title
    };
    saveMusicInfo(obj,'all');
	return json;
}
// 搜索单曲部分结束

// 搜索mv部分开始
function get_mv_data(key){
	var rn = 80;
	if(agentFlag){
		searchDomainChange(key,"mv","/r.s?all="+key+"&ft=music&newsearch=1&itemset=web_2013&client=kt&cluster=0&pn="+pn+"&rn="+rn+"&rformat=json&hasmkv=1&encoding=utf8&show_copyright_off=1")
		return;
	}
	var url = host_url+"r.s?all="+key+"&ft=music&newsearch=1&itemset=web_2013&client=kt&cluster=0&pn="+pn+"&rn="+rn+"&rformat=json&hasmkv=1&encoding=utf8&show_copyright_off=1&pcmp4=1&ver=mbox";
	url = getChargeURL(url);
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			mvSuccess(data);
		},
		error:function(){
			checkSearchServer(tabType,key);
		}
    });
}

function mvSuccess(data){
	try{
		var jsondata = eval('('+data+')');
	}catch(e){
		searchNoResult();
		return;
	}
	// 新搜索统计日志 mv
	hitNum = jsondata.TOTAL;
	sendSearchLog("search","MV");
	var mvIsShow = mvCheckIsNoResult(jsondata);
	if(mvIsShow){
		searchNoResult();
		return;
	}
	var dataArr = jsondata.abslist;
	for(var i=0;i<dataArr.length;i++){
		dataArr[i].indexnum = i;
	}
	create_mvlist(dataArr);
	create_mv_other(jsondata);
	centerLoadingEnd();
	loadImages();
}

function create_mvlist(data){
	var model = loadTemplate('#kw_mvModel');
	var html = drawListTemplate(data,model,proMvListData);
	$('.kw_mv_list').html(html);
}

function proMvListData(obj){
	var json = {};

	var mvname = obj.SONGNAME;
    var name = checkSpecialChar(mvname,"name");
    var disname = checkSpecialChar(mvname,"disname");
    var titlename = checkSpecialChar(mvname,"titlename");
    var showname = searchReplaceAll(disname);
    var rid = obj.MUSICRID.substring(6);
    var pic = obj.MVPIC;
    if(pic == ""){
		pic = "img/default.png";
	}else{
		pic = getMVPrefix(pic)+pic;
		pic = pic.replace("wmvpic/140","wmvpic/160")
	}
	var artistname = searchReplaceAll(checkSpecialChar(obj.ARTIST,"disname"));
	var artisttitle = checkSpecialChar(obj.ARTIST,"titlename");
	var artistclick = '';
    var other = '|psrc=歌手->|bread=-2,4,歌手,0';
	artistclick = 'searchArtistNewLog(-401);jumpQK(4,'+obj.ARTISTID+',\''+checkSpecialChar(obj.ARTIST,"name")+'\',4,\'\',\''+other+'\')';
	var musicString = '';
	var musicstringarray = [];
	musicstringarray[musicstringarray.length] = encodeURIComponent(returnSpecialChar(mvname));
	musicstringarray[musicstringarray.length] = encodeURIComponent(returnSpecialChar(obj.ARTIST));
	musicstringarray[musicstringarray.length] = encodeURIComponent(returnSpecialChar(obj.ALBUM));
	musicstringarray[musicstringarray.length] = obj.NSIG1;
	musicstringarray[musicstringarray.length] = obj.NSIG2;
	musicstringarray[musicstringarray.length] = obj.MUSICRID;
	musicstringarray[musicstringarray.length] = obj.MP3NSIG1;
	musicstringarray[musicstringarray.length] = obj.MP3NSIG2;
	musicstringarray[musicstringarray.length] = obj.MP3RID;
	musicstringarray[musicstringarray.length] = 0;
	musicstringarray[musicstringarray.length] = 0;
	musicstringarray[musicstringarray.length] = obj.MKVRID;
	musicstringarray[musicstringarray.length] = obj.HASECHO;
	var psrc = "VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->MV列表";
	psrc = encodeURIComponent(psrc);
	musicstringarray[musicstringarray.length] = psrc;
	musicstringarray[musicstringarray.length] = obj.FORMATS;
	musicstringarray[musicstringarray.length] = getMultiVerNum(obj);
	musicstringarray[musicstringarray.length] = getPointNum(obj);
	musicstringarray[musicstringarray.length] = getPayNum(obj);
	musicstringarray[musicstringarray.length] = getArtistID(obj);
	musicstringarray[musicstringarray.length] = getAlbumID(obj);
	musicstringarray[musicstringarray.length] = obj.mp4sig1||0;
	musicstringarray[musicstringarray.length] = obj.mp4sig2||0;
	musicString = musicstringarray.join('\t');
	musicstringarray = null;
	musicString = encodeURIComponent(musicString);
    var click = "searchMvNewLog();someMV(this);";
    //var click = "someMV(this);";
    var indexnum = obj.indexnum;
    var copyright=obj.copyright || obj.COPYRIGHT;
    var earthBlock = '';
    var infoStr = '';
    if(parseInt(copyright) == 1){
    	earthBlock = `<div class="sourceTips"><div class="closebtn j_earthBtn"></div>
				    	<p class="sourceTitle">${disname}</p><p class="sourceUrl"></p>
				    	<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p>
			    	</div>`;
		infoStr = '<a class="bmv_earth" title="该歌曲来自第三方网站" href="javascript:;"></a>';
    }
    var copyrightClass = getCopyrightClass(obj);
    var barrageicon = getTanMuMVIconStr(obj);
    MVLISTOBJ[MVLISTOBJ.length] = musicString;
	MVLISTOBJECT[MVLISTOBJECT.length] = obj;

    json = {
    	'copyrightClass':copyrightClass,
    	'barrageicon':barrageicon,
    	'indexnum':indexnum,
    	'rid':rid,
    	'mvdata':musicString,
    	'bmv_earthBlock':earthBlock,
    	'click':click,
    	'name':showname,
    	'titlename':titlename,
    	'pic':pic,
    	'artistclick':artistclick,
    	'artisttitle':artisttitle,
    	'artistname':artistname,
    	'bmv_earth':infoStr
    };
	return json;
}

function mvCheckIsNoResult(data){
	if(typeof(data)=="undefined" || data==null||typeof(data.abslist)=="undefined"){
	    return true;
	}
	if(parseInt(data.TOTAL,10)==0){
		return true;
	}else{
		return false;
	}
}

function create_mv_other(data){
	var searchMVTotal = data.TOTAL;
	var searchMVRn = 80;
	$(".selall_mv").find("font").html("共"+searchMVTotal+"首");
	var pageStr = createPage(Math.ceil(parseInt(searchMVTotal, 10) / searchMVRn), pn + 1);
	if (pageStr) $(".page").html(pageStr).show();
	$(".w_mv").show();
	searchRequestLog("suc","mv",parseInt(pn,10));
}
// 搜索mv部分结束

// 搜索歌单部分开始
function get_playlist_data(key){
	var rn = 100;
	if(agentFlag){
		searchDomainChange(key,"setlist",'/r.s?all='+key+'&pn='+pn+'&rn='+rn+'&ft=playlist&encoding=utf8&rformat=json&pay=0&needliveshow=0' + '&plat=pc&devid=' + devid);
		return;
	}
	var url = host_url +'r.s?all='+key+'&pn='+pn+'&rn='+rn+'&ft=playlist&encoding=utf8&rformat=json&pay=0&needliveshow=0&ver=mbox';
	$.ajax({
        url:getChargeURL(url),
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			playListSuccess(data);
		},
		error:function(){
			checkSearchServer(tabType,key);
		}
    });
}
function playListSuccess(data){
	try{
		var jsondata = eval('('+data+')');
	}catch(e){
		searchNoResult();
		return;
	}
	// 新搜索统计日志 歌单
	hitNum = jsondata.TOTAL;
	sendSearchLog("search","PLAYLIST");
	var playlistIsShow = playlistCheckIsNoResult(jsondata);
	if(playlistIsShow){
		searchNoResult();
		return;
	}
	var dataArr = jsondata.abslist;
	for(var i=0;i<dataArr.length;i++){
		dataArr[i].indexnum = i;
	}
	create_playlist(dataArr);
	create_playlist_other(jsondata);
	centerLoadingEnd();
	loadImages();
}

function create_playlist(data){
	var model = loadTemplate('#kw_playlistModel');
	var html = drawListTemplate(data,model,proPlayListData);
	$('.kw_playlist').html(html);
}

function proPlayListData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disname,"disname") || checkSpecialChar(name,"disname");
    var showdisname = searchReplaceAll(disname);
    var titlename = checkSpecialChar(disname,"titlename");
    var pic = obj.pic;
    pic = getPlaylistPic(pic,120);
    var icon = '';
    var other = '';
    var source = source;
    var sourceId = '';
    var click = '';
    var style = '';
    var musicNum = parseInt(obj.songnum)||0;
    if(isNaN(musicNum)){
        musicNum=0;
    }
    if(musicNum==0)style="visibility:hidden";
    var info = musicNum + '首歌曲';
    var ipsrc = "|psrc=曲库-\>"+ searchKey + "的搜索结果-\>歌单列表";
    var csrc = "搜索->\\'"+searchKey+"\\'的搜索结果->"+csrcWhere+'->'+name;
    other = "|csrc="+csrc.replace(/'/g,"\'")+"|searchKey="+searchKeyForLog+"-歌单";
    if(!pic){
        pic = 'img/default.png';
    }else{
        pic = changeImgDomain(pic);
    }
	source = obj.source;
	sourceId = obj.playlistid;
	//click = commonClickString(new Node(source,sourceId,name,obj.id,obj.extend,other));
	click = 'jumpQK(8,'+sourceId+',\''+checkSpecialChar(obj.name,"name")+'\',8,\'\',\''+other+'\')';
	var iplay = 'iPlay(arguments[0],8,'+sourceId+',this);return false;';
	var isAq = "";
	if(obj.alflag==1){
		isAq = '<span class="isAq"></span>';
	}
	json = {
		'showname':showdisname,
		'titlename':titlename,
		'click':click,
		'iPlay':iplay,
		'pic':pic,
		'ipsrc':ipsrc,
		'musicnum':info,
		'isAq' : isAq,
		'csrc':csrc,
		'rid':sourceId,
		'style':style
	};
	return json;
}

function playlistCheckIsNoResult(data){
	if(typeof(data)=="undefined" || data==null ||typeof(data.abslist)=="undefined"){
	    return true;
	}
	if(parseInt(data.TOTAL,10)==0){
		return true;
	}else{
		return false;
	}
}

function create_playlist_other(data){
	var searchSetListTotal = data.TOTAL;
	var searchSetListRn = 100;
	var pageStr = createPage(Math.ceil(parseInt(searchSetListTotal, 10) / searchSetListRn), pn + 1);
	if (pageStr) $(".page").html(pageStr).show();
	$(".w_playlist").show();
	centerLoadingEnd();
}
// 搜索歌单部分结束

// 搜索电台部分开始
function get_radio_data(key){
	var rn = 100;
	if(agentFlag){
		searchDomainChange(key,"radio",'/r.s?all='+searchKey+'&pn='+pn+'&rn='+rn+'&ft=recordlist&encoding=utf8&rformat=json&pay=0&pcjson=1&needliveshow=0' + '&plat=pc&devid=' + devid);
		return;
	}
	var url = host_url +'r.s?all='+searchKey+'&pn='+pn+'&rn='+rn+'&ft=recordlist&encoding=utf8&rformat=json&pay=0&pcjson=1&needliveshow=0&ver=mbox';
	$.ajax({
        url:getChargeURL(url),
		dataType:"json",
		type:"get",
		crossDomain:false,
		success:function(data){
			radioSuccess(data);
		},
		error:function(){
			checkSearchServer(tabType,key);
		}
    });
}
function radioSuccess(res){
  radioLoading();
	try{
    var jsondata = res || {};
    if (typeof res === 'string') {
      /* eslint-disable */
      jsondata = eval('(' + res + ')');
      /* eslint-enable */
    }
	}catch(e){
		searchNoResult();
		return;
	}
	// 新搜索统计日志 电台
	hitNum = jsondata.TOTAL;
	sendSearchLog("search","RADIO");
	var radioIsShow = radioCheckIsNoResult(jsondata);
	if(radioIsShow){
		searchNoResult();
		return;
	}
	var dataArr = jsondata.abslist;
	for(var i=0;i<dataArr.length;i++){
		dataArr[i].indexnum = i;
	}
	create_radiolist(dataArr);
	create_radiolist_other(jsondata);
	var call = "GetRadioNowPlaying";
    var str = callClient(call);
	radioid = getValue(str,'radioid');
	status = getValue(str,'playstatus');
	if(radioid){
		initRadioStatus(parseInt(status,10),radioid);
	}
	centerLoadingEnd();
	loadImages();
}

function create_radiolist(data){
	var model = loadTemplate('#kw_radiolistModel');
	var html = drawListTemplate(data,model,proRadioData);
	$('.kw_radiolist').html(html);
}

function proRadioData(obj){
	var json = {};

	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disname,"disname") || checkSpecialChar(name,"disname");
    var showdisname = searchReplaceAll(disname);
    var titlename = checkSpecialChar(disname,"titlename");
    var listen = '';
    var ricon = '';
    var pic = obj.pic;
    if(pic == ''){
        pic = 'img/default.png';
    } else{
		// pic = pic.replace(/star.+/gi,'star/radio/blur/'+obj.sourceid.split(',')[0]+'.jpg');
  //       pic = changeImgDomain(pic);
        var oDate = new Date();
	    var today = ''+oDate.getFullYear()+toDou(oDate.getMonth()+1)+toDou(oDate.getDate());
        var tmpid = obj.sourceid.split(',')[0];
	    pic = 'http://star.kwcdn.kuwo.cn/star/radio/blur/'+tmpid+'.jpg?' + GenRadioRandomsufix(6);
    }
    var radioClass = 'radio_' + obj.sourceid.split(',')[0];
    var disname2 =disname;
    disname2 = disname2.replace(/&apos;/g,'%26apos%3B').replace(/\'/g,'%26apos%3B');
    obj.extend = obj.extend+ "|RADIO_PIC=" + pic + "|DIS_NAME=" + disname2 + "|" ;
    obj.sourceid = obj.sourceid.replace(/&apos;/g,'%26apos%3B');
    name = name.replace(/&apos;/g,'%26apos%3B').replace(/\'/g,'%26apos%3B');
   	var click = commonClickString(new Node(obj.source, obj.sourceid, name, obj.nodeid, obj.extend));
   	var index = obj.indexnum;
    var r = Math.ceil(index/5);
    var l = index%5 || 5;
    var pos = r + ',' + l;
    var gps = "";
    var fpage = "";
    var dtid = obj.sourceid.split(",")[0];
    fpage = "搜索电台";
    gps = "1,1";
    var log = 'radioLog(\'POSITION:'+pos+'|GPOSITION:'+gps+'|FROMPAGE:'+fpage+'|RADIOID:'+dtid+ '|CSRCTAG:' + searchKey + '\'); ';
    var lisctn = FormatRadioListenersNum(obj.info);
    json = {
    	'radioClass':radioClass,
    	'showdisname':showdisname,
    	'titlename':titlename,
    	'log':log,
    	'click':click,
    	'pic':pic,
      'listnum':lisctn,
      'rid':dtid
    };

	return json;
}


function radioCheckIsNoResult(data){
	if(typeof(data)=="undefined" || data==null ||typeof(data.abslist)=="undefined"){
	    return true;
	}
	if(parseInt(data.TOTAL,10)==0){
		return true;
	}else{
		return false;
	}
}

function create_radiolist_other(data){
	var searchRadioTotal = data.TOTAL;
	var searchRadioRn = 100;
	var pageStr = createPage(Math.ceil(parseInt(searchRadioTotal, 10) / searchRadioRn), pn + 1);
	if (pageStr) $(".page").html(pageStr).show();
	$(".w_radiolist").show();
	var radioIframe = window.parent.document.getElementById('radio_iframe');
	radioIframe.height = $("body").height();
	upDateSkin();
}
// 搜索电台部分结束

// 搜索歌手部分开始
function get_artist_data(key){
	var rn = 100;
	if(agentFlag){
		searchDomainChange(key,"artist","/r.s?all="+key+"&ft=artist&newsearch=1&itemset=artist_2015&client=kt&cluster=0&pn="+pn+"&rn="+rn+"&rformat=json&encoding=utf8" + '&plat=pc&devid=' + devid);
		return;
	}
	var url = host_url+"r.s?all="+key+"&ft=artist&newsearch=1&itemset=artist_2015&client=kt&cluster=0&pn="+pn+"&rn="+rn+"&rformat=json&encoding=utf8&pcmp4=1&ver=mbox";
	$.ajax({
        url:getChargeURL(url),
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			artistSuccess(data);
		},
		error:function(){
			checkSearchServer(tabType,key);
		}
    });
}
function artistSuccess(data){
	try{
		var jsondata = eval('('+data+')');
	}catch(e){
		searchNoResult();
		return;
	}
	// 新搜索统计日志 歌手
	hitNum = jsondata.TOTAL;
	sendSearchLog("search","ARTIST");
	var artistIsShow = artistCheckIsNoResult(jsondata);
	if(artistIsShow){
		searchNoResult();
		return;
	}
	var arr = jsondata.abslist;
	var dataArr = [];
	for(var i=0;i<arr.length;i++){
		dataArr.push(arr[i]);
	}
	for(var i=0; i<dataArr.length; i++){
		dataArr[i]['indexnum'] = i;
	}
	if(dataArr.length==0){
		searchNoResult();
		return;
	}
	create_artistlist(dataArr);
	create_artistlist_other(jsondata);
	centerLoadingEnd();
	loadImages();
}

function create_artistlist(data){
	var model = loadTemplate('#kw_artistlistModel');
	var html = drawListTemplate(data,model,proArtistData);
	$('.kw_artist_list').html(html);
}

function proArtistData(obj){
	var json = {};

	var artist = obj.ARTIST;
    var name = checkSpecialChar(artist,"name");
    var disname = checkSpecialChar(artist,"disname");
    var showdisname = searchReplaceAll(disname);
    var titlename = checkSpecialChar(artist,"titlename");
    var style = "";
    var songnum = obj.SONGNUM||0;
    if(songnum==0)style="visibility:hidden";
	var pic = obj.PICPATH;
	if(pic == ""){
		pic = "img/default.png";
	}else{
		pic = getArtistPrefix(pic)+pic;
		pic = pic.replace("starheads/55","starheads/120");
	}
	var csrc = "搜索->\'"+searchKey+"\'的搜索结果->"+csrcWhere+'->'+name;
    var other = '|psrc=歌手->|bread=-2,4,歌手,0|searchKey='+searchKeyForLog+'-歌手';
	var click = '';
	var infoStr = '';
	click = 'jumpQK(4,'+obj.ARTISTID+',\''+name+'\',4,\'\',\''+other+'\');searchArtistNewLog(-200);';
	var iPlay = 'iPlay(arguments[0],4,'+obj.ARTISTID+',this);searchArtistNewLog(-200);return false;';

	json = {
		'showname':showdisname,
		'titlename':titlename,
		'pic':pic,
		'click':click,
		'iPlayClick':iPlay,
		'musicnum':songnum+"首歌曲",
		'csrc':csrc,
		'rid':obj.ARTISTID,
		'style':style
	};

	return json;
}

function artistCheckIsNoResult(data){
	if(typeof(data)=="undefined" || data==null ||typeof(data.abslist)=="undefined"){
	    return true;
	}
	if(parseInt(data.TOTAL,10)==0){
		return true;
	}else{
		return false;
	}
}

function create_artistlist_other(data){
	var searchArtistTotal = data.TOTAL;
	var searchArtistRn = 100;
	var pageStr = createPage(Math.ceil(parseInt(searchArtistTotal,10)/searchArtistRn), pn+1);
	if (pageStr) $(".page").html(pageStr).show();
	$(".w_artist").show();
	searchRequestLog("suc","artist",parseInt(pn,10));
}
// 搜索歌手部分结束

// 搜索专辑部分开始
function get_album_data(key){
	var rn = 100;
	if(agentFlag){
		searchDomainChange(key,"album","/r.s?all="+key+"&ft=album&newsearch=1&itemset=web_2013&client=kt&cluster=0&pn="+pn+"&rn="+rn+"&rformat=json&encoding=utf8&show_copyright_off=1");
		return;
	}
	var url = host_url+"r.s?all="+key+"&ft=album&newsearch=1&itemset=web_2013&client=kt&cluster=0&pn="+pn+"&rn="+rn+"&rformat=json&encoding=utf8&show_copyright_off=1&ver=mbox";
	url = getChargeURL(url);
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			albumSuccess(data);
		},
		error:function(){
			checkSearchServer(tabType,key);
		}
    });
}
function albumSuccess(data){
	try{
		var jsondata = eval('('+data+')');
	}catch(e){
		searchNoResult();
		return;
	}
	// 新搜索统计日志 专辑
	hitNum = jsondata.total;
	sendSearchLog("search","ALBUM");
	var albumIsShow = albumCheckIsNoResult(jsondata);
	if(albumIsShow){
		searchNoResult();
		return;
	}
	var dataArr = jsondata.albumlist;
	for(var i=0; i<dataArr.length; i++){
		dataArr[i]['indexnum'] = i;
	}
	create_albumlist(dataArr);
	create_albumlist_other(jsondata);
	centerLoadingEnd();
	loadImages();
}

function create_albumlist(data){
	var model = loadTemplate('#kw_albumlistModel');
	var html = drawListTemplate(data,model,proAlbumData);
	$('.kw_album_list').html(html);
}

function proAlbumData(obj){
	var json = {};

	var album = obj.name;
    var name = checkSpecialChar(album,"name");
    var disname = checkSpecialChar(album,"disname");
    var showdisname = searchReplaceAll(disname);
    var titlename = checkSpecialChar(album,"titlename");
    var artistname = obj.artist;
    var showartistname = searchReplaceAll(checkSpecialChar(obj.artist,"disname"));
    var artisttitle = checkSpecialChar(obj.artist,"titlename");
    var pic = obj.pic;
	if(pic == ""){
		pic = "img/default.png";
	}else{
		pic = getAlbumPrefix(pic)+pic;
	}
    var artistclick = '';
    var albumclick = '';
    var csrc = "搜索->\'"+searchKey+"\'的搜索结果->"+csrcWhere+'->'+name;
    var other = '|psrc=歌手->|bread=-2,4,歌手,0|searchKey='+searchKeyForLog;
	artistclick = 'searchArtistNewLog(-301);jumpQK(4,'+obj.artistid+',\''+checkSpecialChar(obj.artist,"name")+'\',4,\'\',\''+other+'-歌手'+'\')';
	albumclick = 'searchAlbumNewLog(-300);jumpQK(13,'+obj.albumid+',\''+name+'\',13,\'\',\''+other+'-专辑'+'\')';
	var iPlayClick = 'iPlay(arguments[0],13,'+obj.albumid+',this);searchAlbumNewLog(-300);return false;';

	json = {
		'showdisname':showdisname,
		'albumtitle':titlename,
		'pic':pic,
		'albumclick':albumclick,
		'showartistname':showartistname,
		'artisttitle':artisttitle,
		'artistclick':artistclick,
		'iPlayClick':iPlayClick,
		'csrc':csrc,
		'rid':obj.albumid
	};

	return json;
}

function albumCheckIsNoResult(data){
	if(typeof(data)=="undefined" || data==null ||typeof(data.albumlist)=="undefined"){
	    return true;
	}
	if(parseInt(data.total || data.TOTAL, 10) == 0) {
		return true;
	}else{
		return false;
	}
}

function create_albumlist_other(data) {
	var searchAlbumTotal = data.total || data.TOTAL;
	var searchAlbumRn = 100;
	var pageStr = createPage(Math.ceil(parseInt(searchAlbumTotal, 10) / searchAlbumRn), pn + 1);
	if (pageStr) $(".page").html(pageStr).show();
	$(".w_album").show();
	searchRequestLog("suc","album",parseInt(pn,10));
}
// 搜索专辑部分结束

// 搜索歌词部分开始
function get_lrc_data(key){
	var rn = 100;
	if(agentFlag){
		searchDomainChange(key,"lrc","/r.s?lrccontent="+key+"&ft=music&newsearch=1&alflac=1&itemset=web_2013&client=kt&cluster=0&pn="+pn+"&rn="+rn+"&rformat=json&encoding=utf8&primitive=0&show_copyright_off=1")
	}
	var url = host_url+"r.s?lrccontent="+key+"&ft=music&newsearch=1&alflac=1&itemset=web_2013&client=kt&cluster=0&pn="+pn+"&rn="+rn+"&rformat=json&encoding=utf8&primitive=0&show_copyright_off=1&pcmp4=1&ver=mbox";
	url = getChargeURL(url);
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			lrcSuccess(data);
		},
		error:function(){
			checkSearchServer(tabType,key);
		}
    });
}
function lrcSuccess(data){
	try{
		var jsondata = eval('('+data+')');
	}catch(e){
		searchNoResult();
		return;
	}
	// 新搜索统计日志 歌词
	hitNum = jsondata.TOTAL;
	sendSearchLog("search","LYRIC");
	var lrcIsShow = lrcCheckIsNoResult(jsondata);
	if(lrcIsShow){
		searchNoResult();
		return;
	}
	var paramArr = [];
	var count = 0;
	var dataArr = jsondata.abslist;
	for(var i=0; i<dataArr.length; i++){
		var flag = parseInt(dataArr[i].ONLINE);
		if(flag){
			paramArr[count++] = dataArr[i];
		}
	}
	for(var i=0;i<paramArr.length;i++){
		paramArr[i].indexnum = i;
		paramArr[i].PN = jsondata.PN;
		paramArr[i].RN = jsondata.RN;
	}
	if(paramArr.length==0){
		searchNoResult();
		return;
	}
	create_lrclist(paramArr);
	create_lrclist_other(jsondata);
	centerLoadingEnd();
	loadImages();
}

function create_lrclist(data){
	var model = loadTemplate('#kw_lrclistModel');
	var html = drawListTemplate(data,model,proLrcListData);
	$('.w_lrc .kw_music_list').html(html);
}

function proLrcListData(obj){
	var json = {};

	var name = checkSpecialChar(obj.SONGNAME,"name");
    var disname = checkSpecialChar(obj.SONGNAME,"disname");
    var titlename = checkSpecialChar(obj.SONGNAME,"titlename");
    var showdisname = searchReplaceAll(disname);
	var album = obj.ALBUM;
	var showalbum = searchReplaceAll(checkSpecialChar(album,"disname"));
	var albumTitle = obj.ALBUM;
	var albumid = obj.ALBUMID;
	var artist = obj.ARTIST;
	var showartist = searchReplaceAll(checkSpecialChar(artist,"disname"));
	var artistTitle = obj.ARTIST;
	var artistid = obj.ARTISTID;
	var formats = obj.FORMATS;
	var id = obj.MUSICRID;
	var copyright = obj.copyright || obj.COPYRIGHT;
	var pay = obj.pay||obj.PAY;
	var rid = id.replace("MUSIC_","")
	var tips = getMusicTips(name,artist,album,rid);
	var score100 = parseInt(obj.SCORE100) || 2;
	if(score100>100){
	    score100 = 100;
	}
	var indexnum = obj.indexnum;
	var pn = parseInt(obj.PN) || 0;
	var rn = parseInt(obj.RN) || 100;
	var num = rn * pn + indexnum + 1;
	if (num < 10) num = '0' + num;
	var liclass = getCopyrightClass(obj);
	var iconType = '';
	var earthBlock = "";
	if(parseInt(copyright)==1){
		earthBlock = `<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>
				    	<p class="sourceTitle">${disname}</p><p class="sourceUrl"></p>
				    	<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p>
			    	</div>`;
		iconType = '<a title="该歌曲来自第三方网站" class="earth" javascript:;></a>';
	}else if(pay==0){
		iconType = '<a title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon"></a>';
	}
	var hqLevel = getHqLevel(obj);
	var mviconstr = '';
	if(!getTanMuIconStr(obj) && obj.IS_POINT == '0'){
		var mvclass = checkMvIcon(obj);
		mviconstr = `<a hidefocus href="javascript:;" class="${mvclass}" title="观看MV"></a>`;
	}
	if(getTanMuIconStr(obj) && obj.IS_POINT == '1' ){
        var strTm = getTanMuIconStr(obj);
        mviconstr = '<i class="m_score tm">'+ strTm + '</i>';
    }
    var artistclick = '';
    var albumclick = '';
    var other = '|psrc=歌手->|bread=-2,4,歌手,0';
	artistclick = 'jumpQK(4,'+obj.ARTISTID+',\''+checkSpecialChar(artist,"name")+'\',4,\'\',\''+other+'\')';
	albumclick = 'jumpQK(13,'+obj.ALBUMID+',\''+checkSpecialChar(album,"name")+'\',13,\'\',\'\')';
	var isnew = obj["new"];
	var newhtml = ''
    if(typeof(isnew)!="undefined" && isnew==1){
        newhtml = "<em class='musicnewimg'></em>";
    }
    var lrcClass = getCopyrightClass(obj);
    var lrc = obj.lrc;
    lrc = lrc.replace("LRC=","");
    var lrcstr = searchReplaceAll(lrc);
    var moneyIcon = getMoney(obj,"down");
    var moneyIcon = getMoney(obj,"down");
    var allowDwonClass = "";
    var title = "下载歌曲";
    if(obj.isdownload=="1"){
    	allowDwonClass = "notAllow";
    	title = "应版权方要求暂不能下载";
    }
    json = {
    	'liclass':liclass,
    	'rid':id,
    	'indexnum':indexnum,
    	'tips':tips,
    	'ordinal':num,
    	'iconType':iconType,
    	'formats':formats,
    	'hqlevel':hqLevel,
    	'musicname':showdisname,
    	'mviconstr':mviconstr,
    	'isnewstr':newhtml,
    	'artistclick':artistclick,
    	'artistname':showartist,
    	'albumclick':albumclick,
    	'albumname':showalbum,
    	'lrcClass':lrcClass,
    	'lrcstr':lrcstr,
    	'earthBlock':earthBlock,
    	'moneyIcon':moneyIcon,
    	'score100':score100,
    	'allowDwonClass':allowDwonClass,
    	'title':title
    };
    saveMusicInfo(obj,'lrc');
	return json;
}

function lrcCheckIsNoResult(data){
	if(typeof(data)=="undefined" || data==null ||typeof(data.abslist)=="undefined"){
	    return true;
	}
	if(parseInt(data.TOTAL,10)==0){
		return true;
	}else{
		return false;
	}
}

function create_lrclist_other(data){
	var searchLRCTotal = data.TOTAL;
	var searchLRCRn = 100;
	var pageStr = createPage(Math.ceil(parseInt(searchLRCTotal, 10) / searchLRCRn), pn + 1);
	if (pageStr) $(".page").html(pageStr).show();
	$('.checkall font').html(searchLRCTotal);
	$(".w_lrc").show();
	searchRequestLog("suc","lyric",parseInt(pn,10)+1);
}
// 搜索歌词部分结束

// 大合集相关部分开始
function create_dhj(key){
	var nowDate = new Date();
    var pastDate = new Date("1601","00","01");
    var searchBeginNum = "utf8_" + devid + encodeURIComponent(searchKey.replace("&", "")) + parseInt((nowDate.getTime() + nowDate.getTimezoneOffset() * 60 * 1000 - pastDate.getTime())/1000/60/60);
	var url = "https://dhjss.kuwo.cn/s.c?all="+key+"&rformat=json&version="+getVersion()+"&tset=artist,album,playlist,subject,ranklist&time="+Math.random();
	$.ajax({
        url:url,
        type:"get",
        dataType:"jsonp",
        crossDomain:false,
        success: function (json){
        	if(json['result']=='none'){
        		return;
        	}
        	create_dhj_area(json,searchBeginNum);
        }
    });
}

function create_dhj_area(data,searchBeginNum){
	var dhjId = data.id;
	var dhjname = data.name;
	var type = data.type;
	var logType = "";
	var dhjType = "";
	switch(type){
		case 'artist':
			create_dhj_artist(data,searchBeginNum,dhjId);
			logType = "歌手";
			dhjType = "ARTIST";
			break;
		case 'playlist':
			create_dhj_playlist(data,searchBeginNum,dhjId);
			logType = "歌单";
			dhjType = "PLAYLIST";
			break;
		case 'album':
			create_dhj_album(data,searchBeginNum,dhjId);
			logType = "专辑";
			dhjType = "ALBUM";
			break;
		case 'subject':
			create_dhj_subject(data,searchBeginNum,dhjId);
			break;
		case 'ranklist':
			break;
	}
	// 新搜索统计日志 大合集
	var logObj = {
		"dhjType":dhjType,
		"dhjName":logType+":"+dhjname,
		"rid":dhjId,
		"hitNum":data.songnum
	}
	sendSearchLog("dhj",logObj);
	$('#dhjBox').show();
}

function create_dhj_artist(data,searchBeginNum,dhjId){
	var pic = data.pic;
	if(pic!=""&&pic.indexOf("http")>-1){
		pic = pic.replace("starheads/100","starheads/70");
	}
	var picstring = "";
	picstring = '<img src="'+pic+'" onerror="this.src=\'img/default.png\'"  width="100" height="100" class="pic100"/>';
	var name = data.name;
	name = returnSpecialChar(name);
	call = "MBOXLOG?stype=type_sdhj&snum="+searchBeginNum+"&showdhj=showartist&dhjname="+name;
	callClientNoReturn(call);
	var hrefstring = 'dhjJumpQk(4,'+data.id+',\''+checkSpecialChar(name,"name")+'\',4,\''+dhjId+'\',\''+data.songnum+'\')';
	var btnname = data.btnname;
	if(typeof(btnname)=="undefined"){
		btnname = "查看歌手";
	}
	var artistsongnum = 0;
	var artistalbumnum = 0;
	var artistmvnum = 0;
	if(typeof(data.songnum)!="undefined"&&data.songnum!=""){
	    artistsongnum = data.songnum;
	}
	if(typeof(data.albumnum)!="undefined"&&data.albumnum!=""){
	    artistalbumnum = data.albumnum;
	}
	if(typeof(data.mvnum)!="undefined"&&data.mvnum!=""){
	    artistmvnum = data.mvnum;
	}
	var onlinepeople = 50*artistsongnum+100*artistalbumnum+3*artistmvnum;
	var newdate = new Date();
	var newhour = newdate.getHours();
	if(newhour>=1&&newhour<8){
	    onlinepeople = onlinepeople*0.4;
	}
	if(newhour>=8&&newhour<15){
	    onlinepeople = onlinepeople*2.2;
	}
	if(newhour>=15&&newhour<21){
	    onlinepeople = onlinepeople*2.7;
	}
	var newmin = newdate.getMinutes();
	var ran = Math.random()*10;
	ran = Math.floor(ran);
	var rannum = newmin*ran;
	var ran2 = Math.random()*2;
	ran2 = Math.floor(ran2);
	if(ran2==0){
	    rannum = -rannum;
	}
	onlinepeople = Math.floor(onlinepeople);
	onlinepeople = onlinepeople+rannum;
	var newstring = '<div class="dhjnew1"><div class="dhjnew2"><a onclick="playWellChoosen('+data.id+');return false;" hidefocus href="###" title="播放精选">播放精选</a></div><div class="dhjnew3">与好音乐不期而遇</div></div>';
	$("#search_heji_artist .heji_pic").html('<a class="w_a_hj1 hjTitle" data-pos="-5" hidefocus href="###" onclick="'+hrefstring+'" title="'+checkSpecialChar(name,"titlename")+'">'+picstring+'</a>');
	$("#search_heji_artist .hj_main h2").html('<a style="float:left;" class="w_a_hj1 hjTitle" data-pos="-4" hidefocus href="###" onclick="'+hrefstring+'" title="'+checkSpecialChar(name,"titlename")+'">'+searchReplaceAll(cutStrByGblen(name,42))+'</a>'+newstring);
	var hotsongstring = '';
	hotsongstring = '<b onclick="dhjArtistNewLog();dhjArtistNew(4,'+data.id+',\''+checkSpecialChar(name,"name")+'\',4);return false;">'+artistsongnum+'</b>&nbsp;&nbsp;单曲&nbsp;<i>|</i>&nbsp;<b onclick="dhjArtistNewLog();dhjArtistNew(-4,'+data.id+',\''+checkSpecialChar(name,"name")+'\',-4);return false;">'+artistalbumnum+'</b>&nbsp;&nbsp;专辑&nbsp;&nbsp;<i>|</i>&nbsp;&nbsp;<b onclick="dhjArtistNewLog();dhjArtistNew(-5,'+data.id+',\''+checkSpecialChar(name,"name")+'\',-5);return false;">'+artistmvnum+'</b>&nbsp;&nbsp;MV';
	$("#search_heji_artist .hj_search").eq(0).html(hotsongstring);
	$("#search_heji_artist").show();
}

function create_dhj_playlist(data,searchBeginNum,dhjId){
	var pic = data.pic;
	if(pic!=""&&pic.indexOf("http")>-1){
		pic = pic.replace("150.jpg","100.jpg");
	}
	var picstring = "";
	var name = data.name;
	name = returnSpecialChar(name);
	call = "MBOXLOG?stype=type_sdhj&snum="+searchBeginNum+"&showdhj=showlist&dhjname="+name;
	callClientNoReturn(call);
	var hrefstring = 'dhjJumpQk(8,'+data.id+',\''+checkSpecialChar(name,"name")+'\',8,\''+dhjId+'\',\''+data.songnum+'\')';
	var listtitle = "播放歌单";
	var listtitle2 = "";
	if(typeof(data.songnum)!="undefined"&&data.songnum>0){
	    listtitle = "共"+data.songnum+"首歌曲";
	    listtitle2 = listtitle;
	}
	var newstring = '<div class="dhjnew1"><div class="dhjnew2"><a onclick="playPlaylist(1,'+data.id+');return false;" hidefocus href="###" title="'+listtitle+'">播放歌单</a></div><div class="dhjnew4">'+listtitle2+'</div></div>';
	picstring = '<a class="w_a_hj2 hjTitle" data-pos="-5" hidefocus href="###" onclick="'+hrefstring+'"><img src="'+pic+'" onerror="this.src=\'img/default.png\'"  width="70" height="70" class="pic100"/></a>';
	var btnname = data.btnname;
	if(typeof(btnname)=="undefined"){
		btnname = "查看歌单";
	}
	$("#search_heji_playlist .heji_pic").html(picstring);
	$("#search_heji_playlist .hj_main h2").html('<a style="float:left;" class="w_a_hj2 hjTitle" data-pos="-4" hidefocus href="###" onclick="'+hrefstring+'" title="'+checkSpecialChar(name,"titlename")+'">'+searchReplaceAll(cutStrByGblen(name,42))+'</a>'+newstring);
	var hotsongobj = data.hotsong;
	var hotsongstring = '<span>热门单曲：</span>';
	for(var i = 0,j = hotsongobj.length>3?3:hotsongobj.length;i<j;i++){
		var someobj = hotsongobj[i];
		var songname = someobj.name;
		var playstring = getHeJiMusicString(someobj,searchKey,dhjId);
		hotsongstring += '<div class="w_heji"><em><a data-music="'+playstring+'" title="播放歌曲" hidefocus href="###" class="mcbtn w_a_heji" data-pos="-2"></a></em><p><a data-music="'+playstring+'" hidefocus href="###" class="hj_song w_a_heji" data-pos="-2" title="'+songname+'">'+searchReplaceAll(songname)+'</a></p></div>';
	}
	if(hotsongobj.length==0){
	    hotsongstring = "";
	}
	$("#search_heji_playlist .hj_search").eq(0).html(hotsongstring);
	$("#search_heji_playlist").show();
}

function create_dhj_album(data,searchBeginNum,dhjId){
	var pic = data.pic;
	if(pic!=""&&pic.indexOf("http")>-1){
		pic = pic.replace("albumcover/120","albumcover/70");
	}
	var picstring = "";
	picstring = '<img src="'+pic+'" onerror="this.src=\'img/default.png\'"  width="100" height="100" class="pic100"/>';
	var name = data.name;
	name = returnSpecialChar(name);
	call = "MBOXLOG?stype=type_sdhj&snum="+searchBeginNum+"&showdhj=showalbum&dhjname="+name;
	callClientNoReturn(call);
	var hrefstring = 'dhjJumpQk(13,'+data.id+',\''+checkSpecialChar(name,"name")+'\',13,\''+dhjId+'\',\''+data.songnum+'\')';
	var btnname = data.btnname;
	if(typeof(btnname)=="undefined"){
		btnname = "查看专辑";
	}
	var listtitle = "播放专辑";
	var listtitle2 = "";
	if(typeof(data.songnum)!="undefined"&&data.songnum>0){
	    listtitle = "共"+data.songnum+"首";
	    listtitle2 = listtitle;
	}
	var newstring = '<div class="dhjnew1"><div class="dhjnew2"><a onclick="playPlaylist(3,'+data.id+');return false;" hidefocus href="###" title="'+listtitle+'">播放专辑</a></div><div class="dhjnew4">'+listtitle2+'</div></div>';
	picstring = '<a class="w_a_hj3 hjTitle" data-pos="-5" hidefocus href="###" onclick="'+hrefstring+'"><img src="'+pic+'" onerror="this.src=\'img/default.png\'"  width="70" height="70" class="pic100"/></a>';
    $("#search_heji_album .heji_pic").html(picstring);
	$("#search_heji_album .hj_main h2").html('<a style="float:left;" class="w_a_hj3 hjTitle" data-pos="-4" hidefocus href="###" onclick="'+hrefstring+'" title="'+checkSpecialChar(name,"titlename")+'">'+searchReplaceAll(cutStrByGblen(name,42))+'</a>'+newstring);
	var hotsongobj = data.hotsong;
	var hotsongstring = '<span>专辑内容：</span>';
	for(var i = 0,j = hotsongobj.length>3?3:hotsongobj.length;i<j;i++){
		var someobj = hotsongobj[i];
		var songname = someobj.name;
		var playstring = getHeJiMusicString(someobj,searchKey,dhjId);
		hotsongstring += '<div class="w_heji"><em><a data-music="'+playstring+'" title="播放歌曲" hidefocus href="###" class="mcbtn w_a_heji" data-pos="-3"></a></em><p><a data-music="'+playstring+'" hidefocus href="###" class="hj_song w_a_heji" data-pos="-3" title="'+songname+'">'+searchReplaceAll(songname)+'</a></p></div>';
	}
	if(hotsongobj.length==0){
	    hotsongstring = "";
	}
	$("#search_heji_album .hj_search").eq(0).html(hotsongstring);
	var newsongobj = data.newsong;
	var newsongstring = '<span>最新单曲：</span>';
	for(var m = 0,n = newsongobj.length;m<n;m++){
		var someobj2 = newsongobj[m];
		var songname2 = someobj2.name;
		var playstring = getHeJiMusicString(someobj2,searchKey,dhjId);
		newsongstring += '<div class="w_heji"><em><a data-pos="-2" data-music="'+playstring+'" title="播放歌曲" hidefocus href="###" class="mcbtn w_a_heji"></a></em><p><a data-music="'+playstring+'" hidefocus href="###" class="hj_song w_a_heji" data-pos="-2" title="'+songname2+'">'+searchReplaceAll(songname2)+'</a></p></div>';
	}
	if(newsongobj.length==0){
	    newsongstring = "";
	}
	$("#search_heji_album").show();
}

function create_dhj_subject(data,searchBeginNum,dhjId){
	var pic = data.pic;
	var picstring = "";
	var name = data.name;
	name = returnSpecialChar(name);
	call = "MBOXLOG?stype=type_sdhj&snum="+searchBeginNum+"&showdhj=showsubject&dhjname="+name;
	callClientNoReturn(call);
	var url = data.pageurl;
	if(url.indexOf("?")>-1){
	    url = url + "&from=search&dhjid="+data.id+"&searchkey="+encodeURIComponent((encodeURIComponent(searchKey)))+"&jxjType=2016Mbox";
	}
	url = encodeURIComponent(url);
	var hrefstring = 'dhjJumpQk(21,\''+url+'\',\''+checkSpecialChar(name,"name")+'\',21,\''+dhjId+'\')';
	var listtitle = "播放歌单";
	var listtitle2 = "";
	if(typeof(data.songnum)!="undefined"&&data.songnum>0){
	    listtitle = "共"+data.songnum+"首歌曲";
	    listtitle2 = listtitle;
	}
	var newstring = '<div class="dhjnew1"><div class="dhjnew2"><a onclick="playPlaylist(2,'+data.id+',this);return false;" hidefocus href="###" title="'+listtitle+'">播放歌单</a></div><div class="dhjnew4">'+listtitle2+'</div></div>';
	picstring = '<a class="w_a_hj4 hjTitle" data-pos="-5" hidefocus href="###" onclick="'+hrefstring+'"><img src="'+pic+'" onerror="this.src=\'img/default.png\'"  width="70" height="70" class="pic100"/></a>';
	var btnname = data.btnname;
	if(typeof(btnname)=="undefined"){
		btnname = "查看专题";
	}
	$("#search_heji_subject .heji_pic").html(picstring);
	$("#search_heji_subject .hj_main h2").html('<a style="float:left;" class="w_a_hj4 hjTitle" data-pos="-4" hidefocus href="###" onclick="'+hrefstring+'" title="'+checkSpecialChar(name,"titlename")+'">'+searchReplaceAll(cutStrByGblen(name,42))+'</a>'+newstring);
	var hotsongobj = data.hotsong;
	var hotsongstring = '<span>热门单曲：</span>';
	for(var i = 0,j = hotsongobj.length>3?3:hotsongobj.length;i<j;i++){
		var someobj = hotsongobj[i];
		var songname = someobj.name;
		var playstring = getHeJiMusicString(someobj);
		hotsongstring += '<div class="w_heji"><em><a data-music="'+playstring+'" title="播放歌曲" hidefocus href="###" class="mcbtn w_a_heji" data-pos="-2"></a></em><p><a data-music="'+playstring+'" hidefocus href="###" class="hj_song w_a_heji" data-pos="-2" title="'+songname+'">'+searchReplaceAll(songname)+'</a></p></div>';
	}
	if(hotsongobj.length==0){
	    hotsongstring = "";
	}
	$("#search_heji_subject .hj_search").eq(0).html(hotsongstring);
	$("#search_heji_subject").show();
}

function create_xiu_dhj(data){
	var nowDate = new Date();
    var pastDate = new Date("1601","00","01");
    var searchBeginNum = "utf8_" + devid + encodeURIComponent(searchKey.replace("&", "")) + parseInt((nowDate.getTime() + nowDate.getTimezoneOffset() * 60 * 1000 - pastDate.getTime())/1000/60/60);
	var name = data['SONGNAME'];
	var artist = data['ARTIST'];
	var songId = data['MUSICRID'];
	var firstsearcharray = [];
	firstsearcharray[0] = name;
    firstsearcharray[1] = artist;
    firstsearcharray[2] = songId;
	// 处理ajax参数
	var xcname = encodeURIComponent(name);
    // var xcartist = encodeURIComponent(artist);
    // var searchContent = encodeURIComponent(searchKey);
    var url = "http://jx.kuwo.cn/KuwoLive/PersonMusic";
	$.ajax({
        url:url,
        type:"get",
        dataType:"text",
        data:{
            act:81,
            key:xcname,
            // artist:xcartist,
            // musicrid:songId,
            // searchContent:searchContent,
            from:"1001008095",
            resultType : 31,
            dtime:(new Date()).getTime()
        },
        crossDomain:false,
        success: function (data){

        	try{
				var json = eval('('+data+')');
			}catch(e){

			}
        	create_xiu_area(json,searchBeginNum,firstsearcharray);
        }
    });
}

function create_xiu_area(data,searchBeginNum,firstsearcharray){
	if(typeof(data)!="undefined"&&typeof(data.success)=="boolean"&&data.success===true){
		var pic = data.photoUrl;
        var picstring = "";
        picstring = `<span class="mask_singer"></span>
        			 <img src="${pic}" onerror="this.src=\'img/default.png\'" class="pic100"/>`;
        $("#search_heji_xiu .juneBoxLeft").html(picstring);
        var nickname = data.nickname;
        var songname = data.songName||data.describe;
        var everartist = data.artist;
        try{
            nickname = decodeURIComponent(nickname);
            songname = decodeURIComponent(songname);
            everartist = decodeURIComponent(everartist);
        }catch(e){}
        if(nickname.length>8){
            nickname = nickname.substr(0,8);
        }
        var openLink = "openURL('"+data.roomLink+"','default');return false;"
        $("#search_heji_xiu .juneBoxRleftBottom").html("<span>"+data.onlineCnt+"人</span><span>正在观看</span");
        $("#search_heji_xiu .juneBoxRrightTop").html('<a href="###" hidefocus class="juneListenBtn2">马上去现场></a>');
        $("#search_heji_xiu").show().attr('data-isshow',1);
        $(".juneBox").attr("onclick",openLink);
        if(firstsearcharray.length>1){
            $(".xiuInfoBox .musicName").html(songname);
            $(".singerName").html("热门艺人 ：" + nickname);

      		$("#search_heji_xiu").show().attr('data-isshow',1);
       		callClientNoReturn("DHJShowFinish?h=68&bShow=1");
       		//主播露出统计
            var showerWrap = new Image();
            showerWrap.src = "http://g.koowo.com/g.real?aid=text_ad_2102&ver="+getVersion()+"&type=show"+"&cid="+devid;
            var call = "MBOXLOG?stype=type_sdhj&snum="+searchBeginNum+"&showdhj=showxiuchang&dhjname="+searchKey;
            callClientNoReturn(call);
            if(Math.floor(Math.random()*10)==1){
                var xiuimg = new Image();
                xiuimg.src = "http://g.koowo.com/g.real?aid=text_ad_2102&ver="+getVersion()+"&type=show"+"&cid="+devid;
            }
        }
    }
}
// 大合集相关部分结束

// 页面操作相关
function objBind(){
	$('.tabBox a').live('click',function(){
		if($(this).hasClass('active')){
			return;
		}
		$('.tabBox a').removeClass('active');
		$(this).addClass('active');
		centerLoadingStart();
		pn = 0;
		MUSICLISTOBJ = [];
		MVLISTOBJ = [];
		$('.common_content').hide();
		$('.page').hide();
		$('#dhjBox').hide();
		$('#search_heji_xiu').hide().attr('data-isshow',0);
		setSearchBegin();
		var key = encodeURIComponent(searchKey);
		tabType = $(this).attr('data-type');
		call_create_search_list_fn(tabType,key);
		switch($(this).attr('data-type')){
			case 'all':
				commonClick({'source':'9999','sourceid':searchKey,'type':'all'});
				break;
			case 'mv':
				commonClick({'source':'9999','sourceid':searchKey,'type':'mv'});
				break;
			case 'setlist':
				commonClick({'source':'9999','sourceid':searchKey,'type':'setlist'});
				break;
			case 'radio':
				commonClick({'source':'9999','sourceid':searchKey,'type':'radio'});
				break;
			case 'artist':
				commonClick({'source':'9999','sourceid':searchKey,'type':'artist'});
				break;
			case 'album':
				commonClick({'source':'9999','sourceid':searchKey,'type':'album'});
				break;
			case 'lrc':
				commonClick({'source':'9999','sourceid':searchKey,'type':'lrc'});
				break;
		}
	});

	$(".page a").live("click",function(){
		var oClass = $(this).attr("class");
		if (oClass.indexOf("no") > -1) return;
		// centerLoadingStart();
		var goPnNum = $(this).html();
		if (goPnNum == '上一页') {
			pn = parseInt($(".page .current").html()) - 2;
		} else if (goPnNum == '下一页'){
			pn = parseInt($(".page .current").html());
		} else {
			pn = parseInt($(this).html()) -1;
		}
    	window.parent.document.body.scrollTop = 0+'px';
		var type = 'radio';
		var key = encodeURIComponent(searchKey);
		call_create_search_list_fn(type,key);
		$("#ugcTipsBox").hide();
	});

	// hover 歌曲列表显示TIPS
	$(".music_wrap").live("mouseenter",function(){
		var rid = $(this).attr("c-rid").replace("MUSIC_","");
		if($(this).attr("title").indexOf("加载中")<0){
	        return;
	    }
	    var url = "http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids="+rid;
	    var _this = $(this);
	    clearTimeout(musicTimer);
	    musicTimer = setTimeout(function(){
	        $.ajax({
	            url:url,
	            dataType:'jsonp',
	            success:function(json){
	                var text='';
					var reg =/来源.*/;
					text=jsondata.tag;
					var from = _this.attr("title").replace(reg,"来源："+text).replace(/审批文号.*/,"").replace(/MV出品人.*/,"");
					_this.attr("title",from);
	            }
	        });
	    },1000);
	});

	// 多版本按钮操作
	$('.m_ver').live('click',function(){
		var operationType = "";
		var $music_wrap = $(this).parents(".music_wrap");
		if($(this).hasClass('m_veractive')){//收起操作
			$(this).removeClass('m_veractive').attr('title','展开');
			$(this).parents('li').next().hide();
			operationType = "UNFOLD";
		}else{//展开操作
			$(this).addClass('m_veractive').attr('title','收起');
			$(this).parents('li').next().show();
			operationType = "FOLD";
		}
		// 新搜索统计日志 多版本展开折叠
		var logObj = {
			"operationType":operationType,
			"pos":$music_wrap.index(),
			"ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
			"rid":$music_wrap.attr("c-rid").replace("MUSIC_",""),
			"innerPos":"-1"
		}
		sendSearchLog("operation",logObj);
	});

	// 多版本按钮双击操作
	$('.m_ver').live('dblclick',function(ev){
		ev.stopPropagation();
	});

	// 歌曲 播放 添加 MV 下载 更多等操作
    $(".m_play").live("click",function(){
    	if($(this).parents('div').hasClass('w_musiclist')){
        	searchOperationLog("song","-100","music","noref");
        }else{
    		searchLyricNewLog();
        }
        if($(this).parentsUntil("ul").hasClass("copyright")){
            musicOnline();
            return;
        }
        var rid = $(this).parent().attr("data-rid");
        var playMusicString = MUSICLISTOBJ[rid];
        if(rid&&playMusicString){
            singleMusicOption("SpotsPlay",playMusicString);
        }
    });
    $(".m_add").live("click",function(){
    	var $this = $(this);
        if($this.parentsUntil("ul").hasClass("copyright")){
            musicOnline();
            return;
        }
        var rid = $this.parent().attr("data-rid");
        var playMusicString = MUSICLISTOBJ[rid];
        var playindex = 0;
        // 新搜索统计日志 单曲添加点击
		var $ul = $this.parents("ul");
		var $music_wrap = $this.parents(".music_wrap");
		var pos = parseInt($music_wrap.find(".num").html())-1;
		var innerPos = "-1";
		if($ul.hasClass("kw_ver_list")){
			innerPos = $music_wrap.index();
			pos = parseInt($ul.prev().find(".num").html())-1;
		}
		var logObj = {
			"operationType":"ADD",
			"pos":pos,
			"ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
			"rid":rid.replace("MUSIC_",""),
			"innerPos":innerPos
		}
		sendSearchLog("operation",logObj);
	    if(rid&&playMusicString){
	        playindex++;
	        var playMusicStr = "n="+playindex+"&s"+playindex+"="+MUSICLISTOBJ[rid];
	        multipleMusicOption("AddTo",playMusicStr+"&searchlog="+sendSearchLog("operation",logObj,"needResult"));
	    }
    });
    $(".m_mv").live("click",function(){
    	var $this = $(this);
        if($this.parentsUntil("ul").hasClass("copyright")){
            musicOnline();
            return;
        }
        var rid = $this.parents("li").find(".icon").attr("data-rid");
        var playMusicString = MUSICLISTOBJ[rid];
        if(rid&&playMusicString){
            singleMusicOption("MV",playMusicString,'',$this.parent().find(".w_name").html().replace(/<\/?.+?>/g,''));
        }
        // 新搜索统计日志 单曲添加点击
		var $ul = $this.parents("ul");
		var $music_wrap = $this.parents(".music_wrap");
		var pos = parseInt($music_wrap.find(".num").html())-1;
		var innerPos = "-1";
		if($ul.hasClass("kw_ver_list")){
			innerPos = $music_wrap.index();
			pos = parseInt($ul.prev().find(".num").html())-1;
		}
		var logObj = {
			"operationType":"MV",
			"pos":pos,
			"ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
			"rid":rid.replace("MUSIC_",""),
			"innerPos":innerPos
		}
		sendSearchLog("operation",logObj);
    });
    $(".m_down").live("click",function(){
    	var $this = $(this);
    	if($this.hasClass("notAllow"))return;
        if($this.parentsUntil("ul").hasClass("copyright")){
            musicOnline();
            return;
        }
        var rid = $this.parent().attr("data-rid");
        // 新搜索统计日志 单曲下载
		var $ul = $this.parents("ul");
		var $music_wrap = $this.parents(".music_wrap");
		var pos = parseInt($music_wrap.find(".num").html())-1;
		var innerPos = "-1";
		if($ul.hasClass("kw_ver_list")){
			innerPos = $music_wrap.index();
			pos = parseInt($ul.prev().find(".num").html())-1;
		}
		var logObj = {
			"operationType":"DOWNLOAD",
			"pos":pos,
			"ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
			"rid":rid.replace("MUSIC_",""),
			"innerPos":innerPos
		}
		sendSearchLog("operation",logObj);
        var playMusicString = MUSICLISTOBJ[rid];
        if(rid&&playMusicString){
            singleMusicOption("Down",playMusicString+"&searchlog="+sendSearchLog("operation",logObj,"needResult"));
        }
        if($this.parents('div').hasClass('w_musiclist')){
        	searchOperationLog("down","-100","music","noref");
        }
    });
    $(".m_more").live("click",function(){
    	var $this = $(this);
        if($this.parentsUntil("ul").hasClass("copyright")){
            musicOnline();
            return;
        }
        var rid = $this.parent().attr("data-rid");
        // 新搜索统计日志 单曲更多操作
		var $ul = $this.parents("ul");
		var $music_wrap = $this.parents(".music_wrap");
		var pos = parseInt($music_wrap.find(".num").html())-1;
		var innerPos = "-1";
		var csrc = "搜索->\'"+searchKey+"\'的搜索结果->"+csrcWhere+'->'+$this.parents("li").find(".w_name").html().replace(/<\/?.+?>/g,'');
		if($ul.hasClass("kw_ver_list")){
			innerPos = $music_wrap.index();
			pos = parseInt($ul.prev().find(".num").html())-1;
		}
		var logObj = {
			"operationType":"MORE",
			"pos":pos,
			"ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
			"rid":rid.replace("MUSIC_",""),
			"innerPos":innerPos
		}
        var playMusicString = MUSICLISTOBJ[rid];
        if(rid&&playMusicString){
            var call = "ShowOperation?bSimilarRecomShow=0&song="+playMusicString+"&searchlog="+sendSearchLog("operation",logObj,"needResult")+"&CSRC="+encodeURIComponent(csrc);
		    callClientAsyn(call,function(name, args){
                var type = args[0];
                if(type=="NextPlay"){//下一首播放
                	singleMusicOption("NextPlay",playMusicString,'',$music_wrap.find(".w_name").html().replace(/<\/?.+?>/g,''));
                }
            });
        }
    });
    // 歌曲名称 点击
    $(".w_name").live("click",function(){
    	var $this = $(this);
    	var name = $this.html();
    	if($this.parents('div').hasClass('w_musiclist')){
        	searchOperationLog("song","-100","music","noref");
        }else{
    		searchLyricNewLog();
        }
        if($this.parentsUntil("ul").hasClass("copyright")){
            musicOnline();
            return;
        }
        var rid = $this.attr("data-rid");
        var playMusicString = MUSICLISTOBJ[rid];
        if(rid&&playMusicString){
            singleMusicOption("SpotsPlay",playMusicString,'',name.replace(/<\/?.+?>/g,''));
        }
        // 新搜索统计日志 露出播放
		var $ul = $this.parents("ul");
		var $music_wrap = $this.parents(".music_wrap");
		var pos = parseInt($music_wrap.find(".num").html())-1;
		var innerPos = "-1";
		if($ul.hasClass("kw_ver_list")){
			innerPos = $music_wrap.index();
			pos = parseInt($ul.prev().find(".num").html())-1;
		}
		var logObj = {
			"operationType":"PLAY",
			"pos":pos,
			"ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
			"rid":rid.replace("MUSIC_",""),
			"innerPos":innerPos
		}
		sendSearchLog("operation",logObj);
    });
    // 清晰度
    $(".m_hd").live("click",function(){
        if($(this).parentsUntil("ul").hasClass("copyright")){
            musicOnline();
            return;
        }
        var rid = $(this).parents("li").find(".icon").attr("data-rid");
        var playMusicString = MUSICLISTOBJ[rid];
        var mdcode = $(this).attr("data-md");
        if(rid&&playMusicString&&mdcode){
		    singleMusicOption("ShowHQ",playMusicString,mdcode);
        }
    });
    // 全部播放 添加 MV 下载 操作
    $(".all_play").live("click",function(){
    	checkChoose();
        var playarray = [];
        var playindex = 0;
        var icon = $(this).parents(".common_content").find(".icon");
        icon.each(function(){
            var thisObj = $(this);
            var rid = thisObj.attr("data-rid");
            var flag = true;
            var inputprev = thisObj.parents("li");
            if(inputprev.hasClass("copyright")){
                //musicOnline();
                flag = false;
            }else{
                if(inputprev.find(".m_left")){
                	flag = inputprev.find(".m_ckb").attr("checked");

            	}
            }
            if(flag&&rid&&MUSICLISTOBJ[rid]){
                playindex++;
                playarray[playarray.length] = "&s"+playindex+"="+MUSICLISTOBJ[rid];
            }
        });
        var logObj = {
            "operationType":"ALLPLAY",
            "pos":0,
            "innerPos":-1,
            "rid":0,
            "ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
            "hitNum":$(".checkall font").html(),
            "searchKey":searchKey
        }
        sendSearchLog("operation",logObj);
        if(playindex>0){
            var playMusicString = ("n="+playindex+playarray.join(""));
            multipleMusicOption("SpotsPlay",playMusicString);
            if($(this).parents('div').hasClass('w_musiclist')){
            	searchOperationLog('playall','-1','music','noref');
            }
        }
    });
    $(".all_add").live("click",function(){
    	checkChoose();
        var playarray = [];
        var playindex = 0;
        var icon = $(this).parents(".common_content").find(".icon");
        icon.each(function(){
            var thisObj = $(this);
            var rid = thisObj.attr("data-rid");
            var flag = true;
            var inputprev = thisObj.parents("li");
            if(inputprev.parent().hasClass("copyright")){
                //musicOnline();
                flag = false;
            }else{
                if(inputprev.find(".m_left")){
                	flag = inputprev.find(".m_ckb").attr("checked");

            	}
            }
            if(flag&&rid&&MUSICLISTOBJ[rid]){
                playindex++;
                playarray[playarray.length] = "&s"+playindex+"="+MUSICLISTOBJ[rid];
            }
        });
        var logObj = {
            "operationType":"ALLADD",
            "pos":0,
            "innerPos":-1,
            "rid":0,
            "ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
            "hitNum":$(".checkall font").html(),
            "searchKey":searchKey
        }
        sendSearchLog("operation",logObj);
        var searchLog = "&searchlog="+sendSearchLog("operation",logObj,"needResult");
        if(playindex>0){
            var playMusicString = ("n="+playindex+playarray.join(""));
            multipleMusicOption("AddTo",playMusicString+searchLog);
            if($(this).parents('div').hasClass('w_musiclist')){
            	searchOperationLog('downall','-1','music','noref');
            }
        }
    });
    $(".all_mv").live("click",function(){
        var playarray = [];
        var playindex = 0;
        var icon = $(this).parents(".common_content").find(".icon");
        icon.each(function(){
            var thisObj = $(this);
            var rid = thisObj.attr("data-rid");
            var flag = true;
            var inputprev = thisObj.parents("li");
            if(inputprev.parent().hasClass("copyright")){
                //musicOnline();
                flag = false;
            }else{
                if(inputprev.find(".m_left")){
                	flag = inputprev.find(".m_ckb").attr("checked");

            	}
            }
            if(flag&&!thisObj.find(".m_mv").hasClass("m_mv_n")&&rid&&MUSICLISTOBJ[rid]){
                playindex++;
                playarray[playarray.length] = "&s"+playindex+"="+MUSICLISTOBJ[rid];
            }
        });
        if(playindex>0){
            var playMusicString = ("n="+playindex+playarray.join(""));
            multipleMusicOption("MV",playMusicString);
            if($(this).parents('div').hasClass('w_musiclist')){
            	searchOperationLog('addall','-1','music','noref');
            }
        }
    });
    $(".all_down").live("click",function(){
    	checkChoose();
        var playarray = [];
        var playindex = 0;
        var icon = $(this).parents(".common_content").find(".icon");
        var isAllNotAllow = true;
        icon.each(function(){
            var thisObj = $(this);
            var rid = thisObj.attr("data-rid");
            var flag = true;
            var inputprev = thisObj.parents("li");
            if(inputprev.parent().hasClass("copyright")||thisObj.find(".m_down").hasClass("notAllow")){
                //musicOnline();
                flag = false;
            }else{
                if(inputprev.find(".m_left")){
                	flag = inputprev.find(".m_ckb").attr("checked");

            	}
            }
            if(flag&&rid&&MUSICLISTOBJ[rid]){
                playindex++;
                playarray[playarray.length] = "&s"+playindex+"="+MUSICLISTOBJ[rid];
                if(!thisObj.find(".m_down").hasClass("notAllow")){
		            isAllNotAllow = false;
		        }
            }
        });
        var logObj = {
            "operationType":"ALLDOWNLOAD",
            "pos":0,
            "innerPos":-1,
            "rid":0,
            "ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
            "hitNum":$(".checkall font").html(),
            "searchKey":searchKey
        }
        sendSearchLog("operation",logObj);
        if(playindex>0){
        	if(isAllNotAllow){
		        qukuTips("应版权方要求暂不能下载");
		    }
            var playMusicString = ("n="+playindex+playarray.join(""));
            multipleMusicOption("Down",playMusicString+"&searchlog="+sendSearchLog("operation",logObj,"needResult"));
        }
    });
    // 单曲复选框
    $(".m_ckb").live("click",function(){
        var thisObj = $(this);
	    var flag = thisObj.attr("checked");
	    if(!flag){
            $(".all_ckb").attr("checked",false);
	    }else{
		    var inputs = $(".m_ckb");
		    var someobj;
		    var check = true;
		    for(var i = 0,j=inputs.size();i<j;i++){
			    someobj = inputs.eq(i);
			    if(someobj.css("visibility")!="hidden"&&!someobj.attr("checked")){
				    check = false;
				    break;
			    }
		    }
	        $(".all_ckb").attr("checked",check);
	    }
    });
    //双击单曲条播放歌曲
    $(".music_wrap").live("dblclick", function () {
    	var $this = $(this);
        if($this.hasClass("copyright")){
            musicOnline();
            return;
        }
        var rid = $this.find(".w_name").attr("data-rid");
        var playMusicString = MUSICLISTOBJ[rid];
        if (rid && playMusicString) {
            singleMusicOption("SpotsPlay", playMusicString,'',$this.find(".w_name").html().replace(/<\/?.+?>/g,''));
        }
        // 新搜索统计日志 露出播放
		var $ul = $this.parents("ul");
		var pos = parseInt($this.find(".num").html())-1;
		var innerPos = "-1";
		if($ul.hasClass("kw_ver_list")){
			innerPos = $this.index();
			pos = parseInt($ul.prev().find(".num").html())-1;
		}
		var logObj = {
			"operationType":"PLAY",
			"pos":pos,
			"ref":"乐库->搜索结果->"+searchKey+"->REF单曲",
			"rid":rid.replace("MUSIC_",""),
			"innerPos":innerPos
		}
		sendSearchLog("operation",logObj);
    });
    var kk = true;
    //歌曲拖拽
    $(".music_wrap").live("mousedown", function (e) {
        var ev = e || event;
        if (typeof (ev.which) != "undefined" && ev.which == 3) {
            return;
        }
        currentX = ev.clientX;
        currentY = ev.clientY;
        isDragMusic = true;
        kk = true;
        var rid = $(this).find(".w_name").attr("data-rid");
        dragMusicString = MUSICLISTOBJ[rid];
        $(this).mousemove(function (e) {
            var ev = e || event;
            var X = ev.clientX;
            var Y = ev.clientY;
            if (Math.abs(X - currentX) > 5 || Math.abs(Y - currentY) > 5) {
            } else {
                return false;
            }
            if (isDragMusic && dragMusicString != "") {
                var currentobj = $(event.srcElement);
                if (currentobj.is("a")) {
                    isDragMusic = false;
                    return false;
                } else if (currentobj.is("input")) {
                    isDragMusic = false;
                    return false;
                } else {
                    if (kk) {
                        kk = false;
                        if($(this).hasClass("copyright")){
                            musicOnline();
                            return;
                        }
                        callClientNoReturn("Begindrag?song=" + dragMusicString);
                    }
                }
                return false;
            }
        });
    });
    $(".music_wrap").live("mouseup", function () {
        isDragMusic = false;
        $(this).unbind("mousemove");
        if($(this).parents('div').hasClass('w_musiclist')){
        	searchOperationLog('drag','-1','music','noref');
        }
    });
    // 全选框
    $(".all_ckb").live("click",function(){
        var thisObj = $(this);
        var m_ckb = thisObj.parents(".common_content").find(".m_ckb");
	    var flag = thisObj.attr("checked");
	    if(!flag){
            m_ckb.attr("checked",false);
	    }else{
	        m_ckb.attr("checked",true);
	    }
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
		$(window).scrollTop(0);
		// searchFunction(json);
	});
	$(".all_playmv").live("click",function(){
	    try{
	    var mvString = "";
	    var htmlarray = [];
	    var PLAYOBJ;
		PLAYOBJ = MVLISTOBJ;
		var onlineflag = false;
	    var mvlistsize = PLAYOBJ.length;
	    for (var i=0; i<PLAYOBJ.length; i++) {
	        var someobj = MVLISTOBJECT[i];
	        if(typeof(someobj)!="undefined"&&typeof(someobj.ONLINE)!="undefined"&&someobj.ONLINE.length==1&&someobj.ONLINE==0){
	            mvlistsize--;
	            onlineflag = true;
	            continue;
	        }
		    htmlarray[i] = "&s"+(i+1)+"="+returnSpecialChar(PLAYOBJ[i]);
	    }
	    if(onlineflag){
	        if(mvlistsize==0){
	            musicOnline();
	            return;
	        }else{
	            musicOnline(true);
	        }
	    }
	    mvString = ("n="+PLAYOBJ.length + htmlarray.join(''));
	    multipleMusicOption("SpotsPlayAllMv",mvString);
	    }catch(e){}
	    return false;
    });

    // 电台相关操作
    // $(".br_pic").live("mouseenter",function(){
    //     if ($(this).hasClass("on")) return;
    //     $(this).addClass("on");
    //     var status = $(this).attr("c-status");
    //     // if (!parseInt(status,10)) return;
    //     var someClass = $(this).parent().attr('class');
    //     var s = someClass.indexOf("radio_");
    //     var id = someClass.substring(s + 6);
    //     var stopicon = '';
    //     var click = '';
    //     if (status == 1) {
    //         click = 'stopRadio(arguments[0],\''+id+'\',true);';
    //         stopicon = '<i title="暂停播放" onclick="" class="radio_pause"></i>';
    //         $(this).find(".radio_pause").remove();
    //         $(this).find(".radio_play").remove();
    //     } else if (status == 2)	{
    //         click = 'continueRadio(arguments[0],\''+id+'\',true);';
    //         stopicon = '<i title="继续播放" onclick="" class="radio_start"></i>';
    //         $(this).find(".radio_start").remove();
    //         $(this).find(".radio_stop").remove();
    //     }else{
    //     	click = $(this).attr("_onclick");
    //     }
    //     $(this).append(stopicon);
    //     $(this).removeAttr('onclick');
    //     $(this).unbind("click").bind("click", function () {
    //         eval(click);
    //     });
    //     return false;
    // });
    // $(".br_pic").live("mouseleave",function(){
    //     $(this).removeClass("on");
    //     $(this).find(".radio_pause").remove();
    //     $(this).find(".radio_start").remove();
    //     var status = $(this).attr("c-status");
    //     if (status == 1) {
    //         var stopicon = '<img class="radio_play" src="img/radio_play.gif">';
    //         $(this).find(".radio_play").remove();
    //         $(this).find(".i_play").hide();
    //         $(this).append(stopicon);
    //     } else if (status == 2)	{
    //         var playicons = '<i class="radio_stop"></i>';
    //         $(this).find(".radio_stop").remove();
    //         $(this).find(".i_play").hide();
    //         $(this).append(playicons);
    //     }
    //     return false;
    // });
    $(".kw_radiolist .br_name a").live("mouseenter",function(){
		  $(this).css("color",$skinConfig.linkColor);
    });
    $(".kw_radiolist .br_name a").live("mouseleave",function(){
      $(this).css("color",'');
    });
    // 电台相关操作结束

	//收听合集下的单曲
	$(".w_a_heji").live("click",function(){
		var playMusicString = $(this).attr("data-music");
		var name = $(this).html();
		name = name==""?$(this).parents(".w_heji").find(".hj_song").html():name;
		singleMusicOption("Play",playMusicString,'',name.replace(/<\/?.+?>/g,''),'dhj');
		var pos = $(this).attr("data-pos");
		if(typeof(pos)=="undefined"){
			pos = 0;
		}
		searchOperationLog("dhj_play",pos,"music","noref");
	});
	$(".w_a_hj1").live("click",function(){
		var pos = $(this).attr("data-pos");
		if(typeof(pos)=="undefined"){
			pos = 0;
		}
		if($(this).hasClass("w_djbang")){
		    return;
		}
		searchOperationLog("ref",pos,"music","refartist");
	});
	$(".w_a_hj2").live("click",function(){
		var pos = $(this).attr("data-pos");
		if(typeof(pos)=="undefined"){
			pos = 0;
		}
		if($(this).hasClass("w_djbang")){
		    return;
		}
		searchOperationLog("ref",pos,"music","refplaylist");
	});
	$(".w_a_hj3").live("click",function(){
		var pos = $(this).attr("data-pos");
		if(typeof(pos)=="undefined"){
			pos = 0;
		}
		if($(this).hasClass("w_djbang")){
		    return;
		}
		searchOperationLog("ref",pos,"music","refalbum");
	});
	$(".w_a_hj4").live("click",function(){
		var pos = $(this).attr("data-pos");
		if(typeof(pos)=="undefined"){
			pos = 0;
		}
		if($(this).hasClass("w_djbang")){
		    return;
		}
		searchOperationLog("ref",pos,"music","refsubject");
	});
	// 大合集相关操作结束

    $(window).scroll(function(){
    	var contentTop = window.pageYOffset|| document.documentElement.scrollTop || document.body.scrollTop;
        if (contentTop > 15) {
        	$(".w_rtop").show();
        	$('#search_heji_xiu').hide();
        } else {
        	$(".w_rtop").hide();
        	if($('#search_heji_xiu').attr('data-isshow')!='0'){
        		$('#search_heji_xiu').show();
        	}
        }
    });
    //新搜索统计日志 搜索结果单曲列表歌手、专辑跳转日志
	$(".forLog").live("click",function(){
		var $this = $(this);
		var $ul = $this.parents("ul");
		var $music_wrap = $this.parents(".music_wrap");
		var pos = parseInt($music_wrap.find(".num").html())-1;
		var innerPos = "-1";
		var operationType = "TOARTIST";
		var refName = "查看歌手";
		if($ul.hasClass("kw_ver_list")){
			innerPos = $music_wrap.index();
			pos = parseInt($ul.prev().find(".num").html())-1;
		}
		if($this.parent().hasClass("m_album")||$this.hasClass("m_album")){
			operationType = "TOALBUM";
			refName = "查看专辑";
		}
		var logObj = {
			"operationType":operationType,
			"pos":pos,
			"ref":"乐库->搜索结果->"+searchKey+"->REF单曲->"+refName,
			"rid":$this.parents(".music_wrap").attr("c-rid").replace("MUSIC_",""),
			"innerPos":innerPos
		}
		sendSearchLog("operation",logObj);
	});
	//新搜索统计日志 搜索结果歌单、专辑、歌手、电台点击
	$(".forRefLog").live("click",function(){
		var $this = $(this);
		var $ulClass = $this.parents("ul").attr("class");
		var pos = $this.parents("li").index();
		var refaddr = "";
		var ref = "";
		if($ulClass=="kw_playlist"){
			refaddr = "REFPLAYLIST";
			ref = "歌单";
		}else if($ulClass=="kw_radiolist"){
			refaddr = "REFRADIO";
			ref = "电台";
		}else if($ulClass=="kw_artist_list"){
			refaddr = "REFARTIST";
			ref = "歌手";
		}else if($ulClass=="kw_album_list"){
			refaddr = "REFALBUM";
			ref = "专辑";
		}else if($ulClass=="kw_mv_list"){
			refaddr = "REFMV";
			ref = "MV";
		}
		var logObj = {
			"pos":pos,
			"refaddr":refaddr,
			"ref":"乐库->搜索结果->"+searchKey+"->REF"+ref,
			"rid":$this.attr("data-rid")||$this.parents("li").attr("data-rid")
		}
		sendSearchLog("operationRef",logObj);
	});
}
// 页面操作结束

// 无结果调用显示页面的方法
function searchNoResult(){
	// var somekey = searchKey;
	// somekey = somekey.replace(/</g,"&lt;").replace(/\\'/g,"'");
	// $(".w_noresult em").html(somekey);
	// $(".w_noresult").show();
	// $.getScript("http://topmusic.kuwo.cn/today_recommend/searchNoResult.js");
	window.parent.radioResult(true);
}
// 907 增加loading mv请求后并且有数据 结果调用显示页面的方法
function radioLoading(){
	// var somekey = searchKey;
	// somekey = somekey.replace(/</g,"&lt;").replace(/\\'/g,"'");
	// $(".w_noresult em").html(somekey);
	// $(".w_noresult").show();
	// $.getScript("http://topmusic.kuwo.cn/today_recommend/searchNoResult.js");
	window.parent.radioLoading(false);
}

function handleSearchNoResult(jsondata){
	var data = jsondata;
	centerLoadingEnd();
	if(typeof(data)=="undefined"||data==null||typeof(data.datalist)=="undefined"||data.datalist.length==0){
		return;
	}
	var datalist = data.datalist;
	var datalistsize = datalist.length;
	var html = "";
	var htmlarray = [];
	var xia = 0;
	var hrefstring = "";
	htmlarray[xia++] = '<p class="l_p2">您还可以查看搜索热词：</p>';
	for(var i = 0; i < datalistsize; i++){
		var someobj = datalist[i];
		var source = someobj.source;
		if(source==2){
			source = 1;
		}
		var sourceid = someobj.sourceid;
		var nodeid = someobj.nodeid;
		var name = someobj.name;
		var disname = someobj.disname;
		hrefstring = 'jumpQK('+source+','+sourceid+',\''+checkSpecialChar(name,"name")+'\','+nodeid+')';
		if(source==5){
		    if(sourceid==28){
		        source = 29;
		        sourceid = 78067;
		        nodeid = 78067;
		        var other = "|psrc=分类->|bread=-2,5,分类,-2";
		        hrefstring = 'jumpQK(43,1,\'DJ\',0,0,\''+other+'\')';
		        //hrefstring = 'jumpQK(40,190481,\'DJ\',0,0,\''+other+'\')';
		    }else{
		        continue;
		    }
		}else if(source==8||source==12){
		    hrefstring = 'jumpQK('+source+','+sourceid+',\''+checkSpecialChar(name,"name")+'\','+nodeid+',\'\',\'|from=index\')';
		}else if(source==1){
		    hrefstring = 'jumpQK('+source+','+nodeid+',\''+checkSpecialChar(name,"name")+'\','+sourceid+',\'\',\'|psrc=排行榜->|bread=-2,2,排行榜,0\')';
		}
		htmlarray[xia++] = '<a hidefocus href="###" onclick="';
		htmlarray[xia++] = hrefstring;
		htmlarray[xia++] = '" title="';
		htmlarray[xia++] = disname;
		htmlarray[xia++] = '">';
		htmlarray[xia++] = disname;
		htmlarray[xia++] = '</a>';
	}
	html = htmlarray.join('');
	$("#noresult_con").html(html);
}

// 新搜索统计日志
function sendSearchLog(type,logObj,result){
	var enKey = encodeURIComponent(searchKey);
	var stime = getDataByConfig("searchLog","searchTime");
	var snum = devid+enKey+parseInt(stime/36000);
	var searchNo = devid+enKey+stime;
	var time = new Date().getTime();
	var logStr = "";
	var mustLogStr = "";
	var dhjName = encodeURIComponent(logObj.dhjName);
	var ref = encodeURIComponent(logObj.ref);
	if(type=="dhj"){
		logStr = "SNUM:"+snum+"|DHJ_TYPE:"+logObj.dhjType+"|DHJ_NAME:"+dhjName+"|SKEY:"+enKey+"|SOURCEID:"+logObj.rid+"|HITNUM:"+logObj.hitNum+"|KEY:"+enKey+"|TIME:"+time+"|SEARCHNO:"+searchNo;
	}else if(type=="dhjClick"){
		logStr = "SNUM:"+snum+"|OPERATIONTYPE:COLLECTIONCLICK|DHJ_TYPE:"+logObj.dhjType+"|DHJ_NAME:"+dhjName+"|SKEY:"+enKey+"|REF:"+encodeURIComponent("乐库->搜索结果->")+enKey+encodeURIComponent("->REF单曲")+"|SOURCEID:"+logObj.rid+"|POS:0|HITNUM:"+logObj.hitNum+"|KEY:"+enKey+"|TIME:"+time+"|SEARCHNO:"+searchNo;
	}else{
		if(type=="operation"){
			mustLogStr = "|STYPE:TYPE_SOPERATION|OPERATIONTYPE:"+logObj.operationType+"|POS:"+logObj.pos+"|INNERPOS:"+logObj.innerPos+"|HASLYRIC:0|REF:"+ref+"|SOURCEID:"+logObj.rid;
		}else if(type=="operationRef"){
			mustLogStr = "|STYPE:TYPE_SOPERATION|OPERATIONTYPE:REF|POS:"+logObj.pos+"|SEARCHTYPE:MUSIC|REFADDR:"+logObj.refaddr+"|REF:"+ref+"|SOURCEID:"+logObj.rid;
		}else if(type=="search"){
			mustLogStr = "|SKEY:"+enKey+"|SEARCHMODE:"+logObj;
		}
		logStr = "SNUM:"+snum+mustLogStr+"|HITNUM:"+hitNum+"|KEY:"+enKey+"|TIME:"+time+"|SEARCHNO:"+searchNo;
	}
	if(result){
		return logStr.replace("|OPERATIONTYPE:MORE","");;
	}else{
		realTimeLog("SEARCHSONG",logStr);
	}
}

