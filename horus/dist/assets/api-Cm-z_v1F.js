const ATS_PATTERNS = [
  {
    pattern: /myworkdayjobs\.com|wd\d+\.myworkdayjobs\.com/,
    platform: { id: "workday", name: "Workday", difficulty: "hard" }
  },
  {
    pattern: /boards\.greenhouse\.io|job-boards\.greenhouse\.io/,
    platform: { id: "greenhouse", name: "Greenhouse", difficulty: "medium" }
  },
  {
    pattern: /jobs\.lever\.co/,
    platform: { id: "lever", name: "Lever", difficulty: "medium" }
  },
  {
    pattern: /icims\.com/,
    platform: { id: "icims", name: "iCIMS", difficulty: "hard" }
  },
  {
    pattern: /taleo\.net/,
    platform: { id: "taleo", name: "Taleo", difficulty: "hard" }
  },
  {
    pattern: /workforcenow\.adp\.com/,
    platform: { id: "adp", name: "ADP Workforce", difficulty: "medium" }
  },
  {
    pattern: /bamboohr\.com/,
    platform: { id: "bamboohr", name: "BambooHR", difficulty: "easy" }
  },
  {
    pattern: /ashbyhq\.com/,
    platform: { id: "ashby", name: "Ashby", difficulty: "easy" }
  },
  {
    pattern: /smartrecruiters\.com/,
    platform: { id: "smartrecruiters", name: "SmartRecruiters", difficulty: "medium" }
  },
  {
    pattern: /recruiting\.paylocity\.com/,
    platform: { id: "paylocity", name: "Paylocity", difficulty: "medium" }
  },
  {
    pattern: /jobvite\.com/,
    platform: { id: "jobvite", name: "Jobvite", difficulty: "medium" }
  },
  {
    pattern: /applytojob\.com/,
    platform: { id: "jazzhr", name: "JazzHR", difficulty: "easy" }
  }
];
const SUPPORTED_PLATFORMS = ATS_PATTERNS.map((e) => e.platform);
function detectAts(url) {
  for (const { pattern, platform } of ATS_PATTERNS) {
    if (pattern.test(url)) return platform;
  }
  return null;
}
const BASE = "http://127.0.0.1:9741";
async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}
async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}
async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}
const raApi = {
  health: () => get("/health"),
  profiles: {
    list: () => get("/profiles"),
    get: (id) => get(`/profiles/${id}`),
    variants: (profileId) => get(`/profiles/${profileId}/variants`),
    experience: (profileId) => get(`/profiles/${profileId}/experience`)
  },
  snippets: {
    list: () => get("/snippets")
  },
  templates: {
    list: () => get("/templates")
  },
  applications: {
    create: (input) => post("/applications", input),
    updateStatus: (id, status) => patch(`/applications/${id}/status`, { status })
  }
};
export {
  SUPPORTED_PLATFORMS as S,
  detectAts as d,
  raApi as r
};
//# sourceMappingURL=api-Cm-z_v1F.js.map
