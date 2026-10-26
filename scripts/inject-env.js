// 사용: node scripts/inject-env.js
// .env의 AMPLITUDE_API_KEY(공개 키)와 SERVER_ZONE만 HTML에 넣는다.
// AMPLITUDE_SECRET_KEY는 이 스크립트가 읽지도, 쓰지도 않는다.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}

const key = env.AMPLITUDE_API_KEY || "";
const zone = env.AMPLITUDE_SERVER_ZONE === "EU" ? "EU" : "US";
if (!/^[0-9a-f]{32}$/.test(key)) throw new Error("AMPLITUDE_API_KEY가 없거나 형식이 맞지 않습니다 (32자리 16진수).");

// index.html은 배포용, 한글 이름 파일은 같은 내용의 원본
for (const f of ["index.html", "랜딩페이지(조영흠).html"]) {
  const p = path.join(root, f);
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  s = s.replace(/var AMPLITUDE_API_KEY = "[^"]*";/, `var AMPLITUDE_API_KEY = "${key}";`);
  s = s.replace(/var SERVER_ZONE = "[A-Z]+";/, `var SERVER_ZONE = "${zone}";`);
  if (s === before) console.log("변경 없음:", f);
  else { fs.writeFileSync(p, s); console.log("주입:", f, `(키 ${key.length}자, ${zone})`); }
}
