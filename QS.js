"use strict";
$(() => {
    if (!mw.config.get("wgPageName").startsWith("萌娘百科_talk:讨论版/")) {
        return;
    }
    if (mw.config.get("wgUserGroups").indexOf("patroller") === -1) {
        return;
    }
    mw.loader.load(`${mw.config.get("wgServer")}${mw.config.get("wgScriptPath")}/User:AnnAngela/js/quick-save.js/style.css?action=raw&ctype=text/css`, "text/css");
    mw.loader.using("mw.Api").then(() => {
        const container = $('<div class="AnnTools_Frame" style="display: none;"><div class="AnnTools_Frame_Head"><div class="AnnTools_Frame_Title">公共讨论页段落存档工具</div><span class="AnnTools_Frame_Close">×</span></div><div class="AnnTools_Frame_Content"><div class="AnnTools_Confirm"><div class="AnnTools_Confirm_Content">请问你是要存档这个段落吗？<br>段落标题：<span class="AnnTools_SectionTitle"></span></div><div class="AnnTools_Confirm_Yes">是呀是呀</div><div class="AnnTools_Confirm_No">并不是呢</div></div><div class="AnnTools_Info"><div class="AnnTools_ProgressBar"><div class="AnnTools_ProgressBar_Finished"></div></div>进度：<ol class="AnnTools_WorkDetail"></ol></div></div></div>').appendTo("body"),
            api = new mw.Api();
        container.on("click", (event) => {
            const target = $(event.target);
            if (target.is(".AnnTools_Frame_Close") && !target.is(".disable")) {
                container.fadeOut(370).queue(function () {
                    container.find(".AnnTools_Confirm, .AnnTools_Info, .AnnTools_ProgressBar_Finished").removeAttr("style");
                    container.find(".AnnTools_WorkDetail").empty();
                    $(this).dequeue();
                });
            } else if (target.is(".AnnTools_Confirm_Yes")) {
                container.find(".AnnTools_Confirm").fadeOut(370);
                container.find(".AnnTools_Info").fadeIn(370);
                const date = new Date();
                date.month = date.getMonth() + 1;
                if (date.month < 10) {
                    date.month = `0${date.month}`;
                }
                container.trigger("submit", date);
            } else if (target.is(".AnnTools_Confirm_No")) {
                container.fadeOut(370);
            }
        }).on("submit", async (_, date) => {
            try {
                container.trigger("update", "正在获取该段落内容");
                const hash = container.data("sectionTitle");
                const toclist = Object.fromEntries((await api.post({
                    action: "parse",
                    format: "json",
                    pageid: mw.config.get("wgArticleId"),
                    prop: "sections",
                })).parse.sections.map(({ anchor, index }) => [anchor, index]));
                if (!(hash in toclist)) {
                    throw new Error("请移除该标题内的模板后再行操作……");
                }
                container.data("section", toclist[hash]);
                const data = await new Promise((res, rej) => {
                    container.find(".AnnTools_Frame_Close").addClass("disable");
                    $.ajax({
                        url: `${mw.config.get("wgServer")}${mw.config.get("wgScriptPath")}/index.php`,
                        data: {
                            title: mw.config.get("wgPageName"),
                            action: "raw",
                            section: container.data().section,
                        },
                        success: function (_data) {
                            const data = `${_data}`;
                            const sectionText = data; /* .replace(new RegExp("^\\s*(\\={1,})" + container.data().sectionTitle + "\\1"), "$1" + container.data().sectionTitleSafe + "$1"); */
                            let sectionTitleRaw = data.match(/==(.*)==/);
                            if (sectionTitleRaw && sectionTitleRaw[1]) {
                                sectionTitleRaw = sectionTitleRaw[1];
                            } else {
                                sectionTitleRaw = container.data().sectionTitle;
                            }
                            container.trigger("success");
                            res({
                                sectionText: sectionText,
                                sectionTitleRaw: sectionTitleRaw,
                            });
                        },
                        error: function (_, textStatus) {
                            rej(textStatus);
                        },
                    });
                });
                container.trigger("update", "正在存档该段落内容");
                await api.postWithToken("csrf", {
                    action: "edit",
                    format: "json",
                    title: `${mw.config.get("wgPageName")}/存档/${date.getFullYear()}年${date.month}月`,
                    text: data.sectionText.replace(`==${data.sectionTitleRaw}==`, "").trim(),
                    section: "new",
                    tags: "快速存档讨论串|Automation tool",
                    sectiontitle: data.sectionTitleRaw,
                    summary: `快速存档讨论串：${container.data().sectionTitle}`,
                });
                container.trigger("success");
                container.trigger("update", "正在标记该段落为已存档");
                await api.postWithToken("csrf", {
                    action: "edit",
                    format: "json",
                    title: mw.config.get("wgPageName"),
                    summary: `快速存档讨论串：${container.data().sectionTitle}`,
                    text: `==${data.sectionTitleRaw}==\n` + `{{Saved|link=${mw.config.get("wgPageName")}/存档/${date.getFullYear()}年${date.month}月` + `|title=${container.data().sectionTitleSafe.replace(/\|/g, "{{!}}")}}}`,
                    section: container.data().section,
                    tags: "快速存档讨论串|Automation tool",
                });
                container.trigger("success");
                container.trigger("update", "正在检查存档页面是否带有档案馆模板");
                await new Promise((res) => {
                    $.ajax({
                        url: `${mw.config.get("wgServer")}${mw.config.get("wgScriptPath")}/index.php`,
                        data: {
                            title: `${mw.config.get("wgPageName")}/存档/${date.getFullYear()}年${date.month}月`,
                            action: "raw",
                            section: "0",
                        },
                        success: function (result) {
                            data.savePageText = `${result}`;
                            if (data.savePageText.indexOf(`${mw.config.get("wgTitle").replace(/\/.*$/, "")}页顶/档案馆}}`) !== -1) {
                                container.trigger("success", "模板存在");
                                window.setTimeout(() => {
                                    container.trigger("finish");
                                }, 730);
                            } else {
                                container.data("steps", container.data("steps") + 1);
                                container.trigger("success", "模板不存在");
                                res();
                            }
                        },
                        error: function (_, textStatus) {
                            throw new Error(textStatus);
                        },
                    });
                });
                container.trigger("update", "正在向存档页添加档案馆模板");
                await api.postWithToken("csrf", {
                    action: "edit",
                    format: "json",
                    title: `${mw.config.get("wgPageName")}/存档/${date.getFullYear()}年${date.month}月`,
                    prependtext: `{{${mw.config.get("wgTitle").replace(/\/.*$/, "")}页顶/档案馆}}\n`,
                    tags: "快速存档讨论串|Automation tool",
                    summary: "添加档案馆模板",
                });
                container.trigger("success");
                window.setTimeout(() => {
                    container.trigger("finish");
                }, 730);
            } catch (reason) {
                container.trigger("error", reason);
            }
        }).on("update", (_, text) => {
            container.find(".AnnTools_WorkDetail").append($("<li>", {
                attr: {
                    "class": "AnnTools_WorkDetail_Ongoing",
                },
                text: `${text}……`,
            }));
        }).on("success", (_, _text) => {
            const list = container.find(".AnnTools_WorkDetail");
            let text;
            if (_text) {
                text = `成功，${_text}！`;
            } else {
                text = "成功！";
            }
            list.find("li").last().append(text).toggleClass("AnnTools_WorkDetail_Ongoing AnnTools_WorkDetail_Succeed");
            container.find(".AnnTools_ProgressBar_Finished").width(`${100 * list.find("li").length / container.data().steps}%`);
        }).on("error", (_, reason) => {
            let text = "失败！";
            if (reason) {
                text += `[${reason}]`;
            }
            container.find(".AnnTools_ProgressBar").addClass("error");
            container.find(".AnnTools_WorkDetail li").last().append(text).removeClass("AnnTools_WorkDetail_Ongoing").addClass("AnnTools_WorkDetail_Failed");
            container.find(".AnnTools_Frame_Close").removeClass("disable");
        }).on("finish", () => {
            container.find(".AnnTools_WorkDetail").after('<div class="AnnTools_Notice">存档完成，即将刷新页面……</div>');
            window.setTimeout(() => {
                window.location.reload();
            }, 730);
        });
        $("#mw-content-text > .mw-parser-output > h2, #mw-content-text > .mw-parser-output > .discussionContainer > h2").each(function () {
            const self = $(this);
            const content = self.nextUntil("h2").not("h2");
            if (content.hasClass("saveNotice")) {
                return;
            }
            const section = +new mw.Uri(self.find('.mw-editsection a[href*="action=edit"][href*="section="]').attr("href")).query.section,
                sectionTitle = self.find(".mw-headline").attr("id");
            /* Array.from(self.find(".mw-headline")[0].childNodes).forEach(function (n) {
                if (n.classList && n.classList.contains("mw-headline-number")) { return; }
                sectionTitle += n.textContent.trim() + "";
            }); */
            let sectionTitleSafe = sectionTitle;
            /*.split("").map(function (c) {
                           if (c === "#") { return ""; }
                           if (/[A-Za-z0-9 \u4e00-\u9fa5]/.test(c)) { return c; }
                           return "&#" + c.charCodeAt(0) + ";";
                       }).join("");*/
            if (/_\d+$/.test(sectionTitle) && document.getElementById(sectionTitle.replace(/_\d+$/, ""))) {
                sectionTitleSafe = sectionTitleSafe.replace(/_\d+$/, "");
            }
            const href = self.find('.mw-editsection a[href*="action=edit"]').attr("href");
            const a = $("<a>");
            a.attr({ href }).prop("draggable", false).addClass("AnnTools_QuickSave").text("快速存档");
            a.on("click", () => {
                if (!container.is(":visible")) {
                    container.find(".AnnTools_SectionTitle").text(sectionTitle);
                    container.data({
                        section: section,
                        sectionTitle: sectionTitle,
                        sectionTitleSafe: sectionTitleSafe,
                        steps: 4,
                    }).fadeIn(370);
                }
                return false;
            });
            self.find(".mw-editsection-bracket").first()
                .after('<span class="mw-editsection-divider"> | </span>')
                .after(a);
            if (self.find(".AnnTools_MarkAsResolved")[0]) {
                const quicksave = self.find(".AnnTools_QuickSave");
                const divider = quicksave.next(".mw-editsection-divider");
                if (divider.length > 0) {
                    self.find(".mw-editsection .mw-editsection-bracket").first().after(divider).after(quicksave);
                }
            }
        });
    });
});
