var currentObj = {};
var pn;
var rn = 80;
window.onload = function () {
  callClientNoReturn('domComplete');
  var url1 = decodeURIComponent(window.location.href);
  // param=url1.substring(url1.indexOf('{'),url1.lastIndexOf('}')+1);
  // if(param!='')OnJump(param);
  centerLoadingStart("content");
  //currentObj = fobj.goldjson;
  pn = getStringKey(currentObj.other, 'pn') || 0;
  getSomeData();
  objBindFn();
};

$(window).resize(function () {
  iframeObj.refresh();
});

function getSomeData() {
  var mvChannelData = getDataByCache('mv-channel');
  if (mvChannelData) {
    try {
      getMvInfoData($.parseJSON(mvChannelData));
    } catch (e) {
      //var url = 'http://album.kuwo.cn/album/mv2015?callback=getMvInfoData';
      //getScriptData(url);
      var url = 'http://album.kuwo.cn/album/mv2015';
      $.ajax({
        url: url,
        dataType: 'jsonp',
        crossDomain: false,
        jsonpCallback: "getMvInfoData",
        success: function (json) {
          getMvInfoData(json);
        }
      });
    }

  } else {
    //var url = 'http://album.kuwo.cn/album/mv2015?callback=getMvInfoData';
    //getScriptData(url);
    var url = 'http://album.kuwo.cn/album/mv2015';
    $.ajax({
      url: url,
      dataType: 'jsonp',
      crossDomain: false,
      jsonpCallback: "getMvInfoData",
      success: function (json) {
        getMvInfoData(json);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        loadErrorPage();
        return;
      }
    });
  }
}

// 创建精选集列表
function getMvInfoData(jsondata) {
  var data = jsondata;
  var contentData = data.data;
  var tagData = contentData.tags;
  var focusData = contentData.sliderImgs;
  createMvTag(tagData);
  createMvFocus(focusData);
}

// 创建MV分类
function createMvTag(jsondata) {
  var child = jsondata;
  var len = child.length;
  var arr = [];
  for (var i = 0; i < len; i++) {
    child[i].pic = child[i].pic2016;
    arr[arr.length] = createMVClassifyBlock(child[i]);
  }
  $(".kw_album_list").html(arr.join('')).prev().show();
  centerLoadingEnd("content");
  iframeObj.refresh();
}

// 创建MV频道页焦点图
function createMvFocus(jsondata) {
  var child = jsondata;
  var len = child.length;
  if (len < 4) return;
  var arr = [];
  var listarr = [];
  for (var i = 0; i < len; i++) {
    var obj = child[i];
    var pic = obj.pic;
    var source = obj.source;
    var sourceid = obj.sourceid;
    var name = obj.info;
    var click = '';
    var id = sourceid;
    if (source == 21) id = getValue(id, 'id');
    var datamv = '';
    var iplayclick = '';
    var oStyle = 'display:none';
    var oClass = '';
    var formats = obj.formats || obj.FORMATS || "";
    var psrc = 'MV->焦点图->' + name;
    var csrc = " "
    if (source == 14 || source == 21) {
      iplayclick = 'iPlay(arguments[0],' + source + ',' + id + ',this); return false;';
    }
    if (i == 0) {
      oStyle = 'display:block';
      oClass = 'current';
    }
    if (source == 7) {
      csrc = 'data-csrc="曲库->MV->焦点图->' + name + '"';
      click = "someMV(this);";
      datamv = decodeURIComponent(sourceid);
      var param = returnSpecialChar(datamv);
      var paramArray = param.split(";");
      var artist = obj.artist;
      var album = paramArray[2];
      var childarray = [];
      childarray[0] = encodeURIComponent(returnSpecialChar(name));
      childarray[1] = encodeURIComponent(returnSpecialChar(artist));
      childarray[2] = encodeURIComponent(returnSpecialChar(album));
      for (var j = 0; j < paramArray.length; j++) {
        if (j < 3) {
          childarray[j] = encodeURIComponent(returnSpecialChar(paramArray[j]));
        } else {
          childarray[j] = paramArray[j];
        }
      }
      psrc = "VER=2015;FROM=曲库->" + psrc;
      psrc = encodeURIComponent(psrc);
      childarray[childarray.length] = psrc;
      childarray[childarray.length] = formats;
      childarray[childarray.length] = getMultiVerNum(obj);
      childarray[childarray.length] = getPointNum(obj);
      childarray[childarray.length] = getPayNum(obj);
      childarray[childarray.length] = getArtistID(obj);
      childarray[childarray.length] = getAlbumID(obj);
      datamv = childarray.join('\t');
      datamv = encodeURIComponent(datamv);
    } else if (source == 40 || source == 21) {
      sourceid += '&jxjType=2016Mbox';
      var other = '|psrc=MV->焦点图->' + name + '|bread=-2,3,MV,-2|csrc=曲库->MV->焦点图->' + name + '精选集';
      click = commonClickString(new Node(source, sourceid, name, 0, '', other));
    } else if (source == 14) {
      var other = '|psrc=MV->焦点图->' + name + '|bread=-2,3,MV,-2|csrc=曲库->MV->焦点图->' + name + '歌单';
      click = commonClickString(new Node(source, sourceid, name, 0, '', other));
    }
    arr[arr.length] = '<a href="###" onclick="';
    arr[arr.length] = click;
    arr[arr.length] = '" title="';
    arr[arr.length] = name;
    arr[arr.length] = '" data-mv="';
    arr[arr.length] = datamv;
    arr[arr.length] = '"';
    arr[arr.length] = csrc;
    arr[arr.length] = 'hidefocus class="pic" style="';
    arr[arr.length] = oStyle;
    arr[arr.length] = '">';
    arr[arr.length] = '<i data-csrc"曲库->MV->焦点图->';
    arr[arr.length] = name;
    arr[arr.length] = '歌单" onclick="';
    arr[arr.length] = iplayclick;
    arr[arr.length] = '" data-ipsrc="MV->焦点图->';
    arr[arr.length] = name;
    arr[arr.length] = '" title="直接播放" class="i_play"></i><img src="';
    arr[arr.length] = pic;
    arr[arr.length] = '" width="620" height="140" onerror="imgOnError(this,620);"></a>';
    listarr[listarr.length] = '<a href="###" title="" hidefocus class="';
    listarr[listarr.length] = oClass;
    listarr[listarr.length] = '" onclick="';
    listarr[listarr.length] = click;
    listarr[listarr.length] = '"><i></i>';
    listarr[listarr.length] = name;
    listarr[listarr.length] = '</a>';
  }
  var liststr = '<div class="focus_list" title="">' + listarr.join('') + '<span class="focus_shade"></span></div>';
  $(".mv_focus").html(arr.join('') + liststr);
  $(".focus").show();
  iframeObj.refresh();
  startMove();
}

var index = 0;
var timer = null;

function startMove() {
  timer = setInterval(function () {
    index++;
    if (index > 3) index = 0;
    tab();
  }, 5000);
}

function tab() {
  $(".focus").children("a").eq(index).show().siblings("a").hide();
  $(".focus_list a").eq(index).addClass("current").siblings("a").removeClass("current");
}

function objBindFn() {
  $(".focus").live("mouseenter", function () {
    clearInterval(timer);
  }).live("mouseleave", function () {
    startMove();
  });
  $(".focus_list a").live("mouseenter", function () {
    index = $(this).index();
    tab();
  });
}
