function searchNoResult(){
	$(".noresult").hide();
	var somekey = searchSourceKey;
	somekey = somekey.replace(/</g,"&lt;");
	$(".noresult em").html(somekey);
	$(".noresult").show();
	$.getScript("http://topmusic.kuwo.cn/today_recommend/searchNoResult.js");
}
function callClient(call){
	try{
		return window.external.callkwmusic(call);
	}catch(e){
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

function windowOpen(url) {
    var backstr = callClient("OpenBrowser?browser=default&url=" + encodeURIComponent(url));
    if (backstr != 1) {
        window.open(url);
    }
}
function jumpQK(source,sourceid,name,id,extend,other){
	var channel = getStringKey(other,"channelInfo") || getStringKey(extend,"channelInfo") || 'artist';
	var channelInfo = getChannelInfo("",channel);
    var e = "";
    if(extend){
        e = extend;
    }
    var o = "";
    if(other){
        o = other;
    }
	var channelInfo = '';
	var channelName = '';
	var src = '';
    switch(source){
    	case 40:
    		channelInfo = "ch:10002;name:classify;";
    		channelName = 'classify';
    		src = "content_djzone.html?";
    		break;
    	case 1:
    		channelInfo = "ch:10004;name:bang;";
    		channelName = 'bang';
    		src = "channel_bang.html?";
    		break;
    	case 13:
    		channelInfo = "ch:10003;name:artist;";
    		channelName = 'artist';
    		src = "content_album.html?";
    		break;
    	case 8:
    		channelInfo = "ch:2;name:songlib;";
    		channelName = 'songlib';
    		src = "content_gedan.html?";
    		break;
    	case 12:
    		channelInfo = "ch:2;name:songlib;";
    		channelName = 'songlib';
    		src = "content_gedan.html?";
    		break;
    	case 43:
    		channelInfo = "ch:10002;name:classify;";
    		channelName = 'classify';
    		src = "channel_area.html?";
    		break;
    	default:
    		channelInfo = "ch:10003;name:artist;";
    		channelName = 'artist';
    		src = "content_artist.html?";
    		break;
    }
    var info='source='+source+'&sourceid='+sourceid+'&name='+name+'&id='+id+'&other='+other;
   	src = src+info;
    //callClient('Jump?channel=songlib&param={\'source\':\''+source+'\',\'sourceid\':\''+sourceid+'\',\'name\':\''+encodeURIComponent(name)+'\',\'id\':\''+id+'\',\'extend\':\''+e+'\',\'other\':\''+encodeURIComponent(o)+'\'};' + encodeURIComponent('jump:'+channelInfo));
    callClientNoReturn('Jump?channel='+channelName+'&param={\'source\':\''+source+'\',\'sourceid\':\''+sourceid+'\',\'name\':\''+encodeURIComponent(name)+'\',\'id\':\''+id+'\',\'extend\':\''+e+'\',\'other\':\''+encodeURIComponent(o)+'\'};' + encodeURIComponent('url:${netsong}'+src) + ';' + encodeURIComponent('jump:'+channelInfo));
}
function returnSpecialChar(s){
    s = ''+s;
	return s.replace(/\&amp;/g,"&").replace(/\&nbsp;/g," ").replace(/\&apos;/g,"'").replace(/\&quot;/g,"\"").replace(/\%26apos\%3B/g,"'").replace(/\%26quot\%3B/g,"\"").replace(/\%26amp\%3B/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">");
}
function checkSpecialChar(s,usetype){
	if (!s) return '';
    s = ''+s;
    if(usetype=="titlename"){
        return s.replace(/\&apos;/g,"'").replace(/\"/g,"&quot;").replace(/\&amp;apos;/g,"'");
    }else if(usetype=="name"){
        return s.replace(/\"/g,"&quot;").replace(/\'/g,"\\\'").replace(/\&apos;/g,"\\\'").replace(/\&#039;/g,"\\\'");
    }else if(usetype=="disname"){
        return s.replace(/\&quot;/g,"\"").replace(/\&apos;/g,"\'").replace(/\&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\%26apos\%3B/g,"'").replace(/\%26quot\%3B/g,"\"").replace(/\%26amp\%3B/g,"&");
    }
    return s.replace(/\&/g,"&amp;").replace(/\"/g,"&quot;").replace(/\'/g,"\\\'").replace(/\&amp;apos;/g,"&#039;");
}
function jsonError(e){
}
function getChannelInfo(src,channel){
	if("index"==channel || src.indexOf("init") > -1){
		return("{'source':'0','qkback':'true'};name:推荐;")
	}else if("radio"==channel || src.indexOf("radio") > -1){
		return("{'source':'-2','sourceid':'8','name':'1','id':'-2'};name:电台;");
	}else if("mv"==channel || src.indexOf("mv") > -1){
		return("{'source':'-2','sourceid':'3','name':'2','id':'-2'};name:MV;");
	}else if("classify"==channel || src.indexOf("classify") > -1 || src.indexOf("djzone") > -1){
		return("{'source':'-2','sourceid':'5','name':'4','id':'-2'};name:分类;");
	}else if("artist"==channel || src.indexOf("artist") > -1){
		return("{'source':'-2','sourceid':'4','name':'3','id':'-2'};name:歌手;");
	}else if("bang"==channel || src.indexOf("bang") > -1){
		return("{'source':'-2','sourceid':'2','name':'0','id':'-2'};name:排行;");
	}else if("jxj"==channel || src.indexOf("jxj") > -1){
		return("{'source':'-2','sourceid':'86237','name':'15','id':'-2'};name:精选集;");
	}else if("xiu"==channel || src.indexOf("x.kuwo.cn") > -1){
		return("ch:8;name:直播;");
	}
}
function handleSearchNoResult(jsondata){
	var data = jsondata;
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
		        var other = "|psrc=分类->|bread=-2,5,分类,-2|channelInfo=classify";
		        //hrefstring = 'jumpQK(40,190481,\'DJ\',0,0,\''+other+'\')';
		        hrefstring = 'jumpQK(43,1,\'DJ\',0,0,\''+other+'\')';
		    }else{
		        continue;
		    }
		}else if(source==8||source==12){
			var other = "|from=index|channelInfo=classify"
		    hrefstring = 'jumpQK('+source+','+sourceid+',\''+checkSpecialChar(name,"name")+'\','+nodeid+',0,\''+other+'\')';
		}else if(source==1){
			var other = "|psrc=排行榜->|bread=-2,2,排行榜,0|channelInfo=bang"
		    hrefstring = 'jumpQK('+source+','+nodeid+',\''+checkSpecialChar(name,"name")+'\','+sourceid+',0,\''+other+'\')';
		}else if(source == 4){
			var other = "|psrc=歌手->|channelInfo=artist"
		    hrefstring = 'jumpQK('+source+','+sourceid+',\''+checkSpecialChar(name,"name")+'\','+nodeid+',0,\''+other+'\')';
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
function getValue(url,key){
    url = url.toString();
	if(url.indexOf('#')>=0){
		url = url.substring(0,url.length-1);
	}
	var value='';
	var begin = url.indexOf(key + '=');
	if(begin>=0){
		var tmp = url.substring(begin + key.length + 1);
		var eqIdx = tmp.indexOf('=');
		var end = 0;
		if(eqIdx>=0){
			tmp = tmp.substring(0,eqIdx);
			end = tmp.lastIndexOf('&');
		}else{
			end = tmp.length;
		}
		if(end>=0){
			try{
				value = decodeURIComponent(tmp.substring(0,end));
			}catch(e){
				value = tmp.substring(0,end);
			}
		}else{
			try{
				value = decodeURIComponent(tmp);
			}catch(e){
				value = tmp;
			}
		}
	}
	return value;
}
var searchSourceKey;
$(function(){
    var location = decodeURIComponent(window.location.href);
	var key = getValue(location,"key");
	if(typeof(key)=="undefined"||key==""){
	    return;
	}
	key = decodeURIComponent(key);
	searchSourceKey = key;
	searchNoResult();
});
