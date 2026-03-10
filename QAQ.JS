var WidgetMetadata = {
  id: "danmu_api_Max_clone_v1",
  title: "御坂弹幕模块",
  version: "0.0.5",
  requiredVersion: "0.0.2",
  description: "此模块只放御坂弹幕API",
  author: "HakunaMatata",

  globalParams: [
    { name: "source1", title: "源1 (必填)", type: "input", value: "请填入你的弹幕api" },
    { name: "source2", title: "源2", type: "input" },
    { name: "source3", title: "源3", type: "input" },
    { 
      name: "maxBulletCount", 
      title: "📊 弹幕数量上限", 
      type: "input", 
      value: "3000",
      description: "填0或留空不限制，超出则按时间全段等比例随机剔除" 
    },
    { 
      name: "searchBlockWords", 
      title: "👁️ 搜索结果屏蔽词 (逗号分隔)", 
      type: "input", 
      value: "",
      description: "屏蔽不想看到的搜索结果，如: 动态漫,电视剧,漫画" 
    },
    { 
      name: "convertMode", 
      title: "🔠 弹幕转换", 
      type: "enumeration", 
      value: "none",
      enumOptions: [
        { title: "保持原样", value: "none" },
        { title: "转简体 (繁->简)", value: "t2s" },
        { title: "转繁体 (简->繁)", value: "s2t" }
      ]
    },
    { 
      name: "colorMode", 
      title: "🎨 弹幕颜色", 
      type: "enumeration", 
      value: "none",
      enumOptions: [
        { title: "保持原样", value: "none" },
        { title: "全部纯白", value: "white" },
        { title: "部分彩色 (50%彩色)", value: "partial" },
        { title: "完全彩色 (100%彩色)", value: "all" }
      ]
    },
    { 
      name: "blockWords", 
      title: "🚫 弹幕内容屏蔽词 (逗号分隔)", 
      type: "input", 
      value: "" 
    }
  ],

  modules: [
    { id: "searchBullets", title: "搜索", functionName: "searchBullets", type: "danmu", params: [] },
    { id: "getBulletDetail", title: "详情", functionName: "getBulletDetailById", type: "danmu", params: [] },
    { id: "getBulletComments", title: "弹幕", functionName: "getBulletCommentsById", type: "danmu", params: [] }
  ]
};

// ==========================================
// 1. 繁简转换核心
// ==========================================
const DICT_URL_S2T = "https://cdn.jsdelivr.net/npm/opencc-data@1.0.3/data/STCharacters.txt";
const DICT_URL_T2S = "https://cdn.jsdelivr.net/npm/opencc-data@1.0.3/data/TSCharacters.txt";
let MEM_DICT = null;

async function initDict(mode) {
  if (!mode || mode === "none") return;
  if (MEM_DICT) return;
  const key = `dict_clone_${mode}`;
  let local = await Widget.storage.get(key);
  if (!local) {
    try {
      const res = await Widget.http.get(mode === "s2t" ? DICT_URL_S2T : DICT_URL_T2S);
      let text = res.data || res;
      if (typeof text === 'string' && text.length > 100) {
        const map = {};
        text.split('\n').forEach(l => {
          const p = l.split(/\s+/);
          if (p.length >= 2) map[p[0]] = p[1];
        });
        await Widget.storage.set(key, JSON.stringify(map));
        MEM_DICT = map;
      }
    } catch (e) {}
  } else {
    try { MEM_DICT = JSON.parse(local); } catch(e) {}
  }
}

function convertText(text) {
  if (!text || !MEM_DICT) return text;
  let res = "";
  for (let char of text) res += MEM_DICT[char] || char;
  return res;
}

// ==========================================
// 2. 核心功能
// ==========================================
const SOURCE_KEY = "dm_source_map_clone";

async function getSource(id) {
  try {
    let map = await Widget.storage.get(SOURCE_KEY);
    return map ? JSON.parse(map)[id] : null;
  } catch(e) { return null; }
}

async function searchBullets(params) {
  const { title, season, searchBlockWords } = params;
  const queryTitle = title;

  const servers = [params.source1, params.source2, params.source3]
      .filter(s => s && s.startsWith("http"))
      .map(s => s.replace(/\/$/, ""));
  
  if (!servers.length) return { animes: [] };

  let finalAnimes = [];
  let mapEntries = {};
  let seenIds = new Set();

  const tasks = servers.map(async (server) => {
    try {
      const res = await Widget.http.get(`${server}/api/v2/search/anime?keyword=${queryTitle}`, {
        headers: { 
          "Content-Type": "application/json", 
          "User-Agent": "ForwardWidgets/Clone/1.0" 
        }
      });
      if (res) {
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        if (data && data.success && data.animes && data.animes.length > 0) {
          return { server, animes: data.animes };
        }
      }
    } catch(e) {}
    return null;
  });

  const results = await Promise.all(tasks);

  for (const res of results) {
    if (res) {
      for (const a of res.animes) {
        if (!seenIds.has(a.animeId)) {
          seenIds.add(a.animeId);
          finalAnimes.push(a);
          mapEntries[a.animeId] = res.server;
        }
      }
    }
  }

  try {
    let mapStr = await Widget.storage.get(SOURCE_KEY);
    let map = mapStr ? JSON.parse(mapStr) : {};
    Object.assign(map, mapEntries);
    await Widget.storage.set(SOURCE_KEY, JSON.stringify(map));
  } catch(e) {}

  if (finalAnimes.length > 0 && searchBlockWords) {
    const blockedList = searchBlockWords.split(/[,，]/).map(k => k.trim()).filter(k => k.length > 0);
    if (blockedList.length > 0) {
      finalAnimes = finalAnimes.filter(a => {
        if (!a.animeTitle) return false;
        for (const keyword of blockedList) if (a.animeTitle.includes(keyword)) return false;
        return true;
      });
    }
  }

  return { animes: finalAnimes };
}

async function getBulletDetailById(params) {
  const { animeId } = params;
  let server = (await getSource(animeId)) || params.source1;

  try {
    const res = await Widget.http.get(`${server}/api/v2/bangumi/${animeId}`, {
      headers: { "Content-Type": "application/json", "User-Agent": "ForwardWidgets/Clone/1.0" }
    });
    const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    if (data?.bangumi?.episodes) {
      let mapStr = await Widget.storage.get(SOURCE_KEY);
      let map = mapStr ? JSON.parse(mapStr) : {};
      for (const ep of data.bangumi.episodes) map[ep.episodeId] = server;
      await Widget.storage.set(SOURCE_KEY, JSON.stringify(map));
      return data.bangumi.episodes;
    }
  } catch(e) {}
  return [];
}

async function getBulletCommentsById(params) {
  const { commentId, convertMode, blockWords, colorMode, maxBulletCount } = params;
  if (!commentId) return null;

  await initDict(convertMode);

  let server = (await getSource(commentId)) || params.source1;

  try {
    const res = await Widget.http.get(`${server}/api/v2/comment/${commentId}?withRelated=true&chConvert=0`, {
      headers: { "Content-Type": "application/json", "User-Agent": "ForwardWidgets/Clone/1.0" }
    });
    const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

    let list = data.comments || [];
    const blockedList = blockWords ? blockWords.split(/[,，]/).map(k => k.trim()).filter(k => k.length>0) : [];

    if (list.length > 0) {
      if (convertMode !== "none" && MEM_DICT) {
        list.forEach(c => {
          if (c.m) c.m = convertText(c.m);
          if (c.message) c.message = convertText(c.message);
        });
      }

      if (blockedList.length > 0) {
        list = list.filter(c => {
          const msg = c.m || c.message || "";
          for (const keyword of blockedList) if (msg.includes(keyword)) return false;
          return true;
        });
      }

      let limit = parseInt(maxBulletCount);
      if (!isNaN(limit) && limit > 0 && list.length > limit) {
        for (let i=list.length-1; i>0; i--) {
          const j = Math.floor(Math.random()*(i+1));
          [list[i], list[j]] = [list[j], list[i]];
        }
        list = list.slice(0, limit);
        list.sort((a,b) => {
          const timeA = a.p ? parseFloat(a.p.split(',')[0]) || 0 : 0;
          const timeB = b.p ? parseFloat(b.p.split(',')[0]) || 0 : 0;
          return timeA - timeB;
        });
      }

      if (colorMode && colorMode !== "none") {
        const COLORS = [16711680,16776960,16752384,16738740,13445375,11730943,11730790];
        const COLOR_WHITE = "16777215";
        list.forEach(c => {
          if (c.p) {
            let parts = c.p.split(',');
            if (parts.length >= 3) {
              let colorIndex = parts.length >= 8 ? 3 : 2;
              let targetColor = COLOR_WHITE;
              if (colorMode === "white") targetColor = COLOR_WHITE;
              else if (colorMode === "partial") targetColor = Math.random()<0.5 ? COLORS[Math.floor(Math.random()*COLORS.length)].toString() : COLOR_WHITE;
              else if (colorMode === "all") targetColor = COLORS[Math.floor(Math.random()*COLORS.length)].toString();
              parts[colorIndex] = targetColor;
              c.p = parts.join(',');
            }
          }
        });
      }

      data.comments = list;
    }

    return data;
  } catch(e) { return null; }
}
