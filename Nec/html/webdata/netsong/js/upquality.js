/**
* create by deng 2016-9-22 一键升高音质
*/ 
(function($){
	var upQuality = {};
	var selectedArr = [];//存储是否勾选 0 1
	var sizeArr = [];//存储勾选的歌曲的size，未勾选存0
	var allSizeArr = [];//存储每一首歌的size
	var checkedNum=0;//记录选择的总数
	var musiclist = null;
	upQuality.load=function(){
		getUpgradeList();
		setSizeAndNum(checkedNum,arrSum(sizeArr));
		bindFn();
	};
	/**
	*获取列表数据
	*/
	function getUpgradeList(){
		var data = callClient('LGetMusicListInfo');
		data = eval("("+data+")");
		musiclist = data.musiclist;
		createUpgradeList(musiclist);
	}
	/**
	*创建列表
	*/
	function createUpgradeList(data){
		var model = loadTemplate('#kw_upgradeItemModel');
		var html = drawListTemplate(data,model,proUpgrade);
		$(".upgradeList").html(html);
		createUnSelected();
	}
	/**
	*创建之前忽略的歌曲
	*/ 
	function createUnSelected(){
		var num = sizeArr.length-checkedNum;
		if (num>0) {
			$(".upgradeList").prepend('<div class="unSelectedConTroll"><p>之前被忽略的<span class="unSelectedNum">'+num+'</span>首歌曲，点击<span class="change">展开</span><label></label></p></div><div class="unSelectedBox"></div>');
			$(".unSelected").appendTo($(".unSelectedBox"));
			if(checkedNum==0){
				$(".unSelectedBox").show();
				$(".unSelectedConTroll label").addClass("down");
			}
		};
	}
	/**
	*列表数据重定向
	*/
	function proUpgrade(data){
		var json = {};
		var selected = data.selected;
		var size = parseFloat(data.size);
		var checkClass = "";
		var itemClass = "";
		selectedArr.push(selected);
		allSizeArr.push(size);
		if(selected=="1"){
			checkClass="checked";
			checkedNum++;
		}else{
			size=0;
			itemClass = "unSelected"
			$(".checkAll label").removeClass();
		}
		sizeArr.push(size);
		json = {
			'name':decodeURIComponent(data.name),
			'format':decodeURIComponent(data.format),
			'size':data.size,
			'checkClass':checkClass,
			'itemClass': itemClass,
			'index':data.index
		};
		return json;
	}
	/**
	*数组求和
	*/
	function arrSum(arr){
		var sum = 0;
		function getSum (item, index, array){
			sum += item;
		}
		arr.map(getSum);
		if(sum!=0)sum=sum.toFixed(2)
		return sum;
	}
	/**
	*设置选择歌曲数和总的大小
	*/
	function setSizeAndNum(num,size){
		$(".num").html("共"+num+"首歌曲");
		$(".allSize").html("共"+size+"M");
		// 无选择置灰
		if(checkedNum==0){
			$(".upgrade").addClass("noChoose");
		}else{
			$(".upgrade").removeClass("noChoose");
		}
	}
	/**
	*事件绑定
	*/ 
	function bindFn(){
		$(".checkAll label").live("click",function(){
			var $this = $(this);
			var sum = 0;
			if($this.hasClass("checked")){
				$this.removeClass("checked");
				$(".checkItem label").removeClass("checked");
				for(var i=0;i<selectedArr.length;i++){
					selectedArr[i]="0";
					sizeArr[i] = 0;
				}
				checkedNum = 0;
				sum = 0;
			}else{
				$this.addClass("checked");
				for(var i=0;i<selectedArr.length;i++){
					selectedArr[i]="1";
					sizeArr[i]=allSizeArr[i];
				}
				$(".checkItem label").addClass("checked");
				checkedNum = sizeArr.length;
				sum = arrSum(sizeArr);
			}
			setSizeAndNum(checkedNum,sum);
		});
		$(".checkItem label").live("click",function(){
			var $this = $(this);
			var $item = $this.parents(".item");
			var sortIndex = $item.attr("data-index");
			var size = allSizeArr[sortIndex];
			if($this.hasClass("checked")){
				$this.removeClass("checked");
				$(".checkAll label").removeClass("checked");
				selectedArr[sortIndex]="0";
				sizeArr[sortIndex]= 0;
				checkedNum--;
			}else{
				$this.addClass("checked");
				selectedArr[sortIndex]="1";
				sizeArr[sortIndex]= size;
				checkedNum++;
				if($(".content .checkItem").length==$(".upgradeList .checked").length){
					$(".checkAll label").addClass("checked");
				}
			}
			setSizeAndNum(checkedNum,arrSum(sizeArr));
		});
		$(".upgrade").live("click",function(){
			if($(this).hasClass("noChoose"))return;
			var params = "";
			var len = musiclist.length;
			for(var i=0;i<len;i++){
				params+='&selected'+i+'='+selectedArr[i]+'&index'+i+'='+i+'&s'+i+'='+musiclist[i].rid;
			}
			callClientNoReturn('LUpquality?n='+len+params);
		});
		$(".unSelectedConTroll").live("click",function(){
			var $unSelectedBox = $(".unSelectedBox")
			var $label = $(".unSelectedConTroll label");
			var $change = $(".change");
			if($label.hasClass("down")){
				$label.removeClass();
				$change.html("展开");
			}else{
				$label.addClass("down");
				$change.html("收起");
			};
			$unSelectedBox.is(":hidden")?$unSelectedBox.show():$unSelectedBox.hide();
		});
	}
	window.$kw_upQuality = upQuality;
})($);