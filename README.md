# Space Mission Control 🚀

A space-themed task management app specifically designed for people with ADHD. Transform your daily tasks into exciting space missions with an engaging, distraction-minimizing interface.

## Why Space Mission Control? 🧠

Designed with ADHD brains in mind:
- **Visual Engagement**: Space theme turns mundane tasks into exciting missions
- **Reduced Overwhelm**: Clean, focused interface minimizes distractions
- **Dopamine-Friendly**: Satisfying animations and completion effects
- **Flexible Scheduling**: Adapt to your natural energy patterns
- **Clear Progress**: Visual status indicators help maintain motivation

## Features ✨

- **ADHD-Optimized Task Management**
  - Break down tasks into manageable "missions"
  - Visual progress tracking
  - Immediate feedback on completion
  - No complex menus or overwhelming options

- **Focus-Friendly Interface**
  - Dark mode by default (easier on the eyes)
  - Smooth, non-distracting animations
  - Clear, high-contrast text
  - Simple, straightforward controls

- **Flexible Mission Planning**
  - Quick mission creation
  - Adjustable mission durations
  - Recurring mission support
  - Visual time blocks

## Quick Start 🎯

1. **Add a Mission** (Quick and Easy)
   - Click "New Mission"
   - Name it
   - Set time (optional)
   - Done!

2. **Track Progress**
   - See all missions at a glance
   - Clear visual status indicators
   - One-click completion
   - Satisfying completion animation

## Tech Details 🛠

- Built with React
- Styled with Tailwind CSS
- Animations by Framer Motion
- Icons from Heroicons
- Powered by Vite

## Installation 💻

```bash
# Clone it
git clone https://github.com/Hustada/space-scheduler.git

# Install it
npm install

# Run it
npm run dev
```

## Tips for Success 💫

- **Start Small**: Begin with 1-2 missions per day
- **Be Flexible**: Missions can be rescheduled - no pressure!
- **Celebrate Wins**: Each completed mission is a victory
- **Use Recurring Missions**: Great for building routines
- **Adjust Times**: Schedule around your peak focus hours

## Contributing 🤝

Have ideas to make this even better for ADHD users? We'd love your input!

1. Fork it
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## Black Hole Visualization: A Deep Dive into Physics and Implementation 🌌

Our application features a physically-inspired visualization of a supermassive black hole, drawing from real astrophysical phenomena and implementing them through advanced graphics programming.

### The Physics Behind Our Black Hole

#### Event Horizon
The event horizon, represented as a perfect black sphere, marks the boundary where the black hole's gravitational pull becomes so intense that nothing, not even light, can escape. This creates what physicists call a "one-way membrane" in spacetime. In our visualization, we achieve this using:
- Perfect light absorption through specialized material properties
- Multiple rendering layers to ensure true black appearance
- Subtle pulsation effects to represent quantum fluctuations at the horizon

#### Accretion Disk
The most visually striking feature is the accretion disk - a ring of super-heated plasma and matter spiraling into the black hole. In real black holes, this matter:
- Heats up to millions of degrees due to friction and compression
- Emits intense radiation across the electromagnetic spectrum
- Creates distinctive orange-red plasma patterns due to extreme temperatures
- Exhibits varying brightness due to relativistic beaming

Our implementation simulates these effects through:
- Custom GLSL shaders mimicking plasma behavior
- Dynamic turbulence patterns in the disk material
- Doppler shifting effects (blue/redshift) as matter orbits
- Realistic light emission and scattering calculations

#### Gravitational Effects
We incorporate several relativistic effects observed around real black holes:
- Frame dragging (Lense-Thirring effect) shown in particle motion
- Gravitational lensing near the event horizon
- Relativistic time dilation represented in particle behavior
- Kerr metric influences on matter distribution

### Technical Implementation Details

#### Core Technologies
- **Three.js & React Three Fiber**: Provides the 3D rendering foundation
- **Custom GLSL Shaders**: Powers the accretion disk's realistic plasma effects
- **Particle Systems**: Simulates matter falling into the black hole
- **WebGL**: Enables hardware-accelerated graphics processing

#### Shader Implementation
Our custom GLSL shader incorporates:
```glsl
// Relativistic effects
float shift = sin(angle - time * 2.0) * 0.5 + 0.5;
// Plasma turbulence
float plasma = sin(dist * 8.0 - time * 4.0) * 0.5 + 0.5;
// Dynamic color mixing for temperature visualization
vec3 finalColor = mix(
  vec3(1.0, 0.3, 0.0), // Cooler regions
  vec3(1.0, 0.8, 0.2), // Hottest regions
  plasma
);
```

#### Performance Optimizations
- Efficient particle system management
- Strategic use of geometry instancing
- Careful shader complexity balance
- Optimized render loop with RAF

### Scientific Accuracy vs. Artistic License
While our visualization is inspired by real black hole physics, we've made some artistic choices to enhance visual impact:
- Accretion disk brightness enhanced for dramatic effect
- Simplified gravitational lensing calculations
- Exaggerated color spectrum for visual clarity
- Modified time scales for real-time interaction

### Future Enhancements
We plan to add more physically accurate features:
- Photon sphere visualization
- Enhanced gravitational lensing effects
- More accurate relativistic jet simulation
- Improved event horizon rendering

## License 📝

MIT License - See [LICENSE](LICENSE) file

## Acknowledgments 🙏

- Inspired by ADHD-friendly design principles
- Built with focus and accessibility in mind
- Feedback from the ADHD community
- Space theme inspired by NASA mission control
