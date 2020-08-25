(function(t){var e={};function i(s){if(e[s]){return e[s].exports}var n=e[s]={i:s,l:false,exports:{}};t[s].call(n.exports,n,n.exports,i);n.l=true;return n.exports}i.m=t;i.c=e;i.d=function(t,e,s){if(!i.o(t,e)){Object.defineProperty(t,e,{enumerable:true,get:s})}};i.r=function(t){if(typeof Symbol!=="undefined"&&Symbol.toStringTag){Object.defineProperty(t,Symbol.toStringTag,{value:"Module"})}Object.defineProperty(t,"__esModule",{value:true})};i.t=function(t,e){if(e&1)t=i(t);if(e&8)return t;if(e&4&&typeof t==="object"&&t&&t.__esModule)return t;var s=Object.create(null);i.r(s);Object.defineProperty(s,"default",{enumerable:true,value:t});if(e&2&&typeof t!="string")for(var n in t)i.d(s,n,function(e){return t[e]}.bind(null,n));return s};i.n=function(t){var e=t&&t.__esModule?function e(){return t["default"]}:function e(){return t};i.d(e,"a",e);return e};i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)};i.p="";return i(i.s=1)})([function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{
value:true});e.toPromise=e.interceptEvent=e.transferChildren=e.getSeed=e.formatDateTime=e.formatTime=e.formatNumber=e.clearChildren=e.getImageDimensions=e.getUrl=e.round=e.NS_XHTML=e.NS_SVG=void 0;e.NS_SVG="http://www.w3.org/2000/svg";e.NS_XHTML="http://www.w3.org/1999/xhtml";function s(t,e=0){e=10**e;return Math.round((t+Number.EPSILON)*e)/e}e.round=s;function n(t){return new Promise((e,i)=>{const s=new FileReader;s.readAsDataURL(t);s.addEventListener("loadend",()=>e(s.result));s.addEventListener("error",()=>i(new Error("Unable to get URL from blob.")))})}e.getUrl=n;function r(t){return new Promise((e,i)=>{const s=new Image;s.src=t;s.addEventListener("load",()=>e({width:s.naturalWidth,height:s.naturalHeight}));s.addEventListener("error",()=>i(new Error("Could not load image from src.")))})}e.getImageDimensions=r;function o(t){t.textContent="";while(t.hasChildNodes())t.removeChild(t.firstChild)}e.clearChildren=o;function h(t,e){return t.toString(10).padStart(e,"0")}e.formatNumber=h;function a(t){
const e=Math.abs(t);let i=`${h(Math.floor(e/6e4%60),2)}:${h(Math.floor(e/1e3%60),2)}`;if(t<36e5)return(t<0?"-":"")+i;i=`${h(Math.floor(e/36e5%24),2)}:${i}`;if(t<864e5)return(t<0?"-":"")+i;return`${h(Math.floor(t/864e5),2)}d ${i}`}e.formatTime=a;function l(t=new Date){const e=t.getFullYear();const i=t.getMonth();const s=t.getDate();const n=t.getHours();const r=t.getMinutes();const o=t.getSeconds();return`${h(s,2)}/${h(i+1,2)}/${h(e,4)} ${h(n%12||12,2)}:${h(r,2)}:${h(o,2)} ${n>=12?"PM":"AM"}`}e.formatDateTime=l;function c(t){switch(typeof t){case"undefined":case"object":if(t==null)t="";default:t=t.toString();case"string":{let e=0;for(let i=0;i<t.length;i++)e=Math.imul(31,e)+t.charCodeAt(i)|0;t=e}}return t}e.getSeed=c;function u(t,e){if(!t.childElementCount)return;const i=t.ownerDocument.createDocumentFragment();Array.from(t.childNodes).forEach(i.appendChild,i);e.appendChild(i)}e.transferChildren=u;function d(t){if(t.cancelable&&!t.defaultPrevented)t.preventDefault();t.stopPropagation()}e.interceptEvent=d
;function m(t,e,...i){return new Promise(s=>e.call(t,...i,s))}e.toPromise=m},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.MainHandler=void 0;const s=i(2);const n=i(3);const r=i(0);const o=i(4);const h=i(5);const a=i(6);const l=/^p-(\d+)-(\d+)/;class c{constructor(t=document){var e,i,s;this.width=1;this.height=1;this.baseTime=0;this.theshold=3;this.time=0;this._xc=1;this._yc=1;(e=t.querySelector(".noscript"))===null||e===void 0?void 0:e.classList.remove("noscript");this.root=t.querySelector("svg");a.registerDropZone(this.root);this.document=t instanceof Document?t:this.root.ownerDocument;this.masksElement=t.querySelector("g#ms");this.uiGroup=t.querySelector("g#ui");this.pathGroup=t.querySelector("g#ps");this.instanceGroup=t.querySelector("g#ins");this.timeDisp=t.querySelector("text#time");this.dataElement=t.querySelector("script#data");this.menuGroup=t.querySelector("#menu");this.menuForm=t.querySelector("form#menuform")
;this.menuForm.addEventListener("submit",this.onMenuSubmit.bind(this));this.menuForm.addEventListener("reset",this.onMenuReset.bind(this));this.root.addEventListener("paste",this.onPaste.bind(this),true);a.registerDropZone(this.root.querySelector("#menu"),this.onDragDrop.bind(this));this.imageSelector=this.menuForm.querySelector("input#image-input");this.imageSelector.addEventListener("change",this.onImageSelected.bind(this));this.colSelector=this.menuForm.querySelector("input#col-input");const r=this.onColChange.bind(this);this.colSelector.addEventListener("change",r);this.colSelector.addEventListener("blur",r);this.rowSelector=this.menuForm.querySelector("input#row-input");const o=this.onRowChange.bind(this);this.rowSelector.addEventListener("change",o);this.rowSelector.addEventListener("blur",o);this.sizeCountDisplay=this.menuForm.querySelector("#size-count");this.imagePreview=this.menuForm.querySelector("img#preview")
;(i=this.root.querySelector("#new-game"))===null||i===void 0?void 0:i.addEventListener("click",this.menu.bind(this));(s=this.root.querySelector("#save-game"))===null||s===void 0?void 0:s.addEventListener("click",this.save.bind(this));this.imageElement=t.querySelector("image#img");this.imageUrl=this.imageElement.href.baseVal;window.addEventListener("resize",this.onWindowResize.bind(this));Object.assign(this,n.registerDraggable(t,this.onDrag.bind(this),this.onDrop.bind(this)));this.load();this.onWindowResize()}get xCount(){return this._xc}set xCount(t){this._xc=t;this._yc=Math.max(1,Math.round(t/this.width*this.height))}get yCount(){return this._yc}set yCount(t){this._yc=t;this._xc=Math.max(1,Math.round(t/this.height*this.width))}async updateImage(t){console.log("Load image",t);const e=t instanceof Blob?await r.getUrl(t):t;const{width:i,height:s}=await r.getImageDimensions(e);this.imageUrl=e;this.width=i;this.height=s;this._xc=Math.round(i/100);this._yc=Math.round(s/100)
;this.colSelector.valueAsNumber=this.xCount=Math.round(this.width/100);this.rowSelector.valueAsNumber=this.yCount;this.onSizeChange();if(this.imagePreview.src.startsWith("blob:"))URL.revokeObjectURL(this.imagePreview.src);this.imagePreview.src=t instanceof Blob?URL.createObjectURL(t):e}calculateTheshold(){this.theshold=Math.max(3,Math.sqrt((this.width/this._xc)**2+(this.height/this._yc)**2)/20)}init(){r.clearChildren(this.pathGroup);r.clearChildren(this.instanceGroup);r.clearChildren(this.masksElement);h.hideCetificate();this.time=0;this.baseTime=0;this.startTime=new Date;this.calculateTheshold();delete this.endTime;delete this.resumeTime;this.timeDisp.textContent="--:--";if(this.timer!=null){clearInterval(this.timer);delete this.timer}const t=new s.JigsawGenerator(this.width,this.height,this._xc,this._yc,undefined,undefined,undefined,10).toSvgElements(this.document,this.pathGroup);const e=Math.max(640,this.width*1.5);const i=Math.max(480,this.height*1.5);this.root.setAttribute("viewBox",`0 0 ${e} ${i}`)
;this.imageElement.href.baseVal=this.imageUrl;this.imageElement.setAttribute("width",this.width.toString());this.imageElement.setAttribute("height",this.height.toString());const n=this.document.createDocumentFragment();const o=this.document.createDocumentFragment();for(const s of t){const t=n.appendChild(this.document.createElementNS(r.NS_SVG,"mask"));t.id=`${s.id}-m`;const h=t.appendChild(this.document.createElementNS(r.NS_SVG,"use"));h.href.baseVal=`#${s.id}`;h.setAttribute("fill","white");const a=o.appendChild(this.document.createElementNS(r.NS_SVG,"g"));a.id=`${s.id}-i`;a.classList.add("draggable");const c=a.appendChild(this.document.createElementNS(r.NS_SVG,"use"));c.href.baseVal=`#${this.imageElement.id}`;c.setAttribute("mask",`url(#${t.id})`);const u=a.appendChild(this.document.createElementNS(r.NS_SVG,"use"));u.classList.add("handler");u.href.baseVal=`#${s.id}`;u.setAttribute("stroke","black");u.setAttribute("fill","transparent");const d=l.exec(s.id);if(d){const t=this.width/this._xc
;const s=this.height/this._yc;a.transform.baseVal.appendItem(this.root.createSVGTransform()).setTranslate(Math.round(Math.random()*(e-t)-parseInt(d[1],10)*t),Math.round(Math.random()*(i-s)-parseInt(d[2],10)*s))}}this.masksElement.appendChild(n);this.instanceGroup.appendChild(o);this.serializeToData();this.onWindowResize()}onDrag(t){t.classList.add("grabbing");if(this.timer!=null)return;this.resumeTime=new Date;this.timer=window.setInterval(this.updateTime.bind(this),1e3);this.updateTime()}onDrop(t){t.element.classList.remove("grabbing");const{id:e}=t.target.parentNode;const i=l.exec(e);if(!i)return;const s=parseInt(i[1],10);const n=parseInt(i[2],10);t.element=this.checkAndMerge(t.element,`#p-${s+1}-${n}-i`);t.element=this.checkAndMerge(t.element,`#p-${s-1}-${n}-i`);t.element=this.checkAndMerge(t.element,`#p-${s}-${n+1}-i`);t.element=this.checkAndMerge(t.element,`#p-${s}-${n-1}-i`);if(this.instanceGroup.childElementCount>1)return;this.endTime=new Date;if(this.timer!=null){clearInterval(this.timer)
;delete this.timer}const r=this.instanceGroup.querySelector(".draggable.group");if(r){r.classList.remove("draggable");r.transform.baseVal.removeItem(0)}const o=Math.max(640,this.width+20);const a=Math.max(480,this.height+40);this.root.setAttribute("viewBox",`0 0 ${o} ${a}`);this.onWindowResize();h.showCertificate(this)}checkAndMerge(t,e){var i;const s=(i=this.instanceGroup.querySelector(e))===null||i===void 0?void 0:i.closest(".draggable");if(!s||this.isDragging(s)||s===t)return t;const n=t.transform.baseVal;if(!n.numberOfItems)return t;const o=s.transform.baseVal;if(!o.numberOfItems)return t;const h=n.getItem(0).matrix;const a=o.getItem(0).matrix;if(Math.sqrt((h.e-a.e)**2+(h.f-a.f)**2)>this.theshold)return t;const l=t.classList.contains("group");const c=s.classList.contains("group");if(l){if(!c){s.classList.remove("draggable");o.removeItem(0);t.appendChild(s)}else if(s.childElementCount>t.childElementCount){r.transferChildren(t,s);t.remove();return s}else{r.transferChildren(s,t);s.remove()}return t}if(c){
t.classList.remove("draggable");n.removeItem(0);s.appendChild(t);return s}const u=t.parentNode.appendChild(this.document.createElementNS(r.NS_SVG,"g"));u.classList.add("draggable","group");u.appendChild(t);t.classList.remove("draggable");u.appendChild(s);s.classList.remove("draggable");const d=o.getItem(0);n.removeItem(0);o.removeItem(0);u.transform.baseVal.appendItem(d);return u}isDragging(t){return false}updateTime(){this.time=Date.now()-this.resumeTime.getTime()+this.baseTime;this.timeDisp.textContent=r.formatTime(this.time)}menu(){this.menuGroup.classList.add("show");this.onSizeChange()}load(){const t=JSON.parse(this.dataElement.textContent||"null");if(t==null)return;this.width=t.width||1;this.height=t.height||1;this.baseTime=t.time||0;this._xc=t.xCount||1;this._yc=t.yCount||1;if(t.startTime!=null)this.startTime=new Date(t.startTime);if(t.endTime!=null)this.endTime=new Date(t.endTime);this.calculateTheshold()}serializeToData(){var t,e;if(this.resumeTime!=null&&this.endTime==null)this.updateTime()
;this.dataElement.textContent=JSON.stringify({width:this.width,height:this.height,xCount:this._xc,yCount:this._yc,startTime:(t=this.startTime)===null||t===void 0?void 0:t.getTime(),endTime:(e=this.endTime)===null||e===void 0?void 0:e.getTime(),time:this.time})}save(){this.serializeToData();return o.downloadDocument(this.root,`puzzle-${Date.now()}.svg`,u)}onImageSelected(){const{files:t}=this.imageSelector;if(!t||!t.length)return;const e=t.item(0);this.updateImage(e)}onColChange(){this.xCount=this.colSelector.valueAsNumber;this.rowSelector.valueAsNumber=this.yCount;this.onSizeChange()}onRowChange(){this.yCount=this.rowSelector.valueAsNumber;this.colSelector.valueAsNumber=this.xCount;this.onSizeChange()}onSizeChange(){this.sizeCountDisplay.textContent=`(${this._xc*this._yc} Pieces)`}async onMenuSubmit(t){t.preventDefault();if(!this.imageUrl)return;this.init();this.menuForm.reset()}onMenuReset(){if(this.imagePreview.src.startsWith("blob:"))URL.revokeObjectURL(this.imagePreview.src);this.imagePreview.src=""
;this.menuGroup.classList.remove("show")}onWindowResize(){let t,e;if(!this.dataElement.textContent){if(window.innerWidth>window.innerHeight){e=480;t=e/window.innerHeight*window.innerWidth}else{t=640;e=t/window.innerWidth*window.innerHeight}this.root.setAttribute("viewBox",`0 0 ${t} ${e}`)}else{const i=this.root.viewBox.baseVal;t=i.width;e=i.height}const i=t/e;const s=window.innerWidth/window.innerHeight;const n=(i>s?e/window.innerHeight:t/window.innerWidth)*window.devicePixelRatio;this.uiGroup.transform.baseVal.getItem(0).setScale(n,n)}onPaste(t){if(this.menuGroup.classList.contains("show")&&t.clipboardData&&t.clipboardData.files.length){r.interceptEvent(t);this.onDragDrop(t.clipboardData)}}async onDragDrop(t){let e=false;for(const i of t.items){switch(i.kind){case"file":{if(!i.type.startsWith("image/"))break;const t=i.getAsFile();if(!t)break;try{this.updateImage(t);e=true}catch{}break}case"string":switch(i.type){case"text/uri-list":for(const t of(await r.toPromise(i,i.getAsString)).split("\r\n"))try{
await this.updateImage(await(await fetch(t)).blob());e=true;break}catch{}break}break}if(e)break}return e}}e.MainHandler=c;new c;function u(t){var e,i;t.classList.add("noscript");(i=(e=t.querySelector("g#ui"))===null||e===void 0?void 0:e.transform.baseVal.getItem(0))===null||i===void 0?void 0:i.setScale(1,1)}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.JigsawGenerator=void 0;const s=i(0);const n={M:2,m:2,L:2,l:2,H:1,h:1,V:1,v:1,C:6,c:6,S:4,s:4,Q:4,q:4,T:2,t:2,A:7,a:7,z:0};class r{constructor(t,e,i,n,r,o=.1,h=.04,a=0){var l;this.width=t;this.height=e;this.xCount=i;this.yCount=n;this.seed=r;this.tabSize=o;this.jitter=h;this.radius=a;this.strokes=new Map;this.a=0;this.b=0;this.c=0;this.d=0;this.e=0;this.flip=false;this.seed=s.getSeed(r!==null&&r!==void 0?r:Math.trunc(Math.random()*Number.MAX_SAFE_INTEGER));this.radius=Math.min(this.radius,this.sl,this.sw);this.vertical=false;for(this.yi=1;this.yi<this.yCount;this.yi++){this.first()
;for(this.xi=0;this.xi<this.xCount;this.xi++){this.next();this.pushStroke(this.xi+this.xCount*(this.yi-1),this.generateStroke(true));this.pushStroke(this.xi+this.xCount*this.yi,this.generateStroke())}}this.vertical=true;for(this.xi=1;this.xi<this.xCount;this.xi++){this.first();for(this.yi=0;this.yi<this.yCount;this.yi++){this.next();this.pushStroke(this.xi-1+this.xCount*this.yi,this.generateStroke());this.pushStroke(this.xi+this.xCount*this.yi,this.generateStroke(true))}}this.vertical=false;this.pushStroke(0,{points:[0,s.round(this.sw,3),0,this.radius,this.radius,this.radius,0,0,1,this.radius,0],inst:["M","L","A"]});this.vertical=true;this.pushStroke(this.xCount-1,{points:[s.round(this.width-this.sw),0,this.width-this.radius,0,this.radius,this.radius,0,0,1,this.width,this.radius],inst:["M","L","A"]});this.vertical=false;this.pushStroke(this.xCount*this.yCount-1,{
points:[this.width,s.round(this.height-this.sw,3),this.width,this.height-this.radius,this.radius,this.radius,0,0,1,this.width-this.radius,this.height],inst:["M","L","A"]});this.vertical=true;this.pushStroke(this.xCount*(this.yCount-1),{points:[s.round(this.sw,3),this.height,this.radius,this.height,this.radius,this.radius,0,0,1,0,this.height-this.radius],inst:["M","L","A"]});this.cells=[];for(const[t,e]of this.strokes){const i=Math.trunc(t/this.xCount);((l=this.cells[i])!==null&&l!==void 0?l:this.cells[i]=[])[t%this.xCount]=this.getNormalizedStroke(e)}this.strokes.clear()}get sl(){return this.vertical?this.height/this.yCount:this.width/this.xCount}get sw(){return this.vertical?this.width/this.xCount:this.height/this.yCount}get ol(){return this.sl*(this.vertical?this.yi:this.xi)}get ow(){return this.sw*(this.vertical?this.xi:this.yi)}toSvgElements(t,e){const i=[];for(let n=0;n<this.cells.length;n++){const r=this.cells[n];for(let o=0;o<r.length;o++){const h=t.createElementNS(s.NS_SVG,"path")
;h.setAttribute("d",r[o]);h.id=`p-${o}-${n}`;i.push(h);e===null||e===void 0?void 0:e.appendChild(h)}}return i}generateStroke(t){const{a:e,b:i,c:s,d:n,e:r,tabSize:o}=this;const h=this.l(0);const a=this.w(0);const l=this.l(.2);const c=this.w(e);const u=this.l(.5+i+n);const d=this.w(-o+s);const m=this.l(.5-o+i);const f=this.w(o+s);const g=this.l(.5-2*o+i-n);const p=this.w(3*o+s);const v=this.l(.5+2*o+i-n);const w=this.w(3*o+s);const b=this.l(.5+o+i);const S=this.w(o+s);const C=this.l(.5+i+n);const y=this.w(-o+s);const x=this.l(.8);const E=this.w(r);const M=this.l(1);const T=this.w(0);return{points:this.vertical?t?[T,M,E,x,y,C,S,b,w,v,p,g,f,m,d,u,c,l,a,h]:[a,h,c,l,d,u,f,m,p,g,w,v,S,b,y,C,E,x,T,M]:t?[M,T,x,E,C,y,b,S,v,w,g,p,m,f,u,d,l,c,h,a]:[h,a,l,c,u,d,m,f,g,p,v,w,b,S,C,y,x,E,M,T],inst:["M","C","C","C"]}}random(){const t=Math.sin(this.seed++)*1e4;return t-Math.floor(t)}nextJitter(){return this.random()*this.jitter*2-this.jitter}first(){this.e=this.nextJitter()}next(){const t=this.flip;this.flip=this.random()>=.5
;this.a=this.flip===t?-this.e:this.e;this.b=this.nextJitter();this.c=this.nextJitter();this.d=this.nextJitter();this.e=this.nextJitter()}l(t){return s.round(this.ol+this.sl*t,3)}w(t){return s.round(this.ow+this.sw*t*(this.flip?-1:1),3)}pushStroke(t,e){const i=this.strokes.get(t);if(i)i.push(e);else this.strokes.set(t,[e])}getNormalizedStroke(t){if(t==null||!t.length)return"";if(t.length>1){const e=new Set(t);const i={points:[],inst:[]};while(e.size){let t=false;for(const s of e)if(!i.points.length){i.points=s.points;i.inst=s.inst;t=true;e.delete(s);break}else if(Math.abs(i.points[0]-s.points[s.points.length-2])<1&&Math.abs(i.points[1]-s.points[s.points.length-1])<1){i.points.splice(0,2,...s.points);i.inst.splice(0,1,...s.inst);t=true;e.delete(s);break}else if(Math.abs(s.points[0]-i.points[i.points.length-2])<1&&Math.abs(s.points[1]-i.points[i.points.length-1])<1){s.points.splice(0,2,...i.points);s.inst.splice(0,1,...i.inst);i.points=s.points;i.inst=s.inst;t=true;e.delete(s);break}if(!t)break}t=[i]}
const{points:e,inst:i}=t[0];let s=0;let r="";for(const t of i){r+=t;const i=n[t];if(i)r+=e.slice(s,s+=i).join(" ")}return r+"z"}}e.JigsawGenerator=r},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.registerDraggable=void 0;const s=i(0);function n(t=document,e,i,n=".draggable",o=".handler"){const h=new Map;const a=new Map;t.addEventListener("mousedown",u,true);t.addEventListener("mousemove",f);t.addEventListener("mouseup",v);t.addEventListener("mouseleave",v);t.addEventListener("touchstart",d,{capture:true,passive:false});t.addEventListener("touchmove",g,{passive:false});t.addEventListener("touchend",w,{passive:false});t.addEventListener("touchcancel",w,{passive:false});function l(t){const e=a.get(t.identifier);return e&&e.identifier==null===t instanceof MouseEvent?e:null}function c(t){let{target:e}=t;if(!(e instanceof Element))return;e=e.closest(`${n} ${o}, ${n}${o}`);if(e instanceof SVGGraphicsElement)return e}function u(t){if(t.button!==0)return;const e=c(t);if(!e)return
;m(e,t,t.ctrlKey||t.shiftKey);s.interceptEvent(t)}function d(t){const e=t.targetTouches.item(0);if(!e)return;const i=c(t);if(!i)return;m(i,e,t.ctrlKey||t.shiftKey);s.interceptEvent(t)}function m(t,i,s){var o;const l=t.ownerSVGElement;const c=t.matches(n)?t:t.closest(n);if(h.has(c))return;const u=c.transform.baseVal;if(!u.numberOfItems||u.getItem(0).type!==SVGTransform.SVG_TRANSFORM_TRANSLATE){const t=l.createSVGTransform();t.setTranslate(0,0);u.insertItemBefore(t,0)}const d=u.getItem(0);const m=r(l,i,c.parentNode).matrixTransform(d.matrix.inverse());const{identifier:f}=i;const g={element:c,target:t,identifier:f,transform:d,offsetX:m.x,offsetY:m.y};h.set(c,g);a.set(f,g);if(c.nextSibling&&s)(o=c.parentNode)===null||o===void 0?void 0:o.appendChild(c);else g.bringToFrontAfter=true;e===null||e===void 0?void 0:e(c)}function f(t){if(a.size&&t.button===0&&p(t))s.interceptEvent(t)}function g(t){if(a.size&&t.changedTouches.length&&Array.prototype.map.call(t.changedTouches,p).includes(true))s.interceptEvent(t)}
function p(t){const e=l(t);if(!e)return false;const i=r(e.element.ownerSVGElement,t,e.element.parentNode);i.x-=e.offsetX;i.y-=e.offsetY;e.transform.setTranslate(i.x,i.y);return true}function v(t){if(a.size&&b(t))s.interceptEvent(t)}function w(t){if(a.size&&t.changedTouches.length&&Array.prototype.map.call(t.changedTouches,b).includes(true))s.interceptEvent(t)}function b(t){var e;const s=l(t);if(!s)return false;h.delete(s.element);a.delete(s.identifier);if(s.bringToFrontAfter)(e=s.element.parentNode)===null||e===void 0?void 0:e.appendChild(s.element);i===null||i===void 0?void 0:i(s);return true}return{isDragging(t){return h.has(t)}}}e.registerDraggable=n;function r(t,e,i){const s=t.createSVGPoint();s.x=e.clientX;s.y=e.clientY;return i!=null?s.matrixTransform(i instanceof SVGGraphicsElement?i.getScreenCTM().inverse():i):s}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.downloadDocument=void 0;const s=i(0);async function n(t,e,i){const n=t.ownerDocument
;const o=n.implementation.createDocument(s.NS_SVG,"svg",null);const h=o.importNode(t,true);o.replaceChild(h,o.firstChild);await Promise.all(Array.prototype.map.call(h.querySelectorAll("script"),r));await(i===null||i===void 0?void 0:i(h,o));const a=new Blob([(new XMLSerializer).serializeToString(o)],{type:"image/svg+xml"});const l=n.createElementNS(s.NS_XHTML,"a");l.href=URL.createObjectURL(a);l.download=e;l.click();URL.revokeObjectURL(l.href)}e.downloadDocument=n;async function r(t){if(t instanceof HTMLScriptElement){const{src:e}=t;if(!e)return;t.removeAttribute("src");t.textContent=await(await fetch(e)).text()}else if(t instanceof SVGScriptElement){const e=t.href.baseVal;if(!e)return;t.removeAttribute("href");t.appendChild(t.ownerDocument.createCDATASection(await(await fetch(e)).text()))}}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.hideCetificate=e.showCertificate=void 0;const s=i(0);const n=document.querySelector("#certificate")
;const r=n.querySelector("text#time-start");const o=n.querySelector("text#time-end");const h=n.querySelector("text#time-used");const a=n.querySelector("text#puzzle-size");function l(t){n.classList.add("show");n.setAttribute("visibility","visible");n.setAttribute("pointer-events","visible");r.textContent=s.formatDateTime(t.startTime);o.textContent=s.formatDateTime(t.endTime);h.textContent=s.formatTime(t.time);a.textContent=`${t.xCount}×${t.yCount} (${t.xCount*t.yCount} Pieces)`}e.showCertificate=l;function c(){n.classList.remove("show");r.textContent="";o.textContent="";h.textContent="";a.textContent=""}e.hideCetificate=c},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.registerDropZone=void 0;const s=i(0);function n(t,e,i,s,n){const h=e!=null?null:o;t.addEventListener("dragenter",r(i!==null&&i!==void 0?i:h));t.addEventListener("dragover",r(s!==null&&s!==void 0?s:h));t.addEventListener("dragleave",r(n));t.addEventListener("drop",r(e))}e.registerDropZone=n;function r(t){
return t!=null?e=>{s.interceptEvent(e);if(e.dataTransfer!=null)t(e.dataTransfer)}:s.interceptEvent}function o(t){t.dropEffect="none"}}]);
//# sourceMappingURL=main.js.map