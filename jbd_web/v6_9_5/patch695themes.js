/* v6.9.5 visual variants — village / coast / compound / frozen base */
(()=>{
  const wait=()=>{
    const J=window.JBD;if(!J||!J.World||!J.Render||!J.Scenarios){setTimeout(wait,40);return;}if(J.__v695themes)return;J.__v695themes=true;
    const oldResize=J.World.resize.bind(J.World),oldRender=J.Render.render.bind(J.Render);
    const variant=s=>['village','village','river','coast','urban','desertbase','frozen','frozenvillage','frozenbase'][s?.scenario?.index||0]||'village';
    function buildings(s){if(Array.isArray(s.map?.buildings)&&s.map.buildings.length)return s.map.buildings;if(s.map?.building)return[s.map.building];return[];}
    function stripe(g,x,y,w,h,step=8){g.fillStyle='rgba(255,255,255,.20)';for(let xx=x+4;xx<x+w;xx+=step)g.fillRect(Math.round(xx),Math.round(y+h*.5),Math.max(2,step*.42),1);}
    function coast(g,s,w,h){g.save();const edge=w*.17;g.fillStyle='#225f7b';g.fillRect(0,0,edge,h);g.fillStyle='#3f91a8';g.fillRect(edge*.50,0,edge*.50,h);g.fillStyle='#76c5cf';g.fillRect(edge*.82,0,edge*.20,h);g.fillStyle='#d8c18b';g.fillRect(edge,0,w*.10,h);for(let y=8;y<h;y+=17){g.fillStyle='rgba(225,249,245,.36)';g.fillRect(edge*.74+Math.sin(y*.07)*3,y,edge*.30,1);}for(let y=18;y<h;y+=58){g.fillStyle='rgba(115,88,54,.50)';g.fillRect(edge+w*.025,y,3,2);g.fillRect(edge+w*.065,y+13,5,3);}g.restore();}
    function urban(g,s,w,h){g.save();const bs=buildings(s);for(let i=0;i<bs.length;i++){const b=bs[i],rw=Math.min(150,w*.34),rh=70;g.fillStyle='rgba(72,75,69,.62)';g.fillRect(Math.max(4,b.x-rw*.5),Math.max(8,b.y-rh*.5),rw,rh);g.strokeStyle='rgba(225,226,207,.22)';g.lineWidth=1;g.strokeRect(Math.max(4,b.x-rw*.5)+2,Math.max(8,b.y-rh*.5)+2,rw-4,rh-4);stripe(g,Math.max(4,b.x-rw*.5),Math.max(8,b.y-rh*.5),rw,rh,13);}
      const y=h*.24;g.fillStyle='rgba(68,72,66,.50)';g.fillRect(w*.08,y,w*.84,40);g.fillStyle='rgba(245,240,200,.28)';for(let x=w*.12;x<w*.88;x+=28)g.fillRect(Math.round(x),Math.round(y+19),14,2);g.restore();}
    function desertBase(g,s,w,h){g.save();g.fillStyle='rgba(164,140,90,.24)';g.fillRect(w*.08,h*.16,w*.84,h*.62);g.strokeStyle='rgba(87,70,44,.38)';g.strokeRect(w*.08,h*.16,w*.84,h*.62);for(let y=h*.20;y<h*.74;y+=42){g.fillStyle='rgba(83,66,43,.18)';g.fillRect(w*.12,y,w*.76,2);}g.restore();}
    function frozenBase(g,s,w,h){g.save();g.fillStyle='rgba(113,128,128,.22)';g.fillRect(w*.12,h*.18,w*.76,h*.56);g.strokeStyle='rgba(72,86,88,.36)';g.strokeRect(w*.12,h*.18,w*.76,h*.56);for(let x=w*.18;x<w*.84;x+=38){g.fillStyle='rgba(240,250,247,.22)';g.fillRect(x,h*.19,1,h*.54);}g.restore();}
    function jungleVillage(g,s,w,h){g.save();const bs=buildings(s);for(const b of bs){g.fillStyle='rgba(130,110,67,.17)';g.fillRect(Math.max(3,b.x-42),Math.max(3,b.y-30),84,60);for(let k=0;k<5;k++){const x=b.x-38+k*19;g.fillStyle='rgba(68,91,50,.55)';g.fillRect(Math.round(x),Math.round(b.y-35-(k%2)*4),8,7);}}g.restore();}
    function riverDetail(g,s,w,h){g.save();for(const b of s.map?.bridges||[]){const x=J.World.riverXAt?.(s,b.y)||w*.5;g.fillStyle='rgba(110,86,52,.38)';g.fillRect(x-34,b.y-14,68,3);g.fillRect(x-34,b.y+11,68,3);}g.restore();}
    function apply(s){if(!s?.staticCtx||!s?.map||!s?.scenario)return;const key=`theme-${s.scenario.seed}-${s.viewport.w}-${s.viewport.h}`;if(s._v695ThemeKey===key)return;s._v695ThemeKey=key;const g=s.staticCtx,w=s.viewport.w,h=s.viewport.h,v=variant(s);g.save();if(v==='coast')coast(g,s,w,h);else if(v==='urban')urban(g,s,w,h);else if(v==='desertbase')desertBase(g,s,w,h);else if(v==='frozenbase')frozenBase(g,s,w,h);else if(v==='river')riverDetail(g,s,w,h);else jungleVillage(g,s,w,h);g.restore();}
    J.World.resize=function(s,c){oldResize(s,c);s._v695ThemeKey='';apply(s);};
    J.Render.render=function(s,ctx){apply(s);return oldRender(s,ctx);};
    console.info('JBD v6.9.5 visual variants active');
  };wait();
})();