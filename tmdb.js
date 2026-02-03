// ===== TMDB ForwardWidgets 模块 =====
const TMDB_API_KEY = "ae39b54fe21d657c5f535174b11f8a82"; // 建议使用你自己的 Key
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE = "https://image.tmdb.org/t/p/w500";

// ===== Widget 元数据 =====
var WidgetMetadata = {
  id: "curator-tmdb-widget",
  title: "TMDB资源",
  description: "热门剧集、热门电影、高分内容、出品公司、今日全球更新",
  author: "curator",
  version: "2.3.0",
  requiredVersion: "0.0.1",
  modules: [
    { title: "TMDB 热门剧集", functionName: "tmdbPopularTV", cacheDuration: 1800 },
    { title: "TMDB 热门电影", functionName: "tmdbPopularMovies", cacheDuration: 1800 },
    { title: "TMDB 高分内容", functionName: "tmdbTopRated", cacheDuration: 1800 },
    { title: "TMDB 出品公司", functionName: "tmdbDiscoverByCompany", cacheDuration: 1800 },
    { 
      title: "TMDB 今日全球更新（电影+剧集）", 
      functionName: "tmdbTodayUpdate", 
      cacheDuration: 3600,
      params: [
        { name: "pageLimit", title: "翻页限制", type: "count", description: "每种类型抓多少页资源" }
      ]
    }
  ]
};

// ===== Helper Functions =====
function buildUrl(endpoint, params) {
  let url = BASE_URL + endpoint + '?api_key=' + TMDB_API_KEY;
  for (let k in params) {
    if (params[k] !== undefined && params[k] !== '') {
      url += `&${k}=${encodeURIComponent(params[k])}`;
    }
  }
  return url;
}

async function fetchTMDB(endpoint, params = {}) {
  const url = buildUrl(endpoint, params);
  const res = await Widget.http.get(url);
  const json = res.data;
  return json.results || json || [];
}

function formatItems(items, mediaType) {
  return items
    .filter(i => (i.vote_average >= 0) && i.poster_path)
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

// ===== 模块函数 =====

// 热门电影
async function tmdbPopularMovies(params) {
  const items = await fetchTMDB("/movie/popular", params);
  return formatItems(items, "movie");
}

// 热门剧集
async function tmdbPopularTV(params) {
  const items = await fetchTMDB("/tv/popular", params);
  return formatItems(items, "tv");
}

// 高分内容
async function tmdbTopRated(params) {
  const type = params.type || "movie";
  const items = await fetchTMDB(`/${type}/top_rated`, params);
  return formatItems(items, type);
}

// 出品公司筛选
async function tmdbDiscoverByCompany(params) {
  const items = await fetchTMDB("/discover/movie", params);
  return formatItems(items, "movie");
}

// ===== 今日全球更新（合并电影+剧集，自动翻页抓取） =====
async function tmdbTodayUpdate(params) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const pageLimit = params.pageLimit || 5; // 每种类型抓多少页
  let allResults = [];

  // 自动翻页抓电影
  for (let p = 1; p <= pageLimit; p++) {
    const movies = await fetchTMDB("/discover/movie", {
      "primary_release_date.gte": today,
      "primary_release_date.lte": today,
      sort_by: "release_date.desc",
      page: p
    });
    if (!movies.length) break;
    allResults = allResults.concat(formatItems(movies, "movie"));
  }

  // 自动翻页抓剧集
  for (let p = 1; p <= pageLimit; p++) {
    const tvs = await fetchTMDB("/discover/tv", {
      "first_air_date.gte": today,
      "first_air_date.lte": today,
      sort_by: "first_air_date.desc",
      page: p
    });
    if (!tvs.length) break;
    allResults = allResults.concat(formatItems(tvs, "tv"));
  }

  // 按发布日期降序，合并电影和剧集
  allResults.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

  // 去重
  const seen = new Set();
  const merged = allResults.filter(item => {
    const key = item.mediaType + "_" + item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return merged;
}
