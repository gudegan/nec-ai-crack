var pn;
var rn=1000000;
var type = '';
var iplayCsrc = "";
window.onload=function (){
    callClientNoReturn('domComplete');
    var location = decodeURIComponent(window.location.href);
    type = getValue(location,"type") || "PLAYLIST";
    centerLoadingStart("content");
    getSomeData(type);
};
$(window).scroll(function(){
        indexLazyLoad();
});
$(window).resize(function(){
        indexLazyLoad();
});
function indexLazyLoad(){
    $(".lazy").each(function(i){
        var thisobj = $(this);
        var top = thisobj.offset().top;
        if(top <= getContentHeight() ) {
            thisobj.removeClass("lazy").attr("src",thisobj.attr("data-original"));
        }
    });
}
function getContentHeight(){
    var scrollT=document.documentElement.scrollTop||document.body.scrollTop;
    contentHeight = ($(window).height()+scrollT);
    return contentHeight;
}
function jsonError(e){

}

var loadCnt = 0;
function getSomeData(type) {
	var uid = getUserID("uid")||189717561;
    var digest = "7";
    if(type=="ARTIST")digest = "4";
    var url = 'http://artistfeeds.kuwo.cn/qz.s?uid='+uid+'&type=get_like_list&digest='+digest+'&start=0&count='+rn+'&f=web&prod='+getVersion()+'&corp=kuwo';
    loadCnt++;
    $.ajax({
        url:url,
        dataType:"text",
        type:"get",
        crossDomain:false,
        timeout:5000,
        success:function(jsondata){
            try{
                var data = eval('('+jsondata+')');
                getMyFavorList(data);
            }catch(e){
                getSomeData(type);
            }
        },
        error:function(){
            if(loadCnt>1){
                loadErrorPage();
            }else{
                getSomeData(type);
            }
        }
    });
}
function getMyFavorList(jsondata) {
	var data = jsondata;
	var child = data.data;
	var len = child.length;
    var nothingCon = '';
	var click = "JumpQuku('index','','','')";
    var csrc = "";
    var someobj = {};
	if('ALBUM' == type){
		//我喜欢的  专辑
		var arr = [];
        csrc = "曲库->我喜欢听->我的专辑";
        someobj.csrc = csrc;
		for (var i=0; i<len; i++) {
			arr[arr.length] = createAlbumBlock (child[i], 'myFavor','',someobj);
		}
        nothingCon = '您还没有收藏任何专辑<br/>去<a href="###" onclick='+click+'>曲库</a>看看';
	}else if('ARTIST' == type){
		//我喜欢的  歌手
		var arr = [];
        csrc = "曲库->我喜欢听->我的歌手";
        someobj.csrc = csrc;
		for (var i=0; i<len; i++) {
			arr[arr.length] = createArtistBlock (child[i], 'myFavor','',someobj);
		}

        nothingCon = '您还没有收藏任何歌手<br/>去<a href="###" onclick='+click+'>曲库</a>看看';
	}
    if (!len && len < 1) {
        $(".nothing font").html(nothingCon);
        $(".nothing").show();
        centerLoadingEnd("content");
        $('#content').show();
        return;
    }
    centerLoadingEnd("content");
    $('#content').show();
	$(".kw_album_list").html(arr.join(''));
      indexLazyLoad();
}
//调到曲库
function JumpQuku(type,id,artist,albumName,other) {
	if(!id||id==0) {
		id="client";
	}
	var p = '';
    var channelInfo = '';
    var src ='';
    var info = '';
	if(type=="ALBUM") {
        channelInfo = getChannelInfo("","artist");
		var name = encodeURIComponent(artist+'|'+albumName);
        info = 'source=13&sourceid='+id+'&name='+name+'&id=13&other='+other;
        src = 'content_album.html?'+info;
		//p = 'Jump?channel=songlib&param={\'source\':\'13\',\'sourceid\':\''+id+'\',\'name\':\''+name+'\',\'id\':\'13\'};' + encodeURIComponent('jump:'+channelInfo);
        p = 'Jump?channel=artist&param={\'source\':\'13\',\'sourceid\':\''+id+'\',\'name\':\''+name+'\',\'id\':\'13\'};' + encodeURIComponent('url:${netsong}'+src) + ';' + encodeURIComponent('jump:'+channelInfo);
	}else if(type=="ARTIST") {
        channelInfo = getChannelInfo("","artist");
        info = 'source=4&sourceid='+id+'&name='+name+'&id=13&other='+other;
        src = 'content_artist.html?'+info;
		//p = 'Jump?channel=songlib&param={\'source\':\'4\',\'sourceid\':\''+id+'\',\'name\':\''+encodeURIComponent(artist)+'\',\'id\':\'4\'};' + encodeURIComponent('jump:'+channelInfo);
        p = 'Jump?channel=artist&param={\'source\':\'4\',\'sourceid\':\''+id+'\',\'name\':\''+name+'\',\'id\':\'13\'};' + encodeURIComponent('url:${netsong}'+src) + ';' + encodeURIComponent('jump:'+channelInfo);
	}else if(type=="PL") {
        channelInfo = getChannelInfo("","classify");
        info = 'source=8&sourceid='+id+'&name=my&id=8&other='+other;
        src = 'content_gedan.html?'+info;
		//p = 'Jump?channel=songlib&param={\'source\':\'8\',\'sourceid\':\''+id+'\',\'name\':\'my\',\'id\':\'8\'};' + encodeURIComponent('jump:'+channelInfo);
        p = 'Jump?channel=classify&param={\'source\':\'8\',\'sourceid\':\''+id+'\',\'name\':\'my\',\'id\':\'8\'};' + encodeURIComponent('url:${netsong}'+src) + ';' + encodeURIComponent('jump:'+channelInfo);
	}else if(type == "index"){
        channelInfo = getChannelInfo("","index");
        //p = 'Jump?channel=songlib&param={\'source\':\'0\',\'qkback\':\'true\'};' + encodeURIComponent('jump:'+channelInfo);
        p = 'Jump?channel=songlib&param={\'source\':\'0\',\'qkback\':\'true\'};' + encodeURIComponent('url:${netsong}quku.html'+src) + ';' + encodeURIComponent('jump:'+channelInfo);
    }
	if(p) {
		callClientNoReturn(p);
	}
}
//iplay
// 小圆圈iplay 直接播放按钮
function iPlay(evt, source, sourceid, obj) {
    if($(obj).hasClass("i_play_loading")||$(".i_play_loading").length>0){
        evt.stopPropagation();
        return;
    }else{
        $(obj).removeClass().addClass("i_play_loading");
    }
	iPlayPSRC = '首页->' + $(obj).attr("data-ipsrc");
    iplayCsrc=encodeURIComponent(encodeURIComponent($(obj).attr("data-csrc")));
    if (source == 1) {
        var url = "http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&id=" + sourceid + "&callback=playBangMusic&pn=0&rn=" + iplaynum;
        $.getScript(getChargeURL(url));
    } else if (source == 4) {
        var url = search_url + "r.s?stype=artist2music&artistid=" + sourceid + "&pn=0&rn=" + iplaynum + "&callback=playArtistMusic&show_copyright_off=1";
        $.getScript(getChargeURL(url));
    } else if (source == 8) {

        var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=" + sourceid + "&pn=0&rn=" + iplaynum + "&encode=utf-8&keyset=pl2012&identity=kuwo&newver=1&callback=playGeDanMusic";
        $.getScript(getChargeURL(url));
    } else if (source == 13) {
        var url = search_url + "r.s?stype=albuminfo&albumid=" + sourceid + "&callback=playAlbumMusic&show_copyright_off=1&alflac=1";
        $.getScript(getChargeURL(url));
    } else if (source == 14) {
        var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid="+sourceid+"&pn=0&rn="+iplaynum+"&encode=utf-8&keyset=mvpl&identity=kuwo&newver=1&callback=playMVGeDanMusic";
        $.getScript(getChargeURL(url));
    } else if (source == 21) {
        $.getScript(album_url+"album/mbox/commhd?flag=1&id=" + sourceid + "&pn=0&rn="+iplaynum+"&callback=playZhuanTiMusic");
    } else if (source == 36){
    	$.getScript("http://album.kuwo.cn/album/MusicTopicServlet?node=pastList&type=" + sourceid + "&callback=playGeDanMusic");
    }
    evt.stopPropagation();
}
var iPlayPSRC = '';
function playMusicBigString(objs, flag) {
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
    var musicstringarray;
    var sarray;
    var si;
    var rid;
    var mp3rid;
    var mvrid;
    var musicstringarray;
    var xia;
	var psrc = iPlayPSRC || "";
	psrc = "VER=2015;FROM=曲库->"+psrc;
	psrc = encodeURIComponent(psrc);
    //flag为true 用param
    var onlineflag = false;
    if (flag) {
        for (var i = 0; i < musicSize; i++) {
            someObj = musicList[i];
            if(typeof(someObj.online)!="undefined"&&someObj.online.length==1&&someObj.online==0){
                onlineflag = true;
                continue;
            }
            param = someObj.param;
            if (typeof (param) == "undefined") {
                param = someObj.params;
            }
            param = returnSpecialChar(param);
            paramArray = param.split(";");
            childArray = [];
            musicString = "";
            for (var j = 0; j < paramArray.length; j++) {
                if (j < 3) {
                    childArray[j] = encodeURIComponent(returnSpecialChar(paramArray[j]));
                } else {
                    if(j==9||j==10){
                        paramArray[j] = 0;
                    }
                    childArray[j] = paramArray[j];
                }
            }
            musicString = childArray.join('\t');
            musicridnum = paramArray[5];
            if (musicridnum.indexOf("MUSIC") > -1) {
                musicridnum = musicridnum.substring(6);
            }
            childArray = null;
            paramArray = null;
            musicstringarray = [];
            musicstringarray[musicstringarray.length] = musicString;
            musicstringarray[musicstringarray.length] = psrc;
		    musicstringarray[musicstringarray.length] = someObj.formats;
		    musicstringarray[musicstringarray.length] = getMultiVerNum(someObj);
		    musicstringarray[musicstringarray.length] = getPointNum(someObj);
		    musicstringarray[musicstringarray.length] = getPayNum(someObj);
		    musicstringarray[musicstringarray.length] = getArtistID(someObj);
		    musicstringarray[musicstringarray.length] = getAlbumID(someObj);
            musicstringarray[musicstringarray.length] = someObj.mp4sig1||0;
            musicstringarray[musicstringarray.length] = someObj.mp4sig2||0;
            musicString = musicstringarray.join('\t');
            musicstringarray = null;
            musicString = encodeURIComponent(musicString);
            sarray = [];
            si = 0;
            sarray[si++] = '&s';
            sarray[si++] = (i + 1);
            sarray[si++] = '=';
            sarray[si++] = musicString;
            bigarray[bigarray.length] = sarray.join('');
            sarray = null;
        }
    } else {
        for (var i = 0; i < musicSize; i++) {
            someObj = musicList[i];
            if(typeof(someObj.online)!="undefined"&&someObj.online.length==1&&someObj.online==0){
                onlineflag = true;
                continue;
            }
            rid = "MUSIC_" + someObj.musicrid;
            mp3rid = "MP3_" + someObj.mp3rid;
            mvrid = "MV_" + someObj.mkvrid;
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
            musicstringarray[xia++] = 0;
            musicstringarray[xia++] = 0;
            musicstringarray[xia++] = mvrid;
            musicstringarray[xia++] = someObj.hasecho;
            musicstringarray[xia++] = psrc;
            musicstringarray[xia++] = someObj.formats;
		    musicstringarray[xia++] = getMultiVerNum(someObj);
		    musicstringarray[xia++] = getPointNum(someObj);
		    musicstringarray[xia++] = getPayNum(someObj);
		    musicstringarray[xia++] = getArtistID(someObj);
		    musicstringarray[xia++] = getAlbumID(someObj);
            musicstringarray[xia++] = someObj.mp4sig1||0;
            musicstringarray[xia++] = someObj.mp4sig2||0;
            musicString = musicstringarray.join('\t');
            musicstringarray = null;
            musicString = encodeURIComponent(musicString);
            sarray = [];
            si = 0;
            sarray[si++] = '&s';
            sarray[si++] = (i + 1);
            sarray[si++] = '=';
            sarray[si++] = musicString;
            bigarray[bigarray.length] = sarray.join('');
            sarray = null;
        }
    }
    bigString = bigarray.join('');
    musicList = null;
    try{
    if(onlineflag){
        if(bigarray.length==0){
            musicOnline();
        }else{
            musicOnline(true);
        }
    }
    }catch(e){}
    return bigString;
}

function playArtistMusic(jsondata) {
    var data = jsondata;
    if (typeof (data) == "undefined" || data == null || typeof (data.musiclist) == "undefined") {
        return;
    }
    var musicList = data.musiclist;
    var musicSize = musicList.length;
    var bigString = "";
    bigString = playMusicBigString(musicList, false);
    $(".i_play_loading").removeClass().addClass("i_play");
    setTimeout(function(){
        callClientNoReturn("Play?mv=0&n=" + musicSize + bigString+"&CSRC="+encodeURIComponent(iplayCsrc));
        bigString = null;
        musicList = null;
        data = null;
    },100);
}
function playGeDanMusic(jsondata) {
    var data = jsondata;
    if (typeof (data) == "undefined" || data == null || typeof (data.musiclist) == "undefined") {
        return;
    }
    var musicList = data.musiclist;
    var musicSize = musicList.length;
    var bigString = "";
    bigString = playMusicBigString(musicList, true);
    $(".i_play_loading").removeClass().addClass("i_play");
    setTimeout(function(){
        callClientNoReturn("Play?mv=0&n=" + musicSize + bigString+"&CSRC="+encodeURIComponent(iplayCsrc));
        bigString = null;
        musicList = null;
        data = null;
    },100);
}
function playAlbumMusic(jsondata) {
    var data = jsondata;
    if (typeof (data) == "undefined" || data == null || typeof (data.musiclist) == "undefined") {
        return;
    }
    var musicList = data.musiclist;
    var musicSize = musicList.length;
    var artistid = data.artistid;
    var albumid = data.albumid;
    for (var i = 0; i < musicSize; i++) {
        musicList[i].artistid = artistid;
        musicList[i].albumid = albumid;
    }
    var bigString = "";
    bigString = playMusicBigString(musicList, true);
    $(".i_play_loading").removeClass().addClass("i_play");
    setTimeout(function(){
        callClientNoReturn("Play?mv=0&n=" + musicSize + bigString+"&CSRC="+encodeURIComponent(iplayCsrc));
        bigString = null;
        musicList = null;
        data = null;
    },100);
}

function getChannelInfo(src,channel){
    if("index"==channel || src.indexOf("init") > -1){
        //return("{'source':'0','qkback':'true'};name:推荐;")
        return('ch:2;name:songlib;');
    }else if("radio"==channel || src.indexOf("radio") > -1){
        //return("{'source':'-2','sourceid':'8','name':'1','id':'-2'};name:电台;");
        return('ch:10000;name:radio;');
    }else if("mv"==channel || src.indexOf("mv") > -1){
        //return("{'source':'-2','sourceid':'3','name':'2','id':'-2'};name:MV;");
        return('ch:10001;name:MV;');
    }else if("classify"==channel || src.indexOf("classify") > -1 || src.indexOf("djzone") > -1){
        //return("{'source':'-2','sourceid':'5','name':'4','id':'-2'};name:分类;");
        return('ch:10002;name:classify;');
    }else if("artist"==channel || src.indexOf("artist") > -1){
        //return("{'source':'-2','sourceid':'4','name':'3','id':'-2'};name:歌手;");
        return('ch:10003;name:artist;');
    }else if("bang"==channel || src.indexOf("bang") > -1){
        //return("{'source':'-2','sourceid':'2','name':'0','id':'-2'};name:排行;");
        return('ch:10004;name:bang;');
    }else if("jxj"==channel || src.indexOf("jxj") > -1){
        return("{'source':'-2','sourceid':'86237','name':'15','id':'-2'};name:精选集;");
    }else if("xiu"==channel || src.indexOf("x.kuwo.cn") > -1){
        return("ch:8;name:直播;");
    }
}
