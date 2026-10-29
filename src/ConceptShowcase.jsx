import {assetUrl} from './asset-url';
import React, {useEffect, useRef, useState} from 'react';
import './concept-showcase.css';

const scenes = [
  {id:'dna', label:'遗传信息', word:'Life,\nin code.', title:'生命的文字。', subtitle:'DNA / 遗传信息的载体', description:'一条分子链，如何把生命的信息传向下一代？从 DNA 出发，认识基因与染色体。', terms:['DNA','基因','染色体'], chapters:'CH. 03 / 14', color:'#509cf1', light:'#bad8f9', shape:'34% 66% 39% 61% / 40% 35% 65% 60%', alt:'冰蓝透明玻璃的 DNA 双螺旋立体模型'},
  {id:'tubes', label:'复制与变异', word:'Copy.\nVary. Live.', title:'复制，让故事继续。', subtitle:'REPLICATOR / 从复制到演化', description:'复制不是永远一模一样。可遗传的差异，让自然选择有了发生的可能。', terms:['复制因子','突变','自然选择'], chapters:'CH. 02 / 03 / 15', color:'#4793e9', light:'#b6d6f9', shape:'60% 40% 58% 42% / 35% 60% 40% 65%', alt:'装有蓝色液体的两支透明实验试管'},
  {id:'cell', label:'生命的载体', word:'Built\nfor life.', title:'微小，却不简单。', subtitle:'SURVIVAL MACHINE / 身体与基因', description:'从细胞到身体，信息通过复杂过程参与构建生命。走近书中“生存机器”的比喻。', terms:['生存机器','体细胞','神经元'], chapters:'CH. 03 / 04 / 13', color:'#77adea', light:'#cde3fb', shape:'41% 59% 65% 35% / 63% 42% 58% 37%', alt:'半透明细胞膜包裹蓝色细胞核的细胞剖面模型'},
  {id:'microscope', label:'观察与表达', word:'More than\nmeets the eye.', title:'看见，背后的联系。', subtitle:'PHENOTYPE / 基因的可见效应', description:'性状不只关乎外表。基因、发育与环境相互作用，效应甚至可以延伸到身体之外。', terms:['表型','基因型','延伸的表型'], chapters:'CH. 03 / 13 / 14', color:'#699cd5', light:'#c6ddf7', shape:'62% 38% 33% 67% / 48% 62% 38% 52%', alt:'透明玻璃机身与蓝色调焦旋钮的立体显微镜'},
];

function Symbol({name}) {
  const common={viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true};
  if(name==='dna')return <svg {...common}><path d="M7 3c0 7 10 11 10 18M17 3C17 10 7 14 7 21M8 5h8M9 9h6M9 15h6M8 19h8"/></svg>;
  if(name==='tubes')return <svg {...common}><path d="M8 3h8M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8"/></svg>;
  if(name==='cell')return <svg {...common}><path d="M20 10c2 7-3 12-10 10S2 13 4 7 18 2 20 10Z"/><circle cx="12" cy="11" r="3"/><path d="m7 15 2 2m6-1 2-1"/></svg>;
  return <svg {...common}><path d="m9 3 4 2-3 7-4-2zM12 8c8 0 9 10 1 11M4 21h16M8 21v-4M4 15h9"/><circle cx="16" cy="10" r="2"/></svg>;
}

export default function ConceptShowcase({openTerm, total, onOpenDictionary, dictionaryOpen}) {
  const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[visible,setVisible]=useState(false),[pageVisible,setPageVisible]=useState(!document.hidden),[hovering,setHovering]=useState(false),[focused,setFocused]=useState(false);
  const root=useRef(null),gesture=useRef(null);
  const scene=scenes[active];
  useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.2});observer.observe(root.current);const visibility=()=>setPageVisible(!document.hidden);document.addEventListener('visibilitychange',visibility);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility)}},[]);
  const running=!paused&&!reduced&&visible&&pageVisible&&!hovering&&!focused;
  useEffect(()=>{if(!running)return;const timer=setTimeout(()=>setActive(i=>(i+1)%scenes.length),6200);return()=>clearTimeout(timer)},[active,running]);
  const select=(index)=>setActive((index+scenes.length)%scenes.length);
  function swipeEnd(e){const start=gesture.current;gesture.current=null;if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)select(active+(dx<0?1:-1))}
  return <div ref={root} className={'bio-showcase '+(running?'is-running':'is-paused')+(reduced?' reduced-motion':'')} style={{'--scene-color':scene.color,'--scene-light':scene.light,'--scene-shape':scene.shape}} role="region" aria-roledescription="轮播" aria-label="生物术语动画展台" onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}} onKeyDown={e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'){e.preventDefault();select(active+1)}if(e.key==='ArrowLeft'){e.preventDefault();select(active-1)}}}>
    <div className="bio-stage-top"><span><i/> THE LIVING GLOSSARY</span><span>THE SELFISH GENE / VOL. 01</span></div>
    <div className="bio-exhibit" onPointerDown={e=>{gesture.current={x:e.clientX,y:e.clientY}}} onPointerUp={swipeEnd} onPointerCancel={()=>{gesture.current=null}}>
      <div className="bio-shape" aria-hidden="true"/><div className="bio-floor" aria-hidden="true"/>
      <div className="bio-display-word" key={scene.id} aria-hidden="true">{scene.word.split('\n').map(line=><span key={line}>{line}</span>)}</div>
      <div className="bio-object-shadow" aria-hidden="true"/>
      {scenes.map((item,i)=>{const position=(i-active+scenes.length)%scenes.length;return <div key={item.id} className={`bio-object bio-object-${item.id} position-${position}`} aria-hidden={position!==0}><div className="bio-object-float"><img src={assetUrl(`biology-blue/${item.id}.png`)} loading="lazy" alt={position===0?item.alt:''} draggable="false" width="1024" height="1024" decoding="async"/></div></div>})}
      <div className="bio-specimen-caption"><span>SPECIMEN / 0{active+1}</span><span>{scene.label}</span><i>↗</i></div>
    </div>
    <div className="bio-knowledge">
      <div className="bio-knowledge-heading"><span>每一个词，<br/>一个新世界。</span><span className="bio-chapter-count">0{active+1}<small> / 04</small></span></div>
      <div className="bio-copy" key={scene.id} aria-live={running?'off':'polite'} aria-atomic="true"><small>{scene.subtitle}</small><h3>{scene.title}</h3><p>{scene.description}</p></div>
      <div className="bio-term-list" aria-label={`${scene.label}相关术语`}>
        <div className="bio-list-head"><span>EXPLORE THE TERMS</span><span>阅读释义</span></div>
        {scene.terms.map((term,i)=><button key={term} onClick={()=>openTerm(term)}><span className="bio-term-number">0{i+1}</span><b>{term}</b><span className="bio-term-thumb"><img src={assetUrl(`biology-blue/${scene.id}.png`)} loading="lazy" alt="" width="48" height="48"/></span><span className="bio-term-plus">＋</span></button>)}
      </div>
      <div className="bio-source-chapters">FOLLOW THE STORY <span>{scene.chapters}</span></div>
    </div>
    <div className="bio-stage-bottom"><div className="bio-motion-controls"><button onClick={()=>setPaused(p=>!p)} disabled={reduced} aria-label={paused?'播放术语轮播':'暂停术语轮播'} title={reduced?'已遵循系统减少动态效果设置':paused?'播放':'暂停'}>{paused||reduced?<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 9 6-9 6z"/></svg>:<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>}</button><span>{reduced?'静态浏览':paused?'已暂停':'拖动探索'}</span></div>
      <div className="bio-dock" aria-label="切换生物主题"><button className="bio-arrow bio-prev" onClick={()=>select(active-1)} aria-label="上一个生物主题">←</button>{scenes.map((item,i)=><button key={item.id} className={'bio-dock-item '+(i===active?'active':'')} onClick={()=>select(i)} aria-label={`查看${item.label}`} aria-pressed={i===active}><Symbol name={item.id}/><span>{item.label}</span></button>)}<button className="bio-arrow bio-next" onClick={()=>select(active+1)} aria-label="下一个生物主题">↗</button></div>
      <button className="bio-library-link" onClick={onOpenDictionary} aria-expanded={dictionaryOpen} aria-controls="complete-dictionary"><span>{dictionaryOpen?'收起':'全部'} {total} 词条</span><span>{dictionaryOpen?'−':'↗'}</span></button>
    </div>
    <div className="bio-slide-progress" aria-hidden="true">{scenes.map((s,i)=><span key={s.id} className={active===i?'active':''}><i key={active===i?`${active}-${running}`:'idle'} style={{animationPlayState:running?'running':'paused'}}/></span>)}</div>
  </div>
}
