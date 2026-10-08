/**
 * Created by ping.deng on 16-3-24.评论回复功能 start
 */
var kw_comment_rows = 10;// 每页几条
var kw_comment_flagPage = false;// 判断点击翻页
var kw_comment_commentNum = 0;// 评论数
var gedanId = 0;
var kw_comment_type = '';
var cssFlag = false; // 用于加载css文件
var ver = getVersion();
var kid = getUserID('all').kid;
var callbackfn = null;
var commentId = '';// 评论id
var PAGENAME = '';
var noCommentData = `<div class="no-comment-data">
                        <div class="no-data-box no-info-img"></div>
                        <p class="no-data-text">暂无评论</p>
                    </div>`;
function init_comment_model(boxname, type, uniq_id, fn) {
  gedanId = uniq_id;
  kw_comment_type = type;
  if (fn) callbackfn = fn;
  ;(function(document) {
    if ($('#commentArea').length == 0) {
      var oDiv = document.createElement('div');
      oDiv.id = 'commentArea';
      if (type == 'z1') {
        oDiv.className = 'z1_commentArea';
      }
      var oBox = document.querySelector(boxname);
      oBox.appendChild(oDiv);
      oDiv.style.display = 'none';
    }
    var comment_other = `<div class="end_box"></div>
							<div class="popup_mask"></div>
							<div class="tips-modal" style="display:none">
                <div class="tips-modal-title">
                  <span class="title-text">酷我提示</span>
                  <span
                    class="iconfont icon-close close"></span>
                </div>
                <div class="tips-modal-content">
                  <p>确定要删除评论吗？</p>
                </div>
                <div class="tips-modal-fotter">
                  <a href="javascript:;" class="btn tips-modal-btn0 confirm" style="background:${skinConfig.skinColor}"><i /><span>确定</span></a>
                  <a href="javascript:;" class="btn tips-modal-btn1 cancel"><span>取消</span></a>
                </div>
              </div>`;
    if (!$('.tips-modal').html()) $('body').append(comment_other);
    commentModel(uniq_id);
    setSkin(setSkinCallback);
    PAGENAME = getPageName();
  })(document);
}

// 评论模块
function commentModel(strsid) {
  // 加载输入框评论按钮
  if (kw_comment_type == '15') {
    if ($('#commentArea').html() == '') {
      $('#commentArea').html(
        '<p class="title_ to_top">留言评论<span class="num">0条</span></p>' +
        '<div class="commentOpenBtn">期待你的精彩评论~</div>' +
        '<div id="messageSplice">' +
        '<div id="message">' +
        '<h3>添加评论（<span class="songName"></span>-<span class="artist"></span>）</h3><a href="javascript:;" class="iconfont icon-close closeMessage"></a>' +
        '<div class="textBox">' +
        '<textarea id="messageCon" class="scrollBox single-page-comment" placeholder="期待你的精彩评论~ " maxlength="300"></textarea>' +
        '<span class="word">还可以输入<span class="length">300</span>个字</span>' +
        '</div>' +
        '<a href="javascript:;" id="messageBtn" style="background:' + skinConfig.skinColor + '">发表评论</a>' +
        '<span class="iconfont icon-comment emotion"></span>' +
        '<div class="expression-box">' +
        '<p class="expression-title"><span>添加表情</span><span class="close"></span></p>' +
        '<div class="faceBox single-page-comment"></div>' +
        '</div></div></div>' +
        '<div class="listBox">' +
        '<h4>热门评论</h4>' +
        '<div id="rec_list"></div>' +
        '</div>' +
        '<div class="listBox">' +
        '<h4>最新评论</h4>' +
        '<div id="list"></div>' +
        '</div>' +
        '<div class="pageComment"></div>'
      );
    } else {
      $('#commentArea .title_ .num').html('0条');
      $('#commentArea #list,#commentArea #rec_list,#commentArea .pageComment').html('');
      $('#commentArea .pageComment').html('').hide();
    }
  } else {
    $('#commentArea').html(
      '<div id="message">' +
      '<div class="textBox">' +
      '<textarea id="messageCon" class="scrollBox hifi-comment" placeholder="期待你的精彩评论~ " maxlength="300"></textarea>' +
      '<span class="word">还可以输入<span class="length">300</span>个字</span>' +
      '</div>' +
      '<a href="javascript:;" id="messageBtn" style="background:' + skinConfig.skinColor + '">发表评论</a>' +
      '<span class="iconfont icon-comment emotion hifi-emotion"></span>' +
      '<div class="expression-box hifi-expression-box">' +
      '<p class="expression-title"><span>添加表情</span><span class="close"></span></p>' +
      '<div class="faceBox scrollBox"></div>' +
      '</div></div></div>' +
      '<div class="listBox">' +
      '<h4 class="to_top">热门评论</h4>' +
      '<div id="rec_list"></div>' +
      '</div>' +
      '<div class="listBox">' +
      '<h4 class="to_top">最新评论</h4>' +
      '<div id="list"></div>' +
      '</div>' +
      '<div class="pageComment"></div>'
    );
  }
  // 加载评论列表
  loadRecCommentList(kw_comment_type, 1, strsid);
  // 点赞
  var praiseFlag = false;
  $('.praise').die('click').live('click', function(ev) {
    var uid = getUserID('uid');
    if (uid == 0) {
      callClientNoReturn('UserLogin?src=login');
      ev.stopPropagation();
      return false;
    }
    if (!praiseFlag) {
      praiseFlag = true;
      var _this = $(this);
      var num = _this.text();
      var flag = eval(_this.attr('data-flag'));
      var box = _this.parents('.box');
      var cId = box.attr('data-id');
      var praiseUrl = '';
      num = isNaN(parseInt(num)) ? 0 : num;
      var sesID = getUserID('sid');
      var url = 'http://comment.kuwo.cn/com.s';
      var sx = Math.random().toString(36).substr(2, 8);
      var param = {
        type: 'cancel_like',
        uid: uid,
        cid: cId,
        sid: gedanId,
        digest: kw_comment_type,
        prod: ver,
        devid: kid,
        sesID: sesID,
        sx: sx
      };
      if (!flag) {
        param['type'] = 'click_like';
      }
      var key = Object.keys(param).map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
      }).join('&');
      var keyEncode = callClient('DataDesProc?type=1&src=' + encodeURIComponent(key) + '&sx=' + encodeURIComponent('3J29IK^zgYK$'));
      praiseUrl = url + '?f=nwebp&q=' + keyEncode;
      $.ajax({
        type: 'get',
        url: praiseUrl,
        dataType: 'text',
        success: function(data) {
          var lincolor = '';
          if (PAGENAME === 'cdpacket_playing') {
            lincolor = '#ca9d63';
          } else {
            lincolor = skinConfig.linkColor;
          }
          if (!flag) {
            var addNum = parseInt(num) === 0 ? '1' : parseInt(num) + 1;
            _this.html('<i class="iconfont icon-fabulous"></i>' + addNum);
            _this.attr('data-flag', 'true');
            _this.addClass('praised').css('color', lincolor);
          } else {
            var tnum = (parseInt(num) - 1) <= 0 ? '' : (parseInt(num) - 1);
            _this.html('<i class="iconfont icon-nopraise"></i>' + tnum);
            _this.attr('data-flag', 'false');
            _this.removeClass('praised').css('color', '');
          }
          praiseFlag = false;
        },
        error: function() {
          praiseFlag = false;
        }
      });
    }
    ev.stopPropagation();
    return false;
  });
  // 回复
  $('.reply').die('click').live('click', function(ev) {
    var message = $('#messageCon');
    var content = $(this).parents('.contentComment');
    var name = content.find('.user a').html() + '：';
    var checkReply = '回复 ' + name;
    commentId = $(this).parents('.box').attr('data-id');
    setTextareaStatus(true);
    message.attr('placeholder', checkReply);
    message.attr('data-reply', 'true');
    $('.closeCommentBtn').show();
    ev.stopPropagation();
    return false;
  });
  // 评论按钮
  $('#messageBtn').die('click').live('click', function(ev) {
    var uid = getUserID('uid');
    if (uid == 0) {
      callClientNoReturn('UserLogin?src=login');
      ev.stopPropagation();
      return false;
    }
    var messageCon = $('#messageCon').val().replace(/(^\s+)|(\s+$)/g, '');// 评论内容去除前后空格
    var domStr = '';
    var isReply = eval($('#messageCon').attr('data-reply'));// 是否为回复  true为回复  false为评论
    var dataCon = '';
    var msgUrl = '';
    var currentPage = $('.pageComment .current').html() || '1';
    var curSongMessage = $('#message').attr('isCurSongMessage') || '1';
    var isCurSongMessage = curSongMessage == '1';
    var sourceid = isCurSongMessage ? gedanId : $('#message').attr('data-rid');
    var url = 'http://commentw.kuwo.cn/com.s';
    var sesID = getUserID('sid');
    var sx = Math.random().toString(36).substr(2, 8);
    var param = {
      type: 'post_comment',
      uid: uid,
      digest: kw_comment_type,
      sid: sourceid,
      prod: ver,
      devid: kid,
      sesID: sesID,
      sx: sx
    };
    if (messageCon == '') {
      toast(0, '内容不能为空噢');
      ev.stopPropagation();
      return;
    } else if (messageCon.length < 5) {
      toast(0, '评论不能少于5个字噢');
      ev.stopPropagation();
      return;
    }
    dataCon = messageCon.replace(/</g, '&lt').replace(/>/g, '&gt');
    if (isReply) {
      param.reply = commentId;
    }
    var key = Object.keys(param).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
    }).join('&');
    var keyEncode = callClient('DataDesProc?type=1&src=' + encodeURIComponent(key) + '&sx=' + encodeURIComponent('3J29IK^zgYK$'));
    msgUrl = url + '?f=nwebp&q=' + keyEncode;
    $.ajax({
      type: 'post',
      dataType: 'text',
      data: dataCon,
      url: msgUrl,
      success: function(data) {
        var result = callClient('DataDesProc?type=2&utfsrc=1&src=' + encodeURIComponent(data) + '&sx=' + encodeURIComponent(sx)); // 客户端解密
        // var results = JSON.parse(valueReplace(Base64.decode(result)));
        var results = valueReplace(Base64.decode(result));
        try {
          results = JSON.parse(results);
        } catch(e){
          /* eslint-disable */
          results = eval('(' + results + ')');
          /* eslint-enable */
        }
        var info = results.info;
        if (info == undefined) {
          toast(0, '评论太频繁了，休息一会吧!');
          isReply = isReply ? $('#messageCon').attr('data-reply', 'true') : $('#messageCon').attr('data-reply', 'false');
        } else {
          toast(0, '评论成功!');
          setTextareaStatus(false, true);
          $('.length').html(300);
          if (isCurSongMessage) {
            if ($('#list').hasClass('noComment')) $('#list').html('').removeClass('noComment');
            if (currentPage == '1') {
              if (isReply) {
                domStr = createReplyBox(info);
              } else {
                domStr = createCommentBox(info);
              }
              $('#list').prepend(domStr).prev().show();
              if ($('#list').children().length == kw_comment_rows + 1) {
                setTimeout(function() {
                  loadCommentList(kw_comment_type, 1);
                }, 500);
              }
            } else {
              setTimeout(function() {
                loadCommentList(kw_comment_type, 1);
              }, 500);
            }
            kw_comment_commentNum = parseInt(kw_comment_commentNum) + 1;
            var tabNum = kw_comment_commentNum > 99 ? '99+' : kw_comment_commentNum;
            $('.tabNum').html(tabNum);
            $('#commentArea .num').html(kw_comment_commentNum + '条');
          }
        }
      },
      error: function() {
        toast(0, '评论失败，请稍后再试!');
      }
    });

    ev.stopPropagation();
    return false;
  });
  // 字数判断
  $('#messageCon').live('keydown keyup blur focus', function() {
    var _this = $(this);
    var val = _this.val();
    var memo = _this.attr('placeholder');
    var len = val.length;
    var word = $('.length');
    var message = $('#messageCon');
    if (memo && memo.indexOf('回复') > -1 && memo !== '') {
      message.attr('data-reply', 'true');
    } else {
      message.attr('data-reply', 'false');
    }
    if (len > 300) _this.val(val.substring(0, 300));
    var num = 300 - len < 0 ? 0 : 300 - len;
    word.html(num);
  });
  // 删除评论显示确定删除弹窗
  $('.delete').die('click').live('click', function() {
    var body_h = $('body').height();
    $('.popup_mask').height(body_h + 20).show();
    $('.tips-modal').show();

    var delEleId = $(this).parents('.box').attr('data-id');
    var delEleIndex = $(this).parents('.box').index();
    $('.tips-modal .confirm').attr('data-delid', delEleId);
    $('.tips-modal .confirm').attr('data-index', delEleIndex);
    return;
  });
  // 取消按钮和关闭按钮的逻辑
  $('.tips-modal .close,.tips-modal .cancel,.tips-modal .confirm').die('click').live('click', function() {
    $('.tips-modal').hide();
    $('.popup_mask').hide();
  });
  // 确定按钮逻辑
  $('.tips-modal .confirm').die('click').live('click', function(ev) {
    var uid = getUserID('uid');
    var delId = $(this).attr('data-delid');
    var delEleIndex = $(this).attr('data-index');
    var currentPage = $('.pageComment .current').html() || '1';
    var url = 'http://comment.kuwo.cn/com.s';
    var sx = Math.random().toString(36).substr(2, 8);
    var sesID = getUserID('sid');
    var param = {
      type: 'del_scomment',
      digest: kw_comment_type,
      sid: gedanId,
      uid: uid,
      cid: delId,
      prod: ver,
      devid: kid,
      sesID: sesID,
      sx: sx
    };
    var key = Object.keys(param).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
    }).join('&');
    var keyEncode = callClient('DataDesProc?type=1&src=' + encodeURIComponent(key) + '&sx=' + encodeURIComponent('3J29IK^zgYK$'));
    $.ajax({
      url: url + '?f=nwebp&q=' + keyEncode,
      type: 'get',
      dataType: 'text',
      success: function(data) {
        var result = callClient('DataDesProc?type=2&utfsrc=1&src=' + encodeURIComponent(data) + '&sx=' + encodeURIComponent(sx)); // 客户端解密
        // var results = JSON.parse(valueReplace(Base64.decode(result)));
        var results = valueReplace(Base64.decode(result));
        try {
          results = JSON.parse(results);
        } catch(e){
          /* eslint-disable */
          results = eval('(' + results + ')');
          /* eslint-enable */
        }
        if (results.result == 'error') {
          toast(0, '删除失败，请稍后再试!');
          ev.stopPropagation();
          return false;
        }
        if (currentPage == 1 && $("#list").children().length <= kw_comment_rows) {
          $('#list .box').eq(delEleIndex).remove();
          kw_comment_commentNum = parseInt(kw_comment_commentNum) - 1;
          if (kw_comment_commentNum == 0) {
            noComment();
          }
          $('#commentArea .num').html(kw_comment_commentNum + '条');
          var tabNum = kw_comment_commentNum > 99 ? '99+' : kw_comment_commentNum;
          $('.tabNum').html(tabNum);
        } else {
          loadCommentList(kw_comment_type, currentPage);
        }
        toast('0', '评论删除成功！');
      },
      error: function() {
        toast(0, '删除失败，请稍后再试!');
      }
    });

    ev.stopPropagation();
    return false;
  });
  // 删除按钮回复按钮的过滤
  $('.box').live('mouseenter', function() {
    var uid = getUserID('uid');
    var _this = $(this);
    var theUid = _this.attr('data-uid');
    var delete_ = _this.find('.delete');
    var delLine = _this.find('.delLine');
    _this.find('.info_ span').show();
    if (uid == theUid) {
      delete_.show();
      delLine.show();
    } else {
      delete_.hide();
      delLine.hide();
    }
  });
  $('.box').live('mouseleave', function() {
    var _this = $(this);
    var delete_ = _this.find('.delete');
    var delLine = _this.find('.delLine');
    delete_.hide();
    delLine.hide();
  });
  // 表情
  createFace();
  var faceShow = false;
  var faceBox = $('.expression-box');
  $('.emotion').die('click').live('click', function(ev) {
    if (!faceShow) {
      faceBox.show();
      faceShow = true;
    } else {
      faceBox.hide();
      faceShow = false;
    }
    ev.stopPropagation();
    return false;
  });
  $(document).live('click', function() {
    faceBox.hide();
    faceShow = false;
  });
  $('.faceBox img').die('click').live('click', function(ev) {
    var messageCon = $('#messageCon').val();
    faceBox.hide();
    faceShow = false;
    $('#messageCon').val(messageCon += '[' + this.alt + ']').focus();
    ev.stopPropagation();
    return false;
  });
  // 翻页
  $('.pageComment a').die('click').live('click', function () {
    var oClass = $(this).attr('class');
    faceBox.hide();
    faceShow = false;
    if (oClass.indexOf('no') > -1) return;
    kw_comment_flagPage = true;
    var pn = 1;
    var goPnNum = $(this).html();
    if (goPnNum == '上一页') {
      pn = parseInt($(".pageComment .current").html()) - 1;
    } else if (goPnNum == '下一页') {
      pn = parseInt($(".pageComment .current").html()) + 1;
    } else {
      pn = parseInt($(this).html());
    }
    commentPageNum = pn;
    if (pn == 1) {
      loadRecCommentList(kw_comment_type, pn);
    } else {
      $('#rec_list').html('');
      $('.listBox').eq(0).hide();
      loadCommentList(kw_comment_type, pn);
    }
    $(window).scrollTop(0);
  });

  $('.closeMessage').die('click').live('click', function() {
    setTextareaStatus(false, true);
  });
  $('.commentOpenBtn').die('click').live('click', function() {
    setTextareaStatus(true, true);
  });
}

// 设置输入框
var messageIsShow = false;

function setTextareaStatus(flag, isClose) {
  if (flag) {
    if ($('#message').attr('isCurSongMessage') == '0') {
      var name = $('.singleName h1').html();
      var rid = $('.singleTools').attr('data-rid');
      var artist = $('.artistName a').html();
      $('#message').attr('data-rid', rid);
      $('#message .songName').html(name).attr('title', name);
      $('#message .artist').html(artist).attr('title', artist);
      $('#message').attr('isCurSongMessage', '1');
    }
    if (kw_comment_type == 'cd') {
      $('#message,.closeCommentBtn').show();
    } else if (kw_comment_type == '15') {
      messageIsShow = true;
      $('#messageSplice,#messageHeaderSplice').show();
      if ($('#header').hasClass('slide')) {
        $('#messageMiniLrcBoxSplice').show().addClass('slideDown');
      }
    }
  } else {
    if (kw_comment_type == 'cd' && location.href.indexOf('cdpacket_playing.html') > -1) {
      $('#message,.closeCommentBtn').hide();
      $('.openCommentBtn').show();
    } else if (kw_comment_type == '15') {
      messageIsShow = false;
      $('#messageSplice,#messageHeaderSplice,#messageMiniLrcBoxSplice').hide();
    }
  }
  if (isClose) {
    $('#messageCon').attr({'placeholder': '期待你的精彩评论~', 'data-reply': 'false'});
  }
  $('#messageCon').focus().val('');
}
// 加载精彩评论
function loadRecCommentList(digest, pn, strgedanId) {
  if ($('#list').hasClass('noComment')) $('#list').html('').removeClass('noComment');
  var strid;
  if (strgedanId != 'undefined' && strgedanId != '' && strgedanId != null) {
    strid = strgedanId;
    gedanId = strgedanId;
  } else {
    strid = gedanId;
  }
  var url = 'http://comment.kuwo.cn/com.s';
  var userId = getUserID('uid');// 获取用户uid
  var sx = Math.random().toString(36).substr(2, 8);
  var sesId = getUserID('sid');
  var param = {
    type: 'get_rec_comment',
    uid: userId,
    digest: digest,
    sid: strid,
    page: pn,
    rows: kw_comment_rows,
    prod: ver,
    devid: kid,
    sesId: sesId,
    sx: sx
  };
  var key = Object.keys(param).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
  }).join('&');
  var keyEncode = callClient('DataDesProc?type=1&src=' + encodeURIComponent(key) + '&sx=' + encodeURIComponent('3J29IK^zgYK$')); // 客户端加密
  var commentUrl = url + '?f=nwebp&q=' + keyEncode;
  var rows = 20;
  $.ajax({
    type: 'get',
    dataType: 'text',
    url: commentUrl,
    timeout: 10000,
    success: function(data) {
      var result = callClient('DataDesProc?type=2&utfsrc=1&src=' + encodeURIComponent(data) + '&sx=' + encodeURIComponent(sx));
      // var results = JSON.parse(valueReplace(Base64.decode(result))); // 客户端解密
      var results = valueReplace(Base64.decode(result));
      try {
        results = JSON.parse(results);
      } catch(e){
        /* eslint-disable */
        results = eval('(' + results + ')');
        /* eslint-enable */
      }
      if (results.rows) {
        // 清空评论列表
        $('#rec_list').html('').show();
        var datarows = results.rows.length;
        for (var i = 0; i < datarows; i++) {
          if (i == datarows - 1) {
            $('#rec_list').append(createReplyBox(results.rows[i], true));
          } else {
            $('#rec_list').append(createReplyBox(results.rows[i]));
          }
          if (eval(results.rows[i].is_like)) {
            var lincolor = '';
            if (PAGENAME === 'cdpacket_playing') {
              lincolor = '#ca9d63';
            } else {
              lincolor = skinConfig.linkColor;
            }
            $('#rec_list .praise').eq(i).addClass('praised').css('color', lincolor);
          }
          $('.listBox').eq(0).show();
          $('#rec_list').prev().show();
        }
      } else {
        $('.listBox').eq(0).hide();
      }
      loadCommentList(kw_comment_type, 1, rows, strgedanId);
    },
    error: function(e) {
      var httpstatus = e.status;
      if (typeof(httpstatus) == 'undefined') {
        httpstatus = '-1';
      }
      loadCommentList(kw_comment_type, 1, rows, strgedanId);
      $('.commentBox').html('');
      $('.commentBox').append('<div id="l_loadfail" style="display:block; height:100%; padding:0; top:0;text-align:center"><div class="loaderror"><img style="margin:60px 0 10px 0" src="img/unlogin_img.png" /><p style="margin-top:10px;">网络似乎有点问题 , <a hidefocus href="###" onclick="window.location.reload();return false;">点此刷新页面</a></p></div></div>')
      var sta = httpstatus.toString();
      var errorStr = e.responseText;
      if (httpstatus == 200) {
        realShowTimeLog(url, 0, 1, errorStr, 0);
      } else {
        realShowTimeLog(url, 0, 1, sta, 0);
      }
    }
  });
}
// 加载评论列表
function loadCommentList(digest, pn, rows, strgedanId) {
  if ($('#list').hasClass('noComment')) $('#list').html('').removeClass('noComment');
  kw_comment_commentNum = 0;
  var strid;
  if (strgedanId != 'undefined' && strgedanId != '' && strgedanId != null) {
    strid = strgedanId;
    gedanId = strgedanId;
  } else {
    strid = gedanId;
  }
  var userId = getUserID('uid');// 获取用户uid
  var customRows = 20;
  var createRows = rows || 20;
  var url = 'http://comment.kuwo.cn/com.s';
  var sx = Math.random().toString(36).substr(2, 8);
  var sesID = getUserID('sid');
  var param = {
    type: 'get_comment',
    uid: userId,
    digest: digest,
    sid: strid,
    page: pn,
    rows: customRows,
    prod: ver,
    devid: kid,
    sesID: sesID,
    sx: sx
  };
  var key = Object.keys(param).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
  }).join('&');
  var keyEncode = callClient('DataDesProc?type=1&src=' + encodeURIComponent(key) + '&sx=' + encodeURIComponent('3J29IK^zgYK$')); // 客户端加密
  var commentUrl = url + '?f=nwebp&q=' + keyEncode;
  $.ajax({
    type: 'get',
    dataType: 'text',
    url: commentUrl,
    timeout: 10000,
    success: function(data) {
      var result = callClient('DataDesProc?type=2&utfsrc=1&src=' + encodeURIComponent(data) + '&sx=' + encodeURIComponent(sx)); // 客户端解密
      // var results = JSON.parse(valueReplace(Base64.decode(result)));
      var results = valueReplace(Base64.decode(result));
      try {
        results = JSON.parse(results);
      } catch(e){
        /* eslint-disable */
        results = eval('(' + results + ')');
        /* eslint-enable */
      }
      if (results.rows) {
        // 清空评论列表
        $('#list').html('');
        var pageStrCom = createPage(parseInt(results.totalPage), parseInt(results.currentPage));
        if (pageStrCom != '') $('.pageComment').html(pageStrCom).show();
        var pageCommetStyle = {
          bgColor: '#ca9d63',
          color: '#000'
        };
        if (PAGENAME === 'cdpacket_playing') {
          pageCommetStyle.bgColor = '#ca9d63';
          pageCommetStyle.color = '#000';
        } else if (skinConfig.type !== 'default') {
          pageCommetStyle.bgColor = skinConfig.skinColor;
          pageCommetStyle.color = '#fff';
        } else {
          pageCommetStyle.bgColor = skinConfig.skinColor;
          pageCommetStyle.color = '#000';
        }
        $('.pageComment .current').css({ 'background': pageCommetStyle.bgColor, 'color': pageCommetStyle.color });
        var rowsLen = results.rows.length;
        if (rowsLen >= createRows) {
          rowsLen = createRows;
        }
        for (var i = 0; i < rowsLen; i++) {
          if (i == rowsLen - 1) {
            $('#list').append(createReplyBox(results.rows[i], true));
          } else {
            $('#list').append(createReplyBox(results.rows[i]));
          }
          if (eval(results.rows[i].is_like)) {
            var lincolor = '';
            if (PAGENAME === 'cdpacket_playing') {
              lincolor = '#ca9d63';
            } else {
              lincolor = skinConfig.linkColor;
            }
            $('#list .praise').eq(i).addClass('praised').css('color', lincolor);
          }
        }
        kw_comment_commentNum = results.total;
        var tabNum = kw_comment_commentNum > 99 ? '99+' : kw_comment_commentNum;
        $('.tabNum').html(tabNum);
        $('#commentArea .num').html(kw_comment_commentNum + '条');
        if (kw_comment_type == '15') {
          if (kw_comment_flagPage) {
            goScrollComment();
            kw_comment_flagPage = false;
          }
        } else {
          if (kw_comment_flagPage) {
            var top = $($('.to_top')[0]).position().top;
            if (top === 0) {
              top = $($('.to_top')[1]).position().top;
            }
            $(window).scrollTop(top);
          }
        }
        $('#list').prev().show();
      } else {
        noComment();
      }
      loadCss();
    },
    error: function(e) {
      var httpstatus = e.status;
      if (typeof(httpstatus) == 'undefined') {
        httpstatus = '-1';
      }
      try {
        if (noSinglePage && typeof(noSinglePage) == 'function') {
          if (callClient('IsNetWorkAlive') == '0') {
            $('#wrapScroll').hide();
            noSinglePage('noNet');
          } else {
            sendWebClientError('comment', 'singleComment', httpstatus);
          }
        }
      } catch(e) {}
      noComment();
      loadCss();
      var sta = httpstatus.toString();
      var errorStr = e.responseText;
      if (httpstatus == 200) {
        realShowTimeLog(url, 0, 1, errorStr, 0);
      } else {
        realShowTimeLog(url, 0, 1, sta, 0);
      }
    }
  });
}

// 替换评论里面特殊字符
function valueReplace(s) {
  return s.replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\s/g, ' ');
}
function loadCss() {
  if (!cssFlag) {
    // 加载css文件
    var oHead = document.getElementsByTagName('head')[0];
    var oCssLink = document.createElement('link');
    oCssLink.href = 'css/comm_COMMENT.css';
    oCssLink.rel = 'stylesheet';
    oCssLink.type = 'text/css';
    oHead.appendChild(oCssLink);
    setTimeout(function () {
      $('#commentArea').show();
    }, 200);
    cssFlag = true;
  } else {
    $('#commentArea').show();
  }
  if (callbackfn != null) callbackfn();
}
function noComment() {
  $('.listBox').eq(0).hide();
  $('#list').html(noCommentData).addClass('noComment').prev().hide();
  commentModelSkinClor(PAGENAME);
}
// 创建评论模块
function createCommentBox(jsondata) {
  var likeNum = jsondata.like_num == 0 ? '' : jsondata.like_num;
  var url = 'uid=' + getUserID('uid') + '&vuid=' + jsondata.u_id;
  var timeSlot = timeFormat(jsondata.time);
  var userName = decodeURIComponent(jsondata.u_name.replace(/\+/g, '%20'));
  var iconClass = '';
  var style = '';
  var zanClass = '';
  if (jsondata.vip3 == '1') {
    iconClass = 'luxuryVip';
    if (PAGENAME === 'cdpacket_playing') {
      style = 'color: #ca9d63';
    } else {
      style = 'color:' + skinConfig.linkColor;
    }
  } else if (jsondata.vip == '1') {
    iconClass = 'musicVip';
    if (PAGENAME === 'cdpacket_playing') {
      style = 'color: #ca9d63';
    } else {
      style = 'color:' + skinConfig.linkColor;
    }
  }
  if (jsondata.is_like === 'true') {
    zanClass = 'iconfont icon-fabulous';
  } else {
    zanClass = 'iconfont icon-nopraise';
  }
  if (userName == '') userName = '酷小我_' + parseInt(Math.random() * 10000);
  var uuid = getUserID('uid');
  var html = ''
  if (uuid !== jsondata.u_id) {
    html = '<a href="javascript:;" class="report skinLink">举报</a><span></span>'
  }
  return '<div class="box" data-id="' + jsondata.id + '" data-uid="' + jsondata.u_id + '">' +
    '<div class="picBox">' +
    '<a class="skinLink" href="javascript:;" onclick="jumpToOtherUser(\'' + url + '\', \'' + userName + '\')"><img class="head" src="' + jsondata.u_pic + '" onerror="imgOnError(this,60)" alt="" /></a>' +
    '</div>' +
    '<div class="contentComment">' +
    '<div class="main">' +
    '<p class="comment-user-name">' +
    '<span class="user"><a style="' + style + '" class="skinLink ' + iconClass + '" href="javascript:;" onclick="jumpToOtherUser(\'' + url + '\', \'' + userName + '\')">' + userName + '</a><i class="' +
    iconClass +
    '" onclick="callClient(\'VIPLogo\')"></i></span></p>' +
    '<p class="reply-time"><span class="time">' + timeSlot + '</span></p>' +
    '<div class="reply-con"><label class="allowSelect">' + filterFace(jsondata.msg) + '</label></div>' +
    '</div>' +
    '<div class="info_ hifi-info">' +
    html +
    '<a class="delete skinLink" href="javascript:;">删除</a>' +
    '<span class="delLine"></span>' +
    '<a class="praise skinLink" data-flag="' + jsondata.is_like + '" href="javascript:;"><i class="' + zanClass + '"></i>' + likeNum + '</a>' +
    '<span></span>' +
    '<a class="reply skinLink" href="javascript:;">回复</a>' +
    '</div>' +
    '</div>' +
    '</div>';
}

// 创建举报模块
var checkOption = ''; // 当前选中类型
var optionList = ['政治、色情、暴力、血腥', '人身攻击、辱骂行为', '广告、垃圾虚假信息', '其他原因']; //举报类型
var c_id = 0; // 评论id
function createReport(){
  var dom = '<div class="tips-wrap" style="display:none">' +
    '<div class="wrap">' +
      '<div class="head"><span>举报</span><span class="iconfont icon-close close cancel-btn"></span></div>' +
        '<div class="popup-content">' +
          '<div style="display: flex; flex-wrap: wrap;">' +
            '<div class="popup-style popup-style-0">' +
              '<input id="input0" type="radio" value="政治、色情、暴力、血腥" name="report"><label for="input0"></label><i/><span>政治、色情、暴力、血腥</span>' +
            '</div>' +
            '<div class="popup-style popup-style-1">' +
              '<input id="input1" type="radio" value="人身攻击、辱骂行为" name="report"><label for="input1"></label><i/><span>人身攻击、辱骂行为</span>' +
            '</div>' +
            '<div class="popup-style popup-style-2">' +
              '<input id="input2" type="radio" value="广告、垃圾虚假信息" name="report"><label for="input2"></label><i/><span>广告、垃圾虚假信息</span>' +
            '</div>' +
            '<div class="popup-style popup-style-3">' +
              '<input id="input3" type="radio" value="其他原因" name="report"><label for="input3"></label><i/><span>其他原因</span>' +
            '</div>' +
          '</div>' +
          '<div class="textarea-wrap" style="display:none">' +
            '<textarea class="textarea single-page-comment" name="" maxlength="20" placeholder="描述一下举报原因，不超过20个字"></textarea>' +
          '</div>' +
          '<div class="rep" style="height:30px"></div>' +
        '</div>' +
      '<div class="btns">' +
        '<a class="ok btn-sp" style="background:' + skinConfig.skinColor + '" href="javascript:;">确定</a>' +
        '<a class="cancel-btn" href="javascript:;">取消</a>' +
      '</div>' +
    '</div>' +
  '</div>';
  return dom
}
function sendReport(reportText, idx) {
  var uid = getUserID('uid'),
      sid = getUserID('sid'),
      devid = getUserID('devid'),
      ver = getVersion(),
      sourceId = getValue(decodeURIComponent(window.location.href), 'id'),
      sx = Math.random().toString(36).substr(2, 8),
      url = 'http://comment.kuwo.cn/com.s';
  var param = {
    type: 'report_comment',
    prod: ver,
    deviceId: devid,
    source: ver,
    sesID: sid,
    uid: uid,
    cid: c_id,
    sid: sourceId,
    digest: 13,
    rtype: idx,
    tipplat: 'pc',
    sx: sx
  }
  console.log('param', param);
  var key = Object.keys(param).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(param[key]);
  }).join('&');
  var keyEncode = callClient('DataDesProc?type=1&src=' + encodeURIComponent(key) + '&sx=' + encodeURIComponent('3J29IK^zgYK$')); // 客户端加密
  var commentUrl = url + '?f=nwebp&q=' + keyEncode;
  $.ajax({
    url: commentUrl,
    type: 'post',
    dataType: 'text',
    data: reportText,
    success: function(data) {
      var result = callClient('DataDesProc?type=2&utfsrc=1&src=' + encodeURIComponent(data) + '&sx=' + encodeURIComponent(sx)); // 客户端解密
      var results = valueReplace(Base64.decode(result));
      try {
        results = JSON.parse(results);
      } catch(e){
        /* eslint-disable */
        results = eval('(' + results + ')');
        /* eslint-enable */
      }
      toast('0', '感谢您的举报，我们会尽快审核处理');
      closePopup();
    }
  });
}
var reportHtml = createReport();
$('body').append(reportHtml);
// 举报按钮的点击
$('.report').live('click', function() {
  var uid = getUserID('uid');
  if (uid === '0') {
    callClientNoReturn('UserLogin?src=login');
    return;
  }
  c_id = $(this).parents('.box').attr('data-id');
  $('.tips-wrap').show();
  realTimeLog('USRCLK', 'TYPE:Comment|click:report');
});
$('.ok').live('click', function() {
  var idx = optionList.indexOf(checkOption) + 1;
  var reportText = '';
  if (checkOption === '') {
    toast('0', '请选择举报类型');
    return;
  } else if (idx === 4) {
    var val = $('.textarea').val().replace(/(^\s+)|(\s+$)/g, '');
    if (val === '') {
      toast('0', '请输入举报描述');
      return;
    }
    reportText = val;
  }
  sendReport(reportText, idx)
});
$('.cancel-btn').live('click', function() {
  closePopup();
});
function closePopup() {
  checkOption = '';
  for (var i = 0; i < 4; i++) {
    $(`#input${i}`).removeProp('checked');
    $(`#input${i}~label`).css({'background': '#fff', 'border-color': '#999'})
  }
  $('.textarea-wrap').hide();
  $('.textarea').val('');
  $('.rep').show();
  $('.tips-wrap').hide();
}

$('.popup-style').live('click', function(ele) {
  checkOption = $(this).find('input').attr('value');
  var idx = optionList.indexOf(checkOption);
  if (checkOption === '其他原因') {
    $('.textarea-wrap').show();
    $('.rep').hide();
  } else {
    $('.textarea-wrap').hide();
    $('.textarea').val('');
    $('.rep').show();
  }
  $('.popup-style label').css({'background': '#fff', 'border': '1px solid #999'})
  $(this).find('label').css({'background': skinConfig.skinColor, 'border': '1px solid' + skinConfig.skinColor });
  $(this).find('input').attr('checked', 'true');
  console.log('i');
});
// 创建回复模块
function createReplyBox(info, isLast) {
  var reply = info.reply;
  var replyStr = '';
  var likeNum = info.like_num == 0 ? '' : info.like_num;
  var time = getUnixTime(info.time);
  var timeSlot = timeFormat(time);
  var userName = decodeURIComponent(info.u_name.replace(/\+/g, '%20'));
  if (userName == '') userName = '酷小我_' + parseInt(Math.random() * 10000);
  var url = 'uid=' + getUserID('uid') + '&vuid=' + info.u_id;
  var replayNameStyle = '';
  if (PAGENAME === 'cdpacket_playing') {
    replayNameStyle = 'color: #ca9d63';
  } else {
    replayNameStyle = 'color:' + skinConfig.linkColor;
  }
  if (reply != undefined) {
    var replyUrl = 'uid=' + getUserID('uid') + '&vuid=' + reply.u_id;
    var replayName = decodeURIComponent(reply.u_name.replace(/\+/g, '%20'));
    if (replayName == '') replayName = '酷小我_' + parseInt(Math.random() * 10000);
    replyStr = '<div class="commentBox">' +
      '<p class="commentCon"><span class="userComment"><a class="reply-name" style="' + replayNameStyle + '" href="javascript:;" onclick="jumpToOtherUser(\'' + replyUrl + '\', \'' + replayName + '\')">@' + replayName + '</a>：</span><label class="allowSelect">' + filterFace(reply.msg) + '</label></p>' +
      '</div>';
  } else {
    replyStr = '';
  }
  var boxclass = 'box';
  if (isLast) {
    boxclass = 'box boxLast';
  }
  var iconClass = '';
  var style = '';
  var zanClass = '';
  if (info.vip3 == '1') {
    iconClass = 'luxuryVip';
    if (PAGENAME === 'cdpacket_playing') {
      style = 'color: #ca9d63';
    } else {
      style = 'color:' + skinConfig.linkColor;
    }
  } else if (info.vip == '1') {
    iconClass = 'musicVip';
    if (PAGENAME === 'cdpacket_playing') {
      style = 'color: #ca9d63';
    } else {
      style = 'color:' + skinConfig.linkColor;
    }
  }
  if (info.is_like === 'true') {
    zanClass = 'iconfont icon-fabulous';
  } else {
    zanClass = 'iconfont icon-nopraise';
  }
  var uuid = getUserID('uid');
  var html = ''
  if (uuid !== info.u_id) {
    html = '<a href="javascript:;" class="report skinLink">举报</a><span></span>'
  }
  return '<div class="' + boxclass + '" data-id="' + info.id + '" data-uid="' + info.u_id + '">' +
    '<div class="picBox">' +
    '<a class="skinLink" href="javascript:;" onclick="jumpToOtherUser(\'' + url + '\', \'' + userName + '\')"><img class="head" src="' + info.u_pic + '" onerror="imgOnError(this,60)" alt="" /></a>' +
    '</div>' +
    '<div class="contentComment">' +
    '<div class="main">' +
    '<p class="comment-user-name">' +
    '<span class="user"><a style="' + style + '" class="skinLink ' + iconClass + '" href="javascript:;"  onclick="jumpToOtherUser(\'' + url + '\', \'' + userName + '\')">' + userName + '</a><i class="' +
    iconClass +
    '" onclick="callClient(\'VIPLogo\')"></i></span></p>' +
    '<p class="reply-time"><span class="time">' + timeSlot + '</span></p>' +
    '<div class="reply-con"><label class="allowSelect">' + filterFace(info.msg) + '</label></div>' +
    '</div>' +
    replyStr +
    '<div class="info_ hifi-info">' +
    html +
    '<a class="delete skinLink" href="javascript:;">删除</a>' +
    '<span class="delLine"></span>' +
    '<a class="praise skinLink" data-flag="' + info.is_like + '" href="javascript:;"><i class="' + zanClass + '"></i>' + likeNum + '</a>' +
    '<span></span>' +
    '<a class="reply skinLink" href="javascript:;">回复</a>' +
    '</div>' +
    '</div>' +
    '</div>';
}

// 日期处理相关
function getUnixTime(dateStr) {
  var newstr = dateStr.replace(/-/g, '/');
  var date = new Date(newstr);
  var time_str = date.getTime().toString();
  return time_str.substr(0, 10);
}

function timeFormat(time) {
  if (!time) return false;
  var now, diff, ret, t, y, m, d, h, i, s;
  // 当前时间戳
  now = Date.parse(new Date()) / 1000;
  // 差值
  diff = now - time;
  // 设置时间
  t = new Date();
  t.setTime(time * 1000);
  y = t.getFullYear();
  m = t.getMonth() + 1;
  d = t.getDate();
  h = t.getHours();
  i = t.getMinutes();
  s = t.getSeconds();
  m = m > 9 ? m : '0' + m;
  d = d > 9 ? d : '0' + d;
  h = h > 9 ? h : '0' + h;
  i = i > 9 ? i : '0' + i;
  s = s > 9 ? s : '0' + s;
  // 开始判断
  if (diff > (60 * 60 * 24)) {
    ret = y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
  } else if (diff > (60 * 60)) {
    ret = parseInt(diff / 3600) + '小时前';
  } else if (diff > 60) {
    ret = parseInt(diff / 60) + '分钟前';
  } else {
    ret = '刚刚';
  }
  return ret;
}

// 表情相关
function filterFace(msg) {
  // 先过滤html标签
  if (msg.match(/<[^>]+>/g)) {
    msg = msg.replace(/</g, '').replace(/>/g, '');
  }
  msg = msg.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '[微笑]');
  // 后替换成表情
  var filterMsg = msg.replace(/\[[\u4e00-\u9fa5]+\]/g,
    function(faceName) {
      faceName = faceName.substring(1, faceName.length - 1);
      if (emojiConfig[faceName]) {
        return '<img src="img/comment/face/' + emojiConfig[faceName] + ".png" + '" />';
      } else {
        return '[' + faceName + ']';
      }
    });
  return filterMsg;
}

function createFace() {
  var faceStr = '';
  for (var item in emojiConfig) {
    faceStr += '<img src="img/comment/face/' + emojiConfig[item] + '.png" title="' + item + '" alt="' + item + '" />';
  }
  $('.faceBox').html(faceStr);
}

var timeout = null;

function show_end_box(msg) {
  $('.end_box').html(msg).show();
  if (timeout != null) clearTimeout(timeout);
  timeout = setTimeout(function() {
    $('.end_box').fadeOut('fast');
  }, 1000);
}

// 评论回复功能 end
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
  } else {
    pageHtml = '';
  }
  return pageHtml;
}

function setSkinCallback() {
  $('.cancel').addClass(skinConfig.type);
  $('.noLrc a').css('color', skinConfig.skinColor);
  commentModelSkinClor(PAGENAME);
}
// 表情对应表
var emojiConfig = {
  '微笑': 'emoji_1',
  '哭': 'emoji_2',
  '难过': 'emoji_3',
  '发火': 'emoji_4',
  '奇怪': 'emoji_5',
  '尴尬': 'emoji_6',
  '可爱': 'emoji_7',
  '害怕': 'emoji_8',
  '囧': 'emoji_9',
  '闭嘴': 'emoji_10',
  '脸红': 'emoji_11',
  '亲亲': 'emoji_12',
  '喜欢': 'emoji_13',
  '睡觉': 'emoji_14',
  '大哭': 'emoji_15',
  '使坏': 'emoji_16',
  '嘲笑': 'emoji_17',
  '晕': 'emoji_18',
  '大爱': 'emoji_19',
  '鄙视': 'emoji_20',
  '奋斗': 'emoji_21',
  '汗': 'emoji_22',
  '不屑': 'emoji_23',
  '吐': 'emoji_24',
  '挖鼻孔': 'emoji_25',
  '拜托': 'emoji_26',
  '美味': 'emoji_27',
  '害羞': 'emoji_28',
  '期待': 'emoji_29',
  '困': 'emoji_30',
  '辩论': 'emoji_31',
  '拜拜': 'emoji_32',
  '糗大了': 'emoji_33',
  '爱钱': 'emoji_34',
  '书呆子': 'emoji_35',
  '沉默': 'emoji_36',
  '委屈': 'emoji_37',
  '大叫': 'emoji_38',
  '打你': 'emoji_39',
  '惊讶': 'emoji_40',
  '耍酷': 'emoji_41',
  '烧香': 'emoji_42',
  '卖萌': 'emoji_43',
  '羞羞': 'emoji_44',
  '藐视': 'emoji_45',
  '高兴': 'emoji_46',
  '疑问': 'emoji_47',
  '大笑': 'emoji_48',
  '开心': 'emoji_49',
  '骷髅': 'emoji_50',
  '群众': 'emoji_51',
  '合作': 'emoji_52',
  '挑衅': 'emoji_53',
  '棒': 'emoji_54',
  '差': 'emoji_55',
  '剪刀手': 'emoji_56',
  '可以': 'emoji_57',
  '客气': 'emoji_58',
  '嘴唇': 'emoji_59',
  '西瓜': 'emoji_60',
  '苹果': 'emoji_61',
  '红心': 'emoji_62',
  '小狗': 'emoji_63',
  '小猫': 'emoji_64',
  '礼物': 'emoji_65',
  '鲜花': 'emoji_66',
  '残花': 'emoji_67',
  '咖啡': 'emoji_68',
  '米饭': 'emoji_69',
  '胶囊': 'emoji_70',
  '菜刀': 'emoji_71',
  '炸弹': 'emoji_72',
  '粑粑': 'emoji_73',
  '心': 'emoji_74',
  '心碎': 'emoji_75',
  '花': 'emoji_76',
  '树叶': 'emoji_77',
  '日历': 'emoji_78',
  '小熊': 'emoji_79',
  '蛋糕': 'emoji_80',
  '太阳': 'emoji_81',
  '彩虹': 'emoji_82',
  '皇冠': 'emoji_83',
  '雪花': 'emoji_84',
  '医药箱': 'emoji_85',
  '音乐': 'emoji_86',
  '汽车': 'emoji_87',
  '红酒': 'emoji_88',
  '画画': 'emoji_89',
  '飞机': 'emoji_90',
  '猪头': 'emoji_91',
  '创可贴': 'emoji_92',
  '信': 'emoji_93',
  '足球': 'emoji_94',
  '蜡烛': 'emoji_95',
  '星星': 'emoji_96',
  '月亮': 'emoji_97',
  '闪电': 'emoji_98',
  '杯子': 'emoji_99',
  '黄钻': 'emoji_100',
  '照相': 'emoji_101',
  '滑冰': 'emoji_102',
  '下雨': 'emoji_103',
  '手套': 'emoji_104',
  '蘑菇': 'emoji_105',
  '章鱼': 'emoji_106',
  '梨': 'emoji_107',
  '马': 'emoji_108',
  '云': 'emoji_109',
  '威武': 'emoji_110'
};


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(global) : typeof define === 'function' && define.amd ? define(factory) : factory(global)
}((
  typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this
), function(global) {
  'use strict';
  // existing version for noConflict()
  global = global || {};
  var _Base64 = global.Base64;
  var version = "2.5.1";
  // if node.js and NOT React Native, we use Buffer
  var buffer;
  if (typeof module !== 'undefined' && module.exports) {
    try {
      buffer = eval("require('buffer').Buffer");
    } catch (err) {
      buffer = undefined;
    }
  }
  // constants
  var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var b64tab = function(bin) {
    var t = {};
    for (var i = 0, l = bin.length; i < l; i++) {
      t[bin.charAt(i)] = i;
    }
    return t;
  }(b64chars);
  var fromCharCode = String.fromCharCode;
  // encoder stuff
  var cb_utob = function(c) {
    if (c.length < 2) {
      var cc = c.charCodeAt(0);
      return cc < 0x80 ? c : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6)) + fromCharCode(0x80 | (cc & 0x3f))) : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | ( cc         & 0x3f)));
    } else {
      var cc = 0x10000 + (c.charCodeAt(0) - 0xD800) * 0x400 + (c.charCodeAt(1) - 0xDC00);
      return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) + fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | ( cc & 0x3f)));
    }
  };
  var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
  var utob = function(u) {
    return u.replace(re_utob, cb_utob);
  };
  var cb_encode = function(ccc) {
    var padlen = [0, 2, 1][ccc.length % 3];
    var ord = ccc.charCodeAt(0) << 16 | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0));
    var chars = [b64chars.charAt( ord >>> 18), b64chars.charAt((ord >>> 12) & 63), padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63), padlen >= 1 ? '=' : b64chars.charAt(ord & 63)];
    return chars.join('');
  };
  var btoa = global.btoa ? function(b) {
    return global.btoa(b);
  } : function(b) {
    return b.replace(/[\s\S]{1,3}/g, cb_encode);
  };
  var _encode = buffer ? buffer.from && Uint8Array && buffer.from !== Uint8Array.from ? function(u) {
    return (u.constructor === buffer.constructor ? u : buffer.from(u)).toString('base64');
  } : function (u) {
    return (u.constructor === buffer.constructor ? u : new buffer(u)).toString('base64');
  } : function (u) {
    return btoa(utob(u));
  };
  var encode = function(u, urisafe) {
    return !urisafe ? _encode(String(u)) : _encode(String(u)).replace(/[+\/]/g, function(m0) {
      return m0 == '+' ? '-' : '_';
    }).replace(/=/g, '');
  };
  var encodeURI = function(u) { return encode(u, true) };
  // decoder stuff
  var re_btou = new RegExp(['[\xC0-\xDF][\x80-\xBF]', '[\xE0-\xEF][\x80-\xBF]{2}', '[\xF0-\xF7][\x80-\xBF]{3}'].join('|'), 'g');
  var cb_btou = function(cccc) {
    switch (cccc.length) {
      case 4:
        var cp = ((0x07 & cccc.charCodeAt(0)) << 18) | ((0x3f & cccc.charCodeAt(1)) << 12) | ((0x3f & cccc.charCodeAt(2)) << 6) | (0x3f & cccc.charCodeAt(3));
        var offset = cp - 0x10000;
        return (fromCharCode((offset >>> 10) + 0xD800) + fromCharCode((offset & 0x3FF) + 0xDC00));
      case 3:
        return fromCharCode(((0x0f & cccc.charCodeAt(0)) << 12) | ((0x3f & cccc.charCodeAt(1)) << 6) | (0x3f & cccc.charCodeAt(2)));
      default:
        return fromCharCode(((0x1f & cccc.charCodeAt(0)) << 6)| (0x3f & cccc.charCodeAt(1)));
    }
  };
  var btou = function(b) {
    return b.replace(re_btou, cb_btou);
  };
  var cb_decode = function(cccc) {
    var len = cccc.length;
    var padlen = len % 4;
    var n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) | (len > 3 ? b64tab[cccc.charAt(3)] : 0);
    var chars = [fromCharCode( n >>> 16), fromCharCode((n >>> 8) & 0xff), fromCharCode(n & 0xff)];
    chars.length -= [0, 0, 2, 1][padlen];
    return chars.join('');
  };
  var _atob = global.atob ? function(a) {
    return global.atob(a);
  } : function(a) {
    return a.replace(/\S{1,4}/g, cb_decode);
  };
  var atob = function(a) {
    return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
  };
  var _decode = buffer ? buffer.from && Uint8Array && buffer.from !== Uint8Array.from ? function(a) {
    return (a.constructor === buffer.constructor ? a : buffer.from(a, 'base64')).toString();
  } : function(a) {
    return (a.constructor === buffer.constructor ? a : new buffer(a, 'base64')).toString();
  } : function(a) {
    return btou(_atob(a))
  };
  var decode = function(a) {
    return _decode(String(a).replace(/[-_]/g, function(m0) {
      return m0 == '-' ? '+' : '/'}).replace(/[^A-Za-z0-9\+\/]/g, '')
    );
  };
  var noConflict = function() {
    var Base64 = global.Base64;
    global.Base64 = _Base64;
    return Base64;
  };
  // export Base64
  global.Base64 = {
    VERSION: version,
    atob: atob,
    btoa: btoa,
    fromBase64: decode,
    toBase64: encode,
    utob: utob,
    encode: encode,
    encodeURI: encodeURI,
    btou: btou,
    decode: decode,
    noConflict: noConflict,
    __buffer__: buffer
  };
  // if ES5 is available, make Base64.extendString() available
  if (typeof Object.defineProperty === 'function') {
    var noEnum = function(v) {
      return {
        value : v,
        enumerable: false,
        writable: true,
        configurable: true
      };
    };
    global.Base64.extendString = function() {
      Object.defineProperty(String.prototype, 'fromBase64', noEnum(function() {
        return decode(this)
      }));
      Object.defineProperty( String.prototype, 'toBase64', noEnum(function(urisafe) {
                return encode(this, urisafe)
            }));
        Object.defineProperty(
            String.prototype, 'toBase64URI', noEnum(function () {
                return encode(this, true)
            }));
    };
  }
  // export Base64 to the namespace
  if (global['Meteor']) { // Meteor.js
    Base64 = global.Base64;
  }
  // module.exports and AMD are mutually exclusive.
  // module.exports has precedence.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.Base64 = global.Base64;
  }
  else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return global.Base64;
    });
  }
  // that's it!
  return {
    Base64: global.Base64
  };
}))
