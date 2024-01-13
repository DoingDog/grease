// ==UserScript==
// @name         智慧树带善人
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  智慧树讨论区给所有人点赞
// @match      	 *://qah5.zhihuishu.com/*
// @grant        none
// @license      Unlicense
// ==/UserScript==

(function() {
    'use strict';
    var previousHeight = document.documentElement.scrollHeight;
    var timer;
    var maxSameHeightTime = 2;
    setInterval(function() {
        var buttons = document.querySelectorAll('div.give-like:not(.active)');
        if (buttons.length > 0) {
            buttons[0].click();
        } else {
            var currentHeight = document.documentElement.scrollHeight;
            if (currentHeight === previousHeight) {
                if (!timer) {
                    timer = setTimeout(function() {
                        var buttons = document.querySelectorAll('div.give-like:not(.active)');
                        if (buttons.length == 0) {
                            scrollToTopAndExit();
                        } else {
                            clearTimeout(timer);
                            timer = null;
                        }
                    }, 2000);
                }
            } else {
                clearTimeout(timer);
                timer = null;
                previousHeight = currentHeight;
                window.scrollTo(0, document.body.scrollHeight);
            }
        }
    }, 500);
    function scrollToTopAndExit() {
        window.scrollTo(0, 0);
        var answerNum = document.querySelector('div.answer-num');
        if (answerNum) {
            var text = answerNum.textContent.trim();
            answerNum.textContent = text + "点赞完毕！谢谢你，带善人！>_<";
        }
        clearInterval();
    }
})();
