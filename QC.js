"use strict";
$(() => (async () => {
    if (mw.config.get("wgCanonicalSpecialPageName") !== "Contributions") {
        return;
    }
    const target = (document.querySelector('[name="target"]') || {}).value;
    if (typeof target !== "string" || target.length === 0) {
        return;
    }
    await mw.loader.using("mw.Api");
    if (!(await mw.user.getRights()).includes("noratelimit")) {
        return;
    }
    mw.loader.using("jquery.tablesorter");
    const upperFirstCase = (s) => /^[a-z]/.test(s) ? s.substring(0, 1).toUpperCase() + s.substring(1) : s;
    const api = new mw.Api();
    const p = $('<fieldset><legend>用户贡献分布</legend><p id="queryContributions">是否需要加载用户贡献分布（对编辑数量较多的用户慎重使用！）<button id="confirmQueryContributions">确认</button> <button id="cancelQueryContributions">取消</button></p></fieldset>').insertAfter("#mw-content-text > form").find("#queryContributions");
    p.find("#confirmQueryContributions").on("click", async () => {
        p.text("加载中……");
        const list = await (async () => {
            const result = [];
            const eol = Symbol();
            let uccontinue = undefined;
            while (uccontinue !== eol) {
                const _result = await api.post({
                    action: "query",
                    format: "json",
                    list: "usercontribs",
                    ucuser: target,
                    ucprop: "title|flags|patrolled",
                    uccontinue,
                    uclimit: "max",
                });
                if (_result.continue) {
                    uccontinue = _result.continue.uccontinue;
                    p[0].innerText += "…";
                } else {
                    uccontinue = eol;
                }
                result.push(..._result.query.usercontribs);
            }
            return result;
        })();
        const ns = {
            0: "",
            1: "讨论",
            2: "用户",
            3: "用户讨论",
            4: "萌娘百科",
            5: "萌娘百科讨论",
            6: "文件",
            7: "文件讨论",
            8: "mediawiki",
            9: "mediawiki讨论",
            10: "模板",
            11: "模板讨论",
            12: "帮助",
            13: "帮助讨论",
            14: "分类",
            15: "分类讨论",
            274: "widget",
            275: "widget_talk",
            710: "timedtext",
            711: "timedtext_talk",
            828: "模块",
            829: "模块讨论",
            2300: "gadget",
            2301: "gadget_talk",
            2302: "gadget_definition",
            2303: "gadget_definition_talk",
        };
        const nslist = {
            0: { count: 0, patrolled: 0, autopatrolled: 0 },
            1: { count: 0, patrolled: 0, autopatrolled: 0 },
            2: { count: 0, patrolled: 0, autopatrolled: 0 },
            3: { count: 0, patrolled: 0, autopatrolled: 0 },
            4: { count: 0, patrolled: 0, autopatrolled: 0 },
            5: { count: 0, patrolled: 0, autopatrolled: 0 },
            6: { count: 0, patrolled: 0, autopatrolled: 0 },
            7: { count: 0, patrolled: 0, autopatrolled: 0 },
            8: { count: 0, patrolled: 0, autopatrolled: 0 },
            9: { count: 0, patrolled: 0, autopatrolled: 0 },
            10: { count: 0, patrolled: 0, autopatrolled: 0 },
            11: { count: 0, patrolled: 0, autopatrolled: 0 },
            12: { count: 0, patrolled: 0, autopatrolled: 0 },
            13: { count: 0, patrolled: 0, autopatrolled: 0 },
            14: { count: 0, patrolled: 0, autopatrolled: 0 },
            15: { count: 0, patrolled: 0, autopatrolled: 0 },
            274: { count: 0, patrolled: 0, autopatrolled: 0 },
            275: { count: 0, patrolled: 0, autopatrolled: 0 },
            710: { count: 0, patrolled: 0, autopatrolled: 0 },
            711: { count: 0, patrolled: 0, autopatrolled: 0 },
            828: { count: 0, patrolled: 0, autopatrolled: 0 },
            829: { count: 0, patrolled: 0, autopatrolled: 0 },
            2300: { count: 0, patrolled: 0, autopatrolled: 0 },
            2301: { count: 0, patrolled: 0, autopatrolled: 0 },
            2302: { count: 0, patrolled: 0, autopatrolled: 0 },
            2303: { count: 0, patrolled: 0, autopatrolled: 0 },
        };
        const global = { patrolled: 0, autopatrolled: 0 };
        await mw.loader.using("jquery.tablesorter");
        const table = $('<table class="wikitable sortable"><thead><tr><th>名字空间</th><th>编辑次数</th><th>被巡查次数</th><th>被手动巡查次数</th></tr></thead><tbody></tbody></table>').find("tbody");
        list.forEach((item) => {
            nslist[item.ns].count++;
            if ("patrolled" in item) {
                nslist[item.ns].patrolled++;
                global.patrolled++;
            }
            if ("autopatrolled" in item) {
                nslist[item.ns].autopatrolled++;
                global.autopatrolled++;
            }
        });
        p.html(`该用户在本站未被删除的编辑共有${list.length}次（其中有${global.patrolled}次编辑被巡查，${global.patrolled - global.autopatrolled}次编辑被手动巡查）<sup style="color: blue;">[注：通过api编辑不会自动巡查]</sup>。按名字空间划分如下：`);
        Object.entries(nslist).filter(([, { count }]) => count > 0).sort(([a], [b]) => a - b).forEach(([nsnumber, { count, patrolled, autopatrolled }]) => table.append(`<tr><td data-sort-value="${nsnumber}">${+nsnumber === 0 ? "（主名字空间）" : upperFirstCase(ns[+nsnumber])}</td><td>${count}</td><td>${patrolled}</td><td>${patrolled - autopatrolled}</td></tr>`));
        table.closest("table").insertAfter(p).tablesorter();
    });
    p.find("#cancelQueryContributions").on("click", () => {
        p.closest("fieldset").remove();
    });
})());
