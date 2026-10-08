var payObj;
var userObj;
var tryTimes = 0;
function showPayinfo(){
    var rid = musicobj.rid;
    rid = rid.replace("MUSIC_","");
    var uid = getUserID("uid");
    var kid = getUserID("kid");
    var param = "";
    if(uid=="0"){
    	var virtualUid = getVirtualUid("viruid");
    	if(virtualUid!="0"){
    		param = "&uid="+virtualUid+"&sid="+getVirtualUid("virsid")+"&accttype=1";
    	}
    }else{
    	param = "&uid="+uid+"&sid="+getUserID("sid");
    }
    var url = "http://musicpay.kuwo.cn/music.pay?op=query&apiversion=1&feeTypeVer=4&src=mbox"+param+"&ver="+getVersion()+"&appuid="+kid+"&filter=no&action=download&ids="+rid+"&signver=new&time="+Math.random();
    $.ajax({
        url:url,
		dataType:"text",
		type:"get",
		crossDomain:false,
		success:function(paydata){
			realTimeLog('MUSIC_PAY_DETAIL','DATA:'+encodeURIComponent(paydata)+'|PAGE:single_download');
		    if(!paydata||paydata.indexOf('"ok"')<0){
		        $(".w_loading").html('<a href="###" onclick="window.location.reload();return false;">点此刷新</a>');
		        return;
		    }
		    var obj = eval('('+paydata+')');  
		    if(obj.result&&obj.result=="ok"&&obj.songs){
		        payObj = obj.songs[0];
		        if(obj.user){
		            getUser(obj.user);
				}
				var parent = $("input:checked").parents('.d_music_right');
		        var hq = parent.find("span").html() || $(".select-display-text").html();
		        checkPayinfo(hq);
		    }  
		},
		error:function(){
			if(tryTimes < 2){
				tryTimes++;
				showPayinfo();
			}else{
				$(".w_loading").html('<a href="###" onclick="window.location.reload();return false;">点此刷新</a>');
            	realTimeLog("ABLOG","TYPE:musicpay_error|SUBTYP:download_single1");
				forceDownload();
			}
		}
	});
}
// 获取虚拟id  用于免登陆付费
function getVirtualUid(key){
    return getValue(callClient("VirtualUsrState"),key);
}
// 将请求数据存入缓存
function saveDataToCache(url,dataValue,time){
	try{
		var cachetime;
		if(typeof(dataValue)!="undefined"&&dataValue!=""&&dataValue!=null){
			if(url=="refreshnum"){
				cachetime = 1200;
			}else if(url=="INDEXDATA"){
				cachetime = 604800;
			}else{
				if(url.indexOf("newsearch")<0){
					cachetime = 1200;
				}else{
					cachetime = 86400;
				}
			}
			if(typeof(time)!="undefined"){
				cachetime = time;
			}
			callClient("SetCache?key="+encodeURIComponent(url)+"&time="+cachetime+"\r\n"+dataValue);
		}
	}catch(e){
	}
}
// 从缓存中取数据
function getDataByCache(key){
	var cacheValue = callClient("GetCache?key="+encodeURIComponent(key));
	var data = "";
	if(typeof(cacheValue)!="undefined" && cacheValue!=""){
		try{
			data = cacheValue;
		}catch(e){}
	}
	return data;
}
// 用户是包月 可以下载 请求歌曲失效后 根据此判断直接强行下载
function checkUserVIP(downlast){
	if(downlast&&downlast>0){
		saveDataToCache('userVIP','1',604800);
		initDataByLocalStorage('userVIP','1');
	}else{
		saveDataToCache('userVIP','0',604800);
		initDataByLocalStorage('userVIP','0');
	}
}
//localStorage存储
function initDataByLocalStorage(key,value){
	if(localStorage){
		if(value){
			localStorage[key] = value;
		}else{
			return localStorage[key] || '';
		}
	}else{
		if(!value){
			return '';
		}
	}
}
// 失败各种重试后的强行下载歌曲
function forceDownload(){
	if(getDataByCache('userVIP')=='1' || initDataByLocalStorage('userVIP')=='1'){
		downMusic('forceDownload');
	}
}

/**
 * 支付完成回调后继续下载
 * @return {[type]} [description]
 */
function continueDownload(){
	downMusic('forceDownload', '', true);
}