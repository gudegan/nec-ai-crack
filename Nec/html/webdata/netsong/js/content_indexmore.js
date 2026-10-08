$(function(){
	callClientNoReturn('domComplete');
	var url =decodeURIComponent(window.location.href);
	var msg = getUrlMsg(url);
	var name = url2data(msg,'name');
	var column_type = url2data(msg,'column_type');
	getSomeData(name,column_type);
	$("body").attr("data-csrc",getStringKey(msg,'csrc'));
	$('.content_indexmoreTitle').html(name);
});


function getSomeData(name,column_type){
	var url = '';
	switch(name){
		case '热门推荐':
			url = 'http://www.kuwo.cn/pc/index/playListMore';
			callRecommendFn(url);
			break;
		case '个性化推荐':
			var userInfo = getUserID('all');
			var uid = userInfo.uid;
			var kid = userInfo.kid;
			//url = 'http://60.28.195.115/rec.s?cmd=rcm_keyword_playlist&uid='+uid+'&devid='+kid+'&platform=pc';
			url = 'http://rcm.kuwo.cn/rec.s?cmd=rcm_keyword_playlist&uid='+uid+'&devid='+kid+'&platform=pc';
			callRcmFn(url);
			break;
		case '热门专栏':
			if(column_type != 'undefined'){
				url = 'http://www.kuwo.cn/pc/index/oldSpecialColumnMore?specialType='+column_type+'&pn=1';
				callContentColumnFn(url);
			}else{
				url = 'http://www.kuwo.cn/pc/index/specialColumnMore';
				callHotColumnFn(url);
			}
			break;
	}
	
}

//个性化推荐相关部分
function callRcmFn(url){
	$.ajax({
	    url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			var data = eval('('+data+')');
			createRcmPlaylist(data);
		},
		error:function(){
			loadErrorPage();
		}
	});
}

function createRcmPlaylist(data){
	var plArr = data.playlist;
	if(!plArr){
		loadErrorPage();
		return;
	}
	//模板样式(注意用用原生获取)
	var plModel = loadTemplate('#kw_pl120Model');
	var str = drawListTemplate(plArr,plModel,proRcmPlData);	
	$('.kw_plwrap').html(str);
	loadImages();

}


function proRcmPlData(obj){
	var json = {};
	var csrc = $("body").attr("data-csrc");
	//处理数据
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disname,"disname") || checkSpecialChar(name,"disname");
    var titlename = checkSpecialChar(disname,"titlename");
    var info = obj.info;
    var pic = obj.pic;
    var rcm_type=obj.rcm_type;
    var newreason=obj.newreason;
    var iplay = 'iPlay(arguments[0],8,'+obj.sourceid+',this);return false;';
    var reasonStr='';
	var ipsrc='猜你喜欢->' + disname+'(algorithm)' + '-<PID_'+obj.sourceid+';SEC_-1;POS_-1;DIGEST_8>';
	var other = '|from=indexmore(algorithm)|psrc=首页->猜你喜欢->|csrc='+csrc+'->'+name;

	var click = commonClickString(new Node(obj.source,obj.sourceid,name,obj.id,obj.extend,other));
	pic = changeImgDomain(pic);
	
	var rcm_class = '';
	var rcm_info_class = '';
	for(var i=0; i<newreason.length; i++){
    	switch(newreason[i].type){
    		case 'txt':
    			reasonStr+=''+newreason[i].desc;
    			break;
    		default:
    			reasonStr+=''+newreason[i].desc;
    			break;
    	}
    }
	if(reasonStr!=''){
		var des = '<p class="kw_rcmpldes" title="'+reasonStr+'">'+reasonStr+'</p>';
		rcm_class = 'kw_rcm_pl_box';
		rcm_info_class = 'kw_rcm_pl_info';
	}
	var al_flag = '';
	if(parseInt(obj.extend)){
		al_flag = '<span class="al_flag">无损</span>';
	}
	var listennum = obj.playcnt; 
    var listenStr  = '';
    if(listennum>100){
        if (listennum > 9999) {
            var n1 = parseInt(listennum / 10000,10);
            listenStr = '<span class="playcnt">' + n1 +'万</span>';
        } else {
            listenStr = '<span class="playcnt">' + listennum + '</span>';
        }
    }
	json={
		'name':name,
		'disname':disname,
		'titlename':titlename,
		'pic':pic,
		'click':click,
		'ipsrc':ipsrc,
		'des':des,
		'rcm_class':rcm_class,
		'rcm_info_class':rcm_info_class,
		'iplay':iplay,
		'al_flag':al_flag,
		'csrc':csrc+'->'+name,
		'listenStr':listenStr
	}
	
	return json;
}
//结束

//热门推荐部分部分
function callRecommendFn(url){
	$.ajax({
	    url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			if(data.lastIndexOf('"status":200')<0){
				return;
			}
			var data = eval('('+data+')');
			var plData = data.data.playList.list;
			createRecommendPlayList(plData);
		},
		error:function(){
			loadErrorPage();
		}
	});
}

function createRecommendPlayList(data){
	var model = loadTemplate('#kw_pl120Model');
	var htmlStr = drawListTemplate(data, model, proRecommendPlayListData);
	$('.kw_plwrap').html(htmlStr);
	loadImages();
}

function proRecommendPlayListData(obj){
	var csrc = $("body").attr("data-csrc");
	var json = {};
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var titlename = checkSpecialChar(disname,"titlename");
    var pic = obj.pic;
    var other = '|from=indexmore(editor)|psrc=首页->猜你喜欢->|csrc='+csrc+'->'+name;
    var click = commonClickString(new Node(obj.source,obj.sourceId,name,obj.id,obj.extend,other));
    var iplay = 'iPlay(arguments[0],8,'+obj.sourceId+',this);return false;';
    var ipsrc = '猜你喜欢->' + disname + '-<PID_'+obj.sourceId+';SEC_-1;POS_-1;DIGEST_8>';
    var plinfoClass='kw_rcmplinfo';
	pic = changeImgDomain(pic);
	var rnum = getStringKey(obj.extend,'MUSIC_COUNT');
	if(rnum>0){
		rnum = '<span class="r_num">+'+rnum+'</span>';
	}else{
		rnum = '';
	}
	var al_flag = '';
	if(getStringKey(obj.extend,'AL_FLAG')){
		al_flag = '<span class="al_flag">无损</span>';
	}
	json={
		'name':name,
		'disname':disname,
		'titlename':titlename,
		'pic':pic,
		'click':click,
		'ipsrc':ipsrc,
		'plinfoClass':plinfoClass,
		'rnum':rnum,
		'iplay':iplay,
		'al_flag':al_flag,
		'csrc':csrc+'->'+name
	}
	
	return json;
}
//热门推荐部分结束

//首页热门专栏部分
function callHotColumnFn(url){
	$.ajax({
	    url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			if(data.lastIndexOf('"status":200')<0){
				return;
			}
			var data = eval('('+data+')');
			var hotColumnData = data.data.specialColumn.list;
			var dataArr = [];
			for(var i=0; i<hotColumnData.length; i++){
				var key = getStringKey(hotColumnData[i].extend,'ORIGINAL_TYPE');
				if(key == 1){
					dataArr.push(hotColumnData[i]);	
				}
			}
			createhotColumnList(dataArr);
		},
		error:function(){
			loadErrorPage();
		}
	});
}

function createhotColumnList(data){
	//图文数据
	var picModel = loadTemplate('#kw_huodongModel');
	var htmlStr = drawListTemplate(data, picModel, proHotColumnData);
	$('.kw_plwrap').html(htmlStr);
	loadImages();
}

function proHotColumnData(obj){
	var json ={};
	var name = checkSpecialChar(obj.name,"name");
    var disname = checkSpecialChar(obj.disName,"disname") || checkSpecialChar(name,"disname");
    var titlename = disname;
    titlename = checkSpecialChar(titlename,"titlename");
    var source = obj.source || 51;
    var sourceId = obj.sourceId || obj.id;
    var click = commonClickString(new Node(source,sourceId,name,obj.id,obj.extend));
    var pic = obj.pic || obj.shareImg;
    if(pic!=""){
	    pic = changeImgDomain(pic);
    }
    
    json={
    	'name':name,
    	'disname':disname,
		'titlename':titlename,
		'pic':pic,
		'click':click
    };
    
    return json;
}
//首页热门专栏部分结束

// 专栏内容页更多专栏
function callContentColumnFn(url){
	$.ajax({
	    url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(data){
			if(data.lastIndexOf('"status":200')<0){
				return;
			}
			var data = eval('('+data+')');
			var hotColumnData = data.data.odlSpecialColumns;
			
			createhotColumnList(hotColumnData);
		},
		error:function(){
			loadErrorPage();
		}
	});
}
// 专栏内容页更多专栏结束