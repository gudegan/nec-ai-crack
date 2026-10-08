var isSupportShare = 1;
var isDragMusic = false;
var dragMusicString = "";
var currentX;
var currentY;

function wonload(){
	
	//歌曲拖拽
	var kk = true;
	$(".or_music_list").live("mousedown",function(e){
	    var ev = e||event;
  		if(typeof(ev.which)!="undefined"&&ev.which==3){
	        return;
	    }	    
	    currentX = ev.clientX;
	    currentY = ev.clientY;
		isDragMusic = true;
		kk = true;
		dragMusicString = $(this).attr("data-music");

		$(this).mousemove(function(e){
		    var ev = e||event;
	        var X = ev.clientX;
	        var Y = ev.clientY;
	        if(Math.abs(X-currentX)>5||Math.abs(Y-currentY)>5){

	        }else{
	            return false;
	        }
		    if(isDragMusic&&dragMusicString!=""){
			    var currentobj = $(event.srcElement);
			    if(currentobj.is("a")){
				    isDragMusic = false;
				    return false;
			    }else if(currentobj.is("input")||currentobj.hasClass("ichoice")||currentobj.hasClass("ihd")||currentobj.parent().hasClass("ihd")||currentobj.parent().hasClass("five")){
				    isDragMusic = false;
				    return false;
			    }else{
				     if(kk){
				        kk = false;
					    callClientNoReturn("Begindrag?song="+dragMusicString);
				     }
			    }
			    return false;
		    }
		});
	});
	
	//歌曲拖拽
	$(".or_music_list").live("mouseup",function(){
		isDragMusic = false;
		$(this).unbind("mousemove");
		return false;
	});


    
	$(".original_common .or_music_list").live("mouseenter",function () {
		var thisobj = $(this);
		if(thisobj.parent().attr("data-id")=="isHover"){
			thisobj.css("background","#F2F2F2");
		}
		thisobj.find("a").addClass("act");
		getMusicOrigin(thisobj);	
		return false;		
    });

    $(".original_common .or_music_list").live("mouseleave",function () {
		var thisobj = $(this);
		if(thisobj.parent().attr("data-id")=="isHover"){
			thisobj.css("background","none");
		}	
		$(this).find("a").removeClass("act");
		return false;
    });
    
    $(".or_music_list").live("dblclick", function () {
        var playMusicString = $(this).attr("data-music");
        singleMusicOption("SpotsPlay", playMusicString);
        return false;
    });    
    
    //播放歌曲
    $(".original_common .play").live("click",function () {
        var playMusicString = $(this).parent().parent().attr("data-music");
        singleMusicOption("SpotsPlay", playMusicString);
        return false;
    });
	
	//添加歌曲
   $(".original_common .add").live("click", function () {
        var playMusicString = $(this).parent().parent().attr("data-music");
        var playindex = 0;
        if(playMusicString){
            playindex++;
            var playMusicStr = "n="+playindex+"&s"+playindex+"="+playMusicString;
            multipleMusicOption("AddTo",playMusicStr);
        }
        return false;
    });
	
    //下载歌曲
    $(".original_common .down").live("click", function () {
        var playMusicString = $(this).parent().parent().attr("data-music");
        singleMusicOption("Down", playMusicString);
        return false;
    });
	
	//点击更多选项
	$(".original_common a.more").live("click",function(){
		var playMusicString = $(this).parent().parent().attr("data-music");
		var call = "ShowOperation?song="+playMusicString;
		callClientAsyn(call,function(name, args){
            var type = args[0];
            if(type=="NextPlay"){
                singleMusicOption("NextPlay",playMusicString);
            }
        });
		return false;
	});		
	
	//点击分享
	$(".original_common a.share").live("click",function(){
		var musicId  = $(this).parent().parent().attr("data-musicId");
		var call     = "ShowShareWnd?rid=MUSIC_"+musicId;
		var numObj   = $(this).next();
		var shareNum = parseInt(numObj.html(),10);
		var url      = 'http://album.kuwo.cn/album/PCOriginalShareCountServlet?rid=MUSIC_'+musicId+'&r='+Math.random();
		setTimeout(function(){numObj.html(shareNum+1);},500);
		//getScriptData(url,false);
		//单纯发了一个请求
		$.ajax({
			url:url,
			dataType:"jsonp",
			crossDomain:false,
			success:function(msg){
			}
		});
		callClientNoReturn(call);
		return false;
	});	
	
	//点击清晰度
	$(".original_common span").live("click",function(){
		var playMusicString = $(this).parent().parent().attr("data-music");
		var mdcode = $(this).parent().parent().attr("data-mdcode");
		singleMusicOption("ShowHQ",playMusicString,mdcode);	
		return false;
	});	
	
	//内容页全部播放
	$(".original_common .playAll").live("click", function(){
		var songList    = $("#newSongList>ul>li");
		var size        = songList.size();
		var params      = [];
		var htmlArray   = [];
		var snum	    = 0;
		var musicString = '';
		songList.each(function(i){
			params = $(this).attr("data-music");
			params = params.substring(0,params.indexOf("&CSRC"));
			if(!i) htmlArray[i] = 'n='+size+'&s'+(i+1)+"="+params;
			if (i) htmlArray[i] = '&s'+(i+1)+"="+params;		
		});
		musicString = htmlArray.join('');
		multipleMusicOption("Play",musicString);
		return false;
	});
	
	//随便听听
	$(".original_common .playRandom").find("a").live("click", function(){
		//var url = 'http://album.kuwo.cn/album/PCOriginalRandomSongServlet?fc=2014&callback=getRandomList&r='+Math.random();
		//getScriptData(url);
		var url = 'http://album.kuwo.cn/album/PCOriginalRandomSongServlet?fc=2014&r='+Math.random();
		$.ajax({
			url:url,
			dataType:"jsonp",
			crossDomain:false,
			success:function(json){
				getRandomList(json);
			}
		});
		return false;
	});
}



//随便听听数据
function getRandomList(jsondata){
	var data = jsondata;
	if(!data||data ==''||data=='null') return;	
	var list = data.randomSongs;
	if(!list||list ==''||list=='null') return;	
	var obj;
	var formats;
	var params;
	var psrc;
	var htmlArray   = [];
	var musicString = '';
	var size		= list.length;
	for(var i=0; i<size; i++){
		obj	= list[i];
		songName = obj.name;
		formats  = obj.formats;
		params   = obj.params;
		psrc	 = '曲库->首页->分类->原创电台->随便听听';
		params  = getParams(params,formats,psrc,obj);
		if(!i) htmlArray[i] = 'n='+size+'&s'+(i+1)+"="+params;
		if (i) htmlArray[i] = '&s'+(i+1)+"="+params;		
	}
	var csrc = "曲库->首页->酷我原创->随便听听";
	musicString = htmlArray.join('');
	multipleMusicOption("Play",musicString+"&CSRC="+encodeURIComponent(csrc));	
}

//锚点调转栏目位置
function jumpLanmu(){
	var jumpTop       = $(".wrap")[0].offsetTop;
	var clientHeight  = $("#allcontent").height();
	var contentHeigth = $("#flowContent").height();
	var top = 0;
	if((contentHeigth-jumpTop) < clientHeight){
		var differ = contentHeigth-jumpTop;
		top = jumpTop - (clientHeight-differ);
	}else{
		top = jumpTop;
	}
	iframeObj.refresh();
}

//是否支持分享
function isSupport(name){
	var str = callClient("QueryFeature?"+name);
	if(str){
		var val = str.split('?')[1].split('&');
		for(var i=0; i<val.length; i++){
			if(val[i]=='') continue;
			if(val[i].indexOf(name)>-1){
				return val[i].substring(name.length+1).replace(/(^\s*)|(\s*$)/g,"");
			}
		}
		return '';
	}
	return '';
}

//获取PSRC
function getParams(params,formats,psrc,obj){
	psrcStr	= psrc;
	decodeparams  = decodeURIComponent(params).replace(/;/g,'\t');		
	decodeparams  = decodeparams+'\t'+encodeURIComponent('VER=2015;FROM='+psrcStr)+'\t'+ formats+'\t'+getMultiVerNum(obj)+'\t'+getPointNum(obj)+'\t'+getPayNum(obj)+'\t'+getArtistID(obj)+'\t'+getAlbumID(obj);
	decodeparams  = encodeURIComponent(decodeparams);	//这个是它要的编号码的data-music
	return decodeparams;
}
