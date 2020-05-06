function getRssData(rssLink, divId) {

    var xhr = new XMLHttpRequest();

    setLoadingLabel(divId);

    xhr.onreadystatechange = function () {

        if (xhr.readyState != 4) {
            return;
        }

        if (xhr.responseXML) {
            var xmlDoc = xhr.responseXML;
            var fullCountSet = xmlDoc.evaluate("//channel/item", xmlDoc, createNSResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

            try {
                var fullCountNode = fullCountSet.iterateNext();
                var divContent = '';
                while (fullCountNode) {
                    divContent += constructListDiv(constructRssItem(fullCountNode));
                    fullCountNode = fullCountSet.iterateNext();
                }
                if (divContent) {
                    document.getElementById(divId).innerHTML = divContent;
                }
            } catch (error) {
                console.log('error->', error);
                setErrorLabel(divId, '数据解析错误');
            } //end of try-catch
        } //end of if(xhr.responseXML)
    };

    xhr.onerror = function (error) {
        console.error('error->', error);
        setErrorLabel(divId, '网络错误');
    };

    xhr.open("GET", rssLink, true);
    xhr.send(null);
} //end of function getRssData()

function constructRssItem(xmlNode) {
    var title = xmlNode.getElementsByTagName("title")[0].firstChild.nodeValue;
    var description = xmlNode.getElementsByTagName("description")[0].firstChild.nodeValue;
    var link = xmlNode.getElementsByTagName("link")[0].firstChild.nodeValue;
    var pubDate = xmlNode.getElementsByTagName("pubDate")[0].firstChild.nodeValue;
    var guid = xmlNode.getElementsByTagName("guid")[0].firstChild.nodeValue;
    return new RssItem(title, description, link, pubDate, guid);
}

function constructListDiv(item) {
    var div = '<div class="item"><a target="_blank" href="' + item.link + '?' + UTM_SOURCE_STR + '">';
    div += '<div class="title">' + stripHtml(item.title) + '</div></a>';
    div += '<div class="heart" data-title="' + stripHtml(item.title) + '" data-link="' + item.link + '">❤</div>';
    div += '<div class="description">' + stripHtml(item.description) + '</div>';
    div += '<div class="pubDate">' + item.pubDate + '</div></div>';
    return div;
}

function RssItem(title, description, link, pubDate, guid) {
    this.title = title;
    this.description = description;
    this.link = link;
    this.pubDate = new Intl.DateTimeFormat('zh-CN').format(Date.parse(pubDate));
    this.guid = guid;
}

function createNSResolver(xmlDoc) {
    return xmlDoc.createNSResolver(xmlDoc.ownerDocument == null ? xmlDoc.documentElement : xmlDoc.ownerDocument.documentElement);
}

function setLoadingLabel(divId) {
    document.getElementById(divId).innerHTML = '<p style="text-align:center;font-size:20px">Loading ... </p>';
}

function setErrorLabel(divId, error) {
    document.getElementById(divId).innerHTML = '<p style="color:red;text-align:center;font-size:22px">Error (' + error + ') </p>';
}

// 创建书签到书签栏最前端,不传 url 即为创建文件夹
function createBookmark(title = OSC_BOOKMARKS_NAME, parentId = '1', url = '') {
    return new Promise(function (resolve) {
        let prams = {
            parentId: parentId,
            index: 0,
            title: title
        };

        if (url) {
            prams.url = url;
        }

        chrome.bookmarks.create(prams, (bookmarkData) => {
            resolve(bookmarkData);
        });
    });

}
// 查找书签文件夹 ,并返回文件夹信息,如果已创建则直接返回文件夹信息
function searchBookmarksFolder() {
    return new Promise(function (resolve) {
        // 查找名含 OSC_BOOKMARKS_NAME 的书签
        chrome.bookmarks.search(OSC_BOOKMARKS_NAME, (searchResult) => {
            const isIncludeBookmark = Array.isArray(searchResult) && searchResult.length > 0;
            if (isIncludeBookmark) {
                // 存在名为 OSC_BOOKMARKS_NAME 的书签文件夹: title相同 且 不存在url属性
                let index = searchResult.findIndex((item) => item.title == OSC_BOOKMARKS_NAME && !item.url)
                if (index > -1) {
                    resolve(searchResult[index])
                } else {
                    createBookmark().then((bookmarkData) => {
                        resolve(bookmarkData);
                    })
                }
            } else {
                // 不存在任何包含 OSC_BOOKMARKS_NAME 的书签或文件夹
                createBookmark().then((bookmarkData) => {
                    resolve(bookmarkData);
                })
            } //end of if-else
        }); //end of Promise()
    }); //end of function searchBookmarksFolder
}

////////////////// 页面上的各类时间点击  ///////////////////////

document.addEventListener('DOMContentLoaded', function () {

    // DOM内容加载完成之后，开始获取数据并展示
    getRssData(RSS_NEWS, 'news-list'); //最新资讯
    getRssData(RSS_QUESTIONS_PREFIX + "1", 'questions-list'); //最新发布问答
    getRssData(RSS_RECOMM_BLOGS, 'blogs-list'); //最新推荐博客
    getRssData(RSS_PROJECTS, 'projects-list'); //最新收录开源软件

    // //下载源码按钮点击事件
    document.getElementById('btn-download').onclick = function () {
        chrome.tabs.create({
            'url': GITEE_REPO_URL
        });
    };

    //搜索按钮点击事件
    document.getElementById('btn-search').onclick = function () {
        var txtSearch = document.getElementById('txt-search').value;
        if (txtSearch) {
            var query = encodeURIComponent(txtSearch);
            chrome.tabs.create({
                'url': OSC_SEARCH_PREFIX + query + '&' + UTM_SOURCE_STR
            });
        } //end of if
    };

    //搜索输入框中的回车事件
    document.getElementById('txt-search').onkeydown = function (event) {
        if (event.keyCode == 13) {
            document.getElementById('btn-search').click();
        }
    };


    //标题「开源资讯」的点击事件
    document.getElementById('news-title').onclick = function (event) {
        var selectedValue = document.getElementById('news-selector').value;
        if (selectedValue) {
            setLoadingLabel('news-list');
            if (selectedValue == 'all') {
                getRssData(RSS_NEWS, 'news-list');
            } else {
                getRssData(RSS_NEWS_PREFIX + selectedValue, 'news-list');
            }
        }
    };

    //标题「推荐博客」的点击事件
    document.getElementById('blogs-title').onclick = function (event) {
        var selectedValue = document.getElementById('blogs-selector').value;
        if (selectedValue) {
            setLoadingLabel('blogs-list');
            if (selectedValue == 'all') {
                getRssData(RSS_RECOMM_BLOGS, 'blogs-list');
            } else {
                getRssData(RSS_RECOMM_BLOGS_CATEGORY_PREFIX + selectedValue, 'blogs-list');
            }
        }
    };

    //标题「开源软件」的点击事件
    document.getElementById('projects-title').onclick = function (event) {
        var selectedValue = document.getElementById('projects-selector').value;
        if (selectedValue) {
            setLoadingLabel('projects-list');
            if (selectedValue == 'recomm') {
                getRssData(RSS_RECOMM_PROJECTS, 'projects-list');
            } else {
                getRssData(RSS_PROJECTS, 'projects-list');
            }
        }
    };

    //标题「最新问答」的点击事件
    document.getElementById('questions-title').onclick = function (event) {
        var selectedValue = document.getElementById('questions-selector').value;
        if (selectedValue) {
            setLoadingLabel('questions-list');
            getRssData(RSS_QUESTIONS_PREFIX + selectedValue, 'questions-list');
        }
    };

    //资讯：下拉框的变化事件
    document.getElementById('news-selector').onchange = function (event) {
        document.getElementById('news-title').click();
    };

    //博客：下拉框的变化事件
    document.getElementById('blogs-selector').onchange = function (event) {
        document.getElementById('blogs-title').click();
    };

    //问答：下拉框的变化事件
    document.getElementById('questions-selector').onchange = function (event) {
        document.getElementById('questions-title').click();
    };

    //软件：下拉框的变化事件
    document.getElementById('projects-selector').onchange = function (event) {
        document.getElementById('projects-title').click();
    };

    //收藏：心形图标点击事件
    // 各个list列表容器。数据未加载 ,dom未生成,不能绑定在.heart元素上
    const arrListContainer = [...document.querySelectorAll("#news-list,#blogs-list,#projects-list,#questions-list")];
    for (let oItem of arrListContainer) {
        oItem.addEventListener('click', (event) => {
            let targetDateset = event.target.dataset;
            if (event.target.className == "heart") {
                searchBookmarksFolder().then((bookmarkData) => {
                    // 创建书签 不带http或https 会抛出错误,添加http://
                    if (targetDateset.link && !/^http:\/\//.test(targetDateset.link) && !/^https:\/\//.test(targetDateset.link)) {
                        targetDateset.link = 'http://' + targetDateset.link;
                    }
                    createBookmark(targetDateset.title || '无标题', bookmarkData.id, targetDateset.link);
                });
            }
        });
    }
});