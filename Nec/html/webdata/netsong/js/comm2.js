var PAGENAME = '';
// 网页调用客户端通用接口
function callClient(call) {
  try {
    return window.external.callkwmusic(call);
  } catch (e) {
    return '';
  }
}

function callClientNoReturn(call) {
  try {
    return window.external.callkwmusic(call, 0);
  } catch (e) {
    return '';
  }
}

function callClientAsyn(call, fn) {
  window.external.callkwmusic(call, fn);
}

// 全局变量开始---------------------------

// iplay 直接播放 歌曲个数
var iplaynum = 100;
var search_url = 'https://search.kuwo.cn/';
var album_url = 'http://album.kuwo.cn/';
// 获取客户端 section块处 DNS2CONF key为webproxyip 对应的配置信息
var hostConfig = callClient('GetConfig?section=DNS2CONF&key=webproxyip');
if (hostConfig == '') {
  hostConfig = '60.28.198.7';
}
// 默认图片
var default_img = 'img/default.png';
var mv_default_img = 'img/default_mv.png';
var jxj_default_img = 'img/def295.jpg';
var radio_default_img = 'img/default.png';
var artist_default_img = 'img/default.png';
var album_default_img = 'img/default.png';
// 版本号相关
var version = '';
// 全局变量结束------------------------------

// 日志开始-------------------------
// 在客户端打印web日志
function webLog(s) {
  callClientNoReturn('Log?msg=' + encodeURIComponent(s));
}

function testLog(file, module, level, msg) {
  callClientNoReturn('Log?file=' + file + '&module=' + module + '&level=' + level + '&msg=' + msg);
}

// 电台日志
function radioLog(val) {
  realTimeLog('CLICKEVENT', val);
}

// 从搜索来的新统计日志（歌单、专辑、歌手）
function sendFromSearchLog(logObj, result) {
  var fstime = getDataByConfig('searchLog', 'searchTime');
  var devid = getUserID('devid');
  var key = logObj.searchKey;
  if (!key) return;
  var enKey = encodeURIComponent(key);
  var snum = devid + enKey + parseInt(fstime / 36000);
  var searchNo = devid + enKey + fstime;
  var time = new Date().getTime();
  var logStr = 'SNUM:' + snum + '|STYPE:TYPE_SOPERATION|OPERATIONTYPE:' + logObj.operationType + '|POS:' + logObj.pos + '|INNERPOS:-1|HASLYRIC:0|REF:' + encodeURIComponent(logObj.ref) + '|SOURCEID:' + logObj.rid + '|HITNUM:' + logObj.hitNum + '|KEY:' + enKey + '|TIME:' + time + '|SEARCHNO:' + searchNo;
  if (result) {
    return logStr.replace('|OPERATIONTYPE:MORE', '');
  } else {
    realTimeLog('SEARCHSONG', logStr);
  }
}

// 必须发送 请求失败 请求用时
function realTimeLog(type, msg) {
  callClientNoReturn('LogRealTime?type=' + type + '&msg=' + encodeURIComponent(msg));
}

// 核心日志 每一个方法执行时间
function realTimeCoreLog(type, msg) {
  callClientNoReturn('LogRealTime?type=' + type + '&msg=' + encodeURIComponent(msg));
}

// 错误日志 请求返回数据格式错误
function realTimeErrorLog(type, msg) {
  callClientNoReturn('LogRealTime?type=' + type + '&msg=' + encodeURIComponent(msg));
}

// WebClientError日志
function sendWebClientError(type, subtype, msg) {
  callClientNoReturn('LogClientError?errno=' + type + '&suberrno=' + subtype + '&msg=' + msg);
}

// 网页通知客户端显示曲库、搜索、内容、首页时间的接口
function realShowTimeLog(url, isok, time, errorcode, cache) {
  var call = '';
  var type = '';
  var subtype = '';
  var errorcodestring = '';
  // ServiceLevel?Type=quku/search/content/main&subtype=xxxxx& ok=1/0&time=xxxx&errorcode=xxxxx
  // if(url.indexOf("topmusic")>-1){
  if (url.indexOf('index/info') > -1) {
    type = 'main';
    subtype = '';
  } else if (url.indexOf('qukudata') > -1) {
    type = 'quku';
    subtype = '';
  } else if (url.indexOf('nplserver') > -1) {
    type = 'content';
    subtype = '&subtype=playlist';
  } else if (url.indexOf('stype') > -1) {
    type = 'content';
    if (url.indexOf('artist2music') > -1) {
      subtype = '&subtype=artistmusic';
    } else if (url.indexOf('artistinfo') > -1) {
      subtype = '&subtype=artistinfo';
    } else if (url.indexOf('albumlist') > -1) {
      subtype = '&subtype=artistalbum';
    } else if (url.indexOf('mvlist') > -1) {
      subtype = '&subtype=artistmv';
    } else if (url.indexOf('similarartist') > -1) {
      subtype = '&subtype=artistsimilar';
    } else if (url.indexOf('albuminfo') > -1) {
      subtype = '&subtype=albuminfo';
    } else if (url.indexOf('artistlist') > -1) {
      type = 'quku';
      subtype = '&subtype=artistlist';
    }
  } else if (url.indexOf('newsearch') > -1 || url.indexOf('-searchDomainChange') > -1) {
    type = 'search';
    if (url.indexOf('lrccontent') > -1 || url.indexOf('-lrc') > -1) {
      subtype = '&subtype=searchlrc';
    } else if (url.indexOf('hasmkv') > -1 || url.indexOf('-mv') > -1) {
      subtype = '&subtype=searchmv';
    } else if ((url.indexOf('ft=music') > -1 && url.indexOf('alflac=1') > -1) && url.indexOf('lrccontent') < 0 || url.indexOf('-all') > -1) {
      subtype = '&subtype=searchmusic';
      var errorcodestring0 = isok == 1 ? '' : '&errorcode=' + errorcode;
      var call0 = 'ServiceLevel?Type=' + type + '&ok=' + isok + '&subtype=search_time&time=' + time + errorcodestring + '&info=' + encodeURIComponent(url);
      callClientNoReturn(call0);
    } else if (url.indexOf('ft=album') > -1 || url.indexOf('-album') > -1) {
      subtype = '&subtype=searchalbum';
    } else if (url.indexOf('ft=artist') > -1 || url.indexOf('-artist') > -1) {
      subtype = '&subtype=searchartist';
    }
    // search日志
    if (isok == 1) {
      realTimeLog('search', 'url_time:' + time + ';search;' + url);
    } else if (isok == 0) {
      realTimeLog('search', 'url_error:' + errorcode + ';search;' + url);
    }
  } else if (url.indexOf('fpagedata') > -1) {
    type = 'fpage';
    subtype = '';
  } else {
    type = 'other';
    subtype = '';
  }
  errorcodestring = isok == 1 ? '' : '&errorcode=' + errorcode;
  call = 'ServiceLevel?Type=' + type + '&ok=' + isok + subtype + '&time=' + time + errorcodestring + '&info=' + encodeURIComponent(url);
  callClientNoReturn(call);
  if (isok == 1) {
    realTimeLog('WEBLOG', 'url:' + url + ';cache:' + cache);
  }
}

// 日志结束---------------

// 关于客户端的信息开始--------------
// 获取客户端版本号
function getVersion() {
  if (version == '') {
    version = callClient('GetVer');
  }
  return version;
}

// 获取用户状态的某个类型id
function getUserID(s) {
  var clientString = callClient('UserState?src=user');
  if (s == 'all') {
    var uid = getValue(clientString, 'uid');
    var kid = getValue(clientString, 'devid');
    if (uid == '') {
      uid = 0;
    }
    if (kid == '') {
      kid = 0;
    }
    return { 'uid': uid, 'kid': kid };
  } else {
    var clientid = getValue(clientString, s);
    if (clientid == '') {
      clientid = 0;
    }
    return clientid;
  }
}

function UserIsLogin() {
  var str = 'UserIsLogin';
  var ret = callClient(str);
  var blogin = getValue(ret, 'blogin');
  return blogin;
}

// 客户端信息结束-------------

// 对象的处理方法开始--------------
// Node 对象
function Node(source, sourceid, name, id, extend, other, from, artistid, albumid, mvpayinfo, mvquality) {
  var node = {};
  node.source = source;
  node.sourceid = sourceid;
  node.name = '' + name.replace(/\\'/g, "'").replace(/'/g, "\\'");
  node.id = '' + id;
  node.mvpayinfo = mvpayinfo || '';
  /*
  * 焦点图拼接参数增加 mvquality
  * @author 邢祥超 [20230807]
  * */
  node.mvquality = mvquality || 0;
  if (typeof (extend) !== 'undefined') {
    node.extend = extend;
  }
  if (typeof (other) !== 'undefined') {
    node.other = other;
  }
  if (typeof (from) !== 'undefined') {
    node.from = from;// 专区、新歌单分类标签来源 from by deng
  }
  /*
  * 焦点图拼接参数增加 artistid、albumid
  * @author 邢祥超 [20190831]
  * */
  if (typeof (artistid) !== 'undefined') {
    node.artistid = artistid;
  }
  if (typeof (albumid) !== 'undefined') {
    node.albumid = albumid;
  }
  return node;
}

// 对象转换成json串
function getNodeJsonString(obj) {
  var nodestring = '{';
  for (var key in obj) {
    nodestring += "'" + key + "':" + "'" + (obj[key]) + "',";
  }
  nodestring = nodestring.substr(0, nodestring.length - 1);
  nodestring += '}';
  return nodestring;
}

// json对象转字符串
function obj2Str(obj) {
  switch (typeof (obj)) {
    case 'object':
      var ret = [];
      if (obj instanceof Array) {
        for (var i = 0, len = obj.length; i < len; i++) {
          ret.push(obj2Str(obj[i]));
        }
        return '[' + ret.join(',') + ']';
      } else if (obj instanceof RegExp) {
        return obj.toString();
      } else {
        for (var a in obj) {
          ret.push('"' + a + '"' + ':' + obj2Str(obj[a]));
        }
        return '{' + ret.join(',') + '}';
      }
    case 'function':
      return 'function() {}';
    case 'number':
      return obj.toString();
    case 'string':
      return '"' + obj.replace(/(\\|\")/g, '\\$1').replace(/\n|\r|\t/g, function(a) {
        return (a == '\n') ? '\\n' : (a == '\r') ? '\\r' : (a == '\t') ? '\\t' : '';
      }) + '"';
    case 'boolean':
      return obj.toString();
    default:
      return obj.toString();
  }
}

// 对象的处理方法结束--------------

// 字符串处理方法开始-------------
// 公用最重要方法 解析模板、拼接多行数据和单行数据
function loadTemplate(id) {
  var element = document.querySelector(id);
  if (!element) {
    return {};
  }
  var templateHtml = element.innerHTML;
  if (!templateHtml) {
    return {};
  }
  var regex = /\{\$\w+\}/g;
  var htmlArg = templateHtml.split(regex);
  var paramArg = templateHtml.match(regex);

  for (var paramIndex in paramArg) {
    var param = paramArg[paramIndex];
    paramArg[paramIndex] = param.substring(2, param.length - 1);
    htmlArg.splice(paramIndex * 2 + 1, 0, '');
  }
  var templateData = {};
  templateData['id'] = id;
  templateData['template'] = htmlArg;
  templateData['params'] = paramArg;
  return templateData;
}

function drawTemplate(json, templateArg, paramArg) {
  var entityArg = templateArg.concat();
  for (var index in paramArg) {
    var finalParam = paramArg[index];
    entityArg[index * 2 + 1] = json[finalParam];
  }
  return entityArg.join('');
}

function drawListTemplate(listJson, templateData, dataformat) {
  var templateArg = templateData['template'] || [];
  var paramArg = templateData['params'];
  var htmlArg = [];
  var dataformatFunction = eval(dataformat);
  if (dataformatFunction && typeof (dataformatFunction) === 'function') {
    for (var row in listJson) {
      var rowJson = dataformatFunction(listJson[row]);
      htmlArg[row] = drawTemplate(rowJson, templateArg, paramArg);
    }
  } else {
    for (var row in listJson) {
      htmlArg[row] = drawTemplate(listJson[row], templateArg, paramArg);
    }
  }
  return htmlArg.join('');
}

// 获取extend 里面某个字符串对应的值 类似key=value: |MUSIC=1|ABC=2|PIC=img|
function getStringKey(str, key) {
  var valuestr = '';
  if (('' + str).indexOf(key) > -1) {
    valuestr = str.substring(str.indexOf(key + '='));
    if (valuestr.indexOf('|') > -1) {
      valuestr = valuestr.substring(valuestr.indexOf('=') + 1, valuestr.indexOf('|'));
    } else {
      valuestr = valuestr.substring(valuestr.indexOf('=') + 1);
    }
  }
  return valuestr;
}

// 获取某个字符串中 key对应的value getValue("xxx?a=b","a")=b
function getValue(url, key) {
  url = url.toString();
  if (url.indexOf('#') >= 0) {
    url = url.substring(0, url.length - 1);
  }
  var value = '';
  var begin = url.indexOf(key + '=');
  if (begin >= 0) {
    var tmp = url.substring(begin + key.length + 1);
    var eqIdx = tmp.indexOf('=');
    var end = 0;
    if (eqIdx >= 0) {
      tmp = tmp.substring(0, eqIdx);
      end = tmp.lastIndexOf('&');
    } else {
      end = tmp.length;
    }
    if (end >= 0) {
      try {
        value = decodeURIComponent(tmp.substring(0, end));
      } catch (e) {
        value = tmp.substring(0, end);
      }
    } else {
      try {
        value = decodeURIComponent(tmp);
      } catch (e) {
        value = tmp;
      }
    }
  }
  return value;
}

function rnd(n, m) {
  return parseInt(n + Math.random() * (m - n));
}

// 取一个字符串的hash
function getHashCode(str) {
  var hash = 0;
  var len = str.length;
  if (len == 0) return hash;
  for (i = 0; i < len; i++) {
    var ch = '';
    ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  if (hash < 0) {
    hash = -hash;
  }
  return hash;
}

// 在网页中显示字符串中的特殊字符
function returnSpecialChar(s) {
  s = '' + s;
  return s.replace(/\&amp;/g, '&').replace(/\&nbsp;/g, ' ').replace(/\&apos;/g, "'").replace(/\&quot;/g, '"').replace(/\%26apos\%3B/g, "'").replace(/\%26quot\%3B/g, '"').replace(/\%26amp\%3B/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// 把显示的name特殊字符替换成html编码
function checkSpecialChar(s, usetype) {
  if (!s) return '';
  s = '' + s;
  if (usetype == 'titlename') {
    return s.replace(/\&apos;/g, "'").replace(/\\'/g, "\'").replace(/\"/g, '&quot;').replace(/\&amp;apos;/g, "'");
  } else if (usetype == 'name') {
    return s.replace(/\"/g, '&quot;').replace(/\'/g, "\\\'").replace(/\&apos;/g, "\\\'").replace(/\&#039;/g, "\\\'");
  } else if (usetype == 'disname') {
    return s.replace(/\&quot;/g, '"').replace(/\&apos;/g, "\'").replace(/\\'/g, "\'").replace(/\&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\%26apos\%3B/g, "'").replace(/\%26quot\%3B/g, '"').replace(/\%26amp\%3B/g, '&');
  }
  return s.replace(/\&/g, '&amp;').replace(/\"/g, '&quot;').replace(/\'/g, "\\\'").replace(/\&amp;apos;/g, '&#039;');
}

// ie6 列表字符串截取
function ie6SubStr(str, num1, num2) {
  var isIE6 = false;
  if (isIE6) {
    if (testStrScale(str)) {
      if (!(str.length < num1)) {
        str = str.substring(0, num1) + '...';
      }

      return str;
    } else {
      if (!(str.length < num2)) {
        str = str.substring(0, num2) + '...';
      }
      return str;
    }
  } else {
    return str;
  }
}

function testStrScale(str) {
  var eLen = 0;
  var oLen = 0;
  for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      oLen++;
    } else {
      eLen++;
    }
  }
  if ((eLen / (eLen + oLen)) > 0.5) {
    return true;
  } else {
    return false;
  }
}

// 歌名长度截取
function getShortName(name, namemax) {
  if (!namemax || namemax == undefined) {
    namemax = 10;
  }
  if (name.length > namemax) {
    if (name.length > namemax) {
      name = name.substring(0, namemax) + '...';
    } else {
      name = name;
    }
  }
  return name;
}

// 检查中文
function checkChinese(str) {
  if (escape(str).indexOf('%u') < 0) {
    return false;
  } else {
    return true;
  }
}

// 获取url中的信息
function getUrlMsg(url) {
  var tmp = url.split('?')[1];
  try {
    tmp = decodeURIComponent(tmp);
  } catch (e) {
    return tmp;
  }
  return tmp;
}

function url2data(str, key, ispic) {
  var arr = str.split('&');
  for (var i = 0; i < arr.length; i++) {
    var arr2 = arr[i].split('=');
    if (arr2[0] == key) {
      var tmp = parseInt(arr2[1]);
      if (isNaN(tmp) || ispic) {
        return arr2[1];
      } else {
        return tmp;
      }
    }
  }
}

// 拼 commonclick 参数串
function commonClickString(obj, isf) {
  var clickarray = [];
  var index = 0;
  clickarray[index++] = 'commonClick(';
  clickarray[index++] = getNodeJsonString(obj);
  clickarray[index++] = ')';
  var clickstring = clickarray.join('');
  return clickstring;
}

// 拼param串
function getParam(nodeobj) {
  var param = '{';
  var paramArr = [];
  for (i in nodeobj) {
    paramArr.push('"' + i + '":"' + encodeURIComponent(nodeobj[i]) + '"');
  }
  param += paramArr.join(',');
  param += '}';
  return param;
}

// 客户端存储jump字符串
function jumpString(nodeobj, selectChannel, flag, src, toweb) {
  var channelInfo = getChannelInfo('', selectChannel);
  var param = getParam(nodeobj);
  webLog('jumpString:' + decodeURIComponent(param));
  // var call = "PageJump?param="+encodeURIComponent(param) + ";" + encodeURIComponent('jump:'+channelInfo);

  if (toweb) {
    var call = 'PageJump?param=' + encodeURIComponent(param) + ';' + encodeURIComponent(channelInfo) + ';' + encodeURIComponent('url:' + src) + '&calljump=' + flag;
  } else {
    var call = 'PageJump?param=' + encodeURIComponent(param) + ';' + encodeURIComponent(channelInfo) + ';' + encodeURIComponent('url:${netsong}' + src) + '&calljump=' + flag;
  }

  callClientNoReturn(call);
}

// 数字转为双位数且变成字符串
function toDou(n) {
  return n < 10 ? '0' + n : '' + n;
}

function disnameSplict(name) {
  if (name.indexOf('|') > -1) {
    name = name.replace('|', ' ').replace('/', ' ').replace('\\', ' ').replace('*', ' ').replace('?', ' ').replace(':', ' ').replace('<', ' ').replace('>', ' ').replace('"', ' ');
  }
  return name;
}

// 字符串处理方法结束-------------

// 图片数据处理方法开始-----------
// 获取 图片域名的随机数
function getImgNumber(pic) {
  var num = (getHashCode(pic + getUserID('devid')) % 10) + 1;
  if (num >= 5) {
    if (num >= 8) {
      num = 4;
    } else {
      num = 3;
    }
  } else {
    if (num >= 2) {
      num = 2;
    }
  }
  return num;
}

// 替换图片服务器域名  传入图片地址 如果有img1 2 3 4域名的随机返回一个
function changeImgDomain(url) {
  var newurl = url;
  // var num = getImgNumber(url);
  var num = rnd(1, 5);
  var imgDomain = '.sycdn.kuwo.cn';
  newurl = newurl.replace(':81', '');
  if (newurl.indexOf('star.kwcdn.kuwo.cn') > -1) {
    newurl = newurl.replace('star.kwcdn.kuwo.cn', 'img' + num + imgDomain);
  } else if (newurl.indexOf('img1.kwcdn.kuwo.cn') > -1) {
    newurl = newurl.replace('img1.kwcdn.kuwo.cn', 'img' + num + imgDomain);
  } else if (newurl.indexOf('img2.kwcdn.kuwo.cn') > -1) {
    newurl = newurl.replace('img2.kwcdn.kuwo.cn', 'img' + num + imgDomain);
  } else if (newurl.indexOf('img3.kwcdn.kuwo.cn') > -1) {
    newurl = newurl.replace('img3.kwcdn.kuwo.cn', 'img' + num + imgDomain);
  } else if (newurl.indexOf('img4.kwcdn.kuwo.cn') > -1) {
    newurl = newurl.replace('img4.kwcdn.kuwo.cn', 'img' + num + imgDomain);
  } else if (newurl.indexOf('star.kuwo.cn') > -1) {
    newurl = newurl.replace('star.kuwo.cn', 'img' + num + imgDomain);
  } else if (newurl.indexOf('img1.kuwo.cn') > -1 && newurl.indexOf('kwimg1.kuwo.cn') < 0) {
    newurl = newurl.replace('img1.kuwo.cn', 'img' + num + imgDomain);
  } else if (newurl.indexOf('kwimg1.kuwo.cn') > -1) {
    newurl = newurl.replace('kwimg1.kuwo.cn', 'img' + num + imgDomain);
  } else if (newurl.indexOf('kwimg2.kuwo.cn') > -1) {
    newurl = newurl.replace('kwimg2.kuwo.cn', 'img' + num + imgDomain);
  }
  if (newurl.indexOf('albumcover/180') > -1) {
    newurl = newurl.replace('albumcover/180', 'albumcover/100');
  } else if (newurl.indexOf('starheads/150') > -1) {
    newurl = newurl.replace('starheads/150', 'starheads/100');
  }
  newurl = newurl.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
  return newurl;
}

// 获取歌手图片真实地址
function getArtistPic(pic) {
  var picUrl = '';
  picUrl = pic;
  if (typeof (picUrl) === 'undefined' || picUrl == '') {
    picUrl = artist_default_img;
  } else if (picUrl.indexOf('http') > -1) {
    picUrl = changeImgDomain(picUrl);
    picUrl = picUrl.replace('starheads/55', 'starheads/120');
  } else {
    picUrl = getArtistPrefix(picUrl) + picUrl;
    picUrl = picUrl.replace('starheads/55', 'starheads/120');
  }
  return picUrl;
}

// 取歌手图片前缀
function getArtistPrefix(pic) {
  // var num = getImgNumber(pic);
  var num = rnd(1, 5);
  var prefix;
  prefix = 'http://img' + num + '.sycdn.kuwo.cn/star/starheads/';
  return prefix;
}

// 电台播放页获取歌手电台
function getPlayingArtistRadioPic(pic) {
  var picUrl = '';
  picUrl = pic;
  if (typeof (picUrl) === 'undefined' || picUrl == '') {
    picUrl = 'img/def300.png';
  } else if (picUrl.indexOf('http') > -1) {
    picUrl = changeImgDomain(picUrl);
    picUrl = picUrl.replace('starheads/90', 'starheads/300');
  } else {
    picUrl = getArtistPrefix(picUrl) + picUrl;
    picUrl = picUrl.replace('starheads/90', 'starheads/300');
  }
  return picUrl;
}

// 获取专辑图片真实地址
function getAlbumPic(pic) {
  var picUrl = '';
  picUrl = pic;
  if (typeof (picUrl) === 'undefined' || picUrl == '') {
    picUrl = album_default_img;
  } else if (picUrl.indexOf('http') > -1) {
    picUrl = changeImgDomain(picUrl);
    picUrl = picUrl.replace('albumcover/100', 'albumcover/120');
  } else {
    picUrl = getAlbumPrefix(picUrl) + picUrl;
    picUrl = picUrl.replace('albumcover/100', 'albumcover/120');
  }
  return picUrl;
}

// 取专辑图片前缀
function getAlbumPrefix(pic) {
  // var num = getImgNumber(pic);
  var num = rnd(1, 5);
  var prefix;
  prefix = 'http://img' + num + '.sycdn.kuwo.cn/star/albumcover/';
  return prefix;
}

// 取MV图片真实地址
function getMVPic(pic) {
  var picUrl = '';
  picUrl = pic;
  if (typeof (picUrl) === 'undefined' || picUrl == '') {
    picUrl = mv_default_img;
  } else if (picUrl.indexOf('http') > -1) {
    picUrl = changeImgDomain(picUrl);
  } else {
    picUrl = getMVPrefix(picUrl) + picUrl;
  }
  picUrl = picUrl.replace('/120/', '/160/');
  picUrl = picUrl.replace('/140/', '/160/');
  return picUrl;
}

// 取MV图片前缀
function getMVPrefix(pic) {
  // var num = getImgNumber(pic);
  var num = rnd(1, 5);
  var prefix;
  prefix = 'http://img' + num + '.sycdn.kuwo.cn/wmvpic/';
  return prefix;
}

// 图片数据处理方法结束-----------

// 和客户端的交互开始-------------
// 将请求数据存入缓存
function saveDataToCache(url, dataValue, time) {
  try {
    var cachetime;
    if (typeof (dataValue) !== 'undefined' && dataValue.toString() != '' && dataValue != null) {
      if (url == 'refreshnum') {
        cachetime = 1200;
      } else if (url == 'INDEXDATA') {
        cachetime = 604800;
      } else {
        if (url.indexOf('newsearch') < 0) {
          cachetime = 1200;
        } else {
          cachetime = 86400;
        }
      }
      if (typeof (time) !== 'undefined') {
        cachetime = time;
      }
      callClient('SetCache?key=' + encodeURIComponent(url) + '&time=' + cachetime + '\r\n' + dataValue);
    }
  } catch (e) {
    webLog('saveDataToCache:' + e.message);
  }
}

// 从缓存中取数据
function getDataByCache(key) {
  var cacheValue = callClient('GetCache?key=' + encodeURIComponent(key));
  var data = '';
  if (typeof (cacheValue) !== 'undefined' && cacheValue != '') {
    try {
      data = cacheValue;
    } catch (e) {
      webLog('getDataByCache:' + e.message + ':' + e.name);
    }
  }
  return data;
}

// 读取配置文件中配置项的方法
function getDataByConfig(Section, key) {
  var configValue = callClient('GetConfig?Section=' + encodeURIComponent(Section) + '&key=' + encodeURIComponent(key));
  var data = '';
  if (typeof (configValue) !== 'undefined' && configValue != '') {
    try {
      data = configValue;
    } catch (e) {
      webLog('getDataByConfig:' + e.message + ':' + e.name);
    }
  }
  return data;
}

// 设置配置项的方法
function setDataToConfig(Section, key, dataValue) {
  try {
    if (typeof (Section) === 'undefined' || Section == '' || Section == null) {
      Section = 'optionPre';
    }
    if (typeof (dataValue) !== 'undefined' && dataValue != '' && dataValue != null) {
      callClient('SetConfig?Section=' + encodeURIComponent(Section) + '&Key=' + encodeURIComponent(key) + '&Value=' + encodeURIComponent(dataValue));
    }
  } catch (e) {
    webLog('setDataToConfig:' + e.message);
  }
}

// 所有打开网页的地方 window.open 都改成此方法调用
function windowOpen(url) {
  if (url.indexOf('http://') < 0 && url.indexOf('https://') < 0) {
    url = 'http://' + url;
  }
  var backstr = callClient('OpenBrowser?browser=default&url=' + encodeURIComponent(url));
  if (backstr != 1) {
    window.open(url);
  }
}

// 打开一个网页 source 17类型专用
function openURL(nodeobj) {
  var url = nodeobj.sourceid;
  if (url.indexOf('http://') < 0 && url.indexOf('https://') < 0) {
    url = 'http://' + url;
  }
  if (url.indexOf('x.kuwo.cn') > -1) {
    var param = callClient('LiveShowParam');
    if (param != '') {
      if (url.indexOf('?') > -1) {
        url = url + param;
      } else {
        url = url + '?' + param.substr(1);
      }
    }
  } else {
    // 跳转web外链，带上uid,sid,活动可能会用到
    if (url.indexOf('?') > -1) {
      url = url + '&ver=' + getVersion() + '&uid=' + getUserID('uid') + '&sid=' + getUserID('sid');
    } else {
      url = url + '?ver=' + getVersion() + '&uid=' + getUserID('uid') + '&sid=' + getUserID('sid');
    }
  }
  // add by luger 添加秀场盒内弹窗弹出20150521
  if (url.indexOf('x.kuwo.cn') > -1 && nodeobj.extend.indexOf('XIUOPEN') >= 0) {
    callClientNoReturn('ShowOpenRoom?width=1400&height=830&url=' + encodeURIComponent(url));
    return;
  }

  var backstr = callClient('OpenBrowser?browser=default&url=' + encodeURIComponent(url));
  if (backstr != 1) {
    window.open(url);
  }
}

// 调用客户端启动app
function runApp(nodeobj) {
  var sourceid = nodeobj.sourceid;
  var params = sourceid.split(',');
  if (params.length == 6) {
    var paramstring = '';
    if (params[5] != '') {
      paramstring = '&param=' + encodeURIComponent(params[5]);
    }
    var call = 'AppRun?id=' + params[0] + '&name=' + encodeURIComponent(params[1]) + '&ver=' + params[2] + '&sig1=' + params[3] + '&sig2=' + params[4] + paramstring;
    callClientNoReturn(call);
  }
}

// 客户端登录成功后 回调网页方法
function OnLogin(param) {
  var userid = getUserID('uid');
  if (userid == 0) {
    return;
  } else {
    refreshChildPageInfo(1);
  }
}

// 客户端登录后退出 回调
function OnLogout() {
  refreshChildPageInfo(0);
}

// 客户端调用页面方法部分
// 点击操作 存储当前操作动作
function saveAction(nodeobj, selectChannel, leftNode, src, toweb) {
  save(nodeobj, selectChannel, leftNode, src, toweb);
}

// 点击操作 存储当前操作动作
function save(nodeobj, selectChannel, leftNode, src, toweb) {
  if (!nodeobj.back && nodeobj.back != 'noback' && !nodeobj.refresh) {
    nodeobj.qkback = true;
    if (!nodeobj.noback) {
      jumpString(nodeobj, selectChannel, leftNode, src, toweb);
    }
  }
}

function getChannelInfo(src, channel) {
  if (channel == 'index' || src.indexOf('init') > -1) {
    // return("{'source':'0','qkback':'true'};name:推荐;")
    return ('ch:2;name:songlib;');
  } else if (channel == 'radio' || src.indexOf('radio') > -1) {
    // return("{'source':'-2','sourceid':'8','name':'1','id':'-2'};name:电台;");
    return ('ch:10000;name:radio;');
  } else if (channel == 'mv' || src.indexOf('mv') > -1) {
    // return("{'source':'-2','sourceid':'3','name':'2','id':'-2'};name:MV;");
    return ('ch:10001;name:MV;');
  } else if (channel == 'classify' || src.indexOf('classify') > -1 || src.indexOf('djzone') > -1) {
    // return("{'source':'-2','sourceid':'5','name':'4','id':'-2'};name:分类;");
    return ('ch:10002;name:songlib;');
  } else if (channel == 'artist' || src.indexOf('artist') > -1) {
    // return("{'source':'-2','sourceid':'4','name':'3','id':'-2'};name:歌手;");
    return ('ch:10002;name:songlib;');
  } else if (channel == 'bang' || src.indexOf('bang') > -1) {
    // return("{'source':'-2','sourceid':'2','name':'0','id':'-2'};name:排行;");
    return ('ch:10002;name:songlib;');
  } else if (channel == 'jxj' || src.indexOf('jxj') > -1) {
    return ("{'source':'-2','sourceid':'86237','name':'15','id':'-2'};name:精选集;");
  } else if (channel == 'xiu' || src.indexOf('x.kuwo.cn') > -1) {
    return ('ch:8;name:直播;');
  } else if (channel == 'hifi_music' || src.indexOf('hifi_music') > -1) {
    return ('ch:10007;name=hifi_music;');
  } else if (channel == 'search' || src.indexOf('search') > -1) {
    return ('ch:4;name:search;');
  } else if (channel == 'hifidown' || src.indexOf('cdpack') > -1) {
    return ('ch:13;name:hifi_music;');// hifidown和hificollect都要跳转到同一个hifi音乐的node，后面的是要定位到的结点的名称
  } else if (channel == 'hificollect' || src.indexOf('mycdpack') > -1) {
    return ('ch:14;name:hifi_music;');
  } else if (channel == 'hificollectdetail' || src.indexOf('cdpackmusic') > -1) {
    return ('ch:21;name:hifi_music;');// 此处的hifi_music是让结点能定位到HIFI发烧音乐结点
  } else if (channel == 'hifidownloaddetail' || src.indexOf('content_cdpack') > -1) {
    return ('ch:22;name:hifi_music;');
  } else if (channel == 'hifidownloadtagdetail' || src.indexOf('cdpack') > -1) {
    return ('ch:23;name:hifi_music;');
  } else if (channel == 'my' || src.indexOf('kudou') > -1) {
    return ('ch:3;name:my;');
  }
}

function showChannel(channel, src) {
  if (channel == 'index') {
    callClientNoReturn("showChannel?jump:{'source':'0','qkback':'true'};name:推荐;");
  } else if (channel == 'radio' || src.indexOf('radio') > 0) {
    callClientNoReturn("showChannel?jump:{'source':'-2','sourceid':'8','name':'1','id':'-2'};name:电台;");
  } else if (channel == 'mv' || src.indexOf('mv') > 0) {
    callClientNoReturn("showChannel?jump:{'source':'-2','sourceid':'3','name':'2','id':'-2'};name:MV;");
  } else if (channel == 'classify' || src.indexOf('classify') > 0) {
    callClientNoReturn("showChannel?jump:{'source':'-2','sourceid':'5','name':'4','id':'-2'};name:分类;");
  } else if (channel == 'artist' || src.indexOf('artist') > 0) {
    callClientNoReturn("showChannel?jump:{'source':'-2','sourceid':'4','name':'3','id':'-2'};name:歌手;");
  } else if (channel == 'bang' || src.indexOf('bang') > 0) {
    callClientNoReturn("showChannel?jump:{'source':'-2','sourceid':'2','name':'0','id':'-2'};name:排行;");
  } else if (channel == 'jxj' || src.indexOf('jxj') > 0) {
    callClientNoReturn("showChannel?jump:{'source':'-2','sourceid':'86237','name':'15','id':'-2'};name:精选集;");
  } else if (channel == 'xiu' || src.indexOf('x.kuwo.cn') > 0) {
    callClientNoReturn('showChannel?jump:;ch:8;name:直播;');
  }
}

// 点击关键词让客户端进行搜索
function web2pcSearch(keyword) {
  callClientNoReturn('SearchSong?keyword=' + keyword);
}

// 和客户端的交互结束-------------

// 关于pageready的部分
// 加载开始-------------------
// 底部中间loading 开始
function centerLoadingStart() {
  $('body').append("<div class='w_loading'><img src='img/loading.gif' alt='' /></div>");
}

// 底部中间loading 该结束
function centerLoadingEnd() {
  $('.w_loading').remove();
}

// 网页请求错误刷新(暂时无用了)
function errorRefresh() {
  $('#l_loadfail').remove();
  callClientNoReturn('NavRefresh');
}

// 客户端的刷新按钮回调曲库方法
function OnRefresh(param) {
  window.location.reload();
  param = decodeURIComponent(param.split(';')[0]);
  webLog('OnRefresh:' + param);
  if (param == '') {
    var node = {};
    node.source = 0;
    return;
  }
}

// iframe 刷新----------此处后期删除 全部直接调用loadImages
var iframeObj = {};
iframeObj.refresh = loadImages;

function loadImages() {
  var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
  var clientH = document.documentElement.clientHeight;
  var scrollB = scrollT + clientH;
  var imgs = $('.lazy');
  imgs.each(function(i) {
    if ($(this)[0].offsetTop < scrollB) {
      if ($(this)[0].getAttribute('data-original') !== '{$pic}') {
        $(this)[0].setAttribute('src', $(this)[0].getAttribute('data-original'));
        $(this).removeClass('lazy');
      }
    }
  });
}

function loadImagesNew() {
  $('.lazy').each(function() {
    var _this = $(this);
    var src = _this.attr('data-original');
    if (_this.offset().top < $(window).height() + $(window).scrollTop() || window.parent.ban) {
      if (src !== '{$pic}') {
        _this.attr('src', src);
        $(this).removeClass('lazy');
      }
    }
  });
}

// 图片加载失败
function imgOnError(obj, type) {
  var src = '';
  if (type == 800) {
    src = 'img/def800.jpg';
  } else if (type == 300) {
    src = 'img/def_300_217.png';
  } else if (type == 140) {
    src = 'img/default_mv.png';
  } else if (type == '150cd') {
    src = 'img/cdpack/second/default.png';
    if ($(obj).parents('li').attr('down_status') || $(obj).attr('class') == 'cdHeadPic1 cdHeadPic') {
      src = 'img/cdpack/cdDetailPic.png';
    }
  } else {
    src = 'img/default.png';
  }
  obj.src = src;
  obj.onerror = null;
}

// 加载失败时显示error页面
function loadErrorPage() {
  callClientNoReturn('loadingEnd');
  var isOnline = window.navigator.onLine;
  var IsNetWorkAlive = callClient('IsNetWorkAlive') === '0';
  var noDataText = '数据异常，请稍后再试';
  var className = 'no-data-img';
  if (IsNetWorkAlive && !isOnline) {
    noDataText = '当前无网络链接 请检查网络设置';
    className = 'no-network-img';
  } else {
    noDataText = '数据异常，请稍后再试';
    className = 'no-data-img';
  }
  $('body').html('<section class="no-net">' +
    '<div class="no-data-box ' + className + '"></div>' +
    '<p class="no-data-text">' + noDataText + '</p>' +
    '<p class="no-data-btn">' +
    '<a href="javascript:;" style="background:' + skinConfig.skinColor + '" onclick="window.location.reload();return false;">刷新页面</a>' +
    '</p></section>');
}

// 元素的公用处理方法
// 返回顶部按钮
function returnTop() {
  $('body').animate({ scrollTop: 0 }, 500);
}

$(window).scroll(function() {
  if ($('body').scrollTop() >= 50) {
    $('.backTop').show();
  } else {
    $('.backTop').hide();
  }
});

// 公用元素相似推荐展开区域的高度计算
function checkHeight(flag, oPobj, oAobj) {
  switch (flag) {
    case 0:
      oPobj.css({ 'height': 254 });
      oAobj.css({ 'height': 202 });
      break;
    case 1.1:
      oPobj.css({ 'height': 254 });
      oAobj.css({ 'height': 202 });
      break;
    case 1.2:
      oPobj.css({ 'height': 256 });
      oAobj.css({ 'height': 204 });
      arguments[3].css('marginBottom', 8);
      break;
    case 2:
      oPobj.css({ 'height': 444 });
      oAobj.css({ 'height': 395 });
      break;
  }
  return true;
}

// 公用元素收藏按钮的刷新和加载
// 初始化子页面信息
function refreshChildPageInfo(s) {
  var url = window.location.href.split('?')[0];
  var e = url.lastIndexOf('/') + 1;
  url = url.substring(e);
  var sn = url.indexOf('_') + 1;
  var en = url.indexOf('.html');
  var type = url.substring(sn, en).toUpperCase();
  if (type == 'GEDAN') {
    // 登录重新加载歌单评论
    loadRecCommentList(8, 1);
  } else if (type == 'HOTCOLUMN') {
    // 登录重新加载专栏评论
    loadRecCommentList('z1', 1);
  } else if (type == 'ALBUM') {
    // 登录重新加载专辑评论
    loadRecCommentList(13, 1);
  } else if (type == 'ARTIST') {
    // 登录重新加载歌手单曲评论
    loadRecCommentList(4, 1);
  } else if (type == 'CDPACKMUSIC') {
    // cd包专辑详情页评论加载
    loadRecCommentList('cd', 1);
  }
  if (type == 'GEDAN' || type == 'ARTIST' || type == 'MVGEDAN' || type == 'ALBUM') {
    if (type == 'GEDAN' || type == 'MVGEDAN') {
      type = 'PLAYLIST';
    }
    showLike('get', type);
  } else if (type == 'MYARTIST') {
    commonClick({ 'source': '-2', 'sourceid': '4', 'name': '3', 'id': '-2' });
  } else if (type == 'TOPIC') {
    // var n = parseInt(cfvfn.mtlo.node,10);
    var n = parseInt(mtlo.node, 10);
    if (s) {
      if (n == 3) {
        // cfvfn.mtlo.type = 'hot';
        // cfvfn.showModule(cfvfn.mtlo);
        mtlo.type = 'hot';
        showModule(mtlo);
      } else {
        // cfvfn.showModule(cfvfn.mtlo);
        showModule(mtlo);
      }
    } else {
      try {
        $('#frame_content').contents().find('.new_like_icon').hide().find('font').html('0');
        $('#frame_content').contents().find('.zan a').removeClass('liked').addClass('like');
        cfvfn.closeShare();
        if (n == 3) cfvfn.showModule(cfvfn.mtlo);
      } catch (e) {
      }
    }
  } else if (type == 'JXJ' || url.indexOf('originalcontentpage.html') > -1) {
    if (s) {
      frame_content.OnLogin();
    } else {
      frame_content.OnLogout();
    }
  }
}

// 加载结束-------------------

// 关于请求的处理开始（换ip什么之后放这里）----------------------
// ajax二次请求封装
function request(url, type, callback, options) {
  $.ajax({
    url: url,
    dataType: type,
    success: function(data) {
      if (options) {
        callback(data, options);
      } else {
        callback(data);
      }
    }
  });
}

// 关于请求的处理结束（换ip什么之后放这里）----------------------

// jq插件开始---------------------
// 判断元素是否是显示的
jQuery.fn.isShow = function() {
  if ($(this).size() == 0 || $(this).css('display') == 'none') {
    return false;
  } else {
    return true;
  }
};
// jq插件结束---------------------

// 注册事件的禁止使用开始---------
// document.onselectstart = function(){if(event.srcElement.tagName!="TEXTAREA"){return false}};
// document.ondragstart = function(){return false};
// document.onbeforecopy = function(){if(event.srcElement.tagName!="TEXTAREA"){return false}};
// document.oncopy = function(){if(event.srcElement.tagName!="TEXTAREA"){document.selection.empty()}};
// document.onselect = function() {if(event.srcElement.tagName!="TEXTAREA"){document.selection.empty()}};
// 禁用回退键但是输入框不禁用
document.onkeydown = function(e) {
  var code;
  if (!e) {
    var e = window.event;
  }
  if (e.keyCode) {
    code = e.keyCode;
  } else if (e.which) {
    code = e.which;
  }
  // BackSpace 8 space 32;
  if (
    (event.keyCode == 8 || event.keyCode == 32 || event.keyCode == 38 || event.keyCode == 40) &&
    ((event.srcElement.type != 'text' && event.srcElement.type != 'textarea' && event.srcElement.type != 'password') ||
      event.srcElement.readOnly == true
    )
  ) {
    event.keyCode = 0;
    event.returnValue = false;
  }
  return true;
};
// 注册事件的禁止使用结束---------

// 特殊处理开始-------------------
// 判断source是否符合要求
function sourceISOK(source) {
  /* 32 新精选 33 原创频道 36 音乐话题*/
  if (source > 17 && source != 20 && source != 21 && source != 24 && source != 25 && source != 26 && source != 32 && source != 33 && source != 36) {
    // 不符合展示的类型 应该过滤 若要显示source 40 直接在后面添加&&source!=40
    return true;
  }
  return false;
}

// 特殊处理结束-------------------

// 页面间跳转处理开始--------------------------
// 客户端回调曲库函数(PC导航跳转曲库)
var goBack = '';

function OnJump(param) {
  param = param.replace(/&quot;/g, '\'');
  var djFlag = decodeURIComponent(param.split(';')[1]);
  param = decodeURIComponent(param.split(';')[0]);
  webLog('OnJump:' + param);
  $('.playing_oper').hide();
  if (param == 'vipPlayList') return;
  if (param == '') {
    var node = {};
    node.source = 0;
    window.location.href = 'quku.html';
    if (goBack) {
      node.noback = true;
    }
    return;
  }
  if (param.indexOf('{') < 0 || param.indexOf('}') < 0) {
    if (param == 'mnx' || param == 'name:mnx') {
      var xiuimg = new Image();
      xiuimg.src = 'http://g.koowo.com/g.real?aid=text_ad_2805&ver=' + getVersion() + '&cid=' + getUserID('devid') + '&uid=' + getUserID('uid') + '&t=' + Math.random();
      $('#frame_content').attr('src', 'http://x.kuwo.cn/KuwoLive/OpenLiveFMRoomLink?from=1001004050&isnew=2016&&ver=' + getVersion() + '&uid=' + getUserID('uid') + '&cid=' + getUserID('devid') + '&sid=' + getUserID('sid'));
      mnx_is_show = true;
      callClientNoReturn('CheckDevice');
    }
    if (param == 'songlib' || param == 'name:songlib') {
      param = 'quku';
    }
    if (param == 'name:radio' || param == 'radio') {
      param = 'radio';
    }
    if (param == 'name:MV' || param == 'MV') {
      param = 'mv';
    }
    if (param == 'name:classify' || param == 'classify') {
      param = 'classify';
    }
    if (param == 'name:hifidown' || param == 'hifidown' || param == 'name:hificollect' || param == 'hificollect') {
      param = 'cdpack';
    }
    if (djFlag.indexOf('channel_area') > -1) {
      commonClick({
        'source': '43',
        'sourceid': '1',
        'name': 'DJ专区',
        'id': '0',
        'extend': '|HOT',
        'other': '|psrc=分类->|bread=-2,5,分类,-2'
      });
      return;
    }
    var url = window.location.href;
    if (url.indexOf('quku') > -1) {
      getIndexData(true);
      return;
    }
    if (url.indexOf('quku') > -1) {
      getIndexData(true);
      return;
    }
    if (url.indexOf(param) > -1 && (url.indexOf('channel_') > -1 || url.indexOf('quku') > -1)) {
      return;
    }

    param = param.replace(/.+:/, '');
    if (param == 'quku' || param == '*quku') {
      param = 'quku.html';
    } else {
      param = 'channel_' + param + '.html';
    }
    var url = window.location.href;
    url = url.replace(/netsong\/.+/, 'netsong/' + param);
    window.location.href = url;
    return;
  }

  var json = eval('(' + param + ')');
  var source = json.source;
  source = decodeURIComponent(source);
  var sourceid = json.sourceid;
  sourceid = decodeURIComponent(sourceid);
  var name = json.name;
  // 下载外链
  if (callClient('GetDownlink').indexOf(djFlag) > -1) {
    if (djFlag == 'ch:10002' || djFlag == 'ch:10003') {
      $('.all_down').click();
    } else if (djFlag == 'ch:13') {
      $('.download').click();
    }
  }
  // end
  try {
    name = decodeURIComponent(name);
  } catch (e) {
    name = name;
  }
  var id = json.id;
  id = decodeURIComponent(id);
  var extend = json.extend;
  if (!extend) {
    extend = '';
  } else {
    extend = decodeURIComponent(extend);
  }
  var other = json.other || '';
  if ((source == 8 || source == 12) && name == 'my') {
    other = '|from=index';
  }
  if (other) {
    other = decodeURIComponent(other);
  }
  if (source == 29) {
    other = '|psrc=分类->|bread=-2,5,分类,-2';
  }
  var extend2 = json.extend2;
  if (extend2) {
    for (i in extend2) {
      other += '|' + i + '=' + extend2[i];
    }
  }

  var nodeobj = new Node(source, sourceid, name, id, extend, other);
  nodeobj.noback = true;
  // commonClick(nodeobj);
  goBack = false;
}

var goldjson = {};

// 跳转定向分配函数
function commonClick(nodeobj) {
  /*
  * 跳转参数中拼接logsrc字段，方便已重构页面接收，并准确统计日志信息使用
  * @author 邢祥超 [20190815]
  * */
  if (nodeobj) {
    nodeobj.logsrc = getStringKey(nodeobj.other, 'csrc') || getStringKey(nodeobj.other, 'psrc');
  }
  goldjson = nodeobj;
  var source = nodeobj.source;
  var sourceid = nodeobj.sourceid;
  var id = nodeobj.id;
  var name = nodeobj.name;
  // source 是数字 对应
  // -1 直接跳到曲库首页
  // -2 oneCategory点击
  // -3 search
  // -4 歌手专辑
  // -5 歌手MV
  // -6 相似歌手
  // -7 歌手信息
  // -8 特色标签
  // -9 首页某些更多跳转
  // 0 推荐首页
  // 1 banglist 排行榜分类
  // 2 bang 排行榜榜单
  // 3 artistlist 歌手分类
  // 4 artist 歌手
  // 5 tag 普通标签
  // 6 mvlist MV标签
  // 7 mv MV
  // 8 pl 普通歌单
  // 9 diantai 电台
  // 10 fm FM调频
  // 11 game 某个游戏
  // -11 首页个性化口味发现的入口跳转
  // 12 tagpl 代表歌单
  // 13 album 专辑
  // 14 mvpl MV歌单
  // 16 游戏合集
  // 17 打开网页
  // 20 起应用0.
  // 21 获取线上的一个网页 本地展示
  // 24 秀场专区 tag
  // 25 打开外链 目前跟17一样
  // 26 精选集专区 tag
  // 29 专区分类
  // 33 原创
  // 36 话题
  // 40 tag 2015新普通标签
  // 43 专区
  // 51 专栏
  // -300 MV专区内容
  // -201 原创内容页
  // -203 专区歌单
  // -204 专区MV歌单
  // -205 DJ专区更多跳转页面
  // -20140620 百度外链
  // -400 付费专区
  // 潮音乐开发用+-1000开始
  // 1001 首页部分更多跳转---跳转至index_more页面
  // 5000 积分相关页面
  // 8888 首页每日最新单曲（合并入口）
  // 9999 网页搜索
  // 9000 cd包频道页
  // 9001 cd包内容页
  // 9005 cd包下载页
  // 9007 cd包频道标签分类页
  // 9008 cd包歌手列表
  // 9009 cd包歌手cd列表
  // 10000 广播电台
  var sourceNum = parseInt(source, 10);
  switch (sourceNum) {
    case 1:
      gopage(4, nodeobj);
      break;
    case 2:
      gopage(4, nodeobj);
      break;
    case 3:
      gopage(3);
      break;
    case 4:
      gopage(9, nodeobj);
      break;
    case 5:
      gopage(5, nodeobj);
      break;
    case 40:
      gopage(5, nodeobj);
      break;
    case 6:
      gopage(5);
      break;
    case 16:
      gopage(5);
      break;
    case 13:
      gopage(8, nodeobj);
      break;
    case 8:
      if (name == 'my') {
        gopage(6, nodeobj, true);
      } else {
        gopage(6, nodeobj);
      }
      break;
    case 12:
      gopage(6, nodeobj);
      break;
    case 14:
      gopage(14, nodeobj);
      break;
    case 9:
      someDianTai(sourceid, nodeobj);
      break;
    case 10:
      someTiaoPin(sourceid);
      break;
    case -1:
      qukuhtml(nodeobj);
      break;
    case -2:
      gopage(1, nodeobj, false);
      break;
    case -3:
      gopage(10);
      break;
    case -4:
      gopage(9);
      break;
    case -5:
      gopage(9);
      break;
    case -6:
      gopage(9);
      break;
    case -7:
      gopage(9);
      break;
    case -12:
      gopage(9);
      break;
    // case 0: qukuhtml(nodeobj);break;
    case 0:
      gopage(2, nodeobj, false);
      break;
    case 11:
      someGame(nodeobj);
      break;
    case 7:
      playSomeMV(nodeobj);
      break;
    case 17:
      openURL(nodeobj);
      break;
    case 25:
      openURL(nodeobj);
      break;
    case -9:
      selectIndex();
      gopage(5);
      break;
    case -10:
      selectIndex();
      gopage(-10, nodeobj);
      break;
    case -11:
      gopage(-11, nodeobj);
      break;
    case 20 :
      runApp(nodeobj);
      break;
    case 21:
      gopage(7, nodeobj);
      break;
    case 29:
      gopage(29, nodeobj, false);
      break;
    case 33:
      gopage(33, nodeobj, false);
      break;
    case 51:
      gopage(51, nodeobj, false);
      break;
    case -201:
      gopage(-201, nodeobj, false);
      break;
    case -28:
      gopage(29, nodeobj, false);
      break;
    case -29:
      gopage(29, nodeobj, false);
      break;
    case -30:
      gopage(29, nodeobj, false);
      break;
    case 36:
      gopage(36, nodeobj);
      break;
    case 43:
      gopage(43, nodeobj);
      break;// 专区
    case -203:
      gopage(-203, nodeobj, false);
      break;
    case -204:
      gopage(-204, nodeobj, false);
      break;
    case -205:
      gopage(-205, nodeobj, false);
      break;
    case -300:
      gopage(-300, nodeobj, false);
      break;
    case -400:
      gopage(-400, nodeobj, false);
      break;
    case 999:
      var uid = getUserID('uid');
      if (uid == 0) {
        callClientNoReturn('UserLogin?src=login');
      } else {
        nodeobj.source = -2;
        nodeobj.sourceid = 4;
        gopage(999, nodeobj);
      }
      break;
    case 1001:
      gopage(1001, nodeobj, false);
      break;
    case 5000:
      gopage(5000, nodeobj, false);
      break;
    case 8888:
      gopage(8888, nodeobj, false);
      break;
    case 9999:
      gopage(9999, nodeobj, false);
      break;
    case 10000:
      gopage(10000, nodeobj, false);
      break;
    case 9001:
      gopage(9001, nodeobj, false);
      break;
    case 9002:
      gopage(9002, nodeobj, false);
      break;
    case 9003:
      gopage(9003, nodeobj, false);
      break;
    case 9004:
      gopage(9004, nodeobj, false);
      break;
    case 9005:
      gopage(9005, nodeobj, false);
      break;
    case 9006:
      gopage(9006, nodeobj, false);
      break;
    case 9007:
      gopage(9007, nodeobj, false);
      break;
    case 9008:
      gopage(9008, nodeobj, false);
      break;
    case 9009:
      gopage(9009, nodeobj, false);
      break;
    default :
      webLog('当前的source:' + source + '没有定义...');
  }
  if (nodeobj.other && nodeobj.other.indexOf('焦点图') > -1 && nodeobj.showBanner !== 1) {
    realTimeLog('USRCLK', `TYPE:PCFOCUS_CLICK|SOURCEID:${sourceid}`); // 首页焦点图点击日志
  }
}

// 当前显示的是哪个类型的内容页面
var currentF = 2;
var currentIndexTop = 0;

function gopage(f, nodeobj) {
  currentF = f;
  var from = '';
  if (nodeobj) {
    from = getStringKey(nodeobj.other, 'from');
  }
  if (f == 1) { // 一级分类
    var typeNum = parseInt(nodeobj.sourceid, 10);
    if (typeNum == 0) {
      typeNum = parseInt(nodeobj.id, 10);
    }
    switch (typeNum) {
      case 2:
        setIframeSrc('channel_bang.html', 'songlib', nodeobj);
        break;
      case 3:
        setIframeSrc('channel_mv.html', 'mv', nodeobj);
        break;
      case 4:
        var info = 'logsrc=' + nodeobj.logsrc;
        setIframeSrc('channel_artist.html?' + info, 'artist', nodeobj);
        break;
      case 5:
        setIframeSrc('channel_classify.html', 'classify', nodeobj);
        break;
      case 8:
        setIframeSrc('channel_radio.html', 'radio', nodeobj);
        break;
      case 86237:
        var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&extend=' + nodeobj.extend + '&other=' + nodeobj.other;
        setIframeSrc('channel_jxj.html?' + info, 'classify', nodeobj);
        break;
    }
  } else if (f == 2) { // 首页
    setIframeSrc('index.html', 'index', nodeobj);
  } else if (f == 4) { // 排行榜
    var bangPageName = '';
    var sourceidBang = nodeobj.sourceid;
    // 16 热歌榜
    // 17  新歌榜
    // 93 飙升榜
    if (sourceidBang == '16' || sourceidBang == '17' || sourceidBang == '93') {
      bangPageName = 'whole_rankList.html?';
    } else {
      bangPageName = 'content_rankList.html?';
    }
    var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&extend=' + nodeobj.extend + '&logsrc=' + nodeobj.logsrc;
    setIframeSrc(bangPageName + info, 'songlib', nodeobj);
  } else if (f == 5) { // 分类二级
    var fromStr = '';
    if (nodeobj.from) {
      fromStr = '&from=' + nodeobj.from;
    }
    var name = nodeobj.name;
    var html = 'content_classify.html';
    if (name && name.indexOf('电台') > -1) {
      html = 'content_classify_radio.html';
    }
    var info = '?source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&logsrc=' + nodeobj.logsrc + fromStr;
    setIframeSrc(html + info, 'classify', nodeobj);
  } else if (f == 6) {
    var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&logsrc=' + nodeobj.logsrc;
    setIframeSrc('content_gedan.html?' + info, 'classify', nodeobj);
  } else if (f == 7) {
    if (nodeobj.name == '888889') {
      var xiuimg = new Image();
      xiuimg.src = 'http://g.koowo.com/g.real?aid=text_ad_2805&ver=' + getVersion();
      setIframeSrc('index.html?src=' + encodeURIComponent(nodeobj.sourceid), 'xiu', nodeobj);
      return;
    }
    setIframeSrc('content_jxj.html?source=' + nodeobj.source + '&sourceid=' + encodeURIComponent(encodeURIComponent(nodeobj.sourceid)) + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&other=' + nodeobj.other + '', 'classify', nodeobj);
  } else if (f == 8) {
    setIframeSrc('content_album.html?source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&logsrc=' + nodeobj.logsrc, 'artist', nodeobj);
  } else if (f == 9) {
    var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&logsrc=' + nodeobj.logsrc;
    setIframeSrc('content_artist.html?' + info, 'artist', nodeobj);
  } else if (f == 14) {
    // selectCat(3);
    var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&logsrc=' + nodeobj.logsrc;
    setIframeSrc('content_mvgedan.html?' + info, 'mv', nodeobj);
  } else if (f == 33) {
    // selectCat(5);
    setIframeSrc('originalpage.html', 'index', nodeobj);
  } else if (f == 36) {
    // selectCat(86237);
    var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&other=' + nodeobj.other;
    setIframeSrc('content_topic.html?' + info, 'classify', nodeobj);
  } else if (f == 43) {
    var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&extend=' + nodeobj.extend + '&other=' + nodeobj.other;
    if (nodeobj.sourceid == 34) {
      setIframeSrc('channel_area.html?' + info, 'index', nodeobj);
    } else {
      setIframeSrc('channel_area.html?' + info, 'classify', nodeobj);
    }
  } else if (f == -10) {
    selectIndex();
    setIframeSrc('content_latest.html', 'index');
  } else if (f == -201) {
    // selectCat(5);
    var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&extend=' + nodeobj.extend + '&other=' + nodeobj.other;
    setIframeSrc('originalcontentpage.html?' + info, 'index', nodeobj);
  } else if (f == -203) {
    // selectCat(5);
    setIframeSrc('content_djzone_gedan.html?source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&other=' + nodeobj.other + '', 'classify', nodeobj);
  } else if (f == -204) {
    // selectCat(5);
    setIframeSrc('content_djzone_mvgedan.html?source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&other=' + nodeobj.other + '', 'classify', nodeobj);
  } else if (f == -205) {
    // selectCat(5);
    setIframeSrc('content_djartist.html?source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '', 'classify', nodeobj);
  } else if (f == -300) {
    // selectCat(3);
    var info = 'source=' + nodeobj.source + '&sourceid=' + nodeobj.sourceid + '&name=' + nodeobj.name + '&id=' + nodeobj.id + '&extend=' + nodeobj.extend + '&other=' + nodeobj.other;
    setIframeSrc('content_mv.html?' + info, 'mv', nodeobj);
  } else if (f == 999) {
    // selectCat(4);
    setIframeSrc('content_myartist.html', 'artist', nodeobj);
  } else if (f == 29) {
    // selectCat(5);
    if (nodeobj.sourceid == 190481 || nodeobj.sourceid == 28 || nodeobj.sourceid == 88079 || nodeobj.sourceid == 78067) {
      setIframeSrc('content_djzone.html', 'classify', nodeobj);
      $('body').css('background-color', '#373737');
    } else {
      setIframeSrc('zonepage.html', 'classify');
    }
  } else if (f == 51) {
    var info = 'sourceid=' + nodeobj.sourceid;
    setIframeSrc('content_hotcolumn.html?' + info, 'index', nodeobj);
  } else if (f == -400) { // 付费专区跳转
    realTimeLog('MUSIC_FEE', 'FEE_TYPE:MALL');// 点击付费专区发送日志
    // selectCat(5);
    setIframeSrc('channel_charge.html', 'classify', nodeobj);
  } else if (f == -11) { // 个性化入口跳转
    setIframeSrc('content_rcm.html?' + nodeobj.other, 'index', nodeobj);
  } else if (f == 1001) { // 潮音乐首页部分更多跳转
    var info = 'name=' + encodeURIComponent(nodeobj.name) + '&column_type=' + nodeobj.column_type + '&other=' + nodeobj.other;
    setIframeSrc('content_indexmore.html?' + info, 'index', nodeobj);
  } else if (f == 5000) { // 跳转如何赚取积分页面
    var url = nodeobj.sourceid;
    setIframeSrc(url, 'my', nodeobj, true);
  } else if (f == 8888) { // 潮音乐首页新歌速递合并入口
    var info = 'newnum=' + encodeURIComponent(nodeobj.extend);
    setIframeSrc('content_gedanlatest.html?' + info, 'index', nodeobj);
  } else if (f == 9999) {
    var info = 'type=' + nodeobj.type + '&key=' + nodeobj.sourceid.replace(/\'/g, "'").replace(/\\'/g, "'");
    setIframeSrc('channel_search.html?' + info, 'search', nodeobj);
  } else if (f == 9001) {
    var info = 'id=' + nodeobj.id + '&name=' + nodeobj.name;
    setIframeSrc('content_cdpack.html?' + info, 'hifidownloaddetail', nodeobj);
  } else if (f == 9002) {
    setIframeSrc('channel_cdpack.html', 'hifi_music', nodeobj);
  } else if (f == 9003) {
    setIframeSrc('channel_mycdpack.html?type=' + nodeobj.name, 'hifidown', nodeobj);
  } else if (f == 9004) {
    var info = 'id=' + nodeobj.id;
    setIframeSrc('content_cdpackmusic.html?' + info, 'hificollect', nodeobj);
  } else if (f == 9005) {
    setIframeSrc('channel_mycdpack.html?type=' + nodeobj.name, 'hificollect', nodeobj);
  } else if (f == 9006) {
    var info = 'id=' + nodeobj.id;
    setIframeSrc('content_cdpackmusic.html?' + info, 'hificollectdetail', nodeobj);
  } else if (f == 9007) {
    var info = '';
    info = '?pid=' + nodeobj.id;
    setIframeSrc('channel_cdpack.html' + info, 'hifidownloadtagdetail', nodeobj);
  } else if (f == 9008) {
    setIframeSrc('cdpackArtistList.html', 'hifidown', nodeobj);
  } else if (f == 9009) {
    var info = 'id=' + nodeobj.id;
    setIframeSrc('cdpackArtistCdList.html?' + info, 'hificollect', nodeobj);
  } else if (f == 10000) {
    var radioUrl = 'http://www.kuwo.cn/pc/tmpl/t_radio/radioIndex.html?goRadioName=' + nodeobj.goRadioName + '&goRadioId=' + nodeobj.goradioId;
    setIframeSrc(radioUrl, 'my', nodeobj, true);
  }
}

// 重置iframe的 src
function setIframeSrc(src, selectChannel, nodeobj, toweb) {
  if (src.indexOf('channel_search') > -1) {
    saveAction(nodeobj, selectChannel, false, src, toweb);
  } else {
    saveAction(nodeobj, selectChannel, true, src, toweb);
  }
  // window.location.href=src;
}

// 页面间跳转处理结束--------------------------

function GenRadioRandomsufix(nlen) {
  var randomnum = '';

  var len = parseInt(nlen);
  if (len <= 0) {
    return randomnum;
  }

  for (var index = 0; index < nlen; index++) {
    randomnum += Math.floor(Math.random() * 10);
  }

  return randomnum;
}

/* 格式化电台听歌人数*/
function FormatRadioListenersNum(listNum) {
  var exep = listNum || '';
  var strformat = exep + '';
  if (strformat.indexOf('万') > 0) { // 如果结果中有带万的，直接截取处理
    if (strformat.length > 1) {
      strformat = strformat.substr(0, strformat.indexOf('万') + 1);
    } else {
      strformat = '0';
    }

    return strformat;
  }

  var listen = '0';
  var listennum = parseInt(listNum, 10);

  if (listennum > 9999) {
    var div = listennum % 10000;
    if (div == 0) { // 整除了
      var n1 = parseInt(listennum / 10000, 10);
      listen = n1 + '.0' + '万';
    } else { // 四舍五入保留一位小数
      var n1 = parseFloat(listennum / 10000);
      n1 = n1.toFixed(1);
      listen = n1 + '万';
    }
  } else if (listennum > 99) {
    listen = listennum;
  } else {
    listen = listennum + 100;
  }
  return listen;
}

/* 格式化电台听歌人数*/

/* input textarea 通知客户端focus*/
$('input,textarea').live('focus', function() {
  callClientNoReturn('SetFocus?isFocus=1');
});
$('input,textarea').live('blur', function() {
  callClientNoReturn('SetFocus?isFocus=0');
});

// 新版判断是否含有MV
function checkMvIcon(obj) {
  var mvClass = 'm_mv m_mv_n';
  var mp4sig1 = obj.mp4sig1 || '';
  var mp4sig2 = obj.mp4sig2 || '';
  var formats = obj.FORMATS || obj.formats || '';
  if (formats.indexOf('MP4') > -1 && mp4sig1 != 0 && mp4sig1 != '' && mp4sig2 != 0 && mp4sig2 != '') {
    mvClass = 'm_mv';
  }
  return mvClass;
}

// 云盘打标-----------------
// prototype includes
// if (!Array.prototype.includes) {
//   	Object.defineProperty(Array.prototype, 'includes', {
// 	    value: function(searchElement, fromIndex) {
// 	        if (this == null) {
// 	        	throw new TypeError('"this" is null or not defined');
// 	        }
// 	        var o = Object(this);
// 	        var len = o.length >>> 0;
// 	        if (len === 0) {
// 	        	return false;
// 	        }
// 	        var n = fromIndex | 0;
// 	        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

// 	        function sameValueZero(x, y) {
// 	        	return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
// 	        }
// 	        while (k < len) {
// 	        	if (sameValueZero(o[k], searchElement)) {
// 	        		return true;
// 	        	}
// 	        	k++;
// 	     	}
// 	        return false;
// 	    }
//     });
// }
// // 获取云盘rid
// function setCloudIcon(listRid){
// 	$.ajax({
// 		url:"http://pan.kuwo.cn/pan?type=idlist&devid="+getUserID("devid")+"&uid="+getUserID("sid")+"&sid="+getUserID("sid")+"&client=pc&src="+getVersion(),
// 		type:"get",
// 		dataType:"json",
// 		success:function(jsondata){
// 			var cloudRidArr = jsondata.midlist||[];
// 			cloudRidArr = ["371019","94230"];
// 			var sameRidArr = listRid.filter(v => cloudRidArr.includes(v));
// 			console.log(sameRidArr)
// 			for(var i=0;i<sameRidArr.length;i++){
// 				$('.music_wrap[c-rid="'+sameRidArr[i]+'"]').addClass("aaaaaaaa")
// 			}
// 		}
// 	});
// }

var qukuTipsTimeout = null;

function qukuTips(str) {
  if (qukuTipsTimeout != null) clearTimeout(qukuTipsTimeout);
  if (!$('.qukuTips').html()) {
    $('body').append('<div class="qukuTips">' + str + '</div>');
  } else {
    $('.qukuTips').html(str).show();
  }
  var tipsWidth = $('.qukuTips').width();
  $('.qukuTips').css('margin-left', -tipsWidth / 2 + 'px');
  qukuTipsTimeout = setTimeout(function() {
    $('.qukuTips').fadeOut('fast');
  }, 1000);
}

function checkChoose() {
  var len = $('.m_ckb:checked').size();
  var type = 8;
  if ($('.m_ckb').size() > 0 && len == 0) {
    callClientNoReturn('PlsChooseDlg?type=' + type);
    return;
  }
}

function GetCurCaretPos() {
  var elem = document.activeElement;
  var p = kingwolfofsky.getInputPositon(elem);
  var sTop = document.documentElement.scrollTop || document.body.scrollTop;
  var strRet = 'x=' + '' + parseInt(p.left) + '&y=' + '' + parseInt(p.top - elem.scrollTop - sTop);
  callClientNoReturn('SetCurCaretPos?' + strRet);
}

var kingwolfofsky = {
  /**
   * 获取输入光标在页面中的坐标
   * @param  {HTMLElement} 输入框元素
   * @return  {Object}  返回left和top,bottom
   */
  getInputPositon: function(elem) {
    if (document.selection) { // IE Support
      elem.focus();
      var Sel = document.selection.createRange();
      return {
        left: Sel.boundingLeft,
        top: Sel.boundingTop,
        bottom: Sel.boundingTop + Sel.boundingHeight
      };
    } else {
      var that = this;
      var cloneDiv = '{$clone_div}',
        cloneLeft = '{$cloneLeft}',
        cloneFocus = '{$cloneFocus}',
        cloneRight = '{$cloneRight}';
      var none = '<span style="white-space:pre-wrap;"> </span>';
      var div = elem[cloneDiv] || document.createElement('div'),
        focus = elem[cloneFocus] || document.createElement('span');
      var text = elem[cloneLeft] || document.createElement('span');
      var offset = that._offset(elem),
        index = this._getFocus(elem),
        focusOffset = {
          left: 0,
          top: 0
        };
      if (!elem[cloneDiv]) {
        elem[cloneDiv] = div, elem[cloneFocus] = focus;
        elem[cloneLeft] = text;
        div.appendChild(text);
        div.appendChild(focus);
        document.body.appendChild(div);
        focus.innerHTML = '|';
        focus.style.cssText = 'display:inline-block;width:0px;overflow:hidden;z-index:-100;word-wrap:break-word;word-break:break-all;';
        div.className = this._cloneStyle(elem);
        div.style.cssText = 'visibility:hidden;display:inline-block;position:absolute;z-index:-100;word-wrap:break-word;word-break:break-all;overflow:hidden;';
      }
      ;
      div.style.left = this._offset(elem).left + 'px';
      div.style.top = this._offset(elem).top + 'px';
      var strTmp = elem.value.substring(0, index).replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br/>').replace(/\s/g, none);
      text.innerHTML = strTmp;
      focus.style.display = 'inline-block';
      try {
        focusOffset = this._offset(focus);
      } catch (e) {
      }
      ;
      focus.style.display = 'none';
      return {
        left: focusOffset.left,
        top: focusOffset.top,
        bottom: focusOffset.bottom
      };
    }
  },
  // 克隆元素样式并返回类
  _cloneStyle: function(elem, cache) {
    if (!cache && elem['${cloneName}']) return elem['${cloneName}'];
    var className, name, rstyle = /^(number|string)$/;
    var rname = /^(content|outline|outlineWidth)$/; // Opera: content; IE8:outline && outlineWidth
    var cssText = [],
      sStyle = elem.style;
    for (name in sStyle) {
      if (!rname.test(name)) {
        val = this._getStyle(elem, name);
        if (val !== '' && rstyle.test(typeof val)) { // Firefox 4
          name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
          cssText.push(name);
          cssText.push(':');
          cssText.push(val);
          cssText.push(';');
        }
        ;
      }
      ;
    }
    ;
    cssText = cssText.join('');
    elem['${cloneName}'] = className = 'clone' + (new Date()).getTime();
    this._addHeadStyle('.' + className + '{' + cssText + '}');
    return className;
  },
  // 向页头插入样式
  _addHeadStyle: function(content) {
    var style = this._style[document];
    if (!style) {
      style = this._style[document] = document.createElement('style');
      document.getElementsByTagName('head')[0].appendChild(style);
    }
    ;
    style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(document.createTextNode(content));
  },
  _style: {},
  // 获取最终样式
  _getStyle: 'getComputedStyle' in window ? function(elem, name) {
    return getComputedStyle(elem, null)[name];
  } : function(elem, name) {
    return elem.currentStyle[name];
  },
  // 获取光标在文本框的位置
  _getFocus: function(elem) {
    var index = 0;
    if (document.selection) { // IE Support
      elem.focus();
      var Sel = document.selection.createRange();
      if (elem.nodeName === 'TEXTAREA') { // textarea
        var Sel2 = Sel.duplicate();
        Sel2.moveToElementText(elem);
        var index = -1;
        while (Sel2.inRange(Sel)) {
          Sel2.moveStart('character');
          index++;
        }
        ;
      } else if (elem.nodeName === 'INPUT') { // input
        Sel.moveStart('character', -elem.value.length);
        index = Sel.text.length;
      }
    } else if (elem.selectionStart || elem.selectionStart == '0') { // Firefox support
      index = elem.selectionStart;
    }
    return (index);
  },
  // 获取元素在页面中位置
  _offset: function(elem) {
    var box = elem.getBoundingClientRect(),
      doc = elem.ownerDocument,
      body = doc.body,
      docElem = doc.documentElement;
    var clientTop = docElem.clientTop || body.clientTop || 0,
      clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop,
      left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;
    return {
      left: left,
      top: top,
      right: left + box.width,
      bottom: top + box.height
    };
  }
};

function OnLeaveChanel() {
}

// 换肤
function readFile(path) {
  return callClient(`ReadFile?path=${path}`);
}

function getSkinConfig() {
  var config = callClient('GetSkinConf');
  if (config != '') {
    config = JSON.parse(config);
  }
  return config;
}

var fileName = 'netsong/skinConfig.json';
var skinConfig = {
  'type': 'default',
  'skinColor': '#FFD200',
  'linkColor': '#487BB6',
  'hifiColor': '#DFAB45',
  'opqSwitch': false
};
var skinCallback;
;(function() {
  /** 皮肤参数据 */
  try {
    var skinData = getSkinConfig();
    if (skinData != '') {
      var file = readFile(skinData.dir + fileName);
      if (file != '') {
        skinConfig = JSON.parse(file);
      }
    }
    if (skinConfig.opqSwitch) {
      handleOpq(skinData.Opq);
    }
  } catch (e) {
  }
})();

function OnSkinChange(data) {
  if (data != '') {
    var jsonData = JSON.parse(data);
    var file = readFile(jsonData.dir + fileName);
    if (file != '') {
      skinConfig = JSON.parse(file);
    }
  }
  if (skinConfig.opqSwitch) {
    handleOpq(jsonData.Opq);
  }
  setSkin(skinCallback);
}

function setSkin(fn) {
  skinCallback = fn;
  $('body').removeClass().addClass(skinConfig.type);
  $('.no-net a').css('background', skinConfig.skinColor);
  skinCallback && skinCallback();
}

function OnAlphaChange(data) {
  if (skinConfig.opqSwitch && data != '') {
    handleOpq(JSON.parse(data).Opq);
    setSkin(skinCallback);
  }
};

function handleOpq(opq) {
  if (opq === '1') {
    skinConfig.type = 'dark';
  } else if (opq === '0') {
    skinConfig.type = 'shallow';
  }
}

// 换肤hover
$('.br_name a,.b_name a,.name .cdName,h2 .more a,.bmv_name a,.fmv_name a,.skinLink,.page a,.leftNav a,.closeMessage,.close').live({
  'mouseenter': function() {
    var $this = $(this);
    if ($this.hasClass('nonext') || $this.hasClass('current')) {
      return;
    }
    if ($this.text().indexOf('未知') > -1) {
      $this.addClass('cur-def');
      return;
    }
    if ($this.hasClass('icon-close') && skinConfig.type === 'default') {
      return;
    }
    if ($this.hasClass('nonext') || $this.hasClass('noprev')) {
      return;
    }
    if (PAGENAME === 'cdpacket_playing') {
      $this.css('color', '#ca9d63');
    } else {
      $this.css('color', skinConfig.linkColor);
    }
  },
  'mouseleave': function() {
    if ($(this).hasClass('praised') || $(this).hasClass('luxuryVip') || $(this).hasClass('musicVip')) {
      return;
    }
    $(this).css('color', '');
  }
});
$('.praise').live({
  'mouseenter': function() {
    if (!$(this).hasClass('praised')) {
      var colors = '';
      if (PAGENAME === 'cdpacket_playing') {
        colors = '#ca9d63';
      } else {
        colors = skinConfig.linkColor;
      }
      $(this).find('i').css('color', colors);
    }
  },
  'mouseleave': function() {
    if (!$(this).hasClass('praised')) {
      $(this).find('i').attr('style', '');
    }
  }
});

// 换肤结束

function toast(type, msg) {
  callClientNoReturn(`toast?icontype=${type}&msg=${encodeURIComponent(msg)}`);
}

// 获取页面来源
function getPageName() {
  if (window && window.location) {
    const url = decodeURIComponent(window.location.href);
    const pageName = url.replace(/(.*\/)*([^.]+).*/ig, '$2');
    return pageName;
  }
}

// 评论模块颜色控制
function commentModelSkinClor(name) {
  $('.luxuryVip,.musicVip,.praised,.reply-name').css('color', skinConfig.linkColor);
  if (skinConfig.type !== 'default') {
    $('#messageBtn,.confirm,.pageComment .current').css({ 'background': skinConfig.skinColor, 'color': '#fff' });
    $('.no-data-box').css('color', skinConfig.linkColor);
  } else {
    $('#messageBtn,.confirm,.pageComment .current').css({ 'background': skinConfig.skinColor, 'color': '#000' });
    $('.no-data-box').css('color', '#000');
  }
  switch (name) {
    // 歌词评论页
    case 'singleComment':
      if (skinConfig.type === 'default') {
        $('.no-data-box').css('color', '#fff');
      }
      break;
    // HIFI未下载 / HIFI已下载
    // case 'content_cdpack':
    // case 'content_cdpackmusic':
    //   break;
    case 'cdpacket_playing':
      $('.luxuryVip,.musicVip,.praised,.reply-name').css('color', '#ca9d63');
      $('#messageBtn,.confirm,.pageComment .current').css({ 'background': '#ca9d63', 'color': '#fff' });
      $('.no-data-box').css('color', '#fff');
      break;
    default:
  }
}
