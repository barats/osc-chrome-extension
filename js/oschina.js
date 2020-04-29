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
                var divContent = '<div class="item">';
                while (fullCountNode) {
                    divContent += constructListDiv(constructRssItem(fullCountNode));
                    fullCountNode = fullCountSet.iterateNext();
                }
                divContent += "</div>";
                document.getElementById(divId).innerHTML = divContent;
            } catch (error) {
                console.log('error->', error);
                setErrorLabel(divId, '数据解析错误' + error.name);
            } //end of try-catch
        } //end of if(xhr.responseXML)
    };

    xhr.onerror = function (error) {
        console.error('error->', error);
        setErrorLabel(divId, '网络错误');
    };

    xhr.open("GET", rssLink, true);
    xhr.send(null);
} //end of getOscData

function constructRssItem(xmlNode) {
    var title = xmlNode.getElementsByTagName("title")[0].firstChild.nodeValue;
    var description = xmlNode.getElementsByTagName("description")[0].firstChild.nodeValue;
    var link = xmlNode.getElementsByTagName("link")[0].firstChild.nodeValue;
    var pubDate = xmlNode.getElementsByTagName("pubDate")[0].firstChild.nodeValue;
    return new RssItem(title, description, link, pubDate);
}

function constructListDiv(item) {
    var div = '<a target="_blank" href="' + item.link + '?' + UTM_SOURCE_STR + '"><div class="title">' + item.title + '</div></a>';
    div += '<div class="description">' + item.description + '</div>';
    div += '<div class="pubDate">' + item.pubDate + '</div>';
    return div;
}

function RssItem(title, description, link, pubDate) {
    this.title = title;
    this.description = description;
    this.link = link;
    this.pubDate = new Intl.DateTimeFormat('zh-CN').format(Date.parse(pubDate));
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

    //资讯：下拉框的变化时间
    document.getElementById('news-selector').onchange = function (event) {
        document.getElementById('news-title').click();
    };

    //博客：下拉框的变化时间
    document.getElementById('blogs-selector').onchange = function (event) {
        document.getElementById('blogs-title').click();
    };

    //问答：下拉框的变化时间
    document.getElementById('questions-selector').onchange = function (event) {
        document.getElementById('questions-title').click();
    };

    //软件：下拉框的变化时间
    document.getElementById('projects-selector').onchange = function (event) {
        document.getElementById('projects-title').click();
    };
});