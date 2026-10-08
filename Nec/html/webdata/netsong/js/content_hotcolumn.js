var column_type = '';
var column_name = '';
var toolbarIsShow = 0;//是否显示全部播放等控制条区域
// 专栏插件
var isAllPlay = "false";
$(function(){
	callClientNoReturn('domComplete');
	var url = window.location.href;
	var msg=getUrlMsg(url);
	var id = url2data(msg,'sourceid');
	isAllPlay = url2data(msg,'playall');
	centerLoadingStart();
	getSomeData(id);
	//commentModel();// 专栏评论

	init_comment_model('.wrap750','z1',id);// 专栏评论
	objbind();
});

function getSomeData(id){
	var url = 'http://www.kuwo.cn/pc/index/specialColumnInfo?id='+id;
	$.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(jsonStr){
			if(jsonStr.lastIndexOf('"status":200')<0){
				loadErrorPage();
			}
			var data = eval('('+jsonStr+')');
			if($.isEmptyObject(data.data)){
				loadErrorPage();
				return;
			}
			//头部信息获取并创建
			var hotBannerData = data.data.specialColumn;
			createHotBanner(hotBannerData);
			//暴露专栏type和name
			column_type = hotBannerData.specialType;
			column_name = hotBannerData.name;
			$("body").attr("data-csrc","曲库->首页->热门专栏->"+column_name);
			setTimeout(function(){
				//除头图部分信息获取并创建
				var oherData = data.data.specialColumnTypes;
				callCreateOtherListFn(oherData);
				//往期专栏
				var prevColumnData = data.data.oldSpecialColumns;
				create_Column_Box(prevColumnData);
				if(toolbarIsShow){
					$('.toolbar').show();
				}
				loadImages();
				centerLoadingEnd();
			},50);
			
			
		},
		error:function(){
			loadErrorPage();
		}
    });
}

function createHotBanner(data){
	var dataArr = [];
	dataArr.push(data);
	var model = loadTemplate('#kw_hotBannerModel');
	var html = drawListTemplate(dataArr,model,proHotBannerData);
	$('.hotBannerBox').html(html);
	loadImages();
}

function proHotBannerData(obj){
	var json = {};
	var bannerPic = obj.pcHeadImg || 'img/def750.png';
	var editorImg = obj.editorImg || 'img/def30.png';
	var editorName = checkSpecialChar(obj.editorName,"disname");
	var shareDesc = checkSpecialChar(obj.shareDesc,"disname");
	json = {
		'bannerPic':bannerPic,
		'editorImg':editorImg,
		'editorName':editorName,
		'shareDesc':shareDesc
	};
	return json;
}

function callCreateOtherListFn(data){
	var TEXT = 0,
		PICSINGER = 1,
		SINGER = 2,
		SINGERTOPIC = 3,
		COMPILATION = 4,
		ALLMV = 5,
		DOUBLEMV = 6,
		BOTTOMRIGHT = 7,
		BOTTOMLEFT = 8,
		BOTTOMBOTTOM = 9,
		ARTIST = 10;
	var html = [];
	var count = 0;
	for(var i=0; i<data.length; i++){
		switch(parseInt(data[i].type)){
			case TEXT:
				html[count++] = create_Text(data[i]);
				break;
			case PICSINGER:
			case SINGER:
			case SINGERTOPIC:
				html[count++] = create_Singer_Box(data[i]);
				toolbarIsShow = 1;
				break;
			case COMPILATION:
				break;
			case ALLMV:
			case DOUBLEMV:
				var title = '';
				var list = create_All_MV(data[i].list);
				if(data[i].showName){
					title = data[i].showName;
				}
				if(title){
					var Box = '<div><h3>'+title+'</h3>'+list+'</div>';
				}else{
					var Box = '<div>'+list+'</div>';
				}
				if(list == ''){
					Box = '';
				}
				html[count++] = Box;
				break;
			case BOTTOMRIGHT:
			case BOTTOMLEFT:
			case BOTTOMBOTTOM:
				html[count++] = create_Bottom_Pic(data[i]);
				break;
			case ARTIST:
				html[count++] = create_Artist_Box(data[i]);
				break;
			default:
				break;
		}
	}
	
	$('.hotcontentBox').html(html.join(''));
	// 专栏插件
	if(isAllPlay=="true"){
		$(".all_play").click();
	}
}


function create_Text(data){
	var str = '';
	if(data.fontDesc){
		str = '<div class="aboutBox">'+data.fontDesc+'</div>';
	}
	return str;
}

function create_Singer_Box(data){
	var dataArr = [];
	dataArr.push(data);
	var model = loadTemplate('#kw_hotSingerBoxModel');
	var html = drawListTemplate(dataArr, model ,proSingerBoxData);
	html = '<div class="singerModelBox picModel">'+html+'</div>';
	return html;
}

function proSingerBoxData(obj){
	var json = {};
	var typename = checkSpecialChar(obj.showName,"disname");
	var musicListModel = loadTemplate('#kw_hotSingerModel');
	var musicListData = obj.list;
	if(obj.type == 3){//上榜单曲
		for(var i=0; i<musicListData.length; i++){
			musicListData[i].musictype = 'topic';
			musicListData[i].indexnum = i; 
		}
	}
	var musiclist = drawListTemplate(musicListData, musicListModel ,proSingerListData);
	var h3class = '';
	if(typename == ''){
		h3class ='hide';
	}
	json = {
		'h3class':h3class,
		'typename':typename,
		'musiclist':musiclist
	};
	return json;
}

function proSingerListData(obj){
	var json = {};
	var musicname = checkSpecialChar(obj.songName,"disname");
	var artistname = checkSpecialChar(obj.artist,"disname");
	var rid = obj.id;
	var artistClick = commonClickString(new Node(4,obj.artistId,checkSpecialChar(obj.artist,"name"),4));
	var pic = obj.pic;
	if(pic){
		pic = changeImgDomain(pic);
	}
	var psrc = '首页->热门专栏->'+column_name;
	var numicon = '';
	var musictype = obj.musictype;
	if(musictype == 'topic'){
		numicon = '<span class="num">'+(obj.indexnum+1)+'</span>'
	}
	var moneydown = getMoney(obj,"down");
	var moneydown = '';
	json = {
		'musicname':musicname,
		'artistname':artistname,
		'rid':rid,
		'pic':pic,
		'numicon':numicon,
		'aclick':artistClick,
		'moneydown':moneydown
	};
	saveMusicInfo(obj,'playlistNoMp4Sig',psrc);
	return json;
}

function create_All_MV(data){
	var model = loadTemplate('#kw_mvlistModel');
	var htmlStr = drawListTemplate(data, model, proAllMvData);
	return htmlStr;
}

function proAllMvData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var titlename = checkSpecialChar(disname,"titlename");
    var info = obj.inFo;
	var pic = obj.pic;
    var psrc = encodeURIComponent('VER=2015;FROM=曲库->首页->热门专栏->'+column_name);
    var csrc = '曲库->首页->热门专栏->'+column_name;
    var formats = '';
    var param = obj.playParam;
    var datamv = '';
    // var mvinfoArr = [];
    // var count = 0;
	var mvString = '';
	if(param!=""){
		param = returnSpecialChar(param);
		var paramArray = param.split(";");
		var childarray = [];
		childarray[0] = encodeURIComponent(returnSpecialChar(name));
		var artist = obj.artist;
		childarray[1] = encodeURIComponent(returnSpecialChar(artist));
		var album = paramArray[2];
		childarray[2] = encodeURIComponent(returnSpecialChar(album));
		for(var j=3;j<paramArray.length;j++){
			childarray[j] = paramArray[j];
		}
		childarray[childarray.length] = psrc;
		childarray[childarray.length] = obj.formats;
		childarray[childarray.length] = getMultiVerNum(obj);
		childarray[childarray.length] = getPointNum(obj);
		childarray[childarray.length] = getPayNum(obj);
		childarray[childarray.length] = getArtistID(obj);
		childarray[childarray.length] = getAlbumID(obj);
		mvString = childarray.join('\t');
		childarray = null;
		var mvridnum = paramArray[11];
		if(mvridnum.indexOf("MKV")>-1){
			mvridnum = mvridnum.substring(4);
		}else if(mvridnum.indexOf("MV")>-1){
			mvridnum = mvridnum.substring(3);
		}
		var musicridnum = paramArray[5];
		if (musicridnum) {
			if(musicridnum.indexOf("MUSIC")>-1) musicridnum = musicridnum.substring(6);
		}
		mvString = encodeURIComponent(mvString);
	}
    datamv = mvString;
    MVLISTOBJ[MVLISTOBJ.length] = mvString;
    MVLISTOBJECT[MVLISTOBJECT.length] = obj;
	pic = getMVPic(pic);
    
    json = {
    	'name':name,
    	'mvinfo':datamv,
    	'mvna':name,
    	'pic':pic,
    	'csrc':csrc
    }
    return json;
}

function create_Bottom_Pic(data){
	var str = '';
	var img = data.imgUrl;
	var desc = data.fontDesc;
	var imgclass = '';
	if(desc!=''){
		imgclass = 'mb20';
	}
	if(img!=''){
		img = changeImgDomain(img);
		str = '<div class="bottomPicBox"><img clss="'+imgclass+'" src="'+img+'" onerror="(this,520);" />'+desc+'</div>';
	}
	return str;
}

function create_Artist_Box(data){
	var dataArr = [];
	dataArr.push(data);
	var model = loadTemplate('#kw_artistBoxModel');
	var html = drawListTemplate(dataArr, model ,proArtistBoxData);
	html = '<div class="relatedSingerBox">'+html+'</div>';
	return html;
}

function proArtistBoxData(obj){
	var json = {};
	var typename = checkSpecialChar(obj.showName,"disname");
	var artistListModel = loadTemplate('#kw_artistModel');
	var artistListData = obj.list;
	var artistlist = drawListTemplate(artistListData, artistListModel ,proArtistListData);
	json = {
		'typename':typename,
		'artistlist':artistlist
	};
	return json;
}

function proArtistListData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"disname");
	var titlename = checkSpecialChar(obj.name,"titlename");
	var click = commonClickString(new Node(4,obj.artistId,name,4));
	var iPlay = 'iPlay(arguments[0],4,'+obj.artistId+',this);return false;';
	var ipsrc = '首页->热门专栏->'+column_name;
	var pic = obj.imgUrl;
	if(pic){
		pic = changeImgDomain(pic);
	}
	var num = obj.total+'首歌曲';
	
	json = {
		'name':name,
		'titlename':titlename,
		'click':click,
		'iPlay':iPlay,
		'ipsrc':ipsrc,
		'pic':pic,
		'num':num
	};
	return json;
}

function create_Column_Box(data){
	var model = loadTemplate('#kw_huodongModel');
	var html = drawListTemplate(data, model ,proColumnData);
	var columnType = column_type;
	var moreClick = 'commonClick({\'source\':\'1001\',\'column_type\':'+columnType+',\'name\':\'热门专栏\'});'
	html ='<div class="clearfix"><h3>往期专栏</h3><a class="more" href="javascript:;" hidefocus onclick="'+moreClick+'">更多</a></div><ul>'+html+'</ul>';
	$('.prevColumnBox').html(html);
}

function proColumnData(obj){
	var json = {};
	var name = checkSpecialChar(obj.name,"disname");
	var titlename = checkSpecialChar(obj.name,"titlename");
	var click = commonClickString(new Node(51,obj.id,name,51));
	var pic = obj.shareImg;
	if(pic){
		pic = changeImgDomain(pic);
	}
	
	json = {
		'name':name,
		'titlename':titlename,
		'click':click,
		'pic':pic
	};
	return json;
}

//本页面相关操作
function objbind(){
	$('.musicListBox .i_play').live('click',function(){
		$(this).parents('.musicList').find('.j_mname').click();
	});
}
