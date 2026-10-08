// callClientNoReturn('loadingWait');
// 专区 by deng
(function () {
  var id = ''; //专区id
  var radioid = 0; //电台id
  var status = ''; //电台状态
  var name = ''; //专区名字
  var iconAmdShow = true;
  var noAdmBoxArray = ['儿童', '小说', '相声', '评书', '戏曲', '二人转'];
  var dataCsrc = '';
  var isChannelMv = false;
  // 焦点图相关方法
  // 创建焦点图
  var focusClassArr;
  var focustimer = null;
  var focusindex = 0;
  var focustimerLen = 0;
  var iqiyiInfo = callClient(`IsShowIQiYiIcon?type=mvPageResource`);
  window.onload = function () {
    setSkin();
    var call = "GetRadioNowPlaying";
    var str = callClient(call);
    var url = decodeURIComponent(window.location.href).replace(/###/g, '');
    var msg = getUrlMsg(url);
    radioid = getValue(str, 'radioid');
    status = getValue(str, 'playstatus');
    dataCsrc = getStringKey(msg, 'csrc');
    callClientNoReturn('domComplete');
    // centerLoadingStart("content");
    id = getValue(msg, 'sourceid');
    name = getValue(msg, 'name');
    // channelMv页面
    if (url.indexOf("channel_mv") > -1) {
      isChannelMv = true;
      dataCsrc = "曲库->MV"
    }
    $("body").attr("data-csrc", dataCsrc);
    // getSomeData();
    objBindFn();
    /*
    * 有声读物去除封面专辑标识
    * @author 邢祥超 [20190225]
    * */
    for (var i in noAdmBoxArray) {
      if (name.indexOf(noAdmBoxArray[i]) > -1) {
        iconAmdShow = false;
        break;
      }
    }
  };

  function getSomeData() {
    var url = 'http://mobileinterfaces.kuwo.cn/er.s?type=get_pc_qz_data&f=web&id=' + id + '&prod=pc&ver=1';
    if (url != '') {
      $.ajax({
        url: url,
        dataType: "text",
        type: "get",
        crossDomain: false,
        success: function (data) {
          try {
            loadAreaListData(eval('(' + data + ')'));
          } catch (e) {
            loadErrorPage();
          }
        },
        error: function () {
          loadErrorPage();
        }
      });
    }
  }

  // 加载专区各模块
  function loadAreaListData(jsondata) {
    var data = jsondata;
    for (var i = 0; i < data.length; i++) {
      var dataModel = data[i];
      var type = dataModel.type;
      var list = dataModel.list;
      var label = dataModel.label;
      var mdigest = dataModel.mdigest;
      var mid = dataModel.mid;
      checkEmptyObject(dataModel);
      if (type == 'banner') {
        var replaceList = bannerListReplace(list);
        createIndexFocusList(replaceList);
        initJDT();
        continue;
      } else if (type == '4s') {
        $('#areaModel').append(createAreaChooseTag(list));
      } else {
        getAreaModel(type, label, list, mdigest, mid, i);
      }
    }
    try {
      if (getKwShowArea && typeof getKwShowArea == 'function') {
        getKwShowArea();
      }
    } catch (e) {}
    // centerLoadingEnd("content");
    callClientNoReturn('loadingEnd');
  }
  // 加载专区各模块 end

  /** 获取专区各模块逻辑判断
   * type ui样式 music->歌曲列表 暂不支持
   * label 模块标题
   * list 模块数据
   * mdigest 更多 模块类型 5->分类内容 42->pc暂无转分类
   * mid 更多 模块id,
   * index index
   */
  function getAreaModel(type, label, list, mdigest, mid, index) {
    var data = list;
    var len = data.length;
    var arr = [];
    var more = '';
    var click = '';
    var csrc = dataCsrc;
    if (label != "") {
      if (mdigest == "5" && isChannelMv) csrc = "曲库->分类";
      csrc += '->' + label;
    }
    var other = '|psrc=分类->' + label + '|csrc=' + csrc.replace(/'/g, "-") + '|bread=-2,5,分类,-2|';
    // more 更多
    mdigest = mdigest == "42" ? "5" : mdigest;
    if (mdigest == "5") {
      click = commonClickString(new Node(mdigest, mid, label, mid, '', other, 'area'));
    } else {
      click = commonClickString(new Node(mdigest, mid, label, mid, '', other));
    }
    if (mdigest != '' && mid != '' && label !== 'MV') {
      more = '<span class="more"><a title="更多" href="javascript:;" onclick="' + click + '"><span>更多</span><i class="iconfont icon-more"></i></a></span>';
    }
    var areaTitle = label == '' ? '' : '<h2><span class="title">' + label + '</span>' + more + '</h2>';
    var areaStr = '<div class="areaModelItem">' + areaTitle + '<ul>';
    var ret = getValue(iqiyiInfo, 'ret');
    var locationUrl = decodeURIComponent(window.location.href);
    if (index === 0 && type === 'mvsquare' && ret === '1' && locationUrl.indexOf('channel_mv') > 0) {
      areaStr += getIqiyiInfo();
      var iqyrid = getValue(iqiyiInfo, 'cmdline').split(' ')[1];
      // 日志信息
      realTimeLog('IQY', 'TYPE:show|ENTRY:mv|IQYRID:' + iqyrid);
    }
    // 更多end
    for (var i = 0; i < len; i++) {
      var dataItem = data[i];
      var digest = dataItem.digest;
      var listType = dataItem.type;
      checkEmptyObject(dataItem);
      // 内链，APP推广不支持
      if (listType == "ad" || listType == "app") {
        continue;
      }
      if (digest == "9") {
        // 电台
        var radiocsrc = $('body').attr('data-csrc') + '->' + label;
        arr[arr.length] = createRadioBlock(dataItem, 'area', 0, i, null, radiocsrc);
      } else if (digest == "7") {
        // MV
        var extend = dataItem.extend || '';
        if (isChannelMv) {
          other = '|psrc=MV->' + label + '|csrc=' + csrc.replace(/'/g, "-") + '|bread=-2,3,MV,-2';
        }
        arr[arr.length] = createMVBlock(dataItem, 'area', extend, other, i, label);
      } else if (type == "music") {
        continue;
      } else {
        // 其他（歌手、歌单、专辑。。。）
        if (isChannelMv) {
          csrc = "曲库->MV->" + label;
        }
        arr[arr.length] = createAreaBlock(dataItem, type, digest, name, csrc, iconAmdShow);
      }
    }
    if (arr.join('') == '') {
      return;
    }
    $("#areaModel").append(areaStr + arr.join('') + "</ul></div>");
    areaLazyLoad();
    if (radioid) {
      initRadioStatus(parseInt(status, 10), radioid);
    }
    try{
      setLen();
    }catch(e){}
    // centerLoadingEnd("content");
    callClientNoReturn('loadingEnd');
  }
  // 获取专区各模块逻辑判断 end

  // 事件绑定
  function objBindFn() {
    // 爱奇艺合作点击事件
    $('#areaModel').on('click', '.iqiyiClick', function() {
      var entryId = getValue(iqiyiInfo, 'entryId');
      var cmdline = getValue(iqiyiInfo, 'cmdline');
      var iqyrid = cmdline.split(' ')[1];
      callClientNoReturn('RunIQiYiPlug?entryId=' + entryId + '&cmdline=' + cmdline);
      // 日志信息
      realTimeLog('IQY', 'TYPE:click|ENTRY:mv|IQYRID:' + iqyrid);
    });
  }
  // 事件绑定 end

  // lazyLoad
  $(window).scroll(function() {
    areaLazyLoad();
  });
  $(window).resize(function () {
    try{
      setLen();
      setMnShowBoxPos();
    }catch(e){}
    areaLazyLoad();
    setFocus();
  });

  function areaLazyLoad() {
    setTimeout(function(){
      $(".lazy").each(function (i) {
        var thisobj = $(this);
        var top = thisobj.offset().top;
        if (top <= getContentHeight()) {
          thisobj.removeClass("lazy").attr("src", thisobj.attr("data-original"));
        }
      });
    },100);
  }
  window.parent.window.areaLazyLoad = areaLazyLoad;
  window.parent.window.skinChange = function (type) {
    $("body").removeClass().addClass(type);
  }; 
  function getContentHeight() {
    var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
    contentHeight = ($(window).height() + scrollT);
    return contentHeight;
  }
  // lazyload end

  // 检测数据异常加载loadErrorPage
  function checkEmptyObject(data) {
    if ($.isEmptyObject(data) || data == null || data == undefined) {
      loadErrorPage();
    }
  }

  // 获取是否显示爱奇艺合作页面
  function getIqiyiInfo() {
    var imgUrl = getValue(iqiyiInfo, 'ImgUrl');
    // var duraiton = getValue(iqiyiInfo, 'duraiton');
    var name = getValue(iqiyiInfo, 'name');
    const infoHtml = `<li class="bmv_wrap">
                            <a href="javascript:;" class="bmv_pic iqiyiClick">
                                <span class="bmv_shade"></span>
                                <i title="直接播放" class="i_play i_play_big"></i>
                                <i class="iqiyi-tip"></i>
                                <div class="cover">
                                    <img src="${imgUrl}" onerror="imgOnError(this,140);">
                                </div>
                            </a>
                            <p class="bmv_name">
                                <a class="iqiyiClick" title="${name}" href="javascript:;">${name}</a>
                            </p>
                         </li>`;
    return infoHtml;
  }

  // 焦点图相关开始

  // 过滤焦点图 内链 app推广
  function bannerListReplace(list) {
    var data = [];
    for (var i in list) {
      if (list[i].type != 'ad' && list[i].type != 'app') {
        data.push(list[i]);
      }
    }
    return data.reverse();
  }
  function createIndexFocusList(data) {
    focusClassArr = [];
    // 焦点图图片list模板
    var listModel = loadTemplate('#area_bannerlist .m_bannerImg');
    var item = '';
    var count = 0;
    var len = data.length;
    if (len < 3) return;
    var btnHtml = '';
    while (count < len) {
      checkEmptyObject(data[count]);
      if (sourceISOK(data[count].digest)) {
        data.splice(count, 1);
      } else {
        data[count].indexnum = count;
        count++;
      }
      if (count === len - 1) {
        item = 'focusList_2';
      } else if (count === len) {
        item = 'focusList_1';
      } else if (count === 1) {
        item = 'focusList_last';
      } else {
        item = '';
      }
      data[count - 1].itemClassName = item;
      focusClassArr.push(item);
      var classname = '';
      if (count === 1) {
        classname = 'current';
      }
      btnHtml += '<a href="javascript:;" class="' + classname + '"></a>';
    }
    focusindex = 0;
    var listHtml = drawListTemplate(data, listModel, proIndexFocusData);
    $('#w_focus .focusList').html(listHtml);
    focustimerLen = $('#w_focus .focusList li').length;
    $('#focus_btn').html(btnHtml);
    $('#areaModel').append($('#areaBannerBox').html());
  }

  function proIndexFocusData(obj) {
    var pic = obj.pc_new_focus;
    var source = obj.digest;
    var sourceid = obj.id;
    var name = obj.name.replace(/(\r|\n)/g, '');
    var disname = obj.desc.replace(/(\r|\n)/g, '');
    var titlename = checkSpecialChar(name, 'titlename');
    var csrc = dataCsrc + '->焦点图->' + titlename;
    var id = sourceid;
    var artistid = obj.artistid || '';
    var albumid = obj.albumid || '';
    var iplayFn = '';
    if (source == 21) id = getValue(id, 'id');
    if (source == 21 && sourceid.indexOf('?') > -1) {
      sourceid = sourceid + '&from=areafocus';
    }
    if (source == 7) {
      sourceid = obj.parms;
    }
    // 注释掉，未使用
    // iplayFn = 'iPlay(arguments[0],' + source + ',' + id + ',this); return false;';
    var other = '|csrc=' + csrc;
    var click = commonClickString(new Node(source, sourceid, checkSpecialChar(disname, 'name'), 0, obj.extend, other, 'area', artistid, albumid));
    var indexnum = obj.indexnum;
    var classname = '';
    if (indexnum == 0) {
      classname = 'current';
    }
    if (!pic) {
      pic = 'img/def800.jpg';
    }
    if (pic !== '') {
      pic = changeImgDomain(pic);
    }
    json = {
      'source': source,
      'sourceid': sourceid,
      'classname': classname,
      'name': name,
      'click': click,
      'indexnum': indexnum,
      'pic': pic,
      'itemClassName': obj.itemClassName
    };
    return json;
  }

  function initJDT() {
    checkJDTPlay(0);
    // 进入页面自动开始定时器
    clearInterval(focustimer);
    focustimer = setInterval(nextimg, 5000);
    $('.focusList_1 img').load(function() {
      setFocus();
      $('#focus_btn').css('display', 'block');
    });
    bindJDT();
  }

  // 下一张
  function nextimg() {
    $('#focusplay').hide();
    var $item = $('.focusList li');
    focusClassArr.push(focusClassArr[0]);
    focusClassArr.shift();
    $item.each(function(i, e) {
      $(e).removeClass().addClass(focusClassArr[i]);
    });
    setFocus();
    focusindex++;
    if (focusindex > focustimerLen - 1) {
      focusindex = 0;
    }
    setCurBtn();
  }

  // 上一张
  function previmg() {
    $('#focusplay').hide();
    var $item = $('.focusList li');
    focusClassArr.unshift(focusClassArr[focusClassArr.length - 1]);
    focusClassArr.pop();
    $item.each(function(i, e) {
      $(e).removeClass().addClass(focusClassArr[i]);
    });
    setFocus();
    focusindex--;
    if (focusindex < 0) {
      focusindex = focustimerLen - 1;
    }
    setCurBtn();
  }

  // 设置焦点图的容器高度，各个焦点图的位置
  function setFocus() {
    var $w_focus = $('#w_focus');
    var $focusList_1 = $('.focusList_1');
    var $focusList_2 = $('.focusList_2');
    var $focusList_last = $('.focusList_last');
    var $focusItem = $('.focusList li');
    var focusList_1Wdith = $focusList_1.width();
    var focusList_1Height = $focusList_1.height();
    var middlePos = ($w_focus.width() - focusList_1Wdith) / 2;
    var middlePosPersent = middlePos / focusList_1Wdith;
    // $w_focus.css('height', focusList_1Height);
    // 防止运营配置图片大小不一致导致页面显示错乱问题，将高度统一
    $w_focus.css('height', '202px');
    $w_focus.find('img').css('height', '202px');
    $focusItem.css('transform', `translate3d(${middlePosPersent * $focusList_last.width()}px,${0.05 * $focusList_last.height()}px,0) scale(0.9)`);
    $focusList_last.css('transform', `translate3d(0,${0.05 * $focusList_last.height()}px,0) scale(0.9)`);
    $focusList_1.css('transform', `translate3d(${middlePosPersent*$focusList_1.width()}px,0,0) scale(1)`);
    $focusList_2.css('transform', `translate3d(${(middlePosPersent*100 * 2 + 5)/100*$focusList_2.width()}px, ${0.05 * $focusList_2.height()}px,0) scale(0.9)`);
    $('.focus .prev,.focus .next').css('bottom', (focusList_1Height * 0.9 - 26) / 2 + 'px');
    $('#focusplay').css('left', middlePos + focusList_1Wdith - 40 + 'px');
  }

  // 焦点图绑定事件
  function bindJDT() {
    var leaveFocusTimeout = null;
    // 点击class为focusList_last的元素触发上一张的函数
    $('.focusList_last,.focus .prev').die('click').live('click', function () {
      previmg();
      return false;
    });
    // 点击class为focusList_2的元素触发下一张的函数
    $('.focusList_2,.focus .next').die('click').live('click', function () {
      nextimg();
      return false;
    });
    // 到中间才可以点击
    $('.focusList_1').die('transitionend').live('transitionend', function () {
      var $this = $(this);
      var $focusplay = $('#focusplay');
      $this.addClass('allowClick');
      checkJDTPlay($this.index());
      if ($focusplay.hasClass('isEnter')) $focusplay.show();
    });
    // 焦点图跳转
    $('.focusList li a').die('click').live('click', function () {
      var parent = $(this).parent();
      if (parent.hasClass('allowClick')) {
        eval('(' + parent.attr('data-click') + ')');
      }
    });
    // 鼠标移入w_focus时清除定时器
    $('#focusImg').mouseenter(function (e) {
      clearInterval(focustimer);
      $(this).find('i').show();
      $('#focusplay').addClass('isEnter').show();
      e.stopPropagation();
    });
    $('#focusImg').mouseleave(function () {
      clearInterval(focustimer);
      focustimer = setInterval(nextimg, 5000);
      $(this).find('i').hide();
      $('#focusplay').removeClass('isEnter').hide();
    });
    // 通过底下按钮点击切换
    $('#focus_btn a').mouseenter(function () {
      clearInterval(focustimer);
      var $focusListItem = $('.focusList li');
      var myindex = $(this).index();
      var curIndex = myindex - focusindex;
      if (curIndex == 0) {
        return;
      } else if (curIndex > 0) {
        var newarr = focusClassArr.splice(0, curIndex);
        focusClassArr = $.merge(focusClassArr, newarr);
        $focusListItem.each(function (i, e) {
          $(e).removeClass().addClass(focusClassArr[i]);
        });
      } else if (curIndex < 0) {
        focusClassArr.reverse();
        var oldarr = focusClassArr.splice(0, -curIndex);
        focusClassArr = $.merge(focusClassArr, oldarr);
        focusClassArr.reverse();
        $focusListItem.each(function (i, e) {
          $(e).removeClass().addClass(focusClassArr[i]);
        });
      }
      focusindex = myindex;
      setFocus();
      setCurBtn();
    });
    $('#focus_btn a').mouseleave(function () {
      clearInterval(focustimer);
      focustimer = setInterval(nextimg, 5000);
    });
  }

  // 改变底下按钮的背景色
  function setCurBtn() {
    $('#focus_btn a').eq(focusindex).addClass('current').siblings().removeClass('current').attr('style', '');
  }

  // 检测焦点图是否可播放
  function checkJDTPlay(index) {
    var firstsource = $('.focusList li a').eq(index).attr('data-source');
    var firstsourceid = $('.focusList li a').eq(index).attr('data-sourceid');
    var firstname = $('.focusList li a').eq(index).attr('data-name');
    var $focusplay = $('#focusplay');
    if (firstsource == 1 || firstsource == 4 || firstsource == 8 || firstsource == 12 || firstsource == 13 || firstsource == 21) {
      $focusplay.html('<a data-source="' + firstsource + '" data-sourceid="' + firstsourceid + '" data-name="' + firstname + '" href="javascript:;" hidefocus></a>');
      $focusplay.attr('title', '直接播放');
      if ($focusplay.hasClass('isEnter')) $focusplay.show();
    } else {
      $focusplay.html('').attr('title', '');
    }
  }
})();
// 专区焦点图全部播放
var dataCsrc = '';
function focusPlay() {
  var source = $('#focusplay a').attr('data-source');
  var sourceid = $('#focusplay a').attr('data-sourceid');
  var name = $('#focusplay a').attr('data-name');

  if (source == 21) {
    iPlayPSRC = '专区->焦点图->精选->' + name;
  } else {
    iPlayPSRC = '专区->焦点图->' + name;
  }
  dataCsrc = '曲库->专区->焦点图->' + name;
  if (source == 21) {
    dataCsrc = '曲库->专区->焦点图->精选->' + name + '精选集';
    $.getScript(album_url + 'album/mbox/commhd?flag=1&id=' + sourceid + '&pn=0&rn=' + iplaynum + '&callback=playZhuanTiMusic');
  } else if (source == 1) {
    var url = 'http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&id=' + sourceid + '&callback=playBangMusic&pn=0&rn=' + iplaynum;
    $.getScript(getChargeURL(url));
  } else if (source == 4) {
    var url = search_url + 'r.s?stype=artist2music&artistid=' + sourceid + '&pn=0&rn=' + iplaynum + '&newver=1&callback=playArtistMusic';
    $.getScript(getChargeURL(url));
  } else if (source == 8 || source == 12) {
    var url = 'http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=' + sourceid + '&pn=0&rn=' + iplaynum + '&encode=utf-8&keyset=pl2012&identity=kuwo&pcmp4=1&newver=1&callback=playGeDanMusic';
    $.getScript(getChargeURL(url));
  } else if (source == 13) {
    var url = search_url + 'r.s?stype=albuminfo&albumid=' + sourceid + '&newver=1&callback=playAlbumMusic&alflac=1';
    $.getScript(getChargeURL(url));
  }
}