var csrc="";
;(function(){
    var zindex=10;
    var ele=[];
    $('.bmv_earth').live('click',function(ev){
        $('.sourceTips').hide();
        var oBox=$(this)[0].parentNode.parentNode;
        ele[0]=oBox;
        var oEvent= ev || event;
        var _this=$(this);
        var oTip=$(oBox).find('.sourceTips');
        ele[1]=oTip;
        var liLen=$(this).parents('ul').children().length;
        var index=oBox.getAttribute('data-index');
        var rid=$(this).parents('.bmv_wrap').attr('data-rid');
        var url='http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids='+rid+'&callback=mvEarth';
        $.getScript(url,function(){
            var text='';
            if(jsondata.tag.length>42){
                text=jsondata.tag.substring(0,41)+'...';
            }else{
                text=jsondata.tag;
            }
            oTip[0].children[2].innerHTML='来源：'+text;
        });

        var clientWidth=document.documentElement.clientWidth;
        if(oEvent.clientX<Math.floor(clientWidth/2)){
            $(oTip).addClass('sourceTips2');
        }else{
            $(oTip).removeClass('sourceTips2');
        }
        zindex++;
        oBox.style.zIndex=zindex;
        oTip.show();
        return false;
    });
    var fobj = window.parent;
    fobj.window.onresize=function (){
        var clientWidth=fobj.document.documentElement.clientWidth;
        if(ele[0]){
            setTimeout(function(){
                var eleLeft=ele[0].offsetLeft;
                if(eleLeft<Math.floor(clientWidth/2)-50){
                    $(ele[1]).addClass('sourceTips2');
                }else{
                    $(ele[1]).removeClass('sourceTips2');
                }
            }, 200);
        }
        else{
            return false;
        }
    }
})();

$(document).live('click',function (){
    $('.sourceTips').hide();
});
/**
 * 小地球点击事件
 * @param  {[type]} ev){    var oTip          [description]
 * @return {[type]}           [description]
 */
$('.earth').live('click',function(ev){
    var oTip=$(this).parents('.music_wrap').find('.sourceTips');
    var oBox=$(this).parents('.music_wrap');
    oTip=oTip[0];
    oBox=oBox[0];
    var oEvent= ev || event;
    var _this=$(this);
    var liLen=$(this).parents('ul').children().length/2;
    var index=_this.parents(".music_wrap").attr('data-index');
    $('.sourceTips').hide();
    $('.ugc_tipsBox').hide();
    var earthTop = $(this).offset().top;
    var selallTop = $(this).parents(".common_content").find(".selall").offset().top;
    var rid=$(this).parents(".music_wrap").attr('c-rid').replace("MUSIC_","");
    var url='http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids='+rid+'&callback=loadMusicOrigin';
    $.getScript(url,function(){
        var text='';
        if(jsondata.tag.length>35){
            text=jsondata.tag.substring(0,34)+'...';
        }else{
            text=jsondata.tag;
        }
        oTip.children[2].innerHTML='来源：'+text;
    });
    if(liLen<5){
        oBox.parentNode.style.height=liLen*oBox.offsetHeight+50+'px';
        $(oTip).addClass('sourceTips2');
        oTip.style.top=(earthTop+22-selallTop)+'px';
        $(oTip).show();
    }else{
        if(liLen-index<10){
            oTip.style.top=(earthTop-90-selallTop)+'px';
            $(oTip).show();
        }else if(index<3){
            $(oTip).addClass('sourceTips2');
            oTip.style.top=(earthTop+22-selallTop)+'px';
            $(oTip).show();
        }else if(liLen-index<3){
            oTip.style.top=(earthTop-90-selallTop)+'px';
            $(oTip).show();
        }else{
            oTip.style.top=(earthTop-90-selallTop)+'px';
            $(oTip).show();
        }
    }
    return false;
});

/**
 * 小地球弹窗关闭
 * @param  {[type]} ){  $(this).parent().hide();} [description]
 * @return {[type]}                                [description]
 */
$('.j_earthBtn').live('click',function(){
    $(this).parent().hide();
});
// 歌曲来源tips相关
var musicTimer;
// 辅助函数
// 设置searchBeginNum和searchBeginTime
function setSearchBegin(){
    var nowDate = new Date();
    var pastDate = new Date("1601","00","01");
    searchBeginNum = "utf8_" + getUserID("devid") + encodeURIComponent(searchKey.replace("&", "")) + parseInt((nowDate.getTime() + nowDate.getTimezoneOffset() * 60 * 1000 - pastDate.getTime())/1000/60/60);
    searchBeginTime = new Date().getTime();
}
//搜索时高亮替换
function searchReplaceAll(s){
	var returndata = s;
	if(searchKey.indexOf("\\")>-1){
		return returndata;
	}else{
		var keys = searchKey.split(' ');
		var sss = "(";
		var skey;
		for(var i=0,len=keys.length;i<len;i++){
		    skey = keys[i];
		    skey = skey.replace(/\(/g,"\\(").replace(/\)/g,"\\)");
			if(skey!=''){
				sss +=(skey+"|");
			}
		}
		sss = sss.substr(0,sss.length-1);
		sss += ")";
		try{
			returndata = returndata.replace(new RegExp(sss,"gi"),"<i style='color:"+$skinConfig.linkColor+"'>$1</i>");
		}catch(e){
		}
		return returndata;
	}
}
// 存储音乐信息
function saveMusicInfo(obj,type){
    var musicstringarray = [];
    var musici = 0;
    musicstringarray[musici++] = encodeURIComponent(returnSpecialChar(obj.SONGNAME));
	musicstringarray[musici++] = encodeURIComponent(returnSpecialChar(obj.ARTIST));
	musicstringarray[musici++] = encodeURIComponent(returnSpecialChar(obj.ALBUM));
	musicstringarray[musici++] = obj.NSIG1;
	musicstringarray[musici++] = obj.NSIG2;
	musicstringarray[musici++] = obj.MUSICRID;
	musicstringarray[musici++] = obj.MP3NSIG1;
	musicstringarray[musici++] = obj.MP3NSIG2;
	musicstringarray[musici++] = obj.MP3RID;
	musicstringarray[musici++] = 0;
	musicstringarray[musici++] = 0;
	musicstringarray[musici++] = obj.MKVRID;
	musicstringarray[musici++] = obj.HASECHO;
    if(type == 'all'){
        var psrc = "VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->结果列表";
    }else if(type == 'lrc'){
        var psrc = "VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->歌词列表";
    }
	psrc = encodeURIComponent(psrc);
	musicstringarray[musici++] = psrc;
	musicstringarray[musici++] = obj.FORMATS;
	musicstringarray[musici++] = getMultiVerNum(obj);
	musicstringarray[musici++] = getPointNum(obj);
	musicstringarray[musici++] = getPayNum(obj);
	musicstringarray[musici++] = getArtistID(obj);
	musicstringarray[musici++] = getAlbumID(obj);
    musicstringarray[musici++] = obj.mp4sig1||0;
    musicstringarray[musici++] = obj.mp4sig2||0;
    musicstringarray[musici++] = obj.isdownload||0;
	musicString = musicstringarray.join('\t');
	musicString = encodeURIComponent(musicString);
	MUSICLISTOBJ[obj.MUSICRID] = musicString;
}
function getTanMuMVIconStr(someObj){
    var tanmuiconstr = "";
    var ispoint = someObj.IS_POINT;
    if(typeof(ispoint)=="undefined"){
    	ispoint = someObj.ispoint;
    }
    if(typeof(ispoint)=="undefined"){
    	ispoint = someObj.is_point;
    }
    if(typeof(ispoint)!="undefined"&&ispoint==1){
    	tanmuiconstr = "<b class='tm_mv'></b>";
    }
    return tanmuiconstr;
}
// 获取歌曲列表中的弹幕icon方法
function getTanMuIconStr(someObj){
    var tanmuiconstr = "";
    var ispoint = someObj.IS_POINT;
    if(typeof(ispoint)=="undefined"){
    	ispoint = someObj.ispoint;
    }
    if(typeof(ispoint)=="undefined"){
    	ispoint = someObj.is_point;
    }
    var hasmv = false;
    if(typeof(someObj.MKVRID)!="undefined"&&someObj.MKVRID.substring(someObj.MKVRID.indexOf("_")+1)>0){

        hasmv = true;
    }else if(typeof(someObj.param)!="undefined"){
        var param = someObj.param;
        if(param.indexOf("MKV_")>0&&param.indexOf("MKV_0")<0){
            hasmv = true;
        }else if(param.indexOf("MV_")>0&&param.indexOf("MV_0")<0){
            hasmv = true;
        }
    }else if(typeof(someObj.params)!="undefined"){
        var params = someObj.params;
        if(params.indexOf("MKV_")>0&&params.indexOf("MKV_0")<0){
            hasmv = true;
        }else if(params.indexOf("MV_")>0&&params.indexOf("MV_0")<0){
            hasmv = true;
        }
    }
    if(typeof(ispoint)!="undefined"&&ispoint==1&&hasmv){
    	tanmuiconstr = "<b title='弹幕' onclick='openTanMu(this);return false;'></b>";
    }
    return tanmuiconstr;
}

// 创建分页
function createPage(total, currentPg) {
    var pageHtml = '';
    if (total > 1) {
        if (currentPg != 1) {
            pageHtml += '<a hidefocus href="###" class="next">上一页</a>';
        } else {
            pageHtml += '<a hidefocus href="###" class="nonext">上一页</a>';
        }
        pageHtml += '<a hidefocus  href="###" ' + (currentPg == 1 ? 'class="current"' : 'class=""') + '>1</a>';
        if (currentPg > 4) pageHtml += '<span class="point">...</span>';

        for (var i = (currentPg >= 4 ? (currentPg - 2) : 2) ; i <= (currentPg + 2 >= total ? (total - 1) : (currentPg + 2)) ; i++) {
            if (currentPg == i) {
                pageHtml += '<a hidefocus href="###" class="current">' + i + '</a>';
            } else {
                pageHtml += '<a hidefocus href="###" class="">' + i + '</a>';
            }
        }
        if (currentPg + 3 < total) pageHtml += '<span class="point">...</span>';
        if (total != 1) pageHtml += '<a hidefocus href="###" ' + (currentPg == total ? 'class="current"' : 'class=""') + '>' + total + '</a>';
        if (currentPg != total) {
            pageHtml += '<a hidefocus href="###" class="prev">下一页</a>';
        } else {
            pageHtml += '<a hidefocus href="###" class="noprev">下一页</a>';
        }
    }
    return pageHtml;
}

// 请求url是否根据 付费的开关添加vipver请求参数
function getChargeURL(url){
    if(getChargeIsOpen()){
        url = url+"&vipver="+getVersion();
    }
    if(url.indexOf('search.kuwo.cn') > 0 && url.indexOf('plat=pc') < 0){
        url = url  + '&plat=pc&devid=' + getUserID("devid");
    }
    return url;
}
// 付费开关
function getChargeIsOpen(){
    var isopen = callClient("OpenChargeSong");
    //isopen = 1;
    if(isopen!=1){
        return false;
    }
    return true;
}
function getMusicTips(name,artist,albumName,rid){
    try{
        var tips = "";
        var tipsarray = [];
        var xia = 0;
        tipsarray[xia++] = '歌名：';
        tipsarray[xia++] = checkSpecialChar(name,"titlename");
        if(artist){
            tipsarray[xia++] = '&#13;歌手：';
            tipsarray[xia++] = checkSpecialChar(artist,"titlename");
        }
        if(albumName){
            tipsarray[xia++] = '&#13;专辑：';
            tipsarray[xia++] = checkSpecialChar(albumName,"titlename");
        }
        tipsarray[xia++] = '&#13;来源：加载中...';
        tipsarray[xia++] = '&#13;审批文号：加载中...';
        tipsarray[xia++] = '&#13;MV出品人：加载中...';
        tips = tipsarray.join('');
        tipsarray = null;
        return tips;
    }catch(e){}
}
function getCopyrightClass(someObj){
    var online = someObj.online || someObj.ONLINE;
    var classstr = "";
    if(typeof(online)!="undefined"&&online.length==1&&online==0){
        classstr = "copyright";
    }
    return classstr;
}
function getHqLevel(obj){
    var formats = "";
    if(typeof(obj.formats)!="undefined"){
        formats = obj.formats;
    }else if(typeof(obj.FORMATS)!="undefined"){
        formats = obj.FORMATS;
    }
    formats = formats.replace("ALFLAC|","");//暂时过滤FLAC格式的无损
    var levelclass = "";
    if(formats.indexOf('AL')>=0){
        levelclass = "aq";
    }else if(formats.indexOf('MP3H')>=0){
        levelclass = "sq";
    }else if(formats.indexOf('MP3192')>=0){
        levelclass = "sq";
    }else if(formats.indexOf('WMA128')>=0){
        levelclass = "hq";
    }else if(formats.indexOf('WMA96')>=0){
        levelclass = "lq";
    }
    return levelclass;
}
function getPointNum(someObj){
    var pointnum = someObj.ispoint;
    if(typeof(pointnum)=="undefined"){
        pointnum = someObj.is_point;
    }
    if(typeof(pointnum)=="undefined"){
        pointnum = someObj.IS_POINT;
    }
    if(typeof(pointnum)=="undefined"){
        pointnum = someObj.isPoint;
    }
    if(typeof(pointnum)!="undefined"&&pointnum==1){
        pointnum = 1;
    }else{
        pointnum = 0;
    }
    return pointnum;
}
function getMultiVerNum(someObj){
    var multivernum = someObj.mutiver;
    if(typeof(multivernum)=="undefined"){
        multivernum = someObj.muti_ver;
    }
    if(typeof(multivernum)=="undefined"){
        multivernum = someObj.MUTI_VER;
    }
    if(typeof(multivernum)=="undefined"){
        multivernum = someObj.mutiVer;
    }
    if(typeof(multivernum)=="undefined"||multivernum.length==0){
        multivernum = 0;
    }
    return multivernum;
}
// 获取歌曲是否为付费歌曲
function getPayNum(someObj){
    var paynum = someObj.pay;
    if(typeof(paynum)=="undefined"){
        paynum = someObj.PAY;
    }
    if(typeof(paynum)=="undefined"){
        paynum = 0;
    }
    return paynum;
}
// 获取歌曲歌手id
function getArtistID(someObj){
    var artistid = someObj.artistid;
    if(typeof(artistid)=="undefined"){
        artistid = someObj.ARTISTID || someObj.artistId;
    }
    if(typeof(artistid)=="undefined"){
        artistid = 0;
    }
    return artistid;
}
// 获取歌曲专辑id
function getAlbumID(someObj){
    var albumid = someObj.albumid
    if(typeof(albumid)=="undefined"){
        albumid = someObj.ALBUMID || someObj.albumId;
    }
    if(typeof(albumid)=="undefined"){
        albumid = 0;
    }
    return albumid;
}
function someMV(obj){
    if($(obj).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }
    singleMusicOption("MV",($(obj).attr("data-mv")),'',$(obj).attr("title"));
}
function singleMusicOption(option,musicString,mdcode,name,type){
	var call = "";
	var musicstr = returnSpecialChar(musicString);
    var csrc = "搜索->\""+searchKey+"\"的搜索结果->"+csrcWhere+"->"+name;
    if(type!="undefined"&&type=="dhj"){
        csrc = "搜索->\""+searchKey+"\"的搜索结果->大合集->"+$(".hj_main h2 a").attr("title")+'->'+name;
    }
    csrc = encodeURIComponent(csrc);
	if(option=="MV"){//MV插播
		call = "Play?asnext=1&needplay=1&mv=1&n=1&s1="+musicstr+"&CSRC="+csrc;
	}else if(option=="ShowHQ"){
		call = "SelQuality?mv=0&n=1&s1="+musicstr+"&mediacode="+mdcode+"&play=1";
	}else if(option=="Play"){
        call = option+"?mv=0&n=1&s1="+musicstr+"&CSRC="+csrc;
    }else if(option=="SpotsPlay"){//插播
		call = "Play?asnext=1&needplay=1&mv=0&n=1&s1="+musicstr+"&CSRC="+csrc;
	}else if(option=="NextPlay"){//下一首播放
        call = "Play?asnext=1&needplay=0&mv=0&n=1&s1="+musicstr+"&CSRC="+csrc;
    }else{
        call = option+"?mv=0&n=1&s1="+musicstr;
    }
	callClientNoReturn(call);
	musicstr = null;
	call = null;
}
function multipleMusicOption(option,musicString,mdcode,ispack){
	var call = "";
	var musicstr = returnSpecialChar(musicString);
    var csrc = encodeURIComponent("搜索->\""+searchKey+"\"的搜索结果->"+csrcWhere);
	if(option=="Add"){
        option = "AddTo";
	}
	if(option=="MV"){
		call = "Play?mv=1&"+musicstr+'&CSRC='+csrc;
	}else if(option=="SpotsPlayAllMv"){//插播
        call = "Play?asnext=1&needplay=1&mv=1&"+musicstr+'&CSRC='+csrc;
    }else{
	    if(ispack===true){
	        call = "PackDown?mv=0&"+musicstr;
	    }if(option==="SpotsPlay"){//插播
            call = "Play?asnext=1&needplay=1&mv=0&"+musicstr+'&CSRC='+csrc;
        }else{
	        call = option+"?mv=0&"+musicstr+"&CSRC="+csrc;
	    }
	}
	callClientNoReturn(call);
	musicstr = null;
	call = null;
}
// 操作歌曲下线的歌曲
function musicOnline(flag){
    var type = 1;
    if(flag){
        type = 2;
    }
    callClientNoReturn("CopyrightDlg?type="+type);
}

// 获取歌单图片
function getPlaylistPic(picUrl,picSize){
    if(picUrl.indexOf("userpl2015") > -1 || picUrl.indexOf("luger") > -1){
        if("100 120 150 300 700".indexOf(picSize) > -1){
            if(picSize == 300){
                return picUrl.replace("_150.jpg","b.jpg");
            }else{
                return picUrl.replace("_150.jpg","_"+picSize+".jpg");
            }
        }
    }else if(picUrl.indexOf("userpl2013") > -1){
        if("100 120 150 300".indexOf(picSize) > -1){
            if(picSize == 300){
                return picUrl.replace("_100.jpg","b.jpg");
            }else{
                return picUrl.replace("_100.jpg","_"+picSize+".jpg");
            }
        }
    }else if(picUrl.indexOf("playlist") > -1){
        if("70 100 300 150".indexOf(picSize) > -1){
            if(picSize == 300){
                return picUrl;
            }else if(picSize == 70){
                return picUrl.replace("_.jpg","_s.jpg");
            }else if(picSize == 100){
                return picUrl.replace("_.jpg","_100.jpg");
            }else if(picSize == 150){
                return picUrl.replace("_.jpg","_100.jpg");
            }else{
                return picUrl;
            }
        }
    }else{
        return picUrl;
    }
}

function jumpQK(source,sourceid,name,id,extend,other){
    //var channelInfo = "{'source':'-2','sourceid':'4','name':'3','id':'-2'};name:歌手;";
    //callClient('Jump?channel=songlib&param={\'source\':\''+source+'\',\'sourceid\':\''+sourceid+'\',\'name\':\''+encodeURIComponent(encodeURIComponent(name))+'\',\'id\':\''+id+'\',\'extend\':\'\',\'other\':\''+encodeURIComponent(other)+'\',\'back\':\'true\'};' + encodeURIComponent('jump:'+channelInfo));
    var channelInfo = '';
    var src = '';
    var channelName='';
    switch(source){
        case 43:
            channelInfo = "ch:10002;name:classify;";
            channelName = 'classify';
            src = "channel_area.html?";
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
        case 21:
            channelInfo = "ch:10002;name:classify;";
            channelName = 'classify';
            src = "content_jxj.html?"
            sourceid = encodeURIComponent(sourceid);;
            break;
        default:
            channelInfo = "ch:10003;name:artist;";
            channelName = 'artist';
            src = "content_artist.html?";
            break;
    }

    var param="{\'source\':\''+source+'\',\'sourceid\':\''+sourceid+'\',\'name\':\''"+encodeURIComponent(encodeURIComponent(name))+"'\',\'id\':\''+id+'\',\'extend\':\'\',\'other\':\''"+encodeURIComponent(other)+"'\',\'back\':\'true\'};";
    var info='source='+source+'&sourceid='+sourceid+'&name='+name+'&id='+id+'&other='+other;
    src = src+info;
    //var call = "PageJump?param="+encodeURIComponent(param) + ";" + encodeURIComponent(channelInfo)+ ";" +encodeURIComponent('url:${netsong}'+src)+'&calljump=true';
    //callClient(call);
    callClientNoReturn('Jump?channel='+channelName+'&param={\'source\':\''+source+'\',\'sourceid\':\''+sourceid+'\',\'name\':\''+encodeURIComponent(encodeURIComponent(name))+'\',\'id\':\''+id+'\',\'extend\':\'\',\'other\':\''+encodeURIComponent(other)+'\',\'back\':\'true\'};' + encodeURIComponent('url:${netsong}'+src) + ';' + encodeURIComponent('jump:'+channelInfo));
}
// 大合集跳转
function dhjJumpQk(source,sourceid,name,id,dhjId,hitNum,getLogObjFlag){
    var other = "";
    var channelInfo = "";
    var channelNode='';
    var src='';
    var psrc = '';
    var dhjType = '';
    var logType = '';
    if(source==13){
        channelNode = 'artist';
        src = 'content_album.html?';
        channelInfo = getChannelInfo("","artist");
        psrc = encodeURIComponent("\""+searchKey+"\"")+"的搜索结果->大合集->专辑页->"+dhjId;
        other = "|psrc="+psrc+"|searchKey="+searchKey+'-专辑-大合集';
        logType = "专辑";
        dhjType = "ALBUM";
    }else if(source==4){
        channelNode = 'artist';
        src = 'content_artist.html?';
        channelInfo = getChannelInfo("","artist");
        psrc = encodeURIComponent("\""+searchKey+"\"")+"的搜索结果->大合集->歌手页->"+dhjId;
        other = "|psrc="+psrc+"|searchKey="+searchKey+'-歌手-大合集';
        logType = "歌手";
        dhjType = "ARTIST";
    }else if(source==8||source==12){
        channelNode = 'songlib';
        src = 'content_gedan.html?';
        channelInfo = getChannelInfo("","index");
        psrc = encodeURIComponent("\""+searchKey+"\"")+"的搜索结果->大合集->歌单页->"+dhjId;
        var csrc = encodeURIComponent("\""+searchKey+"\"")+"的搜索结果->大合集->"+name;
        other = "|psrc="+psrc+"|csrc=搜索->"+csrc+"|searchKey="+searchKey+'-歌单-大合集';
        logType = "歌单";
        dhjType = "PLAYLIST";
    }else if(source==21){
        src = "content_jxj.html?";
        channelNode = 'classify';
        channelInfo = getChannelInfo("","classify");
        sourceid = encodeURIComponent(sourceid);
        other = "|csrc=搜索->\'"+searchKey+"\'的搜索结果->大合集"+'->'+name;
    }
    // 新搜索统计日志 大合集
    var logObj = {
        "dhjType":dhjType,
        "dhjName":logType+":"+name,
        "rid":sourceid,
        "hitNum":hitNum
    }
    if(getLogObjFlag){
        return logObj;
    }else{
        sendSearchLog("dhjClick",logObj);
        other = encodeURIComponent(other);
        param = '{\'source\':\''+source+'\',\'sourceid\':\''+sourceid+'\',\'name\':\''+name+'\',\'id\':\''+id+'\',\'extend\':\'\',\'other\':\''+other+'\'}'
        var info = 'source='+source+'&sourceid='+sourceid+'&name='+name+'&id='+id+'&other='+other;
        src = src+info;
        //var call = "Jump?channel=songlib&param="+encodeURIComponent(param) + ";" + encodeURIComponent('jump:'+channelInfo);
        var call = "Jump?channel="+channelNode+"&param="+encodeURIComponent(param) + ";" + encodeURIComponent('url:${netsong}'+src) + ';' + encodeURIComponent('jump:'+channelInfo);
        callClientNoReturn(call);
    }
}

function iPlay(evt, source, sourceid,obj) {
    var ref = "";
    csrc = encodeURIComponent($(obj).attr("data-csrc"));
    if($(obj).hasClass("i_play_loading")||$(".i_play_loading").length>0){
        evt.stopPropagation();
        return;
    }else{
        $(obj).removeClass().addClass("i_play_loading");
    }
    if (source == 4) {
        var url = "https://search.kuwo.cn/r.s?stype=artist2music&artistid=" + sourceid + "&pn=0&rn=100&callback=playArtistMusic&show_copyright_off=1&pcmp4=1&newver=1";
        $.getScript(getChargeURL(url));
        ref = "歌手";
    } else if (source == 13) {
        var url = "https://search.kuwo.cn/r.s?stype=albuminfo&albumid=" + sourceid + "&callback=playAlbumMusic&show_copyright_off=1&pcmp4=1&newver=1";
        $.getScript(getChargeURL(url));
        ref = "专辑";
    } else if (source == 8){
        var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=" + sourceid + "&pn=0&rn=100&callback=playGeDanMusic&encode=utf-8&keyset=pl2012&identity=kuwo&pcmp4=1&newver=1";
        $.getScript(getChargeURL(url));
        ref = "歌单";
    }
    // 新搜索统计日志
    var $li = $(obj).parents("li");
    var logObj = {
        "operationType":"OUTPLAY",
        "pos":$li.index(),
        "ref":"乐库->搜索结果->"+searchKey+"->REF"+ref+"->"+$li.find(".b_name a").attr("title"),
        "rid":$(obj).parent().attr("data-rid")||$li.attr("data-rid"),
        "innerPos":"-1"
    }
    sendSearchLog("operation",logObj);
    evt.stopPropagation();
}
function playGeDanMusic(jsondata) {
    var data = jsondata;
    if (typeof (data) == "undefined" || data == null || typeof (data.musiclist) == "undefined") {
        return;
    }
    var musicList = data.musiclist;
    var musicSize = musicList.length;
    var bigString = "";
    bigString = playMusicBigString(musicList, true, 'playlist');
    $(".i_play_loading").removeClass().addClass("i_play");
    setTimeout(function(){
        callClientNoReturn("Play?mv=0&n=" + musicSize + bigString+"&CSRC="+csrc);
        musicList = null;
        bigString = null;
        data = null;
    },100);
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
        callClientNoReturn("Play?mv=0&n=" + musicSize + bigString+"&CSRC="+csrc);
        musicList = null;
        bigString = null;
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
        callClientNoReturn("Play?mv=0&n=" + musicSize + bigString+"&CSRC="+csrc);
        bigString = null;
        musicList = null;
        data = null;
    },100);
}
function playMusicBigString(objs, flag, type) {
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
    var psrc;
    var musicstringarray;
    var sarray;
    var si;
    var rid;
    var mp3rid;
    var mvrid;
    var psrc;
    var musicstringarray;
    var xia;
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
            musicstringarray[0] = musicString;
            if(type == 'playlist'){
                var psrc = "VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->歌单列表";
            }else{
                var psrc = "VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->专辑列表";
            }
            psrc = encodeURIComponent(psrc);
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
            var psrc = "VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->歌手列表";
            psrc = encodeURIComponent(psrc);
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
        }
    }
    }catch(e){}
    return bigString;
}
// 点击的新日志
function searchArtistNewLog(pos){
    searchOperationLog("ref",pos,"music","refartist");
}
function searchAlbumNewLog(pos){
    searchOperationLog("ref",pos,"music","refalbum");
}
function searchMvNewLog(){
    searchOperationLog("ref","-400","music","refmv");
}
function searchLyricNewLog(){
    searchOperationLog("ref","-500","music","reflyric");
}

//搜索之后 用户操作日志
function searchOperationLog(operationtype,pos,searchtype,refaddr){
    if(!searchLogIsOpen){//||searchObj.css("display")=="none" removed by luger
        return;
    }
    searchResultOperation();
    if(new Date().getTime() - searchBeginTime > 200000){
        if(searchtype == 'music'){
            var call = 'MBOXLOG?stype=type_soperation&pos=-1&snum='+searchBeginNum+'&operationtype=noop&searchtype=music&refaddr=noref ';
            callClientNoReturn(call);
        }
        return;
    }
    var call = "MBOXLOG?stype=type_soperation&operationtype="+operationtype+"&pos="+pos+"&snum="+searchBeginNum+"&searchtype="+searchtype+"&refaddr="+refaddr;
    callClientNoReturn(call);
}
var searchLogIsOpen = true;
//搜索请求 日志 成功或者失败
function searchRequestLog(result,searchtype,page){
    if(!searchLogIsOpen){
        return;
    }
    var time = new Date().getTime() - searchBeginTime;
    var call;
    if(page>1){
        call = "MBOXLOG?stype=type_spage&snum="+searchBeginNum+"&stime="+time+"&sresult="+result+"&searchtype="+searchtype;
    }else{
        call = "MBOXLOG?stype=type_stime&snum="+searchBeginNum+"&stime="+time+"&sresult="+result+"&searchtype="+searchtype+"&searchkey="+encodeURIComponent(searchKey);
    }
    callClientNoReturn(call);
}
// 播放电台
function someDianTai(sourceid,nodeobj) {
    var params = sourceid.split(",");
    var pic1 = "http://img1.sycdn.kuwo.cn/star/tags"+params[2];
    if(params[2].indexOf("http://")>-1){
        pic1 = params[2];
    }
    var pic2 = "http://img1.sycdn.kuwo.cn/star/tags"+params[3];
    if(params[3].indexOf("http://")>-1){
        pic2 = params[3];
    }
    var pic3 = getStringKey(nodeobj.extend,"RADIO_PIC");
    var disname = disnameSplict(nodeobj.disname || nodeobj.name) || getStringKey(nodeobj.extend,"DIS_NAME");
    var call = "AddMusicRadio?mrid="+params[0]+"&mrname="+encodeURIComponent(disname)+"&mrpic1="+pic1+"&mrpic2="+pic2+"&ut="+params[4]+"&lt="+params[5]+"&r="+params[6]+"&pt="+params[7]+"&num="+params[8]+"&mrtype="+params[9]+"&play="+params[10]+"&mrpic3="+pic3;
    callClientNoReturn(call);
}
// 打开外链
function openURL(url,type) {
    if (url.indexOf("x.kuwo.cn") > -1) {
        var param = callClient("LiveShowParam");
        if (param != "") {
            if (url.indexOf("?") > -1) {
                url = url + param;
            } else {
                url = url + "?" + param.substr(1);
            }
        }
    }
    //add by luger 添加秀场盒内弹窗弹出20150521
    if(url.indexOf("x.kuwo.cn")>-1&&type!="default"){
        if(getVersion() > 'MUSIC_8.0.1.0'){
            callClientNoReturn("ShowOpenRoom?width=1400&height=830&url="+encodeURIComponent(url));  //
            return;
        }
    }
    var backstr = callClient("OpenBrowser?browser=default&url=" + encodeURIComponent(url));
    if (backstr != 1) {
        window.open(url);
    }
}
// 打开秀场
function openXIU(obj,pos){
   var url = $(obj).attr("data-url");
    if(url.indexOf("?")>-1){
        url = url + "&cid=" + getUserID("devid");
    }else{
        url = url + "?cid=" + getUserID("devid");
    }
    //
    if(pos==-8){
        var myImg = new Image();
        myImg.src = "http://g.koowo.com/g.real?aid=text_ad_2102&ver="+getVersion()+"&cid="+getUserID("devid");
    }else{
        return;
    }
    openURL(url);
    searchOperationLog("x_open",pos,"music","noref");
}

String.prototype.gblen = function() {
    var len = 0;
    for ( var i = 0; i < this.length; i++) {
        if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {
            len += 2;
        } else {
            len++;
        }
    }
    return len;
}

function cutStrByGblen(str, gblen){
    if (str.gblen() <= gblen) {
        return str;
    } else {
        var baseCut = Math.floor((gblen - 1) / 2);
        var result = str.substring(0, baseCut);
        var nowGblen = result.gblen();
        if (nowGblen < gblen) {
            for ( var i = baseCut, len = str.length; i < len; i++) {
                var charGblen = str.charAt(i).gblen();
                if (nowGblen + charGblen <= gblen - 1) {
                    result += str.charAt(i);
                    nowGblen += charGblen;
                } else {
                    var dotNum = gblen - nowGblen;
                    if(dotNum>0){
                        result += '...';
                    }
                    return result;
                }
            }
        }
    }
}

function getHeJiMusicStringNew(someobj){
    var playarray = [];
    var playi = 0;
    var param = someobj.playparam;
    param = returnSpecialChar(param);
    var paramArray = param.split(";");
    var playstring = "";
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.name));
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.artist));
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.album));
    for(var j=3;j<paramArray.length;j++){
        playarray[playi++] = paramArray[j];
    }
    playarray[playi++] = encodeURIComponent("VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->大合集->结果页->"+currentDHJID);
    playarray[playi++] = '';
    playarray[playi++] = getMultiVerNum(someobj);
    playarray[playi++] = getPointNum(someobj);
    playarray[playi++] = getPayNum(someobj);
    playarray[playi++] = getArtistID(someobj);
    playarray[playi++] = getAlbumID(someobj);
    playstring = playarray.join("\t");
    playstring = encodeURIComponent(playstring);
    return playstring;
}

function getHeJiMusicString(someobj,key,dhjid){
    var playarray = [];
    var playi = 0;
    var playstring = "";
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.name));
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.artist));
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.album));
    playarray[playi++] = someobj.nsig1;
    playarray[playi++] = someobj.nsig2;
    playarray[playi++] = "MUSIC_"+someobj.id;
    playarray[playi++] = someobj.mp3nsig1;
    playarray[playi++] = someobj.mp3nsig2;
    playarray[playi++] = "MP3_"+someobj.mp3rid;
    playarray[playi++] = someobj.mkvnsig1;
    playarray[playi++] = someobj.mkvnsig2;
    playarray[playi++] = "MV_"+someobj.mkvrid;
    playarray[playi++] = someobj.hasecho;
    playarray[playi++] = encodeURIComponent("VER=2015;FROM=曲库->\""+key+"\"的搜索结果->大合集->结果页->"+dhjid);
    playarray[playi++] = '';
    playarray[playi++] = getMultiVerNum(someobj);
    playarray[playi++] = getPointNum(someobj);
    playarray[playi++] = getPayNum(someobj);
    playarray[playi++] = getArtistID(someobj);
    playarray[playi++] = getAlbumID(someobj);
    playstring = playarray.join("\t");
    playstring = encodeURIComponent(playstring);
    return playstring;
}
//点击歌手大合集单曲专辑MV数字跳转
function dhjArtistNew(type,id,name){
    searchOperationLog("ref","-8","music","refartist");
    var other = "";
    if(type==-4){
        other = "|psrc=|bread=|tabType=album|pn=0";
    }else if(type==-5){
        other = "|psrc=|bread=|tabType=mv|pn=0";
    }
    var channelInfo = getChannelInfo("","artist");
    var info = 'source=4&sourceid='+id+'&name='+name+'&id=4&other='+other;
    var src = 'content_artist.html?'+info;
    callClientNoReturn('Jump?channel=artist&param={\'source\':\'4\',\'sourceid\':\''+id+'\',\'name\':\''+encodeURIComponent(name)+'\',\'id\':\'4\',\'extend\':\'\',\'other\':\''+encodeURIComponent(other)+'\'};' + encodeURIComponent('url:${netsong}'+src) + ';' +  encodeURIComponent('jump:'+channelInfo));}
function dhjArtistNewLog(){
    var fnStr = $("#dhjBox .hjTitle").attr("onclick");
    fnStr = fnStr.substring(0,fnStr.length-1)+",true)";
    sendSearchLog("dhjClick",eval(fnStr));
    searchOperationLog("ref","-8","music","refartist");
}
//检查是否在搜索页面操作
function searchResultOperation(){
    if(searchLogIsOpen){
        searchIsOperation = true;
    }
}

var choosenObj;
var dhjok = true;
//播放精选歌曲取歌手前500首
function playWellChoosen(id){
    searchOperationLog("playwell","-9","music","noref");
    // if(typeof(choosenObj)=="object"){
    //     checkLastObj();
    //     return;
    // }
    if(!dhjok){
        return;
    }
    dhjok = false;
    var url = "https://search.kuwo.cn/r.s?stype=artist2music&artistid="+id+"&pn=0&rn=500&vipver="+getVersion()+"&show_copyright_off=1&pcmp4=1&newver=1&time="+Math.random();
    $.ajax({
        url:url,
        dataType:"jsonp",
        callback:"cb",
        crossDomain:false,
        success:function(json){
            try{
                wellChoosenResult(json,id);
            }catch(e){
                $('#dhjBox').hide();
            }
        },
        error:function(){
            $('#dhjBox').hide();
        }
    });
    var fnStr = $("#dhjBox .hjTitle").attr("onclick");
    fnStr = fnStr.substring(0,fnStr.length-1)+",true)";
    sendSearchLog("dhjClick",eval(fnStr));
}
//解析歌手歌曲数据 并播放
function wellChoosenResult(jsondata,dhjid){
    try{
    var data = jsondata;
    if(typeof(data)=="undefined"||typeof(data.musiclist)=="undefined"||data.musiclist.length==0){
        return;
    }
    var musicList = data.musiclist;
    //choosenObj = musicList;
    var musicsize = musicList.length;
    if(musicsize<=10){
        playRandomObjs(musicList,dhjid);
    }else if(musicsize<=50){
        var newobjs = getRandomObjs(musicList);
        playRandomObjs(newobjs,dhjid);
    }else if(musicsize<=100){
        var newobjs = getRandomObjs(musicList);
        playRandomObjs(newobjs,dhjid);
    }else{
        var newobjs = getRandomObjs(musicList);
        playRandomObjs(newobjs,dhjid);
    }
    }catch(e){}
}

//检查是否可以再次点击播放精选
function checkLastObj(){
    var musicsize = choosenObj.length;
    if(musicsize<=10){
        playRandomObjs(choosenObj);
    }else if(musicsize<=50){
        var newobjs = getRandomObjs();
        playRandomObjs(newobjs);
    }else if(musicsize<=100){
        var newobjs = getRandomObjs2();
        playRandomObjs(newobjs);
    }else{
        var newobjs = getRandomObjs3();
        playRandomObjs(newobjs);
    }
    dhjok = true;
}
//获取歌曲列表中的随机10首歌曲
function getRandomObjs(musicArr){
    if(musicArr.length>50){
        musicArr.length = 50;
    }
    musicArr.sort(function(){
        return Math.random()-0.5;
    });
    musicArr.length = 10;
    return musicArr;
}
var headarray = [];
var lastarray = [];
var arrayisload = false;

//播放取出的随机歌曲
function playRandomObjs(objs,dhjid){
    var playstr = "";
    var objssize = objs.length;
    var onlineflag = false;
    for(var i=0;i<objssize;i++){
        var someobj = objs[i];
        if(typeof(someobj.online)!="undefined"&&someobj.online.length==1&&someobj.online==0){
            onlineflag = true;
            continue;
        }
        playstr += ("&s"+(i+1)+"="+getOneMusicString(objs[i],dhjid));
    }
    if(onlineflag){
        musicOnline(true);
    }
    dhjok = true;
    callClientNoReturn("Play?mv=0&n="+objssize+playstr+"&CSRC="+encodeURIComponent("搜索->\'"+searchKey+"\'的搜索结果->大合集"+'->'+searchKey));
}
//获取一首歌曲的播放参数
function getOneMusicString(someobj,dhjid){
    var playarray = [];
    var playi = 0;
    var playstring = "";
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.name));
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.artist));
    playarray[playi++] = encodeURIComponent(returnSpecialChar(someobj.album));
    playarray[playi++] = someobj.nsig1;
    playarray[playi++] = someobj.nsig2;
    playarray[playi++] = "MUSIC_"+someobj.musicrid;
    playarray[playi++] = someobj.mp3sig1;
    playarray[playi++] = someobj.mp3sig2;
    playarray[playi++] = "MP3_"+someobj.mp3rid;
    playarray[playi++] = someobj.mkvnsig1;
    playarray[playi++] = someobj.mkvnsig2;
    playarray[playi++] = "MV_"+someobj.mkvrid;
    playarray[playi++] = someobj.hasecho;
    playarray[playi++] = encodeURIComponent("VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->大合集->结果页->"+dhjid);
    playarray[playi++] = someobj.formats;
    playarray[playi++] = getMultiVerNum(someobj);
    playarray[playi++] = getPointNum(someobj);
    playarray[playi++] = getPayNum(someobj);
    playarray[playi++] = getArtistID(someobj);
    playarray[playi++] = getAlbumID(someobj);
    playstring = playarray.join("\t");
    playstring = encodeURIComponent(playstring);
    return playstring;
}


//播放歌单
function playPlaylist(type,id,obj){
    var url = "";
    var playtype = "";
    if(type==1){
        playtype = "playplaylist";
        // url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid="+id+"&vipver="+getVersion()+"&pn=0&rn=1000&encode=utf-8&keyset=pl2012&identity=kuwo&callback=dhjGeDan";
        url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid="+id+"&vipver="+getVersion()+"&pn=0&rn=1000&encode=utf-8&keyset=pl2012&identity=kuwo&pcmp4=1&newver=1";
    }else if(type==2){
        playtype = "playsubject";
        // url = "http://album.kuwo.cn/album/mbox/commhd?flag=1&id="+id+"&vipver="+getVersion()+"&callback=dhjZhuanTi";
        url = "http://album.kuwo.cn/album/mbox/commhd?flag=1&id="+id+"&vipver="+getVersion();
    }else if(type==3){
        playtype = "playalbum";
        // url = "https://search.kuwo.cn/r.s?stype=albuminfo&albumid="+id+"&vipver="+getVersion()+"&callback=dhjGeDan&show_copyright_off=1";
        url = "https://search.kuwo.cn/r.s?stype=albuminfo&albumid="+id+"&vipver="+getVersion()+"&show_copyright_off=1&newver=1";
    }
    searchOperationLog(playtype,"-9","music","noref");
    $.ajax({
        url:url,
        dataType:"jsonp",
        callback:"cb",
        crossDomain:false,
        success:function(json){
            if(type==1){
                dhjGeDan(json,id);
            }else if(type==2){
                var name = $(obj).parents(".hj_main").find(".w_a_hj4").html().replace(/<\/?.+?>/g,'');
                dhjZhuanTi(json,id,name);
            }else if(type==3){
                dhjGeDan(json,id);
            }
        }
    });
}
function dhjGeDan(jsondata,dhjid){
    var data = jsondata;
    if(typeof(data)=="undefined"||data==null||typeof(data.musiclist)=="undefined"){
        return;
    }
    var musicList = data.musiclist;
    var musicSize = musicList.length;
    var bigString = "";
    var bigarray = [];
    var someObj;
    var param;
    var paramArray;
    var childArray;
    var musicString;
    var musicridnum;
    var psrc;
    var musicstringarray;
    var sarray;
    var si;
    var rid;
    var mp3rid;
    var mvrid;
    var psrc;
    var musicstringarray;
    var xia;
    var onlineflag = false;
    var albumid = data.albumid;
    var copyNum = 0;
    for(var i = 0; i < musicSize; i++){
        someObj = musicList[i];
        if(typeof(someObj.online)!="undefined"&&someObj.online.length==1&&someObj.online==0){
            onlineflag = true;
            copyNum ++;
            continue;
        }
        param = someObj.param;
        if(typeof(param)=="undefined"){
            param = someObj.params;
        }
        param = returnSpecialChar(param);
        paramArray = param.split(";");
        childArray = [];
        musicString = "";
        for(var j=0;j<paramArray.length;j++){
            if(j < 3){
                childArray[j] = encodeURIComponent(returnSpecialChar(paramArray[j]));
            }else{
                childArray[j] = paramArray[j];
            }
        }
        musicString = childArray.join('\t');
        musicridnum = paramArray[5];
        if(musicridnum.indexOf("MUSIC")>-1){
            musicridnum = musicridnum.substring(6);
        }
        childArray = null;
        paramArray = null;
        musicstringarray = [];
        musicstringarray[musicstringarray.length] = musicString;
        // musicstringarray[musicstringarray.length] = encodeURIComponent("VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->大合集->结果页->"+currentDHJID);
        musicstringarray[musicstringarray.length] = encodeURIComponent("VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->大合集->结果页->"+dhjid);
        musicstringarray[musicstringarray.length] = someObj.formats;
        musicstringarray[musicstringarray.length] = getMultiVerNum(someObj);
        musicstringarray[musicstringarray.length] = getPointNum(someObj);
        musicstringarray[musicstringarray.length] = getPayNum(someObj);
        musicstringarray[musicstringarray.length] = getArtistID(someObj);

        if(albumid){
            musicstringarray[musicstringarray.length] = albumid;
        }else{
            musicstringarray[musicstringarray.length] = getAlbumID(someObj);
        }
        musicString = musicstringarray.join('\t');
        musicstringarray = null;
        musicString = encodeURIComponent(musicString);
        sarray = [];
        si = 0;
        sarray[si++] = '&s';
        sarray[si++] = (i+1);
        sarray[si++] = '=';
        sarray[si++] = musicString;
        bigarray[i] = sarray.join('');
        sarray = null;
    }
    bigString = bigarray.join("");
    if(onlineflag&&musicSize == copyNum){
        musicOnline(true);
    }
    if(bigString==""){
        return;
    }
    var csrcName = data.name||data.title;
    callClientNoReturn("Play?mv=0&n="+musicSize+bigString+"&CSRC="+encodeURIComponent("搜索->\'"+searchKey+"\'的搜索结果->大合集"+'->'+csrcName));
    musicList = null;
    bigString = null;
    data = null;
}
function dhjZhuanTi(jsondata,dhjid,name){
    try{
    var data = jsondata;
    if(data==null||typeof(data.musiclist)=="undefined"||data.musiclist.length==0){
        return;
    }
    var musicList = data.musiclist;
    var musicSize = musicList.length;
    var bigString = "";
    var musicarray = [];
    var musici = 0;
    var someobj;
    var musicString;
    var albumid = data.albumid;
    var param;
    var paramArray;
    var childArray;
    for(var i=0;i<musicSize;i++){
        someObj = musicList[i];
        param = someObj.param;
        if(typeof(param)=="undefined"){
            param = someObj.params;
        }
        if(albumid){
          albumid= albumid;
        }else{
           albumid =getAlbumID(someObj);
        }
        musicString = decodeURIComponent(param).replace(/;/g,"\t")+"\t"+encodeURIComponent("VER=2015;FROM=曲库->\""+searchKey+"\"的搜索结果->大合集->结果页->"+dhjid)+"\t" +someObj.formats+"\t"+getMultiVerNum(someObj)+"\t" + getPointNum(someObj) + "\t"+getPayNum(someObj)+"\t"+getArtistID(someObj)+"\t"+albumid;
        musicString = encodeURIComponent(musicString);
        musicarray[musici++] = '&s';
        musicarray[musici++] = (i+1);
        musicarray[musici++] = '=';
        musicarray[musici++] = musicString;
    }
    bigString = musicarray.join("");
    callClientNoReturn("Play?mv=0&n="+musicSize+bigString+"&CSRC="+encodeURIComponent("搜索->\'"+searchKey+"\'的搜索结果->大合集"+'->'+name));
    bigString = null;
    musicList = null;
    data = null;
    musicSize = null;
}catch(e){}
}

// 打开弹幕的方法
function openTanMu(obj){
    if($(obj).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }
    var rid = $(obj).parents("li").attr("c-rid")||$(obj).parents("li").find(".icon").attr("data-rid");
    if(rid&&MUSICLISTOBJ[rid]){
        var playMusicString = MUSICLISTOBJ[rid];
        singleMusicOption("MV",playMusicString+"&tanmustarted=1",'',$(obj).parents("li").find(".w_name").html());
    }
}
// 获取当前电台播放状态
window.parent.radioNowPlaying = function(str) {
  if (str != '') {
    var id = getValue(str, 'radioid');
    var status = getValue(str, 'playstatus');
    var num = parseInt(status, 10);
    initRadioStatus(num, id);
  } else {
    initRadioStatus(3);
  }
};

// 辅助函数结束
function OnJump(){}
// function OnJump(param) {
//     $(".ugc_tipsBox").hide();
//     param=param.replace(/&quot;/g,'\'');
//     param = decodeURIComponent(param.split(";")[0]);
//     if (param.indexOf('channel_search') > -1) {
//         var msg = getUrlMsg(param);
//         //var searchKey = url2data(msg, 'key');
//         var searchKey = getStringKey(msg, 'key');
//         var type = url2data(msg, 'type');
//         $('.tabBox a').removeClass('active');
//         $('.tabBox a').each(function(i){
//             if($(this).attr('data-type')==type){
//                 $(this).addClass('active');
//             }
//         });
//         pn = 0;
//         MUSICLISTOBJ = [];
//         MVLISTOBJ = [];
//         $('.common_content').hide();
//         $('.page').hide();
//         call_create_search_list_fn(type,encodeURIComponent(searchKey));
//         switch(type){
//             case 'all':
//                 return;//type=all无需记录回退url
//                 commonClick({'source':'9999','sourceid':searchKey,'type':'all'});
//                 break;
//             case 'mv':
//                 commonClick({'source':'9999','sourceid':searchKey,'type':'mv'});
//                 break;
//             case 'setlist':
//                 commonClick({'source':'9999','sourceid':searchKey,'type':'setlist'});
//                 break;
//             case 'radio':
//                 commonClick({'source':'9999','sourceid':searchKey,'type':'radio'});
//                 break;
//             case 'artist':
//                 commonClick({'source':'9999','sourceid':searchKey,'type':'artist'});
//                 break;
//             case 'album':
//                 commonClick({'source':'9999','sourceid':searchKey,'type':'album'});
//                 break;
//             case 'lrc':
//                 commonClick({'source':'9999','sourceid':searchKey,'type':'lrc'});
//                 break;
//         }
//         return;
//     }
// }
function getMoney(someObj,type){
    var moneyicon = "";
    //var isopen = callClient("OpenChargeSong");
    if(isopen!=1){
        return moneyicon;
    }
    var paynum = someObj.pay;
    if(typeof(paynum)=="undefined"){
        paynum = someObj.PAY;
    }
    if(typeof(paynum)!="undefined"){
        try{
            paynum = parseInt(paynum,10);
            paynum = paynum.toString(16);
            if(type=="play"){
                paynum = paynum.substr(paynum.length-1,1);
            }else if(type=="down"){
                paynum = paynum.substr(paynum.length-2,1);
            }
            paynum = (paynum.toLocaleLowerCase()=="f")||paynum&1;
            if(paynum!=0){
                moneyicon = "<em></em>";
            }
        }catch(e){}
    }
    return moneyicon;
}

// ugc相关开始-------------
$(".lookugc_artist").live("click",function(){
    var url = "http://www.kuwo.cn/pc/ugc/allUpUserList?type=1&id="+$(this).attr("data-id");
    jumpToOtherUser(url);
    return false;
});
$('.j_ugcIcon').live('click',function(ev){
    var oEvent = ev||event;
    var _this = $(this);
    var musicId = _this.parents("li").attr("c-rid").replace("MUSIC_","");
    var reportName = _this.parents("li").find(".w_name").html();
    $(".ugc_artist").hide();
    $.ajax({
        url:"http://ugc.kuwo.cn/ugc/info/brief?type=1&id="+musicId,
        type:"get",
        dataType:"json",
        success:function(jsondata){
            var str = createUserTips(jsondata.data,jsondata.total,"artist",musicId);
            if(!$(".ugc_artist").html()){
                $("body").append('<div id="ugcTipsBox"></div>');
            }
            $("#ugcTipsBox").html(str).show();
            $(".ugc_tipsBox").attr("data-reportId",musicId).attr("data-reportName",reportName);
            $(".ugc_artist").css({'top':oEvent.pageY-140}).show();
            $('.sourceTips').hide();
            if(_this.hasClass("rcm_ugcIcon")){
                $(".ugc_artist").css("right",78);
            }
            $(".ugc_album").hide();
        }
    });
    return false;
});
$(".report").live("click",function(){
    var rid = $('.ugc_tipsBox').attr("data-reportId").replace("MUSIC_","");
    var name = $('.ugc_tipsBox').attr("data-reportName");
    callClientNoReturn('CoolBeanPackage?NavUrl=http://www.kuwo.cn/pc/ugc/report?name='+name+"&rid="+rid+"&type=1");
    return false;
});
$("body").live("click",function(){
    $('.ugc_tipsBox').hide();
});

function jumpToOtherUser(url, name) {
  var vuid = getValue(url, 'vuid');
  var channelInfo = 'ch:3;name:myhomepage;';
  var src = '';
  var srcKey = 'url:${netsong}';
  if (src.indexOf('http') > -1) {
    srcKey = 'url:';
  }
  src = 'homePage.html?u_id=' + vuid;
  var call = 'PageJump?param=' + encodeURIComponent(channelInfo) + ';' + encodeURIComponent(srcKey + src) + '&calljump=true';
  callClientNoReturn(call);
  // var uid = getValue(url, 'uid');
  // var vuid = getValue(url, 'vuid');
  // var channelInfo = 'ch:3;name:myhomepage;';
  // var src = '';
  // var srcKey = 'url:${netsong}';
  // if (src.indexOf('http') > -1) {
  //   srcKey = 'url:';
  // }
  // if (uid === vuid) {
  //   src = 'homePage.html';
  // } else {
  //   src = 'uploadSong.html?souces=otherhomepage&uid=' + uid + '&vuid=' + vuid + '&uname=' + name;
  // }
  // var call = 'PageJump?param=' + encodeURIComponent(channelInfo) + ';' + encodeURIComponent(srcKey + src) + '&calljump=true';
  // callClientNoReturn(call);
}
function createUserTips(data,num,from,musicid){
    var classN = "";
    var id = 0;
    if(from=="album"){
        classN = "ugc_album";
        id = albumId;
    }else{
        classN = "ugc_artist";
        id=musicid;
    };
    var time = data.upload_time;
    time = time.substring(0,time.indexOf(" "));
    var url = "uid=" +getUserID("uid")+"&vuid="+data.upload_uid;
    var str = '<div class="ugc_tipsBox '+classN+'"><div class="ugc_content"><div class="info_line1"><p class="ugc_content_desc">来源用户：<a class="userName" href="javascript:;" onclick="jumpToOtherUser(\''+url+'\')">'+
               data.nickname+
              '</a></p><a href="javascript:;" class="report fr">举报</a></div><div class="info_line2"><p class="ugc_content_desc">IP：'+
               formatIp(data.upload_ip)+
              '</p><p class="fr">时间：'+
               time+
              '</p></div><div class="info_line3"><p class="ugc_content_desc">其他上传用户：'+
               num+
              '人</p><a href="javascript:;" data-id="'+id+'" class="look'+classN+' fr">点击查看</a></div></div><span class="ugc_info_triangle_down"></span></div>';
    return str;
}
function formatIp(ip){
    var arr = ip.split(".");
    arr[1] = arr[1].replace(/\d/g,"*");
    arr[2] = arr[2].replace(/\d/g,"*");
    return arr.join(".");
}
// ugc相关结束-------------

function OnLogin(param){
    uid = getValue(param,"uid");
}
function OnLogout(){
    uid = 0;
}
