// 创建方法开始--------------------(频道页和首页为主)
// 创建一个电台类型的块的html

function createRadioBlock(obj, from, isrefresh, index, tagIndex, strcsrc) {
  var tagtmp = tagIndex;
  var CSRCTAG = '';
  switch (tagtmp) {
    case 1:
      CSRCTAG = '推荐';
      break;
    case 2:
      CSRCTAG = '心情';
      break;
    case 3:
      CSRCTAG = '主题';
      break;
    case 4:
      CSRCTAG = '人群';
      break;
    case 5:
      CSRCTAG = '场景';
      break;
    case 6:
      CSRCTAG = '歌手';
      break;
    case 7:
      CSRCTAG = '乐器';
      break;
    case 8:
      CSRCTAG = '语种';
      break;
    case 9:
      CSRCTAG = '曲风';
      break;
  }

  if (tagIndex == 1) tagIndex = 0;
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var listen = '';
  var ricon = '';
  var pic = '';
  var listen;
  if (from == 'index') {
    var newcount = getStringKey(obj.extend, 'MUSIC_COUNT');
    if (parseInt(newcount, 10)) ricon = '<span class="r_num" style="top:4px;">+' + newcount + '</span>';
    var listennum = parseInt(obj.info, 10);
    pic = obj.pic;
    listen = FormatRadioListenersNum(obj.info || obj.listencnt);
  } else if (from == 'zone') {
    pic = obj.pic;
  } else {
    var info = obj.info;
    var newcount = getStringKey(obj.pc_extend, 'MUSIC_NEW_COUNT');
    if (parseInt(newcount, 10)) ricon = '<span class="r_num" style="top:4px;">+' + newcount + '</span>';
    listen = FormatRadioListenersNum(obj.info || obj.listencnt);
    pic = obj.pic2 || obj.pic5 || obj.img;
  }
  var sourceid = obj.sourceid || obj.parms;
  var radioClass = 'radio_' + sourceid.split(',')[0];
  obj.extend = obj.extend + '|RADIO_PIC=' + pic + '|DIS_NAME=' + disname + "|','tagIndex':'" + tagIndex;
  var click = commonClickString(new Node(obj.source || obj.digest, sourceid, name, obj.id, obj.extend));
  var r = Math.ceil(index / 5);
  var l = index % 5 || 5;
  var pos = r + ',' + l;
  var gps = '';
  var fpage = '';
  var dtid = sourceid.split(',')[0];

  if (from == 'index') {
    fpage = '首页';
    gps = '2,1';
  } else if (from == 'radio') {
    fpage = '电台';
    gps = '1,1';
  } else if (from == 'zone') {
    fpage = 'dj专区';
    gps = '1,1';
  } else if (from == 'area') {
    fpage = '电台场景';
    gps = '1,1';
  }

  if (CSRCTAG == '' || CSRCTAG == null) {
    CSRCTAG = strcsrc;
  }
  var log = 'radioLog(\'POSITION:' + pos + '|GPOSITION:' + gps + '|FROMPAGE:' + fpage + '|RADIOID:' + dtid + '|CSRCTAG:' + CSRCTAG + '->' + obj.name + '\'); ';
  // 处理高斯模糊图片
  if (pic == '') {
    pic = radio_default_img;
  } else {
    // pic = changeImgDomain(pic);
    if (from == 'index' && isrefresh) {
      pic = pic.replace(/(\s*$)/g, '') + '?' + Math.random();
    }
    var oDate = new Date();
    var today = '' + oDate.getFullYear() + toDou(oDate.getMonth() + 1) + toDou(oDate.getDate());
    /*
    * 专区电台获取图片统一改为 blur，因area下无图片 原：pic = 'http://star.kwcdn.kuwo.cn/star/radio/area/' + dtid + '.jpg?' + GenRadioRandomsufix(6);
    * @author 邢祥超 [20190820]
    * */
    pic = 'http://star.kwcdn.kuwo.cn/star/radio/blur/' + dtid + '.jpg?' + GenRadioRandomsufix(6);
  }
  if (obj.music) {
    var musicInfo = obj.music.split('\t');
    musicInfo = musicInfo[1] + '-' + musicInfo[2];
    if (musicInfo == '(null)-(null)') musicInfo = '好音乐不期而遇';
  }
  var arr = [];
  arr[arr.length] = '<a onclick="';
  arr[arr.length] = log;
  arr[arr.length] = click;
  arr[arr.length] = '" title="';
  arr[arr.length] = musicInfo;
  arr[arr.length] = '" href="###" hidefocus>';
  arr[arr.length] = musicInfo;
  arr[arr.length] = '</a>';
  var strinfo = arr.join('');

  html[html.length] = '<li class="br_wrap ';
  html[html.length] = radioClass;
  html[html.length] = '"><a _onclick="';
  html[html.length] = log;
  html[html.length] = click;
  html[html.length] = '" onclick="';
  html[html.length] = log;
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="br_pic" href="###" hidefocus>';
  html[html.length] = ricon;
  if (from == 'zone') {
    html[html.length] = '<span class="br_shade"></span><div class="cover"><img src="';
    html[html.length] = radio_default_img;
    html[html.length] = '" class="lazy" onerror="imgOnError(this,100);" data-original="';
  } else {
    html[html.length] = '<span class="br_shade"></span><div class="cover"><img src="';
    html[html.length] = radio_default_img;
    html[html.length] = '" class="lazy" onerror="imgOnError(this,150);" data-original="';
  }
  html[html.length] = pic + '"' + '></div>';
  if (from != 'area') {
    html[html.length] = '<div class="playing_oper" radio_blike="0" >';
    html[html.length] = '<span class="radio_like" title="喜欢"></span>';
    html[html.length] = '<span class="radio_dust" title="不喜欢"></span>';
    html[html.length] = '<span class="radio_add" title="更多"></span></div>';
  }
  html[html.length] = '<span class="playCntSplice"></span><div class="lstdiv"><span class="listeners">';
  html[html.length] = listen;
  html[html.length] = '</span></div>';
  html[html.length] = '</a><p class="br_name"><a onclick="';
  html[html.length] = log;
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p><p class="br_info">';
  html[html.length] = strinfo;
  html[html.length] = '</p></li>';
  return html.join('');
}
// 创建一个歌单类型的块的html(分类->歌单)
function createPlaylistBlock(obj, from, isrefresh, someObj) {
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var info = obj.info;
  var pic = obj.pic || obj.img;
  pic = getPlaylistPic(pic, 150);
  var icon = '';
  var other = '';
  var source = obj.source || obj.digest;
  var sourceId = obj.sourceid || obj.sourceid || obj.id;
  var click = '';
  var al_icon = '';
  var al_flag = getStringKey(obj.extend, 'AL_FLAG');
  var csrc = '';
  var psrc = someObj.psrc || '';
  var isNewClassifyTag = from == 'newClassifyTag';
  if (al_flag) {
    al_icon = '<span class="al_flag">无损</span>';
  }

  if (disname == '') {
    disname = 'my';
  }
  if (someObj) {
    var ipsrc = psrc + name + '-<PID_' + sourceId + ';SEC_-1;POS_-1;DIGEST_8>';
  }
  if (!pic) {
    pic = default_img;
  } else {
    if (!isNewClassifyTag) {
      pic = changeImgDomain(pic);
    }
    if (from == 'index' && isrefresh) {
      pic = pic.replace(/(\s*$)/g, '') + '?' + Math.random();
    }
  }
  if (someObj && from != 'index') {
    other = '|psrc=' + psrc + '|bread=' + someObj.bread;
    if (from == 'classify' || from == 'newClassifyTag') {
      csrc = someObj.csrc + '->' + name;
      other = '|psrc=' + psrc + '|csrc=' + csrc + '|bread=' + someObj.bread;
    }
  } else if (from == 'index') {
    other = '|from=index|psrc=首页->' + psrc + '|csrc=' + someObj.csrc;
    var newnum = getStringKey(obj.extend, 'MUSIC_COUNT') || 0;
    if (newnum > 99) newnum = 99;
    if (newnum > 0) {
      icon = '<span class="r_num">+' + newnum + '</span>';
    }
  }
  if (someObj && psrc) {
    if (psrc.indexOf('新歌速递') > -1) other += '|newsong=1';
  }

  if (from == 'myFavor') {
    ipsrc = '我的歌单->' + name + '-<PID_' + sourceId + ';SEC_-1;POS_-1;DIGEST_8>';
    csrc = someObj.csrc + '->' + name;
    other = '|from=myFavor|psrc=我喜欢听->|csrc=' + csrc;
    source = 8;
    click = "JumpQuku('PL'," + sourceId + ",'" + name + "','','" + other + "')";
  } else {
    click = commonClickString(new Node(source, sourceId, name, obj.id, obj.extend, other));
  }
  var listennum = obj.listencnt || obj.listen || 0;
  var listenStr = '';
  if (listennum > 100) {
    if (listennum > 9999) {
      var n1 = parseInt(listennum / 10000, 10);
      listenStr = '<span class="playcnt">' + n1 + '万</span>';
    } else {
      listenStr = '<span class="playcnt">' + listennum + '</span>';
    }
  }
  html[html.length] = '<li class="b_wrap"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="b_pic" href="###" hidefocus>';
  html[html.length] = icon;
  html[html.length] = '<span class="b_shade"></span><i onclick="iPlay(arguments[0],8,';
  html[html.length] = sourceId;
  html[html.length] = ',this);return false;" data-ipsrc="';
  html[html.length] = ipsrc;
  html[html.length] = '" title="直接播放" data-csrc="';
  html[html.length] = csrc;
  html[html.length] = '" class="i_play"></i><div class="cover"><img width="120" height="120" src="';
  html[html.length] = default_img;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,120);" data-original="';
  html[html.length] = pic;
  html[html.length] = '" /></div>';
  html[html.length] = al_icon;
  html[html.length] = '<span class="playCntSplice"></span>';
  html[html.length] = listenStr;
  html[html.length] = '</a><p class="b_name playlistname"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p></li>';
  return html.join('');
}
// 个性化（推荐）歌单块html
function createRcmPlaylistBlock(obj, from, isrefresh, someObj, index, black) {
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var info = obj.info;
  var pic = obj.pic;
  var rcm_type = obj.rcm_type;
  var newreason = obj.newreason;
  var imgSrc = '';
  var icon = '';
  var iconListen = '';
  var blackBlock = [];
  var blackClass = '';
  var other = '';
  var reasonStr = '';
  var ipsrc = someObj.psrc + disname + '-<PID_' + obj.sourceid + ';SEC_-1;POS_-1;DIGEST_8>';

  if (pic == '') {
    pic = default_img;
  } else {
    pic = changeImgDomain(pic);
    if (from == 'index' && isrefresh) pic = pic.replace(/(\s*$)/g, '') + '?' + Math.random();
  }
  if (someObj && from != 'index') {
    if (from == 'index(algorithm)') {
      other = '|from=index(algorithm)|psrc=首页->' + someObj.psrc;
    } else if (from == 'index(editor)') {
      other = '|from=index(editor)|psrc=首页->' + someObj.psrc;
    } else {
      other = '|psrc=' + someObj.psrc + '|bread=' + someObj.bread;
    }
  } else if (from == 'index') {
    other = '|from=index|psrc=首页->' + someObj.psrc;
    var newnum = getStringKey(obj.extend, 'MUSIC_COUNT') || 0;
    if (newnum > 99) newnum = 99;
    if (newnum > 0) {
      icon = '<span class="r_num">+' + newnum + '</span>';
    }
  }
  if (someObj && someObj.psrc) {
    if (someObj.psrc.indexOf('新歌速递') > -1) other += '|newsong=1';
  }

  if (rcm_type == 'algorithm' || rcm_type == 'editor') {
    var listennum = obj.playcnt;
    var listen = '';
    if (listennum > 9999) {
      var n1 = parseInt(listennum / 10000, 10);
      var n2 = listennum % 10000 + '';
      n2 = n2.substring(0, 2);
      listen = n1 + '.' + n2 + '万';
      iconListen = '<p class="new_block_listen"><span>' + listen + '</span><font></font></p>';
    } else if (listennum > 0 && listennum < 9999) {
      listen = listennum;
      iconListen = '<p class="new_block_listen"><span>' + listen + '</span><font></font></p>';
    }
  }

  if (rcm_type == 'algorithm') {
    ipsrc = someObj.psrc + disname + '(algorithm)' + '-<PID_' + obj.sourceid + ';SEC_-1;POS_-1;DIGEST_8>'; ;
  } else if (rcm_type == 'editor') {
    ipsrc = someObj.psrc + disname + '(editor)' + '-<PID_' + obj.sourceid + ';SEC_-1;POS_-1;DIGEST_8>'; ;
  }

  // 拉黑样式
  // if(index>1){
  // if(index%2==0){
  //  blackClass='b_black';
  // }else{
  //  blackClass='b_black b_rightblack';
  // }
  // blackBlock[blackBlock.length]='<div class="'+blackClass+'">';
  // blackBlock[blackBlock.length]='<span>不感兴趣</span>';
  // blackBlock[blackBlock.length]='<a data-pid="'+obj.sourceid+'" class="blackBtn" href="###" hidefocus></a>';
  // blackBlock[blackBlock.length]='</div>';
  // /}

  for (var i = 0; i < newreason.length; i++) {
    switch (newreason[i].type) {
      case 'txt':
        reasonStr += '' + newreason[i].desc;
        break;
      default:
        reasonStr += '' + newreason[i].desc;
        break;
    }
  }

  var click = commonClickString(new Node(obj.source, obj.sourceid, name, obj.id, obj.extend, other));
  if (!black) {
    html[html.length] = '<li class="b_wrap">';
  }
  html[html.length] = '<a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="b_pic" href="###" hidefocus>';
  html[html.length] = icon;
  html[html.length] = '<span class="b_splice"></span><span class="b_shade"></span>';
  html[html.length] = iconListen;
  html[html.length] = '<i onclick="iPlay(arguments[0],8,';
  html[html.length] = obj.sourceid;
  html[html.length] = ',this);return false;" data-ipsrc="';
  html[html.length] = ipsrc;
  html[html.length] = '" title="直接播放" class="i_play"></i><img width="120" height="120" src="';
  html[html.length] = default_img;
  // html[html.length] = imgSrc;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,120);" data-original="';
  html[html.length] = pic;
  html[html.length] = '" /></a><p class="b_name"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p><p class="b_info">';
  html[html.length] = '<a href="javascript:;" title="' + reasonStr + '" onclick="' + click + '" hidefocus>' + reasonStr + '</a>';
  html[html.length] = '</p>';
  html[html.length] = blackBlock.join('');
  if (black) {
    html[html.length] = '</li>';
  }
  return html.join('');
}
// 创建一个MV类型的块的html
function createMVBlock(obj, from, isrefresh, pstr, index, lable) {
  var online = obj.online;
  if (typeof (online) !== 'undefined' && online.length == 1 && online == 0) {
    return;
  }
  if (obj.hasmv == 0) return;
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var pic = obj.pic || obj.mvpic || obj.img || '';
  var infoStr = '';
  var click = '';
  var datamv = '';
  var psrc = pstr || '';
  var dataCsrc = $('body').attr('data-csrc');
  var csrc = dataCsrc + '->' + name;
  if (lable) csrc = dataCsrc + '->' + lable + '->' + name;
  psrc = 'VER=2015;FROM=曲库->' + psrc;
  psrc = encodeURIComponent(psrc);
  var copyright = obj.copyright || obj.COPYRIGHT; // 小地球标示
  var rid = obj.musicid || obj.id;
  if (from == 'MV') {
    var pic = obj.mvpic;
    pic = pic.replace('wmvpic/140', 'wmvpic/160');
    var param = obj.playparam;
    var mvString = '';
    if (param != '') {
      param = returnSpecialChar(param);
      var paramArray = param.split(';');
      var childarray = [];
      childarray[0] = encodeURIComponent(returnSpecialChar(name));
      var artist = obj.artist;
      childarray[1] = encodeURIComponent(returnSpecialChar(artist));
      var album = paramArray[2];
      childarray[2] = encodeURIComponent(returnSpecialChar(album));
      for (var j = 3; j < paramArray.length; j++) {
        childarray[j] = paramArray[j];
      }
      var formats = '';
      childarray[childarray.length] = psrc;
      childarray[childarray.length] = formats;
      childarray[childarray.length] = getMultiVerNum(obj);
      childarray[childarray.length] = getPointNum(obj);
      childarray[childarray.length] = getPayNum(obj);
      childarray[childarray.length] = getArtistID(obj);
      childarray[childarray.length] = getAlbumID(obj);
      childarray[childarray.length] = obj.mp4sig1 || 0;
      childarray[childarray.length] = obj.mp4sig2 || 0;
      childarray[childarray.length] = obj.isdownload || 0;
      childarray[childarray.length] = obj.tpay || 0;
      mvString = childarray.join('\t');
      childarray = null;
      var mvridnum = paramArray[11];
      if (mvridnum.indexOf('MKV') > -1) {
        mvridnum = mvridnum.substring(4);
      } else if (mvridnum.indexOf('MV') > -1) {
        mvridnum = mvridnum.substring(3);
      }
      var musicridnum = paramArray[5];
      if (musicridnum.indexOf('MUSIC') > -1) {
        musicridnum = musicridnum.substring(6);
      }
      mvString = encodeURIComponent(mvString);
    }
    click = 'someMV(this);';
    datamv = mvString;
    MVLISTOBJ[MVLISTOBJ.length] = mvString;
    MVLISTOBJECT[MVLISTOBJECT.length] = obj;
    pic = getMVPic(pic);

    if (parseInt(copyright) == 1) {
      if (checkChinese(obj.artist)) {
        if (obj.artist.length > 10) {
          obj.artist = obj.artist.substring(0, 8) + '...';
        }
      } else {
        if (obj.artist.length > 16) {
          obj.artist = obj.artist.substring(0, 14) + '...';
        }
      }
      infoStr = '<p class="bmv_info"><a onclick="' + commonClickString(new Node('4', obj.artistid, checkSpecialChar(obj.artist, 'name'), '4')) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a><a class="bmv_earth" title="该歌曲来自第三方网站" href="###"></a></p>';
    } else {
      infoStr = '<p class="bmv_info"><a onclick="' + commonClickString(new Node('4', obj.artistid, checkSpecialChar(obj.artist, 'name'), '4')) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a></p>';
    }
  } else if (from == 'MVGedan') {
    var pic = obj.mvpic;
    var param = obj.params;
    var mvString = '';
    if (param != '') {
      param = returnSpecialChar(param);
      var paramArray = param.split(';');
      var childarray = [];
      childarray[0] = encodeURIComponent(returnSpecialChar(name));
      var artist = obj.artist;
      childarray[1] = encodeURIComponent(returnSpecialChar(artist));
      var album = paramArray[2];
      childarray[2] = encodeURIComponent(returnSpecialChar(album));
      for (var j = 3; j < paramArray.length; j++) {
        childarray[j] = paramArray[j];
      }
      var formats = obj.formats || '';
      childarray[childarray.length] = psrc;
      childarray[childarray.length] = formats;
      childarray[childarray.length] = getMultiVerNum(obj);
      childarray[childarray.length] = getPointNum(obj);
      childarray[childarray.length] = getPayNum(obj);
      childarray[childarray.length] = getArtistID(obj);
      childarray[childarray.length] = getAlbumID(obj);
      childarray[childarray.length] = obj.mp4sig1 || 0;
      childarray[childarray.length] = obj.mp4sig2 || 0;
      mvString = childarray.join('\t');
      childarray = null;
      var mvridnum = paramArray[11];
      if (mvridnum) {
        if (mvridnum.indexOf('MKV') > -1) {
          mvridnum = mvridnum.substring(4);
        } else if (mvridnum.indexOf('MV') > -1) {
          mvridnum = mvridnum.substring(3);
        }
      }
      var musicridnum = paramArray[5];

      if (musicridnum) {
        if (musicridnum.indexOf('MUSIC') > -1) musicridnum = musicridnum.substring(6);
      }
      mvString = encodeURIComponent(mvString);
    }
    click = 'newSinglePlayMv(this);';
    datamv = mvString;
    MVLISTOBJ[MVLISTOBJ.length] = mvString;
    MVLISTOBJECT[MVLISTOBJECT.length] = obj;
    pic = getMVPic(pic);
    if (obj.artist.length > 20) {
      obj.artist = obj.artist.substring(0, 21) + '...';
    }
    if (parseInt(copyright) == 1) {
      if (checkChinese(obj.artist)) {
        if (obj.artist.length > 10) {
          obj.artist = obj.artist.substring(0, 8) + '...';
        }
      } else {
        if (obj.artist.length > 16) {
          obj.artist = obj.artist.substring(0, 14) + '...';
        }
      }
      infoStr = '<p class="bmv_info"><a onclick="' + commonClickString(new Node('4', obj.artistid, checkSpecialChar(obj.artist, 'name'), '4')) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a><a class="bmv_earth" title="该歌曲来自第三方网站" href="###"></a></p>';
    } else {
      infoStr = '<p class="bmv_info"><a onclick="' + commonClickString(new Node('4', obj.artistid, checkSpecialChar(obj.artist, 'name'), '4')) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a></p>';
    }
  } else if (from == 'artist') {
    var param = obj.playparam;
    var mvString = '';
    if (param != '') {
      param = returnSpecialChar(param);
      var paramArray = param.split(';');
      var childarray = [];
      childarray[0] = encodeURIComponent(returnSpecialChar(name));
      var artist = obj.artist;
      childarray[1] = encodeURIComponent(returnSpecialChar(artist));
      var album = paramArray[2];
      childarray[2] = encodeURIComponent(returnSpecialChar(album));
      for (var j = 3; j < paramArray.length; j++) {
        childarray[j] = paramArray[j];
      }
      childarray[childarray.length] = psrc;
      childarray[childarray.length] = obj.formats;
      childarray[childarray.length] = getMultiVerNum(obj);
      childarray[childarray.length] = getPointNum(obj);
      childarray[childarray.length] = getPayNum(obj);
      childarray[childarray.length] = getArtistID(obj);
      childarray[childarray.length] = getAlbumID(obj);
      childarray[childarray.length] = obj.mp4sig1 || 0;
      childarray[childarray.length] = obj.mp4sig2 || 0;
      mvString = childarray.join('\t');
      childarray = null;
      var mvridnum = paramArray[11];
      if (mvridnum.indexOf('MKV') > -1) {
        mvridnum = mvridnum.substring(4);
      } else if (mvridnum.indexOf('MV') > -1) {
        mvridnum = mvridnum.substring(3);
      }
      if (musicridnum && musicridnum.indexOf('MUSIC') > -1) {
        musicridnum = musicridnum.substring(6);
      }
      mvString = encodeURIComponent(mvString);
    }
    click = 'someMV(this);';
    datamv = mvString;
    MVLISTOBJ[MVLISTOBJ.length] = mvString;
    MVLISTOBJECT[MVLISTOBJECT.length] = obj;
    pic = getMVPic(pic);
    if (obj.artist.length > 20) {
      obj.artist = obj.artist.substring(0, 21) + '...';
    }
    if (parseInt(copyright) == 1) {
      if (checkChinese(obj.artist)) {
        if (obj.artist.length > 10) {
          obj.artist = obj.artist.substring(0, 8) + '...';
        }
      } else {
        if (obj.artist.length > 16) {
          obj.artist = obj.artist.substring(0, 14) + '...';
        }
      }
      infoStr = '<p class="bmv_info"><a onclick="' + commonClickString(new Node('4', obj.artistid, checkSpecialChar(obj.artist, 'name'), '4')) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a><a class="bmv_earth" title="该歌曲来自第三方网站" href="###"></a></p>';
    } else {
      infoStr = '<p class="bmv_info"><a onclick="' + commonClickString(new Node('4', obj.artistid, checkSpecialChar(obj.artist, 'name'), '4')) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a></p>';
    }
  } else if (from == 'bang') {
    var param = obj.param;
    var mvString = '';
    if (param != '') {
      param = returnSpecialChar(param);
      var paramArray = param.split(';');
      var childarray = [];
      childarray[0] = encodeURIComponent(returnSpecialChar(name));
      var artist = obj.artist;
      childarray[1] = encodeURIComponent(returnSpecialChar(artist));
      var album = paramArray[2];
      childarray[2] = encodeURIComponent(returnSpecialChar(album));
      for (var j = 3; j < paramArray.length; j++) {
        childarray[j] = paramArray[j];
      }
      childarray[childarray.length] = psrc;
      childarray[childarray.length] = obj.formats;
      childarray[childarray.length] = getMultiVerNum(obj);
      childarray[childarray.length] = getPointNum(obj);
      childarray[childarray.length] = getPayNum(obj);

      childarray[childarray.length] = getArtistID(obj);
      childarray[childarray.length] = getAlbumID(obj);
      childarray[childarray.length] = obj.mp4sig1 || 0;
      childarray[childarray.length] = obj.mp4sig2 || 0;
      mvString = childarray.join('\t');
      childarray = null;
      var mvridnum = paramArray[11];
      if (mvridnum.indexOf('MKV') > -1) {
        mvridnum = mvridnum.substring(4);
      } else if (mvridnum.indexOf('MV') > -1) {
        mvridnum = mvridnum.substring(3);
      }
      var musicridnum = paramArray[5];
      if (musicridnum.indexOf('MUSIC') > -1) {
        musicridnum = musicridnum.substring(6);
      }
      mvString = encodeURIComponent(mvString);
    }
    click = 'someMV(this);';
    datamv = mvString;
    MVLISTOBJ[MVLISTOBJ.length] = mvString;
    MVLISTOBJECT[MVLISTOBJECT.length] = obj;
    if (obj.artist.length > 20) {
      obj.artist = obj.artist.substring(0, 21) + '...';
    }
    if (parseInt(copyright) == 1) {
      if (checkChinese(obj.artist)) {
        if (obj.artist.length > 10) {
          obj.artist = obj.artist.substring(0, 8) + '...';
        }
      } else {
        if (obj.ARTIST.length > 16) {
          obj.artist = obj.artist.substring(0, 14) + '...';
        }
      }
      infoStr = '<p class="bmv_info"><a onclick="' + commonClickString(new Node('4', obj.artistid, checkSpecialChar(obj.artist, 'name'), '4')) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a><a class="bmv_earth" title="该歌曲来自第三方网站" href="###"></a></p>';
    } else {
      infoStr = '<p class="bmv_info"><a onclick="' + commonClickString(new Node('4', obj.artistid, checkSpecialChar(obj.artist, 'name'), '4')) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a></p>';
    }
  } else if (from == 'zone') {
    var formats = '';
    var childarray = [];
    var mvString = '';
    var mvs = obj.sourceid.replace(/;/g, '\t');
    childarray[childarray.length] = mvs;
    childarray[childarray.length] = psrc;
    childarray[childarray.length] = formats;
    childarray[childarray.length] = getMultiVerNum(obj);
    childarray[childarray.length] = getPointNum(obj);
    childarray[childarray.length] = getPayNum(obj);
    childarray[childarray.length] = getArtistID(obj);
    childarray[childarray.length] = getAlbumID(obj);
    childarray[childarray.length] = obj.mp4sig1 || 0;
    childarray[childarray.length] = obj.mp4sig2 || 0;
    mvString = childarray.join('\t');
    mvString = encodeURIComponent(mvString);
    click = 'someMV(this);';
    datamv = mvString;
    if (obj.info.length > 20) {
      obj.info = obj.info.substring(0, 21) + '...';
    }
    if (parseInt(copyright) == 1) {
      if (checkChinese(obj.info)) {
        if (obj.info.length > 10) {
          obj.info = obj.info.substring(0, 8) + '...';
        }
      } else {
        if (obj.info.length > 16) {
          obj.info = obj.info.substring(0, 14) + '...';
        }
      }
      infoStr = '<p class="bmv_info"><a onclick="' + click + '" title="' + obj.info + '" href="###" hidefocus>' + obj.info + '</a><a class="bmv_earth" title="该歌曲来自第三方网站" href="###"></a></p>';
    } else {
      infoStr = '<p class="bmv_info"><a onclick="' + click + '" title="' + obj.info + '" href="###" hidefocus>' + obj.info + '</a></p>';
    }
    MVLISTOBJ[MVLISTOBJ.length] = mvString;
    MVLISTOBJECT[MVLISTOBJECT.length] = obj;
  } else {
    var childarray = [];
    var sourceid = obj.sourceid || obj.parms;
    // if(obj.sourceidcopy){
    // sourceid = obj.sourceidcopy;
    // }
    var mvs = sourceid.replace(/;/g, '\t');
    childarray[childarray.length] = mvs;
    childarray[childarray.length] = psrc;
    childarray[childarray.length] = formats;
    childarray[childarray.length] = getMultiVerNum(obj);
    childarray[childarray.length] = getPointNum(obj);
    childarray[childarray.length] = getPayNum(obj);
    childarray[childarray.length] = getArtistID(obj);
    childarray[childarray.length] = getAlbumID(obj);
    childarray[childarray.length] = obj.mp4sig1 || 0;
    childarray[childarray.length] = obj.mp4sig2 || 0;
    childarray[childarray.length] = obj.isdownload || 0;
    childarray[childarray.length] = obj.tpay || 0;
    mvString = childarray.join('\t');
    mvString = encodeURIComponent(mvString);
    datamv = mvString;
    click = 'someMV(this);';

    // click = commonClickString(new Node(obj.source,sourceid,name,7,obj.extend));
    infoStr = '<p class="bmv_info"><a data-mv="' + datamv + '" onclick="' + click + '" title="' + obj.info + '" href="###" hidefocus>' + obj.info + '</a></p>';
    if (from == 'area') infoStr = '';
    MVLISTOBJ[MVLISTOBJ.length] = mvString;
    MVLISTOBJECT[MVLISTOBJECT.length] = obj;
  }
  if (pic == '') {
    pic = mv_default_img;
  } else {
    pic = changeImgDomain(pic);
    if (from == 'index' && isrefresh) {
      pic = pic.replace(/(\s*$)/g, '') + '?' + Math.random();
    }
  }
  var mviconstr = '';
  if (typeof (getTanMuMVIconStr) === 'function') {
    mviconstr = getTanMuMVIconStr(obj);
  }
  html[html.length] = '<li class="bmv_wrap';
  html[html.length] = getCopyrightClass(obj);
  html[html.length] = '" data-index="' + index + '" data-rid="' + rid + '">';
  html[html.length] = mviconstr;
  if (parseInt(copyright) == 1) {
    html[html.length] = '<div class="sourceTips"><div class="closebtn j_earthBtn"></div>';
    html[html.length] = '<p class="sourceTitle">' + disname + '</p>';
    html[html.length] = '<p class="sourceUrl"></p>';
    html[html.length] = '<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p></div>';
  }
  html[html.length] = '<a onclick="';
  html[html.length] = click;
  html[html.length] = '" data-mv="';
  html[html.length] = datamv;
  html[html.length] = '" data-csrc="';
  html[html.length] = csrc;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="bmv_pic" href="###" hidefocus><span class="bmv_shade"></span><i title="直接播放" class="i_play i_play_big"></i><div class="cover"><img src="';
  html[html.length] = mv_default_img;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,140);" data-original="';
  html[html.length] = pic;
  html[html.length] = '" /></div></a><p class="bmv_name"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" data-mv="';
  html[html.length] = datamv;
  html[html.length] = '" data-csrc="';
  html[html.length] = csrc;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p>';
  html[html.length] = infoStr;
  html[html.length] = '</li>';
  return html.join('');
}

// 创建一个MV歌单的html
function createMVGedanBlock(obj, from, someObj) {
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var info = obj.info;
  var source = obj.source;
  var sourceid = obj.sourceid;
  var id = obj.id;
  var other = '';
  var ipsrc = '';
  var csrc = $('body').attr('data-csrc') + '->' + name;
  if (csrc.indexOf('MV') > -1 && from == 'area') {
    other = '|psrc=' + someObj.psrc + '->|csrc=曲库->MV->' + name + '|bread=' + someObj.bread;
  } else {
    other = '|psrc=' + someObj.psrc + '->|csrc=' + csrc + '|bread=' + someObj.bread;
  }
  if (from == 'bang') {
    other = '|psrc=排行榜->|bread=-2,2,排行榜,0';
  } else if (from == 'MVClassify') {
    csrc = someObj.csrc + '->' + name;
    ipsrc = someObj.psrc + '->' + disname;
  }
  var click = commonClickString(new Node(source, sourceid, name, id, '', other));
  var pic = obj.pic || '';
  html[html.length] = '<li class="b_wrap"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="b_pic" href="###" hidefocus"><span class="b_shade"></span><i onclick="iPlay(arguments[0],14,';
  html[html.length] = sourceid;
  html[html.length] = ',this);return false;" data-ipsrc="';
  html[html.length] = ipsrc;
  html[html.length] = '" title="直接播放" data-csrc="';
  html[html.length] = csrc;
  html[html.length] = '" class="i_play"></i><img data-original="';
  html[html.length] = pic;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,120);" width="120" height="120" src="';
  html[html.length] = default_img;
  html[html.length] = '"></a><p class="b_name"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p><p class="b_info"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = info;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = info;
  html[html.length] = '</a></p></li>';
  return html.join('');
}

// 创建一个MV类型的块的html
function createMVClassifyBlock(obj) {
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var pic = obj.pic;
  var csrc = '曲库->MV->MV分类->' + name + '->首发';
  var other = '|psrc=MV->|bread=-2,3,MV,-2|csrc=' + csrc;
  var click = commonClickString(new Node(-300, obj.tagDbId, name, obj.tagId, '', other));
  var infoStr = '<p class="fmv_info"><a onclick="' + click + '" title="' + obj.desc + '" href="###" hidefocus>' + obj.desc + '</a></p>';
  var icon = '';
  var flag = obj.flag;
  var newnum = parseInt(obj.newCount, 10);
  if (newnum > 0) {
    icon = '<span class="r_num">+' + newnum + '</span>';
  } else if (flag == 'new') {
    icon = '<span class="r_new"></span>';
  } else if (flag == 'hot') {
    icon = '<span class="r_hot"></span>';
  }

  html[html.length] = '<li class="fmv_wrap"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="fmv_pic" href="###" hidefocus>';
  html[html.length] = icon;
  html[html.length] = '<span class="fmv_shade"></span><img width="165" height="95" src="';
  html[html.length] = mv_default_img;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,140);" data-original="';
  html[html.length] = pic;
  html[html.length] = '" /></a><p class="fmv_name"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p>';
  html[html.length] = infoStr;
  html[html.length] = '</li>';
  return html.join('');
}

// 创建一个榜的html
function createBangBlock(obj, from, isrefresh) {
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var info = obj.info;
  var sNum = info.indexOf('更新于');
  var sourceid = obj.sourceid;
  var id = obj.id;
  var style = '';
  if (id == '257172') {
    style = 'display:none';
  }
  var bodyDataCsrc = $('body').attr('data-csrc');
  var csrc = bodyDataCsrc.substring(0, bodyDataCsrc.lastIndexOf('>') + 1) + disname;
  var other = '|psrc=排行榜->|bread=-2,2,排行榜,0|csrc=' + csrc;
  var click = commonClickString(new Node(1, id, name, sourceid, '', other));
  if (sNum > -1) info = info.substring(3) + '';
  var pic = obj.pic2 || obj.pic;
  if (pic == '') {
    pic = default_img;
  } else {
    pic = changeImgDomain(pic);
    if (from == 'index' && isrefresh) {
      pic = pic.replace(/(\s*$)/g, '') + '?' + Math.random();
    }
  }
  html[html.length] = '<li class="b_wrap" style="' + style + '"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="b_pic" href="###" hidefocus onclick="';
  html[html.length] = click;
  html[html.length] = '"><span class="b_shade"></span><i onclick="iPlay(arguments[0],1,';
  html[html.length] = sourceid;
  html[html.length] = ',this);return false;" data-ipsrc="排行榜->';
  html[html.length] = disname;
  html[html.length] = '" title="直接播放" data-csrc="' + csrc + '" class="i_play"></i><img data-original="';
  html[html.length] = pic;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,100);" width="120" height="120" src="';
  html[html.length] = default_img;
  html[html.length] = '"></a><p class="b_name"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p><p class="b_info"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = info;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = info;
  html[html.length] = '</a></p></li>';
  return html.join('');
}

// 创建一个专辑类型的块的html
function createAlbumBlock(obj, from, isrefresh, type) {
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var pic = obj.pic120 || obj.pic;
  var infoStr = '';
  var click = '';
  var albumid;
  var artist = checkSpecialChar(obj.artist, 'disname');
  var datapsrc = '专辑->' + artist + '->' + disname;
  var bodyDataCsrc = $('body').attr('data-csrc');
  var csrc = bodyDataCsrc + '->' + name;
  var dataCsrc = csrc;
  if (type == 'about') {
    dataCsrc = bodyDataCsrc + '->相关专辑->' + name;
  }
  if (from == 'artist') {
    datapsrc = '歌手->' + artist + '->' + name + '(歌手专辑)';
    pic = getAlbumPic(pic);
    albumid = obj.albumid;
    if (type == 'about') {
      csrc = bodyDataCsrc.substring(0, bodyDataCsrc.lastIndexOf('>') + 1) + disname;
      csrc = csrc.replace(/"/g, '\\\'');
    }
    click = commonClickString(new Node(13, albumid, name, 13, obj.extend, other));
    infoStr = '<p class="b_info"><a onclick="' + click + '" title="' + obj.pub + '" href="###" hidefocus>' + obj.pub + '</a></p>';
  } else if (from == 'bang') {
    datapsrc = '排行榜->' + (typeof (currentName) !== 'undefined' ? currentName : '酷我热歌榜') + '(专辑榜)';
    albumid = obj.id;
    csrc = '曲库->歌手->' + artist + '->专辑->' + name;
    var other = '|psrc=歌手->|bread=-2,4,歌手,0';
    click = commonClickString(new Node(13, albumid, name, 13, obj.extend, other));
    infoStr = '<p class="b_info"><a onclick="' + commonClickString(new Node(4, obj.artistid, checkSpecialChar(obj.artist, 'name'), 4, '', other)) + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a></p>';
  } else if (from == 'myFavor') {
    dataCsrc = '曲库->我喜欢听->我的专辑->' + name;
    var artistId = obj.artistid;
    datapsrc = '我的专辑->' + artist + '->' + name + '(歌手专辑)';
    albumid = obj.id;
    pic = getAlbumPic(pic);
    click = "JumpQuku('ALBUM'," + albumid + ",'" + artist + "','" + name + "')";
    var clickToArtist = "JumpQuku('ARTIST'," + artistId + ",'" + name + "','')";
    var other = '|psrc=歌手->|bread=-2,4,歌手,0|';
    infoStr = '<p class="b_info"><a onclick="' + clickToArtist + '" title="' + checkSpecialChar(obj.artist, 'titlename') + '" href="###" hidefocus>' + checkSpecialChar(obj.artist, 'disname') + '</a></p>';
  } else {
    datapsrc = '最新专辑->' + disname;
    var other = '';
    if (from == 'zone') {
      datapsrc = '歌手->' + obj.info + '->' + disname;
      other = '';
    }
    artist = checkSpecialChar(obj.info, 'disname');
    albumid = obj.sourceid;
    click = commonClickString(new Node(obj.source, obj.sourceid, name, obj.nodeid, obj.extend, other));
    infoStr = '<p class="b_info"><a onclick="' + click + '" title="' + obj.info + '" href="###" hidefocus>' + obj.info + '</a></p>';
  }
  if (!pic) {
    pic = default_img;
  } else {
    pic = changeImgDomain(pic);
    if (from == 'index' && isrefresh) {
      pic = pic.replace(/(\s*$)/g, '') + '?' + Math.random();
    }
  }
  html[html.length] = '<li class="b_wrap"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="b_pic" href="###" hidefocus><span class="l_adm"></span><span class="b_shade"></span><i onclick="iPlay(arguments[0],13,';
  html[html.length] = albumid;
  html[html.length] = ',this);return false;" data-ipsrc="';
  html[html.length] = datapsrc;
  html[html.length] = '" title="直接播放" data-csrc="' + dataCsrc.replace(/"/g, '\'') + '" class="i_play"></i><img width="120" height="120" src="';
  html[html.length] = default_img;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,120);" data-original="';
  html[html.length] = pic;
  html[html.length] = '" /></a><p class="b_name"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p>';
  html[html.length] = infoStr;
  html[html.length] = '</li>';

  return html.join('');
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

// 创建一个旧分类类型的块的html
function createClassifyBlock(obj, someObj, from) {
  var html = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var pic = obj.pic;
  var click = '';
  var sourceid = obj.id;
  var other = '';
  var csrc = $('body').attr('data-csrc') + '->' + name;
  if (someObj) {
    other = '|psrc=|' + someObj.psrc + '|csrc=' + csrc + '|bread=' + someObj.bread;
  }
  if (from) var from = from;
  click = commonClickString(new Node(5, sourceid, name, 0, '', other));
  html[html.length] = '<li class="b_wrap"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="b_pic" href="###" hidefocus><span class="l_fenlei"></span><span class="b_shade"></span><img width="120" height="120" src="';
  html[html.length] = default_img;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,120);" data-original="';
  html[html.length] = pic;
  html[html.length] = '" /></a><p class="b_name"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p>';
  if (from != 'area') {
    html[html.length] = '<p class="b_info"><a onclick="';
    html[html.length] = click;
    html[html.length] = '" title="';
    html[html.length] = obj.info;
    html[html.length] = '" href="###" hidefocus>';
    html[html.length] = obj.info;
    html[html.length] = '</a></p>';
  }
  html[html.length] = '</li>';
  return html.join('');
}

// 歌手块块
function createArtistBlock(obj, from, isrefresh, type) {
  var arr = [];
  var id = obj.id;
  var artistid = id;
  if (from == 'zone' || from == 'area') {
    artistid = obj.sourceid;
  }
  var source = obj.source || 4;
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var pic = obj.pic || obj.img;
  var bodyDataCsrc = $('body').attr('data-csrc');
  var csrc = bodyDataCsrc + '->' + name;
  var dataCsrc = csrc;
  if (type == 'about') {
    if (dataCsrc.indexOf('->相似歌手') == -1) {
      dataCsrc = $('body').attr('data-csrc') + '->相似歌手->' + name;
    }
    csrc = '曲库->歌手->' + name;
  } else if (from != 'artist') {
    csrc = '曲库->歌手->' + name;
  }
  var other = '|psrc=歌手->|bread=-2,4,歌手,0|csrc=' + csrc;
  var click = '';
  var oStyle = '';
  var infoStr = '';
  var infotitle = '';

  click = commonClickString(new Node(source, artistid, name, 4, '', other));
  var datapsrc = '歌手->' + disname;
  var followersData = FormatRadioListenersNum(obj.followers); // 粉丝量
  switch (from) {
    case 'similar':
      pic = getArtistPic(pic);
      var songnum = obj.songnum || obj.songnum_total;
      infotitle = songnum + '首歌曲';
      infoStr = '<p class="b_info"><a title="' + infotitle + '" href="###" onclick="' + click + '" hidefocus>' + infotitle + '</a></p>';
      break;
    case 'artist':
      pic = getArtistPic(pic);
      infotitle = obj.music_num + '首歌曲';
      infoStr = '<p class="b_info"><a title="' + infotitle + '" href="###" onclick="' + click + '" hidefocus>' + infotitle + '</a></p>';
      break;
    case 'bang':
      datapsrc = '排行榜->' + (typeof (currentName) !== 'undefined' ? currentName : '酷我热歌榜') + '(歌手榜)';
      pic = getArtistPic(pic);
      infotitle = obj.musicnum + '首歌曲';
      infoStr = '<p class="b_info"><a title="' + infotitle + '" href="###" onclick="' + click + '" hidefocus>' + infotitle + '</a></p>';
      break;
    case 'myartist':
      oStyle = 'display:none;';
      infoStr = '';
      break;
    case 'myartcontent':
      pic = getArtistPic(pic);
      infoStr = '<p class="b_info"><a title="粉丝：' + followersData + '" href="###" style="cursor:default" hidefocus>粉丝：' + followersData + '</a></p>';
      break;
    case 'zone':
      pic = getArtistPic(pic);
      infotitle = obj.info;
      infoStr = '<p class="b_info"><a title="' + infotitle + '" href="###" onclick="' + click + '" hidefocus>' + infotitle + '</a></p>';
      break;
    case 'myFavor':
      dataCsrc = '曲库->我喜欢听->我的歌手->' + name;
      click = "JumpQuku('ARTIST'," + id + ",'" + name + "','')";
      pic = getArtistPic(pic);
      infoStr = '<p class="b_info"><a title="粉丝：' + followersData + '" href="###" style="cursor:default" hidefocus>粉丝：' + followersData + '</a></p>';
      break;
  }
  if (!pic) {
    pic = default_img;
  } else {
    pic = changeImgDomain(pic);
    if (from == 'index' && isrefresh) {
      pic = pic.replace(/(\s*$)/g, '') + '?' + Math.random();
    }
  }
  arr[arr.length] = '<li class="b_wrap"><a title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '" hidefocus href="###';
  arr[arr.length] = '" onclick="';
  arr[arr.length] = click;
  arr[arr.length] = '" class="b_pic">';
  arr[arr.length] = '<span class="b_shade"></span>';
  arr[arr.length] = '<i style="';
  arr[arr.length] = oStyle;
  arr[arr.length] = '" onclick="iPlay(arguments[0],4,';
  arr[arr.length] = artistid;
  arr[arr.length] = ',this);return false;" data-ipsrc="';
  arr[arr.length] = datapsrc;
  arr[arr.length] = '" class="i_play" data-csrc="' + dataCsrc + '" title="直接播放"></i>';
  arr[arr.length] = '<img class="lazy" onerror="imgOnError(this,120);" data-original="';
  arr[arr.length] = pic;
  arr[arr.length] = '" src="';
  arr[arr.length] = default_img;
  arr[arr.length] = '" width="120" height="120"/></a>';
  arr[arr.length] = '<p class="b_name"><a hidefocus href="###';
  arr[arr.length] = '" onclick="';
  arr[arr.length] = click;
  arr[arr.length] = '" title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '">';
  arr[arr.length] = disname;
  arr[arr.length] = '</a></p>';
  arr[arr.length] = infoStr;
  arr[arr.length] = '</li>';
  return arr.join('');
}

function createArtistChannelBlock(obj, from, isrefresh) {
  var arr = [];
  var id = obj.id;
  var artistid = id;
  var source = obj.source || 4;
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var pic = obj.pic;
  var csrc = '曲库->歌手->' + name;
  var other = '|psrc=歌手->|bread=-2,4,歌手,0|csrc=' + csrc;
  var click = '';
  var oStyle = '';
  var infoStr = '';
  var infotitle = '';
  click = commonClickString(new Node(source, artistid, name, 4, '', other));
  var datapsrc = '歌手->' + disname;
  pic = getArtistPic(pic);
  infotitle = obj.music_num + '首歌曲';
  infoStr = '<p class="b_info"><a title="' + infotitle + '" href="###" onclick="' + click + '" hidefocus>' + infotitle + '</a></p>';
  // if(!pic){
  //     pic = default_img;
  // }else{
  //     pic = changeImgDomain(pic);
  //     if(from=="index"&&isrefresh){
  //         pic = pic.replace(/(\s*$)/g, "")+"?"+Math.random();
  //     }
  // }
  arr[arr.length] = '<li class="b_wrap"><a title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '" hidefocus href="###';
  arr[arr.length] = '" onclick="';
  arr[arr.length] = click;
  arr[arr.length] = '" class="b_pic">';
  arr[arr.length] = '<span class="b_shade"></span>';
  arr[arr.length] = '<i style="';
  arr[arr.length] = oStyle;
  arr[arr.length] = '" onclick="iPlay(arguments[0],4,';
  arr[arr.length] = artistid;
  arr[arr.length] = ',this);return false;" data-ipsrc="';
  arr[arr.length] = datapsrc;
  arr[arr.length] = '" class="i_play" data-csrc="' + csrc + '" title="直接播放"></i>';
  arr[arr.length] = '<img class="lazy" onerror="imgOnError(this,120);" data-original="';
  arr[arr.length] = pic;
  arr[arr.length] = '" src="';
  arr[arr.length] = default_img;
  arr[arr.length] = '" width="120" height="120"/></a>';
  arr[arr.length] = '<p class="b_name"><a hidefocus href="###';
  arr[arr.length] = '" onclick="';
  arr[arr.length] = click;
  arr[arr.length] = '" title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '">';
  arr[arr.length] = disname;
  arr[arr.length] = '</a></p>';
  arr[arr.length] = infoStr;
  arr[arr.length] = '</li>';
  return arr.join('');
}
// 精选集块块
function createJxjBlock(obj, index, page) {
  var arr = [];
  var source = obj.source;
  var sourceid = obj.sourceid;
  if (source == 21 && sourceid.indexOf('?') > -1) {
    sourceid = sourceid + '&from=jx';
  }
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var listen = obj.listen || '1万';
  var pic = obj.pic;
  var id = obj.sourceid;
  var csrc = '曲库->分类->精选集->往期精选->' + $('.sort_wrap font').html() + '->' + name;
  if (source == 21) id = getValue(id, 'id');
  if (pic == '') {
    pic = jxj_default_img;
  }
  var oStyle = '';
  sourceid = sourceid.replace('2015Mbox', '2016Mbox');
  var click = commonClickString(new Node(source, sourceid, name, 0, '', '|csrc=' + csrc));
  index % 2 ? oStyle = 'margin-right:0px;' : oStyle = 'margin-right:28px';
  arr[arr.length] = '<li class="bj_wrap" style="';
  arr[arr.length] = oStyle;
  arr[arr.length] = '"><a title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '" hidefocus href="###" class="bj_pic" onclick="';
  arr[arr.length] = click;
  arr[arr.length] = '">';
  arr[arr.length] = '<span class="bj_shade"></span>';
  arr[arr.length] = '<i onclick="iPlay(arguments[0],';
  arr[arr.length] = source;
  arr[arr.length] = ',';
  arr[arr.length] = id;
  arr[arr.length] = ',this); return false;" data-csrc="';
  arr[arr.length] = csrc;
  arr[arr.length] = '" data-ipsrc="精选->';
  arr[arr.length] = disname;
  arr[arr.length] = '" class="i_play" title="直接播放"></i>';
  arr[arr.length] = '<img width="360" height="122" src="';
  arr[arr.length] = jxj_default_img;
  arr[arr.length] = '" class="lazy" onerror="imgOnError(this,295);" data-original="';
  arr[arr.length] = pic;
  arr[arr.length] = '"/></a>';
  arr[arr.length] = '<p class="bj_name"><a hidefocus href="###" title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '" onclick="';
  arr[arr.length] = click;
  arr[arr.length] = '">';
  arr[arr.length] = disname;
  arr[arr.length] = '</a></p>';
  arr[arr.length] = '<p class="bj_info"><a title="';
  arr[arr.length] = listen;
  arr[arr.length] = '人在听" hidefocus href="###" onclick="';
  arr[arr.length] = click;
  arr[arr.length] = '">';
  arr[arr.length] = listen;
  arr[arr.length] = '人在听</a></p></li>';
  return arr.join('');
}
// 歌单歌曲列表(分类区)
function createGedanMusicList(obj, index, rn, pn, psrc) {
  var online = obj.online;
  if (typeof (online) !== 'undefined' && online.length == 1 && online == 0) {
    return;
  }
  var arr = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var album = obj.album;
  var albumid = obj.albumid;
  var artist = obj.artist;
  var artistid = obj.artistid;
  var formats = obj.formats;
  var id = obj.id;
  var params = obj.params;
  var tips = getMusicTips(name, artist, album);

  var score100 = parseInt(obj.score100) || 10;
  var isRcm = psrc.indexOf('为你推荐') > -1;
  if (score100 > 100) {
    score100 = 100;
  }
  var isnew = obj['new'];
  var newhtml = '';
  var copyright = obj.copyright || obj.COPYRIGHT; // 小地球标识字段
  var pay = getPayNum(obj); // 付费歌曲不显示小i
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  var num = rn * pn + index + 1;
  if (num < 10) num = '0' + num;
  arr[arr.length] = '<li class="music_wrap ';
  arr[arr.length] = getCopyrightClass(obj);
  arr[arr.length] = '" c-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" title="';
  arr[arr.length] = tips;
  arr[arr.length] = '" data-index="' + index + '">';
  if (parseInt(copyright) == 1) {
    arr[arr.length] = '<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>';
    arr[arr.length] = '<p class="sourceTitle">' + disname + '</p>';
    arr[arr.length] = '<p class="sourceUrl"></p>';
    arr[arr.length] = '<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p></div>';
  }

  arr[arr.length] = '<div style="" class="m_l"><input type="checkbox" checked="checked" class="m_ckb"><span class="num">';
  arr[arr.length] = num;
  arr[arr.length] = '</span></div>';

  // left end  ..
  arr[arr.length] = '<div class="mr_box" style="overflow:hidden;">';
  if (!isRcm) {
    arr[arr.length] = '<div class="mr_box_r">';
    // EQ
    arr[arr.length] = '<div class="m_eq_box">';
    arr[arr.length] = '<i data-md="';
    arr[arr.length] = formats;
    arr[arr.length] = '" title="选择试听音质" class="m_hd ';
    arr[arr.length] = getHqLevel(obj);
    arr[arr.length] = '"></i></div>';
    // HOT
    arr[arr.length] = '<div class="hot_progress_box">';
    arr[arr.length] = '<i class="m_score">';
    arr[arr.length] = '<span style="width:';
    arr[arr.length] = score100;
    arr[arr.length] = '%;"></span></i>';
    // 小地球位置
    var earthClass = '';
    if (parseInt(copyright) == 1) {
      earthClass = 'earth';
      arr[arr.length] = '<a title="该歌曲来自第三方网站" class="' + earthClass + '"></a>';
    } else if (pay == 0) {
      arr[arr.length] = '<a title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon"></a>';
    }

    arr[arr.length] = '</div></div>';
    // CONTENT
    arr[arr.length] = ' <div class="mr_center_con" style="overflow:hidden;zoom:1;margin-right: 25px;">';
  } else {
    arr[arr.length] = ' <div class="mr_center_con">';
  }

  // song name
  arr[arr.length] = '<div class="m_name_box">';
  arr[arr.length] = '<span class="m_name"><a data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" class="w_name" hidefocus href="###" title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '">';
  disname = ie6SubStr(disname, 20, 16);
  //    arr[arr.length] = getShortName(disname)
  arr[arr.length] = disname;
  arr[arr.length] = '</a>';
  // judge tanmumv
  if (!getTanMuIconStr(obj)) {
    arr[arr.length] = '<a hidefocus href="###" class="';
    var mvclass = checkMvIcon(obj);
    arr[arr.length] = mvclass;
    arr[arr.length] = '" title="观看MV"></a>';
  }
  if (getTanMuIconStr(obj) && obj.hasmv == '1') {
    var strTm = getTanMuIconStr(obj);
    arr[arr.length] = '<i class="m_score tm">' + strTm + '</i>';
  }
  arr[arr.length] = newhtml;
  arr[arr.length] = '</span>';
  arr[arr.length] = '</div>';
  // operator icons
  arr[arr.length] = '<div data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '"class="icon">'; // icon-wrap-- end ...
  arr[arr.length] = '<a hidefocus href="###" class="m_add" title="添加歌曲" style="margin-left: 0"></a>';
  arr[arr.length] = '<a hidefocus href="###" class="m_down ';
  if (obj.isdownload == '1') {
    arr[arr.length] = 'notAllow';
    arr[arr.length] = '" title="应版权方要求暂不能下载">';
  } else {
    arr[arr.length] = '" title="下载歌曲">';
  }
  arr[arr.length] = getMoney(obj, 'down');
  arr[arr.length] = '';
  arr[arr.length] = '</a><a data-rid="' + id + '" hidefocus href="###" class="newm_more" title="相似推荐" style="display:none"></a><a hidefocus href="###" class="m_more" title="更多操作" data-similarFlag="';
  if (isRcm) {
    arr[arr.length] = '0';
  } else {
    arr[arr.length] = '1';
  }
  arr[arr.length] = '"></a></div>';
  // icons end
  // singer
  arr[arr.length] = '<div class="m_artist_box"><span class="m_artist"><a onclick="';
  arr[arr.length] = commonClickString(new Node(4, artistid, checkSpecialChar(artist, 'name'), 4));
  arr[arr.length] = '" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(artist, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(artist, 'disname'), 8, 5);
  arr[arr.length] = '</a></span></div>';
  //  专辑c-type
  arr[arr.length] = '<div class="m_album_box"><span class="m_album"><a onclick="';
  arr[arr.length] = commonClickString(new Node(13, albumid, checkSpecialChar(album, 'name'), 13));
  arr[arr.length] = '" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(album, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(album, 'disname'), 8, 5);
  // arr[arr.length] = '</a></span></div>';
  arr[arr.length] = '</a></span></div></div></div>';
  arr[arr.length] = '<div class="openArea" title="" style="display:none;">';
  arr[arr.length] = '<div class="similarity"><p>包含这首歌的歌单及相似歌曲</p>';
  arr[arr.length] = '<div class="btnBox"><a class="prev" href="javascript:;"></a>';
  arr[arr.length] = '<a class="next" href="javascript:;"></a></div>';
  arr[arr.length] = '<a href="javascript:;" class="closeOpenArea"></a></div>';
  arr[arr.length] = '<div class="moveBox"><div class="album"></div><div class="openSong"></div></div>';
  arr[arr.length] = '</div>';
  arr[arr.length] = '</li>';
  saveMusicInfo(obj, 'playlist', psrc);
  return arr.join('');
}
// 个性化（口味与发现）歌曲列表
function createRcmMusicList(obj, index, rn, pn, psrc, type) {
  var online = obj.online;
  if (typeof (online) !== 'undefined' && online.length == 1 && online == 0) {
    return;
  }
  var arr = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var album = obj.album;
  var albumid = obj.albumid;
  var artist = obj.artist;
  var artistid = obj.artistid;
  var formats = obj.formats;
  var id = obj.id;
  var params = obj.params;
  var param = obj.param;
  // 小地球标识字段
  var copyright = obj.copyright || obj.COPYRIGHT;
  var pay = getPayNum(obj); // 付费歌曲不显示小i
  // 发现的推荐理由字段
  var newreason = obj.newreason;
  if (!newreason) {
    newreason = [];
  }
  // 发现的推荐理由中的歌单面包线导航用字段
  var other = '';
  // 此处添加新的index后续字段rcm用来用于口味与发现的跳转歌单
  other = '|from=index(rcm)|psrc=发现好歌->|';
  // 结束
  var tips = getMusicTips(name, artist, album);
  var score100 = parseInt(obj.score100) || 10;
  if (score100 > 100) {
    score100 = 100;
  }
  var isnew = obj['new'];
  var newhtml = '';
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  var num = rn * pn + index + 1;
  if (num < 10) num = '0' + num;
  // 发现好歌的新样式
  if (type == 1 && newreason.length > 0) {
    arr[arr.length] = '<li class="music_wrap music_wrapDiscover ';
  } else {
    arr[arr.length] = '<li class="music_wrap ';
  }
  arr[arr.length] = getCopyrightClass(obj);
  arr[arr.length] = '" c-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" title="';
  arr[arr.length] = tips;
  arr[arr.length] = '" data-index="' + index + '">';
  if (parseInt(copyright) == 1) {
    arr[arr.length] = '<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>';
    arr[arr.length] = '<p class="sourceTitle">' + disname + '</p>';
    arr[arr.length] = '<p class="sourceUrl"></p>';
    arr[arr.length] = '<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p></div>';
  }
  arr[arr.length] = '<div class="m_l"><input type="checkbox" checked="true" class="m_ckb"><span class="num">';
  arr[arr.length] = num;
  arr[arr.length] = '</span><div data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" class="icon">'; // icon-wrap-- end ...
  // 操作icon区域
  arr[arr.length] = '<a hidefocus href="###" class="m_add" title="添加歌曲" style="margin-left: 0"></a>';
  arr[arr.length] = '<a hidefocus href="###" class="m_down ';
  if (obj.isdownload == '1') {
    arr[arr.length] = 'notAllow';
    arr[arr.length] = '" title="应版权方要求暂不能下载">';
  } else {
    arr[arr.length] = '" title="下载歌曲">';
  }
  arr[arr.length] = getMoney(obj, 'down');
  arr[arr.length] = '</a><a data-rid="' + id + '" hidefocus href="###" class="newm_more" title="相似推荐" style="display:none"></a><a hidefocus href="###" class="m_more" title="更多操作" data-similarFlag="1"></a></div></div>';

  // icon结束
  arr[arr.length] = ' <div class="mr_box" style="overflow:hidden;"><div class="mr_box_r">';
  // EQ
  arr[arr.length] = '<div class="m_eq_box">';
  arr[arr.length] = '<i data-md="';
  arr[arr.length] = formats;
  arr[arr.length] = '" title="选择试听音质" class="m_hd ';
  arr[arr.length] = getHqLevel(obj);
  arr[arr.length] = '"></i></div>';
  // HOT
  arr[arr.length] = '<div class="hot_progress_box">';
  arr[arr.length] = '<i class="m_score">';
  arr[arr.length] = '<span style="width:';
  arr[arr.length] = score100;
  arr[arr.length] = '%;"></span></i>';
  // 小地球位置
  var earthClass = '';
  if (parseInt(copyright) == 1) {
    earthClass = 'earth';
    arr[arr.length] = '<a title="该歌曲来自第三方网站" class="' + earthClass + '"></a>';
  } else if (pay == 0) {
    arr[arr.length] = '<a title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon"></a>';
  }
  arr[arr.length] = '</div></div>';
  // CONTENT
  arr[arr.length] = ' <div class="mr_center_con" style="overflow:hidden;zoom:1;margin-right: 25px;">';
  // song name
  arr[arr.length] = '<div class="m_name_box">';
  arr[arr.length] = '<span class="m_name"><a data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" class="w_name" hidefocus href="###" title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '">';
  disname = ie6SubStr(disname, 20, 16);
  //    arr[arr.length] = getShortName(disname)
  arr[arr.length] = disname;
  arr[arr.length] = '</a>';
  // judge tanmumv
  if (!getTanMuIconStr(obj)) {
    arr[arr.length] = '<a hidefocus href="###" class="';
    var mvclass = checkMvIcon(obj);
    arr[arr.length] = mvclass;
    arr[arr.length] = '" title="观看MV"></a>';
  }
  if (getTanMuIconStr(obj) && obj.hasmv == '1') {
    var strTm = getTanMuIconStr(obj);
    arr[arr.length] = '<i class="m_score tm">' + strTm + '</i>';
  }
  arr[arr.length] = newhtml;
  arr[arr.length] = '</span>';
  arr[arr.length] = '</div>';
  // singer
  arr[arr.length] = '<div class="m_artist_box"><span class="m_artist"><a onclick="';
  arr[arr.length] = commonClickString(new Node(4, artistid, checkSpecialChar(artist, 'name'), 4));
  arr[arr.length] = '" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(artist, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(artist, 'disname'), 8, 5);
  arr[arr.length] = '</a></span></div>';
  //  专辑c-type
  arr[arr.length] = '<div class="m_album_box"><span class="m_album"><a onclick="';
  arr[arr.length] = commonClickString(new Node(13, albumid, checkSpecialChar(album, 'name'), 13));
  arr[arr.length] = '" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(album, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(album, 'disname'), 8, 5);
  arr[arr.length] = '</a></span></div></div></div>';
  arr[arr.length] = '<div class="openArea" title="" style="display:none;">';
  arr[arr.length] = '<div class="similarity"><p>包含这首歌的歌单及相似歌曲</p>';
  arr[arr.length] = '<div class="btnBox"><a class="prev" href="javascript:;"></a>';
  arr[arr.length] = '<a class="next" href="javascript:;"></a></div>';
  arr[arr.length] = '</div>';
  arr[arr.length] = '<div class="moveBox"><div class="album"></div><div class="openSong"></div></div>';
  arr[arr.length] = '</div>';
  arr[arr.length] = '</li>';
  // type==1 代表是发现
  if (type == 1 && newreason.length > 0) {
    arr[arr.length] = '<p class="discoverText">';
    for (var j = 0; j < newreason.length; j++) {
      switch (newreason[j].type) {
        case 'txt':
          arr[arr.length] = '<span>' + newreason[j].desc + '</span>';
          break;
        case 'artist':
          newArtist = newreason[j].desc.substring(1, newreason[j].desc.length - 1);
          arr[arr.length] = '<a onclick="';
          arr[arr.length] = commonClickString(new Node(4, newreason[j].id, checkSpecialChar(newArtist, 'name'), 4));
          arr[arr.length] = '" hidefocus href="###" title="';
          arr[arr.length] = checkSpecialChar(newArtist, 'titlename');
          arr[arr.length] = '">';
          arr[arr.length] = checkSpecialChar(newreason[j].desc, 'disname');
          arr[arr.length] = '</a>';
          break;
        case 'playlist':
          arr[arr.length] = '<a onclick="';
          arr[arr.length] = commonClickString(new Node('8', newreason[j].id, newreason[j].desc, '', '', other));
          arr[arr.length] = '" hidefocus href="###" title="';
          arr[arr.length] = checkSpecialChar(newreason[j].desc, 'titlename');
          arr[arr.length] = '">';
          arr[arr.length] = checkSpecialChar(newreason[j].desc, 'disname');
          arr[arr.length] = '</a>';
          break;
        case 'tag':
          tag = newreason[j].desc.substring(1, newreason[j].desc.length - 1);
          arr[arr.length] = '<span>[' + tag + ']</span>';
          // arr[arr.length] = '<a onclick="';
          // arr[arr.length] = commonClickString(new Node(40,-22,tag,0,'','|psrc=分类-&gt;|bread=-2,5,分类,-2'));
          // arr[arr.length] = '" hidefocus href="###" title="';
          // arr[arr.length] = checkSpecialChar(newreason[j].desc,"titlename");
          // arr[arr.length] = '">';
          // arr[arr.length] = checkSpecialChar(newreason[j].desc,"disname");
          // arr[arr.length] = '</a>';
          break;
        default:
          arr[arr.length] = '<span>' + newreason[j].desc + '</span>';
          break;
      }
    }
    arr[arr.length] = '</p>';
  }
  saveMusicInfo(obj, 'playlist', psrc);
  return arr.join('');
}
// 创建展开区域内的专辑(相似推荐内的专辑块)
function createRcmChild(obj, index) {
  try {
    var html = [];
    var len = 0;
    var name = checkSpecialChar(obj.name, 'name');
    var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
    var titlename = checkSpecialChar(disname, 'titlename');
    var tag = obj.tag;
    var pic = obj.pic;
    var other = '';
    var ipsrc = '相似推荐->' + disname + '-<PID_' + obj.sourceid + ';SEC_-1;POS_-1;DIGEST_8>';
    var csrc = $('body').attr('data-csrc') + '->相似推荐->歌单->' + name;
    if (pic == '') {
      pic = default_img;
    } else {
      pic = changeImgDomain(pic);
    }
    var listennum = obj.playcnt;
    var listen = '';
    if (listennum > 9999) {
      var n1 = parseInt(listennum / 10000, 10);
      var n2 = listennum % 10000 + '';
      n2 = n2.substring(0, 2);
      listen = n1 + '.' + n2 + '万';
    } else {
      listen = listennum;
    }
    var tagAry = [];
    if (tag != null && tag.indexOf('#') > 0) {
      tagAry = tag.split('#');
    } else {
      tagAry[0] = tag;
    }
    other = '|from=index|psrc=相似推荐->|csrc=曲库->相似推荐->' + name;
    var click = commonClickString(new Node(obj.source, obj.sourceid, name, obj.nodeid, obj.extend, other));
    if (!index) {
      var changeLen = 1;
    } else {
      var changeLen = Math.ceil((index + 1) / 5);
    }
    var default_img120 = 'img/default.png';
    html[len++] = '<div data-change="' + changeLen + '" class="new_block change_data" data-id="' + obj.sourceid + '">';
    html[len++] = '<a class="new_block_img" href="###" hidefocus onclick="';
    html[len++] = click;
    html[len++] = '" title="' + titlename + '">';
    // 2015-07-09 新增 背景圆角元素和样式
    html[len++] = '<span class="bgradius120"></span>';
    html[len++] = '<img src="' + default_img120 + '"  class="lazy" onerror="imgOnError(this,120);" data-original="';
    html[len++] = pic;
    html[len++] = '" />';
    html[len++] = '<p class="new_block_listen">';
    html[len++] = '<span>' + listen + '</span>';
    html[len++] = '<font></font>';
    html[len++] = '</p>';
    html[len++] = '<p class="new_block_shade"></p>';
    html[len++] = '<em class="new_block_em" onclick="iPlay(arguments[0],8,';
    html[len++] = obj.sourceid;
    html[len++] = ',this);return false;" data-csrc="' + csrc + '" data-ipsrc="';
    html[len++] = ipsrc;
    html[len++] = '" title="直接播放"></em>';
    html[len++] = '</a>';
    html[len++] = '<p class="new_block_name">';
    html[len++] = '<a href="###" title="' + titlename + '" onclick="';
    html[len++] = click;
    html[len++] = '">' + disname + '</a>';
    html[len++] = '</p>';
    html[len++] = '<p class="new_block_info">';

    if (tagAry != null && tagAry.length > 0) {
      var tagLen = tagAry.length;
      if (tagLen > 3) {
        tagLen = 3;
      }
      for (var i = 0; i < tagLen; i++) {
        if (tagAry[i]) {
          if (i != 0) {
            // 2015-07-09 修改需求 用空格连接标签
            html[len++] = ' ';
          }
          // var tagClick = 'commonClick({\'source\':\'40\',\'sourceid\':\'-22\',\'name\':\''+tagAry[i]+'\',\'id\':\'0\',\'other\':\'|psrc=分类-&gt;|bread=-2,5,分类,-2\'})';
          var tagClick = commonClickString(new Node(40, -22, tagAry[i], 0, '', '|psrc=分类-&gt;|bread=-2,5,分类,-2'));
          html[len++] = '<a style="cursor:default;" href="###" title="';
          html[len++] = tagAry[i];
          // html[len++] ='" onclick="';
          // html[len++] = tagClick;
          html[len++] = '">' + tagAry[i] + '</a>';
        }
      }
    }
  } catch (e) {
    // alert(e.message);
  }

  html[len++] = '</p>    ';
  html[len++] = '</div>';
  return html.join('');
}
// 个性化点击歌曲更多选项展开列表(相似推荐中的歌曲列表)
function createOpenMusicList(obj, index, rn, pn, psrc, enter) {
  var online = obj.online;
  if (typeof (online) !== 'undefined' && online.length == 1 && online == 0) {
    return;
  }
  var arr = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var album = obj.album;
  var albumid = obj.albumid;
  var artist = obj.artist;
  var artistid = obj.artistid;
  var formats = obj.formats;
  var id = obj.id;
  var params = obj.params;
  var tips = getMusicTips(name, artist, album);
  var score100 = parseInt(obj.score100) || 10;
  if (score100 > 100) {
    score100 = 100;
  }
  var isnew = obj['new'];
  var newhtml = '';
  var copyright = obj.copyright || obj.COPYRIGHT || 0; // 小地球标识字段

  var pay = getPayNum(obj); // 付费歌曲不显示小i
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  var num = rn * pn + index + 1;
  if (num < 10) num = '0' + num;
  if (rn > 0) {
    var changenum = Math.ceil((index + 1) / 5);
  } else {
    var changenum = 0;
  }
  if (index < 5) {
    arr[arr.length] = '<li data-change="' + changenum + '" class="music_wrap spotsPlay';
  } else {
    arr[arr.length] = '<li style="display:none;" data-change="' + changenum + '" class="music_wrap spotsPlay';
  }
  arr[arr.length] = getCopyrightClass(obj);
  arr[arr.length] = '" c-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" title="';
  arr[arr.length] = tips;
  arr[arr.length] = '">';
  if (parseInt(copyright) == 1) {
    arr[arr.length] = '<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>';
    arr[arr.length] = '<p class="sourceTitle">' + disname + '</p>';
    arr[arr.length] = '<p class="sourceUrl"></p>';
    arr[arr.length] = '<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p></div>';
  }
  arr[arr.length] = '<div style="" class="m_l"><span>';
  arr[arr.length] = num;
  arr[arr.length] = '</span></div>';

  // left end  ..
  arr[arr.length] = ' <div class="mr_box" style="overflow:hidden;"><div class="mr_box_r">';
  // EQ
  arr[arr.length] = '<div class="m_eq_box">';
  arr[arr.length] = '<i data-md="';
  arr[arr.length] = formats;
  arr[arr.length] = '" title="选择试听音质" class="m_hd ';
  arr[arr.length] = getHqLevel(obj);
  arr[arr.length] = '"></i></div>';
  // HOT
  arr[arr.length] = '<div class="hot_progress_box">';
  arr[arr.length] = '<i class="m_score">';
  arr[arr.length] = '<span style="width:';
  arr[arr.length] = score100;
  arr[arr.length] = '%;"></span></i>';
  // 小地球位置
  var earthClass = '';
  if (parseInt(copyright) == 1) {
    earthClass = 'earth j_openE';
    arr[arr.length] = '<a title="该歌曲来自第三方网站" class="' + earthClass + '"></a>';
  } else if (pay == 0) {
    arr[arr.length] = '<a style="margin-left:3px;" title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon rcm_ugcIcon"></a>';
  }
  arr[arr.length] = '</div></div>';
  // CONTENT
  arr[arr.length] = ' <div class="mr_center_con" style="overflow:hidden;zoom:1;margin-right: 25px;">';
  // song name
  arr[arr.length] = '<div class="m_name_box">';
  arr[arr.length] = '<span class="m_name"><a data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" class="w_name" data-type="rcm" hidefocus href="###" title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '">';
  disname = ie6SubStr(disname, 20, 16);
  arr[arr.length] = disname;
  arr[arr.length] = '</a>';
  // judge tanmumv
  if (!getTanMuIconStr(obj) && obj.formats.indexOf('MP4') > -1) {
    arr[arr.length] = '<a hidefocus href="###" class="';
    var mvclass = '';
    mvclass = 'm_mv j_openMv';
    arr[arr.length] = mvclass;
    arr[arr.length] = '" title="观看MV"></a>';
  }
  if (getTanMuIconStr(obj) && obj.hasmv == '1') {
    var strTm = getTanMuIconStr(obj);
    arr[arr.length] = '<i class="m_score2 tm" style="background:none;">' + strTm + '</i>';
  }
  arr[arr.length] = newhtml;
  arr[arr.length] = '</span>';
  arr[arr.length] = '</div>';
  // icons start
  arr[arr.length] = '<div data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '"class="iconwrap">'; // icon-wrap-- 开始 ...
  arr[arr.length] = '<a hidefocus href="###" class="m_add" title="添加歌曲" style="margin-left: 0"></a>';
  arr[arr.length] = '<a hidefocus href="###" class="m_down ';
  if (obj.isdownload == '1') {
    arr[arr.length] = 'notAllow';
    arr[arr.length] = '" title="应版权方要求暂不能下载">';
  } else {
    arr[arr.length] = '" title="下载歌曲">';
  }
  arr[arr.length] = getMoney(obj, 'down');
  arr[arr.length] = '</a></div>';
  // icons end
  // singer
  arr[arr.length] = '<div class="m_artist_box"><span class="m_artist"><a onclick="';
  arr[arr.length] = commonClickString(new Node(4, artistid, checkSpecialChar(artist, 'name'), 4));
  arr[arr.length] = '" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(artist, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(artist, 'disname'), 8, 5);
  arr[arr.length] = '</a></span></div>';
  //  专辑c-type
  arr[arr.length] = '<div class="m_album_box"><span class="m_album"><a onclick="';
  arr[arr.length] = commonClickString(new Node(13, albumid, checkSpecialChar(album, 'name'), 13));
  arr[arr.length] = '" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(album, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(album, 'disname'), 8, 5);
  arr[arr.length] = '</a></span></div>';
  arr[arr.length] = ' </li> ';
  saveMusicInfo(obj, 'playlist', psrc);
  return arr.join('');
}
// 创建展开区域的专辑
function createOpenAlbum(fromObj, cId) {
  var str = '';
  for (var i = 0; i < fromObj.length; i++) {
    // if(fromObj[i].sourceid !=cId){
    str += createRcmChild(fromObj[i], i);
    // }
  }
  return str;
}
// 创建展开区域的歌曲列表
function creteOpenMusic(fromObj, enter) {
  var str = '';
  for (var i = 0; i < fromObj.length; i++) {
    str += createOpenMusicList(fromObj[i], i, fromObj.length, 0, '', enter);
  }
  return str;
}
// 榜单歌曲列表(排行榜区)
function createBangMusicList(obj, index, psrc) {
  var arr = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var num = index + 1;
  var artist = obj.artist;
  var artistid = obj.artistid;
  var id = obj.id;
  var param = obj.param;
  var tips = getMusicTips(name, artist, '');
  var score100 = parseInt(obj.score100) || 10;
  if (score100 > 100) {
    score100 = 100;
  }
  var copyright = obj.copyright || obj.COPYRIGHT; // 小地球标识字段
  var pay = getPayNum(obj); // 付费歌曲不显示小i
  var isnew = obj['new'];
  var newhtml = '';
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  if (num < 10) num = '0' + num;
  arr[arr.length] = '<li class="music_wrap ';
  arr[arr.length] = getCopyrightClass(obj);
  arr[arr.length] = '" title="';
  arr[arr.length] = tips;
  arr[arr.length] = '" c-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" data-index="' + index + '">';
  disname = ie6SubStr(disname, 20, 16);
  if (parseInt(copyright) == 1) {
    arr[arr.length] = '<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>';
    arr[arr.length] = '<p class="sourceTitle">' + disname + '</p>';
    arr[arr.length] = '<p class="sourceUrl"></p>';
    arr[arr.length] = '<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p></div>';
  }
  arr[arr.length] = '<div class="m_l" style="width:100px;"><input type="checkbox" checked="true" class="m_ckb"><span class="num">';
  arr[arr.length] = num;
  arr[arr.length] = '</span>';

  var trend = obj.trend;
  var trendprefix = '';
  if (trend.length > 0) {
    trendprefix = trend.substring(0, 1);
  }
  // 榜单名次细化
  var trendClass = '';
  var arrowNum = obj.rank_change || '';
  var dayNum = '在榜天数：' + obj.duration;
  var bestTimes = '最高名次：' + obj.highest_rank;
  var isNew = obj.isnew;
  var arrowTips = arrowNum;
  if (isNew && isNew != '0') {
    trendClass = 'arrownew';
    arrowTips = '新上榜';
    arrowNum = '';
  } else {
    if (trendprefix == 'u') {
      trendClass = 'arrowup';
      arrowTips = arrowTips.indexOf('%') > -1 ? '上升' + arrowTips : '上升' + arrowTips + '位';
    } else if (trendprefix == 'd') {
      trendClass = 'arrowdown';
      arrowTips = arrowTips.indexOf('%') > -1 ? '下降' + arrowTips : '下降' + arrowTips + '位';
    } else {
      trendClass = 'arrowping';
      arrowTips = '持平';
      arrowNum = '';
    }
  }
  arr[arr.length] = '<span title="';
  arr[arr.length] = arrowTips;
  arr[arr.length] = '" class="';
  arr[arr.length] = trendClass;
  arr[arr.length] = '"></span><span title="';
  arr[arr.length] = arrowTips;
  arr[arr.length] = '" class="arrowNum">';
  arr[arr.length] = arrowNum;
  arr[arr.length] = '</span></div>';
  arr[arr.length] = ' <div class="mr_box" style="overflow:hidden;"><div class="mr_box_r">';
  // EQ
  arr[arr.length] = '<div class="m_eq_box">';
  arr[arr.length] = '<i data-md="';
  arr[arr.length] = obj.formats;
  arr[arr.length] = '" title="选择试听音质" class="m_hd ';
  arr[arr.length] = getHqLevel(obj);
  arr[arr.length] = '"></i></div>';
  // HOT
  arr[arr.length] = '<div class="hot_progress_box" style="float:right;">';
  arr[arr.length] = '<i class="m_score">';
  //    arr[arr.length] = getTanMuIconStr(obj);
  arr[arr.length] = '<span style="width:';
  arr[arr.length] = score100;
  arr[arr.length] = '%;"></span></i><p class="hoverTips"><span class="dayNum">';
  // hovertips位置
  arr[arr.length] = dayNum;
  arr[arr.length] = '</span><span class="bestTimes">';
  arr[arr.length] = bestTimes;
  arr[arr.length] = '</span></p>';
  // 小地球位置
  var earthClass = '';
  if (parseInt(copyright) == 1) {
    earthClass = 'earth';
    arr[arr.length] = '<a title="该歌曲来自第三方网站" class="' + earthClass + '"></a>';
  } else if (pay == 0) {
    arr[arr.length] = '<a title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon"></a>';
  }
  arr[arr.length] = '</div></span></div>';
  // CONTENT
  arr[arr.length] = ' <div class="mr_center_con" style="overflow:hidden;zoom:1;">';
  // song name
  arr[arr.length] = '<div class="m_name_box" style="width: 60%;margin-right: 0">';
  arr[arr.length] = '<span class="m_name"><a data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" class="w_name" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(name, 'titlename');
  arr[arr.length] = '">';
  //    arr[arr.length] = checkSpecialChar(name,"titlename");
  name = ie6SubStr(checkSpecialChar(name, 'disname'), 20, 16);
  arr[arr.length] = name;
  arr[arr.length] = '</a>';
  // mv&弹幕mv
  var mvclass = '';
  var ispoint = obj.ispoint;
  var mviconstr = '';
  if (ispoint == '1') {
    var strTm = getTanMuIconStr(obj);
    arr[arr.length] = '<i class="m_score tm">' + strTm + '</i>';
  } else {
    mvclass = checkMvIcon(obj);
    arr[arr.length] = '<a hidefocus="" href="###" class="' + mvclass + '" style="" title="观看MV"></a>';
  }
  // NEW
  var newhtml = '';
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  var newhtml = '';
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  arr[arr.length] = newhtml;
  arr[arr.length] = '</span>';
  arr[arr.length] = '</div>';
  // icons start
  arr[arr.length] = '<div data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '"class="icon">'; // icon-wrap-- end ...
  arr[arr.length] = '<a hidefocus href="###" class="m_add" title="添加歌曲" style="margin-left: 0"></a>';
  arr[arr.length] = '<a hidefocus href="###" class="m_down ';
  if (obj.isdownload == '1') {
    arr[arr.length] = 'notAllow';
    arr[arr.length] = '" title="应版权方要求暂不能下载">';
  } else {
    arr[arr.length] = '" title="下载歌曲">';
  }
  arr[arr.length] = getMoney(obj, 'down');
  arr[arr.length] = '</a><a hidefocus href="###" class="m_more" title="更多操作"></a></div>';
  // icons end
  // singer
  arr[arr.length] = '<div class="m_artist_box"><span class="m_artist"><a onclick="';
  arr[arr.length] = commonClickString(new Node(4, artistid, checkSpecialChar(artist, 'name'), 4));
  arr[arr.length] = '" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(artist, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(artist, 'disname'), 8, 5);
  arr[arr.length] = '</a></span></div>';
  arr[arr.length] = ' </li> ';
  saveMusicInfo(obj, 'bang', psrc);
  return arr.join('');
}
// 专辑歌曲列表
function createAlbumMusicList(obj, index, psrc) {
  var arr = [];
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var num = index + 1;
  var artist = obj.artist;
  var artistid = obj.artistid;
  var id = obj.id;
  var param = obj.param;
  var tips = getMusicTips(name, artist, '');
  var score100 = parseInt(obj.score100) || 10;
  var copyright = obj.copyright || obj.COPYRIGHT; // 小地球标识字段
  var pay = getPayNum(obj); // 付费歌曲不显示小i
  if (score100 > 100) {
    score100 = 100;
  }
  var isnew = obj['new'];
  var newhtml = '';
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  if (num < 10) num = '0' + num;
  arr[arr.length] = '<li class="music_wrap ';
  arr[arr.length] = getCopyrightClass(obj);
  arr[arr.length] = '" c-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" title="';
  arr[arr.length] = tips;
  arr[arr.length] = '" data-index="' + index + '">';

  if (parseInt(copyright) == 1) {
    arr[arr.length] = '<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>';
    arr[arr.length] = '<p class="sourceTitle">' + name + '</p>';
    arr[arr.length] = '<p class="sourceUrl"></p>';
    arr[arr.length] = '<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p></div>';
  }

  arr[arr.length] = '<div style="" class="m_l"><input type="checkbox" checked="checked" class="m_ckb"><span class="num">';
  arr[arr.length] = num;

  arr[arr.length] = '</span></div>';
  // left end  ..
  arr[arr.length] = ' <div class="mr_box" style="overflow:hidden;"><div class="mr_box_r">';
  // EQ
  arr[arr.length] = '<div class="m_eq_box">';
  arr[arr.length] = '<i data-md="';
  arr[arr.length] = obj.formats;
  arr[arr.length] = '" title="选择试听音质" class="m_hd ';
  arr[arr.length] = getHqLevel(obj);
  arr[arr.length] = '"></i></div>';
  // HOT
  arr[arr.length] = '<div class="hot_progress_box">';
  arr[arr.length] = '<i class="m_score">';
  arr[arr.length] = '<span style="width:';
  arr[arr.length] = score100;
  arr[arr.length] = '%;"></span></i>';
  // 小地球位置
  var earthClass = '';
  if (parseInt(copyright) == 1) {
    earthClass = 'earth';
    arr[arr.length] = '<a title="该歌曲来自第三方网站" class="' + earthClass + '"></a>';
  } else if (pay == 0) {
    arr[arr.length] = '<a title="查看上传用户信息" class="kw_ugcInfoIcon j_ugcIcon"></a>';
  }
  arr[arr.length] = '</div></div>';
  // CONTENT
  arr[arr.length] = ' <div class="mr_center_con" style="overflow:hidden;zoom:1;margin-right: 25px;">';
  // song name
  arr[arr.length] = '<div class="m_name_box" style="width:60%">';
  arr[arr.length] = '<span class="m_name"><a data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '" class="w_name" hidefocus href="###" title="';
  arr[arr.length] = titlename;
  arr[arr.length] = '">';
  disname = ie6SubStr(disname, 20, 16);
  arr[arr.length] = disname;
  arr[arr.length] = '</a>';
  // mv&弹幕mv
  var mvclass = checkMvIcon(obj);
  if (getTanMuIconStr(obj) && obj.is_point == '1') {
    var strTm = getTanMuIconStr(obj);
    arr[arr.length] = '<i class="m_score tm">' + strTm + '</i>';
  } else {
    arr[arr.length] = '<a hidefocus href="###" class="';
    arr[arr.length] = mvclass;
    arr[arr.length] = '" title="观看MV">MV</a>';
  }
  // NEW
  var newhtml = '';
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  arr[arr.length] = newhtml;
  arr[arr.length] = '</span>';
  arr[arr.length] = '</div>';
  // icons start
  arr[arr.length] = '<div data-rid="';
  arr[arr.length] = id;
  arr[arr.length] = '"class="icon">'; // icon-wrap-- end ...
  arr[arr.length] = '<a hidefocus href="###" class="m_add" title="添加歌曲" style="margin-left: 0"></a>';
  arr[arr.length] = '<a hidefocus href="###" class="m_down ';
  if (obj.isdownload == '1') {
    arr[arr.length] = 'notAllow';
    arr[arr.length] = '" title="应版权方要求暂不能下载">';
  } else {
    arr[arr.length] = '" title="下载歌曲">';
  }
  arr[arr.length] = getMoney(obj, 'down');
  arr[arr.length] = '</a><a hidefocus href="###" class="m_more" title="更多操作"></a></div>';
  // icons end

  // singer
  arr[arr.length] = '<div class="m_artist_box" style="width:22%"><span class="m_artist"><a onclick="';
  arr[arr.length] = commonClickString(new Node(4, artistid, checkSpecialChar(artist, 'name'), 4));
  arr[arr.length] = '" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(artist, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(artist, 'disname'), 8, 5);
  arr[arr.length] = '</a></span></div>';
  arr[arr.length] = ' </li> ';
  saveMusicInfo(obj, 'album', psrc);
  return arr.join('');
}
// 歌手歌曲列表(歌手区)
function createArtistMusicList(obj, index, rn, pn, psrc) {
  var arr = [];
  var xia = 0;
  var musicrid = obj.musicrid;
  var album = obj.album;
  var albumid = obj.albumid;
  var name = obj.name;
  var tips = getMusicTips(name, '', album);
  var score100 = parseInt(obj.score100) || 10;
  if (score100 > 100) {
    score100 = 100;
  }
  var isnew = obj['new'];
  var num = rn * pn + index + 1;
  if (num < 10) num = '0' + num;
  var copyright = obj.copyright || obj.COPYRIGHT; // 小地球标识字段
  var pay = getPayNum(obj); // 付费歌曲不显示小i
  arr[arr.length] = '<li class="music_wrap ';
  arr[arr.length] = getCopyrightClass(obj);
  arr[arr.length] = '" title="';
  arr[arr.length] = tips;
  arr[arr.length] = '" c-rid="';
  arr[arr.length] = musicrid;
  arr[arr.length] = '" data-index="' + index + '">';

  if (parseInt(copyright) == 1) {
    arr[arr.length] = '<div class="sourceTips" style="right:40px;"><div class="closebtn j_earthBtn"></div>';
    arr[arr.length] = '<p class="sourceTitle">' + name + '</p>';
    arr[arr.length] = '<p class="sourceUrl"></p>';
    arr[arr.length] = '<p class="sourceText">该资源来自第三方网站，酷我音乐未对其进行任何修改</p></div>';
  }

  arr[arr.length] = '<div class="m_l"><input type="checkbox" checked="true" class="m_ckb"><span class="num">';
  arr[arr.length] = num;
  arr[arr.length] = '</span></div>';

  arr[arr.length] = ' <div class="mr_box" style="overflow:hidden;"><div class="mr_box_r">';
  // EQ
  arr[arr.length] = '<div class="m_eq_box">';
  arr[arr.length] = '<i data-md="';
  arr[arr.length] = obj.formats;
  arr[arr.length] = '" title="选择试听音质" class="m_hd ';
  arr[arr.length] = getHqLevel(obj);
  arr[arr.length] = '"></i></div>';
  // HOT
  arr[arr.length] = '<div class="hot_progress_box">';
  arr[arr.length] = '<i class="m_score">';
  //    arr[arr.length] = getTanMuIconStr(obj);
  arr[arr.length] = '<span style="width:';
  arr[arr.length] = score100;
  arr[arr.length] = '%;"></span></i>';
  // 小地球位置
  var earthClass = '';
  if (parseInt(copyright) == 1) {
    earthClass = 'earth';
    arr[arr.length] = '<a title="该歌曲来自第三方网站" class="' + earthClass + '"></a>';
  } else if (pay == 0) {
    arr[arr.length] = '<a title="显示用户上传信息" class="kw_ugcInfoIcon j_ugcIcon"></a>';
  }
  arr[arr.length] = '</div></div>';
  // CONTENT
  arr[arr.length] = ' <div class="mr_center_con" style="overflow:hidden;zoom:1;">';
  // song name
  arr[arr.length] = '<div class="m_name_box" style="width: 60%;margin-right: 0">';
  arr[arr.length] = '<span class="m_name"><a data-rid="';
  arr[arr.length] = musicrid;
  arr[arr.length] = '" class="w_name" hidefocus href="###" title="';
  arr[arr.length] = checkSpecialChar(name, 'titlename');
  arr[arr.length] = '">';
  name = ie6SubStr(checkSpecialChar(name, 'disname'), 20, 16);

  //    arr[arr.length] = checkSpecialChar(name,"titlename");
  arr[arr.length] = name;
  arr[arr.length] = '</a>';
  // mv&弹幕MV
  if (!getTanMuIconStr(obj)) {
    arr[arr.length] = '<a hidefocus href="###" class="';
    var mvclass = checkMvIcon(obj);
    arr[arr.length] = mvclass;
    arr[arr.length] = '" title="观看MV"></a>';
  }
  if (getTanMuIconStr(obj) && obj.mkvrid > 0) {
    var strTm = getTanMuIconStr(obj);
    arr[arr.length] = '<i class="m_score tm">' + strTm + '</i>';
  }
  var newhtml = '';
  if (typeof (isnew) !== 'undefined' && isnew == 1) {
    newhtml = "<em class='musicnewimg'></em>";
  }
  arr[arr.length] = newhtml;
  arr[arr.length] = '</span>';
  arr[arr.length] = '</div>';
  // icons start
  arr[arr.length] = '<div data-rid="';
  arr[arr.length] = musicrid;
  arr[arr.length] = '"class="icon">'; // icon-wrap-- end ...
  arr[arr.length] = '<a hidefocus href="###" class="m_add" title="添加歌曲" style="margin-left: 0"></a>';
  arr[arr.length] = '<a hidefocus href="###" class="m_down ';
  if (obj.isdownload == '1') {
    arr[arr.length] = 'notAllow';
    arr[arr.length] = '" title="应版权方要求暂不能下载">';
  } else {
    arr[arr.length] = '" title="下载歌曲">';
  }
  arr[arr.length] = getMoney(obj, 'down');
  arr[arr.length] = '</a><a hidefocus href="###" class="m_more" title="更多操作"></a></div>';
  // icons end

  // 专辑
  arr[arr.length] = '<div class="m_album_box" style="width: 22%;"><span class="m_album"><a onclick="';
  arr[arr.length] = commonClickString(new Node(13, albumid, checkSpecialChar(album, 'name'), 13));
  arr[arr.length] = '" hidefocus href="###';
  // arr[arr.length] = 'content_artist.html?sourceid='+albumid+'&other=';
  arr[arr.length] = '" title="';
  arr[arr.length] = checkSpecialChar(album, 'titlename');
  arr[arr.length] = '">';
  arr[arr.length] = ie6SubStr(checkSpecialChar(album, 'disname'), 8, 5);
  arr[arr.length] = '</a></span></div>';
  arr[arr.length] = ' </li> ';
  saveMusicInfo(obj, 'artist', psrc);
  return arr.join('');
}
// 创建一个定宽2列歌曲列表
function createfixedMusicList(obj, from, index, psrc) {
  var html = [];
  var num = index + 1;
  var name = obj.name;
  var artist = obj.artist;
  var mvclass = '';
  var oStyle = '';
  var ispoint = obj.ispoint;
  var mviconstr = '';
  var namemax = 10;
  var artistmax = 4;
  if (name.length > namemax) {
    if (artist.length > artistmax) {
      name = name.substring(0, namemax) + '...';
      artist = artist.substring(0, artistmax - 1) + '...';
    } else {
      if (name.length - namemax > artistmax - artist.length) {
        name = name.substring(0, namemax + (artistmax - artist.length)) + '...';
        artist = artist;
      } else {
        name = name;
        artist = artist;
      }
    }
  } else {
    name = name;
    if (artist.length > artistmax) {
      if (artist.length - artistmax > namemax - name.length) {
        artist = artist.substring(0, artistmax + (namemax - name.length)) + '...';
      } else {
        artist = artist;
      }
    } else {
      artist = artist;
    }
  }
  if (num < 10) num = '0' + num;
  if (index < 3) oStyle = 'color:#fe5600;';
  html[html.length] = '<li><div class="icon" data-rid="';
  html[html.length] = obj.id;
  html[html.length] = '"><a hidefocus href="###" class="m_add" style="margin-left:8px;" title="添加歌曲"></a>';
  html[html.length] = '<a hidefocus href="###" style="margin-left:8px;" class="m_down ';
  if (obj.isdownload == '1') {
    html[html.length] = 'notAllow';
    html[html.length] = '" title="应版权方要求暂不能下载">';
  } else {
    html[html.length] = '" title="下载歌曲">';
  }
  html[html.length] = getMoney(obj, 'down');
  html[html.length] = '</a></div><div class="infoLeft"><span class="num" style="';
  html[html.length] = oStyle;
  html[html.length] = '">' + num + '</span>';

  var trend = obj.trend;
  var trendprefix = '';
  if (trend.length > 0) {
    trendprefix = trend.substring(0, 1);
  }
  // 榜单名次细化
  var trendClass = '';
  var arrowNum = obj.rank_change || '';
  var arrownewClass = 'arrowNum';
  var arrowTips = arrowNum;
  var isNew = obj.isnew;
  if (isNew && isNew != '0') {
    trendClass = 'arrownew';
    arrownewClass = '';
    arrowNum = '';
    arrowTips = '新上榜';
  } else {
    if (trendprefix == 'u') {
      trendClass = 'arrowup';
      arrowTips = arrowTips.indexOf('%') > -1 ? '上升' + arrowTips : '上升' + arrowTips + '位';
    } else if (trendprefix == 'd') {
      trendClass = 'arrowdown';
      arrowTips = arrowTips.indexOf('%') > -1 ? '下降' + arrowTips : '下降' + arrowTips + '位';
    } else {
      trendClass = 'arrowping';
      arrownewClass = '';
      arrowNum = '';
      arrowTips = '持平';
    }
  }
  html[html.length] = '<span title="';
  html[html.length] = arrowTips;
  html[html.length] = '" class="';
  html[html.length] = trendClass;
  html[html.length] = '"></span><span title="';
  html[html.length] = arrowTips;
  html[html.length] = '" class="';
  html[html.length] = arrownewClass;
  html[html.length] = '">';
  html[html.length] = arrowNum;
  html[html.length] = '</span></div><div class="infoBox"><a data-rid="';
  html[html.length] = obj.id;
  html[html.length] = '" hidefocus href="###" class="w_name" title="';
  html[html.length] = checkSpecialChar(obj.name, 'titlename');
  html[html.length] = '">';
  html[html.length] = checkSpecialChar(name, 'disname');
  html[html.length] = '</a> - <a onclick="';
  html[html.length] = commonClickString(new Node(4, obj.artistid, checkSpecialChar(artist, 'name'), 4));
  html[html.length] = '" hidefocus href="###" class="artist" title="';
  html[html.length] = checkSpecialChar(obj.artist, 'titlename');
  html[html.length] = '">';
  html[html.length] = ie6SubStr(checkSpecialChar(artist, 'disname'), 8, 5);
  html[html.length] = '</a>';
  if (ispoint == '1') {
    var strTm = getTanMuIconStr(obj);
    html[html.length] = '<i class="m_score tm">' + strTm + '</i>';
  } else {
    mvclass = checkMvIcon(obj);
    html[html.length] = '<a hidefocus="" href="###" class="' + mvclass + '" style="" title="观看MV"></a>';
  }
  html[html.length] = '</div></li>';
  saveMusicInfo(obj, 'bang', psrc);
  return html.join('');
}

// 创建酷我亚洲榜的歌曲列表
function createfixedAsiaMusicList(obj, from, index, psrc) {
  var html = [];
  var num = index + 1;
  var name = obj.name;
  var artist = obj.artist;
  var score = obj.score;
  var mvclass = '';
  var oStyle = '';
  var colorClass = '';
  var modalTitle = obj.name + '--' + obj.artist;

  if (num < 10) {
    num = '0' + num;
  }
  var oStyle = 'width:16px;height:24px;';
  var tipClass = '';
  if (index < 3) {
    tipClass = 'icon-' + index;
  }
  html[html.length] = '<li><div class="icon" data-rid="';
  html[html.length] = obj.id;
  html[html.length] = '"><a hidefocus href="###" class="m_hit  js-hit" style="margin-left:8px;" title="为它打榜" data-artist="' + artist + '" data-name="' + name + '" data-title="' + modalTitle + '">打榜</a><a hidefocus href="###" class="m_share js-share" style="margin-left:10px;" title="分享打榜">';
  html[html.length] = '分享';
  html[html.length] = '</a></div><div class="infoLeft" style="width:24px"><span class="num ' + tipClass + '"  style="';
  html[html.length] = oStyle;
  html[html.length] = '">' + num + '</span>';
  var trend = obj.trend;
  var trendprefix = '';
  if (trend.length > 0) {
    trendprefix = trend.substring(0, 1);
  }
  // 榜单名次细化
  var trendClass = '';
  var arrowNum = obj.rank_change || '';
  var arrownewClass = 'arrowNum';
  var arrowTips = arrowNum;
  var isNew = obj.isnew;
  if (isNew && isNew != '0') {
    trendClass = 'arrownew';
    arrownewClass = '';
    arrowNum = '';
    arrowTips = '新上榜';
    colorClass = 's-red';
  } else {
    if (trendprefix == 'u') {
      trendClass = 'arrowup';
      arrowTips = arrowTips.indexOf('%') > -1 ? '上升' + arrowTips : '上升' + arrowTips + '位';
      colorClass = 's-red';
    } else if (trendprefix == 'd') {
      trendClass = 'arrowdown';
      arrowTips = arrowTips.indexOf('%') > -1 ? '下降' + arrowTips : '下降' + arrowTips + '位';
      colorClass = 's-blue';
    } else {
      trendClass = 'arrowping';
      arrownewClass = '';
      arrowNum = '';
      arrowTips = '持平';
      colorClass = 's-green';
    }
  }
  html[html.length] = '</div><span class="m_name"><a data-rid="';
  html[html.length] = obj.id;
  html[html.length] = '" hidefocus href="###" class="w_name" title="';
  html[html.length] = checkSpecialChar(obj.name, 'titlename');
  html[html.length] = '">';
  html[html.length] = ie6SubStr(checkSpecialChar(name, 'disname'), 20, 16);
  html[html.length] = '</a>';
  var ispoint = obj.ispoint;
  var mviconstr = '';
  if (ispoint == '1') {
    var strTm = getTanMuIconStr(obj);
    html[html.length] = '<i class="m_score tm">' + strTm + '</i>';
  } else {
    mvclass = checkMvIcon(obj);
    html[html.length] = '<a hidefocus="" href="###" class="' + mvclass + '" style="" title="观看MV"></a>';
  }
  html[html.length] = '</span><span class="m_artist"><a onclick="';
  html[html.length] = commonClickString(new Node(4, obj.artistid, checkSpecialChar(artist, 'name'), 4));
  html[html.length] = '" hidefocus href="###" class="artist" title="';
  html[html.length] = checkSpecialChar(obj.artist, 'titlename');
  html[html.length] = '">';
  html[html.length] = checkSpecialChar(artist, 'disname');
  html[html.length] = '</a></span>';
  html[html.length] = '<span class="m_info">';
  html[html.length] = '<span style="margin:9px 9px 0 0"';
  html[html.length] = 'class="';
  html[html.length] = trendClass;
  html[html.length] = '"></span>';
  html[html.length] = '<span';
  html[html.length] = ' class="';
  html[html.length] = colorClass;
  html[html.length] = '">';
  html[html.length] = score;
  html[html.length] = '<i>分</i>';
  html[html.length] = '</span>';
  html[html.length] = '</span>';
  html[html.length] = '</li>';
  saveMusicInfo(obj, 'bang', psrc);
  return html.join('');
}

// 创建分页
function createPage(total, currentPg) {
  var pageHtml = '';
  if (total > 1) {
    if (currentPg != 1) {
      pageHtml += '<a hidefocus href="###" class="next">上一页</a>';
    } else {
      pageHtml += '<a hidefocus href="###" class="nonext">上一页</a>';
    }
    pageHtml += '<a hidefocus  href="###" ' + (currentPg == 1 ? 'class="current"' : 'class=""') + '>1</a>';
    if (currentPg > 4) pageHtml += '<span class="point">...</span>';

    for (var i = (currentPg >= 4 ? (currentPg - 2) : 2); i <= (currentPg + 2 >= total ? (total - 1) : (currentPg + 2)); i++) {
      if (currentPg == i) {
        pageHtml += '<a hidefocus href="###" class="current">' + i + '</a>';
      } else {
        pageHtml += '<a hidefocus href="###" class="">' + i + '</a>';
      }
    }
    if (currentPg + 3 < total) pageHtml += '<span class="point">...</span>';
    if (total != 1) pageHtml += '<a hidefocus href="###" ' + (currentPg == total ? 'class="current"' : 'class=""') + '>' + total + '</a>';
    if (currentPg != total) {
      pageHtml += '<a hidefocus href="###" class="prev">下一页</a>';
    } else {
      pageHtml += '<a hidefocus href="###" class="noprev">下一页</a>';
    }
  } else {
    pageHtml = '';
  }
  return pageHtml;
}

/** 创建专区相关 by deng
 * list json数据
 * modelType 模块样式 --> mvsquare矩形
 * digest 模块类型
 * admIconShow 是否显示专辑图标
 */
function createAreaBlock(list, modelType, digest, areaName, csrc, admIconShow) {
  var html = [];
  var other = '';
  var click = '';
  var psrc = '';
  var ipsrc = '';
  var obj = list;
  var name = checkSpecialChar(obj.name, 'name');
  var disname = checkSpecialChar(obj.disname, 'disname') || checkSpecialChar(name, 'disname');
  var titlename = checkSpecialChar(disname, 'titlename');
  var pic = obj.img;
  var source = digest;
  var sourceId = obj.id;
  var extend = obj.extend || '';
  var modelType = modelType == 'mvsquare' ? 'fmv' : 'b';
  var defaultImg = modelType == 'fmv' ? mv_default_img : default_img;
  var errorSize = modelType == 'fmv' ? 140 : 120;
  psrc = '分类->' + areaName + '->';
  other = '|psrc=' + psrc + '|bread=-2,5,分类,-2|';
  csrc = csrc.replace(/\|/g, '&') + '->' + name.replace(/(^\s+)|(\s+$)/g, '');
  if (source != 4 && source != 13) {
    other += '|csrc=' + csrc.replace(/'/g, '-') + '|';
  }
  if (csrc.indexOf('最潮视频') > -1) other = '|psrc=' + psrc + '|bread=-2,5,分类,-2|csrc=曲库->MV->MV分类->歌单' + '->' + name + '|';
  ipsrc = psrc + disname;
  if (source == '8') ipsrc += '-<PID_' + sourceId + ';SEC_-1;POS_-1;DIGEST_8>';
  click = source == '5' ? commonClickString(new Node(source, sourceId, name, source, extend, other, 'area')) : commonClickString(new Node(source, sourceId, name, source, extend, other));
  if (!pic) {
    pic = defaultImg;
  } else {
    pic = changeImgDomain(pic);
  }
  html[html.length] = '<li class="';
  html[html.length] = modelType;
  html[html.length] = '_wrap"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" class="';
  html[html.length] = modelType;
  html[html.length] = '_pic ';
  // if(source=="13")html[html.length] = 'album';
  html[html.length] = '" href="###" hidefocus>';
  if (source == '13' && admIconShow) html[html.length] = '<span class="l_adm"></span>';
  html[html.length] = '<span class="';
  html[html.length] = modelType;
  html[html.length] = '_shade">';
  if (source == '4' || source == '8' || source == '13' || source == '14') html[html.length] = '<i data-csrc="' + csrc + '" onclick="iPlay(arguments[0],' + source + ',' + sourceId + ',this);return false;" data-ipsrc="' + ipsrc + '" title="直接播放" class="i_play"></i>';
  html[html.length] = '</span><div class="cover"><img src="';
  html[html.length] = defaultImg;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,';
  html[html.length] = errorSize;
  html[html.length] = ');" data-original="';
  html[html.length] = pic;
  html[html.length] = '" /></div>';
  // if(source=="13")html[html.length] = '<span class="cdshadow"></span>';
  html[html.length] = '</a><p class="';
  html[html.length] = modelType;
  html[html.length] = '_name"><a onclick="';
  html[html.length] = click;
  html[html.length] = '" title="';
  html[html.length] = titlename;
  html[html.length] = '" href="###" hidefocus>';
  html[html.length] = disname;
  html[html.length] = '</a></p></li>';
  return html.join('');
}
// 创建专区4s tag
function createAreaChooseTag(jsondata) {
  var tagStrArr = [];
  var other = '';
  var psrc = '';
  var data = jsondata;
  var len = data.length;
  for (var i = 0; i < len; i++) {
    var item = data[i];
    var digest = item.digest;
    var id = item.id;
    var extend = item.extend || '';
    psrc = '分类->' + item.name + '->';
    other = '|psrc=' + psrc + '|bread=-2,5,分类,-2';
    var img = item.img;
    var name = item.name;
    var click = commonClickString(new Node(digest, id, name, id, extend, other, 'area'));
    tagStrArr[tagStrArr.length] = '<li class="column"><a href="###" onclick="';
    tagStrArr[tagStrArr.length] = click;
    tagStrArr[tagStrArr.length] = '"><img src="';
    tagStrArr[tagStrArr.length] = img;
    tagStrArr[tagStrArr.length] = '" /><span>';
    tagStrArr[tagStrArr.length] = name;
    tagStrArr[tagStrArr.length] = '</span></a></li>';
  }
  return '<div class="chooseTag"><ul>' + tagStrArr.join('') + '</ul></div>';
}

// 秀场真人mv
function createKwShowBlock(obj) {
  var roomid = obj.roomId;
  var ownerid = obj.userId;
  var pic = obj.imgPath || mv_default_img;
  var nickName = decodeURIComponent(obj.nickName);
  var roomJumpUrl = 'https://jx.kuwo.cn/' + roomid;
  var ownerJumpUrl = 'https://jx.kuwo.cn/cterm/ssr/profile/pc/views/ssrindex.html?page=userinfo&userId=' + ownerid;
  var html = [];
  html[html.length] = '<li class="bmv_wrap" data-rid="' + roomid + '">';
  html[html.length] = '<a title="';
  html[html.length] = nickName;
  html[html.length] = '" class="bmv_pic" href="';
  html[html.length] = roomJumpUrl;
  html[html.length] = '" target="_blank"><span class="bmv_shade"></span><i title="直接播放" class="i_play i_play_big"></i><img width="100%" src="';
  html[html.length] = mv_default_img;
  html[html.length] = '" class="lazy" onerror="imgOnError(this,140);" data-original="';
  html[html.length] = pic;
  html[html.length] = '" /></a><p class="bmv_name"><span class="name"><a title="';
  html[html.length] = nickName;
  html[html.length] = '" href="'
  html[html.length] = ownerJumpUrl;
  html[html.length] = '" target="_blank">'
  html[html.length] = nickName;
  html[html.length] = '</a></span></p>';
  html[html.length] = '</li>';
  return html.join('');
}
// 创建方法结束--------------------
