import React,{useLayoutEffect,useRef,useState}from'react';
import TechText from './TechText';
import './interactive-heading.css';

export default function InteractiveHeading({as:Tag='h2',lines,label,className='',enabled=true}){
 const host=useRef(null),[metrics,setMetrics]=useState({size:46,weight:500});
 useLayoutEffect(()=>{const element=host.current;let alive=true;function measure(){if(!alive)return;const style=getComputedStyle(element),size=parseFloat(style.fontSize)||46,weight=parseInt(style.fontWeight)||500;setMetrics(previous=>previous.size===size&&previous.weight===weight?previous:{size,weight})}measure();const observer=new ResizeObserver(measure);observer.observe(element);document.fonts?.ready.then(measure);return()=>{alive=false;observer.disconnect()}},[]);
 const rows=lines.map(line=>typeof line==='string'?{text:line}:line);
 return <Tag ref={host} className={'tech-heading '+className} aria-label={label||rows.map(row=>row.text).join('')}>
  {rows.map((row,i)=>{const start=row.highlight?row.text.indexOf(row.highlight):-1;const ranges=start>=0?[{start,end:start+row.highlight.length,color:row.highlightColor||'#6983a1'}]:[];return <span className={'tech-heading-row '+(row.className||'')} aria-hidden="true" key={i} style={{color:row.color,fontFamily:row.fontFamily,fontStyle:row.fontStyle}}><TechText text={row.text} fontSize={metrics.size} fontWeight={row.fontWeight||metrics.weight} align="left" accentColor="#5488c3" colorRanges={ranges} reach={Math.max(60,metrics.size*2)} softness={.7} strokeWidth={1} specks={8} selection labels draggable bounce={.28} sweep={false} clickKick intro="none" hoverScale={.24} enabled={enabled}/></span>})}
 </Tag>
}
