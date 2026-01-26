import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "dotenv/config";

const SITE_URL = process.env.SITE_URL;

const config: Config = {
  title: "Coda's Blogs",
  tagline: "Coda's Blogs",
  url: SITE_URL,
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "/public/favicon.svg",
  organizationName: "Coda",
  projectName: "codastar-blogs",
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        // 需要指定 pages 的路由路径
        pages: {
          path: "src/pages",
          routeBasePath: "/",

        },
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          exclude: ["README.md"],
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          editUrl: ({ docPath }) => {
            return `https://github.com/6gunner/6gunner/tree/master/docs/${docPath}`;
          },
        },
        // 不要blog
        // blog: {
        //   // blog作为主页
        //   routeBasePath: "/",
        //   path: "./blog",
        //   blogTitle: "前端技术博客 | 专注 React、TypeScript、AI 与性能优化",
        //   blogDescription:
        //     "",
        //   feedOptions: {
        //     type: "all",
        //     copyright: `Copyright © ${new Date().getFullYear()} coda`,
        //     createFeedItems: async (params) => {
        //       const { blogPosts, defaultCreateFeedItems, ...rest } = params;
        //       return defaultCreateFeedItems({
        //         blogPosts: blogPosts.filter((_, index) => index < 20),
        //         ...rest,
        //       });
        //     },
        //   },
        // },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        svgr: false, // 禁用默认的 SVGR 处理
      } satisfies Preset.Options,
    ],
  ],
  plugins: [require.resolve("./src/plugins/webpackConfig"), [
    '@docusaurus/plugin-ideal-image',
    {
      quality: 70,
      max: 1030, // max resized image's size.
      min: 640, // min resized image's size. if original is lower, use that size.
      steps: 2, // the max number of images generated between min and max (inclusive)
      disableInDev: false,
    }
  ]],
  stylesheets: [
    {
      href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap",
      type: "text/css",
    },
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
      type: "text/css",
      integrity:
        "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
      crossorigin: "anonymous",
    },
  ],
  themeConfig: {
    colorMode: {
      defaultMode: "dark",
    },
    docs: {
      sidebar: {
        hideable: false,
      },
    },
    blog: {
      sidebar: {
        groupByYear: false,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },
    metadata: [
      {
        name: "description",
        content:
          "探索前端性能优化、React 源码剖析与实战技巧，通过实用案例和代码演示，助你打造高效、优雅的现代 Web 应用。立即阅读，提升开发技能！",
      },
      {
        name: "keywords",
        content:
          "frontend, react, javascript, css, react, vue, typescript, docusaurus, blog, personal blog, personal website",
      },
      {
        name: "algolia-site-verification",
        content: "5FC45086DB2E4F0C",
      }
    ],
    // 开启 algolia
    algolia: {
      // The application ID provided by Algolia
      appId: 'S0JM98A7PE',
      // Public API key: it is safe to commit it
      apiKey: '95cd03e0eb0d3caad5bd23fb63d927ef',
      indexName: 'blog2',
      // Optional: see doc section below
      attributes: {
        primaryText: "hierarchy.lvl0", // the attribute to display in the hits list
        secondaryText: undefined, // the secondary attribute to display in the hits list
        tertiaryText: undefined, // the tertiary attribute to display in the hits list
        url: "", // the URL of the hit
        image: undefined // the image URL of the hit
      },
      darkMode: false,
    },
    navbar: {
      title: "Coda诗人",
      hideOnScroll: true,
      logo: {
        alt: "coda",
        src: "/logo.svg",
      },
      items: [
        {
          label: "前端技术",
          position: "right",
          to: "docs/category/前端技术",
        },
        {
          label: "3D和动画",
          position: "right",
          to: "docs/category/3D",
        },

        {
          label: "Web3区块链",
          position: "right",
          to: "docs/category/web3",
        },
        {
          label: "AI和智能化",
          position: "right",
          to: "docs/category/AI和智能化",
        },
        {
          label: "移动端和跨平台",
          position: "right",
          to: "docs/category/移动端和跨平台",
        },
        {
          label: "Others",
          position: "right",
          to: "docs/category/Others",
        },
        {
          type: "search",
          position: "right",
        },

      ],
    },
    liveCodeBlock: {
      /**
       * The position of the live playground, above or under the editor
       * Possible values: "top" | "bottom"
       */
      playgroundPosition: "bottom",
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
      defaultLanguage: "javascript",
    },
  },
  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN"],
  },
};

export default config;
