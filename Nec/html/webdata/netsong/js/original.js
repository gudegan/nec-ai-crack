var originalObj;
var currObj;
var scroll;
var bottomLoadingObj;
var bottomLoadingObj0;
var centerLoadingObj;
var centerLoadingObj0;
var getbottomObj;
var flowcontentObj;
var currentTagId;
var mJson = null;

window.onload = function (){
	callClientNoReturn('domComplete');
    //var json = fobj.goldjson;
	originalObj = $(".original_common");
    currObj = originalObj;
    centerLoadingStart("content");
    wonload();
    someOriginal();
};

// 进入原创
function someOriginal() {
	var url = 'http://album.kuwo.cn/album/OriginalIndexServlet?callback=getOriginalData';
	//getScriptData(url);
	//$.getScript(url);
	$.ajax({
		url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(str){
			var jsondata=eval('('+str+')');
			getOriginalData(jsondata);
		}
	});
}

//原创数据加载成功
function getOriginalData(jsondata) {
	var data		= jsondata;
	var focusSLD	= data.indexPic;     //焦点图数据
	var randomSLD	= data.randomSongs;  //随机播放数据
	var newSLD		= data.latestSong;   //最新推荐列表数据
	var hotSLD		= data.hotShows;     //热门列表数据
	var columnSLD	= data.columnList;   //原创栏目块块数据
	createFocus(focusSLD);
	createNewSongList(newSLD);
	createHotSongList(hotSLD);
	createOrifinalList(columnSLD);
	originalObj.show();
	centerLoadingEnd("content");
	iframeObj.refresh();
}


//创建焦点图
function createFocus(jsondata){
	var data   = jsondata;
	if(data.length<1) return '';
	var obj;
	var arr    = [];
	var btnarr = [];
	var bClass = '';
	var len    = data.length;
	var columnId; 	//栏目ID
	var pic;		//焦点图URL
	var name;		//栏目名称tips
	var click;
	for(var i=0; i<len; i++){
		obj 	 = data[i];
		pic      = obj.picUrl;
		name	 = obj.tplstName;
		columnId = obj.columnId;
		click    = commonClickString(new Node('-201', columnId, name, columnId, '', ''));
		arr[arr.length] = '<li style="z-index:'+-i+'"><a href="###" hidefocus title="'+name+'" onclick="'+click+'">';
		arr[arr.length] = '<img onerror="this.onerror=null;this.src=\'img/def450.jpg\'" src="'+pic+'" alt="" title="'+name+'" width="450" height="120"/>';
		arr[arr.length] = '</a></li>';
		bClass = ''; if(i==0) bClass = 'current';
		btnarr.push('<a href="###" hidefocus title="'+name+'" class="'+bClass+'"></a>');
	}
	var focusStr = arr.join('');
	var focusObj = $(".original_focus");
	focusObj.find("ul").html(focusStr);
	focusObj.find(".buttonicon").html(btnarr.join(''));
	starMoveFocus(focusObj);
}

//焦点图
function starMoveFocus(obj){
	var timer  = null;
	var aImgs  = obj.find("ul li");
	var oBtn   = obj.find(".buttonicon a");
	var oNext  = obj.find(".or_next");
	var oPre   = obj.find(".or_prev");
	var now    = 0;
	var zIndex = 11;

	oBtn.live("mouseenter",function(){
		if($(this).attr("class") == 'current') return;
		clearInterval(timer);
		now = $(this).index();
		tab();
		return false;
	});

	obj.live("mouseover",function(){
		oNext.show();
		oPre.show();
		clearInterval(timer);
		return false;
	});

	obj.live("mouseleave",function(){
		oNext.hide();
		oPre.hide();
		timer = setInterval(next,5000);
		return false;
	});

	oNext.live("click",next);
	oPre.live("click",prev);

	function next(){
		now ++;
		if(now > aImgs.size() - 1) now = 0;
		tab();
	}
	
	function prev(){
		now--;
		if(now < 0) now = aImgs.size() - 1;
		tab();
	}
	
	function tab(num){
		oBtn.removeClass("current").eq(now).addClass("current");
		zIndex ++;
		aImgs.eq(now).attr("style","z-index:"+ zIndex);
		aImgs.eq(now).hide();
		aImgs.eq(now).fadeIn();
	}
	timer = setInterval(next,5000);
}

//创建最新列表数据
function createNewSongList(jsondata) {
    var data 		   = jsondata;
    var newSongListObj = $("#newSongList ul");
    var newSongListStr = createCommonList(data,'最近更新',true);
    newSongListObj.html(newSongListStr);
}



//创建热门新列表数据
function createHotSongList(jsondata) {
    var data 		   = jsondata;
    var hotSongListObj = $("#hotSongList ul");
    var hotSongListStr = createCommonList(data,'热播排行',false);
	hotSongListObj.html(hotSongListStr);
}



//创建频道列表方法
function createCommonList(jsondata,currKuaiName,isJump) {
    var data = jsondata;
    var arr = [];
    var xia = 0;
    var num = 0;
    var obj;
	var musicId;		//歌曲ID
    var tagName;        //标签名字
    var bgColor;        //标签颜色
    var lmName;         //显示名
    var name;           //标题名（歌曲名）
    var commentNum;     //评论数
	var shareNum;		//分享数
    var params;         //播歌信息
	var paramsStr;		//播歌信息
    var columnId;       //栏目ID
	var formats;		//歌曲格式
    var topNum;
    var extend2;        
    var click;
    var csrc;
    for (var i = 0; i < data.length ; i++) {
        obj 		  = data[i]; if (obj == '' || !obj) continue;
        num ++;
        tagName       = obj.tplstTag; if (!tagName) tagName = '其他';
		name          = obj.name;
        lmName        = obj.tplstName;
		musicId       = obj.id;
        commentNum    = obj.commentCount;
		shareNum	  = obj.shareCount;
        bgColor       = obj.tplstTone;
		formats		  = obj.formats;
		psrc	 	  = '曲库->首页->分类->原创电台->'+currKuaiName+'->'+lmName;
		csrc	 	  = '曲库->首页->酷我原创->'+currKuaiName+'->'+lmName+'->'+name;
		params        = obj.params;
		params		  = getParams(params,formats,psrc,obj)+"&CSRC="+encodeURIComponent(csrc);
		columnId      = obj.columnId;
        extend2       = {};
        click         = commonClickString(new Node('-201', columnId, lmName, columnId, '', ''));
        topNum        = ''; if (num <= 3) topNum = 'topnumber';
        
		arr[xia++] = '<li class="clearfix toplist or_music_list" data-music="' + params + '" data-musicId="' + musicId + '" title="'+name+'">';
        arr[xia++] = '<span class="number '+topNum+'">';
        arr[xia++] = num + '</span>';
        arr[xia++] = '<span class="icon" style="background:' + bgColor + '">' + tagName + '</span>';
        arr[xia++] = '<span class="fm_name"><a href="###" hidefocus onclick="singleMusicOption(\'SpotsPlay\', \''+params+'\'); ';
        arr[xia++] = '">' + name + '</a></span>';
        arr[xia++] = '<span class="listen mrt10"><a href="###" hidefocus title="播放歌曲" class="play"></a></span>';
        arr[xia++] = '<span class="sh mrl38"><a href="###" hidefocus class="share">分享</a> (<font class="commnum">' + shareNum + '</font>)';
		arr[xia++] = '</span>';
        arr[xia++] = '</li>';
    }
    return arr.join('');
}


//创建原创块块
function createOrifinalList(jsondata){
    var data    = jsondata;
    var arr     = [];
    var xia     = 0;
    var num     = 0;
    var mr      = 0;
    var obj;
    var tplstName;        //标题
	var shortDescName;    //副标题    
	var anchorName;       //主播
    var pic;              //栏目图片
    var songListStr;      //栏目歌曲
    var songCount;        //栏目期数
    var columnId;         //栏目ID
    var update;           //更新日期
    var extend2;
    var click;
	
    for (var i=0; i<data.length; i++) {
        obj = data[i]; if (obj == '' || !obj) continue;
        num ++;
        mr             = (num % 2)*40 + 'px';
		pic            = obj.tplstPCSmallPic; if(!pic || pic == "null") pic = 'img/original/lanmu_img.jpg';
        tplstName      = obj.tplstName;
        shortDescName  = obj.tplstShortDesc;
        if(shortDescName.length>16){
            shortDescName = shortDescName.substr(0,16);
        }
        columnId       = obj.columnId;
        update         = obj.tplstUpdatename;
        songCount      = obj.songCount;
		artist	   	   = createArtist(obj.anchorsList);
        songListStr    = createColumnSongList(obj.columnSongList,tplstName);
        click          = commonClickString(new Node('-201', columnId, tplstName, columnId , '' , ''));
        arr[xia++] = '<div class="lanmu" style="margin-right:' + mr + '">';
        arr[xia++] = '<h4><span title="'+shortDescName+'">' +shortDescName+ '</span><a href="###" hidefocus title="" onclick="';
		arr[xia++] = click;
		arr[xia++] = '">'+ tplstName + '</a></h4>';
        arr[xia++] = '<div class="lm"><div class="top clearfix"><div class="lml"><div>';
        arr[xia++] = '<a href="###" hidefocus title="" onclick="';
		arr[xia++] = click;
		arr[xia++] = '">';
        arr[xia++] = '<img src="' + pic + '" alt="" width="160" height="90"></a>';
        arr[xia++] = '<font class="tips">'+update+'</font>';
        arr[xia++] = '</div></div>';
        arr[xia++] = '<div class="lmr" style="float:left;">';
        arr[xia++] = '<p class="zb" style="width:43px;">主播：</p>';
        arr[xia++] = '<p>'+artist+'</p>';
        arr[xia++] = '</div></div>';
        arr[xia++] = '<ul>' + songListStr + '</ul>';
        arr[xia++] = '<p class="enter"><a href="###" title="进入栏目" hidefocus onclick="';
        arr[xia++] = click;
        arr[xia++] = '">进入栏目&gt;&gt;</a>已更新' + songCount + '期</p>';
        arr[xia++] = '</div></div>';
    }
    var columnListObj = $("#orLmWarp");
    var columnListStr = arr.join('');
    columnListObj.html(columnListStr);
}

//创建原创栏目歌曲列表
function createColumnSongList(jsondata,tplstName){
	var data = jsondata;
	var arr = [];
	var xia = 0;
	var num = 0;
	var obj;
	var rid;
	var name;       	//歌曲名
	var album;			//专辑名
	var artist;			//歌手名		
	var params;         //播歌信息
	var formats;
	var psrc;
	var tips;
	var csrc;
	
	for (var i = 0; i < data.length; i++){
		obj 	 = data[i];
		rid      = obj.id;
		name 	 = obj.name;
		album	 = obj.album;
		artist	 = obj.artist;	
		psrc	 = '曲库->首页->分类->原创电台->原创栏目->'+tplstName+'->列表';	
		csrc	 = '曲库->首页->酷我原创->'+album+'->'+name;	
		formats  = obj.formats;
		params   = obj.params;
		params   = getParams(params,formats,psrc,obj)+"&CSRC="+encodeURIComponent(csrc);
		tips 	 = name;

		arr[xia++] = '<li id="music'+rid+'" class="or_music_list" c-rid="'+rid.replace("music","")+'" data-music="' + params + '" data-rid="'+rid+'" title="'+tips+'">';
		arr[xia++] = '<span class="mu_name"><a href="###" hidefocus onclick="singleMusicOption(\'Play\', \''+params+'\');">' + name + '</a></span>';
		arr[xia++] = '<span class="listen mrt2 mrr10"><a href="###" hidefocus title="播放歌曲" class="play"></a></span>';
		arr[xia++] = '<span class="add mrt2 mrr10"><a href="###" hidefocus title="添加歌曲" class="add"></a></span>';
		arr[xia++] = '<span class="down mrt2"><a href="###" hidefocus title="下载歌曲" class="down"></a></span>';
		arr[xia++] = '</li>';
	}
	return arr.join('');
}	
//创建主播列表
function createArtist(jsondata){
	var data = jsondata; if(data == "null") return '';
	var obj;
	var artistName;
	var artistId;
	var click;
	var artistStr = ''; 
	for(var i=0; i<data.length; i++){
		obj	  		= data[i];
		artistName  = obj.name;
		artistId    = obj.id;
		click 		= commonClickString(new Node(4,artistId,artistName,4,'',''));
		artistStr  += '<a href="###" hidefocus title="'+artistName+'" onclick="'+click+'">'+artistName+'</a>'; if(i==0 && data.length>1) artistStr += '&amp'
	}
	return artistStr;
}
