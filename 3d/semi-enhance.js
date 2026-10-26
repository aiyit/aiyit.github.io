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
   실제 장비 외형: 스테인리스 챔버·플랜지·펌프·제어반 등
   (배경은 중간 톤으로 낮춰 은색 장비와 구분되게 함)
   ========================================================= */
(()=>{
const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), Y=(r,h,o)=>new THREE.CylinderGeometry(r,r,h,40,1,!!o);
const steel=()=>new THREE.MeshStandardMaterial({color:0xaeb6c0,metalness:1,roughness:.32,envMapIntensity:1.3,side:THREE.DoubleSide});
const dark=()=>new THREE.MeshStandardMaterial({color:0x2b323c,metalness:.6,roughness:.45});
const paint=c=>new THREE.MeshStandardMaterial({color:c,metalness:.1,roughness:.5});
const glass=()=>new THREE.MeshStandardMaterial({color:0xcfe6f2,metalness:0,roughness:.05,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false});
const glow=c=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:1.2});
function add(g,geo,mat,x,y,z,rx,rz){ const o=new THREE.Mesh(geo,mat); o.position.set(x,y,z); o.rotation.set(rx||0,0,rz||0); o.castShadow=!mat.transparent; o.receiveShadow=true; g.add(o); return o; }
const plate=(g,w,d)=>add(g,B(w,.2,d),dark(),0,-2.3,0);
function cabinet(g,x,z){ add(g,B(1.5,2.6,1.2),paint(0xe3e8ee),x,-1,z); add(g,B(1.1,.6,.04),glow(0x1fae7a),x,-.4,z+.62); add(g,Y(.07,.4),glow(0x3ddc84),x+.5,.5,z); }
function chamber(g,r,h,y){ add(g,Y(r,h,1),glass(),0,y,0); [y+h/2,y-h/2].forEach(v=>add(g,Y(r+.15,.18),steel(),0,v,0)); [-1,1].forEach(s=>add(g,Y(.16,1.2),steel(),s*(r+.6),y,0,0,Math.PI/2)); }
function pump(g,x,y){ add(g,Y(.7,1.2),steel(),x,y,0); add(g,Y(.12,2),steel(),x,y+1.2,0); }
const PI2=Math.PI/2;
const EQ=[
 g=>{ plate(g,12,3.6); add(g,B(7.6,.2,.3),steel(),-1.2,2.3,-1.4); add(g,B(.3,4.6,.3),steel(),-4.9,0,-1.4); add(g,B(.3,4.6,.3),steel(),2.5,0,-1.4); add(g,Y(.5,.4),steel(),-4.7,0,0,0,PI2); cabinet(g,5,-.5); },
 g=>{ plate(g,12,3.6); [-1.7,1.7].forEach(x=>add(g,Y(2.35,.22),steel(),x,0,0,0,PI2)); add(g,Y(.14,1.6),steel(),-2.5,0,0,0,PI2); add(g,Y(.14,1.6),steel(),2.5,0,0,0,PI2); [-1,1].forEach(x=>add(g,B(.4,.3,2.6),dark(),x,-2.15,0)); cabinet(g,5,0); },
 g=>{ plate(g,9,6); add(g,Y(2.15,.6,1),steel(),0,.15,0); add(g,Y(.6,1.5),steel(),0,-.9,0); add(g,Y(.1,1.4),steel(),2.4,.5,0); add(g,Y(.06,2.4),steel(),1.2,1.2,0,0,PI2); cabinet(g,-4.2,0); },
 g=>{ plate(g,12,6); chamber(g,2.5,2.4,.2); add(g,Y(1.8,.12),steel(),0,1.2,0); add(g,Y(1.9,.6),steel(),0,-.45,0); add(g,Y(.12,1.6),steel(),0,-1.5,0); pump(g,3.2,-1.7); cabinet(g,5.4,0); },
 g=>{ plate(g,12,6); chamber(g,2.6,5.5,1.4); add(g,Y(1.8,.5),steel(),0,-.4,0); pump(g,3.2,-1.7); cabinet(g,5.4,0); },
 g=>{ plate(g,7,6); add(g,Y(.8,1.8),steel(),0,-1.25,0); },
 g=>{ plate(g,9,6); add(g,Y(1.95,.5),steel(),0,-.35,0); const t=new THREE.Mesh(new THREE.TorusGeometry(2.1,.09,12,48),steel()); t.position.y=1.7; t.rotation.x=PI2; t.castShadow=true; g.add(t);
      [-1,1].forEach(s=>add(g,B(.2,4,.2),steel(),s*2.6,-.3,-1.6)); add(g,B(5.4,.2,.2),steel(),0,1.7,-1.6); cabinet(g,-4.2,0); },
 g=>{ plate(g,7,6); cabinet(g,-4,0); }
];
const _q=loadStage;
loadStage=function(i){ _q(i); const g=new THREE.Group(); EQ[i](g); stageGroup.add(g); };
loadStage(current); camDist=12;
})();
