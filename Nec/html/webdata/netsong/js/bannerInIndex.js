var dataCsrc = '';
var bigBannerClickObj = {};// 大焦点图点击参数
// swiper
var carouselInstance = null; // 全局轮播实例
var slidesPerView = 3; // 显示几个轮播项（全局化以便其他函数使用）
var autoPlayTimer = null; // 自动播放的定时器

var $skinConfig = {};
$(function() {
  $skinConfig = JSON.parse(window.parent.document.getElementById('banner_iframe').getAttribute('data-config'));
});

$(window).resize(function() {
  if (carouselInstance) carouselInstance.updateSize();
  setIframeHeight();
});

// 换肤回调
  function onSkinChange(skinConfig) {
    $skinConfig = skinConfig;
    $('body').removeClass().addClass(skinConfig.type)
  }

function callMainDataFn(data) {
  if (!data || data.length < 1) return;

  var bannerArr = [];
  data.forEach(function(item) {
    if (!sourceISOK(item.source)) {
      bannerArr.push(item);
    }
  });
  if (bannerArr.length < 0) return;

  // var last = bannerArr.pop();
  // bannerArr.unshift(last);
  bannerArr.forEach(function(item, index) {
    item.indexnum = index;
  });

  if (!carouselInstance) initCarousel(bannerArr);
  else carouselInstance.update(bannerArr);
}
function proIndexFocusData(obj) {
  var json = {};
  var source = obj.source;
  var sourceid = obj.sourceId;
  var artistid = obj.artistId || '';
  var albumid = obj.albumId || '';
  var mvquality = obj.mvquality || 0;
  var mvpayinfo = '';
  try {
    mvpayinfo = obj.mvpayinfo && encodeURIComponent(JSON.stringify(obj.mvpayinfo)) || '';
  } catch (e) {
    mvpayinfo = '';
  }
  var focussourceid = source === 21 ? getValue(sourceid, 'id') : sourceid;
  if (source === 21 && sourceid.indexOf('?') > -1) {
    sourceid = sourceid + '&from=index';
  }
  extend = obj.extend;
  disname = (obj.disName || obj.name).replace(/(\r|\n)/g, '');
  disname = checkSpecialChar(disname, 'disname');
  titlename = disname;
  titlename = checkSpecialChar(titlename, 'titlename');
  var name = obj.name.replace(/(\r|\n)/g, '');
  name = checkSpecialChar(name, 'name');
  if (source === 2) source = 1;
  /*
  * 焦点图播放乱码处理，将编码这一步去掉，后台返回数据已经编码一次
  * @author 邢祥超 [20190820]
  * */
  // if (source == 7) sourceid = encodeURIComponent(sourceid);
  nodeid = obj.nodeId;
  if (nodeid === '') nodeid = 0;
  var other = '';
  if (source === 8 || source === 12) {
    other = '|psrc=首页->焦点图->|from=index';
  }
  other += '|csrc=曲库->首页->焦点图->' + name;
  var click = commonClickString(new Node(source, sourceid, name, nodeid, extend, other, 'index', artistid, albumid, mvpayinfo, mvquality));
  var indexnum = obj.indexnum;
  var pic = obj.pic2025;
  var picText = obj.picText;
  if (!pic) {
    pic = 'img/def_300_217.jpg';
  }
  if (pic !== '') {
    pic = changeImgDomain(pic);
  }

  var labelText = getStringKey(extend, 'LABEL_TXT');
  var labelColor = getStringKey(extend, 'LABEL_COLOR');
  var labelShow = labelText ? 'inline-block' : 'none';
  var showBottomInfo = (labelShow === 'inline-block' || picText) ? 'block' : 'none';
  var showPlayBtn = source === 1 || source === 4 || source === 8 || source === 12 || source === 13 || source === 21;

  json = {
    'source': source,
    'sourceid': sourceid,
    'focussourceid': focussourceid,
    'name': name,
    'titlename': titlename,
    'click': click,
    'indexnum': indexnum,
    'pic': pic,
    'picText': picText,
    'labelText': labelText,
    'labelColor': labelColor,
    'labelShow': labelShow,
    'showBottomInfo': showBottomInfo,
    'showPlayBtn': showPlayBtn
  };
  return json;
}

function initCarousel(bannerList) {
  // 轮播图配置
  var delay = 5000; // 轮播切换延迟
  // 使用全局 slidesPerView 变量
  var curIndex = 0; // 轮播组件内部使用的当前索引
  var realCurIndex = 0;
  var currentLogicalPage = 0; // 当前逻辑页码，用于分页器状态
  var supportAutoPlay = false;
  var isAnimating = false; // 是否正在动画过渡中
  var animateDuration = 300; // 动画持续时间
  var animateRedundancy = 50; // 动画冗余时间
  var wrapperWidth = 0; // 容器总宽度
  var slideWidth = 0; // 单个轮播项宽度
  var spaceBetween = 10; // 轮播项之间的间距
  var isHovering = false; // 是否鼠标悬停

  // 获取DOM元素
  var bannerBox = document.querySelector('.banner_box');
  var container = document.querySelector('.carousel-container');
  var wrapper = document.querySelector('.carousel-wrapper');
  var slides = Array.from(document.querySelectorAll('.carousel-wrapper .carousel-slide'));
  var slidesCount = slides.length;
  var realSlides = []; // 用于无限循环的复制项
  var realSlidesCount = 0;
  var paginationContainer = document.querySelector('.carousel-pagination');
  var prevButton = document.querySelector('.carousel-button-prev');
  var nextButton = document.querySelector('.carousel-button-next');

  // 初始化参数设置
  function init(bannerList) {
    // 轮播模板
    var slideModel = loadTemplate('#kw_bannerlist');
    var listHtml = drawListTemplate(bannerList, slideModel, proIndexFocusData);
    $('.carousel-wrapper').html(listHtml);

    // 读取初始数据后再初始化slides
    slides = Array.from(document.querySelectorAll('.carousel-wrapper .carousel-slide'));
    slidesCount = slides.length;
    carouselInstance.slides = slides;

    if (slidesCount === 0) {
      console.error('No slides found');
      return;
    }

    supportAutoPlay = slidesCount > slidesPerView;
    // 设置滑动区域样式
    if (supportAutoPlay) {
      $(paginationContainer).show();
    } else {
      $(wrapper).css('padding', 0);
      $(paginationContainer).hide();
    }

    // 懒加载处理
    loadImagesNew();
    // 创建复制项实现无限循环效果
    duplicateSlides();
    // 创建分页器
    createPagination();
    // 设置容器宽度和初始位置
    updateSlidesDimensions();

    // 设置初始位置
    curIndex = 0;
    realCurIndex = 0;
    currentLogicalPage = 0;
    carouselInstance.curIndex = curIndex;
    carouselInstance.realCurIndex = realCurIndex;
    translateToIndex(realCurIndex, false);
    // 更新分页器更新状态
    updatePagination();

    // 添加事件监听
    attachEventListeners();

    // 自动播放
    if (supportAutoPlay) {
      startAutoPlay();
    }

    // 初始添加轮播露出日志
    setFocusExposureLog();
    // 设置换肤
    onSkinChange($skinConfig);
  }
  
  function update(bannerList) {
    init(bannerList);
  }
  function updateSize() {
    updateSlidesDimensions();
    translateToIndex(realCurIndex, false);
    updatePagination();
  }

  // 初始化幻灯片 - 不使用无限循环复制
  function duplicateSlides() {
    // if (!supportAutoPlay) return;

    // 清空容器并重新添加所有幻灯片
    wrapper.innerHTML = '';
    realSlides = [];

    // 直接添加原始幻灯片，不进行复制
    for (var i = 0; i < slides.length; i++) {
      var clone = slides[i].cloneNode(true);
      wrapper.appendChild(clone);
      realSlides.push(clone);
    }

    realSlidesCount = realSlides.length;
    carouselInstance.realSlides = realSlides;
  }
  // 创建分页器 - 按屏分页（每屏3个）
  function createPagination() {
    paginationContainer.innerHTML = '';
    if (!supportAutoPlay) return;

    // 计算页数：每屏显示3个，计算需要几页
    var totalPages = Math.ceil(slidesCount / slidesPerView);

    // 创建分页器元素
    for (var i = 0; i < totalPages; i++) {
      var bullet = document.createElement('span');
      bullet.className = 'carousel-pagination-bullet';
      if (i === 0) bullet.classList.add('carousel-pagination-bullet-active');
      bullet.setAttribute('data-page', i); // 改为页索引
      paginationContainer.appendChild(bullet);
    }
  }
  // 更新分页器状态 - 按页更新
  function updatePagination() {
    var bullets = document.querySelectorAll('.carousel-pagination-bullet');
    if (!bullets || bullets.length === 0) return;

    // 使用逻辑页码而不是realCurIndex计算的页码
    var totalPages = Math.ceil(slidesCount / slidesPerView);
    currentLogicalPage = Math.max(0, Math.min(currentLogicalPage, totalPages - 1));

    for (var i = 0; i < bullets.length; i++) {
      if (i === currentLogicalPage) {
        bullets[i].classList.add('carousel-pagination-bullet-active');
      } else {
        bullets[i].classList.remove('carousel-pagination-bullet-active');
      }
    }
  }
  // 更新轮播尺寸
  function updateSlidesDimensions() {
    // 获取容器宽度
    var containerWidth = container.offsetWidth;
    // 设置幻灯片宽度
    slideWidth = (containerWidth - ((slidesPerView - 1) * spaceBetween)) / slidesPerView;

    // 根据宽高比282:206计算高度
    var slideHeight = (slideWidth * 206) / 282;

    // 设置轮播容器宽度
    wrapperWidth = realSlides.length * (slideWidth + spaceBetween);

    // 更新每个幻灯片的尺寸
    realSlides.forEach(function(slide) {
      slide.style.width = slideWidth + 'px';
      // 为了兼容不支持aspect-ratio的浏览器，明确设置高度
      slide.style.height = slideHeight + 'px';
    });

    // 更新wrapper宽度和高度
    wrapper.style.width = wrapperWidth + 'px';
    wrapper.style.height = slideHeight + 'px';

    // 更新轮播容器高度，加上分页器的高度（22px来自padding）
    container.style.height = (slideHeight + 22) + 'px';

    // 设置iframe高度
    setIframeHeight();
  }
  // 将轮播图移动到指定的物理位置，根据实际显示内容调整位置
  function translateToIndex(index, animate) {
    var moveWidth = slideWidth + spaceBetween;
    var translateX;

    // 计算当前页和剩余图片数量
    var currentPage = Math.floor(index / slidesPerView);
    var totalPages = Math.ceil(slidesCount / slidesPerView);
    var remainingSlides = slidesCount - currentPage * slidesPerView;

    // 如果是最后一页且不足3张，调整滑动距离以避免右侧空白
    if (currentPage === totalPages - 1 && remainingSlides < slidesPerView) {
      // 最后一页：让剩余图片右对齐显示，避免右侧空白
      var maxVisibleSlides = Math.min(slidesPerView, slidesCount);
      var lastPageStartIndex = Math.max(0, slidesCount - maxVisibleSlides);
      translateX = -lastPageStartIndex * moveWidth;
    } else {
      // 正常页面：按标准方式滑动
      translateX = -index * moveWidth;
    }

    if (animate) {
      wrapper.style.transition = 'transform ' + animateDuration + 'ms ease';
    } else {
      wrapper.style.transition = 'none';
    }

    wrapper.style.transform = 'translate3d(' + translateX + 'px, 0px, 0px)';

    // 如果不是动画，强制重排以确保立即生效
    if (!animate) {
      void wrapper.offsetWidth;
    }

    setTimeout(() => {
      if (index < 0) {
        realCurIndex = slidesCount - 1;
        carouselInstance.realCurIndex = realCurIndex;
        translateToIndex(realCurIndex, false);
      } else if (index > slidesCount - 1) {
        realCurIndex = 0;
        carouselInstance.realCurIndex = realCurIndex;
        translateToIndex(realCurIndex, false);
      }
    }, animateDuration);
  }
  // 滑动到指定逻辑索引
  function goToSlide(index, animate) {
    if (isAnimating) return;

    isAnimating = true;

    // 计算逻辑页码（用于分页器状态）
    var targetLogicalPage = Math.floor(index / slidesPerView);
    var totalPages = Math.ceil(slidesCount / slidesPerView);
    
    // 边界处理：按屏分页逻辑处理
    if (index >= slidesCount) {
      // 超出范围，跳转到第一屏
      realCurIndex = 0;
      currentLogicalPage = 0;
    } else if (index < 0) {
      // 小于0，跳转到最后一屏的起始位置
      currentLogicalPage = totalPages - 1;
      var remainingSlides = slidesCount - currentLogicalPage * slidesPerView;
      if (remainingSlides < slidesPerView) {
        // 最后一页不足3张，调整显示位置
        var maxVisibleSlides = Math.min(slidesPerView, slidesCount);
        realCurIndex = Math.max(0, slidesCount - maxVisibleSlides);
      } else {
        realCurIndex = currentLogicalPage * slidesPerView;
      }
    } else {
      currentLogicalPage = targetLogicalPage;
      
      // 检查是否是最后一页且不足3张
      if (currentLogicalPage === totalPages - 1) {
        var remainingSlides = slidesCount - currentLogicalPage * slidesPerView;
        if (remainingSlides < slidesPerView) {
          // 最后一页不足3张时，调整显示位置但保持逻辑页码
          var maxVisibleSlides = Math.min(slidesPerView, slidesCount);
          realCurIndex = Math.max(0, slidesCount - maxVisibleSlides);
        } else {
          realCurIndex = index;
        }
      } else {
        realCurIndex = index;
      }
    }

    // 确保realCurIndex在有效范围内
    realCurIndex = Math.max(0, Math.min(realCurIndex, slidesCount - 1));
    curIndex = realCurIndex;

    carouselInstance.realCurIndex = realCurIndex;
    carouselInstance.curIndex = curIndex;

    translateToIndex(index, animate); // 保持原始index用于translateToIndex中的计算
    // 更新分页器
    updatePagination();

    setTimeout(function() {
      isAnimating = false;
    }, animateDuration + animateRedundancy);

    // 预加载懒加载图片
    // loadLazyImages(physicalIndex, slidesPerView + 1);

    // 发送日志
    setFocusExposureLog();
  }
  function goToPrev() {
    stopAutoPlay();
    // 按屏切换：上一屏（3个为一组）- 使用逻辑页码
    var totalPages = Math.ceil(slidesCount / slidesPerView);
    var targetPage = currentLogicalPage - 1;

    // 边界处理：如果已经是第一屏，跳转到最后一屏
    if (targetPage < 0) {
      targetPage = totalPages - 1;
    }

    var targetIndex = targetPage * slidesPerView;

    goToSlide(targetIndex, true);
    if (!isHovering) startAutoPlay();
  }
  function goToNext() {
    stopAutoPlay();
    // 按屏切换：下一屏（3个为一组）- 使用逻辑页码
    var totalPages = Math.ceil(slidesCount / slidesPerView);
    var targetPage = currentLogicalPage + 1;

    // 边界处理：如果已经是最后一屏，跳转到第一屏
    if (targetPage >= totalPages) {
      targetPage = 0;
    }

    var targetIndex = targetPage * slidesPerView;

    goToSlide(targetIndex, true);
    if (!isHovering) startAutoPlay();
  }
  function containerEnter() {
    isHovering = true;
    if (supportAutoPlay) {
      stopAutoPlay();
      $(prevButton).show();
      $(nextButton).show();
    }
  }
  function containerLeave() {
    isHovering = false;
    if (supportAutoPlay) {
      startAutoPlay();
      $(prevButton).hide();
      $(nextButton).hide();
    }
  }
  // 加载懒加载图片
  function loadLazyImages(startIndex, count) {
    var defaultImage = 'img/def_300_217.png'; // 默认图片路径

    for (var i = startIndex; i < startIndex + count && i < realSlides.length; i++) {
      var slide = realSlides[i];
      var img = slide.querySelector('img.carousel-lazy');
      if (img && img.getAttribute('data-src')) {
        // 保存原始数据源地址
        var originalSrc = img.getAttribute('data-src');

        // 先确保默认图片已加载
        if (!img.src || img.src.indexOf('def_300_217') === -1) {
          img.src = defaultImage;
        }

        // 加载完毕后移除加载动画
        img.onload = function() {
          var preloader = this.parentNode.querySelector('.carousel-lazy-preloader');
          if (preloader) {
            preloader.style.display = 'none';
          }
        };

        // 图片加载失败时使用默认图片
        img.onerror = function() {
          this.src = defaultImage;
          // 移除加载动画
          var preloader = this.parentNode.querySelector('.carousel-lazy-preloader');
          if (preloader) {
            preloader.style.display = 'none';
          }
          // 确保图片标签有onerror处理
          if (!this.hasAttribute('onerror')) {
            this.setAttribute('onerror', 'imgOnError(this,300);');
          }
        };

        // 尝试加载实际图片
        img.src = originalSrc;
      }
    }
  }
  // 绑定事件监听
  function attachEventListeners() {
    // 导航按钮事件
    prevButton.removeEventListener('click', goToPrev);
    nextButton.removeEventListener('click', goToNext);
    prevButton.addEventListener('click', goToPrev);
    nextButton.addEventListener('click', goToNext);

    // 分页器点击事件 - 按页跳转
    var bullets = document.querySelectorAll('.carousel-pagination-bullet');
    for (var i = 0; i < bullets.length; i++) {
      var bullet = bullets[i];
      bullet.addEventListener('click', function() {
        var pageIndex = parseInt(this.getAttribute('data-page'));
        var targetIndex = pageIndex * slidesPerView;

        stopAutoPlay();
        goToSlide(targetIndex, true);
        if (!isHovering) startAutoPlay();
      });
    }

    // 鼠标悬停事件
    bannerBox.removeEventListener('mouseenter', containerEnter);
    bannerBox.removeEventListener('mouseleave', containerLeave);
    bannerBox.addEventListener('mouseenter', containerEnter);
    bannerBox.addEventListener('mouseleave', containerLeave);

    // 轮播项悬停事件
    realSlides.forEach(function(slide) {
      slide.addEventListener('mouseenter', function(e) {
        var $playBtn = $(this).find('.play_btn');
        if ($playBtn.attr('data-show') === 'true') $playBtn.show();
        e.stopPropagation();
      });

      slide.addEventListener('mouseleave', function(e) {
        $(this).find('.play_btn').hide();
        e.stopPropagation();
      });
    });
    // 轮播项点击事件
    realSlides.forEach(function(slide) {
      var link = slide.querySelector('a');
      if (link) {
        link.addEventListener('click', function() {
          var parent = this.parentNode;
          var clickFunc = parent.getAttribute('data-click');
          if (clickFunc) {
            // eslint-disable-next-line no-eval
            eval('(' + clickFunc + ')');
          }
        });
      }

      var playButton = slide.querySelector('.play_btn');
      if (playButton) {
        playButton.addEventListener('click', function(e) {
          e.stopPropagation();
          var source = this.getAttribute('data-source');
          var sourceid = this.getAttribute('data-sourceid');
          var name = this.getAttribute('data-name');
          var url = '';

          realTimeLog('USRCLK', `TYPE:PCFOCUS_CLICK|SOURCEID:${sourceid}`); // 首页焦点图点击日志

          if (source === '21') {
            iPlayPSRC = '首页->焦点图->精选->' + name;
          } else {
            iPlayPSRC = '首页->焦点图->' + name;
          }

          dataCsrc = '曲库->首页->焦点图->' + name;

          if (source === '21') {
            dataCsrc = '曲库->首页->焦点图->精选->' + name + '精选集';
            $.getScript(album_url + 'album/mbox/commhd?flag=1&id=' + sourceid + '&pn=0&rn=' + iplaynum + '&callback=playZhuanTiMusic');
          } else if (source === '1') {
            url = 'http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&type=bang&data=content&id=' + sourceid + '&callback=playBangMusic&pn=0&rn=' + iplaynum;
            $.getScript(getChargeURL(url));
          } else if (source === '4') {
            url = search_url + 'r.s?stype=artist2music&artistid=' + sourceid + '&pn=0&rn=' + iplaynum + '&newver=1&callback=playArtistMusic';
            $.getScript(getChargeURL(url));
          } else if (source === '8' || source === '12') {
            url = 'http://nplserver.kuwo.cn/pl.svc?op=getlistinfo&pid=' + sourceid + '&pn=0&rn=' + iplaynum + '&encode=utf-8&keyset=pl2012&identity=kuwo&pcmp4=1&newver=1&callback=playGeDanMusic';
            $.getScript(getChargeURL(url));
          } else if (source === '13') {
            url = search_url + 'r.s?stype=albuminfo&albumid=' + sourceid + '&callback=playAlbumMusic&alflac=1&newver=1';
            $.getScript(getChargeURL(url));
          }
        });
      }
    });
  }
  // 开始自动播放 - 按屏自动切换
  function startAutoPlay() {
    if (!supportAutoPlay) return;
    stopAutoPlay();
    autoPlayTimer = setInterval(function() {
      // 自动播放也按屏切换
      goToNext();
    }, delay);
  }
  // 停止自动播放
  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // 实现DOM结构准备好后初始化
  $(function() {
    setTimeout(() => {
      init(bannerList);
    }, 200);
  });

  // 将实例保存到全局变量
  carouselInstance = {
    curIndex: curIndex,
    realCurIndex: realCurIndex,
    slides: slides,
    realSlides: realSlides,
    goToSlide: goToSlide,
    stopAutoPlay: stopAutoPlay,
    startAutoPlay: startAutoPlay,
    updateSize: updateSize,
    update: update
  };
}

function setIframeHeight() {
  var bannerIframe = window.parent.document.getElementById('banner_iframe');
  bannerIframe.height = $('body').height();
}

/*
 * @Author: xiangchao.xing
 * @Date: 2022-05-06
 * @Description: 大广告焦点图相关事件
*/
// 大焦点图显示，暂停定时器
function bigBannerShow(val) {
  if (carouselInstance) carouselInstance.stopAutoPlay();

  if (val) {
    if (carouselInstance) {
      carouselInstance.updateSize();
      carouselInstance.startAutoPlay();
    }
    setFocusExposureLog();
  }
}
// 设置跳转参数
function setBigBannerClickObj(obj) {
  var source = obj.source;
  var sourceid = obj.sourceId;
  var mvpayinfo = '';
  var other = '';
  var name = obj.name.replace(/(\r|\n)/g, '');
  var nodeid = obj.nodeId;

  if (nodeid === '') nodeid = 0;

  try {
    mvpayinfo = obj.mvpayinfo && encodeURIComponent(JSON.stringify(obj.mvpayinfo)) || '';
  } catch (e) {
    mvpayinfo = '';
  }

  if (source === 2) source = 1;
  if (source === 21 && sourceid.indexOf('?') > -1) {
    sourceid = sourceid + '&from=index';
  }

  if (source === 8 || source === 12) other = '|psrc=首页->焦点图->|from=index';

  other += '|csrc=曲库->首页->焦点图->' + name;

  bigBannerClickObj = {
    source: source,
    sourceid: sourceid,
    name: checkSpecialChar(name, 'name'),
    nodeid: nodeid,
    extend: obj.extend,
    other: other,
    from: 'index',
    artistid: obj.artistId || '',
    albumid: obj.albumId || '',
    mvpayinfo: mvpayinfo,
    showBanner: obj.showBanner || 0
  };
}
// 设置大焦点图点击事件
function bigBannerClick() {
  commonClick(bigBannerClickObj);
}

// 全局存储已发送日志 sourceId
var logSourceIds = [];
// 轮播图曝光日志
function setFocusExposureLog() {
  if (!carouselInstance) return;

  // 发送当前可见的所有幻灯片的曝光日志
  for (var i = 0; i < slidesPerView; i++) {
    var visibleSlide = carouselInstance.slides[carouselInstance.curIndex + i];
    if (!visibleSlide) continue;

    var exposureItem = $(visibleSlide).find('a');
    var sourceId = exposureItem.attr('data-sourceid');
    var slideName = exposureItem.attr('data-name');

    // 确保每个 sourceId 只记录一次
    if (sourceId && logSourceIds.indexOf(sourceId) === -1) {
      logSourceIds.push(sourceId);
      realTimeLog('USRCLK', `TYPE:PCFOCUS_SHOW|SOURCEID:${sourceId}`);
    }
  }
}
