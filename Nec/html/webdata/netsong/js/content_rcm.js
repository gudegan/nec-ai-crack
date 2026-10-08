var currentObj;
var gedanId;
var infoTxt = '';
var psrc;
var bread;
var txtLen = 0;
var pn = 0;
var rn = 20;
var isIndex;
var newnum = 0;
var currentName;
var sourceid;
var oldurl=decodeURIComponent(window.location.href).split('?')[0];
var oldmsg='';
var discoverNoData = false;
var discoverCache = '';
$(function(){
	callClientNoReturn('domComplete');
	var url=decodeURIComponent(window.location.href);
	var msg=getUrlMsg(url);
	oldmsg=msg;
    centerLoadingStart("content");
    sourceid = url2data(msg,'sourceid');
	psrc = getStringKey(msg,'psrc') || '首页->';
	pn = getStringKey(msg,'pn') || 0;
	isIndex = getStringKey(msg,'from');
	newsong = getStringKey(msg,'newsong');
	$("body").attr("data-csrc",getStringKey(msg,'csrc'));
	setPageHeadInfo();
	getSomeData();
	
	centerLoadingEnd();
	objBindFn();
});

function setPageHeadInfo(){
	var oDate = new Date();
	var oDay = toDou(oDate.getDate());
	var week = oDate.getDay();
	switch(week){
		case 1:
			week = '星期一';
			break;
		case 2:
			week = '星期二';
			break;
		case 3:
			week = '星期三';
			break;
		case 4:
			week = '星期四';
			break;
		case 5:
			week = '星期五';
			break;
		case 6:
			week = '星期六';
			break;
		case 0:
			week = '星期日';
			break;
	}
	$('.bannerBox .dateBox .num').html(oDay);
	$('.bannerBox .dateBox .week').html(week);
}

$(window).resize(function(){
	loadImages();
});
var currentPlaylistName = "";
var currentPlaylistId = "";
var currentPlaylistPic = "";
var currentPlaylistInfo = "";
// 获取歌单数据
function getSomeData() {
	var userInfo = getUserID('all');
	var uid = userInfo.uid;
	var kid = userInfo.kid;
	//var url = "http://rcm.kuwo.cn/rec.s?cmd="+sourceid+"&uid="+getUserID("uid")+"&devid="+getUserID("devid")+"&platform=pc&callback=getGedanInfoData&pn="+pn+"&rn="+rn+"&t="+Math.random();
	//var testurl='http://rcm.kuwo.cn/rec.s?cmd=rcm_personal&uid=171368251&devid=43513807&platform=pc&pn=0&rn=30&t='+Math.random();
	//var testurl='http://rcm.kuwo.cn/rec.s?cmd=rcm_discover&uid=171368251&devid=43513807&platform=pc&pn=0&rn=30&t='+Math.random();
	var url = "http://mobi.kuwo.cn/mobi.s?f=web&q=12345&type=rcm_discover&uid="+uid+"&devid="+kid+"&platform=pc&pn="+pn+"&rn="+rn+"&t="+Math.random();
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(arr){
			var data=eval('('+arr+')');
			if(data.length == 0){
				loadErrorPage();
			}
			var str = '';
			for(var i=0; i<data.length; i++){
				data[i].indexNum = i;
	    		str +=createGedanMusicList(data[i],i,pn,rn,'首页->为你推荐->私人口味');
			}
			$(".checkall font").html(data.length);
			$(".kw_music_list").html(str);
			centerLoadingEnd("content");
			$('#content').show();
			iframeObj.refresh();
		},
		error:function(){
			loadErrorPage();
		}
    });
}
// 创建歌单内容
// function getGedanInfoData(jsondata) {
// 	var listModel = loadTemplate('#kw_ml');
// 	var html = drawListTemplate(jsondata, listModel ,proGedanData);
// 	$(".kw_music_list").html(html);
// 	centerLoadingEnd("content");
// 	$('#content').show();
// 	iframeObj.refresh();
// }

// function proGedanData(obj){
// 	var json ={};
	
// 	var name = checkSpecialChar(obj.name,"name");
//     var disname = checkSpecialChar(obj.disname,"disname") || checkSpecialChar(name,"disname");
//     var titlename = checkSpecialChar(disname,"titlename");  
//     var album = obj.album;
//     var albumid = obj.albumid;
//     var artist = obj.artist;
//     var artistid = obj.artistid;
//     var formats = obj.formats;
//     var id = obj.id;
//     var params = obj.params;
//     var param = obj.param;
//     //var moneyIcon = getMoney(obj,"down");
//     var moneyIcon = '';
//     var other = '|from=index(rcm)|psrc=发现好歌->|';
//     var mvBlock = '';
//     var mvFlag = params.indexOf('MV_0');
//     if(obj.hasmv == '1' && mvFlag<0){
//     	if(!getTanMuIconStr(obj)){
//     		mvBlock = '<a hidefocus href="javascript:;" class="m_mv" title="观看MV"></a>';
//     	}else if(getTanMuIconStr(obj)){
//     		var strTm = getTanMuIconStr(obj);
//     		mvBlock = '<i class="m_score tm">'+ strTm + '</i>';
//     	}
//     }
//     var copyright = obj.copyright || obj.COPYRIGHT;
//     var pay = obj.pay;
//     var iconType = '';
//     if(copyright == 1){
// 		iconType = '<a title="该歌曲来自第三方网站" class="earth"></a>'
// 	}else if(pay==0){
// 		iconType = '<a style="margin-left:80px;" title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon"></a>';
// 	}
//     var tips = getMusicTips(name,artist,album);
//     var num = toDou(obj.indexNum + 1);
//     var hdClass = 'm_hd '+getHqLevel(obj);
//     var artistClick = commonClickString(new Node(4,artistid,checkSpecialChar(artist,"name"),4));
//     var artistTitleName = checkSpecialChar(artist,"titlename");
//     var artistName = checkSpecialChar(artist,"disname");
//     var albumClick = commonClickString(new Node(13,albumid,checkSpecialChar(album,"name"),13));
//     var albumTitleName = checkSpecialChar(album,"titlename");
//     var albumName = checkSpecialChar(album,"disname");
// 	var reason = '';
// 	var newreason = obj.newreason;
// 	var reasonModel = loadTemplate('#kw_rcmNewreason');
// 	reason = drawListTemplate(newreason, reasonModel ,proReasonData);
// 	json={
// 		'id':id,
// 		'tips':tips,
// 		'indexNum':obj.indexNum,
// 		'num':num,
// 		'hdClass':hdClass,
// 		'moneyIcon':moneyIcon,
// 		'iconType':iconType,
// 		'formats':formats,
// 		'musicTitlename':tips,
// 		'musicName':disname,
// 		'mvBlock':mvBlock,
// 		'artistClick':artistClick,
// 		'artistTitleName':artistTitleName,
// 		'artistName':artistName,
// 		'albumClick':albumClick,
// 		'albumTitleName':albumTitleName,
// 		'albumName':albumName,
// 		'reasonText':reason
// 	};
// 	saveMusicInfo(obj,"playlist",'首页->为你推荐->发现好歌');
// 	return json;
// }

function proReasonData(obj){
	var json = {};
	
	var desc = obj.desc;
	var newArtist = '';
	var other = '';
	var str = '';
	switch(obj.type){
        case 'txt':
        	str = '<span>'+desc+'</span>';
            break;
        case 'artist':
            newArtist = desc.substring(1,desc.length-1);
        	var click = commonClickString(new Node(4,obj.id,checkSpecialChar(newArtist,"name"),4));
        	var titlename = checkSpecialChar(newArtist,"titlename");
        	var name = checkSpecialChar(desc,"disname");
            str = '<a onclick="'+click+'" hidefocus href="javascript:;" title="'+titlename+'">'+name+'</a>';
            break;
        case 'playlist':
        	var click = commonClickString(new Node('8',obj.id,desc,'','',other));
        	var titlename = checkSpecialChar(desc,"titlename");
        	var name = checkSpecialChar(desc,"disname");
            str = '<a onclick="'+click+'" hidefocus href="javascript:;" title="'+titlename+'">'+name+'</a>';
            break;
        case 'tag':
            tag = desc.substring(1,desc.length-1);
            str = '<span>['+tag+']</span>';
            break;
        default:
            str = '<span>'+desc+'</span>';
            break;
	}
	
	json = {
		'text':str
	};
	return json;
}

function getDiscovereData(){
	var userInfo = getUserID('all');
	var uid = userInfo.uid;
	var kid = userInfo.kid;
	//var url = 'http://60.28.195.115/rec.s?cmd=rcm_taste_module&uid='+getUserID('uid')+'&devid='+getUserID('devid')+'&platform=pc&pn=0&rn=20';
	var url = 'http://rcm.kuwo.cn/rec.s?cmd=rcm_taste_module&uid='+uid+'&devid='+kid+'&platform=pc&pn=0&rn=20';
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(jsonStr){
			var data=eval('('+jsonStr+')');
			var musicArr = data.taste;
			var artistArr = data.listened.artist;
			var tagArr = data.listened.tag.list;
			var musciArr = data.taste;
	    	createArtistList(artistArr);
	    	createTagList(tagArr);
	    	createMusicList(musicArr);
		},
		error:function(){
			$('.singerListBox').html('<p class="no">暂无常听歌手！</p>');
		}
    });
}

function createArtistList(data){
	var model = loadTemplate('#kw_artistModel');
	var html = drawListTemplate(data,model,proOftenArtistData);
	$('.singerListBox').html(html);
	loadImages();
}

function proOftenArtistData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
	var pic = obj.pic;
	pic = getArtistPic(pic);
	json = {
		'name':name,
		'pic':obj.pic
	};
	return json;
}

function createTagList(data){
	if(!data || data.length == 0){
		$('.tagBox').html('<p class="no">暂无常听风格！</p>');
		return;
	}
	var model = loadTemplate('#kw_tagModel');
	var html = drawListTemplate(data,model,proTagData);
	$('.tagBox').html(html);
}

function proTagData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
	json = {
		'name':name
	};
	return json;
}

function createMusicList(data){
	if(data.length == 0){
		$('.songBox h3').after('<p class="no">暂无常听歌曲!</p>');
		return;
	}
	var len = Math.ceil(data.length/2);
	var leftArr =[];
	var rightArr =[];
	for(var i=0; i<data.length; i++){
		if(i<len){
			leftArr.push(data[i]);
		}else{
			rightArr.push(data[i]);
		}
	}
	var model = loadTemplate('#kw_musicListModel');
	var leftHtml = drawListTemplate(leftArr,model,proMusicListData);
	$('.leftListBox').html(leftHtml);
	
	var rightHtml = drawListTemplate(rightArr,model,proMusicListData);
	$('.rightListBox').html(rightHtml);
}

function proMusicListData(obj){
	var json = {};
	var musicName = checkSpecialChar(obj.name,"name");
	var artistName = checkSpecialChar(obj.artist,"disname");
	var artistClick = commonClickString(new Node(4,obj.artistid,checkSpecialChar(obj.artist,"name"),4));
	var psrc = '首页->为你推荐->私人口味';

	json = {
		'id':obj.id,
		'musicName':musicName,
		'artistName':artistName,
		'aClick':artistClick
	};
	saveMusicInfo(obj,"playlist",psrc);
	return json;
}

function getHistoryData(){
	var userInfo = getUserID('all');
	var uid = userInfo.uid;
	var kid = userInfo.kid;
	//var url = 'http://60.28.195.115/rec.s?cmd=rcm_listen_history&uid='+uid+'&devid='+kid+'&platform=pc';
	var url = 'http://rcm.kuwo.cn/rec.s?cmd=rcm_listen_history&uid='+uid+'&devid='+kid+'&platform=pc';
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(jsonStr){
			var data=eval('('+jsonStr+')');
			var historyListData = data.listenrecord;
			createHistoryList(historyListData);
		},
		error:function(){
			$('.recordContentWrap').html('<p class="no">暂无听歌记录！</p>');
		}
    });
}

function createHistoryList(data){
	if(!data){
		$('.recordContentWrap').html('<p class="no">暂无听歌记录！</p>').css('border','none');
		return;
	}
	var model = loadTemplate('#kw_historyListModel');
	var html = drawListTemplate(data,model,proHistoryListData);
	$('.recordContentWrap').html(html);
}

function proHistoryListData(obj){
	var json = {};
	var date = obj.date;
	var musicDataArr = [];
	var musicData = obj.list;
	for(var i=0; i<musicData.length; i++){
		var tmp = musicData[i];
		if($.isEmptyObject(tmp)){
			continue;
		}else{
			musicDataArr.push(tmp);
		}
	}
	var historyMusicList = createHistoryMusicList(musicDataArr);
	json = {
		'date':date,
		'historyMusicList':historyMusicList
	};
	return json;
}

function createHistoryMusicList(data){
	var model = loadTemplate('#kw_historyMusicListModel');
	var html = drawListTemplate(data,model,proHistoryMusicListData);
	return html;
}

function proHistoryMusicListData(obj){
	var json = {};
	
	var musicName = checkSpecialChar(obj.songname,"disname");
	var artistName = checkSpecialChar(obj.artist,"disname");
	var artistClick = commonClickString(new Node(4,obj.artistid,checkSpecialChar(obj.artist,"name"),4));
	var num = '次数：'+obj.listen_num;
	var historyTagList = '';
	var tagsData = obj.tags.split(' ');
	
	for(var i=0; i<tagsData.length; i++){
		if(tagsData[i]==''){
			continue;
		}
		historyTagList+='<li>'+tagsData[i]+'</li>';
	}
	json = {
		'id':obj.rid,
		'musicName':musicName,
		'artistName':artistName,
		'aClick':artistClick,
		'num':num,
		'historyTagList':historyTagList
	};
	saveMusicInfo(obj,"playlist",'首页->为你推荐->私人口味(h)');
	return json;
}

function objBindFn() {
	$('.tabBox a').on('click',function(){
		if($(this).hasClass('active'))return;
		$('.tabBox a').removeClass('active');
		$(this).addClass('active');
		//取消显示暂无推荐
		$('.nodata').hide();
		$('.recommendTipsBox').hide();
		if($(this).parent().index()==0){
			$('.personalBox').show().removeClass('personalBoxActive');
			//$('.kw_music_list').html(discoverCache);
			$('.discoverBox').hide().addClass('discoverBoxActive');
			if(discoverNoData){
				$('.nodata').show();
			}
		}else{
			$('.personalBox').hide().addClass('personalBoxActive');
			//discoverCache = $('.kw_music_list').html();
			//$('.kw_music_list').html('');
			$('.discoverBox').show().removeClass('discoverBoxActive');
			if($('.singerListBox').html() == '' && $('.leftListBox').html() == '' && $('.recordContentWrap').html() == ''){
				getDiscovereData();
				getHistoryData();
			}
		}
	});
	
	//历史播歌方法
	$('.recordList .j_h_mname').live('click',function(){
		var rid = $(this).attr('data-rid');
		var playMusicString = MUSICLISTOBJ[rid];
	    if(rid&&playMusicString){
	        singleMusicOption("Play",playMusicString);
	        return;
	    }
		var songInfoUrl = 'http://rcm.kuwo.cn/rec.s?cmd=getrid&rid='+rid;
		$.ajax({
	        url:songInfoUrl,
			dataType:"text",
			type:"get",
			crossDomain:false,
			success:function(jsonStr){
				var data = eval('('+jsonStr+')');
				data.id = rid;
				saveMusicInfo(data,'playlist','首页->为你推荐->发现好歌');
				var playMusicString = MUSICLISTOBJ[rid];
			    if(rid&&playMusicString){
			        singleMusicOption("Play",playMusicString);
			    }
			}
	    });
	});
	//推荐理由的日志发送
	$('.discoverText a').live('click',function(){
		realTimeLog("RCM","TYPE:ReasonClick");
	});
	
	//听歌和下载第一次会出现相似推荐提示
	// $('.m_play, .m_down, .all_play, .all_down, .w_name').live('click',function (){
	// 	var cCache=getDataByCache("rcmContentfirstClick");
	// 	if(cCache==''){
	// 		$('.recommendTipsBox').show();
	// 		saveDataToCache("rcmContentfirstClick","hide",8640000000);
	// 	}else{
	// 		$('.recommendTipsBox').hide();
	// 		saveDataToCache("rcmContentfirstClick","hide",8640000000);
	// 	}
	// });

	// $(".music_wrap,.fixed_list li").live("dblclick", function(){
	// 	var cCache=getDataByCache("rcmContentfirstClick");
	// 	if(cCache==''){
	// 		$('.recommendTipsBox').show();
	// 		saveDataToCache("rcmContentfirstClick","hide",8640000000);
	// 	}else{
	// 		$('.recommendTipsBox').hide();
	// 		saveDataToCache("rcmContentfirstClick","hide",8640000000);
	// 	}
	// });

	$('.tipsClose').live('click',function (){
		$('.recommendTipsBox').hide();
		saveDataToCache("rcmContentfirstClick","hide",8640000000);
		return false;
	});
}

function toDou(n){
	return n<10?'0'+n:''+n;
}

function OnLogin(){
	getSomeData();
	//getDiscovereData();
	//getHistoryData();
}

function OnLogout(){
	getSomeData();
	//getDiscovereData();
	//getHistoryData();
}
