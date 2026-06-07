'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WebGLBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Cleanup variables
    let animationId: number;
    
    const container = mountRef.current;
    const scene = new THREE.Scene();
    
    // Get primary color from CSS variable or default to Cobalt
    let primaryColorStr = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#2B3BE5';
    
    scene.background = new THREE.Color('#0A0A0A');
    scene.fog = new THREE.FogExp2('#0A0A0A', 0.0015);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1200;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particle System (Gaussian Splat Placeholder Logic)
    const PARTICLE_COUNT = 150000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const randomOffsets = new Float32Array(PARTICLE_COUNT * 3);

    const eyeRadius = 400;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 8000;
      positions[i3 + 1] = (Math.random() - 0.5) * 8000;
      positions[i3 + 2] = (Math.random() - 0.5) * 8000;

      randomOffsets[i3] = Math.random();
      randomOffsets[i3 + 1] = Math.random();
      randomOffsets[i3 + 2] = Math.random();

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      let r = eyeRadius;
      if (Math.random() > 0.8) r = eyeRadius * (Math.random() * 0.3 + 0.1);

      targetPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      targetPositions[i3 + 1] = (r * Math.sin(phi) * Math.sin(theta)) * 0.5;
      targetPositions[i3 + 2] = r * Math.cos(phi);
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('aTarget', new THREE.BufferAttribute(targetPositions, 3));
    particles.setAttribute('aRandom', new THREE.BufferAttribute(randomOffsets, 3));

    const vertexShader = `
      uniform float uTime;
      uniform vec3 uMouse;
      attribute vec3 aTarget;
      attribute vec3 aRandom;
      varying vec3 vPos;
      varying float vDepth;
      mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
      void main() {
        vec3 pos = position;
        vec3 target = aTarget;
        
        float noiseX = sin(uTime * 0.5 + aRandom.x * 10.0) * 300.0;
        float noiseY = cos(uTime * 0.4 + aRandom.y * 10.0) * 300.0;
        float noiseZ = sin(uTime * 0.6 + aRandom.z * 10.0) * 300.0;
        
        target += vec3(noiseX, noiseY, noiseZ) * 0.1; // Gentle breathing
        
        vec3 dirToMouse = target - uMouse;
        float distToMouse = length(dirToMouse);
        float repulsion = smoothstep(300.0, 0.0, distToMouse) * 150.0;
        target += normalize(dirToMouse) * repulsion;
        
        // Assemble directly to target for placeholder
        vec3 finalPos = mix(pos, target, min(uTime * 0.5, 1.0)); 
        
        finalPos.xz *= rot(uTime * 0.1);
        finalPos.xy *= rot(sin(uTime * 0.05) * 0.2);

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = (1000.0 / -mvPosition.z) * (aRandom.x * 2.0 + 0.5);
        vPos = finalPos; vDepth = -mvPosition.z;
      }
    `;

    const fragmentShader = `
      uniform vec3 uColor;
      varying vec3 vPos;
      varying float vDepth;
      void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
        if (r > 1.0) discard;
        
        vec3 color = uColor;
        float intensity = 1.0 - smoothstep(1.0, 1500.0, vDepth);
        color += vec3(0.5) * intensity;
        
        float alpha = smoothstep(1.0, 0.5, r) * 0.6;
        gl_FragColor = vec4(color, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { 
        uTime: { value: 0 }, 
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uColor: { value: new THREE.Color(primaryColorStr) }
      }
    });

    const particleSystem = new THREE.Points(particles, material);
    scene.add(particleSystem);

    const mouse = new THREE.Vector2();
    const targetMouse3D = new THREE.Vector3(0,0,0);
    const currentMouse3D = new THREE.Vector3(0,0,0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, targetMouse3D);
    };
    window.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();
    
    // Dynamic color update check
    setInterval(() => {
      const newColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      if (newColor && newColor !== primaryColorStr) {
        primaryColorStr = newColor;
        material.uniforms.uColor.value.set(newColor);
      }
    }, 1000);

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();
      
      currentMouse3D.lerp(targetMouse3D, 5.0 * delta);
      material.uniforms.uTime.value = time;
      material.uniforms.uMouse.value.copy(currentMouse3D);
      
      camera.position.z = 1200 + Math.sin(time * 0.5) * 50;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      particles.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none" />;
}
