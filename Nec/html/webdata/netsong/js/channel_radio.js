var targetObj = {};
var radioid = 0;
var status = '';
callClientNoReturn('loadingWait');
window.onload = function() {
  // var url1=decodeURIComponent(window.location.href);
  // param=url1.substring(url1.indexOf('{'),url1.lastIndexOf('}')+1);
  // if(param!='')OnJump(param);
  // centerLoadingStart("content");
  var call = 'GetRadioNowPlaying';
  var str = callClient(call);
  radioid = getValue(str, 'radioid');
  status = getValue(str, 'playstatus');
  var uid = getUserID('uid');
  var login = 0;
  if (uid != 0) login = 1;
  var radioChannelData = getDataByCache('radio-channel');
  // var radioChannelData = getDataByCache('channelRadioData');
  // var radioChannelData = '';
  if (radioChannelData) {
    try {
      getRadioListData($.parseJSON(radioChannelData));
      // $('body').html(radioChannelData);
      if (radioid) {
        initRadioStatus(parseInt(status, 10), radioid);
      }
    } catch (e) {
      // var url = 'http://qukudata.kuwo.cn/q.k?op=query&cont=tree&node=87235&pn=0&rn=100&fmt=json&src=mbox&level=3&sourceset=tag_radio&callback=getRadioListData&extend=gxh&kid='+getUserID("devid")+'&uid='+uid+'&ver='+getVersion()+'&login='+login;
      // getScriptData(url);
      // var url = 'http://qukudata.kuwo.cn/q.k?op=query&cont=tree&node=87235&pn=0&rn=100&fmt=json&src=mbox&level=3&sourceset=tag_radio&extend=gxh&kid=' + getUserID('devid') + '&uid=' + uid + '&ver=' + getVersion() + '&login=' + login;
      var url = 'http://mobi.kuwo.cn/mobi.s?type=radiolist&rformat=json' + '&uid=' + getUserID('devid') + '&loginUid=' + uid + '&prod=' + getVersion(); // 这里uid是设备id loginUid是用户id prod 版本号
      $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: false,
        success: function(json) {
          getRadioListData(json);
        },
        error: function(xhr) {
          loadErrorPage();
        }
      });
    }
  } else {
    // var url = 'http://qukudata.kuwo.cn/q.k?op=query&cont=tree&node=87235&pn=0&rn=100&fmt=json&src=mbox&level=3&sourceset=tag_radio&extend=gxh&kid=' + getUserID("devid") + '&uid=' + uid + '&ver=' + getVersion() + '&login=' + login;
    // getScriptData(url);
    var url = 'http://mobi.kuwo.cn/mobi.s?type=radiolist&rformat=json' + '&uid=' + getUserID('devid') + '&loginUid=' + uid + '&prod=' + getVersion(); // 这里uid是设备id loginUid是用户id prod 版本号
    // var d = new Date();
    // var time = d.getYear() + d.getMonth() + d.getDate() + d.getHours() + parseInt((d.getMinutes() / 20));
    // time = '' + d.getYear() + d.getMonth() + d.getDate() + time;
    // url = url + '&ttime=' + time;
    var radiostrattime = new Date().getTime();
    $.ajax({
      url: url,
      dataType: 'json',
      crossDomain: false,
      success: function(json) {
        var endtime = new Date().getTime() - radiostrattime;
        realTimeLog('WEBLOG', 'url_time:' + endtime + ';' + 'qukutree' + ';' + url);
        realShowTimeLog(url, 1, endtime, 0, 0);
        getRadioListData(json);
      },
      error: function(xhr) {
        var endtime = new Date().getTime() - radiostrattime;
        loadErrorPage();
        var httpstatus = xhr.status;
        if (typeof (httpstatus) === 'undefined') {
          httpstatus = '-1';
        }
        var sta = httpstatus.toString();
        realTimeLog('WEBLOG', 'url_error:' + sta + ';qukutree;' + url);
        webLog('请求失败,url:' + url);
        realShowTimeLog(url, 0, endtime, sta, 0);
      }
    });
  }
  setSkin(setNavSkinColor);
  objBindFn();
};

$(window).on('scroll resize', function() {
  if (!navClickflag) {
    set_left_nav_current();
  }
  radioLoadImages();
});

function OnLeaveChanel() {

}
var flag = true;
function comHeight() {
  var scrollTop = document.body.scrollTop + document.documentElement.scrollTop; // scrollTop
  var clientHieght = $('#content').height(); // 右侧总高度
  var innerHeight = window.innerHeight; // 窗口大小
  var leftHieght = $('.leftNav').get(0).scrollHeight; // 左侧总高度
  var leftInnerHeight = $('.leftNav').height(); // 左侧页面内高度
  var leftTop = scrollTop / (clientHieght + 800 - innerHeight) * (leftHieght - leftInnerHeight);
  if (flag) {
    $('.leftNav')[0].scrollTop = leftTop;
  }
}
function addLeftScorll() {
  window.addEventListener('scroll', comHeight, false);
  window.addEventListener('resize', comHeight, false);
  $('.leftNav').on('mouseover', function() {
    $('.leftNav').addClass('leftScroll');
    $('body').css({
      'overflow': 'hidden'
    });
    $('.rtop.backTop').css('right', '26px');
    $('.radio_con').css('margin-right', '10px');
  });
  $('.leftNav').on('mouseleave', function() {
    $('.leftNav').removeClass('leftScroll');
    $('body').css({
      'overflow': ''
    });
    $('.rtop.backTop').css('right', '16px');
    $('.radio_con').css('margin-right', '');
  });
}

// 创建电台列表
function getRadioListData(jsondata) {
  var data = jsondata;
  var child = data.child;
  var len = child.length;
  var navarr = [];
  var navxia = 0;
  var arr = [];
  var xia = 0;
  var index = 0;
  var MyTag = 0;
  // 909新增关闭个性化，得去掉私人FM 取配置
	var ifColseRcm = getDataByConfig('Setting', 'personalrecom') === '0';
  for (var i = 0; i < len; i++) {
    MyTag += 1;
    var obj = child[i];
    // if (obj.pc_extend.indexOf('NOTSHOWPC2015') > -1) continue;
    var disname = obj.disname || obj.name;
    var id = obj.id;
    var tag = 'tag' + id;
    var isCurrent = '';
    i == 0 ? isCurrent = 'current' : isCurrent = '';
    navarr[navxia++] = '<a hidefocus href="###" c-target="';
    navarr[navxia++] = tag;
    navarr[navxia++] = '" class="';
    navarr[navxia++] = isCurrent;
    navarr[navxia++] = '" title="';
    navarr[navxia++] = disname;
    navarr[navxia++] = '"><i>';
    navarr[navxia++] = disname;
    navarr[navxia++] = '</i><span></span>';
    navarr[navxia++] = '</a>';
    arr[xia++] = '<h2 id="';
    arr[xia++] = tag;
    arr[xia++] = '" class="radioTitle"><div class="title"><span>';
    arr[xia++] = disname;
    // arr[xia++] = '<font style="font-size:12px;"> . FM</font>';
    arr[xia++] = '</span></div></h2>';
    var radioList = child[i].child;
    var radioLen = radioList.length;
    var radioarr = [];
    var radioxia = 0;
    for (var j = 0; j < radioLen; j++) {
      // if (radioList[j].pc_extend.indexOf('NOTSHOWPC2015') > -1) continue;
      if (ifColseRcm && i === 0 && j === 0) {
        continue;
      }
      index++;
      radioarr[radioxia++] = createRadioBlock(radioList[j], 'radio', 0, index, MyTag);
    }
    arr[xia++] = '<ul class="kw_radio_list">';
    arr[xia++] = radioarr.join('');
    arr[xia++] = '</ul>';
  }

  var navStr = navarr.join('');
  var contentStr = arr.join('');
  $('.leftNav').html(navStr);
  setNavSkinColor();
  $('.radio_con').html(contentStr);
  callClientNoReturn('loadingEnd');
  // centerLoadingEnd("content");
  addLeftScorll();
  saveDataToCache('channelRadioData', $('body').html(), 3600);
  setTimeout(function() {
    radioLoadImages();
  }, 100);

  if (radioid) {
    initRadioStatus(parseInt(status, 10), radioid);
  }
}

function radioLoadImages() {
  var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
  var clientH = document.documentElement.clientHeight;
  var scrollB = scrollT + clientH;
  var imgs = $('.lazy');
  imgs.each(function(i) {
    if ($(this).offset().top < scrollB) {
      if ($(this)[0].getAttribute('data-original') !== '{$pic}') {
        $(this)[0].setAttribute('src', $(this)[0].getAttribute('data-original'));
        $(this).removeClass('lazy');
      }
    }
  });
}

function GetCurTagIndex() {
  var CurIndex = 0;
  $('.leftNav a').each(function(nIndex, ele) {
    if ($(ele).hasClass('current')) {
      // console.log('nindex :' + nIndex);
      CurIndex = nIndex;
      return false;
    }
  });

  return CurIndex;
}

function objBindFn() {
  $('.leftNav a').live('click', function() {
    $('.leftNav a').removeClass('current');
    $(this).addClass('current').removeAttr('style');
    var index = $(this).index();
    var t = $('.kw_radio_list').eq(index).offset().top;
    navClickflag = true;
    flag = false;
    var clientHieght = $('#content').height(); // 右侧总高度
    var innerHeight = window.innerHeight; // 窗口大小
    var leftHieght = $('.leftNav').get(0).scrollHeight; // 左侧总高度
    var leftInnerHeight = $('.leftNav').height(); // 左侧页面内高度
    var leftTop = (t - 50) / (clientHieght + 800 - innerHeight) * (leftHieght - leftInnerHeight);
    $('.leftNav').animate({ 'scrollTop': leftTop }, 300, function() {
      flag = true;
    });
    set_window_top(t - 50);
    setNavSkinColor();
  });

  $('.sub_nav a').live('click', function() {
    var obj = $(this);
    obj.siblings().removeClass('current');
    obj.addClass('current');
    var t = $('#' + obj.attr('c-target')).offset().top;
    setAreaTop(t);
    setTimeout(function() {
      $('.sub_nav a').removeClass('current').eq(0).addClass('current');
    }, 500);
    return false;
  });

  function setAreaTop(t) {
    var tt = t || 0;
    $('body').stop().animate({ scrollTop: tt }, 500);
  }
}

function set_left_nav_current() {
  var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
  var clientH2 = document.documentElement.clientHeight / 2;
  var current_flag = scrollT + clientH2;
  var top_arr = get_radio_top();
  var len = top_arr.length;
  for (var i = 0; i < len; i++) {
    if (top_arr[i] < current_flag) {
      $('.leftNav a').removeClass('current');
      $('.leftNav a').eq(i).addClass('current');
    }
  }
  setNavSkinColor();
}

function get_radio_top() {
  var arr = [];
  var count = 0;
  $('.kw_radio_list').each(function() {
    var nowT = $(this).offset().top;
    arr[count++] = nowT;
  });
  return arr;
}

var navClickflag = false;

function set_window_top(t) {
  $('body').animate({ scrollTop: t }, 300, function() {
    navClickflag = false;
  });
}

function setNavSkinColor() {
  $('.leftNav a.current span').css('background', skinConfig.skinColor);
}

// 客户端调用方法
function StopPlayMark() {}
