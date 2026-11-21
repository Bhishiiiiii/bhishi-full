import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BishiGroup, Member } from '../../types';
import { formatINR } from '../../utils/cryptoSim';

interface CommunityCircle3DProps {
  bishi: BishiGroup;
  members: Member[];
  onSelectMember?: (member: Member) => void;
}

export const CommunityCircle3D: React.FC<CommunityCircle3DProps> = ({ bishi, members, onSelectMember }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    member: Member;
    x: number;
    y: number;
    isRecipient: boolean;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 6);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Pool Hub
    const centerGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.25, 32);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x123C32,
      metalness: 0.8,
      roughness: 0.2,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    group.add(centerMesh);

    // Golden rim for center
    const rimGeo = new THREE.TorusGeometry(0.88, 0.04, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.9, roughness: 0.1 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.12;
    group.add(rimMesh);

    // 2. Outer Circle Ring
    const orbitRadius = 2.4;
    const orbitRingGeo = new THREE.TorusGeometry(orbitRadius, 0.02, 16, 100);
    const orbitRingMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37, transparent: true, opacity: 0.4 });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x = Math.PI / 2;
    group.add(orbitRing);

    // 3. Member Nodes
    const count = members.length || 8;
    const raycastMeshes: { mesh: THREE.Mesh; member: Member; isRecipient: boolean }[] = [];

    members.forEach((m, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;

      const isRecipient = m.name === bishi.nextPayoutRecipient || m.assignedPayoutMonth === bishi.currentMonth;
      const isOrganizer = m.role === 'Organizer';

      // Node geometry
      const nodeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: isRecipient ? 0xA3313D : isOrganizer ? 0xD4AF37 : 0x267360,
        metalness: 0.7,
        roughness: 0.2,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, 0, z);
      nodeMesh.userData = { member: m, isRecipient };
      group.add(nodeMesh);

      // Connecting energy beam to center pool
      const points = [new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(x, 0.05, z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: isRecipient ? 0xA3313D : 0xD4AF37,
        transparent: true,
        opacity: isRecipient ? 0.8 : 0.25,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);

      raycastMeshes.push({ mesh: nodeMesh, member: m, isRecipient });
    });

    // Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xfff6dc, 2.2);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    const redGlow = new THREE.PointLight(0xA3313D, 2.5, 5);
    redGlow.position.set(0, 1, 0);
    scene.add(redGlow);

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastMeshes.map(r => r.mesh));

      if (intersects.length > 0) {
        const found = raycastMeshes.find(r => r.mesh === intersects[0].object);
        if (found) {
          setActiveTooltip({
            member: found.member,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            isRecipient: found.isRecipient
          });
          container.style.cursor = 'pointer';
        }
      } else {
        setActiveTooltip(null);
        container.style.cursor = 'default';
      }
    };

    const onClick = () => {
      if (activeTooltip && onSelectMember) {
        onSelectMember(activeTooltip.member);
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth slow revolution
      group.rotation.y = t * 0.12;

      // Pulse next recipient node
      raycastMeshes.forEach(({ mesh, isRecipient }, idx) => {
        if (isRecipient) {
          const s = 1 + Math.sin(t * 4) * 0.15;
          mesh.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [bishi, members]);

  return (
    <div className="relative w-full h-[320px] md:h-[380px] bg-bottle-900/40 rounded-2xl border border-bone-500/10 overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Legend & Pool Badge */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none text-xs">
        <div className="bg-bottle-950/80 px-3 py-1.5 rounded-lg border border-bone-500/20 text-bone-300 backdrop-blur-sm">
          <div className="font-semibold text-bone-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-crimson-600 animate-ping"></span>
            Monthly Pool: {formatINR(bishi.totalPoolPerMonth)}
          </div>
          <div className="text-[10px] text-bone-600 mt-0.5">Cycle {bishi.currentMonth}/{bishi.durationMonths} • Non-auction fixed order</div>
        </div>
      </div>

      <div className="absolute bottom-3 right-4 flex items-center gap-4 text-[11px] text-bone-500/80 pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-400"></span> Organizer
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-bottle-400"></span> Member
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-crimson-600 animate-pulse"></span> Next Payout
        </span>
      </div>

      {/* Interactive Tooltip */}
      {activeTooltip && (
        <div 
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-bottle-950 text-bone-200 p-3 rounded-xl shadow-elevated border border-bone-500/20 min-w-[200px] text-xs backdrop-blur-md"
          style={{ left: activeTooltip.x, top: activeTooltip.y }}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-bone-500/15 mb-1.5">
            <span className="font-semibold text-bone-100">{activeTooltip.member.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              activeTooltip.isRecipient 
                ? 'bg-crimson-900/60 text-crimson-200 border border-crimson-500/40' 
                : 'bg-bottle-800 text-bone-300'
            }`}>
              {activeTooltip.isRecipient ? 'Payout Recipient' : activeTooltip.member.role}
            </span>
          </div>
          <div className="space-y-1 text-bone-400">
            <div className="flex justify-between">
              <span>Compliance:</span>
              <span className="text-emerald-400 font-medium">{activeTooltip.member.complianceScore}%</span>
            </div>
            <div className="flex justify-between">
              <span>Payout Turn:</span>
              <span className="text-bone-200">Month #{activeTooltip.member.assignedPayoutMonth || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Contributed:</span>
              <span className="text-bone-200">{formatINR(activeTooltip.member.totalContributed)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
