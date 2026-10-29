import {assetUrl} from './asset-url';
import React,{useEffect,useRef,useState}from'react';
import './cinematic-hero.css';
import InteractiveHeading from './InteractiveHeading';

const chapterCards=[
 {n:'01',id:'ch01',title:'为什么会有人呢？',en:'A DIFFERENT PERSPECTIVE',tag:'从一个问题开始',image:'microscope',tone:'saffron'},
 {n:'02',id:'ch02',title:'复制因子',en:'THE REPLICATORS',tag:'信息如何留下来',image:'tubes',tone:'orange'},
 {n:'03',id:'ch03',title:'不朽的双螺旋',en:'IMMORTAL COILS',tag:'穿过时间的密码',image:'dna',tone:'cream'},
 {n:'04',id:'ch04',title:'基因机器',en:'THE GENE MACHINE',tag:'从信息到生命',image:'cell',tone:'cream'},
 {n:'05',id:'ch05',title:'进犯行为',full:'进犯行为：稳定性和自私的机器',en:'AGGRESSION & STABILITY',tag:'策略之间的博弈',image:'microscope',tone:'honey'},
 {n:'06',id:'ch06',title:'基因种族',en:'GENESMANSHIP',tag:'合作与亲缘关系',image:'dna',tone:'orange'},
];
const duration=12.4,cycleDuration=19,fadeStart=18.4;
const smooth=(start,end,value)=>{const x=Math.min(1,Math.max(0,(value-start)/(end-start)));return x*x*(3-2*x)};

export default function CinematicHero(){
 const reducedInitial=useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [reduced,setReduced]=useState(reducedInitial.current),[paused,setPaused]=useState(false),[visible,setVisible]=useState(false),[pageVisible,setPageVisible]=useState(!document.hidden),[ready,setReady]=useState(reducedInitial.current),[phase,setPhase]=useState(reducedInitial.current?'contents':'intro'),[revision,setRevision]=useState(0);
 const root=useRef(null),time=useRef(reducedInitial.current?duration:0),lastPhase=useRef(phase),loopCount=useRef(0),board=useRef(null),cards=useRef([]);
 function frame(playhead){
   if(!root.current)return;
   const t=Math.min(Math.max(0,playhead-4),8.4),loopFade=reduced?1:smooth(0,.6,playhead)*(1-smooth(fadeStart,cycleDuration,playhead));
   root.current.dataset.playbackCycle=String(loopCount.current);
   const intro=1-smooth(2.4,3.3,t),reveal=smooth(3.9,5.1,t),settle=smooth(5.3,8,t),copy=smooth(6.1,7.6,t);
   const turn=smooth(2.7,4.9,t);
   const vars={'--scene-turn':turn,'--scene-scale':1.07+Math.sin(playhead*.25)*.025,'--scene-x':`${Math.sin(playhead*.45)*1.2}%`,'--scene-y':`${Math.sin(playhead*.6)*.7}%`,'--settle':settle,'--intro-alpha':intro*loopFade,'--intro-y':`${-smooth(2.4,3.4,t)*45}px`,'--dna-alpha':(1-smooth(4.1,5.1,t))*loopFade,'--board-alpha':reveal*loopFade,'--board-x':`${-50+settle*49}%`,'--board-y':`${-50+settle*2}%`,'--board-scale':.62+settle*.28,'--board-rx':`${62-settle*39}deg`,'--board-ry':`${-5-settle*17}deg`,'--board-rz':`${-24+settle*6}deg`,'--board-filter':reveal===1?'none':`blur(${(1-reveal)*12}px)`,'--chapter-alpha':copy*loopFade,'--chapter-y':`${(1-copy)*30}px`,'--light-alpha':.25+settle*.75,'--film-progress':`${Math.min(playhead/cycleDuration,1)*100}%`};
   for(const[key,value]of Object.entries(vars))root.current.style.setProperty(key,value);
   cards.current.forEach((card,i)=>{if(!card)return;const arrive=smooth(4.15+i*.12,5.7+i*.12,t);card.style.setProperty('--card-rise',`${24+(1-arrive)*230}px`);card.style.setProperty('--card-alpha',arrive);card.style.setProperty('--card-tilt',`${(1-arrive)*-20}deg`)});
   const current=t<2.7?'intro':t<7.7?'transition':'contents';if(current!==lastPhase.current){lastPhase.current=current;setPhase(current)}

 }
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');function preference(){setReduced(mq.matches);if(mq.matches){time.current=duration;frame(duration);setReady(true)}}mq.addEventListener('change',preference);frame(time.current);return()=>mq.removeEventListener('change',preference)},[]);
 useEffect(()=>{const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.18});observer.observe(root.current);const visibility=()=>setPageVisible(!document.hidden);document.addEventListener('visibilitychange',visibility);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility)}},[]);
 useEffect(()=>{frame(time.current);if(!ready||!visible||!pageVisible||paused||reduced)return;let id,last=0;function tick(now){if(last){time.current+=Math.min((now-last)/1000,.06);if(time.current>=cycleDuration){time.current%=cycleDuration;loopCount.current++}}last=now;frame(time.current);id=requestAnimationFrame(tick)}id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[ready,visible,pageVisible,paused,reduced,revision]);
 function unfold(){time.current=reduced?duration:Math.max(time.current,6.7);setPaused(false);frame(time.current);setRevision(n=>n+1)}
 function skip(){time.current=duration;frame(duration);setRevision(n=>n+1)}
 return <section id="home" ref={root} className={'cinematic-hero crystal-hero'+(reduced?' is-reduced':'')} data-phase={phase} aria-label="DNA 开场与全书目录预览">
  <div className="cinema-grain" aria-hidden="true"/><div className="cinema-daylight" aria-hidden="true"/><div className="cinema-grid" aria-hidden="true"/>
  <div className="cinema-topline"><span><i/> AN EXPLORATION OF LIFE</span><span>RICHARD DAWKINS / 40TH ANNIVERSARY</span></div>
  <div className="cinema-intro" inert={phase!=='intro'}><div><span className="cinema-eyebrow">THE STORY WRITTEN WITHIN US.</span><InteractiveHeading as="h1" label="The selfish gene." enabled={phase==='intro'} lines={['The selfish',{text:'gene.',fontFamily:'Georgia, serif',fontStyle:'italic',fontWeight:400,color:'#4486d0'}]}/></div><p>生命，以信息的形式延续。<br/><span>一次关于自私、合作与演化的视觉探索。<br/>从一条双螺旋，走进一整本书。</span></p></div>
  <div className="cinema-clear-scene" aria-hidden="true"><img src={assetUrl('biology-blue/clear-molecular-hero.png')} alt="" fetchPriority="high" onLoad={()=>setReady(true)} onError={()=>setReady(true)}/><div className="crystal-glint"/></div>
  <div className="cinema-sequence-labels" aria-hidden="true"><span>01—A</span><span>02—T</span><span>03—C</span><span>04—G</span></div>
  <div className="cinema-entry" inert={phase!=='intro'}><p>换一个尺度，重新看待生命。</p><button onClick={unfold}>跟随 DNA，展开目录 <span>↗</span></button></div>
  <div className="cinema-chapter-copy" inert={phase!=='contents'}><span className="cinema-eyebrow">ONE BOOK. FIFTEEN NEW PERSPECTIVES.</span><InteractiveHeading className="cinema-editorial-title" label="A different view of life." enabled={phase==='contents'} lines={['A different',{text:'view of life.',highlight:'life.',highlightColor:'#4b78ab'}]}/><p>从复制因子的诞生，到合作的演化。<br/>先从六个章节入口，开启你的阅读。</p><a href="#reading/ch01/guide" className="cinema-read">开始第一章 <span>↗</span></a><a href="#reading" className="cinema-all">展开全书 15 章目录 <span>→</span></a></div>
  <div className="cinema-board-space" aria-hidden={phase!=='contents'} inert={phase!=='contents'}><div className="cinema-board" ref={board}><div className="cinema-board-back"/><div className="cinema-board-edge"/><div className="cinema-board-surface">
    <div className="board-top"><span className="board-brand">✳ <b>THE READING ROOM</b></span><span>THE SELFISH GENE</span><i>↗</i></div>
    <div className="board-body"><aside className="board-sidebar"><small>YOUR EXPLORATION</small><a href="#reading/front01/guide"><span>◌</span> 阅读之前</a><a href="#reading" className="selected"><span>▦</span> 全书目录 <i>15</i></a><a href="#concepts"><span>⌘</span> 术语地图</a><a href="#lab"><span>⟡</span> 互动体验</a><div className="board-sidebar-bottom"><span className="board-profile">G</span><b>保持好奇<small>Keep the curiosity alive.</small></b></div></aside>
    <div className="board-main"><div className="board-title"><div><small>CONTENTS / 目录</small><h3>一场生命的探索</h3></div><span>01 — 06 <small>/ 15</small></span></div><div className="board-tabs"><b>跟随原书顺序</b><span>6 个章节入口</span><i>＋</i></div><div className="board-card-grid">{chapterCards.map((card,i)=><a key={card.id} href={`#reading/${card.id}/guide`} className={`board-chapter ${card.tone}`} ref={el=>{cards.current[i]=el}} title={card.full||card.title}><div className="board-chapter-top"><span>CHAPTER {card.n}</span><span>↗</span></div><div className="board-card-copy"><small>{card.en}</small><h4>{card.title}</h4>{card.n==='05'&&<p>稳定性和自私的机器</p>}</div><img src={assetUrl(`biology-blue/${card.image}.png`)} alt="" width="110" height="110" draggable="false"/><div className="board-card-foot"><span>{card.tag}</span><i>↗</i></div></a>)}</div><div className="board-caption"><span><i/> 依照原书目录，循序展开</span><a href="#reading">查看其余章节 →</a></div></div></div>
  </div></div></div>
  <div className="cinema-footer"><span className="cinema-scroll">↓ <span>SCROLL TO EXPLORE</span></span><span className="cinema-phase-label">{phase==='intro'?'01 / THE DOUBLE HELIX':phase==='transition'?'02 / A CHANGE OF PERSPECTIVE':'03 / THE READING ROOM'}</span><div className="cinema-playback"><button onClick={()=>setPaused(p=>!p)} disabled={reduced} aria-label={paused?'播放 DNA 开场动画':'暂停 DNA 开场动画'}>{paused?'▷':'Ⅱ'}<span>{reduced?'静态浏览':paused?'已暂停':'自动循环'}</span></button>{phase!=='contents'&&<button onClick={skip}>跳过动画 ↗</button>}</div></div><div className="cinema-progress" aria-hidden="true"><i/></div>
 </section>
}
