import { useEffect, useRef, useState, type RefObject } from "react"
import type * as THREE from "three"
import iphoneModelUrl from "../../assets/landing/models/iphone-15.glb?url"

export type SequencePhoneScreen = {
  imageAlt: string
  imageSrc: string
}

export type SequencePhoneController = {
  setRotationY: (rotationY: number) => void
  setScreen: (index: number) => void
}

type SequencePhone3DProps = {
  angle?: number
  className?: string
  controllerRef: RefObject<SequencePhoneController | null>
  screens: readonly SequencePhoneScreen[]
}

export function SequencePhone3D({
  angle = 0,
  className = "",
  controllerRef,
  screens,
}: SequencePhone3DProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fallbackImageRefs = useRef<(HTMLImageElement | null)[]>([])
  const [isThreeReady, setIsThreeReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas || screens.length === 0) return

    let activeScreenIndex = 0
    let disposed = false
    let frameId = 0
    let interactionGroup: THREE.Group | null = null
    let isVisible = false
    let renderer: THREE.WebGLRenderer | null = null
    let resizeObserver: ResizeObserver | null = null
    let screenMaterial: THREE.MeshBasicMaterial | null = null
    let screenTextures: THREE.Texture[] = []
    let scrollGroup: THREE.Group | null = null
    let setupStarted = false
    let startRendering: () => void = () => undefined
    let removePointerListeners: () => void = () => undefined
    let disposeDracoLoader: () => void = () => undefined
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    const textures = new Set<THREE.Texture>()
    let rotationY = 0

    const syncFallbackScreen = (index: number) => {
      fallbackImageRefs.current.forEach((image, imageIndex) => {
        if (!image) return
        const isActive = imageIndex === index
        image.style.opacity = isActive ? "1" : "0"
        image.style.visibility = isActive ? "visible" : "hidden"
      })
    }

    const setScreen = (index: number) => {
      const nextIndex = Math.min(Math.max(0, index), screens.length - 1)
      activeScreenIndex = nextIndex
      syncFallbackScreen(nextIndex)
      const nextTexture = screenTextures[nextIndex]
      if (!screenMaterial || !nextTexture || screenMaterial.map === nextTexture) return
      screenMaterial.map = nextTexture
      screenMaterial.needsUpdate = true
    }

    const setRotationY = (nextRotationY: number) => {
      rotationY = nextRotationY
      if (scrollGroup) scrollGroup.rotation.y = rotationY
    }

    const controller: SequencePhoneController = { setRotationY, setScreen }
    controllerRef.current = controller
    syncFallbackScreen(activeScreenIndex)

    if (
      window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)")
        .matches
    ) {
      return () => {
        if (controllerRef.current === controller) controllerRef.current = null
      }
    }

    const disposeResources = () => {
      cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      removePointerListeners()
      renderer?.dispose()
      renderer?.forceContextLoss()
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      geometries.forEach((geometry) => geometry.dispose())
      disposeDracoLoader()
    }

    const setup = async () => {
      if (setupStarted || disposed) return
      setupStarted = true

      try {
        const [ThreeModule, { DRACOLoader, DRACO_GLTF_CONFIG }, { GLTFLoader }] =
          await Promise.all([
            import("three"),
            import("three/addons/loaders/DRACOLoader.js"),
            import("three/addons/loaders/GLTFLoader.js"),
          ])
        const Three = ThreeModule
        const dracoLoader = new DRACOLoader().setDecoderPath(DRACO_GLTF_CONFIG)
        disposeDracoLoader = () => dracoLoader.dispose()
        const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader)
        const textureLoader = new Three.TextureLoader()
        const [gltf, loadedTextures] = await Promise.all([
          gltfLoader.loadAsync(iphoneModelUrl),
          Promise.all(screens.map((screen) => textureLoader.loadAsync(screen.imageSrc))),
        ])

        screenTextures = loadedTextures
        screenTextures.forEach((texture) => {
          texture.colorSpace = Three.SRGBColorSpace
          texture.flipY = false
          texture.center.set(0.5, 0.5)
          texture.rotation = Math.PI
          texture.wrapS = Three.RepeatWrapping
          texture.repeat.x = -1
          texture.needsUpdate = true
          textures.add(texture)
        })

        const model = gltf.scene
        if (disposed) {
          model.traverse((child) => {
            if (!(child instanceof Three.Mesh)) return
            child.geometry.dispose()
            const childMaterials = Array.isArray(child.material)
              ? child.material
              : [child.material]
            childMaterials.forEach((material) => material.dispose())
          })
          screenTextures.forEach((texture) => texture.dispose())
          disposeDracoLoader()
          return
        }

        const screenMesh = model.getObjectByName("xXDHkMplTIDAXLN")
        if (!(screenMesh instanceof Three.Mesh)) {
          throw new Error("iPhone screen mesh was not found")
        }
        const oldScreenMaterials = Array.isArray(screenMesh.material)
          ? screenMesh.material
          : [screenMesh.material]
        oldScreenMaterials.forEach((material) => material.dispose())
        screenMaterial = new Three.MeshBasicMaterial({
          map: screenTextures[activeScreenIndex],
          toneMapped: false,
        })
        screenMesh.material = screenMaterial

        model.traverse((child) => {
          if (!(child instanceof Three.Mesh)) return
          geometries.add(child.geometry)
          const childMaterials = Array.isArray(child.material)
            ? child.material
            : [child.material]
          childMaterials.forEach((material) => {
            materials.add(material)
            Object.values(material).forEach((value) => {
              if (value instanceof Three.Texture) textures.add(value)
            })
          })
        })

        const bounds = new Three.Box3().setFromObject(model)
        const size = bounds.getSize(new Three.Vector3())
        model.scale.multiplyScalar(3.02 / size.y)
        const centeredBounds = new Three.Box3().setFromObject(model)
        const center = centeredBounds.getCenter(new Three.Vector3())
        model.position.sub(center)
        model.position.y -= 0.02
        model.rotation.y = Math.PI + Three.MathUtils.degToRad(angle)

        const scene = new Three.Scene()
        const camera = new Three.PerspectiveCamera(36, 1, 0.1, 100)
        camera.position.set(0, 0, 5.45)
        scene.add(new Three.HemisphereLight(0xffffff, 0x30363d, 1.7))
        const keyLight = new Three.DirectionalLight(0xffffff, 3.15)
        keyLight.position.set(-3.5, 5.5, 6.5)
        scene.add(keyLight)
        const fillLight = new Three.DirectionalLight(0xeaf2ff, 1.45)
        fillLight.position.set(4, 1.5, 4)
        scene.add(fillLight)
        const rimLight = new Three.DirectionalLight(0xffffff, 2.1)
        rimLight.position.set(3.5, 3, -5)
        scene.add(rimLight)

        scrollGroup = new Three.Group()
        interactionGroup = new Three.Group()
        interactionGroup.add(model)
        scrollGroup.add(interactionGroup)
        scene.add(scrollGroup)
        setRotationY(rotationY)

        renderer = new Three.WebGLRenderer({ alpha: true, antialias: true, canvas })
        renderer.setClearColor(0x000000, 0)
        renderer.outputColorSpace = Three.SRGBColorSpace
        renderer.toneMapping = Three.ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.94
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        screenTextures.forEach((texture) => {
          texture.anisotropy = Math.min(8, renderer?.capabilities.getMaxAnisotropy() ?? 1)
          texture.needsUpdate = true
        })

        const resize = () => {
          if (!renderer) return
          const width = Math.max(1, host.clientWidth)
          const height = Math.max(1, host.clientHeight)
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.render(scene, camera)
        }
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(host)
        resize()

        let currentPitch = 0
        let currentYaw = 0
        let targetPitch = 0
        let targetYaw = 0
        const handlePointerMove = (event: PointerEvent) => {
          const rect = host.getBoundingClientRect()
          targetYaw = Three.MathUtils.degToRad(
            ((event.clientX - rect.left) / rect.width - 0.5) * 4,
          )
          targetPitch = Three.MathUtils.degToRad(
            -((event.clientY - rect.top) / rect.height - 0.5) * 3,
          )
        }
        const handlePointerLeave = () => {
          targetPitch = 0
          targetYaw = 0
        }
        host.addEventListener("pointermove", handlePointerMove)
        host.addEventListener("pointerleave", handlePointerLeave)
        removePointerListeners = () => {
          host.removeEventListener("pointermove", handlePointerMove)
          host.removeEventListener("pointerleave", handlePointerLeave)
        }

        const render = () => {
          if (disposed || !renderer || !interactionGroup || !isVisible) {
            frameId = 0
            return
          }
          currentPitch += (targetPitch - currentPitch) * 0.08
          currentYaw += (targetYaw - currentYaw) * 0.08
          interactionGroup.rotation.x = currentPitch
          interactionGroup.rotation.y = currentYaw
          renderer.render(scene, camera)
          frameId = requestAnimationFrame(render)
        }
        startRendering = () => {
          if (frameId === 0 && isVisible) frameId = requestAnimationFrame(render)
        }

        setIsThreeReady(true)
        startRendering()
      } catch (error) {
        if (!disposed) {
          console.warn("YepBuddy sequence phone fallback:", error)
          setIsThreeReady(false)
        }
      }
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (entry.isIntersecting) {
          void setup()
          startRendering()
        } else {
          cancelAnimationFrame(frameId)
          frameId = 0
        }
      },
      { rootMargin: "300px 0px" },
    )
    visibilityObserver.observe(host)

    return () => {
      disposed = true
      visibilityObserver.disconnect()
      if (controllerRef.current === controller) controllerRef.current = null
      disposeResources()
    }
  }, [angle, controllerRef, screens])

  return (
    <div
      ref={hostRef}
      className={`relative aspect-phone ${className}`}
      data-three-ready={isThreeReady ? "true" : "false"}
    >
      <div
        className={
          isThreeReady
            ? "absolute inset-0 overflow-hidden rounded-phone-mobile border-phone border-ink bg-device opacity-0 shadow-phone transition-opacity duration-normal desktop:rounded-phone"
            : "absolute inset-0 overflow-hidden rounded-phone-mobile border-phone border-ink bg-device opacity-100 shadow-phone transition-opacity duration-normal desktop:rounded-phone"
        }
      >
        {screens.map((screen, index) => (
          <img
            alt={screen.imageAlt}
            className={
              index === 0
                ? "absolute inset-0 h-full w-full object-cover opacity-100"
                : "invisible absolute inset-0 h-full w-full object-cover opacity-0"
            }
            decoding="async"
            height="2622"
            key={screen.imageSrc}
            loading="lazy"
            ref={(element) => {
              fallbackImageRefs.current[index] = element
            }}
            src={screen.imageSrc}
            width="1206"
          />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={
          isThreeReady
            ? "pointer-events-none absolute inset-0 h-full w-full opacity-100 transition-opacity duration-slow"
            : "pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-slow"
        }
      />
    </div>
  )
}
