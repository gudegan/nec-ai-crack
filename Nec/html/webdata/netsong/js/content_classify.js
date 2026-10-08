;(function(){
	var currentObj={};
	var psrc;
	var bread;
	var pn;
	var rn = 100;
	var gedanRn = 100;
	var tabType;
	var currentName;
	var oldurl=decodeURIComponent(window.location.href).replace(/###/g,'').split('?')[0];
	var oldmsg='';
	var from = '';//create by deng 判断来源是否为专区
	var status = '';//专区电台 by deng
	var radioid = 0;//专区电台 by deng
	var isMv = false;//判断是否有mv
	var csrc;
	window.onload = function(){
		callClientNoReturn('domComplete');
		var url=decodeURIComponent(window.location.href).replace(/###/g,'');
		var msg=getUrlMsg(url);
		if(url.indexOf("电台")>-1){
			var call = "GetRadioNowPlaying";
			var str = callClient(call);
			status = getValue(str,'playstatus');
			radioid = getValue(str,'radioid');
		}
		oldmsg=msg;
		centerLoadingStart("content");
		sourceid = url2data(msg,'sourceid');
		name = getValue(msg,'name');
		id = url2data(msg,'id');
		other = getStringKey(msg,'other');
		psrc = getStringKey(msg,'psrc');
		csrc = getStringKey(msg,'csrc').replace("&from=area","");
		bread = getStringKey(msg,'bread');
		tabType = getStringKey(msg,'tabType') || 'classify';
		from = getStringKey(msg,'from')||'';//create by deng 判断来源是否为专区
		pn = getStringKey(msg,'pn') || 0;
		var currentMsg={
			source:40,
			sourceid:sourceid,
			name:name,
			id:id,
			other:other
		}
		currentObj = currentMsg;
	    $("body").attr("data-csrc",csrc);

		//currentObj = fobj.goldjson;
		//commonObj = currentObj;
		//commonObj.source = 40;
	//	psrc = getStringKey(currentObj.other,'psrc') || '';
	//	bread = getStringKey(currentObj.other,'bread') || '';
	//	pn = getStringKey(currentObj.other,'pn') || 0;
	//	tabType = getStringKey(currentObj.other,'tabType') || '';
		if(getStringKey(msg,'from')=="classifyTag"){
			getNewGeDanList();
		}else{
			getSomeData();
		}
		objBindFn();
		setSkin();
	};

	$(window).resize(function() {
		iframeObj.refresh();
	});
	// 获取新分类歌单数据
	function getNewGeDanList(){
		var url = 'http://www.kuwo.cn/www/categoryNew/getPlayListInfoUnderCategory?type=taglist&digest=10000&id='+sourceid+'&start='+pn*100+'&count='+gedanRn;
		var d = new Date();
	    var time = d.getYear()+d.getMonth()+d.getDate()+d.getHours()+parseInt((d.getMinutes()/20));
	    time = ''+d.getYear()+d.getMonth()+d.getDate()+time;
	    url = url+"&ttime="+time;
	    var cclassifystrattime=new Date().getTime();
		$.ajax({
	        url:url,
	        dataType:'json',
	        type:'get',
			success:function(json){
				var endtime=new Date().getTime()-cclassifystrattime;
	            realTimeLog("WEBLOG","url_time:"+endtime+";"+"qukutree"+";"+url);
	            realShowTimeLog(url,1,endtime,0,0);
	            var data = json.data[0];
	            var total = data.total;
				var totalPage = Math.ceil(total/gedanRn);
				var currentPn = parseInt(data.start/100);
				var pageStr = createPage(totalPage, currentPn+1);
	            var someObj = {};
				someObj.psrc = psrc + name + '->';
				someObj.bread = bread + ';5,' + data.id + ',' + name + ',0';
				someObj.csrc = $("body").attr("data-csrc");
	            var arr = [];
	            var list = data.data||[];
				for(var i=0;i<list.length;i++){
					arr[arr.length] = createPlaylistBlock(list[i],'newClassifyTag',false,someObj);
				}
				$(".classify_head .name").html(name);
				$(".kw_album_list").html(arr.join('')).show();
				if (pageStr) $(".page").html(pageStr).show();
				centerLoadingEnd("content");
				iframeObj.refresh();
			},
	        error:function(xhr){
	            var endtime=new Date().getTime()-cclassifystrattime;
	            loadErrorPage();
	            var httpstatus = xhr.status;
	            if(typeof(httpstatus)=="undefined"){
	                httpstatus = "-1";
	            }
	            var sta = httpstatus.toString();
	            realTimeLog("WEBLOG","url_error:"+sta+";qukutree;"+url);
	            webLog("请求失败,url:"+url);
	            realShowTimeLog(url,0,endtime,sta,0);
	        }
	    });
	}
	// 获取分类数据
	function getSomeData() {
	    var url = 'http://qukudata.kuwo.cn/q.k?op=query&cont=ninfo&node='+sourceid+'&pn=0&rn=1&fmt=json&src=mbox&level=2';
		var d = new Date();
	    var time = d.getYear()+d.getMonth()+d.getDate()+d.getHours()+parseInt((d.getMinutes()/20));
	    time = ''+d.getYear()+d.getMonth()+d.getDate()+time;
	    url = url+"&ttime="+time;
	    var cclassifystrattime=new Date().getTime();
		$.ajax({
	        url:url,
	        dataType:'json',
	        type:'get',
			success:function(json){
				var endtime=new Date().getTime()-cclassifystrattime;
	            realTimeLog("WEBLOG","url_time:"+endtime+";"+"qukutree"+";"+url);
	            realShowTimeLog(url,1,endtime,0,0);
				getClassifyInfoData(json);
				if($(".tab").css("position")=="static"){
	                $("body").attr("data-csrc",csrc+'->'+$(".tab .current").html());
	            }
			},
	        error:function(xhr){
	            var endtime=new Date().getTime()-cclassifystrattime;
	            loadErrorPage();
	            var httpstatus = xhr.status;
	            if(typeof(httpstatus)=="undefined"){
	                httpstatus = "-1";
	            }
	            var sta = httpstatus.toString();
	            realTimeLog("WEBLOG","url_error:"+sta+";qukutree;"+url);
	            webLog("请求失败,url:"+url);
	            realShowTimeLog(url,0,endtime,sta,0);
	        }
	    });
	}

	// 创建分类内容
	function getClassifyInfoData(jsondata) {
		var data = jsondata;
		var name = data.ninfo.name;
		name = name.replace(/&/g,"&amp;");
		currentName = name;
		var likeNum = data.ninfo.like;
		var pic = data.ninfo.pic5 || data.ninfo.pic || data.ninfo.pic2 || 'img/def60.jpg';
		var child = data.child;
		$(".classify_head .pic img").attr("src",pic);
		$("h2").html(name);
		$(".common_list").hide();
		if (!tabType && (child[0].source == 8 || child[0].source == 12)) {
			tabType = 'song';
			$(".tab").css({"position":"static","left":"0px"});
			$(".tab").find("a").show();
		} else if (!tabType && (child[0].source != 8 || child[0].source != 12)) {
			tabType = 'classify';
		} else if (tabType && (child[0].source == 8 || child[0].source == 12)  ) {
		    $(".tab").css({"position":"static","left":"0px"});
			$(".tab").find("a").show();
		} else if (tabType && (child[0].source != 8 || child[0].source != 12)) {
		}

		if (tabType == 'song' && currentObj.source == 40) {
	        $(".selall").css("visibility","visible");
			$(".tab").css({"position":"static","left":"0px"});
	        $(".toolbar").show()
			$(".tab .song").addClass("current").siblings().removeClass("current");
			getSongList(child[0].sourceid);
		} else if (tabType == 'classify' && currentObj.source == 40 && !(child[0].source == 8 || child[0].source == 12) ) {
	        $(".classify_head .pic img").attr("src",pic)
	        $(".classify_head .pic").show().parent().css({"background-color":"#f1f2f2","margin-bottom":30,"margin-top":23})
			$(".tab .classify").addClass("current").siblings().removeClass("current");
	        $(".toolbar").hide()
			getGedanList();
		} else {

	        $(".tab .classify").addClass("current").siblings().removeClass("current");
			$(".toolbar").hide();
			$(".selall").css("visibility","hidden");
			getGedanList();
		}
		//create by deng 专区
		if(from=="area"){
			$(".classify_head").css({"background-color":"#fff","margin-bottom":0,"margin-top":0});
			$(".classify_head .pic").remove();
		}
		iframeObj.refresh();
	}

	function getSongList(sourceid) {
		var url = 'http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid='+sourceid+'&pn='+pn+'&rn='+rn+'&encode=utf-8&keyset=pl2012&identity=kuwo&pcmp4=1&newver=1';
		//getScriptData(getChargeURL(url));
		url = getChargeURL(url);
		$.ajax({
	        url:url,
	        dataType:'jsonp',
	        crossDomain:false,
			success:function(json){
				getSongListData(json);
			}
	    });
	}

	function getSongListData(jsondata){
		var data = jsondata;
		var child = data.musiclist||[];
		var len = child.length;
		var arr = [];
		var total = data.total;
		var totalPage = Math.ceil(total/rn);
		var currentPn = parseInt(data.pn);
		var pageStr = createPage(totalPage, currentPn+1);
		var musicNum = 0;
		if (len < 1) {
			$(".kw_music_list").hide();
		    $(".w_nothing").html($(".nothing").css("padding-top","50px").show());
		}
		for (var i = 0; i < len; i++) {
			var online = child[i].online;
			if(typeof(online)!="undefined"&&online.length==1&&online==0){
				continue;
			}
			arr[arr.length] = createGedanMusicList(child[i],musicNum,rn,currentPn,psrc+currentName);
			musicNum++;
		}
		$(".checkall font").html(total);
		if (pageStr) $(".page").html(pageStr).show();
		$(".kw_music_list").html(arr.join('')).show();
		centerLoadingEnd("content");
		iframeObj.refresh();
	}

	function getGedanList() {
		var url = 'http://qukudata.kuwo.cn/q.k?op=query&cont=ninfo&node='+sourceid+'&pn='+pn+'&rn='+gedanRn+'&fmt=json&src=mbox&level=2';
		//getScriptData(url);
		var d = new Date();
	    var time = d.getYear()+d.getMonth()+d.getDate()+d.getHours()+parseInt((d.getMinutes()/20));
	    time = ''+d.getYear()+d.getMonth()+d.getDate()+time;
	    url = url+"&ttime="+time;
	    var cclassifystrattime=new Date().getTime();
		$.ajax({
	        url:url,
	        dataType:'jsonp',
	        crossDomain:false,
			success:function(json){
				var endtime=new Date().getTime()-cclassifystrattime;
	            realTimeLog("WEBLOG","url_time:"+endtime+";"+"qukutree"+";"+url);
	            realShowTimeLog(url,1,endtime,0,0);
				getGedanListData(json);
			},
	        error:function(xhr){
	            var endtime=new Date().getTime()-cclassifystrattime;
	            loadErrorPage();
	            var httpstatus = xhr.status;
	            if(typeof(httpstatus)=="undefined"){
	                httpstatus = "-1";
	            }
	            var sta = httpstatus.toString();
	            realTimeLog("WEBLOG","url_error:"+sta+";qukutree;"+url);
	            webLog("请求失败,url:"+url);
	            realShowTimeLog(url,0,endtime,sta,0);
	        }
	    });
	}

	function getGedanListData(jsondata) {
		var data = jsondata;
		var source = data.ninfo.source;
		var sourceid = data.ninfo.id;
		var name = data.ninfo.name;
		var disname = data.ninfo.disname;
		var child = data.child||[];
		var len = child.length;
		var arr = [];
		var total = data.total;
		var someObj = {};
		someObj.psrc = psrc + disname + '->';
		someObj.bread = bread + ';' + source + ',' + sourceid + ',' + name + ',0';
		someObj.csrc = $("body").attr("data-csrc");
		for (var i = 0; i < len; i++) {
			if (child[i].source == 8 || child[i].source == 12) {
				arr[arr.length] = createPlaylistBlock(child[i],'classify',false,someObj);
			} else if (child[i].source == 5) {
				arr[arr.length] = createClassifyBlock(child[i],someObj,from);
			} else if (child[i].source == 13) {
				arr[arr.length] = createAlbumBlock(child[i]);
			} else if (child[i].source == 4) {
				arr[arr.length] = createArtistBlock(child[i],"area");//create by deng 专区需要歌手
			} else if (child[i].source == 9) {
        var radiocsrc = $('body').attr('data-csrc');
				arr[arr.length] = createRadioBlock (child[i], 'area', 0,i,null,radiocsrc)//create by deng 专区需要电台
			} else if(child[i].source == 14){
				arr[arr.length] = createMVGedanBlock(child[i],'area',{});//create by deng 专区需要mv歌单
			}else if(child[i].source == 7){
				arr[arr.length] = createMVBlock(child[i],'area','','专区->',i);//create by deng 专区需要mv
				isMv = true;
			}else {
				total -= 1;
			}
		}
		var totalPage = Math.ceil(total/gedanRn);
		var currentPn = parseInt(data.pn);
		var pageStr = createPage(totalPage,(currentPn+1));
		if (pageStr) $(".page").html(pageStr).show();
		$(".page .current").css("background",skinConfig.skinColor);
		if(!isMv){
			$(".kw_album_list").html(arr.join('')).show();
		}else{
			$(".kw_mv_list").html(arr.join('')).show();
			$(".selall").hide();
			$(".selall_mv").show();
			$(".selall_mv font").html("共"+data.total+"首");
		}
		if (radioid) {
			initRadioStatus(parseInt(status,10),radioid);
		}
		centerLoadingEnd("content");
		iframeObj.refresh();
	}
	function objBindFn() {
		$(".tab a").live("click",function(){
//			var source = currentObj.source;
//			var sourceid = currentObj.sourceid;
//			var name = currentObj.name;
//			var id = currentObj.id;
			var source = url2data(oldmsg,'source');
			var sourceid = url2data(oldmsg,'sourceid');
			var name = url2data(oldmsg,'name');
			var id = url2data(oldmsg,'id');
			var type = $(this).attr("c-type");
			var index = $(this).index();
			type == 'song' ? type = 'song' : type = 'classify';
			var other = '|psrc='+psrc+'|bread='+bread+'|tabType='+type+'|pn=0|csrc='+csrc;

			commonClick(new Node(source,sourceid,name,id,'',other));
			return false;
		});

		$(".page a").live("click",function(){
			var oClass = $(this).attr("class");
			if (oClass.indexOf("no") > -1) return;
//			var source = currentObj.source;
//			var sourceid = currentObj.sourceid;
//			var name = currentObj.name;
//			var id = currentObj.id;
			var source = url2data(oldmsg,'source');
			var sourceid = url2data(oldmsg,'sourceid');
			var name = getValue(oldmsg,'name');
			var id = url2data(oldmsg,'id');
			var pn = 0;
			var goPnNum = $(this).html();
			if (goPnNum == '上一页') {
				pn = parseInt($(".page .current").html()) - 2;
			} else if (goPnNum == '下一页'){
				pn = parseInt($(".page .current").html());
			} else {
				pn = parseInt($(this).html()) -1;
			}
			var other = '|psrc='+psrc+'|bread='+bread+'|tabType='+tabType+'|pn='+pn+'|csrc='+csrc;
			var url=decodeURIComponent(window.location.href);
      $(window).scrollTop(0);
			commonClick(new Node(source,sourceid,name,id,'',other,"area"));
			return false;
		});
		$(".br_pic").live("mouseenter",function(){
			if ($(this).hasClass("on")) return;
			$(this).addClass("on");
			var status = $(this).attr("c-status");
			var someClass = $(this).parent().attr('class');
			var s = someClass.indexOf("radio_");
			var id = someClass.substring(s + 6);
			var stopicon = '';
			var click = '';
			if (status == 1) {
				click = 'stopRadio(arguments[0],\''+id+'\',true);';
				stopicon = '<i title="暂停播放" onclick="" class="radio_pause"></i>';
				$(this).find(".radio_pause").remove();
				$(this).find(".radio_play").remove();
			} else if (status == 2)	{
				click = 'continueRadio(arguments[0],\''+id+'\',true);';
				stopicon = '<i title="继续播放" onclick="" class="radio_start"></i>';
				$(this).find(".radio_start").remove();
				$(this).find(".radio_stop").remove();
			}else {
			    stopicon = '<i title="直接播放" onclick="" class="radio_start"></i>';
			    click = $(this).attr('_onclick');
			}
			$(this).append(stopicon);
			$(this).removeAttr('onclick');
			$(this).unbind("click").bind("click", function () {
                if (status != 2 && status != 1 && status != 4) {
			        if ($(this).hasClass('on')) {
			            $(this).removeClass('on');
			        }
			    }
				eval(click);
			});
			return false;
		});

		$(".br_pic").live("mouseleave",function(){
			$(this).removeClass("on");
			$(this).find(".radio_pause").remove();
			$(this).find(".radio_start").remove();
			var status = $(this).attr("c-status");
			if (status == 1) {
				var stopicon = '<img class="radio_play" src="img/radio_play.gif">';
				$(this).find(".radio_play").remove();
				$(this).find(".i_play").hide();
				$(this).append(stopicon);
			} else if (status == 2)	{
				var playicons = '<i class="radio_stop"></i>';
				$(this).find(".radio_stop").remove();
				$(this).find(".i_play").hide();
				$(this).append(playicons);
			}
			return false;
		});
	}
})();
