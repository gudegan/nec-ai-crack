var currentObj;
var currentTYPE;
window.onload = function() {
    centerLoadingStart("content");
    currentObj = fobj.goldjson;
    currentTYPE = currentObj.sourceid;
    if (currentTYPE == 'ALBUM') {
    	getScriptData("http://js01.kuwo.cn/star/MusicTopToday/js01/topmusic/recAlbum.js?time="+Math.random());
    } else if (currentTYPE == 'MV') {
    	getScriptData("http://js01.kuwo.cn/star/MusicTopToday/js01/topmusic/recMv.js?time="+Math.random());
    }
    objBindFn();
};

$(window).resize(function(){
	iframeObj.refresh();
});

function handleIndex(jsondata) {
    var now = new Date();
	var time = (now.getMonth()+1)+"月"+now.getDate()+"日";
    $(".datetime").html('<i></i>'+time);	
	var type = currentTYPE;
	if (type == 'ALBUM') {
		createAlbumLatest(jsondata);
	}else if (type == 'MV') {
		$(".all_playmv").show();
		createMVLatest(jsondata);
	}	
}

function createAlbumLatest(jsondata) {
	var data = jsondata;
	var child = data.jdtlist[0];
	var childList = child.list;	
	var len = childList.length;
	var name = child.name;
	var navarr = [];
	var contentarr = [];
	for (var i=0; i<len; i++){
		var obj = childList[i];
		var type = obj.type;
		var oClass = '';
		var oStyle = '';
		var name = '';
		var list = obj.data;
		var listarr = [];
		var listlen = list.length;
		if (type == 'huayu') name = '华语';
		if (type == 'oumei') name = '欧美';
		if (type == 'rihan') name = '日韩';
		if (i == 0) {
			oClass = 'current';
			oStyle = 'display:block';
		} else {
			oClass = '';
			oStyle = 'display:none';			
		}
		navarr[navarr.length] = '<a href="###" hidefocus title="';
		navarr[navarr.length] = name;
		navarr[navarr.length] = '" style="margin-right:15px;" class="';
		navarr[navarr.length] = oClass;
		navarr[navarr.length] = '"><i></i>';
		navarr[navarr.length] = name;
		navarr[navarr.length] = '</a>';
		for (var j=0; j<listlen; j++) {
			var listObj = list[j];
			listObj.source = 13;
			listarr[listarr.length] = createAlbumBlock(listObj,'index');
		}
		contentarr[contentarr.length] = '<div style="'
		contentarr[contentarr.length] = oStyle;
		contentarr[contentarr.length] = '">';
		contentarr[contentarr.length] = listarr.join('');
		contentarr[contentarr.length] = '</div>';
	}
	$(".sub_nav span").html(navarr.join(''));
	$(".kw_album_list").html(contentarr.join(''));
	centerLoadingEnd("content");
	iframeObj.refresh();	
}

function createMVLatest(jsondata) {
	var data = jsondata;
	var child = data.jdtlist[0];
	var childList = child.list;	
	var len = childList.length;
	var name = child.name;
	var navarr = [];
	var contentarr = [];
	for (var i=0; i<len; i++){
		var obj = childList[i];
		var type = obj.type;
		var oClass = '';
		var oStyle = '';
		var name = '';
		var list = obj.data;
		var listarr = [];
		var playdata = [];
		var listlen = list.length;
		if (type == 'huayu') name = '华语';
		if (type == 'oumei') name = '欧美';
		if (type == 'rihan') name = '日韩';
		if (i == 0) {
			oClass = 'current';
			oStyle = 'display:block';
		} else {
			oClass = '';
			oStyle = 'display:none';			
		}
		navarr[navarr.length] = '<a href="###" hidefocus title="';
		navarr[navarr.length] = name;
		navarr[navarr.length] = '" style="margin-right:15px;" class="';
		navarr[navarr.length] = oClass;
		navarr[navarr.length] = '"><i></i>';
		navarr[navarr.length] = name;
		navarr[navarr.length] = '</a>';
		for (var j=0; j<listlen; j++) {
			var listObj = list[j];
			MVLISTOBJ = [];
			listObj.source = 7;
			listObj.sourceid = encodeURIComponent(listObj.sourceid);
			listarr[listarr.length] = createMVBlock(listObj,'index');
			playdata[playdata.length] = MVLISTOBJ;
		}
		contentarr[contentarr.length] = '<div c-data="';
		contentarr[contentarr.length] = playdata.join(',');
		contentarr[contentarr.length] = '" style="';
		contentarr[contentarr.length] = oStyle;
		contentarr[contentarr.length] = '">';
		contentarr[contentarr.length] = listarr.join('');
		contentarr[contentarr.length] = '</div>';
	}
	$(".sub_nav span").html(navarr.join(''));
	$(".kw_album_list").html(contentarr.join(''));
	centerLoadingEnd("content");
	iframeObj.refresh();	
}

function objBindFn(){
	$(".sub_nav span a").live("click", function (){
		$(this).addClass("current").siblings().removeClass("current");
		$(".kw_album_list").children("div").hide();
		$(".kw_album_list").children("div").eq($(this).index()).show();
		iframeObj.refresh();
	});
}
