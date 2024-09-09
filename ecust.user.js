// ==UserScript==
// @name         [ECUST] 华东理工 旧版学习通 全自动刷课
// @namespace    ddin
// @version      0.4.2
// @author       gpt-4-turbo
// @description  华东理工旧版超星学习通专刷（高数线代大物） mooc.s.ecust.edu.cn
// @license      Unlicense
// @icon         https://s.ecust.edu.cn/favicon.ico
// @match        *://mooc.s.ecust.edu.cn/*
// @match        *://mooc1.chaoxing.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/vue/3.2.36/vue.global.prod.js
// @require      https://cdn.bootcdn.net/ajax/libs/vue-demi/0.14.0/index.iife.js
// @require      data:application/javascript,window.Vue%3DVue%3B
// @require      https://cdn.bootcdn.net/ajax/libs/element-plus/2.3.4/index.full.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/pinia/2.0.35/pinia.iife.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/rxjs/7.8.0/rxjs.umd.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/blueimp-md5/2.19.0/js/md5.min.js
// @require      https://update.greasyfork.org/scripts/488083.user.js
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
// ==/UserScript==

(() => {
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
    localStorage.setItem("autoReturnDelay", 60000);
  }
  if (localStorage.getItem("autoManageMode") === null) {
    localStorage.setItem("autoManageMode", "0");
  }
  if (localStorage.getItem("courseSelectionMode") === null) {
    localStorage.setItem("courseSelectionMode", "0");
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
        localStorage.setItem("autoManageMode", "0");
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
  // 其他函数定义...
  function isLoggedIn() {
    // 查找页面上是否有特定的“退出登录”链接
    const logoutLink = document.querySelector('a[href="#"][onclick="logout()"]');
    return logoutLink !== null;
  }
  function clickTargetElement() {
    // 如果未登录，则显示提示并停止自动点击
    if (!isLoggedIn()) {
      alert("未登录，请先登录！");
      clearInterval(clickInterval); // 停止setInterval循环
      return;
    }
    // 寻找ID为"clazzApplyBtn"的a标签
    const clazzApplyBtn = document.getElementById("clazzApplyBtn");
    if (clazzApplyBtn && clazzApplyBtn.tagName.toUpperCase() === "A") {
      clazzApplyBtn.click();
      console.log("已点击: clazzApplyBtn");
    }
    // 寻找ID为"iboxAlertOk-confirm"的a标签
    const iboxAlertOkConfirm = document.getElementById("iboxAlertOk-confirm");
    if (iboxAlertOkConfirm && iboxAlertOkConfirm.tagName.toUpperCase() === "A") {
      iboxAlertOkConfirm.click();
      console.log("已点击: iboxAlertOk-confirm");
    }
  }
  function setChapterToCheck(value) {
    localStorage.setItem("chapterToCheck", value);
    console.log(`Chapter to check has been set to: ${value}`);
  }
  function setAutoReturnDelay(value) {
    localStorage.setItem("autoReturnDelay", value);
    console.log(`Auto return delay has been set to: ${value}`);
  }
  function clickTargetH3() {
    const spans = document.querySelectorAll("span.articlename");
    spans.forEach((span) => {
      // 查找该span元素下的所有a元素
      const links = span.querySelectorAll("a");
      links.forEach((link) => {
        const originalHref = link.href; // 获取原始href
        if (!originalHref.includes("&mooc2=1")) {
          // 检查是否已包含&mooc2=1
          link.href = `${originalHref}&mooc2=1`; // 添加参数
        }
      });
    });
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
  function getChapterId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("chapterId");
  }
  // 构建新的URL并跳转
  function navigateToNewChapterId(chapterId) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("chapterId", chapterId);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    const a = document.createElement("a");
    a.href = newUrl;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
  }
  function modifyTags() {
    // Select all h4 and h5 elements
    const tags = document.querySelectorAll("h4, h5");

    tags.forEach((tag) => {
      // Find the first span and a elements within the tag
      const firstSpan = tag.querySelector("span");
      const firstA = tag.querySelector("a");

      if (firstSpan && firstA) {
        // Get the onclick attribute from the span
        const onclickAttr = firstSpan.getAttribute("onclick");

        if (onclickAttr) {
          // Set the onclick attribute to the a tag and remove the href attribute
          firstA.setAttribute("onclick", onclickAttr);
          firstA.removeAttribute("href");
        }
      }
    });
  }
  function hideElements() {
    // 隐藏具有特定data-v-app属性的<div>
    let targetElementVApp = document.querySelector('div[data-v-app=""]');
    if (targetElementVApp) {
      targetElementVApp.style.display = "none";
    }
  }
  window.onload = () => {
    const consoleScript = `window.addEventListener("mouseout",t=>{t.stopImmediatePropagation(),t.stopPropagation(),t.preventDefault()},!0);`;
    // 运行控制台脚本
    const runConsoleScript = () => {
      const script = document.createElement("script");
      script.textContent = consoleScript;
      document.head.appendChild(script);
      script.remove();
    };
    runConsoleScript();

    if (window === window.top) {
      setInterval(hideElements, 1000);
      setInterval(modifyTags, 1000);
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
      confirmButtonChapter.textContent = "设置终止";
      confirmButtonChapter.onclick = () => {
        let inputValue = document.getElementById("chapterInput").value;
        if (inputValue.trim() !== "") {
          setChapterToCheck(inputValue);
          console.log(`Chapter to check has been updated to: ${inputValue}`);
        } else {
          alert("输入错误");
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
      confirmButtonDelay.textContent = "设置延时";
      confirmButtonDelay.onclick = () => {
        let inputValue = document.getElementById("delayInput").value;
        if (inputValue.trim() !== "") {
          setAutoReturnDelay(inputValue);
          console.log(`Auto return delay has been updated to: ${inputValue} seconds`);
        } else {
          alert("输入错误");
        }
      };
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
        //alert(`全自动托管模式已${autoManageSwitch.checked ? "启用" : "禁用"}`);
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
        //alert("所有设置已重置");
        window.location.reload(); // 重载页面以反映重置后的状态
      };
      // 创建选课模式开关
      let courseSelectionSwitch = document.createElement("input");
      courseSelectionSwitch.setAttribute("type", "checkbox");
      courseSelectionSwitch.id = "courseSelectionSwitch";
      let storedCourseSelectionMode = localStorage.getItem("courseSelectionMode");
      courseSelectionSwitch.checked = storedCourseSelectionMode === "1"; // 如果存储值为1，则选中
      // 创建选课模式标签
      let courseSelectionLabel = document.createElement("label");
      courseSelectionLabel.setAttribute("for", "courseSelectionSwitch");
      courseSelectionLabel.textContent = "选课模式";
      // 为开关添加事件监听器
      courseSelectionSwitch.onchange = () => {
        localStorage.setItem("courseSelectionMode", courseSelectionSwitch.checked ? "1" : "0");
        //alert(`选课模式已${courseSelectionSwitch.checked ? "启用" : "禁用"}`);
        window.location.reload();
      };
      containerDiv.style.padding = "20px";
      containerDiv.style.marginBottom = "20px";
      containerDiv.style.backgroundColor = "#ffffff";
      containerDiv.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
      containerDiv.style.borderRadius = "8px";
      containerDiv.style.textAlign = "center";
      const baseInputStyle = "margin: 5px; padding: 10px; width: 80%; max-width: 300px; border-radius: 4px; border: 1px solid #ccc;";
      const baseButtonStyle = "cursor: pointer; margin: 5px; padding: 10px 15px; border: none; border-radius: 4px; background-color: #007bff; color: white;";
      inputFieldChapter.style = baseInputStyle;
      confirmButtonChapter.style = baseButtonStyle;
      confirmButtonChapter.onmouseover = () => (confirmButtonChapter.style.backgroundColor = "#0056b3"); // Hover效果
      confirmButtonChapter.onmouseleave = () => (confirmButtonChapter.style.backgroundColor = "#007bff"); // 鼠标离开时恢复颜色
      inputFieldDelay.style = baseInputStyle;
      confirmButtonDelay.style = baseButtonStyle;
      confirmButtonDelay.onmouseover = () => (confirmButtonDelay.style.backgroundColor = "#0056b3");
      confirmButtonDelay.onmouseleave = () => (confirmButtonDelay.style.backgroundColor = "#007bff");
      // 自动托管模式开关样式调整
      autoManageSwitch.style = "margin: 10px; cursor: pointer;";
      // 自动托管模式标签样式调整
      autoManageLabel.style = "color: #333; font-size: 14px;";
      // 选课模式开关样式调整
      courseSelectionSwitch.style = "margin: 10px; cursor: pointer;";
      // 选课模式标签样式调整
      courseSelectionLabel.style = "color: #333; font-size: 14px;";
      // 重置按钮样式调整
      resetButton.style = "cursor: pointer; margin-top: 20px; padding: 10px 15px; border: none; border-radius: 4px; background-color: #dc3545; color: white;";
      resetButton.onmouseover = () => (resetButton.style.backgroundColor = "#c82333"); // Hover效果
      resetButton.onmouseleave = () => (resetButton.style.backgroundColor = "#dc3545"); // 鼠标离开时恢复颜色
      // 将新创建的元素添加到容器div中
      if (window.location.href.indexOf("https://mooc.s.ecust.edu.cn/course/") === 0) {
        containerDiv.appendChild(document.createElement("br"));
        containerDiv.appendChild(courseSelectionSwitch);
        containerDiv.appendChild(courseSelectionLabel);
      } else {
        // 将元素添加到容器div中
        containerDiv.appendChild(inputFieldChapter);
        containerDiv.appendChild(confirmButtonChapter);
        containerDiv.appendChild(document.createElement("br")); // 添加换行，美观分隔
        containerDiv.appendChild(inputFieldDelay);
        containerDiv.appendChild(confirmButtonDelay);
        // 将新创建的元素添加到容器div中
        containerDiv.appendChild(document.createElement("br"));
        containerDiv.appendChild(autoManageSwitch);
        containerDiv.appendChild(autoManageLabel);
        containerDiv.appendChild(document.createElement("br"));
        containerDiv.appendChild(resetButton);
        // 将容器div添加到body的最开始的位置
      }
      document.body.insertBefore(containerDiv, document.body.firstChild);
    }

    if (localStorage.getItem("autoManageMode") === "1") {
      timer1 = setInterval(checkLessons, 1000);
      timer2 = setInterval(clickTargetH3, 1000);
    } else if (localStorage.getItem("courseSelectionMode") === "1") {
      const clickInterval = setInterval(clickTargetElement, 100);
    }
  };
})();
