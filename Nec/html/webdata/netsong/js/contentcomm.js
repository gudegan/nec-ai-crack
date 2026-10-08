// comm.js 是iframe子页面引用的
// 获取iframe对应的父页面 全局对象
var fobj = window.parent;
// 父页面 的jquery 对象 发送请求或者调用jquery自带属性之类的
var $$ = fobj.$;
// iframe 文档内容
// var cdoc = $$('#frame_content')[0].contentWindow.document;
// 子页面 调用 jquery 对象 查找元素使用
/*function $(key){
	return ($$(key, cdoc));
}*/
// var isIE6 = $$.browser.msie && $$.browser.version=="6.0" == true;
//各个类别的默认图片
var artist_default_img = "img/default.png";
var album_default_img = "img/default.png";
var mv_default_img = "img/default_mv.png";
var default_img = "img/default.png";
//动态的歌曲tips 有关上传协议的内容
var uploadString = "";
try{
if(fobj.QKOBJ&&fobj.QKOBJ.uploadarray&&fobj.QKOBJ.uploadarray.length==3){
    //uploadString = ('&#13;'+decodeURIComponent(fobj.QKOBJ.uploadarray[0])+'：加载中...&#13;'+decodeURIComponent(fobj.QKOBJ.uploadarray[1])+'：加载中...&#13;'+decodeURIComponent(fobj.QKOBJ.uploadarray[2]));
}
}catch(e){}
//发送http请求失败后是否重试
var reqRetry = false;
if(fobj.QKOBJ&&fobj.QKOBJ.reqretry&&fobj.QKOBJ.reqretry==1){
    reqRetry = true;
}
//ajax getscript原生方法
function getScript(url){
    fobj.getCommScript(url);
}
//通过请求获取数据方法getscript  flag为是否进行错误判断处理
function getScriptData(url,flag){
	var callbackName = getValue(url,"callback");

	if(callbackName!=""&&callbackName!=null){
		var d = new Date();
		var time = d.getYear()+d.getMonth()+d.getDate()+d.getHours()+parseInt((d.getMinutes()/20));
		time = ''+d.getYear()+d.getMonth()+d.getDate()+time;
		var reqURL = url;
		if(fobj.isRefresh||(typeof(fobj.goldjson)!="undefined")&&fobj.goldjson.refresh){
			reqURL = reqURL+"&ttime="+Math.random();
		}else{
			if(url.indexOf("newsearch")<0){
				reqURL = reqURL+"&ttime="+time;
			}
		}
		var getcachestart = new Date().getTime();
		var cachedata = getDataByCache(reqURL);

		if(cachedata!=""&&cachedata!=null){
			webLog(reqURL.replace("?callback="+callbackName,"").replace("&callback="+callbackName,"")+" has cache...");
			realShowTimeLog(reqURL,1,(new Date().getTime()-getcachestart),0,1);
			fobj.isRefresh = false;
			try{
                eval(callbackName).call(null,eval('('+cachedata+')'));
			}catch(e){
				webLog("has cache eval error:"+e.message+";callbackname:"+callbackName+";cachedata:"+cachedata);
			}
		}else{
		    fobj.isRefresh = false;
			if(flag===false){
				getScript(reqURL);
			}else{
				webLog("url no cache:"+reqURL);
				currentURL = url;
				var changeURL = "";
				if(reqURL.indexOf("?callback=")>-1){
				    changeURL = reqURL.replace("?callback=" + callbackName, "?");
				}else{
				    changeURL = reqURL.replace("&callback=" + callbackName, "");
				}

				if(isIE){
					setTimeout(function(){
						var starttime = new Date().getTime();
						host_starttime = starttime;
						$$.ajax({
							url:changeURL,
							type:"get",
							dataType:"text",
							crossDomain:false,
							success:function(data){
								if(typeof(data)!="undefined"){

									var endtime = new Date().getTime();
									var urltype = "";
									if(changeURL.indexOf("newsearch")>-1){
										urltype = "search";
									}else if(changeURL.indexOf("r.s?stype")>-1){
										urltype = "artist";
									}else if(changeURL.indexOf("artistlistinfo")>-1){
										urltype = "artistlist";
									}else if(changeURL.indexOf("fpagedata")>-1){
										urltype = "tuijian";
									}else if(changeURL.indexOf("getlistinfo")>-1){
										urltype = "playlist";
									}else if(changeURL.indexOf("qukudata")>-1){
										urltype = "qukutree";
									}else if(changeURL.indexOf("kbangserver")>-1){
										urltype = "kbang";
									}
									realTimeLog("WEBLOG","url_time:"+(endtime-starttime)+";"+urltype+";"+changeURL);
									realShowTimeLog(changeURL,1,(endtime-starttime),0,0);
									if(data.length==0){
										data = "{}";
									}

									if(data.indexOf("{'")>-1){
										try{


											eval(callbackName).call(null,eval('('+data+')'));
											if(data.length>20){
												saveDataToCache(reqURL,data);
											}else{
												webLog("url为"+changeURL+":返回数据长度小于20...  , value:"+data);
											}
										}catch(e){
											webLog("eval error:"+e.message);
											realTimeErrorLog("WEBLOG","data_format_error:"+changeURL);
											if(changeURL.indexOf("/r.s?")>0){
									            var justurl = url;
									            if(justurl.indexOf("search.kuwo.cn")>-1){
									                justurl = justurl.replace("search.kuwo.cn","60.28.205.39");
									                getScriptData(justurl,flag);
									                return;
									            }else if(justurl.indexOf("60.28.205.39")>-1){
									                justurl = justurl.replace("60.28.205.39","221.238.29.152");
									                getScriptData(justurl,flag);
									                return;
									            }else if(justurl.indexOf("221.238.29.152")>-1){
									                justurl = justurl.replace("221.238.29.152","60.29.226.174");
									                getScriptData(justurl,flag);
									                return;
									            }
									        }
											eval(callbackName).call(null,eval('('+"{}"+')'));
										}
									}else if(data.indexOf("{\"")>-1){
										try{
											eval(callbackName).call(null,$.parseJSON(data));
											if(data.length>20){
												saveDataToCache(reqURL,data);
											}else{
												webLog("url为"+changeURL+":返回数据长度小于20...  , value:"+data);
											}
										}catch(e){
											try{
												eval(callbackName).call(null,eval('('+data+')'));
												if(data.length>20){
													saveDataToCache(reqURL,data);
												}else{
													webLog("url为"+changeURL+":返回数据长度小于20...  , value:"+data);
												}
											}catch(e){
											    realTimeErrorLog("WEBLOG","data_format_error:"+changeURL);
												webLog("$.parseJSON error:"+e.message+";callback:"+callbackName+";data:"+data);
											    if(changeURL.indexOf("/r.s?")>0){
									                var justurl = url;
									                if(justurl.indexOf("search.kuwo.cn")>-1){
									                    justurl = justurl.replace("search.kuwo.cn","60.28.205.39");
									                    getScriptData(justurl,flag);
									                    return;
									                }else if(justurl.indexOf("60.28.205.39")>-1){
									                    justurl = justurl.replace("60.28.205.39","221.238.29.152");
									                    getScriptData(justurl,flag);
									                    return;
									                }else if(justurl.indexOf("221.238.29.152")>-1){
									                    justurl = justurl.replace("221.238.29.152","60.29.226.174");
									                    getScriptData(justurl,flag);
									                    return;
									                }
									            }
												eval(callbackName).call(null,eval('('+"{}"+')'));
											}
										}
									}else if(data=="{}"){
									    realTimeErrorLog("WEBLOG","data_format_error:"+changeURL);
										eval(callbackName).call(null,eval('('+"{}"+')'));
									}else{
										webLog("data indexof error,url:"+changeURL+";data:"+data);
									}
								}else{
									centerLoadingEnd();
									webLog("url为"+changeURL+"返回数据格式错误");
								}
							},
							error:function(xhr){
								var httpstatus;

								if(xhr!=null&&typeof(xhr)!="undefined"&&typeof(xhr.status)!="undefined"){
								   httpstatus = xhr.status;
								}
								if(typeof(httpstatus)=="undefined"){
									httpstatus = 0;
								}
								var sta = httpstatus.toString();
								webLog("error status:"+sta);
								if(sta.length<3){
								    sta = sta + "00";
								}
								if(sta.substr(0,3)==120 || sta.substr(0,1)==4 || sta.substr(0,1)==5){
									var urltype = "";
									if(changeURL.indexOf("newsearch")>-1){
										urltype = "search";
									}else if(changeURL.indexOf("r.s?stype")>-1){
										urltype = "artist";
									}else if(changeURL.indexOf("artistlistinfo")>-1){
										urltype = "artistlist";
									}else if(changeURL.indexOf("fpagedata")>-1){
										urltype = "tuijian";
									}else if(changeURL.indexOf("getlistinfo")>-1){
										urltype = "playlist";
									}else if(changeURL.indexOf("qukudata")>-1){
										urltype = "qukutree";
									}else if(changeURL.indexOf("kbangserver")>-1){
										urltype = "kbang";
									}
									realTimeLog("WEBLOG","url_error:"+sta+";"+urltype+";"+changeURL);
									webLog("请求失败,url:"+changeURL);
									realShowTimeLog(changeURL,0,(new Date().getTime()-starttime),sta,0);
									if(changeURL.indexOf("newsearch")>0){
										var searchtype = "";
										if(callbackName=="searchMusicResult"){
											searchtype = "music";
										}else if(callbackName=="searchAlbumResult"){
											searchtype = "album";
										}else if(callbackName=="searchMVResult"){
											searchtype = "mv";
										}else if(callbackName=="searchLRCResult"){
											searchtype = "lyric";
										}else if(callbackName=="searchArtistResult"){
											searchtype = "artist";
										}else if(callbackName=="searchRadioResult"){
											searchtype = "radio";
										}
										if(searchtype!=""){
											searchRequestLog("fail",searchtype,parseInt(KW_Utils.getValue(changeURL,"pn"),10)+1);
										}
									}
									if(getValue(changeURL,"pn")>0){
									    if(reqRetry){
									        getScriptDomainChange(url);
									        return;
									    }
										bottomLoadingEnd();
										centerLoadingEnd();
										return;
									}
									if(changeURL.indexOf("/r.s?")>0){
									    var justurl = url;
									    if(justurl.indexOf("https://search.kuwo.cn")>-1){
									        justurl = justurl.replace("search.kuwo.cn","60.28.205.39");
									        getScriptData(justurl,flag);
									        return;
									    }else if(justurl.indexOf("60.28.205.39")>-1){
									        justurl = justurl.replace("60.28.205.39","221.238.29.152");
									        getScriptData(justurl,flag);
									        return;
									    }else if(justurl.indexOf("221.238.29.152")>-1){
									        justurl = justurl.replace("221.238.29.152","60.29.226.174");
									        getScriptData(justurl,flag);
									        return;
									    }else if(justurl.indexOf("60.29.226.174")>-1){
									        if(reqRetry){
									            justurl = justurl.replace("60.29.226.174",hostConfig);
								                justurl = justurl + "&thost=search.kuwo.cn";
								                getScriptData(justurl,flag);
								                return;
									        }
									    }
									}
									if(reqRetry){
									    getScriptDomainChange(url);
									    return;
									}
									loadErrorPage();
								}else{
								    if(changeURL.indexOf("/r.s?")>0){
									    var justurl = url;
									    if(justurl.indexOf("https://search.kuwo.cn")>-1){
									        justurl = justurl.replace("search.kuwo.cn","60.28.205.39");
									        getScriptData(justurl,flag);
									        return;
									    }else if(justurl.indexOf("60.28.205.39")>-1){
									        justurl = justurl.replace("60.28.205.39","221.238.29.152");
									        getScriptData(justurl,flag);
									        return;
									    }else if(justurl.indexOf("221.238.29.152")>-1){
									        justurl = justurl.replace("221.238.29.152","60.29.226.174");
									        getScriptData(justurl,flag);
									        return;
									    }else if(justurl.indexOf("60.29.226.174")>-1){
									        if(reqRetry){
									            justurl = justurl.replace("60.29.226.174",hostConfig);
									            justurl = justurl + "&thost=search.kuwo.cn";
									            getScriptData(justurl,flag);
									            return;
									        }
									    }
									}else{
									    if(reqRetry){
									        getScriptDomainChange(url);
									        return;
									    }
									}
								    loadErrorPage();
								}
							},
							complete:function(xhr,ts){
								try{
									xhr = null;
								}catch(e){
									webLog("ajax complete error:"+e.message);
								}
							}
						});
					},25);
				}else{
					getScript(reqURL);
				}
			}
		}
	}else{
	    getScript(url);
	}
}
// 通过原来请求url替换为 预设的特定ip域名
function getDomainIPURL(url){
    var urlindex1 = url.indexOf("http://");
    var urlindex2 = url.indexOf(".cn/");
    var srchost = url.substring(urlindex1+7,urlindex2+3);
    var newurl = url.replace(srchost,hostConfig)+"&thost="+srchost;
    return newurl;
}
var host_starttime;
//针对无法访问酷我域名的用户中转一次 访问 走固定ip代理访问
function getScriptDomainChange(url){
    var callbackName = getValue(url,"callback");
    var d = new Date();
	var time = d.getYear()+d.getMonth()+d.getDate()+d.getHours()+parseInt((d.getMinutes()/20));
	time = ''+d.getYear()+d.getMonth()+d.getDate()+time;
	var reqURL = url;
	if(fobj.isRefresh){
		reqURL = reqURL+"&ttime="+Math.random();
	}else{
		if(url.indexOf("newsearch")<0){
			reqURL = reqURL+"&ttime="+time;
		}
	}
	var changeURL = "";
	if(reqURL.indexOf("?callback=")>-1){
	    changeURL = reqURL.replace("?callback="+callbackName,"?")
	}else{
	    changeURL = reqURL.replace("&callback="+callbackName,"")
	}
    $$.ajax({
        url:getDomainIPURL(changeURL),
        dataType:"text",
        type:"get",
		crossDomain:false,
        success:function(data){
	        if(typeof(data)!="undefined"){
				var endtime = new Date().getTime();
				var urltype = "";
				if(changeURL.indexOf("newsearch")>-1){
					urltype = "search";
				}else if(changeURL.indexOf("r.s?stype")>-1){
					urltype = "artist";
				}else if(changeURL.indexOf("artistlistinfo")>-1){
					urltype = "artistlist";
				}else if(changeURL.indexOf("fpagedata")>-1){
					urltype = "tuijian";
				}else if(changeURL.indexOf("getlistinfo")>-1){
					urltype = "playlist";
				}else if(changeURL.indexOf("qukudata")>-1){
					urltype = "qukutree";
				}else if(changeURL.indexOf("kbangserver")>-1){
					urltype = "kbang";
				}
				realTimeLog("WEBLOG","url_time:"+(endtime-host_starttime)+";"+urltype+";"+changeURL);
				realShowTimeLog(changeURL,1,(endtime-host_starttime),0,0);
				if(data.length==0){
					data = "{}";
				}
				if(data.indexOf("{'")>-1){
					try{
						eval(callbackName).call(null,eval('('+data+')'));
						if(data.length>20){
							saveDataToCache(reqURL,data);
						}else{
							webLog("url为"+changeURL+":返回数据长度小于20...  , value:"+data);
						}
					}catch(e){
						webLog("eval error:"+e.message);
						realTimeErrorLog("WEBLOG","data_format_error:"+changeURL);
						eval(callbackName).call(null,eval('('+"{}"+')'));
					}
				}else if(data.indexOf("{\"")>-1){
					try{
						eval(callbackName).call(null,$.parseJSON(data));
						if(data.length>20){
							saveDataToCache(reqURL,data);
						}else{
							webLog("url为"+changeURL+":返回数据长度小于20...  , value:"+data);
						}
					}catch(e){
						try{
							eval(callbackName).call(null,eval('('+data+')'));
							if(data.length>20){
								saveDataToCache(reqURL,data);
							}else{
								webLog("url为"+changeURL+":返回数据长度小于20...  , value:"+data);
							}
						}catch(e){
						    realTimeErrorLog("WEBLOG","data_format_error:"+changeURL);
							webLog("$.parseJSON error:"+e.message+";callback:"+callbackName+";data:"+data);
							eval(callbackName).call(null,eval('('+"{}"+')'));
						}
					}
				}else if(data=="{}"){
				    realTimeErrorLog("WEBLOG","data_format_error:"+changeURL);
					eval(callbackName).call(null,eval('('+"{}"+')'));
				}else{
					webLog("data indexof error,url:"+changeURL+";data:"+data);
				}
			}else{
				centerLoadingEnd();
				webLog("url为"+changeURL+"返回数据格式错误");
			}
        },
        error:function(xhr){
	        var httpstatus = xhr.status;
	        if(typeof(httpstatus)=="undefined"){
		        httpstatus = "-1";
	        }
	        var sta = httpstatus.toString();
			if(getValue(url,"pn")>0){
				bottomLoadingEnd();
				centerLoadingEnd();
				return;
			}
			loadErrorPage();
        }
    });
}
// 拼 commonclick 参数串
function commonClickString(obj,isf){
	var clickarray = [];
	var index = 0;
	clickarray[index++] = "fobj.commonClick(";
	clickarray[index++] = getNodeJsonString(obj);
	clickarray[index++] = ")";
	var clickstring = clickarray.join('');
	return clickstring;
}
// 返回顶部
function returnTop(){
	$("body").animate({scrollTop:0},500);
    $("#return_top").hide();
}
// 获取歌手图片真实地址
function getArtistPic(pic){
    var picUrl = "";
    picUrl = pic;
	if(typeof(picUrl)=="undefined"||picUrl == ""){
		picUrl = artist_default_img;
	}else if(picUrl.indexOf("http")>-1){
		picUrl = changeImgDomain(picUrl);
		picUrl = picUrl.replace("starheads/55","starheads/120");
	}else{
		picUrl = getArtistPrefix(picUrl)+picUrl;
		picUrl = picUrl.replace("starheads/55","starheads/120");
	}
	return picUrl;
}
// 取歌手图片前缀
function getArtistPrefix(pic){
	var num = getImgNumber(pic);
	var prefix;
	prefix = "http://img"+num+".sycdn.kuwo.cn/star/starheads/";
	return prefix;
}
// 获取专辑图片真实地址
function getAlbumPic(pic){
    var picUrl = "";
    picUrl = pic;
	if(typeof(picUrl)=="undefined"||picUrl == ""){
		picUrl = album_default_img;
	}else if(picUrl.indexOf("http")>-1){
		picUrl = changeImgDomain(picUrl);
		picUrl = picUrl.replace("albumcover/100","albumcover/120");
	}else{
		picUrl = getAlbumPrefix(picUrl)+picUrl;
		picUrl = picUrl.replace("albumcover/100","albumcover/120");
	}
	return picUrl;
}
// 取专辑图片前缀
function getAlbumPrefix(pic){
	var num = getImgNumber(pic);
	var prefix;
	prefix = "http://img"+num+".sycdn.kuwo.cn/star/albumcover/";
	return prefix;
}
// 取MV图片真实地址
function getMVPic(pic){
    var picUrl = "";
    picUrl = pic;
	if(typeof(picUrl)=="undefined"||picUrl == ""){
		picUrl = mv_default_img;
	}else if(picUrl.indexOf("http")>-1){
		picUrl = changeImgDomain(picUrl);
	}else{
		picUrl = getMVPrefix(picUrl)+picUrl;
	}
	picUrl = picUrl.replace("/120/","/160/");
	picUrl = picUrl.replace("/140/","/160/");
	return picUrl;
}
// 取MV图片前缀
function getMVPrefix(pic){
	var num = getImgNumber(pic);
	var prefix;
	prefix = "http://img"+num+".sycdn.kuwo.cn/wmvpic/";
	return prefix;
}
//数据错误处理
var currentURL = "";
window.onerror=function(msg,url,linenumber){
	if(msg.indexOf("缺少")>-1){
		webLog("当前请求地址为:"+currentURL+":数据错误,缺少...");
	}else if(msg.indexOf("未结束的字符串常量")>-1){
		webLog("当前请求地址为:"+currentURL+":数据错误,未结束的字符串常量...");
	}else{
		webLog("onerror:"+msg+";linenumber:"+typeof(linenumber)=="undefined"?"-1":linenumber);
		realTimeErrorLog("WEBLOG","onerror:"+msg+";linenumber:"+typeof(linenumber)=="undefined"?"-1":linenumber);
	}
	return true;
};
// 歌曲拖拽相关
var isDragMusic = false;
var dragMusicString = "";
var currentX;
var currentY;
//双击单曲条播放歌曲
$(".music_wrap,.fixed_list li").live("dblclick", function () {
    if($(this).hasClass("copyright")){
        musicOnline();
        return;
    }
    var rid = $(this).find(".w_name").attr("data-rid");
    var playMusicString = MUSICLISTOBJ[rid];
    if (rid && playMusicString) {
        singleMusicOption("Play", playMusicString);
    }
});
var kk=true;
//歌曲拖拽
$(".music_wrap,.fixed_list li").live("mousedown", function (e) {
    var ev = e||event;
    if(typeof(ev.which)!="undefined"&&ev.which==3){
        return;
    }
    currentX = ev.clientX;
    currentY = ev.clientY;
	isDragMusic = true;
	kk = true;
	var rid = $(this).find(".w_name").attr("data-rid");
	dragMusicString = MUSICLISTOBJ[rid];
	$(this).mousemove(function (e) {
	    var ev = e||event;
        var X = ev.clientX;
        var Y = ev.clientY;
        if(Math.abs(X-currentX)>5||Math.abs(Y-currentY)>5){
        }else{
            return false;
        }
	    if(isDragMusic&&dragMusicString!=""){
		    var currentobj = $(event.srcElement);
		    if(currentobj.is("a")){
			    isDragMusic = false;
			    return false;
		    }else if(currentobj.is("input")){
			    isDragMusic = false;
			    return false;
		    }else{
			     if(kk){
			        kk = false;
			        if($(this).hasClass("copyright")){
                        musicOnline();
                        return;
                    }
				    callClientNoReturn("Begindrag?song="+dragMusicString);
			     }
		    }
		    return false;
	    }
	});
});
$(".music_wrap,.fixed_list li").live("mouseup", function () {
	isDragMusic = false;
	$(this).unbind("mousemove");
});
// 检查 active 控件有没有安装
function checkIeInstall(val) {
	try {
        new ActiveXObject(val);
        return true;
    } catch (e) {
        return false;
    }
}
// IE6直接播放小按钮hover
if(isIE6){
    $(".i_play").live("mouseenter",function(){
        $(this).addClass("i_playhover");
    });
    $(".i_play").live("mouseleave",function(){
        $(this).removeClass("i_playhover");
    });

    $(".m_hd").live("mouseenter",function(){
        var c = $(this).attr("class");
        c = c.replace("m_hd ","");
        if(c.length>0){
            $(this).addClass(c+"hover");
        }
    });
    $(".m_hd").live("mouseleave",function(){
        var c = $(this).attr("class");
        if(c.split(" ").length==3){
            $(this).removeClass(c.split(" ")[2]);
        }
    });
}

// 创建面包屑
function createBread(obj,from) {
	var breadarr = getStringKey(obj.other,'bread').split(';');
	var psrcarr = getStringKey(obj.other,'psrc').split('->');
	var breadStr = '<a hidefocus onclick="fobj.tuijian();" href="###">曲库</a> &gt; ';
	var backstr = '';
	if (from=="artist"){
	    breadStr += '<a onclick="'+commonClickString(new Node(-2,4,"歌手",0))+'" hidefocus href="###">歌手</a> &gt; <span></span>';
	    backstr = '<a href="###" hidefocus onclick="'+commonClickString(new Node(-2,4,"歌手",0))+'" class="breadback">返回到歌手</a>';
	} else if(from=="album"){
	    breadStr += '<a onclick="'+commonClickString(new Node(-2,4,"歌手",0))+'" hidefocus href="###">歌手</a> &gt; <i></i>';
	    backstr = '<a href="###" hidefocus onclick="$(\'#w_artist\').click();" class="breadback"></a>';
	} else if(from=="playlist"){
		for (var i=0; i<breadarr.length; i++) {
		    var obj = breadarr[i].split(',');
		    var source = obj[0];
		    var sourceid = obj[1];
		    var name = obj[2];
		    var id = obj[3];
		    var other = '';
		    var bstr = '';
		    var pstr = '';
		    if (breadarr[i-1]) {
		    	bstr = '|bread=' + breadarr[i-1];
		    }
		    if (psrcarr[i-1]){
		    	pstr = '|psrc=' + psrcarr[i-1] + '->';
		    }
		    other = bstr + pstr;
			var click = commonClickString(new Node(source,sourceid,checkSpecialChar(name,"name"),id,obj.extend,other));
		    var s = '';
		    if (i > 0) s = ' &gt; ';
		    breadStr += s + '<a href="###" hidefocus onclick="'+click+'">'+name+'</a>';
		    if (i == breadarr.length -1) breadStr += ' > <span></span>';
		    if(i==breadarr.length-1){
		        backstr = '<a href="###" hidefocus onclick="'+click+'" class="breadback">返回到'+checkSpecialChar(name,"disname")+'</a>';
		    }
	    }
	} else {
		breadStr += '<span></span>';
		backstr = '<a href="###" hidefocus onclick="fobj.tuijian();" class="breadback">返回到曲库</a>';
	}
	$(".bread").html(breadStr+backstr);
}
// 创建分页
function createPage(total, currentPg) {
    var pageHtml = '';
    if (total > 1) {
        if (currentPg != 1) {
            pageHtml += '<a hidefocus href="javascript:;" class="next skinLink">上一页</a>';
        } else {
            pageHtml += '<a hidefocus href="javascript:;" class="nonext">上一页</a>';
        }
        pageHtml += '<a hidefocus  href="javascript:;" ' + (currentPg == 1 ? 'class="current"' : 'class="skinLink"') + '>1</a>';
        if (currentPg > 4) pageHtml += '<span class="point">...</span>';

        for (var i = (currentPg >= 4 ? (currentPg - 2) : 2) ; i <= (currentPg + 2 >= total ? (total - 1) : (currentPg + 2)) ; i++) {
            if (currentPg == i) {
                pageHtml += '<a hidefocus href="javascript:;" class="current">' + i + '</a>';
            } else {
                pageHtml += '<a hidefocus href="javascript:;" class="skinLink">' + i + '</a>';
            }
        }
        if (currentPg + 3 < total) pageHtml += '<span class="point">...</span>';
        if (total != 1) pageHtml += '<a hidefocus href="javascript:;" ' + (currentPg == total ? 'class="current"' : 'class="skinLink"') + '>' + total + '</a>';
        if (currentPg != total) {
            pageHtml += '<a hidefocus href="javascript:;" class="prev skinLink">下一页</a>';
        } else {
            pageHtml += '<a hidefocus href="javascript:;" class="noprev">下一页</a>';
        }
    }
    return pageHtml;
}


//内容页的收听电台
/*
function getShowRadio(rcid,rctype){
	var call = 'ShowMusicRadio?rcid=' + rcid + '&rctype=' + rctype;
	return callClient(call);
}
function playRadio(rcid, rctype, name){
	var call = 'AddMusicRadio?rcid=' + rcid + '&rctype=' + rctype + '&rcname=' + encodeURIComponent(name) + '&play=1';
	callClientNoReturn(call);
}
function showRadio(typeid,typename){
	var show = getShowRadio(typeid,typename);
	if(show!=null && show + '' == '1'){
		setTimeout(function(){
			$(".radio_btn").show();
		},100);
	}else{
	    $(".radio_btn").hide();
	}
}
*/

function playRadio(rcid, rctype, name){
    var call = 'AddMusicRadio?rcid=' + rcid + '&rctype=' + rctype + '&rcname=' + encodeURIComponent(name) + '&play=1';
    callClientNoReturn(call);
}
//改为异步调用
function getShowRadio(rcid,rctype){
    var call = 'ShowMusicRadio?rcid=' + rcid + '&rctype=' + rctype;
    callClientAsyn(call,function(name, args){
		var show = args[0];
        if(show!=null && show + '' == '1'){
            setTimeout(function(){
                $(".radio_btn").show();
            },100);
        }else{
            $(".radio_btn").hide();
        }
    });
}
function showRadio(typeid,typename){
    getShowRadio(typeid,typename);
}

// 歌曲 播放 添加 MV 下载 更多等操作
$(".m_play").live("click",function(){
    if($(this).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }

    var rid = $(this).parent().attr("data-rid");
    var playMusicString = MUSICLISTOBJ[rid];
    if(rid&&playMusicString){
        singleMusicOption("Play",playMusicString);
    }
    playMusicString = null;
});
$(".m_add").live("click",function(){
    if($(this).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }
    var rid = $(this).parent().attr("data-rid");
    var playMusicString = MUSICLISTOBJ[rid];
    var playindex = 0;
    if(rid&&playMusicString){
        playindex++;
        var playMusicStr = "n="+playindex+"&s"+playindex+"="+MUSICLISTOBJ[rid];
        multipleMusicOption("AddTo",playMusicStr);
    }
});
$(".m_mv").live("click",function(){
    if($(this).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }
//    var rid = $(this).parent().attr("data-rid");
    var rid = $(this).parents().find(".icon").attr("data-rid");
    var playMusicString = MUSICLISTOBJ[rid];
    console.log(playMusicString)
    if(rid&&playMusicString){
        singleMusicOption("MV",playMusicString);
    }
});
$(".m_down").live("click",function(){
    if($(this).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }
    var rid = $(this).parent().attr("data-rid");
    var playMusicString = MUSICLISTOBJ[rid];
    if(rid&&playMusicString){
        singleMusicOption("Down",playMusicString);
    }
});
$(".m_more").live("click",function(){
    if($(this).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }
    var rid = $(this).parent().attr("data-rid");
    var playMusicString = MUSICLISTOBJ[rid];
    if(rid&&playMusicString){
        var call = "ShowOperation?bSimilarRecomShow=0&song="+playMusicString;
		callClientNoReturn(call);
    }
});
// 清晰度
$(".m_hd").live("click",function(){
    if($(this).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }
    var rid = $(this).parents("li").attr("c-rid");
    var playMusicString = MUSICLISTOBJ[rid];
    var mdcode = $(this).attr("data-md");
    if(rid&&playMusicString&&mdcode){
		singleMusicOption("ShowHQ",playMusicString,mdcode);
    }
});
// 歌曲名称 点击
$(".w_name").live("click",function(){
    if($(this).parentsUntil("ul").hasClass("copyright")){
        musicOnline();
        return;
    }
    var rid = $(this).attr("data-rid");
    var playMusicString = MUSICLISTOBJ[rid];
    if(rid&&playMusicString){
        singleMusicOption("Play",playMusicString);
    }
});
// 全部播放 添加 MV 下载 操作
$(".all_play").live("click",function(){
    var playarray = [];
    var playindex = 0;
    $(".icon").each(function(i){
        var thisObj = $(this);
        var rid = thisObj.attr("data-rid");
        var flag = true;
//        var inputprev = thisObj.parentsUntil(".music_wrap").prev();
        var inputprev = thisObj.parents(".music_wrap")|| thisObj.parents("li");
        if(inputprev.hasClass("copyright")){
            //musicOnline();
            flag = false;
        }else{
            if(inputprev.children().hasClass("m_l")){
                flag = inputprev.find(".m_ckb").attr("checked");
            }
        }
        if(flag&&rid&&MUSICLISTOBJ[rid]){
            playindex++;
            playarray[playarray.length] = "&s"+playindex+"="+MUSICLISTOBJ[rid];
        }
    });

    if(playindex>0){
		var playMusicString = ("n="+playindex+playarray.join(""));
        multipleMusicOption("Play",playMusicString);
    }
});

$(".all_playmv").live("click",function(){
    try{
	var mvString = "";
	var htmlarray = [];
	var PLAYOBJ;
	if ($(this).hasClass("latest")){
		var index = $(this).parent().find("span .current").index();
		PLAYOBJ = $(".kw_album_list div").eq(index).attr("c-data").split(',');
	} else {
		PLAYOBJ = MVLISTOBJ;
	}
	var onlineflag = false;
	var mvlistsize = PLAYOBJ.length;
	for (var i=0; i<PLAYOBJ.length; i++) {
	    var someobj = MVLISTOBJECT[i];
	    if(typeof(someobj)!="undefined"&&typeof(someobj.online)!="undefined"&&someobj.online.length==1&&someobj.online==0){
	        mvlistsize--;
	        onlineflag = true;
	        continue;
	    }
		htmlarray[i] = "&s"+(i+1)+"="+returnSpecialChar(PLAYOBJ[i]);
	}
	if(onlineflag){
	    if(mvlistsize==0){
	        musicOnline();
	        return;
	    }else{
	        musicOnline(true);
	    }
	}
	mvString = ("n="+PLAYOBJ.length + htmlarray.join(''));
	multipleMusicOption("MV",mvString);
	}catch(e){}
	return false;
});

$(".all_add").live("click",function(e){
    var playarray = [];
    var playindex = 0;
    $(".icon").each(function(){
        var thisObj = $(this);
        var rid = thisObj.attr("data-rid");
        var flag = true;
        var inputprev = thisObj.parents(".music_wrap")|| thisObj.parents("li");
        if(inputprev.hasClass("copyright")||inputprev.parent().hasClass("copyright") ){
            //musicOnline();
            flag = false;
        }else{
            if(inputprev.children().hasClass("m_l")){
                flag = inputprev.find(".m_ckb").attr("checked");
            }
        }
        if(flag&&rid&&MUSICLISTOBJ[rid]){
            playindex++;
            playarray[playarray.length] = "&s"+playindex+"="+MUSICLISTOBJ[rid];
        }
    });
    if(playindex>0){
        var playMusicString = ("n="+playindex+playarray.join(""));
        multipleMusicOption("AddTo",playMusicString);


    }
});
$(".all_mv").live("click",function(){
    var playarray = [];
    var playindex = 0;
    $(".icon").each(function(){
        var thisObj = $(this);
        var rid = thisObj.attr("data-rid");
        var flag = true;
        var inputprev = thisObj.parents(".music_wrap")|| thisObj.parents("li");
        if(inputprev.parent().hasClass("copyright")){
            //musicOnline();
            flag = false;
        }else{
            if(inputprev.children().hasClass("m_l")){
                flag = inputprev.find(".m_ckb").attr("checked");
            }
        }
        if(flag&&!thisObj.find(".m_mv").hasClass("m_mv_n")&&rid&&MUSICLISTOBJ[rid]){
            playindex++;
            playarray[playarray.length] = "&s"+playindex+"="+MUSICLISTOBJ[rid];
        }
    });
    if(playindex>0){
        var playMusicString = ("n="+playindex+playarray.join(""));
        multipleMusicOption("MV",playMusicString);
    }
});
$(".all_down").live("click",function(){
    var playarray = [];
    var playindex = 0;
    $(".icon").each(function(){
        var thisObj = $(this);
        var rid = thisObj.attr("data-rid");
        var flag = true;
        var inputprev = thisObj.parents(".music_wrap")|| thisObj.parents("li");
        var isAllNotAllow = true;
        if(inputprev.hasClass("copyright")||inputprev.parent().hasClass("copyright")||thisObj.find(".m_down").hasClass("notAllow")){
            //musicOnline();
            flag = false;
        }else{
            if(inputprev.children().hasClass("m_l")){
                flag = inputprev.find(".m_ckb").attr("checked");
            }
        }
        if(flag&&rid&&MUSICLISTOBJ[rid]){
            playindex++;
            playarray[playarray.length] = "&s"+playindex+"="+MUSICLISTOBJ[rid];
            if(!thisObj.find(".m_down").hasClass("notAllow")){
	            isAllNotAllow = false;
	        }
        }
    });

    if(playindex>0){
        var playMusicString = ("n="+playindex+playarray.join(""));
        var packdown = false;
        var packname = "";
        var packid = "";
        var packpic = "";
        var packinfo = "";
        var packtype = "";
        if(isAllNotAllow){
	        qukuTips("应版权方要求暂不能下载");
	    }
        if(typeof(currentAlbumName)!="undefined"&&$(".all_ckb").attr("checked")){
            packdown = true;
            packname = currentAlbumName;
            packid = currentAlbumId;
            packpic = currentAlbumPic;
            packinfo = currentAlbumInfo;
            packtype = "album";
        }else if(typeof(currentPlaylistName)!="undefined"&&$(".all_ckb").attr("checked")){
            packdown = true;
            packname = currentPlaylistName;
            packid = currentPlaylistId;
            packpic = currentPlaylistPic;
            packinfo = currentPlaylistInfo;
            packtype = "playlist";
        }
        if(packdown){
            packname = encodeURIComponent(packname);
            packpic = packpic.replace("albumcover/150","albumcover/100");
            packpic = encodeURIComponent(packpic);
            packinfo = encodeURIComponent(packinfo);
            multipleMusicOption("PackDown",playMusicString+"&packname="+packname+"&packpic="+packpic+"&packid="+packid+"&packtype="+packtype+"&packinfo="+packinfo+"&src=netsong2015");
        }else{
            multipleMusicOption("Down",playMusicString);
        }
    }
});
// 单曲复选框
$(".m_ckb").live("click",function (e){
   var  isAllChecked = $(".m_ckb").length == $(".m_ckb:checked").length;
   $(".all_ckb").attr("checked",isAllChecked)
   e.stopPropagation()
})
// 全选框
$(".all_ckb").live("click",function(){
    var thisObj = $(this);
	var flag = thisObj.attr("checked");
	if(!flag){
        $(".m_ckb").attr("checked",false);
	}else{
	    $(".m_ckb").attr("checked",true);
	}
});

//点击内容页的喜欢按钮
$(".like_btn").live("click", function(){
	var uid = getUserID("uid");
	if (uid ==0 ){
	    setTimeout(function(){
	        callClientNoReturn("UserLogin?src=login");
	    },25);
	} else {
		var likehtml = $(this).html();
		var target = $(this).attr("c-target");
		var act  = "";
		if (likehtml == fobj.likeArray[0]) {
			act = "add";
		} else if (likehtml==fobj.likeArray[1]){
			act = "delete";
		}
		fobj.showLike(act,target);
	}
	return false;
});

//点击内容页的喜欢按钮
$(".artist_radio").live("click", function(){
	var artistId = $(this).attr("c-id");
	var artistName = $(this).attr("c-name");
	playRadio(artistId, 'artist', artistName + '电台');
	try{
	    radioLog('POSITION:1,1|GPOSITION:1,1|FROMPAGE:歌手|RADIOID:'+artistId);
	}catch(e){}
	return false;
});

//点击内容页的喜欢按钮
$(".bang_radio").live("click", function(){
	var phbid = $(this).attr("c-id");
	var phbname = $(this).attr("c-name");
	playRadio(phbid, 'rank', phbname + '电台');
	try{
	    radioLog('POSITION:1,1|GPOSITION:1,1|FROMPAGE:排行榜|RADIOID:'+phbid);
	}catch(e){}
	return false;
});

// hover 歌曲列表显示TIPS
$(".music_wrap").live("mouseenter",function(){
	getMusicOrigin($(this));
	if(isIE6) $(this).addClass("music_wraphover");
});

//hover 歌曲列表显示TIPS
$(".music_wrap").live("mouseleave",function(){
	if(isIE6) $(this).removeClass("music_wraphover");
});


// 小圆圈iplay 直接播放按钮
function iPlay(evt, source, sourceid, obj) {
	if($(obj).hasClass("i_play_loading")||$(".i_play_loading").length>0){
        evt.stopPropagation();
        return;
    }else{
        $(obj).removeClass().addClass("i_play_loading");
    }
	fobj.iPlayPSRC = $(obj).attr("data-ipsrc");
    if (source == 1) {
        var url = "http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&id=" + sourceid + "&callback=playBangMusic&pcmp4=1&pn=0&rn=" + iplaynum;
        $$.getScript(getChargeURL(url));
    } else if (source == 4) {
        var url = search_url + "r.s?stype=artist2music&artistid=" + sourceid + "&pn=0&rn=" + iplaynum + "&callback=playArtistMusic&show_copyright_off=1&pcmp4=1";
        $$.getScript(getChargeURL(url));
    } else if (source == 8) {
        var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=" + sourceid + "&pn=0&rn=" + iplaynum + "&encode=utf-8&keyset=pl2012&identity=kuwo&callback=playGeDanMusic&pcmp4=1&newver=1";
        $$.getScript(getChargeURL(url));
    } else if (source == 13) {
        var url = search_url + "r.s?stype=albuminfo&albumid=" + sourceid + "&callback=playAlbumMusic&show_copyright_off=1&alflac=1&pcmp4=1";
        $$.getScript(getChargeURL(url));
    } else if (source == 14) {
        var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid="+sourceid+"&pn=0&rn="+iplaynum+"&encode=utf-8&keyset=mvpl&identity=kuwo&callback=playMVGeDanMusic&pcmp4=1&newver=1";
        $$.getScript(getChargeURL(url));
    } else if (source == 21) {
        $$.getScript(album_url + "album/mbox/commhd?flag=1&id=" + sourceid + "&pn=0&rn="+iplaynum+"&callback=playZhuanTiMusic");
    } else if (source == 36){
    	var url = 'http://album.kuwo.cn/album/MusicTopicServlet?node=pastList&type=' + sourceid + '&callback=playGeDanMusic';
    	$$.getScript(url);
    }
    if (isIE) {
        event.cancelBubble = true;
    } else {
        evt.stopPropagation();
    }
}

//music  hover时显示的tips
function getMusicTips(name,artist,albumName){
	try{
		var tips = "";
		var tipsarray = [];
		var xia = 0;
		tipsarray[xia++] = '歌名：';
		tipsarray[xia++] = checkSpecialChar(name,"titlename");
		if($$.trim(artist)!=""){
			tipsarray[xia++] = '&#13;歌手：';
			tipsarray[xia++] = checkSpecialChar(artist,"titlename");
		}
		if($$.trim(albumName)!=""){
			tipsarray[xia++] = '&#13;专辑：';
			tipsarray[xia++] = checkSpecialChar(albumName,"titlename");
		}
		tipsarray[xia++] = '&#13;来源：加载中...';
		tipsarray[xia++] = '&#13;审批文号：加载中...';
		tipsarray[xia++] = '&#13;MV出品人：加载中...';
		tipsarray[xia++] = uploadString;
		tips = tipsarray.join('');
		tipsarray = null;
		return tips;
	}catch(e){}
}

//获取歌曲来源
var currentRID = "";
var musicTimer;
function getMusicOrigin(obj){
	var rid = obj.attr("c-rid");
	currentRID = rid;
	var origin = obj.attr("data-origin");
	if(typeof(origin)!="undefined" && origin=="ok"){
		return;
	}
	if(obj.attr("title").indexOf("加载中")<0){
		return;
	}
	var url = "http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids="+rid+'&callback=loadMusicOrigin';
	clearTimeout(musicTimer);
	musicTimer = setTimeout(function(){
		getScriptData(url);
	},1000);
}

function loadMusicOrigin(jsondata){
	var data = jsondata;
	if(typeof(data)=="undefined"||data==null){
		return;
	}
	var rid = data.rid;
	var tag = data.tag;
	var approvesn = data.approvesn;
	var mvprovider = data.mvprovider;
	if (currentRID != rid) return;
	var currObj = $("[c-rid="+rid+"]");
	var title1 = currObj.attr("title");
	if(typeof(title1)=="undefined"){
		return;
	}
	var title2 = "";
	if(title1.indexOf("加载中")<0){
		return;
	}
	var ind = title1.indexOf("来源");
	title1 = title1.substr(0,ind);
	try{
		title2 = title1;
		if(typeof(tag)!="undefined" && $$.trim(tag)!=""){
				title2 += ("来源："+tag);
		}
		if(typeof(approvesn)!="undefined" && $$.trim(approvesn)!=""){
				title2 += ("\n审批文号："+approvesn);
		}
		if(typeof(mvprovider)!="undefined" && $$.trim(mvprovider)!=""){
				title2 += ("\nMV出品人："+mvprovider);
		}
	}catch(e){}
	try{
		if(fobj.QKOBJ&&fobj.QKOBJ.uploadarray&&fobj.QKOBJ.uploadarray.length==3){
		    if(typeof(data.upload_user) != "undefined" && $$.trim(data.upload_user)!=""){
		        title2 += ('\n'+decodeURIComponent(fobj.QKOBJ.uploadarray[0])+'：'+data.upload_user);
		    }
		    if(typeof(data.upload_time) != "undefined" && $$.trim(data.upload_time)!=""){
		        title2 += ('\n'+decodeURIComponent(fobj.QKOBJ.uploadarray[1])+'：'+data.upload_time);
		        title2 += ('\n'+decodeURIComponent(fobj.QKOBJ.uploadarray[2]));
		    }
		}
	}catch(e){}
	currObj.attr("title",title2);
	currObj.attr("data-origin","ok");
	currObj.blur();
	currObj.mouseenter();
}
jQuery.fn.isShow=function(){
    if($(this).size()==0||$(this).css("display")=="none"){
        return false;
    }else{
        return true;
    }
};

$(".music_wrap").live("click",function(){
	$(".music_wrap").removeClass("music_wrapClicked");
	$(this).find(".m_mv").addClass("m_mvClicked");
	$(this).addClass("music_wrapClicked");
});
$(".music_wrap").live("mouseenter",function(){
	if($(this).hasClass("music_wrapClicked")){
		$(this).addClass("music_wrapClicked");

	}
});

/**
 * 小地球点击事件
 * @param  {[type]} ev){	var oTip          [description]
 * @return {[type]}           [description]
 */
$('.earth').live('click',function(ev){
	var oTip=$(this).parents('.music_wrap').find('.sourceTips');
	var oBox=$(this).parents('.music_wrap');
	oTip=oTip[0];
	oBox=oBox[0];
	var oEvent= ev || event;
	var _this=$(this);
	var liLen=$(this).parents('ul').children().length;
	var index=_this[0].parentNode.parentNode.parentNode.parentNode.getAttribute('data-index');
	$('.sourceTips').hide();
	$('.ugc_tipsBox').hide();
	var rid=$(this).parents(".music_wrap").attr('c-rid');
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
		oTip.style.top=(oEvent.clientY+10)+'px';
		$(oTip).show();
	}else{
		if(liLen-index<10){
			oTip.style.top=(oEvent.clientY-90)+'px';
			$(oTip).show();
		}else if(index<3){
			$(oTip).addClass('sourceTips2');
			oTip.style.top=(oEvent.clientY+10)+'px';
			$(oTip).show();
		}else if(liLen-index<3){
			oTip.style.top=(oEvent.clientY-90)+'px';
			$(oTip).show();
		}else{
			oTip.style.top=(oEvent.clientY-90)+'px';
			$(oTip).show();
		}
	}
	return false;
});

/**
 * 小地球弹窗关闭
 * @param  {[type]} ){	$(this).parent().hide();} [description]
 * @return {[type]}                                [description]
 */
$('.j_earthBtn').live('click',function(){
	$(this).parent().hide();
});

/**
 * 小地球MV点击事件
 * @param  {[type]} ev){	var oBox          [description]
 * @return {[type]}           [description]
 */
$('.bmv_earth').live('mouseenter mouseleave',function(ev){
	var oBox=$(this)[0].parentNode.parentNode.parentNode.parentNode;
	if(ev.type=='mouseenter'){
		$(this).addClass('bmv_earthhover');
	}else{
		$(this).removeClass('bmv_earthhover');
	}
});

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
		var url='http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids='+rid+'&callback=loadMusicOrigin';
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

function mvCheckMr(obj,cw){
	var cW = document.body.clientWidth||document.documentElement.clientWidth;
	if(cW>=cw+30){
		obj.removeClass('bmv_wrap_mr');
	}else if(cW<=cw+30){
		obj.each(function(i){
			if($(this).index()%4==3)$(this).addClass('bmv_wrap_mr');
		});
	}
}
