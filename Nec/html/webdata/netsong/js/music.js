// 全局变量开始-----------------------
// 歌曲列表 对应的歌曲播放信息 对象集合
var MUSICLISTOBJ = {};
var MVLISTOBJ = [];
var MVLISTOBJECT = [];
// 歌曲拖拽相关
var isDragMusic = false;
var dragMusicString = "";
var currentX;
var currentY;
var kk = true;
// 歌曲来源tips相关
var uploadString = "";
var currentRID = "";
var musicTimer;
var playingRadioPos = 0;//标记正在播放电台所属分类
// 全局变量结束-----------------------

// 歌曲信息开始-----------------------
// 存储歌曲播放信息

function saveMusicInfo(obj, from, pstr) {
  var psrc = pstr || "";
  psrc = "VER=2015;FROM=曲库->" + psrc;
  if ($(".toolbar .all_down").size() > 0) {
    $(".toolbar .all_down,.toolbar .w_buyalbum ").attr("data-psrc", psrc)
  }
  psrc = encodeURIComponent(psrc);
  if (from == "bang") {
    var param = obj.param;
    param = returnSpecialChar(param);
    var paramArray = param.split(";");
    var childArray = [];
    var childi = 0;
    childArray[childi++] = encodeURIComponent(returnSpecialChar(obj.name));
    childArray[childi++] = encodeURIComponent(returnSpecialChar(obj.artist));
    childArray[childi++] = encodeURIComponent(returnSpecialChar(obj.album));
    for (var j = 3; j < paramArray.length; j++) {
      if (j == 9 || j == 10) {
        paramArray[j] = 0;
      }
      childArray[childi++] = paramArray[j];
    }
    musicString = childArray.join('\t');
    childArray = null;
    var musicstringarray = [];
    musicstringarray[musicstringarray.length] = musicString;
    musicstringarray[musicstringarray.length] = psrc;
    musicstringarray[musicstringarray.length] = obj.formats;
    musicstringarray[musicstringarray.length] = getMultiVerNum(obj);
    musicstringarray[musicstringarray.length] = getPointNum(obj);
    musicstringarray[musicstringarray.length] = getPayNum(obj);
    musicstringarray[musicstringarray.length] = getArtistID(obj);
    musicstringarray[musicstringarray.length] = getAlbumID(obj);
    musicstringarray[musicstringarray.length] = obj.mp4sig1 || 0;
    musicstringarray[musicstringarray.length] = obj.mp4sig2 || 0;
    musicstringarray[musicstringarray.length] = obj.isdownload || 0;
    musicstringarray[musicstringarray.length] = obj.tpay || 0;
    musicstringarray[musicstringarray.length] = '0';
    musicstringarray[musicstringarray.length] = encodeURIComponent(`rid=${formatMusicId(obj)}`);
    musicString = musicstringarray.join('\t');
    musicString = encodeURIComponent(musicString);
    MUSICLISTOBJ[obj.id] = musicString;
  } else if (from == "album" || from.indexOf("playlist") > -1) {
    var param;
    if (from == "album") {
      param = obj.param;
    } else {
      param = obj.params;
    }
    param = returnSpecialChar(param);
    var paramArray = param.split(";");
    var childArray = [];
    var musicString = "";
    for (var j = 0; j < paramArray.length; j++) {
      if (j < 3) {
        childArray[j] = encodeURIComponent(returnSpecialChar(paramArray[j]));
      } else {
        if ((j == 9 || j == 10) && (from == "playlist" || from == "album")) {
          paramArray[j] = 0;
        }
        childArray[j] = paramArray[j];
      }
    }
    musicString = childArray.join('\t');
    childArray = null;
    paramArray = null;


    var musicstringarray = [];
    musicstringarray[musicstringarray.length] = musicString;
    musicstringarray[musicstringarray.length] = psrc;
    musicstringarray[musicstringarray.length] = obj.formats;
    musicstringarray[musicstringarray.length] = getMultiVerNum(obj);
    musicstringarray[musicstringarray.length] = getPointNum(obj);
    musicstringarray[musicstringarray.length] = getPayNum(obj);
    musicstringarray[musicstringarray.length] = getArtistID(obj);
    musicstringarray[musicstringarray.length] = getAlbumID(obj);
    musicstringarray[musicstringarray.length] = obj.mp4sig1 || 0;
    musicstringarray[musicstringarray.length] = obj.mp4sig2 || 0;
    musicstringarray[musicstringarray.length] = obj.isdownload || 0;
    musicstringarray[musicstringarray.length] = obj.tpay || 0;
    musicstringarray[musicstringarray.length] = '0';
    musicstringarray[musicstringarray.length] = encodeURIComponent(`rid=${formatMusicId(obj)}`);
    musicString = musicstringarray.join('\t');
    musicstringarray = null;
    musicString = encodeURIComponent(musicString);
    MUSICLISTOBJ[obj.id] = musicString;
  } else if (from == "artist") {
    var musicstringarray = [];
    var xia = 0;
    musicstringarray[xia++] = encodeURIComponent(returnSpecialChar(obj.name));
    musicstringarray[xia++] = encodeURIComponent(returnSpecialChar(obj.artist));
    musicstringarray[xia++] = encodeURIComponent(returnSpecialChar(obj.album));
    musicstringarray[xia++] = obj.nsig1;
    musicstringarray[xia++] = obj.nsig2;
    musicstringarray[xia++] = "MUSIC_" + obj.musicrid;
    musicstringarray[xia++] = obj.mp3sig1;
    musicstringarray[xia++] = obj.mp3sig2;
    musicstringarray[xia++] = "MP3_" + obj.mp3rid;
    musicstringarray[xia++] = 0;
    musicstringarray[xia++] = 0;
    musicstringarray[xia++] = "MV_" + obj.mkvrid;
    musicstringarray[xia++] = obj.hasecho;
    musicstringarray[xia++] = psrc;
    musicstringarray[xia++] = obj.formats;
    musicstringarray[xia++] = getMultiVerNum(obj);
    musicstringarray[xia++] = getPointNum(obj);
    musicstringarray[xia++] = getPayNum(obj);
    musicstringarray[xia++] = getArtistID(obj);
    musicstringarray[xia++] = getAlbumID(obj);
    musicstringarray[xia++] = obj.mp4sig1 || 0;
    musicstringarray[xia++] = obj.mp4sig2 || 0;
    musicstringarray[xia++] = obj.isdownload || 0;
    musicstringarray[xia++] = obj.tpay || 0;
    musicstringarray[xia++] = '0';
    musicstringarray[xia++] = encodeURIComponent(`rid=${formatMusicId(obj)}`);
    var musicString = musicstringarray.join('\t');
    musicstringarray = null;
    musicString = encodeURIComponent(musicString);
    MUSICLISTOBJ[obj.musicrid] = musicString;
  } else if (from == "MV") {
    //var psrc = "";
    //MVLISTOBJ[MVLISTOBJ.length] = obj.sourceid;
  }
}

// 弹幕 多版本相关
function getTanMuMVIconStr(someObj) {
  var tanmuiconstr = "";
  var ispoint = someObj.IS_POINT;
  if (typeof(ispoint) == "undefined") {
    ispoint = someObj.ispoint;
  }
  if (typeof(ispoint) == "undefined") {
    ispoint = someObj.is_point;
  }
  if (typeof(ispoint) != "undefined" && ispoint == 1) {
    tanmuiconstr = "<b class='tm_mv'></b>";
  }
  return tanmuiconstr;
}

function getTanMuIconStr(someObj) {
  var tanmuiconstr = "";
  var ispoint = someObj.IS_POINT;
  if (typeof(ispoint) == "undefined") {
    ispoint = someObj.ispoint;
  }
  if (typeof(ispoint) == "undefined") {
    ispoint = someObj.is_point;
  }
  var hasmv = false;
  if (typeof(someObj.mkvrid) != "undefined" && someObj.mkvrid > 0) {
    hasmv = true;
  } else if (typeof(someObj.param) != "undefined") {
    var param = someObj.param;
    if (param.indexOf("MKV_") > 0 && param.indexOf("MKV_0") < 0) {
      hasmv = true;
    } else if (param.indexOf("MV_") > 0 && param.indexOf("MV_0") < 0) {
      hasmv = true;
    }
  } else if (typeof(someObj.params) != "undefined") {
    var params = someObj.params;
    if (params.indexOf("MKV_") > 0 && params.indexOf("MKV_0") < 0) {
      hasmv = true;
    } else if (params.indexOf("MV_") > 0 && params.indexOf("MV_0") < 0) {
      hasmv = true;
    }
  }
  if (typeof(ispoint) != "undefined" && ispoint == 1 && hasmv) {
    tanmuiconstr = "<b title='弹幕' onclick='openTanMu(this);return false;'></b>";
  }
  return tanmuiconstr;
}

function getPointNum(someObj) {
  var pointnum = someObj.ispoint;
  if (typeof(pointnum) == "undefined") {
    pointnum = someObj.is_point;
  }
  if (typeof(pointnum) == "undefined") {
    pointnum = someObj.IS_POINT;
  }
  if (typeof(pointnum) == "undefined") {
    pointnum = someObj.isPoint;
  }
  if (typeof(pointnum) != "undefined" && pointnum == 1) {
    pointnum = 1;
  } else {
    pointnum = 0;
  }
  return pointnum;
}

function getMultiVerNum(someObj) {
  var multivernum = someObj.mutiver;
  if (typeof(multivernum) == "undefined") {
    multivernum = someObj.muti_ver;
  }
  if (typeof(multivernum) == "undefined") {
    multivernum = someObj.MUTI_VER;
  }
  if (typeof(multivernum) == "undefined") {
    multivernum = someObj.mutiVer;
  }
  if (typeof(multivernum) == "undefined" || multivernum.length == 0) {
    multivernum = 0;
  }
  return multivernum;
}

function getCopyrightClass(someObj) {
  var online = someObj.online;
  var classstr = "";
  if (typeof(online) != "undefined" && online.length == 1 && online == 0) {
    classstr = "copyright";
  }
  return classstr;
}

// 获取歌曲是否为付费歌曲
function getPayNum(someObj) {
  var paynum = someObj.pay;
  if (typeof(paynum) == "undefined") {
    paynum = someObj.PAY;
  }
  if (typeof(paynum) == "undefined") {
    paynum = 0;
  }
  return paynum;
}

/**
 * 格式化音乐id
 */
function formatMusicId(obj) {
  return obj.id || obj.musicrid || obj.MUSICRID || obj.rid || '0';
}

// 获取歌曲歌手id
function getArtistID(someObj) {
  var artistid = someObj.artistid;
  if (typeof(artistid) == "undefined") {
    artistid = someObj.ARTISTID || someObj.artistId;
  }
  if (typeof(artistid) == "undefined") {
    artistid = 0;
  }
  return artistid;
}

// 获取歌曲专辑id
function getAlbumID(someObj) {
  var albumid = someObj.albumid
  if (typeof(albumid) == "undefined") {
    albumid = someObj.ALBUMID || someObj.albumId;
  }
  if (typeof(albumid) == "undefined") {
    albumid = 0;
  }
  return albumid;
}

// 请求url是否根据 付费的开关添加vipver请求参数
function getChargeURL(url) {
  if (getChargeIsOpen()) {
    url = url + "&vipver=" + getVersion();
  }
  if (url.indexOf('search.kuwo.cn') > 0 && url.indexOf('plat=pc') < 0) {
    url = url + '&plat=pc&devid=' + getUserID("devid");
  }
  // console.log(url);
  return url;
}

// 付费开关
function getChargeIsOpen() {
  var isopen = callClient("OpenChargeSong");
  //isopen = 1;
  if (isopen != 1) {
    return false;
  }
  return true;
}

var ChargeBok = (function getChargeIsOpen() {
  var isopen = callClient("OpenChargeSong");
  //isopen = 1;
  if (isopen != 1) {
    return false;
  }
  return true;
})();

// 获取歌曲 播放 下载 具体收费类型 是否需要添加money展示 0xDCBA A:音频播放B:音频下载C:视频播放D:视频下载
function getMoney(someObj, type) {
  var moneyicon = "";
  if (!ChargeBok) {
    return moneyicon;
  }
  var paynum = someObj.pay;
  if (typeof(paynum) == "undefined") {
    paynum = someObj.PAY;
  }
  if (typeof(paynum) != "undefined") {
    try {
      paynum = parseInt(paynum, 10);
      paynum = paynum.toString(16);
      if (type == "play") {
        paynum = paynum.substr(paynum.length - 1, 1);
      } else if (type == "down") {
        paynum = paynum.substr(paynum.length - 2, 1);
      }
      paynum = (paynum.toLocaleLowerCase() == "f") || paynum & 1;
      if (paynum != 0) {
        moneyicon = "<em></em>";
      }
    } catch (e) {
    }
  }
  return moneyicon;
}

// 获取歌单图片
function getPlaylistPic(picUrl, picSize) {
  if (picUrl.indexOf("userpl2015") > -1 || picUrl.indexOf("luger") > -1) {
    if ("100 120 150 300 700".indexOf(picSize) > -1) {
      if (picSize == 300) {
        return picUrl.replace("_150.jpg", "b.jpg");
      } else {
        if (picUrl.indexOf("_150.jpg") > -1) {
          return picUrl.replace("_150.jpg", "_" + picSize + ".jpg")
        } else {
          return picUrl.replace("_100.jpg", "_" + picSize + ".jpg");
        }
      }
    }
  } else if (picUrl.indexOf("userpl2013") > -1) {
    if ("100 120 150 300".indexOf(picSize) > -1) {
      if (picSize == 300) {
        return picUrl.replace("_100.jpg", "b.jpg");
      } else {
        return picUrl.replace("_100.jpg", "_" + picSize + ".jpg");
      }
    }
  } else if (picUrl.indexOf("playlist") > -1) {
    if ("70 100 300 150".indexOf(picSize) > -1) {
      if (picSize == 300) {
        return picUrl;
      } else if (picSize == 70) {
        return picUrl.replace("_.jpg", "_s.jpg");
      } else if (picSize == 100) {
        return picUrl.replace("_.jpg", "_100.jpg");
      } else if (picSize == 150) {
        return picUrl.replace("_.jpg", "_100.jpg");
      } else {
        return picUrl;
      }
    }
  } else {
    return picUrl;
  }
}

// 判断歌曲是什么音质
function getHqLevel(obj) {
  var formats = "";
  if (typeof(obj.formats) != "undefined") {
    formats = obj.formats;
  } else if (typeof(obj.FORMATS) != "undefined") {
    formats = obj.FORMATS;
  }
  var levelclass = "";
  if (formats.indexOf('AL') >= 0) {
    levelclass = "aq";
  } else if (formats.indexOf('MP3H') >= 0) {
    levelclass = "sq";
  } else if (formats.indexOf('MP3192') >= 0) {
    levelclass = "sq";
  } else if (formats.indexOf('WMA128') >= 0) {
    levelclass = "hq";
  } else if (formats.indexOf('WMA96') >= 0) {
    levelclass = "lq";
  }
  return levelclass;
}

//music  hover时显示的tips
function getMusicTips(name, artist, albumName) {
  try {
    var tips = "";
    var tipsarray = [];
    var xia = 0;
    tipsarray[xia++] = '歌名：';
    tipsarray[xia++] = checkSpecialChar(name, "titlename");
    if ($.trim(artist) != "") {
      tipsarray[xia++] = '&#13;歌手：';
      tipsarray[xia++] = checkSpecialChar(artist, "titlename");
    }
    if ($.trim(albumName) != "") {
      tipsarray[xia++] = '&#13;专辑：';
      tipsarray[xia++] = checkSpecialChar(albumName, "titlename");
    }
    tipsarray[xia++] = '&#13;来源：加载中...';
    tipsarray[xia++] = '&#13;审批文号：加载中...';
    tipsarray[xia++] = '&#13;MV出品人：加载中...';
    tipsarray[xia++] = uploadString;
    tips = tipsarray.join('');
    tipsarray = null;
    return tips;
  } catch (e) {
  }
}

//获取歌曲来源
function getMusicOrigin(obj) {
  var rid = obj.attr("c-rid");
  currentRID = rid;
  var origin = obj.attr("data-origin");
  if (typeof(origin) != "undefined" && origin == "ok") {
    return;
  }
  if (obj.attr("title").indexOf("加载中") < 0) {
    return;
  }
  //var url = "http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids="+rid+'&callback=loadMusicOrigin';
  var url = "http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids=" + rid;
  clearTimeout(musicTimer);
  musicTimer = setTimeout(function () {
    //getScriptData(url);
    $.ajax({
      url: url,
      dataType: 'jsonp',
      success: function (json) {
        loadMusicOrigin(json);
      }
    });
  }, 1000);
}

function loadMusicOrigin(jsondata) {
  var data = jsondata;
  if (typeof(data) == "undefined" || data == null) {
    return;
  }
  var rid = data.rid;
  var tag = data.tag;
  var approvesn = data.approvesn;
  var mvprovider = data.mvprovider;
  if (currentRID != rid) return;
  var currObj = $("[c-rid=" + rid + "]");
  var title1 = currObj.attr("title");
  if (typeof(title1) == "undefined") {
    return;
  }
  var title2 = "";
  if (title1.indexOf("加载中") < 0) {
    return;
  }
  var ind = title1.indexOf("来源");
  title1 = title1.substr(0, ind);
  try {
    title2 = title1;
    if (typeof(tag) != "undefined" && $.trim(tag) != "") {
      title2 += ("来源：" + tag);
    }
    if (typeof(approvesn) != "undefined" && $.trim(approvesn) != "") {
      title2 += ("\n审批文号：" + approvesn);
    }
    if (typeof(mvprovider) != "undefined" && $.trim(mvprovider) != "") {
      title2 += ("\nMV出品人：" + mvprovider);
    }
  } catch (e) {
  }
  try {
    if (QKOBJ && QKOBJ.uploadarray && QKOBJ.uploadarray.length == 3) {
      if (typeof(data.upload_user) != "undefined" && $.trim(data.upload_user) != "") {
        title2 += ('\n' + decodeURIComponent(QKOBJ.uploadarray[0]) + '：' + data.upload_user);
      }
      if (typeof(data.upload_time) != "undefined" && $.trim(data.upload_time) != "") {
        title2 += ('\n' + decodeURIComponent(QKOBJ.uploadarray[1]) + '：' + data.upload_time);
        title2 += ('\n' + decodeURIComponent(QKOBJ.uploadarray[2]));
      }
    }
  } catch (e) {
  }
  currObj.attr("title", title2);
  currObj.attr("data-origin", "ok");
  currObj.blur();
  currObj.mouseenter();
}

// 歌曲信息结束-----------------------

// 播放方法开始---------------
// 播放电台
function someDianTai(sourceid, nodeobj) {
  var params = sourceid.split(",");
  var pic1 = "http://img1.sycdn.kuwo.cn/star/tags" + params[2];
  if (params[2].indexOf("http://") > -1) {
    pic1 = params[2];
  }
  var pic2 = "http://img1.sycdn.kuwo.cn/star/tags" + params[3];
  if (params[3].indexOf("http://") > -1) {
    pic2 = params[3];
  }
  var pic3 = getStringKey(nodeobj.extend, "RADIO_PIC");
  pic3 = pic3.replace(/star.+/gi, 'star/radio/blur/' + params[0] + '.jpg');
  var disname = disnameSplict(nodeobj.disname || nodeobj.name) || getStringKey(nodeobj.extend, "DIS_NAME");

  var call = "AddMusicRadio?mrid=" + params[0] + "&mrname=" + encodeURIComponent(disname) + "&mrpic1=" + pic1 + "&mrpic2=" + pic2 + "&ut=" + params[4] + "&lt=" + params[5] + "&r=" + params[6] + "&pt=" + params[7] + "&num=" + params[8] + "&mrtype=" + params[9] + "&play=" + params[10] + "&mrpic3=" + pic3;
  if (nodeobj['tagIndex']) {
    call += '&tagIndex=' + nodeobj['tagIndex'];
  } else if (nodeobj['notjump']) {
    call += '&bjump=notjumppage';
  }
  callClientNoReturn(call);
}

// 播放调频
function someTiaoPin(sourceid) {
  var params = sourceid.split(",");
  var call = "Broadcaster?artist=" + encodeURIComponent(params[0]) + "&album=" + encodeURIComponent(params[1]) + "&songname=" + encodeURIComponent(params[2]) + "&path=" + params[3];
  callClientNoReturn(call);
}

// 调起某个游戏
function someGame(nodeobj) {
  try {
    var b64link = callClient("URLBase64?" + nodeobj.sourceid);
    callClientNoReturn("CallGameBox?gameurl=" + b64link + "&open=1");
  } catch (e) {
  }
}

// 播放MV(source==7)
function playSomeMV(nodeobj) {
  var sourceid = nodeobj.sourceid;
  /*
  * 焦点图播放乱码处理，将解码这一步去掉
  * @author 邢祥超 [20190820]
  * */
  // sourceid = decodeURIComponent(sourceid);
  var array = sourceid.split(";");
  var arraysize = array.length;
  if (sourceid == "" || arraysize < 13) {
    return;
  }
  var mvString = "";
  var mvarray = [];
  for (var i = 0; i < arraysize; i++) {
    mvarray[i] = array[i];
  }
  mvarray[mvarray.length] = encodeURIComponent('VER=2015;FROM=曲库->首页->最新MV');
  mvarray[mvarray.length] = nodeobj.mvquality || 0; // formats
  mvarray[mvarray.length] = 0; // mutiVer
  mvarray[mvarray.length] = 0; // is_point
  mvarray[mvarray.length] = 0; // pay
  mvarray[mvarray.length] = nodeobj.artistid || 0;
  mvarray[mvarray.length] = nodeobj.albumid || 0;
  mvarray[mvarray.length] = 0; // mp4sig1
  mvarray[mvarray.length] = 0; // mp4sig2
  mvarray[mvarray.length] = 0; // isdownload
  mvarray[mvarray.length] = 0; // tpay
  if (nodeobj.mvpayinfo) {
    var mvpayinfo = JSON.parse(decodeURIComponent(nodeobj.mvpayinfo));
    mvarray[mvarray.length] = '0';
    mvarray[mvarray.length] = encodeURIComponent(`rid=${array[8] || 0}`);
    // 是否是不能在线播放歌曲
    mvarray[mvarray.length] = '0';
    // mv付费信息
    mvarray[mvarray.length] = mvpayinfo.vid || 0;
    mvarray[mvarray.length] = mvpayinfo.download || 0;
    mvarray[mvarray.length] = mvpayinfo.play || 0;
  }
  mvString = mvarray.join('\t');
  mvString = encodeURIComponent(mvString);
  var csrcstr = getValue(nodeobj.other, 'csrc');
  someMV(mvString, 1, csrcstr);
}

// 播放MV
function someMV(obj, flag, csrcstr) {
  if (flag) {
    if (obj.indexOf("\t") > -1) {
      singleMusicOption("MV", encodeURIComponent(obj), null, csrcstr);
    } else {
      singleMusicOption("MV", obj, null, csrcstr);
    }
  } else {
    var csrc = obj.getAttribute("data-csrc");
    if ($(obj).parentsUntil("ul").hasClass("copyright")) {
      musicOnline();
      return;
    }
    singleMusicOption("MV", ($(obj).attr("data-mv")), null, csrc);
  }
}

// 单曲操作
function singleMusicOption(option, musicString, mdcode, csrc) {
  var call = "";
  var musicstr = returnSpecialChar(musicString);
  if (csrc != null) musicstr += "&CSRC=" + encodeURIComponent(csrc);
  if (option == "MV") {//MV图标插播
    call = "Play?asnext=1&needplay=1&mv=1&n=1&s1=" + musicstr;
  } else if (option == "ShowHQ") {
    call = "SelQuality?mv=0&n=1&s1=" + musicstr + "&mediacode=" + mdcode + "&play=1";
  } else if (option == "SpotsPlay") {//插播
    call = "Play?asnext=1&needplay=1&mv=0&n=1&s1=" + musicstr;
  } else if (option == "NextPlay") {//下一首播放
    call = "Play?asnext=1&needplay=0&mv=0&n=1&s1=" + musicstr;
  } else {
    call = option + "?mv=0&n=1&s1=" + musicstr;

  }
  callClientNoReturn(call);
  musicstr = null;
  call = null;
}

// mv歌单新播放MV
function newSinglePlayMv(obj) {
  try {
    var mvString = "";
    var htmlarray = [];
    var PLAYOBJ;
    var allPlayBtn = $(".all_playmv");
    var pos = $(obj).parent().index();
    if (allPlayBtn.hasClass("latest")) {
      var index = allPlayBtn.parent().find("span .current").index();
      PLAYOBJ = $(".kw_album_list div").eq(index).attr("c-data").split(',');
    } else {
      PLAYOBJ = MVLISTOBJ;
    }
    var onlineflag = false;
    var mvlistsize = PLAYOBJ.length;
    for (var i = 0; i < PLAYOBJ.length; i++) {
      var someobj = MVLISTOBJECT[i];
      if (typeof(someobj) != "undefined" && typeof(someobj.online) != "undefined" && someobj.online.length == 1 && someobj.online == 0) {
        mvlistsize--;
        onlineflag = true;
        continue;
      }
      htmlarray[i] = "&s" + (i + 1) + "=" + returnSpecialChar(PLAYOBJ[i]);
    }
    if (onlineflag) {
      if (mvlistsize == 0) {
        musicOnline();
        return;
      } else {
        musicOnline(true);
      }
    }
    mvString = ("n=" + PLAYOBJ.length + htmlarray.join(''));
    multipleMusicOption("NewSinglePlayMv", mvString, pos);
  } catch (e) {
  }
  return false;
}

// 多曲操作
function multipleMusicOption(option, musicString, pos) {
  var csrc = $("body").attr("data-csrc") || "";
  // 用于新用户首页
  try {
    if (eval(getDataByCache("isNewUserIndex"))) {
      // csrc=csrc.replace("曲库->排行榜","新用户首页");
      csrc = csrc.replace("曲库->分类->歌手2017->歌单", "新用户首页->主动安装")
    }
  } catch (e) {
  }
  // 用于新用户首页 end
  var call = "";
  var musicstr = returnSpecialChar(musicString);
  if (csrc != "") musicstr += "&CSRC=" + encodeURIComponent(csrc);
  if (option == "Add") {
    option = "AddTo";
  }
  if (option == "MV") {
    call = "Play?mv=1&" + musicstr;
  } else if (option == "NewSinglePlayMv") {
    call = "Play?asnext=0&needplay=1&playpos=" + pos + "&mv=1&" + musicstr;
  } else if (option == "NewSinglePlay") {
    call = "Play?asnext=0&needplay=1&playpos=" + pos + "&mv=0&" + musicstr;
  } else if (option == "PlayNext") {
    call = "Play?asnext=1&needplay=0&mv=0&" + musicstr;
  } else {
    call = option + "?mv=0&" + musicstr;
  }
  callClient(call);
  // 用于新用户首页
  try {
    if (eval(isNewUserIndex)) {
      saveDataToCache("isNewUserIndex", "false");
    }
  } catch (e) {
  }
  // 用于新用户首页 end
  musicstr = null;
  call = null;
}

// 关于iplay按钮的播放方法
var iPlayPSRC;
var dataCsrc;

function iPlay(evt, source, sourceid, obj) {
  var iplaynum = 100;
  iPlayPSRC = $(obj).attr("data-ipsrc");
  dataCsrc = $(obj).attr("data-csrc");
  if ($(obj).hasClass("i_play_loading") || $(".i_play_loading").length > 0) {
    evt.stopPropagation();
    return;
  } else {
    $(obj).removeClass().addClass("i_play_loading");
  }
  if (source == 1) {
    //var url = "http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&id=" + sourceid + "&callback=playBangMusic&pn=0&rn=" + iplaynum;
    //$.getScript(getChargeURL(url));
    var url = "http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&pcmp4=1&id=" + sourceid + "&pn=0&rn=" + iplaynum;
    url = getChargeURL(url);
    request(url, 'jsonp', playBangMusic);
  } else if (source == 4) {
    //var url = "https://search.kuwo.cn/r.s?stype=artist2music&artistid=" + sourceid + "&pn=0&rn=" + iplaynum + "&callback=playArtistMusic&show_copyright_off=1";
    //$.getScript(getChargeURL(url));
    var url = "https://search.kuwo.cn/r.s?stype=artist2music&artistid=" + sourceid + "&pn=0&rn=" + iplaynum + "&show_copyright_off=1&alflac=1&pcmp4=1&newver=1";
    url = getChargeURL(url);
    request(url, 'jsonp', playArtistMusic);
  } else if (source == 8) {
    //var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=" + sourceid + "&pn=0&rn=" + iplaynum + "&encode=utf-8&keyset=pl2012&identity=kuwo&callback=playGeDanMusic";
    //$.getScript(getChargeURL(url));
    var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=" + sourceid + "&pn=0&rn=" + iplaynum + "&encode=utf-8&keyset=pl2012&newver=1&identity=kuwo&pcmp4=1";
    url = getChargeURL(url);
    request(url, 'jsonp', playGeDanMusic);
  } else if (source == 13) {
    // var url = "https://search.kuwo.cn/r.s?stype=albuminfo&albumid=" + sourceid + "&callback=playAlbumMusic&show_copyright_off=1";
    // $.getScript(getChargeURL(url));
    var url = "https://search.kuwo.cn/r.s?stype=albuminfo&albumid=" + sourceid + "&show_copyright_off=1&alflac=1&pcmp4=1&newver=1";
    url = getChargeURL(url);
    request(url, 'jsonp', playAlbumMusic);
  } else if (source == 14) {
    // var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid="+sourceid+"&pn=0&rn="+iplaynum+"&encode=utf-8&keyset=mvpl&identity=kuwo&callback=playMVGeDanMusic";
    // $.getScript(getChargeURL(url));
    var url = "http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=" + sourceid + "&pn=0&rn=" + iplaynum + "&encode=utf-8&keyset=mvpl&identity=kuwo&pcmp4=1&newver=1";
    url = getChargeURL(url);
    request(url, 'jsonp', playMVGeDanMusic);
  } else if (source == 21) {
    //$.getScript("http://album.kuwo.cnalbum/mbox/commhd?flag=1&id=" + sourceid + "&pn=0&rn="+iplaynum+"&callback=playZhuanTiMusic");
    var url = "http://album.kuwo.cn/album/mbox/commhd?flag=1&id=" + sourceid + "&pn=0&rn=" + iplaynum;
    url = getChargeURL(url);
    request(url, 'jsonp', playZhuanTiMusic);
  } else if (source == 36) {
    // var url = 'http://album.kuwo.cn/album/MusicTopicServlet?node=pastList&type=' + sourceid + '&callback=playGeDanMusic';
    // $.getScript(url);
    var url = 'http://album.kuwo.cn/album/MusicTopicServlet?node=pastList&type=' + sourceid;
    url = getChargeURL(url);
    request(url, 'jsonp', playGeDanMusic);
  }
  evt.stopPropagation();
}

function playMusicBigString(objs, flag) {
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
  var musicstringarray;
  var sarray;
  var si;
  var rid;
  var mp3rid;
  var mvrid;
  var musicstringarray;
  var xia;
  var psrc = iPlayPSRC || "";
  psrc = "VER=2015;FROM=曲库->" + psrc;
  psrc = encodeURIComponent(psrc);
  //flag为true 用param
  var onlineflag = false;//online:0代表无版权
  if (flag) {
    for (var i = 0; i < musicSize; i++) {
      someObj = musicList[i];
      if (typeof(someObj.online) != "undefined" && someObj.online.length == 1 && someObj.online == 0) {
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
          if (j == 9 || j == 10) {
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
      musicstringarray[musicstringarray.length] = musicString;
      musicstringarray[musicstringarray.length] = psrc;
      musicstringarray[musicstringarray.length] = someObj.formats;
      musicstringarray[musicstringarray.length] = getMultiVerNum(someObj);
      musicstringarray[musicstringarray.length] = getPointNum(someObj);
      musicstringarray[musicstringarray.length] = getPayNum(someObj);
      musicstringarray[musicstringarray.length] = getArtistID(someObj);
      musicstringarray[musicstringarray.length] = getAlbumID(someObj);
      musicstringarray[musicstringarray.length] = someObj.mp4sig1 || 0;
      musicstringarray[musicstringarray.length] = someObj.mp4sig2 || 0;
      musicstringarray[musicstringarray.length] = someObj.isdownload || '0';
      musicstringarray[musicstringarray.length] = someObj.tpay || '0';
      musicstringarray[musicstringarray.length] = '0';
      musicstringarray[musicstringarray.length] = encodeURIComponent(`rid=${formatMusicId(someObj)}`);
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
      if (typeof(someObj.online) != "undefined" && someObj.online.length == 1 && someObj.online == 0) {
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
      musicstringarray[xia++] = someObj.mkvnsig1;
      musicstringarray[xia++] = someObj.mkvnsig2;
      musicstringarray[xia++] = mvrid;
      musicstringarray[xia++] = someObj.hasecho;
      musicstringarray[xia++] = psrc;
      musicstringarray[xia++] = someObj.formats;
      musicstringarray[xia++] = getMultiVerNum(someObj);
      musicstringarray[xia++] = getPointNum(someObj);
      musicstringarray[xia++] = getPayNum(someObj);
      musicstringarray[xia++] = getArtistID(someObj);
      musicstringarray[xia++] = getAlbumID(someObj);
      musicstringarray[xia++] = someObj.mp4sig1 || 0;
      musicstringarray[xia++] = someObj.mp4sig2 || 0;
      musicstringarray[xia++] = someObj.isdownload || '0';
      musicstringarray[xia++] = someObj.tpay || '0';
      musicstringarray[xia++] = '0';
      musicstringarray[xia++] = encodeURIComponent(`rid=${formatMusicId(someObj)}`);
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
  try {
    if (onlineflag) {
      if (bigarray.length == 0) {
        musicOnline();
      }
    }
  } catch (e) {
  }
  return bigString;
}

function playBangMusic(jsondata) {
  var data = jsondata;
  if (typeof (data) == "undefined" || data == null || typeof (data.musiclist) == "undefined") {
    return;
  }
  var musicList = data.musiclist;
  var musicSize = musicList.length;
  var bigString = "";
  bigString = playMusicBigString(musicList, true);
  if (dataCsrc != "") bigString += "&CSRC=" + encodeURIComponent(dataCsrc);
  $(".i_play_loading").removeClass().addClass("i_play");
  setTimeout(function () {
    callClientNoReturn("Play?mv=0&n=" + musicSize + bigString);
    bigString = null;
    musicList = null;
    data = null;
    musicSize = null;
  }, 100);
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
  if (dataCsrc != "") bigString += "&CSRC=" + encodeURIComponent(dataCsrc);
  $(".i_play_loading").removeClass().addClass("i_play");
  setTimeout(function () {
    callClientNoReturn("Play?mv=0&n=" + musicSize + bigString);
    musicList = null;
    bigString = null;
    data = null;
  }, 100);
}

function playGeDanMusic(jsondata) {
  var data = jsondata;
  if (typeof (data) == "undefined" || data == null || typeof (data.musiclist) == "undefined") {
    return;
  }
  var musicList = data.musiclist;
  var musicSize = musicList.length;
  var bigString = "";
  bigString = playMusicBigString(musicList, true);
  if (dataCsrc != "") bigString += "&CSRC=" + encodeURIComponent(dataCsrc);
  $(".i_play_loading").removeClass().addClass("i_play");
  setTimeout(function () {
    callClientNoReturn("Play?mv=0&n=" + musicSize + bigString);
    musicList = null;
    bigString = null;
    data = null;
  }, 100);
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
  if (dataCsrc != "") bigString += "&CSRC=" + encodeURIComponent(dataCsrc);
  $(".i_play_loading").removeClass().addClass("i_play");
  setTimeout(function () {
    callClientNoReturn("Play?mv=0&n=" + musicSize + bigString);
    musicList = null;
    bigString = null;
    data = null;
  }, 100);
}

function playZhuanTiMusic(jsondata) {
  var data = jsondata;
  var name = data;
  if (data == null || typeof (data.musiclist) == "undefined" || data.musiclist.length == 0) {
    return;
  }
  var musicList = data.musiclist;
  var musicSize = musicList.length;
  var bigString = "";
  var musicarray = [];
  var musici = 0;
  var someobj;
  var musicString;
  var psrc = iPlayPSRC || "";
  psrc = "VER=2015;FROM=曲库->" + psrc;
  psrc = encodeURIComponent(psrc);
  var onlineflag = false;
  for (var i = 0; i < musicSize; i++) {
    someobj = musicList[i];
    if (typeof(someobj.online) != "undefined" && someobj.online.length == 1 && someobj.online == 0) {
      onlineflag = true;
      continue;
    }
    musicString = decodeURIComponent(someobj.param).replace(/;/g, "\t");
    musicString += '\t' + psrc;
    musicString += '\t' + someobj.formats;
    musicString += '\t' + 0;
    musicString += '\t' + getPointNum(someobj);
    musicString += '\t' + getPayNum(someobj);
    musicString += '\t' + getArtistID(someobj);
    musicString += '\t' + getAlbumID(someobj);
    musicString = encodeURIComponent(musicString);
    musicarray[musici++] = '&s';
    musicarray[musici++] = (i + 1);
    musicarray[musici++] = '=';
    musicarray[musici++] = musicString;
  }
  try {
    if (onlineflag) {
      if (musicarray.length == 0) {
        musicOnline();
        return;
      } else {
        musicOnline(true);
      }
    }
  } catch (e) {
  }
  bigString = musicarray.join("");
  if (dataCsrc != "") bigString += "&CSRC=" + encodeURIComponent(dataCsrc);
  $(".i_play_loading").removeClass().addClass("i_play");
  setTimeout(function () {
    callClientNoReturn("Play?mv=0&n=" + musicSize + bigString);
    musicList = null;
    bigString = null;
    data = null;
  }, 100);
}

function playMVGeDanMusic(jsondata, options) {
  var data = jsondata;
  if (typeof(data) == "undefined" || data == null || typeof(data.musiclist) == "undefined") {
    return;
  }
  var musicList = data.musiclist;
  var musicSize = musicList.length;
  var bigString = "";
  var param = "";
  var paramArray = [];
  var childarray = [];
  var name;
  var artist;
  var album;
  var mvString;
  var mvridnum;
  var musicridnum;
  var pid = data.id;
  var artistid;
  var title = data.title;
  var xia = 0;
  var htmlarray = [];
  var htmli = 0;
  var formats;
  var someobj;
  var psrc = iPlayPSRC || "";
  psrc = "VER=2015;FROM=曲库->" + psrc;
  psrc = encodeURIComponent(psrc);
  var onlineflag = false;
  for (var i = 0; i < musicSize; i++) {
    someobj = musicList[i];
    if (typeof(someobj.online) != "undefined" && someobj.online.length == 1 && someobj.online == 0) {
      onlineflag = true;
      continue;
    }
    if (someobj.hasmv == 0) continue;
    param = someobj.params;
    if (param != "") {
      param = returnSpecialChar(param);
      formats = someobj.formats;
      artistid = someobj.artistid;
      paramArray = param.split(";");
      childarray = [];
      name = paramArray[0];
      childarray[0] = encodeURIComponent(returnSpecialChar(name));
      artist = paramArray[1];
      childarray[1] = encodeURIComponent(returnSpecialChar(artist));
      album = paramArray[2];
      childarray[2] = encodeURIComponent(returnSpecialChar(album));
      for (var j = 3; j < paramArray.length; j++) {
        childarray[j] = paramArray[j];
      }
      mvString = childarray.join('\t');
      childarray = null;
      mvridnum = paramArray[11];
      if (mvridnum.indexOf("MKV") > -1) {
        mvridnum = mvridnum.substring(4);
      } else if (mvridnum.indexOf("MV") > -1) {
        mvridnum = mvridnum.substring(3);
      }
      musicridnum = paramArray[5];
      if (musicridnum.indexOf("MUSIC") > -1) {
        musicridnum = musicridnum.substring(6);
      }
      mvString = mvString + "\t" + psrc + "\t" + formats + "\t" + getMultiVerNum(someobj) + "\t" + getPointNum(someobj) + "\t" + getPayNum(someobj) + "\t" + getArtistID(someobj) + "\t" + getAlbumID(someobj) +'\t' + someobj.mp4sig1 + '\t' + someobj.mp4sig2 + '\t' + someobj.isdownload + '\t' + someobj.tpay;
      mvString = encodeURIComponent(mvString);
      xia++;
      htmlarray[htmli++] = "&s" + xia + "=" + mvString;
    }
  }
  if (onlineflag) {
    if (htmlarray.length == 0) {
      musicOnline();
    }
  }
  if (xia == 0) {
    return;
  }
  var bigString = "n=" + xia + htmlarray.join('');
  if (dataCsrc != "") bigString += "&CSRC=" + encodeURIComponent(dataCsrc);
  $(".i_play_loading").removeClass().addClass("i_play");
  setTimeout(function () {
    callClientNoReturn("Play?mv=1&" + bigString);
    musicList = null;
    bigString = null;
    data = null;
  }, 100);
}

// 播放方法结束---------------

// ele播放方法开始------------
//双击单曲条播放歌曲
$(".music_wrap,.fixed_list li").live("dblclick", function () {
  var $this = $(this);
  var rid = $this.find(".w_name").attr("data-rid");
  var pos = $this.index();
  if ($this.parent().hasClass("specialPos") || $(".newlist").length > 0) {
    pos = parseInt($this.find(".num").html()) - 1;
  }
  var ow_name = $this.find(".w_name");
  var dataCsrc = $("body").attr("data-csrc");
  var csrc = dataCsrc + '->' + ow_name.html();
  if (ow_name.attr("data-type") == "rcm") {
    csrc = dataCsrc + '->相似推荐->' + ow_name.html();
  }

  if ($this.hasClass("spotsPlay")) {
    var playMusicString = MUSICLISTOBJ[rid] + "&CSRC=" + encodeURIComponent(csrc);
    if (rid && playMusicString) {
      singleMusicOption("SpotsPlay", playMusicString);
    }
  } else {
    var playarray = [];
    var playindex = 0;
    $(".icon").each(function (i) {
      var thisObj = $(this);
      var rid = thisObj.attr("data-rid");
      var flag = true;
      var inputprev = thisObj.parents(".music_wrap") || thisObj.parents("li");
      if (inputprev.hasClass("copyright")) {
        flag = false;
      }
      if (flag && rid && MUSICLISTOBJ[rid]) {
        playindex++;
        playarray[playarray.length] = "&s" + playindex + "=" + MUSICLISTOBJ[rid];
      }
    });
    if (playindex > 0) {
      var playMusicString = ("n=" + playindex + playarray.join(""));
      multipleMusicOption("NewSinglePlay", playMusicString, pos);
    }
  }
  csrc = "";
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": "PLAY",
      "pos": parseInt($(this).find(".num").html()) - 1,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": rid,
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    sendFromSearchLog(logObj);
  }
  //添加相似推荐的展开
  // var oMoreBtn=$(this).find('.newm_more');
  // if(oMoreBtn.attr('class')=='newm_more'){
  //     oMoreBtn.click();
  // }
});

// 歌曲 播放 添加 MV 下载 更多等操作
$(".m_play").live("click", function () {
  if ($(this).parentsUntil("ul").hasClass("copyright")) {
    musicOnline();
    return;
  }

  var rid = $(this).parent().attr("data-rid");
  var playMusicString = MUSICLISTOBJ[rid];
  if (rid && playMusicString) {
    singleMusicOption("Play", playMusicString);
  }
  playMusicString = null;
});
$(".m_add").live("click", function () {
  if ($(this).parentsUntil("ul").hasClass("copyright")) {
    musicOnline();
    return;
  }
  var rid = $(this).parent().attr("data-rid");
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  var searchLog = "";
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": "ADD",
      "pos": parseInt($(this).parents("li").find(".num").html()) - 1,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": rid,
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    sendFromSearchLog(logObj);
    searchLog = "&searchlog=" + sendFromSearchLog(logObj, "needResult");
  }
  var playMusicString = MUSICLISTOBJ[rid];
  var playindex = 0;
  if (rid && playMusicString) {
    playindex++;
    var playMusicStr = "n=" + playindex + "&s" + playindex + "=" + MUSICLISTOBJ[rid];
    multipleMusicOption("AddTo", playMusicStr + searchLog);
  }
});
$(".m_mv").live("click", function () {
  if ($(this).hasClass('j_openMv')) return;
  if ($(this).parentsUntil("ul").hasClass("copyright")) {
    musicOnline();
    return;
  }
  var rid = $(this).parents().find(".icon").attr("data-rid");
  var csrc = $("body").attr("data-csrc") + '->' + $(this).parents("li").find(".w_name").html();
  var playMusicString = MUSICLISTOBJ[rid] + "&CSRC=" + encodeURIComponent(csrc);
  if (rid && playMusicString) {
    singleMusicOption("MV", playMusicString);
  }
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": "MV",
      "pos": parseInt($(this).parents("li").find(".num").html()) - 1,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": rid,
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    sendFromSearchLog(logObj);
  }
  //添加相似推荐的展开
  // var oMoreBtn=$(this).parents('.music_wrap').find('.newm_more');
  // if(oMoreBtn.attr('class')=='newm_more'){
  //     oMoreBtn.click();
  // }
});
//相似推荐的mv播放逻辑
$(".j_openMv").live("click", function () {
  if ($(this).parentsUntil("ul").hasClass("copyright")) {
    musicOnline();
    return;
  }
  var rid = $(this).parents().find(".iconwrap").attr("data-rid");
  var ow_name = $(this).parents("li").find(".w_name");
  var csrc = $("body").attr("data-csrc") + '->' + ow_name.html();
  if (ow_name.attr("data-type") == "rcm") {
    csrc = $("body").attr("data-csrc") + '->相似推荐->' + ow_name.html();
  }
  var playMusicString = MUSICLISTOBJ[rid] + "&CSRC=" + encodeURIComponent(csrc);
  if (rid && playMusicString) {
    singleMusicOption("MV", playMusicString);
  }
});
$(".m_down").live("click", function () {
  if ($(this).hasClass("notAllow")) {
    return;
  }
  if ($(this).parentsUntil("ul").hasClass("copyright")) {
    musicOnline();
    return;
  }
  var rid = $(this).parent().attr("data-rid");
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  var searchLog = "";
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": "DOWNLOAD",
      "pos": parseInt($(this).parents("li").find(".num").html()) - 1,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": rid,
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    sendFromSearchLog(logObj);
    searchlog = "&searchlog=" + sendFromSearchLog(logObj, "needResult");
  }
  var playMusicString = MUSICLISTOBJ[rid];
  if (rid && playMusicString) {
    singleMusicOption("Down", playMusicString + searchLog);
  }
});
$(".m_more").live("click", function () {
  var _this = $(this);
  if (_this.parentsUntil("ul").hasClass("copyright")) {
    musicOnline();
    return;
  }
  var rid = _this.parent().attr("data-rid");
  var similarFlag = _this.attr("data-similarFlag") || "0";
  var dataCsrc = $("body").attr("data-csrc");
  var csrc = dataCsrc + '->' + _this.parents("li").find(".w_name").html();
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  var searchLog = "";
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": "MORE",
      "pos": parseInt(_this.parents("li").find(".num").html()) - 1,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": rid,
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    searchLog = "&searchlog=" + sendFromSearchLog(logObj, "needResult");
  }
  var playMusicString = MUSICLISTOBJ[rid];
  if (rid && playMusicString) {
    var call = "ShowOperation?bSimilarRecomShow=" + similarFlag + "&song=" + playMusicString + searchLog + "&CSRC=" + encodeURIComponent(csrc);
    callClientAsyn(call, function (name, args) {
      var type = args[0];
      if (type == "SimilarRecom") {//相似推荐
        _this.parent().find(".newm_more").click();
      } else if (type == "NextPlay") {
        singleMusicOption("NextPlay", playMusicString);
      }
    });
  }
});
// 清晰度
$(".m_hd").live("click", function () {
  if ($(this).parentsUntil("ul").hasClass("copyright")) {
    musicOnline();
    return;
  }
  var rid = $(this).parents("li").attr("c-rid");
  var playMusicString = MUSICLISTOBJ[rid];
  var mdcode = $(this).attr("data-md");
  if (rid && playMusicString && mdcode) {
    singleMusicOption("ShowHQ", playMusicString, mdcode);
  }
});
// 歌曲名称 点击
$(".w_name,.j_mname").live("click", function () {
  var $this = $(this);
  var $music_wrap = $this.parents("li");
  var pos = $music_wrap.index();
  if ($music_wrap.parent().hasClass("specialPos") || $(".newlist").length > 0) {
    pos = parseInt($music_wrap.find(".num").html()) - 1;
  }
  var rid = $this.attr("data-rid");
  var dataCsrc = $("body").attr("data-csrc");
  var singleTitle = $(this).parents(".singleList").find("h2").html();
  if (singleTitle) {
    var pos = singleTitle.indexOf("热门歌曲");
    if (pos > -1) {
      singleTitle = singleTitle.substring(pos);
    }
    dataCsrc += '->' + returnSpecialChar(singleTitle);
  }
  var csrc = dataCsrc + '->' + $(this).html();
  if ($this.attr("data-type") == "rcm") {
    csrc = $("body").attr("data-csrc") + '->相似推荐->' + $(this).html();
  } else {
    // 从搜索来的新统计日志
    var searchKey = $("body").attr("log-searchKey");
    if (searchKey) {
      var searchKeyArr = searchKey.split("-");
      searchKey = searchKeyArr[0];
      var ref = searchKeyArr[1];
      var refname = $(".name").html();
      if (ref == "专辑") {
        refname = $(".name b").html();
      }
      if (searchKeyArr[2]) {
        var oldRefName = refname;
        if (searchKeyArr[2] == "大合集") {
          refname = ref + ":" + refname;
        } else {
          refname = searchKeyArr[2] + '->' + oldRefName;
        }
        ref = "单曲";
      }
      var logObj = {
        "operationType": "PLAY",
        "pos": pos,
        "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
        "rid": rid,
        "hitNum": $(".checkall font").html(),
        "searchKey": searchKey
      }
      sendFromSearchLog(logObj);
    }
  }
  if ($music_wrap.hasClass("spotsPlay")) {
    var playMusicString = MUSICLISTOBJ[rid] + "&CSRC=" + encodeURIComponent(csrc);
    if (rid && playMusicString) {
      singleMusicOption("SpotsPlay", playMusicString);
    }
  } else {
    var playarray = [];
    var playindex = 0;
    $(".icon").each(function (i) {
      var thisObj = $(this);
      var rid = thisObj.attr("data-rid");
      var flag = true;
      var inputprev = thisObj.parents(".music_wrap") || thisObj.parents("li");
      if (inputprev.hasClass("copyright")) {
        flag = false;
      }
      if (flag && rid && MUSICLISTOBJ[rid]) {
        playindex++;
        playarray[playarray.length] = "&s" + playindex + "=" + MUSICLISTOBJ[rid];
      }
    });
    if (playindex > 0) {
      var playMusicString = ("n=" + playindex + playarray.join(""));
      multipleMusicOption("NewSinglePlay", playMusicString, pos);
    }
  }
  //添加相似推荐的展开
  // var oMoreBtn=$(this).parents('.music_wrap').find('.newm_more');
  // if(oMoreBtn.attr('class')=='newm_more'){
  //     oMoreBtn.click();
  // }
});
// 全部播放 添加 MV 下载 操作
$(".all_play").live("click", function () {
  checkChoose();
  var playarray = [];
  var playindex = 0;
  $(".icon").each(function (i) {
    var thisObj = $(this);
    var rid = thisObj.attr("data-rid");
    var flag = true;
    var inputprev = thisObj.parents(".music_wrap") || thisObj.parents("li");
    if (inputprev.hasClass("copyright")) {
      flag = false;
    } else {
      if (inputprev.children().hasClass("m_l")) {
        flag = inputprev.find(".m_ckb").attr("checked");
      }
    }
    if (flag && rid && MUSICLISTOBJ[rid]) {
      playindex++;
      playarray[playarray.length] = "&s" + playindex + "=" + MUSICLISTOBJ[rid];
    }
  });
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": "ALLPLAY",
      "pos": 0,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": $(".like_btn").attr("c-id"),
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    sendFromSearchLog(logObj);
  }
  if (playindex > 0) {
    var playMusicString = ("n=" + playindex + playarray.join(""));
    var type = "Play";
    if ($(this).hasClass("playnext")) {
      type = "PlayNext";
    }

    multipleMusicOption(type, playMusicString);
  }
  //添加相似推荐的展开
//     $(".icon").each(function(i){
//         var thisObj = $(this);
//         //var inputprev = thisObj.parentsUntil(".music_wrap").prev();
//         var inputprev = thisObj.parents(".music_wrap")|| thisObj.parents("li");
//         if(inputprev.children().hasClass("m_l")){
//             var flag = inputprev.find(".m_ckb").attr("checked");
//         }
//         if(flag){
//             var oMoreBtn=thisObj.find('.newm_more');
// //            if(oMoreBtn.attr('class').indexOf('newm_more')>-1){
// //                if(oMoreBtn.attr('class')=='newm_more')oMoreBtn.click();
// //                return false;
// //            }
//             if(oMoreBtn.attr('class') == "newm_more"){
//                 oMoreBtn.click();
//                 return false;
//             }
//         }
//     });
});

$(".all_playmv").live("click", function () {
  try {
    var mvString = "";
    var htmlarray = [];
    var PLAYOBJ;
    if ($(this).hasClass("latest")) {
      var index = $(this).parent().find("span .current").index();
      PLAYOBJ = $(".kw_album_list div").eq(index).attr("c-data").split(',');
    } else {
      PLAYOBJ = MVLISTOBJ;
    }
    var onlineflag = false;
    var mvlistsize = PLAYOBJ.length;
    for (var i = 0; i < PLAYOBJ.length; i++) {
      var someobj = MVLISTOBJECT[i];
      if (typeof(someobj) != "undefined" && typeof(someobj.online) != "undefined" && someobj.online.length == 1 && someobj.online == 0) {
        mvlistsize--;
        onlineflag = true;
        continue;
      }
      htmlarray[i] = "&s" + (i + 1) + "=" + returnSpecialChar(PLAYOBJ[i]);
    }
    if (onlineflag) {
      if (mvlistsize == 0) {
        musicOnline();
        return;
      } else {
        musicOnline(true);
      }
    }
    mvString = ("n=" + PLAYOBJ.length + htmlarray.join(''));
    multipleMusicOption("MV", mvString);
  } catch (e) {
  }
  return false;
});

$(".all_add").live("click", function (e) {
  checkChoose();
  var playarray = [];
  var playindex = 0;
  $(".icon").each(function () {
    var thisObj = $(this);
    var rid = thisObj.attr("data-rid");
    var flag = true;
    var inputprev = thisObj.parents(".music_wrap") || thisObj.parents("li");
    if (inputprev.hasClass("copyright") || inputprev.parent().hasClass("copyright")) {
      //musicOnline();
      flag = false;
    } else {
      if (inputprev.children().hasClass("m_l")) {
        flag = inputprev.find(".m_ckb").attr("checked");
      }
    }
    if (flag && rid && MUSICLISTOBJ[rid]) {
      playindex++;
      playarray[playarray.length] = "&s" + playindex + "=" + MUSICLISTOBJ[rid];
    }
  });
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": "ALLADD",
      "pos": 0,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": $(".like_btn").attr("c-id"),
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    sendFromSearchLog(logObj);
    var searchLog = "&searchlog=" + sendFromSearchLog(logObj, "needResult");
  }
  if (playindex > 0) {
    var playMusicString = ("n=" + playindex + playarray.join(""));
    multipleMusicOption("AddTo", playMusicString + searchLog);


  }
});
$(".all_mv").live("click", function () {
  var playarray = [];
  var playindex = 0;
  $(".icon").each(function () {
    var thisObj = $(this);
    var rid = thisObj.attr("data-rid");
    var flag = true;
    var inputprev = thisObj.parents(".music_wrap") || thisObj.parents("li");
    if (inputprev.parent().hasClass("copyright")) {
      //musicOnline();
      flag = false;
    } else {
      if (inputprev.children().hasClass("m_l")) {
        flag = inputprev.find(".m_ckb").attr("checked");
      }
    }
    if (flag && !thisObj.find(".m_mv").hasClass("m_mv_n") && rid && MUSICLISTOBJ[rid]) {
      playindex++;
      playarray[playarray.length] = "&s" + playindex + "=" + MUSICLISTOBJ[rid];
    }
  });
  if (playindex > 0) {
    var playMusicString = ("n=" + playindex + playarray.join(""));
    multipleMusicOption("MV", playMusicString);
  }
});

$(".all_down").live("click", function () {
  var chargePath = $(".toolbar .all_down").attr("data-psrc")
  if (chargePath) {
    saveDataToCache("chargePsrc", chargePath)
  }
  checkChoose();
  var playarray = [];
  var playindex = 0;
  var isAllNotAllow = true;
  $(".icon").each(function () {
    var thisObj = $(this);
    var rid = thisObj.attr("data-rid");
    var flag = true;
    var inputprev = thisObj.parents(".music_wrap") || thisObj.parents("li");
    if (inputprev.hasClass("copyright") || inputprev.parent().hasClass("copyright") || thisObj.find(".m_down").hasClass("notAllow")) {
      //musicOnline();
      flag = false;
    } else {
      if (inputprev.children().hasClass("m_l")) {
        flag = inputprev.find(".m_ckb").attr("checked");
      }
    }
    if (flag && rid && MUSICLISTOBJ[rid]) {
      playindex++;
      playarray[playarray.length] = "&s" + playindex + "=" + MUSICLISTOBJ[rid];
      if (!thisObj.find(".m_down").hasClass("notAllow")) {
        isAllNotAllow = false;
      }
    }
  });
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  var searchLog = "";
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": "ALLDOWNLOAD",
      "pos": 0,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": $(".like_btn").attr("c-id"),
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    sendFromSearchLog(logObj);
    searchLog = "&searchlog=" + sendFromSearchLog(logObj, "needResult");
  }
  if (playindex > 0) {
    var playMusicString = ("n=" + playindex + playarray.join(""));
    var packdown = false;
    var packname = "";
    var packid = "";
    var packpic = "";
    var packinfo = "";
    var packtype = "";
    if (isAllNotAllow) {
      qukuTips("应版权方要求暂不能下载");
    }
    if (typeof(currentAlbumName) != "undefined" && $(".all_ckb").attr("checked")) {
      packdown = true;
      packname = currentAlbumName;
      packid = currentAlbumId;
      packpic = currentAlbumPic;
      packinfo = currentAlbumInfo;
      packtype = "album";
    } else if (typeof(currentPlaylistName) != "undefined" && $(".all_ckb").attr("checked")) {
      packdown = true;
      packname = currentPlaylistName;
      packid = currentPlaylistId;
      packpic = currentPlaylistPic;
      packinfo = currentPlaylistInfo;
      packtype = "playlist";
    }
    if (packdown) {
      packname = encodeURIComponent(returnSpecialChar(packname));
      packpic = packpic.replace("albumcover/150", "albumcover/100");
      packpic = encodeURIComponent(packpic);
      packinfo = encodeURIComponent(packinfo);
      multipleMusicOption("PackDown", playMusicString + "&packname=" + packname + "&packpic=" + packpic + "&packid=" + packid + "&packtype=" + packtype + "&packinfo=" + packinfo + "&src=netsong2015");
    } else {
      multipleMusicOption("Down", playMusicString + searchLog);
    }
  }
});
// 单曲复选框
$(".m_ckb").live("click", function (e) {
  var isAllChecked = $(".m_ckb").length == $(".m_ckb:checked").length;
  $(".all_ckb").attr("checked", isAllChecked)
  e.stopPropagation()
})
// 全选框
$(".all_ckb").live("click", function () {
  var thisObj = $(this);
  var flag = thisObj.attr("checked");
  if (!flag) {
    $(".m_ckb").attr("checked", false);
  } else {
    $(".m_ckb").attr("checked", true);
  }
});
// ele播放方法结束------------

// 操作歌曲方法开始---------------
// 操作歌曲下线的歌曲
function musicOnline(flag) {
  callClientNoReturn(`toast?icontype=0&msg=${encodeURIComponent('很抱歉，因版权原因，暂时无法提供该资源相关服务。')}`);
}

// 打开弹幕的方法
function openTanMu(obj) {
  if ($(obj).parentsUntil("ul").hasClass("copyright")) {
    musicOnline();
    return;
  }
  var rid = $(obj).parents("li").attr("c-rid") || $(obj).parents("li").find(".icon").attr("data-rid");
  if (rid && MUSICLISTOBJ[rid]) {
    var csrc = $("body").attr("data-csrc") + '->' + $(obj).parents("li").find(".w_name").html();
    var playMusicString = MUSICLISTOBJ[rid] + "&CSRC=" + encodeURIComponent(csrc);
    singleMusicOption("MV", playMusicString + "&tanmustarted=1");
  }
}

//歌曲拖拽
$(".music_wrap,.fixed_list li").live("mousedown", function (e) {
  var ev = e || event;
  musicMove(ev, $(this));

});
$(".openSong li").live("mousedown", function (e) {
  var ev = e || event;
  musicMove(ev, $(this));
  return false;
});

$(".music_wrap,.fixed_list li,.openSong li").live("mouseup", function () {
  isDragMusic = false;
  $(this).unbind("mousemove");
});

function musicMove(ev, obj) {
  if (typeof(ev.which) != "undefined" && ev.which == 3) {
    return;
  }
  currentX = ev.clientX;
  currentY = ev.clientY;
  isDragMusic = true;
  kk = true;
  var rid = obj.find(".w_name").attr("data-rid");
  dragMusicString = MUSICLISTOBJ[rid];
  obj.mousemove(function (e) {
    var ev = e || event;
    var X = ev.clientX;
    var Y = ev.clientY;
    if (Math.abs(X - currentX) > 5 || Math.abs(Y - currentY) > 5) {
    } else {
      return false;
    }
    if (isDragMusic && dragMusicString != "") {
      var currentobj = $(event.srcElement);
      if (currentobj.is("a")) {
        isDragMusic = false;
        return false;
      } else if (currentobj.is("input")) {
        isDragMusic = false;
        return false;
      } else {
        if (kk) {
          kk = false;
          if (obj.hasClass("copyright")) {
            musicOnline();
            return;
          }
          callClientNoReturn("Begindrag?song=" + dragMusicString);
        }
      }
      return false;
    }
  });
}


// hover 歌曲列表显示TIPS
$(".music_wrap").live("mouseenter", function () {
  getMusicOrigin($(this));
});

//hover 歌曲列表显示TIPS
$(".music_wrap").live("mouseleave", function () {
});

// 列表中一行歌曲信息被选中的状态
$(".music_wrap").live("click", function () {
  $(".music_wrap").removeClass("music_wrapClicked");
  $(this).find(".m_mv").addClass("m_mvClicked");
  $(this).addClass("music_wrapClicked");
});
$(".music_wrap").live("mouseenter", function () {
  if ($(this).hasClass("music_wrapClicked")) {
    $(this).addClass("music_wrapClicked");
  }
});

// 操作后和歌曲有间接联系
//显示隐藏喜欢按钮
var ver = getVersion();

function showLike(type, digest, act) {
  var uid = getUserID("uid");
  var sourceid = $(".like_btn").attr("c-id");
  var url = "http://artistfeeds.kuwo.cn/qz.s?f=web&type=" + type + "&uid=" + uid + "&digest=" + digest + "&sid=" + sourceid + "&prod=" + ver + "&corp=kuwo";
  if (digest == '8') {
    var sid = getUserID("sid");
    url = "http://nplserver.kuwo.cn/pl.svc?op=like&uid=" + uid + "&sid=" + sid + "&act=" + act + "&sourceid=" + sourceid + "&type=" + type + '&newver=1';
  }
  $.ajax({
    url: url,
    dataType: "text",
    type: "get",
    crossDomain: false,
    success: function (jsondata) {
      if (digest == "8" && act != "get") {
        var fav = "false";
        var csrc = $("body").attr("data-csrc");
        var name = csrc.substring(csrc.lastIndexOf("->") + 2);
        if (act == "add") {
          fav = "true";
        }
        callClientNoReturn("SetFavList?id=" + sourceid + "&fav=" + fav + "&name=" + encodeURIComponent(name));
      }
      var data = eval('(' + jsondata + ')');
      likeOperation(data, type, act);
    },
    error: function () {
    }
  });
}

function getLikeStatus(source) {
  var sourceid = $(".like_btn").attr("c-id");
  var url = "http://wapi.kuwo.cn/api/collect/status?uid=" + getUserID("uid") + "&source=" + source + "&sourceId=" + sourceid + "&prod=" + ver + "&corp=kuwo";
  $.ajax({
    url: url,
    dataType: "text",
    type: "get",
    crossDomain: false,
    success: function (jsondata) {
      var data = eval('(' + jsondata + ')');
      likeOperation(data);
    },
    error: function () {
    }
  });
}

function likeOperation(jsondata, type, act) {
  var likeArray = ['收藏', '已收藏'];
  var data = jsondata;
  if (typeof(data) == "undefined" || data == null) return;
  var result = data.result;
  if ((data.code && data.code == -1) || (result && result != "ok")) {
    // webLog("likeOperation:喜欢系统返回错误");
    $(".like_btn").removeClass("like_current");
    $(".like_btn").show();
    $(".like_btn").html(likeArray[0]).show();
    return;
  }
  var opret = data.msg || data.opret;
  if (opret == "未收藏" || opret == "notcollected") {
    $(".like_btn").removeClass("like_current");
    $(".like_btn").html(likeArray[0]).show();
  }
  if (opret == "已收藏" || opret == "collected") {
    $(".like_btn").addClass("like_current");
    $(".like_btn").html(likeArray[1]).show();
  }
  if (opret == "ok" || (result && result == "ok")) {
    var likehtml = "";
    if (type == "click_like" || act == "add") {
      $(".like_btn").html(likeArray[1]).show();
      $(".like_btn").addClass("like_current");
    } else if (type == "cancel_like" || act == "delete") {
      $(".like_btn").html(likeArray[0]).show();
      $(".like_btn").removeClass("like_current");
    }
  }
}

//点击内容页的喜欢按钮
$(".like_btn").live("click", function () {
  var likeArray = ['收藏', '已收藏'];
  var uid = getUserID("uid");
  var operationType = "ALLLIKE";
  if (uid == 0) {
    setTimeout(function () {
      callClientNoReturn("UserLogin?src=login");
    }, 25);
  } else {
    var likehtml = $(this).html();
    var type = "";
    var gedanAct = "";
    if (likehtml == likeArray[0]) {
      type = "click_like";
      gedanAct = "add";
    } else if (likehtml == likeArray[1]) {
      type = "cancel_like";
      gedanAct = "delete";
      operationType = "ALLUNLIKE";
    }
    var digest = $(this).attr("c-digest");
    var target = $(this).attr("c-target");
    if (digest == "8") type = target;
    showLike(type, digest, gedanAct);
  }
  // 从搜索来的新统计日志
  var searchKey = $("body").attr("log-searchKey");
  if (searchKey) {
    var searchKeyArr = searchKey.split("-");
    searchKey = searchKeyArr[0];
    var ref = searchKeyArr[1];
    var refname = $(".name").html();
    if (ref == "专辑") {
      refname = $(".name b").html();
    }
    if (searchKeyArr[2]) {
      var oldRefName = refname;
      if (searchKeyArr[2] == "大合集") {
        refname = ref + ":" + refname;
      } else {
        refname = searchKeyArr[2] + '->' + oldRefName;
      }
      ref = "单曲";
    }
    var logObj = {
      "operationType": operationType,
      "pos": 0,
      "ref": "乐库->搜索结果->" + searchKey + "->REF" + ref + "->" + refname,
      "rid": $(".like_btn").attr("c-id"),
      "hitNum": $(".checkall font").html(),
      "searchKey": searchKey
    }
    sendFromSearchLog(logObj);
  }
  return false;
});
//点击内容页的喜欢按钮
$(".artist_radio").live("click", function () {
  var artistId = $(this).attr("c-id");
  var artistName = $(this).attr("c-name");
  playRadio(artistId, 'artist', artistName + '电台');
  try {
    var csrc = $(this).attr('radio-csrc');
    radioLog('POSITION:1,1|GPOSITION:1,1|FROMPAGE:歌手|RADIOID:' + artistId + '|CSRCTAG:' + csrc);
  } catch (e) {
  }
  return false;
});
//点击内容页的喜欢按钮
$(".bang_radio").live("click", function () {
  var phbid = $(this).attr("c-id");
  var phbname = $(this).attr("c-name");
  playRadio(phbid, 'rank', phbname + '电台');
  try {
    radioLog('POSITION:1,1|GPOSITION:1,1|FROMPAGE:排行榜|RADIOID:' + phbid);
  } catch (e) {
  }
  return false;
});

/*小地球点击事件*/
$('.earth').live('click', function (ev) {
  var oTip = $(this).parents('.music_wrap').find('.sourceTips');
  var oBox = $(this).parents('.music_wrap');
  oTip = oTip[0];
  oBox = oBox[0];
  var oEvent = ev || event;
  var _this = $(this);
  var liLen = $(this).parents('ul').children().length;
  var index = _this[0].parentNode.parentNode.parentNode.parentNode.getAttribute('data-index') || _this.parents('.music_wrap').attr('data-index');
  $('.sourceTips').hide();
  $('.ugc_tipsBox').hide();
  var rid = $(this).parents(".music_wrap").attr('c-rid');
  var url = 'http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids=' + rid + '&callback=loadMusicOrigin';
  $.getScript(url, function () {
    var text = '';
    if (jsondata.tag.length > 35) {
      text = jsondata.tag.substring(0, 34) + '...';
    } else {
      text = jsondata.tag;
    }
    oTip.children[2].innerHTML = '来源：' + text;
  });
  //相似推荐内的小地球
  if ($(this).hasClass('j_openE')) {
    if ($(this).attr('data-index') % 5 == 0 || $(this).attr('data-index') % 5 == 1) {
      $(oTip).addClass('sourceTips2');
      oTip.style.top = (parseInt($(this).position().top) + 20) + 'px';
    } else {
      oTip.style.top = (parseInt($(this).position().top) - 80) + 'px';
    }
    oTip.style.right = 48 + 'px';
    $(oTip).show();
    return;
  }
  if (liLen < 5) {
    $(oTip).addClass('sourceTips2');
    oTip.style.top = (oEvent.pageY + 10) + 'px';
    $(oTip).show();
  } else {
    if (liLen - index < 10) {
      oTip.style.top = (oEvent.pageY - 90) + 'px';
      $(oTip).show();
    } else if (index < 3) {
      $(oTip).addClass('sourceTips2');
      oTip.style.top = (oEvent.pageY + 10) + 'px';
      $(oTip).show();
    } else if (liLen - index < 3) {
      oTip.style.top = (oEvent.pageY - 90) + 'px';
      $(oTip).show();
    } else {
      oTip.style.top = (oEvent.pageY - 90) + 'px';
      $(oTip).show();
    }
  }
  return false;
});

/*小地球弹窗关闭*/
$('.j_earthBtn').live('click', function () {
  $(this).parent().hide();
});

/*小地球MV点击事件*/
$('.bmv_earth').live('mouseenter mouseleave', function (ev) {
  var oBox = $(this)[0].parentNode.parentNode.parentNode.parentNode;
  if (ev.type == 'mouseenter') {
    $(this).addClass('bmv_earthhover');
  } else {
    $(this).removeClass('bmv_earthhover');
  }
});

;(function () {
  var ele = [];
  $('.bmv_earth').live('click', function (ev) {
    $('.sourceTips').hide();
    var oBox = $(this)[0].parentNode.parentNode;
    ele[0] = oBox;
    var oEvent = ev || event;
    var _this = $(this);
    var oTip = $(oBox).find('.sourceTips');
    ele[1] = oTip;
    var liLen = $(this).parents('ul').children().length;
    var index = oBox.getAttribute('data-index');
    var rid = $(this).parents('.bmv_wrap').attr('data-rid');
    var url = 'http://datacenter.kuwo.cn/d.c?cmd=query&ft=music&cmkey=mbox_minfo&resenc=utf8&ids=' + rid + '&callback=loadMusicOrigin';
    $.getScript(url, function () {
      var text = '';
      if (jsondata.tag.length > 42) {
        text = jsondata.tag.substring(0, 41) + '...';
      } else {
        text = jsondata.tag;
      }
      oTip[0].children[2].innerHTML = '来源：' + text;
    });

    var clientWidth = document.documentElement.clientWidth;
    if (oEvent.clientX < Math.floor(clientWidth / 2)) {
      $(oTip).addClass('sourceTips2');
    } else {
      $(oTip).removeClass('sourceTips2');
    }
    oTip.show();
    return false;
  });
  var fobj = window.parent;
  fobj.window.onresize = function () {
    var clientWidth = fobj.document.documentElement.clientWidth;
    if (ele[0]) {
      setTimeout(function () {
        var eleLeft = ele[0].offsetLeft;
        if (eleLeft < Math.floor(clientWidth / 2) - 50) {
          $(ele[1]).addClass('sourceTips2');
        } else {
          $(ele[1]).removeClass('sourceTips2');
        }
      }, 200);
    }
    else {
      return false;
    }
  }
})();

// 关于相似推荐的操作
;(function () {
  var bOk = true;
  try {
    $(".newm_more").live("click", function () {
      var cId = $(".like_btn").attr("c-id");
      $(".sourceTips").hide();
      if (bOk) {
        bOk = false;
        clickPageNum = 0;
        //展示逻辑及其它用的变量
        var _this = $(this);
        var oParent = $(this).parents('.music_wrap')[0];
        var openArea = $(this).parents('.music_wrap').find('.openArea')[0];

        var oDisText = $(oParent).next();
        var indexnum = parseInt($(oParent).find('.num').html());
        var entername = $('.bread').find('span').html() || 'playlist';

        if (entername.indexOf('私人口味集') > -1 || entername.indexOf('发现好歌') > -1) {
          var enter = 'rcm';
        } else {
          var enter = 'playlist';
        }
        //箭头改变的方法
        var openstyle = $(this).attr('class');
        $(".newm_more").removeClass('newm_moreUp');
        $('.discoverText').show();
        if (openstyle == 'newm_more') {
          $(this).addClass('newm_moreUp');
          //推荐理由的消失与显示
          if (oDisText.attr('class') == 'discoverText') oDisText.hide();
        } else {
          $(this).removeClass('newm_moreUp');
          if (oDisText.attr('class') == 'discoverText') oDisText.show();
        }

        //其它消失 当前显示
        $('.openArea').hide();
        $('.openArea').css({'height': 0});
        $('.music_wrap').css({'height': 36, 'marginBottom': 0});
        if ($(openArea).find('.openSong').html() == '' && $(openArea).find('.album').html() == '') {
          var testurl = 'http://60.28.195.115/rec.s?cmd=rcm_sim_pl&uid=181449393&devid=91182400&platform=pc&rid=3496974&plnum=12&musicnum=15&callback=cb';
          //var testurl2='http://60.28.195.115/rec.s?cmd=rcm_sim_pl&uid=181449393&devid=91182400&platform=pc&rid=3496974&plnum=0&musicnum=0&callback=cb';
          //var ='http://60.28.195.115/rec.s?cmd=rcm_sim_pl&uid='+getUserID('uid')+'&devid='+getUserID('devid')+'&platform=pc&rid='+$(this).attr('data-rid')+'&plnum=12&musicnum=15&callback=cb';
          //var URL='http://rcm.kuwo.cn/rec.s?cmd=rcm_sim_pl&uid='+getUserID('uid')+'&devid='+getUserID('devid')+'&platform=pc&rid='+$(this).attr('data-rid')+'&plnum=15&musicnum=15&callback=cb';
          var URL = 'http://mobi.kuwo.cn/mobi.s?f=web&q=12345&type=rcm_sim_pl&uid=' + getUserID('uid') + '&devid=' + getUserID('devid') + '&platform=pc&rid=' + $(this).attr('data-rid') + '&plnum=15&musicnum=15';
          $.ajax({
            url: URL,
            dataType: 'json',
            type: 'get',
            success: function (jsondata) {
              var animateOver = false;
              if (jsondata.music.length > 0 && jsondata.playlist.length > 0) {
                openArea.style.display = 'block';

                animateOver = checkHeight(2, $(oParent), $(openArea));
                bOk = true;

                var albumStr = '';
                var musicStr = '';
                var oAlbumDiv = $(openArea).find(".album");
                var oSongDiv = $(openArea).find(".openSong");
                oSongDiv.css('height', 184);

                //创建专辑
                albumStr = createOpenAlbum(jsondata.playlist, cId);
                oAlbumDiv.html(albumStr);
                for (var i = 0; i < jsondata.playlist.length; i++) {
                  setTimeout(function () {
                    $('.album img').eq(i).attr('src', $('.album img').eq(i).attr('data-original'));
                  }, 1000);
                  if (i > 4) {
                    $(openArea).find('.album div').eq(i).hide();
                  }
                }
                albumStr = '';

                //创建歌曲
                musicStr = creteOpenMusic(jsondata.music, enter);
                oSongDiv.html(musicStr);
                musicStr = '';
              } else if (jsondata.music.length == 0 && jsondata.playlist.length == 0) {
                openArea.style.display = 'block';
                animateOver = checkHeight(0, $(oParent), $(openArea));
                bOk = true;
                var oSongDiv = $(openArea).find(".openSong");
                var oAlbumDiv = $(openArea).find(".album");
                oSongDiv.remove();
                oAlbumDiv.remove();
                var oP = $('<p></p>');
                oP[0].className = 'no';
                oP.html('这首歌还没有相似推荐喔~');
                oP.appendTo($(openArea).find('.moveBox'));
                $(openArea).find('.next').hide();
                $(openArea).find('.prev').hide();
              } else if (jsondata.music.length > 0 && jsondata.playlist.length == 0) {
                openArea.style.display = 'block';

                animateOver = checkHeight(1.2, $(oParent), $(openArea), $(openArea).find('.openSong li'));
                bOk = true;

                var musicStr = '';
                var oSongDiv = $(openArea).find(".openSong");
                var oAlbumDiv = $(openArea).find(".album");
                oSongDiv.css({'height': 184});
                oAlbumDiv.remove();
                musicStr = creteOpenMusic(jsondata.music, enter);
                oSongDiv.html(musicStr);
                musicStr = '';
              } else if (jsondata.music.length == 0 && jsondata.playlist.length > 0) {
                openArea.style.display = 'block';

                animateOver = checkHeight(1.1, $(oParent), $(openArea));
                bOk = true;

                var albumStr = '';
                var oAlbumDiv = $(openArea).find(".album");
                var oSongDiv = $(openArea).find(".openSong");
                oSongDiv.remove();
                albumStr = createOpenAlbum(jsondata.playlist, cId);
                oAlbumDiv.html(albumStr);
                for (var i = 0; i < jsondata.playlist.length; i++) {
                  setTimeout(function () {
                    $('.album img').eq(i).attr('src', $('.album img').eq(i).attr('data-original'));
                  }, 1000);
                  if (i > 4) {
                    $(openArea).find('.album div').eq(i).hide();
                  }
                }
                $(openArea).find('.album').css('border', 0);
                albumStr = '';
              }
              loadImages();
              //计算高度
              var nowST = oParent.offsetTop;
              $('body').scrollTop(nowST);
            },
            error: function (xhr) {
              openArea.style.display = 'block';
              animateOver = checkHeight(0, $(oParent), $(openArea));
              bOk = true;
              var oSongDiv = $(openArea).find(".openSong");
              var oAlbumDiv = $(openArea).find(".album");
              oSongDiv.remove();
              oAlbumDiv.remove();
              var oP = $('<p></p>');
              oP[0].className = 'no';
              oP.html('这首歌还没有相似推荐喔~');
              oP.appendTo($(openArea).find('.moveBox'));
              $(openArea).find('.next').hide();
              $(openArea).find('.prev').hide();

              loadImages();
              //计算高度
              var nowST = oParent.offsetTop;
              $('body').scrollTop(nowST);
            }
          });
          // 相似推荐的点击日志
          realTimeLog("ABLOG", "TYPE:RECOMMEND");
        } else {
          switch ($(openArea).find('.moveBox').children().length) {
            case 0:
              break;
            case 1:
              if ($(openArea).find('.moveBox').children(0).attr('class') == 'album') {
                openArea.style.display = 'block';
                $(openArea).find('.album div').show();

                // $(oParent).css({'height':236,'marginBottom':15});
                // $(openArea).css({'height':202});
                $(oParent).css({'height': 254});
                $(openArea).css({'height': 202});
                bOk = true;
              } else if ($(openArea).find('.moveBox').children(0).attr('class') == 'openSong') {
                $(openArea).find('.openSong li').show();
                openArea.style.display = 'block';
                //$(oParent).css({'height':232,'marginBottom':15});
                //$(openArea).css({'height':204});
                $(oParent).css({'height': 256});
                $(openArea).css({'height': 204});
                bOk = true;
              } else if ($(openArea).find('.moveBox').children(0).attr('class') == 'no') {
                openArea.style.display = 'block';
                $(oParent).css({'height': 254});
                $(openArea).css({'height': 202});
                bOk = true;
              }
              break;
            case 2:
              openArea.style.display = 'block';
              $(openArea).find('.album div').show();
              $(openArea).find('.openSong li').show();
              // $(oParent).css({'height':423,'marginBottom':15});
              // $(openArea).css({'height':395});
              $(oParent).css({'height': 444});
              $(openArea).css({'height': 395});
              bOk = true;
              break;
          }
          // 相似推荐的点击日志
          realTimeLog("ABLOG", "TYPE:RECOMMEND");

          //计算高度
          var nowST = oParent.offsetTop;
          $('body').scrollTop(nowST);
        }
      } else {
        return;
      }
    });
  } catch (e) {
    //alert(e.message);
  }


  // $(".newm_more").live("dblclick",function(){
  //     return false;
  // });

  $('.openArea .openSong .icon a').live('mouseenter mouseleave', function (ev) {
    if (ev.type == 'mouseenter') {
      $(this).parent().css('cursor', 'pointer');
    } else {
      $(this).parent().css('cursor', 'default');
    }
  });

  $(".closeOpenArea").live("click", function () {
    $('.openArea').hide();
    $('.openArea').css({'height': 0});
    $('.music_wrap').css({'height': 36, 'marginBottom': 0});
    var $openArea = $(this).parents(".openArea")
    if ($openArea.find('.album div')) {
      $openArea.find('.album div').hide();
    }
    if ($openArea.find('.openSong li')) {
      $openArea.find('.openSong li').hide();
    }
    bOk = true;
    clickPageNum = 0;
  });
})();

// 展开列表左右按钮的翻页方法

var clickPageNum = 0;
;(function () {
  // 右翻页
  $('.openArea .next').live('click', function () {
    clickPageNum++;
    var aLi = $(this).parents('.similarity').next().find('.openSong li');
    var aDiv = $(this).parents('.similarity').next().find('.album div');
    var len = aLi.length;
    var divLen = aDiv.length;
    if (len > 0 && divLen > 0) {
      var length = aLi[len - 1].getAttribute('data-change');
      var divLength = aDiv[divLen - 1].getAttribute('data-change');
    } else if (len == 0 && divLen > 0) {
      var length = 0;
      var divLength = aDiv[divLen - 1].getAttribute('data-change');
    } else if (len > 0 && divLen == 0) {
      var length = aLi[len - 1].getAttribute('data-change');
      var divLength = 0;
    } else {
      clickPageNum = 0;
      return;
    }
    var changeNum = (clickPageNum % length + parseInt(length)) % length;
    var changeNum2 = (clickPageNum % divLength + parseInt(divLength)) % divLength;
    if (len > 0 && divLen > 0) {
      for (var i = 0; i < len; i++) {
        aLi[i].style.display = 'none';
        if (aLi[i].getAttribute('data-change') == changeNum + 1) {
          aLi[i].style.display = 'block';
        }
      }
      for (var i = 0; i < divLen; i++) {
        aDiv[i].style.display = 'none';
        if (Math.ceil(($(aDiv).eq(i).index() + 1) / 5) == changeNum2 + 1) {
          aDiv[i].style.display = 'block';
        }
      }
    } else if (len > 0 && divLen == 0) {
      for (var i = 0; i < len; i++) {
        aLi[i].style.display = 'none';
        if (aLi[i].getAttribute('data-change') == changeNum + 1) {
          aLi[i].style.display = 'block';
        }
      }
    } else if (len == 0 && divLen > 0) {
      for (var i = 0; i < divLen; i++) {
        aDiv[i].style.display = 'none';
        if (Math.ceil(($(aDiv).eq(i).index() + 1) / 5) == changeNum2 + 1) {
          aDiv[i].style.display = 'block';
        }
      }
    } else {
      return;
    }
  });

  //左翻页
  $('.openArea .prev').live('click', function () {
    clickPageNum--;
    var aLi = $(this).parents('.similarity').next().find('.openSong li');
    var aDiv = $(this).parents('.similarity').next().find('.album div');
    var len = aLi.length;
    var divLen = aDiv.length;
    if (len > 0 && divLen > 0) {
      var length = aLi[len - 1].getAttribute('data-change');
      var divLength = aDiv[divLen - 1].getAttribute('data-change');
    } else if (len == 0 && divLen > 0) {
      var length = 0;
      var divLength = aDiv[divLen - 1].getAttribute('data-change');
    } else if (len > 0 && divLen == 0) {
      var length = aLi[len - 1].getAttribute('data-change');
      var divLength = 0;
    } else {
      clickPageNum = 0;
      return;
    }

    var changeNum = (clickPageNum % length + parseInt(length)) % length;
    var changeNum2 = (clickPageNum % divLength + parseInt(divLength)) % divLength;
    if (len > 0 && divLen > 0) {
      for (var i = 0; i < len; i++) {
        aLi[i].style.display = 'none';
        if (aLi[i].getAttribute('data-change') == changeNum + 1) {
          aLi[i].style.display = 'block';
        }
      }
      for (var i = 0; i < divLen; i++) {
        aDiv[i].style.display = 'none';
        if (Math.ceil(($(aDiv).eq(i).index() + 1) / 5) == changeNum2 + 1) {
          aDiv[i].style.display = 'block';
        }
      }
    } else if (len > 0 && divLen == 0) {
      for (var i = 0; i < len; i++) {
        aLi[i].style.display = 'none';
        if (aLi[i].getAttribute('data-change') == changeNum + 1) {
          aLi[i].style.display = 'block';
        }
      }
    } else if (len == 0 && divLen > 0) {
      for (var i = 0; i < divLen; i++) {
        aDiv[i].style.display = 'none';
        if (Math.ceil(($(aDiv).eq(i).index() + 1) / 5) == changeNum2 + 1) {
          aDiv[i].style.display = 'block';
        }
      }
    } else {
      return;
    }
  });
})();
//双击展开区域取消冒泡
$('.openArea').live('dblclick', function () {
  return false;
});
// 操作歌曲方法结束---------------

// 电台相关开始-------------------
//内容页的收听电台

function playRadio(rcid, rctype, name) {
  var call = 'AddMusicRadio?rcid=' + rcid + '&rctype=' + rctype + '&rcname=' + encodeURIComponent(name) + '&play=1';
  callClientNoReturn(call);
}

//改为异步调用
function getShowRadio(rcid, rctype, strcsrc) {
  var call = 'ShowMusicRadio?rcid=' + rcid + '&rctype=' + rctype;
  callClientAsyn(call, function (name, args) {
    var show = args[0];
    if (show != null && show + '' == '1') {
      setTimeout(function () {
        $(".radio_btn").show();
      }, 100);
      $(".radio_btn").show().attr('radio-csrc', strcsrc);
    } else {
      $(".radio_btn").hide();
    }
  });
}

function showRadio(typeid, typename, strcsrc) {
  getShowRadio(typeid, typename, strcsrc);
}

window.radioNowPlaying = function (str) {
  if (str != '') {
    var id = getValue(str, 'radioid');
    var status = getValue(str, 'playstatus');
    var num = parseInt(status, 10);
    initRadioStatus(num, id);
  } else {
    initRadioStatus(3);
  }
}

// 暂停播放电台
function stopRadio(evt, id) {
  var call = 'ChgRadioPlayStatus?radioid=' + id + '&playstatus=2';
  callClientNoReturn(call);
  evt.stopPropagation();
  return false;
}

// 继续播放电台
function continueRadio(evt, id) {
  var call = 'ChgRadioPlayStatus?radioid=' + id + '&playstatus=1';
  callClientNoReturn(call);
  evt.stopPropagation();
  return false;
}

function InitSongFav(infoStr) {
  var playingSongInfo = callClient('GetRadioPlayingSongInfo');
  var b_like = parseInt(getValue(playingSongInfo, 'blike'));
  var id = infoStr;
  if (id == '' || id == null) {
    var call = "GetRadioNowPlaying";
    var str = callClient(call);
    id = getValue(str, 'radioid');
  }

  var DesObj = $(".radio_" + id).find(".br_pic");
  if (b_like) {
    DesObj.find(".playing_oper").find(".radio_like").addClass("radio_liked");
    DesObj.find(".playing_oper").find(".radio_like").attr("title", "已喜欢")
  } else {
    DesObj.find(".playing_oper").find(".radio_like").removeClass("radio_liked");
    DesObj.find(".playing_oper").find(".radio_like").attr("title", "喜欢")
  }
}

var radioTimer = null;

function initRadioStatus(num, id) {
  var pageName = getPageName();
  var pageNameObj = {
    'play_radio': true // 电台播放页-只有电台播放页面点击封面暂停及播放
  };
  // 电台正在播放  -1  暂停播放-2  无电台播放 -3
  $(".playingInfoPosBox .now").hide();
  $(".playingInfoPosBox .info").hide();

  if (num != 3 && num != 0) {
    InitSongFav(id);
  }
  if (num == 1 || num == 4) {
    $(".playingInfoPosBox .now").css("display", "inline-block");
    $(".playingInfoPosBox .info").css("display", "inline-block");
    clearTimeout(radioTimer);
    var stopicon = '';
    var comobj = $(".br_pic");
    var obj = $(".radio_" + id).find(".br_pic");
    comobj.attr("c-status", "0");
    comobj.removeClass("current_pic");
    comobj.find(".radio_play").remove();
    comobj.find(".radio_start").remove();
    comobj.find(".radio_stop").remove();
    comobj.find(".radio_pause").remove();
    comobj.find(".i_play").hide();
    comobj.attr("c-status", "0");
    comobj.removeAttr('onclick');
    comobj.unbind("click").bind("click", function () {
      playingRadioPos = $(".clicked").index();
      saveDataToCache('playingRadioPos', playingRadioPos);
      eval($(this).attr("_onclick"));
    });
    obj.addClass("current_pic");
    obj.find(".radio_start").remove();
    obj.find(".radio_play").remove();
    obj.find(".radio_stop").remove();
    obj.attr("c-status", "1");
    if (obj.hasClass("on")) {
      stopicon = `<i title="暂停播放" onclick="stopRadio(arguments[0], ${id})" class="radio_pause"></i>`;
      obj.parent().find('.playing_oper').show();
    } else {
      stopicon = '<img class="radio_play" src="img/radio_play.gif">';
      obj.parent().find('.playing_oper').hide();
    }
    obj.append(stopicon);
    obj.removeAttr('onclick');
    obj.unbind('click').bind('click', function () {
      if (pageNameObj[pageName]) {
        stopRadio(arguments[0], id);
      } else {
        OnJumpRadioPlayingPage(id);
      }
      return false;
    });
  } else if (num == 2) {
    $(".playingInfoPosBox .now").css("display", "inline-block");
    $(".playingInfoPosBox .info").css("display", "inline-block");
    clearTimeout(radioTimer);
    var playicon = '';
    var comobj = $(".br_pic");
    var obj = $(".radio_" + id).find(".br_pic");
    comobj.removeClass("current_pic");
    comobj.find(".radio_play").remove();
    comobj.find(".radio_start").remove();
    comobj.find(".radio_stop").remove();
    comobj.find(".radio_pause").remove();
    comobj.find(".i_play").hide();
    comobj.attr("c-status", "0");
    comobj.removeAttr('onclick');
    comobj.unbind("click").bind("click", function () {
      eval($(this).attr("_onclick"));
      return false;
    });
    obj.attr("c-status", "2");
    obj.addClass("current_pic");
    obj.find(".radio_play").remove();
    obj.find(".radio_stop").remove();
    obj.find(".radio_pause").remove();
    if (obj.hasClass("on")) {
      playicon = `<i title="继续播放" onclick="continueRadio(arguments[0], ${id})" class="radio_start"></i>`;
      obj.parent().find('.playing_oper').show();
    } else {
      playicon = '<i class="radio_stop"></i>';
      obj.parent().find('.playing_oper').hide();
    }
    // obj.parent().find('.playing_oper').show();
    obj.append(playicon);
    obj.removeAttr('onclick');
    obj.unbind('click').bind('click', function() {
      if (pageNameObj[pageName]) {
        continueRadio(arguments[0], id);
      } else {
        OnJumpRadioPlayingPage(id);
      }
      return false;
    });
  } else {
    clearTimeout(radioTimer);
    radioTimer = setTimeout(function () {
      if (num != 4) $("#artistRadioBox").hide();
      var comobj = $(".br_pic");
      comobj.attr("c-status", "0");
      comobj.removeClass("current_pic");
      comobj.find(".radio_play").remove();
      comobj.find(".radio_stop").remove();
      comobj.find(".radio_start").remove();
      comobj.find(".radio_pause").remove();
      comobj.find(".i_play").hide();
      comobj.removeAttr('onclick');
      comobj.unbind("click").bind("click", function () {
        eval($(this).attr("_onclick"));
        return false;
      });
      comobj.parent().find('.playing_oper').hide();
    }, 100);
  }
}

//点击跳转到电台播放页的入口
function OnJumpRadioPlayingPage(id) {
  var strCall = 'OnJumpRadioPlayingPage?fid=' + id + '&bjump=1';
  callClientNoReturn(strCall);
  return false;
}

// 电台相关结束-------------------

// ugc相关开始-------------
$(".lookugc_artist").live("click", function () {
  var url = "http://www.kuwo.cn/pc/ugc/allUpUserList?type=1&id=" + $(this).attr("data-id");
  jumpToOtherUser(url);
  return false;
});
$(".lookugc_album").live("click", function () {
  var url = "http://www.kuwo.cn/pc/ugc/allUpUserList?type=2&id=" + $(this).attr("data-id");
  jumpToOtherUser(url);
  return false;
});
$('.j_ugcIcon').live('click', function (ev) {
  var oEvent = ev || event;
  var _this = $(this);
  var musicId = _this.parents("li").attr("c-rid").replace("MUSIC_", "");
  var reportName = _this.parents("li").find(".w_name").html();
  $.ajax({
    url: "http://ugc.kuwo.cn/ugc/info/brief?type=1&id=" + musicId,
    type: "get",
    dataType: "json",
    success: function (jsondata) {
      var data = jsondata.data;
      var str = createUserTips(data, jsondata.total, "artist", musicId);
      if (!$(".ugc_artist").html()) {
        $("body").append('<div id="ugcTipsBox"></div>');
      }
      $("#ugcTipsBox").html(str).show();
      $(".ugc_tipsBox").attr("data-reportId", musicId).attr("data-reportName", reportName).attr("data-type", "1");
      $(".ugc_artist").css({'top': oEvent.pageY - 140}).show();
      $('.sourceTips').hide();
      if (_this.hasClass("rcm_ugcIcon")) {
        $(".ugc_artist").css("right", 84);
      }
      $(".ugc_album").hide();
    }
  });
  return false;
});
$(".report").live("click", function () {
  var rid = $('.ugc_tipsBox').attr("data-reportId").replace("MUSIC_", "");
  var name = $('.ugc_tipsBox').attr("data-reportName");
  var type = $('.ugc_tipsBox').attr("data-type");
  callClientNoReturn('CoolBeanPackage?NavUrl=http://www.kuwo.cn/pc/ugc/report?name=' + name + "&rid=" + rid + "&type=" + type);
  return false;
});
$("body").live("click", function () {
  $('.ugc_tipsBox').hide();
});
$(".kw_ugcInfoIconAlbum").live("click", function () {
  var _this = $(this);
  var reportName = _this.parents(".name").find("b").html();
  $.ajax({
    url: "http://ugc.kuwo.cn/ugc/info/brief?type=2&id=" + albumId,
    type: "get",
    dataType: "json",
    success: function (jsondata) {
      var data = jsondata.data;
      var str = createUserTips(data, jsondata.total, "album");
      _this.html(str);
      $(".ugc_tipsBox").attr("data-reportId", albumId).attr("data-reportName", reportName).attr("data-type", "2");
      $(".ugc_album").show();
      $(".ugc_artist").hide();
    }
  });
  return false;
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

function createUserTips(data, num, from, musicid) {
  var classN = "";
  var id = 0;
  if (from == "album") {
    classN = "ugc_album";
    id = albumId;
  } else {
    classN = "ugc_artist";
    id = musicid;
  }
  ;
  var time = data.upload_time;
  time = time.substring(0, time.indexOf(" "));
  var url = "uid=" + getUserID("uid") + "&vuid=" + data.upload_uid;
  var str = '<div class="ugc_tipsBox ' + classN + '"><div class="ugc_content"><div class="info_line1"><p class="ugc_content_desc">来源用户：<a class="userName" href="javascript:;" onclick="jumpToOtherUser(\'' + url + '\')">' +
    data.nickname +
    '</a></p><a href="javascript:;" class="report fr">举报</a></div><div class="info_line2"><p class="ugc_content_desc">IP：' +
    formatIp(data.upload_ip) +
    '</p><p class="fr">时间：' +
    time +
    '</p></div><div class="info_line3"><p class="ugc_content_desc">其他上传用户：' +
    num +
    '人</p><a href="javascript:;" data-id="' + id + '" class="look' + classN + ' fr">点击查看</a></div></div><span class="ugc_info_triangle_down"></span></div>';
  return str;
}

function formatIp(ip) {
  var arr = ip.split(".");
  arr[1] = arr[1].replace(/\d/g, "*");
  arr[2] = arr[2].replace(/\d/g, "*");
  return arr.join(".");
}

// ugc相关结束-------------
// 获取播放标记方法
window.StopPlayMark = function () {
  return;
}
