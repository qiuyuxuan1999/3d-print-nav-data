const Parser = require('rss-parser');
const axios = require('axios');
const fs = require('fs');
const parser = new Parser();

const rssSources = [
  { name: "南极熊3D打印", url: "https://www.nanjixiong.com/rss.php" },
  { name: "3D Printing Industry", url: "https://3dprintingindustry.com/feed/" }
];

async function fetchNews() {
  let newsList = [];
  for (const src of rssSources) {
    try {
      const feed = await parser.parseURL(src.url);
      feed.items.slice(0, 6).forEach(item => {
        newsList.push({
          title: item.title,
          link: item.link,
          date: item.pubDate || new Date().toISOString(),
          source: src.name
        });
      });
    } catch (e) {
      console.error(src.name, "抓取失败", e.message);
    }
  }
  newsList.sort((a, b) => new Date(b.date) - new Date(a.date));
  return newsList.slice(0, 10);
}

async function fetchBilibiliHot() {
  // B站官方搜索接口，搜索关键词：3D打印
  const res = await axios.get("https://api.bilibili.com/x/web-interface/search/type", {
    params: {
      search_type: "video",
      keyword: "3D打印",
      order: "click",
      duration: 0
    },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });
  const data = res.data?.data?.result || [];
  return data.slice(0,8).map(v => ({
    title: v.title,
    link: `https://www.bilibili.com/video/${v.bvid}`,
    cover: v.pic,
    author: v.author,
    play: v.play
  }));
}

async function main() {
  const [news, videos] = await Promise.all([fetchNews(), fetchBilibiliHot()]);
  const out = {
    updateTime: new Date().toLocaleString("zh-CN"),
    news,
    videos
  };
  fs.writeFileSync("./data.json", JSON.stringify(out, null, 2), "utf-8");
  console.log("写入data.json完成");
}

main().catch(e=>{
  console.error(e);
  // 失败兜底，生成空结构防止页面报错
  fs.writeFileSync("./data.json", JSON.stringify({updateTime:new Date().toLocaleString("zh-CN"),news:[],videos:[]},null,2));
})
