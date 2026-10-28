const Parser = require('rss‑parser');
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
      feed.items.slice(0,7).forEach(item=>{
        newsList.push({
          title: item.title,
          link: item.link,
          date: item.pubDate || "",
          source: src.name
        })
      })
    } catch(err){
      console.error(`源【${src.name}】抓取失败：`, err.message);
    }
  }
  // 按时间倒序，最多保留12条
  newsList.sort((a,b)=>new Date(b.date)‑new Date(a.date));
  return newsList.slice(0,12);
}

async function main(){
  const news = await fetchNews();
  const output = {
    updateTime: new Date().toLocaleString("zh‑CN"),
    news
  };
  fs.writeFileSync("./data.json", JSON.stringify(output,null,2), "utf‑8");
  console.log("输出data.json完成");
}

main().catch(err=>{
  console.error("整体异常",err);
  // 兜底输出空结构，保证页面不会崩溃
  fs.writeFileSync("./data.json", JSON.stringify({updateTime:new Date().toLocaleString("zh‑CN"),news:[]},null,2),"utf‑8");
})

