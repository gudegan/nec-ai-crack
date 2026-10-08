var currentObj;
var errorCount=0;
window.onload = function (){
    callClientNoReturn('domComplete');
	centerLoadingStart("content");
	//currentObj = fobj.goldjson;
	getSomeData(false);
    vip_expire_info();
	objBindFn();
};
$(window).resize(function() {
	iframeObj.refresh();
});
function getSomeData(flag){
	//var url = 'http://album.kuwo.cn/album/mbox/payDownload?callback=chargeZone&t=' + new Date().getTime();
	//getScriptData(url);
	if(flag){
		var url = 'http://album.kuwo.cn/album/mbox/payDownload?t=' + new Date().getTime();
	}else{
		var url = 'http://album.kuwo.cn/album/mbox/payDownload';
	}
    $.ajax({
        url:url,
        dataType:'jsonp',
        success:function(json){
            chargeZone(json);
        },
        error:function(){
        	loadErrorPage();
        }
    });
}
function chargeZone(jsondata){
    try{
    if(!jsondata||!jsondata.desc||jsondata.desc!="success"){
        //alert("error:"+obj2Str(jsondata));
    }
    var data = jsondata.data;
    var focusarray = [];
    var focusbtnarray = [];
    var focusdata = data.sliderImgs;
    if(focusdata&&focusdata.length>0){
        for(var i=0,j=focusdata.length;i<j;i++){
            var someobj = focusdata[i];
            var name = someobj.info;
            var pic = getStringKey(someobj.extend,"PIC2016") || someobj.pic;
            if(!pic){
			    pic = "";
			}
			if(pic!=""){
				pic = changeImgDomain(pic);
			}
            var source = someobj.source;
            if(sourceISOK(source)){
				continue;
			}
            var sourceid = someobj.sourceid;
            var titlename = name;
            var disname = name;
            disname = checkSpecialChar(disname,"disname");
            titlename = checkSpecialChar(titlename,"titlename");
            name = checkSpecialChar(name,"name");
            focusarray[focusarray.length] = '<a onclick="';
            focusarray[focusarray.length] = commonClickString(new Node(source,sourceid,name,0,'','|bread=-2,5,分类,-2;-400,-400,付费专区,-400|psrc=首页->付费专区->焦点图->'+name));
            focusarray[focusarray.length] = '" style="';
            focusarray[focusarray.length] = i==0?"z-index:2;":"";
            focusarray[focusarray.length] = '" hidefocus href="###" title="';
            focusarray[focusarray.length] = titlename;
            focusarray[focusarray.length] = '"><img src="';
            focusarray[focusarray.length] = pic;
            focusarray[focusarray.length] = '"></a>';
            focusbtnarray[focusbtnarray.length] = '<a class="'; 
            focusbtnarray[focusbtnarray.length] = i==0?"current":"";
            focusbtnarray[focusbtnarray.length] = '" title="';
            focusbtnarray[focusbtnarray.length] = titlename;
            focusbtnarray[focusbtnarray.length] = '" hidefocus href="###"></a>';   
        }
        $(".c_focusimg").html(focusarray.join("")); 
        $(".c_btn").html(focusbtnarray.join(""));
        $(".c_banner").show();
        initJDT();
    }
    var count = 0;
    var bangarray = [];
    var bangdata = data.playlist;
    if(bangdata&&bangdata.length>0){
        count = 0;
        bangarray[bangarray.length] = '<div class="c_bang">';
        for(var i=0,j=bangdata.length;i<j;i++){
            var someobj = bangdata[i];
            var source = someobj.source;
            var sourceid = someobj.sourceid;
            var name = someobj.info;
            var titlename = name;
            var disname = name;
            disname = checkSpecialChar(disname,"disname");
            titlename = checkSpecialChar(titlename,"titlename");
            name = checkSpecialChar(name,"name");
            var pic = someobj.pic;
            if(!pic){
			    pic = "";
			}
			if(pic!=""){
				pic = changeImgDomain(pic);
			}
			var click = commonClickString(new Node(source,sourceid,name,sourceid,'','|psrc=首页->付费专区->榜单->|bread=-2,5,分类,-2;-400,-400,付费专区,-400'));
            bangarray[bangarray.length] = '<div class="c_bang_con" onclick="';
            bangarray[bangarray.length] = click;
            bangarray[bangarray.length] = '" title="';
            bangarray[bangarray.length] = titlename;
            bangarray[bangarray.length] = '"><a href="###" hidefocus class="c_bang_img"><img width="120" height="120" onerror="imgOnError(this,120);" src="';
            bangarray[bangarray.length] = pic;
            bangarray[bangarray.length] = '" /></a><ul>';
		    var musiclist = someobj.musics;
		    for(var m=0,n=musiclist.length;m<n;m++){
		        if(m>2){
		            break;
		        }
		        var mobj = musiclist[m];
		        var mname = mobj.name;
		        if(mname.length>9){
		            mname = mname.substr(0,9)+"...";
		        }
		        bangarray[bangarray.length] = '<li><span>';
		        bangarray[bangarray.length] = (m+1);
		        bangarray[bangarray.length] = '</span>';
		        bangarray[bangarray.length] = checkSpecialChar(mname,"disname");
		        bangarray[bangarray.length] = ' - ';
		        bangarray[bangarray.length] = checkSpecialChar(mobj.artist,"disname");
		        bangarray[bangarray.length] = '</li>';
		    }             
            bangarray[bangarray.length] = '</ul></div>';
        }
        bangarray[bangarray.length] = '</div>';
    }
    var albumarray = [];
    var albumdata = data.hotAlbumList;
    if(albumdata&&albumdata.length>0){
        count = 0;
        albumarray[albumarray.length] = '<div class="c_comm"><div class="c_head">畅销专辑</div><ul class="c_list">';
        for(var i=0,j=albumdata.length;i<j;i++){
            var someobj = albumdata[i];
            var source = 13;
            var sourceid = someobj.albumid;
            var name = someobj.name;
            var disname = name;
            var titlename = name;
            disname = checkSpecialChar(disname,"disname");
            titlename = checkSpecialChar(titlename,"titlename");
            name = checkSpecialChar(name,"name");
            var artist = someobj.artist;
            var pic = someobj.pic;
            if(!pic){
			    pic = "";
			}
			if(pic!=""){
				pic = changeImgDomain(pic);
			}
            var iconclass = "";
            if(count<3){
                iconclass = "c_icon0"+(i+1);
            }
            if(count>4){
                break;
            }
            count++;
            var click = commonClickString(new Node(source,sourceid,name,0,'','|psrc=首页->付费专区->畅销专辑->'+name));
            albumarray[albumarray.length] = '<li class="b_wrap"><span class="c_icon ';
            albumarray[albumarray.length] = iconclass;
            albumarray[albumarray.length] = '"></span><a onclick="';
            albumarray[albumarray.length] = click;
            albumarray[albumarray.length] = '" hidefocus href="###" class="b_pic" title="';
            albumarray[albumarray.length] = titlename;
            albumarray[albumarray.length] = '"><span class="b_shade"></span><i onclick="iPlay(arguments[0],13,';
            albumarray[albumarray.length] = sourceid;
            albumarray[albumarray.length] = ',this);return false;" data-ipsrc="';
            albumarray[albumarray.length] = '首页->付费专区->畅销专辑->'+name;
            albumarray[albumarray.length] = '" title="直接播放" class="i_play"></i><img width="120" height="120" src="';
            albumarray[albumarray.length] = default_img;
            albumarray[albumarray.length] = '" class="lazy" onerror="imgOnError(this,120);" data-original="';
            albumarray[albumarray.length] = pic;
            albumarray[albumarray.length] = '" /></a><p class="b_name"><a onclick="';
            albumarray[albumarray.length] = click;
            albumarray[albumarray.length] = '" href="###" hidefocus title="';
            albumarray[albumarray.length] = titlename;
            albumarray[albumarray.length] = '">';
            albumarray[albumarray.length] = disname;
            albumarray[albumarray.length] = '</a></p><p class="b_info"><a onclick="';
            albumarray[albumarray.length] = click;
            albumarray[albumarray.length] = '" hidefocus href="###" title="';
            albumarray[albumarray.length] = checkSpecialChar(artist,"titlename");
            albumarray[albumarray.length] = '">';
            albumarray[albumarray.length] = checkSpecialChar(artist,"disname");
            albumarray[albumarray.length] = '</a></p></li>';
        }
        albumarray[albumarray.length] = '</ul></div>';
    }
    var artistarray = [];
    var artistdata = data.cxStarList;
    if(artistdata&&artistdata.length>0){
        artistarray[artistarray.length] = '<div class="c_comm"><div class="c_head">畅销歌手</div><ul class="c_list">';
        count = 0;
        for(var i=0,j=artistdata.length;i<j;i++){
            var someobj = artistdata[i];
            var source = 4;
            var sourceid = someobj.id;
            var name = someobj.name;
            var disname = name;
            var titlename = name;
            disname = checkSpecialChar(disname,"disname");
            titlename = checkSpecialChar(titlename,"titlename");
            name = checkSpecialChar(name,"name");
            var info = "共"+(someobj.music_num||10)+"首歌曲";
            var pic = someobj.pic;
            pic = pic.replace('starheads/100','starheads/120');
            if(!pic){
			    pic = "";
			}
			if(pic!=""){
				pic = changeImgDomain(pic);
			}
            var iconclass = "";
            if(count<3){
                iconclass = "c_icon0"+(i+1);
            }
            if(count>4){
                break;
            }
            var click = commonClickString(new Node(source,sourceid,name,0,'','|psrc=首页->付费专区->畅销歌手->'));
            count++;
            artistarray[artistarray.length] = '<li class="b_wrap"><span class="c_icon ';
            artistarray[artistarray.length] = iconclass;
            artistarray[artistarray.length] = '"></span><a onclick="';
            artistarray[artistarray.length] = click;
            artistarray[artistarray.length] = '" hidefocus href="###" class="b_pic" title="';
            artistarray[artistarray.length] = titlename;
            artistarray[artistarray.length] = '"><span class="b_shade"></span><i onclick="iPlay(arguments[0],4,';
            artistarray[artistarray.length] = sourceid;
            artistarray[artistarray.length] = ',this);return false;" data-ipsrc="';
            artistarray[artistarray.length] = '首页->付费专区->畅销歌手->'+name;
            artistarray[artistarray.length] = '" title="直接播放" class="i_play"></i><img width="120" height="120" src="';
            artistarray[artistarray.length] = default_img;
            artistarray[artistarray.length] = '" class="lazy" onerror="imgOnError(this,120);" data-original="';
            artistarray[artistarray.length] = pic;
            artistarray[artistarray.length] = '" /></a><p class="b_name"><a onclick="';
            artistarray[artistarray.length] = click;
            artistarray[artistarray.length] = '" href="###" hidefocus title="';
            artistarray[artistarray.length] = titlename;
            artistarray[artistarray.length] = '">';
            artistarray[artistarray.length] = disname;
            artistarray[artistarray.length] = '</a></p><p class="b_info"><a onclick="';
            artistarray[artistarray.length] = click;
            artistarray[artistarray.length] = '" hidefocus href="###" title="';
            artistarray[artistarray.length] = info;
            artistarray[artistarray.length] = '">';
            artistarray[artistarray.length] = info;
            artistarray[artistarray.length] = '</a></p></li>';
        }
        artistarray[artistarray.length] = '</ul></div>';
    }
    var accessarray = [];
    var accessdata = data.newStarList;
    if(accessdata&&accessdata.length>0){
        accessarray[accessarray.length] = '<div class="c_comm"><div class="c_head">最新入驻</div><ul class="c_list">';
        count = 0;
        for(var i=0,j=accessdata.length;i<j;i++){
            var someobj = accessdata[i];
            var source = 4;
            var sourceid = someobj.id;
            var name = someobj.name;
            var disname = name;
            var titlename = name;
            disname = checkSpecialChar(disname,"disname");
            titlename = checkSpecialChar(titlename,"titlename");
            name = checkSpecialChar(name,"name");
            var info = "共"+(someobj.music_num||10)+"首歌曲";
            var pic = someobj.pic;
            if(!pic){
			    pic = "";
			}
			if(pic!=""){
				pic = changeImgDomain(pic);
			}
            if(count>4){
                break;
            }
            var click = commonClickString(new Node(source,sourceid,name,0,'','|psrc=首页->付费专区->最新入驻->'));
            count++;
            accessarray[accessarray.length] = '<li class="br_wrap"><a onclick="';
            accessarray[accessarray.length] = click;
            accessarray[accessarray.length] = '" hidefocus href="###" class="br_pic" title="';
            accessarray[accessarray.length] = titlename;
            accessarray[accessarray.length] = '"><span class="br_shade"></span><img width="120" height="120" src="';
            //<i class="i_play" title="直接播放"></i>
            accessarray[accessarray.length] = radio_default_img;
            accessarray[accessarray.length] = '" class="lazy" onerror="imgOnError(this,120);" data-original="';
            accessarray[accessarray.length] = pic;
            accessarray[accessarray.length] = '" width="90" height="90" /></a><p class="br_name"><a onclick="';
            accessarray[accessarray.length] = click;
            accessarray[accessarray.length] = '" href="###" hidefocus title="';
            accessarray[accessarray.length] = titlename;
            accessarray[accessarray.length] = '">';
            accessarray[accessarray.length] = disname;
            accessarray[accessarray.length] = '</a></p><p class="br_info"><a onclick="';
            accessarray[accessarray.length] = click;
            accessarray[accessarray.length] = '" hidefocus href="###" title="';
            accessarray[accessarray.length] = info;
            accessarray[accessarray.length] = '">';
            accessarray[accessarray.length] = info;
            accessarray[accessarray.length] = '</a></p></li>';
        }
        accessarray[accessarray.length] = '</ul></div>';
    }
    $("#c_content").html(bangarray.join("")+albumarray.join("")+artistarray.join("")+accessarray.join(""));
    if($('body').height()==0){
    	getSomeData(true);
    }
    centerLoadingEnd("content");
	iframeObj.refresh();
    }catch(e){
        if(errorCount>0){
            loadErrorPage();
            return;
        }
        errorCount++;
        getSomeData(true);
    }
}
function objBindFn() {
	$("#focusImg").mouseenter(function (){
        $(this).find("i").show();
    });
    $("#focusImg").mouseleave(function (){
        $(this).find("i").hide();
    });
}
var jdtFocus = 1;
var jdtTimer;
var jdtTotal;
// 焦点图轮播
var initFirst = true;
function initJDT() {
    jdtTotal = $("#w_focus>a").size();
    jdtFocus = 1;
    checkJDTPlay(0)
    beginTimer();
    if(initFirst){
        bindJDT();
        initFirst = false;
    }
}
function checkJDTPlay(index){
    return;
    var firstsource = $("#w_focus>a").eq(index).attr("data-source");
    var firstsourceid = $("#w_focus>a").eq(index).attr("data-sourceid");
    var firstname = $("#w_focus>a").eq(index).attr("data-name");
    if (firstsource == 1 || firstsource == 4 || firstsource == 8 || firstsource == 12 || firstsource == 13 || firstsource == 21) {
        $("#focusplay").html('<a data-source="' + firstsource + '" data-sourceid="' + firstsourceid + '" data-name="'+firstname+'" href="###" hidefocus></a>').show();
    } else {
        $("#focusplay").html("").hide();
    }
}
function beginTimer(a) {
    clearTimeout(jdtTimer);
    jdtTimer = setTimeout(function () {
        jdtFocus++;
        if (jdtFocus > jdtTotal) {
            jdtFocus = 1;
        }
        gotoJDT();
        beginTimer();
    }, 5000);
}
var lastFocus = 1;
function gotoJDT() {
    $("#w_focus>a").css("z-index",1);
    $("#w_focus>a").eq(lastFocus-1).css("z-index",2);
    lastFocus = jdtFocus;
    $("#w_focus>a").eq(jdtFocus - 1).css("z-index",jdtTotal+1).find("img").hide();
    $("#w_focus>a").eq(jdtFocus - 1).find("img").fadeIn(500);
    $("#focus_btn a").eq(jdtFocus - 1).addClass("current").siblings().removeClass("current");
    checkJDTPlay(jdtFocus-1);
}
function bindJDT() {
    $("#lxNext").click(function () {
        jdtFocus++;
        if (jdtFocus > jdtTotal) {
            jdtFocus = 1;
        }
        clearTimeout(jdtTimer);
        gotoJDT();
    });
    $("#lxPre").click(function () {
        jdtFocus--;
        if (jdtFocus == 0 ) {
            jdtFocus = jdtTotal;
        }
        clearTimeout(jdtTimer);
        gotoJDT();
    });
    $("#w_focus>a").live("mouseenter",function () {
        clearTimeout(jdtTimer);
    });
    $("#focus_btn a").live("mouseenter",function () {
        if(jdtFocus == $(this).index() + 1){
            clearTimeout(jdtTimer);
            return;
        }
        jdtFocus = $(this).index() + 1;
        clearTimeout(jdtTimer);
        gotoJDT();
    });
    $("#focus_btn,#w_focus>a,#lxNext,#lxPre").live("mouseleave",function () {
        beginTimer();
    });
}

function vip_expire_info(){
    var uid = getUserID('uid');
    $.ajax({
        url:"http://vip1.kuwo.cn/vip/v2/user/vip?op=gvsi&src=mbox&uid="+uid,
        dataType:"json",
        type:"get",
        crossDomain:false,
        success:function(json){
            var user_data = eval('('+json.data+')');
            if(user_data.vipExpire){
                $('.c_open a').html('音乐包续费');
            }
        }
    });
}

function OnLogin(){
    vip_expire_info();
}

function OnLogout(){
    vip_expire_info();
}