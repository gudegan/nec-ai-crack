var downloadInfoArr = {};
var payAlbumId = 0;
var payPos = '';
var psrc = '';
var id = '';
var nCDFullSize = 0;
$(function() {
  callClientNoReturn('domComplete');
  realTimeLog('HIFI_LOG', 'TYPE:ENTER_HIFI_DOWNLOAD_PAGE');
  var url = decodeURIComponent(window.location.href);
  var msg = getUrlMsg(url);
  centerLoadingStart('content');
  id = url2data(msg, 'id') || 9;
  callCreateDownLoadAreaFn(id);
  objBind();
});

function callCreateDownLoadAreaFn(id) {
  var url = 'http://api.cd.kuwo.cn/album/down';
  $.ajax({
    url: url,
    dataType: 'text',
    type: 'post',
    crossDomain: false,
    data: {
      'id': id
    },
    success: function(str) {
      var jsondata = eval('(' + str + ')');
      if (jsondata.status == 0 && jsondata.msg == 'ok') {
        var data = jsondata.data;
        downloadInfoArr = data;
        createCDInfo(data);
        createBottomArea(id, data);
        initSavePosition();
        $('.link').html('http://www.kuwo.cn/down/cdpack/' + id);
        centerLoadingEnd('content');
        return;
      }
      if (jsondata.status == 'query error') {
        loadErrorPage();
      }
    },
    error: function() {
      // 断网提示
      loadErrorPage();
    }
  });
}

function CDInfoData2Arr(json) {
  var arr = [];
  var arrlen = 0;
  if (json.artists) {
    arr[arrlen++] = { 'key': '歌手：', 'value': json.artists };
  }
  if (json.alsize) {
    var size = json.alsize;
    nCDFullSize = size;
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
    arr[arrlen++] = { 'key': '大小：', 'value': size };
  }
  if (json.format) {
    arr[arrlen++] = { 'key': '格式：', 'value': json.format };
  }
  if (json.sampling_type) {
    arr[arrlen++] = { 'key': '采样率：', 'value': json.sampling_type };
  }
  return arr;
}

function createCDInfo(data) {
  var model = loadTemplate('#kw_downloadinfoModel');
  var html = drawListTemplate(CDInfoData2Arr(data), model, proCDInfoData);
  if (data.alname) {
    var alname = data.alname;
    alname = alname.replace(/\^/g, '&');
    $('.downTitle').html(alname);
  }
  $('.infoList').html(html);
}

function proCDInfoData(obj) {
  var json = {};

  var title = obj.key;
  var info = obj.value;

  json = {
    'title': title,
    'info': info
  };
  return json;
}

function createBottomArea(id, albumData) {
  // 每日次数模式
  var islogin = parseInt(UserIsLogin());
  if (!islogin) {
    callClientNoReturn('UserLogin?src=login');
    return;
  }
  var cdPay = parseInt(downloadInfoArr.pay_price);
  var uid = getUserID('uid');
  // var url = 'http://60.28.220.104:8080/GetCdLoad?uid='+uid+'&aid='+id+'&uflag=0&type=get';
  var url = 'http://dc.cd.kuwo.cn/get_download_limit?uid=' + uid + '&aid=' + id;
  console.log(url);
  $.ajax({
    url: url,
    dataType: 'text',
    crossDomain: false,
    success: function(str) {
      var jsondata = eval('(' + str + ')');
      if (jsondata.Status == 'fail') {
        jsondata.LeftLoadNum = 0;
      }
      // jsondata.Over = 1;
      var leftLoadNum = jsondata.LeftLoadNum;
      var userIsVip = jsondata.VIP || 0;
      if (jsondata.Over) {
        // 免费下载不扣费 设置按钮是免费状态
        setNormalBtn(0, id, leftLoadNum);
        return;
      }
      if (cdPay) { // 是否是付费专辑+付费用户
        if (userIsVip) { // 付费用户 可下载
          if (leftLoadNum) {
            // 扣次数下载 设置按钮的状态是扣费状态
            setNormalBtn(1, id, leftLoadNum);
            return;
          }
          // 非免费下载并扣完次数 进入积分模式
          setKuDouBtn(uid, albumData, id);
        } else { // 免费用户 设置开通付费用户的按钮
          setPayBtn(id);
          return;
        }
      } else {
        if (leftLoadNum) {
          // 扣次数下载 设置按钮的状态是扣费状态
          setNormalBtn(1, id, leftLoadNum);
          return;
        }
        // 非免费下载并扣完次数 进入积分模式
        setKuDouBtn(uid, albumData, id);
      }
    },
    error: function() {
      // 断网提示
      loadErrorPage();
    }
  });
}

function setNormalBtn(type, albumid, leftLoadNum) {
  $('.d_down').attr({ 'data-type': type, 'data-id': albumid }).css('opacity', 1);
  if (type == 0) {
    $('.down_des').html('您曾经下载过该专辑，本次下载不消耗今日下载额度');
  } else {
    $('.down_des').html('您今日还可下载' + leftLoadNum + '张HiFi专辑');
  }
  setSkin(setSkinCallback);
}

function setPayBtn(albumid) {
  var txt = '应版权方要求，开通音乐包后即可下载本专辑。';
  $('.down_des').html(txt);
  $('.d_down').attr({
    'data-type': 4,
    'data-id': albumid
  }).html('开通音乐包').removeClass('downloadBtn').addClass('payBtn').css({ 'background': '#BE2C2C', 'opacity': 1, 'color': '#fff' });
}

function setKuDouBtn(uid, albumData, albumid) {
  // 积分查询
  var url = 'http://www.kuwo.cn/pc/cd/getUserInfo?uid=' + uid;
  $.ajax({
    url: url,
    dataType: 'text',
    crossDomain: false,
    success: function(str) {
      var jsondata = eval('(' + str + ')');
      console.log(jsondata);
      if (jsondata.status == 200) {
        var userKDInfo = jsondata.data;
        var kudouCount = parseInt(userKDInfo.remainBean);
        var threshold = parseInt(albumData.price) || 1;
        console.log(threshold);
        if (kudouCount >= threshold) {
          // 两行提示
          setKDBtnStyle(1, threshold, albumid, kudouCount);
        } else {
          // 两行提示按钮置灰
          setKDBtnStyle(2, threshold, albumid, kudouCount);
        }
      }
    },
    error: function() {
      // 断网提示
      loadErrorPage();
    }
  });
}

function setKDBtnStyle(styleType, threshold, albumid, kudouCount) {
  // 设置说明
  var txt = '今日免费下载额度已用完，您可以使用' + threshold + '积分下载该专辑';
  // txt += `<p style="margin-top:-12px;">您目前有${kudouCount}积分，
  //               <a href="javascript:;" onclick="commonClick({'source':'5000','sourceid':'http://www.kuwo.cn/kudou/page/selfKudou?jump=3','name':'如何赚积分','id':'3','extend':'','other':''});
  //           callClientNoReturn('CloseWindow');">如何赚积分？</a>
  //           </p>`;
  txt += `<p style="margin-top:-12px;">您目前有${kudouCount}积分，
                <a href="javascript:;" onclick="commonClick({'source':'5000','sourceid':'http://h5app.kuwo.cn/taskgift/index.html','name':'如何赚积分','id':'3','extend':'','other':''});
            callClientNoReturn('CloseWindow');">如何赚积分？</a>
            </p>`;
  $('.down_des').html(txt);
  if (styleType == 1) { // 够扣
    $('.d_down').html('使用' + threshold + '积分，立即下载').attr({ 'data-type': 3, 'data-id': albumid });
  } else { // 不够扣
    $('.d_down').addClass('no_down').html('积分不足，先去赚积分吧').attr({ 'data-type': 2, 'data-id': albumid });
  }
  $('.d_down').css('opacity', 1).css('bottom', '10px');
  $('.downTitle').css('margin', '10px 0 0 0');
  setSkin(setSkinCallback);
}

function IsDesPathValid(strDesPath) {
  var bRet = callClient('IsPathValid?path=' + strDesPath + '&size=' + '' + nCDFullSize);
  return bRet;
}

function objBind() {
  $('.d_file').live('click', function(e) {
    var path = $(this).prev('input').val();
    callClientNoReturn('DSelectPosition?DefPath=' + path);
    e.preventDefault();
  });
  $('.d_pos_c input').click(function() {
    $(this).parent().addClass('d_focus');
    $(this).get(0).select();
  }).blur(function(e) {
    $(this).parent().removeClass('d_focus');
    e.stopPropagation();
  });
  $('.d_arrow').click(function() {
    $('.d_pos_history').show();
  });
  $('.d_pos_history a').live('click', function(e) {
    if ($(this).html() == '清除历史记录') {
      callClientNoReturn('DClearPosition');
      initSavePosition();
    } else {
      $('.d_pos_c input').val($(this).html());
    }
    $('.d_pos_history').hide();
    e.preventDefault();
  });
  $('.d_down').live('click', function() {
    var pos = $('.d_pos_c input').val();
    pos = $.trim(pos);
    // 如果路径无效无法进行下载
    var bPathValid = IsDesPathValid(pos);
    if (!parseInt(bPathValid)) {
      if ($('.addressTips').hasClass('addressTipsActive')) {
        return;
      } else {
        $('.addressTips').addClass('addressTipsActive');
        setTimeout(function() {
          $('.addressTips').removeClass('addressTipsActive');
        }, 3000);
      }
      // callClient('DDownload?pos='+pos);//随便调用客户端下载 然后让客户端提示 请选择保存目录
      return;
    }
    pos = encodeURIComponent(pos);
    // type 0--下载不发日志 1--下载发日志 3(积分模式)--发日志不扣次数  2--不让下载 4--调起开通音乐包窗口(支付成功)发不扣次数日志
    var type = $(this).attr('data-type');
    if (type == '2') {
      return;
    }
    var albumid = $(this).attr('data-id');
    if (type == '3') {
      var options = { albumid: albumid, type: '0', pos: pos };
      deductionKuDou(options);
      return;
    }
    if (type == '1') {
      postDownLoadLog(albumid, '1');
      setTimeout(function() {
        callDownLoadFn(pos);
      }, 100);
      return;
    }
    if (type == '0') {
      callDownLoadFn(pos);
      return;
    }
    if (type == '4') {
      payAlbumId = albumid;
      payPos = pos;
      callClientNoReturn('DShowVIPGuide?type=0&psrc=cdpack');
      return;
    }
  });

  var lastPopupDhd = null;
  $(document).live('click', function(e) {
    var ev = e || event;
    $('.d_pos_history').hide();
    $('.d_hd_select').hide();
    var srcobj = $(ev.srcElement);
    if (srcobj.hasClass('d_arrow')) {
      $('.d_pos_history').show();
    }
    if (!srcobj.is('.album_container,.album_container *')) {
      $('.album_container').hide();
    }
    lastPopupDhd = null;
    e.preventDefault();
  });
  $('.copyLink a').live('click', function() {
    var url = $('.link').html();
    callClientNoReturn('WebClipboard?' + url);
    toast('0', '链接已复制');
    // $(".tipsBox").show();
    // setTimeout(function () {
    //   $(".tipsBox").hide();
    // }, 2000);
  });
}

function deductionKuDou(options) {
  var uid = getUserID('uid');
  // var url = 'http://60.29.226.189:10087/pc/cd/consumeKudou4CDDownLoad?uid='+uid+'&beans=-1';
  var url = 'http://www.kuwo.cn/pc/cd/consumeKudou4CDDownLoad?uid=' + uid + '&beans=-1';
  $.ajax({
    url: url,
    dataType: 'text',
    crossDomain: false,
    success: function(str) {
      var jsondata = eval('(' + str + ')');
      console.log(jsondata);
      if (jsondata.status == 200) {
        var albumid = options['albumid'];
        var type = options['type'];
        var pos = options['pos'];
        postDownLoadLog(albumid, '0');
        setTimeout(function() {
          callDownLoadFn(pos);
        }, 100);
      }
    },
    error: function() {
      // 暂时做通过处理
      var albumid = options['albumid'];
      var type = options['type'];
      var pos = options['pos'];
      postDownLoadLog(albumid, '0');
      setTimeout(function() {
        callDownLoadFn(pos);
      }, 100);
    }
  });
}

function callDownLoadFn(pos) {
  var url = decodeURIComponent(window.location.href);
  var msg = getUrlMsg(url);
  var id = url2data(msg, 'id');
  var resource = downloadInfoArr.resource;
  var Objtags = downloadInfoArr.tags;
  var picJson = resource.pic || {};
  var picUrl = picJson['url'] || '';
  if (picUrl) {
    picUrl = picUrl.replace(/.jpg/, '_720.jpg');
  }
  var picStr = '&cdpic=' + picUrl + '&filename_cdpic=' + encodeURIComponent(picJson['name']);
  var cdResourceStr = picStr + '&cdcount=' + resource.count;
  var cdPay = parseInt(downloadInfoArr.pay_price);
  for (var i = 0; i < resource.count; i++) {
    var cuefilename = resource['dist' + (i + 1)].cue.filename;
    var cuesize = resource['dist' + (i + 1)].cue.size;
    var cuesig = resource['dist' + (i + 1)].cue.cuesig.split(',');
    var cuesig1 = cuesig[0];
    var cuesig2 = cuesig[1];
    var cdfilename = resource['dist' + (i + 1)].cd.filename;
    var cdsize = resource['dist' + (i + 1)].cd.size;
    var cdsig = resource['dist' + (i + 1)].cd.cdsig.split(',');
    var cdsig1 = cdsig[0];
    var cdsig2 = cdsig[1];

    cdResourceStr += '&filename_cue' + i + '=' + encodeURIComponent(cuefilename) + '&filesize_cue' + i + '=' + cuesize + '&sig1_cue' + i + '=' + cuesig1 + '&sig2_cue' + i + '=' + cuesig2 + '&filename_cd' + i + '=' + encodeURIComponent(cdfilename) + '&filesize_cd' + i + '=' + cdsize + '&sig1_cd' + i + '=' + cdsig1 + '&sig2_cd' + i + '=' + cdsig2;
  }
  var tags = '';
  for (var index = 0; index < Objtags.length; index++) {
    var JsonObj = Objtags[index];
    tags += JsonObj['tag_name'];
    if ((index + 1) != Objtags.length) {
      tags += '|';
    }
  }

  if (url.indexOf('channel') > -1) {
    psrc = 'VER=2015;FROM=曲库->cd包专区->频道页';
  } else if (url.indexOf('content') > -1) {
    psrc = 'VER=2015;FROM=曲库->cd包专区->详情页';
  }
  // 专辑名称进行urlcode处理
  var alname = downloadInfoArr.alname;
  alname = alname.replace(/\^/g, '&');
  alname = encodeURIComponent(alname);
  // 歌手名称进行urlencode处理
  var atrtistname = downloadInfoArr.artists;
  atrtistname = atrtistname.replace(/\^/g, '&');
  atrtistname = encodeURIComponent(atrtistname);
  var info = 'pos=' + pos + '&albumid=' + id + '&cdname=' + alname + '&albumsize=' + downloadInfoArr.alsize + '&artist=' + atrtistname + '&albumformat=' + downloadInfoArr.format + '&albumsamplingtype=' + downloadInfoArr.sampling_type + cdResourceStr + '&publish_time=' + downloadInfoArr.publish_time + '&tags=' + tags + '&cdpay=' + cdPay + '&media_type=' + downloadInfoArr.media_type + '&psrc=' + psrc;

  info = encodeURIComponent(info);
  var call = 'CDDownload?' + info;
  //    console.log(call);
  callClientNoReturn(call);
}

function postDownLoadLog(albumid, type) {
  var uid = getUserID('uid');
  // var url = 'http://60.28.220.104:8080/GetCdLoad?uid='+uid+'&aid='+albumid+'&uflag=1&type=post';
  if (type == '1') {
    var url = 'http://dc.cd.kuwo.cn/modify_download_limit?uid=' + uid + '&aid=' + albumid + '&type=1';
  } else {
    var url = 'http://dc.cd.kuwo.cn/modify_download_limit?uid=' + uid + '&aid=' + albumid + '&type=0';
  }
  $.ajax({
    url: url,
    dataType: 'text',
    crossDomain: false,
    success: function(str) {
      var jsondata = eval('(' + str + ')');
    },
    error: function() {
      // 断网提示
    }
  });
}

function downSavePostion(pos) {
  $('.d_pos_c input').val(decodeURIComponent(pos));
}

function initSavePosition() {
  var savepos = callClient('DGetSavePosition');
  var saveposobj = eval('(' + savepos + ')');
  saveposobj = saveposobj.position;
  var posarray = [];
  var possize = saveposobj.length;
  if (possize > 2) {
    for (var m = 0; m < possize - 1; m++) {
      var posobj = saveposobj[m];
      var pos = '';
      try {
        pos = decodeURIComponent(posobj.pos);
      } catch (e) {
        pos = posobj.pos;
      }
      if (m == 0) {
        $('.d_pos_c input').val(pos);
      }
      posarray[posarray.length++] = '<a href="javascript:;" hidefocus>';
      posarray[posarray.length++] = pos;
      posarray[posarray.length++] = '</a>';
    }
  } else {
    for (var n = possize - 1; n >= 0; n--) {
      var posobj = saveposobj[n];
      var pos = '';
      try {
        pos = decodeURIComponent(posobj.pos || posobj.defaultpos);
      } catch (e) {
        pos = posobj.pos || posobj.defaultpos;
      }
      if (n == possize - 1) {
        $('.d_pos_c input').val(pos);
      }
      posarray[posarray.length++] = '<a href="javascript:;" hidefocus>';
      posarray[posarray.length++] = pos;
      posarray[posarray.length++] = '</a>';
    }
  }
  $('.d_pos_history').html(posarray.join(''));
}

function CDStatusNotify(str) {
  var msgArr = str.split('&');
  var msgtype = msgArr[0].split('=')[1];
  var id = msgArr[1].split('=')[1];
  if (msgtype == 'musicpackresult') {
    var result = msgArr[1].split('=')[1];
    if (result == 'suc') { // 支付成功
      if (payPos != '' && payAlbumId != 0) {
        postDownLoadLog(payAlbumId, '1');
        setTimeout(function() {
          callDownLoadFn(payPos);
        }, 100);
      }
    }
  }
}

function setSkinCallback() {
  var btn = $('.downloadBtn');
  if (!btn.hasClass('no_down')) {
    var skinColor = skinConfig.skinColor;
    // var skinLinkColor = skinConfig.linkColor;
    btn.css('background', skinColor);
    if (skinConfig.type !== 'default') {
      btn.css('color', '#fff');
    } else {
      btn.css('color', '#000');
    }
  }
}
