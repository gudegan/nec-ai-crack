var id = '';
var status = '3';
var nCurIndex = -1;
var blogin = false;
var GuidLen = 36;
var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
var globalGuid = '';
var sortType = 'sortByAddTime';
var strUid = '';
var strsid = '';
var JsonObj = '';
var JsonUserColl = '';
var GET_USER_COLLECT_CDS = 'http://cdapi.kuwo.cn/collection/list';
var DEL_USER_COLL_CD = 'http://cdapi.kuwo.cn/collection/del';
var isLikePage = getValue(decodeURIComponent(location.href), "type") == "cdLikePage";
var importData = [];
var importDataIndex = 0; // 自定义生成id的初始值
const defaultName = 'importId';
$(function () {
  callClientNoReturn('domComplete');
  realTimeLog("HIFI_LOG", "TYPE:ENTER_HIFI_COLLECT_PAGE");
  InitData();
  if (!isLikePage) {
    $(".tabBox").show();
    $(".titleBox").removeClass("likePage");
    $(".jumpDown").addClass("active").append("<i></i>");
  } else {
    $(".jumpLike").addClass("active").append("<i></i>");
  }
  if(getDataByConfig('hificolDown', 'jumpLikeTips')== '1'){
    $(".jumpLike label").show();
  }
  if(getDataByConfig('hificolDown', 'jumpDownTips')== '1'){
    $(".jumpDown label").hide();
  }
  setSkin(setSkinCallback);
});
function setSkinCallback() {
  var skinColor = skinConfig.skinColor;
  $(".logo_icon i").css("-webkit-filter", `drop-shadow(${skinColor} 69px 0)`);
  $(".nav a i,.page .current,.tagList .active,.nocd-btn").css("background", skinColor);
  if (skinConfig.type !== 'default') {
    $('.nocd-btn').css('color', '#fff');
  } else {
    $('.nocd-btn').css('color', '#000');
  }
  setTabSkin();
}

function setTabSkin() {
  $(".tab .active").css("background", skinConfig.skinColor).siblings().css("background", "");
}

function InitData() {
  InitParam();
  AsynGetUserCDlist();
}

/*
    type:
    downOver:下载完成的页面
    downing:正在下载的页面
    collect:收藏页面
*/
function TransDownTab(strType) {
  var tagIndex = 0;
  if (isLikePage) {
    tagIndex = 2;
  } else {
    if (strType == 'downOver') {
      tagIndex = 0;
    } else if (strType == 'downIng') {
      tagIndex = 1;
    } else {
      tagIndex = 0;
    }
  }
  $('.tabBox a').eq(tagIndex).click();
}

function freshall() {
  InitParam();
  BuildCDList();
  BindAllEvent();
  InitAllStatus(id, status);
  InitSel();
  SetButtonStatus();
}

function InitSel() {
  return;
  var select = document.getElementById("kw_select");
  select.options[0].selected = true;
  SortSelChg(select);
}

function SetColBtnStatus() {
  var ObjColl = $('.coll_top_tag .kw_select');
  ObjColl.attr('enable', 1);

  var nCnt = document.getElementById('user_packet_collect').childElementCount;
  if (nCnt <= 0) {
    ObjColl.attr('enable', 0);
  }
}


function SetButtonStatus() {
  var ObjAllStart = $('.underwayOperationBox .all_start');
  var ObjAllPause = $('.underwayOperationBox .all_stop');
  var ObjClearAll = $('.underwayOperationBox .all_del');

  ObjAllStart.attr('enable', '1');
  ObjAllPause.attr('enable', '1');
  ObjClearAll.attr('enable', '1');

  var nCnt = document.getElementById('user_packet_undownload').childElementCount;
  if (nCnt <= 0) {
    ObjAllStart.attr('enable', '0');
    ObjAllPause.attr('enable', '0');
    ObjClearAll.attr('enable', '0');
  }
}

function InitPage() {
  $('#finished_packet').html('');
  $('#user_packet_undownload').html('');
  $('#user_packet_collect').html('');
  $('#nocdBox').hide();
  $('.login_guide').hide();
  SetCDPacKetNum(0, 0);
  SetCDPacKetNum(1, 0);
  SetCDPacKetNum(2, 0);
}


function SetPageIconShow(blogin) {
  SetButtonStatus();
  var tabtype = getDataByConfig('hificolDown', 'tabtype');
  var cdObj = $('#nocdBox');
  var logObj = $('.login_guide');
  cdObj.hide();
  logObj.hide();
  if (!parseInt(blogin) && tabtype == 'collect') {
    logObj.show();
    return;
  }

  var nCnt = 0;
  var OthCnt = 0;
  var objFin = $('.finishContentBox');

  var iconHtml = '';
  if (tabtype == '' || tabtype == null) {
    setDataToConfig('hificolDown', 'tabtype', 'downOver');
    tabtype = 'downOver';
  }

  if (tabtype == 'downIng') {
    nCnt = document.getElementById('user_packet_undownload').childElementCount;
    if (isLikePage) {
      nCnt = document.getElementById('user_packet_collect').childElementCount;
    }
    OthCnt = document.getElementById('finished_packet').childElementCount;
    if (nCnt <= 0) {
      if (isLikePage) {
        iconHtml = '<div class="no-data-box no-like-img"></div><p class="no-data-text">还没有收藏过内容</p><p class="no-data-btn"><a class="nocd-btn" href="javascript:;" onclick="goHIFIDownPage();">去下载专区看看</a></p>';
      } else {
        iconHtml = '<div class="hifi-no-data"></div>' +
            '        <p class="p1">HiFi 音乐功能已停止服务</p>' +
            '        <p class="p2">您在播放歌曲时，可通过选择音质，</p>' +
            '        <p class="p2">继续享受品质音乐~</p>';
        // iconHtml = '<div class="no-data-box no-download-img"></div><p class="no-data-text">所有下载任务已经完成~</p><p class="no-data-btn"><a class="nocd-btn" href="javascript:;" onclick="JumpPageToFin();">快去听听吧</a></p>';
      }
    }
  } else if (tabtype == 'downOver' || tabtype == 'collect') {
    nCnt = document.getElementById('finished_packet').childElementCount;
    if (isLikePage) {
      nCnt = document.getElementById('user_packet_collect').childElementCount;
    }
    if (nCnt <= 0) {
      // iconHtml = '<div class="no-data-box no-download-img"></div><p class="no-data-text">还没有下载过内容</p><p class="no-data-btn"><a class="nocd-btn" href="javascript:;" onclick="goHIFIDownPage();">去下载专区看看</a>';
      iconHtml = '<div class="hifi-no-data"></div>' +
          '        <p class="p1">HiFi 音乐功能已停止服务</p>' +
          '        <p class="p2">您在播放歌曲时，可通过选择音质，</p>' +
          '        <p class="p2">继续享受品质音乐~</p>';
      if (isLikePage) {
        iconHtml = '<div class="no-data-box no-like-img"></div><p class="no-data-text">还没有收藏过内容</p><p class="no-data-btn"><a class="nocd-btn" href="javascript:;" onclick="goHIFIDownPage();">去下载专区看看</a>';
      }
      iconHtml += '</p>';
    }
  }
  var downCnt = document.getElementById('finished_packet').childElementCount;
  var undownCnt = document.getElementById('user_packet_undownload').childElementCount;
  console.log('downCnt',downCnt, undownCnt )
  $('.tabBox ').show();
  if (downCnt <= 0) {
    $('.tabBox ').hide();
    iconHtml = '<div class="hifi-no-data"></div>' +
        '        <p class="p1">HiFi 音乐功能已停止服务</p>' +
        '        <p class="p2">您在播放歌曲时，可通过选择音质，</p>' +
        '        <p class="p2">继续享受品质音乐~</p>';
    $('.underwayContentBox').hide()
    cdObj.show();
  }
  if (downCnt > 0 && tabtype == 'downIng') {
    iconHtml = '<div class="hifi-no-data"></div>' +
        '        <p class="p1">HiFi 音乐功能已停止服务</p>' +
        '        <p class="p2">您在播放歌曲时，可通过选择音质，</p>' +
        '        <p class="p2">继续享受品质音乐~</p>';
    $('.underwayContentBox').hide()
    cdObj.show();
  }
  document.getElementById('nocdBox').innerHTML = iconHtml;
  $('.nocd-btn').css('background', skinConfig.skinColor);
  if (skinConfig.type !== 'default') {
    $('.nocd-btn').css('color', '#fff');
  } else {
    $('.nocd-btn').css('color', '#000');
  }
  if (nCnt <= 0) {
    cdObj.show();
  }
  // $('.tabBox ').show();
  // $('.underwayContentBox').show()

  return;
}


function OnLeaveChanel() {

}

function OnLogout() {
  freshall();
}

function OnLogin(param) {
  freshall();
}

function JumpPageToFin() {
  TransDownTab('downOver');
  return false;
}

function GetUserInfo() {
  var clientString = callClient("UserState?src=user");
  var uid = getValue(clientString, 'uid');
  var sid = getValue(clientString, 'sid');

  if (uid == '') {
    uid = 0;
  }

  if (sid == '') {
    sid = 0;
  }

  return {
    'uid': uid,
    'sid': sid
  };
}


function TransTimeToInt(strtime) {
  var timestamp = Date.parse(new Date(strtime));
  timestamp = timestamp / 1000;
  return timestamp;
}

function InitParam() {
  globalGuid = '';
  id = '';
  status = '3';
  nCurIndex = -1;
  blogin = false;
  strUid = '0';
  strsid = '0';

  sortType = getDataByConfig('hificolDown', 'sorttype');
  if (sortType == '' || sortType == null) {
    sortType = 'sortByAddTime';
  }
  setDataToConfig('hificolDown', 'sorttype', sortType);

  var userinfo = GetUserInfo();
  strUid = userinfo.uid;
  strsid = userinfo.sid;

  if (parseInt(strUid) && parseInt(strsid)) {
    blogin = 1;
  } else {
    blogin = 0;
  }

  JsonObj = '';
  JsonUserColl = [];

  InitPage();
  var nowPlaying = GetNowPlaying();
  if (nowPlaying == '' || nowPlaying == null) {
    InitAllStatus(id, status);
    return;
  }

  var alid = getValue(nowPlaying, 'CdAlbumId');
  if (alid.indexOf('importId') > -1) {
    alid = alid.substr(0, alid.indexOf('importId') - 1);
  }
  if (alid == '' || alid == null) {
    return;
  }

  id = alid;
  var sta = getValue(nowPlaying, 'Status');
  status = sta;
}

function BuildCDListByRst(JsonStr) {

  if (JsonStr == null || JsonStr == '') {
    return;
  }

  JsonObj = eval('(' + JsonStr + ')');

  BuildCompleteBlock(JsonObj);
  BuildUnFinBLocks(JsonObj);
  if (isLikePage) {
    CollTotal(strUid, strsid, blogin);
  }
  SetPageIconShow(blogin);
}

function CreateCollectionCDLists(JsonAllObj, jsonarrCol) {

  if (typeof (jsonarrCol) == 'undefined' || jsonarrCol == '' || jsonarrCol == null) {
    return;
  }

  var JsonFinished = JsonAllObj["complete"];
  var JsonUnFin = JsonAllObj["downing"];

}

function CopyArrayData(arr) {
  var arr2 = [];
  if (arr.length == 0) {
    return arr2;
  }

  for (var i = 0; i < arr.length; i++) {
    var tmp = arr[i];
    arr2.push(tmp);
  }
  return arr2;
}


/*strtype:
    all:全部的数据按钮
    downloaded:用户已经下载完成的
    undownload:未下载的
    这一块数据最后创建，就不用再从和本地列表中取的数据来进行比较
    直接和界面上的数据比较就行了
*/
function BuildCollBlock(dataArrTotal, strtype) {

  $('#user_packet_collect').html('');
  var dataArr = CopyArrayData(dataArrTotal);

  var FinObj;
  for (var nIndex = 0; nIndex < dataArr.length;) {
    var DesObj = '';
    var cdid = dataArr[nIndex]["id"];

    FinObj = $('#' + cdid);
    if (typeof (FinObj) != 'undefined' && FinObj.length > 0) {

      if (strtype == 'all') {   //收藏下的全部选项按钮
        DesObj = FinObj.get(0).cloneNode(true);
        var status = $(DesObj).attr('down_status');
        if (status != 'collect' && status != 'downed') {
          $(DesObj).find('.cdPicBox').find('.cdshadow').show();
        }
        $(DesObj).attr('downedtime', dataArr[nIndex]["utime"]);
      }
      else if (strtype == 'downloaded') {
        //收藏下的已下载选项按钮
        var status = FinObj.attr('down_status');
        if (FinObj.attr('down_status') != 'downed') {
          //如果找到的下载状态不是已经下载的，则直接从数据里删除掉
          dataArr.splice(nIndex, 1);
          continue;
        }
        else {
          DesObj = FinObj.get(0).cloneNode(true);
          $(DesObj).attr('downedtime', dataArr[nIndex]["utime"]);
          $(DesObj).find('.cdPicBox').find('.down_percent').html('');
        }
      }
      else if (strtype == 'undownloaded') {
        //界面上有相应的内容，且为未下载，则从数据中删除相应的数据项
        //收藏夹下的未下载选项按钮
        //console.log('####FFFFFFF####');
        dataArr.splice(nIndex, 1);
        continue;
      }
    }

    if (FinObj.length > 0 && $(DesObj).length > 0) {
      //如果数据有效，添加后把相应的数据w从数组中删除掉
      var id = $(DesObj).attr('id');
      $(DesObj).attr('id', id + '_coll');
      $('#user_packet_collect').get(0).appendChild(DesObj);
      dataArr.splice(nIndex, 1);
    } else {
      ++nIndex;
    }
  }

  if (strtype == 'undownloaded' || strtype == 'all') {
    var model = loadTemplate('#kw_cdpacket_coll_lists');
    var htmlStr = drawListTemplate(dataArr, model, DealWithColl);
    $('#user_packet_collect').append(htmlStr);
    cdloadImages();
  }

  initCanvasRing();
  SetCDPacKetNum(2, $('#user_packet_collect li').length);
  SetPageIconShow(blogin);
  var sorttype = getDataByConfig('hificolDown', 'sorttype');
  if (sorttype == '' || sorttype == null) {
    sorttype = 'sortByAddTime';
  }

  var nsortIndex = 0;
  var sortName
  if (sorttype == 'sortByAddTime') {
    nsortIndex = 0;
  } else if (sorttype == 'sortByAlbumName') {
    nsortIndex = 2;
  } else if (sorttype == 'sortByArtist') {
    nsortIndex = 1;
  }

  $('.kw_select span')[0].innerHTML = $('.sel_list li').eq(nsortIndex).get(0).innerHTML;
  var sort = SortCollCDByType(sorttype);
  $('#user_packet_collect').html();
  $('#user_packet_collect').append(sort);

}


function GetUserCollectedCDPacket(strUId, strsid, blogin) {

  var url = GET_USER_COLLECT_CDS + '?uid=' + strUId + '&sid=' + strsid + '&order=utime';
  $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    success: function (json) {
      if (json.msg == 'ok' && parseInt(json.status) == 0) {

        var FinObj;
        var dataArr = json["data"];

        //把用户收藏的列表数据给存起来
        JsonUserColl = CopyArrayData(dataArr);
        var BtnType = getDataByConfig('hificolDown', 'collBtntype');
        if (BtnType == '' || BtnType == null) {
          BtnType = 'all';
        }
        var nSelIndex = GetIndexByBtntabType(BtnType);
        $('.coll_top_tag a').removeClass('active');
        $('.coll_top_tag a').eq(nSelIndex).addClass('active');
        setTabSkin();
        BuildCollBlock(dataArr, BtnType);
      } else if (parseInt(json.status) == 1 && json.msg == 'Error: no data.') {
        JsonUserColl = [];
        SetCDPacKetNum(2, 0);
        $('#user_packet_collect').html('');
        SetPageIconShow(blogin);
      } else {
        return;
      }
    },
    error: function () {
      console.log(' Error ### url:' + url);
      return;
    }
  });
}

function GetIndexByBtntabType(strBtnType) {
  var nIndex = 0;
  if (strBtnType == '' || strBtnType == null || strBtnType == 'all') {
    return nIndex;
  }

  if (strBtnType == 'undownloaded') {
    nIndex = 2;
  } else if (strBtnType == 'downloaded') {
    nIndex = 1;
  }

  return nIndex;
}


function DealWithColl(obj) {

  var json = [];
  var id = obj.id;
  var pic = obj.img;
  if (pic != '' && pic != null) {
    if (pic.indexOf('_720.jpg') > 0) {
      pic = pic.replace('_720.jpg', '_150.jpg');
    }
  }

  var albulname = obj.alname;
  var atrtistname = obj.artist;
  var downtime = obj.utime;

  var iconShow = obj.media_type == '母带' ? 'media_type_nor' : 'media_type_hide';

  json = {
    'albumid': id,
    'pic': pic,
    'albumname': albulname,
    'artname': atrtistname,
    'downtime': downtime,
    'icon_show_type': iconShow
  }
  return json;

}

function BuildCompleteBlock(JsonAllObj) {
  var nlen = 0;
  var JsonFinished = JsonAllObj["complete"];
  if (typeof (JsonFinished) != 'undefined' && JsonFinished != null && JsonFinished != '') {
    nlen = JsonFinished.length;
    SetCDPacKetNum(0, nlen);
    CreateCDListsFromTemplate(JsonFinished, 'finish');
  } else {
    SetCDPacKetNum(0, 0);
  }
}

function BuildUnFinBLocks(JsonAllObj) {

  var nlen = 0;
  var JsonUnFinished = JsonAllObj["downing"];
  if (typeof (JsonUnFinished) != 'undefined' && JsonUnFinished != null && JsonUnFinished != '') {
    nlen = JsonUnFinished.length;
    SetCDPacKetNum(1, nlen);
    CreateCDListsFromTemplate(JsonUnFinished, 'other');
  } else {
    SetCDPacKetNum(1, 0);
  }
}

function BuildCDList() {
  var JsonStr = GetUserCDlists();
  if (JsonStr == '' || JsonStr == null) {
    return;
  }

  var JsonObj = eval('(' + JsonStr + ')');
  BuildCompleteBlock(JsonObj);
  BuildUnFinBLocks(JsonObj);
  CollTotal(strUid, strsid, blogin);

  SetPageIconShow(blogin);
}

function BindAllEvent() {
  objBindEvent();
  BindOper();
  BindMouseEvent();
}


function CollChgDisType() {

  if ($(this).hasClass('active')) {
    return;
  }

  $('.coll_top_tag a').removeClass('active');
  $(this).addClass('active');
  setTabSkin();
  var inner = $(this).html();
  if (inner.indexOf('全部') == 0) {
    setDataToConfig('hificolDown', 'collBtntype', 'all');
    BuildCollBlock(JsonUserColl, 'all');
  }

  if (inner.indexOf('已下载') == 0) {
    setDataToConfig('hificolDown', 'collBtntype', 'downloaded');
    BuildCollBlock(JsonUserColl, 'downloaded');
  }

  if (inner.indexOf('未下载') == 0) {
    setDataToConfig('hificolDown', 'collBtntype', 'undownloaded');
    BuildCollBlock(JsonUserColl, 'undownloaded');
  }
}

function MenuClick(ev) {

  SortCollItem(ev);

  var innerhtml = $(this).html();

  if (innerhtml.indexOf('按添加时间') == 0) {
    sortType = 'sortByAddTime';
  } else if (innerhtml.indexOf('按专辑名称') == 0) {
    sortType = 'sortByAlbumName';
  } else if (innerhtml.indexOf('按艺术家') == 0) {
    sortType = 'sortByArtist';
  }

  setDataToConfig('hificolDown', 'sorttype', sortType);
  $('.kw_select span')[0].innerHTML = innerhtml;

  var sort = SortCollCDByType(sortType);
  $('#user_packet_collect').html();
  $('#user_packet_collect').append(sort);

}

function SortCollCDByType(strType) {

  var liArr = [];
  var liObj = $("#user_packet_collect li");
  for (var nIndex = 0; nIndex < liObj.length; nIndex++) {
    liArr[nIndex] = liObj[nIndex];
  }

  var strattr = '';
  var bflag = true;

  if (strType == 'sortByAlbumName') {
    strattr = '.albumName';
    //liArr.sort();
  } else if (strType == 'sortByArtist') {
    strattr = '.artistName';
    //liArr.sort();
  } else if (strType == 'sortByAddTime') {
    bflag = false;
  }

  var objS = '';
  var objD = '';
  var temp;

  for (var i = 0; i < liArr.length; i++) {
    for (var j = i + 1; j < liArr.length; j++) {

      var ObjS = liArr[i];
      var ObjD = liArr[j];

      if (typeof (ObjD) == 'undefined' || typeof (ObjS) == 'undefined') {
        continue;
      }

      if (bflag) {
        objS = $(liArr[i]).find(strattr).get(0).innerHTML;
        objD = $(liArr[j]).find(strattr).get(0).innerHTML;
      } else {
        objS = $(liArr[i]).attr('downedtime');
        objD = $(liArr[j]).attr('downedtime');
      }

      if (bflag) {
        var brst = objS.localeCompare(objD);
        if (parseInt(brst) >= 0) {
          temp = liArr[i];
          liArr[i] = liArr[j];
          liArr[j] = temp;
        }
      } else {
        if (CompareInt64Time(objS, objD) < 0) {
          temp = liArr[i];
          liArr[i] = liArr[j];
          liArr[j] = temp;
        }
      }
    } //内层循环结束
  } //外层循环结束

  return liArr;

}

function CompareFun(paraleft, paramright) {

}


function SetTabSelState() {
  var bShow = $('.sel_list').isShow();
  if (bShow) {
    $('.kw_select i').removeClass('tri_press_up');
    $('.sel_list').hide();
  }
}

function SortCollItem(ev) {
  var bShow = $('.sel_list').isShow();
  if (bShow) {
    $('.kw_select i').removeClass('tri_press_up');
    $('.sel_list').hide();
  } else {
    $('.kw_select i').addClass('tri_press_up');
    $('.sel_list').show();
  }

  ev.stopPropagation();
  return false;

}

function DownLoadTypeChg() {
  if ($(this).parent().hasClass("tab")) {
    $('.tabBox a').removeClass('active');
    $(this).addClass('active');
  }
  setTabSkin();
  var inner = $(this).html();
  $('.hr_sep_left').hide();
  var tab = '';
  if (inner.indexOf('已下载') == 0) {
    // HIFI导入按钮
    $('.cdDownOver').hide();
    $('.underwayContentBox,.underwayOperationBox').hide();
    $('.finishContentBox').show();
    $('.CD_Collections').hide();
    setDataToConfig('hificolDown', 'tabtype', 'downOver');
    SetTabSelState();
  }

  if (inner.indexOf('下载中') == 0) {
    // HIFI导入按钮
    $('.cdDownOver').hide();
    $('.underwayContentBox,.underwayOperationBox').show();
    $('.finishContentBox').hide();
    $('.CD_Collections').hide();
    setDataToConfig('hificolDown', 'tabtype', 'downIng');
    SetInfoTipRedDot(false);
    setDataToConfig('hificolDown', 'reddotshow', '0');
    SetTabSelState();
  }
  if (inner.indexOf('收藏夹') == 0) {
    $('.underwayContentBox,.underwayOperationBox').hide();
    $('.finishContentBox').hide();
    $('.CD_Collections').show();
    $('.hr_sep_left').show();
  }
  SetPageIconShow(blogin);
}

function objBindEvent() {
  $('.tabBox a').die("click").live('click', DownLoadTypeChg);
  $('.coll_top_tag a').die("click").live('click', CollChgDisType);
  $('.i_start,.i_progress,.i_wait').live('mouseenter', function () {
    var parent = $(this).parent()[0];
    var progress = parseInt(parent.querySelector('.down_percent').innerHTML);
    if (progress == 0) {
      return;
    }
    inte(progress, parent, true);
  });
  $('.i_start,.i_progress,.i_wait').live('mouseleave', function () {
    var parent = $(this).parent()[0];
    var progress = parseInt(parent.querySelector('.down_percent').innerHTML);
    if (progress == 0) {
      return;
    }
    inte(progress, parent);
  });

  $('.kw_select').die("click").live('click', SortCollItem);
  $('.sel_list li').die("click").live('click', MenuClick);
    $(".jumpDown").click(function(){//下载
        $(".jumpDown label").hide();
        setDataToConfig('hificolDown','jumpDownTips','0');
        commonClick({'source':'9003','name':'cdDownPage'})
    });
    $(".jumpLike").click(function(){//收藏
        $(".jumpLike label").hide();
        setDataToConfig('hificolDown','jumpLikeTips','0');
        commonClick({'source':'9005','name':'cdLikePage'})
    });
}


function BindOper() {
  $('.time').unbind('click').bind('click', ShutDownOnTime);
  $('.seting').unbind('click').bind('click', OnSetting);
  $('.cdDownOver .cdPackageImport').unbind('click').bind('click', cdPackImport);
  $('.underwayOperationBox .all_del').unbind('click').bind('click', DelAllUnFinished);
  $('.underwayOperationBox .all_start').unbind('click').bind('click', StartAllTasks);
  $('.underwayOperationBox .all_stop').unbind('click').bind('click', PausepAllTasks);
  $('.login_btn').unbind('click').bind('click', GuideUserLogin);
}


function OnJump(str) {
  if (getDataByConfig('hificolDown', 'jumpDownTips') == '1') {
    $(".jumpDown label").hide();
  } else {
    $(".jumpDown label").hide();
  }
  if (getDataByConfig('hificolDown', 'jumpLikeTips') == '1') {
    $(".jumpLike label").show();
  } else {
    $(".jumpLike label").hide();
  }
  var nCntUnFin = document.getElementById('user_packet_undownload').childElementCount;
  var nCntFin = document.getElementById('finished_packet').childElementCount;
  var nCntCol = document.getElementById('user_packet_collect').childElementCount;


  var tabtype = getDataByConfig('hificolDown', 'tabtype');
  if (tabtype == '' || tabtype == null) {
    tabtype = 'downOver';
  }

  if (tabtype == 'downIng') {
    if (nCntUnFin <= 0) {
      if (nCntUnFin <= 0) {
        if (nCntCol > 0) {
          tabtype = 'collect';
        } else if (nCntFin > 0) {
          tabtype = 'downOver';
        }
      }
    }

  }

  if (tabtype == 'collect') {
    if (nCntCol <= 0) {
      if (nCntCol <= 0) {
        if (nCntUnFin > 0) {
          tabtype = 'downIng';
        } else if (nCntFin > 0) {
          tabtype = 'downOver';
        }

      }
    }
  }

  if (tabtype == 'downOver') {
    if (nCntFin <= 0) {
      if (nCntUnFin > 0) {
        tabtype = 'downIng';
      } else if (nCntCol > 0) {
        tabtype = 'collect';
      }
    }
  }

  TransDownTab(tabtype);
}

function BindMouseEvent() {
  $('#finished_packet .cdPicBox').live("mouseenter", MouseEnterFun);
  $('#finished_packet .cdPicBox').live("mouseleave", MouseLeaveFun);

  $('#user_packet_collect .cdPicBox').live("mouseenter", MouseEnterFunColl);
  $('#user_packet_collect .cdPicBox').live("mouseleave", MouseLeaveFunColl);

  $('.underwayOperationBox .all_start').live("mouseenter", BtnMouseEnter);
  $('.underwayOperationBox .all_stop').live("mouseenter", BtnMouseEnter);
  $('.underwayOperationBox .all_del').live("mouseenter", BtnMouseEnter);

  $('.underwayOperationBox .all_start').live("mouseleave", BtnMouseLeave);
  $('.underwayOperationBox .all_stop').live("mouseleave", BtnMouseLeave);
  $('.underwayOperationBox .all_del').live("mouseleave", BtnMouseLeave);

  $('#finished_packet .cdPicBox').unbind("click").live("click", PicCliJump);
  $('#finished_packet .albumName').unbind("click").live("click", PicCliJump);
  $('#finished_packet .artistName').unbind("click").live("click", PicCliJump);

  $('#user_packet_undownload .cdPicBox').unbind("click").live("click", UnderWayPicCliJump);
  $('#user_packet_undownload .albumName').unbind("click").live("click", UnderWayPicCliJump);
  $('#user_packet_undownload .artistName').unbind("click").live("click", UnderWayPicCliJump);


  $('#user_packet_collect .cdPicBox').unbind("click").live("click", CollPicCliJump);
  $('#user_packet_collect .albumName').unbind("click").live("click", CollPicCliJump);
  $('#user_packet_collect .artistName').unbind("click").live("click", CollPicCliJump);

  BindBtnEvent();
}

function BindBtnEvent() {
  //给相应按钮绑定相应的状态
  $('#user_packet_undownload .i_fail').unbind('click').bind('click', ReDownLoad);
  $('#user_packet_undownload .i_start').unbind('click').bind('click', StartDownLoad);
  $('#user_packet_undownload .i_progress').unbind('click').bind('click', PauseDownLoad);
  $('#user_packet_undownload .i_wait').unbind('click').bind('click', PauseDownLoad);


  $('#user_packet_collect li i.i_fail').live('click', ReDownLoad);
  $('#user_packet_collect li i.i_start').live('click', StartDownLoad);
  $('#user_packet_collect li i.i_progress').live('click', PauseDownLoad);
  $('#user_packet_collect li i.i_wait').live('click', PauseDownLoad);
}

function dealIdSuffix(id, strfix) {

  if (id == '' || id == null) {
    return '';
  }

  var index = id.indexOf(strfix);
  if (index > 0) {
    return id.substring(0, (index));
  } else {
    return id;
  }
}


function ReDownLoad(ev) {
  var id = $(this).parent().parent().attr('id');
  id = dealIdSuffix(id, '_');

  var Obj = $('#' + id);
  if ($(this).parent().find('.canvas_1').css('display') == 'none') {
    $(this).parent().find('.canvas_1').show();
  }
  if ($(this).parent().find('.canvas_2').css('display') == 'none') {
    $(this).parent().find('.canvas_2').show();
  }
  ChgStatusTo(Obj, 'cdstart');
  var call = "CDDownloadOperate?method=start&ids=" + id;
  callClientNoReturn(call);
  ev.stopPropagation();
}

function StartDownLoad(ev) {
  var id = $(this).parent().parent().attr('id');
  id = dealIdSuffix(id, '_');
  var Obj = $('#' + id);
  ChgStatusTo(Obj, 'cdstart');
  var call = "CDDownloadOperate?method=start&ids=" + id;
  callClientNoReturn(call);
  $(this).mouseenter();
  ev.stopPropagation();
}

function PauseDownLoad(ev) {
  var id = $(this).parent().parent().attr('id');
  id = dealIdSuffix(id, '_');
  var Obj = $('#' + id);
  ChgStatusTo(Obj, 'cdpause');
  var call = "CDDownloadOperate?method=pause&ids=" + id;
  callClientNoReturn(call);
  $(this).mouseenter();
  ev.stopPropagation();
}

//得到正在的歌曲的信息
function GetNowPlaying() {
  var call = "GetPlayingSongListInfo";
  var rst = callClient(call);
  return rst;
}

function BuildClickString(strChannel, id, name) {
  var click = commonClickString(new Node(strChannel, id, name, id, '', ''));
  return click;
}


function SetShowRedDotOnListName(strid, strkey, strvalue) {
  if (strid == '' || strid == null) {
    return;
  }
  var realId;
  for (var i = 0; i < importData.length; i++) {
    if (strid == importData[i].defaultId) {
      realId = importData[i].createId;
    }
  }
  var dotObj = $('#' + realId + ' i ').eq(4);
  if (strvalue == '1') {
    if (!dotObj.hasClass('list_red_dot')) {
      dotObj.addClass('list_red_dot');
    }
  } else if (strvalue == '0') {

    if (dotObj.hasClass('list_red_dot')) {
      dotObj.removeClass('list_red_dot');
    }
  }

  var call = 'SetDownloadCDInfo?type=property&id=' + strid + '&key=' + strkey + '&value=' + strvalue;
  callClientNoReturn(call);
}

function IsCDPacketExist(strCDId) {

  if (strCDId == '' || strCDId == null) {
    return 0;
  }

  var strcall = 'CDPacketExist?id=' + strCDId;
  var strRet = callClient(strcall);

  if (strRet == '' || strRet == null) {
    return 0;
  }

  var isImportFlag = false;
  for (var i = 0; i < importData.length; i++) {
    if (strCDId == importData[i].defaultId) {
      if (importData[i].createId.indexOf('importId') > -1) {
        isImportFlag = true;
      }
    }
  }
  
  var Ret = parseInt(getValue(strRet, 'bexist'));
  return [Ret, isImportFlag];
}

function CollPicCliJump(ev) {

  var status = $(this).parents("li").attr('down_status');
  var consid = $(this).parents("li").attr('id');
  consid = dealIdSuffix(consid, '_');

  var name = $(this).parents("li").find('.albumName').get(0).innerHTML;
  name = checkSpecialChar(name, 'name');


  if (status == 'downed') {

    var bExist = IsCDPacketExist(consid)[0];
    if (!parseInt(bExist)) {
      CDPacketNotExist('你的专辑已移出默认路径或删除');
      ev.stopPropagation();
      return;
    }

    var ret = BuildClickString(9006, consid, name);
    eval(ret);

  } else {
    var ret = BuildClickString(9001, consid, name);
    eval(ret);
  }

  ev.stopPropagation();
  return false;
}


function callDownLoadIconfn(ev, ele) {
  var click = "";
  var id = $(ele).attr('data-id');
  var flag1 = $(ele).hasClass('i_downing') || $(ele).hasClass('i_downover') || $(ele).hasClass('i_downplay');
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

  callClientNoReturn('CDDown?id=' + id);
  ev.stopPropagation();
}

function PicCliJump(ev) {
  var id = $(this).parents("li").attr('id');
  var jumpId = $(this).parents("li").attr('id');
  var realId;
  for (var i = 0; i < importData.length; i++) {
    if (id == importData[i].createId) {
      realId = importData[i].defaultId;
    }
  }
  id = dealIdSuffix(realId, '_');
  var bExist = IsCDPacketExist(id)[0];
  var isImportFlag = IsCDPacketExist(realId)[1];
  if (!parseInt(bExist)) {
    CDPacketNotExist('你的专辑已移出默认路径或删除', isImportFlag);
    ev.stopPropagation();
    return;
  }

  SetShowRedDotOnListName(id, 'showRedDot', '0');
  var createid;
  for (var i = 0; i < importData.length; i++) {
    if (id == importData[i].defaultId) {
      createid = importData[i].createId;
    }
  }
  $('#' + createid + ' i ').eq(3).removeClass('list_red_dot');
  var name = $(this).parents("li").find('.albumName').get(0).innerHTML;
  name = checkSpecialChar(name, 'name');
  if ($(this).parents("li").attr('down_status') === 'import') {
    id = id + '|' + jumpId;
  }
  var ret = BuildClickString(9006, id, name);
  eval(ret);
  ev.stopPropagation();
  return false;
}

function UnderWayPicCliJump(ev) {

  var id = $(this).parents("li").attr('id');
  id = dealIdSuffix(id, '_');
  var name = $(this).parents("li").find('.albumName').get(0).innerHTML;
  name = checkSpecialChar(name, 'name');
  var ret = BuildClickString(9001, id, name);
  eval(ret);

  ev.stopPropagation();
  return false;
}

function CDContextMenu(ele) {
  var _this = $(ele);
  var status = _this.parent().attr('down_status');
  var id = _this.parent().attr('id');
  var realId;
  for (var i = 0; i < importData.length; i++) {
    if (id == importData[i].createId) {
      realId = importData[i].defaultId;
    }
  }
  id = dealIdSuffix(realId, '_');
  var downType = '';
  var tabtype = getDataByConfig('hificolDown', 'tabtype');
  if (!isLikePage) {
    if (status == 'downed') {
      downType = 'downedcd';
    } else if (status == 'import') {
      downType = 'import';
    } else {
      downType = 'downingcd';
    }
  } else {
    downType = 'collectedcd';
  }
  var call = 'ShowCDMenu?type=' + downType + '&id=' + id;
  callClientNoReturn(call);
}


function CDCollSynOper(strPar) {

  if (strPar == '' || strPar == null) {
    return;
  }

  var oper = getValue(strPar, 'oper');
  if (oper == 'add' || oper == 'remove') {
    CollTotal(strUid, strsid, blogin);
  }
}

function CDCollToOper(strParam) {

  if (strParam == '' || strParam == null) {
    return;
  }

  var alid = getValue(strParam, 'id');
  var oper = getValue(strParam, 'oper');

  if (oper == 'remove') {
    CancelCDCollect(alid);
  }
}

function CancelCDCollect(strid) {
  if (strid == '' || strid == null) {
    return;
  }

  var url = DEL_USER_COLL_CD + '?uid=' + strUid + '&sid=' + strsid + '&aid=' + strid;

  $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    success: function (json) {
      if (json.msg == 'ok' && parseInt(json.status) == 0) {
        try {
          var Obj = $('#' + strid + '_coll');
          if (typeof(Obj) != 'undefined' && Obj.length > 0) {
            document.getElementById('user_packet_collect').removeChild(Obj[0]);
            for (var nIndex = 0; nIndex < JsonUserColl.length; nIndex++) {
              var ObjId = JsonUserColl[nIndex].id;
              if (ObjId == id) {
                JsonUserColl.splice(nIndex, 1);
                break;
              }
            }
            SetPageIconShow(blogin);
            SetCDPacKetNum(2, $('#user_packet_collect').get(0).childElementCount);
            CollTotal(strUid, strsid, blogin);
            var call = 'PageCollOper?id=' + id + '&oper=remove' + '&channel=hifidownloaddetail';
            callClientNoReturn(call);

          }
        } catch (e) {
          console.log(e.message);
        }
      }
    },
    error: function () {
      console.log(' Error ### url:' + url);
      return;
    }
  });

}

function InitStatus(obj) {
  obj.find('.play_icon_normal').hide();
  obj.find('.play_icon').hide();
  obj.find(".cdshadow").hide();
  obj.find(".play_icon_pause").hide();
  $('.underwayCDListBox li .cdshadow').css('display', "block");
}

function MouseLeaveFun() {
  $(this).removeClass('on');
  InitStatus($(this));

  var status = $(this).parent().attr("c-status");
  if (status == "1" || status == "4") {
    $(this).find(".play_icon").show();
    $(this).find(".cdshadow").show();
  } else if (status == "2") //暂停状态
  {
    $(this).find(".play_icon_pause").show();
    $(this).find(".cdshadow").show();
  } else {
    $(this).find(".cdshadow").hide();
  }
}

function BtnMouseEnter() {

  if ($(this).attr('enable') == '0') {
    return;
  }

  if (!$(this).hasClass('button_hover')) {
    $(this).addClass('button_hover');
  }
}

function MouseEnterFunColl() {

  if ($(this).hasClass('on')) {
    return;
  }

  $(this).addClass('on');
  InitStatus($(this));

  var CurStatus = $(this).parent().attr("c-status");
  var downstatus = $(this).parent().attr("down_status");

  if (downstatus != 'downed' && downstatus != 'collect') {
    $(this).find(".cdshadow").show();
    return;
  }

  $(this).find('.cdshadow').show();
  $(this).find('.i_down').show();


  if (CurStatus == "1" || CurStatus == "4") {
    $(this).find(".play_icon").show();
    $(this).find(".cdshadow").show();
  } else if (CurStatus == "2") //暂停状态
  {
    $(this).find(".play_icon_pause").show();
    $(this).find(".cdshadow").show();
  } else {
    $(this).find(".play_icon_normal").show();
    $(this).find('.play_icon_normal').unbind('click').bind('click', PlayAllCurSongs);
  }

}

function MouseLeaveFunColl() {

  $(this).removeClass('on');
  InitStatus($(this));

  var downstatus = $(this).parent().attr("down_status");
  if (downstatus != 'downed' && downstatus != 'collect' && downstatus != 'import') {
    $(this).find(".cdshadow").show();
    return;
  }

  $(this).find('.i_down').hide();

  var status = $(this).parent().attr("c-status");
  if (status == "1" || status == "4") {
    $(this).find(".play_icon").show();
    $(this).find(".cdshadow").show();
  } else if (status == "2") //暂停状态
  {
    $(this).find(".play_icon_pause").show();
    $(this).find(".cdshadow").show();
  }
}


function BtnMouseLeave() {

  $(this).removeClass('button_hover');
}

function MouseEnterFun() {
  if ($(this).hasClass('on')) {
    return;
  }

  $(this).addClass('on');
  InitStatus($(this));

  var CurStatus = $(this).parent().attr("c-status");
  if (CurStatus == "1" || CurStatus == "4") {
    $(this).find(".play_icon").show();
    $(this).find(".cdshadow").show();
  } else if (CurStatus == "2") //暂停状态
  {
    $(this).find(".cdshadow").show();
    $(this).find(".play_icon_pause").show();
  } else {
    $(this).find(".cdshadow").show();
    $(this).find(".play_icon_normal").show();
    $(this).find('.play_icon_normal').unbind('click').bind('click', PlayAllCurSongs);
  }
}

function PlayAllCurSongs(ev) {
  var id = $(this).parent().parent().attr('id');
  id = dealIdSuffix(id, '_');
  var realId;
  for (var i = 0; i < importData.length; i++) {
    if (id == importData[i].createId) {
      realId = importData[i].defaultId;
    }
  }
  var bExist = IsCDPacketExist(realId)[0];
  var isImportFlag = IsCDPacketExist(realId)[1];
  if (!parseInt(bExist)) {
    CDPacketNotExist('你的专辑已移出默认路径或删除!', isImportFlag);
    return;
  }
  var call = 'CDPlayMusic?type=all&id=' + realId;
  callClientNoReturn(call);

  SetShowRedDotOnListName(realId, 'showRedDot', '0');
  ev.preventDefault();
  return false;
}

//0:表示未下载完的包的数据
function SetCDPacKetNum(nType, nCnt) {
  if (nType == 0) {
    $('.tabBox .finish').get(0).innerHTML = '已下载<span>' + nCnt + '</span>';
  } else if (nType == 1) {
    // $('.tabBox .underway').get(0).innerHTML = '下载中<span>' + nCnt + '</span>';
    $('.tabBox .underway').get(0).innerHTML = '下载中<span>0</span>';
  } else if (nType == 2) {
    $('.collect_total').get(0).innerHTML = '共' + nCnt + '张专辑';
  }
}

function CreateCDListsFromTemplate(jsonarr, strtype) {
  var template = '';
  if (strtype == 'finish') {
    template = '#finished_packet';
  } else {
    template = '#user_packet_undownload';
  }

  var model = loadTemplate('#kw_cdpacket_lists');
  var htmlStr = drawListTemplate(jsonarr, model, DealWithAllRadioData);
  $(template).html(htmlStr);
  if (template == '#user_packet_undownload') {
    //渲染边
    initCanvasRing();
    for (var i = 0; i < jsonarr.length; i++) {
      var id = jsonarr[i].cdid;
      var parent = document.getElementById(id);
      var progress = jsonarr[i].progress;
      if (progress == 0) {
        continue;
      }
      if (jsonarr[i].downstate == 'fail') {
        continue;
      }
      inte(progress, parent);
    }
  }
  cdloadImages();
}


function GetMediaTypebByHzBit(strParam) {

  var iconShow = 'media_type_hide';
  var type = 16;
  var bitarr = strParam.split('/');
  if (bitarr.length > 1) {
    type = parseInt(bitarr[0]);
    if (type == 16) {
      iconShow = 'media_type_hide';
    } else if (type == 24) {
      iconShow = 'media_type_nor';
    }
  }

  return iconShow;
}


function DealWithAllRadioData(obj) {
  var json = [];
  var id = obj.cdid;
  var status = obj.downstate;
  var pic = obj.coverurl;
  if (pic != '' && pic != null) {
    if (pic.indexOf('_720.jpg') > 0) {
      pic = pic.replace('_720.jpg', '_150.jpg');
    }
  }
  var albulname = obj.name;
  var atrtistname = obj.artist;
  var down_status = 'i_progress';
  var downtime = (status == 'downed' ? obj.downedtime : obj.inserttime);
  var info = '';
  var percent = '';
  var reddot = '';

  var iconShow;
  var cdmediatype = obj.media_type;
  if (cdmediatype != '' && cdmediatype != null) {
    iconShow = cdmediatype == '母带' ? 'media_type_nor' : 'media_type_hide';
  } else {
    iconShow = GetMediaTypebByHzBit(obj.sampling);

  }

  switch (status) {
    case 'downed' || 'import':
      down_status = '';
      break;
    case 'pause':
      down_status = 'i_start';
      info = '已暂停';
      break;
    case 'notstart':
      down_status = 'i_start';
      info = '已暂停';
      break;
    case 'downing':
      down_status = 'i_progress';
      info = '下载中...';
      break;
    case 'fail':
      down_status = 'i_fail';
      info = '下载失败';
      break;
    case 'waitting':
      down_status = 'i_wait';
      info = '等待中...';
      break;
    default :
      break;
  }
  if (status == 'downed' || status == 'import') {
    percent = '';
    if (obj.hasOwnProperty('showRedDot')) {
      var strval = obj.showRedDot;
      if (strval == '1') {
        reddot = 'list_red_dot';
      } else {
        reddot = '';
      }
    }
    var canvas = `<canvas class="canvas_1" width="60" height="60"></canvas>
                      <canvas class="canvas_2" width="60" height="60"></canvas>`;
  } else {
    percent = obj.progress + '%';
    var canvas = `<canvas class="canvas_1" width="60" height="60"></canvas>
                      <canvas class="canvas_2" width="60" height="60"></canvas>`;
  }
  var createData = createDataFun(status, id);

  json =
    {
      'albumid': createData.createId,
      'status': status,
      'pic': pic,
      'albumname': albulname,
      'artname': atrtistname,
      'down_status': down_status,
      'info_tip': info,
      'downtime': downtime,
      'percent': percent,
      'reddot': reddot,
      'canvas': canvas,
      'icon_show_type': iconShow
    }
  return json;
}
function createDataFun(status, id) {
  var obj = {};
  if (status !== 'import') {
    obj = {
      defaultId : id,
      createId : id
    }
  } else {
    importDataIndex++;
    obj = {
      defaultId : id,
      createId : defaultName + importDataIndex
    }
  }
  importData.push(obj);
  return {
    defaultId: obj.defaultId,
    createId: obj.createId
  }
};
function GuideUserLogin(ev) {
  var call = 'UserLogin?src=login';
  callClientNoReturn(call);
  ev.stopPropagation();
  return false;

}

function ShutDownOnTime() {
  callClientNoReturn('ShutDownOnTime');
}

function OnSetting() {
  callClientNoReturn('OnShowSettingDlg?index=4');
}

function StartAllTasks() {

  if ($(this).attr('enable') == '0') {
    return;
  }

  var ncnt = document.getElementById('user_packet_undownload').childElementCount;
  if (ncnt <= 0) {
    return;
  }

  var strIds = '';
  var ArrObj = $('#user_packet_undownload li');
  if (ArrObj == '' || ArrObj == null || typeof(ArrObj) == 'undefined' || ArrObj.length <= 0) {
    return;
  }

  for (var nIndex = 0; nIndex < ArrObj.length; nIndex++) {
    var status = $(ArrObj[nIndex]).attr('down_status');
    if (status != 'fail' && status != 'pause' && status != 'notstart') {//fail pause notstart 可以开始，其它状态不可以开始
      continue;
    }
    strIds += $(ArrObj[nIndex]).attr('id');
    var ObjId = $(ArrObj[nIndex]).attr('id');
    var Obj = $('#' + ObjId);
    ChgStatusTo(Obj, 'cdstart', '');
    if ((nIndex + 1) != ArrObj.length) {
      strIds += ',';
    }
  }

  if (strIds == null || strIds == '') {
    return;
  }

  callClientNoReturn('CDDownloadOperate?method=start&ids=' + strIds);
  //改变相应的状态开始状态
}


function PausepAllTasks() {

  if ($(this).attr('enable') == '0') {
    return;
  }

  var ncnt = document.getElementById('user_packet_undownload').childElementCount;
  if (ncnt <= 0) {
    return;
  }

  var strIds = '';
  var ArrObj = $('#user_packet_undownload li');
  if (ArrObj == '' || ArrObj == null || typeof(ArrObj) == 'undefined') {
    return;
  }

  for (var nIndex = 0; nIndex < ArrObj.length; nIndex++) {
    var status = $(ArrObj[nIndex]).attr('down_status');//downing 和waitting 可以暂停 notstart 状态不能进行相应的pause
    if (status != 'downing' && status != 'waitting') {
      continue;
    }
    strIds += $(ArrObj[nIndex]).attr('id');
    var ObjId = $(ArrObj[nIndex]).attr('id');
    var Obj = $('#' + ObjId);
    ChgStatusTo(Obj, 'cdpause', '');
    if ((nIndex + 1) != ArrObj.length) {
      strIds += ',';
    }
  }

  if (strIds == null || strIds == '') {
    return;
  }

  callClientNoReturn('CDDownloadOperate?method=pause&ids=' + strIds);

}


/*显示所有的包，根据用户收藏的包来显示相应的内容*/
/*以页面的数据为准*/

/*分别从已下载，正在下载中取数据，没有的就是未下载的*/
function CollTotal(struserid, strsid, blogin) {
  GetUserCollectedCDPacket(struserid, strsid, blogin);
}


function CollBtnTotal(Obj) {

  BuildCollBlock(JsonUserColl, 'all');
}


function CollBtnFinished(Obj) {


  BuildCollBlock(JsonUserColl, 'downloaded');
}

function CollBtnUnFinished(Obj) {

  $('#user_packet_collect')[0].innerHTML = '';

  var dataArr = CopyArrayData(JsonUserColl);

  var FinObj = '';
  var UnFinObj = '';
  for (var nIndex = 0; nIndex < dataArr.length;) {

    var DesObj = '';
    var cdid = dataArr[nIndex]["id"];

    FinObj = $('#' + cdid);
    if (FinObj.length > 0) {
      dataArr.splice(nIndex, 1);
    } else {
      ++nIndex;
    }
  }

  var model = loadTemplate('#kw_cdpacket_coll_lists');
  var htmlStr = drawListTemplate(dataArr, model, DealWithColl);
  $('#user_packet_collect').append(htmlStr);
  cdloadImages();

  initCanvasRing();
  SetPageIconShow(blogin);
  SetCDPacKetNum(2, $('#user_packet_collect').get(0).childElementCount);

}
function cdPackImport() {
  realTimeLog('ACT', 'USRCLK|BTNNAME:LEADINGIN_ENTRY');
  var channelname = isLikePage?'hificollect':'hifidown';
  callClient('CDPackImport?chname=' + channelname + '&funcname=importpacks');
};
function importpacks(str) {
  var JsonObj = JSON.parse(decodeURIComponent(str));
  var model = loadTemplate('#kw_cdpacket_lists');
  var htmlStr = drawListTemplate(JsonObj, model, DealWithAllRadioData);
  $('#finished_packet').prepend(htmlStr);
  SetCDPacKetNum(0, $('#finished_packet').get(0).childElementCount);
  if ($('#finished_packet').get(0).childElementCount > 0) {
    $('#nocdBox').hide();
  }
  cdloadImages();
}
function CDUpdataImg(str) {
  var cdId = getValue(str, 'id');
  var cdImg = decodeURIComponent(getValue(str, 'img'));
  for (var i = 0, arrLength = importData.length; i < arrLength; i++) {
    if (cdId == importData[i].defaultId) {
      $('#' + importData[i].createId + ' .cdHeadPic').attr('src', cdImg);
    }
  }
}
function DelAllUnFinished(Obj) {

  if ($(this).attr('enable') == '0') {
    return;
  }

  var ncnt = document.getElementById('user_packet_undownload').childElementCount;
  if (ncnt <= 0) {
    return;
  }
  var strIds = '';
  var ArrObj = $('#user_packet_undownload li');
  if (ArrObj != '' && ArrObj != null && typeof(ArrObj) != 'undefined') {
    for (var nIndex = 0; nIndex < ArrObj.length; nIndex++) {
      strIds += $(ArrObj[nIndex]).attr('id');
      if ((nIndex + 1) != ArrObj.length) {
        strIds += ',';
      }
    }
    callClientNoReturn('CDDownloadOperate?method=del&ids=' + strIds);
  }
}

//得到当前用户所有的cd包的情况
function GetUserCDlists() {
  var call = 'GetDownloadCDList?type=all';
  var rst = callClient(call);
  return rst;
}

function AsynGetUserCDlist() {

  var guid = GenGuid();
  if (guid == '' || guid == null) {
    return;
  }
  globalGuid = guid;

    var funname = 'funcname=GetDownloadCDList&guid=' + guid;
    funname = encodeURIComponent(funname);
    var channelname = isLikePage?'hificollect':'hifidown';
    var call = 'GetDownloadCDList?type=all&channel=' + channelname + '&asyncparam=' + funname;
    var rst = '';
    rst = callClient(call);
    return rst;
}

function CDResultCallback(str) {

  if (str == null || str == '') {
    return;
  }


  var transparam = getValue(str, 'asyncparam');
  transparam = decodeURIComponent(transparam);

  var transguid = getValue(transparam, 'guid');
  if (transguid == '' || transguid == null || transguid != globalGuid) {
    return;
  }

  var funname = getValue(transparam, 'funcname');
  if (funname == '' || funname == null) {
    return;
  }

  var rst = '';
  //getValue中已经有decode的操作
  rst = getValue(str, 'result');
  if (rst == null || rst == '') {
    return;
  }


  //在这个地方开始数据处理
  //console.log(funname);
  if (funname == 'GetDownloadCDList') {
    RefreshAsyn(rst);
    var tabtype = getDataByConfig('hificolDown', 'tabtype');
    TransDownTab(tabtype);

    var bshow = '0';
    bshow = getDataByConfig('hificolDown', 'reddotshow');
    if (bshow == '' || bshow == null) {
      bshow = '0';
    }

    SetInfoTipRedDot(parseInt(bshow));
  }
}

function RefreshAsyn(strListParam) {
  BuildCDListByRst(strListParam);
  BindAllEvent();
  InitAllStatus(id, status);
  InitSel();
  SetButtonStatus();
}

function ChgToCollUnDown(strid) {

  if (strid == '' || strid == null || isNaN(strid)) {
    return;
  }

  //在下载未完成页或者是下载中页面删除的元素，如果收藏页面中有对应的则把它们变成未下载状态
  var Obj = $('#' + strid);
  if (typeof (Obj) == 'undefined' || Obj.length <= 0) {
    return;
  }

  try {
    var ObjColl = $('#' + strid + '_coll');
    if (typeof(ObjColl) == 'undefined' || ObjColl.length <= 0) {
      return;
    }

    ObjColl.remove();
    var img = Obj.find('.cdHeadPic').attr('data-original');
    var alname = Obj.find('.albumName')[0].innerHTML;
    var art = Obj.find('.artistName')[0].innerHTML;
    var utime = Obj.attr('downedtime');
    var Jsonstr = '{"id":' + '"' + strid + '"' + ',' + '"img":' + '"' + img + '"' + ',' + '"alname":' + '"' + alname + '"' + ',' + '"artist":' + '"' + art + '"' + ',' + '"utime":' + utime + '}';
    var JsonObj = eval('(' + Jsonstr + ')');

    var dataArr = [];
    dataArr.push(JsonObj);
    var model = loadTemplate('#kw_cdpacket_coll_lists');
    var htmlStr = drawListTemplate(dataArr, model, DealWithColl);
    $('#user_packet_collect').append(htmlStr);
    cdloadImages();

  }
  catch (e) {
    console.log(e.message);
    console.log(e.lineNumber)
  }
}


function ConfirmDelBlock(strIds) {
  if (strIds == '' || strIds == null) {
    return;
  }
  var idarr = [];
  idarr = strIds.split(',');
  if (idarr.length <= 0) {
    return;
  }
  for (var index = 0; index < idarr.length; index++) {
    var strid = idarr[index];
    ChgToCollUnDown(strid);
    for (var i = 0; i < importData.length; i++) {
      if (strid == importData[i].defaultId) {
        $('#' + importData[i].createId).remove();
      }
    }
  }
  var nCntFinish = document.getElementById('finished_packet').childElementCount;
  var nCntUnFinish = document.getElementById('user_packet_undownload').childElementCount;

  CollTotal(strUid, strsid, blogin);
  SetCDPacKetNum(0, nCntFinish);
  SetCDPacKetNum(1, nCntUnFinish);
  SetPageIconShow(blogin);
}

function CDStatusNotify(str) {
  if (str == '' || str == null) {
    return;
  }
  var strType = getValue(str, 'msgtype');
  var packetId = '';
  if (strType == 'cddel' || strType == 'cdpause' || strType == 'cdwaiting' || strType == 'cdstart' || strType == 'cdrestart') {
    packetId = getValue(str, 'ids');
  } else {
    packetId = getValue(str, 'id');
  }
  var progress = 0;
  if (strType == 'cdinsert' || strType == 'cdfinish') {
    $(".jumpDown label").hide();
    setDataToConfig('hificolDown', 'jumpDownTips', '1');
  } else if (strType == 'cdprogress') {
    progress = getValue(str, 'progress');
  }
  SetBlockStatus(packetId, strType, progress);
}

//这个是下载的cd包插入到页面的第一个过程点
//得到这个的信息
//1 把其插入到正在下载列表中
//如果是已经收藏过的，则先把其从收藏中移除，再做后续处理
function DealWithInsertCDPacket(strId) {

  if (strId == '' || strId == null) {
    InitData();
  }

  var call = 'GetDownloadCDInfo?id=' + strId + '&needsongs=0';
  var rst = callClient(call);
  if (rst == '' || rst == null) {
    return;
  }
  var JsonArr = eval('(' + rst + ')');
  var nlen = document.getElementById('user_packet_undownload').childElementCount;

  var model = loadTemplate('#kw_cdpacket_lists');
  var htmlStr = drawListTemplate(JsonArr, model, DealWithAllRadioData);
  var Obj = parseDom(htmlStr);
  $(Obj).find('.cdPicBox').find('.cdshadow').show();
  $('#user_packet_undownload').append(Obj);
  SetCDPacKetNum(1, nlen + 1);
  CollTotal(strUid, strsid, blogin);
  cdloadImages();
}

function parseDom(arg) {

  var objE = document.createElement("div");
  objE.innerHTML = arg;
  return $(objE.innerHTML);
}


function SetBlockStatus(strid, type, progres) {

  if (type == 'cdinsert') {
    //InitData();
    DealWithInsertCDPacket(strid);
    return;
  }

  if (type == 'cddel') {
    ConfirmDelBlock(strid);
    return;
  }

  if (type == 'loginstatus') {
    InitData();
    return;
  }

  var idArr = [];
  idArr = strid.split(',');
  for (var index = 0; index < idArr.length; index++) {
    var Obj = $('#' + idArr[index]);
    if (typeof (Obj) == 'undefined' || Obj.length <= 0) {
      continue;
    }

    ChgStatusTo(Obj, type, progres);

    try {
      var CollObj = $('#' + idArr[index] + '_coll');
      if (typeof(CollObj) != 'undefined' && CollObj.length > 0) {
        ChgStatusTo(CollObj, type, progres);
      }

    } catch (e) {
      console.log(e.message);
    }

    if (type == 'cdfinish') {
      //把下载下载的移动到已下载完成的，同时数量更新
      RemoveToFinished(strid);
    }

    if (type == 'cdrestart') {
      RemoveToDowning(strid);
    }
  }
}

function RemoveToDowning(strid) {

  if (strid == '' || strid == null) {
    return;
  }

  //把下载完成中元素复制一份，然后把其添加到正在下载列表中
  //如果收藏有对应的元素则删除，把这个也重新添加到收藏列表中
  var Obj = document.getElementById(strid);
  var todowning = Obj.cloneNode(true);
  try {
    document.getElementById('finished_packet').removeChild(Obj);
    if (typeof (todowning) != 'undefined' && todowning.length > 0) {
      $(todowning).find('.down_percent').get(0).innerHTML = '0%';
      $(todowning).find('.play_icon_normal').hide();
      $(todowning).find('.play_icon').hide();
      $(todowning).attr('c-status', '0');
    }
    $('#user_packet_undownload').prepend(todowning);

    //从正在下载列表中复制相应的包到收藏列表中
    var ColObj = $('#' + strid + '_coll');
    if (typeof (ColObj) != 'undefined' && ColObj.length > 0) {
      ColObj.remove();
    }
    var colDel = todowning.cloneNode(true);
    var toid = $(colDel).attr('id');
    $(colDel).attr('id', toid + '_coll');
    $('#user_packet_collect').prepend(colDel);

    initCanvasRing();
  } catch (e) {
    console.log(e.message);
  }

  var nCntFinish = document.getElementById('finished_packet').childElementCount;
  var nCntUnFinish = document.getElementById('user_packet_undownload').childElementCount;
  SetCDPacKetNum(0, nCntFinish);
  SetCDPacKetNum(1, nCntUnFinish);
  SetPageIconShow(blogin);
  SetShowRedDotOnListName(strid, 'showRedDot', '0');
}

function SetInfoTipRedDot(bshow) {

  if (bshow) {
    var objFin = $('.finishContentBox');
    if (objFin.css("display") == "none") {//当前显示的是非完成页
      var nCntFinish = document.getElementById('finished_packet').childElementCount;
      if (nCntFinish > 0) {
        // $('#redInfoTip').show();
        setDataToConfig('hificolDown', 'reddotshow', '1');
        return;
      }
    }
  }

  setDataToConfig('hificolDown', 'reddotshow', '0');
  // $('#redInfoTip').hide();
}

function RemoveToFinished(strid) {

  if (strid == null || strid == '') {
    return;
  }

  //此时得到的是下载中的对应的ID的节点
  var Obj = document.getElementById(strid);
  var toFin = Obj.cloneNode(true);

  try {
    if ($(toFin).length > 0) {
      document.getElementById('user_packet_undownload').removeChild(Obj);
      $(toFin).find('.cdPicBox').find('.down_percent').html('');
    }
    $(toFin).find('.cdPicBox').find('.cdshadow').hide();
    $('#finished_packet').prepend(toFin);

    var ColObj = $('#' + strid + '_coll');
    var BtnType = getDataByConfig('hificolDown', 'collBtntype');
    if (typeof(ColObj) != 'undefined' && ColObj.length > 0) {

      //把相应的从收藏列表里先干掉
      ColObj.remove();

      //再从完成列表里复制到收藏列表里一份
      var Node = $('#' + strid)[0];
      var clone = $(Node.cloneNode(true));
      clone.find('.down_percent').html('');
      var idcol = clone.attr('id');
      clone.attr('id', idcol + '_coll');
      $('#user_packet_collect').prepend(clone);
    } else if (BtnType == 'downloaded') {
      var Node = $('#' + strid)[0];
      var clone = $(Node.cloneNode(true));
      clone.find('.down_percent').html('');
      var idcol = clone.attr('id');
      clone.attr('id', idcol + '_coll');
      $('#user_packet_collect').prepend(clone);
    }
  }
  catch (e) {
    console.log(e.message);
  }


  var nCntFinish = document.getElementById('finished_packet').childElementCount;
  var nCntUnFinish = document.getElementById('user_packet_undownload').childElementCount;
  var nCntColl = document.getElementById('user_packet_collect').childElementCount;
  SetCDPacKetNum(0, nCntFinish);
  SetCDPacKetNum(1, nCntUnFinish);
  SetCDPacKetNum(2, nCntColl);
  SetPageIconShow(blogin);
  SetInfoTipRedDot(true);
  SetShowRedDotOnListName(strid, 'showRedDot', '1');

  var call = 'GetDownloadCDInfo?id=' + strid + '&needsongs=0';
  var rst = callClient(call);
  if (rst == '' || rst == null) {
    return;
  }

  var Objdown = eval('(' + rst + ')');
  var downedtime = Objdown[0].downedtime;
  $('#' + strid).attr('downedtime', downedtime);


}

//desObj是根据Id得到的对应的控件
function ChgStatusTo(desObj, Status, progress) {

  if (Status != 'cdfail' && Status != 'cdfinish' && Status != 'cdstart' && Status != 'cdpause' && Status != 'cdprogress' && Status != 'cdwaiting') {
    return;
  }

  if (desObj == 'undefined' || typeof(desObj) == 'undefined' || desObj == null || desObj == '') {
    return;
  }

  var Obj = desObj.find('.cdPicBox i');
  if (typeof(Obj) == 'undefined') {
    return;
  }


  var DesAttr = Obj.eq(0).attr('class');
  var ibg = Obj.eq(0).css('backgroundImage');
  if (DesAttr != '' || DesAttr != null) {
    Obj.eq(0).removeClass(DesAttr);
  }

  var statAttr = 'down_status';
  var DesStatus = '';
  var DesClass = '';
  var bindFunc = '';
  var inner_info = '';


  if (Status == 'cdfail') {
    DesClass = 'i_fail';
    DesStatus = 'fail';
    bindFunc = ReDownLoad;
    inner_info = '下载失败';
    desObj.find('.canvas_1').hide();
    desObj.find('.canvas_2').hide();
  }
  else if (Status == 'cdwaiting') {
    DesClass = 'i_wait';
    DesStatus = 'waitting';
    bindFunc = PauseDownLoad;
    inner_info = '等待中...';
  }
  else if (Status == 'cdfinish') {
    DesClass = '';
    DesStatus = 'downed';
    inner_info = '';
  }
  else if (Status == 'cdstart' || Status == 'cdrestart') {
    DesClass = 'i_progress';
    DesStatus = 'downing';
    bindFunc = PauseDownLoad;
    inner_info = '下载中...';
  }
  else if (Status == 'cdpause') {
    DesClass = 'i_start';
    DesStatus = 'pause';
    bindFunc = StartDownLoad;
    inner_info = '已暂停';
  }
  else if (Status == 'cdprogress') {
    DesClass = 'i_progress';
    DesStatus = 'downing';
    bindFunc = PauseDownLoad;
    inner_info = '下载中...';
    var obj = desObj.find('.down_percent');
    if (obj != 'undefined' && typeof(obj) != 'undefined') {
      obj.get(0).innerHTML = progress + '%';
    }
    if (ibg.indexOf('hover') > -1) {
      inte(parseInt(progress), desObj.get(0), true);
    } else {
      inte(parseInt(progress), desObj.get(0));
    }
  }

  Obj.eq(0).addClass(DesClass);
  desObj.attr(statAttr, DesStatus);

  if (Status != 'cdfinish') {
    var bindObj = desObj.find('.' + DesClass);
    if (typeof (bindObj) != 'undefined') {
      bindObj.unbind('click').bind('click', bindFunc);
    }
  }


  var infoObj = desObj.find(' .cdPicBox .i_info');
  if (typeof(infoObj) != 'undefined' && infoObj.length > 0) {
    infoObj.get(0).innerHTML = inner_info;
  }
}

function goHIFIDownPage() {
  commonClick({'source': '9002', 'sourceid': '9002', 'name': 'channel_cdpack', 'id': '9002'});
}

function InitAllStatus(strid, CurStatus, strType) {

  var Obj = $('.cdPicBox');
  InitStatus(Obj);
  $('.cue_block').attr('c-status', 0);
  if (CurStatus == '' || CurStatus == null) {
    return;
  }


  var realId;
  for (var i = 0; i < importData.length; i++) {
    if (strid == importData[i].defaultId) {
      realId = importData[i].createId;
    }
  }
  var DesObjCom = $('#' + realId);
  var ObjCol = $('#' + realId + '_coll');
  ObjPlayStatus(DesObjCom, CurStatus);
  ObjPlayStatus(ObjCol, CurStatus);
}


function ObjPlayStatus(DesObj, CurStatus) {

  if (typeof(DesObj) != 'undefined' && DesObj.length > 0) {
    DesObj.attr('c-status', CurStatus);
    if (CurStatus == "1" || CurStatus == "4") {
      DesObj.find(".play_icon").show();
      DesObj.find(".cdshadow").show();
    }
    else if (CurStatus == "2")//暂停状态
    {
      DesObj.find(".play_icon_pause").show();
      DesObj.find(".cdshadow").show();
    }
    else {
      DesObj.find(".play_icon_normal").show();
      DesObj.find('.play_icon_normal').unbind('click').bind('click', PlayAllCurSongs);
      DesObj.find(".cdshadow").hide();
    }
  }
}

function musicNowPlaying(str) {
  if (str == '' || str == null) {
    InitAllStatus(id, 3);
    return;
  }

  var alid = getValue(str, 'CdAlbumId');
  var status = getValue(str, 'Status');
  if (alid == null || alid == '') {
    InitAllStatus(alid, status);
    return;
  }

  if (alid.indexOf('importId') > -1) {
    alid = alid.substr(0, alid.indexOf('importId') - 1);
  }
  var realId;
  for (var i = 0; i < importData.length; i++) {
    if (alid == importData[i].defaultId) {
      realId = importData[i].defaultId;
    }
  }

  id = realId;
  status = getValue(str, 'Status');
  InitAllStatus(id, status);
  SetShowRedDotOnListName(id, 'showRedDot', '0');

}

function SortSelChg(ele) {
  return;
  var strType = '';
  var Obj = ele;
  var selIndex = Obj.selectedIndex;
  var value = Obj.options[selIndex].value; // 选中值
  SortByType(value);
}

function SortByType(strType) {

  var liArr = [];
  var liObj = $("#finished_packet li");
  for (var nIndex = 0; nIndex < liObj.length; nIndex++) {
    liArr[nIndex] = liObj[nIndex];
  }

  bubble(liArr, strType);
  $('#finished_packet').append(liArr);
}

function bubble(array, strType) {

  var strattr = '';
  var bflag = false;

  if (strType == 'albumname') {
    strattr = '.albumName';
    bflag = true;
  } else if (strType == 'artist') {
    strattr = '.artistName';
    bflag = true;
  } else if (strType == 'addtime') {
    bflag = false;
  }

  var objS = '';
  var objD = '';
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array.length - i; j++) {
      var ObjD = array[j];
      var ObjS = array[j + 1];
      if (typeof(ObjD) == 'undefined' || typeof(ObjS) == 'undefined') {
        continue;
      }

      if (bflag) {
        objS = $(array[j]).find(strattr).get(0).innerHTML;
        objD = $(array[j + 1]).find(strattr).get(0).innerHTML;
      } else {
        objS = $(array[j]).attr('downedtime');
        objD = $(array[j + 1]).attr('downedtime');
      }


      if (bflag) {
        if (objS < objD) {
          temp = array[j + 1];
          array[j + 1] = array[j];
          array[j] = temp;
        }
      } else {
        if (CompareInt64Time(objS, objD) < 0) {
          temp = array[j + 1];
          array[j + 1] = array[j];
          array[j] = temp;
        }
      }

    }//内层循环结束
  }//外层循环结束
}

function CompareInt64Time(srcleft, srcright) {

  var nlenleft = srcleft.length;
  var nlenright = srcright.length;
  if (nlenleft > nlenright) {
    return 1;
  } else if (nlenleft < nlenright) {
    return -1;
  } else {
    for (var nindex = 0; nindex < nlenleft; nindex++) {
      if (srcleft[nindex] > srcright[nindex]) {
        return 1;
      } else if (srcleft[nindex] < srcright[nindex]) {
        return -1;
      }
    }

    return 0;
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

function initCanvasRing() {
  var canvasArr = document.querySelectorAll('.canvas_1');
  var len = canvasArr.length;
  for (var i = 0; i < len; i++) {
    var canvas_1 = canvasArr[i];
    var status = canvas_1.parentElement.parentElement.getAttribute('down_status');
    if (status == 'downed') {
      continue;
    }

    var ctx_1 = canvas_1.getContext('2d');
    ctx_1.lineWidth = 3;
    ctx_1.strokeStyle = "#fff";
    ctx_1.beginPath();
    ctx_1.arc(canvas_1.width / 2, canvas_1.height / 2, canvas_1.width / 2 - ctx_1.lineWidth / 2, 0, Math.PI * 2, false);
    ctx_1.closePath();
    ctx_1.stroke();
  }
}

function inte(percent, parentobj, ishover) {
  var canvas_2 = parentobj.querySelector('.canvas_2');

  var ctx_2 = canvas_2.getContext('2d');
  ctx_2.lineWidth = 3;
  if (ishover) {
    ctx_2.strokeStyle = "#ca9d63";
  } else {
    ctx_2.strokeStyle = "#fff";
  }
  var angle = percent * (180 / 50);
  ctx_2.clearRect(0, 0, canvas_2.width, canvas_2.height)
  //百分比圆环
  ctx_2.beginPath();
  ctx_2.arc(canvas_2.width / 2, canvas_2.height / 2, canvas_2.width / 2 - ctx_2.lineWidth / 2, 0, angle * Math.PI / 180, false);
  var percentAge = parseInt((angle / 360) * 100)
  if (angle > (percent / 100 * 360)) {
    percentAge = percent
  }
  ctx_2.stroke();
  ctx_2.closePath();
  ctx_2.save();
  ctx_2.beginPath();
  ctx_2.rotate(90 * Math.PI / 180);
  ctx_2.closePath();
  ctx_2.restore();
}


/*响应客户端空间不足或缓存时的相应处理*/
function ShowCDDownloadTips(str) {

  if (str == '' || str == null) {
    return;
  }

  var tipType = getValue(str, 'type');
  if (tipType != 'undonetasktoomany' && tipType != 'cachenotenough' && tipType != 'copyfilediskfull' && tipType != 'copyfilePathInvalid') {
    return;
  }

  var strdisk = '';
  if (tipType == 'cachenotenough' || tipType == 'copyfilediskfull' || tipType == 'copyfilePathInvalid') {
    strdisk = getValue(str, 'strdisk');
  }

  if (tipType == 'undonetasktoomany') {//未完成的任务过多的提示浮层
    CreateTooManyTasksTip();
  } else if (tipType == 'cachenotenough') {//缓存空间不足的提示
    CreateCacheNotEnoughTip(strdisk);
  } else if (tipType == 'copyfilediskfull') {//拷贝文件时空间不中时的提示
    CreateCopyFileDiskFullTip(strdisk);
  } else if (tipType == 'copyfilePathInvalid') {//拷贝文件时路径无效的提示
    CopyFilePathInvaidTip(strdisk);
  }
}


$(document).click(function (event) {
  var _con = $('.cdTipsPacketNotExist');   // 设置目标区域
  if (!_con.is(event.target) && _con.has(event.target).length === 0) { // Mark 1
    $('.cdTipsPacketNotExist').hide();
    $('.kw_select i').removeClass('tri_press_up');
    $('.sel_list').hide();
  }
});


function CDPacketNotExist(str, flag) {
  var strApent;
  if (!$(".cdTipsPacketNotExist").html()) {
    if (flag) {
      strApent = '<div style="z-index: 999;" class="cdTipsPacketNotExist"><a ' + 'href="javascript:;" class="tipCloseBtn"' + '>' + '</a><span style="line-height:50px;"></span></div>';
    } else {
      strApent = '<div style="z-index: 999;" class="cdTipsPacketNotExist"><a ' + 'href="javascript:;" class="tipCloseBtn"' + '>' + '</a><span></span><p>请重新下载</p></div>';
    }
    $("body").append(strApent);
  }
  $(".cdTipsPacketNotExist span").html(str);
  var $cdTips = $(".cdTipsPacketNotExist");
  $cdTips.show();

  $(".cdTipsPacketNotExist").click(function () {
    $cdTips.remove();
  });
//	$(".cdTipsPacketNotExist").hover(function(){
//		clearTimeout(timeout);
//	},function(){
//		timeout = setTimeout(function(){
//			$cdTips.hide();
//		},5000);
//	});
}


//未完成的任务太多的提示浮层
function CreateTooManyTasksTip() {

  if (!$(".cdTipsTooManyTasks").html()) {
    $("body").append("<div class='cdTipsTooManyTasks'><p class='toomanyinfo'>未完成的下载任务过多,可能会自动清除旧的缓存噢~</p><a href='javascript:;' class='taskIknow'>我知道了</a></div>");
  }

  $(".cdTipsTooManyTasks .taskIknow").unbind('click').bind("click", function () {
    $cdTips.hide();
    var call = 'CDDownloadTipsCallback?type=undonetasktoomany';
    callClientNoReturn(call);
  });

  var $cdTips = $(".cdTipsTooManyTasks");
  if (!$cdTips.is(":hidden")) {
    return
  }

  $cdTips.show();
}


////缓存空间不足的提示浮层
function CreateCacheNotEnoughTip(strDiskInfo) {

  if (strDiskInfo == '' || strDiskInfo == null) {
    return;
  }

  var strDir = '';
  if (strDiskInfo.indexOf(':') < 0 && strDiskInfo.length == 1) {
    strDir = strDiskInfo + ":" + "\\";
  } else if (strDiskInfo.indexOf(':') == 1) {
    if (strDiskInfo.length == 2) {
      strDir = strDiskInfo + "\\";
    } else if (strDiskInfo.length > 2) {
      strDir = strDiskInfo;
    }
  } else {
    strDir = strDiskInfo;
  }


  if (!$(".cdTipsCacheNotEnough").html()) {
    $("body").append("<div class='cdTipsCacheNotEnough'><p class='notenough'></p><a href='javascript:;' class='setcache'>设置缓存</a><a href='javascript:;' class='tasknotenoughIknow'>我知道了</a></div>");
  }

  var strInfo = strDiskInfo + ' 盘缓存空间不足，请清理出足够的空间噢~';
  $(".cdTipsCacheNotEnough .notenough").html(strInfo);

  $(".cdTipsCacheNotEnough .tasknotenoughIknow").unbind('click').bind("click", function () {
    $cdTips.hide();
  });

  $(".cdTipsCacheNotEnough .setcache").unbind('click').bind("click", function () {
    $cdTips.hide();
    var call = 'OnShowSettingDlg?index=4';
    callClientNoReturn(call);
  });

  var $cdTips = $(".cdTipsCacheNotEnough");
  if (!$cdTips.is(":hidden")) {
    return
  }

  $cdTips.show();
}


//拷贝文件时空间不中时的提示浮层
function CreateCopyFileDiskFullTip(strDiskInfo) {

  if (strDiskInfo == '' || strDiskInfo == null) {
    return;
  }

  var strDir = '';
  if (strDiskInfo.indexOf(':') < 0 && strDiskInfo.length == 1) {
    strDir = strDiskInfo + ":" + "\\";
  } else if (strDiskInfo.indexOf(':') == 1) {
    if (strDiskInfo.length == 2) {
      strDir = strDiskInfo + "\\";
    } else if (strDiskInfo.length > 2) {
      strDir = strDiskInfo;
    }
  } else {
    strDir = strDiskInfo;
  }

  if (!$(".cdTipsDiskFull").html()) {
    $("body").append("<div class='cdTipsDiskInfo'><p class='diskinfo'></p><p>快去清理一下吧</p><a href='javascript:;'>去清理</a></div>");
  }
  var strInfo = strDiskInfo + ' 盘空间不足，无法完成下载'
  $(".cdTipsDiskInfo .diskinfo").html(strInfo);

  var $cdTips = $(".cdTipsDiskInfo");
  if (!$cdTips.is(":hidden")) {
    return
  }

  $cdTips.show();
  var timeout = setTimeout(function () {
    $cdTips.hide();
  }, 3000);

  $(".cdTipsDiskInfo a").unbind('click').bind("click", function () {
    $cdTips.hide();
    var call = 'OpenDir?path=' + encodeURIComponent(strDir);
    callClientNoReturn(call);
  });
}

function CopyFilePathInvaidTip(strDiskInfo) {

  if (strDiskInfo == '' || strDiskInfo == null) {
    return;
  }
  var strDir = strDiskInfo;

  if (!$(".cdTipsPathInvalid").html()) {
    $("body").append("<div class='cdTipsPathInvalid'><p class='PathInvalid'></p><p>请更换路径后重试</p><a href='javascript:;' class='PathInvalidIKnow'>我知道了</a></div>");
  }

  var strInfo = '下载路径失效了';
  $(".cdTipsPathInvalid .PathInvalid").html(strInfo);

  $(".cdTipsPathInvalid .PathInvalidIKnow").unbind('click').bind("click", function () {
    $cdTips.hide();
  });

  var $cdTips = $(".cdTipsPathInvalid");
  if (!$cdTips.is(":hidden")) {
    return
  }

  $cdTips.show();
}


function AddAlbumSuc(param) {

  if (param == '' || param == null) {
    return;
  }

  CollTotal(strUid, strsid, blogin);
}

function cdloadImages() {
  setTimeout(function () {
    var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
    var clientH = document.documentElement.clientHeight;
    var scrollB = scrollT + clientH;
    var imgs = $('.lazy');
    imgs.each(function (i) {
      if ($(this)[0].offsetTop < scrollB) {
        if ($(this)[0].getAttribute('data-original') !== '{$pic}') {
          $(this)[0].setAttribute('src', $(this)[0].getAttribute('data-original'));
          $(this).removeClass('lazy');
        }
      }
    });
  }, 100);
}