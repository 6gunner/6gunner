import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import path from "path";
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
  favicon: "/img/meta/favicon.ico",
  organizationName: "Coda",
  projectName: "codastar-blogs",
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        // 不要pages里
        // // 需要指定 pages 的路由路径；因为 blog 作为主页了
        // pages: {
        //   path: "src/pages",
        //   routeBasePath: "/pages",
        // },
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
      } satisfies Preset.Options,
    ],
  ],
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
    ],
    // 开启 algolia
    algolia: {
      // If Algolia did not provide you any appId, use 'BH4D9OD16A'
      appId: "GMKEEJO8X4",

      // Public API key: it is safe to commit it
      apiKey: "0ccd259970e3e65b1df2f83c4ddd3e8b",

      indexName: "icodex",
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
