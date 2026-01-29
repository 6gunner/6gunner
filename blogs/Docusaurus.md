
主题css变量：https://docusaurus.community/knowledge/design/css/variables/



### `type: "doc"` 和 `type: "docSidebar"` 的区别

**type: "doc"**

用于链接到单个文档页面，需要通过 docId 指定具体的文档路径，适合用于独立的文档页面。比如你的例子中的 Litepaper

**type: "docSidebar"**

用于链接到一个完整的文档侧边栏分类，需要通过 sidebarId 指定侧边栏的 ID，适合用于有多个子页面的文档分类。比如你的例子中的 EXPchain 和 Expander 部分

这两种类型的配置会影响：

- 导航行为

- 侧边栏的显示方式

- URL 的路由结构

选择哪种类型主要取决于你的文档结构需求：是单个独立页面还是一组相关页面的集合。

举个例子来说：

Litepaper 可能是一个单独的文档页面，所以使用 type: "doc"

EXPchain 和 Expander 可能各自包含多个子页面（如介绍、教程、API 参考等），所以使用 type: "docSidebar" 来组织这些相关页面





高亮语法：

```
prism: {

theme: { plain: {}, styles: [] },

// https://github.com/FormidableLabs/prism-react-renderer/blob/e6d323332b0363a633407fabab47b608088e3a4d/packages/generate-prism-languages/index.ts#L9-L25

additionalLanguages: ['shell-session', 'http'],

},


```


接入全局搜索
```
// 搜索

algolia: {

appId: 'O9QSL985BS',

apiKey: 'ceb5366064b8fbf70959827cf9f69227',

indexName: 'ionicframework',

contextualSearch: true,

},
```

怎么接入广告的？

自定义plugin
```
function (context, options) {

return {

name: 'ionic-docs-ads',

async loadContent() {

const repoName = 'ionicframeworkcom';

const endpoint = prismic.getEndpoint(repoName);

const client = prismic.createClient(endpoint, {

fetch,

});

  

return await client.getByType('docs_ad');

},

async contentLoaded({ content, actions: { setGlobalData, addRoute } }) {

return setGlobalData({ prismicAds: content.results });

},

};

},
```