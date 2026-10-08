var originalObj;
var currObj;
var currNodeObj;
var scroll;
var bottomLoadingObj;
var bottomLoadingObj0;
var centerLoadingObj;
var centerLoadingObj0;
var getbottomObj;
var flowcontentObj;
var currentTagId;
var mJson = null;
var columnId = 0;
var isjumpSpeak;
var isRefresh;
var currentName;
var oldurl=decodeURIComponent(window.location.href).split('?')[0];
var oldmsg='';

window.onload = function () {
	callClientNoReturn('domComplete');
    //var json = fobj.goldjson;
	//currentName = json.name;
	var url=decodeURIComponent(window.location.href);
	var msg=getUrlMsg(url);
	oldmsg=msg;
	currentName = url2data(msg,'name');
    originalObj = $(".original_common");
    currObj = originalObj;
    $("body").attr("data-csrc","曲库->首页->酷我原创->"+getValue(msg,"name"));
    centerLoadingStart("content");
    wonload();
    someOriginalContent();
};

// 进入原创内容页
function someOriginalContent() {
	// columnId    = nodeobj.id;
	// currNodeObj = nodeobj;
	columnId = url2data(oldmsg,'id');
    //var url = 'http://album.kuwo.cn/album/OriginalColumnServlet?columnId='+columnId+'&callback=getOriginalContentData';
	//getScriptData(url);
	var url = 'http://album.kuwo.cn/album/OriginalColumnServlet?columnId='+columnId;
	$.ajax({
		url:url,
		dataType:"jsonp",
		crossDomain:false,
		success:function(json){
			getOriginalContentData(json);
		}
	});
}

//原创数据加载成功
function getOriginalContentData(jsondata) {
    var data 		  = jsondata;
    var focusSLD      = data.indexPics;      //焦点图数据
    var newSLD        = data.newSongs;       //最新推荐列表数据
    var hotSLD        = data.hotShows;       //热门列表数据
    var recomSLD      = data.recomShows;     //推荐块块数据
	var artists		  = data.artists;		 //主播
	var topticName    = data.topticName;	 //话题名称
	var topticTitle   = data.topticTitle;	 //副标题
	var topticContent = data.topticContent;	 //征集内容
	var name		  = data.name;		     //栏目名
	var recomText	  = data.recomText;		 //推荐块块标题名字
	var moreGedanId	  = data.newSongLmgdId;
	var moreGedanName = data.newSongLmgdName;
	$(".bread span").html(name);
    createNewSongList(newSLD,moreGedanId,moreGedanName);
    createHotSongList(hotSLD);
    createTuijianList(recomSLD,recomText);
	createTopKuai(focusSLD,artists,topticTitle,topticName);
	originalObj.show();
	centerLoadingEnd("content");
	iframeObj.refresh();
}

//创建频道页头部
function createTopKuai(focusdata,artists,txt,tit){
	var pic         = 'img/original/banner.jpg';
	if (focusdata) pic = focusdata[0].picurl; 						//头图
	var artistsdata = artists;										//主播信息			
	var txt = txt;		    								//标语	
	var topFocusObj = $(".top_focus");				//头部模块
	var focusPicObj = $(".original_focus");			//焦点图模块
	var artistObj 	= $(".hostwrap");		   		//主播模块
	var titTxtObj 	= $(".title");					//标语
	var noPicCookie = true;											//图片是否有缓存
	
	//焦点图信息
	topFocusObj.find('.pic img').attr("src",pic);
	topFocusObj.find('.pic img').load(function(){
		noPicCookie = false;
		$(this).show();
	});
	if(noPicCookie) topFocusObj.find('.pic img').show();

	//标语
	if(txt && tit){
		titTxtObj.find('h1 font').html(tit+'：'+txt);
		//titTxtObj.show();		
	}
	
	//主播信息
	artistObj.find(".host").hide();
	
	for (var i = 0; i < Math.min(artistsdata.length,2); i++) {
		var obj 	    = artistsdata[i];
		var artistPic   = obj.picurl;
		var artistId    = obj.id;
		var artistName  = obj.name;
		var artistFans  = obj.fansCount;
		var click	    = commonClickString(new Node(4, artistId, artistName, 4));
		var artistStr   = '<a href="###" hidefocus="true" title="'+artistName+'" onclick="'+click+'">'+artistName+'</a>'
		var noPicCookie = true;	
		artistObj.find(".host img").eq(i).attr("src",artistPic);
		artistObj.find(".host img").eq(i).load(function(){
			noPicCookie = false;
			$(this).show();
		});
		if(noPicCookie) artistObj.find(".host img").eq(i).show();
		artistObj.find(".host .like").eq(i).attr("data-artistid",artistId);		
		artistObj.find(".host .fans").eq(i).find("font").html(artistFans);
		artistObj.find(".host .name").eq(i).html(artistStr);
		artistObj.find(".host .artistPic").click(function(){$(this).next().find("a").click();});
		artistObj.find(".host").eq(i).show();
	}
	
	//喜欢信息
	// showLike2("get","ARTIST");
	topFocusObj.show();
	artistObj.show();
}

//创建最新列表数据
function createNewSongList(jsondata,moreId,moreName) {
    var data = jsondata; 
	var titObj = $("#newSongList h1");
	var click = commonClickString(new Node(8,moreId,moreName,0,'','|csrc=曲库->分类->原创电台->'+currentName+'|psrc=分类->原创电台->|bread=-2,5,分类,-2;33,0,原创电台,87045'));	 
    var newSongListStr = createCommonList(data,'new');
    $("#newSongList").show().find("ul").html(newSongListStr);
	titObj.append('<a href="###" hidefocus="true" onclick="'+click+'">更多</a>')
}


//创建热门新列表数据
function createHotSongList(jsondata) {
    var data = jsondata;
	if(!data||data ==''||data=='null'){
		return;
	}
    var hotSongListObj = $("#hotSongList");
    var hotSongListStr = createCommonList(data,'hot');
    hotSongListObj.show().find("ul").html(hotSongListStr);
}



//创建频道列表方法
function createCommonList(jsondata,type){
    var data = jsondata;
	var type = type;
    var arr  = [];
    var xia  = 0;
    var obj;
	var rid;			//歌曲ID
	var name;			//歌曲名
	var album;			//专辑名
	var artist;			//歌手名
	var songDate;		//栏目日期
	var tClass;			//展现样式
	var score100;		//热度
	var params;
	var formats;
	var psrc;
	var tips;
	var level;
	var HDClass;
	
    for (var i = 0; i < data.length ; i++) {
        obj = data[i];
		if (obj == '' || !obj) continue; 
		if(type=='new'){
			tClass 		 = 'time';
			currKuaiName = '最近更新';
		}
		if(type=='hot'){
			tClass 		 = 'num topnum';
			currKuaiName = '热播排行';
		}	
		rid      = obj.id;
		name 	 = obj.name;
		artist	 = obj.artist;
		album	 = obj.album;		
		songDate = obj.date;
		score100 = obj.score100;
		if(!score100 || score100==null||score100==""||score100==0){
			score100 = "width:6px";
		}else{
			var scoreNum = parseInt(score100,10);
			var scoreNum = scoreNum*0.4;
			score100 = "width:"+scoreNum+"px";
		}
		if(!songDate){
			songDate = i+1;
			if(i >2) songDate = '<font style="color:#c0bebe;">'+(i+1)+'</font>';
		}
		formats  = obj.formats;
		params   = obj.params;
		//psrc	 = '曲库->首页->分类->原创电台->'+ currNodeObj.name +'->'+currKuaiName;
		psrc	 = '曲库->首页->分类->原创电台->'+ currentName +'->'+currKuaiName;
		var csrc = '曲库->首页->酷我原创->'+ currentName +'->'+currKuaiName+'->'+name;
		params   = getParams(params,formats,psrc,obj)+'&CSRC='+encodeURIComponent(csrc);
		level	 = getHqLevel(formats);
		tips 	 = getMusicTips(name,artist,album);		
		HDClass  = '';
		if(level>=2 && level<=3) HDClass = 'hd' + level;
        arr[xia++] = '<li class="clearfix or_music_list" data-music="'+params+'" data-mdcode="'+formats+'" c-rid="'+rid.replace("music","")+'" data-musicId="'+rid+'" title="'+name+'">';
        arr[xia++] = '<span class="'+tClass+'"><em>'+songDate+'</em></span>';
		arr[xia++] = '<span class="m_name"><a href="###" hidefocus="true" onclick="singleMusicOption(\'SpotsPlay\', \''+params+'\');">'+name+'</a></span>';
		// arr[xia++] = '<span class="ihd"><span class="'+HDClass+'"></span></span>';
		arr[xia++] = '<div class="hot"><em style="'+score100+'"></em></div>';
		arr[xia++] = '<span class="listen mrt2 mrr10"><a href="###" hidefocus="true" title="播放歌曲" class="play"></a></span>';
		arr[xia++] = '<span class="add mrt2 mrr10"><a href="###" hidefocus="true" title="添加歌曲" class="add"></a></span>';
		arr[xia++] = '<span class="down mrt2 mrr10"><a href="###" hidefocus="true" title="下载歌曲" class="down"></a></span>';
		arr[xia++] = '<span class="share mrt2 mrr10">';
		arr[xia++] = '<a href="###" hidefocus="true" title="分享歌曲" class="share"></a>';
		arr[xia++] = '</span>';
		arr[xia++] = '<span class="more1 mrt2"><a href="###" hidefocus="true" title="更多操作" class="more"></a></span>';
		arr[xia++] = '</li>';
    }
    return arr.join('');
}



//创建推荐块块
function createTuijianList(jsondata,tit) {
    var data = jsondata;
    if (data.length < 1) return;
    var arr     = [];
    var num     = 0;
    var mr      = 0;
    var obj;
	var source;		
	var sourceid;
	var name;			  //标题
	var disname;
	var titlename;
	var tplstName;        //副标题
    var anchorName;       //主播
    var pic;              //栏目图片
    var songListStr;      //栏目歌曲
    var songCount;        //栏目期数
    var update;           //更新日期
    var click;
    for(var i=0; i<data.length; i++){
		obj = data[i];
		source = obj.recomType; 
		if (source != 8) continue;
		sourceid = obj.recomID;
		name = obj.name;
		disname = checkSpecialChar(obj.disname,"disname") || checkSpecialChar(name,"disname");
		titlename = checkSpecialChar(disname,"titlename"); 		
		pic = obj.picurl;
		var click = commonClickString(new Node(source,sourceid,name,0,'','|csrc=曲库->分类->原创电台->'+name+'|psrc=分类->原创电台->|bread=-2,5,分类,-2;33,0,原创电台,87045'));
		arr[arr.length] = '<li class="b_wrap"><a onclick="';
		arr[arr.length] = click;
		arr[arr.length] = '" title="';
		arr[arr.length] = titlename;
		arr[arr.length] = '" class="b_pic" href="###" hidefocus><span class="b_shade"></span><img width="100" height="100" src="';
		arr[arr.length] = pic;
		arr[arr.length] = '" /></a><p class="b_name"><a onclick="';
		arr[arr.length] = click;
		arr[arr.length] = '" title="';
		arr[arr.length] = titlename;
		arr[arr.length] = '" href="###" hidefocus>';
		arr[arr.length] = disname;
		arr[arr.length] = '</a></p></li>';
    }
	var titName = tit || '节目歌曲推荐';
    var tuijianListStr = arr.join('');
    $("#tuijian").html(tuijianListStr).parent().show().find("h1").html(titName);
}
function scrollRefresh(){
    $(window.parent.document).find("#frame_content").height($("body").eq(0).height());
}

//创建原创栏目歌曲列表
function createColumnSongList(jsondata){
    var data = jsondata;
    var arr = [];
    var xia = 0;
    var num = 0;
    var obj;
    var name;       	//歌曲名
    var params;         //播歌信息
	var formats;

    for (var i = 0; i < data.length; i++) {
        obj 	 = data[i];
        name	 = obj.name;
		formats  = obj.formats;
        params   = obj.params;
		params   = getParams(params,name,formats,obj);
        arr[xia++] = '<li data-music="' + params + '">';
        arr[xia++] = '<span class="mu_name"><a href="###" hidefocus="true" title="' + name + '">' + name + '</a></span>';
        arr[xia++] = '<span class="listen"><a href="###" hidefocus="true" title="播放歌曲" class="play"></a></span>';
        arr[xia++] = '<span class="add"><a href="###" hidefocus="true" title="添加歌曲" class="add"></a></span>';
        arr[xia++] = '<span class="down"><a href="###" hidefocus="true" title="下载歌曲" class="down"></a></span>';
        arr[xia++] = '</li>';
    }
    return arr.join('');
}
