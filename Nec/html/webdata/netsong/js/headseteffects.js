$(function () {
  callClientNoReturn('domComplete');
  var headsetInfo = callClient('GetHeadsetConfig');
  var selectID = url2data(headsetInfo, 'venid');
  var headsetid = url2data(headsetInfo, 'devid');
  if (selectID) {
    call_create_selectarea_fn(selectID);
    if (headsetid) {
      call_create_scrollarea_fn(selectID, headsetid);
    }
  } else {
    call_create_selectarea_fn('', headsetid);
  }
  objBind();
  // setSkin(setSkinCallback);
});

function setSkinCallback() {
  var skinColor = skinConfig.skinColor;
  $('.headsetListBox li i').css('background', skinColor);
}

function call_create_selectarea_fn(selectID, headsetid) {

  try {
    $.ajax({
      url: 'http://www.kuwo.cn/api/erji/brandList',
      dataType: "text",
      type: "get",
      crossDomain: false,
      success: function (data) {
        if (data.indexOf('"status":200') < 0) {
          loadErrorPage();
          return;
        }
        var jsondata = eval('(' + data + ')');
        var logoData = jsondata.data.list || [];
        if (selectID) {
          for (var i = 0; i < logoData.length; i++) {
            if (logoData[i].id == selectID) {
              logoData[i]['hasclass'] = 1;
            } else {
              logoData[i]['hasclass'] = 0;
            }
          }
        } else {
          logoData[0]['hasclass'] = 1;
          var id = logoData[0].id;
          if (headsetid) {
            call_create_scrollarea_fn(id, headsetid);
          } else {
            call_create_scrollarea_fn(id);
          }
        }
        new selectArea(logoData);
        loadImages();

      },
      error: function () {
        loadErrorPage();
      }
    });
  }
  catch (e) {
    console.log('line:' + e.lineNumber);
    console.log('des:' + e.message);
    console.log('stack:' + e.stack);

  }
}

function createSelectArea(data) {
  var model = loadTemplate('#kw_selectModel');
  var html = drawListTemplate(data, model, proSelectData);
  $('.select_btnBox,.layerBox ul').html(html);
}

function proSelectData(obj) {
  var json = {};
  var tmpname = obj.name
  var name = checkSpecialChar(tmpname, 'disname');
  var titlename = checkSpecialChar(tmpname, 'titlename');
  var id = obj.id;
  var hasclass = obj.hasclass || '';
  var classname = '';
  if (hasclass) {
    classname = 'active';
  }
  var pic = obj.logo;
  var pichover = obj.logoHover
  json = {
    'id': id,
    'name': name,
    'classname': classname,
    'titlename': titlename,
    'pic': pic,
    'pichover': pichover
  };
  return json;
}

function selectArea(logoData) {
  createSelectArea(logoData);

  //处理特殊的被选中品牌
  $('.selectedVen').hide();
  var index = $('.select_btnBox li.active').index();
  if (index > 6) {
    var msg = $('.select_btnBox li.active').html();
    $('.selectedVen').html(msg).attr('data-index', index);
    $('.selectedVen').show();
  }

  var _this = this;
  $('.select_btnBox li').on('click', function () {
    var obj = $(this);
    _this.fnclick($(this));
  });
  $('.select_btnBox img,.layer_select_btnBox img').on('mouseenter', function () {
    var obj = $(this);
    _this.fnenter($(this));
  });
  $('.select_btnBox img,.layer_select_btnBox img').on('mouseleave', function () {
    var obj = $(this);
    _this.fnleave($(this));
  });

  $('.layer_select_btnBox li').on('click', function () {
    var obj = $(this);
    _this.layerclick($(this));
  })
}

selectArea.prototype.fnclick = function (obj) {
  if (obj.hasClass('active')) {
    return;
  }
  var pic = $('.select_btnBox li.active img').attr('data-original');
  $('.select_btnBox li.active img').attr('src', pic);

  $('.select_btnBox li').removeClass('active');
  obj.addClass('active');

  var index = obj.index();
  var pic = $('.layer_select_btnBox li.active img').attr('data-original');
  $('.layer_select_btnBox li.active img').attr('src', pic);
  $('.layer_select_btnBox li').removeClass('active');
  $('.layer_select_btnBox li').eq(index).addClass('active');
  var pichover = $('.layer_select_btnBox li.active img').attr('data-hover');
  $('.layer_select_btnBox img').eq(index).attr('src', pichover);

  var id = obj.attr('data-id');
  var headsetid = $('.BigImgBox img').attr('data-devid');
  if (headsetid) {
    call_create_scrollarea_fn(id, headsetid, true);
  } else {
    call_create_scrollarea_fn(id, 0, true);
  }
  //$('.selectedVen').hide();
  if (index <= 6) {
    $('.selectedVen').addClass('selectedVenNocolor');
  }
  var lastpic = $('.selectedVen img').attr('data-original');
  $('.selectedVen img').attr('src', lastpic);
}

selectArea.prototype.layerclick = function (obj) {
  if (obj.hasClass('active')) {
    return;
  }

  var index = obj.index();
  var pic = $('.select_btnBox li.active img').attr('data-original');
  $('.select_btnBox li.active img').attr('src', pic);
  $('.select_btnBox li').removeClass('active');
  $('.select_btnBox li').eq(index).addClass('active');
  var pichover = $('.select_btnBox li.active img').attr('data-hover');
  $('.select_btnBox img').eq(index).attr('src', pichover);
  $('.selectedVenNocolor').removeClass('selectedVenNocolor');

  var layerpic = $('.layer_select_btnBox li.active img').attr('data-original');
  $('.layer_select_btnBox li.active img').attr('src', layerpic);
  $('.layer_select_btnBox li').removeClass('active');
  obj.addClass('active');

  //处理特殊的被选中品牌
  //$('.selectedVen').hide();
  var lastpic = $('.selectedVen img').attr('data-original');
  $('.selectedVen img').attr('src', lastpic);
  if (index >= 6) {
    var msg = $('.select_btnBox li.active').html();
    $('.selectedVen').html(msg).attr('data-index', index);
    $('.selectedVen img').attr('src', pichover);
    $('.selectedVen').show();
    if (obj.find('p').css('display') == 'block') {
      $('.selectedVen img').hide();
      $('.selectedVen p').show();
    } else {
      $('.selectedVen img').show();
      $('.selectedVen p').hide();
    }

  } else {
    $('.selectedVen').addClass('selectedVenNocolor');
  }

  var id = obj.attr('data-id');
  var headsetid = $('.BigImgBox img').attr('data-devid');
  var bigImgVenId = $('.BigImgBox img').attr('data-venid');

  if (headsetid && (id == bigImgVenId)) {
    call_create_scrollarea_fn(id, headsetid, true);
  } else {
    call_create_scrollarea_fn(id, 0, true);
  }
  $('.layer_select_btnBox').scrollTop(0);
  $('.layerBox').hide();
  $('.layerShadow,.triangle').hide();
}

selectArea.prototype.fnenter = function (obj) {
  var pichover = obj.attr('data-hover');
  obj.attr('src', pichover);
}

selectArea.prototype.fnleave = function (obj) {
  if (obj.parent().hasClass('active')) {
    return;
  }
  var pic = obj.attr('data-original');
  obj.attr('src', pic);
}

function call_create_scrollarea_fn(id, headsetid, isclick) {
  try {
    $.ajax({
      url: 'http://www.kuwo.cn/api/erji/modelList?brandId=' + id,
      dataType: "text",
      type: "get",
      crossDomain: false,
      success: function (data) {
        var jsondata = eval('(' + data + ')');
        var listData = jsondata.data.list || [];
        var venname = jsondata.data.brandName || '';
        if (headsetid) {
          for (var i = 0; i < listData.length; i++) {
            listData[i]['venname'] = venname;
            if (headsetid == listData[i].id) {
              listData[i]['hasclass'] = 1;
              setBigPic(id, listData[i]);
            } else {
              listData[i]['hasclass'] = 0;
            }
          }
        } else {
          if (!isclick) {
            listData[0]['venname'] = venname;
            setBigPic(id, listData[0], true);
          } else {
            for (var i = 0; i < listData.length; i++) {
              listData[i]['venname'] = venname;
            }
          }
        }
        new scrollArea(listData, id);
        loadImages();
      },
      error: function () {
        loadErrorPage();
      }
    });
  }
  catch (e) {
    console.log('line:' + e.lineNumber);
    console.log('des:' + e.message);
    console.log('stack:' + e.stack);

  }

}

function createScrollArea(data) {
  try {
    var model = loadTemplate('#kw_scrollModel');
    var html = drawListTemplate(data, model, proScrollData);
    $('.headsetListBox').css('left', 0).html(html);
    var oldHtml = $('.headsetListOverFlowBox').html();
    var newHtml = `<div class="headsetListOverFlowBox">
                        ${oldHtml}
                   </div>
                   <a href="javascript:;" class="prev controlBtn" data-direction="prev"><</a>
                   <a href="javascript:;" class="next controlBtn" data-direction="next">></a>`;
    $('.scrollBarBox').html(newHtml);
  }
  catch (e) {
    console.log('line:' + e.lineNumber);
    console.log('des:' + e.message);
    console.log('stack:' + e.stack);

  }
}

function proScrollData(obj) {
  try {
    var json = {};
    var name = checkSpecialChar(obj.name, 'disname');
    var id = obj.id;
    var hasclass = obj.hasclass;
    var classname = '';
    if (hasclass) {
      classname = 'active';
    }
    var pic = obj.smallPic;
    var eq = obj.equalizer;
    json = {
      'id': id,
      'name': name,
      'classname': classname,
      'pic': pic,
      'eq': eq
    };
    return json;
  }
  catch (e) {
    console.log('line:' + e.lineNumber);
    console.log('des:' + e.message);
    console.log('stack:' + e.stack);

  }
}

function scrollArea(data, venid) {
  createScrollArea(data);
  $('.headsetListBox').attr('data-venid', venid);
  var len = $('.headsetListBox').children().length;
  var onew = 144;
  var w = onew * len;
  $('.headsetListBox').width(w);
  var l = 0;
  if ($('.headsetListBox li.active').hasClass('active')) {
    var l = $('.headsetListBox li.active')[0].offsetLeft;
    var l = Math.floor(l / 720) * -720;
    $('.headsetListBox').css('left', l);
  }
  if (w > 720) {
    var limitL = -720 * Math.floor((w - 1) / 720);
    if (l > limitL) {
      $('.scrollBarBox a.next').show();
    }
    if (l != 0) {
      $('.scrollBarBox a.prev').show();
    }
  } else {
    $('.scrollBarBox a').hide();
  }

  var _this = this;
  $('.headsetListBox li').on('click', function () {
    _this.fnclick($(this), data);
  });
  $('.scrollBarBox a').on('click', function () {
    var direction = $(this).attr('data-direction');
    _this.scrollclick($(this), direction, w, _this);
  });
}

scrollArea.prototype.fnclick = function (obj, data) {
  if (obj.hasClass('active')) {
    return;
  }
  $('.headsetListBox li').removeClass('active');
  obj.addClass('active');

  var venname = $('.select_btnBox li.active').attr('data-name');
  venname = encodeURIComponent(venname);
  var venid = $('.headsetListBox').attr('data-venid');
  var headsetname = obj.attr('data-name');
  headsetname = encodeURIComponent(headsetname);
  var headsetid = obj.attr('data-id');
  var eq = obj.attr('data-eq');
  var call = 'SetHeadsetConfig?venid=' + venid + '&venname=' + venname + '&devid=' + headsetid + '&devname=' + headsetname + '&eq=' + eq;
  //console.log(call);
  callClientNoReturn(call);

  //设置大图
  var index = obj.index();
  setBigPic(venid, data[index]);
}

scrollArea.prototype.scrollclick = function (obj, direction, boxWidth, selfObj) {
  var nowL = $('.headsetListBox')[0].offsetLeft;
  var oBox = $('.headsetListBox')[0];
  $('.scrollBarBox a').unbind('click');
  //console.log(nowL);
  if (direction == 'next') {
    var limitL = 720 * Math.floor((boxWidth - 1) / 720);
    if (limitL == Math.abs(nowL)) {
      $('.scrollBarBox a').on('click', function () {
        var direction = $(this).attr('data-direction');
        selfObj.scrollclick($(this), direction, boxWidth, selfObj);
      });
      return;
    }
    $('.headsetListBox').animate({"left": nowL - 720 + "px"}, 500, function () {
      $('.scrollBarBox a').on('click', function () {
        var direction = $(this).attr('data-direction');
        selfObj.scrollclick($(this), direction, boxWidth, selfObj);
      });
      if ((nowL - 720) == limitL * -1) {
        $('.scrollBarBox a.next').hide();
      }
      $('.scrollBarBox a.prev').show();
    });
  } else {
    var limitL = 0;
    if (limitL == nowL) {
      $('.scrollBarBox a').on('click', function () {
        var direction = $(this).attr('data-direction');
        selfObj.scrollclick($(this), direction, boxWidth, selfObj);
      });
      return;
    }
    $('.headsetListBox').animate({"left": nowL + 720 + "px"}, 500, function () {
      $('.scrollBarBox a').on('click', function () {
        var direction = $(this).attr('data-direction');
        selfObj.scrollclick($(this), direction, boxWidth, selfObj);
      });
      if ((nowL + 720) == 0) {
        $('.scrollBarBox a.prev').hide();
      }
      $('.scrollBarBox a.next').show();
    });
  }
}

function setBigPic(venid, obj, isdefault) {
  try {
    var name = checkSpecialChar(obj.name, 'disname');
    //var impedance = obj.impedance || 0;
    //impedance = '阻抗'+impedance+'Ω';
    // var price = obj.price || 0;
    // price = '￥'+price;
    //<span class="price">${price}</span>
    //<span class="impedance">${impedance}</span>
    var id = obj.id;
    var venname = obj.venname || '';
    var pic = obj.pic;
    if (pic) {
      var target = pic;
    } else {
      var target = 'img/headseteffects/big_default.png';
    }
    if (venname) {
      var str = `<img width="260" height="260" data-venid="${venid}" data-devid="${id}" class="bigHeadset" src="${target}" onerror="headsetImgError(this,'big');">
                   <div class="infoBox">
                        <p class="info">
                            <span>${venname} ${name}</span>
                        </p>
                   </div>`;
    } else {
      var str = `<img width="260" height="260" data-venid="${venid}" data-devid="${id}" class="bigHeadset" src="${target}" onerror="headsetImgError(this,'big');">
                   <div class="infoBox">
                        <p class="info">
                            <span>${name}</span>
                        </p>
                   </div>`;
    }
    if (isdefault) {
      var target = 'img/headseteffects/big_default.png';
      var str = `<img width="260" height="260" class="bigHeadset" src="${target}" onerror="headsetImgError(this,'big');">`;
    }
    $('.BigImgBox').html(str);
  }
  catch (e) {
    console.log('line:' + e.lineNumber);
    console.log('des:' + e.message);
    console.log('stack:' + e.stack);

  }
}

function objBind() {
  $('.select_more').live('click', function () {
    $('.layerBox').show();
    $('.layerShadow,.triangle').show();
    // var oBox = $('.select_btnBox');
    // var oSpan = $('.select_more span');
    // if(oBox.hasClass('select_btnBoxActive')){
    //     oBox.removeClass('select_btnBoxActive');
    // }else{
    //     oBox.addClass('select_btnBoxActive');
    // }
    // if(oSpan.hasClass('active')){
    //     oSpan.removeClass('active');
    // }else{
    //     oSpan.addClass('active');
    // }
  });

  $('.selectedVenNocolor').live('click', function () {
    var classname = $(this).attr('class');
    if (classname == 'selectedVen') {
      return;
    }
    var index = $(this).attr('data-index');
    $('.select_btnBox li').eq(index).click();
    $(this).removeClass('selectedVenNocolor');
    var oImg = $(this).find('img');
    var pichover = oImg.attr('data-hover');
    oImg.attr('src', pichover);
  });

  $('.selectedVenNocolor').live('mouseenter', function () {
    var oImg = $(this).find('img');
    var pichover = oImg.attr('data-hover');
    oImg.attr('src', pichover);
  });

  $('.selectedVenNocolor').live('mouseleave', function () {
    var oImg = $(this).find('img');
    var pic = oImg.attr('data-original');
    oImg.attr('src', pic);
  });

  $('.closeBtn').live('click', function () {
    $('.layer_select_btnBox').scrollTop(0);
    $('.layerBox').hide();
    $('.layerShadow,.triangle').hide();
  });

  $('.layerShadow').live('click', function (ev) {
    $('.layer_select_btnBox').scrollTop(0);
    $('.layerBox').hide();
    $('.layerShadow,.triangle').hide();
    ev.preventDefault();
  });
}

function headsetImgError(obj, type) {
  try {
    if (type == 'big') {
      obj.src = 'img/headseteffects/big_default.png';
      obj.onerror = null;
    } else {
      $(obj).next().show();
      $(obj).remove();
    }
  }
  catch (e) {
    console.log('line:' + e.lineNumber);
    console.log('des:' + e.message);
    console.log('stack:' + e.stack);

  }

}

function loadImages() {
  try {
    var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
    var clientH = document.documentElement.clientHeight;
    var scrollB = scrollT + clientH;
    var imgs = $('.lazy');
    imgs.each(function (i) {
      if ($(this)[0].offsetTop < scrollB) {
        if ($(this)[0].getAttribute('data-original') !== '{$pic}') {
          var oParent = $(this).parents('li');
          var oBoxClass = oParent.parent().attr('class');
          var src = $(this)[0].getAttribute('data-original');
          if (oParent.hasClass('active') && (oBoxClass == 'select_btnBox' || oBoxClass == 'layer_select_btnBox')) {
            src = $(this)[0].getAttribute('data-hover');
          }
          if ($(this).parent().hasClass('selectedVen')) {
            src = $(this)[0].getAttribute('data-hover');
            $(this).css('display', 'none');
          }
          $(this)[0].setAttribute('src', src);
          $(this).removeClass('lazy');
          var targetImg = $(this);
          var oImg = new Image();
          oImg.src = src;
          oImg.onload = function () {
            targetImg.next().hide();
            var des = targetImg.parent().attr('class');
            if (des == 'active') {
              $('.selectedVen img').show();
              $('.selectedVen p').hide();
            }
            targetImg.css('display', 'block');
          }
        }
      }
    });
  }
  catch (e) {
    console.log('line:' + e.lineNumber);
    console.log('des:' + e.message);
    console.log('stack:' + e.stack);

  }
}

function pageReLoad() {
  var headsetInfo = callClient('GetHeadsetConfig');
  var selectID = url2data(headsetInfo, 'venid');
  var headsetid = url2data(headsetInfo, 'devid');
  var nowSID = $('.select_btnBox li.active').attr('data-id');
  var nowHID = $('.headsetListBox li.active').attr('data-id');
  if (selectID == nowSID && headsetid == nowHID) {
    return;
  } else {
    window.location.reload();
  }
}
