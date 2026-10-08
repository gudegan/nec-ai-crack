var pageName = getPageName();
;$(function () {
  bindEvent();
});
// 绑定事件
function bindEvent() {
  $('.br_pic').live('mouseenter', function() {
    if ($(this).hasClass('on')) return;
    $(this).addClass('on');
    var status = $(this).attr('c-status');
    var someClass = $(this).parent().attr('class');
    var s = someClass.indexOf('radio_');
    var id = someClass.substring(s + 6);
    var stopicon = '';
    var click = '';
    if (status == 1 || status == 4) {
      $(this).find('.radio_pause').remove();
      $(this).find('.radio_play').remove();
      if (pageName === 'channel_radio') {
        $(this).parent().find('.playing_oper').show();
        $(this).find('.lstdiv').hide();
      }
      click = `OnJumpRadioPlayingPage(${id})`;
      stopicon = `<i title="暂停播放" onclick="stopRadio(arguments[0],${id},true)" class="radio_pause"></i>`;
    } else if (status == 2)	{
      $(this).find('.radio_start').remove();
      $(this).find('.radio_stop').remove();
      if (pageName === 'channel_radio') {
        $(this).parent().find('.playing_oper').show();
        $(this).find('.lstdiv').hide();
      }
      click = `OnJumpRadioPlayingPage(${id})`;
      stopicon = `<i title="继续播放" onclick="continueRadio(arguments[0],${id},true)" class="radio_start"></i>`;
    } else {
      click = $(this).attr('_onclick');
      stopicon = `<i title="直接播放" onclick="" class="radio_start"></i>`;
    }
    $(this).append(stopicon);
    $(this).removeAttr('onclick');
    $(this).unbind('click').bind('click', function() {
      if (status != 2 && status != 1 && status != 4) {
        if ($(this).hasClass('on')) {
          $(this).removeClass('on');
        }
      }
      eval(click);
    });
    if (pageName == 'channel_radio') {
      $('.radio_like').unbind('click').bind('click', radiobtnlike);
      $('.radio_dust').unbind('click').bind('click', radiobtndust);
      $('.radio_add').unbind('click').bind('click', radiobtnadd);
    }
    return false;
  });

  $('.br_pic').live('mouseleave', function() {
    $(this).removeClass('on');
    $(this).find('.radio_pause').remove();
    $(this).find('.radio_start').remove();
    var status = $(this).attr('c-status');
    if (status == 1) {
      var stopicon = '<img class="radio_play" src="img/radio_play.gif">';
      $(this).find('.radio_play').remove();
      $(this).find('.i_play').hide();
      $(this).append(stopicon);
    } else if (status == 2) {
      var playicons = '<i class="radio_stop"></i>';
      $(this).find('.radio_stop').remove();
      $(this).find('.i_play').hide();
      $(this).append(playicons);
    }
    if (pageName === 'channel_radio') {
      $(this).parent().find('.playing_oper').hide();
      $(this).find('.lstdiv').show();
    }
    return false;
  });
}

// 点击喜欢按钮
function radiobtnlike(ev) {
  var strSetFav = 'SetSonglikeState';
  callClientNoReturn(strSetFav);
  ev.stopPropagation();
  return false;
}

// 垃圾箱按钮
function radiobtndust(ev) {
  var strSetFav = 'RadioClickDustbin?icontype=del';
  callClientNoReturn(strSetFav);
  ev.stopPropagation();
  return false;
}

// 电台播放时的'+'按钮
function radiobtnadd(ev) {
  var index = GetCurTagIndex();
  var strSetFav = 'RadioMore?tagindex=' + index;
  callClientNoReturn(strSetFav);
  ev.stopPropagation();
  return false;
}

// 收藏客户端回调
function SetSongFav(infoStr) {
  var playingSongInfo = callClient('GetRadioPlayingSongInfo');
  var b_like = parseInt(getValue(playingSongInfo, 'blike'));
  var call = 'GetRadioNowPlaying';
  var str = callClient(call);
  var id = getValue(str, 'radioid');
  var DesObj = $('.radio_' + id).find('.br_pic');
  if (b_like) {
    DesObj.find('.playing_oper').find('.radio_like').addClass('radio_liked');
    DesObj.find('.playing_oper').find('.radio_like').attr('title', '已喜欢');
  } else {
    DesObj.find('.playing_oper').find('.radio_like').removeClass('radio_liked');
    DesObj.find('.playing_oper').find('.radio_like').attr('title', '喜欢');
  }
}
