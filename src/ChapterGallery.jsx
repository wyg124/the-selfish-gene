import {assetUrl} from './asset-url';
import React,{useCallback,useEffect,useRef,useState}from'react';
import{chapterGallery}from'./chapter-gallery-data';
import './chapter-gallery.css';

const wrap=i=>(i+chapterGallery.length)%chapterGallery.length;
const offsetOf=(index,active)=>{let n=index-active;const half=chapterGallery.length/2;if(n>half)n-=chapterGallery.length;if(n< -half)n+=chapterGallery.length;return n};

export default function ChapterGallery({selectedId,onOpen,done=[]}){
 const initial=Math.max(0,chapterGallery.findIndex(c=>c.id===selectedId));
 const[index,setIndex]=useState(initial),[dragging,setDragging]=useState(false),[indexOpen,setIndexOpen]=useState(false);
 const viewport=useRef(null),root=useRef(null),gesture=useRef(null),suppressClick=useRef(false),wheel=useRef({value:0,time:0,lock:0}),activeIndex=useRef(index);
 activeIndex.current=index;
 const current=chapterGallery[index];
 const select=useCallback(value=>setIndex(wrap(value)),[]);
 useEffect(()=>{const n=chapterGallery.findIndex(c=>c.id===selectedId);if(n>=0)setIndex(n)},[selectedId]);
 useEffect(()=>{const element=viewport.current;function onWheel(e){if(Math.abs(e.deltaX)<5||Math.abs(e.deltaX)<Math.abs(e.deltaY)*1.25)return;e.preventDefault();const now=Date.now();if(now<wheel.current.lock)return;if(now-wheel.current.time>200)wheel.current.value=0;wheel.current.value+=e.deltaX;wheel.current.time=now;if(Math.abs(wheel.current.value)>48){select(activeIndex.current+(wheel.current.value>0?1:-1));wheel.current.value=0;wheel.current.lock=now+430}}element.addEventListener('wheel',onWheel,{passive:false});return()=>element.removeEventListener('wheel',onWheel)},[select]);
 function open(id){if(suppressClick.current)return;if(onOpen)onOpen(id);else location.hash=`reading/${id}/guide`}
 function resetDrag(){gesture.current=null;setDragging(false);root.current?.style.setProperty('--gallery-drag','0px')}
 function pointerDown(e){if(e.button!==0||e.target.closest('.chapter-gallery-controls'))return;gesture.current={x:e.clientX,y:e.clientY,time:performance.now(),moved:false,pointer:e.pointerId}}
 function pointerMove(e){const g=gesture.current;if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(!g.moved&&Math.abs(dy)>Math.abs(dx)+8){resetDrag();return}if(!g.moved&&Math.abs(dx)>9){g.moved=true;setDragging(true);e.currentTarget.setPointerCapture(e.pointerId)}if(g.moved){e.preventDefault();root.current.style.setProperty('--gallery-drag',`${Math.max(-260,Math.min(260,dx))}px`)}}
 function pointerUp(e){const g=gesture.current;if(!g)return;const dx=e.clientX-g.x;if(g.moved){suppressClick.current=true;const velocity=Math.abs(dx)/Math.max(1,performance.now()-g.time);if(Math.abs(dx)>52||velocity>.5){const width=viewport.current.querySelector('.chapter-portal.is-current')?.offsetWidth||320;const steps=Math.min(3,Math.max(1,Math.round(Math.abs(dx)/(width*.8))));select(activeIndex.current+(dx<0?steps:-steps))}setTimeout(()=>{suppressClick.current=false},100)}resetDrag()}
 function keyboard(e){if(e.target.closest('.chapter-index-drawer'))return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();select(e.key==='Home'?0:e.key==='End'?chapterGallery.length-1:index+(e.key==='ArrowRight'?1:-1))}}
 return <div id="chapter-catalog" ref={root} className={`chapter-gallery is-library ${dragging?'is-dragging':''}`} role="region" aria-roledescription="轮播" aria-label="15章透视卡片目录" onKeyDown={keyboard}>
  {<div className="chapter-gallery-heading"><span>CHOOSE A CHAPTER / 滑动，选择一个问题</span><span>15 CHAPTERS · 15 PERSPECTIVES</span></div>}
  <div ref={viewport} className="chapter-gallery-viewport" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={resetDrag} onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation()}}}>
   <div className="chapter-gallery-halo" aria-hidden="true"/>
   {chapterGallery.map((chapter,i)=>{const offset=offsetOf(i,index),distance=Math.abs(offset);if(distance>3)return null;return <button key={chapter.id} type="button" className={`chapter-portal ${offset===0?'is-current':''} ${distance>1?'is-distant':''}`} style={{'--card-offset':offset,'--card-angle':`${offset===0?0:offset<0?30:-30}deg`,'--card-depth':`${distance===0?20:-distance*36}px`,'--card-scale':distance===0?1:distance===1?1.08:.98,'--card-alpha':distance<=1?1:distance===2?.5:.12,zIndex:10-distance}} onClick={()=>open(chapter.id)} aria-label={`阅读第${chapter.number}章：${chapter.title}`} aria-current={offset===0?'true':undefined} tabIndex={offset===0?0:-1} aria-hidden={distance>1}>
    <div className="chapter-portal-shine" aria-hidden="true"/><div className="chapter-portal-meta"><span>CHAPTER {String(chapter.number).padStart(2,'0')}</span><span>{done.includes(chapter.id)?'✓ 已读':chapter.theme}</span></div>
    <div className="chapter-portal-center"><div className="chapter-portal-art"><img src={assetUrl(`chapters/${chapter.id}.webp`)} alt={chapter.art} width="360" height="360" loading={distance===0?'eager':'lazy'} decoding="async" draggable="false"/></div><h3>{chapter.title}</h3><p className="chapter-portal-english" lang="en">{chapter.en}</p><p className="chapter-portal-hint">{chapter.hint}</p></div>
    <div className="chapter-portal-foot"><span>导读 <i>·</i> 全文 <i>·</i> 自测</span><span className="chapter-portal-enter">进入本章 ↗</span></div>
   </button>})}
  </div>
  <div className="chapter-gallery-controls"><div className="chapter-gallery-pagination"><button onClick={()=>select(index-1)} aria-label="上一章卡片">←</button><span aria-live="polite" aria-atomic="true"><b>{String(current.number).padStart(2,'0')}</b><i>/ 15</i></span><button onClick={()=>select(index+1)} aria-label="下一章卡片">→</button></div><div className="chapter-gallery-dots" aria-label="直接选择章节">{chapterGallery.map((chapter,i)=><button key={chapter.id} className={i===index?'selected':''} onClick={()=>select(i)} aria-label={`选择第${chapter.number}章卡片`} aria-pressed={i===index}/>)}</div><div className="chapter-gallery-actions"><button className="chapter-gallery-read" onClick={()=>open(current.id)}>阅读本章 <span>↗</span></button><button className="chapter-gallery-index" onClick={()=>setIndexOpen(o=>!o)} aria-expanded={indexOpen} aria-controls="reader-chapter-index">{indexOpen?'收起':'全部'}章节 <span>{indexOpen?'−':'☷'}</span></button></div></div>
  {indexOpen&&<div id="reader-chapter-index" className="chapter-index-drawer"><div className="chapter-index-title"><span>THE COMPLETE CONTENTS / 全部章节</span><button onClick={()=>setIndexOpen(false)} aria-label="关闭章节索引">×</button></div><div className="chapter-index-list">{chapterGallery.map((chapter,i)=><button key={chapter.id} className={i===index?'selected':''} onClick={()=>{select(i);setIndexOpen(false);open(chapter.id)}}><span>{String(chapter.number).padStart(2,'0')}</span><b>{chapter.title}</b><small lang="en">{chapter.en}</small><i>↗</i></button>)}</div></div>}
 </div>
}
