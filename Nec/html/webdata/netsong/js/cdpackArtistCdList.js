/**
 *create by deng 2016-9
 */
var artistId;
$(function () {
  callClientNoReturn('domComplete');
  // centerLoadingStart();
  var url = decodeURIComponent(window.location.href);
  artistId = getValue(url, 'id');
  getCdArtistInfo(artistId);
  OnJump();
  eventbind();
  setSkin(setSkinCallback);
});

function setSkinCallback() {
  var skinColor = skinConfig.skinColor;
  $('.logo_icon i').css('-webkit-filter', `drop-shadow(${skinColor} 69px 0)`);
  $('.nav a i,.sub_nav .current').css('background', skinColor);
  if (skinConfig.type !== 'default') {
    $('.page .current').css({ 'background': skinConfig.skinColor, 'color': '#fff' });
  } else {
    $('.page .current').css({ 'background': skinConfig.skinColor, 'color': '#000' });
  }
}

/**
 *获取cd包歌手信息
 */
function getCdArtistInfo(artistId) {
  var url = "http://cdapi.kuwo.cn/artist/detail?id=" + artistId;
  $.ajax({
    url: url,
    type: "get",
    dataType: "json",
    success: function (jsondata) {
      if (jsondata.status == 0 && jsondata.msg == 'ok') {
        var artistInfoData = jsondata.data;
        var intro = artistInfoData.intro;
        var cdCnt = artistInfoData.album_num || 0;
        var artistName = artistInfoData.artname;
        $(".artistCdListTop h1").html(artistName).attr("title", artistName);
        $(".artistCdListTop .cover").attr("src", artistInfoData.pic);
        if (intro) {
          $(".cdIntro p").html(intro);
        } else {
          $(".artistIntroBox").hide();
        }
        $(".cdCnt").html("HIFI专辑数量：" + cdCnt);
        getCdList(artistId, 1);
      } else if (jsondata.status == 1 && jsondata.msg == 'No data') {
        $(".artistCdListTop").hide();
        $(".cdListBox").html("");
        $(".page").html("");
        $('.nodataBox').show();
        // centerLoadingEnd();
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

/**
 *获取cd列表
 */
function getCdList(artistId, page) {
  var offset = 90;
  var url = 'http://cdapi.kuwo.cn/album/list?artist_id=' + artistId + '&page=' + page + '&offset=' + offset;
  $.ajax({
    url: url,
    type: "get",
    dataType: "json",
    success: function (jsondata) {
      if (jsondata.status == 0 && jsondata.msg == 'ok') {
        var cdData = jsondata.data.rows;
        if (cdData.length == 0) {
          $('.nodataBox').show();
        } else {
          $('.nodataBox').hide();
        }
        createCDList(cdData);
        var total = jsondata.data.total;
        var pn = jsondata.pn || 1;
        var totalPage = Math.ceil(total / 90);
        var currentPn = parseInt(pn, 10);
        var pageStr = createPage(totalPage, currentPn);
        if (pageStr) {
          $('.page').html(pageStr).show();
        } else {
          $('.page').html('').hide();
        }
        cdLoadImages();
        initCDStatus();
        if (skinConfig.type !== 'default') {
          $('.page .current').css({ 'background': skinConfig.skinColor, 'color': '#fff' });
        } else {
          $('.page .current').css({ 'background': skinConfig.skinColor, 'color': '#000' });
        }
        // centerLoadingEnd();
        return;
      } else if (jsondata.status == 1 && jsondata.msg == 'No data') {
        $(".cdListBox").html("");
        $(".page").html("");
        $('.nodataBox').show();
        // centerLoadingEnd();
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

/**
 *创建cd列表
 */
function createCDList(data) {
  var model = loadTemplate('#kw_cdlistModel');
  var html = drawListTemplate(data, model, proCDData);
  $('.cdListBox').html(html);
}

/**
 *cd列表数据重定向
 */
function proCDData(obj) {
  var json = {};
  var name = obj.alname;
  var cdname = checkSpecialChar(name, 'disname');
  cdname = cdname.replace(/\^/g, '&amp;');
  var artistname = checkSpecialChar(obj.artist, 'disname');
  var clickname = encodeURIComponent(name);
  clickname = clickname.replace(/'/g, '\\\'');
  var id = obj.id;
  var cdInfo = obj.phrase;
  var notype = '';
  var tags = obj.tags;
  var tagArr = [];
  var wordNum = 0;
  if (tags.length > 0) {
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
  } else {
    notype = 'notype';
  }
  var downTimes = obj.down_no;
  if (downTimes > 100000) {
    downTimes = parseFloat(downTimes / 10000).toFixed(1) + "W";
  }
  var click = commonClickString(new Node('9001', id, clickname, id, '', ''));
  var iclick = 'callDownLoadIconfn(arguments[0],this);'
  var size = obj.size || 0;
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
  var pic = obj.img || '';
  if (pic) {
    pic = changeImgDomain(pic);
    pic = pic.replace(/.jpg/, '_360.jpg');
  } else {
    pic = 'img/cdpack/second/default.png';
  }
  var isMd = "";
  if (obj.media_type == "母带") isMd = '<div class="cdIcon">母带</div>';
  json = {
    'cdname': cdname,
    'artistname': artistname,
    'id': id,
    'type': tagArr.join("/"),
    'size': size,
    'notype': notype,
    'pic': pic,
    'click': click,
    'iclick': iclick,
    'cdInfo': cdInfo,
    'downTimes': downTimes,
    'isMd': isMd
  };
  return json;
}

/**
 *cd列表事件绑定
 */

function initCDStatus() {
  callClientNoReturn('GetDownloadCDList?type=all&channel=hificollect&asyncparam=hificollect');
}

function ReplaceFinishedJumpChannel(strCdid) {

  var CdObj = $('.cd_' + strCdid);
  if (CdObj == 'undefined') {
    return;
  }
  var strClick = CdObj.find('.cdimg').attr("onclick") || '';
  if (strClick.length > 0) {
    strClick = strClick.replace('9001', '9006');
    CdObj.find('.cdimg').attr("onclick", strClick);
  }
}

function CDResultCallback(str) {
  if (str == null || str == '') {
    return;
  }

  var rst = '';
  rst = getValue(str, 'result');
  rst = decodeURIComponent(rst);
  if (rst == null || rst == '') {
    return;
  }

  //在这个地方开始数据处理
  //console.log(rst);
  try {
    rst = eval('(' + rst + ')');
  } catch (e) {
    rst = {};
  }
  var downingArr = rst.downing || [];
  if (downingArr.length > 0) {
    for (var i = 0; i < downingArr.length; i++) {
      $('.cd_' + downingArr[i].cdid).find('.j_i_down').addClass('i_downing').removeClass('i_down');
      $('.cd_' + downingArr[i].cdid).find('.j_cdDown').addClass('cdDownIng').removeClass('cdDownIcon');
    }
  }
  var downOverArr = rst.complete || [];
  if (downOverArr.length > 0) {
    for (var i = 0; i < downOverArr.length; i++) {
      $('.cd_' + downOverArr[i].cdid).find('.j_i_down').addClass('i_downover').removeClass('i_down');
      $('.cd_' + downOverArr[i].cdid).find('.j_cdDown').addClass('cdDownOver').removeClass('cdDownIcon');
      ReplaceFinishedJumpChannel(downOverArr[i].cdid);
    }
  }
}

function cdLoadImages() {
  var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
  var clientH = document.documentElement.clientHeight;
  var scrollB = scrollT + clientH;
  var imgs = $('.lazy');
  imgs.each(function (i) {
    if ($(this).offset().top < scrollB) {
      if ($(this)[0].getAttribute('data-original') !== '{$pic}') {
        $(this)[0].setAttribute('src', $(this)[0].getAttribute('data-original'));
        $(this).removeClass('lazy');
      }
    }
  });
}

function eventbind() {
  $(window).scroll(function () {
    cdLoadImages();
  });
  $(window).resize(function () {
    cdLoadImages();
  });
  // 翻页部分
  $(".page a").live("click", function() {
    var json = {};
    var oClass = $(this).attr("class") || '';
    if (oClass.indexOf("no") > -1) return;
    // centerLoadingStart();
    var goPnNum = $(this).html();
    if (goPnNum == '上一页') {
      pn = parseInt($(".page .current").html()) - 1;
    } else if (goPnNum == '下一页') {
      pn = parseInt($(".page .current").html()) + 1;
    } else {
      pn = parseInt($(this).html());
    }
    $(window).scrollTop(0);
    getCdList(artistId, pn);
  });
  $(".artistInfoBox .lookIntro").click(function () {
    var $cdIntro = $(".cdIntro");
    if ($cdIntro.is(":hidden")) {
      $cdIntro.show();
    } else {
      $cdIntro.hide();
    }
    return false;
  });
  $("body").click(function () {
    var $cdIntro = $(".cdIntro");
    $cdIntro.hide();
  });
  $(".jumpLike").click(function () {
    $(".jumpLike label").hide();
    setDataToConfig('hificolDown', 'jumpLikeTips', '0');
    commonClick({'source': '9005', 'name': 'cdLikePage'});
  });
  $(".jumpDown").click(function () {
    $(".jumpDown label").hide();
    setDataToConfig('hificolDown', 'jumpDownTips', '0');
    commonClick({'source': '9003', 'name': 'cdDownPage'});
  });
  $(".lookArtist").click(function () {
    commonClick({'source': '9008', 'name': 'cdpackArtistList'});
  });
}

function callDownLoadIconfn(ev, ele) {
  var click = "";
  var id = $(ele).attr('data-id');
  var flag1 = $(ele).hasClass('i_downing') || $(ele).hasClass('i_downover');
  var flag2 = $(ele).parents('li').find('.j_cdDown').hasClass('cdDownIng') || $(ele).parents('li').find('.j_cdDown').hasClass('cdDownOver') || $(ele).parents('li').find('.j_cdDown').hasClass('cd_downplay');
  if (flag1 || flag2) {
    if ($(ele).attr('class').indexOf('ng') > -1) {
      toast('0', '该专辑已在下载列表中!');
    } else if ($(ele).attr('class').indexOf('ver') > -1) {
      toast('0', '该专辑已下载完成!');
    }
    ev.stopPropagation();
    return;
  }
  var islogin = parseInt(UserIsLogin());
  if (!islogin) {
    callClientNoReturn("UserLogin?src=login");
    ev.stopPropagation();
    return;
  }
  //cdPlayCallback($(ele));

  callClientNoReturn('CDDown?id=' + id);
  ev.stopPropagation();
}


function cdPlayCallback(id) {
  var oParent = $('.cd_' + id);
  var down_t_img = oParent.find('.topImg');
  var cd_pic = oParent.find('.toppic');
  var cd_content_pic = oParent.find('.bottompicBox');
  var i_down = oParent.find('.j_i_down');
  var cd_down = oParent.find('.j_cdDown');
  down_t_img.addClass('downpaly');
  cd_pic.addClass('cdpicplay');
  cd_down.addClass('cd_downplay');
  setTimeout(function () {
    cd_content_pic.addClass('cdpicchengeplay');
    var offset = $("#target")[0].getBoundingClientRect();
    var img = cd_content_pic.children('img').attr('src');//获取当前点击图片链接
    down_t_img.removeClass('downreturnpaly downpaly');

  }, 300);
}

function CDStatusNotify(str) {
  //console.log(str);
  var msgArr = str.split('&');
  var msgtype = msgArr[0].split('=')[1];
  var id = msgArr[1].split('=')[1];
  switch (msgtype) {
    case 'cdinsert':
      cdPlayCallback(id);
      setCDState(id, 'cdinsert');
      $(".jumpDown label").show();
      setDataToConfig('hificolDown', 'jumpDownTips', '1');
      break;
    case 'cdfinish':
      setCDState(id, 'cdfinish');
      $(".jumpDown label").show();
      setDataToConfig('hificolDown', 'jumpDownTips', '1');
      break;
    case 'cddlgclose':
      var type = msgArr[1].split('=')[1];
      break;
    case 'cdfail':
      //setCDState(id,'cdfail');
      break;
    case 'cddel':
      var ids = msgArr[1].split('=')[1];
      var idArr = ids.split(',');
      for (var i = 0; i < idArr.length; i++) {
        setCDState(idArr[i], 'cddel');
      }
      break;
    case 'loginstatus':
      var status = msgArr[1].split('=')[1];
      if (status == 'login') {
        initCDStatus();
      } else {//logout
        setCDState(null, 'logout');
      }
      break;
  }
}

function setCDState(id, state) {
  if (state == 'cdinsert') {
    $('.cd_' + id).find('.j_i_down').addClass('i_downing').removeClass('i_down');
    $('.cd_' + id).find('.j_cdDown').addClass('cdDownIng').removeClass('cdDownIcon');
    return;
  }
  if (state == 'cdfinish') {
    $('.cd_' + id).find('.j_i_down').addClass('i_downover').removeClass('i_downing').removeClass('i_down');
    $('.cd_' + id).find('.j_cdDown').addClass('cdDownOver').removeClass('cdDownIng').removeClass('cdDownIcon');
    ReplaceFinishedJumpChannel(id);
    return;
  }
  if (state == 'cdfail' || state == 'cddel') {
    $('.cd_' + id).find('.j_i_down').addClass('i_down').removeClass('i_downing').removeClass('i_downover');
    $('.cd_' + id).find('.j_cdDown').addClass('cdDownIcon').removeClass('cdDownIng').removeClass('cdDownOver');
    return;
  }
  if (state == 'logout') {
    $('.j_i_down').each(function (i) {
      var flag = $(this).hasClass('i_down');
      if (!flag) {
        $(this).addClass('i_down').removeClass('i_downing').removeClass('i_downover');
      }
    });
    $('.j_cdDown').each(function (i) {
      var flag = $(this).hasClass('cdDownIcon');
      if (!flag) {
        $(this).addClass('cdDownIcon').removeClass('cdDownIng').removeClass('cdDownOver');
      }
    });
  }
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
}

// 创建页码
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
