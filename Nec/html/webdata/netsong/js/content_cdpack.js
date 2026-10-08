var oldmsg = '';
var cdId = '';

var ADD_ALBUM_TO_COLL = 'http://cdapi.kuwo.cn/collection/add';
var ALBUM_DETAIL = 'http://cdapi.kuwo.cn/album/detail';
var ALBUM_ALL_SCORE = 'http://cdapi.kuwo.cn/score/albumscore';
var ALBUM_GET_SCORE = 'http://cdapi.kuwo.cn/score/getscore';
var ALBUM_CREATE_SCORE = 'http://cdapi.kuwo.cn/score/create';
var ALBUM_DEL_SCORE = 'http://cdapi.kuwo.cn/score/del';
var ALBUM_BE_EXIST = 'http://cdapi.kuwo.cn/collection/exist';
var DEL_USER_COLL_CD = 'http://cdapi.kuwo.cn/collection/del';

$(function () {
  callClientNoReturn('domComplete');
  var url = decodeURIComponent(window.location.href);
  var msg = getUrlMsg(url);
  oldmsg = msg;
  // centerLoadingStart("content");
  var id = url2data(msg, 'id');
  cdId = id;
  $('.download,.share').attr('data-id', id);
  callCreateCDContentFn(id);
  objBind();
  $kw_scoreModel.init();
  if (getDataByConfig('hificolDown', 'jumpDownTips') == 1) {
    $('.jumpDown label').show();
  }
  if (getDataByConfig('hificolDown', 'jumpLikeTips') == 1) {
    $('.jumpLike label').show();
  }
  setSkin(setSkinCallback);
});

function setSkinCallback() {
  var skinColor = skinConfig.skinColor;
  var skinLinkColor = skinConfig.linkColor;
  $('.logo_icon i').css('-webkit-filter', `drop-shadow(${skinColor} 69px 0)`);
  $('.nav a i,.download,.downing,.downed,.controlBox .active i,.likePopBtn').css('background', skinColor);
  $('.cancel,.hifi-text-box').addClass(skinConfig.type);
  $('.ok.btn-sp').css('background', skinColor);
  $('.popup-style input:checked+label').css({'background': skinColor, 'border-color': skinColor});
  commentModelSkinClor('content_cdpack');
}

// 创建cd包内容
function callCreateCDContentFn(id) {
  var url = ALBUM_DETAIL;
  $.ajax({
    url: url,
    dataType: 'text',
    type: 'post',
    crossDomain: false,
    data: {
      'id': id
    },
    success: function (str) {
      var jsondata = eval('(' + str + ')');
      if (jsondata.status == 0 && jsondata.msg == 'ok') {
        var data = jsondata.data;
        setPageHeadInfo(data);//头部信息
        var songData = data.song;
        for (var i = 0; i < songData.length; i++) {
          songData[i] = {'num': i + 1, 'dataarr': songData[i]};
        }
        createCDMusicList(songData);
        getCDStatusById(id);
        SetAlbumCollectedStateByAlbumId(id);
        init_comment_model('.cd_commentBox', 'cd', id);
        var textObj = $('.musiclist p.c_quality');
        textObj.html('');
        if (data.media_type == "母带") {
          $(".cdIcon").show();
          textObj.html('母带');
        } else if (data.media_type == "CD") {
          $(".c_quality").addClass("CD");
          textObj.html('CD');
        } else {
          $(".c_quality").addClass("flac");
        }
        // centerLoadingEnd("content");
        return;
      }
      if (jsondata.status == 'query error') {
        loadErrorPage();
      }
    },
    error: function () {
      loadErrorPage();
    }
  });
}

// 设置头部信息
function setPageHeadInfo(data) {
  var cdName = checkSpecialChar(data.alname, 'disname');
  cdName = cdName.replace(/\^/g, '&amp;');
  var artistname = checkSpecialChar(data.artists, 'disname');
  artistname = artistname.replace(/\^/g, '&amp;');
  var artistId = data.artist_list[0].id;
  var time = data.publish_time;
  var sampling_type = data.sampling_type;
  var size = getSize(data.size);
  var downTimes = data.down_no;
  if (downTimes > 100000) {
    downTimes = parseFloat(downTimes / 10000).toFixed(1) + 'W';
  }
  var uploaderName = data.uploader_name;
  // var downloadNum = data.down_no || 0;
  var pics = data.imgs;
  var piclen = pics.length || 0;
  var pic = 'img/cdpack/second/default.png';
  if (piclen == 1 || piclen > 1) {
    pic = pics[0];
    pic = pic.replace(/.jpg/, '_150.jpg');
  }
  var pay_price = parseInt(data.pay_price);
  $('.headInfoBox .cdHeadPic').attr('src', pic);
  $('.headInfoBox .cdName').html(cdName).attr('title', cdName);
  $('.btnBox').append('<a href="javascript:;" class="shareBtn"><i class="icon iconfont icon-share"></i><span>分享</span></a>');
  $('.headInfoBox .artist span').html(artistname).addClass('skinLink').attr('title', artistname).click(function() {
    commonClick({ 'source': '9009', 'sourceid': artistId, 'name': artistname, 'id': artistId });
  });
  $('.headInfoBox .time span').html(time);
  $('.headInfoBox .sampling_type span').html(sampling_type);
  $('.headInfoBox .size span').html(size);
  $('.headInfoBox .downTimes span').html(downTimes);
  if (pay_price == '0') {
    $('.uploaders span').html(uploaderName);
    $('.uploaders').show();
    $('.uploadBtn').show();
  } else {
    $('.uploaders').hide();
    $('.uploadBtn').hide();
  }
  // $('.headInfoBox .downloadCount span').html(downloadNum);

  var cdInfoStr = data.intro;
  if (cdInfoStr) {
    $('.detailsBox .cdInfo').html(cdInfoStr);
    var h = $('.detailsBox .cdInfo').height();
    if (h < 74 || h == 78) {
      $('.titleBox .openBtn').hide();
    }
  } else {
    $('.detailsBox').hide();
  }
  var tags = data.tags;
  var tagArr = [];
  var wordNum = 0;
  tags.map(function (val, index, arr) {
    if (index < 3) {
      var tag_name = val.tag_name;
      wordNum += tag_name.length;
      tagArr.push(tag_name);
      if (wordNum > 8) {
        tagArr.pop();
      }
    }
  });
  $(".style").html(tagArr.join("/"));
  // 下载外链
  if (callClient("GetDownlink").indexOf("ch:13") > -1) {
    $(".download").click();
  }
}

// 大小格式化
function getSize(size) {
  if (size >= 1099511627776) {
    size = (size / 1099511627776).toFixed(1) + 'T';
  } else if (size >= 1073741824 && size < 1099511627776) {
    size = (size / 1073741824).toFixed(1) + 'G';
  } else if (size >= 1048576 && size < 1073741824) {
    size = Math.round(size / 1048576) + 'MB';
  } else if (size >= 1024 && size < 1048576) {
    size = Math.round(size / 1024) + 'KB';
  } else {
    size += 'B';
  }
  return size;
}

// 处理type的函数
function handleBasicInfoTypeData(arr) {
  var tempArr = [];
  for (var i = 0; i < arr.length; i++) {
    tempArr.push(arr[i]['tag_name']);
  }
  return tempArr.join('/');
}

// 创建曲目列表
function createCDMusicList(data) {
  if (data.length == 1) {
    data[0]['disc_is_hide'] = 1;
  }

  var model = loadTemplate('#kw_cdpack_musicListModel');
  var html = drawListTemplate(data, model, proMusicListBoxData);
  $('.musicListBox').html(html);
}

function proMusicListBoxData(obj) {
  var json = {};
  var num = obj.num;
  var listclass = '';
  if (num % 2 == 1) {
    listclass = 'leftList';
  } else {
    listclass = 'rightList';
  }
  var h4class = '';
  if (obj.disc_is_hide) {
    h4class = 'h4hide';
  }
  var cdnum = 'DISC.' + num;
  var listData = obj.dataarr;
  var musiclist = createCDMusic(listData);

  json = {
    'listclass': listclass,
    'h4class': h4class,
    'cdnum': cdnum,
    'musiclist': musiclist
  };
  return json;
}

function createCDMusic(data) {
  var model = loadTemplate('#kw_cdpack_musicModel');
  var html = drawListTemplate(data, model, proMusicListData);
  return html;
}

function proMusicListData(obj) {
  var json = {};
  var num = obj.sort;
  var long = obj.duration;
  long = '' + toDou(parseInt(long / 60)) + ':' + toDou(long % 60);
  var name = checkSpecialChar(obj.sname, 'disname');
  var artist = checkSpecialChar(obj.artist_name, 'disname');
  name = name.replace(/\^/g, '&');
  if (num < 10) num = "0" + num;
  json = {
    'num': num,
    'long': long,
    'name': name,
    'artist': artist
  };
  return json;
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

    for (var i = (currentPg >= 4 ? (currentPg - 2) : 2); i <= (currentPg + 2 >= total ? (total - 1) : (currentPg + 2)); i++) {
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

function objBind() {
  $('.download').live('click', function (ev) {
    var islogin = parseInt(UserIsLogin());
    if (!islogin) {
      callClientNoReturn("UserLogin?src=login");
      ev.stopPropagation();
      return;
    }
    var id = $(this).attr('data-id');
    // 下载外链
    callClientNoReturn('CDDown?id=' + id);
  });

  $('.downing').live('click', function() {
    toast('0', '该专辑已在下载列表中!');
  });

  $('.downed').live('click', function() {
    toast('0', '该专辑已下载完成!');
  });

  $('.share').live('click', function () {
    var id = $(this).attr('data-id');
    var data = encodeURIComponent('&type=cdpackage&position=cdpackage');
    callClientNoReturn("ShowShareWnd?rid=" + id + "&data=" + data);
  });

  $('.uploadBtn').live('click', function () {
    var uid = getUserID("uid");
    if (uid == 0) {//登录
      callClientNoReturn("UserLogin?src=login");
      return;
    }
    callClientNoReturn('CoolBeanPackage?NavUrl=http://www.kuwo.cn/pc/ugc/uploadAlbumPage');
  });

  $('.titleBox .openBtn').live('click', function () {
    if ($('.detailsBox p').hasClass('open')) {
      $(this).find('p').html('展开');
      $('.detailsBox p.cdInfo').removeClass('open');
    } else {
      $(this).find('p').html('收起');
      $('.detailsBox p.cdInfo').addClass('open');
    }
  });
  $(".shareBtn").live("click", function () {
    var strParam = encodeURIComponent('&type=cdpackage&position=cdpackage');
    var call = 'ShowShareWnd?rid=' + cdId + '&data=' + strParam;
    callClientNoReturn(call);
  });
  $(window).resize(function () {
    var h = $('.detailsBox .cdInfo').height();
    if (h < 74 || h == 78) {
      $('.titleBox .openBtn').hide();
    } else {
      $('.titleBox .openBtn').show();
    }
  });
  // 关闭收藏弹层
  $(".closeLikePopBtn").live("click", function () {
    $(".likePop").hide();
  });
  // 打开收藏弹层
  $(".likeBtn").live("click", function (ev) {

    var islogin = parseInt(UserIsLogin());
    if (!islogin) {
      callClientNoReturn("UserLogin?src=login");
      ev.stopPropagation();
      return;
    }

    if ($(this).hasClass('liked')) {

      var uid = getUserID("uid");
      if (uid == 0) {
        callClientNoReturn("UserLogin?src=login");
      } else {
        var sid = getUserID('sid');

        CDCollOper(uid, sid, cdId, 'remove');
      }
      return;
    }

    $(".likePop").show();
  });
  // 收藏按钮
  $(".likePopBtn").live("click", function () {
    var uid = getUserID("uid");
    if (uid == 0) {
      callClientNoReturn("UserLogin?src=login");
    } else {
      var sid = getUserID('sid');
      CDCollOper(uid, sid, cdId, 'add');
    }
  });

  $(".jumpDown").live("click", function () {
    $(".jumpDown label").hide();
    setDataToConfig('hificolDown', 'jumpDownTips', '0');
    commonClick({'source': '9003', 'name': 'cdDownPage'});
  });
  $(".jumpLike").live("click", function () {
    $(".jumpLike label").hide();
    setDataToConfig("hificolDown", "jumpLikeTips", "0");
    commonClick({'source': '9005', 'name': 'cdLikePage'});
  });

  $(".controlBox a").live("click", function () {
    var index = $(this).index();
    $('.controlBox a').removeClass('active');
    $('.controlBox a i').css("background", '');
    $(this).addClass('active');
    $(".controlBox .active i").css("background", skinConfig.skinColor);
    $(".conItem").hide().eq(index).show();
  });
}

function RemoveAlbumFromColl(uid, sid, alid) {

  if (uid == '' || uid == null) {
    return;
  }

  if (sid == '' || sid == null) {
    return;
  }

  if (alid == '' || alid == null) {
    return;
  }

  var url = DEL_USER_COLL_CD + '?uid=' + uid + '&sid=' + sid + '&aid=' + alid;

  $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    success: function (json) {
      if (json.msg == 'ok' && parseInt(json.status) == 0) {

        var call = 'PageCollOper?id=' + alid + '&oper=remove' + '&channel=hificollect';
        callClientNoReturn(call);
        SetLikedBtnState('remove');
        toast('0', '取消成功 !');
      }
    },
    error: function () {
      console.log(' Error ### url:' + url);
      return;
    }
  });
}

function CDCollOper(uid, sid, alid, operType) {

  if (operType == 'add') {
    AddAlbumToColl(uid, sid, alid);
  } else if (operType == 'remove') {
    RemoveAlbumFromColl(uid, sid, alid);
  }
}


function AddAlbumToColl(uid, sid, alid) {
  if (uid == '' || uid == null) {
    return;
  }

  if (sid == '' || sid == null) {
    return;
  }

  if (alid == '' || alid == null) {
    return;
  }

  var url = ADD_ALBUM_TO_COLL + '?sid=' + sid + '&uid=' + uid + '&aid=' + alid;
  $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    success: function (json) {
      var msg = json.msg;
      var status = parseInt(json.status);
      if (msg == 'ok' && status == 0) {
        var call = 'PageCollOper?id=' + alid + '&oper=add' + '&channel=hificollect';
        callClientNoReturn(call);
        SetLikedBtnState('add');
        $(".jumpLike label").show();
        setDataToConfig("hificolDown", "jumpLikeTips", "1");
        toast('0', '收藏成功 !');
      }
    },
    error: function (reqObj, textStatus, errThrown) {
      console.log('Err:' + textStatus);
      console.dir(errThrown);
      console.log(' ### Err url:' + url);
    }

  });

  $(".likePop").hide();
}

function CDCollSynOper(strParam) {

  if (strParam == '' || strParam == null) {
    return;
  }

  var type = getValue(strParam, 'oper');
  SetLikedBtnState(type);
}

function getCDStatusById(id) {
  var call = 'GetDownloadCDInfo?id=' + id + '&needsongs=0';
  var msg = callClient(call);
  if (msg != '') {
    var json = eval('(' + msg + ')')[0];
    var type = json.downstate;
    switch (type) {
      case 'downed':
        setDownLoadBtnStyle('downed');
        break;
      case 'waitting':
      case 'fail':
        setDownLoadBtnStyle('downing');
        break;
      case 'pause':
      case 'downing':
        setDownLoadBtnStyle('downing');
        break;
    }
  }
}

function setDownLoadBtnStyle(type) {
  switch (type) {
    case 'downing':
      $('.btnBox a').eq(0).html('下载中').addClass('downing').removeClass('download downed');
      break;
    case 'downed':
      $('.btnBox a').eq(0).html('已下载').addClass('downed').removeClass('download downing');
      break;
    case 'downrd':
      $('.btnBox a').eq(0).html('<i class="icon iconfont icon-download"></i>下载').removeClass('downing').addClass('download');
      break;
    case 'download':
      $('.btnBox a').eq(0).html('<i class="icon iconfont icon-download"></i>下载').removeClass('downing downed').addClass('download');
      break;
  }
}

//设置收藏按钮的状态
//strType:
//add:表示要设置成已收藏状态
//remove:表示要设置成未收藏状态
function SetLikedBtnState(strType) {

  if (strType == 'add') {
    $(".likeBtn").addClass('liked');
    $(".likeBtn").html('<i class="icon iconfont icon-collection"></i><span>已收藏</span>');
  } else if (strType == 'remove') {
    $(".likeBtn").removeClass('liked');
    $(".likeBtn").html('<i class="icon iconfont icon-notcollection"></i><span>收藏</span>');
  }
}

function SetAlbumCollectedStateByAlbumId(alid) {

  if (alid == '' || alid == null) {
    return;
  }

  var islogin = parseInt(UserIsLogin());
  if (!islogin) {
    return;
  }

  var uid = getUserID("uid");
  var sid = getUserID("sid");
  var urlExist = ALBUM_BE_EXIST + '?uid=' + uid + '&sid=' + sid + '&aid=' + alid;
  $.ajax({
    url: urlExist,
    type: "POST",
    dataType: "json",
    success: function (dataJson) {
      if (dataJson.status != 0) {
        return;
      }

      var bSel = parseInt(dataJson.data[0].status);
      if (bSel) {
        SetLikedBtnState('add');
      } else {
        SetLikedBtnState('remove');
      }
    },
    error: function (reqObj, textStatus, errThrown) {
      console.log("ErrInfo:" + textStatus);
    }
  });
}


function CDStatusNotify(str) {
  console.log(str);
  var msgArr = str.split('&');
  var msgtype = msgArr[0].split('=')[1];

  var bflag = false;
  var id;
  if (msgtype == 'cddel' || msgtype == 'cdpause' || msgtype == 'cdwaiting' || msgtype == 'cdstart' || msgtype == 'cdrestart') {
    id = getValue(str, 'ids');
    var idarr = id.split(',');
    for (var nindex = 0; nindex < idarr.length; nindex++) {
      var locid = idarr[nindex];
      if (locid == cdId) {
        bflag = true;
        break;
      }
    }
  } else {
    id = getValue(str, 'id');
    if (id != cdId) {
      return;
    }
    bflag = true;
  }

  if (!bflag) {
    return;
  }
  switch (msgtype) {
    case 'cdinsert':
      setDownLoadBtnStyle('downing');
      $(".jumpDown label").show();
      setDataToConfig('hificolDown', 'jumpDownTips', '1');
      break;
    case 'cdfinish':
      setDownLoadBtnStyle('downed');
      $(".jumpDown label").show();
      setDataToConfig('hificolDown', 'jumpDownTips', '1');
      break;
    case 'cdfail':
      setDownLoadBtnStyle('downrd');
      break;
    case  'cddel':
      setDownLoadBtnStyle('download');
      break;
  }
}

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

}

// 评分begin
;(function ($, window, document, undefined) {
  var kw_score = {};//评分对象
  kw_score.uid = getUserID("uid");
  kw_score.sid = getUserID("sid");
  kw_score.init = function () {
    kw_score.getScoreAndStatus();
    getAllScore();
    scoreBind();
  }

  // 获取总评分
  function getAllScore() {
    $.ajax({
      url: ALBUM_ALL_SCORE,
      type: "get",
      data: {
        "aid": cdId
      },
      dataType: "text",
      success: function (data) {
        var jsondata = eval("(" + data + ")");
        if (jsondata.status == 0) {
          var obj = jsondata.data;
          var avg_score = obj.avg_score || 0;
          var num = obj.num || 0;
          if (num > 0 && avg_score > 0) {
            var index = avg_score / 2 - 1;
            $(".cdScore .score").html(avg_score + "分");
            $(".perNum").html("已被评价：" + num + "次");
            $(".cdScore .starBox .star").removeClass("half");
            for (var i = 0; i <= index; i++) {
              $(".cdScore .starBox .star").eq(i).addClass("full");
            }
            if (index.toString().indexOf(".") > -1) {
              $(".cdScore .starBox .star").eq(index + 1).addClass("half");
            }
          } else {
            $(".cdScore .score").html("0分");
            $(".perNum").html("少于10次");
            $(".cdScore .starBox .star").removeClass("full half");
          }
        }
      }
    });
  }

  // 获取个人评分及状态
  kw_score.getScoreAndStatus = function () {
    if (kw_score.uid == 0) {
      kw_score.removeStarFull("clickFull");
      return;
    }
    $.ajax({
      url: ALBUM_GET_SCORE,
      type: "get",
      data: {
        "sid": kw_score.sid,
        "uid": kw_score.uid,
        "aid": cdId
      },
      dataType: "text",
      success: function (data) {
        var jsondata = eval("(" + data + ")");
        if (jsondata.status == 0) {
          var obj = jsondata.data;
          var score = obj.score || 0;
          if (score > 0) {
            var index = obj.score / 2 - 1;
            setStarFull(index, "clickFull", undefined, true);
            $('.myScore p, .myScore a').show();
            setScored = true;
          } else {
            $('.myScore p, .myScore a').hide();
          }
        } else {
          kw_score.removeStarFull("clickFull");
        }
      }
    });
  }

  // 设置评分星星类名
  function setStarFull(index, className, obj, saveScoreName) {
    var scoreText = "";
    switch (index + 1) {
      case 1:
        scoreText = "很差";
        score = 2;
        break;
      case 2:
        scoreText = "较差";
        break;
      case 3:
        scoreText = "还行";
        break;
      case 4:
        scoreText = "推荐";
        break;
      case 5:
        scoreText = "力推";
        break;
    }
    $(".myScore p span").html(scoreText).attr("data-score", (index + 1) * 2);
    if (obj) {
      for (var j = 0; j < obj.length; j++) {
        var $star = obj.eq(j).find(".star");
        for (var i = 0; i <= index; i++) {
          $star.eq(i).addClass(className);
        }
      }
    } else {
      for (var j = 0; j < $(".myScore").length; j++) {
        for (var i = 0; i <= index; i++) {
          $(".myScore").eq(j).find(".star").eq(i).addClass(className);
        }
      }
    }
    if (saveScoreName) {
      $(".myScore").attr("data-scoreName", scoreText)
    }
  }

  // 移除评分星星类名
  kw_score.removeStarFull = function (name) {
    $(".myScore .starBox .star").removeClass(name);
  }
  var setScored = false;

  function scoreBind() {
    var delScored = false;
    // 评分
    $(".myScore .starBox .star").live('click', function () {
      if (kw_score.uid == 0) {
        callClientNoReturn('UserLogin?src=login');
        return;
      }
      var index = $(this).index();
      var score = $(".myScore p span").attr("data-score");
      $.ajax({
        url: ALBUM_CREATE_SCORE,
        type: "get",
        data: {
          "sid": kw_score.sid,
          "uid": kw_score.uid,
          "aid": cdId,
          "score": score
        },
        dataType: "text",
        success: function (data) {
          var jsondata = eval("(" + data + ")");
          if (jsondata.status == 0) {
            getAllScore();
            kw_score.removeStarFull("clickFull");
            setStarFull(index, "clickFull", undefined, true);
            delScored = false;
            setScored = true;
            $(".myScore a").show();
          } else {
            kw_score.removeStarFull("clickFull");
          }
        }
      });
    });
    // 删除评分
    $(".myScore a").live("click", function () {
      $.ajax({
        url: ALBUM_DEL_SCORE,
        type: "get",
        data: {
          "sid": kw_score.sid,
          "uid": kw_score.uid,
          "aid": cdId
        },
        dataType: "text",
        success: function (data) {
          var jsondata = eval("(" + data + ")");
          var obj = jsondata.data || {};
          if (jsondata.status == 0) {
            getAllScore();
            kw_score.removeStarFull("clickFull");
            $(".myScore p").hide();
            $(".myScore").removeAttr("data-scoreName");
            delScored = true;
            setScored = false;
            $(".myScore a").hide();
          }
        }
      });
    });
    $(".myScore .starBox .star").live('mouseenter', function () {
      var $this = $(this);
      var $myScore = $(".myScore");
      var index = $this.index();
      setStarFull(index, "full", $myScore);
      $(".myScore p").show();
      if (setScored) {
        $(".myScore a").show();
      } else {
        $(".myScore a").hide();
      }
    });
    $(".myScore .starBox .star").live('mouseleave', function () {
      kw_score.removeStarFull("full");
      var saveName = $(".myScore").attr("data-scoreName");
      if (saveName) {
        $(".myScore p span").html(saveName);
      } else {
        $(".myScore p").hide();
      }
    });
    $(".myScore .starBox").live('mouseenter', function () {
      var saveName = $(".myScore").attr("data-scoreName");
      if (saveName) {
        $(".myScore p").show();
      }
    });
    $(".myScore").live('mouseleave', function () {
      var saveName = $(".myScore").attr("data-scoreName");
      if (delScored) {
        $(".myScore p span").html(saveName);
        $(".myScore p").hide();
      }
      if (setScored) {
        $(".myScore p").show();
      }
      if (saveName) {
        $(".myScore p span").html(saveName);
        $(".myScore p").show();
      } else {
        $(".myScore p").hide();
      }
    });
  }

  window.$kw_scoreModel = kw_score;
})(jQuery, window, document);

function OnLogin() {
  $kw_scoreModel.uid = getUserID("uid");
  $kw_scoreModel.sid = getUserID("sid");
  $kw_scoreModel.getScoreAndStatus();
  SetAlbumCollectedStateByAlbumId(cdId);
}

function OnLogout() {
  $kw_scoreModel.uid = 0;
  $kw_scoreModel.sid = 0;
  // 清除评分
  $kw_scoreModel.removeStarFull('clickFull');
  $('.myScore p').hide();
  $('.myScore').removeAttr('data-scoreName');
  $('.myScore a').hide();
  // 清除收藏状态
  $('.likeBtn').removeClass('liked');
  $('.likeBtn').html('<i class="icon iconfont icon-notcollection"></i><span>收藏</span>');
}

function OnJump() {
  if (getDataByConfig('hificolDown', 'jumpDownTips') == 1) {
    $(".jumpDown label").show();
  } else {
    $(".jumpDown label").hide();
  }
  if (getDataByConfig('hificolDown', 'jumpLikeTips') == 1) {
    $(".jumpLike label").show();
  } else {
    $(".jumpLike label").hide();
  }
  getCDStatusById(cdId);
  commentModel(cdId);
  SetAlbumCollectedStateByAlbumId(cdId);
}

