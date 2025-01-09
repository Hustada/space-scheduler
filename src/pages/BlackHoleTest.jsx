import React from 'react';
import { Canvas } from '@react-three/fiber';
import BlackHoleThree from '../components/BlackHoleThree';
import { Link } from 'react-router-dom';

const BlackHoleTest = () => {
  return (
    <div className="relative w-screen h-screen">
      {/* Navigation */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          to="/"
          className="px-4 py-2 rounded-md bg-space-primary/20 text-space-primary border border-space-primary/30 hover:bg-space-primary/30"
        >
          Back to App
        </Link>
      </div>

      {/* Black Hole Canvas */}
      <Canvas
        camera={{
          position: [8, 12, 15], // Angled view to better show the accretion disk
          fov: 45
        }}
        style={{
          background: '#000'
        }}
      >
        <BlackHoleThree />
      </Canvas>
    </div>
  );
};

export default BlackHoleTest;
