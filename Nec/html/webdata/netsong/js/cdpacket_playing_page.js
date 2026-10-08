var albumid = '';
var totalIndex = -1;
var CurStatus = 3;
var relaIndex = 0;
var curSongIndex = 0;
var GuidLen = 36;
var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
var globalGuid = '';
var importType = 0; 

$(function () {
  callClientNoReturn('domComplete');
  initParamPlayingPage();
  BindObjPlayingPage();
  GetNowPlayInfoPage();
  if (importType) {
    $('.openCommentBtn').hide();
    $('.commentBox').hide();
    $('.bottom_hz').hide();
  } else {
    init_comment_model('.commentBox', 'cd', albumid);
  }
  BuildListInfoCDPlayingPage(albumid);
  InitALlListSonsgStatus(curSongIndex, CurStatus);
  setSkin(setSkinCallback);
});

function setSkinCallback() {
  var skinLinkColor = skinConfig.linkColor;
  $('.icon-fabulous').css('color', skinLinkColor);
  commentModelSkinClor('cdpacket_playing');
}

function initParamPlayingPage() {
  albumid = '';
  totalIndex = -1;
  CurStatus = 3;
  globalGuid = '';
  relaIndex = 0;
  curSongIndex = 0;
}

function BindObjPlayingPage() {

  $('.cdmusic_wrap').die('click').live('click', SongLiClick);
  $('.openCommentBtn').die('click').live('click', function(ev) {
    $(this).hide();
    $('#message,.closeCommentBtn').show();
    $('#messageCon').focus().val('');
    $('#messageCon').attr({ 'placeholder': '期待你的精彩评论~', 'data-reply': 'false' });
    ev.stopPropagation();
    return false;
  });

  $('.closeCommentBtn').die('click').live('click', function (ev) {
    $('.openCommentBtn').show();
    $('#message,.closeCommentBtn').hide();
    ev.stopPropagation();
    return false;
  });
  /*input textarea 通知客户端focus*/
  $("input,textarea").die("focus").live("focus", function () {
    callClientNoReturn("SetFocus?isFocus=1");
  });
  $("input,textarea").die("blur").live("blur", function () {
    callClientNoReturn("SetFocus?isFocus=0");
  });
  $('#messageCon').die("mouseenter").live("mouseenter", function () {
    var top = $('body').scrollTop();
    $(window).scroll(function () {
      $('body').scrollTop(top);
    });
  });
  $('#messageCon').die("mouseout").live("mouseout", function () {
    $(window).off('scroll');
  });
}

function PlaySongDbList(ele) {
  if (typeof(ele) == 'undefined') {
    return;
  }

  var obj = $(ele);
  var index = obj.attr('abso');
  var rid = obj.attr('rid');
  var call = 'CDPlayMusic?type=single&id=' + rid + '&index=' + index + '&rid=' + rid;
  //console.log(call);
  callClientNoReturn(call);
}

function PlayOneSongClk(ele) {

  var obj = $(ele).parent().parent();
  if (typeof(obj) == 'undefined') {
    return;
  }

  var index = obj.attr('abso');
  var rid = obj.attr('rid');

  var call = 'CDPlayMusic?type=single&id=' + rid + '&index=' + index + '&rid=' + rid;
  //console.log(call);
  callClientNoReturn(call);
}


function GetNowPlayInfoPage() {
  importType = 0;
  var call = 'GetPlayingSongListInfo';
  var rst = callClient(call);
  if (rst == '' || rst == null) {
    InitALlListSonsgStatus(totalIndex, 3);
    return;
  }

  var alid = getValue(rst, 'CdAlbumId');
  if (alid.indexOf('importId') > -1) {
    importType = 1;
    alid = alid.substr(0, alid.indexOf('importId') - 1);
  }
  if (alid == '' || alid == null) {
    return;
  }

  albumid = alid;

  var status = getValue(rst, 'Status');
  var songPos = getValue(rst, 'SongPos');
  curSongIndex = songPos;
  CurStatus = status;

}


function BuildListInfoCDPlayingPage(strid) {

  if (strid == '' || strid == null) {
    return;
  }

  var call = 'GetDownloadCDInfo?id=' + strid + '&needsongs=1';
  var rst = callClient(call);
  if (rst == '' || rst == null) {
    return;
  }

  var JsonObj = eval('(' + rst + ')');
  var JsonSongArr = JsonObj[0];
  var cdMusicArr = JsonSongArr["songs"] || [];
  if (cdMusicArr.length <= 0) {
    //这里做特殊处理 需要和产品沟通
    return;
  }

  SetAlbuminfo(JsonSongArr);
  BuildSongListPlaying(JsonSongArr["songs"]);
}
function CDUpdataImg(str) {
  var cdId = getValue(str, 'id');
  if (cdId == albumid) {
    var cdImg = decodeURIComponent(getValue(str, 'img'));
    $('.album_img').attr('data-original', cdImg);
    $('.album_img').attr('src', cdImg);
  }
}
function SetAlbuminfo(JsonSongArr) {

  $('.album_img').attr('data-original', JsonSongArr.coverpath || 'img/cdpack/cdPlayingPic.png');
  $('.album_img').attr('src', JsonSongArr.coverpath || 'img/cdpack/cdPlayingPic.png');
  $('.band_album_info').html(JsonSongArr.name);
  $('.band_album_info').attr('title', JsonSongArr.name);

  $('#artist_info').html(JsonSongArr.artist);
  $('#artist_info').attr('title', JsonSongArr.artist);

  var format = JsonSongArr["format"];
  var samp = JsonSongArr["sampling"].split('/');

  $('.bottom_hz .format_flac').html(format);
  $('.bottom_hz .format_hz').html(samp[1]);
  $('.bottom_hz .format_bit').html(samp[0]);

  var mediatype = JsonSongArr["media_type"];
  var textTag = $('.btn_album_info .bank_info');
  var imgObj = $('.btn_album_info .band_tag_info');
  textTag.html('');
  if (mediatype == '' || mediatype == null) {
    mediatype = GetMediaTypebByHzBit(JsonSongArr["sampling"]);
  }
  if (mediatype == "CD") {
    imgObj.attr('src', './img/cdpack/second/cdPacket_CD.png');
    textTag.html('CD');
    textTag.css('textIndent', '18px');
  } else if (mediatype == "母带") {
    imgObj.attr('src', './img/cdpack/second/cdIcon.png');
    textTag.html('母带');
    textTag.css('textIndent', '15px');
  } else {
    imgObj.attr('src', './img/cdpack/second/cdPacket_CD.png');
    textTag.html('CD');
    textTag.css('textIndent', '18px');
  }
}

function GetMediaTypebByHzBit(strParam) {

  var iconShow = 'CD';
  var type = 16;
  var bitarr = strParam.split('/');
  if (bitarr.length > 1) {
    type = parseInt(bitarr[0]);
    if (type == 16) {
      iconShow = 'CD';
    } else if (type == 24) {
      iconShow = '母带';
    }
  }

  return iconShow;
}


function setSongsampleRate(strRate) {
  if (strRate == '' || strRate == null) {
    return;
  }

  var rate = getValue(strRate, "rate");
  $('.bottom_hz .format_k').html(rate);
}

function BuildSongListPlaying(JsonSongs) {

  var model = loadTemplate('#kw_right_song_info_model');
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

  $('#song_list_info_detail').html(htmlStr);
  loadImages();
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
  var errowInfo = '';
  if (obj.hasOwnProperty('isfailed')) {
    failed = obj.isfailed;
  }

  if (obj.hasOwnProperty('errinfo')) {
    errowInfo = obj.errinfo;
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
  if (parseInt(failed)) {
    status = 'num_icon_failed';
    numindex = '';
    longfailed = 'right_time_span_failed';
    nameboxfailed = 'right_name_span_failed';

    sample_failed = 'sample_hot';
    artist_failed = 'm_artist_box_hot';

  } else {
    errowInfo = '';
  }

  json = {
    'num': numindex,
    'songname': songname,
    'artist': artist,
    'duration': duration,
    'rid': albumid,
    'absoindex': totalIndex,
    'relapos': index,
    'failed': status,
    'sample_failed': sample_failed,
    'longbox_failed': longfailed,
    'artist_failed': artist_failed,
    'name_box_failed': nameboxfailed,
    'errinfo': errowInfo
  }
  return json;
}

function freChoose() {
  $('.bottom_hz a').removeClass('active');
  $(this).addClass('active');
}

function SongLiClick() {
  $('.cdmusic_wrap').removeClass('music_wrapClicked');
  $(this).addClass('music_wrapClicked');
}

function InitlistStatus(obj) {

  if (typeof(obj) == 'undefined' || obj.length <= 0) {
    return;
  }

  obj.find('.song_index').removeClass('num_icon');
  obj.find('.song_index').removeClass('num_icon_pause');

  obj.find('.right_name_span').removeClass('right_name_span_playing');
  obj.find('.right_time_content').removeClass('right_time_span_playing');
  for (var songIndex = 0; songIndex < obj.length; songIndex++) {
    var subObj = obj[songIndex];

    if (typeof(subObj) == 'undefined' || subObj.length <= 0) {
      continue;
    }

    var numObj = $(subObj).find('.song_index');
    if (typeof(numObj) == 'undefined' || numObj.length <= 0) {
      continue;
    }

    if (numObj.hasClass('num_icon_failed')) {
      numObj.get(0).innerHTML = '';
      continue;
    }

    var relaPos = $(subObj).attr('relapos');
    $(subObj).find('.song_index').get(0).innerHTML = relaPos;
  }
}


function SetCDSongFailedStatus(strPos, strerrinfo) {

  if (parseInt(strPos) < 0) {
    return;
  }

  var Obj = $('#song_list_info_detail li').eq(parseInt(strPos));
  if (typeof(Obj) == 'undefined') {
    return;
  }

  var relaObj = '';
  relaObj = Obj.find('.right_name_span');
  if (!relaObj.hasClass('right_name_span_failed')) {
    relaObj.addClass('right_name_span_failed');
  }

  relaObj = Obj.find('.right_time_content');
  if (!relaObj.hasClass('right_time_span_failed')) {
    relaObj.addClass('right_time_span_failed');
  }


  relaObj = Obj.find('.song_index');
  if (!relaObj.hasClass('num_icon_failed')) {

    //console.dir(relaObj);
    relaObj.removeClass('num_icon');
    relaObj.get(0).innerHTML = '';
    //console.log(relaObj.get(0).innerHTML);
    relaObj.addClass('num_icon_failed');
    relaObj.attr('title', strerrinfo);
  }
}

function InitALlListSonsgStatus(songPos, songstatus, strerrinfo) {
  var Obj = $('.cdmusic_wrap');
  if (typeof(Obj) == 'undefined' || Obj.length <= 0) {
    return;
  }

  if (songstatus == 'playfailed') {
    SetCDSongFailedStatus(songPos, strerrinfo);
    return;
  }

  if (songstatus == '' || songstatus == null) {
    InitlistStatus(Obj);
    return;
  }

  InitlistStatus(Obj);
  if (songstatus == 1 || songstatus == 4) {
    var DesObj = $('.cdmusic_wrap').eq(songPos);

    DesObj.find('.song_index').empty();
    DesObj.find('.song_index').attr('title', '');
    DesObj.find('.song_index').removeClass('num_icon_pause');
    DesObj.find('.song_index').addClass('num_icon');
    DesObj.find('.right_name_span').addClass('right_name_span_playing');
    DesObj.find('.right_time_content').addClass('right_time_span_playing');
  } else if (songstatus == 2) {
    var DesObj = $('.cdmusic_wrap').eq(songPos);
    DesObj.find('.song_index').empty();
    DesObj.find('.song_index').attr('title', '');
    DesObj.find('.song_index').removeClass('num_icon');
    DesObj.find('.song_index').addClass('num_icon_pause');
    DesObj.find('.right_name_span').addClass('right_name_span_playing');
    DesObj.find('.right_time_content').addClass('right_time_span_playing');
  }
}

function ReloadComment(str) {
  if ($('.commentBox').get(0).innerHTML) {
    commentModel(albumid);
    $('.openCommentBtn').show();
    $('.closeCommentBtn').hide();
  } else {
    console.log('init_comment_model');
    init_comment_model('.commentBox', 'cd', albumid);
  }
  BindObjPlayingPage();
}


function Refresh(str) {
  
  initParamPlayingPage();
  GetNowPlayInfoPage();
  BuildListInfoCDPlayingPage(albumid);
  InitALlListSonsgStatus(curSongIndex, CurStatus);
  
  if (!importType) {
    $('.bottom_hz').show();
    $('.commentBox').show();
    if ($('.commentBox').get(0).innerHTML) {
      commentModel(albumid);
      $('.openCommentBtn').show();
      $('.closeCommentBtn').hide();
    } else {
      init_comment_model('.commentBox', 'cd', albumid);
    }
  } else {
    $('.openCommentBtn').hide();
    $('.commentBox').hide();
    $('.bottom_hz').hide();
  }
  
  BindObjPlayingPage();
  $(window).scrollTop(0);
}

function musicNowPlaying(strParam) {

  var Obj = $('.cdmusic_wrap');
  if (strParam == '' || strParam == null) {
    InitlistStatus(Obj);
    return;
  }

  var id = getValue(strParam, 'CdAlbumId');
  if (id == '' || id == null) {
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

$(document).click(function (event) {
  var _con = $('#message');   // 设置目标区域
  if (!_con.is(event.target) && _con.has(event.target).length === 0) { // Mark 1
    if (importType) {
      $('.openCommentBtn').hide();
    } else {
      $('.openCommentBtn').show();
    }
    $('#message,.closeCommentBtn').hide();
  }
});
function imgonError(obj, type) {
  var src;
  if (importType) {
    src = 'img/cdpack/cdPlayingPic.png';
  } else {
    src = 'img/default.png';
  }
  obj.src = src;
}