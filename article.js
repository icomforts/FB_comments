var post, data;
var port = chrome.runtime.connect({ name: "資料" });
console.log("抓圖文");
port.postMessage({ msg: null });

//檢查物件是否存在
const checkElement = async(selector) => {
    console.log(document.querySelectorAll(selector).length);
    while (document.querySelectorAll(selector).length <= 0) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return document.querySelectorAll(selector);
};

setTimeout(() => {
    let feed = document.querySelectorAll('div[role="feed"]');
    if (feed.length > 0) {
        console.log("有其他貼文");
        feed[0].remove();
        getCommentBtn();
    } else {
        console.log("沒有其他貼文");
        getCommentBtn();
    }
}, 5000);
const getCommentBtn = () => {
    checkElement('div[role="button"] span').then((res) => {
        console.log(res);
        let commentBtn = Array.from(res).find(
            (el) =>
            el.innerText.includes("最新") ||
            el.innerText.includes("最舊") ||
            el.innerText.includes("最相關") ||
            el.innerText.includes("所有留言")
        );
        commentBtn.click();
        setTimeout(() => {
            changeType();
        }, 2000);
    });
};
const changeType = () => {
    let commentBtnAll = checkElement('div[role="menuitem"]');
    commentBtnAll.then((res2) => {
        res2[2].click();
        setTimeout(() => {
            clickMoreCommentBtn();
        }, 2000);
    });
};
const clickMoreCommentBtn = () => {
    checkElement('div[role="button"] > span > span').then((res) => {
        let commentBtn = Array.from(res).find(
            (el) => el.innerText.includes("檢視") || el.innerText.includes("查看")
        );
        if (commentBtn) commentBtn.click();

        setTimeout(() => {
            clickChildCommentBtn();
        }, 2000);
    });
};

const clickChildCommentBtn = () => {
    checkElement('div[role="button"] > span > span').then((res) => {
        Array.from(res).forEach((el) => {
            if (el.innerText.includes("則回覆")) {
                el.click();
            }
        });
    });
    checkComment();
};
const checkComment = () => {
    let commentBtn = Array.from(
        document.querySelectorAll('div[role="button"] > span > span')
    ).find(
        (el) => el.innerText.includes("檢視") || el.innerText.includes("查看")
    );
    if (commentBtn) {
        clickMoreCommentBtn();
    } else {
        setTimeout(() => {
            getComments();
        }, 2000);
    }
};
const getComments = () => {
    let comments = document.querySelectorAll(
        `div[role="article"][tabindex="-1"]`
    );
    console.log(comments);
    data = { comments: [] };
    for (let i = 0; i < comments.length; i++) {
        let obj = {
            author: {},
        };
        // 連結
        // obj.facebook_url =
        //     comments[i].childNodes[0].childNodes[0].childNodes[0].href;
        // 照片
        obj.author.avatar =
            comments[
                i
            ].childNodes[0].children[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].attributes[5].textContent;
        // 姓名
        if (comments[i].getAttribute("aria-label").includes("回覆")) {
            obj.author.name = comments[i].getAttribute("aria-label").split("回覆")[0];
        } else {
            obj.author.name = comments[i]
                .getAttribute("aria-label")
                .split("的留言")[0];
        }
        //時間
        if (
            comments[i].children[1].childNodes[
                comments[i].children[1].childNodes.length - 1
            ].childNodes[
                comments[i].children[1].childNodes[
                    comments[i].children[1].childNodes.length - 1
                ].childNodes.length - 1
            ].innerText.includes("已")
        ) {
            obj.created_time =
                comments[i].children[1].childNodes[
                    comments[i].children[1].childNodes.length - 1
                ].childNodes[
                    comments[i].children[1].childNodes[
                        comments[i].children[1].childNodes.length - 1
                    ].childNodes.length - 2
                ].innerText.slice(3);
        } else {
            obj.created_time =
                comments[i].children[1].childNodes[
                    comments[i].children[1].childNodes.length - 1
                ].childNodes[
                    comments[i].children[1].childNodes[
                        comments[i].children[1].childNodes.length - 1
                    ].childNodes.length - 1
                ].innerText.slice(3);
        }
        // 留言

        if (comments[i].childNodes[1].childNodes.length == 3) {
            if (
                comments[i].childNodes[1].childNodes[1].childNodes[0].children[0]
                .childNodes[0].ariaLabel === null
            ) {
                if (
                    comments[i].childNodes[1].childNodes[0].children[0].childNodes[0]
                    .childNodes[0].childNodes.length < 2
                ) {
                    obj.ctx =
                        comments[
                            i
                        ].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].getAttribute(
                            "src"
                        );
                } else {
                    // 頭號粉絲只貼圖
                    if (
                        comments[i].childNodes[1].childNodes[0].children[0].childNodes[0]
                        .childNodes[0].lastChild.innerText == obj.name
                    ) {
                        // obj.ctx = "只有貼圖或圖";
                        obj.ctx = "";
                    } else {
                        obj.ctx =
                            comments[
                                i
                            ].childNodes[1].childNodes[0].children[0].childNodes[0].childNodes[0].lastChild.innerText;
                    }
                }
            } else {
                if (
                    comments[i].childNodes[1].childNodes[0].children[0].childNodes[0]
                    .childNodes[0].lastChild.innerText == obj.name
                ) {
                    // obj.ctx = "只有貼圖";
                    obj.ctx = "";
                } else {
                    obj.ctx =
                        comments[
                            i
                        ].childNodes[1].childNodes[0].children[0].childNodes[0].childNodes[0].lastChild.innerText;
                }
            }
        }
        if (comments[i].childNodes[1].childNodes.length == 2) {
            if (
                comments[i].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                .childNodes[0].childNodes[0].childNodes[0].childNodes[1].innerText
                .length == 0
            ) {
                obj.ctx =
                    comments[
                        i
                    ].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].children[
                        comments[i].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes[0].childNodes[0].childNodes[0].childNodes.length - 1
                    ].innerHTML;
            } else {
                obj.ctx =
                    comments[
                        i
                    ].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[
                        comments[i].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
                        .childNodes[0].childNodes[0].childNodes[0].childNodes.length - 1
                    ].innerText;
            }
        }
        // 心情數
        if (
            comments[i].childNodes[1].childNodes[0].childNodes[0].childNodes[0]
            .childNodes.length == 2
        ) {
            obj.likes =
                comments[
                    i
                ].children[1].childNodes[0].childNodes[0].childNodes[0].childNodes[1].innerText;
        } else {
            obj.likes = "";
        }

        data.comments.push(obj);

        console.log(obj);
    }
    console.log(data);
    port.postMessage({ msg: data });
};
port.onMessage.addListener(function(response) {
    console.log(response);
});