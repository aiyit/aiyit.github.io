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
  if(dwell>0){ dl.style.display='block'; dl.style.left=mx+'px'; dl.style.top=my+'px'; dl.style.background=`conic-gradient(var(--amber) ${dwell/2*360}deg,rgba(0,0,0,.12) 0)`; }
  else dl.style.display='none';
  if(playing){ setNorm(paramNorm+dt*parseFloat($('spd').value)/DURATION); if(paramNorm>=1) setPlay(false); }
  roAcc+=dt; if(roAcc>.1){ roAcc=0; renderRO(); }
  if(current>=1&&current<=5) drawXS(paramNorm,toggleIndex);
})(performance.now());
sync();
})();

/* =========================================================
   그래픽 사실감 강화 (스튜디오 반사광 · 그림자 · 웨이퍼 질감 · 클린룸 바닥)
   ========================================================= */
(()=>{
/* 1) 렌더러: sRGB 출력 + 필름 톤매핑 + 부드러운 그림자 */
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
scene.fog=new THREE.Fog(0x6a7a8e,16,34);
keyLight.intensity=.85; keyLight.castShadow=true;
keyLight.shadow.mapSize.set(2048,2048); keyLight.shadow.bias=-.0005;
Object.assign(keyLight.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:28});

/* 2) 스튜디오 환경맵(소프트박스 조명) → 금속·유리 반사 */
const ec=document.createElement('canvas'); ec.width=512; ec.height=256; const eg=ec.getContext('2d');
const gr=eg.createLinearGradient(0,0,0,256); gr.addColorStop(0,'#cfe4f5'); gr.addColorStop(.5,'#46586b'); gr.addColorStop(1,'#10151d');
eg.fillStyle=gr; eg.fillRect(0,0,512,256);
eg.fillStyle='#fff'; [[60,40,90,30],[250,25,120,26],[400,50,70,40]].forEach(a=>eg.fillRect(...a));
eg.fillStyle='#ffd9a0'; eg.fillRect(150,90,40,60);
const et=new THREE.CanvasTexture(ec); et.mapping=THREE.EquirectangularReflectionMapping; et.encoding=THREE.sRGBEncoding;
const pm=new THREE.PMREMGenerator(renderer); scene.environment=pm.fromEquirectangular(et).texture; pm.dispose();

/* 3) 클린룸 바닥: 격자 + 그림자 수신 */
const grid=new THREE.GridHelper(36,36,0x8191a6,0x74849a); grid.position.y=-2.4; scene.add(grid);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(36,36),new THREE.ShadowMaterial({opacity:.45}));
floor.rotation.x=-Math.PI/2; floor.position.y=-2.39; floor.receiveShadow=true; scene.add(floor);

/* 4) 웨이퍼 질감: 다이 격자 + 빛 회절 무지개 + 클리어코트 */
const wc=document.createElement('canvas'); wc.width=wc.height=512; const wg=wc.getContext('2d');
const rb=wg.createRadialGradient(256,256,20,256,256,360); rb.addColorStop(0,'#c9d3dd'); rb.addColorStop(1,'#7d8b99');
wg.fillStyle=rb; wg.fillRect(0,0,512,512);
wg.strokeStyle='rgba(30,40,60,.35)'; wg.lineWidth=1;
for(let i=0;i<=512;i+=34){ wg.beginPath(); wg.moveTo(i,0); wg.lineTo(i,512); wg.stroke(); wg.beginPath(); wg.moveTo(0,i); wg.lineTo(512,i); wg.stroke(); }
const hg=wg.createLinearGradient(0,0,512,512);
['255,60,90','255,200,60','60,255,150','60,150,255','190,80,255'].forEach((c,i)=>hg.addColorStop(i/4,`rgba(${c},.22)`));
wg.fillStyle=hg; wg.fillRect(0,0,512,512);
const waferTex=new THREE.CanvasTexture(wc); waferTex.encoding=THREE.sRGBEncoding; waferTex.anisotropy=8;

function dress(){
  stageGroup.traverse(o=>{
    if(!o.isMesh) return;
    const m=o.material;
    if(!Array.isArray(m)&&m.color&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.height<.2&&m.color.getHex()===0x9fb4c2){
      const top=new THREE.MeshPhysicalMaterial({map:waferTex,metalness:.9,roughness:.2,clearcoat:.8,clearcoatRoughness:.1});
      o.material=[m.clone(),top,top]; m.dispose();
    }
    const mm=Array.isArray(o.material)?o.material[0]:o.material;
    o.castShadow=!mm.transparent; o.receiveShadow=true;
  });
}
const _gl=loadStage; loadStage=function(i){ _gl(i); dress(); };
loadStage(current);   /* 새 렌더 설정으로 현재 공정 재생성 */
})();

/* =========================================================
   밝은 배경 테마 + 메탈릭 PBR 재질 (공정별 실제 금속 색상)
   ========================================================= */
(()=>{
const st=document.createElement('style');
st.textContent=`:root{--bg:#eef2f6;--panel:#fff;--panel-2:#f1f4f8;--line:#d5dce5;--cyan:#0a7ea4;--amber:#c76d00;--text:#1b2430;--muted:#5d6b7a}
header{background:linear-gradient(180deg,#fff,#eef2f6)} footer{background:#fff}
#viewport{background:radial-gradient(ellipse at 50% 30%,#9aa8b8,#5d6d82 85%)}
#info p{color:#3a4756} .hint{background:rgba(255,255,255,.75)}
.node.active .dot{box-shadow:0 0 8px 2px rgba(10,126,164,.35)}`;
document.head.appendChild(st);

/* 조명·환경맵: 밝은 스튜디오 */
scene.children.filter(c=>c.isAmbientLight).forEach(a=>{ a.color.set(0xffffff); a.intensity=.75; });
rimLight.intensity=.25;
const ec=document.createElement('canvas'); ec.width=512; ec.height=256; const eg=ec.getContext('2d');
const gr=eg.createLinearGradient(0,0,0,256); gr.addColorStop(0,'#ffffff'); gr.addColorStop(.5,'#9fb2c6'); gr.addColorStop(1,'#4d5b6b');
eg.fillStyle=gr; eg.fillRect(0,0,512,256);
eg.fillStyle='#fff'; [[40,30,110,34],[240,20,140,30],[410,45,80,44]].forEach(a=>eg.fillRect(...a));
const et=new THREE.CanvasTexture(ec); et.mapping=THREE.EquirectangularReflectionMapping; et.encoding=THREE.sRGBEncoding;
const pm=new THREE.PMREMGenerator(renderer); scene.environment=pm.fromEquirectangular(et).texture; pm.dispose();

/* 공정별 금속: 톱날=강, 히터코일=구리, 스퍼터 타겟·프로브=텅스텐/은, 리드프레임=구리 */
const METAL=[0xcfd3d9,0xb86b3a,0xd5d9de,0xd5d9de,0xcfd3d9,0xd5d9de,0xc0c4ca,0xb87333];
function fin(m){
  if(!m||!m.color||m.userData.fin) return; m.userData.fin=1;
  const h=m.color.getHex();
  if(h===0x8a94a3){ m.color.set(0x6f7b8a); m.metalness=.95; m.roughness=.22; }      /* 실리콘 잉곳 */
  else if(h===0xf2a541){ m.color.set(METAL[current]); m.metalness=1; m.roughness=.16; }
  else if(h===0x232b38){ m.color.set(0x3b4554); m.metalness=.7; m.roughness=.3; }   /* 포토마스크(크롬/석영) */
  else if(h===0x9fb4c2){ m.metalness=.95; m.roughness=.14; }                          /* 웨이퍼 */
  else if(m.metalness>=.8){ m.metalness=1; m.roughness=.2; }                          /* 금속 배선 */
  m.envMapIntensity=1.3;
}
/* 300 mm 웨이퍼의 결정 방향 표시용 노치 */
function notch(o){
  if(o.userData.n) return; o.userData.n=1;
  const p=o.geometry.parameters, r=p.radiusTop;
  const n=new THREE.Mesh(new THREE.BoxGeometry(r*.07,p.height*1.05,r*.07),new THREE.MeshStandardMaterial({color:0x3a4350,roughness:.6}));
  n.position.set(0,0,r); o.add(n);
}
const _t=loadStage;
loadStage=function(i){
  _t(i);
  keyLight.color.set(i===2?0xffe29a:0xffffff);   /* 포토 공정실은 실제로 황색 조명 */
  stageGroup.traverse(o=>{
    if(!o.isMesh) return;
    [].concat(o.material).forEach(fin);
    if(Array.isArray(o.material)&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.height<.2) notch(o);
  });
};
loadStage(current);
})();

/* =========================================================
   실제 장비 외형 (특허·장비 구조 자료 조사 기반)
   ① 웨이퍼 제조: 멀티 와이어 쏘(가이드 롤러에 감긴 와이어 웹 + 슬러리 노즐 + 와이어 릴)
   ② 산화: 수직 배치(Vertical Batch) 확산로 — 석영 반응관, 히터, 석영 보트(웨이퍼 적층), SUS 덮개·엘리베이터
   ③ 포토: 스핀 코터 보울(트랙) + 스캐너(조명계→레티클 스테이지→축소투영렌즈→웨이퍼 스테이지)
   ④ 식각: CCP 플라즈마 챔버(샤워헤드 상부전극, 정전척, 포커스링, 배기 펌프, RF 정합기)
   ⑤ 증착: PVD(공초점 마그네트론 스퍼터 캐소드, 히터 페데스탈) / CVD(샤워헤드 가스 주입)
   ⑥ 금속 배선: CMP(회전 플래튼 + 연마 패드 + 캐리어 헤드 + 슬러리 노즐)
   ⑦ EDS: 프로버(고정 프로브카드 + XYZ 척 이동, 테스트 헤드)
   ⑧ 패키징: 와이어 본더(히터 블록, 본딩 암·캐필러리) + 몰딩 프레스 플래튼
   ========================================================= */
(()=>{
const M=THREE, PI=Math.PI, PI2=PI/2, cl=v=>Math.max(0,Math.min(1,v)), lerp=(a,b,t)=>a+(b-a)*t;
const B=(w,h,d)=>new M.BoxGeometry(w,h,d);
const Y=(r,h,o,rt,ts,tl)=>new M.CylinderGeometry(rt==null?r:rt,r,h,48,1,!!o,ts||0,tl||PI*2);
const ring=(r1,r2,h)=>new M.LatheGeometry([[r1,-h/2],[r2,-h/2],[r2,h/2],[r1,h/2],[r1,-h/2]].map(a=>new M.Vector2(a[0],a[1])),48);
const S=(c,m,r,e)=>new M.MeshStandardMaterial({color:c,metalness:m,roughness:r,side:M.DoubleSide,envMapIntensity:1.4,emissive:e||0});
const mat={
  steel:()=>S(0xb4bcc6,1,.28), brushed:()=>S(0x9aa3ad,1,.45), dark:()=>S(0x2b323c,.6,.45), black:()=>S(0x14181d,.3,.5),
  paint:c=>S(c,.1,.5), copper:()=>S(0xb87333,1,.3), gold:()=>S(0xd4af37,1,.25), pcb:()=>S(0x1c6b4f,.1,.6),
  wafer:()=>S(0xaab5c0,.95,.15),
  glass:()=>new M.MeshStandardMaterial({color:0xcfe6f2,metalness:0,roughness:.05,transparent:true,opacity:.14,side:M.DoubleSide,depthWrite:false}),
  quartz:()=>new M.MeshStandardMaterial({color:0xe8f4ff,metalness:0,roughness:.05,transparent:true,opacity:.2,side:M.DoubleSide,depthWrite:false}),
  glow:(c,i)=>new M.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i||1.2}),
  beam:c=>new M.MeshBasicMaterial({color:c,transparent:true,opacity:0,depthWrite:false,side:M.DoubleSide})
};
function add(g,geo,m,x,y,z,rx,ry,rz){ const o=new M.Mesh(geo,m); o.position.set(x||0,y||0,z||0); o.rotation.set(rx||0,ry||0,rz||0); o.castShadow=!m.transparent; o.receiveShadow=true; g.add(o); return o; }
function pipe(g,a,b,r,m){ const A=new M.Vector3(a[0],a[1],a[2]), Bv=new M.Vector3(b[0],b[1],b[2]), d=Bv.clone().sub(A), len=d.length();
  const o=new M.Mesh(Y(r,len),m||mat.steel()); o.position.copy(A).add(Bv).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new M.Vector3(0,1,0),d.normalize()); o.castShadow=true; g.add(o); return o; }
const plate=(g,w,d)=>add(g,B(w,.2,d),mat.dark(),0,-2.3,0);
function cabinet(g,x,z,h){ h=h||2.6; add(g,B(1.5,h,1.2),mat.paint(0xe3e8ee),x,-2.4+h/2,z);
  add(g,B(1.1,.6,.04),mat.glow(0x1fae7a),x,-2.4+h*.62,z+.62); add(g,Y(.07,.4),mat.glow(0x3ddc84),x+.5,-2.4+h+.2,z);
  for(let k=0;k<4;k++) add(g,B(1.1,.04,.03),mat.dark(),x,-2.4+h*.3-k*.12,z+.61); }
function chamberShell(g,r,y0,y1){ const h=y1-y0, c=(y0+y1)/2;
  add(g,Y(r,h,true),mat.glass(),0,c,0); add(g,Y(r+.2,.3),mat.steel(),0,y1+.15,0); add(g,Y(r+.2,.3),mat.steel(),0,y0-.15,0);
  [y0,y1].forEach(v=>add(g,Y(r+.05,.12,true),mat.brushed(),0,v,0)); }
function pump(g,x,y){ add(g,Y(.8,1.3),mat.steel(),x,y,0); add(g,Y(.95,.18),mat.dark(),x,y+.7,0); add(g,Y(.4,.5),mat.dark(),x,y-.8,0); }
const BUILD=[];

/* ① 멀티 와이어 쏘 */
BUILD[0]=(g,L)=>{
  plate(g,13,4.4); add(g,B(10,.5,3.4),mat.paint(0xdfe4ea),-.6,-2.05,0); add(g,B(10,5.2,.25),mat.paint(0xcfd6de),-.6,.3,-2.0);
  add(g,B(5,.5,1.6),mat.brushed(),-2.4,-1.7,0); add(g,B(4.4,.25,.6),mat.black(),-2.4,-1.25,0);          /* 이송 테이블 + 잉곳 접착 빔 */
  const web=new M.Group(); g.add(web); const wires=new M.Group(); web.add(wires);
  for(let k=0;k<10;k++) add(wires,Y(.012,4.4),mat.steel(),-4.2+k*.4,0,0,PI2,0,0);
  [-2.1,2.1].forEach(z=>{ add(web,Y(.32,4.6),mat.dark(),-2.4,0,z,0,0,PI2); for(let k=0;k<12;k++) add(web,Y(.33,.03),mat.steel(),-4.4+k*.4,0,z,0,0,PI2); });
  add(web,B(4.6,.12,.25),S(0x3b82c4,.1,.4),-2.4,.55,0);                                                 /* 슬러리 노즐 바 */
  const reels=[1.4,-.2].map(y=>{ const r=add(g,Y(.9,.5),mat.paint(0xe0702a),-6.0,y,-1.6,PI2,0,0); return r; });
  cabinet(g,5.6,-1);
  let t=0; return (dt,p)=>{ t+=dt; L.children[2].visible=false;
    const sp=cl((p-.15)/.7); web.visible=p>.12; web.position.y=lerp(1.35,-1.1,sp);
    wires.position.z=Math.sin(t*4)*.18; reels.forEach(r=>r.rotation.y+=dt*(p>.15&&p<.87?3:0)); };
};

/* ② 수직 배치 확산로 */
BUILD[1]=(g,L)=>{
  for(let i=0;i<=5;i++) L.children[i].visible=false; L.children[8].visible=false;
  plate(g,11,6); add(g,Y(2.15,5.4,true),mat.quartz(),0,.2,0); add(g,new M.SphereGeometry(2.15,40,20,0,PI*2,0,PI2),mat.quartz(),0,2.9,0);
  add(g,Y(2.9,5.2,true,undefined,.9,PI*2-1.8),mat.brushed(),0,.2,0); add(g,Y(2.6,5.0,true,undefined,.9,PI*2-1.8),S(0xe9dcc2,0,.95),0,.2,0);
  add(g,new M.SphereGeometry(2.9,40,20,0,PI*2,0,PI2),mat.brushed(),0,2.8,0);
  add(g,Y(3.1,.3),mat.steel(),0,-2.65,0);
  const coils=[]; for(let k=0;k<9;k++){ const m=S(0xc0392b,.3,.5,0x000000); coils.push(m); add(g,new M.TorusGeometry(2.4,.05,10,64),m,0,-2.0+k*.55,0,PI2,0,0); }
  pipe(g,[0,3.9,0],[0,5.0,0],.12); pipe(g,[0,5.0,0],[-3.6,5.0,0],.12); pipe(g,[-3.6,5.0,0],[-3.6,-1.4,0],.12); add(g,B(.7,.9,.7),mat.paint(0xe3e8ee),-3.6,.6,0);
  pipe(g,[2.9,-2.6,0],[4.2,-2.6,0],.2);
  const boat=new M.Group(); g.add(boat);
  add(boat,Y(2.4,.22),mat.steel(),0,-2.45,0); add(boat,Y(1.0,.8),mat.quartz(),0,-2.0,0); add(boat,Y(1.9,.1),mat.quartz(),0,-1.75,0); add(boat,Y(1.9,.1),mat.quartz(),0,1.9,0);
  [[1.3,-1.1],[-1.3,-1.1],[0,-1.75]].forEach(a=>add(boat,Y(.07,3.7),mat.quartz(),a[0],.1,a[1]));
  for(let k=-4;k<=4;k++) if(k) add(boat,Y(1.6,.05),mat.wafer(),0,k*.38,0);
  add(boat,B(3.3,.25,.4),mat.steel(),1.65,-2.55,0);
  add(g,B(.4,7,.5),mat.steel(),3.3,.8,0);
  cabinet(g,5.4,0);
  return (dt,p)=>{
    const ins=cl((p-.12)/.2), by=-2.8*(1-ins); boat.position.y=by;
    L.children[6].position.set(0,by,0); L.children[7].position.set(0,by,0);
    const heat=cl((p-.15)/.25); coils.forEach(m=>{ m.emissive.setHex(0xff5a1a); m.emissiveIntensity=heat*1.6; });
  };
};

/* ③ 스핀 코터(트랙) + 스캐너 */
BUILD[2]=(g,L)=>{
  const mask=L.children[2], beam=L.children[3]; beam.visible=false;
  plate(g,13,7);
  const C=new M.Group(), Sc=new M.Group(); g.add(C); g.add(Sc);
  add(C,Y(2.2,.7,true),mat.steel(),0,.1,0); add(C,Y(2.2,.1),mat.dark(),0,-.3,0); add(C,Y(.55,1.5),mat.steel(),0,-1.0,0);
  pipe(C,[2.9,-.5,0],[2.9,1.5,0],.12); pipe(C,[2.9,1.5,0],[.2,1.5,0],.07); add(C,Y(.05,.4),mat.black(),.2,1.3,0);
  add(Sc,Y(2.2,.5),mat.dark(),0,-.33,0); add(Sc,B(7,.2,.35),mat.brushed(),0,-.8,1.5); add(Sc,B(7,.2,.35),mat.brushed(),0,-.8,-1.5); add(Sc,B(.35,.2,5),mat.brushed(),2.8,-.8,0);
  add(Sc,Y(.55,1.3,false,1.15),mat.steel(),0,1.05,0); add(Sc,Y(.5,.04),S(0x101830,.2,.05),0,.4,0);
  [.55,.95,1.35].forEach(y=>add(Sc,Y(.9-(y-.55)*.2,.07,false,undefined),mat.brushed(),0,y,0));
  [-1,1].forEach(s=>add(Sc,B(.35,7.4,.35),mat.steel(),s*2.9,1.3,-2.3)); add(Sc,B(6.2,.4,.4),mat.steel(),0,5.2,-2.3);
  add(Sc,B(2.6,1.1,2.6),mat.paint(0xdfe4ea),0,6.3,0); add(Sc,Y(1.0,.9,true,1.1),mat.brushed(),0,5.5,0);
  add(Sc,B(2,2.6,1.4),mat.paint(0xe3e8ee),-5.5,-1.1,0); pipe(Sc,[-5.5,.2,0],[-5.5,6.3,0],.1); pipe(Sc,[-5.5,6.3,0],[-1.3,6.3,0],.1);
  const frame=new M.Group(); Sc.add(frame);
  [[0,1.8],[0,-1.8]].forEach(a=>add(frame,B(3.8,.14,.2),mat.steel(),a[0],0,a[1])); [[1.9,0],[-1.9,0]].forEach(a=>add(frame,B(.2,.14,3.8),mat.steel(),a[0],0,a[1]));
  const up=new M.Mesh(Y(1.4,1,true,1.1),mat.beam(0xcfa8ff)), lo=new M.Mesh(Y(.12,.35,true,.55),mat.beam(0xcfa8ff)); Sc.add(up); lo.position.y=.22; Sc.add(lo);
  return (dt,p)=>{
    C.visible=p<.3; Sc.visible=p>=.3; mask.visible=p>=.12;
    frame.position.y=mask.position.y; const h=Math.max(.01,mask.position.y-1.7); up.scale.y=h; up.position.y=1.7+h/2;
    const o=Math.min(.5,beam.material.opacity*2.5); up.material.opacity=o; lo.material.opacity=o;
  };
};

/* ④ CCP 플라즈마 식각 챔버 */
BUILD[3]=(g,L)=>{
  plate(g,13,6.4); chamberShell(g,2.7,-1.1,1.9);
  add(g,Y(1.72,.45),mat.dark(),0,-.375,0); add(g,Y(2.0,.5),mat.steel(),0,-.85,0); add(g,Y(.6,1.1),mat.steel(),0,-1.55,0);
  add(g,ring(1.66,2.0,.22),mat.black(),0,-.04,0); add(g,ring(2.0,2.35,.2),S(0xe8ecef,.1,.4),0,-.12,0); add(g,ring(2.4,2.65,.12),mat.dark(),0,-.55,0);
  add(g,Y(2.0,.25),mat.steel(),0,1.5,0); add(g,Y(.55,.6),mat.steel(),0,2.35,0);
  for(let k=0;k<4;k++){ const n=k?6*k:1; for(let j=0;j<n;j++){ const a=j/n*PI*2; add(g,Y(.045,.27),mat.black(),Math.cos(a)*k*.38,1.5,Math.sin(a)*k*.38); } }
  pipe(g,[0,2.65,0],[0,3.3,0],.1); pipe(g,[0,3.3,0],[-3.2,3.3,0],.1); pipe(g,[-3.2,3.3,0],[-3.2,-1.0,0],.1); add(g,B(.7,.9,.7),mat.paint(0xe3e8ee),-3.2,1.2,0);
  pipe(g,[2.9,-.9,0],[4.4,-.9,0],.3); pump(g,4.4,-1.7);
  add(g,B(1.2,.9,1.0),mat.paint(0xdfe4ea),-3.5,-1.9,1.4); pipe(g,[-3.5,-1.9,1.4],[0,-1.9,1.4],.07,mat.copper()); pipe(g,[0,-1.9,1.4],[0,-1.4,0],.07,mat.copper());
  cabinet(g,5.8,1.8);
  const pl=add(g,Y(1.9,1.1),mat.beam(0xb06cff),0,.7,0); let t=0;
  return (dt,p,m)=>{ t+=dt; pl.material.opacity=(m===1&&p>.12&&p<.88)?.16+.08*Math.sin(t*18):0; };
};

/* ⑤ PVD(마그네트론 스퍼터) / CVD */
BUILD[4]=(g,L)=>{
  plate(g,13,6.4); chamberShell(g,2.7,-1.2,4.2);
  add(g,Y(1.8,.35),mat.steel(),0,-.25,0); add(g,ring(1.5,1.85,.08),mat.brushed(),0,.1,0); add(g,Y(.5,1.2),mat.steel(),0,-.95,0);
  add(g,Y(2.4,3.2,true,undefined,.9,PI*2-1.8),mat.brushed(),0,1.9,0);
  add(g,B(.6,1.2,1.6),mat.dark(),3.1,.3,0); pipe(g,[0,-1.4,0],[0,-1.8,0],.4); pump(g,0,-2.0);
  const pv=new M.Group(); pv.position.set(-2.4,2.85,0); pv.rotation.z=.75; g.add(pv);
  add(pv,Y(1.0,.14),mat.gold(),0,0,0); add(pv,ring(1.05,1.3,.22),mat.dark(),0,.05,0); add(pv,Y(1.15,.5),mat.steel(),0,.45,0); add(pv,Y(.3,.5),mat.dark(),0,.95,0);
  pipe(pv,[.7,.5,0],[1.6,1.4,0],.06,S(0x3b82c4,.2,.4));
  const cv=new M.Group(); g.add(cv); add(cv,Y(1.9,.25),mat.steel(),0,3.6,0); pipe(cv,[0,3.7,0],[0,4.9,0],.12); pipe(cv,[0,4.9,0],[-3.4,4.9,0],.12); pipe(cv,[-3.4,4.9,0],[-3.4,-1,0],.12);
  cabinet(g,5.8,1.8);
  return (dt,p,m)=>{ L.children[1].visible=false; pv.visible=m===1; cv.visible=m!==1; };
};

/* ⑥ CMP / 금속 배선 */
BUILD[5]=(g,L)=>{
  plate(g,9,8); add(g,Y(3.2,.3),S(0xd8d0c0,0,.9),0,-.45,0); add(g,Y(1.0,1.6),mat.steel(),0,-1.45,0);
  for(let k=1;k<=5;k++) add(g,new M.TorusGeometry(k*.55,.02,6,64),mat.dark(),0,-.29,0,PI2,0,0);
  const head=new M.Group(); g.add(head); add(head,Y(2.0,.5),mat.steel(),0,.55,0); add(head,ring(1.7,2.0,.3),mat.black(),0,.15,0); add(head,Y(.4,.9),mat.dark(),0,1.2,0);
  pipe(g,[3.6,1.6,0],[1.4,.5,1.2],.07,S(0x3b82c4,.2,.4)); add(g,B(.4,2.6,.4),mat.steel(),3.6,-.7,0);
  cabinet(g,5.2,0);
  return (dt,p,m)=>{ const cu=m===1; head.visible=cu&&p>.55; head.position.y=lerp(2.2,.3,cl((p-.55)/.15)); head.rotation.y+=dt*2; };
};

/* ⑦ 프로버(EDS) */
BUILD[6]=(g,L)=>{
  const probe=L.children[L.children.length-1];
  plate(g,13,7); add(g,B(9,.6,6),mat.paint(0xdfe4ea),0,-2.0,0);
  add(L,Y(1.8,.08),mat.wafer(),0,-.08,0); add(L,Y(1.95,.5),mat.steel(),0,-.35,0); for(let k=1;k<=3;k++) add(L,new M.TorusGeometry(k*.5,.015,6,48),mat.dark(),0,-.095,0,PI2,0,0);
  add(L,B(3.2,.4,3.2),mat.dark(),0,-.8,0); add(L,Y(.8,1.0),mat.steel(),0,-1.5,0);
  [-1,1].forEach(s=>{ add(g,B(.3,5,.3),mat.steel(),s*3.4,.1,-2.4); add(g,B(.3,5,.3),mat.steel(),s*3.4,.1,2.4); });
  add(g,ring(1.7,3.4,.3),mat.steel(),0,1.95,0); add(g,Y(2.4,.12),mat.pcb(),0,1.75,0); add(g,Y(.7,.2),S(0xe8e0c8,0,.6),0,1.6,0); add(g,Y(2.0,.4),mat.dark(),0,2.15,0);
  for(let k=0;k<60;k++){ const a=Math.random()*PI*2, r=Math.random()*.36; add(g,new M.ConeGeometry(.012,.9,6),mat.gold(),Math.cos(a)*r,1.01,Math.sin(a)*r,PI,0,0); }
  add(g,Y(2.6,1.1),mat.paint(0xf0f2f5),0,3.0,0); add(g,Y(2.65,.12),mat.dark(),0,2.5,0);
  pipe(g,[2.6,3.0,0],[3.6,3.0,0],.25); pipe(g,[3.6,3.0,0],[3.6,-.5,0],.25); pipe(g,[3.6,-.5,0],[5.0,-.5,0],.25);
  cabinet(g,5.6,0,3.2);
  return (dt,p)=>{ probe.visible=false; const lift=cl((3.0-probe.position.y)/2.6)*.48; L.position.set(-probe.position.x,lift,-probe.position.z); };
};

/* ⑧ 와이어 본더 + 몰딩 프레스 */
BUILD[7]=(g,L)=>{
  plate(g,13,7); add(g,B(3.2,.5,3.2),mat.brushed(),0,-.95,0);
  [-1,1].forEach(s=>add(g,B(7.4,.25,.3),mat.steel(),.4,2.7,s*2.4)); add(g,B(.5,.5,5),mat.steel(),3.0,2.7,0);
  add(g,B(1.0,.9,.9),mat.paint(0xdfe4ea),3.0,2.2,0); add(g,Y(.4,.2),mat.gold(),3.5,2.9,0,PI2,0,0);
  const arm=new M.Mesh((()=>{ const q=Y(.1,1,false,.05); q.rotateX(PI2); q.translate(0,0,.5); return q; })(),mat.steel()); arm.position.set(3.0,2.0,0); arm.castShadow=true; g.add(arm);
  const cap=add(g,Y(.04,.45,false,.015),mat.black(),0,1,0);
  const pt=[[-.5,-.5,-1.2,-1.2],[.5,-.5,1.2,-1.2],[-.5,.5,-1.2,1.2],[.5,.5,1.2,1.2]];
  const tp=add(g,B(3.6,.5,3.6),mat.steel(),0,2,0), bp=add(g,B(3.6,.5,3.6),mat.steel(),0,-1.5,0);
  cabinet(g,5.4,0);
  return (dt,p)=>{
    const wp=cl((p-.4)/.3), k=Math.min(3,Math.floor(wp*4)), t=cl(wp*4-k); let cx=.4,cy=1,cz=0;
    if(wp>0&&wp<1){ const a=pt[k]; cx=lerp(a[0],a[2],t); cz=lerp(a[1],a[3],t); cy=lerp(-.25,-.5,t)+.55*Math.sin(PI*t)+.1; }
    cap.position.set(cx,cy+.2,cz); arm.position.set(3.0,2.0,0); arm.lookAt(cx,cy+.45,cz); arm.scale.z=Math.hypot(cx-3.0,cy+.45-2.0,cz);
    const mo=cl((p-.7)/.3), pres=p>.62; tp.visible=bp.visible=pres;
    tp.position.y=.44+.56*mo+.3+(1-cl((p-.62)/.08))*1.4;
  };
};

const _q=loadStage;
loadStage=function(i){
  _q(i); const L=stageGroup.children[0], g=new M.Group(); stageGroup.add(g);
  const a=BUILD[i](g,L), u0=stageUpdate;
  stageUpdate=(dt,p,m)=>{ u0(dt,p,m); a(dt,p,m); };
};
loadStage(current); camDist=13;
})();

/* =========================================================
   반응형: PC / 모바일(세로·가로) 화면 설정
   - 주소창 때문에 잘리는 100vh 대신 100dvh, 3D 화면을 위쪽(모바일)에 배치
   - 화면 비율에 맞춰 카메라 거리·시선 높이 자동 보정, 두 손가락 확대/축소
   ========================================================= */
(()=>{
const st=document.createElement('style');
st.textContent=`
html,body{height:100%;overscroll-behavior:none}
#app{height:100vh;height:100dvh;grid-template-rows:auto minmax(0,1fr) auto}
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
@media (max-height:480px){
  header{padding:6px 12px 4px} .titlebar{display:none} footer{padding:6px 12px} #info{padding:12px 14px}
}
@media (max-width:900px) and (max-height:480px){
  main{grid-template-columns:42% 58%!important;grid-template-rows:minmax(0,1fr)!important} #viewport{order:1} #info{order:0}
}`;
document.head.appendChild(st);

const coarse=matchMedia('(pointer:coarse)').matches;
if(coarse||matchMedia('(max-width:760px)').matches){
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  if(keyLight.shadow.map){ keyLight.shadow.map.dispose(); keyLight.shadow.map=null; }
  keyLight.shadow.mapSize.set(1024,1024);
}
if(coarse) document.querySelector('.hint').textContent='드래그: 회전 · 두 손가락: 확대/축소 · 설비를 터치: 공정 작동';

/* 화면 비율에 맞춘 카메라: 가로가 좁을수록 멀리, 높은 장비(스캐너 등)는 시선을 위로 */
const SC=[1,1,1.3,1,1.1,1,1,1], TY=[0,.6,2.2,.4,1.2,0,.4,.4];
function fit(i){ const a=holder.clientWidth/Math.max(1,holder.clientHeight); camDist=Math.min(28,Math.max(13,18/a))*SC[i]; }
updateCamera=function(){
  const ty=TY[current]||0;
  camera.position.set(camDist*Math.sin(camAngleY)*Math.cos(camAngleX),ty+camDist*Math.sin(camAngleX),camDist*Math.cos(camAngleY)*Math.cos(camAngleX));
  camera.lookAt(0,ty,0);
};
function size(){ const w=holder.clientWidth,h=holder.clientHeight; if(!w||!h) return; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); }
let cls=''; 
const ro=new ResizeObserver(()=>{ size(); const c=holder.clientWidth/Math.max(1,holder.clientHeight)<1.2?'p':'l'; if(c!==cls){ cls=c; fit(current); } });
ro.observe(holder);

/* 두 손가락 확대/축소 */
let pd=0; const cv=renderer.domElement;
cv.addEventListener('touchmove',e=>{ if(e.touches.length!==2){ pd=0; return; } e.preventDefault();
  const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
  if(pd) camDist=Math.max(4,Math.min(34,camDist*pd/d)); pd=d; },{passive:false});
cv.addEventListener('touchend',()=>{ pd=0; });

const _r=loadStage;
loadStage=function(i){ _r(i); fit(i); try{ const n=document.querySelector('.node.active'); if(n) n.scrollIntoView({inline:'center',block:'nearest'}); }catch(e){} };
size(); fit(current);
})();
