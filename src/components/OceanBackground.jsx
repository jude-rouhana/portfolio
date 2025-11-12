import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const OceanBackground = () => {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const animationIdRef = useRef(null)
  const [isShipLoaded, setIsShipLoaded] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x4a90e2, 1, 80)

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    // Position the camera in 3D space:
    camera.position.set(20, 18, 85)
    // Make camera look more horizontally to see more sky
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x4a90e2, 0.3)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    // Add OrbitControls for interactive ship viewing
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = false // Start disabled, enable on ship click
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 5
    controls.maxDistance = 50
    controls.maxPolarAngle = Math.PI / 2

    scene.add(new THREE.AmbientLight(0x404040, 0.4))
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
    sunLight.position.set(50, 100, 50)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.set(1024, 1024)
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 500
    sunLight.shadow.camera.left = -100
    sunLight.shadow.camera.right = 100
    sunLight.shadow.camera.top = 100
    sunLight.shadow.camera.bottom = -100
    scene.add(sunLight)

    const skyGeometry = new THREE.SphereGeometry(500, 32, 32)
    const skyMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          vec3 col = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33.0 },
        exponent: { value: 0.6 }
      },
      side: THREE.BackSide
    })
    scene.add(new THREE.Mesh(skyGeometry, skyMaterial))

    // Ship variables
    let ship = null
    let shipInitialPosition = { x: -10, y: 2, z: 0 }
    let shipTargetPosition = { x: 10, y: 2, z: 0 }
    let shipSailingTime = 0
    let shipSailingSpeed = 0.004

    // Load the ship model with original materials
    const mtlLoader = new MTLLoader()
    mtlLoader.load('/ship-small.mtl', (materials) => {
      materials.preload()
      
      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.load('/ship-small.obj', (object) => {
        ship = object
        
        // Scale and position the ship
        ship.scale.set(0.8, 0.8, 0.8)
        ship.position.set(shipInitialPosition.x, shipInitialPosition.y, shipInitialPosition.z)
        ship.rotation.y = Math.PI / 4 // Face the direction of travel
        
        // Add shadows
        ship.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        
        scene.add(ship)
        setIsShipLoaded(true)
      }, undefined, (error) => {
        console.error('Error loading ship:', error)
      })
    }, undefined, (error) => {
      console.error('Error loading materials:', error)
    })

    const GRID = 200
    const geometry = new THREE.PlaneGeometry(350, 150, GRID, GRID)
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      shininess: 100
    })
    const ocean = new THREE.Mesh(geometry, material)
    ocean.rotation.x = -Math.PI / 2
    ocean.receiveShadow = true
    scene.add(ocean)

    const positions = geometry.attributes.position
    const initialPos = positions.array.slice()
    const colors = new Float32Array(positions.count * 3)
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    // Deep ocean blue - darkest color for deep water
    const deep = new THREE.Color(0x001f3f)
    // Medium blue for shallow/mid-depth water
    const shallow = new THREE.Color(0x0066cc) 
    // Light blue for wave foam and surface effects
    const foam = new THREE.Color(0x4da6ff)
    // Almost white color for wave crests and whitecaps
    const white = new THREE.Color(0xe6f3ff)

    // Calculate wave height at a given point and time using multiple wave components
    function getWaveHeight(x, y, t) {
      const windDir = Math.PI / 4  // Wind direction in radians (45 degrees)
      const windStrength = 1.0     // Increased overall strength of wind effect
      
      // Primary wave - Large rolling waves in wind direction
      const primary = Math.sin(x * 0.2 * Math.cos(windDir) + y * 0.2 * Math.sin(windDir) + t * 0.6) * 1.0 * windStrength
      
      // Secondary wave - Perpendicular to wind, creates cross-chop
      const secondary = Math.sin(x * 0.15 * Math.cos(windDir + Math.PI * 0.5) + y * 0.15 * Math.sin(windDir + Math.PI * 0.5) + t * 0.4) * 0.5
      
      // Long period swell - Slow moving large waves
      const swell = Math.sin(x * 0.05 + t * 0.15) * 0.4
      
      // Small choppy waves - High frequency detail
      const chop = Math.sin(x * 0.9 + t * 2.2) * 0.15 + Math.sin(y * 0.7 + t * 1.9) * 0.15
      
      // Combine all wave components and add base water level
      return primary + secondary + swell + chop + 2.0
    }

    let frame = 0
    function animateWaves(time) {
      for (let i = 0; i < positions.count; i++) {
        const ix = initialPos[i * 3]
        const iy = initialPos[i * 3 + 1]
        const h = getWaveHeight(ix, iy, time)
        positions.array[i * 3 + 2] = h

        // Color the waves based on height and steepness
        const normalized = (h - 0.5) / 3.0
        let col
        if (normalized < 0.3) {
          // Deep water color
          col = deep.clone().lerp(shallow, Math.max(0.0, normalized / 0.3))
        } else if (normalized < 0.7) {
          // Transition to foam color in mid-heights
          col = shallow.clone().lerp(foam, (normalized - 0.3) / 0.4)
        } else {
          // Add white caps and foam to wave peaks
          const tt = (normalized - 0.7) / 0.3
          col = foam.clone().lerp(white, tt)
          // Calculate wave steepness to add extra foam on steep waves
          const steepness =
            Math.abs(getWaveHeight(ix + 0.1, iy, time) - getWaveHeight(ix - 0.1, iy, time)) +
            Math.abs(getWaveHeight(ix, iy + 0.1, time) - getWaveHeight(ix, iy - 0.1, time))
          if (steepness > 0.3) col.lerp(white, Math.min(steepness * 0.5, 0.3))
        }
        // Fade colors with distance from center
        const dist = Math.hypot(ix, iy)
        const depthFactor = Math.max(0, 1 - dist / 50)
        col.multiplyScalar(0.7 + depthFactor * 0.3).toArray(colors, i * 3)
      }
      positions.needsUpdate = true
      geometry.attributes.color.needsUpdate = true
      if ((frame++ & 7) === 0) geometry.computeVertexNormals()
    }

    function animateSun(time) {
      const a = time * 0.05 // Slower movement (reduced from 0.1 to 0.05)
      
      // Adjust the arc to move above the water surface
      const x = Math.sin(a) * 50 // Maps from -50 to 50 (left to right)
      const y = Math.cos(a) * 20 + 20 // Maps from 0 to 40 (always above water)
      const z = Math.sin(a * 0.5) * 20 // Adds some depth variation
      
      sunLight.position.set(x, y, z)
      const intensity = Math.max(0.3, Math.sin(a) * 0.5 + 0.5)
      sunLight.intensity = intensity * 1.2
    }

    // Animate the ship sailing
    function animateShip(time) {
      if (!ship) return
      
      shipSailingTime += shipSailingSpeed
      
      // Create a smooth sailing path
      const progress = (Math.sin(shipSailingTime) + 1) / 2 // 0 to 1
      
      // Interpolate between start and end positions
      ship.position.x = shipInitialPosition.x + (shipTargetPosition.x - shipInitialPosition.x) * progress
      ship.position.z = shipInitialPosition.z + (shipTargetPosition.z - shipInitialPosition.z) * progress
      
      // Enhanced bobbing motion - more pronounced and realistic
      const bobFrequency = 0.8 // How fast the ship bobs
      const bobAmplitude = 0.3 // How much the ship bobs up and down
      const rollFrequency = 0.6 // How fast the ship rolls side to side
      const rollAmplitude = 0.08 // How much the ship rolls
      const pitchFrequency = 0.4 // How fast the ship pitches forward/backward
      const pitchAmplitude = 0.04 // How much the ship pitches
      
      // Vertical bobbing motion
      const bobOffset = Math.sin(time * bobFrequency) * bobAmplitude
      
      // Rolling motion (side to side)
      ship.rotation.z = Math.sin(time * rollFrequency) * rollAmplitude
      
      // Pitching motion (forward/backward)
      ship.rotation.x = Math.sin(time * pitchFrequency) * pitchAmplitude
      
      // Add wave height to ship position plus bobbing
      const waveHeight = getWaveHeight(ship.position.x, ship.position.z, time)
      ship.position.y = shipInitialPosition.y + waveHeight * 0.1 + bobOffset
      
      // Reverse direction when reaching the end
      if (progress >= 1) {
        shipSailingTime = 0
        // Swap start and end positions
        const temp = { ...shipInitialPosition }
        shipInitialPosition = { ...shipTargetPosition }
        shipTargetPosition = temp
        ship.rotation.y += Math.PI // Turn the ship around
      }
    }

    // Handle ship interaction
    function handleShipClick(event) {
      if (!ship || !isShipLoaded) {
        return
      }
      
      const rect = renderer.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)
      
      const intersects = raycaster.intersectObject(ship, true)
      
      if (intersects.length > 0) {
        console.log("Ship has been clicked")
        // Just log - don't change camera or ship position
      }
    }

    // Add click event listener
    renderer.domElement.addEventListener('click', handleShipClick)
    renderer.domElement.style.pointerEvents = 'auto'
    renderer.domElement.style.zIndex = '1'
    
    // Add window-level click handler to catch clicks that might be blocked by other elements
    // This will check if we're clicking on the ship even if other elements are on top
    const handleWindowClick = (event) => {
      // Skip if clicking on interactive elements (buttons, links, inputs, etc.)
      const target = event.target
      const isInteractive = target.closest('a, button, input, textarea, select, [role="button"], [tabindex]')
      
      if (isInteractive) {
        return // Let interactive elements handle their own clicks
      }
      
      // Check if click would hit the ship using raycaster
      if (!ship || !isShipLoaded) return
      
      const rect = renderer.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)
      
      const intersects = raycaster.intersectObject(ship, true)
      
      if (intersects.length > 0) {
        console.log("Ship has been clicked")
        event.stopPropagation() // Prevent other handlers
        // Just log - don't change camera or ship position
      }
    }
    
    // Use capture phase to catch events before they're blocked
    window.addEventListener('click', handleWindowClick, true)

    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    const clock = new THREE.Clock()
    let destroyed = false

    function animate() {
      if (destroyed) return
      animationIdRef.current = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      animateWaves(t)
      animateSun(t)
      animateShip(t)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      cancelAnimationFrame(animationIdRef.current)
    })

    return () => {
      destroyed = true
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('click', handleWindowClick, true)
      renderer.domElement.removeEventListener('click', handleShipClick)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [isShipLoaded, isInteractive])

  return (
    <div
      ref={mountRef}
      className="ocean-background absolute inset-0 w-full h-full z-0"
      style={{ 
        position: 'fixed', 
        inset: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 0,
        cursor: isShipLoaded ? 'pointer' : 'default'
      }}
    >
      {/* Ship interaction instructions */}
      {/* {isShipLoaded && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
          <p>🚢 Click the ship to explore it in 3D</p>
          <p className="text-xs opacity-75">Use mouse to rotate, scroll to zoom</p>
        </div>
      )} */}
    </div>
  )
}

export default OceanBackground
