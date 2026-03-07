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
function detectAts(url) {
  for (const { pattern, platform } of ATS_PATTERNS) {
    if (pattern.test(url)) return platform;
  }
  return null;
}
export {
  detectAts as d
};
//# sourceMappingURL=detect-CZ1xkSc2.js.map
