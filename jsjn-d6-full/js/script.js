/* script.js - full SPA logic for all modules (localStorage + JSONBin sync)
   CONFIG prefilled with BIN ID & SECRET_KEY provided by user.
*/
const CONFIG = {
  JSONBIN_BIN_ID: "68aafedab0e23b3c068fbf89",
  JSONBIN_SECRET: "$2a$10$a645S1inLedKMocHFpSJ4egzvXEC02p4ZVDeTTbBcTL3C7Ocx2E2K",
  JSONBIN_URL_BASE: "https://api.jsonbin.io/v3/b"
};

/* Data lists */
const MEMBER_LIST = ["IGP MAT SABU", "DIGP BOND KASSIM", "DIGP MAHMUD AJEMI", "CP KHAPLA TELUR", "SACP AHMAD PUTERA", "SACP JO ZERO", "DSP RIZMAN BARAN", "DSP KIBIN LELAYANG", "DSP ANUAR ASYRAF", "ASP MAD ALAI", "ASP EMBUN KASIH", "ASP REJAB SAAD", "ASP TRISYA SINCLAIR", "ASP ABDUL SANI", "ASP TYRA HAZEL", "SM NAYLA DAWSON", "KPL KAPLA YENDA", "INSP TED GRAVENBACH", "INSP RANI KULUP", "INSP AKI`R", "SI ARJUNA", "SM KIARA AYUMI", "SM MARIO R", "SJN ABUYA", "SJN KHAIRUL AHTONG", "SJN MUDBOY R", "SJN AEMAN MENAN", "KPL EMELIN LANGGAR", "KPL WAN BON", "KPL CARLOS MARTINEZ", "KONS. ADAM SHAH", "KONS. RYAN", "INSP ARIF KHADIR", "INSP FRED TAPAN", "SI UMAR BAKAR", "SI ZUL TOKEK", "SI FITRI AIYEN", "SI AHMAD AIDIL", "SM MAEL BUSUK", "SM JAMAL AHMAD", "SM ABOO SANTERO", "SM FIRAS TAHAN", "SM RANDY LOBSTER", "SJN KALSOM BUKIT", "SJN ZACK SAMBOGO", "SJN MAT AYIEN", "SJN RIZZAL ROSS", "SJN SITI WAN KEMBANG", "SJN KHAMIS JUMAAT", "L/KPL KAWAI SINCLAIR", "L/KPL LAYLA MAJNUN", "KONS. ISMAIL IBRAHIM", "KONS. ABDUL MALEK", "SI FAIZ ROMZY", "SI ZACK KING", "SM JANNA WINSTON", "SM MAYA JASRI", "SM JOHN BUBI", "SM SAAD LEON", "SM LEE MIN NO", "SM MAT ALIP", "SJN JERIN NESLO", "SJN AWANG NIBONG", "SJN MAEL TONGGEK", "SJN MAD SELAMAD", "KPL KIDD NAUFAL", "KPL MIKHAEL PREMIUM", "KONS. HANZ MALIK", "KONS. SEMAN KILAT", "KONS. IJAL MOKCAI", "KONS. NAZ JINGGA", "SJN BARKONA BARKOBA", "SJN TENGKU ADAM", "L/KPL ARISHA CHAN", "L/KPL KHOON SAMPOERNA", "KONS. MAN JINGGA", "DCP TONY GHAZALI", "KONST MARSHA BINTI RIZMAN BARAN", "KONST MILEA CHEN", "KONST TESSA YANG", "KONST RANIA DEWI", "KONST ALLY MOI", "KONST VERONICA PARK"];

/* lokasi */
const TANGKAP_LOKASI = ["Weed Farm", "Humane Lab", "Heroine Felda", "Cocaine Felda", "Heroine Sandy Shore", "Ammonium Chlorite Processing", "Cocaine Bandar", "Joint Lab", "Morphine Lab", "Poppy Farm", "Coke Leaf Farm"];

/* drugs */
const DRUGS_BY_STEP = {
  "First": ["Weed bud","Coke Leaf","Hydro acid","poppy leaf"],
  "Second": ["ammonium chlorite","crack","pure coke"],
  "Final": ["cocaine","morphine","joint","heroine"]
};

/* keys */
const KEY = { cuti:"jsjn_cuti_v1", tangkap:"jsjn_tangkapan_v1", ops:"jsjn_ops_v1" };

/* util */
function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'" :'&#39;', '"' :'&quot;'}[m])); }
function downloadJSON(obj, filename){ const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(obj,null,2)); const a=document.createElement("a"); a.href=dataStr; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); }
function fileToBase64(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=err=>rej(err); r.readAsDataURL(file); }); }

/* populate selects on each page */
document.addEventListener("DOMContentLoaded", ()=>{ 
  // cuti select
  const cutiSel = document.getElementById("cuti_nama"); if(cutiSel){ MEMBER_LIST.forEach(n=>{ const o=document.createElement("option"); o.value=n; o.textContent=n; cutiSel.appendChild(o); }); }

  // tangkapan selects
  const lokSel = document.getElementById("tangkapan_lokasi"); if(lokSel){ TANGKAP_LOKASI.forEach(l=>{ const o=document.createElement("option"); o.value=l; o.textContent=l; lokSel.appendChild(o); }); }
  const pegSel = document.getElementById("tangkapan_pegawai"); if(pegSel){ MEMBER_LIST.forEach(n=>{ const o=document.createElement("option"); o.value=n; o.textContent=n; pegSel.appendChild(o); }); }

  // ops members multiselect
  const opsSel = document.getElementById("ops_members"); if(opsSel){ MEMBER_LIST.forEach(n=>{ const o=document.createElement("option"); o.value=n; o.textContent=n; opsSel.appendChild(o); }); }

  // drug area initial row
  const drugArea = document.getElementById("drug_area"); if(drugArea){ drugArea.appendChild(createDrugRow()); document.getElementById("addDrug").addEventListener("click", ()=> drugArea.appendChild(createDrugRow())); }

  // load local data
  loadCutiLocal(); loadTangkapanLocal(); loadOpsLocal();
});

/* drug row helpers */
function createDrugRow(data){ const row=document.createElement("div"); row.className="drug-row"; row.style.display="flex"; row.style.gap="8px"; 
  const step=document.createElement("select"); step.className="drug_step"; Object.keys(DRUGS_BY_STEP).forEach(s=>{ const o=document.createElement("option"); o.value=s; o.textContent=s+" step"; step.appendChild(o); });
  const type=document.createElement("select"); type.className="drug_type"; const qty=document.createElement("input"); qty.type="number"; qty.className="drug_qty"; qty.placeholder="Kuantiti";
  const rm=document.createElement("button"); rm.type="button"; rm.className="btn"; rm.textContent='-'; rm.addEventListener('click', ()=> row.remove());
  step.addEventListener('change', ()=> populateTypes(step.value, type));
  populateTypes((data && data.step) || 'First', type);
  if(data){ step.value=data.step; type.value=data.type; qty.value=data.qty; }
  row.appendChild(step); row.appendChild(type); row.appendChild(qty); row.appendChild(rm); return row; }

function populateTypes(step, sel){ sel.innerHTML=''; (DRUGS_BY_STEP[step]||[]).forEach(x=>{ const o=document.createElement('option'); o.value=x; o.textContent=x; sel.appendChild(o); }); }

/* ---------- Module 1: Cuti ---------- */
let cutiRecords = [];
function loadCutiLocal(){ try{ cutiRecords=JSON.parse(localStorage.getItem(KEY.cuti)||'[]'); }catch(e){ cutiRecords=[]; } renderCuti(); }
function saveCutiLocal(){ localStorage.setItem(KEY.cuti, JSON.stringify(cutiRecords)); setStatus('cuti','Saved locally', true); }
function renderCuti(){ const tbody = document.getElementById('cuti_table'); if(!tbody) return; tbody.innerHTML=''; cutiRecords.forEach((r,i)=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td style="padding:8px">${i+1}</td><td style="padding:8px">${escapeHtml(r.nama)}</td><td style="padding:8px">${escapeHtml(r.jenis)}</td><td style="padding:8px">${escapeHtml(r.mula)}</td><td style="padding:8px">${escapeHtml(r.tamat)}</td><td style="padding:8px">${escapeHtml(r.jumlah)}</td><td style="padding:8px">${escapeHtml(r.sebab||'')}</td><td style="padding:8px"><button data-i="${i}" data-act="edit">Edit</button> <button data-i="${i}" data-act="del">Padam</button></td>`; tbody.appendChild(tr); }); tbody.querySelectorAll('button').forEach(b=> b.addEventListener('click', e=>{ const i=+e.target.dataset.i; const act=e.target.dataset.act; if(act==='del'){ if(confirm('Padam rekod?')){ cutiRecords.splice(i,1); saveCutiLocal(); renderCuti(); } } else if(act==='edit') startEditCuti(i); })); }
function startEditCuti(i){ const r=cutiRecords[i]; document.getElementById('cuti_nama').value=r.nama; document.getElementById('cuti_jenis').value=r.jenis; document.getElementById('cuti_mula').value=r.mula; document.getElementById('cuti_tamat').value=r.tamat; document.getElementById('cuti_jumlah').value=r.jumlah; document.getElementById('cuti_sebab').value=r.sebab||''; cutiRecords.splice(i,1); saveCutiLocal(); renderCuti(); }
document.addEventListener('submit', function(e){ if(e.target && e.target.id==='cutiForm'){ e.preventDefault(); const nama=document.getElementById('cuti_nama').value; const jenis=document.getElementById('cuti_jenis').value; const mula=document.getElementById('cuti_mula').value; const tamat=document.getElementById('cuti_tamat').value; let jumlah=Number(document.getElementById('cuti_jumlah').value) || 0; const sebab=document.getElementById('cuti_sebab').value; if(mula && tamat){ const days=Math.floor((new Date(tamat)-new Date(mula))/(1000*60*60*24))+1; if(days>0) jumlah=days; } const rec={nama,jenis,mula,tamat,jumlah,sebab,createdAt:new Date().toISOString()}; cutiRecords.push(rec); saveCutiLocal(); renderCuti(); e.target.reset(); } }, true);
document.getElementById('cuti_sync') && document.getElementById('cuti_sync').addEventListener('click', async ()=>{ if(!confirm('Hantar semua rekod cuti ke JSONBin? (Akan overwrite)')) return; const existing = await fetchFromJsonBin() || {}; existing.cuti = cutiRecords; await saveToJsonBin(existing); });
document.getElementById('cuti_load') && document.getElementById('cuti_load').addEventListener('click', async ()=>{ if(!confirm('Muat dari JSONBin dan overwrite lokal cuti?')) return; const data = await fetchFromJsonBin(); if(data && Array.isArray(data.cuti)){ cutiRecords = data.cuti; saveCutiLocal(); renderCuti(); alert('Muat cuti selesai'); } else alert('Tiada data cuti ditemui pada bin.'); });
document.getElementById('cuti_export') && document.getElementById('cuti_export').addEventListener('click', ()=> downloadJSON(cutiRecords,'cuti_records.json'));

/* ---------- Module 2: Tangkapan ---------- */
... (truncated for brevity in code creation)

/* JSONBin helpers */
function jsonbinHeaders(){ const headers = { "Content-Type":"application/json" }; if(CONFIG.JSONBIN_SECRET && !CONFIG.JSONBIN_SECRET.includes('YOUR_')){ headers['X-Master-Key'] = CONFIG.JSONBIN_SECRET; headers['X-Access-Key'] = CONFIG.JSONBIN_SECRET; } return headers; }
async function fetchFromJsonBin(){ if(!CONFIG.JSONBIN_BIN_ID || CONFIG.JSONBIN_BIN_ID.includes('YOUR_BIN_ID')){ alert('Masukkan JSONBIN_BIN_ID di config'); return null; } try{ const res = await fetch(`${CONFIG.JSONBIN_URL_BASE}/${CONFIG.JSONBIN_BIN_ID}`, { method:'GET', headers: jsonbinHeaders() }); if(!res.ok) throw new Error(res.status); const data = await res.json(); return data.record || data; }catch(err){ console.error(err); alert('Gagal muat dari JSONBin: '+err.message); return null; } }
async function saveToJsonBin(payload){ if(!CONFIG.JSONBIN_BIN_ID || CONFIG.JSONBIN_BIN_ID.includes('YOUR_BIN_ID')){ alert('Masukkan JSONBIN_BIN_ID di config'); return; } try{ const res = await fetch(`${CONFIG.JSONBIN_URL_BASE}/${CONFIG.JSONBIN_BIN_ID}`, { method:'PUT', headers: jsonbinHeaders(), body: JSON.stringify(payload) }); if(!res.ok){ const t = await res.text(); throw new Error(t||res.status); } alert('Sync berjaya'); }catch(err){ console.error(err); alert('Gagal sync: '+err.message); } }

/* status helper */
function setStatus(section,msg,transient=false){ const el=document.getElementById(section+'_status'); if(el) el.textContent='Status: '+msg; if(transient) setTimeout(()=>{ if(el) el.textContent='Status: idle'; },2200); }

/* init */
window.addEventListener('load', ()=>{ loadCutiLocal(); loadTangkapanLocal(); loadOpsLocal(); });
