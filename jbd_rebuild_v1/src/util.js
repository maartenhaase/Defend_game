(() => {
  const J = window.JBD;
  J.U = {
    clamp: (v,a,b)=>Math.max(a,Math.min(b,v)),
    lerp: (a,b,t)=>a+(b-a)*t,
    dist2: (a,b)=>{const x=a.x-b.x,y=a.y-b.y;return x*x+y*y;},
    len: (x,y)=>Math.hypot(x,y),
    norm(x,y){const l=Math.hypot(x,y)||1; return {x:x/l,y:y/l};},
    angleLerp(a,b,t){ let d=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI; return a+d*t; },
    hash(n){ n=(n^61)^(n>>>16); n=n+ (n<<3); n=n^(n>>>4); n=Math.imul(n,0x27d4eb2d); n=n^(n>>>15); return n>>>0; },
    mulberry32(seed){ return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;} },
    gaussian(rng=Math.random){let u=0,v=0; while(!u)u=rng(); while(!v)v=rng(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);},
    rnd(a,b,r=Math.random){return a+(b-a)*r();}
  };
})();
