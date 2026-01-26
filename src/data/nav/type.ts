export type NavData = {
  title: string;
  link: string;
  icon?: string;
  desc?: string;
}

export type NavCategory = {
  category: string;
  items: NavData[];
}

export const navDatas: NavCategory[] = [{
  category: "常用工具网站",
  items: [{
    title: "前端资源导航",
    link: "https://www.coda.io/@keyang/frontend-resources",
    icon: require('./images/easy-dates.png'),
    desc: "收集整理的前端开发相关的优秀资源网站导航",
  },
  {
    category: "高质量周刊与博客",
    items: [{
      title: "前端精读周刊",
      link: "",
    }]
  }]