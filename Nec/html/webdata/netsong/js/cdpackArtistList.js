/**
*create by deng 2016-9
*/
$(function(){
	callClientNoReturn('domComplete');
	// centerLoadingStart();
	getCdArtistList("1");
	OnJump();
	eventbind();
	setSkin(setSkinCallback);
});
function setSkinCallback() {
	var skinColor = skinConfig.skinColor;
	$(".logo_icon i").css("-webkit-filter",`drop-shadow(${skinColor} 69px 0)`);
    $(".nav a i,.sub_nav .current").css("background",skinColor);
}
function getCdArtistList(order,char){
	var firstchar = "";
	if(char){
		firstchar = "&firstchar="+char;
	}
	var url = "http://cdapi.kuwo.cn/artist/list?order="+order+firstchar;
	$.ajax({
        url:url,
        type:"get",
		dataType:"json",
		success:function(jsondata){
			if(jsondata.status==0 && jsondata.msg=='ok'){
				var artistListData = jsondata.data.rows;
				if(order=="1"){
					artistListData = artistListData.HOT;
				}
				createCDList(artistListData);
				// centerLoadingEnd();
				cdLoadImages();
				return;
			}else if(jsondata.status==1 && jsondata.msg=='No data'){
				$(".cdListBox").html("");
				$(".page").html("");
				$('.nodataBox').show();
			}
			if(jsondata.status=='query error'){
				loadErrorPage();
			}
		},
		error:function(){
			loadErrorPage();
		}
    });
}

/**
*创建cd列表
*/
function createCDList(data){
	var model = loadTemplate('#kw_cdArtistList');
	var html = drawListTemplate(data,model,proCDArtistListData);
	$('.cdArtistListBox').html(html);
}
/**
*cd列表数据重定向
*/
function proCDArtistListData(obj){
	var json = {};
	var artistName = obj.artname;
	var artistId = obj.id;
	json = {
		'pic':obj.pic.replace('120/', '300/'),
		'artist':artistName,
		'albumCnt':obj.album_num||0,
		'click':commonClickString(new Node('9009',artistId,artistName,artistId))
	};
	return json;
}

function cdLoadImages(){
    var scrollT=document.documentElement.scrollTop||document.body.scrollTop;
	var clientH=document.documentElement.clientHeight;
	var scrollB=scrollT+clientH;
	var imgs = $('.lazy');
	imgs.each(function(i){
		if($(this).offset().top<scrollB){
			if($(this)[0].getAttribute('data-original')!=='{$pic}'){
				$(this)[0].setAttribute('src', $(this)[0].getAttribute('data-original'));
				$(this).removeClass('lazy');
			}
		}
	});
}

function eventbind(){
	$(window).scroll(function(){
  		cdLoadImages();
  	});
  	$(window).resize(function(){
  		cdLoadImages();
  	});
	$(".jumpLike").click(function(){
		$(".jumpLike label").hide();
		setDataToConfig('hificolDown','jumpLikeTips','0');
		commonClick({'source':'9005','name':'cdLikePage'});
	});
	$(".jumpDown").click(function(){
		$(".jumpDown label").hide();
		setDataToConfig('hificolDown','jumpDownTips','0');
		commonClick({'source':'9003','name':'cdDownPage'});
	});
	$(".sub_nav a").click(function(){
		var _this = $(this);
		var firstchar = _this.html().toLowerCase();
		var order = "3";
		_this.addClass("current").css("background",skinConfig.skinColor).siblings().removeClass("current").css("background",'');
		if(firstchar=="热门"){
			firstchar = "";
			order = "1";
		}else if (firstchar=="#") {
			firstchar = "%23";
		}
		getCdArtistList(order,firstchar)
	});
	$(".skinLink").live({
		"mouseenter": function(){
			$(this).css("color",skinConfig.linkColor);
		},
		"mouseleave": function(){
			$(this).css("color",'');
		}
	})
}
function OnJump(){
	if(getDataByConfig('hificolDown', 'jumpDownTips')==1){
		$(".jumpDown label").show();
	}else{
		$(".jumpDown label").hide();
	}
	if(getDataByConfig('hificolDown', 'jumpLikeTips')==1){
		$(".jumpLike label").show();
	}else{
		$(".jumpLike label").hide();
	}
}
