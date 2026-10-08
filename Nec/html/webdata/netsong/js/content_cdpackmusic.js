var id = '';
var sampl = '';
var relaIndex = 0;
var totalIndex = -1;
var CurStatus = 3;
var bDetailEmpty = true;
var GuidLen = 36;
var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
var globalGuid = '';

$(function () {
  callClientNoReturn('domComplete');
  initParam();

  var url = decodeURIComponent(window.location.href).replace(/###/g, '');
  id = getValue(url, "id");
  // 判断是否是导入的专辑
  if (id.indexOf('importId') > 0) {
    var i = id.indexOf('importId');
    id = id.substr(0, i - 1);
    setPageHeadOnlineInfoNoId(id);
  } else {
    getCdOnLineInfo(id);
    init_comment_model('.commentBox', 'cd', id);
  }
  $('.download,.share').attr('data-id', id);
  $kw_scoreModel.init();
  BuildListInfo(id);
  GetNowPlayInfo();
  InitALlListSonsgStatus(totalIndex, CurStatus);
  $(".commentBox").hide();
  BindObj();

  SetDetailIconTipShow(false);
  if (bDetailEmpty) {
    AsynGetAlbumDetailInfo(id);
  }
  if (getDataByConfig('hificolDown', 'jumpDownTips') == 1) {
    $(".jumpDown label").show();
  }
  if (getDataByConfig('hificolDown', 'jumpLikeTips') == 1) {
    $(".jumpLike label").show();
  }
  setSkin(setSkinCallback);
});

function setSkinCallback() {
  var skinColor = skinConfig.skinColor;
  var skinLinkColor = skinConfig.linkColor;
  $('.logo_icon i').css('-webkit-filter', `drop-shadow(${skinColor} 69px 0)`);
  $('.nav a i,.all_play,.controlBox .active i,.likePopBtn').css('background', skinColor);
  $('.icon-fabulous,.cdTips a').css('color', skinLinkColor);
  // 正在播放歌曲换肤高亮
  $('.m_name_box_playing,.m_artist_box_playing,.m_long_box_playing').css('color', skinLinkColor);
  commentModelSkinClor('content_cdpackmusic');
}

function SetDetailIconTipShow(bshow) {
  if (bshow) {
    $('.login_guide').show();
  } else {
    $('.login_guide').hide();
  }
}

function AsynGetAlbumDetailInfo(strid) {

  if (strid == '' || strid == null) {
    return;
  }

  var guid = GenGuid();
  globalGuid = guid;
  var Param = 'funcname=GetCDIntro&guid=' + guid;
  Param = encodeURIComponent(Param);
  var call = 'GetCDIntro?id=' + strid + '&channel=hificollectdetail&asyncparam=' + Param;
  callClientNoReturn(call);
}

function GetAlbumDetailInfoAndSet(strId) {
  var strAlbumDetail = '';
  var url = 'http://api.cd.kuwo.cn/album/detail';
  $.ajax({
    url: url,
    dataType: "text",
    type: "post",
    crossDomain: false,
    data: {
      'id': strId
    },
    success: function (str) {
      var jsondata = eval('(' + str + ')');
      if (jsondata.status == 0 && jsondata.msg == 'ok') {
        var data = jsondata.data;
        if (typeof(data) != 'undefined') {
          strAlbumDetail = data.intro;
          SetAlbumIntroInfo(strAlbumDetail, true);
          return;
        }
      }

      if (jsondata.status == 'query error') {
        strAlbumDetail = '';
        SetDetailIconTipShow(true);
      }
    },
    error: function () {
      strAlbumDetail = '';
      SetDetailIconTipShow(true);
    }
  });

  return strAlbumDetail;
}


function OnRefresh(str) {
  window.location.reload();
}

function GetNowPlayInfo() {
  var call = 'GetPlayingSongListInfo';
  var rst = callClient(call);
  if (rst == '' || rst == null) {
    InitALlListSonsgStatus(totalIndex, 3);
    return;
  }

  var alid = getValue(rst, 'CdAlbumId');
  if (alid.indexOf('importId') > -1) {
    alid = alid.substr(0, alid.indexOf('importId') - 1);
  }
  if (alid == '' || alid == null || alid != id) {
    return;
  }

  id = alid;

  var status = getValue(rst, 'Status');
  var songPos = getValue(rst, 'SongPos');
  totalIndex = songPos;
  CurStatus = status;
}

function initParam() {
  id = '';
  sampl = '';
  relaIndex = 0;
  totalIndex = -1;
  CurStatus = 3;
  bDetailEmpty = true;
  globalGuid = '';
}

function BindObj() {
  $('.all_play').unbind('click').bind('click', PlayAllSongs);
  $('.all_add').unbind('click').bind('click', AddSongsTo);
  $('.all_ckb').unbind('click').bind('click', CheckOrUnCheckAllLists);
  $('.cdmusic_wrap').live('click', SongLiClick);
  $('.share').unbind('click').bind('click', ShareAlbumInfo);
  $(".shareBtn").die('click').live('click', ShareAlbumInfo);
  //切换type
  $('.controlBox a').live('click', function () {
    if ($(this).hasClass('active')) {
      return;
    }
    $('.controlBox a').removeClass('active');
    $('.controlBox a i').css("background", '');
    $(this).addClass('active');
    $(".controlBox .active i").css("background", skinConfig.skinColor);
    var btnName = $(this).html();
    if (btnName.indexOf('曲目') > -1) {
      $('.infoBox,.commentBox').hide();
      $('.musicContentBox').show();
      return;
    }
    if (btnName.indexOf('详情') > -1) {
      $('.musicContentBox,.commentBox').hide();
      $('.infoBox').show();
      return;
    }
    if (btnName.indexOf('评论') > -1) {
      $(".commentBox").show();
      $('.musicContentBox,.infoBox').hide();
      $('.commentBox').show();
      return;
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

        CDCollOper(uid, sid, id, 'remove');
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
      CDCollOper(uid, sid, id, 'add');
    }
  });

  $(".jumpLike").click(function () {
    $(".jumpLike label").hide();
    setDataToConfig("hificolDown", "jumpLikeTips", "0");
    commonClick({'source': '9005', 'name': 'cdLikePage'});
  });
  $(".jumpDown").click(function () {
    $(".jumpDown label").hide();
    setDataToConfig("hificolDown", "jumpDownTips", "0");
    commonClick({'source': '9003', 'name': 'cdDownPage'});
  });
}

function PlayAllSongs() {
  var call = 'CDPlayMusic?type=all&id=' + id;
  callClientNoReturn(call);
}

function ShareAlbumInfo() {

  var strParam = encodeURIComponent('&type=cdpackage&position=cdpackage');
  var call = 'ShowShareWnd?rid=' + id + '&data=' + strParam;
  callClientNoReturn(call);
}

function AddSongsTo() {

  var songs = $('#musicListBox li');
  if (songs.length <= 0) {
    return;
  }

  var nindexs = '';
  for (var nCnt = 0; nCnt < songs.length; nCnt++) {
    var chk = $(songs[nCnt]).find('.m_ckb').attr('checked');
    if (chk != 'checked') {
      continue;
    }
    nindexs += $(songs[nCnt]).attr('abso');
    if ((nCnt + 1) != songs.length) {
      nindexs += ',';
    }
  }
  if (nindexs == '') {
    var callalert = 'PlsChooseDlg?type=8';
    callClientNoReturn(callalert);
    return;
  }

  var call = 'ShowCDMenu?type=addtolist&id=' + id + '&indexs=' + nindexs;
  callClientNoReturn(call);
}

function SongLiClick() {
  $('.cdmusic_wrap').removeClass('music_wrapClicked');
  $(this).addClass('music_wrapClicked');
}


function PlaySongDbList(ele) {
  if (typeof(ele) == 'undefined') {
    return;
  }

  var obj = $(ele);
  var index = obj.attr('abso');
  var rid = obj.attr('rid');
  var call = 'CDPlayMusic?type=single&id=' + id + '&index=' + index + '&rid=' + rid;
  callClientNoReturn(call);
}

function PlayOneSongClk(ele) {
  var obj = $(ele).parent().parent().parent();
  if (typeof(obj) == 'undefined') {
    return;
  }

  var index = obj.attr('abso');
  var rid = obj.attr('rid');
  var call = 'CDPlayMusic?type=single&id=' + id + '&index=' + index + '&rid=' + rid;
  callClientNoReturn(call);
}

function CheckOrUnCheckAllLists() {
  var bChk = this.checked;
  if (bChk) {
    $('.m_ckb').attr('checked', true);
  } else {
    $('.m_ckb').attr('checked', false);
  }
}

// 创建cd包线上头部信息
function getCdOnLineInfo(id) {
  var url = "http://cdapi.kuwo.cn/album/detail";
  $.ajax({
    url: url,
    dataType: "text",
    type: "post",
    crossDomain: false,
    data: {
      'id': id
    },
    success: function (str) {
      var jsondata = eval('(' + str + ')');
      if (jsondata.status == 0 && jsondata.msg == 'ok') {
        var data = jsondata.data;
        var media_type = data.media_type || "";
        setPageHeadOnLineInfo(data);//头部信息
        SetAlbumCollectedStateByAlbumId(id);
        var textObj = $('.c_quality');
        textObj.html('');
        if (media_type == "母带") {
          $(".cdIcon").show();
          textObj.html('母带');
          $('.cdNameArea').css('margin-right', '291px');
        } else if (media_type == "CD") {
          textObj.addClass("CD");
          textObj.html('CD');
          $('.cdName').css('margin-left', '0');
        } else {
          textObj.addClass("flac");
          $('.cdName').css('margin-left', '0');
        }
      }
      if (jsondata.status == 'query error') {
        $(".headInfoBox").show();
        $(".headInfoBoxOnLine").hide();
      }
    },
    error: function () {
      $(".headInfoBox").show();
      $(".headInfoBoxOnLine").hide();
    }
  });
}
function setPageHeadOnlineInfoNoId(id) {
  var call = 'GetDownloadCDInfo?id=' + id + '&needsongs=1';
  var rst = callClient(call);
  var JsonObj = eval('(' + rst + ')');
  var JsonSongArr = JsonObj[0];
  var textObj = $('.c_quality');
  if (JsonSongArr.media_type == "母带") {
    $('.cdIcon').show();
    textObj.html('母带');
    $('.cdNameArea').css('margin-right', '291px');
  } else if (JsonSongArr.media_type == "CD") {
    textObj.addClass("CD");
    textObj.html('CD');
    $('.cdName').css('margin-left', '0');
  } else {
    textObj.addClass("flac");
    $('.cdName').css('margin-left', '0');
  }
  var cdName = JsonSongArr.name || '未知专辑';
  var artistName = JsonSongArr.artist || '未知';
  $('.cdNameArea .cdName').css('margin-top', '12px').html(cdName).attr('title', cdName); // 专辑名
  $('.artist .skinLink').removeClass('skinLink').addClass('artistNoId').html(artistName).attr('title', artistName); // 歌手名

  $('.sampling_type span').html(JsonSongArr.sampling || '');

  $('.size span').html(getSize(JsonSongArr.size || ''));

  $('.time').remove(); // 发行时间

  $('.style').remove(); // 流派

  $('.line .downTimes').remove(); // 下载次数

  $('.line .perNum').remove(); // 多少人评价

  $('.infoBottom').css('margin-top', '0');

  $('.likeBtn').remove(); // 收藏按钮

  $('.myScore').remove(); // 评分按钮

  var cdMusicArr = JsonSongArr['songs'] || [];
  if (cdMusicArr.length <= 0) {
    // 需做特殊处理，需要和产品确认
    return;
  }

  $('.cdScore').remove(); // 专辑图上的评分按钮

  $('.controlBox').remove(); // 整个一行tab去掉

  $('.titleinfoBox').css('background', 'transparent');
};
// 设置头部信息
function setPageHeadOnLineInfo(data) {
  var cdName = checkSpecialChar(data.alname, 'disname');
  cdName = cdName.replace(/\^/g, '&amp;');
  var artistId = data.artist_list[0].id;
  var artistname = checkSpecialChar(data.artists, 'disname');
  artistname = artistname.replace(/\^/g, '&amp;');
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
  $('.headInfoBoxOnLine .cdHeadPic').attr('src', pic);
  $('.headInfoBoxOnLine .cdName').html(cdName).attr("title", cdName);
  $('.btnBox').append('<a href="javascript:;" class="shareBtn"><i class="icon iconfont icon-share"></i><span>分享</span></a>');
  $('.headInfoBoxOnLine .artist span').html(artistname).attr("title", artistname).click(function () {
    commonClick({'source': '9009', 'sourceid': artistId, 'name': artistname, 'id': artistId});
  });
  $('.headInfoBoxOnLine .time span').html(time);
  $('.headInfoBoxOnLine .sampling_type span').html(sampling_type);
  $('.headInfoBoxOnLine .size span').html(size);
  $('.headInfoBoxOnLine .downTimes span').html(downTimes);
  if (pay_price == "0") {
    $('.uploaders span').html(uploaderName);
    $('.uploaders').show();
    $('.uploadBtn').show();
  } else {
    $('.uploaders').hide();
    $('.uploadBtn').hide();
  }

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

function SetalbumInfo(jsonObj) {
  if (jsonObj == '' || jsonObj == null || typeof(jsonObj) == 'undefined') {
    return;
  }

  $('.cdHeadInfo .cdName').get(0).innerHTML = jsonObj.name;
  $('.cdHeadInfo .cdName').attr('title', jsonObj.name);

  $('.cdHeadInfo .artist_name').get(0).innerHTML = jsonObj.artist;
  $('.cdHeadInfo .artist_name').attr('title', jsonObj.artist);

  $('.cdHeadInfo .suffix').get(0).innerHTML = jsonObj.format;
  $('.cdHeadInfo .present_time').get(0).innerHTML = jsonObj.publish_time;

  var picUrl = jsonObj.coverurl;
  if (picUrl != '' && picUrl != null) {
    if (picUrl.indexOf('_720.jpg') > 0) {
      picUrl = picUrl.replace('_720.jpg', '_150.jpg');
    }
  }
  $('.cdPicBox .cdHeadPic').attr('src', picUrl);

  var tags = jsonObj.tags;
  if (tags == '' || tags == null) {
    $('.cdHeadInfo .li_category_info').hide();
  } else {
    $('.cdHeadInfo .li_category_info').show();
    $('.cdHeadInfo .category').get(0).innerHTML = jsonObj.tags;
  }
//    // 详情为空 没方案
//    $('.infoBox p').html(jsonObj.intro);
}

function SetAlbumIntroInfo(strInfo, bsave) {
  if (strInfo == '' || strInfo == null) {
    SetDetailIconTipShow(true);
    return;
  }

  var arrInfo = [];
  arrInfo = strInfo.split('\n');
  var strInfo = '';
  for (var index = 0; index < arrInfo.length; index++) {
    strInfo += '<p>' + arrInfo[index] + '</p>';
  }
  document.getElementById('cd_list_detail_info').innerHTML = '';
  if (strInfo != '' && strInfo != null) {
    $('.infoBox .allowSelect').append(strInfo);

    if (bsave) {
      var call = 'SetDownloadCDInfo?type=intro&id=' + id + '&content=' + encodeURIComponent(strInfo);
      callClientNoReturn(call);
    }
  } else {
    SetDetailIconTipShow(true);
  }
}

function BuildListInfo(strid) {
  var call = 'GetDownloadCDInfo?id=' + strid + '&needsongs=1';
  var rst = callClient(call);
  var JsonObj = eval('(' + rst + ')');
  var JsonSongArr = JsonObj[0];
  SetalbumInfo(JsonSongArr);
  sampl = JsonSongArr["sampling"];
  var bHasDetail = false;
  if (JsonSongArr.hasOwnProperty('intro')) {
    var intro = JsonSongArr["intro"];
    if (intro != '' && intro != null) {
      bDetailEmpty = false;
      console.log(' from local ++++');
      SetAlbumIntroInfo(decodeURIComponent(intro), false);
    } else {
      $('.infoBox p').html('无');
    }
  } else {
    bDetailEmpty = true;
  }
  var cdMusicArr = JsonSongArr["songs"] || [];
  if (cdMusicArr.length <= 0) {
    //这里做特殊处理 需要和产品沟通
    return;
  }
  BuildSongList(JsonSongArr["songs"]);
}

function BuildSongList(JsonSongs) {
  var model = loadTemplate('#kw_musicListBox');
  var htmlStr = '';
  var indexIndisk = 0;

  while (true) {

    var song = JsonSongs.filter(function (v) {
      return (parseInt(v.diskindex) == indexIndisk)
    });
    if (song.length <= 0) {
      break;
    }

    var strdiv = '<div class="disk_sep" >';
    strdiv += '<span class="disk_index">' + 'Disc ' + (parseInt(indexIndisk) + 1) + '<span>' + '</div>';
    var str = drawListTemplate(song, model, DealWithAllSongsData);
    relaIndex = 0;

    var songNext = JsonSongs.filter(function (v) {
      return (parseInt(v.diskindex) == (indexIndisk + 1))
    });
    if (songNext.length <= 0 && indexIndisk == 0) {
      strdiv = '';
    }
    htmlStr += strdiv + str;
    indexIndisk += 1;
  }
  $('#musicListBox').html(htmlStr);
  loadImages();
}

function OnLeaveChanel() {

}

function DealWithAllSongsData(obj) {

  totalIndex += 1;
  relaIndex += 1;

  var json = [];
  var index = relaIndex;
  var numindex = relaIndex;
  var songname = obj.name;
  var artist = obj.artist;
  var failed = '';
  var longfailed = '';
  var sample_failed = '';
  var artist_failed = '';
  var nameboxfailed = '';
  var strerr = '';
  if (obj.hasOwnProperty('isfailed')) {
    failed = obj.isfailed;
  }

  if (obj.hasOwnProperty('errinfo')) {
    strerr = obj.errinfo;
  }

  var nmin = parseInt(parseInt(obj.length) / 1000 / 60);
  if (nmin < 10) {
    nmin = "0" + nmin + ":";
  } else {
    nmin = '' + nmin + ':';
  }

  var nsec = parseInt(parseInt(obj.length) / 1000 % 60);
  if (nsec < 10) {
    nsec = "0" + nsec;
  } else {
    nsec = '' + nsec;
  }
  var duration = nmin + nsec;

  var rid = obj.rid;
  var status = '';
  if (failed == '1') {
    status = 'num_icon_play_failed';
    numindex = '';
    sample_failed = 'sample_hot';
    longfailed = 'm_long_box_hot';
    artist_failed = 'm_artist_box_hot';
    nameboxfailed = 'm_name_box_hot';

  }
  if (relaIndex < 10) {
    index = numindex = "0" + numindex;
  }
  json = {
    'index': numindex,
    'sample': sampl,
    'songname': songname,
    'artist': artist,
    'duration': duration,
    'rid': rid,
    'absoindex': totalIndex,
    'relapos': index,
    'failed': status,
    'sample_failed': sample_failed,
    'longbox_failed': longfailed,
    'artist_failed': artist_failed,
    'name_box_failed': nameboxfailed,
    'errinfo': strerr
  };
  return json;
}

function SongListMenu(Obj) {
  var _this = Obj;
  var nIndex = $(_this).attr('abso');
  var rid = $(_this).attr('rid');
  var call = 'ShowCDMenu?type=songinfo&id=' + id + '&index=' + nIndex + '&rid=' + rid;
  callClientNoReturn(call);
}

function InitlistStatus(obj) {
  if (typeof(obj) == 'undefined') {
    return;
  }

  obj.find('.num').removeClass('num_icon');
  obj.find('.num').removeClass('num_icon_pause');

  obj.find('.m_name_box').removeClass('m_name_box_playing').css('color', '');
  obj.find('.m_artist_box').removeClass('m_artist_box_playing').css('color', '');
  obj.find('.m_long_box').removeClass('m_long_box_playing').css('color', '');
  obj.find('.sample').removeClass('sample_playing');

  for (var songIndex = 0; songIndex < obj.length; songIndex++) {
    var subObj = obj[songIndex];

    if ($(subObj).find('.num').hasClass('num_icon_play_failed')) {
      continue;
    }

    var relaPos = $(subObj).attr('relapos');
    $(subObj).find('.num').get(0).innerHTML = relaPos;
  }
}

function SetSongFailedStatus(strPos, strerrinfo) {

  if (parseInt(strPos) < 0) {
    return;
  }

  var Obj = $('#musicListBox li').eq(parseInt(strPos));
  if (typeof(Obj) == 'undefined') {
    return;
  }

  var relaObj = '';
  relaObj = Obj.find('.m_name_box');

  if (!relaObj.hasClass('m_name_box_hot')) {
    relaObj.addClass('m_name_box_hot');
  }

  relaObj = Obj.find('.m_artist_box');
  if (!relaObj.hasClass('m_artist_box_hot')) {
    relaObj.addClass('m_artist_box_hot');
  }

  relaObj = Obj.find('.m_long_box');
  if (!relaObj.hasClass('m_long_box_hot')) {
    relaObj.addClass('m_long_box_hot');
  }

  relaObj = Obj.find('.sample');
  if (!relaObj.hasClass('sample_hot')) {
    relaObj.addClass('sample_hot');
  }

  relaObj = Obj.find('.num');
  if (!relaObj.hasClass('num_icon_play_failed')) {

    relaObj.removeClass('num_icon');
    relaObj.get(0).innerHTML = '';
    relaObj.addClass('num_icon_play_failed');
    relaObj.attr('title', strerrinfo);
  }
}

function InitALlListSonsgStatus(songPos, songstatus, strerrinfo) {
  var Obj = $('.cdmusic_wrap');
  if (typeof(Obj) == 'undefined' || Obj.length <= 0) {
    return;
  }

  if (songstatus == 'playfailed') {
    SetSongFailedStatus(songPos, strerrinfo);
    return;
  }

  if (songstatus == '' || songstatus == null) {
    InitlistStatus(Obj);
    return;
  }

  InitlistStatus(Obj);
  if (songstatus == 1 || songstatus == 4) {
    var DesObj = $('.cdmusic_wrap').eq(songPos);

    DesObj.find('.num').empty();
    DesObj.find('.num').removeClass('num_icon_pause');
    DesObj.find('.num').addClass('num_icon');

    DesObj.find('.m_name_box').removeClass('m_name_box_hot').css('color', '');
    DesObj.find('.m_name_box').addClass('m_name_box_playing').css('color', skinConfig.linkColor);

    DesObj.find('.m_artist_box').removeClass('m_artist_box_hot').css('color', '');
    DesObj.find('.m_artist_box').addClass('m_artist_box_playing').css('color', skinConfig.linkColor);

    DesObj.find('.m_long_box').removeClass('m_long_box_hot').css('color', '');
    DesObj.find('.m_long_box').addClass('m_long_box_playing').css('color', skinConfig.linkColor);

    DesObj.find('.sample').removeClass('sample_hot');
    DesObj.find('.sample').addClass('sample_playing');
    DesObj.find('.num').removeClass('num_icon_play_failed');
    DesObj.find('.num').attr('title', '');
  } else if (songstatus == 2) {
    var DesObj = $('.cdmusic_wrap').eq(songPos);
    DesObj.find('.num').empty();
    DesObj.find('.num').removeClass('num_icon');
    DesObj.find('.num').addClass('num_icon_pause');

    DesObj.find('.m_name_box').removeClass('m_name_box_hot').css('color', '');
    DesObj.find('.m_name_box').addClass('m_name_box_playing').css('color', skinConfig.linkColor);

    DesObj.find('.m_artist_box').removeClass('m_artist_box_hot').css('color', '');
    DesObj.find('.m_artist_box').addClass('m_artist_box_playing').css('color', skinConfig.linkColor);

    DesObj.find('.m_long_box').removeClass('m_long_box_hot').css('color', '');
    DesObj.find('.m_long_box').addClass('m_long_box_playing').css('color', skinConfig.linkColor);

    DesObj.find('.sample').removeClass('sample_hot');
    DesObj.find('.sample').addClass('sample_playing');
    DesObj.find('.num').removeClass('num_icon_play_failed');
    DesObj.find('.num').attr('title', '');
  }
}

function CDStatusNotify(str) {

}

function musicNowPlaying(strParam) {

  var Obj = $('.cdmusic_wrap');
  if (strParam == '' || strParam == null) {
    //InitlistStatus(Obj);
    return;
  }

  var albumid = getValue(strParam, 'CdAlbumId');
  if (albumid.indexOf('importId') > -1) {
    albumid = albumid.substr(0, albumid.indexOf('importId') - 1);
  }
  if (albumid == '' || albumid == null) {
    var Obj = $('.cdmusic_wrap');
    if (typeof(Obj) == 'undefined' || Obj.length <= 0) {
      return;
    }
    InitlistStatus(Obj);
    return;
  }

  if (albumid != id) {//说明专辑切换了，这时候要进行相应状态处理
    var Obj = $('.cdmusic_wrap');
    if (typeof(Obj) == 'undefined' || Obj.length <= 0) {
      return;
    }
    InitlistStatus(Obj);
    return;
  }

  var songStatus = getValue(strParam, 'Status');
  var SongPos = getValue(strParam, 'SongPos');
  var errinfo = getValue(strParam, 'errinfo');
  CurStatus = songStatus;
  totalIndex = SongPos;

  InitALlListSonsgStatus(SongPos, songStatus, errinfo);

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
  // var call = 'PageJump?param=' + encodeURIComponent(channelInfo) + ';' + encodeURIComponent(srcKey + src) + '&calljump=true';
  // callClientNoReturn(call);
}


function CDResultCallback(str) {
  if (str == '' || str == null) {
    return;
  }

  var asynParam = getValue(str, 'asyncparam');
  if (asynParam == '' || asynParam == null) {
    return;
  }

  asynParam = decodeURIComponent(asynParam);
  var comguid = getValue(asynParam, 'guid');
  if (comguid != globalGuid) {
    return;
  }

  var func = getValue(asynParam, 'funcname');
  if (func == '' || func == null) {
    return;
  }

  if (func == 'GetCDIntro') {
    var aldetail = getValue(str, 'result');
    aldetail = decodeURIComponent(aldetail);
    if (aldetail == '' || aldetail == null) {
      GetAlbumDetailInfoAndSet(id);
      return;
    }

    SetAlbumIntroInfo(decodeURIComponent(aldetail), false);
  }
}

/*产生一个guid*/
function GenGuid() {

  var chars = CHARS;
  var uuid = new Array(GuidLen);
  var rnd = 0;
  var r;
  for (var i = 0; i < GuidLen; i++) {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      uuid[i] = '-';
    } else if (i == 14) {
      uuid[i] = '4';
    } else {
      if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
      r = rnd & 0xf;
      rnd = rnd >> 4;
      uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('');
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
      url: "http://cdapi.kuwo.cn/score/albumscore",
      type: "get",
      data: {
        "aid": id
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
            $(".perNum").html("已被评价：" + num + "人评价");
            $(".cdScore .starBox .star").removeClass("half");
            for (var i = 0; i <= index; i++) {
              $(".cdScore .starBox .star").eq(i).addClass("full");
            }
            if (index.toString().indexOf(".") > -1) {
              $(".cdScore .starBox .star").eq(index + 1).addClass("half");
            }
          } else {
            $(".cdScore .score").html("0分");
            $(".perNum").html("少于10人评价");
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
      url: "http://cdapi.kuwo.cn/score/getscore",
      type: "get",
      data: {
        "sid": kw_score.sid,
        "uid": kw_score.uid,
        "aid": id
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
            $(".myScore p").show();
            setScored = true;
          } else {
            $(".myScore p").hide();
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
        url: "http://cdapi.kuwo.cn/score/create",
        type: "get",
        data: {
          "sid": kw_score.sid,
          "uid": kw_score.uid,
          "aid": id,
          "score": score
        },
        dataType: "text",
        success: function (data) {
          var jsondata = eval("(" + data + ")");
          var obj = jsondata.data || {};
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
        url: "http://cdapi.kuwo.cn/score/del",
        type: "get",
        data: {
          "sid": kw_score.sid,
          "uid": kw_score.uid,
          "aid": id
        },
        dataType: "text",
        success: function (data) {
          var jsondata = eval("(" + data + ")");
          var obj = jsondata.data || {};
          if (jsondata.status == 0) {
            getAllScore();
            kw_score.removeStarFull("clickFull");
            $(".myScore").removeAttr("data-scoreName");
            $(".myScore p").hide();
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
      var obj = $(".myScore");
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

  var url = 'http://cdapi.kuwo.cn/collection/add' + '?sid=' + sid + '&uid=' + uid + '&aid=' + alid
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
        toast(0, '收藏成功 !');
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
  var urlExist = 'http://cdapi.kuwo.cn/collection/exist' + '?uid=' + uid + '&sid=' + sid + '&aid=' + alid;
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

  var url = 'http://cdapi.kuwo.cn/collection/del' + '?uid=' + uid + '&sid=' + sid + '&aid=' + alid;

  $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    success: function (json) {
      if (json.msg == 'ok' && parseInt(json.status) == 0) {

        var call = 'PageCollOper?id=' + alid + '&oper=remove' + '&channel=hificollect';
        callClientNoReturn(call);
        SetLikedBtnState('remove');
        toast(0, '取消成功 !');
      }
    },
    error: function () {
      console.log(' Error ### url:' + url);
      return;
    }
  });
}

// 收藏结束

function OnLogin() {
  $kw_scoreModel.uid = getUserID("uid");
  $kw_scoreModel.sid = getUserID("sid");
  $kw_scoreModel.getScoreAndStatus();
}

function OnLogout() {
  $kw_scoreModel.uid = 0;
  $kw_scoreModel.sid = 0;
  $kw_scoreModel.removeStarFull("clickFull");
}

function OnJump() {
  commentModel(id);
  SetAlbumCollectedStateByAlbumId(id);
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
}
