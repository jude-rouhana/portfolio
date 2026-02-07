import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const OceanBackground = ({ onGameModeChange }) => {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const animationIdRef = useRef(null)
  const [isShipLoaded, setIsShipLoaded] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [isGameMode, setIsGameMode] = useState(false)
  const [collectedFragments, setCollectedFragments] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 })
  const [isJoystickActive, setIsJoystickActive] = useState(false)
  const isJoystickActiveRef = useRef(false)
  const isGameModeRef = useRef(false)
  const keysPressedRef = useRef({ up: false, down: false, left: false, right: false })
  const gameStateRef = useRef(null) // Will store ship, camera, etc.
  const joystickRef = useRef(null)
  const joystickContainerRef = useRef(null)
  const joystickElementRef = useRef(null) // Ref for the joystick container div
  const isMobileRef = useRef(false) // Store mobile state for camera adjustments

  useEffect(() => {
    if (!mountRef.current) return

    // Detect mobile device - check for touch capability or small screen
    const checkMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 768px)').matches
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      // Show joystick if touch is available OR screen is small
      const isMobileDevice = hasTouch || isSmallScreen || isMobileUserAgent
      setIsMobile(isMobileDevice)
      isMobileRef.current = isMobileDevice
      return isMobileDevice
    }
    const mobileDevice = checkMobile()

    // Also listen for resize to update mobile detection
    const handleResizeMobile = () => {
      checkMobile()
    }
    window.addEventListener('resize', handleResizeMobile)

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

    // Optimize renderer for mobile
    const renderer = new THREE.WebGLRenderer({
      antialias: !mobileDevice, // Disable antialiasing on mobile for performance
      alpha: true,
      powerPreference: mobileDevice ? 'low-power' : 'high-performance' // Use low-power on mobile
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileDevice ? 1.5 : 2)) // Lower pixel ratio on mobile
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x4a90e2, 0.3)
    renderer.shadowMap.enabled = !mobileDevice // Disable shadows on mobile for performance
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    // Add OrbitControls for interactive ship viewing
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = false // Always disabled - camera is controlled programmatically
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

    // Load sky texture for skybox (box)
    const skyTextureLoader = new THREE.TextureLoader()
    // const skyTexture = skyTextureLoader.load('/Textures/sky.jpg')
    const skyTexture = skyTextureLoader.load('/Textures/sky2.jpg')
    skyTexture.wrapS = THREE.RepeatWrapping
    skyTexture.wrapT = THREE.RepeatWrapping

    // Create box skybox - large enough to contain the scene
    const skyBoxSize = 750
    const skyGeometry = new THREE.BoxGeometry(skyBoxSize, skyBoxSize, skyBoxSize)

    // Create materials for each face of the box
    // Bottom face gets dark blue color to match ocean, other faces use sky texture
    const skyMaterials = [
      new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide, fog: false }), // Right
      new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide, fog: false }), // Left
      new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide, fog: false }), // Top
      new THREE.MeshBasicMaterial({ color: 0x001f3f, side: THREE.BackSide, fog: false }), // Bottom - dark blue
      new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide, fog: false }), // Front
      new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide, fog: false })  // Back
    ]

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterials)
    scene.add(skyMesh)

    // Ship variables
    let ship = null
    let shipInitialPosition = { x: -10, y: 2, z: 0 }
    let shipTargetPosition = { x: 10, y: 2, z: 0 }
    let shipSailingTime = 0
    let shipSailingSpeed = 0.004

    // Game mode variables
    const keysPressed = keysPressedRef.current
    const shipVelocity = new THREE.Vector3(0, 0, 0)
    const shipRotationVelocityRef = { value: 0 }
    const fragments = []
    const originalCameraPosition = new THREE.Vector3(20, 18, 85)
    const originalCameraLookAt = new THREE.Vector3(0, 0, 0)
    const isAutomaticSailingRef = { value: true }

    // Store game state in ref for access from mobile controls
    gameStateRef.current = {
      ship: null,
      camera: camera,
      originalCameraPosition: originalCameraPosition,
      originalCameraLookAt: originalCameraLookAt,
      setIsGameMode: setIsGameMode,
      isGameModeRef: isGameModeRef,
      shipVelocity: shipVelocity,
      shipRotationVelocity: shipRotationVelocityRef,
      isAutomaticSailing: isAutomaticSailingRef,
      onGameModeChange: onGameModeChange
    }

    // Physics constants
    const maxSpeed = 1  // Increased from 0.4
    const acceleration = 0.1  // Increased from 0.005
    const rotationSpeed = 0.2
    const friction = 0.95
    const angularFriction = 0.95

    // Ocean boundaries - 5x larger: 175*5 = 875, 75*5 = 375
    const oceanBounds = { xMin: -875, xMax: 875, zMin: -375, zMax: 375 }

    // Load the ship model with original materials
    const mtlLoader = new MTLLoader()
    mtlLoader.load('/ship-small.mtl', (materials) => {
      materials.preload()

      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.load('/ship-small.obj', (object) => {
        ship = object
        if (gameStateRef.current) {
          gameStateRef.current.ship = ship
        }

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

    // Reduce grid resolution on mobile for better performance
    const GRID = mobileDevice ? 100 : 200
    // Ocean made 5x larger: 350*5 = 1750, 150*5 = 750
    const geometry = new THREE.PlaneGeometry(750, 750, GRID, GRID)

    // Load water texture
    const textureLoader = new THREE.TextureLoader()
    const waterTexture = textureLoader.load('/Textures/water2.jpg')
    waterTexture.wrapS = THREE.RepeatWrapping
    waterTexture.wrapT = THREE.RepeatWrapping
    // Repeat texture to tile across the ocean surface (higher values = more tiles = smaller texture per tile)
    // Ocean is 1750x750, so we want many tiles to avoid stretching
    waterTexture.repeat.set(50, 25) // More tiles for better detail without stretching

    const material = new THREE.MeshPhongMaterial({
      map: waterTexture,
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: false, // Make ocean opaque
      opacity: 1.0,
      shininess: 100
    })
    const ocean = new THREE.Mesh(geometry, material)
    ocean.rotation.x = -Math.PI / 2
    // Position ocean at the base of the skybox (y = 0 is the center, so we position it at the bottom)
    ocean.position.y = 0 // Ocean sits at the base of the box
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

    // Animate the ship sailing (automatic mode)
    function animateShip(time) {
      if (!ship || !isAutomaticSailingRef.value) return

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

    // Update ship physics (game mode)
    function updateShipPhysics(time, deltaTime) {
      if (!ship || !isGameModeRef.current) return

      // Read directly from keysPressedRef to get latest joystick values
      const keys = keysPressedRef.current

      // Handle rotation
      if (keys.left) {
        shipRotationVelocityRef.value += rotationSpeed * deltaTime
      }
      if (keys.right) {
        shipRotationVelocityRef.value -= rotationSpeed * deltaTime
      }

      // Apply angular friction
      shipRotationVelocityRef.value *= angularFriction

      // Update ship rotation
      ship.rotation.y += shipRotationVelocityRef.value

      // Calculate forward direction based on ship rotation
      const forward = new THREE.Vector3(
        Math.sin(ship.rotation.y),
        0,
        Math.cos(ship.rotation.y)
      )

      // Handle acceleration
      if (keys.up) {
        shipVelocity.add(forward.multiplyScalar(acceleration * deltaTime * 60))
      }
      if (keys.down) {
        shipVelocity.add(forward.multiplyScalar(-acceleration * deltaTime * 60 * 0.5))
      }

      // Apply friction
      shipVelocity.multiplyScalar(friction)

      // Limit max speed
      if (shipVelocity.length() > maxSpeed) {
        shipVelocity.normalize().multiplyScalar(maxSpeed)
      }

      // Update ship position
      ship.position.x += shipVelocity.x
      ship.position.z += shipVelocity.z

      // Boundary constraints
      if (ship.position.x < oceanBounds.xMin) {
        ship.position.x = oceanBounds.xMin
        shipVelocity.x *= -0.5 // Bounce back
      }
      if (ship.position.x > oceanBounds.xMax) {
        ship.position.x = oceanBounds.xMax
        shipVelocity.x *= -0.5
      }
      if (ship.position.z < oceanBounds.zMin) {
        ship.position.z = oceanBounds.zMin
        shipVelocity.z *= -0.5
      }
      if (ship.position.z > oceanBounds.zMax) {
        ship.position.z = oceanBounds.zMax
        shipVelocity.z *= -0.5
      }

      // Enhanced bobbing motion - more pronounced and realistic
      const bobFrequency = 0.8
      const bobAmplitude = 0.3
      const rollFrequency = 0.6
      const rollAmplitude = 0.08
      const pitchFrequency = 0.4
      const pitchAmplitude = 0.04

      // Vertical bobbing motion
      const bobOffset = Math.sin(time * bobFrequency) * bobAmplitude

      // Rolling motion (side to side) - enhanced when turning
      const baseRoll = Math.sin(time * rollFrequency) * rollAmplitude
      const turnRoll = shipRotationVelocityRef.value * 0.3
      ship.rotation.z = baseRoll + turnRoll

      // Pitching motion (forward/backward) - enhanced when moving
      const basePitch = Math.sin(time * pitchFrequency) * pitchAmplitude
      const speedPitch = shipVelocity.length() * 0.1
      ship.rotation.x = basePitch - speedPitch

      // Add wave height to ship position plus bobbing
      const waveHeight = getWaveHeight(ship.position.x, ship.position.z, time)
      ship.position.y = 2 + waveHeight * 0.1 + bobOffset
    }

    // Update camera to follow ship - maintains fixed relative position with rotation
    function updateCameraFollow() {
      if (!ship || !isGameModeRef.current) return

      const targetPosition = new THREE.Vector3()
      ship.getWorldPosition(targetPosition)

      // Calculate camera position behind and above ship
      // Zoom out more on mobile for better view
      const distance = isMobileRef.current ? 35 : 24  // Further back on mobile
      const height = isMobileRef.current ? 16 : 12  // Higher on mobile for better overview
      const angle = ship.rotation.y

      const cameraTarget = new THREE.Vector3(
        targetPosition.x - Math.sin(angle) * distance,
        targetPosition.y + height,
        targetPosition.z - Math.cos(angle) * distance
      )

      // Immediate positioning to maintain fixed relative position
      camera.position.copy(cameraTarget)

      // Rotate camera slightly left/right as ship turns
      // Use ship's rotation to add a subtle camera rotation
      const cameraRotationOffset = ship.rotation.y * 0.3  // Subtle rotation following ship
      camera.lookAt(
        targetPosition.x + Math.sin(cameraRotationOffset) * 2,
        targetPosition.y,
        targetPosition.z + Math.cos(cameraRotationOffset) * 2
      )
    }

    // Create tablet fragments
    function createFragments(time) {
      const fragmentCount = 15
      const fragmentGeometry = new THREE.BoxGeometry(3.0, 3.0, 0.6)  // Made much larger: was 1.5, 1.5, 0.3
      const fragmentMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 2.0,  // Increased from 0.8 for much brighter glow
        metalness: 0.7,
        roughness: 0.3
      })

      for (let i = 0; i < fragmentCount; i++) {
        const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial.clone())

        // Random position within ocean bounds
        const x = Math.random() * (oceanBounds.xMax - oceanBounds.xMin) + oceanBounds.xMin
        const z = Math.random() * (oceanBounds.zMax - oceanBounds.zMin) + oceanBounds.zMin
        const y = getWaveHeight(x, z, time) * 0.1 + 4.0  // Adjusted for much bigger fragments

        fragment.position.set(x, y, z)
        fragment.rotation.z = Math.random() * Math.PI * 2
        fragment.userData.isFragment = true
        fragment.userData.rotationSpeed = (Math.random() - 0.5) * 0.02

        scene.add(fragment)
        fragments.push(fragment)
      }
    }

    // Update fragments animation and check collisions
    function updateFragments(time) {
      if (!isGameModeRef.current && fragments.length === 0) return

      // Iterate backwards to safely remove items
      for (let i = fragments.length - 1; i >= 0; i--) {
        const fragment = fragments[i]
        if (!fragment.parent) {
          fragments.splice(i, 1)
          continue
        }

        // Rotate fragment
        fragment.rotation.y += fragment.userData.rotationSpeed
        fragment.rotation.z += 0.01

        // Update Y position based on waves
        const waveHeight = getWaveHeight(fragment.position.x, fragment.position.z, time)
        fragment.position.y = waveHeight * 0.1 + 4.0  // Adjusted for much bigger fragments

        // Check collision with ship
        if (ship && isGameModeRef.current) {
          const distance = ship.position.distanceTo(fragment.position)
          if (distance < 5) {  // Increased collision distance for much bigger fragments
            // Collect fragment
            scene.remove(fragment)
            fragments.splice(i, 1)
            setCollectedFragments(prev => prev + 1)
          }
        }
      }
    }

    // Handle ship interaction (works for both mouse and touch)
    function handleShipInteraction(event) {
      if (!ship || !isShipLoaded) {
        return
      }

      // Prevent default to avoid scrolling on mobile
      event.preventDefault()

      const rect = renderer.domElement.getBoundingClientRect()
      const pointer = new THREE.Vector2()

      // Handle both mouse and touch events (touchend uses changedTouches)
      const touch = event.touches?.[0] || event.changedTouches?.[0]
      const clientX = touch ? touch.clientX : event.clientX
      const clientY = touch ? touch.clientY : event.clientY

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(pointer, camera)

      const intersects = raycaster.intersectObject(ship, true)

      if (intersects.length > 0) {
        // Start game mode
        setIsGameMode(true)
        isGameModeRef.current = true
        isAutomaticSailingRef.value = false
        // Reset ship velocity
        shipVelocity.set(0, 0, 0)
        shipRotationVelocityRef.value = 0
        // Make ship smaller for game mode
        if (ship) {
          ship.scale.set(0.5, 0.5, 0.5)  // Scale down from 0.8 to 0.5
        }
        // Notify parent component
        if (onGameModeChange) onGameModeChange(true)
      }
    }

    // Add click and touch event listeners
    renderer.domElement.addEventListener('click', handleShipInteraction)
    renderer.domElement.addEventListener('touchend', handleShipInteraction, { passive: false })
    renderer.domElement.style.pointerEvents = 'none'
    renderer.domElement.style.touchAction = 'auto' // Allow default touch behaviors for scrolling
    renderer.domElement.style.zIndex = '1'

    // Add window-level click handler to catch clicks that might be blocked by other elements
    // This will check if we're clicking on the ship even if other elements are on top
    const handleWindowInteraction = (event) => {
      // Skip if clicking on interactive elements (buttons, links, inputs, etc.)
      const target = event.target
      const isInteractive = target.closest('a, button, input, textarea, select, [role="button"], [tabindex], .mobile-control')

      if (isInteractive) {
        return // Let interactive elements handle their own clicks
      }

      // Check if click would hit the ship using raycaster
      if (!ship || !isShipLoaded) return

      const rect = renderer.domElement.getBoundingClientRect()
      const pointer = new THREE.Vector2()

      // Handle both mouse and touch events (touchend uses changedTouches)
      const touch = event.touches?.[0] || event.changedTouches?.[0]
      const clientX = touch ? touch.clientX : event.clientX
      const clientY = touch ? touch.clientY : event.clientY

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(pointer, camera)

      const intersects = raycaster.intersectObject(ship, true)

      if (intersects.length > 0) {
        // Start game mode
        setIsGameMode(true)
        isGameModeRef.current = true
        isAutomaticSailingRef.value = false
        // Reset ship velocity
        shipVelocity.set(0, 0, 0)
        shipRotationVelocityRef.value = 0
        // Make ship smaller for game mode
        if (ship) {
          ship.scale.set(0.5, 0.5, 0.5)  // Scale down from 0.8 to 0.5
        }
        // Notify parent component
        if (onGameModeChange) onGameModeChange(true)
        event.stopPropagation() // Prevent other handlers
        event.preventDefault() // Prevent default on mobile
      }
    }

    // Use capture phase to catch events before they're blocked
    window.addEventListener('click', handleWindowInteraction, true)
    window.addEventListener('touchend', handleWindowInteraction, { passive: false, capture: true })

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
    let lastTime = 0

    // Update ref when state changes
    isGameModeRef.current = isGameMode

    // Keyboard event handlers
    const handleKeyDown = (event) => {
      if (!isGameModeRef.current) return

      // Use keysPressedRef.current directly
      const keys = keysPressedRef.current

      switch (event.key) {
        case 'ArrowUp':
          keys.up = true
          event.preventDefault()
          break
        case 'ArrowDown':
          keys.down = true
          event.preventDefault()
          break
        case 'ArrowLeft':
          keys.left = true
          event.preventDefault()
          break
        case 'ArrowRight':
          keys.right = true
          event.preventDefault()
          break
        case 'Escape':
          // Exit game mode
          setIsGameMode(false)
          isGameModeRef.current = false
          isAutomaticSailingRef.value = true
          shipVelocity.set(0, 0, 0)
          shipRotationVelocityRef.value = 0
          // Restore ship to original size
          if (ship) {
            ship.scale.set(0.8, 0.8, 0.8)  // Restore original scale
          }
          // Reset camera
          camera.position.copy(originalCameraPosition)
          camera.lookAt(originalCameraLookAt)
          // Notify parent component
          if (onGameModeChange) onGameModeChange(false)
          event.preventDefault()
          break
      }
    }

    const handleKeyUp = (event) => {
      if (!isGameModeRef.current) return

      // Use keysPressedRef.current directly
      const keys = keysPressedRef.current

      switch (event.key) {
        case 'ArrowUp':
          keys.up = false
          event.preventDefault()
          break
        case 'ArrowDown':
          keys.down = false
          event.preventDefault()
          break
        case 'ArrowLeft':
          keys.left = false
          event.preventDefault()
          break
        case 'ArrowRight':
          keys.right = false
          event.preventDefault()
          break
      }
    }

    // Add keyboard listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Create fragments when game mode is first activated
    let fragmentsCreated = false

    function animate() {
      if (destroyed) return
      animationIdRef.current = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const deltaTime = t - lastTime
      lastTime = t

      animateWaves(t)
      animateSun(t)

      if (isGameModeRef.current) {
        // Create fragments once when entering game mode
        if (!fragmentsCreated) {
          createFragments(t)
          fragmentsCreated = true
        }
        updateShipPhysics(t, deltaTime)
        updateCameraFollow()  // Camera follows ship from behind and above
        updateFragments(t)
        // Don't update controls in game mode - camera is controlled programmatically
      } else {
        animateShip(t)
        // Reset fragments when exiting game mode
        if (fragmentsCreated) {
          fragments.forEach(fragment => scene.remove(fragment))
          fragments.length = 0
          fragmentsCreated = false
          setCollectedFragments(0)
        }
        controls.update()
      }

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
      window.removeEventListener('click', handleWindowInteraction, true)
      window.removeEventListener('touchend', handleWindowInteraction, true)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      renderer.domElement.removeEventListener('click', handleShipInteraction)
      renderer.domElement.removeEventListener('touchend', handleShipInteraction)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [isShipLoaded, isInteractive, isGameMode])

  // Update ref when state changes
  useEffect(() => {
    isJoystickActiveRef.current = isJoystickActive
  }, [isJoystickActive])

  // Joystick handler functions
  const handleJoystickStart = (event) => {
    // Only work in game mode
    if (!isGameModeRef.current) return

    setIsJoystickActive(true)
    isJoystickActiveRef.current = true
    if (joystickContainerRef.current) {
      // Handle both event objects and Touch objects
      const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0
      const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0
      handleJoystickMove({ clientX, clientY })
    }
  }

  // Set up touch event listeners with useEffect - using refs to access latest state
  useEffect(() => {
    const joystickEl = joystickElementRef.current
    if (!joystickEl) {
      // Element might not be ready yet, try again after a short delay
      const timer = setTimeout(() => {
        const retryEl = joystickElementRef.current
        if (retryEl) {
          // Set up listeners now that element is available
          setupListeners(retryEl)
        }
      }, 200)
      return () => clearTimeout(timer)
    }

    setupListeners(joystickEl)

    function setupListeners(el) {

      // Touch event handlers that use refs to access latest state
      const handleTouchStart = (e) => {
        // Check if touch is on the joystick element
        const touch = e.touches?.[0]
        if (!touch) return

        const rect = el.getBoundingClientRect()
        const touchX = touch.clientX
        const touchY = touch.clientY

        // Check if touch is within joystick bounds (with padding for easier touch)
        const padding = 20
        if (touchX >= rect.left - padding && touchX <= rect.right + padding &&
          touchY >= rect.top - padding && touchY <= rect.bottom + padding) {
          e.preventDefault()
          e.stopPropagation()
          handleJoystickStart(e)
        }
      }

      const handleTouchMove = (e) => {
        if (isJoystickActiveRef.current && e.touches && e.touches[0]) {
          e.preventDefault()
          e.stopPropagation()
          // Pass the event object so handleJoystickMove can access touch coordinates
          handleJoystickMove(e)
        }
      }

      const handleTouchEnd = (e) => {
        if (isJoystickActiveRef.current) {
          e.preventDefault()
          e.stopPropagation()
          handleJoystickEnd()
        }
      }

      const handleTouchCancel = (e) => {
        if (isJoystickActiveRef.current) {
          e.preventDefault()
          e.stopPropagation()
          handleJoystickEnd()
        }
      }

      // Add listeners to joystick element for touchstart
      el.addEventListener('touchstart', handleTouchStart, { passive: false })

      // Add listeners to document for touchmove and touchend so they work even when finger moves outside
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd, { passive: false })
      document.addEventListener('touchcancel', handleTouchCancel, { passive: false })

      // Return cleanup function
      return () => {
        el.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
        document.removeEventListener('touchcancel', handleTouchCancel)
      }
    }

    // Get cleanup function from setupListeners
    const cleanup = setupListeners(joystickEl)
    return cleanup || (() => { })
  }, [isGameMode]) // Re-run when game mode changes to ensure listeners are set up

  const handleJoystickMove = (event) => {
    // Only work in game mode
    if (!isGameModeRef.current) return
    if (!joystickContainerRef.current || !joystickRef.current) return

    const rect = joystickContainerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const clientX = event.clientX || event.touches?.[0]?.clientX || 0
    const clientY = event.clientY || event.touches?.[0]?.clientY || 0

    // Calculate distance from center
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Get max radius (container radius - handle radius)
    const containerRadius = rect.width / 2
    const handleElement = joystickRef.current
    const handleWidth = handleElement ? parseFloat(getComputedStyle(handleElement).width) : 0
    const handleRadius = handleWidth / 2 || 30
    const maxRadius = Math.max(containerRadius - handleRadius, 10) // Ensure minimum radius

    // Clamp position to circle bounds
    const clampedDistance = Math.min(distance, maxRadius)
    const angle = Math.atan2(deltaY, deltaX)

    const newX = clampedDistance * Math.cos(angle)
    const newY = clampedDistance * Math.sin(angle)

    setJoystickPosition({ x: newX, y: newY })

    // Calculate direction based on joystick position
    // Normalize to -1 to 1 range
    const normalizedX = newX / maxRadius
    const normalizedY = newY / maxRadius

    // Update keys based on joystick position
    // Use a threshold to prevent accidental movement
    const threshold = 0.3

    keysPressedRef.current.up = normalizedY < -threshold
    keysPressedRef.current.down = normalizedY > threshold
    keysPressedRef.current.left = normalizedX < -threshold
    keysPressedRef.current.right = normalizedX > threshold
  }

  const handleJoystickEnd = () => {
    setIsJoystickActive(false)
    isJoystickActiveRef.current = false
    setJoystickPosition({ x: 0, y: 0 })
    // Reset all keys
    keysPressedRef.current.up = false
    keysPressedRef.current.down = false
    keysPressedRef.current.left = false
    keysPressedRef.current.right = false
  }

  return (
    <div
      ref={mountRef}
      className="ocean-background absolute inset-0 w-full h-full z-0"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: isGameMode ? 50 : 0,
        cursor: isShipLoaded ? 'pointer' : 'default'
      }}
    >
      {/* Instruction Message - Show when not in game mode */}
      {!isGameMode && isShipLoaded && (
        <div className="absolute top-4 left-4 pointer-events-none z-50">
          <div className="bg-black/70 text-white px-6 py-4 rounded-none backdrop-blur-sm border-2 border-white">
            <p className="text-lg font-bold mb-1">Click on the boat to start the game</p>
            <p className="text-sm opacity-75">Use arrow keys or joystick to control the ship</p>
          </div>
        </div>
      )}

      {/* Game UI Overlay */}
      {isGameMode && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Fragment Counter */}
          <div className={`absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-none backdrop-blur-sm border-2 border-white ${isMobile ? 'px-2 py-1' : ''}`}>
            <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold`}>Tablet Fragments: {collectedFragments}</div>
          </div>

          {/* Instructions - top right, always visible */}
          <div
            className={`absolute top-4 right-4 bg-black/70 text-white px-4 py-3 rounded-none backdrop-blur-sm border-2 border-white ${isMobile ? 'hidden' : ''}`}
          >
            <h3 className="text-lg font-bold mb-2">Ship Control</h3>
            <p className="text-sm mb-1">↑ ↓ Arrow Keys: Move Forward/Backward</p>
            <p className="text-sm mb-1">← → Arrow Keys: Turn Left/Right</p>
            <p className="text-sm text-yellow-400 mt-2">Collect the glowing tablet fragments!</p>
            <p className="text-xs mt-2 opacity-75">Press ESC to exit</p>
          </div>

          {/* Mobile Instructions */}
          {isMobile && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-2 rounded-none backdrop-blur-sm max-w-[180px] border-2 border-white">
              <h3 className="text-xs font-bold mb-1">Ship Control</h3>
              <p className="text-[10px] mb-0.5 leading-tight">Use joystick to control the ship</p>
              <p className="text-[10px] text-yellow-400 mt-1 leading-tight">Collect the glowing fragments!</p>
            </div>
          )}

          {/* Mobile Control Buttons - Show when mobile OR when in game mode (for testing) */}
          {(isMobile || isGameMode) && (
            <div className="absolute bottom-0 left-0 right-0 pointer-events-auto mobile-control" style={{ zIndex: 1000 }}>
              {/* Joystick Control - Bottom Left - Raised and responsive */}
              <div
                ref={joystickContainerRef}
                className="absolute"
                style={{
                  bottom: 'min(20vh, 120px)', // Raise controls - use 20% of viewport height or max 120px
                  left: 'max(1rem, 4vw)', // Responsive left margin
                  zIndex: 1001
                }}
              >
                {/* Outer Circle - Joystick Container */}
                <div
                  ref={joystickElementRef}
                  className="relative rounded-none border-2 border-gray-500/70 bg-gray-900/50 backdrop-blur-sm shadow-inner"
                  style={{
                    width: 'clamp(6rem, 24vw, 8rem)',
                    height: 'clamp(6rem, 24vw, 8rem)',
                    touchAction: 'none',
                    pointerEvents: 'auto',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                    zIndex: 1002
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleJoystickStart(e)
                    const handleMouseMove = (moveEvent) => {
                      handleJoystickMove(moveEvent)
                    }
                    const handleMouseUp = () => {
                      handleJoystickEnd()
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                >
                  {/* Inner Circle - Joystick Handle */}
                  <div
                    ref={joystickRef}
                    className="absolute rounded-none bg-gradient-to-br from-gray-500 to-gray-700 border-2 border-gray-400 shadow-lg transition-transform duration-100 ease-out"
                    style={{
                      width: 'clamp(2.5rem, 10vw, 3.5rem)',
                      height: 'clamp(2.5rem, 10vw, 3.5rem)',
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))`,
                      touchAction: 'none',
                      userSelect: 'none',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
                    }}
                  />
                </div>
              </div>

              {/* Exit Button - Bottom Right - Raised and responsive */}
              <button
                onClick={() => {
                  if (!gameStateRef.current) return
                  const state = gameStateRef.current
                  state.setIsGameMode(false)
                  state.isGameModeRef.current = false
                  state.isAutomaticSailing.value = true
                  state.shipVelocity.set(0, 0, 0)
                  state.shipRotationVelocity.value = 0
                  if (state.ship) {
                    state.ship.scale.set(0.8, 0.8, 0.8)
                  }
                  state.camera.position.copy(state.originalCameraPosition)
                  state.camera.lookAt(state.originalCameraLookAt)
                  if (state.onGameModeChange) state.onGameModeChange(false)
                }}
                className="absolute bg-red-500/80 hover:bg-red-600/90 active:bg-red-700/90 backdrop-blur-md rounded-none flex items-center justify-center font-bold text-white shadow-lg border-2 border-red-400/50 touch-manipulation"
                style={{
                  touchAction: 'manipulation',
                  bottom: 'min(20vh, 120px)', // Match the height of movement controls
                  right: 'max(1rem, 4vw)', // Responsive right margin
                  width: 'clamp(3.5rem, 14vw, 5rem)',
                  height: 'clamp(3.5rem, 14vw, 5rem)',
                  fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                  zIndex: 100
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OceanBackground
