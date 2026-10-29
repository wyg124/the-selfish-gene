import React,{useMemo,useState,useEffect,useRef} from 'react';
import {assetUrl} from './asset-url';
import {chapterGallery} from './chapter-gallery-data';
import CircularCarousel from './CircularCarousel';
import './chapter-gallery.css';
import './chapter-cylinder.css';
export default function ChapterGallery({onOpen,selectedId}){
 const [index,setIndex]=useState(0),[focusRequest,setFocusRequest]=useState(null),[paused,setPaused]=useState(false),[width,setWidth]=useState(1000),[indexOpen,setIndexOpen]=useState(false);const root=useRef(null);
 const items=useMemo(()=>chapterGallery.map(c=>({src:assetUrl(`chapters/${c.id}.webp`),alt:c.art,title:c.title,subtitle:c.en,theme:c.theme,hint:c.hint,id:c.id})),[]);
 useEffect(()=>{const ob=new ResizeObserver(([e])=>setWidth(e.contentRect.width));ob.observe(root.current);return()=>ob.disconnect()},[]);
 useEffect(()=>{const index=chapterGallery.findIndex(c=>c.id===selectedId);if(index>=0)setFocusRequest({index});},[selectedId]);
 const select=i=>setFocusRequest({index:(i+items.length)%items.length});
 const open=item=>{if(onOpen)onOpen(item.id);else location.hash=`reading/${item.id}/guide`};
 return <div id="chapter-catalog" className="chapter-cylinder" ref={root}><div className="chapter-cylinder-heading"><span>THE CHAPTER ORBIT / 环形阅读目录</span><span>15 CHAPTERS · DRAG TO EXPLORE</span></div><CircularCarousel items={items} preset="cylinder" intro="rise" cardWidth={310} aspectRatio={.68} gap={30} tilt={-5} perspective={2500} autoplay={paused?'off':'drift'} speed={5} captions fadeColor="#eaf3ff" innerShade={.08} depthFade={.48} cornerRadius={20} momentum={.6} focusRequest={focusRequest} onChange={setIndex} onItemClick={open} style={{height:width<600?460:560}}/><div className="chapter-cylinder-controls"><div><button onClick={()=>select(index-1)} aria-label="上一章">←</button><button onClick={()=>setPaused(!paused)} aria-label={paused?'自动旋转章节':'暂停章节旋转'}>{paused?'播放 ▶':'暂停 Ⅱ'}</button><button onClick={()=>select(index+1)} aria-label="下一章">→</button></div><div><button onClick={()=>open(items[index])}>阅读本章 ↗</button><button onClick={()=>setIndexOpen(!indexOpen)} aria-expanded={indexOpen}>全部章节 {indexOpen?'−':'＋'}</button></div></div>{indexOpen&&<div className="chapter-cylinder-index">{items.map((item,i)=><button key={item.id} onClick={()=>{select(i);setPaused(true)}}><small>{String(i+1).padStart(2,'0')}</small>{item.title}<span onClick={e=>{e.stopPropagation();open(item)}}>阅读 ↗</span></button>)}</div>}</div>
}
