function getRssData(rssLink, type) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (xhr.readyState != 4) {
            return;
        }

        if (xhr.responseXML) {
            var xmlDoc = xhr.responseXML;
            var fullCountSet = xmlDoc.evaluate("//channel/item", xmlDoc, createNSResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            try {
                var fullCountNode = fullCountSet.iterateNext();
                while (fullCountNode) {
                    showRssItem(constructRssItem(fullCountNode), type);
                    fullCountNode = fullCountSet.iterateNext();
                }
            } catch (e) {
                console.log('error->', e);
            } //end of try-catch
        } //end of if(xhr.responseXML)
    };

    xhr.onerror = function (error) {
        console.error('error->', error);
        //TODO: handle error
    };

    xhr.open("GET", rssLink, true);
    xhr.send(null);
} //end of getOscData

function constructRssItem(xmlNode) {
    //console.log(xmlNode);
    var title = xmlNode.getElementsByTagName("title")[0].firstChild.nodeValue;
    var description = xmlNode.getElementsByTagName("description")[0].firstChild.nodeValue;
    var link = xmlNode.getElementsByTagName("link")[0].firstChild.nodeValue;
    var pubDate = xmlNode.getElementsByTagName("pubDate")[0].firstChild.nodeValue;
    return new RssItem(title, description, link, pubDate);
}

function showRssItem(item, type) {
    //console.log('item:' + item + " - type:" + type);
    document.getElementById(type).innerHTML += constructListDiv(item);
}

function constructListDiv(item) {
    var div = '<div class="item"><a target="blank" href="' + item.link + '?utm_source=oschina-chrome-extension"><div class="title">' + item.title + '</div></a>';
    div += '<div class="description">' + item.description + '</div>';
    div += '<div class="pubDate">' + item.pubDate + '</div></div>';
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

function getData() {
    getRssData(getLatestNewsRss(), 'newsList');
    getRssData(getLatestQuestionsRss(), 'questoinsList');
    getRssData(getRecommendBlogsRss(), 'blogsList');
    getRssData(getRecommandProjectsRss(), 'projectsList');
}

chrome.browserAction.onClicked.addListener(getData());