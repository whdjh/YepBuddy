import { useEffect, useRef, useState } from "react"
import type * as THREE from "three"
import iphoneModelUrl from "../../assets/landing/models/iphone-15.glb?url"

type HeroPhoneProps = {
  imageAlt: string
  imageSrc: string
}

export function HeroPhone({ imageAlt, imageSrc }: HeroPhoneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isThreeReady, setIsThreeReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    let disposed = false
    let frameId = 0
    let isVisible = true
    let renderer: THREE.WebGLRenderer | null = null
    let resizeObserver: ResizeObserver | null = null
    let removePointerListeners: () => void = () => undefined
    let disposeDracoLoader: () => void = () => undefined
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    const textures = new Set<THREE.Texture>()

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
      },
      { rootMargin: "200px" },
    )
    visibilityObserver.observe(host)

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
      try {
        const [ThreeModule, { DRACOLoader, DRACO_GLTF_CONFIG }, { GLTFLoader }] =
          await Promise.all([
            import("three"),
            import("three/addons/loaders/DRACOLoader.js"),
            import("three/addons/loaders/GLTFLoader.js"),
          ])

        const Three = ThreeModule
        const rememberMaterial = (material: THREE.Material) => {
          materials.add(material)
          Object.values(material).forEach((value) => {
            if (value instanceof Three.Texture) textures.add(value)
          })
        }
        const rememberModelResources = (model: THREE.Object3D) => {
          model.traverse((child) => {
            if (!(child instanceof Three.Mesh)) return
            geometries.add(child.geometry)
            const childMaterials = Array.isArray(child.material)
              ? child.material
              : [child.material]
            childMaterials.forEach(rememberMaterial)
          })
        }

        const dracoLoader = new DRACOLoader().setDecoderPath(DRACO_GLTF_CONFIG)
        disposeDracoLoader = () => {
          dracoLoader.dispose()
        }
        const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader)
        const textureLoader = new Three.TextureLoader()
        const [gltf, screenTexture] = await Promise.all([
          gltfLoader.loadAsync(iphoneModelUrl),
          textureLoader.loadAsync(imageSrc),
        ])

        const model = gltf.scene
        rememberModelResources(model)
        textures.add(screenTexture)

        if (disposed) {
          disposeResources()
          return
        }

        screenTexture.colorSpace = Three.SRGBColorSpace
        screenTexture.flipY = false
        screenTexture.center.set(0.5, 0.5)
        screenTexture.rotation = Math.PI
        screenTexture.wrapS = Three.RepeatWrapping
        screenTexture.repeat.x = -1
        screenTexture.updateMatrix()
        screenTexture.needsUpdate = true

        const screenMesh = model.getObjectByName("xXDHkMplTIDAXLN")
        if (!(screenMesh instanceof Three.Mesh)) {
          throw new Error("iPhone screen mesh was not found")
        }

        const oldScreenMaterials = Array.isArray(screenMesh.material)
          ? screenMesh.material
          : [screenMesh.material]
        oldScreenMaterials.forEach((material) => {
          materials.delete(material)
          material.dispose()
        })
        const screenMaterial = new Three.MeshBasicMaterial({
          map: screenTexture,
          toneMapped: false,
        })
        screenMesh.material = screenMaterial
        rememberMaterial(screenMaterial)

        const bounds = new Three.Box3().setFromObject(model)
        const size = bounds.getSize(new Three.Vector3())
        model.scale.multiplyScalar(3.02 / size.y)
        const centeredBounds = new Three.Box3().setFromObject(model)
        const center = centeredBounds.getCenter(new Three.Vector3())
        model.position.sub(center)
        model.position.y -= 0.02

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

        const pivot = new Three.Group()
        const baseYaw = Math.PI + Three.MathUtils.degToRad(-7)
        pivot.rotation.y = baseYaw
        pivot.add(model)
        scene.add(pivot)

        renderer = new Three.WebGLRenderer({ alpha: true, antialias: true, canvas })
        renderer.setClearColor(0x000000, 0)
        renderer.outputColorSpace = Three.SRGBColorSpace
        renderer.toneMapping = Three.ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.94
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5))
        screenTexture.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy(),
        )
        screenTexture.generateMipmaps = true
        screenTexture.minFilter = Three.LinearMipmapLinearFilter
        screenTexture.magFilter = Three.LinearFilter
        screenTexture.needsUpdate = true

        let currentYaw = 0
        let currentPitch = 0
        let targetYaw = 0
        let targetPitch = 0

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

        const handlePointerMove = (event: PointerEvent) => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
          const rect = host.getBoundingClientRect()
          targetYaw = Three.MathUtils.degToRad(
            ((event.clientX - rect.left) / rect.width - 0.5) * 4,
          )
          targetPitch = Three.MathUtils.degToRad(
            -((event.clientY - rect.top) / rect.height - 0.5) * 3,
          )
        }
        const handlePointerLeave = () => {
          targetYaw = 0
          targetPitch = 0
        }
        host.addEventListener("pointermove", handlePointerMove)
        host.addEventListener("pointerleave", handlePointerLeave)
        removePointerListeners = () => {
          host.removeEventListener("pointermove", handlePointerMove)
          host.removeEventListener("pointerleave", handlePointerLeave)
        }

        const render = () => {
          if (disposed || !renderer) return
          frameId = requestAnimationFrame(render)
          if (!isVisible) return
          currentYaw += (targetYaw - currentYaw) * 0.08
          currentPitch += (targetPitch - currentPitch) * 0.08
          pivot.rotation.y = baseYaw + currentYaw
          pivot.rotation.x = currentPitch
          renderer.render(scene, camera)
        }

        setIsThreeReady(true)
        render()
      } catch (error) {
        if (!disposed) {
          console.warn("YepBuddy hero phone fallback:", error)
          setIsThreeReady(false)
        }
      }
    }

    void setup()

    return () => {
      disposed = true
      visibilityObserver.disconnect()
      disposeResources()
    }
  }, [imageSrc])

  return (
    <div ref={hostRef} className="relative aspect-phone w-51.25 phone:w-63.75">
      <div
        className={
          isThreeReady
            ? "absolute inset-0 overflow-hidden rounded-phone-mobile border-phone border-ink bg-device opacity-0 shadow-phone transition-opacity duration-normal phone:rounded-phone"
            : "absolute inset-0 overflow-hidden rounded-phone-mobile border-phone border-ink bg-device opacity-100 shadow-phone transition-opacity duration-normal phone:rounded-phone"
        }
      >
        <img
          alt={imageAlt}
          className="h-full w-full object-cover"
          decoding="async"
          fetchPriority="high"
          height="2622"
          loading="eager"
          src={imageSrc}
          width="1206"
        />
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
