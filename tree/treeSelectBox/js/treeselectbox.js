/**
 * http://www.baihang-china.com/
 * Author: dingwei 2013-10-30
 * Description: crm.treeselectbox.js
 * Modified by: 
 * Modified contents: 
 **/
if(!(jQuery && jQuery.fn && jQuery.fn.zTree)) {

	document.write('<link type="text/css" rel="stylesheet" href="../js/zTree/css/zTreeStyle/zTreeStyle.css" />');

	document.write('<script type="text/javascript" src="../js/zTree/js/jquery.ztree.core.min.js"><\/script>');

	document.write('<script type="text/javascript" src="../js/zTree/js/jquery.ztree.excheck.min.js"><\/script>');

	document.write('<script type="text/javascript" src="../js/zTree/js/jquery.ztree.exedit.min.js"><\/script>');
	
	document.write('<script type="text/javascript" src="../js/zTree/js/jquery.ztree.exhide.min.js"><\/script>');

}

(function($) {

	if(!jqXhr) {
		var jqXhr = {};
	};
	$.ajaxSingle = function(settings) {
		var options = $.extend({
			className: 'DEFEARTNAME'
		}, $.ajaxSettings, settings);

		if(jqXhr[options.className]) {
			jqXhr[options.className].abort();
		}
		jqXhr[options.className] = $.ajax(options);
	}; //对JS的AJAX进行拓展实现清除队列

	// 工厂
	var shared = {};

	// 创建html结构
	shared.getHtml = function(opts) {

		var html = [];

		html.push('<div class="ui-treeselectbox-box"' + (opts.loadType == 'window.load' ? ' style="display:none;"' : '') + '>');

		html.push('<div class="options">');

		html.push('<ul class="ztree" id="' + opts.treeId + '"></ul>');

		html.push('</div>');

		// 是否输出“包含子机构”复选框
		if(opts.showIncludeSubChk) {

			html.push('<div class="buttons"><div><input type="checkbox" class="ui-check" id="' + opts.treeId + '-checkbox" /><label for="' + opts.treeId + '-checkbox">包含子机构</label></div></div>');

		}

		// 是否输出搜索文本框”复选框
		if(opts.searchInput) {
			html.push('<div   class="search"><div class="ui-text" id="' + opts.treeId + '-search"> <input  type="text" class="ui-text-text ui-text-match"></div></div>');
		}

		// 是否输出“操作按钮”复选框
		if(opts.showAction) {

			html.push('<div class="buttons"><span class="ui-search-button ui-search-button-clean fr" id="' + opts.treeId + '-close" ><em class="ui-button-text">确定</em></span><span class="ui-search-button ui-search-button-clean fr mr5" id="' + opts.treeId + '-clean" ><em class="ui-button-text">清空</em></span></div>')
		}

		html.push('</div>');

		return html.join('');

	};

	// 加载树结构
	shared.init = function(div, opts, config, nodes) {

		if(nodes && nodes.constructor === Array && nodes.length > 0) {
			// 加载树节点
			$('#' + opts.treeId).html('')
			$.fn.zTree.init($('#' + opts.treeId), config, nodes);
			// 去除加载进度图标
			$('div.options', div).addClass('nobg');

		} else if(nodes && nodes.constructor === Array && nodes.length == 0) {

			$('div.options', div).addClass('nobg');
			$('#' + opts.treeId).html('<div class="no-hasData">' + opts.noDataTips + '</div>');
			//$('div.options', div).html('<div class="no-hasData">'+opts.noDataTips+'</div>');

		} else {

			// alert('Data source is error！');

		}
		if(opts.onComplete && typeof opts.onComplete == 'function') {

			opts.onComplete(opts.treeId);

		}
	};

	// 根据文本框内的值初始化选中节点
	shared.resetState = function(value, opts) {

		if(value != '') {

			var zTree = $.fn.zTree.getZTreeObj(opts.treeId);

			if(opts.checkEnable) { // 复选

				zTree.checkAllNodes(false);

				var vals = value.split(','),
					len = vals.length;

				for(var i = 0; i < len; i++) {

					var node = zTree.getNodeByParam('name', vals[i], null);

					zTree.checkNode(node, true, false, false);

				}

			} else { // 单选

				var node = zTree.getNodeByParam('name', value, null);

				zTree.selectNode(node, false);

			}

		}

	};

	$.fn.treeselectbox = function(opts) {

		opts = $.extend({}, {

			treeId: null,

			readonly: true,
			
			scrollRange: 10,

			loadType: 'tag.click', // or window.load

			method: 'POST',

			searchInput: false, //是否提供搜索功能

			searchParams: null, //搜索添加的默认参数，keywords为保留key

			url: null,

			cache: false,

			async: false,

			format: 'json',

			nodes: null,

			showIcon: true,

			noDataTips: '暂无数据', // 无数据的提示信息

			checkEnable: false,

			checkReaction: null,

			showIncludeSubChk: false,

			onTextClick: null,

			beforeOnClick: null,

			onClick: null,

			onCleanClack: null,

			beforeOnCheck: null,

			onCheck: null,

			fontCss: null,

			onComplete: null,

			showAction: false,

			onFirstComplete: null,
			
			millisec: 500

		}, opts);

		// 树形插件配置
		var config = {

			view: {

				expandSpeed: '',

				selectedMulti: false,

				autoCancelSelected: false,

				fontCss: function(treeId, node) {
					return node.font ? node.font : {};
				}

			},

			data: {

				simpleData: {

					enable: true

				}

			},

			check: {

				enable: false,

				chkboxType: {
					'Y': 'ps',
					'N': 'ps'
				}

			},

			callback: {

				beforeClick: null,

				onClick: null,

				beforeCheck: null,

				onCheck: null

			}

		};

		var beforeOnClick = function(treeId, node, flag) {

			var zTree = jQuery.fn.zTree.getZTreeObj(treeId);

			zTree.checkNode(node, !node.checked, true, true);

			return false;

		};

		var beforeOnCheck = function(treeId, node) {

			var zTree = $.fn.zTree.getZTreeObj(treeId),
				parent = node.getParentNode();

			while(parent != null) {

				zTree.checkNode(parent, false, false, false);

				parent = parent.getParentNode();

			}

			var child = zTree.getNodesByParam('checked', true, node);

			if(child && child.length > 0) {

				for(var i = 0; i < child.length; i++) {
					zTree.checkNode(child[i], false, false, false);
				}
			}
		};
	    
	    /*寻找当前搜索到的节点的父节点*/
	   var findParent=function(treeObj,node){
	       treeObj.expandNode(node,true,false,false);
	       var pNode = node.getParentNode();
	       if(pNode != null){
	           nodeList.push(pNode);
	           findParent(treeObj,pNode);
	       }
	    };
	    
		return this.each(function() {
			var target = $(this),
				div, input;
			if(target.is('div')) {
				div = target;
				input = target.find(':text:first');
			} else if(target.is(':text')) {
				div = target.parent();
				input = target;
			}
			// 添加ui-treeselectbox类
			div.addClass('ui-treeselectbox');

			// 设置文本框只读属性
			if(opts.readonly) {

				input.attr('readonly', 'readonly');

			}

			// 是否输出节点图标
			if(!opts.showIcon) {

				config.view.showIcon = opts.showIcon;

			}

			// 是否启用复选模式
			if(opts.checkEnable) {

				config.check.enable = opts.checkEnable;

				config.callback.beforeClick = beforeOnClick;

			}

			//  启用复选模式时勾选的联动配置
			if(opts.checkReaction) {

				config.check.chkboxType = opts.checkReaction;

			}

			// 单击之前
			if(opts.beforeOnClick && typeof opts.beforeOnClick === 'function') {

				config.callback.beforeClick = opts.beforeOnClick;

			}

			// 单击时
			if(opts.onClick && typeof opts.onClick === 'function') {

				config.callback.onClick = opts.onClick;

			}

			// 勾选之前
			if(opts.beforeOnCheck && typeof opts.beforeOnCheck === 'function') {

				config.callback.beforeCheck = opts.beforeOnCheck;

			}

			if(opts.fontCss && typeof opts.fontCss === 'function') {
				config.view.fontCss = opts.fontCss;
			}

			// 勾选时
			if(opts.onCheck && typeof opts.onCheck === 'function') {

				config.callback.onCheck = function(e, treeId, node) {

					opts.onCheck(e, treeId, node, opts.searchParams);
				}

			}
		
			//添加搜索运行主对象

			function load() {
				// 如果未指定组件的id，则提示后返回，不执行下一步操作
				if(!opts.treeId) {

					alert('TreeId is undefined!');

					return false;

				}
				// 获取控件对象，通过其长度判断是否已加载
				var box = $('div.ui-treeselectbox-box', div);

				if(box.length == 0) { // 尚未加载
					 var style1 = {'z-index': ''}, style2 = {'display': 'none'};

					 $('div.ui-treeselectbox').css(style1).find('div.ui-treeselectbox-box').css(style2);

					// 创建html标签
					var html = shared.getHtml(opts);

					box = $(html);

					// 添加到文档流中
					div.append(

						box.click(function(e) {

							e.stopPropagation();

						})

					).css('z-index', 100);

					if(opts.url) { //请求url地址获取节点数据

						var url = null;

						switch(typeof opts.url) {

							case 'string':

								url = opts.url;

								break;

							case 'function':

								url = opts.url();

								break;

							default:
								break;

						}

						$.ajax({

							type: opts.method,

							url: url,

							cache: opts.cache,

							dataType: opts.format,

							success: function(nodes) {
								
								shared.init(div, opts, config, nodes);

							},
							complete:function(){
								if(opts.onTextClick != null && typeof opts.onTextClick == 'function') {
									opts.onTextClick(opts.treeId);
								}
							},
							error: function() {

								box.html('<div class=\'failed\'>请求失败，请刷新页面重试！</div>');

							}

						});

					} else if(opts.nodes) {

						shared.init(div, opts, config, opts.nodes);

					} else {

						alert('Data source is not set!');

					}

					if(opts.showAction) {
						$('#' + opts.treeId + '-close', box).click(function() {
							$('div.ui-treeselectbox-box', div).hide();
						})
						$('#' + opts.treeId + '-clean', box).click(function() {
							$('input:text', div).val("");
							var treeObj = $.fn.zTree.getZTreeObj(opts.treeId);
							if(opts.checkEnable) {
								treeObj.checkAllNodes(false);
							} else {
								treeObj.cancelSelectedNode();
							}
							if(opts.onCleanClack && typeof opts.onCleanClack == "function") {
								opts.onCleanClack();
							}
						})
					}
					
					//搜索调用入口
					if(opts.searchInput) {
						var Search = $('#' + opts.treeId + '-search');											
						$('input',Search).off("keyup propertychange").on("input propertychange", function(e) {
							var code = e.keyCode,
								that = this;
							if(code != 13 && code != 37 && code != 38 && code != 39 && code != 40) {
								if($(that).val().length > 0) {
									var zTree = $.fn.zTree.getZTreeObj(opts.treeId);
									var allNode = zTree.transformToArray(zTree.getNodes());	
									zTree.hideNodes(allNode);
							        nodeList = zTree.getNodesByParamFuzzy("searchs", $(that).val().toUpperCase());
							        var checkNodes = zTree.getNodesByParam("checked", true);
							        nodeList = zTree.transformToArray(nodeList);
							        for(var n in nodeList){
							           findParent(zTree,nodeList[n]);
							        }
							        for(var e in checkNodes){
								        findParent(zTree,checkNodes[e]);
								    }					
							        zTree.showNodes(nodeList);
									zTree.showNodes(checkNodes);
								} 
								else{
									var zTree = $.fn.zTree.getZTreeObj(opts.treeId),
									nodes = zTree.getNodesByParam("isHidden", true);
									zTree.showNodes(nodes);
								}
							}
						});
					}
					
					if(opts.showIncludeSubChk) {

						$('#' + opts.treeId + '-checkbox', box).click(function() {

							var zTree = $.fn.zTree.getZTreeObj(opts.treeId);

							if(this.checked) {

								var checked = zTree.getCheckedNodes(true);

								for(var i = 0; i < checked.length; i++) {

									zTree.checkNode(checked[i], false, false, true);

								}

								zTree.setting.callback.beforeCheck = beforeOnCheck;

							} else {

								zTree.setting.callback.beforeCheck = null;

							}

						});

					}

					if(opts.onFirstComplete && typeof opts.onFirstComplete == 'function') {

						opts.onFirstComplete(opts.treeId);

					}

				} else { // 已加载

					if(box.is(':visible')) {

						div.css('z-index', '');

						box.css('display', 'none');

					} else {
						 var style1 = {'z-index': ''}, style2 = {'display': 'none'};
						 $('div.ui-treeselectbox').css(style1).find('div.ui-treeselectbox-box').css(style2);

						div.css('z-index', 100);

						box.css('display', 'block');

					}

				}

			}

			// 页面加载完成时即加载树结构
			if(opts.loadType == 'window.load') {
				load();
			}

			// 组件点击事件
			div.click(function(e) {
				if($(this).hasClass('ui-text-disabled')) {
					return false;
				}
				load();	
				//文本框单击
				if(opts.nodes && opts.onTextClick != null && typeof opts.onTextClick == 'function') {
					opts.onTextClick(opts.treeId);
				}

				e.stopPropagation();

			});

			$(document).click(function() {
				 var style1 = {'z-index': ''}, style2 = {'display': 'none'};
				 $('div.ui-treeselectbox').css(style1).find('div.ui-treeselectbox-box').css(style2);

			});

		});

	};

})(jQuery);