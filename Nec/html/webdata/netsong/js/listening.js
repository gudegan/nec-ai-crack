document.onselectstart = function(){if(event.srcElement.tagName!="TEXTAREA"){return false}};
var resultTitle=['木耳','银耳','金耳','钛金耳','钻石耳'];
//结果页文案数据
var result={
  wood:['你能辨识的最高频率是','KHZ,击败了','的测试者','你的耳朵弱爆了,请检查设备或提高音量再测一遍','调试音量建议使用高音质音乐'],
  silver:['你能辨识的最高频率是','KHZ,击败了','的测试者','金耳潜力股，至少要听超品音质才行','快来感受一下吧'],
  gold:['你能辨识的最高频率是','KHZ,击败了','的测试者','不听无损音乐简直白瞎了你这对耳朵','快来感受一下吧'],
  Titanium:['你能辨识的最高频率是','KHZ,击败了','的测试者','大神请收下我的膝盖,发烧级音质捧上','请大神欣赏'],
  Diamonds:['你能辨识的最高频率是','KHZ,击败了','的测试者','也许是东半球最棒的耳朵，请珍惜','用酷我听真无损才对味']
};
var stampPos=[{'x':-17,'y':-6},{'x':-153,'y':-6},{'x':-17,'y':-143},{'x':-153,'y':-143},{'x':-153,'y':-281}];
var musicSrc=['http://rh03.sycdn.kuwo.cn/resource/liulutest/test01.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test02.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test03.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test04.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test05.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test06.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test07.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test08.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test09.wav','http://rh03.sycdn.kuwo.cn/resource/liulutest/test10.wav'];
var direction='';
var pageReady=false;
var nextCount=0;
var prevCount=0;

//是否是首次启动听力测试
var isFirst = getDataByConfig('MusicListTest','OpenCount');
$(function(){
  callClientNoReturn('showMusiclistenWindow');
  var oCount=$('.t_page1 .countdown');
  var countdownTimer=null;
  var nextBok=false;
  if(!isFirst){
    realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_FIRSTOPEN");
  }else{
    realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_OPEN");
  }

  $('.j_start').on('click',function(){
    $(this).hide();
    $('.j_now').show();
    $('.ring').hide();
    oCount.show();
    fnCountDown(oCount,page1hide);
  });

  $('.j_now').on('click',function(){
    page1hide();
    pageReady=true;
  });

  $('.j_next').on('click',function(){
    if(!getMusicTime()){
      return false;
    }
    if(direction==='')direction=true;
    if(direction){//正向可听
      nextCount++;
      if(nextCount>7){
        page2hide(oCount);
        //musicStop();
        page3Info(resultTitle[4],result.Diamonds,21,99.99);
        setPage3ArtistInfo(21);
        setPage3ResultInfo(21);
      }else{
        //var musicNum=todou(nextCount+3);
        //musicReady(true,'audio/test'+musicNum+'.wav');
        var musicNum=nextCount+2;
        musicReady(true,musicSrc[musicNum]);
      }
    }else{//负向返回数据
      switch(prevCount){
        case 1:
          page3Info(resultTitle[0],result.wood,12,rnd(11,16));
          setPage3ArtistInfo(12);
          setPage3ResultInfo(12);
          break;
        case 2:
          page3Info(resultTitle[0],result.wood,10,rnd(1,6));
          setPage3ArtistInfo(10);
          setPage3ResultInfo(10);
          break;
      }
      page2hide(oCount);
      //musicStop();
    }
  });

  $('.j_prev').on('click',function(){
    if(!getMusicTime()){
      return false;
    }
    if(direction==='')direction=false;
    if(direction){//正向返回结果
      switch(nextCount){
        case 1:
          //14
          page3Info(resultTitle[0],result.wood,14,rnd(25,31));
          setPage3ArtistInfo(14);
          setPage3ResultInfo(14);
          break;
        case 2:
          //15
          page3Info(resultTitle[1],result.silver,15,rnd(50,61));
          setPage3ArtistInfo(15);
          setPage3ResultInfo(15);
          break;
        case 3:
          //16
          page3Info(resultTitle[1],result.silver,16,rnd(60,71));
          setPage3ArtistInfo(16);
          setPage3ResultInfo(16);
          break;
        case 4:
          //17
          page3Info(resultTitle[2],result.gold,17,rnd(85,91));
          setPage3ArtistInfo(17);
          setPage3ResultInfo(17);
          break;
        case 5:
          //18
          page3Info(resultTitle[2],result.gold,18,rnd(81,96));
          setPage3ArtistInfo(18);
          setPage3ResultInfo(18);
          break;
        case 6:
          //19
          page3Info(resultTitle[3],result.Titanium,19,rnd(96,99));
          setPage3ArtistInfo(19);
          setPage3ResultInfo(19);
          break;
        case 7:
          //20
          page3Info(resultTitle[3],result.Titanium,20,99);
          setPage3ArtistInfo(20);
          setPage3ResultInfo(20);
          break;
      }
      page2hide(oCount);
      //musicStop();
    }else{//负向可听
      //准备听力测试的数据
      prevCount++;
      if(prevCount>2){
        page3Info(resultTitle[0],result.wood,10,rnd(1,6));
        setPage3ArtistInfo(10);
        setPage3ResultInfo(10);
        page2hide(oCount);
        //musicStop();
      }else{
        // var musicNum=todou(3-prevCount);
        // musicReady(true,'audio/test'+musicNum+'.wav');
        var musicNum=2-prevCount;
        musicReady(true,musicSrc[musicNum]);
      }
    }
  });

  $('.j_again').on('click',function(){
    reStart();
  });

  // $('.close').on('click',function(){
  // 	callClient('closewindow');
  // });

  $('.i_play').on('click',function(){
    var level = $(this).attr('data-q');
    if(level=='aq'){
      level = 4;
    }else{
      level = 3;
    }
    singleMusicOption('Play',$(this).attr('data-info'),level);

    if(!isFirst){
      realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_FIRSTPLAY");
    }else{
      realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_PLAY");
    }
    callClientNoReturn('closewindow');
  });

  //分享
  $('.j_share').on('click',function(){
    var musicId = $(this).attr("data-rid");
    var tid = $(this).parents("li").attr("data-tid");
    var call = '';
    var txt=encodeURIComponent('#酷我听力测试# 天呐！我的耳朵居然是-'+$('.resultTitle').html()+'，你是什么耳？一测便知。（分享自@酷我音乐，免费下载无损音乐，让耳朵听点好的）');
    call = 'ShowShareWnd?rid='+encodeURIComponent('MUSIC_'+musicId+'&type=text&text='+txt);
    callClientNoReturn(call);
    return false;
  });

  //双击取消默认选中文字
  $('body').on('dbclick',function(){
    return false;
  });
});

function fnCountDown(oCount,callback){
  var n=5;
  countdownTimer=setInterval(function(){
    n--;
    //console.log(n);
    oCount.html(n);
    if(n<=0){
      oCount.hide();
      n=5;
      clearInterval(countdownTimer);
      if(callback)callback();
    }else{
      if(pageReady){
        clearInterval(countdownTimer);
        oCount.html(5);
      }
    }
  },1000);
}

function page1hide(){
  $('.t_page1').hide();
  $('.b_page1').hide();
  $('.t_page2').show();
  $('.b_page2').show();
  singleMusicOption('stopPlay');
  musicReady();
  if(!isFirst){
    realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_FIRSTSTART");
  }else{
    realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_START");
  }
}

function page2hide(oCount){
  pageReady=true;
  musicStop();
  $('.t_page2').hide();
  $('.b_page2').hide();
  oCount.html(5);

  $('.t_page3').show();
  $('.b_page3').show();
  // if(!isFirst){
  // 	realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_FIRSTSUCCESS");
  // }else{
  // 	realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_SUCCESS");
  // }
}

function page3Info(title,infoArr,hz,num){
  //头部title信息
  switch(title){
    case '木耳':
      var color = '#0096ff';
      break;
    case '银耳':
      var color = '#74cd3e';
      break;
    case '金耳':
      var color = '#fff000';
      break;
    case '钛金耳':
      var color = '#ffa200';
      break;
    case '钻石耳':
      var color = '#ff0018';
      break;
  }
  $('.topArea .title').addClass('resultTitle').html(title).css('color',color);
  $('.pt44').html(infoArr[3]);
  $('.pt13').html(infoArr[4]);

  $('.resultTitleBox .main').each(function(i){
    switch(i){
      case 0:
        $(this).html(infoArr[i]);
        break;
      case 1:
        $(this).html('<span class="num">'+hz+'</span>'+infoArr[i]);
        break;
      case 2:
        $(this).html('<span class="num">'+num+'%</span>'+infoArr[i]);
        break;
    }
  });

  //关于文字居中的处理
  setTimeout(function(){
    var ele=$('.firest');
    var w=ele.width();
    ele.css('marginLeft',-(w/2));
  },1);


  //图章逻辑
  var oStamp=document.querySelector('.stamp');
  oStamp.style.WebkitTransform='scale(1)';
  oStamp.style.opacity = 1;
}

function reStart(){
  var oAudio = document.createElement('audio');
  oAudio.autoplay = true;
  oAudio.loop = true;
  oAudio.id = 'test';
  document.body.appendChild(oAudio);
  var oStamp=document.querySelector('.stamp');
  oStamp.style.display='none';
  oStamp.style.opacity = 0;
  oStamp.style.WebkitTransform='scale(5)';
  setTimeout(function(){
    oStamp.style.display='block';
  },500);

  $('.topArea .title').removeClass('resultTitle').html('');
  $('.t_page3').hide();
  $('.b_page3').hide();

  $('.ring').show();
  $('.countdown').hide();
  $('.j_start').show();
  $('.j_now').hide();

  $('.t_page1').show();
  $('.b_page1').show();

  $('.color_block .describe').css({'color':'#666','fontSize':12,'transform':'translateX(0)'});
  $('.round').css('background','#fff');

  singleMusicOption('stopPlay');

  //清零
  direction='';
  pageReady=false;
  nextCount=0;
  prevCount=0;
}



function musicReady(ok,src){
  var oAudio=$('#test');
  oAudio.attr('src','');
  setPage2Info(false);
  $('.t_page2 .cd').removeClass('cdactive');
  //准备音乐
  if(!ok){
    setTimeout(function(){
      oAudio.attr('src',musicSrc[2]);
      $('.t_page2 .cd').addClass('cdactive');
      setPage2Info(true);
    },1000);
  }else{
    oAudio[0].currentTime=0;
    oAudio.attr('src',src);
    $('.t_page2 .cd').addClass('cdactive');
    setPage2Info(true);
  }
}

function getMusicTime(){
  var oAudio=$('#test')[0];
  var time=oAudio.currentTime;
  return time>0;
}

function musicStop(ok,src){
  var oAudio=$('#test');
  oAudio[0].pause();
  $('#test').remove();
}

function setPage2Info(flag){
  if(flag){
    $('.t_page2 .describe').html('播放中...');
  }else{
    $('.t_page2 .describe').html('准备中...');
  }
}

function setPage3ResultInfo(hz){
  var oStamp=document.querySelector('.stamp');
  $('.color_block .describe').each(function(i){
    if(parseInt($(this).html())==hz){
      switch(hz){
        case 10:
        case 12:
        case 14:
          var result='木耳';
          var color='#0096ff';
          var logLevel = 'WOOD';
          oStamp.style.backgroundPosition=stampPos[0].x+'px '+stampPos[0].y+'px';
          break;
        case 15:
        case 16:
          var result='银耳';
          var color='#74cd3e';
          var logLevel = 'SILVER';
          oStamp.style.backgroundPosition=stampPos[2].x+'px '+stampPos[2].y+'px';
          break;
        case 17:
        case 18:
          var result='金耳';
          var color='#fff000';
          var logLevel = 'GOLD';
          oStamp.style.backgroundPosition=stampPos[1].x+'px '+stampPos[1].y+'px';
          break;
        case 19:
        case 20:
          var result='钛金耳';
          var color='#ffa200';
          var logLevel = 'TITANINUM';
          oStamp.style.backgroundPosition=stampPos[4].x+'px '+stampPos[4].y+'px';
          break;
        case 21:
          var result='钻石耳';
          var color='#ff0018';
          var logLevel = 'DIAMONDS';
          oStamp.style.backgroundPosition=stampPos[3].x+'px '+stampPos[3].y+'px';
          break;

      }
      $(this).css({'color':'#333','fontSize':18,'transform':'translateX(-10px)'});
      $('.round').eq(i).css('background',color);
      var left=parseInt($('.round').eq(i).css('left'));
      if(result.length>2){
        $('.tipsTitle').html(result).css({'color':color,'transform':'translateX('+(left-22)+'px) translateY(-28px)'});
      }else{
        $('.tipsTitle').html(result).css({'color':color,'transform':'translateX('+(left-10)+'px) translateY(-28px)'});
      }
      $('.tips_line').css({'background':color,'transform':'translateX('+(left+4.5)+'px) translateY(9px)'});
      if(!isFirst){
        realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_FIRSTLEVEL_"+logLevel);
      }else{
        realTimeLog("MUSICLISTEN_TEST","LISTENINGTEST_LEVEL_"+logLevel);
      }
      return false;
    }
  });
}

function setPage3ArtistInfo(timbre){
  var uid = getUserID("uid")||171368251;
  var kid = getUserID("devid")||43513807;
  var uid = getUserID("uid");
  var kid = getUserID("devid");
  switch(parseInt(timbre)){
    case 10:
    case 12:
    case 14:
    case 15:
    case 16:
      var info='sq';
      break;
    case 17:
    case 18:
    case 19:
    case 20:
    case 21:
      var info='aq';
      break;
  }
  if(uid==0&&kid==0){
    //取热歌榜数据
    getHotData(info,setArtistInfo);
  }else{
    //取个性化数据
    var url = "http://rcm.kuwo.cn/rec.s?cmd=rcm_personal&uid="+uid+"&devid="+kid+"&platform=pc&pn=0"+"&rn=30&t="+Math.random();
    $.ajax({
      url:url,
      dataType:"jsonp",
      crossDomain:false,
      success:function(arr){
        var count=0;
        var len=arr.length;
        arr.sort(function(){
          return Math.random()-0.5;
        });
        for(var i=0; i<len; i++){
          var length=arr[i].name.length+arr[i].artist.length;
          var flag = getHqLevel(arr[i],info);
          var pay = arr[i].pay;
          if(pay>0){
            var payFlag = pay.toString(2);
            var aqFlag = payFlag.substring(payFlag.length-4,payFlag.length-3);
            var sqFlag = payFlag.substring(payFlag.length-3,payFlag.length-2);
            if(info == 'aq'){
              if(aqFlag === '1'){
                continue;
              }
            }else{
              if(sqFlag === '1'){
                continue;
              }
            }
          }
          if(flag==info && length<21){
            count++;
            break;
          }
        }
        if(len==0 || count==0){
          getHotData(info,setArtistInfo);
        }else{
          setArtistInfo(arr,info);
        }
      },
      error:function(){
        getHotData(info,setArtistInfo);
      }
    });
  }
}

function getHotData(timbre,callback){
  var url='http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&id=16&pn=0&rn=101&pcmp4=1';
  $.ajax({
    url:url,
    dataType:"jsonp",
    crossDomain:false,
    success:function(json){
      var list=json.musiclist || [];
      if(callback && list.length>0){
        list.sort(function(){
          return Math.random()-0.5;
        });
        callback(list,timbre);
      }
    },
    error:function(){
    }
  });
}

function setArtistInfo(arr,timbre){
  var len=arr.length || 0;
  var defUrl='http://star.kuwo.cn/star/starheads/';
  var index=0;
  for(var i=0; i<len; i++){
    var length=arr[i].name.length+arr[i].artist.length;
    var flag = getHqLevel(arr[i],timbre);
    if(flag==timbre && length<21){
      var pay = arr[i].pay;
      if(pay>0){
        var payFlag = pay.toString(2);
        var aqFlag = payFlag.substring(payFlag.length-4,payFlag.length-3);
        var sqFlag = payFlag.substring(payFlag.length-3,payFlag.length-2);
        if(info == 'aq'){
          if(aqFlag === '1'){
            continue;
          }
        }else{
          if(sqFlag === '1'){
            continue;
          }
        }
      }
      index=i;
      break;
    }
  }
  var pic=arr[index].pic||'';
  if(pic!=''){
    pic=pic.split('/');
    pic[0]=100;
    pic=defUrl+pic.join('/');
    $('.t_page3 .artistBox img').attr('src',pic);
  }else{
    var url = 'http://bd.kuwo.cn/mpage/api/getMusicInfo?bdfrom=baobao&src=kuwo&id='+arr[index].id;
    $.ajax({
      url:url,
      dataType:"json",
      crossDomain:false,
      success:function(json){
        if(json.msg=='success'){
          pic=json.data.pic100;
        }
        $('.t_page3 .artistBox img').attr('src',pic);
      },
      error:function(){
      }
    });
  }
  var info=arr[index].name+'<br/>'+arr[index].artist;
  $('.b_page3 .j_share').attr('data-rid',arr[index].id);
  $('.t_page3 .i_play').attr('data-info',saveMusicInfo(arr[index],'playlist'));
  $('.t_page3 .i_play').attr('data-q',timbre);
  $('.t_page3 .artistBox .info').html(info);
}

function rnd(n,m){
  return parseInt(n+Math.random()*(m-n));
}

function todou(n){
  return n<10? '0'+n: ''+n;
}

// 网页调用客户端通用接口
function callClient(call){
  try{
    return window.external.callkwmusic(call);
  }catch(e){
    return "";
  }
}

function callClientNoReturn(call){
  try{
    return window.external.callkwmusic(call,0);
  }catch(e){
    return "";
  }
}

//获取uid、kid的方法
function getUserID(s){
  var clientString = callClient("UserState?src=user");
  var clientid = getValue(clientString,s);
  if(clientid==""){
    clientid = 0;
  }
  return clientid;
}

function getValue(url,key){
  url = url.toString();
  if(url.indexOf('#')>=0){
    url = url.substring(0,url.length-1);
  }
  var value='';
  var begin = url.indexOf(key + '=');
  if(begin>=0){
    var tmp = url.substring(begin + key.length + 1);
    var eqIdx = tmp.indexOf('=');
    var end = 0;
    if(eqIdx>=0){
      tmp = tmp.substring(0,eqIdx);
      end = tmp.lastIndexOf('&');
    }else{
      end = tmp.length;
    }
    if(end>=0){
      try{
        value = decodeURIComponent(tmp.substring(0,end));
      }catch(e){
        value = tmp.substring(0,end);
      }
    }else{
      try{
        value = decodeURIComponent(tmp);
      }catch(e){
        value = tmp;
      }
    }
  }
  return value;
}

function imgOnError(obj){
  var src = 'img/listening/def76.jpg';
  obj.src = src;
}

function singleMusicOption(option,musicString,level){
  var musicstr = returnSpecialChar(musicString);
  if(option=='Play'){
    //playQuality 播放不同品质
    //1-流畅 2-高品 3-超品 4-无损 5-mv 6-高清mv
    var call = option+"?asnext=1&needplay=1&playQuality="+level+"&mv=0&n=1&s1="+musicstr;
  }else{
    var call = 'stopPlay';
  }
  callClientNoReturn(call);
}

function saveMusicInfo(obj,from,pstr){
  var psrc = pstr || "";
  psrc = "VER=2015;FROM=曲库->"+psrc;
  psrc = encodeURIComponent(psrc);
  if(from=="bang"){
    var param = obj.param;
    param = returnSpecialChar(param);
    var paramArray = param.split(";");
    var childArray = [];
    var childi = 0;
    childArray[childi++] = encodeURIComponent(returnSpecialChar(obj.name));
    childArray[childi++] = encodeURIComponent(returnSpecialChar(obj.artist));
    childArray[childi++] = encodeURIComponent(returnSpecialChar(obj.album));
    for(var j=3;j<paramArray.length;j++){
      childArray[childi++] = paramArray[j];
    }
    musicString = childArray.join('\t');
    childArray = null;
    var musicstringarray = [];
    musicstringarray[musicstringarray.length] = musicString;
    musicstringarray[musicstringarray.length] = psrc;
    musicstringarray[musicstringarray.length] = obj.formats;
    musicstringarray[musicstringarray.length] = getMultiVerNum(obj);
    musicstringarray[musicstringarray.length] = getPointNum(obj);
    musicstringarray[musicstringarray.length] = getPayNum(obj);
    musicstringarray[musicstringarray.length] = getArtistID(obj);
    musicstringarray[musicstringarray.length] = getAlbumID(obj);
    musicstringarray[musicstringarray.length] = obj.mp4sig1||0;
    musicstringarray[musicstringarray.length] = obj.mp4sig2||0;
    musicstringarray[musicstringarray.length] = obj.isdownload||0;
    musicString = musicstringarray.join('\t');
    musicString = encodeURIComponent(musicString);
    //MUSICLISTOBJ[obj.id] = musicString;
  }else if(from=="album"||from=="playlist"){
    var param = obj.param ||obj.params;
    param = returnSpecialChar(param);
    var paramArray = param.split(";");
    var childArray = [];
    var musicString = "";
    for(var j=0;j<paramArray.length;j++){
      if(j < 3){
        childArray[j] = encodeURIComponent(returnSpecialChar(paramArray[j]));
      }else{
        childArray[j] = paramArray[j];
      }
    }
    musicString = childArray.join('\t');
    childArray = null;
    paramArray = null;

    var musicstringarray = [];
    musicstringarray[musicstringarray.length] = musicString;
    musicstringarray[musicstringarray.length] = psrc;
    musicstringarray[musicstringarray.length] = obj.formats;
    musicstringarray[musicstringarray.length] = getMultiVerNum(obj);
    musicstringarray[musicstringarray.length] = getPointNum(obj);
    musicstringarray[musicstringarray.length] = getPayNum(obj);
    musicstringarray[musicstringarray.length] = getArtistID(obj);
    musicstringarray[musicstringarray.length] = getAlbumID(obj);
    musicstringarray[musicstringarray.length] = obj.isdownload||0;
    musicString = musicstringarray.join('\t');
    musicstringarray = null;
    musicString = encodeURIComponent(musicString);
    //MUSICLISTOBJ[obj.id] = musicString;
  }
  return musicString;
}

function getPointNum(someObj){
  var pointnum = someObj.ispoint;
  if(typeof(pointnum)=="undefined"){
    pointnum = someObj.is_point;
  }
  if(typeof(pointnum)=="undefined"){
    pointnum = someObj.IS_POINT;
  }
  if(typeof(pointnum)!="undefined"&&pointnum==1){
    pointnum = 1;
  }else{
    pointnum = 0;
  }
  return pointnum;
}
function getMultiVerNum(someObj){
  var multivernum = someObj.mutiver;
  if(typeof(multivernum)=="undefined"){
    multivernum = someObj.muti_ver;
  }
  if(typeof(multivernum)=="undefined"){
    multivernum = someObj.MUTI_VER;
  }
  if(typeof(multivernum)=="undefined"||multivernum.length==0){
    multivernum = 0;
  }
  return multivernum;
}

function getPayNum(someObj){
  var paynum = someObj.pay;
  if(typeof(paynum)=="undefined"){
    paynum = someObj.PAY;
  }
  if(typeof(paynum)=="undefined"){
    paynum = 0;
  }
  return paynum;
}

function getArtistID(someObj){
  var artistid = someObj.artistid;
  if(typeof(artistid)=="undefined"){
    artistid = someObj.ARTISTID;
  }
  if(typeof(artistid)=="undefined"){
    artistid = 0;
  }
  return artistid;
}
// 获取歌曲专辑id
function getAlbumID(someObj){
  var albumid = someObj.albumid
  if(typeof(albumid)=="undefined"){
    albumid = someObj.ALBUMID;
  }
  if(typeof(albumid)=="undefined"){
    albumid = 0;
  }
  return albumid;
}

function returnSpecialChar(s){
  s = ''+s;
  return s.replace(/\&amp;/g,"&").replace(/\&nbsp;/g," ").replace(/\&apos;/g,"'").replace(/\&quot;/g,"\"").replace(/\%26apos\%3B/g,"'").replace(/\%26quot\%3B/g,"\"").replace(/\%26amp\%3B/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">");
}

// 判断歌曲是什么音质
function getHqLevel(obj,flag){
  var formats = obj.formats || obj.FORMATS || '';
  var levelclass = "";
  switch(flag){
    case 'aq':
      if(formats.indexOf('AL')>=0){
        levelclass = 'aq'
      }
      break;
    case 'sq':
      if(formats.indexOf('MP3H')>=0 || formats.indexOf('MP3192')>=0){
        levelclass = 'sq';
      }
      break;
    default:
      levelclass = 'hq';
      break;
  }
  return levelclass;
}

//日志方法
function realTimeLog(type,msg){
  callClientNoReturn("LogRealTime?type="+type+"&msg="+encodeURIComponent(msg));
}

//读取配置文件中配置项的方法
function getDataByConfig(Section,key){
  var configValue = callClient("GetConfig?Section="+encodeURIComponent(Section)+"&key="+encodeURIComponent(key));
  var data = "";
  if(typeof(configValue)!="undefined" && configValue!=""){
    try{
      data = configValue;
    }catch(e){
      webLog("getDataByConfig:"+e.message+":"+e.name);
    }
  }
  return data;
}

// 设置配置项的方法
function setDataToConfig(Section,key,dataValue){
  try{
    if(typeof(Section)=="undefined"||Section==""||Section==null){
      Section='optionPre';
    }
    if(typeof(dataValue)!="undefined"&&dataValue!=""&&dataValue!=null){
      callClientNoReturn("SetConfig?Section="+encodeURIComponent(Section)+"&Key="+encodeURIComponent(key)+"&Value="+encodeURIComponent(dataValue));
    }
  }catch(e){
    webLog("setDataToConfig:"+e.message);
  }
}
