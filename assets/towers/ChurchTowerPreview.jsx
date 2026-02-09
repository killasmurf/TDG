import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

// ─── Church Tower Component ───
function ChurchTowerModel({ modelPath, position, scale = 1, animationState = "idle" }) {
  const groupRef = useRef();
  const bellRefs = useRef({});
  const [animTime, setAnimTime] = useState(0);
  
  // Load OBJ model
  const obj = useLoader(OBJLoader, modelPath);
  
  // Clone materials to avoid shared state
  const clonedObj = obj.clone();
  
  // Animation update
  useFrame((state, delta) => {
    if (animationState === "blessing") {
      setAnimTime(t => t + delta * 6);
    } else if (animationState === "idle") {
      setAnimTime(t => t + delta * 2);
    }
    
    // Update bell animations
    if (groupRef.current) {
      const bells = groupRef.current.children.filter(child => 
        child.name && child.name.toLowerCase().includes('bell')
      );
      
      bells.forEach((bell, idx) => {
        if (animationState === "blessing") {
          // Bell ringing animation
          const swing = Math.sin(animTime + idx * 0.5) * 0.4;
          bell.rotation.x = swing;
        } else {
          // Gentle idle sway
          const sway = Math.sin(animTime + idx * 0.3) * 0.05;
          bell.rotation.x = sway;
        }
      });
    }
  });
  
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={clonedObj} />
      
      {/* Divine light effect during blessing */}
      {animationState === "blessing" && (
        <>
          <pointLight 
            position={[0, 8, 0]} 
            intensity={Math.sin(animTime) * 0.5 + 1} 
            color="#ffffcc"
            distance={15}
          />
          <spotLight
            position={[0, 12, 0]}
            target-position={[0, 0, 0]}
            angle={0.6}
            penumbra={0.5}
            intensity={Math.sin(animTime * 0.5) * 0.8 + 0.5}
            color="#fff8dc"
          />
        </>
      )}
    </group>
  );
}

// ─── Scene Setup ───
function ChurchScene({ tier = "T1", animationState = "idle" }) {
  const modelPaths = {
    T1: '/models/church_tower_t1.obj',
    T2: '/models/church_tower_t2.obj',
    T3: '/models/church_tower_t3.obj',
  };
  
  const scales = {
    T1: 0.5,
    T2: 0.45,
    T3: 0.4,
  };
  
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light (sunlight) */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#b8d4ff"
      />
      
      {/* Church Tower */}
      <ChurchTowerModel 
        modelPath={modelPaths[tier]}
        position={[0, 0, 0]}
        scale={scales[tier]}
        animationState={animationState}
      />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#3a4a3a" />
      </mesh>
      
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
      
      {/* Controls */}
      <OrbitControls 
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

// ─── Main Component ───
export default function ChurchTowerPreview() {
  const [tier, setTier] = useState("T1");
  const [animationState, setAnimationState] = useState("idle");
  const [autoRotate, setAutoRotate] = useState(false);
  
  const triggerBlessing = () => {
    setAnimationState("blessing");
    setTimeout(() => setAnimationState("idle"), 3000);
  };
  
  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a2a' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '8px',
        color: '#fff',
        fontFamily: 'monospace',
      }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#e8b059' }}>
          ⛪ Church Tower Preview
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#aaa' }}>
            Tower Tier
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['T1', 'T2', 'T3'].map(t => (
              <button
                key={t}
                onClick={() => setTier(t)}
                style={{
                  padding: '8px 16px',
                  background: tier === t ? '#4a9eff' : '#2a2a3a',
                  color: tier === t ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: tier === t ? 'bold' : 'normal',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={triggerBlessing}
            disabled={animationState === "blessing"}
            style={{
              width: '100%',
              padding: '12px',
              background: animationState === "blessing" ? '#555' : '#6a4a9a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: animationState === "blessing" ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            ✝ Trigger Blessing
          </button>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Auto Rotate
          </label>
        </div>
        
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>TOWER INFO</div>
          <div style={{ fontSize: '12px' }}>
            {tier === 'T1' && '🔔 Chapel - Simple Bell Tower'}
            {tier === 'T2' && '🔔🔔 Parish - Twin Towers'}
            {tier === 'T3' && '🔔🔔🔔 Cathedral - Central Spire'}
          </div>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas shadows>
        <ChurchScene tier={tier} animationState={animationState} />
      </Canvas>
    </div>
  );
}
