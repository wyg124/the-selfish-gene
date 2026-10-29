import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const ease=(a,b,t)=>{const x=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)};

// Real geometry keeps the two strands, connecting rungs, and highlights rotating together.
export function createHeroDNA(canvas,onContextLost){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
  renderer.setClearColor(0xffffff,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.95;
  const scene=new THREE.Scene();
  // Keep the canvas transparent so the hero typography remains visible behind the glass.
  const camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(0,0,17);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x6d8299,.65));
  const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-4,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0xdcecff,1.6);rim.position.set(6,1,-3);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  // Dielectric glass: zero metalness, nearly full transmission and very little pigment.
  const glass=new THREE.MeshPhysicalMaterial({color:0xeaf4fc,metalness:0,roughness:.025,transparent:true,opacity:.7,transmission:.98,thickness:.38,ior:1.52,attenuationColor:0xcce4fa,attenuationDistance:7,clearcoat:1,clearcoatRoughness:.035,envMapIntensity:1.8});
  const rungGlass=glass.clone();rungGlass.thickness=.16;rungGlass.roughness=.055;
  const points=(phase,t)=>{const x=(t-.5)*20,angle=t*Math.PI*4.6+phase;return new THREE.Vector3(x,Math.cos(angle)*1.12+Math.sin(x*.3)*.14,Math.sin(angle)*1.12)};
  for(let strand=0;strand<2;strand++){
    const path=new THREE.CatmullRomCurve3(Array.from({length:241},(_,i)=>points(strand*Math.PI,i/240)));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(path,320,.155,18,false),glass));
  }
  const count=42,rungGeometry=new THREE.CylinderGeometry(.072,.072,1,14);
  const first=new THREE.InstancedMesh(rungGeometry,rungGlass,count),second=new THREE.InstancedMesh(rungGeometry,rungGlass,count);
  const ends=new THREE.InstancedMesh(new THREE.SphereGeometry(.15,16,12),glass,count);
  const otherEnds=new THREE.InstancedMesh(ends.geometry,glass,count);
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
  function rod(mesh,i,a,b){const direction=new THREE.Vector3().subVectors(b,a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,direction.clone().normalize());dummy.scale.set(1,direction.length(),1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)}
  for(let i=0;i<count;i++){
    const t=(i+.5)/count,a=points(0,t),b=points(Math.PI,t),mid=a.clone().lerp(b,.5);
    rod(first,i,a,mid);rod(second,i,mid,b);
    dummy.quaternion.identity();dummy.scale.setScalar(1);dummy.position.copy(a);dummy.updateMatrix();ends.setMatrixAt(i,dummy.matrix);dummy.position.copy(b);dummy.updateMatrix();otherEnds.setMatrixAt(i,dummy.matrix);
  }
  group.add(first,second,ends,otherEnds);
  const droplets=new THREE.InstancedMesh(new THREE.SphereGeometry(.035,8,8),glass,64);
  for(let i=0;i<64;i++){const t=(i+.35)/64,p=points((i%2)*Math.PI,t);const angle=i*2.39996;dummy.position.copy(p).add(new THREE.Vector3(0,Math.cos(angle)*.15,Math.sin(angle)*.15));dummy.quaternion.identity();dummy.scale.setScalar(.65+(i%4)*.25);dummy.updateMatrix();droplets.setMatrixAt(i,dummy.matrix)}
  group.add(droplets);
  let aspect=1,disposed=false,contextLost=false,lastTime=0;
  function resize(){if(disposed)return;const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;aspect=box.width/box.height;renderer.setSize(box.width,box.height,false);camera.aspect=aspect;camera.updateProjectionMatrix();render(lastTime)}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  function render(time){if(disposed||contextLost)return;lastTime=time;const turn=ease(2.7,4.6,time),exit=ease(3.8,5.1,time);const fit=Math.min(1.2,Math.max(.58,aspect*.62));
    group.rotation.set(time*.28+turn*4.4,turn*.45,-.025-turn*.67);
    group.position.set(-exit*1.3,-.15+exit*8,exit*5.2);
    group.scale.set(fit*(1+turn*.24),1+turn*.24,1+turn*.24);
    renderer.render(scene,camera);
  }
  function lost(e){e.preventDefault();contextLost=true;onContextLost?.()}
  canvas.addEventListener('webglcontextlost',lost);
  return {render,dispose(){disposed=true;observer.disconnect();canvas.removeEventListener('webglcontextlost',lost);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material)});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment.dispose();renderer.dispose()}};
}
