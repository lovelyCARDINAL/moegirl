(function($, mw) {
	$(function() {
		var sidebarCookieName = 'sidebarHidden';
		var commonImgUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
		var localImgUrl = 'https://zh.wikipedia.org/static/images/mobile/copyright/wikipedia-wordmark-';
		var imgLogoLang = ['ca', 'cs', 'cy', 'el', 'en', 'et', 'hi', 'hy', 'ja', 'ka', 'la', 'ru', 'szl', 'th', 'uk', 'uz', 'zh'].indexOf(mw.config.get('wgContentLanguage')) > -1 ? mw.config.get('wgContentLanguage') : 'en';
		var img = {
					logo: localImgUrl + imgLogoLang + '.svg',
					logo_zh_hans: localImgUrl + 'zh-hans.svg',
					next: commonImgUrl + '/9/95/Icons8_flat_next.svg/15px-Icons8_flat_next.svg.png',
					prev: commonImgUrl + '/b/bd/Icons8_flat_previous.svg/15px-Icons8_flat_previous.svg.png'
				};
		var isMobile = /(Android|iPad|iPhone|Mobile)/i.test(navigator.userAgent);
		var cookieExpires = 365;
		var sidebarHidden = false;
		var sidebarGadgetLoaded = false;

		function hideSidebar() {
			sidebarHidden = true;
			$('#sidebarCollapse').attr('src', img.next);
			updatePos();
			$('#content').css('margin-left', '1em');
			$('#footer').css('margin-left', '1em');
			$('#mw-panel').hide();
			$('#sliderCollapseLogo').show();
			$.cookie(sidebarCookieName, 'true', {
				expires: cookieExpires,
				path: '/'
			})
		}

		function showSidebar() {
			sidebarHidden = false;
			$('#sidebarCollapse').attr('src', img.prev);
			updatePos();
			$('#content').css('margin-left', '');
			$('#footer').css('margin-left', '');
			$('#mw-panel').show();
			$('#sliderCollapseLogo').hide();
			$.cookie(sidebarCookieName, 'false', {
				expires: cookieExpires,
				path: '/'
			})
		}

		function updatePosHelper(arr) {
			var divList = ['#sidebarCollapse', '#sliderCollapseLogo'];
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === null) continue;
				var bDiv = divList[i];
				var bLeft = $(bDiv).css('left');
				var bSize = arr[i];
				if (bLeft !== bSize) $(bDiv).css('left', bSize)
			}
		}

		function updatePos() {
			var bWidth = 0;
			if (isMobile) {
				bWidth = window.outerWidth > 0 ? window.outerWidth : $('body').width
			} else {
				bWidth = window.innerWidth > 0 ? window.innerWidth : $('body').width
			}
			if (bWidth >= 982) {
				updatePosHelper(sidebarHidden ? ['0.3em', '3em'] : ['10.3em', null])
			} else {
				updatePosHelper(sidebarHidden ? ['0.3em', '2.5em'] : ['9.3em', null])
			}
		}

		function sidebarHiddenProc() {
			sidebarGadgetLoaded = true;

			var sidebarCollapse = $('<img>').attr({
				'id': 'sidebarCollapse',
				'src': img.prev
			}).css({
				'position': 'fixed',
				'float': 'right',
				'width': '0.8em',
				'height': '0.8em',
				'top': '5.625em',
				'cursor': 'pointer',
				'padding': '0.3em',
				'-webkit-border-radius': '50px',
				'-moz-border-radius': '50px',
				'border-radius': '50px',
				'text-align': 'center',
				'border': '1px solid #a7d7f9',
				'background': '#fff'
			});

			var newLink = $('<a>').attr({
				'id': 'newLink',
				'href': '/wiki',
				'title': $('.mw-wiki-logo').attr('title')
			});

			if (mw.config.get('wgNoticeProject') === 'wikipedia') {
				var imgLogo = ['zh-cn', 'zh-hans', 'zh-my', 'zh-sg'].indexOf(mw.config.get('wgUserLanguage')) > -1 ? img.logo_zh_hans : img.logo;
				$('<img>').attr({
					'id': 'sliderCollapseLogo',
					'src': imgLogo
				}).css({
					'display': 'none',
					'position': 'absolute',
					'top': '3.375em',
					'cursor': 'pointer',
					'float': 'none',
					'width': '6em'
				}).appendTo(newLink);
			}

			sidebarCollapse.appendTo('#mw-navigation');
			newLink.appendTo('#mw-navigation');

			if ($.cookie(sidebarCookieName) === 'true') hideSidebar();
			updatePos();

			$(window).resize(function() {
				updatePos()
			});

			$('#sidebarCollapse').mouseover(function() {
				$(this).css('background', 'rgb(223, 245, 255)')
			}).mouseout(function() {
				$(this).css('background', 'white')
			}).click(function() {
				sidebarHidden ? showSidebar() : hideSidebar()
			})
		}

		function sidebarHiddenInit() {
			if (mw.config.get('skin') !== 'vector' || $('.mw-special-Blankpage').length !== 0 || $('#mw-sidebar-button').length > 0) return;
			if (['ar', 'arc', 'arz', 'bo', 'ckb', 'dv', 'dz', 'glk', 'ks', 'mzn', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi'].indexOf(mw.config.get('wgContentLanguage')) > -1) return;
			if ($('#mw-navigation').length === 0) {
				var obs = new MutationObserver(function (mutations, observer) {
					if (sidebarGadgetLoaded) return;
					for (var i = 0; i < mutations.length; ++i) {
						for (var j = 0; j < mutations[i].addedNodes.length; ++j) {
							if (mutations[i].addedNodes[j].id === 'mw-navigation') {
								sidebarHiddenProc();
								break;
							}
						}
					}
				});
				obs.observe(document.body, {
					childList: true
				});
				return
			}
			sidebarHiddenProc()
		}
		sidebarHiddenInit()
	})
})(jQuery, mw);
