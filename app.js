const $ = id => document.getElementById(id);

// Tabs
document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === btn));
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === btn.dataset.page));
}));

// Interactive manual trajectory diagram
const canvas = $("aimCanvas"), ctx = canvas.getContext("2d");
let points = [{x:180,y:310},{x:700,y:170}], dragging = -1;
function drawTable(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#14502f";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="#b8d9c0";ctx.lineWidth=4;ctx.strokeRect(22,22,856,456);
  ctx.strokeStyle="#ffffff55";ctx.lineWidth=2;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);ctx.lineTo(points[1].x,points[1].y);ctx.stroke();ctx.setLineDash([]);
  points.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fillStyle=i===0?"#f4f4ee":"#e8b84b";ctx.fill();ctx.strokeStyle="#17251b";ctx.lineWidth=3;ctx.stroke();});
  ctx.fillStyle="#e7f5e9";ctx.font="bold 17px sans-serif";ctx.fillText("DIAGRAMA MANUAL",38,52);
}
function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
canvas.addEventListener("pointerdown",e=>{const p=canvasPoint(e);dragging=points.findIndex(q=>Math.hypot(q.x-p.x,q.y-p.y)<40);if(dragging>=0)canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(dragging<0)return;const p=canvasPoint(e);points[dragging]={x:Math.max(22,Math.min(878,p.x)),y:Math.max(22,Math.min(478,p.y))};drawTable();});
canvas.addEventListener("pointerup",()=>dragging=-1);canvas.addEventListener("pointercancel",()=>dragging=-1);
$("resetAim").addEventListener("click",()=>{points=[{x:180,y:310},{x:700,y:170}];drawTable();});
drawTable();

// Bank Shot estimate: reflect target across top cushion (y=0) and find line angle.
function updateBank(){
  const bx=+$("bx").value,by=+$("by").value,tx=+$("tx").value;
  $("bxOut").textContent=bx+"%";$("byOut").textContent=by+"%";$("txOut").textContent=tx+"%";
  const angle=Math.atan2(by,Math.abs(tx-bx))*180/Math.PI;
  $("bankResult").textContent=`Ângulo geométrico aproximado: ${angle.toFixed(1)}°`;
}
["bx","by","tx"].forEach(id=>$(id).addEventListener("input",updateBank));updateBank();

// Angle calculator
$("calcAngle").addEventListener("click",()=>{
  const ax=+$("ax").value,ay=+$("ay").value,bx=+$("cx").value,by=+$("cy").value;
  const dx=bx-ax,dy=by-ay;
  if(![ax,ay,bx,by].every(Number.isFinite)){ $("angleResult").textContent="Preencha todos os campos.";return;}
  if(dx===0&&dy===0){$("angleResult").textContent="Os pontos precisam ser diferentes.";return;}
  const a=Math.atan2(dy,dx)*180/Math.PI,d=Math.hypot(dx,dy);
  $("angleResult").textContent=`Ângulo: ${a.toFixed(2)}° · Distância: ${d.toFixed(2)}`;
});

// Image zoom
let imageUrl=null;
$("imageInput").addEventListener("change",e=>{
  const file=e.target.files&&e.target.files[0];if(!file)return;
  if(imageUrl)URL.revokeObjectURL(imageUrl);
  imageUrl=URL.createObjectURL(file);const img=$("zoomImage");img.src=imageUrl;img.style.display="block";
  img.onload=applyZoom;applyZoom();
});
function applyZoom(){const img=$("zoomImage");const z=+$("zoomRange").value/100;$("zoomOut").textContent=Math.round(z*100)+"%";if(img.naturalWidth){img.style.width=(img.naturalWidth*z)+"px";img.style.height=(img.naturalHeight*z)+"px";}}
$("zoomRange").addEventListener("input",applyZoom);

// Power reference
function updatePower(){const v=+$("powerRange").value;$("powerNum").textContent=v;$("powerText").textContent=v<30?"Toque leve":v<65?"Força média":v<85?"Força alta":"Força máxima";}
$("powerRange").addEventListener("input",updatePower);updatePower();
