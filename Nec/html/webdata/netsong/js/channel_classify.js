var currentObj={};
window.onload = function () {
	var url1=decodeURIComponent(window.location.href);
	var ver = getVersion();
	try{
    	var regVer = /^MUSIC_(.{7})./,
        	verNumberNow = regVer.exec(ver)[1];
	}catch (e){
	    console.error('get version Reg error');
	}
	var uid = getUserID('uid');
	var ajaxUrl = 'http://www.kuwo.cn/www/categoryNew/indexData?user='+uid+'&prod=kwplayer_pc_'+ver+'&vipver='+verNumberNow+'&source=kwplayer_pc_'+ver;
    // param=url1.substring(url1.indexOf('{'),url1.lastIndexOf('}')+1);
    // if(param!='')OnJump(param);
    callClientNoReturn('domComplete');
	centerLoadingStart("content");
	//currentObj = fobj.goldjson;
	var classifyChannelData = getDataByCache('classify-channel');
	if(classifyChannelData){
		try{
			var jsondata = $.parseJSON(classifyChannelData);
			if(JSON.stringify(jsondata.data) == "{}"){
				$.ajax({
					url:ajaxUrl,
					type:"get",
					dataType:"json",
					success:function(json){
						getClassifyListData(json);
						saveDataToCache('classify-channel',obj2Str(json),3600);
					}
				});
			}else{
				getClassifyListData(jsondata);
			}
		}catch(e){
			$.ajax({
		        url:ajaxUrl,
		        type:"get",
	        	dataType:"json",
				success:function(json){
					getClassifyListData(json);
					saveDataToCache('classify-channel',obj2Str(json),3600);
				}
		    });
		}
	}else{
		//getScriptData(url);
		var d = new Date();
        var time = d.getYear()+d.getMonth()+d.getDate()+d.getHours()+parseInt((d.getMinutes()/20));
        time = ''+d.getYear()+d.getMonth()+d.getDate()+time;
        ajaxUrl = ajaxUrl+"&ttime="+time;
        var classifystrattime=new Date().getTime();
		$.ajax({
	        url:ajaxUrl,
	        type:"get",
	        dataType:"json",
			success:function(json){
				var endtime=new Date().getTime()-classifystrattime;
                realTimeLog("WEBLOG","url_time:"+endtime+";"+"qukutree"+";"+ajaxUrl);
                realShowTimeLog(ajaxUrl,1,endtime,0,0);
				getClassifyListData(json);
				saveDataToCache('classify-channel',obj2Str(json),3600)
			},
			error:function(xhr){
                var endtime=new Date().getTime()-classifystrattime;
                loadErrorPage();
                var httpstatus = xhr.status;
                if(typeof(httpstatus)=="undefined"){
                    httpstatus = "-1";
                }
                var sta = httpstatus.toString();
                realTimeLog("WEBLOG","url_error:"+sta+";qukutree;"+ajaxUrl);
                webLog("请求失败,url:"+ajaxUrl);
                realShowTimeLog(ajaxUrl,0,endtime,sta,0);
            }
	    });
	}
};

$(window).resize(function() {
	setTagWidth();
	iframeObj.refresh();
});
function getClassifyListData(jsondata) {
	var child = jsondata.data||[];
	var len = child.length;
	var arr = [];
	var xia = 0;
	for (var i = 0; i < len; i++) {
		var obj = child[i];
		var id = obj.id;
		var classifyList = obj.data||[];
		var classifyLen = classifyList.length;
		if (classifyLen < 1) continue;
		arr[xia++] = '<div class="classify_wrap"><div class="c_c">';
		arr[xia++] = '<div class="cc_l"><div class="c_pic"><img onerror="imgOnError(this,60);" width="60" height="60" src="';
		arr[xia++] = obj.img;
		arr[xia++] = '"></div></div><div class="cc_r">';
		var classifyarr = [];
		for (var j = 0; j < classifyLen; j++ ) {
			var cObj = classifyList[j];
			// var source = cObj.source;
			// if (source != 40 && source != 5 && id!=257335) continue;
			var name = cObj.name;
			var oClass = '';
			var csrc = id==68?"曲库->分类->"+name+'专区':"曲库->分类->"+name;
			var other = '|psrc=分类->|csrc='+csrc+'|bread=-2,5,分类,-2';
			var digest = cObj.digest;
			var sourceId = cObj.id;
			var from = 'area';
			if(digest=="10000"){
				from='classifyTag';
				digest='40';
			}
			var click = commonClickString(new Node(digest,sourceId,name,sourceId,cObj.extend,other,from));
			classifyarr[classifyarr.length] = '<span class="pt3"><a href="###" hidefocus onclick="';
			classifyarr[classifyarr.length] = click;
			classifyarr[classifyarr.length] = '" title="';
			classifyarr[classifyarr.length] = name;
			classifyarr[classifyarr.length] = '">';
			classifyarr[classifyarr.length] = name;
			classifyarr[classifyarr.length] = '</a>';
			var newhot = "";
			if (cObj.extend && cObj.extend.indexOf("RECM")>-1) {
				newhot = "<img src='img/jian.gif' />"; 
			} else if (cObj.extend && cObj.extend.indexOf("HOT")>-1){
			    newhot = "<img src='img/re.gif' />"; 
			} else if (cObj.isnew==1){
			    newhot = "<img src='img/xin.gif' />"; 
			} 
			classifyarr[classifyarr.length] = newhot;
			classifyarr[classifyarr.length] = '</span>';
		}
		arr[xia++] = classifyarr.join('');
		arr[xia++] = '</div></div></div>';
	}
	$(".kw_classify_list").html(arr.join(''));
	setTagWidth();
	centerLoadingEnd("content");
	iframeObj.refresh();		
}

function setTagWidth(){
	var listWidth = $(".cc_r").width();
	var minWidth = 106;
	var maxLen = Math.ceil(listWidth/minWidth);
	var styleHeight = "";
	for(var i=0;i<$(".cc_r").length;i++){
		var $item = $(".cc_r:eq("+i+") span");
		var len = $item.length;
		if(len<=maxLen){
			styleHeight = "100px";
			$item.find("a").css("margin","40px 0");
		}else{
			styleHeight = "50px";
			$item.find("a").css("margin","15px 0");
		}
		$item.css({"width":100/maxLen+"%","height":styleHeight});
	}
}
