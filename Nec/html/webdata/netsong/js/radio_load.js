// JavaScript Document
$(function(){
  setSkin();
});
function ScrollSongInfo() {
  if (NowRadioId != -1) {
    var songInfoId = 'songinfo_' + NowRadioId;
    var scroll_begin = document.getElementById(songInfoId);
    if (scroll_begin != null) {
      var songPare = scroll_begin.parentNode;
      var scroll = songPare.scrollWidth - songPare.offsetWidth;
      //console.log(" scroll is " + scroll + " songPare.scrollWidth " + songPare.scrollWidth + " songPare.offsetWidth " + songPare.offsetWidth);
      if (scroll <= 0) {
        ClearNoamalTimer();
        return;
      }

      if (direc == 0) {
        if (songPare.scrollLeft < scroll) {
          if ((songPare.scrollLeft + 1) == scroll) {
            direc = 1;
            ClearNoamalTimer();
            var id = setTimeout(Mysleep, 1000);
            NORMAL_TIMER[NORMAL_TIMER.length] = id;
          } else {
            songPare.scrollLeft++;
          }
        } else {
          direc = 1;
          ClearNoamalTimer();
          var id = setTimeout(Mysleep, 1000);
          NORMAL_TIMER[NORMAL_TIMER.length] = id;
        }
      } else {
        songPare.scrollLeft--;
        if (songPare.scrollLeft == 0) {
          direc = 0;
          ClearNoamalTimer();
          var id = setTimeout(Mysleep, 3000);
          NORMAL_TIMER[NORMAL_TIMER.length] = id;
        }
      }
    }
  }

  if (bStartTimer) {

    ClearScrollInfoTimer();
    var id = setTimeout(ScrollSongInfo, 100);
    SCROLL_INFO_TIMER[SCROLL_INFO_TIMER.length] = id;
  }
  else{
    ClearScrollInfoTimer();
  }
}

function Mysleep() {
  StartTimer();
}
// 暂停播放电台
function stopRadio(evt, id) {
  var call = 'ChgRadioPlayStatus?radioid=' + id + '&playstatus=2';
  callClientNoReturn(call);
}

function SetRadioFre(str) {
  //console.log(" SetRadioFre " + str);
  if (str.length <= 0) {
    return;
  }

  var strId = getValue(str, 'rid');
  var strFre = getValue(str, 'fre');
  $("#" + strId).attr('playfre', strFre);
}

function OnSortByTimeOrder() {
  freshAll();
  $(".frequency").removeClass('active');
  $(".time").addClass('active');
}

function bubble(array) {
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array.length - i; j++) {
      if (parseInt($(array[j]).attr('playfre')) < parseInt($(array[j + 1]).attr('playfre'))) {
        temp = array[j + 1];
        array[j + 1] = array[j];
        array[j] = temp;
      }
    }
  }
}

function OnSortByFreOrder() {
  var liArr = [];
  var liObj = $("#bottom_ul li");
  for (var nIndex = 0; nIndex < liObj.length; nIndex++) {
    liArr[nIndex] = liObj[nIndex];
  }

  bubble(liArr);
  $('#bottom_ul').append(liArr);
  $(".time").removeClass('active');
  $(".frequency").addClass('active');

  SetPlayingRadioFirstPos(NowRadioId); //排序完毕之后把正在播放的放在最前面
  liArr = [];
}

// 继续播放
function continueRadio(evt, id) {
  var call = 'ChgRadioPlayStatus?radioid=' + id + '&playstatus=1';
  callClientNoReturn(call);
}

//添加更多的按钮，跳转到电台页
function OnAddMoreRadio() {
  var str = "AddMoreNewRadio";
  callClientNoReturn(str);
}

//个人电台在本地加载完之后，会回调这个来加载个人电台
function LoadAllRadio() {
  freshAll();
}

//此函数的功能为完成的标识，最后加一个添加更多电台的按钮
function LoadingIcon(str) {
  if (str == '0') {
    CreateAddRadio();
  }
}

//添加一个新的电台
function addonenewradio(str) {
  freshAll();
}

//暂时未用上
function musicNowPlaying(str) {}


function SetSongFav(str) {

  if (str.length <= 0) {
    return;
  }

  var rid = getValue(str, 'radioid');
  var bfav = parseInt(getValue(str, 'bfav'));
  bSongFav = bfav;
  SetRadioLikeState(rid, bfav);
}

function AdjustListPos(strNew) {
  return;
  if (strNew == '' || typeof (strNew) == 'undefined') {
    return;
  }
  var str = 'AdjustListPos?newname=' + encodeURIComponent(strNew);
  callClientNoReturn(str);
}

function IsTopRadio(strRid) {
  if (strRid == '') {
    return false;
  }
  var strRet = callClient('bTopRadio?rid=' + strRid);
  var strRst = getValue(strRet, 'btop');
  return strRst;

}
//把播放的电台放在第一位
function SetPlayingRadioFirstPos(radioid) {

  if (radioid == -1 || typeof (radioid) == 'undefined' || radioid == 0) {
    return
  }

  if( radioid == PRIV_FM_ID){
    return;
  }

  btopClick = IsTopRadio(radioid);
  //如果第一个电台的id和将要调整的id一样，就不进行相应的调整
  var firstId = document.getElementById("bottom_ul").firstElementChild.getAttribute("id");
  if (radioid != 0) {
    if (firstId == radioid) {
      //console.log('return');
      return;
    }
  }
  //通知客户端进行相应列表位置的调整
  //要调整的列表名称
  var bexistbot = false;
  var bexisttop = false;
  var bPrePend = true;

  var toplastId = document.getElementById("top_ul").lastElementChild.getAttribute("id");
  if (toplastId == radioid) {
    bexisttop = true;
    $('#bottom_ul').find('li').each(function () {
      var desid = $(this).attr('id');
      if (desid == 'undefined') {
        return true;
      }

      if (desid == radioid) {
        bexistbot = true;
        return false;
      }
    });

    if (bexisttop && bexistbot) //在上面存在 在下面也存在
    {
      if (btopClick == 0) {
        bPrePend = true;
      } else {
        bPrePend = false;
      }
    } else if (bexisttop && !bexistbot) {
      bPrePend = false;
    }
  }

  //console.log('btopClick ' + btopClick + ' toplastId ' + toplastId + ' radioid ' + radioid + ' bexisttop ' + bexisttop + ' bexistbot ' + bexistbot + ' prepend ' + bPrePend );

  var DesObj = $(".radio_" + radioid).find(".br_pic");
  if (DesObj.length > 1) {
    var ObjFst = DesObj.get(0);
    var ObjSec = DesObj.get(1);

    var strTypeFst = ObjFst.getAttribute("bTypeSec");
    if (strTypeFst == 'undefined' || strTypeFst == null) {
      strTypeFst = 0;
    }

    var strTypeSec = ObjSec.getAttribute("bTypeSec");
    if (strTypeSec == 'undefined' || strTypeSec == null) {
      strTypeSec = 0;
    }

    if (btopClick == strTypeFst) {
      DesObj = $(ObjFst);
    }
    if (btopClick == strTypeSec) {
      DesObj = $(ObjSec);
    }
  }

  var strNew = DesObj.attr('title');
  if (strNew == '' || strNew == 'undefined') {
    return;
  }

  strNew = strNew + '+' + radioid;
  //AdjustListPos(strNew);
  if (bPrePend) {
    $("#bottom_ul").prepend(DesObj.parent());
  }
}

//把正在播放的电台放在上面，下在播放的位置
function CreateTopPlayingAndAdd(radioid, strname, strimg, bprivate) {

  //console.log( " radioid " + radioid + " strname " + strname + " strimg " + strimg  + " bprivate " + bprivate);
  var NowObj;
  if (bprivate) {
    NowObj = $(".radio_nowplaying_0");
  } else {
    NowObj = $(".radio_nowplaying_" + radioid);
  }

  var pNode = document.getElementById("top_ul");
  var radiolist = [];
  if (typeof (NowObj) == 'undefined' || NowObj.length <= 0) //没有创建或者是切换电台了
  {
    var nNodes = pNode.childNodes.length;
    if (nNodes >= 3) {
      pNode.removeChild(pNode.firstChild);
    }

    /**
     * 910支持可跳转歌手
     * **/
    var playingSongInfo = callClient('GetRadioPlayingSongInfo');
    var artistName = decodeURIComponent(getValue(playingSongInfo, 'artist'));
    var songName = decodeURIComponent(getValue(playingSongInfo, 'songname'));
    var artistId = getValue(playingSongInfo, 'artid');

    /*
    * 当前播放电台为私人电台及时段推荐时不进行插入操作
    * @author 邢祥超 [20190831]
    * */
    var isSDDT = strname.indexOf('时段推荐') > -1;
    if (radioid == '-26711' || isSDDT) {
      return;
    }
    radiolist[radiolist.length] = '<li class="br_wrap_radio ';
    radiolist[radiolist.length] = 'radio_nowplaying' + '_' + radioid;
    radiolist[radiolist.length] = '"><a title="" class="br_pic" onclick="OnJumpRadioPlayingPage()" href="###" hidefocus>';
    radiolist[radiolist.length] = '<img class="lazy lazyorig" src="' + strimg + '" onerror="imgOnError(this,150)" data-original="' + strimg + '"/>';
    radiolist[radiolist.length] = '<span class="br_shade_unlogin"></span>';
    radiolist[radiolist.length] = '<div class="playing_content" ><p>正在播放</p></div></a>';
    radiolist[radiolist.length] = '<p class="br_name"><a onclick="OnJumpRadioPlayingPage()" href="###" title="' + strname + '">' + strname + '</a></p>';
    if (artistId) {
      radiolist[radiolist.length] = '<p class="playing-subtitle"><a class="playing-subtitle-test" title="' + strSongInfo + '">' + `<span>${songName}</span>-<span class="skinLink" style="cursor:pointer" onclick="toArtist(${artistId})">${artistName}</span>`; +'</a></p></li>';
    } else {
      radiolist[radiolist.length] = '<p class="playing-subtitle"><a class="playing-subtitle-test" title="' + strSongInfo + '">' + strSongInfo + '</a></p></li>';
    }
    // radiolist[radiolist.length] = ' <div class="playing_text_tip" ><div title="' + strname + '" id="playing_text_name">' + strname + '</div><div title="' + strSongInfo + '" id="playing_text_songinfo">' + strSongInfo + '</div></p></div>' + '</li>';


    var playObj = $(pNode.firstChild);
    playObj.before(radiolist.join(""));
    LoadMyImges();
    radiolist = [];
    return;
  } else {
    // document.getElementById("playing_text_name").innerHTML = strname;
    // document.getElementById("playing_text_name").setAttribute("title", strname);
    // document.getElementById("playing_text_songinfo").innerHTML = strSongInfo;
    // document.getElementById("playing_text_songinfo").setAttribute("title", strSongInfo);
    NowObj.find('.br_pic .lazy').attr('data-original', strimg);
    return;
  }
}

//点击跳转到电台播放页的入口
function OnJumpRadioPlayingPage() {
  var strCall = 'OnJumpRadioPlayingPage?fid=' + NowRadioId + "&bjump=1";
  callClientNoReturn(strCall);
  return false;

}

//离开的时候把相应在上面正在播放的电台给删除掉
function leaveradiochannel(str) {
  BindRadioEvent();
  //InitAllRadiostatus(NowRadioId, "3", NowRadioId);
  //InitPara();
  var pNode = document.getElementById("top_ul");
  var nNodes = pNode.childNodes.length;
  if (nNodes >= 3) {
    pNode.removeChild(pNode.firstChild);
  }
}

//播放起来之后的回调函数
function radioNowPlaying(str) {

  //console.log( " str "  +str + " NowRadioId " + NowRadioId);
  if ((str == '' || str == null)) { //为空是停止状态要把相应的正在播放的给置停止状态

    StopTimer();

    if (NowRadioId == -1) {
      return;
    } else {
      InitAllRadiostatus(NowRadioId, "3", NowRadioId);
      return;
    }
  }

  var radioId = getValue(str, 'radioid');
  var radiostatus = getValue(str, 'playstatus');
  btopClick = getValue(str, 'top');

  var songinfo = GetNowPlayingSongInfo();
  strSongInfo = getValue(songinfo, 'songinfo');
  bSongFav = parseInt(getValue(songinfo, 'blike'));

  InitAllRadiostatus(radioId, radiostatus, NowRadioId);
  NowRadioId = radioId;
  NowPlayStatus = radiostatus;
}

function OnJump(str) {

}

function OnLeaveChanel() {
  //$('#frame_content').attr('src', 'init.html');
}

//登录按钮的响应函数
function OnRadioLogin() {
  var uid = getUserID();
  if (uid == 0) {
    callClientNoReturn('UserLogin?src=login');
  }
}

//客户端登录后的回调函数
function clientlogin(strParam) {
  InitPara();
  window.location.reload();
}

//客户端用户登出的回调函数
function clientlogout() {
  InitPara();
  window.location.reload();
}

function GetUserShowName() {
  var showname;
  var str = "GetUserShowName";
  str = callClient(str);
  if (str.length > 0) {
    showname = str;
  } else {
    showname = "私人电台";
  }

  return showname;
}

//根据用户的登录情况来确定是否显示相应的登录提示按钮的文字
function ShowLogin(bLogin) {

  if (bLogin) {
    $(".login_box").hide();
  } else {
    $(".login_box").show();
  }
}

function SetRadioNum(nRadioNum) {
  try {
    if (nRadioNum >= 0) {
      document.getElementById("radio_total_num").innerHTML = "共" + nRadioNum + "个";
    }
  } catch (e) {
    console.log("excp " + e.message);
  }

}

function AddOneTmpRadio(strJson) {

  if (strJson == '' || strJson.length <= 0) {
    return;
  }

  var JsonStrData;
  try {

    JsonStrData = decodeURIComponent(strJson);
  } catch (e) {
    console.log(e.message);
  }

  var JsonObj = eval('(' + JsonStrData + ')');
  var jsonarr = JsonObj.musicradiolists;
  if (jsonarr == null || jsonarr.length <= 0) {
    return;
  }

  var lastObj = $(".radio_con_bottom_radios li:last-child");
  if (typeof (lastObj) != 'undefined') {
    if (lastObj.hasClass('radio_add_more')) {
      $(".radio_con_bottom_radios li:eq(0)").remove();
    }
  }

  totalRadioNum += jsonarr.length;
  SetRadioNum(totalRadioNum);
  //根据模板创建电台列表
  var model = loadTemplate('#kw_radio_con_bottom_radios');
  var htmlStr = drawListTemplate(jsonarr, model, DealWithAllRadioData);
  $(".radio_con_bottom_radios").append(htmlStr);
  LoadMyImges();
}

//获取客户端相应的电台列表
function GetUserRadioLists() {
  var JsonString = callClient("GetUserRadioLists");
  return JsonString;
}

//处理下部的电台
function DealWithListenedRadios() {
  try {

    totalRadioNum = 0;
    CreateAddRadio();
    var JsonStrData = GetUserRadioLists();
    if (JsonStrData == null || JsonStrData.length <= 0) {
      return;
    }
    var JsonObj = eval('(' + JsonStrData + ')');
    var jsonarr = JsonObj.musicradiolists;
    if (jsonarr == null || jsonarr.length <= 0) {
      return;
    }
    for (var index = 0; index < jsonarr.length; index++) {

      if (jsonarr[index].id == '0') {
        jsonarr.splice(index, 1);
      }

      if( jsonarr[index].id == PRIV_FM_ID){
        jsonarr.splice(index, 1);
      }
    }

    totalRadioNum = jsonarr.length;
    //根据模板创建电台列表
    CreateRadioistsFromTemplate(jsonarr);
    CreateAddRadio();
    //添加添加的电台
  } catch (e) {
    console.log("excp " + e.message);
  }
}
/*
 1：播放状态
 2：暂停状态
 3：停止状态
 4：鼠标进入
 5：鼠标离开
 * */

function InitObjStatus(Objele) {
  try {
    Objele.find(".i_play").hide();
    Objele.find(".i_playing").hide();
    Objele.find(".i_pause").hide();
    Objele.find(".i_stop").hide();
    Objele.find(".br_shade").hide();
    Objele.find(".playing_oper").hide();
    Objele.find('.listeners').show();
    Objele.find(".radio_del").hide();
  } catch (e) {
    console(" InitObjStatus Excpt " + e.message);
  }
}

//鼠标进入的事件函数
function MouseEnterFun() {
  if ($(this).hasClass("on")) {
    return;
  }
  $(this).addClass("on");

  var click = '';
  var status = $(this).attr("c-status");
  InitObjStatus($(this));
  if (status == "1" || status == "4") {
    $(this).find(".i_pause").show();
    $(this).find(".br_shade").show();
    $(this).parent().find(".playing_oper").show();
    $(this).find('.listeners').hide();
    var id = $(this).parent().attr('id');
    click = 'OnJumpRadioPlayingPage()';
    $(this).find('.i_pause').unbind('click').bind('click',stopMyRadio);
    $(this).find('.i_play').unbind('click').bind('click',continueMyRadio);
  } else if (status == "2") //暂停状态
  {
    $(this).find(".i_play").attr("title", "继续播放");
    $(this).find(".i_play").show();
    $(this).find(".br_shade").show();
    $(this).parent().find(".playing_oper").show();
    $(this).find('.listeners').hide();
    var id = $(this).parent().attr('id');
    click = 'OnJumpRadioPlayingPage()';
    $(this).find('.i_play').unbind('click').bind('click',continueMyRadio);
  } else {
    $(this).find(".i_play").attr("title", "直接播放");
    $(this).find(".i_play").show();
    $(this).find(".br_shade").show();
    $(this).parent().find(".playing_oper").hide();
    click = $(this).attr('_onclick');
    $(this).find('.i_play').unbind('click').bind('click',function(){eval(click);return false;});
  }

  $(this).find(".radio_del").show();
  $(this).unbind('click').bind('click', function () {
    eval(click);
    return false;
  })

  var pNode = document.getElementById("top_ul");
  if (typeof (pNode) == 'undefined') {
    return;
  }
  var nNodes = pNode.childNodes.length;
  if (nNodes >= 3) {
    $(pNode.firstChild).find('.br_pic').unbind('click').bind('click', OnJumpRadioPlayingPage);
  }
}

//鼠标离开的事件函数
function MouseLeaveFun() {

  $(this).removeClass("on");
  InitObjStatus($(this));

  var status = $(this).attr("c-status");

  if (status == "1" || status == "4") //正在播放状态
  {
    $(this).find(".i_playing").show();
    $(this).find(".br_shade").show();
  } else if (status == "2") //暂停状态
  {
    $(this).find(".i_stop").show();
    $(this).find(".br_shade").show();
  }

  $(this).find(".radio_del").hide();
  $(this).find('.listeners').show();
}

//绑定鼠标进入或离开的事件
function BindRadioEvent() {
  $(".br_pic").live("mouseenter", MouseEnterFun);
  $(".br_pic").live("mouseleave", MouseLeaveFun);
  $(".radio_del").unbind("click").bind("click", DelRadio);
  $('.i_pause').unbind('click').bind('click',stopMyRadio);
  $('.i_play').unbind('click').bind('click',continueMyRadio);
}

function stopMyRadio(evt,id){

  var id = $(this).parent().parent().attr('id');
  var call = 'ChgRadioPlayStatus?radioid='+id+'&playstatus=2';
  callClientNoReturn(call);
  evt.stopPropagation();
  return false;
}

// 继续播放电台
function continueMyRadio(evt,id) {
  var id = $(this).parent().parent().attr('id');
  var call = 'ChgRadioPlayStatus?radioid='+id+'&playstatus=1';
  callClientNoReturn(call);

  evt.stopPropagation();
  return false;
}

function BindOrUnBindAction(commobj, desobj, estatus, radioid) {

  commobj.removeAttr('onclick');
  commobj.unbind("click").bind("click", function () {
    eval($(this).attr("_onclick"));
    return false;
  });
  switch (estatus) {
    case "1":
    case "4":
    {
      desobj.removeAttr('onclick');
      desobj.unbind("click").bind("click", OnJumpRadioPlayingPage);

      commobj.find('.i_play').unbind('click').bind('click',continueMyRadio);
      $(".radio_like").unbind("click").bind("click", radiobtnlike);
      $(".radio_dust").unbind("click").bind("click", radiobtndust);
      $(".radio_add").unbind("click").bind("click", radiobtnadd);
    }
      break;
    case "2":
    {
      desobj.removeAttr('onclick');
      desobj.unbind("click").bind("click", function () {
        OnJumpRadioPlayingPage();
        return false;
      });
    }
      break;
    default:
      break;
  }

  $(".radio_del").unbind("click").bind("click", DelRadio);
  $(".radio_nowplaying_" + NowRadioId).find(".br_pic").unbind("click").bind("click", OnJumpRadioPlayingPage);
}

// 跳转歌手
function toArtist (artistId) {
  callClientNoReturn(`PageJump?param=%7B%22source%22%3A4%2C%22sourceid%22%3A${artistId}%2C%22t%22%3A${new Date().getTime()}%7D;ch%3A10002%3Bname%3Aartist%3B;url%3A%24%7Bnetsong%7Dcontent_artist.html%3Fsource%3D4%26sourceid%3D${artistId}%26t%3D${new Date().getTime()}&calljump=true`);
}

//初始化所有电台的状态
function InitAllRadiostatus(radioid, eStatus, nowradioid) {

  var OneRadioObj = $(".br_pic");
  if (typeof (OneRadioObj) == 'undefined' || OneRadioObj == '' || OneRadioObj.length <= 0) {
    return;
  }

  InitObjStatus(OneRadioObj);
  OneRadioObj.attr("c-status", "0");

  var bTop = false;
  bTop = parseInt(btopClick);

  var DesObj = '';
  var topAllObj = document.getElementById('top_ul');
  var DesEle = topAllObj.lastChild;
  var TopnowSecId = DesEle.getAttribute('id');

  //console.log('radioid:' + radioid + ' estatus ' + eStatus + ' TopnowSecId:' + TopnowSecId + ' NowPlayStatus:' + NowPlayStatus);
  if (TopnowSecId != radioid && bTop && NowPlayStatus != '3') {
    DesObj = $('#top_ul ' + '.radio_' + TopnowSecId).find('.br_pic');
  } else {
    DesObj = $(".radio_" + radioid).find(".br_pic");
    //console.log(" Set " + radioid + " Status " + eStatus + " btopClick " + btopClick + " len is " + DesObj.length + ' NowRadioId ' + nowradioid);
    if (typeof (DesObj) != "undefined" && DesObj.length > 0) {
      if (DesObj.length > 1) {
        if (bTop) {
          DesObj = $('#top_ul ' + '.radio_' + radioid).find('.br_pic');
        } else {
          DesObj = $('#bottom_ul ' + '.radio_' + radioid).find('.br_pic');
        }
      }
    } else {
      var obj = $(document.getElementById("top_ul").lastElementChild);
      DesObj = obj.find('.br_pic');
    }
  }

  var playingSongInfo = callClient('GetRadioPlayingSongInfo');
  // var musicInfo = getValue(playingSongInfo, 'songinfo');
  var artistName = decodeURIComponent(getValue(playingSongInfo, 'artist'));
  var songName = decodeURIComponent(getValue(playingSongInfo, 'songname'));
  var artistId = getValue(playingSongInfo, 'artid');
  if (artistId) {
    DesObj.parent().find('.br_info a').get(0).innerHTML = `<span>${songName}</span>-<span class="skinLink" style="cursor:pointer" onclick="toArtist(${artistId})">${artistName}</span>`;
  } else {
    DesObj.parent().find('.br_info a').get(0).innerHTML = strSongInfo;
  }
  if (eStatus == "1" || eStatus == "4") //正在播放的状态
  {
    try {
      DesObj.find(".br_shade").show();
      DesObj.parent().find('.br_info a').show();
      if (DesObj.hasClass("on")) {
        DesObj.find(".i_pause").show();
        DesObj.find(".radio_del").show();
        DesObj.find(".playing_oper").show();
      } else {
        DesObj.find(".i_playing").show();
      }
      if( DesObj.hasClass('on')){
        DesObj.find('.listeners').hide();
      }else{
        DesObj.find('.listeners').show();
      }

      DesObj.find('.radio_recom').removeClass('radio_recommond_1');
      BindOrUnBindAction(OneRadioObj, DesObj, "1", radioid);
      SetRadioLikeState(radioid, bSongFav);
      SetPlayingRadioFirstPos(radioid);
      var nowSecId;
      var DesEle;
      var topAllObj = document.getElementById('top_ul');
      var nListCnt = topAllObj.childElementCount;
      if (nListCnt > 0 && typeof (topAllObj) != 'undefined') {
        DesEle = topAllObj.lastChild;
        nowSecId = DesEle.getAttribute('id');
      }

      var strname;
      var strimg;
      if (btopClick == 1 && radioid == nowSecId) {
        strimg = 'img/shiduan.png';
        strname = '时段推荐';
      } else {
        strname = DesObj.parent().find(".br_pic").attr("title");
        strimg = DesObj.parent().find(".br_pic").find(".lazyorig").attr("data-original");
      }

      //console.log( " btopClick " + btopClick + " strname " + strname + " strimg " + strimg);
      var bpriv = radioid == 0 ? true : false;
      CreateTopPlayingAndAdd(radioid, strname, strimg, bpriv);
    } catch (e) {
      console.log(" InitAllRadiostatus excp " + e.message);
    }

  } else if (eStatus == "2") //暂停状态
  {
    DesObj.find(".br_shade").show();

    if (DesObj.hasClass("on")) {
      DesObj.find(".i_play").show();
      DesObj.find(".radio_del").show();
    } else {
      DesObj.find(".i_stop").show();
    }
    DesObj.parent().find('.br_info a').show();
    DesObj.find(".playing_oper").show();
    DesObj.find('.listeners').hide();
    BindOrUnBindAction(OneRadioObj, DesObj, "2", radioid);
    SetRadioLikeState(nowradioid, bSongFav);
    SetPlayingRadioFirstPos(radioid);

    var strname;
    var strimg;
    if (btopClick == 1 && radioid == nowSecId) {
      strimg = 'img/shiduan.png';
      strname = '时段推荐';
    } else {
      strname = DesObj.parent().find(".br_pic").attr("title");
      strimg = DesObj.parent().find(".br_pic").find(".lazyorig").attr("data-original");
    }

    //console.log( " btopClick " + btopClick + " strname " + strname + " strimg " + strimg);
    var bpriv = radioid == 0 ? true : false;
    CreateTopPlayingAndAdd(radioid, strname, strimg, bpriv);

  } else {
    var pNode = document.getElementById("top_ul");
    var nNodes = pNode.childNodes.length;
    if (nNodes >= 3) {
      pNode.removeChild(pNode.firstChild);
    }

    $('.br_info a').hide();
    BindOrUnBindAction(OneRadioObj, DesObj, "3", radioid);
  }
  DesObj.attr("c-status", eStatus);

  if (eStatus == "1" || eStatus == "4" || eStatus == "2") {
    StopTimer();
    StartTimer();
  }else{
    StopTimer();
  }

}

function RemoveTopPlayingRadio() {
  var topnum = document.getElementById("top_ul").childElementCount;
  if (topnum > 2) {
    $(document.getElementById("top_ul").firstElementChild).remove();
  }
}

function DelOneRadio(strId) {

  //console.log('DelOneRadio' + strId);
  if (strId == '' || strId == null) {
    return;
  }

  var delObj = $('#bottom_ul #' + strId);
  if (typeof (delObj) == 'undefined') {
    return;
  }

  var NextRadio = delObj.get(0).nextElementSibling;
  if (typeof (NextRadio) == 'undefined' || NextRadio == null || NextRadio.length < 0) {
    NextRadio = delObj.get(0).previousElementSibling;
  }

  try {
    delObj.remove();
    //如何删除完之后，没有多余的电台了，如果有正在播放的电台，则删除
    var restNum = document.getElementById("bottom_ul").childElementCount;
    if (restNum <= 1) {
      var topnum = document.getElementById("top_ul").childElementCount;
      if (topnum > 2) {
        $(document.getElementById("top_ul").firstElementChild).remove();
      }
      initRadioStatus(3);
    }
  } catch (e) {
    console.log(" Del excp " + e.message);
  }

  //更新数量
  totalRadioNum -= 1;
  SetRadioNum(totalRadioNum);

  //console.log(DelDesStatus);

  //如果是这些状态直接返回就行
  if (DelDesStatus != "1" && DelDesStatus != "2" && DelDesStatus != "4") {
    return false;
  }

  ////得到下一个将要播放的电台
  var radioidNext;
  if (typeof (NextRadio) != 'undefined' || NextRadio != null || NextRadio.length > 0) {
    var Rid = NextRadio.getAttribute("id");
    var name = NextRadio.firstElementChild.getAttribute("title");
    radioidNext = "PlayNextRadio?";
    radioidNext += "bnext=" + encodeURIComponent(name) + "+" + Rid;
    callClientNoReturn(radioidNext);
  }
}
//删除一个电台
function DelRadio(ev) {

  /*删除页面的内容*/
  var RadioId = $(this).parent().parent().attr("id");
  var radioname = $(this).parent().attr("title");
  DelDesStatus = $(this).parent().attr('c-status');
  //console.log('DelDesStatus:' + DelDesStatus);
  //并且上面播放的也是当前时段推荐，这个时候只用删除下面页面上对应的电台就行了

  //通知客户端进行删除
  var strDel = "DelOneRadio?";
  strDel += "rname=" + encodeURIComponent(radioname) + '+' + RadioId;
  callClientNoReturn(strDel);

  ev.stopPropagation();
  return false;
}

//设置收藏不的状态
function SetRadioLikeState(radioid, bfav) {
  var DesObj = $(".radio_" + radioid).find(".br_pic");
  if (typeof (DesObj) == 'undefined' || DesObj.length <= 0) {
    return;
  }

  var Status = parseInt(DesObj.find(".playing_oper").attr("radio_blike"));
  if (bfav == Status) {
    return;
  }

  bSongFav = bfav;
  if (bfav) {
    DesObj.find(".playing_oper").attr("radio_blike", "1");
    DesObj.find(".playing_oper").find(".radio_like").addClass("radio_liked");
    DesObj.find(".playing_oper").find(".radio_liked").removeClass("radio_like");
    DesObj.find(".playing_oper").find(".radio_liked").attr("title", "已收藏")
  } else {
    DesObj.find(".playing_oper").attr("radio_blike", "0");
    DesObj.find(".playing_oper").find(".radio_liked").addClass("radio_like");
    DesObj.find(".playing_oper").find(".radio_like").removeClass("radio_liked");
    DesObj.find(".playing_oper").find(".radio_like").attr("title", "收藏");
  }
}

//点击收藏按钮
function radiobtnlike(ev) {
  var strSetFav = "SetSonglikeState";
  callClientNoReturn(strSetFav);

  ev.stopPropagation();
  return false;
}

//垃圾箱按钮
function radiobtndust(ev) {
  var strSetFav = "RadioClickDustbin?icontype=del";
  callClientNoReturn(strSetFav);

  ev.stopPropagation();
  return false;
}

//电台播放时的'+'按钮
function radiobtnadd(ev) {
  var posIndex = 1;
  console.log(btopClick);
  if( parseInt(btopClick) ){
    posIndex = -1;
  }

  var strSetFav = "RadioMore?tagindex=" + posIndex;
  callClientNoReturn(strSetFav);

  ev.stopPropagation();
  return false;
}

//设置相应的图片和相应的时段的标识（如上午）
function SetSecRadioRemark(str, strid, jsondata) {

  //console.log(' @@@@@ str: ' + str + ' strid ' + strid + ' jsondata:'  + jsondata);

  if (str.length <= 0) {
    return;
  }
  var nowSecId;
  var DesEle;
  var topAllObj = document.getElementById('top_ul');
  var nListCnt = topAllObj.childElementCount;
  //console.log('nListcnt is ' + nListCnt);
  if (nListCnt <= 1) {
    return;
  }

  DesEle = topAllObj.lastChild;
  nowSecId = DesEle.getAttribute('id');

  //要设置相应的id 点击字符串
  //时段标识
  var secObj = document.getElementById("radio_sec");
  if (secObj == null) {
    return;
  }
  //设置时间段标识
  secObj.innerHTML = str;

//    console.log(' str is:' + str + ' strid:' + strid  + ' nowSecId is ' + nowSecId + ' NowPlayingId ' + NowRadioId + ' btopClick:' + btopClick + ' NowPlayStatus ' + NowPlayStatus);
  //设置相应的属性
  var strClk = BuildClickStr(jsondata, 1);
  if ((nowSecId != NowRadioId ) && parseInt(btopClick) && NowPlayStatus != '3')  {
    strClk = strClk.replace('tagIndex', 'notjump');
    eval(strClk);
    console.log(' jump');
  } else {
    $(DesEle).find('.br_pic').attr('_onclick', strClk);
    $(DesEle).find('.br_name a').attr('onclick', strClk);
    var playstatus = $(DesEle).find('.br_pic').attr('c-status');
    $(DesEle).attr('class', 'br_wrap_radio radio_' + strid);
    $(DesEle).attr('id', strid);
    $(DesEle).find('.br_info a').attr('id', 'songinfo_' + strid);
  }
}


function GetSecRadioParam() {
  var title;
  var data;
  var str = "CheckSecRadioRemark";
  var strret = callClient(str);
  if (strret.length > 0) {

    title = getValue(strret, "title");
    data = getValue(strret, "data");
  }

  var into = GetSecRaidoIdAndTitle(data); //解析出来
  return into;
}
//电台的时间标识数据
function CheckSecRadioRemark() {
  var info = GetSecRadioParam();
  SetSecRadioRemark(info[0], info[1], info[2]);
}

function SetRadioTimerData(str, strid, jsondata) {
  if (str.length <= 0) {
    return;
  }
  var nowSecId;
  var DesEle;
  var topAllObj = document.getElementById('top_ul');
  var nListCnt = topAllObj.childElementCount;
  if (nListCnt <= 1) {
    return;
  }

  DesEle = topAllObj.lastChild;
  nowSecId = DesEle.getAttribute('id');

  console.log(' nowSecId:' + nowSecId + ' strid:' + strid + ' btop:' + btopClick + ' nowradioid ' + NowRadioId);
  //要设置相应的id 点击字符串
  //时段标识
  var secObj = document.getElementById("radio_sec");
  if (secObj == null) {
    return;
  }


  //设置时间段标识
  secObj.innerHTML = str;

  //设置相应的属性
  var strClk = BuildClickStr(jsondata, 1);
  //console.log(' Interval strClk ' + strClk);
  $(DesEle).find('.br_pic').attr('_onclick', strClk);
  $(DesEle).find('.br_name a').attr('onclick', strClk);
  var playstatus = $(DesEle).find('.br_pic').attr('c-status');
  $(DesEle).attr('class', 'br_wrap_radio radio_' + strid);
  $(DesEle).attr('id', strid);
  $(DesEle).find('.br_info a').attr('id', 'songinfo_' + strid);
//    console.log(' typeof status:' + typeof(playstatus) + ' status :' + playstatus + ' btpclick:' + btopClick + ' typeoftopclick:' + typeof(btopClick));
  if (nowSecId != strid && (parseInt(playstatus) == 1 || parseInt(playstatus) == 2 || parseInt(playstatus) == 4) && parseInt(btopClick)) {
    strClk = strClk.replace('tagIndex', 'notjump');
    //console.log( ' interval 跳转了 ######strrid :' + strid + ' strClk:' + strClk);
    eval(strClk);
  }
}

function ChgRelaRadios(strId) {
  // console.log(' #####ChgRelaRadios: ' + strId);
  var info = GetSecRadioParam();
  if (info[0].length <= 0) {
    return;
  }
  var nowSecId;
  var DesEle;
  var topAllObj = document.getElementById('top_ul');
  var nListCnt = topAllObj.childElementCount;
  if (nListCnt <= 1) {
    return;
  }

  DesEle = topAllObj.lastChild;
  nowSecId = DesEle.getAttribute('id');

  //要设置相应的id 点击字符串
  //时段标识
  var secObj = document.getElementById("radio_sec");
  if (secObj == null) {
    return;
  }
  //设置时间段标识
  secObj.innerHTML = info[0];

  //设置相应的属性
  var strClk = BuildClickStr(info[2], 1);
  $(DesEle).find('.br_pic').attr('_onclick', strClk);
  $(DesEle).find('.br_name a').attr('onclick', strClk);
  $(DesEle).attr('class', 'br_wrap_radio radio_' + info[1]);
  $(DesEle).attr('id', info[1]);
  $(DesEle).find('.br_info a').attr('id', 'songinfo_' + info[1]);
}

function CheckRadioTimer() {

  var info = GetSecRadioParam();
  if (typeof (info) == 'undefined') {
    return;
  }
  console.log(' #### Inteval #### NowRadioId :' + NowRadioId + " status:" + NowPlayStatus + ' botp:' + btopClick);
  SetRadioTimerData(info[0], info[1], info[2]);
}

//创建时段推荐
function CreateTimeSecRadio() {

  var info = GetSecRadioParam(); //从客户端得到相应数据
  if (typeof (info) == 'undefined') {
    return;
  }
  var strId = info[1];

  var ClkStr = BuildClickStr(info[2], 1); //点击事件的函数
  var radiolist = [];
  radiolist[radiolist.length] = '<li class="br_wrap_radio radio_' + strId + '" id="' + strId + '"';
  radiolist[radiolist.length] = '>';
  radiolist[radiolist.length] = '<a _onclick="' + ClkStr + '"' + 'onclick="' + ClkStr + '"' + 'title="时段推荐" bTypeSec="1" class="br_pic"  href="###" hidefocus>';
  radiolist[radiolist.length] = '<img class="lazy lazyorig" width="140" height="140" src="img/shiduan.png" onerror="imgOnError(this,150)" data-original="img/shiduan.png"/>';
  radiolist[radiolist.length] = '<span class="br_shade"></span>';
  radiolist[radiolist.length] = '<i title="直接播放" class="i_play"></i>';
  radiolist[radiolist.length] = '<i class="i_playing"></i>';
  radiolist[radiolist.length] = '<i title="暂停播放" class="i_pause"></i>';
  radiolist[radiolist.length] = '<i title="" class="i_stop"></i>';
  radiolist[radiolist.length] = '<div class="radio_sec_tip" id="radio_sec">凌晨</div>';
  radiolist[radiolist.length] = '<ul class="playing_oper" ><li title="收藏" class="radio_like"></li><li title="不收藏" class="radio_dust" ></li><li title="更多" class="radio_add"></li></li></ul></a>';
  radiolist[radiolist.length] = '<p class="br_name"><a href="javascript:void(0)" title="时段推荐">时段推荐</a></p>';
  radiolist[radiolist.length] = '<p id="scroll_info" class="br_info"><a id="songinfo_' + strId + '"></a></p></li>';
  radiolist.join("");
  $(".radio_con_top_radios").append(radiolist.join(""));
  LoadMyImges();
  radiolist = [];

  //console.log(' Cretatimesec');
  SetSecRadioRemark(info[0], info[1], info[2]); //先设置下相应的时间标签，不然会有相应的延时
  info = null;
}

function GetFMInfo(){
  var call = 'GetPrivFMInfo';
  var rst = callClient(call);
  return rst;
}

function BuildFMString(jsonObj){

  var clickstr = '';
  var strId = '';
  var strImg = '';

  if( jsonObj == '' || jsonObj == null ){
    clickstr = BuildFMClickStr(0);
    strId = PRIV_FM_ID;
  }else{
    clickstr = BuildFMClickStr(1,jsonObj);
    strId = jsonObj.id;
  }

  strImg = 'http://star.kwcdn.kuwo.cn/star/radio/blur/' + strId + '.jpg?' + GenRadioRandomsufix(6);
  var ClkStr = clickstr;

  var radiolist = [];
  radiolist[radiolist.length] = '<li class="br_wrap_radio radio_' + strId + '" id="' + strId + '"';
  radiolist[radiolist.length] = '>';
  radiolist[radiolist.length] = '<a _onclick="' + ClkStr + '"' + 'onclick="' + ClkStr + '"' + 'title="猜你喜欢" bTypeSec="1" class="br_pic"  href="###" hidefocus>';
  radiolist[radiolist.length] = '<img class="lazy lazyorig" width="140" height="140" src="img/default.png" onerror="imgOnError(this,150)" data-original="' + strImg + '"/>';
  radiolist[radiolist.length] = '<span class="br_shade"></span>';
  radiolist[radiolist.length] = '<i title="直接播放" class="i_play"></i>';
  radiolist[radiolist.length] = '<i class="i_playing"></i>';
  radiolist[radiolist.length] = '<i title="暂停播放" class="i_pause"></i>';
  radiolist[radiolist.length] = '<i title="" class="i_stop"></i>';
  radiolist[radiolist.length] = '<ul class="playing_oper" ><li title="收藏" class="radio_like"></li><li title="不收藏" class="radio_dust" ></li><li title="更多" class="radio_add"></li></li></ul></a>';
  radiolist[radiolist.length] = '<p class="br_name"><a href="javascript:void(0)" onclick="ClickRadioName(' + strId + ')' + '"' + 'title="猜你喜欢">猜你喜欢</a></p>';
  radiolist[radiolist.length] = '<p id="scroll_info" class="br_info"><a id="songinfo_' + strId + '"></a></p></li>';
  radiolist.join("");
  $(".radio_con_top_radios").html(radiolist.join(""));
  LoadMyImges();
  radiolist = [];
}


function CreatePrivFMBlock(){

  var info = GetFMInfo();
  if( info == '' || info == null ){
    return;
  }

  var infoObj = eval('(' + info + ')');
  var desObj = infoObj.musicradiolists[0];
  BuildFMString(desObj);
}


/*创建不同形式的私人电台*/
function CreatePrivateRadio() {

  var blog = parseInt(UserIsLogin());
  var str = BuildPriClickStr();
  var radiolist = [];
  if (blog) {

    radiolist[radiolist.length] = '<li class="br_wrap_radio radio_0"';
    radiolist[radiolist.length] = 'id="0">';
    radiolist[radiolist.length] = '<a _onclick="' + str + '"';
    radiolist[radiolist.length] = 'onclick="' + str + '"';
    radiolist[radiolist.length] = 'title="私人电台" class="br_pic" href="###" hidefocus>';
    radiolist[radiolist.length] = '<img class="lazy lazyorig" width="140" height="140" src="img/siren.jpg" data-original="img/siren.jpg"/>';
    radiolist[radiolist.length] = '<span class="br_shade"></span>';
    radiolist[radiolist.length] = '<i title="直接播放" class="i_play"></i>';
    radiolist[radiolist.length] = '<i class="i_playing"></i>';
    radiolist[radiolist.length] = '<i title="暂停播放" class="i_pause"></i>';
    radiolist[radiolist.length] = '<i title="" class="i_stop"></i>';
    radiolist[radiolist.length] = '<ul class="playing_oper" ><li title="收藏" class="radio_like"></li><li title="不收藏" class="radio_dust" ></li><li title="更多" class="radio_add"></li></li></ul></a>';
    radiolist[radiolist.length] = '<p class="br_name"><a href="javascript:void(0)" onclick="ClickRadioName(0)" title="私人电台">私人电台</a></p>';
    radiolist[radiolist.length] = '<p id="scroll_info" class="br_info"><a id="songinfo_0"></a></p></li>';
    radiolist.join("");

  } else {
    radiolist[radiolist.length] = '<li class="br_wrap_radio ';
    radiolist[radiolist.length] = 'radio_0';
    radiolist[radiolist.length] = '"><a title="私人电台" class="br_pic" href="###" hidefocus>';
    radiolist[radiolist.length] = '<img class="lazy lazyorig" width="140" height="140" src="img/siren.jpg" data-original="img/siren.jpg"/>';

    radiolist[radiolist.length] = '<span class="br_shade_unlogin" onclick="OnRadioLogin()"></span>';
    radiolist[radiolist.length] = ' <div class="unlogin_text_tip" onclick="OnRadioLogin()"><p>登录后可收听</p><p>越听越准</p></p></div></a>';
    radiolist[radiolist.length] = '<p class="br_name" ><a href="javascript:void(0)" onclick="OnRadioLogin()" title="私人电台">私人电台</a></p>';
    radiolist[radiolist.length] = '<p class="br_info"><a id="songinfo_0"></a></p></li>';
    radiolist.join("");
  }

  $(".radio_con_top_radios").html(radiolist.join(""));
  LoadMyImges();
  radiolist = [];
}


function GetSecRaidoIdAndTitle(data) {
  if (data == '' || data == 'undefined' || typeof (data) == 'undefined') {
    return;
  }
  if (data.length <= 0) {
    return;
  }

  var jsonObj = eval('(' + data + ')'); //返回的是从服务器下载的配置文件中获取的
  var strSectitle = jsonObj.disname; //得到显示的名称

  //解析相应的参数
  var ParArr = [];
  var strPara = jsonObj.sourceid;
  ParArr = strPara.split(",");

  var SecRadioId = ParArr[0]; //第一个是id

  //创建json对象，用来创建时段推荐的事件
  var Jsonstr = '{"id":' + '"' + ParArr[0] + '"' + ',"latesttime":' + '"' + ParArr[5] + '"' + ',"listeners":' + '"' + ParArr[8] + '"';
  Jsonstr += ',"name":' + '"' + ParArr[1] + '"' + ',"playtime":' + '"' + ParArr[7] + '"' + ',"radiopic":' + '"' + jsonObj.pic + '"';
  Jsonstr += ',"radiopicnp":' + '"' + ParArr[2] + '"' + ',"radiopicpl":' + '"' + ParArr[3] + '"' + ',"recomond":"0"';
  Jsonstr += ',"type":"4"' + ',"updatetime":' + '"' + ParArr[4] + '"' + '}';

  var ObjSec = eval("(" + Jsonstr + ")"); // 转换为json对象
  return [strSectitle, SecRadioId, ObjSec];
}

//处理上部固定几个电台
function DealWithTopRadios() {

  //CreatePrivateRadio(); //创建私人电台
  CreatePrivFMBlock();
  CreateTimeSecRadio(); //创建时段推荐
}

function BuildFMClickStr(ntype,jsondata){

  if( ntype = '0' ){
    var log = "radioLog('POSITION:1,3|GPOSITION:2,1|FROMPAGE:我的电台|RADIOID:-26711|CSRCTAG:猜你喜欢');"
    var radioclick = "commonClick({'source':'9','sourceid':'-26711,猜你喜欢,http://img1.kwcdn.kuwo.cn:81/star/tags/201510/1446035835261.jpg,http://img1.kwcdn.kuwo.cn:81/star/tags/201510/1446035849351.jpg,2008-08-08,2014-06-16,4,0~24,907,4,1','name':'猜你喜欢','id':'-26711','extend':'|RADIO_PIC=http://img1.sycdn.kuwo.cn/star/rcm/radio/26711.png|DIS_NAME=猜你喜欢|'})";
    return (log + radioclick);
  }else if( ntype == '1' ){

    var onclick = "radioLog('POSITION:1,1|GPOSITION:1,1| FROMPAGE:我的电台| RADIOID:" + jsondata.id + '|CSRCTAG:' + jsondata.name + "');";
    var commonclick = "commonClick({'source':'4','sourceid':'" + jsondata.id + ",";
    commonclick += jsondata.name + "," + jsondata.radiopicnp + "," + jsondata.radiopicpl + ",";
    commonclick += jsondata.upatetime + "," + jsondata.latesttime + "," + jsondata.type + ",";
    commonclick += jsondata.playtime + "," + jsondata.listeners + "," + jsondata.type + ",";
    commonclick += "1',";
    commonclick += "'name'" + ":" + "'" + jsondata.name + "'" + "," + "'id'" + ":" + "'" + jsondata.listeners + "'" + ",";
    commonclick += "'extend'" + ":" + "'|" + 'RADIO_PIC=' + jsondata.radiopic + '|' + 'DIS_NAME=' + jsondata.name + "|','tagIndex':'1'";
    commonclick += "})";
    onclick += commonclick;

    return onclick;
  }
}


function BuildClickStr(jsondata, ntype) {
  var type = 4;
  if (ntype == 0) {
    type = 4;
  } else if (ntype == 1) {
    type = 9;
  }

  var onclick = "radioLog('POSITION:1,1|GPOSITION:1,1| FROMPAGE:我的电台| RADIOID:" + jsondata.id + '|CSRCTAG:' +jsondata.name + "');";
  var commonclick = "commonClick({'source':'9','sourceid':'" + jsondata.id + ",";
  commonclick += jsondata.name + "," + jsondata.radiopicnp + "," + jsondata.radiopicpl + ",";
  commonclick += jsondata.upatetime + "," + jsondata.latesttime + "," + type + ",";
  commonclick += jsondata.playtime + "," + jsondata.listeners + "," + type + ",";
  commonclick += "1',";
  commonclick += "'name'" + ":" + "'" + jsondata.name + "'" + "," + "'id'" + ":" + "'" + jsondata.listeners + "'" + ",";
  commonclick += "'extend'" + ":" + "'|" + 'RADIO_PIC=' + jsondata.radiopic + '|' + 'DIS_NAME=' + jsondata.name + "|','tagIndex':'1'";
  commonclick += "})";
  onclick += commonclick;

  return onclick;
}

function BuildSecRadioClk(jsondata) {
  if (jsondata.length <= 0) {
    return;
  }

  var jsonObj = eval('(' + jsondata + ')');
  var pic = jsonObj.pic;
  var srcId = jsonObj.sourceid;
  srcId.split(",");
  var conNum = [];

  for (var i = 0; i < srcId.length; i++) {
    conNum.push(srcId[i]);
  }

  var onclick = "radioLog('POSITION:1,1|GPOSITION:1,1| FROMPAGE:我的电台| RADIOID:" + jsondata.id + "');";
  var commonclick = "commonClick({'source':'9','sourceid':'" + conNum[0] + ",";
  commonclick += conNum[1] + "," + conNum[2] + "," + conNum[3] + ",";
  commonclick += conNum[4] + "," + conNum[5] + "," + conNum[6] + ",";
  commonclick += conNum[7] + "," + conNum[8] + "," + conNum[6] + ",";
  commonclick += "1',";
  commonclick += "'name'" + ":" + "'" + conNum[1] + "'" + "," + "'id'" + ":" + "'" + conNum[8] + "'" + ",";
  commonclick += "'extend'" + ":" + "'|" + 'RADIO_PIC=' + pic + '|' + 'DIS_NAME=' + conNum[1] + "|'";
  commonclick += "})";
  onclick += commonclick;
  conNum = [];
  return onclick;
}

function BuildPriClickStr() {

  var showname = GetUserShowName();
  var onclick = "radioLog('POSITION:1,1|GPOSITION:1,1| FROMPAGE:我的电台| RADIOID:" + '0' +'|CSRCTAG:' + '私人电台' +  "');";
  var commonclick = "commonClick({'source':'9','sourceid':'" + 0 + ",";
  commonclick += showname + "," + '' + "," + '' + ",";
  commonclick += '' + "," + '' + "," + 1 + ",";
  commonclick += '' + "," + '200' + "," + 1 + ",";
  commonclick += "1',";
  commonclick += "'name'" + ":" + "'" + showname + "'" + "," + "'id'" + ":" + "'" + 200 + "'" + ",";
  commonclick += "'extend'" + ":" + "'|" + 'RADIO_PIC=' + '' + '|' + 'DIS_NAME=' + showname + "|','tagIndex':'1'";
  commonclick += "})";
  onclick += commonclick;

  return onclick;
}

function CreateAddRadio() {
  var lastObj = $(".radio_con_bottom_radios li:last-child");
  if (typeof (lastObj) != 'undefined') {
    if (lastObj.hasClass('radio_add_more')) {
      return;
    }
  }
  var radiolist = [];
  radiolist[radiolist.length] = '<li class="br_wrap_radio ';
  radiolist[radiolist.length] = 'radio_add_more';
  radiolist[radiolist.length] = '"><a title="添加" class="br_pic" href="###" hidefocus>';
  radiolist[radiolist.length] = '<img class="lazy_add" src="img/tianjia.png"/>';
  radiolist[radiolist.length] = '<span class="circle_cover_add" onclick="OnAddMoreRadio()"></span></a>';
  radiolist[radiolist.length] = '<p class="br_name"><a  href="javascript:void(0)" onclick="OnAddMoreRadio()" >添加更多</a></p></li>';
  radiolist.join("");
  $(".radio_con_bottom_radios").append(radiolist.join(""));
  radiolist = [];
}

function CreateRadioistsFromTemplate(Arrdata) {
  var model = loadTemplate('#kw_radio_con_bottom_radios');
  var htmlStr = drawListTemplate(Arrdata, model, DealWithAllRadioData);
  $('#bottom_ul').html(htmlStr);
  LoadMyImges();
}


function DealWithAllRadioData(obj) {
  var json = [];
  var name = obj.name;
  var rid = obj.id;
  var pic = obj.radiopic;
  pic = 'http://star.kwcdn.kuwo.cn/star/radio/blur/' + rid + '.jpg?' + GenRadioRandomsufix(6);
  var recom = parseInt(obj.recommond);
  var click = BuildClickStr(obj, 0);
  var fre = obj.playfre;
  var listcnt = FormatRadioListenersNum(obj.listeners);

  json = {
    'radioid': rid,
    'clk': click,
    'title': name,
    'pic': pic,
    'recom': recom,
    'playfre': fre,
    'lscnt':listcnt
  }

  return json;
}

function ClickRadioName(str) {
  var status = $("#" + str).find(".br_pic").attr("c-status");
  //console.log("ClickRadioName status is  " + status);

  var funcStr = $("#" + str).find(".br_pic").attr("onclick");
  if (typeof (funcStr) == 'undefined' || funcStr.length <= 0) {
    funcStr = $("#" + str).find(".br_pic").attr("_onclick");
  }
  // console.log("ClickRadioName funcStr is  " + funcStr);

  eval(funcStr);
  return false;
}

/*
 播放状态：
 1.正在播放
 2.暂停播放
 3.停止播放
 */
function GetNowRadioPlaying() {

  var call = "GetRadioNowPlaying";
  var str = callClient(call);
  if (str == '' || str == null) {
    return;
  }

  var radioid = getValue(str, 'radioid');
  var radiostatus = getValue(str, 'playstatus');
  btopClick = getValue(str, 'top');

  NowRadioId = radioid;
  NowPlayStatus = radiostatus;

  var songinfo = GetNowPlayingSongInfo();
  if (songinfo != '' && songinfo != null) {
    strSongInfo = getValue(songinfo, 'songinfo');
    bSongFav = parseInt(getValue(songinfo, 'blike'));
  }
}

/*得到现在正在播放的电台的歌曲信息和艺人信息*/
function GetNowPlayingSongInfo() {
  var strCall = "GetRadioPlayingSongInfo";
  var strRst = callClient(strCall);
  if (strRst == '' || strRst == null) {
    return '';
  }

  return strRst;
}

//入口函数
var NowRadioId = -1;
var NowPlayStatus = 3;
var strSongInfo = '';
var totalRadioNum = 1;
var bSongFav = false;
var bLogin = false;
var timerId = null;
//var timerId_scroll = null;
//
var direc = 0;

var bStartTimer = false;

var btopClick = false;
var DelDesStatus = '';
var PRIV_FM_ID = '-26711';

var SCROLL_INFO_TIMER = [];
var NORMAL_TIMER = [];

$(function () {
  callClientNoReturn('domComplete');
  freshAll();
})

function ResetParam() {
  NowRadioId = -1;
  NowPlayStatus = 3;
  strSongInfo = '';
  totalRadioNum = 0;
  bSongFav = false;
  btopClick = false;

  clearInterval(timerId);
  timerId = null;

  ClearNoamalTimer();
  ClearScrollInfoTimer();

  direc = 0;
  var bStartTimer = false;
  DelDesStatus = '';
}

function ClearNoamalTimer(){
  for(var ncnt = 0;ncnt < NORMAL_TIMER.length;ncnt++){
    var id = NORMAL_TIMER[ncnt];
    clearTimeout(id);
  }

  NORMAL_TIMER = [];
}

function ClearScrollInfoTimer(){
  for(var nCnt = 0;nCnt < SCROLL_INFO_TIMER.length;nCnt++){
    var id = SCROLL_INFO_TIMER[nCnt];
    clearTimeout(id);
  }

  SCROLL_INFO_TIMER = [];
}


function OnRefresh(str) {
  InitPara();
  window.location.reload();
}

function UserIsLogin() {
  var str = 'UserIsLogin';
  var ret = callClient(str);
  var blogin = getValue(ret, 'blogin');
  return blogin;
}

function InitPara() {
  ResetParam();
  var login = parseInt(UserIsLogin());
  ShowLogin(1);
  GetNowRadioPlaying();
}

function StartTimer() {

  //console.log( " @@@ start timer ");
  bStartTimer = true;
  ScrollSongInfo();
}

function StopTimer() {

  //console.log( " ### stop timer ");
  bStartTimer = false;
  ClearNoamalTimer();
  ClearScrollInfoTimer();
  //clearTimeout(timerId_scroll);
  //timerId_scroll = null;
}

function UpdateListerersNum(strInfo){
  if( strInfo == '' || strInfo == null ){
    return;
  }

  strInfo = decodeURIComponent(strInfo);
  var JsonObj = eval('(' + strInfo + ')' );
  var jsonarr = JsonObj.radiolisterers;
  if( jsonarr == '' || jsonarr == null ){
    return;
  }

  if( jsonarr.length <= 0 ){
    return;
  }

  for( var nIndex = 0;nIndex < jsonarr.length;nIndex++){
    var dataObj = jsonarr[nIndex];
    var upRadioId = dataObj.id;
    var nListNum = dataObj.listcnt;
    var DesidEle = $('#bottom_ul ' + '.radio_' + upRadioId).find('.listeners');
    if( typeof(DesidEle) == 'undefined' ){
      continue;
    }

    var listen;
    var listennum = parseInt(nListNum,10);
    if (listennum > 99999) {
      var n1 = parseInt(listennum / 10000,10);
      var n2 = listennum % 10000 + '';
      n2 = n2.substring(0,1);
      if( n2 != '0' ){
        listen = n1 + '.' + n2 + '万';
      }else{
        listen = n1 + '万';
      }

    } else {
      listen = parseInt(listennum);
    }

    DesidEle.get(0).innerHTML = listen;
  }
}

function LoadMyImges(){

  var arr = document.getElementsByClassName("lazy");
  if( arr.length <= 0 ){
    return;
  }

  var prec1 = getClient();
  var prec2;
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i]) {
      prec2 = getSubClient(arr[i]);
      if (contains(prec1, prec2)) {
        //加载资源
        var dataOri = $(arr[i]).attr('data-original');
        var src = $(arr[i]).attr('src');
        if( src != dataOri ){
          $(arr[i]).attr("src",dataOri);
          $(arr[i]).removeClass("lazy");
        }
        delete arr[i];
      }
    }
  }
}


function getClient() {
  var l, t, w, h;
  l = document.documentElement.scrollLeft || document.body.scrollLeft;
  t = document.documentElement.scrollTop || document.body.scrollTop;
  w = document.documentElement.clientWidth;
  h = document.documentElement.clientHeight;
  return {
    left: l,
    top: t,
    width: w,
    height: h
  };
}

function getSubClient(p) {
  var l = 0,
    t = 0,
    w, h;
  w = p.offsetWidth;
  h = p.offsetHeight;
  while (p.offsetParent) {
    l += p.offsetLeft;
    t += p.offsetTop;
    p = p.offsetParent;
  }
  return {
    left: l,
    top: t,
    width: w,
    height: h
  };
}

function contains(recFst, recSec) {
  var CenXFst, CenXSec, CenYFst, CenYSec, MaxW, MaxH;
  CenXFst = recFst.left + recFst.width / 2;//(中心点的x坐标)
  CenYFst = recFst.top + recFst.height / 2;//(中心点的y坐标)

  CenXSec = recSec.left + recSec.width / 2;//(中心点的x坐标)
  CenYSec = recSec.top + recSec.height / 2;//(中心点的y坐标)

  MaxW = (recFst.width + recSec.width) / 2;//中心点x的坐标最大范围
  MaxH = (recFst.height + recSec.height) / 2;//中心点y的坐标最大范围

  return Math.abs(CenXFst - CenXSec) < MaxW && Math.abs(CenYFst - CenYSec) < MaxH;
}

/**
 * @description: 资源出现在视野中再加载.将资源放入一个数组。
 */
window.onscroll = function () {
  LoadMyImges();
}

window.onresize = function(){
  LoadMyImges();
}

function freshAll() {


  InitPara(); //初始化所有的参数

  DealWithTopRadios(); //处理上部电台包括私人电台作时段推荐

  DealWithListenedRadios(); //处理下面的电台

  SetRadioNum(totalRadioNum); //设置听过的电台的数量

  InitAllRadiostatus(NowRadioId, NowPlayStatus, NowRadioId); //初始化所有电台的状态

  BindRadioEvent(); //绑定鼠标进入和离开的事件
  clearInterval(timerId);
  timerId = setInterval(CheckRadioTimer, 1000 * 60 * 5);
  StartTimer();
}

// 客户端播放标记回调
function StopPlayMark() {
}
