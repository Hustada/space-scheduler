import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom shader for the accretion disk
const diskVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // Add more pronounced wavey motion
    vec3 pos = position;
    float angle = atan(position.y, position.x);
    float dist = length(position.xy);
    float offset = sin(angle * 6.0 + time * 3.0) * 0.05;
    offset += cos(angle * 4.0 - time * 2.0) * 0.03;
    pos.z += offset * smoothstep(1.2, 3.0, dist);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const diskFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  uniform vec3 color;
  
  float noise(vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  void main() {
    float dist = length(vPosition.xy);
    float angle = atan(vPosition.y, vPosition.x);
    
    // More intense plasma effect
    float plasma = sin(dist * 8.0 - time * 4.0) * 0.5 + 0.5;
    plasma += sin(angle * 6.0 + time * 5.0) * 0.5 + 0.5;
    plasma *= smoothstep(2.5, 1.201, dist); // Tight fade from edge to center
    plasma = pow(plasma, 0.7); // Make the plasma effect more intense
    
    // Enhanced turbulence with brighter spots
    vec2 noiseCoord = vec2(angle * 3.0 + time * 0.8, dist * 5.0 - time * 1.2);
    float turbulence = noise(noiseCoord) * 0.7;
    plasma = mix(plasma, plasma * (1.0 + turbulence), 0.5);
    
    // Much brighter, intense colors
    vec3 finalColor = mix(
      vec3(1.0, 0.5, 0.0) * 1.8, // Brighter orange base
      vec3(1.0, 0.9, 0.3) * 2.0, // Intense yellow hot spots
      plasma
    );
    
    // Enhanced blue/redshift effect with more intensity
    float shift = sin(angle - time * 2.0) * 0.5 + 0.5;
    finalColor = mix(
      vec3(1.0, 0.6, 0.1) * 1.8, // Brighter orange shift
      vec3(1.0, 0.3, 0.0) * 2.0, // Intense red shift
      shift
    ) * plasma;
    
    // Add extra brightness near the black hole
    float edgeGlow = smoothstep(1.205, 1.201, dist) * 1.5;
    finalColor *= 1.0 + edgeGlow;
    
    // Extremely sharp inner fade
    float innerFade = smoothstep(1.201, 1.202, dist);
    float opacity = plasma * innerFade;
    
    // Brighter pulsing glow
    opacity *= 0.9 + sin(time * 3.0) * 0.3;
    
    gl_FragColor = vec4(finalColor, opacity);
  }
`;

const BlackHoleThree = () => {
  const accretionDiskRef = useRef();
  const photonSphereRef = useRef();
  const eventHorizonRef = useRef();
  const particlesRef = useRef();
  const backgroundStarsRef = useRef();

  // Create background star field (static, far away)
  const backgroundStarPositions = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < positions.length; i += 3) {
      const r = 25 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  // Create particle system for gravitational lensing
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < positions.length; i += 3) {
      const r = 10 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  // Create shader material with useMemo
  const diskMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: diskVertexShader,
      fragmentShader: diskFragmentShader,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(1.8, 0.8, 0.2) }
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Update accretion disk shader
    diskMaterial.uniforms.time.value = time;
    diskMaterial.uniformsNeedUpdate = true;

    // Rotate photon sphere
    if (photonSphereRef.current) {
      photonSphereRef.current.rotation.z -= delta * 0.6;
    }

    // Pulsate event horizon
    if (eventHorizonRef.current) {
      const scale = 1 + Math.sin(time * 3) * 0.02;
      eventHorizonRef.current.scale.set(scale, scale, scale);
    }

    // Rotate background stars
    if (backgroundStarsRef.current) {
      backgroundStarsRef.current.rotation.y += delta * 0.02;
    }

    // Update particle positions
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1;
      const positions = particlesRef.current.geometry.attributes.position.array;
      let needsUpdate = false;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        const dist = Math.sqrt(x * x + y * y + z * z);

        if (dist < 2) {
          // Reset particles that get too close
          const r = 10 + Math.random() * 5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          positions[i] = r * Math.sin(phi) * Math.cos(theta);
          positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
          positions[i + 2] = r * Math.cos(phi);
          needsUpdate = true;
        } else {
          // Move particles towards the black hole
          const factor = delta * (3 / dist);
          positions[i] -= x * factor;
          positions[i + 1] -= y * factor;
          positions[i + 2] -= z * factor;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Static background stars */}
      <points ref={backgroundStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={backgroundStarPositions.length / 3}
            array={backgroundStarPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color={new THREE.Color(1.0, 1.0, 1.0)}
          transparent={true}
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Pure black void */}
      <mesh ref={eventHorizonRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshBasicMaterial 
          color="#000000"
          transparent={false}
          opacity={1}
          side={THREE.FrontSide}
          depthWrite={true}
          depthTest={true}
        />
      </mesh>

      {/* Additional black layer */}
      <mesh>
        <sphereGeometry args={[1.205, 64, 64]} />
        <meshBasicMaterial 
          color="#000000"
          transparent={false}
          opacity={1}
          side={THREE.DoubleSide}
          depthWrite={true}
        />
      </mesh>

      {/* Accretion Disk */}
      <mesh ref={accretionDiskRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.201, 2.5, 180, 8]} />
        <primitive object={diskMaterial} attach="material" />
      </mesh>

      {/* Brighter outer glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.201, 3, 180, 2]} />
        <meshBasicMaterial
          color={new THREE.Color(1.8, 0.4, 0.05)}
          transparent={true}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Gravitational lensing particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={new THREE.Color(1.8, 0.8, 0.2)}
          transparent={true}
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default BlackHoleThree;
