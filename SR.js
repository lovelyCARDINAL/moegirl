document.body.onload = function() {
    'use strict';
    if (window.mw && !window.xzMwLoaded) {
        mw.loader.load('https://cdn.jsdelivr.net/gh/lovelyCARDINAL/moegirl@master/SS.js');
        $("<style/>").html([
            "https://cdn.jsdelivr.net/gh/lovelyCARDINAL/moegirl@master/SS.css"
        ].map(x => "@import url(\"" + x + "\");").join("\n")).appendTo($("head"));
        window.xzMwLoaded = true;
    }
};
