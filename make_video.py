import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio_ffmpeg
from pathlib import Path
out=Path(__file__).parent/'public'
w,h=960,540
y,x=np.mgrid[0:h,0:w]
g=np.exp(-((x-675)**2+(y-270)**2)/85000)
a=np.zeros((h,w,3),dtype=np.uint8)
for k,(base,add) in enumerate([(239,12),(235,-3),(221,-38)]): a[:,:,k]=np.clip(base+g*add,0,255)
base=Image.fromarray(a)
writer=imageio_ffmpeg.write_frames(str(out/'gene-loop.mp4'),(w,h),fps=24,codec='libx264',quality=8,macro_block_size=2,output_params=['-movflags','+faststart','-pix_fmt','yuv420p'])
writer.send(None)
for frame in range(144):
 im=base.copy(); d=ImageDraw.Draw(im)
 phase=frame/144*math.tau
 for j in range(48):
  yy=20+j*11; wave=j*.21+phase
  center=650+(yy-270)*.38
  xx=math.sin(wave)*90
  p=(center+xx,yy);q=(center-xx,yy)
  d.line([p,q],fill=(213,191,147),width=4)
  for point,col,z in [(p,(236,146,57),math.cos(wave)),(q,(218,207,171),-math.cos(wave))]:
   r=7+z*2; px,py=point
   d.ellipse((px-r,py-r,px+r,py+r),fill=col)
   d.ellipse((px-r*.6,py-r*.7,px,py-r*.15),fill=(255,229,179))
 writer.send(np.array(im).tobytes())
writer.close()
base.save(out/'gene-poster.jpg',quality=90)
