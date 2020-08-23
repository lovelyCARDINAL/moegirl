$(function() {
    var self = $('#p-cactions .menu ul');
    if (!self.find('li')[0] || $('.willBeDeleted')[0] || mw.config.get('wgUserGroups').indexOf('patroller') === -1 || (mw.config.get('wgNamespaceNumber') !== 0 && mw.config.get('wgNamespaceNumber') != 10)) return;
    $('<a/>', {
        attr: {
            href: "#",
            title: "移动到创建者的用户子页面并挂删[alt-shift-m]",
            accesskey: 'm'
        },
        text: '打入冷宫'
    }).on('click', function() {
        var api = new mw.Api();
        api.get({
            action: 'query',
            format: 'json',
            prop: 'contributors',
            titles: mw.config.get('wgPageName')
        }).then(function(d) {
            if (d.error) {
                alert('查询贡献信息失败！');
                return;
            }
            if (d.query.pages[mw.config.get('wgArticleId')].contributors.length != 1 && confirm('贡献者并非只有创建者一人，请检查页面历史。确定打回创建者用户页？') === false) return;

            var default_reason = '无实质内容或不在收录范围内，移动回创建者用户子页面';
            var reason = prompt('打回用户页的理由将会作为移动原因和挂删理由\n空白则使用默认（' + default_reason + '）\n取消则不打回：'),
                self = $(this);
            if (reason === null) return;
            if (reason === '') reason = default_reason;
            var loadingBox = $('<div/>', {
                css: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    height: '100vh',
                    width: '100vw',
                    transition: 'opacity .73s linear',
                    color: 'black',
                    'padding-top': '49vh',
                    'background-color': 'rgba(255,255,255,0.73)',
                    'text-align': 'center'
                }
            }).append('<img src="https://static.mengniang.org/common/d/d1/Windows_10_loading.gif" style="height: 1em; margin-top: -.25em;">正在打回中……');
            var reasonText = reason ? '|' + reason : '';
            loadingBox.endOut = function endOut() {
                this.css('color', 'red').text('打回失败……').delay(1000).queue(function() {
                    $(this).css('opacity', '0').delay(730).queue(function() {
                        $(this).remove();
                        $(document.body).css('overflow', 'auto');
                        $(this).dequeue();
                    });
                    $(this).dequeue();
                });
            };
            $(document.body).append(loadingBox).css('overflow', 'hidden');
            return api.get({
                action: 'query',
                format: 'json',
                prop: 'revisions',
                titles: mw.config.get('wgPageName'),
                rvprop: 'ids|user',
                rvlimit: 1,
                rvdir: 'newer'
            });
        }, loadingBox.endOut.bind(loadingBox)).then(function(d) {
            if (d.error) return loadingBox.endOut();
            return api.postWithToken('csrf', {
                action: 'move',
                format: 'json',
                from: mw.config.get('wgPageName'),
                to: 'User:' + d.query.pages[mw.config.get('wgArticleId')].revisions[0].user + '/' + mw.config.get('wgPageName'),
                reason: reason,
                watchlist: 'preferences'
            });
        }, loadingBox.endOut.bind(loadingBox)).then(function(d) {
            if (d.error) return loadingBox.endOut();
            return api.postWithToken('csrf', {
                action: 'edit',
                format: 'json',
                title: mw.config.get('wgPageName'),
                text: '<noinclude>{{即将删除' + reasonText + '|user=' + mw.config.get("wgUserName") + '}}</noinclude>',
                summary: '移除重定向：' + reason,
                nocreate: true,
                watchlist: 'preferences'
            });
        }, loadingBox.endOut.bind(loadingBox)).then(function(d) {
            if (d.error) return loadingBox.endOut();
            loadingBox.css('color', 'green').text('打回成功！即将刷新……');
            window.setTimeout(function() {
                window.location.reload();
            }, 730);
        }, function() {alert('打回失败！');});
    }).appendTo($('<li/>', {
        attr: {
            id: 'ca-moveToUserSubpage'
        }
    }).prependTo(self));
});
