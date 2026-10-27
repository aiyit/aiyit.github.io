/* 반도체 8대 공정 — 실제감 강화 레이어 (v3)
   사용법: semiconductor-8-process.html 의 </body> 바로 위에  <script src="semi-enhance.js"></script>
   ① 설비 클릭/2초 응시 시 공정 자동 작동  ② 웨이퍼 단면 실시간 뷰  ③ 장비 계측값  ④ 재생 속도 조절
   ⑤ [v3] 장비별 색상·금속 재질(PBR)·HDR 스튜디오 반사·공정별 조명  ⑥ [v3] 각 공정 장면을 화면 중앙에 자동 배치
   * HTML 쪽 변경: 렌더러 색공간/톤매핑/그림자, 기본 조명, camTarget(회전 중심), 휠 확대 범위 */
(()=>{
const $=id=>document.getElementById(id), cl=v=>Math.max(0,Math.min(1,v));

/* ---------- UI 주입 ---------- */
const css=document.createElement('style');
css.textContent=`
#xs{width:100%;border:1px solid var(--line);border-radius:8px;background:#e9eef4;display:block}
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
if(getComputedStyle($('viewport')).position==='static') $('viewport').style.position='relative';
document.querySelector('.hint').textContent='드래그: 회전 · 휠: 확대/축소 · 설비 클릭 또는 2초 응시: 공정 작동';

/* ---------- 재생 제어 ---------- */
const DURATION=16; let playing=false, dwell=0, inside=false, mx=0, my=0, dx0=0, dy0=0, roAcc=1, armed=true, tapOK=false, hitT=0, hitV=false, lastCap='', lastKey='';
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
function setPlay(v){ playing=v; if(!v) armed=false; /* 멈춘 뒤엔 커서가 설비에서 벗어나야 다시 응시 인식 */ if(playing&&paramNorm>=0.999) setNorm(0); sync(); }
$('playBtn').addEventListener('click',()=>setPlay(!playing));
$('paramSlider').addEventListener('input',()=>{ if(playing) setPlay(false); });
const _load=loadStage;
loadStage=function(i){ _load(i); playing=false; dwell=0; roAcc=1; armed=false; lastKey=''; sync(); };

/* ---------- 설비 클릭 / 2초 응시 ---------- */
const dom=renderer.domElement, ray=new THREE.Raycaster(), m2=new THREE.Vector2();
const vis=o=>{ for(;o;o=o.parent) if(!o.visible||o.userData.noHit) return false; return true; };   /* 부모가 숨겨진 경우도 제외 */
function hit(){
  m2.set(mx/dom.clientWidth*2-1,-(my/dom.clientHeight)*2+1);
  ray.setFromCamera(m2,camera);
  return ray.intersectObjects(stageGroup.children,true).some(h=>{
    const mt=[].concat(h.object.material)[0];
    return vis(h.object)&&!(mt&&mt.transparent&&mt.opacity<.05);   /* 투명도 0 빔·플라즈마 제외 */
  });
}
function setXY(e){ const r=dom.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top; }
dom.addEventListener('pointermove',e=>{ setXY(e); inside=e.pointerType!=='touch'; });
dom.addEventListener('pointerleave',()=>{ inside=false; });
dom.addEventListener('pointerdown',e=>{ if(!e.isPrimary){ tapOK=false; return; } setXY(e); dx0=e.clientX; dy0=e.clientY; tapOK=true; });   /* 두 번째 손가락(핀치)이면 탭 취소 */
dom.addEventListener('pointerup',e=>{ if(!e.isPrimary||!tapOK) return; tapOK=false; setXY(e); if(Math.hypot(e.clientX-dx0,e.clientY-dy0)<5&&hit()) setPlay(!playing); });

/* ---------- 계측값 ---------- */
function readouts(n,m){
  const g=cl((n-.32)/.68), r=cl((n-.15)/.7), k=cl((n-.1)/.8);
  switch(current){
  case 0: return [['와이어 속도',(n>.15&&n<.87?'≈ 10':'0')+' m/s'],['웨이퍼 두께','775 μm'],['표면 거칠기(Ra)',n<.85?'≈ 2 μm':(2000*(1-cl((n-.85)/.15))+.2).toFixed(1)+' nm']];
  case 1: return [['산화로 온도',Math.round(25+975*cl((n-.12)/.28))+' °C'],['분위기',n>.32?'O₂ / H₂O (습식 산화)':'N₂ 대기'],['SiO₂ 두께',Math.round(g>0?20+480*Math.sqrt(g):0)+' nm']];
  case 2: return [['스핀 속도',n<.15?Math.round(3000*Math.sin(cl(n/.15)*Math.PI))+' rpm':'0 rpm'],['노광원','ArF 193 nm'],['노광량',Math.round(30*cl((n-.35)/.4))+' mJ/cm²'],['현상액','TMAH 2.38 %']];
  case 3: return [['방식',m?'건식 · CF₄/CHF₃/Ar 플라즈마':'습식 · BOE 용액'],['식각 깊이',Math.round(r*160)+' nm'],['측벽 형상',m?'수직 (≈ 90°)':'등방성 · 언더컷']];
  case 4: return [['챔버 압력',m?'3 mTorr (고진공)':'0.5 Torr (LPCVD)'],['공정 온도',m?'25 ~ 200 °C':'400 ~ 700 °C'],['박막 두께',Math.round(k*100)+' nm'],['피복 특성',m?'방향성 · 측벽 얇음':'등각 (Conformal)']];
  case 5: return [['배선 금속',m?'구리 (Cu)':'알루미늄 (Al)'],['성막 방식',m?'배리어/시드 + 전해도금(ECP)':'스퍼터링 (PVD)'],['비저항',m?'1.7 μΩ·cm':'2.7 μΩ·cm'],['금속 두께',Math.round(cl((n-.15)/.55)*(m?170:100))+' nm']];
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
const C={si:'#8a94a3',ox:'#4aa3bf',pr:'#6de08a',bg:'#e9eef4'};
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
      const ed=10*(1-fp); if(ed>0){ R('#cdd6de',0,y0-12-t,ed,t); R('#cdd6de',W-ed,y0-12-t,ed,t); }   /* 단면 양 끝까지 전면 증착 */
      cap=fp>0?'식각으로 불필요한 알루미늄 제거 → 배선만 남김':'알루미늄을 전면 증착(블랭킷)';
    }
  }
  if(cap!==lastCap){ lastCap=cap; $('xscap').textContent=cap; }
}

/* ---------- 메인 루프 ---------- */
let last=performance.now();
(function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,(now-last)/1000); last=now;
  hitT+=dt; if(hitT>.06){ hitT=0; hitV=inside&&!dragging&&hit(); }   /* 매 프레임 대신 약 16회/초만 판정 */
  if(!inside||dragging) hitV=false;
  const over=hitV;
  dom.style.cursor=dragging?'grabbing':(over?'pointer':'grab');
  if(!over) armed=true;
  if(over&&!playing&&armed){ dwell+=dt; if(dwell>=2){ dwell=0; setPlay(true); } } else dwell=0;
  const dl=$('dwell');
  if(dwell>0){ dl.style.display='block'; dl.style.left=mx+'px'; dl.style.top=my+'px'; dl.style.background=`conic-gradient(var(--amber) ${dwell/2*360}deg,rgba(0,0,0,.12) 0)`; }
  else dl.style.display='none';
  if(playing){ setNorm(paramNorm+dt*parseFloat($('spd').value)/DURATION); if(paramNorm>=1) setPlay(false); }
  roAcc+=dt; if(roAcc>.1){ roAcc=0; renderRO(); }
  if(current>=1&&current<=5){ const key=current+'|'+paramNorm.toFixed(4)+'|'+toggleIndex; if(key!==lastKey||current===2){ lastKey=key; drawXS(paramNorm,toggleIndex); } }   /* 값이 바뀔 때만 다시 그림(③은 노광 깜빡임 때문에 항상) */
})(performance.now());
sync();
})();

/* =========================================================
   v3 · 장비 사실감 + 화면 중앙 자동 프레이밍
   ① 선형 색공간 보정(어두운 색이 회색으로 뜨던 원인 해결)
   ② 스튜디오 HDR 환경맵(천장 조명 패널·소프트박스) → 금속이 실제처럼 반사
   ③ 재질 구분: 스테인리스(헤어라인)·전해연마·양극산화 알루미늄·도장 패널·구리·금·PCB·석영 유리
   ④ 공정별 조명(산화로 열광·UV 노광·플라즈마·스퍼터 글로우) + 신호등·HMI·안전 해저드 바닥
   ⑤ 장면의 화면상 중심을 계산해 항상 중앙에 배치(오빗 회전 중심도 장면 중심)
   ========================================================= */
(()=>{
const M=THREE, PI=Math.PI, PI2=PI/2, cl=v=>Math.max(0,Math.min(1,v)), lerp=(a,b,t)=>a+(b-a)*t;
const NEWCS=('SRGBColorSpace' in M), LIN=!NEWCS;                         /* three r152+ 는 색 변환을 자동 처리 */
const col=h=>{ const c=new M.Color(h); if(LIN) c.convertSRGBToLinear(); return c; };
const toLin=c=>{ if(LIN) c.convertSRGBToLinear(); return c; };
const srgb=t=>{ if(NEWCS) t.colorSpace=M.SRGBColorSpace; else t.encoding=M.sRGBEncoding; return t; };
const mkCanvas=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return [c,c.getContext('2d')]; };
const rep=(t,rx,ry)=>{ t.wrapS=t.wrapT=M.RepeatWrapping; t.repeat.set(rx,ry); t.anisotropy=8; return t; };

/* ---------- 조명 보조 ---------- */
scene.add(keyLight.target);
const fx=new M.PointLight(0xffffff,0,14,2); scene.add(fx);              /* 공정별 열광·플라즈마·UV 발광용 */

/* ---------- 스튜디오 HDR 환경맵 ---------- */
function fallbackEnv(){
  const [c,g]=mkCanvas(512,256), gr=g.createLinearGradient(0,0,0,256); gr.addColorStop(0,'#fff'); gr.addColorStop(.5,'#9fb2c6'); gr.addColorStop(1,'#2d3846');
  g.fillStyle=gr; g.fillRect(0,0,512,256); g.fillStyle='#fff'; [[40,30,110,34],[240,20,140,30],[410,45,80,44]].forEach(a=>g.fillRect(...a));
  const et=srgb(new M.CanvasTexture(c)); et.mapping=M.EquirectangularReflectionMapping;
  const pm=new M.PMREMGenerator(renderer); scene.environment=pm.fromEquirectangular(et).texture; pm.dispose(); et.dispose();
}
(function buildEnv(){
  try{
    const es=new M.Scene(), rgb=(r,g,b)=>new M.Color().setRGB(r,g,b), mk=(r,g,b)=>new M.MeshBasicMaterial({color:rgb(r,g,b),side:M.BackSide});
    /* +x, -x, 천장, 바닥, +z, -z */
    es.add(new M.Mesh(new M.BoxGeometry(80,40,80),[mk(.5,.58,.72),mk(.46,.54,.68),mk(.9,.95,1.05),mk(.07,.08,.1),mk(.48,.56,.7),mk(.42,.5,.64)]));
    const panel=(w,h,x,y,z,rx,ry,c,i)=>{ const m=new M.Mesh(new M.PlaneGeometry(w,h),new M.MeshBasicMaterial({color:rgb(c[0]*i,c[1]*i,c[2]*i),side:M.DoubleSide})); m.position.set(x,y,z); m.rotation.set(rx,ry,0); es.add(m); };
    for(let r=-1;r<=1;r++) for(let k=-2;k<=1;k++) panel(7,3,k*10+5,19.5,r*10,PI2,0,[1,1,1.03],18);   /* 클린룸 천장 FFU 조명 패널 */
    panel(22,12,-39.4,8,0,0,PI2,[1,.82,.58],7);       /* 왼쪽 웜 소프트박스 */
    panel(22,12,39.4,8,6,0,-PI2,[.68,.84,1],8);       /* 오른쪽 쿨 소프트박스 */
    panel(44,2.2,0,6,-39.4,0,0,[.85,.92,1],6);        /* 뒤쪽 스트립 라이트 */
    panel(30,2,0,3,39.4,0,PI,[1,1,1],3.5);            /* 앞쪽 스트립(카메라 쪽 반사) */
    const pm=new M.PMREMGenerator(renderer); scene.environment=pm.fromScene(es,.02).texture; pm.dispose();
    es.traverse(o=>{ if(o.geometry) o.geometry.dispose(); [].concat(o.material||[]).forEach(m=>m&&m.dispose()); });
  }catch(e){ console.warn('HDR 환경맵 생성 실패 → 단순 환경맵 사용',e); fallbackEnv(); }
})();

/* ---------- 텍스처 ---------- */
const brushedTex=(()=>{ const [c,g]=mkCanvas(256,256); g.fillStyle='#b8b8b8'; g.fillRect(0,0,256,256);
  for(let i=0;i<1600;i++){ const y=Math.random()*256, v=140+Math.random()*115|0; g.fillStyle=`rgba(${v},${v},${v},${.25+Math.random()*.45})`; g.fillRect(0,y,256,Math.random()<.2?2:1); }
  return rep(new M.CanvasTexture(c),1,1); })();                           /* 헤어라인 스테인리스: 거칠기 맵(색공간 변환 없음) */
const tileTex=(()=>{ const [c,g]=mkCanvas(256,256); g.fillStyle='#bcc6d0'; g.fillRect(0,0,256,256);
  g.strokeStyle='#8996a5'; g.lineWidth=3; g.strokeRect(1.5,1.5,253,253); g.beginPath(); g.moveTo(128,0); g.lineTo(128,256); g.moveTo(0,128); g.lineTo(256,128); g.stroke();
  for(let ty=0;ty<2;ty++) for(let tx=0;tx<2;tx++) for(let i=0;i<8;i++) for(let j=0;j<8;j++){ const x=tx*128+11+i*15.2, y=ty*128+11+j*15.2;
    g.fillStyle='#6f7c8b'; g.beginPath(); g.arc(x,y,3.6,0,PI*2); g.fill(); g.fillStyle='rgba(255,255,255,.4)'; g.beginPath(); g.arc(x-.7,y-.7,1.5,0,PI*2); g.fill(); }
  return rep(srgb(new M.CanvasTexture(c)),30,30); })();                 /* 클린룸 타공(펀칭) 바닥 패널 */
const hazTex=(()=>{ const [c,g]=mkCanvas(128,32); g.fillStyle='#f2c200'; g.fillRect(0,0,128,32); g.fillStyle='#15171b';
  for(let x=-64;x<192;x+=32){ g.beginPath(); g.moveTo(x,32); g.lineTo(x+16,32); g.lineTo(x+48,0); g.lineTo(x+32,0); g.closePath(); g.fill(); }
  return srgb(new M.CanvasTexture(c)); })();                              /* 안전 해저드(노랑/검정) 사선 */
const diamondTex=(()=>{ const [c,g]=mkCanvas(64,64); g.fillStyle='#2c3139'; g.fillRect(0,0,64,64);
  [[16,16],[48,48]].forEach(([x,y])=>{ g.save(); g.translate(x,y); g.rotate(PI/4); g.fillStyle='#515a67'; g.fillRect(-9,-3,18,6); g.restore(); });
  [[48,16],[16,48]].forEach(([x,y])=>{ g.save(); g.translate(x,y); g.rotate(-PI/4); g.fillStyle='#515a67'; g.fillRect(-9,-3,18,6); g.restore(); });
  return srgb(new M.CanvasTexture(c)); })();                              /* 장비 하부 체커 플레이트 */
const hmiTex=(()=>{ const [c,g]=mkCanvas(256,160); g.fillStyle='#071a2e'; g.fillRect(0,0,256,160);
  g.fillStyle='#0f6f8f'; g.fillRect(0,0,256,18); g.fillStyle='#fff'; g.font='bold 11px monospace'; g.fillText('PROCESS MONITOR',8,13);
  g.fillStyle='#0b2b47'; g.fillRect(8,26,160,84); g.strokeStyle='#37e6ff'; g.lineWidth=2; g.beginPath();
  for(let x=0;x<=160;x+=4){ const y=68+Math.sin(x*.09)*22+Math.sin(x*.31)*5; x?g.lineTo(8+x,26+y-26):g.moveTo(8+x,26+y-26); } g.stroke();
  g.strokeStyle='rgba(255,255,255,.12)'; g.lineWidth=1; for(let i=1;i<5;i++){ g.beginPath(); g.moveTo(8,26+i*17); g.lineTo(168,26+i*17); g.stroke(); }
  [['#2bd86b',60],['#2bd86b',44],['#ffb020',70],['#2bd86b',52]].forEach(([cc,h],i)=>{ g.fillStyle=cc; g.fillRect(180+i*18,110-h*.9,12,h*.9); });
  g.fillStyle='#2bd86b'; g.beginPath(); g.arc(18,132,6,0,PI*2); g.fill(); g.fillStyle='#cfe9ff'; g.font='11px monospace'; g.fillText('RUN   TEMP 1000C',32,136); g.fillStyle='#ffb020'; g.fillText('ALM 0',196,136);
  return srgb(new M.CanvasTexture(c)); })();                              /* 장비 터치스크린(HMI) */
const haloTex=(()=>{ const [c,g]=mkCanvas(128,128), r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.25,'rgba(255,255,255,.5)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,128,128); return new M.CanvasTexture(c); })();
const waferTex=(()=>{ const [c,g]=mkCanvas(512,512), rb=g.createRadialGradient(256,256,10,256,256,300);
  rb.addColorStop(0,'#5e4f93'); rb.addColorStop(.55,'#2f63a3'); rb.addColorStop(1,'#243a63'); g.fillStyle=rb; g.fillRect(0,0,512,512);
  if(g.createConicGradient){ const cg=g.createConicGradient(0,256,256); ['#ff3d6e','#ffb43d','#59ff9a','#3d9bff','#b04dff','#ff3d6e'].forEach((cc,i)=>cg.addColorStop(i/5,cc)); g.globalAlpha=.5; g.fillStyle=cg; g.fillRect(0,0,512,512); g.globalAlpha=1; }
  g.strokeStyle='rgba(255,255,255,.32)'; g.lineWidth=1; for(let i=0;i<=512;i+=34){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,512); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(512,i); g.stroke(); }
  for(let i=0;i<15;i++) for(let j=0;j<15;j++) if((i+j)%2){ g.fillStyle='rgba(10,20,60,.16)'; g.fillRect(i*34+2,j*34+2,30,30); }
  const t=srgb(new M.CanvasTexture(c)); t.anisotropy=8; return t; })();   /* 패턴 웨이퍼: 다이 격자 + 빛 회절 무지개 */

/* ---------- PBR 재질 라이브러리 (색은 sRGB 16진수로 쓰면 자동 보정) ---------- */
const PB=(o,phys)=>{ const m=phys?new M.MeshPhysicalMaterial():new M.MeshStandardMaterial(); const {color,emissive,...r}=o; Object.assign(m,r);
  if(color!==undefined) m.color=col(color); if(emissive!==undefined) m.emissive=col(emissive); m.userData.gr=1; return m; };
const mat={
  steel:()=>PB({color:0xdde1e6,metalness:1,roughness:.55,roughnessMap:brushedTex,envMapIntensity:1.3}),            /* 헤어라인 스테인리스 */
  brushed:()=>PB({color:0xb4bac2,metalness:1,roughness:.65,roughnessMap:brushedTex,envMapIntensity:1.15}),         /* 새틴 알루미늄 */
  polished:()=>PB({color:0xf0f3f6,metalness:1,roughness:.07,envMapIntensity:1.6}),                                 /* 전해연마(거울) */
  anod:c=>PB({color:c,metalness:.85,roughness:.36,envMapIntensity:1.15}),                                           /* 양극산화 알루미늄 */
  paint:c=>PB({color:c,metalness:0,roughness:.42,clearcoat:.55,clearcoatRoughness:.28,envMapIntensity:.8},true),    /* 분체도장 패널 */
  dark:()=>PB({color:0x2a3039,metalness:.65,roughness:.42,envMapIntensity:1}),
  black:()=>PB({color:0x111316,metalness:.25,roughness:.65,envMapIntensity:.8}),
  rubber:()=>PB({color:0x17191c,metalness:0,roughness:.9,envMapIntensity:.4}),
  pu:c=>PB({color:c,metalness:0,roughness:.5,clearcoat:.3,clearcoatRoughness:.4,envMapIntensity:.7},true),          /* 폴리우레탄 롤러 */
  hose:c=>PB({color:c,metalness:0,roughness:.45,clearcoat:.5,clearcoatRoughness:.3,envMapIntensity:.8},true),       /* 가스·냉각수 배관(색 구분) */
  copper:()=>PB({color:0xe48a50,metalness:1,roughness:.24,envMapIntensity:1.4}),
  brass:()=>PB({color:0xe0bb62,metalness:1,roughness:.3,envMapIntensity:1.3}),
  gold:()=>PB({color:0xf6c64f,metalness:1,roughness:.2,envMapIntensity:1.5}),
  pcb:()=>PB({color:0x15864f,metalness:.1,roughness:.4,clearcoat:.8,clearcoatRoughness:.2},true),
  ceramic:()=>PB({color:0xeef0ea,metalness:0,roughness:.35,clearcoat:.4},true),
  wafer:()=>PB({color:0x8d98ac,metalness:1,roughness:.08,envMapIntensity:1.7}),
  glass:()=>{ const m=PB({color:0xd6ecf8,metalness:0,roughness:.04,transparent:true,opacity:.13,side:M.DoubleSide,depthWrite:false,envMapIntensity:2.2}); m.userData.ds=1; return m; },
  quartz:()=>{ const m=PB({color:0xeaf6ff,metalness:0,roughness:.03,transparent:true,opacity:.2,side:M.DoubleSide,depthWrite:false,envMapIntensity:2.2}); m.userData.ds=1; return m; },
  glow:(c,i)=>PB({color:c,emissive:c,emissiveIntensity:i||1.6,roughness:.4,metalness:0}),
  beam:c=>{ const m=new M.MeshBasicMaterial({color:col(c),transparent:true,opacity:0,depthWrite:false,side:M.DoubleSide,blending:M.AdditiveBlending}); m.userData.ds=1; m.userData.gr=1; return m; }
};

/* ---------- 지오메트리/배치 헬퍼 ---------- */
const B=(w,h,d)=>new M.BoxGeometry(w,h,d);
const Y=(r,h,o,rt,ts,tl)=>new M.CylinderGeometry(rt==null?r:rt,r,h,48,1,!!o,ts||0,tl||PI*2);
const ring=(r1,r2,h)=>new M.LatheGeometry([[r1,-h/2],[r2,-h/2],[r2,h/2],[r1,h/2],[r1,-h/2]].map(a=>new M.Vector2(a[0],a[1])),48);
const openGeo=geo=>{ const p=geo.parameters||{}; return geo.type==='LatheGeometry'||!!p.openEnded||(geo.type==='CylinderGeometry'&&p.thetaLength<PI*2-.01)||(geo.type==='SphereGeometry'&&p.thetaLength<PI-.01); };
function add(g,geo,m,x,y,z,rx,ry,rz){
  const ms=[].concat(m), og=openGeo(geo);
  ms.forEach(q=>{ if(!q.userData.ds) q.side=og?M.DoubleSide:M.FrontSide; });   /* 닫힌 형상은 단면 렌더 → 그림자 아티팩트·부하 감소 */
  const o=new M.Mesh(geo,m); o.position.set(x||0,y||0,z||0); o.rotation.set(rx||0,ry||0,rz||0);
  o.castShadow=!(ms[0].transparent||ms[0].userData.ns); o.receiveShadow=true; g.add(o); return o; }
function pipe(g,a,b,r,m){ const A=new M.Vector3(a[0],a[1],a[2]), Bv=new M.Vector3(b[0],b[1],b[2]), d=Bv.clone().sub(A), len=d.length();
  const mm=m||mat.steel(); mm.side=M.FrontSide; const o=new M.Mesh(Y(r,len),mm);
  o.position.copy(A).add(Bv).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new M.Vector3(0,1,0),d.normalize()); o.castShadow=true; o.receiveShadow=true; g.add(o); return o; }
function pipes(g,pts,r,m){ const mm=m||mat.steel(); for(let k=0;k<pts.length-1;k++) pipe(g,pts[k],pts[k+1],r,mm);
  for(let k=1;k<pts.length-1;k++){ const s=add(g,new M.SphereGeometry(r*1.02,14,10),mm,pts[k][0],pts[k][1],pts[k][2]); s.castShadow=true; } }   /* 꺾임부 이음매 */
function halo(g,x,y,z,s,c,o){ const sp=new M.Sprite(new M.SpriteMaterial({map:haloTex,color:col(c),transparent:true,opacity:o==null?0:o,blending:M.AdditiveBlending,depthWrite:false}));
  sp.position.set(x,y,z); sp.scale.set(s,s,1); g.add(sp); return sp; }
const TW=[];                                                              /* 신호등(타워 램프) 목록 */
function tower(g,x,y,z){ add(g,Y(.065,.1),mat.black(),x,y+.05,z);
  const lamps=[0xff3030,0xffb020,0x2bd86b].map((c,k)=>{ const m=PB({color:c,emissive:c,emissiveIntensity:.12,roughness:.3}); add(g,Y(.078,.13),m,x,y+.17+k*.14,z); return m; });
  add(g,Y(.05,.05),mat.black(),x,y+.62,z); TW.push(lamps); }
function animTowers(t,p){ const run=p>.001&&p<.999; TW.forEach(L=>{ L[2].emissiveIntensity=run?2.4:.12; L[1].emissiveIntensity=run?.12:(Math.sin(t*5)>0?2.4:.12); L[0].emissiveIntensity=.12; }); }
function cabinet(g,x,z,h,acc){ h=h||2.6; acc=acc==null?0x1f7ae0:acc; const y0=-2.4;
  add(g,B(1.5,h,1.2),mat.paint(0xeceff2),x,y0+h/2,z);                                   /* 본체(분체도장) */
  add(g,B(1.58,.22,1.28),mat.dark(),x,y0+.11,z);                                         /* 하부 몰딩 */
  add(g,B(1.58,.1,1.28),mat.paint(acc),x,y0+h+.05,z);                                    /* 상부 컬러 캡 */
  add(g,B(.1,h-.34,.025),mat.paint(acc),x-.62,y0+h/2+.1,z+.607);                          /* 컬러 스트라이프 */
  add(g,B(1.02,.66,.07),mat.black(),x+.06,y0+h*.66,z+.62,-.12,0,0);                      /* HMI 베젤 */
  const scr=new M.Mesh(new M.PlaneGeometry(.92,.56),new M.MeshBasicMaterial({map:hmiTex})); scr.position.set(x+.06,y0+h*.66+.002,z+.658); scr.rotation.x=-.12; g.add(scr);
  add(g,B(.045,.5,.05),mat.steel(),x+.58,y0+h*.34,z+.62);                                /* 손잡이 */
  for(let k=0;k<4;k++) add(g,B(1.0,.04,.03),mat.dark(),x,y0+h*.2-k*.1,z+.61);          /* 환기 루버 */
  add(g,Y(.075,.07),PB({color:0xd8161a,metalness:.1,roughness:.35,clearcoat:.6},true),x-.42,y0+h*.4,z+.64,PI2,0,0);   /* 비상정지 버튼 */
  add(g,Y(.11,.03),PB({color:0xf2c200,metalness:.1,roughness:.5}),x-.42,y0+h*.4,z+.615,PI2,0,0);
  tower(g,x+.5,y0+h+.1,z-.25); }
function chamberShell(g,r,y0,y1){ const h=y1-y0, c=(y0+y1)/2;
  add(g,Y(r,h,true),mat.glass(),0,c,0); add(g,Y(r+.2,.3),mat.steel(),0,y1+.15,0); add(g,Y(r+.2,.3),mat.steel(),0,y0-.15,0);
  [y0,y1].forEach(v=>add(g,Y(r+.05,.12,true),mat.polished(),0,v,0)); }
function pump(g,x,y){ add(g,Y(.8,1.3),mat.paint(0x1d5ea8),x,y,0); add(g,Y(.95,.18),mat.dark(),x,y+.7,0); add(g,Y(.4,.5),mat.dark(),x,y-.8,0);
  add(g,Y(.82,.06),mat.steel(),x,y+.2,0); add(g,B(.5,.18,.04),mat.paint(0xf2c200),x,y-.1,.82); }
const BU=[];
const hide=(L,...ix)=>ix.forEach(i=>{ const o=L.children[i]; if(o){ o.visible=false; o.userData.noFrame=true; } });   /* 원본 구조가 달라져도 오류 없이 건너뜀 */
const mv=(L,i,x,y,z)=>{ if(L.children[i]) L.children[i].position.set(x,y,z); };

/* =========================================================
   실제 장비 외형 + 공정별 장비 색상(liveries)
   ① 멀티 와이어 쏘 — 아이보리 본체·안전 오렌지 커버·황동 와이어·녹색 PU 롤러
   ② 수직 확산로   — 흰색 히터 재킷·스테인리스 돔·청색 양극산화 스커트·적열 히터
   ③ 코터/스캐너   — 흰색 본체·코발트 블루 포인트·황금빛 렌즈 링·UV 노광
   ④ CCP 식각      — 전해연마 상부·금도금 RF 매처·청색 드라이 펌프·보라 플라즈마
   ⑤ PVD/CVD       — 구리 냉각 배관·금 타겟 캐소드·청색 챔버 밸브
   ⑥ CMP           — 청색 플래튼·우레탄 패드·흰색 갠트리
   ⑦ 프로버        — 흰색 본체·초록 PCB 프로브카드·금 핀
   ⑧ 본더/몰딩     — 차콜 프레임·청색 프레스·금 캐필러리
   ========================================================= */

/* ① 멀티 와이어 쏘 */
BU[0]=(g,L)=>{
  const ivory=()=>mat.paint(0xece9df), ORG=0xe8742a;
  add(g,B(10.4,.5,3.6),ivory(),-.6,-2.12,0); add(g,B(10.5,.1,3.7),mat.dark(),-.6,-1.84,0);     /* 하부 본체 */
  add(g,B(11.8,5.2,.25),ivory(),-1.5,.3,-2.0); add(g,B(11.9,.28,.34),mat.paint(ORG),-1.5,2.98,-2.0); /* 후면 패널 + 오렌지 상단 커버 */
  add(g,B(10.6,.07,.12),mat.glow(0xf4f9ff,2.6),-1.4,2.5,-1.82);                                    /* 내부 LED 조명 */
  add(g,B(.34,5.2,.34),mat.anod(0x2a5ea8),4.55,.3,-1.9);
  const sm=mat.dark(); [-5.6,-3.2,-.8,1.6].forEach(x=>add(g,B(.025,4.7,.03),sm,x,.3,-1.86));                                         /* 패널 이음새 */
  add(g,B(3.4,1.4,.05),PB({color:0x0e141b,metalness:.3,roughness:.08,envMapIntensity:1.8}),2.6,1.5,-1.85); add(g,B(3.5,.08,.07),mat.steel(),2.6,2.22,-1.85); add(g,B(3.5,.08,.07),mat.steel(),2.6,.78,-1.85);   /* 조작창(유리) */
  add(g,B(5,.5,1.6),mat.brushed(),-2.4,-1.7,0); add(g,B(4.4,.25,.6),mat.black(),-2.4,-1.25,0);  /* 이송 테이블 + 접착 빔 */
  const web=new M.Group(); g.add(web); const wires=new M.Group(); web.add(wires); const brass=mat.brass();
  for(let k=0;k<11;k++) add(wires,Y(.022,4.4),brass,-4.4+k*.4,0,0,PI2,0,0);                    /* 황동 코팅 와이어 */
  [-2.1,2.1].forEach(z=>{ add(web,Y(.32,4.8),mat.pu(0x2f7a58),-2.4,0,z,0,0,PI2); for(let k=0;k<12;k++) add(web,Y(.335,.03),mat.steel(),-4.4+k*.4,0,z,0,0,PI2); });
  add(web,B(4.6,.12,.25),mat.anod(0x3b82c4),-2.4,.55,0);                                       /* 슬러리 노즐 바 */
  const reels=[1.4,-.2].map(y=>{ const r=new M.Group(); r.position.set(-6.0,y,-1.6); g.add(r);
    [.3,-.3].forEach(z=>add(r,Y(.92,.1),mat.paint(ORG),0,0,z,PI2,0,0)); add(r,Y(.78,.5),mat.brass(),0,0,0,PI2,0,0); add(r,Y(.3,.7),mat.dark(),0,0,0,PI2,0,0);
    add(r,B(1.7,.08,.04),mat.steel(),0,0,.36); add(r,B(.08,1.7,.04),mat.steel(),0,0,.36); return r; });
  add(g,B(1.5,.08,2.5),mat.steel(),2.45,-1.12,0); [1.2,-1.2].forEach(z=>add(g,B(1.5,.9,.05),mat.quartz(),2.45,-.66,z)); add(g,B(1.5,.06,.06),mat.paint(ORG),2.45,-.2,1.2); add(g,B(1.5,.06,.06),mat.paint(ORG),2.45,-.2,-1.2);   /* 웨이퍼 카세트 */
  cabinet(g,5.6,-1,2.6,ORG); tower(g,-3.6,3.12,-2.0);
  let t=0; return (dt,p)=>{ t+=dt; hide(L,2);
    const sp=cl((p-.15)/.7), cut=p>.15&&p<.87; web.position.y=lerp(1.35,-1.1,sp);
    wires.position.z=cut?Math.sin(t*4)*.18:0; reels.forEach(r=>r.rotation.z+=dt*(p>.15&&p<.87?3:0)); };
};

/* ② 수직 배치 확산로 */
BU[1]=(g,L)=>{
  hide(L,0,1,2,3,4,5,8);
  add(g,Y(2.15,5.4,true),mat.quartz(),0,.2,0); add(g,new M.SphereGeometry(2.15,40,20,0,PI*2,0,PI2),mat.quartz(),0,2.9,0);
  add(g,Y(2.9,5.2,true,undefined,.9,PI*2-1.8),mat.paint(0xeceff2),0,.2,0);                      /* 히터 재킷(컷어웨이) */
  add(g,Y(2.6,5.0,true,undefined,.9,PI*2-1.8),PB({color:0xe9dcc2,roughness:.95,metalness:0}),0,.2,0);   /* 세라믹 단열재 */
  add(g,new M.SphereGeometry(2.9,40,20,0,PI*2,0,PI2),mat.steel(),0,2.8,0); add(g,Y(3.12,.5),mat.anod(0x2a5ea8),0,-2.15,0);
  const coils=[]; for(let k=0;k<9;k++){ const m=PB({color:0xc84a22,metalness:.6,roughness:.4,emissive:0x000000}); coils.push(m); add(g,new M.TorusGeometry(2.4,.05,10,64),m,0,-2.0+k*.55,0,PI2,0,0); }
  pipes(g,[[0,3.9,0],[0,5.0,0],[-3.6,5.0,0],[-3.6,-1.4,0]],.12,mat.hose(0xf2c200)); add(g,B(.7,.9,.7),mat.paint(0xeceff2),-3.6,.6,0); add(g,B(.74,.12,.74),mat.paint(0x2b6fd6),-3.6,1.1,0);   /* 가스(노랑) 배관 + MFC */
  pipe(g,[2.9,-2.1,0],[4.2,-2.1,0],.2);
  const boat=new M.Group(); g.add(boat);
  add(boat,Y(2.4,.22),mat.steel(),0,-2.45,0); add(boat,Y(1.0,.8),mat.quartz(),0,-2.0,0); add(boat,Y(1.9,.1),mat.quartz(),0,-1.75,0); add(boat,Y(1.9,.1),mat.quartz(),0,1.9,0);
  [[1.3,-1.1],[-1.3,-1.1],[0,-1.75]].forEach(a=>add(boat,Y(.07,3.7),mat.quartz(),a[0],.1,a[1])); const wm=mat.wafer(); for(let k=-4;k<=4;k++) if(k) add(boat,Y(1.6,.05),wm,0,k*.38,0);
  add(boat,B(3.3,.25,.4),mat.steel(),1.65,-2.55,0);
  add(g,B(.4,7,.5),mat.anod(0x2a5ea8),3.3,.8,0);
  cabinet(g,5.4,0,2.6,0x13a3a0);
  const hot=col(0xff5a1a);
  return (dt,p)=>{
    const ins=cl((p-.12)/.2), by=-2.8*(1-ins); boat.position.y=by; mv(L,6,0,by,0); mv(L,7,0,by,0);
    const heat=cl((p-.15)/.25); coils.forEach(m=>{ m.emissive.copy(hot); m.emissiveIntensity=heat*2.2; });
    fx.color.copy(hot); fx.position.set(0,.6,1.2); fx.distance=11; fx.intensity=heat*2.6;
  };
};

/* ③ 스핀 코터(트랙) + 스캐너 */
BU[2]=(g,L)=>{
  const mask=L.children[2]||new M.Object3D(), beam=L.children[3]||new M.Mesh(new M.BufferGeometry(),mat.beam(0xcfa8ff)); beam.visible=false; beam.userData.noFrame=true;
  const C=new M.Group(), Sc=new M.Group(); g.add(C); g.add(Sc); const white=()=>mat.paint(0xeef0f3), BLU=0x1f4e9c;
  /* 코터: 스핀 보울 + 약액 디스펜스 암 */
  add(C,B(5.6,2.1,3.6),white(),0,-1.35,0); add(C,B(5.64,.14,3.64),mat.paint(BLU),0,-1.0,0);
  add(C,Y(2.2,.7,true),mat.polished(),0,.1,0); add(C,Y(2.28,.06,true),mat.steel(),0,.45,0); add(C,Y(2.2,.1),mat.dark(),0,-.3,0);
  add(C,B(.3,2.0,.3),mat.steel(),2.9,.5,0); pipes(C,[[2.9,1.5,0],[.2,1.5,0]],.07,mat.steel()); add(C,Y(.05,.4),mat.black(),.2,1.3,0);
  add(C,Y(.3,.75,false),PB({color:0xc7741a,metalness:0,roughness:.1,transparent:true,opacity:.88}),3.8,-.1,1.1); add(C,Y(.18,.12),mat.black(),3.8,.33,1.1);   /* 포토레지스트(호박색) 병 */
  pipes(C,[[3.8,.4,1.1],[3.8,1.5,1.1],[2.9,1.5,0]],.04,mat.hose(0xe8b020));
  /* 스캐너: 본체 데크 + 웨이퍼 스테이지 + 투영렌즈 + 조명계 */
  add(Sc,B(8,1.6,6),white(),0,-1.6,0); add(Sc,B(8.04,.14,6.04),mat.paint(BLU),0,-1.15,0);
  add(Sc,Y(2.2,.5),mat.dark(),0,-.33,0); add(Sc,B(7,.2,.35),mat.brushed(),0,-.8,1.5); add(Sc,B(7,.2,.35),mat.brushed(),0,-.8,-1.5); add(Sc,B(.35,.2,5),mat.brushed(),2.8,-.8,0);
  add(Sc,Y(.55,1.3,false,1.15),mat.paint(0x2a2f38),0,1.05,0); add(Sc,Y(.5,.04),PB({color:0x101830,metalness:.2,roughness:.05,envMapIntensity:2}),0,.4,0);
  [.55,.95,1.35].forEach(y=>add(Sc,Y(.9-(y-.55)*.2,.07),mat.gold(),0,y,0));                      /* 렌즈 경통의 황동/금 링 */
  [-1,1].forEach(s=>add(Sc,B(.35,7.4,.35),white(),s*2.9,1.3,-2.3)); add(Sc,B(6.2,.4,.4),mat.steel(),0,5.2,-2.3); add(Sc,B(.9,.7,2.6),white(),0,5.2,-1.2);
  add(Sc,B(2.6,1.1,2.6),white(),0,6.3,0); add(Sc,B(2.64,.16,2.64),mat.paint(BLU),0,6.0,0); add(Sc,Y(1.0,.9,true,1.1),mat.brushed(),0,5.5,0);
  pipes(Sc,[[-5.5,.4,0],[-5.5,6.3,0],[-1.3,6.3,0]],.1,mat.hose(0x2b6fd6));
  const frame=new M.Group(); Sc.add(frame);
  [[0,1.8],[0,-1.8]].forEach(a=>add(frame,B(3.8,.14,.2),mat.steel(),a[0],0,a[1])); [[1.9,0],[-1.9,0]].forEach(a=>add(frame,B(.2,.14,3.8),mat.steel(),a[0],0,a[1]));
  const up=new M.Mesh(Y(1.4,1,true,1.1),mat.beam(0xb58cff)), lo=new M.Mesh(Y(.12,.35,true,.55),mat.beam(0xb58cff)); Sc.add(up); lo.position.y=.22; Sc.add(lo);
  cabinet(g,-5.5,0,2.6,BLU); const uv=col(0xa070ff);
  return (dt,p)=>{
    C.visible=p<.3; Sc.visible=p>=.3; mask.visible=p>=.12;
    frame.position.y=mask.position.y; const h=Math.max(.01,mask.position.y-1.7); up.scale.y=h; up.position.y=1.7+h/2;
    const o=Math.min(.5,beam.material.opacity*2.5); up.material.opacity=o; lo.material.opacity=o;
    fx.color.copy(uv); fx.position.set(0,2.4,0); fx.distance=9; fx.intensity=Sc.visible?o*7:0;
  };
};

/* ④ CCP 플라즈마 식각 챔버 */
BU[3]=(g,L)=>{
  chamberShell(g,2.7,-1.1,1.9);
  add(g,Y(1.72,.45),mat.dark(),0,-.375,0); add(g,Y(2.0,.5),mat.steel(),0,-.85,0); add(g,Y(.6,1.1),mat.steel(),0,-1.55,0);
  add(g,ring(1.66,2.0,.22),mat.black(),0,-.04,0); add(g,ring(2.0,2.35,.2),mat.ceramic(),0,-.12,0); add(g,ring(2.4,2.65,.12),mat.dark(),0,-.55,0);   /* 엣지링·포커스링(세라믹) */
  add(g,Y(2.0,.25),mat.polished(),0,1.5,0); add(g,Y(.55,.6),mat.steel(),0,2.35,0);
  const hb=mat.black(); for(let k=0;k<4;k++){ const n=k?6*k:1; for(let j=0;j<n;j++){ const a=j/n*PI*2; add(g,Y(.045,.27),hb,Math.cos(a)*k*.38,1.5,Math.sin(a)*k*.38); } }   /* 샤워헤드 홀 */
  add(g,B(1.1,.7,.9),PB({color:0xe0b84e,metalness:.95,roughness:.28,envMapIntensity:1.4}),1.5,2.75,0); pipe(g,[1.0,2.7,0],[.3,2.4,0],.05,mat.copper()); add(g,Y(.16,.5),mat.steel(),1.5,2.2,0);   /* RF 매처(금도금) */
  pipes(g,[[0,2.65,0],[0,3.3,0],[-3.2,3.3,0],[-3.2,-1.0,0]],.1,mat.hose(0xf2c200)); add(g,B(.7,.9,.7),mat.paint(0xeceff2),-3.2,1.2,0); add(g,B(.74,.1,.74),mat.paint(0x14b8a6),-3.2,1.64,0);
  pipe(g,[2.9,-.9,0],[4.4,-.9,0],.3); [3.2,3.6,4.0].forEach(x=>add(g,Y(.33,.06),mat.polished(),x,-.9,0,0,0,PI2)); pump(g,4.4,-1.7);
  add(g,B(1.2,.9,1.0),mat.paint(0xeceff2),-3.5,-1.9,1.4); add(g,B(1.24,.12,1.04),mat.paint(0x2b6fd6),-3.5,-1.4,1.4); pipes(g,[[-3.5,-1.9,1.4],[0,-1.9,1.4],[0,-1.4,0]],.07,mat.copper());
  cabinet(g,5.8,1.8,2.6,0x7a3fd1);
  const pl=add(g,Y(1.9,1.1),mat.beam(0xb06cff),0,.7,0), ph=halo(g,0,.6,0,5,0xb06cff,0); let t=0; const pc=col(0xb06cff);
  return (dt,p,m)=>{ t+=dt; const on=(m===1&&p>.12&&p<.88), f=on?(.7+.3*Math.sin(t*18)):0;
    pl.material.opacity=f*.2; ph.material.opacity=f*.55; fx.color.copy(pc); fx.position.set(0,.7,.6); fx.distance=10; fx.intensity=f*3.2; };
};

/* ⑤ PVD(마그네트론 스퍼터) / CVD */
BU[4]=(g,L)=>{
  chamberShell(g,2.7,-1.2,4.2);
  add(g,Y(1.8,.35),mat.steel(),0,-.25,0); const hr=add(g,ring(1.5,1.85,.08),PB({color:0x4a3a30,metalness:.9,roughness:.35,emissive:0x000000}),0,.1,0); add(g,Y(.5,1.2),mat.steel(),0,-.95,0);
  add(g,Y(2.4,3.2,true,undefined,.9,PI*2-1.8),mat.brushed(),0,1.9,0);
  add(g,B(.6,1.2,1.6),mat.anod(0x2a5ea8),3.1,.3,0); pipe(g,[0,-1.4,0],[0,-1.8,0],.4); pump(g,0,-2.0);
  const pv=new M.Group(); pv.position.set(-2.4,2.85,0); pv.rotation.z=.75; g.add(pv);                       /* PVD 캐소드 */
  add(pv,Y(1.0,.14),mat.gold(),0,0,0); add(pv,ring(1.05,1.3,.22),mat.dark(),0,.05,0); add(pv,Y(1.15,.5),mat.steel(),0,.45,0); add(pv,Y(.3,.5),mat.dark(),0,.95,0);
  pipes(pv,[[.7,.5,0],[1.6,1.4,0]],.06,mat.hose(0x2b6fd6)); pipes(pv,[[-.7,.5,0],[-1.6,1.4,0]],.06,mat.copper()); const pvh=halo(pv,0,-.3,0,2.6,0x7aa8ff,0);
  const cv=new M.Group(); g.add(cv); add(cv,Y(1.9,.25),mat.polished(),0,3.6,0); pipes(cv,[[0,3.7,0],[0,4.9,0],[-3.4,4.9,0],[-3.4,-1,0]],.12,mat.hose(0xf2c200));
  cabinet(g,5.8,1.8,2.6,0xd4a017);
  const pc=col(0x7aa8ff), wc=col(0xff7a2a), hot=col(0xff6a2a); let t=0;
  return (dt,p,m)=>{ t+=dt; hide(L,1); const pvd=m===1, run=p>.1&&p<.98; pv.visible=pvd; cv.visible=!pvd;
    const f=run?(.8+.2*Math.sin(t*14)):0;
    pvh.material.opacity=pvd?f*.7:0; hr.material.emissive.copy(hot); hr.material.emissiveIntensity=pvd?0:cl((p-.1)/.2)*1.6;
    if(pvd){ fx.color.copy(pc); fx.position.set(-1.6,2.3,.6); fx.distance=9; fx.intensity=f*3.4; } else { fx.color.copy(wc); fx.position.set(0,.8,1.4); fx.distance=8; fx.intensity=cl((p-.1)/.2)*1.8; } };
};

/* ⑥ CMP / 금속 배선 */
BU[5]=(g,L)=>{
  add(g,B(7,1.4,5.6),mat.paint(0xeceff2),0,-1.7,0); add(g,B(7.04,.14,5.64),mat.paint(0x2b8be0),0,-1.2,0);
  add(g,Y(3.5,.5),mat.anod(0x2a5ea8),0,-.75,0); add(g,Y(3.2,.3),PB({color:0xd9d3c4,roughness:.92,metalness:0}),0,-.45,0);
  const gm=mat.dark(); for(let k=1;k<=5;k++) add(g,new M.TorusGeometry(k*.55,.02,6,64),gm,0,-.29,0,PI2,0,0);
  const head=new M.Group(); g.add(head); add(head,Y(2.0,.5),mat.steel(),0,.55,0); add(head,ring(1.7,2.0,.3),mat.black(),0,.15,0); add(head,Y(.4,.9),mat.dark(),0,1.2,0);
  add(head,B(3.6,.34,.5),mat.paint(0xeceff2),1.8,1.7,0);                                                  /* 스윙 암 */
  add(g,B(.5,5.2,.5),mat.paint(0xeceff2),3.6,.2,0); add(g,B(.52,.2,.52),mat.paint(0x2b8be0),3.6,2.6,0);
  pipes(g,[[3.6,1.0,0],[2.6,.6,1.2],[1.4,.5,1.2]],.07,mat.hose(0x2b6fd6));                               /* 슬러리 라인 */
  cabinet(g,5.2,0,2.6,0x2b8be0);
  return (dt,p,m)=>{ const cu=m===1; head.visible=cu&&p>.55; head.position.y=lerp(2.2,.3,cl((p-.55)/.15)); head.rotation.y+=dt*2; };
};

/* ⑦ 프로버(EDS) */
BU[6]=(g,L)=>{
  const probe=L.children[L.children.length-1]||new M.Object3D(); probe.userData.noFrame=true;
  add(g,B(9,.6,6),mat.paint(0xeef0f3),0,-2.1,0); add(g,B(9.04,.1,6.04),mat.paint(0x2a5ea8),0,-1.95,0); add(g,B(7,.05,4.6),mat.dark(),0,-1.78,0);
  const [ws,wt,wu]=waferMats(); add(L,Y(1.8,.08),[ws,wt,wu],0,-.08,0); add(L,Y(1.95,.5),mat.polished(),0,-.35,0);
  const rm=mat.dark(); for(let k=1;k<=3;k++) add(L,new M.TorusGeometry(k*.5,.015,6,48),rm,0,-.095,0,PI2,0,0);
  add(L,B(3.2,.4,3.2),mat.brushed(),0,-.8,0); add(L,Y(.8,1.0),mat.steel(),0,-1.5,0);
  const pm=mat.paint(0xeef0f3); [-1,1].forEach(s=>{ add(g,B(.3,5,.3),pm,s*3.4,.1,-2.4); add(g,B(.3,5,.3),pm,s*3.4,.1,2.4); });
  add(g,ring(1.7,3.4,.3),mat.steel(),0,1.95,0); add(g,Y(2.9,.1),mat.pcb(),0,2.15,0); add(g,Y(2.95,.03),mat.gold(),0,2.2,0,0,0,0); add(g,Y(.7,.2),mat.ceramic(),0,1.7,0); add(g,Y(1.6,.35),mat.dark(),0,2.38,0);   /* 프로브카드(초록 PCB) + 포고 타워 */
  const coneG=new M.ConeGeometry(.012,1.2,6), coneM=mat.gold();
  for(let k=0;k<60;k++){ const a=Math.random()*PI*2, r=Math.random()*.36; add(g,coneG,coneM,Math.cos(a)*r,1.2,Math.sin(a)*r,PI,0,0); }
  add(g,Y(2.6,1.1),mat.paint(0xf0f2f5),0,3.0,0); add(g,Y(2.64,.16),mat.paint(0x2a5ea8),0,3.15,0); add(g,Y(2.65,.12),mat.dark(),0,2.5,0);    /* 테스트 헤드 */
  const cb=mat.rubber(); pipes(g,[[2.6,3.0,0],[3.6,3.0,0],[3.6,-.5,0],[5.0,-.5,0]],.25,cb);
  cabinet(g,5.6,0,3.2,0x2a5ea8);
  return (dt,p)=>{ probe.visible=false; const lift=cl((3.0-probe.position.y)/2.6)*.48; L.position.set(-probe.position.x,lift,-probe.position.z); };
};

/* ⑧ 와이어 본더 + 몰딩 프레스 */
BU[7]=(g,L)=>{
  add(g,B(8.6,.7,6),mat.paint(0x3a4048),.4,-2.05,0); add(g,B(3.2,.5,3.2),mat.brushed(),0,-.95,0); add(g,B(3.24,.08,3.24),mat.copper(),0,-.66,0);   /* 히터 블록 */
  const fr=mat.dark(); [-1,1].forEach(s=>{ add(g,B(7.4,.25,.3),mat.steel(),.4,2.7,s*2.4); add(g,B(.35,5.2,.35),fr,-3.2,.15,s*2.4); add(g,B(.35,5.2,.35),fr,4.0,.15,s*2.4); }); add(g,B(.5,.5,5),mat.steel(),3.0,2.7,0);
  add(g,B(1.0,.9,.9),mat.paint(0xeef0f3),3.0,2.2,0); add(g,Y(.4,.2),mat.gold(),3.5,2.9,0,PI2,0,0);                                   /* 본딩 헤드 + 초음파 혼 */
  const arm=new M.Mesh((()=>{ const q=Y(.1,1,false,.05); q.rotateX(PI2); q.translate(0,0,.5); return q; })(),mat.polished()); arm.position.set(3.0,2.0,0); arm.castShadow=true; g.add(arm);
  const cap=add(g,Y(.04,.45,false,.015),mat.gold(),0,1,0);
  const pt=[[-.5,-.5,-1.2,-1.2],[.5,-.5,1.2,-1.2],[-.5,.5,-1.2,1.2],[.5,.5,1.2,1.2]];
  const press=new M.Group(); g.add(press); const tp=add(press,B(3.6,.5,3.6),mat.paint(0x2f5f9e),0,2,0), bp=add(press,B(3.6,.5,3.6),mat.steel(),0,-1.5,0);
  [[-1.7,-1.7],[1.7,-1.7],[-1.7,1.7],[1.7,1.7]].forEach(a=>add(press,Y(.1,3.7),mat.polished(),a[0],.25,a[1]));                          /* 타이로드 */
  cabinet(g,5.4,0,2.6,0xc0392b); const hh=col(0xff7a2a);
  return (dt,p)=>{
    const wp=cl((p-.4)/.3), k=Math.min(3,Math.floor(wp*4)), t=cl(wp*4-k); let cx=.4,cy=1,cz=0;
    if(wp>0&&wp<1){ const a=pt[k]; cx=lerp(a[0],a[2],t); cz=lerp(a[1],a[3],t); cy=lerp(-.25,-.5,t)+.55*Math.sin(PI*t)+.1; }
    cap.position.set(cx,cy+.2,cz); arm.position.set(3.0,2.0,0); arm.lookAt(cx,cy+.45,cz); arm.scale.z=Math.hypot(cx-3.0,cy+.45-2.0,cz);
    const mo=cl((p-.7)/.3), pres=p>.62; press.visible=pres; tp.position.y=.44+.56*mo+.3+(1-cl((p-.62)/.08))*1.4;
    fx.color.copy(hh); fx.position.set(0,.2,1.8); fx.distance=7; fx.intensity=pres?cl((p-.62)/.1)*1.2:0;
  };
};

/* =========================================================
   원본 객체(웨이퍼·잉곳·마스크 …) 재질 보정 — 선형 색공간 + 금속성
   ========================================================= */
const METAL=[0xcfd3d9,0xe48a50,0xb5d3ff,0xd5d9de,0xcfd3d9,0xd5d9de,0xc0c4ca,0xe48a50];
function waferMats(){
  const side=PB({color:0x8d98ac,metalness:1,roughness:.1,envMapIntensity:1.5});
  const top=PB({color:0xffffff,map:waferTex,metalness:.8,roughness:.16,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.5},true);
  return [side,top,top]; }
function gradeMat(m,i){
  if(!m||m.userData.gr||!m.color) return; m.userData.gr=1;
  const h=m.color.getHex(); if(m.emissive&&m.emissive.getHex()) toLin(m.emissive);
  if(h===0x8a94a3){ m.color=col(0x5a6a82); m.metalness=.95; m.roughness=.26; m.envMapIntensity=1.5; }                    /* 실리콘 잉곳 */
  else if(h===0xf2a541){
    if(i===2){ m.color=col(0xb5d3ff); m.metalness=.1; m.roughness=.1; m.emissive=col(0x3a5a99); m.emissiveIntensity=.7; }  /* 마스크 개구부(석영) */
    else if(i===7&&m.transparent){ m.color=col(0xf6c64f); m.metalness=1; m.roughness=.22; }                              /* 본딩 와이어(금) */
    else{ m.color=col(METAL[i]); m.metalness=1; m.roughness=.22; }
    m.envMapIntensity=1.5; }
  else if(h===0x232b38){ m.color=col(0x141a26); m.metalness=.55; m.roughness=.22; m.envMapIntensity=1.3; }              /* 포토마스크(크롬/석영) */
  else if(h===0x9fb4c2){ m.color=col(0x8d98ac); m.metalness=1; m.roughness=.1; m.envMapIntensity=1.6; }                 /* 웨이퍼 측면 */
  else{ toLin(m.color); if(m.envMapIntensity!==undefined) m.envMapIntensity=1.2; } }
function dressOriginals(L,i){
  L.traverse(o=>{
    if(o.isMesh){ const m=o.material, p=o.geometry.parameters||{};
      if(!Array.isArray(m)&&m.color&&o.geometry.type==='CylinderGeometry'&&p.radiusTop>=1&&p.height<=.31&&m.color.getHex()===0x9fb4c2){ o.material=waferMats(); m.dispose(); }   /* 패턴 웨이퍼 */
      const ms=[].concat(o.material); ms.forEach(mm=>gradeMat(mm,i)); o.castShadow=!ms[0].transparent; o.receiveShadow=true;
      if(Array.isArray(o.material)&&p.radiusTop>=1&&!o.userData.n){ o.userData.n=1; const r=p.radiusTop, nt=new M.Mesh(new M.BoxGeometry(r*.07,p.height*1.05,r*.07),mat.dark()); nt.position.set(0,0,r); o.add(nt); }   /* 웨이퍼 노치 */
    } else if(o.isPoints) gradeMat(o.material,i); });
}
/* 원본 update 가 매 프레임 sRGB 값으로 덮어쓰는 색(간섭색·Al/Cu)은 매 프레임 선형 변환 */
function postFix(i,L){ if(!LIN) return;
  if(i===1){ const s=L.children[7]; if(s&&s.material&&s.material.color) s.material.color.convertSRGBToLinear(); }
  if(i===5) for(let k=5;k<=9;k++){ const o=L.children[k]; if(o&&o.material&&o.material.color) o.material.color.convertSRGBToLinear(); } }

/* ---------- 클린룸 바닥(타공 패널) ---------- */
const floorMat=new M.MeshStandardMaterial({map:tileTex,color:col(0x8f9cab),transparent:true,roughness:.62,metalness:.1,envMapIntensity:.4,depthWrite:false});
floorMat.onBeforeCompile=sh=>{   /* 바닥 가장자리를 거리 기반으로 부드럽게 투명화(three r128: alphaMap 은 map 의 반복 설정을 공유하므로 셰이더로 처리) */
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.a*=1.0-smoothstep(11.0,26.0,length(vWp.xz));'); };
const floor=new M.Mesh(new M.PlaneGeometry(90,90),floorMat);
floor.rotation.x=-PI2; floor.position.y=-2.42; floor.receiveShadow=true; floor.renderOrder=-10; scene.add(floor);

/* ---------- 장비 받침(해저드 테두리 + 체커 플레이트) ---------- */
function addPad(g,pts){
  const bb=new M.Box3().setFromPoints(pts), pw=bb.max.x-bb.min.x+1.8, pd=bb.max.z-bb.min.z+1.8, cx=(bb.max.x+bb.min.x)/2, cz=(bb.max.z+bb.min.z)/2;
  const pg=new M.Group(); pg.userData.noHit=true; g.add(pg);
  const dt=diamondTex.clone(); dt.needsUpdate=true; rep(dt,pw/.9,pd/.9);
  add(pg,B(pw,.22,pd),PB({color:0xffffff,map:dt,metalness:.5,roughness:.55,envMapIntensity:.9}),cx,-2.31,cz);
  const hz=(len)=>{ const t=hazTex.clone(); t.needsUpdate=true; rep(t,len/.7,1); return PB({color:0xb4b4b4,map:t,metalness:0,roughness:.7,envMapIntensity:.35}); };
  [-1,1].forEach(s=>{ add(pg,B(pw,.05,.28),hz(pw),cx,-2.195,cz+s*(pd/2-.14)); add(pg,B(.28,.05,pd-.56),hz(pd),cx+s*(pw/2-.14),-2.195,cz); });
}

/* =========================================================
   화면 중앙 자동 프레이밍
   장비 전체(받침 포함)의 8방향 꼭짓점을 화면에 투영해 ① 화면상 중심을 (0,0)으로, ② 여백 8% 안에 꽉 차게 카메라 거리를 계산한다.
   오빗 회전의 중심(camTarget)도 이 장면 중심이므로 회전해도 장면이 중앙에 머문다.
   ========================================================= */
const _b=new M.Box3(), _v=new M.Vector3(), _r=new M.Vector3(), _u=new M.Vector3(), FILL=.86;
function skipObj(o){ for(;o;o=o.parent) if(o.userData.noFrame) return true; return false; }
function corners(){ const pts=[]; stageGroup.updateMatrixWorld(true);
  stageGroup.traverse(o=>{ if(!o.isMesh||!o.geometry||skipObj(o)) return; const mt=[].concat(o.material)[0]; if(mt&&mt.transparent&&mt.opacity<.05) return;
    _b.setFromObject(o); if(_b.isEmpty()) return; const a=_b.min, b=_b.max;
    for(let k=0;k<8;k++) pts.push(new M.Vector3(k&1?b.x:a.x,Math.max(-2.42,k&2?b.y:a.y),k&4?b.z:a.z)); });
  return pts; }
function frame(){
  const pts=corners(); if(!pts.length) return;
  const bb=new M.Box3().setFromPoints(pts), c=bb.getCenter(new M.Vector3()), sz=bb.getSize(new M.Vector3());
  const asp=holder.clientWidth/Math.max(1,holder.clientHeight), tf=Math.tan((camera.fov||45)*PI/360);
  camTarget.copy(c); let d=Math.max(sz.x,sz.y,sz.z)*1.6;
  for(let it=0;it<14;it++){
    camDist=d; updateCamera(); camera.updateMatrixWorld();
    let x0=9,x1=-9,y0=9,y1=-9; pts.forEach(p=>{ _v.copy(p).project(camera); x0=Math.min(x0,_v.x); x1=Math.max(x1,_v.x); y0=Math.min(y0,_v.y); y1=Math.max(y1,_v.y); });
    const halfH=tf*d, halfW=halfH*asp; _r.setFromMatrixColumn(camera.matrixWorld,0); _u.setFromMatrixColumn(camera.matrixWorld,1);
    camTarget.addScaledVector(_r,(x0+x1)/2*halfW).addScaledVector(_u,(y0+y1)/2*halfH);               /* 화면 중심으로 이동 */
    d*=Math.pow(Math.max((x1-x0)/2,(y1-y0)/2)/FILL,.85);                                              /* 화면에 꽉 차게 거리 보정 */
  }
  camDist=Math.max(5,Math.min(70,d)); updateCamera();
  /* 조명·그림자 범위를 장면 크기에 맞춤 */
  const R=sz.length()/2;
  keyLight.position.set(c.x-R*.7,c.y+R*1.0,c.z+R*.8); keyLight.target.position.copy(c); keyLight.target.updateMatrixWorld();
  rimLight.position.set(c.x+R*1.0,c.y+R*.5,c.z-R*.9);
  const sc=keyLight.shadow.camera, sh=R*1.15; sc.left=-sh; sc.right=sh; sc.top=sh; sc.bottom=-sh; sc.near=R*.2; sc.far=R*3.4; sc.updateProjectionMatrix();
  keyLight.shadow.normalBias=.03; keyLight.shadow.bias=-.0004;
}

/* =========================================================
   공정 전환 훅: 원본 생성 → 재질 보정 → 장비 생성 → 받침 → 중앙 프레이밍
   ========================================================= */
const hemi=scene.children.find(c=>c.isHemisphereLight);
const _prev=loadStage;
loadStage=function(i){
  _prev(i);
  TW.length=0; fx.intensity=0;
  keyLight.color.copy(col(i===2?0xffc65a:0xfff3e4)); if(hemi) hemi.color.copy(col(i===2?0xffe9a8:0xdbe6f5));   /* 포토 공정실은 황색 조명 */
  const L=stageGroup.children[0]||new M.Group(), g=new M.Group(); stageGroup.add(g);
  dressOriginals(L,i);
  let a; try{ a=BU[i](g,L); }catch(err){ console.warn('장비 모델 생성 실패',i,(err&&err.message)||err); a=()=>{}; }
  const u0=stageUpdate; let tt=0;
  stageUpdate=(dt,p,m)=>{ u0(dt,p,m); postFix(i,L); fx.intensity=0; a(dt,p,m); tt+=dt; animTowers(tt,p); };
  stageUpdate(0,paramNorm,toggleIndex);                       /* 초기 상태를 한 번 적용(숨김 처리 등) 후 크기 측정 */
  addPad(g,corners()); frame();
};

/* =========================================================
   테마 + 반응형(PC / 모바일 세로·가로) + 터치 확대
   ========================================================= */
const st=document.createElement('style');
st.textContent=`
:root{--bg:#eef2f6;--panel:#fff;--panel-2:#f1f4f8;--line:#d5dce5;--cyan:#0a7ea4;--amber:#c76d00;--text:#1b2430;--muted:#5d6b7a}
header{background:linear-gradient(180deg,#fff,#eef2f6)} footer{background:#fff}
#info p{color:#3a4756} .hint{background:rgba(255,255,255,.75)}
.node.active .dot{box-shadow:0 0 8px 2px rgba(10,126,164,.35)}
html,body{height:100%;overscroll-behavior:none}
#app{height:100vh;height:100dvh;grid-template-rows:auto minmax(0,1fr) auto;grid-template-columns:minmax(0,1fr)}   /* 단계 표시줄(8개 노드)이 화면 폭을 밀어내 3D 화면이 잘리던 문제 방지 */
header,main{min-width:0}
main{min-height:0} #viewport{min-height:0;overflow:hidden} #viewport canvas{touch-action:none;display:block}
@media (max-width:760px){
  header{padding:8px 12px 6px} .titlebar{margin-bottom:6px} .titlebar h1{font-size:15px} .titlebar span{display:none}
  .node{min-width:58px} .node .label{font-size:10px} .connector{flex-basis:10px;margin-bottom:16px}
  main{grid-template-columns:1fr!important;grid-template-rows:minmax(0,46%) minmax(0,1fr)!important}
  #viewport{order:-1} #info{order:0;border-right:none;border-bottom:none;border-top:1px solid var(--line);max-height:none!important;padding:14px;overflow-y:auto}
  #info h2{font-size:18px} #info p{font-size:13px;line-height:1.65}
  footer{padding:8px 12px calc(8px + env(safe-area-inset-bottom))} .navbtn{padding:9px 12px;font-size:12.5px}
  .hint{font-size:10px;left:8px;right:8px;bottom:8px;padding:5px 8px}
}
@media (max-height:480px){ header{padding:6px 12px 4px} .titlebar{display:none} footer{padding:6px 12px} #info{padding:12px 14px} }
@media (max-width:900px) and (max-height:480px){
  main{grid-template-columns:42% 58%!important;grid-template-rows:minmax(0,1fr)!important} #viewport{order:1} #info{order:0}
}
@media (max-width:760px),(max-height:480px){
  #info{overflow-y:auto;-webkit-overflow-scrolling:touch}
  #playBlock{position:sticky;bottom:0;z-index:5;background:var(--panel);padding:8px 0;margin:0;box-shadow:0 -6px 8px -6px rgba(0,0,0,.2)}
  .ro-row b{overflow-wrap:anywhere} #xs{max-width:100%}
}
@media (max-height:480px){ #playBlock .tlabel{display:none} }`;
document.head.appendChild(st);

const coarse=matchMedia('(pointer:coarse)').matches, small=coarse||matchMedia('(max-width:760px)').matches;
if(small){ renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); if(keyLight.shadow.map){ keyLight.shadow.map.dispose(); keyLight.shadow.map=null; } keyLight.shadow.mapSize.set(1024,1024); }
const hint=document.querySelector('.hint');
if(coarse&&hint) hint.textContent='드래그: 회전 · 두 손가락: 확대/축소 · 설비를 터치: 공정 작동';
if(hint&&small){ hint.style.transition='opacity .5s'; const off=()=>{ hint.style.opacity='0'; hint.style.pointerEvents='none'; };
  renderer.domElement.addEventListener('pointerdown',off,{once:true}); setTimeout(off,8000); }

function size(){ const w=holder.clientWidth,h=holder.clientHeight; if(!w||!h) return; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); }
let la=0;
const ro=new ResizeObserver(()=>{ size(); const a=holder.clientWidth/Math.max(1,holder.clientHeight); if(!la||Math.abs(a-la)/la>.06){ la=a; frame(); } });
ro.observe(holder);

let pd=0; const cv=renderer.domElement;                                     /* 두 손가락 확대/축소 */
cv.addEventListener('touchmove',e=>{ if(e.touches.length!==2){ pd=0; return; } e.preventDefault();
  const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
  if(pd) camDist=Math.max(4,Math.min(70,camDist*pd/d)); pd=d; },{passive:false});
cv.addEventListener('touchend',()=>{ pd=0; });

const _fin=loadStage;
loadStage=function(i){ _fin(i); try{ const n=document.querySelector('.node.active'); if(n) n.scrollIntoView({inline:'center',block:'nearest'}); }catch(e){} };
size(); loadStage(current);
})();
