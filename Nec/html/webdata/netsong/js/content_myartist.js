window.onload = function(){
	callClientNoReturn('domComplete');
	centerLoadingStart("content");
	getSomeData();
};

function getSomeData() {
	var uid = getUserID("uid")||189717561;
    var url = 'http://artistfeeds.kuwo.cn/qz.s?uid='+uid+'&type=get_like_list&digest=4&start=0&count=100000&f=web&prod='+getVersion()+'&corp=kuwo';
	$.ajax({
        url:url,
        dataType:"text",
        type:"get",
        crossDomain:false,
        success:function(jsondata){
            var data = eval('('+jsondata+')');
            getMyArtistData(data);    
        },
        error:function(){
        }
    });
}

function getMyArtistData(jsondata) {
	var data = jsondata;
	var child = data.data;
	var len = child.length;
	if (!len && len < 1) {
		//var t = $(fobj.window).height() / 2 - 150;
		$(".nothing_myartist").css("margin-top","64px").show();
		centerLoadingEnd("content");
		iframeObj.refresh();		
		return;
	}
	var arr = [];
	for (var i=0; i<len; i++) {
		arr[arr.length] = createArtistBlock (child[i], 'myartcontent');
	}
	$(".kw_album_list").html(arr.join(''));
	centerLoadingEnd("content");
	iframeObj.refresh();
}