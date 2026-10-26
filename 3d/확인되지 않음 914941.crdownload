/* 반도체 8대 공정 — 실제감 강화 레이어
   사용법: semiconductor-8-process.html 의 </body> 바로 위에
   <script src="semi-enhance.js"></script> 한 줄만 추가하세요. (원본 코드는 수정하지 않습니다)
   추가 기능: ① 설비 클릭/2초 응시 시 공정 자동 작동 ② 웨이퍼 단면 실시간 뷰
              ③ 장비 계측값(온도·압력·두께 등) ④ 재생 속도 조절 */
(()=>{
const $=id=>document.getElementById(id), cl=v=>Math.max(0,Math.min(1,v));

/* ---------- UI 주입 ---------- */
const css=document.createElement('style');
css.textContent=`
#xs{width:100%;border:1px solid var(--line);border-radius:8px;background:#0b0f16;display:block}
.xscap{font-size:11.5px;color:var(--cyan);margin-top:8px;font-family:'JetBrains Mono',monospace}
.ro-row{display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:4px 0;border-bottom:1px dashed var(--line)}
.ro-row span{color:var(--muted)} .ro-row b{color:var(--amber);font-family:'JetBrains Mono',monospace;font-weight:500;text-align:right}
#dwell{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;pointer-events:none;display:none;
 -webkit-mask:radial-gradient(circle,transparent 15px,#000 16px);mask:radial-gradient(circle,transparent 15px,#000 16px)}
select.toggle-btn{flex:0 0 74px;text-align:center}
.toggle-btn.run{background:rgba(242,165,65,.14);border-color:var(--amber);color:var(--amber)}`;
document.head.appendChild(css);

$('substeps').insertAdjacentHTML('afterend',`
<div class="toggle-block" id="playBlock"><div class="tlabel">설비를 클릭하거나 2초간 가리키면 자동 작동합니다</div>
 <div class="toggle-group"><button class="toggle-btn" id="playBtn">▶ 공정 시작</button>
 <select id="spd" class="toggle-btn"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></div></div>
<div class="toggle-block" id="xsBlock"><div class="tlabel">웨이퍼 단면 (실시간)</div><canvas id="xs" width="260" height="130"></canvas><div class="xscap" id="xscap"></div></div>
<div class="toggle-block" id="roBlock"><div class="tlabel">장비 계측값 (시뮬레이션)</div><div id="ro"></div></div>`);
$('viewport').insertAdjacentHTML('beforeend','<div id="dwell"></div>');
document.querySelector('.hint').textContent='드래그: 회전 · 휠: 확대/축소 · 설비 클릭 또는 2초 응시: 공정 작동';

/* ---------- 재생 제어 ---------- */
const DURATION=16; let playing=false, dwell=0, inside=false, mx=0, my=0, dx0=0, dy0=0, roAcc=1;
function setNorm(n){
  const s=stages[current]; paramNorm=cl(n);
  const v=s.param.min+paramNorm*(s.param.max-s.param.min);
  $('paramSlider').value=v; $('paramVal').textContent=Math.round(v)+s.param.unit; highlightSubSteps();
}
function sync(){
  $('playBtn').textContent=playing?'❚❚ 일시정지':'▶ 공정 시작';
  $('playBtn').classList.toggle('run',playing);
  $('xsBlock').classList.toggle('hidden',!(current>=1&&current<=5));
}
function setPlay(v){ playing=v; if(playing&&paramNorm>=0.999) setNorm(0); sync(); }
$('playBtn').addEventListener('click',()=>setPlay(!playing));
$('paramSlider').addEventListener('input',()=>{ if(playing) setPlay(false); });
const _load=loadStage;
loadStage=function(i){ _load(i); playing=false; dwell=0; roAcc=1; sync(); };

/* ---------- 설비 클릭 / 2초 응시 ---------- */
const dom=renderer.domElement, ray=new THREE.Raycaster(), m2=new THREE.Vector2();
function hit(){
  m2.set(mx/dom.clientWidth*2-1,-(my/dom.clientHeight)*2+1);
  ray.setFromCamera(m2,camera);
  return ray.intersectObjects(stageGroup.children,true).some(h=>h.object.visible);
}
dom.addEventListener('pointermove',e=>{ const r=dom.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top; inside=true; });
dom.addEventListener('pointerleave',()=>{ inside=false; });
dom.addEventListener('pointerdown',e=>{ dx0=e.clientX; dy0=e.clientY; });
dom.addEventListener('pointerup',e=>{ if(Math.hypot(e.clientX-dx0,e.clientY-dy0)<5&&hit()) setPlay(!playing); });

/* ---------- 계측값 ---------- */
function readouts(n,m){
  const g=cl((n-.32)/.68), r=cl((n-.15)/.7), k=cl((n-.1)/.8);
  switch(current){
  case 0: return [['톱날 회전',(n>.15&&n<.87?'2,400':'0')+' rpm'],['웨이퍼 두께','775 μm'],['표면 거칠기(Ra)',n<.85?'≈ 2 μm':(2000*(1-cl((n-.85)/.15))+.2).toFixed(1)+' nm']];
  case 1: return [['산화로 온도',Math.round(25+975*cl((n-.12)/.28))+' °C'],['분위기',n>.32?'O₂ / H₂O (습식 산화)':'N₂ 대기'],['SiO₂ 두께',Math.round(g>0?20+480*Math.sqrt(g):0)+' nm']];
  case 2: return [['스핀 속도',n<.15?Math.round(3000*Math.sin(cl(n/.15)*Math.PI))+' rpm':'0 rpm'],['노광원','ArF 193 nm'],['노광량',Math.round(30*cl((n-.35)/.4))+' mJ/cm²'],['현상액','TMAH 2.38 %']];
  case 3: return [['방식',m?'건식 · CF₄/O₂ 플라즈마':'습식 · BOE 용액'],['식각 깊이',Math.round(r*160)+' nm'],['측벽 형상',m?'수직 (≈ 90°)':'등방성 · 언더컷']];
  case 4: return [['챔버 압력',m?'3 mTorr (고진공)':'0.5 Torr (LPCVD)'],['공정 온도',m?'25 ~ 200 °C':'400 ~ 700 °C'],['박막 두께',Math.round(k*100)+' nm'],['피복 특성',m?'방향성 · 측벽 얇음':'등각 (Conformal)']];
  case 5: return [['배선 금속',m?'구리 (Cu)':'알루미늄 (Al)'],['비저항',m?'1.7 μΩ·cm':'2.7 μΩ·cm'],['금속 두께',Math.round(cl((n-.15)/.55)*(m?170:100))+' nm']];
  case 6: { const t=n>=.9?21:Math.min(21,Math.floor(cl((n-.1)/.8)*21)); return [['검사 다이',t+' / 21'],['프로브 접촉력','≈ 5 gf / 핀'],['수율',n>=.9?'85.7 % (불량 3개)':'측정 중…']]; }
  default: return [['현재 단계',stages[7].subSteps[activeSubStepIndex(stages[7],n)]],['와이어','Au Φ25 μm'],['몰딩 온도',n>.7?'175 °C':'—']];
  }
}
function renderRO(){
  const rows=readouts(paramNorm,toggleIndex);
  $('ro').innerHTML=rows.map(([a,b])=>`<div class="ro-row"><span>${a}</span><b>${b}</b></div>`).join('');
}

/* ---------- 웨이퍼 단면 ---------- */
const xc=$('xs').getContext('2d'), W=260, H=130, y0=92, WX=[40,100,160,220], SEG=[[0,25],[55,85],[115,145],[175,205],[235,260]];
const C={si:'#8a94a3',ox:'#4aa3bf',pr:'#6de08a',bg:'#0b0f16'};
const R=(c,x,y,w,h)=>{ xc.fillStyle=c; xc.fillRect(x,y,w,h); };
function drawXS(n,m){
  xc.clearRect(0,0,W,H); R(C.bg,0,0,W,H); let cap='';
  if(current===1){
    const g=cl((n-.32)/.68), t=14*Math.sqrt(g);
    R(C.si,0,y0,W,H-y0); R(C.ox,0,y0-t*.56,W,t);
    cap='SiO₂ 성장 · 두께의 약 44%는 Si 내부로 소모';
  } else if(current===2){
    const co=cl(n/.15), al=cl((n-.15)/.2), ex=cl((n-.35)/.4), dv=cl((n-.75)/.25), h=16*co, top=y0-4-h;
    R(C.si,0,y0,W,H-y0); R(C.ox,0,y0-4,W,4); R(C.pr,0,top,W,h);
    const my=-12+al*22;
    WX.forEach(x=>{
      if(ex>0&&dv<.05){ xc.fillStyle=`rgba(255,255,255,${.5*ex})`; xc.fillRect(x-15,top,30,h); }
      if(dv>0) R(C.bg,x-15,top,30,h*dv);
    });
    if(al>0){ SEG.forEach(([a,b])=>R('#aab4c2',a,my,b-a,5));
      if(ex>0&&dv<.05) WX.forEach(x=>R(`rgba(190,170,255,${.25+.2*Math.sin(performance.now()*.01)})`,x-15,my+5,30,top-my-5)); }
    cap=dv>0?'현상: 노광된 부분이 제거됨 (포지티브 PR)':ex>0?'UV 노광: 마스크 개구부만 감광':'감광액 도포 → 마스크 정렬';
  } else if(current===3){
    const wet=m===0, re=cl((n-.15)/.7), sp=cl((n-.85)/.15), d=16*re;
    R(C.si,0,y0,W,H-y0); R(C.ox,0,y0-16,W,16); xc.fillStyle=C.bg;
    WX.forEach(x=>{
      if(wet){ xc.beginPath(); xc.moveTo(x-15-d*.8,y0-16); xc.lineTo(x+15+d*.8,y0-16); xc.lineTo(x+15,y0-16+d); xc.lineTo(x-15,y0-16+d); xc.fill(); }
      else xc.fillRect(x-15,y0-16,30,d);
    });
    xc.globalAlpha=1-sp; SEG.forEach(([a,b])=>R(C.pr,a,y0-24,b-a,8)); xc.globalAlpha=1;
    cap=wet?'습식: 옆으로도 깎이는 등방성 식각 (감광막 아래 언더컷)':'건식: 수직으로만 깎이는 이방성 식각';
  } else if(current===4){
    const pvd=m===1, f=9*cl((n-.1)/.8), fc=pvd?'#f2a541':'#b79bff';
    const path=()=>{ xc.beginPath(); xc.moveTo(0,y0-16); WX.forEach(x=>{ xc.lineTo(x-15,y0-16); xc.lineTo(x-15,y0); xc.lineTo(x+15,y0); xc.lineTo(x+15,y0-16); }); xc.lineTo(W,y0-16); xc.lineTo(W,H); xc.lineTo(0,H); xc.closePath(); };
    if(!pvd&&f>0){ path(); xc.strokeStyle=fc; xc.lineWidth=f*2; xc.lineJoin='round'; xc.stroke(); }
    path(); xc.fillStyle=C.ox; xc.fill(); R(C.si,0,y0,W,H-y0);
    if(pvd&&f>0){
      SEG.forEach(([a,b])=>R(fc,a,y0-16-f,b-a,f));
      WX.forEach(x=>{ R(fc,x-15,y0-f,30,f); R(fc,x-15,y0-16,f*.25,16); R(fc,x+15-f*.25,y0-16,f*.25,16); });
    }
    cap=pvd?'PVD: 위에서 날아와 바닥·상부에 두껍고 측벽은 얇음':'CVD: 가스가 사방에서 반응해 홈 안까지 균일하게 덮음';
  } else if(current===5){
    const cu=m===1, dp=cl((n-.15)/.55), fp=cl((n-.7)/.3);
    R(C.si,0,y0+8,W,H-y0-8); R(C.ox,0,y0-12,W,20);
    if(cu){
      const tot=dp*17, fh=Math.min(12,tot), over=Math.max(0,tot-12)*(1-fp);
      WX.forEach(x=>{ R(C.bg,x-15,y0-12,30,12); R('#dd7a3a',x-15,y0-fh,30,fh); });
      R('#dd7a3a',0,y0-12-over,W,over);
      cap=fp>0?'CMP: 표면의 과잉 구리를 연마해 평탄화':'다마신: 트렌치를 먼저 파고 구리로 채움';
    } else {
      const t=10*dp;
      WX.forEach(x=>R('#cdd6de',x-15-(1-fp)*15,y0-12-t,30+(1-fp)*30,t));
      cap=fp>0?'식각으로 불필요한 알루미늄 제거 → 배선만 남김':'알루미늄을 전면 증착(블랭킷)';
    }
  }
  $('xscap').textContent=cap;
}

/* ---------- 메인 루프 ---------- */
let last=performance.now();
(function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,(now-last)/1000); last=now;
  const over=inside&&!dragging&&hit();
  dom.style.cursor=over?'pointer':'grab';
  if(over&&!playing){ dwell+=dt; if(dwell>=2){ dwell=0; setPlay(true); } } else dwell=0;
  const dl=$('dwell');
  if(dwell>0){ dl.style.display='block'; dl.style.left=mx+'px'; dl.style.top=my+'px'; dl.style.background=`conic-gradient(var(--amber) ${dwell/2*360}deg,rgba(255,255,255,.12) 0)`; }
  else dl.style.display='none';
  if(playing){ setNorm(paramNorm+dt*parseFloat($('spd').value)/DURATION); if(paramNorm>=1) setPlay(false); }
  roAcc+=dt; if(roAcc>.1){ roAcc=0; renderRO(); }
  if(current>=1&&current<=5) drawXS(paramNorm,toggleIndex);
})(performance.now());
sync();
})();
