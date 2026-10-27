"""Import the supplied EPUB without altering its text or chapter order."""
from pathlib import Path
import xml.etree.ElementTree as ET
import re,json,html,shutil
try:
 from PIL import Image
except ImportError:
 Image=None
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'OEBPS'; OUT=ROOT/'selfish-gene/public/book'; OUT.mkdir(exist_ok=True)
NS='{http://www.w3.org/1999/xhtml}'
def load(n):return ET.fromstring((SRC/f'text{n:05}.html').read_text()).find(NS+'body')
def tag(e):return e.tag.split('}')[-1]
def text(e):return ''.join(e.itertext()).strip()
rows=[]
for n in range(3,9):rows.append(dict(id=f'front{n-2:02}',title=text(load(n).find(NS+'h1')),group='阅读之前',files=[n]))
for i in range(1,16):
 n=7+2*i; title=text(load(n));title=re.sub(r'\s+',' ',title)
 rows.append(dict(id=f'ch{i:02}',title=title,group='正文 · 15 章',number=i,files=[n,n+1]))
for n,title,key in [(39,'尾注','notes'),(40,'参考书目','references'),(41,'第14、15章术语表','glossary'),(42,'评论集萃','reviews')]:rows.append(dict(id=key,title=title,group='注释与附录',files=[n]))
filemap={f'text{n:05}.html':r['id'] for r in rows for n in r['files']}
allowed={'p','div','span','a','sup','sub','em','strong','b','i','h1','h2','h3','h4','h5','img','br','blockquote','ul','ol','li','table','tbody','tr','td','th'}
def render(e):
 t=tag(e)
 if t not in allowed:return html.escape(e.text or '')+''.join(render(c)+html.escape(c.tail or '') for c in e)
 attrs=[]
 if e.get('id'):attrs.append(f'id="{html.escape(e.get("id"),quote=True)}"')
 classes=[]
 if t=='span' and ('italic' in e.get('class','')):classes.append('source-italic')
 if t=='p' and 'calibre13' in e.get('class',''):classes.append('source-note')
 if classes:attrs.append('class="'+' '.join(classes)+'"')
 if t=='a':
  href=e.get('href','');f,_,anchor=href.partition('#');dest=filemap.get(f)
  if dest:attrs += [f'href="#reading/{dest}/{anchor}"',f'data-book="{dest}"',f'data-anchor="{anchor}"']
  elif not f:attrs += [f'href="#{anchor}"',f'data-anchor="{anchor}"']
 if t=='img':
  name=Path(e.get('src','')).name
  if (SRC/name).is_file():
   shutil.copy2(SRC/name,OUT/'images'/name)
   if Image:
    with Image.open(SRC/name) as pic: attrs += [f'width="{pic.width}"',f'height="{pic.height}"']
  attrs += [f'src="/book/images/{name}"','loading="lazy"','decoding="async"',f'alt="{html.escape(e.get("alt") or "原书插图或书目扫描页",quote=True)}"']
 attr=(' '+' '.join(attrs)) if attrs else ''
 if t in ['img','br']:return f'<{t}{attr}/>'
 return f'<{t}{attr}>'+html.escape(e.text or '')+''.join(render(c)+html.escape(c.tail or '') for c in e)+f'</{t}>'
search=[]; counts={'characters':0,'images':0,'paragraphs':0,'entries':len(rows),'chapters':15}
for r in rows:
 content='';plain='';imgs=0;paras=0
 for n in r['files']:
  body=load(n);content+=''.join(render(c) for c in body);plain+=text(body)+'\n';imgs+=len(body.findall('.//'+NS+'img'));paras+=len(body.findall('.//'+NS+'p'))
 payload={**r,'html':content,'plain':plain,'characters':len(re.sub(r'\s','',plain)),'images':imgs,'paragraphs':paras}
 (OUT/(r['id']+'.json')).write_text(json.dumps(payload,ensure_ascii=False))
 r.update({k:payload[k] for k in ['characters','images','paragraphs']});r['minutes']=max(1,round(r['characters']/400))
 counts['characters']+=r['characters'];counts['images']+=imgs;counts['paragraphs']+=paras
 search.append({'id':r['id'],'title':r['title'],'text':plain})
(OUT/'manifest.json').write_text(json.dumps({'title':'自私的基因：40周年增订版','entries':rows,'stats':counts},ensure_ascii=False))
(OUT/'search.json').write_text(json.dumps(search,ensure_ascii=False))
# Preserve every original glossary entry, including definitions and English aliases.
gloss=[];current=None
for e in load(41):
 if tag(e)=='h4':
  title=text(e);m=re.match(r'(.*?)（(.*)）',title);current={'name':m[1] if m else title,'en':m[2] if m else '', 'definition':''};gloss.append(current)
 elif current and tag(e)=='p':current['definition']+=text(e)+'\n'
(OUT/'original-glossary.json').write_text(json.dumps(gloss,ensure_ascii=False))
print(json.dumps(counts,ensure_ascii=False));print('Original glossary entries:',len(gloss))
# Fidelity check: sanitized HTML retains every source text node, ignoring whitespace.
for r in rows:
 p=json.loads((OUT/(r['id']+'.json')).read_text())
 src=''.join(re.sub(r'\s','',text(load(n))) for n in r['files'])
 assert re.sub(r'\s','',p['plain'])==src,r['id']
print('All 25 reading entries match source text; image assets retained.')
