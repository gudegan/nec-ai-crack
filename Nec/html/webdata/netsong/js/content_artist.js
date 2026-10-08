;(function(){
	var currentObj;
	var artistId;
	var tabType;
	var psrc;
	var bread;
	var pn = 0;
	var rn = 100;
	var albumRn = 100;
	var mvRn = 80;
	var someDataObj = {};
	var artistFrom = 'def';
	var sortby = 0;
	var currentArtistName;
	var oldurl=decodeURIComponent(window.location.href).replace(/###/g,'').split('?')[0];
	var oldmsg='';
	var host_url = "https://search.kuwo.cn";
	var checkSeverTimes = 1;//检查服务次数
	var csrc;
	window.onload = function(){
		callClientNoReturn('domComplete');
		var url=decodeURIComponent(window.location.href).replace(/###/g,'');
		var msg=getUrlMsg(url);
		var searchKey = getStringKey(msg,'searchKey');
		if(searchKey!=""){
			$("body").attr("log-searchKey",searchKey);
		}
		oldmsg=msg;
		centerLoadingStart("content");
		artistId = url2data(msg,'sourceid');
		psrc = getStringKey(msg,'psrc');
		csrc = getStringKey(msg,'csrc');
		bread = getStringKey(msg,'bread');
		sortby = getStringKey(msg,'sortby') || 0;
		tabType = getStringKey(msg,'tabType') || 'song';
		pn = getStringKey(msg,'pn') || 0;
	//	createBread(currentObj,"artist");
		checkArtistServer()
		objBindFn();
	};
	// 检查服务是否通  先走search.kuwo.cn再走config里的ip 最后走代理
	function checkArtistServer(){
		var dns1 = callClient("GetConfig?section=Netsong&key=SearchServerDNS1");
		// var dns2 = callClient("GetConfig?section=Netsong&key=SearchServerDNS2");
		// var dns3 = callClient("GetConfig?section=Netsong&key=SearchServerDNS3");
		var url = dns1;
		$.ajax({
			type: "get",
			url: host_url,
			cache: false,
			timeout : 5000,
			success:function(){
				if(artistId=="client"){
				    getArtistIdByName(currentObj);
				}else{
				    getSomeData();
				}
			},
			error: function() {
				if(checkSeverTimes==2){
					var agent = 'http://'+hostConfig;//代理
					getSomeData(agent);
					return;
				}else{
					checkSeverTimes++;
					host_url = url;
				}
				checkArtistServer();
			}
		});
	}
	// 获取请求url（服务处理相关）
	function getUrl(agent,url_must,flag){
		var url_must = url_must;
		var url = host_url+url_must;
		if(agent)url = agent+url_must;
		if(flag)url = getChargeURL(url);
		url += '&thost=search.kuwo.cn'
		return url;
	}

	$(window).resize(function(){
		iframeObj.refresh();
	});
	//获取歌手简介
	function getArtistIdByName(nodeobj){
		//var url = "https://search.kuwo.cn/r.s?stype=artistinfo&artist="+encodeURIComponent(nodeobj.name);
		// getScriptData(url);
		var name = url2data(oldmsg,'name');
		var url = host_url+"/r.s?stype=artistinfo&artist="+encodeURIComponent(name)+"&encoding=utf8";
		$.ajax({
	        url:getChargeURL(url),
	        dataType:'jsonp',
			success:function(json){
				showArtistId(json);
			}
	    });
	}
	function showArtistId(jsondata){
		var data = jsondata;
		if(typeof(data)=="undefined" || data==null || typeof(data.id)=="undefined"){
			return;
		}
		artistId = data.id;
		getSomeData();
		data = null;
	}
	// 获取歌手数据
	function getSomeData(agent) {
		//var url = 'https://search.kuwo.cn/r.s?stype=artistinfo&artistid='+artistId+'&callback=getArtistInfoData';
		//getScriptData(url);
		var url_must = '/r.s?stype=artistinfo&artistid='+artistId+'&encoding=utf8';
		var url = getUrl(agent,url_must,false);
		$.ajax({
	        url:getChargeURL(url),
	        type:"get",
	        dataType:"text",
	        crossDomain:false,
			success:function(data){
				var json = eval("("+data+")");
				getArtistInfoData(json);
			},
			error:function(xhr){
				realTimeLog('ABLOG','TYPE:BADURL|'+url);

			}
	    });
		var type = tabType;
		if (type == 'song') {
			$(".selall").show();
			$(".selall_mv").hide();
	        $(".toolbar").show();
			$(".tab .song").addClass("current").siblings().removeClass("current");
			$(".tab").show();
			$(".w_song").show();
			$(".nothing").css("padding-top","50px");
			getSongList(agent);
		} else if (type == 'new') {
			artistFrom = 'new';
			$(".selall").show();
			$(".selall_mv").hide();
			$(".tab .new").addClass("current").siblings().removeClass("current");
			$(".tab").show();
			$(".w_new").show(agent);
	//		$(".selall .checkall,.sort_wrap").remove();
	        $(".toolbar").show();
	        $(".toolbar .sort_r").hide();
			$(".w_newsong").show();

			getNewList(agent);
		} else if (type == 'album') {
			$(".selall").hide();
			$(".tab .album").addClass("current").siblings().removeClass("current");
			$(".tab").show();
			$(".w_album").show();
			$(".nothing").css("padding-top","30px");
			getAlbumList(agent);
		} else if (type == 'mv') {
			$(".selall").hide();
			$(".tab .mv").addClass("current").siblings().removeClass("current");
			$(".tab").show();
			$(".w_mv").show();
			$(".nothing").css("padding-top","30px");
			getMvList(agent);
		} else if (type == 'similar') {
			$(".selall").hide();
			$(".tab .similar").addClass("current").siblings().removeClass("current");
			$(".tab").show();
			$(".w_similar").show();
			$(".nothing").css("padding-top","30px");
			getSimilarList(agent);
		} else if(type == 'info'){
		    $(".selall").hide();
		    $(".tab .info").addClass("current").siblings().removeClass("current");
			$(".tab").show();
		    $(".w_info").show();
		    $(".nothing").css("padding-top","30px");
		    iframeObj.refresh();
		}

	}


	//加载歌手信息时如果是空就给显示个——
	function changeKong(val){
		if(val==""||!val){
			return "——";
		}else{
			return val;
		}
	}

	// 创建歌手内容
	function getArtistInfoData (jsondata) {
		var data = jsondata;
		if(typeof(data.id)=="undefined"){
		    //var name = currentObj.name;
		    var name = url2data(oldmsg,'name');
		    name = checkSpecialChar(name,"disname");
		    currentArtistName = name;
		    $(".bread span").html(name);
		    $(".artist_head .name").html('<span class="allowSelect">'+name+'</span>');
		    centerLoadingEnd("content");
		    iframeObj.refresh();
		    return;
		}
		var name = data.name;
		name = checkSpecialChar(name,"disname");
		currentArtistName = name;
		if(csrc==""){
			csrc = "曲库->歌手->"+name;
		}
		$("body").attr("data-csrc",csrc+'->'+$(".tab .current").html());
		var info = data.info;
		var pic = getArtistPic(data.pic);
		pic = pic.replace("starheads/100","starheads/70");
		var likenum = data.playcnt || 0;
		$(".artist_head .pic img").attr("src",pic);
		$(".artist_head .name").html('<span class="allowSelect">'+name+'</span>');
	//	$(".artist_head .info").html(likenum + "人喜欢").show();
		$(".bread span").html(name);
		$(".like_btn").attr("c-id",artistId);
		$(".radio_btn").attr({"c-id":artistId,"c-name":name});
		//将歌手具体信息写入歌手信息内容部分
		var liObjs = $(".songer_ziliao li");
		liObjs.eq(0).find("span").html(changeKong(returnSpecialChar(data.name)));
		liObjs.eq(1).find("span").html(changeKong(data.gender));
		var oname = data.oname;
		if(oname.substr(oname.length-1,oname.length)==";"){
			oname = oname.substr(0,oname.length-1);
		}
		liObjs.eq(2).find("span").html(changeKong(oname));
		liObjs.eq(3).find("span").html(changeKong(data.country));
		liObjs.eq(4).find("span").html(changeKong(data.language.substr(0,data.language.length-1)));
		liObjs.eq(5).find("span").html(changeKong(data.birthplace));
		liObjs.eq(6).find("span").html(changeKong(data.birthday));
		liObjs.eq(7).find("span").html(changeKong(data.constellation));
		liObjs.eq(8).find("span").html(changeKong(data.tall));
		liObjs.eq(9).find("span").html(changeKong(data.weight));
		var artistInfo = data.info.replace(/&lt;br&gt;/gi,'<br/>');
		$(".lc_xiang p").html(artistInfo);
		if(tabType=="info"){
			$(".w_info").show();
		    centerLoadingEnd("content");
		    iframeObj.refresh();
		}
		getLikeStatus('4');
		if(data.musicnum&&data.musicnum!=0){
            var src = "曲库->歌手->"+name + '(' + $(".tab .current").html() + ')' + '->' + '电台->' + name;
            //console.log(src);
		    showRadio(artistId,"artist",src);
		}
	}

	// 获取歌曲列表数据
	function getSongList(agent) {
		//var url = 'https://search.kuwo.cn/r.s?stype=artist2music&artistid='+artistId+'&pn='+pn+'&rn='+rn+'&sortby='+sortby+'&callback=getSongListData&show_copyright_off=1';
		//getScriptData(getChargeURL(url));
		var url_must = '/r.s?stype=artist2music&artistid='+artistId+'&pn='+pn+'&rn='+rn+'&sortby='+sortby+'&show_copyright_off=1&alflac=1&pcmp4=1&encoding=utf8';
		var url = getUrl(agent,url_must,true);
		$.ajax({
	        url:url,
	        type:"get",
	        dataType:'text',
	        crossDomain:false,
			success:function(data){
				var json = eval("("+data+")");
				getSongListData(json);
			}
	    });

	}

	// 创建歌曲列表
	function getSongListData(jsondata) {
		var data = jsondata;
		var child = data.musiclist;
		var len = child.length;
		var arr = [];
		var currentPn = parseInt(data.pn);
		if(!currentArtistName){
			//currentArtistName = currentObj.name;
			currentArtistName = url2data(oldmsg,'name');
		}
		if(psrc==""){
		    pstr = "歌手->"+currentArtistName;
		}else if(psrc.indexOf("歌手页")>-1){
			pstr = psrc;
		}else{
			pstr = psrc+currentArtistName;
		}
		for (var i = 0; i < len; i++) {
			arr[arr.length] = createArtistMusicList(child[i],i,rn,currentPn,pstr);
		}
		var musicListStr = arr.join('');
		if (artistFrom == 'def') {
		    if(len==0){
		        $(".nothing").css("padding-top","50px").show();
		        $(".kw_music_list").hide();
		    }else if(len<2){
		        $(".w_song .kw_music_list").css("padding-bottom","20px");
		    }
			var total = data.total;
			var totalPage = Math.ceil(total/rn);
			var pageStr = createPage(totalPage, currentPn+1);
			$(".checkall font").html(total);
			$(".w_song .kw_music_list").html(musicListStr);
			if (pageStr) {
                $(".page").html(pageStr).show();
                $(".artist_list").css("margin-bottom","0")
            }
			var index = parseInt(sortby,10);
			if (index > 2) index -= 1;
			var liobj = $(".sort_wrap li").eq(index);
			var sortstr = liobj.find("a").html();
			$(".sort_wrap .sort").html('<i></i>'+sortstr);
			liobj.remove();
			$(".sort_wrap").show();
			// 歌手单曲评论入口
			init_comment_model('.channelContent',4,artistId);
		} else if (artistFrom == 'new'){
		    if(len==0){
		    	$(".newBox").hide();
		    	$(".kw_music_list").hide();
		        $(".nothing").hide();
		        $("h3").css("margin-bottom","10px");
		    }
		    $(".checkall font").html(len);
			$(".w_new .kw_music_list").html(musicListStr);
			$(".w_new .kw_music_list").prev().show();
	        var index = parseInt(sortby,10);
	        if (index > 2) index -= 1;
	        var liobj = $(".sort_wrap li").eq(index);
	        var sortstr = liobj.find("a").html();
	        $(".sort_wrap .sort").html('<i></i>'+sortstr);
	        liobj.remove();
	        $(".sort_wrap").show();
	    }
		centerLoadingEnd("content");

		//iframeObj.refresh();
	}

	// 获取歌手最新数据列表
	function getNewList(agent) {
		//var newSongUrl = 'https://search.kuwo.cn/r.s?stype=artist2music&artistid='+artistId+'&pn=0&rn=20&sortby=0&callback=getSongListData&show_copyright_off=1';
		var url_must = '/r.s?stype=artist2music&artistid='+artistId+'&pn=0&rn=20&sortby=1&show_copyright_off=1&alflac=1&pcmp4=1&encoding=utf8';
		var newSongUrl = getUrl(agent,url_must,true);
		//getScriptData(getChargeURL(newSongUrl));
		$.ajax({
	        url:newSongUrl,
	        type:"get",
	        dataType:'text',
	        crossDomain:false,
			success:function(data){
				var json = eval("("+data+")");
				getSongListData(json);
			}
	    });
		//var newAlbumUrl = 'https://search.kuwo.cn/r.s?stype=albumlist&artistid='+artistId+'&pn=0&rn=10&sortby=1&callback=getAlbumListData&show_copyright_off=1';
		var newAlbumUrl = host_url+'/r.s?stype=albumlist&artistid='+artistId+'&pn=0&rn=10&sortby=1&show_copyright_off=1&encoding=utf8';
		newAlbumUrl=getChargeURL(newAlbumUrl);
		$.ajax({
	        url:newAlbumUrl,
	        dataType:'jsonp',
	        crossDomain:false,
			success:function(json){
				getAlbumListData(json);
			}
	    });
		//getScriptData(newAlbumUrl);
		//var newMvurl = 'https://search.kuwo.cn/r.s?stype=mvlist&artistid='+artistId+'&pn=0&rn=8&sortby=1&callback=getMvListData&show_copyright_off=1';
		var newMvurl = host_url+'/r.s?stype=mvlist&artistid='+artistId+'&pn=0&rn=8&sortby=1&show_copyright_off=1&encoding=utf8';
		newMvurl=getChargeURL(newMvurl);
		$.ajax({
	        url:newMvurl,
	        dataType:'jsonp',
	        crossDomain:false,
			success:function(json){
				getMvListData(json);
			}
	    });
		//getScriptData(getChargeURL(newMvurl));
	}

	// 获取歌手专辑
	function getAlbumList(agent){
		var url_must = '/r.s?stype=albumlist&artistid='+artistId+'&pn='+pn+'&rn='+albumRn+'&sortby=1&show_copyright_off=1';
		var url = getUrl(agent,url_must,true);
		//getScriptData(url);
		$.ajax({
	        url:getChargeURL(url),
	        type : "get",
	        dataType:'text',
	        crossDomain:false,
			success:function(data){
				var json = eval("("+data+")");
				getAlbumListData(json);
			}
	    });
	}

	// 创建歌手专辑列表
	function getAlbumListData(jsondata){
		var data = jsondata;
		var child = data.albumlist;
		var len = child.length;
		var arr = [];
		var xia = 0;
		var currentPn = parseInt(data.pn);
		for (var i = 0; i < len; i++) {
			arr[xia++] = createAlbumBlock(child[i],'artist');
		}
		var albumListStr = arr.join('');

	  if($(".tab a.current").attr("c-type") == "album" ){
	      $(".toolbar").hide();
	      $(".toolbar .sort_r").hide();

	  }
		if (artistFrom == 'def') {
			if (!len && len < 1) {
				$(".nothing").css("padding-top","30px").show();
				$(".kw_music_list").hide();
				centerLoadingEnd("content");
				iframeObj.refresh();
				return;
			}
			var total = data.total;
			var totalPage = Math.ceil(total/albumRn);
			var pageStr = createPage(totalPage, currentPn+1);
			$(".w_album .kw_album_list").html(albumListStr);
			if (pageStr) $(".page").html(pageStr).show();
		} else if (artistFrom == 'new'){
			if (len == 0) return;
			$(".w_new .kw_album_list").prev().show();
			$(".w_new .kw_album_list").html(albumListStr).show();
		}
		centerLoadingEnd("content");
		iframeObj.refresh();
	}

	// 获取歌手MV
	function getMvList(agent){
		//var url = 'https://search.kuwo.cn/r.s?stype=mvlist&artistid='+artistId+'&pn='+pn+'&rn='+mvRn+'&sortby=1&callback=getMvListData&show_copyright_off=1';
		var url_must = '/r.s?stype=mvlist&artistid='+artistId+'&pn='+pn+'&rn='+mvRn+'&sortby=1&show_copyright_off=1&encoding=utf8';
		var url = getUrl(agent,url_must,true);
		$.ajax({
	        url:url,
	        type : "get",
	        dataType:'text',
	        crossDomain:false,
			success:function(data){
				var json = eval("("+data+")");
				getMvListData(json);
			}
	    });
		//getScriptData(getChargeURL(url));
	}

	// 创建歌手MV
	function getMvListData(jsondata){
		var data = jsondata;
		var child = data.mvlist;
		var len = child.length;
		var arr = [];
		var xia = 0;
		var currentPn = parseInt(data.pn);
		if(!currentArtistName){
			//currentArtistName = currentObj.name;
			currentArtistName = url2data(oldmsg,'name');
		}
		for (var i = 0; i < len; i++) {
			arr[xia++] = createMVBlock(child[i],'artist','',psrc+currentArtistName + '(歌手MV)',i);
		}
		var mvListStr = arr.join('');
		if (artistFrom == 'def') {
			if (!len && len < 1) {
				$(".nothing").css("padding-bottom","30px").show();
				$(".kw_music_list").hide();
				centerLoadingEnd("content");
				iframeObj.refresh();
				return;
			}
			var total = data.total;
			var totalPage = Math.ceil(total/mvRn);
			var pageStr = createPage(totalPage, currentPn+1);
			$(".selall_mv").show();
			$(".selall_mv .checkall font").html("共"+total+"首");
			$(".w_mv .kw_mv_list").html(mvListStr);
			if (pageStr) $(".page").html(pageStr).show();
		} else if (artistFrom == 'new'){
			if (len == 0) return;
			$(".w_new .kw_mv_list").prev().show();
			$(".w_new .kw_mv_list").html(mvListStr).show();
			//必须赋值行间样式 不然调用refresh时会重新添加class
			$('.bmv_wrap').css('marginRight',30);
		}
		centerLoadingEnd("content");
		iframeObj.refresh();
	}

	// 获取相似歌手
	function getSimilarList(agent){
		//var url = 'https://search.kuwo.cn/r.s?stype=similarartist&artistid='+artistId+'&callback=getSimilarListData';
		//getScriptData(url);
		var url_must = '/r.s?stype=similarartist&artistid='+artistId+'&encoding=utf8';
		var url = getUrl(agent,url_must,false);
		$.ajax({
	        url:getChargeURL(url),
	        type:"get",
	        dataType:'text',
	        crossDomain:false,
			success:function(data){
				var json  = eval("("+data+")");
				getSimilarListData(json);
			}
	    });
	}

	// 创建歌相似歌手列表
	function getSimilarListData(jsondata){
		var data = jsondata;
		var child = data.artistlist;
		var len = child.length;
		if (!len && len < 1) {
			$(".nothing").css("padding-top","30px").show();
			$(".kw_music_list").hide();
			centerLoadingEnd("content");
			iframeObj.refresh();
			return;
		}
		var arr = [];
		var xia = 0;
		for (var i = 0; i < len; i++) {
			arr[xia++] = createArtistBlock(child[i], 'similar',null,"about");
		}
		var similarListStr = arr.join('');
		$(".w_similar .kw_similar_list").html(similarListStr);
		centerLoadingEnd("content");
		iframeObj.refresh();
	}

	function objBindFn() {
		$(".tab a").live("click",function(){
			//var source = currentObj.source;
			//var sourceid = currentObj.sourceid;
			//var name = currentObj.name;
			//var id = currentObj.id;
			var source = url2data(oldmsg,'source');
			var sourceid = url2data(oldmsg,'sourceid');
			var name = url2data(oldmsg,'name');
			var id = url2data(oldmsg,'id');
			var type = $(this).attr("c-type");
			type == 'new' ? artistFrom = 'new' : artistFrom = 'def';
			var other = '|psrc='+psrc+'|bread='+bread+'|tabType='+type+'|pn=0|csrc='+csrc;
			commonClick(new Node(source,sourceid,name,id,'',other));
			return false;
		});

		$(".page a").live("click",function(){
			var oClass = $(this).attr("class");
			if (oClass.indexOf("no") > -1) return;
			var source = url2data(oldmsg,'source');
			var sourceid = url2data(oldmsg,'sourceid');
			var name = url2data(oldmsg,'name');
			var id = url2data(oldmsg,'id');
			// var source = currentObj.source;
			// var sourceid = currentObj.sourceid;
			// var name = currentObj.name;
			// var id = currentObj.id;
			var pn = 0;
			var goPnNum = $(this).html();
			if (goPnNum == '上一页') {
				pn = parseInt($(".page .current").html()) - 2;
			} else if (goPnNum == '下一页'){
				pn = parseInt($(".page .current").html());
			} else {
				pn = parseInt($(this).html()) -1;
			}
			var other = '|psrc='+psrc+'|bread='+bread+'|tabType='+tabType+'|pn='+pn+'|sortby='+sortby;
			commonClick(new Node(source,sourceid,name,id,'',other));
			return false;
		});

		$(".sort_wrap").live("mouseenter",function(){
			$(this).children("ul").show();
			return false;
		}).live("mouseleave",function(){
			$(this).children("ul").hide();
			return false;
		});

		$(".sort_wrap li").live("click",function(){
			var source = url2data(oldmsg,'source');
			var sourceid = url2data(oldmsg,'sourceid');
			var name = url2data(oldmsg,'name');
			var id = url2data(oldmsg,'id');
			// var source = currentObj.source;
			// var sourceid = currentObj.sourceid;
			// var name = currentObj.name;
			// var id = currentObj.id;
			var sortby = $(this).find("a").attr("c-sort");
			var other = '|psrc='+psrc+'|bread='+bread+'|tabType=song|pn=0|sortby=' + sortby;
			commonClick(new Node(source,sourceid,name,id,'',other));
			return false;
		});

		// 点击收藏 +-1
		$(".like_btn").live("click",function(){
		    var uid = getUserID("uid");
		    if (uid ==0 ){
		        return false;
		    }else{
		        var likenum = $(".artist_head .info").html().replace("人喜欢","");
		        likenum = parseInt(likenum,10);
		        if($(this).html()=="已收藏"){
		            likenum--;
		            if(likenum < 0) likenum = 0;
		        }else{
		            likenum++;
		        }
		        $(".artist_head .info").html(likenum+"人喜欢");
		    }
		});
	}
})();
