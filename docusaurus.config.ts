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
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    }
  },
  favicon: "favicon.svg",
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
        blog: {
          // blog作为主页
          routeBasePath: "/blog",
          path: "./blogs",
          blogTitle: "随笔记",
          postsPerPage: 'ALL',
          blogDescription:
            "随心所欲 不逾矩",
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'All posts',
          feedOptions: {
            type: "all",
            copyright: `Copyright © ${new Date().getFullYear()} coda`,
            createFeedItems: async (params) => {
              const { blogPosts, defaultCreateFeedItems, ...rest } = params;
              return defaultCreateFeedItems({
                blogPosts: blogPosts.filter((_, index) => index < 20),
                ...rest,
              });
            },
          },
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        svgr: false, // 禁用默认的 SVGR 处理
      } satisfies Preset.Options,
    ],
  ],
  plugins: [require.resolve("./src/plugins/webpackConfig")],
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
          "前端工程师技术博客，分享React、JavaScript、Web3、区块链、AI等技术文章和实践笔记",
      },
      {
        name: "keywords",
        content:
          "前端开发, React, TypeScript, JavaScript, Web3, 区块链, 智能合约, AI, 机器学习, 技术博客, Docusaurus",
      },
      {
        name: "author",
        content: "Coda",
      },
      {
        name: "twitter:creator",
        content: "@coda_dev",
      },
      {
        name: "twitter:image",
        content: "https://blog.codastar.me/images/og-image.png",
      },
      {
        property: "og:image",
        content: "https://blog.codastar.me/images/og-image.png",
      },
      {
        property: "og:type",
        content: "website",
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
        src: "/logo-light.svg",
        srcDark: "/logo.svg",
        href: "/nav",
      },
      items: [
        {
          label: "随笔记",
          position: "right",
          to: "/blog",
        },
        {
          label: "前端技术",
          position: "right",
          items: [
            {
              label: "基础",
              to: 'docs/前端技术/基础'
            },
            {
              type: 'html',
              value: '<hr class="dropdown-separator">',
              className: 'dropdown-separator',
            },
            {
              label: "React",
              to: 'docs/前端技术/react'
            },
            {
              type: 'html',
              value: '<hr class="dropdown-separator">',
              className: 'dropdown-separator',
            },
            {
              label: "性能优化",
              to: "docs/前端技术/性能优化",
            },
          ],
        },
        {
          label: "3D和动画",
          position: "right",
          to: "docs/3d",
        },

        {
          label: "Web3区块链",
          position: "right",
          type: "docSidebar",
          sidebarId: "Web3", // 通过 sidebarId 指定侧边栏
        },
        {
          label: "AI",
          position: "right",
          items: [
            {
              label: "sse",
              to: "docs/ai/base/sse",
            },
            {
              label: "http-streamable",
              to: "docs/ai/base/httpstreamable",
            },
            {
              type: 'html',
              value: '<hr class="dropdown-separator">',
              className: 'dropdown-separator',
            },
            {
              label: "AI Agent",
              to: "docs/ai/agent",
            },
          ],
        },
        {
          label: "跨平台",
          position: "right",
          type: "docSidebar",
          sidebarId: "跨平台",
        },
        {
          label: "Resume",
          position: "left",
          href: "https://www.codastar.me/",
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
    giscus: {
      repo: '6gunner/6gunner',
      repoId: 'R_kgDOLI29sg',
      category: 'Announcements',
      categoryId: 'DIC_kwDOLI29ss4C1pIO',
      mapping: 'title',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      lang: 'zh-CN',
      crossorigin: 'anonymous',
      async: true,
    }
  },
};

export default config;
