document.body.onload = function() {
    'use strict';
    if (window.mw && !window.xzMwLoaded) {
        mw.loader.load('https://zh.moegirl.org.cn/MediaWiki:Group-sysop.js?action=raw&ctype=text/javascript');
        $("<style/>").html([
            "https://zh.moegirl.org.cn/MediaWiki:Group-sysop.css?action=raw&ctype=text/css"
        ].map(x => "@import url(\"" + x + "\");").join("\n")).appendTo($("head"));
        window.xzMwLoaded = true;
    }
};
