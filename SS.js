/* 尊重萌娘百科版权，以下代码复制需要注明原自萌娘百科，并且附上URL地址http://zh.moegirl.org.cn/MediaWiki:Group-sysop.js
 * 版权协定：知识共享 署名-非商业性使用-相同方式共享 3.0
 */
(function($, mw) {
    function toUpperFirstCase(t) {
        return t[0].substring(0, 1).toUpperCase() + t.substring(1);
    }

    function ifUseWikiplus(yT, nT) {
        return (useWikiplus() ? yT : nT) + '';
    }

    function addLink($obj, act) {
        var href = $obj.css("margin-right", "1em")[0].href,
            reasonPageName = href.slice(href.indexOf("title=") + 6, href.indexOf("&action"));
        $obj.after('<a target="_blank" href="/' + reasonPageName + '">浏览' + act + '原因</a>');
    }

    function abuseLog() {
        if ($(".mw-special-AbuseLog")[0]) {
            var rawInput = $('input[name="wpSearchFilter"]').val().split("|");
            var needToggle = new Set();
            $(".plainlinks li").each(function() {
                var self = $(this);
                var id = -1;
                switch (true) {
                    case self.find('a[href="/Special:%E6%BB%A5%E7%94%A8%E8%BF%87%E6%BB%A4%E5%99%A8/1"]')[0] && !rawInput.includes("1"):
                        id = 1;
                        break;
                    case self.find('a[href="/Special:%E6%BB%A5%E7%94%A8%E8%BF%87%E6%BB%A4%E5%99%A8/11"]')[0] && !rawInput.includes("11"):
                        id = 11;
                        break;
                }
                if (id !== -1) {
                    needToggle.add(id);
                    self.addClass("AbuseFilterNeedHidden");
                }
            });
            if ($(".AbuseFilterNeedHidden")[0]) {
                mw.loader.addStyleTag("body.AbuseFilterHidden .AbuseFilterNeedHidden { display: none; }");
                var lastStatus = localStorage.getItem("AnnTools-abuseLog-hidden") === "true";
                var bdy = $("body");
                $('form[action="/Special:%E6%BB%A5%E7%94%A8%E6%97%A5%E5%BF%97"] > fieldset').append("<p/>").find("p").append($("<span/>", {
                    text: "点击隐藏/显示防滥用过滤器" + Array.from(needToggle.values()).join("、").replace(/、(?=[^、]+$)/, "和") + "的日志："
                })).append($("<input/>", {
                    val: lastStatus ? "显示" : "隐藏",
                    on: {
                        click: function() {
                            if ($("body").hasClass("AbuseFilterHidden")) {
                                $(this).val("隐藏");
                                localStorage.getItem("AnnTools-abuseLog-hidden", "false");
                            } else {
                                $(this).val("显示");
                                localStorage.getItem("AnnTools-abuseLog-hidden", "true");
                            }
                            bdy.toggleClass("AbuseFilterHidden");
                        }
                    },
                    attr: {
                        type: "button"
                    }
                }));
                if (lastStatus) {
                    bdy.addClass("AbuseFilterHidden");
                }
            }
        }
    }

    function abuseFilterEdit() {
        var MAWI, selectOpt, selectVal;
        $('#mw-abusefilter-edit-warn-message').each(function() { //元素分开操作，简化作用域链
            var self = $(this),
                select = self.find('select').appendTo(self),
                MWFP, MAWP, MWFC, MWFO;
            self.find('td').remove();
            self.append('<td><fieldset><legend>使用现有的消息</legend><table><tr><td class="mw-label">用作警告的系统消息：</td><td class="mw-input" id="mw-abusefilter-edit-warn-message-select"></td></tr><tr><td class="mw-label">操作：</td><td class="mw-input"><p><input id="MWFP" type="button" value="预览消息"><input id="MWFC" type="button" value="清空预览" style="display: none;"><input id="MWFO" type="button" value="在新窗口打开"> </p></td></tr><tr><td id="MAWP" colspan="2"></td></tr><tr><td colspan="2"><p>P.S.只有这里的下拉栏设置的系统消息才是防滥用过滤器使用的系统消息，隔壁是创建用啦！</p></td></tr><tr><td colspan="2" id="MAWI"></td></tr></table></fieldset></td>').find('#mw-abusefilter-edit-warn-message-select').append(select);
            MWFP = $('#MWFP'), MAWP = $('#MAWP'), MWFC = $('#MWFC'), MWFO = $('#MWFO');
            MAWI = $('#MAWI'), selectOpt = select.html(), selectVal = select.val(); //放置到上级作用域链以便其他元素执行
            MWFP.on('click', function() {
                MAWP.load(mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/Mediawiki:' + select.val() + '?action=render');
                MWFC.fadeIn();
            });
            MWFC.on('click', function() {
                MAWP.empty();
                MWFC.fadeOut();
            });
            MWFO.on('click', function() {
                window.open(mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/Mediawiki:' + select.val(), '_blank');
            });
        });
        $('#mw-abusefilter-edit-warn-other-label').each(function() {
            var self = $(this),
                MACN, MWCEVB, MWCE, MWCV, MACT, pageName, preloadPage, select;
            self.find('#mw-abusefilter-warn-message-other').css({
                visibility: "hidden",
                height: "0"
            }).appendTo(MAWI);
            self.empty();
            self.append('<td><fieldset><legend>想要创建／' + ifUseWikiplus("浏览", "编辑") + '的消息：</legend><table><tr><td class="mw-label">作为模板的系统消息：</td><td><select></select></td></tr><tr><td class="mw-label"><p>想要创建／浏览的消息：</p><dl><dd>（无须MediaWiki前缀）</dd></dl></td><td class="mw-input"><input size="45" id="MACN"></td><tr><td class="mw-label">操作：</td><td><input type="button" id="MWCEVB"></td></tr><tr><td colspan="2" id="MACT"></td></tr></table></fieldset></td>');
            MACN = $('#MACN').val(selectVal), MWCEVB = $('#MWCEVB').val(ifUseWikiplus("创建／浏览所选消息", "创建／编辑所选消息")), MWCV = self.find('#MWCV'), MACT = self.find('#MACT'), select = self.find('select').html(selectOpt).val(selectVal);
            MACT.text('P.S.点击按钮后' + ifUseWikiplus("如果输入框内所指消息存在则在新标签页访问该消息页面，否则则打开一个创建该消息的新标签页", "打开一个创建/编辑该消息的新标签页"));
            MWCEVB.on('click', function() {
                pageName = 'Mediawiki:' + MACN.val(), preloadPage = 'Mediawiki:' + select.val();
                $.ajax({
                    url: mw.config.get("wgServer") + mw.config.get("wgScriptPath") + "/api.php",
                    beforeSend: function() {
                        MACT.text("正在检查");
                    },
                    type: 'POST',
                    data: {
                        action: 'query',
                        titles: pageName,
                        format: 'json',
                        converttitles: ' zh-cn'
                    },
                    success: function(data) {
                        if (data.query.pages['-1']) {
                            MACT.text('该消息不存在！即将从新标签页访问该消息页面的创建页！');
                            window.setTimeout(function() {
                                window.open(mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/index.php?preload=' + preloadPage + '&action=edit&title=' + pageName, '_blank');
                            }, 1730);
                        } else {
                            MACT.text('该消息存在！即将从新标签页访问该消息' + ifUseWikiplus('！', '的编辑页！'));
                            window.setTimeout(function() {
                                window.open(ifUseWikiplus(mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/' + pageName, mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/index.php?action=edit&title=' + encodeURIComponent(pageName)), '_blank');
                            }, 1730);
                        }
                    },
                    error: function() {
                        MACT.text('无法检测页面是否存在！即将从新标签页访问该消息页面的编辑/创建页！');
                        window.setTimeout(function() {
                            window.open(mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/index.php?preload=' + preloadPage + '&action=edit&title=' + pageName, '_blank');
                        }, 1730);
                    }
                });
            });
        });
        $('#mw-abusefilter-edit-warn-actions').remove();
    }

    function widgetPreload() {
        if (mw.config.get('wgAction') === 'edit') {
            var regex = /[-_,.\/\\]/;
            if (regex.test(mw.config.get('wgPageName'))) {
                window.onbeforeunload = undefined;
                $(window).off("beforeunload");
                location.replace( mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/index.php?action=edit&title=' + mw.config.get('wgPageName').replace(/ |_/g, '').replace(/^([^\/]*)[\/\\].*$/i, '$1').split(regex).map(function(n) { return toUpperFirstCase(n); }).join(''));
                return;
            }
            var flag = ("wg" + mw.config.get('wgTitle')).replace(/ /g, '');
            $("#wpTextbox1").val("<noinclude> </noinclude><includeonly><!--{if !isset($" + flag + ") || !$" + flag + '}--><!--{assign var="' + flag + '" value=true scope="global"}--><script>\n"use strict";\nwindow.RLQ = window.RLQ || [];\nwindow.RLQ.push(() => {\n\n});\n</script><!--{/if}--></includeonly>');
        }
        if ($('#mw-content-text > .mw-parser-output > .noarticletext')[0]) $(document.body).addClass('noWidget');
    }

    function widgetList() {
        var idList = $('.TablePager_col_af_id a'),
            lvList = $('.TablePager_col_af_hidden'),
            idLength = idList.last().text().length;
        idList.each(function() {
            var zero = '';
            while ($(this).text().length + zero.length < idLength) zero += '0';
            $(this).prepend('<span style="speak:none;visibility:hidden;color:transparent;">' + zero + '</span>');
        });
        lvList.each(function() {
            // if ($(this).text().length == 2) $(this).prepend('<span style="speak:none;visibility:hidden;color:transparent;">已</span>');
        });
    }

    function modifySidebar(action, section, name, link) {
        try {
            var target = {
                'languages': '#p-lang',
                'toolbox': '#p-tb'
            } [section] || '#p-' + section;
            if (action == 'add') $(target).find('div:first ul:first').append('<li class="plainlinks"><a href="' + link + '">' + name + '</a></li>');
            if (action == 'remove') $(target).find('div:first ul:first li a[href="' + link + '"][title="' + name + '"]').parent().hide();
        } catch (e) {
            console.debug('modifySidebar', e); // let's just ignore what's happened
        }
    }

    function flowthreadAdminLink() {
        var link = $('<div/>', {
                id: 'flowthreadAdminLink',
                css: {
                    'font-size': '12px',
                    'color': '#999',
                    'text-align': 'right'
                }
            }).append('<a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/MediaWiki:Flowthread-blacklist" style="margin-right:8px;" target="_blank">关键词过滤名单</a>')
            .append('<a href="' + mw.config.get("wgServer") + mw.config.get("wgScriptPath") + '/Special:%E7%AE%A1%E7%90%86FlowThread%E8%AF%84%E8%AE%BA" target="_blank">评论管理</a>');
        $('#flowthread').append(link);
    }

    function i18nLink() {
        $('#mw-content-text a.new[href$="/zh-cn"], #mw-content-text a.new[href$="/zh-tw"]').each(function(_, ele) {
            $(ele).removeClass('new').attr({
                title: ele.title.replace(/\/zh-[a-z]+|（页面不存在）/g, ''),
                href: ele.href.replace(/\/zh-[a-z]+/g, '')
            });
        });
    }

    $(function() {
        if ($('body.mw-special-AbuseFilter')[0] && $('#mw-abusefilter-warn-parameters')[0]) abuseFilterEdit();
        if (mw.config.get('wgNamespaceNumber') == 274 && !mw.config.get('wgCurRevisionId')) widgetPreload();
        if (window.location.href.indexOf("action=delete") != -1) {
            if ($(".mw-delete-editreasons")[0]) addLink($(".mw-delete-editreasons a"), '删除');
            if ($(".mw-filedelete-editreasons")[0]) addLink($(".mw-filedelete-editreasons a"), '删除');
        }
        if (window.location.href.indexOf("action=protect") != -1 && $(".mw-protect-editreasons")[0]) addLink($(".mw-protect-editreasons a"), '保护');
        if ($('.mw-special-AbuseFilter')[0]) widgetList();
        setInterval(function() {
            i18nLink();
            if ($('#flowthread')[0] && !$("#flowthreadAdminLink")[0]) flowthreadAdminLink();
        }, 100);
    });
})(jQuery, mediaWiki);
