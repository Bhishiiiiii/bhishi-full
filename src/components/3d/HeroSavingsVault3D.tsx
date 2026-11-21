import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroSavingsVault3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

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

    // Group for entire 3D object
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Metallic Vault Core (Icosahedron with wireframe overlay)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x123C32,
      roughness: 0.25,
      metalness: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Golden inner lattice wireframe
    const wireGeo = new THREE.IcosahedronGeometry(1.22, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xD4AF37,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    mainGroup.add(wireMesh);

    // 2. Torus Rings (Community Circle Ring)
    const torusGeo = new THREE.TorusGeometry(2.3, 0.04, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37, // Gold
      metalness: 0.9,
      roughness: 0.2,
    });
    const torusMesh1 = new THREE.Mesh(torusGeo, torusMat);
    torusMesh1.rotation.x = Math.PI / 2.4;
    mainGroup.add(torusMesh1);

    const torusGeo2 = new THREE.TorusGeometry(2.6, 0.025, 16, 100);
    const torusMat2 = new THREE.MeshStandardMaterial({
      color: 0xE9DFCF, // Warm ivory
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.75,
    });
    const torusMesh2 = new THREE.Mesh(torusGeo2, torusMat2);
    torusMesh2.rotation.x = -Math.PI / 3;
    torusMesh2.rotation.y = Math.PI / 6;
    mainGroup.add(torusMesh2);

    // 3. Orbiting Member Nodes (Coins/Orbs)
    const nodeCount = 10;
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeRadius = 2.3;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const x = Math.cos(angle) * nodeRadius;
      const z = Math.sin(angle) * nodeRadius;

      // Small sphere coin node
      const nodeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 32);
      // Give one node a special crimson accent (representing current payout milestone!)
      const isPayoutNode = i === 3;
      const isOrganizerNode = i === 0;

      const nodeMat = new THREE.MeshStandardMaterial({
        color: isPayoutNode ? 0xA3313D : isOrganizerNode ? 0xD4AF37 : 0x267360,
        metalness: 0.8,
        roughness: 0.2,
      });

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, 0, z);
      nodeMesh.rotation.x = Math.PI / 2;
      torusMesh1.add(nodeMesh);
      nodeMeshes.push(nodeMesh);

      // Connective line to core
      const linePoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, 0, z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: isPayoutNode ? 0xA3313D : 0xD4AF37,
        transparent: true,
        opacity: isPayoutNode ? 0.6 : 0.2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      torusMesh1.add(line);
    }

    // 4. Floating Particles (Community Micro-contributions)
    const particlesCount = 80;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xFFF9E6, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xFFFFFF, 2.0);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xA3313D, 1.5);
    dirLight2.position.set(-5, -5, -4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xD4AF37, 2, 8);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((event.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow smooth rotation
      coreMesh.rotation.y = elapsedTime * 0.25;
      coreMesh.rotation.x = elapsedTime * 0.15;
      wireMesh.rotation.y = -elapsedTime * 0.2;
      wireMesh.rotation.x = -elapsedTime * 0.1;

      torusMesh1.rotation.z = elapsedTime * 0.15;
      torusMesh2.rotation.z = -elapsedTime * 0.12;
      torusMesh2.rotation.y = Math.sin(elapsedTime * 0.3) * 0.2 + Math.PI / 6;

      particles.rotation.y = elapsedTime * 0.05;

      // Mouse Parallax easing
      targetX += (mouseX * 0.4 - targetX) * 0.05;
      targetY += (mouseY * 0.4 - targetY) * 0.05;
      mainGroup.rotation.y = targetX;
      mainGroup.rotation.x = -targetY;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[450px] md:h-[540px] flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Subtle overlay badge inside 3D frame */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs pointer-events-none text-bone-700/80 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Decentralized Trust Pool
        </span>
        <span>SHA-256 Merkle Consensus</span>
      </div>
    </div>
  );
};
