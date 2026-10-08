/**
 * create by deng 2016-9
 */
$(function () {
  callClientNoReturn('domComplete');
  centerLoadingStart();
  var url = decodeURIComponent(window.location.href);
  var msg = getUrlMsg(url);
  oldmsg = msg;
  var id = url2data(msg, 'id');
  getCollectionData(id);
  objBind();
});

function getCollectionData(id) {
  $.ajax({
    url: 'http://www.kuwo.cn/pc/cd/getCdPackageInfo?cdFocusSourceId=' + id,
    dataType: 'text',
    crossDomain: false,
    success: function (jsondata) {
      var data = eval('(' + jsondata + ')');
      data = data.data;
      if (data) {
        $(".banner img").attr("data-original", data.coverPic);
        createCollection(data.data);
        initDownBtnStatus();
        centerLoadingEnd();
      } else {
        loadErrorPage();
      }
    },
    error: function () {
      loadErrorPage();
    }
  })
}

function createCollection(data) {
  var model = loadTemplate('#kw_collectionModel');
  var html = drawListTemplate(data, model, proCollection);
  $(".collectionBox").html(html);
  loadImages();
}

function proCollection(data) {
  var json = {};
  var id = data.id;
  var info = data.info;
  var cdname = checkSpecialChar(info.cdName, 'name');
  var click = commonClickString(new Node('9001', id, cdname, id, '', ''));
  cdname = checkSpecialChar(info.cdName, 'disname');
  var tagArr = info.cdTag.split("/");
  var tagInfo = [];
  if (tagArr[0]) {
    tagInfo = tagArr[0].split(' ');
  }
  var artist = tagArr[tagArr.length - 2] || '';
  var size = tagArr[tagArr.length - 1] || 0;
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
  var tagList = "";
  for (var i = 0; i < tagInfo.length; i++) {
    tagList += '<li>' + tagInfo[i] + '</li>';
  }
  var pic = info.img || '';
  if (pic) {
    pic = changeImgDomain(pic);
    pic = pic.replace(/.jpg/, '_150.jpg');
  } else {
    pic = 'img/default.png';
  }

  json = {
    'id': id,
    'downLoadNumber': info.downLoadNumber,
    'pic': pic,
    'name': cdname,
    'tagList': tagList,
    'recommendInfo': data.recommendInfo,
    'artist': artist,
    'size': size,
    'click': click
  }
  return json;
}

function initDownBtnStatus() {
  var downingData = callClient('GetDownloadCDList?type=downing');
  downingData = eval('(' + downingData + ')');
  console.log(downingData);
  var downingArr = downingData.downing || [];
  if (downingArr.length > 0) {
    for (var i = 0; i < downingArr.length; i++) {
      $('.d_' + downingArr[i].cdid).addClass('downing').html('下载中');
    }
  }

  var downOverData = callClient('GetDownloadCDList?type=complete');
  downOverData = eval('(' + downOverData + ')');
  var downOverArr = downOverData.complete || [];
  if (downOverArr.length > 0) {
    for (var i = 0; i < downOverArr.length; i++) {
      $('.d_' + downOverArr[i].cdid).addClass('downed').html('已下载');
    }
  }
}

function setDownLoadBtnStyle(id, type) {
  switch (type) {
    case 'downing':
      $('.d_' + id).addClass('downing').html('下载中');
      break;
    case 'downed':
      $('.d_' + id).addClass('downed').html('已下载');
      break;
    case 'downrd':
      $('.d_' + id).removeClass('downing').html('<span></span>下载');
      break;
  }
}

function CDStatusNotify(str) {
  var msgArr = str.split('&');
  var msgtype = msgArr[0].split('=')[1];
  var id = msgArr[1].split('=')[1];
  switch (msgtype) {
    case 'cdinsert':
      setDownLoadBtnStyle(id, 'downing');
      break;
    case 'cdfinish':
      setDownLoadBtnStyle(id, 'downed');
      break;
    case 'cdfail':
      setDownLoadBtnStyle(id, 'downrd');
      break;
  }
}

function objBind() {
  $('.download').live('click', function () {
    var id = $(this).attr('data-id');
    var downClass = $(this).attr('class');
    if ($(this).hasClass('downed')) {
      toast('0', '该专辑已下载完成!');
      return;
    }
    if ($(this).hasClass('downing')) {
      toast('0', '该专辑已在下载列表中!');
      return;
    }
    var islogin = parseInt(UserIsLogin());
    if (!islogin) {
      callClientNoReturn("UserLogin?src=login");
      ev.stopPropagation();
      return;
    }
    var flag = $(this).hasClass('downing') || $(this).hasClass('downed');
    if (flag) {
      return;
    }
    callClientNoReturn('CDDown?id=' + id);
  });
}
