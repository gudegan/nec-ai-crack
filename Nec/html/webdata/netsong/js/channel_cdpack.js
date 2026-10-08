/**
 *create by deng 2016-9
 */
var pageParamJson;
var pid = 0;
$(function () {
  $('.nodataBox').show();
  callClientNoReturn('domComplete');
  // centerLoadingStart();
  setSkin(setSkinCallback);
  setMenuNum();
  eventbind();
});

function setSkinCallback() {
  var skinColor = skinConfig.skinColor;
  $(".logo_icon i").css("-webkit-filter", `drop-shadow(${skinColor} 69px 0)`);
  $(".nav a i,.page .current,.tagList .active").css("background", skinColor);
  setTypeSkinBg();
}

function setTypeSkinBg() {
  $(".typeList ul li,.typeList ul li").css("background", "");
  $(".typeList ul li.hovered,.typeList ul li.active").css("background", skinConfig.skinColor);
}

/**
 *根据参数，展示不同界面
 */
function OnJump(param) {
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


function setCdPageType() {
  if (getDataByConfig('hificolDown', 'jumpDownTips') == 1) {
    $(".jumpDown label").show();
  }
  if (getDataByConfig('hificolDown', 'jumpLikeTips') == 1) {
    $(".jumpLike label").show();
  }
  var url = decodeURIComponent(window.location.href);
  pid = getValue(url, "pid");
  getCdInexLabel(pid);
  if (pid) {
    $(".cdIndexTop").hide();
    $(".menuPageTop").show();
  } else {
    // $(".cdListBox").css("margin","0")
    $(".menuPageTop").hide();
    var SERVER_URL = "www.kuwo.cn";
    $kw_cdSearchModel.init({
      target: '.searchBox',
      tagModel: 'kw_tagModel',
      searchListModel: 'kw_searchListModel',
      searchListUrl: 'http://' + SERVER_URL + '/pc/cd/getCdSearchLabelInfo',
      page: 1,
      offset: 90,
      order: 'recom'
    });
    getCdList();
  }
}

/**
 *获取菜单标签
 */
function getCdInexLabel(pid) {
  var url = "http://www.kuwo.cn/pc/cd/cdInexLabel?isnew=201707";
  if (pid) url += "&pid=" + pid;
  $.ajax({
    url: url,
    dataType: "text",
    success: function (jsondata) {
      var jsondata = eval('(' + jsondata + ')');
      var data = jsondata.data;
      var labelList = data.labelList;
      if (pid) {
        var infoObj = data.curLabelInfo;
        var shortInfo = infoObj.shortInfo;
        var labelName = infoObj.labelName;
        var pic = infoObj.bigBgPic;
        var tagName = infoObj.className;
        var tagId = infoObj.tagId;
        var richInfo = infoObj.richInfo;
        if (tagName == "tags") tagName = "tag_id";
        $(".cdInfoBox h1").html(labelName);
        if (labelName.indexOf("母带") > -1 || labelName.indexOf("CD") > -1) {
          $(".cdInfoBox h1").addClass("special");
        }
        $(".childLabelList li").eq(0).attr({"data-tagName": tagName, "data-tagId": tagId});
        if (richInfo != "") {
          $(".cdIntroBox p").html(richInfo);
          $(".cdIntroBox").css("display", "inline-block");
        }
        if (labelList.length > 0) {
          var listStr = "";
          for (var i = 0; i < labelList.length; i++) {
            var item = labelList[i];
            var childTagName = item.className;
            if (childTagName == "tags") childTagName = "tag_id";
            listStr += '<li data-tagName="' + childTagName + '" data-tagId="' + item.tagId + '">' + item.labelName + '</li>'
          }
          $(".childLabelList").append(listStr).show();
          // $(".cdListBox").css("margin","0");
        } else {
          $(".menuPageTop .typeList .cdInfoBox").css({"width": "auto", "max-width": "100%"})
        }
        var json = {};
        json['offset'] = 90;
        json['page'] = 1;
        json[tagName] = tagId;
        pageParamJson = json;
        getCdList(0, 0, 0, json);
        // 处理箭头
        setChangeBtnShowHide();
        $(".rightBtn").click(function () {
          $(".leftBtn").show();
          $(".listBox").css("margin", "0 20px 0 20px");
          btnClickCont++;
          if (btnClickCont >= itemLen / changeLen - 1) {
            btnClickCont = itemLen / changeLen - 1;
            $(".rightBtn").hide();
            $(".listBox").css("margin", "0 0 0 20px");
          }
          $(".listBox ul").css("left", -(changeLen * itemWidth * btnClickCont));
        });
        $(".leftBtn").click(function () {
          $(".rightBtn").show();
          $(".listBox").css("margin", "0 20px 0 20px");
          btnClickCont--;
          if (btnClickCont <= 0) {
            btnClickCont = 0;
            $(".leftBtn").hide();
            $(".listBox").css("margin", "0 20px 0 0");
          }
          $(".listBox ul").css("left", -parseInt(changeLen * itemWidth * btnClickCont));
        });
      } else {
        createCdInexLabel(labelList);
      }
    },
    error: function () {

    }
  });
}

/**
 *创建菜单标签
 */
var cdIndexLabelLen = 0;
var isOpen = false;

function createCdInexLabel(data) {
  var model = loadTemplate('#kw_cdInexLabelModel');
  var html = drawListTemplate(data, model, proCdInexLabel);
  $('.cdInexLabel').html(html + '<li class="more"><div class="indexLabelBox"><img src="img/cdpack/second/more.jpg"><div class="splice"></div><span>展开<i class="icon-updown iconup"></i></span></div></li>');
  cdIndexLabelLen = data.length;
  filterCdIndexLabelShowLen();
  $(".cdInexLabel .more").click(function () {
    var $moreSpan = $(this).find("span");
    if (!isOpen) {
      $(".cdInexLabel li").show();
      $moreSpan.html('收起<i class="icon-updown icondown"></i>');
      isOpen = true;
    } else {
      filterCdIndexLabelShowLen();
      $moreSpan.html('展开<i class="icon-updown iconup"></i>');
      isOpen = false;
    }
  });
}

function filterCdIndexLabelShowLen() {
  var menuAllNum = menuNum * 2;
  $('.cdInexLabel li').show();
  $('.more').hide();
  if (cdIndexLabelLen > menuAllNum) {
    $(`.cdInexLabel li:gt(${menuAllNum - 2})`).hide();
    $('.more').show();
  }
  if ($(".indexLabelBox").width() > 230) {
    $(".cdMenu ul li img").css("width", "100%");
  } else {
    $(".cdMenu ul li img").removeAttr("style");
  }
  $(".more span").html('展开<i class="icon-updown iconup"></i>');
  isOpen = false;
}

/**
 *菜单标签数据重定向
 */
function proCdInexLabel(obj) {
  var json = {};
  var name = obj.labelName;
  var pic = obj.smallBg9Pic;
  var type = obj.type;
  var url = obj.url;
  var click = "";
  if (type) {
    click = "commonClick({'source':'" + type + "','sourceid':'" + url + "','id':'" + type + "','extend':'','other':'|csrc=曲库->下载专区->" + name + "'})";
  } else {
    click = "commonClick({'source':'9007','id':'" + obj.id + "'})";
  }
  json = {
    'click': click,
    'pic': pic,
    'name': name
  };
  return json;
}

/**
 *检索
 */
;(function ($, window, document, undefined) {
  var cdSearch = {};//检索对象
  var initObj = {};//入口参数对象
  var typeNameArr = [];
  var isOpen = false;
  var selectFlag = false;
  /**
   *检索入口
   */
  cdSearch.init = function (obj) {
    initObj = obj;
    createSearchStructure();
    cdSearch.paramsData = {
      'page': initObj.page,
      'offset': initObj.offset,
      'order': initObj.order
    };
  }

  /**
   *创建检索相关dom结构
   */
  function createSearchStructure() {
    var structureStr = '<div class="searchCon"><p class="search"><i class="icon iconfont icon-hifi-screen"></i><span>筛选</span></p><p class="select"><i class="icon iconfont icon-sort ui-move"></i><span>推荐</span></p><ul class="selectList"><li class="active">推荐</li><li>最新</li><li>最热</li><li>最大</li><li>最小</li></ul></div><div class="searchList" data-model="' + initObj.searchListModel + '"></div>'
    $(initObj.target).html(structureStr)
    getSearchList();
    bindFnSearch();
  }

  /**
   * 获取检索标签list数据
   */
  function getSearchList() {
    $.ajax({
      url: initObj.searchListUrl,
      dataType: "text",
      success: function (jsondata) {
        var jsondata = eval('(' + jsondata + ')');
        var data = jsondata.data;
        createSearchDom(data, "#kw_searchListModel", proSearchListLabel, $(".searchList"));
        for (var i = 0; i < data.length; i++) {
          var list = data[i].list;
          createSearchDom(list, "#kw_tagModel", proTag, $(".searchList .tagList").eq(i))
        }
        $(".tagList").prepend('<li class="active">全部</li>');
        $(".tagList .active").css("background", skinConfig.skinColor);
      },
      error: function () {
        $('.searchBox').hide();
        $('.lookArtist').hide();
      }
    })
  }

  /**
   * 创建检索
   */
  function createSearchDom(data, model, fn, target) {
    var model = loadTemplate(model);
    var html = drawListTemplate(data, model, fn);
    target.html(html);
  }

  /**
   * 检索大分类标签数据重定向
   */
  function proSearchListLabel(obj) {
    var json = {};
    var typeName = obj.className;
    if (typeName == "tags") typeName = "tag_id";
    typeNameArr.push(typeName);
    json = {
      'label': obj.label,
    };
    return json;
  }

  /**
   * 标签数据重定向
   */
  function proTag(obj) {
    var name = obj.name || obj.tagName;
    var id = obj.id || obj.tagId;
    var typeName = obj.className || '';
    var json = {};
    if (typeName == "tags") typeName = "tag_id";
    json = {
      'name': name,
      'id': id,
      'typeName': typeName
    };
    return json;
  }

  /**
   *检索事件绑定
   */
  function bindFnSearch() {
    var $selectList = $(".selectList,.selectIcon");
    var $searchList = $(".searchList,.searchIcon");
    var tagId = 0;
    var order = 'recom';
    var typeName = null;
    $(".search").live("click", function () {
      var $searchBox = $(".searchBox");
      if (!isOpen) {
        $searchList.show();
        isOpen = true;
      } else {
        $searchList.hide();
        isOpen = false;
      }
      if (selectFlag) {
        $selectList.hide();
        $selectList.hide();
        selectFlag = false;
      }
      return false;
    });
    $(".select").live("click", function () {
      if (!selectFlag) {
        $selectList.show();
        selectFlag = true;
      } else {
        $selectList.hide();
        selectFlag = false;
      }
      if (isOpen) {
        $searchList.hide();
        isOpen = false;
      }
      return false;
    });
    $("body").live("click", function () {
      if (selectFlag) {
        $selectList.hide();
        selectFlag = false;
      }
      if (isOpen) {
        $searchList.hide();
        isOpen = false;
      }
    });
    $(".searchList").live("click", function () {
      return false;
    });
    $(".selectList li").live("click", function () {
      var $this = $(this);
      var selectText = $this.html();
      $(".select span").html(selectText);
      $(".selectList li").removeClass();
      $this.addClass("active");
      $selectList.hide();
      selectFlag = false;
      switch (selectText) {
        case "推荐":
          order = 'recom';
          break;
        case "最新":
          order = 'ctime';
          break;
        case "最热":
          order = 'hot';
          break;
        case "最大":
          order = 'max';
          break;
        case "最小":
          order = 'min';
          break;
      }

      getCdList(typeName, tagId, order);
    });
    $(".tagList li").live("click", function () {
      var $this = $(this);
      var index = $this.parents(".item").index();
      typeName = typeNameArr[index];
      $this.addClass("active").css("background", skinConfig.skinColor).siblings().removeClass().css("background", "");
      tagId = $this.attr("data-tagId");
      getCdList(typeName, tagId, order);
      isOpen = true;
    });
    $(".tagList li").live({
      "mouseenter": function () {
        $(this).css("background", skinConfig.skinColor);
      },
      "mouseleave": function () {
        if (!$(this).hasClass("active")) {
          $(this).css("background", "");
        }
      }
    });
  }

  window.$kw_cdSearchModel = cdSearch;
})(jQuery, window, document);

/**
 *获取cd列表
 */

function getCdList(typeName, id, orderType, pagejson, from) {
  var url = 'http://cdapi.kuwo.cn/album/list';
  var postData = {};
  if (pagejson != null) {
    postData = pagejson;
  } else {
    if (from == 'hot') {
      $kw_cdSearchModel.paramsData = {};
      $kw_cdSearchModel.paramsData['offset'] = 90;
      $kw_cdSearchModel.paramsData['page'] = 1;
    }
    if (orderType) $kw_cdSearchModel.paramsData['order'] = orderType;
    if (typeName != null) $kw_cdSearchModel.paramsData[typeName] = id;
    postData = $kw_cdSearchModel.paramsData;
  }
  if (getDataByConfig('cdpack', 'isOnline') == "1") {
    postData.online_status = 5;
  }
  $.ajax({
    url: url,
    dataType: "text",
    type: "post",
    crossDomain: false,
    data: postData,
    success: function (str) {
      var jsondata = eval('(' + str + ')');
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
        // centerLoadingEnd();
        cdLoadImages();
        initCDStatus();
        $(".page .current").css("background", skinConfig.skinColor);
        return;
      } else if (jsondata.status == 1 && jsondata.msg == 'No data') {
        $(".cdListBox").html("");
        $(".page").html("");
        $('.nodataBox').show();
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
        tagArr.push(`<em>${tag_name}</em>`);
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
    'type': tagArr.join("|"),
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
  var channelName = "hifi_music";
  if (pid) {
    channelName = "hifidownloadtagdetail";
  }
  callClientNoReturn('GetDownloadCDList?type=all&channel=' + channelName + '&asyncparam=' + channelName);
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

// menu适配
var menuNum = 5;

function setMenuNum() {
  var windowWidth = window.screen.width;
  if (windowWidth >= 700 && windowWidth <= 1116) {
    menuNum = 5;
  } else if (windowWidth >= 1117 && windowWidth <= 1430) {
    menuNum = 6;
  } else if (windowWidth >= 1431) {
    menuNum = 7;
  }
}

var itemWidth = 0,
  boxWidth = 0,
  changeLen = 0,
  itemLen = 0,
  btnClickCont = 0;

function setChangeBtnShowHide() {
  itemWidth = $(".listBox li").width() + 10;
  boxWidth = $(".listBox").width() - 10;
  changeLen = Math.floor(boxWidth / itemWidth);
  itemLen = $(".listBox li").length;
  $(".rightBtn,.leftBtn").hide();
  if (itemLen > changeLen) {
    $(".rightBtn").show();
  }
  btnClickCont = 0;
  $(".listBox ul").css("left", 0);
  $(".listBox").css("margin", "0 20px 0 0");
}

// menu适配结束
function eventbind() {
  $(window).scroll(function () {
    cdLoadImages();
  });
  $(window).resize(function () {
    setChangeBtnShowHide();
    setMenuNum();
    cdLoadImages();
    filterCdIndexLabelShowLen();
  });
  $(".page a").live("click", function () {//翻页部分
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
    if (pageParamJson) {
      json = pageParamJson;
      json['page'] = pn;
    } else {
      var tagId = $('.searchList .tagList').eq(0).find('.active').attr('data-tagid');
      var sampling_type = $('.searchList .tagList').eq(1).find('.active').attr('data-tagid');
      var media_type = $('.searchList .tagList').eq(2).find('.active').attr('data-tagid');
      var artist_id = $('.searchList .tagList').eq(3).find('.active').attr('data-tagid');
      var sortType = $('.select span').html();
      switch (sortType) {
        case '推荐':
          sortType = 'recom';
          break;
        case '最新':
          sortType = 'ctime';
          break;
        case '最热':
          sortType = 'hot';
          break;
        case '最大':
          sortType = 'max';
          break;
        case '最小':
          sortType = 'min';
          break;
      }
      if (tagId) {
        json['tag_id'] = tagId;
      }
      if (sampling_type) {
        json['sampling_type'] = sampling_type;
      }
      if (media_type) {
        json['media_type'] = media_type;
      }
      if (artist_id) {
        json['artist_id'] = artist_id;
      }
      json['order'] = sortType;
      json['offset'] = 90;
      json['page'] = pn;
    }
    $(window).scrollTop(0);
    getCdList(0, 0, 0, json);
  });
  $(".childLabelList li").live("click", function () {
    var $this = $(this);
    var index = $this.index();
    var tagName = $this.attr("data-tagName");
    var tagId = $this.attr("data-tagId");
    var $all = $(".childLabelList li").eq(0);
    if ($this.hasClass("active")) {
      if (index != 0) {
        $this.removeClass('active hovered');
        $all.addClass("active");
        setTypeSkinBg();
        if (tagName && tagId) {
          tagName = $all.attr("data-tagName");
          tagId = $all.attr("data-tagId");
          pageParamJson = {};
          pageParamJson['page'] = 1;
          pageParamJson['offset'] = 90;
          pageParamJson[tagName] = tagId;
          getCdList(0, 0, 0, pageParamJson);
        }
      }

    } else {
      $(".childLabelList li").removeClass('active hovered');
      $this.addClass("active");
      setTypeSkinBg();
      if (tagName && tagId) {
        if (index == 0) {
          pageParamJson = {};
          pageParamJson['page'] = 1;
          pageParamJson['offset'] = 90;
          pageParamJson[tagName] = tagId;
        } else {
          pageParamJson[tagName] = tagId;
          pageParamJson['page'] = 1;
        }
        getCdList(0, 0, 0, pageParamJson);
      }
    }

  });
  $(".childLabelList li").live("mouseenter", function () {
    $(".childLabelList li").removeClass('hovered');
    $(this).addClass("hovered");
    setTypeSkinBg();
  });
  $(".childLabelList li").live("mouseleave", function () {
    $(this).removeClass("hovered");
    setTypeSkinBg();
  });
  $(".cdIntroBox i").click(function () {
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
	$(".jumpLike").click(function(){//收藏
		$(".jumpLike label").hide();
		setDataToConfig('hificolDown','jumpLikeTips','0');
		commonClick({'source':'9005','name':'cdLikePage'});
	});
	$(".jumpDown").click(function(){//下载
		$(".jumpDown label").hide();
		setDataToConfig('hificolDown','jumpDownTips','0');
		commonClick({'source':'9003','name':'cdDownPage'});
	});
	$(".lookArtist").click(function(){
		commonClick({'source':'9008','name':'cdpackArtistList'});
	});
}

function callDownLoadIconfn(ev, ele) {
  var click = "";
  var id = $(ele).attr('data-id');
  var flag1 = $(ele).hasClass('i_downing') || $(ele).hasClass('i_downover');
  var flag2 = $(ele).parents('li').find('.j_cdDown').hasClass('cdDownIng') || $(ele).parents('li').find('.j_cdDown').hasClass('cdDownOver') || $(ele).parents('li').find('.j_cdDown').hasClass('cd_downplay');
  if (flag1 || flag2) {
    if ($(ele).attr("class").indexOf("ng") > -1) {
      toast('0', '该专辑已在下载列表中!');
    } else if ($(ele).attr("class").indexOf("ver") > -1) {
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

function cdTips(str, id, type, clickStr) {
  var click = commonClickString(new Node('9003', id, "cd包下载页", id));
  if (type == 'downOver') {
    click = clickStr;
  }
  if (!$(".cdTips").html()) {
    $("body").append("<div class='cdTips'><div><i class='iconfont icon-tips'></i><p><span></span><a href='javascript:;'>去看看</a></p></div></div>");
  }
  $(".cdTips span").html(str);
  var $cdTips = $(".cdTips");
  if (!$cdTips.is(":hidden")) {
    return
  }
  $cdTips.show();
  var timeout = setTimeout(function () {
    $cdTips.hide();
  }, 2000);
  $(".cdTips").hover(function () {
    clearTimeout(timeout);
  }, function () {
    timeout = setTimeout(function () {
      $cdTips.hide();
    }, 2000);
  });
  $(".cdTips a").live("click", function () {
    $cdTips.hide();
    setTimeout(function () {
      setDataToConfig('hificolDown', 'tabtype', type);
      eval(click);
    }, 100);
  });
  $(".cdTips a").css("color", skinConfig.linkColor);
}

