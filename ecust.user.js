// ==UserScript==
// @name         [ECUST] 华东理工 旧版学习通 全自动刷课
// @namespace    ddin
// @version      0.1.3
// @author       gpt-4-0125-preview
// @description  华东理工旧版超星学习通专刷（高数线代大物） mooc.s.ecust.edu.cn
// @license      Unlicense
// @icon         https://s.ecust.edu.cn/favicon.ico
// @match        *://mooc.s.ecust.edu.cn/*
// @require      https://cdn.bootcdn.net/ajax/libs/vue/3.2.36/vue.global.prod.js
// @require      https://cdn.bootcdn.net/ajax/libs/vue-demi/0.14.0/index.iife.js
// @require      data:application/javascript,window.Vue%3DVue%3B
// @require      https://cdn.bootcdn.net/ajax/libs/element-plus/2.3.4/index.full.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/pinia/2.0.35/pinia.iife.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/rxjs/7.8.0/rxjs.umd.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/blueimp-md5/2.19.0/js/md5.min.js
// @require      https://update.greasyfork.org/scripts/488962.user.js
// @resource     ElementPlus  https://cdn.bootcdn.net/ajax/libs/element-plus/2.3.4/index.css
// @resource     ttf          https://www.forestpolice.org/ttf/2.0/table.json
// @connect      www.tiku.me
// @connect      cx.icodef.com
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// @antifeature  ads      公众号或者app辅助答题
// @antifeature  payment  付费答题
// ==/UserScript==

(() => {
  const consoleScript = `window.addEventListener("mouseout",t=>{t.stopImmediatePropagation(),t.stopPropagation(),t.preventDefault()},!0);`;
  // 运行控制台脚本
  const runConsoleScript = () => {
    const script = document.createElement("script");
    script.textContent = consoleScript;
    document.head.appendChild(script);
    script.remove();
  };
  runConsoleScript();
  let timer1;
  let timer2;
  let initialJobCount = null;
  if (localStorage.getItem("scriptRunCounter") === null) {
    localStorage.setItem("scriptRunCounter", 0);
  }
  if (localStorage.getItem("chapterToCheck") === null) {
    localStorage.setItem("chapterToCheck", "不自动停止");
  }
  if (localStorage.getItem("autoReturnDelay") === null) {
    localStorage.setItem("autoReturnDelay", 100);
  }
  if (localStorage.getItem("autoManageMode") === null) {
    localStorage.setItem("autoManageMode", "0");
  }
  function checkLessons() {
    let currents = document.querySelectorAll(".currents");
    // 只在初始JobCount未设置时检查并设置它
    if (initialJobCount === null) {
      const initialSpan = document.querySelector(".currents .roundpointStudent.orange01.a002.jobCount");
      if (initialSpan) {
        initialJobCount = parseInt(initialSpan.textContent, 10); // 将初始的数字存储起来
      }
    }
    let chapterToCheck = localStorage.getItem("chapterToCheck");
    for (let i = 0; i < currents.length; i++) {
      let hideChapterNumber = currents[i].querySelector(".hideChapterNumber");
      if (hideChapterNumber && hideChapterNumber.textContent.trim() === chapterToCheck) {
        console.log(`Chapter number ${chapterToCheck} found, exiting.`);
        clearInterval(timer1);
        clearInterval(timer2);
        setChapterToCheck("不自动停止"); // 假设这是正确设置下一章节的方式
        window.location.href = "about:blank";
        return; // 防止继续执行后续代码
      }
      if (currents[i].querySelector(".roundpointStudent.blue") || currents[i].querySelector(".roundpoint.blue")) {
        clearInterval(timer1);
        clearInterval(timer2);
        // 假设goback()是正确的“返回”操作
        const delay = parseInt(localStorage.getItem("autoReturnDelay"), 10) || 0;
        setTimeout(() => {
          goback();
        }, delay);
        break;
      }
      // 检查是否存在并且数值是否减小
      const currentSpan = currents[i].querySelector(".roundpointStudent.orange01.a002.jobCount");
      // 假设initialJobCount, timer1, 和timer2 在适当的作用域中已经定义
      if (currentSpan) {
        const currentJobCount = parseInt(currentSpan.textContent, 10);
        if (initialJobCount !== null && currentJobCount < initialJobCount) {
          // 停止其他定时代码
          clearInterval(timer1);
          clearInterval(timer2);
          // 获取延时设置（以毫秒为单位）
          const delay = parseInt(localStorage.getItem("autoReturnDelay"), 10) || 0; // 如果没有设置，默认为0
          // 延时后刷新页面
          setTimeout(() => {
            location.reload();
          }, delay);
          return; // 退出函数，不再继续检查
        }
      } else if (initialJobCount !== null) {
        clearInterval(timer1);
        clearInterval(timer2);
        const delay = parseInt(localStorage.getItem("autoReturnDelay"), 10) || 0;
        setTimeout(() => {
          location.reload();
        }, delay);
        return;
      }
    }
  }
  window.onload = () => {
    if (window === window.top) {
      let counter = parseInt(localStorage.getItem("scriptRunCounter"), 10) || 0;
      counter++;
      localStorage.setItem("scriptRunCounter", counter);
      let titleElement = document.querySelector("h1");
      if (titleElement) {
        titleElement.innerText = `程序运行中 <${counter}> - ${titleElement.innerText}`;
      }
      // 创建一个容器div
      let containerDiv = document.createElement("div");
      containerDiv.style.padding = "10px";
      containerDiv.style.backgroundColor = "#f0f0f0";
      containerDiv.style.textAlign = "center";
      // 创建章节检查输入框
      let inputFieldChapter = document.createElement("input");
      inputFieldChapter.setAttribute("type", "text");
      inputFieldChapter.setAttribute("placeholder", "输入自动停止的章节号 如1.3");
      inputFieldChapter.id = "chapterInput";
      let storedChapter = localStorage.getItem("chapterToCheck");
      if (storedChapter) {
        inputFieldChapter.value = storedChapter;
      }
      // 创建确认按钮
      let confirmButtonChapter = document.createElement("button");
      confirmButtonChapter.textContent = "设置";
      confirmButtonChapter.onclick = () => {
        let inputValue = document.getElementById("chapterInput").value;
        if (inputValue.trim() !== "") {
          setChapterToCheck(inputValue);
          alert(`Chapter to check has been updated to: ${inputValue}`);
        } else {
          alert("Please enter a valid chapter number.");
        }
      };
      // 创建自动返回延时输入框
      let inputFieldDelay = document.createElement("input");
      inputFieldDelay.setAttribute("type", "number"); // 确保只能输入数字
      inputFieldDelay.setAttribute("placeholder", "设置自动返回延时 (ms) ");
      inputFieldDelay.id = "delayInput";
      let storedDelay = localStorage.getItem("autoReturnDelay");
      if (storedDelay) {
        inputFieldDelay.value = storedDelay;
      }
      // 创建确认按钮
      let confirmButtonDelay = document.createElement("button");
      confirmButtonDelay.textContent = "设置";
      confirmButtonDelay.onclick = () => {
        let inputValue = document.getElementById("delayInput").value;
        if (inputValue.trim() !== "") {
          setAutoReturnDelay(inputValue);
          alert(`Auto return delay has been updated to: ${inputValue} seconds`);
        } else {
          alert("Please enter a valid delay time in seconds.");
        }
      };
      // 将元素添加到容器div中
      containerDiv.appendChild(inputFieldChapter);
      containerDiv.appendChild(confirmButtonChapter);
      containerDiv.appendChild(document.createElement("br")); // 添加换行，美观分隔
      containerDiv.appendChild(inputFieldDelay);
      containerDiv.appendChild(confirmButtonDelay);
      // 创建自动托管模式开关
      let autoManageSwitch = document.createElement("input");
      autoManageSwitch.setAttribute("type", "checkbox");
      autoManageSwitch.id = "autoManageSwitch";
      let storedAutoManageMode = localStorage.getItem("autoManageMode");
      autoManageSwitch.checked = storedAutoManageMode === "1"; // 如果存储值为1，则选中
      // 创建自动托管模式标签
      let autoManageLabel = document.createElement("label");
      autoManageLabel.setAttribute("for", "autoManageSwitch");
      autoManageLabel.textContent = "全自动托管模式";
      // 为开关添加事件监听器
      autoManageSwitch.onchange = () => {
        localStorage.setItem("autoManageMode", autoManageSwitch.checked ? "1" : "0");
        alert(`全自动托管模式已${autoManageSwitch.checked ? "启用" : "禁用"}`);
        window.location.reload();
      };
      // 创建重置按钮
      let resetButton = document.createElement("button");
      resetButton.textContent = "重置程序";
      resetButton.onclick = () => {
        localStorage.removeItem("scriptRunCounter");
        localStorage.removeItem("chapterToCheck");
        localStorage.removeItem("autoReturnDelay");
        localStorage.removeItem("autoManageMode");
        alert("所有设置已重置");
        window.location.reload(); // 重载页面以反映重置后的状态
      };
      // 将新创建的元素添加到容器div中
      containerDiv.appendChild(document.createElement("br"));
      containerDiv.appendChild(autoManageSwitch);
      containerDiv.appendChild(autoManageLabel);
      containerDiv.appendChild(document.createElement("br"));
      containerDiv.appendChild(resetButton);
      // 将容器div添加到body的最开始的位置
      document.body.insertBefore(containerDiv, document.body.firstChild);
    }
  };
  // 其他函数定义...
  function setChapterToCheck(value) {
    localStorage.setItem("chapterToCheck", value);
    console.log(`Chapter to check has been set to: ${value}`);
  }
  function setAutoReturnDelay(value) {
    localStorage.setItem("autoReturnDelay", value);
    console.log(`Auto return delay has been set to: ${value}`);
  }
  function clickTargetH3() {
    let h3Elements = document.querySelectorAll("h3");
    let targetElement = null;
    for (let i = 0; i < h3Elements.length; i++) {
      if (h3Elements[i].querySelector("em.orange, em.blank")) {
        targetElement = h3Elements[i];
        break;
      }
    }
    if (targetElement) {
      let anchor = targetElement.querySelector("a");
      if (anchor) anchor.click();
    }
  }
  if (localStorage.getItem("autoManageMode") === "1") {
    timer1 = setInterval(checkLessons, 1000);
    timer2 = setInterval(clickTargetH3, 1000);
  }
})();
