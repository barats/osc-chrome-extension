//全部资讯
const RSS_NEWS = 'https://www.oschina.net/news/rss';

//资讯：其他分类
const RSS_NEWS_PREFIX = 'https://www.oschina.net/news/rss?show=';

//问答前缀
const RSS_QUESTIONS_PREFIX = 'https://www.oschina.net/question/rss?cid=';

//开源软件：最新收录
const RSS_PROJECTS = 'https://www.oschina.net/project/rss';

//开源软件：最新推荐
const RSS_RECOMM_PROJECTS = 'https://www.oschina.net/project/rss?show=more';

//最新推荐（全部）
const RSS_RECOMM_BLOGS = 'https://www.oschina.net/blog/rss';

//博客前缀
const RSS_RECOMM_BLOGS_CATEGORY_PREFIX = 'https://www.oschina.net/blog/rss?cid=';

//UTM_SOURCE 配置
const UTM_SOURCE_STR = 'utm_source=oschina-chrome-extension';

//Gitee 仓库链接
const GITEE_REPO_URL = 'https://gitee.com/barat/osc-chrome-extension?' + UTM_SOURCE_STR;

//搜索前缀
const OSC_SEARCH_PREFIX = 'https://www.oschina.net/search?scope=all&q=';

//书签文件夹名
const OSC_BOOKMARKS_NAME = "开源中国";

function stripHtml(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
}

function stripXml(xml) {
    var doc = new DOMParser().parseFromString(xml, 'text/xml');
    return doc.body.textContent || '';
}