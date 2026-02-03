const TMDB_API_KEY = "ae39b54fe21d657c5f535174b11f8a82";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE = "https://image.tmdb.org/t/p/w500";

// =============================
// Widget Metadata
// =============================
var WidgetMetadata = {
  id: "curator-tmdb-widget",
  title: "TMDB资源",
  description: "按自己喜好的做",
  author: "curator",
  version: "1.9.1",
  requiredVersion: "0.0.1",

  modules: [
    // 1️⃣ 热门剧集
    { 
      title: "TMDB 热门剧集", 
      functionName: "tmdbPopularTV", 
      cacheDuration: 1800, 
      params: [ 
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "page", title: "页码", type: "page" }
      ] 
    },

    // 2️⃣ 热门电影
    { 
      title: "TMDB 热门电影", 
      functionName: "tmdbPopularMovies", 
      cacheDuration: 1800, 
      params: [ 
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "page", title: "页码", type: "page" }
      ] 
    },

    // 3️⃣ 高分内容
    { 
      title: "TMDB 高分内容", 
      functionName: "tmdbTopRated", 
      cacheDuration: 21600, 
      params: [ 
        { name: "type", title: "类型", type: "enumeration", enumOptions: [ 
          { title: "电影", value: "movie" }, 
          { title: "剧集", value: "tv" } 
        ], value: "movie" }, 
        { name: "language", title: "语言", type: "language", value: "zh-CN" }, 
        { name: "page", title: "页码", type: "page" } 
      ] 
    },

    // 4️⃣ 出品公司
    { 
      title: "TMDB 出品公司", 
      functionName: "tmdbDiscoverByCompany", 
      cacheDuration: 21600, 
      params: [ 
        { 
          name: "with_companies", 
          title: "出品公司", 
          type: "enumeration", 
          value: "", 
          enumOptions: [
            // 国外公司中文
            { title: "漫威", value: "420" },
            { title: "皮克斯", value: "3" },
            { title: "迪士尼", value: "2" },
            { title: "华纳兄弟", value: "174" },
            { title: "派拉蒙", value: "4" },
            { title: "环球", value: "33" },
            { title: "哥伦比亚", value: "5" },
            { title: "A24", value: "41077" },
            // 国内公司
            { title: "腾讯", value: "2007" },
            { title: "爱奇艺", value: "1330" },
            { title: "优酷", value: "1419" },
            { title: "芒果", value: "1631" },
            { title: "Bilibili", value: "1605" },
            { title: "华策影视", value: "6538" },
            { title: "光线传媒", value: "1161" },
            { title: "阿里影业", value: "521" },
            { title: "北京文化", value: "1831" }
          ] 
        },
        { name: "sort_by", title: "排序", type: "enumeration", value: "popularity.desc", enumOptions: [ 
          { title: "人气最高", value: "popularity.desc" }, 
          { title: "评分最高", value: "vote_average.desc" } 
        ] },
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        { name: "page", title: "页码", type: "page" } 
      ] 
    },

    // 5️⃣ 播出平台（国内外全平台）
    {
      title: "TMDB 播出平台",
      description: "按播出平台和内容类型筛选剧集内容",
      requiresWebView: false,
      functionName: "tmdbDiscoverByNetwork",
      cacheDuration: 60, // 60秒刷新
      params: [
        {
          name: "with_networks",
          title: "播出平台",
          type: "enumeration",
          description: "选择一个平台以查看其剧集内容",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "Tencent", value: "2007" },
            { title: "iQiyi", value: "1330" },
            { title: "Youku", value: "1419" },
            { title: "Bilibili", value: "1605" },
            { title: "MGTV", value: "1631" },
            { title: "Netflix", value: "213" },
            { title: "Disney+", value: "2739" },
            { title: "HBO", value: "49" },
            { title: "HBO Max", value: "3186" },
            { title: "Apple TV+", value: "2552" },
            { title: "Hulu", value: "453" },
            { title: "Amazon Prime Video", value: "1024" },
            { title: "FOX", value: "19" },
            { title: "Paramount", value: "576" },
            { title: "Paramount+", value: "4330" },
            { title: "TV Tokyo", value: "94" },
            { title: "BBC One", value: "332" },
            { title: "BBC Two", value: "295" },
            { title: "NBC", value: "6" },
            { title: "AMC+", value: "174" },
            { title: "We TV", value: "3732" },
            { title: "Viu TV", value: "2146" },
            { title: "TVB", value: "48" }
          ]
        },
        {
          name: "with_genres",
          title: "🎭 内容类型",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部类型", value: "" },
            { title: "犯罪", value: "80" },
            { title: "动画", value: "16" },
            { title: "喜剧", value: "35" },
            { title: "剧情", value: "18" },
            { title: "家庭", value: "10751" },
            { title: "儿童", value: "10762" },
            { title: "悬疑", value: "9648" },
            { title: "真人秀", value: "10764" },
            { title: "脱口秀", value: "10767" },
            { title: "肥皂剧", value: "10766" },
            { title: "纪录片", value: "99" },
            { title: "动作与冒险", value: "10759" },
            { title: "科幻与奇幻", value: "10765" },
            { title: "战争与政治", value: "10768" }
          ]
        },
        {
          name: "air_status",
          title: "上映状态",
          type: "enumeration",
          value: "released",
          enumOptions: [
            { title: "已上映", value: "released" },
            { title: "未上映", value: "upcoming" },
            { title: "全部", value: "" }
          ]
        },
        {
          name: "sort_by",
          title: "🔢 排序方式",
          type: "enumeration",
          value: "first_air_date.desc",
          enumOptions: [
            { title: "上映时间↓", value: "first_air_date.desc" },
            { title: "上映时间↑", value: "first_air_date.asc" },
            { title: "人气最高", value: "popularity.desc" },
            { title: "评分最高", value: "vote_average.desc" },
            { title: "最多投票", value: "vote_count.desc" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "language", title: "语言", type: "language", value: "zh-CN" }
      ]
    }
  ]
};

// =============================
// 拼接 URL
// =============================
function buildUrl(endpoint, params) {
  let url = BASE_URL + endpoint + '?api_key=' + TMDB_API_KEY;
  for (let k in params) {
    if (params[k] !== undefined && params[k] !== '') {
      url += `&${k}=${encodeURIComponent(params[k])}`;
    }
  }
  return url;
}

// =============================
// 通用请求函数
// =============================
async function fetchTMDB(endpoint, params = {}) {
  const url = buildUrl(endpoint, params);
  const res = await Widget.http.get(url);
  const json = res.data;
  return json.results || json || [];
}

// =============================
// 格式化 + 过滤（评分>=4 & 必须有封面）
function formatItems(items, mediaType) {
  return items
    .filter(i => i.vote_average >= 4 && i.poster_path)
    .map(i => ({
      id: i.id.toString(),
      type: "tmdb",
      mediaType: mediaType || (i.title ? "movie" : "tv"),
      title: i.title || i.name,
      posterPath: IMAGE + i.poster_path,
      backdropPath: i.backdrop_path ? IMAGE + i.backdrop_path : undefined,
      releaseDate: i.release_date || i.first_air_date,
      rating: i.vote_average,
      description: i.overview
    }));
}

// =============================
// 模块实现函数
async function tmdbPopularMovies(params) { 
  const items = await fetchTMDB("/movie/popular", params); 
  return formatItems(items, "movie"); 
}

async function tmdbPopularTV(params) { 
  const items = await fetchTMDB("/tv/popular", params); 
  return formatItems(items, "tv"); 
}

async function tmdbTopRated(params) { 
  const type = params.type || "movie"; 
  const items = await fetchTMDB(`/${type}/top_rated`, params); 
  return formatItems(items, type); 
}

async function tmdbDiscoverByCompany(params) { 
  const items = await fetchTMDB("/discover/movie", params); 
  return formatItems(items, "movie"); 
}

async function tmdbDiscoverByNetwork(params) {
  // global first_air_date.lte 自动限制今天及以前
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  params['first_air_date.lte'] = todayStr;

  const page = params.page || 1;
  const items = await fetchTMDB("/discover/tv", params);
  return formatItems(items, "tv");
}
