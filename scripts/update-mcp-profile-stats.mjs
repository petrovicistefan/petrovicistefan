import { mkdir, writeFile } from 'node:fs/promises';
const owner='petrovicistefan';
const packages=['mcp-security-guard','mcp-dependency-doctor','mcp-api-guardian','mcp-database-doctor','mcp-cost-optimizer','mcp-seo-auditor'];
const snapshots=await Promise.all(packages.map(async name=>{
 const response=await fetch('https://raw.githubusercontent.com/'+owner+'/'+name+'/main/metrics/adoption-history.json',{headers:{'User-Agent':'mcp-profile-stats'}});
 if(!response.ok)throw new Error(name+': HTTP '+response.status);
 const history=await response.json();
 if(!Array.isArray(history)||!history.length)throw new Error(name+': empty metrics');
 return {name,snapshot:history.at(-1)};
}));
const sum=key=>snapshots.reduce((total,item)=>total+(Number.isFinite(item.snapshot.npm?.[key])?item.snapshot.npm[key]:0),0);
const week=sum('downloads7d'),day=sum('downloads24h'),stars=snapshots.reduce((total,item)=>total+(item.snapshot.github?.stars||0),0);
const asOf=snapshots.map(item=>item.snapshot.date).sort()[0];
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="230" viewBox="0 0 900 230" role="img" aria-label="MCP ecosystem adoption metrics">
<rect width="900" height="230" rx="18" fill="#0d1525"/><rect x="1" y="1" width="898" height="228" rx="17" fill="none" stroke="#2b3d55" stroke-width="2"/>
<text x="34" y="49" font-family="Arial,sans-serif" font-size="25" font-weight="700" fill="#e5eefb">Open Source MCP Ecosystem</text>
<text x="34" y="75" font-family="Arial,sans-serif" font-size="14" fill="#a7b8ce">Developer tools · GitHub + npm</text>
<g font-family="Arial,sans-serif" text-anchor="middle">
<text x="160" y="139" font-size="42" font-weight="700" fill="#5eead4">6</text><text x="160" y="166" font-size="15" fill="#b4c3d6">Public MCP packages</text>
<text x="440" y="139" font-size="42" font-weight="700" fill="#5eead4">${fmt(week)}</text><text x="440" y="166" font-size="15" fill="#b4c3d6">npm downloads / 7 days</text>
<text x="735" y="139" font-size="42" font-weight="700" fill="#5eead4">${fmt(stars)}</text><text x="735" y="166" font-size="15" fill="#b4c3d6">GitHub stars</text></g>
<text x="34" y="207" font-family="Arial,sans-serif" font-size="12" fill="#94a3b8">As of ${asOf} · ${fmt(day)} downloads / 24h · npm downloads are not unique users</text>
</svg>`;
await mkdir('assets',{recursive:true});await writeFile('assets/mcp-ecosystem-stats.svg',svg);
console.log({packages:packages.length,week,day,stars,asOf});
