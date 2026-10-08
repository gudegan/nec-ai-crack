var payObj;
var userObj;
var tryTimes = 0;
function showPayinfo(){
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
    var url = "http://musicpay.kuwo.cn/music.pay?op=query&src=mbox"+param+"&ver="+getVersion()+"&appuid="+kid+"&action=download&filter=no&signver=new&time="+Math.random();
    $.ajax({
        url:url,
		dataType:"text",
		type:"post",
		data:"ids="+rids,
		crossDomain:false,
		success:function(paydata){
			//realTimeLog('MUSIC_PAY_DETAIL','DATA:'+encodeURIComponent(paydata)+'|PAGE:multi_download');
			if(!paydata||paydata.indexOf('"ok"')<0){
		        $(".w_loading").html('<a href="###" onclick="window.location.reload();return false;">点此刷新</a>');
		        return;
		    }
//		    var obj = eval('('+paydata+')');
			var obj = $.parseJSON(paydata);
		    if(obj.result&&obj.result=="ok"&&obj.songs){
		        if(obj.user){
		            getUser(obj.user);
		        }
	            payObj = obj.songs;
	            end = new Date().getTime();
	            updatePrice();
		    }  
		},
		error:function(xhr){
			if(tryTimes < 2){
				tryTimes++;
				showPayinfo();
			}else{
				$(".w_loading").html('<a href="###" onclick="window.location.reload();return false;">点此刷新</a>');
		    	realTimeLog("ABLOG","TYPE:musicpay_error|SUBTYP:download_multi1");
				forceDownload();
			}
		}
    });    
}
// 获取虚拟id  用于免登陆付费
function getVirtualUid(key){
    return getValue(callClient("VirtualUsrState"),key);
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
// function continueDownload(){
// 	downMusic('DPay');
// }