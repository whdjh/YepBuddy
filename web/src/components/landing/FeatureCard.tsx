import { useEffect, useRef, useState } from "react"
import type * as THREE from "three"
import iphoneModelUrl from "../../assets/landing/models/iphone-15.glb?url"

type FeatureStep = {
  accentLineIndex?: number
  description?: string
  eyebrow?: string
  titleLines: readonly string[]
}

type FeatureScreen = {
  imageAlt: string
  imageSrc: string
}

type FeaturePhone = {
  angle: number
  screens: readonly FeatureScreen[]
}

type FeatureCardProps = {
  background: "canvas" | "surface" | "cool"
  headingLevel: "h2" | "h3"
  phones: readonly FeaturePhone[]
  steps: readonly FeatureStep[]
  visualPosition: "left" | "right"
}

export function FeatureCard({
  background,
  headingLevel,
  phones,
  steps,
  visualPosition,
}: FeatureCardProps) {
  const Heading = headingLevel
  const hasStepSequence = steps.length > 1
  const hasScreenSequence = phones.some((phone) => phone.screens.length > 1)
  const hasScrollSequence = hasStepSequence || hasScreenSequence
  const isHomeSequence = hasScreenSequence && !hasStepSequence
  const cardRef = useRef<HTMLElement>(null)
  const sequenceRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const phoneRefs = useRef<(HTMLDivElement | null)[]>([])
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const screenImageRefs = useRef<(HTMLImageElement | null)[][]>([])
  const screenSettersRef = useRef<((screenIndex: number) => void)[]>([])
  const tapPulseRef = useRef<HTMLSpanElement>(null)
  const activeScreenRef = useRef(0)
  const [isThreeReady, setIsThreeReady] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    const sequence = sequenceRef.current
    const copy = copyRef.current
    const visual = visualRef.current
    const stepElements = stepRefs.current.slice(0, steps.length).filter(
      (step): step is HTMLDivElement => step !== null,
    )
    const phoneElements = phoneRefs.current.slice(0, phones.length).filter(
      (phone): phone is HTMLDivElement => phone !== null,
    )

    if (
      !card ||
      !sequence ||
      !copy ||
      !visual ||
      stepElements.length !== steps.length ||
      phoneElements.length !== phones.length
    ) {
      return
    }

    let cancelled = false
    let animationMedia: { revert: () => void } | undefined

    const setupAnimation = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])
      if (cancelled) return

      const clamp = (value: number) => Math.min(1, Math.max(0, value))
      const rangeProgress = (start: number, end: number, value: number) =>
        clamp((value - start) / (end - start))
      const smooth = (value: number) => value * value * (3 - 2 * value)
      const easeRange = (start: number, end: number, value: number) =>
        smooth(rangeProgress(start, end, value))

      const syncSequence = (progress: number) => {
        if (!hasScrollSequence) return

        const detailVisibility = isHomeSequence
          ? easeRange(0.46, 0.54, progress)
          : easeRange(0.3, 0.43, progress)
        const tapVisibility = isHomeSequence
          ? 0
          : easeRange(0.16, 0.23, progress) *
            (1 - easeRange(0.28, 0.34, progress))
        const activeScreen = detailVisibility >= 0.5 ? 1 : 0
        activeScreenRef.current = activeScreen
        screenSettersRef.current.forEach((setScreen) => setScreen(activeScreen))

        screenImageRefs.current.forEach((screenImages) => {
          if (screenImages[0]) {
            gsap.set(screenImages[0], {
              autoAlpha: 1 - detailVisibility,
              scale:
                1 - detailVisibility * (isHomeSequence ? 0.02 : 0.035),
            })
          }
          if (screenImages[1]) {
            gsap.set(screenImages[1], {
              autoAlpha: detailVisibility,
              scale: isHomeSequence
                ? 0.98 + detailVisibility * 0.02
                : 0.97 + detailVisibility * 0.03,
            })
          }
        })

        if (tapPulseRef.current) {
          gsap.set(tapPulseRef.current, {
            autoAlpha: tapVisibility,
            boxShadow: `0 0 0 ${18 * tapVisibility}px rgba(255, 255, 255, 0)`,
            scale: 0.55 + tapVisibility * 0.85,
          })
        }

        if (hasStepSequence) {
          stepElements.forEach((step, index) => {
            step.hidden = index !== (progress < 0.38 ? 0 : 1)
          })
        }
      }

      gsap.registerPlugin(ScrollTrigger)
      const media = gsap.matchMedia(card)
      animationMedia = media
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) {
            syncSequence(isHomeSequence ? 0 : 1)
            return
          }

          gsap.from(copy, {
            autoAlpha: 0,
            duration: isHomeSequence ? 0.9 : hasStepSequence ? 0.72 : 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: isHomeSequence ? "top 66%" : "top 70%",
              once: true,
            },
            y: isHomeSequence ? 28 : hasStepSequence ? 28 : 26,
          })
          gsap.from(phoneElements, {
            autoAlpha: 0,
            duration: isHomeSequence ? 0.8 : hasStepSequence ? 0.75 : 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: visual,
              start: isHomeSequence ? "top 68%" : "top 72%",
              once: true,
            },
            stagger: 0.16,
            y: (index) =>
              isHomeSequence ? 48 : hasStepSequence ? 54 : index === 0 ? 64 : -14,
          })

          if (hasScrollSequence) {
            const sequenceTrigger = ScrollTrigger.create({
              end: () =>
                isHomeSequence
                  ? "bottom bottom"
                  : window.innerWidth <= 760
                    ? "bottom 24%"
                    : "bottom bottom",
              invalidateOnRefresh: true,
              onRefresh: (self) => syncSequence(self.progress),
              onUpdate: (self) => syncSequence(self.progress),
              scrub: isHomeSequence ? 0.35 : true,
              start: () =>
                isHomeSequence
                  ? window.innerWidth <= 760
                    ? "top top+=60"
                    : "top top+=64"
                  : window.innerWidth <= 760
                    ? "top 72%"
                    : "top top+=64",
              trigger: sequence,
            })
            syncSequence(sequenceTrigger.progress)
          }
        },
      )
    }

    void setupAnimation()

    return () => {
      cancelled = true
      animationMedia?.revert()
    }
  }, [hasScreenSequence, hasScrollSequence, hasStepSequence, isHomeSequence, phones, steps])

  useEffect(() => {
    const card = cardRef.current
    const phoneElements = phoneRefs.current.slice(0, phones.length)
    const canvases = canvasRefs.current.slice(0, phones.length)

    if (
      !card ||
      phoneElements.some((phone) => phone === null) ||
      canvases.some((canvas) => canvas === null)
    ) {
      return
    }

    if (
      window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)")
        .matches
    ) {
      return
    }

    let disposed = false
    let frameId = 0
    let isVisible = false
    let sourceModel: THREE.Group | null = null
    let setupStarted = false
    let startRendering: () => void = () => undefined
    let threeModule: typeof import("three") | null = null
    let disposeDracoLoader: () => void = () => undefined
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    const textures = new Set<THREE.Texture>()
    const renderers: THREE.WebGLRenderer[] = []
    const resizeObservers: ResizeObserver[] = []
    const removePointerListeners: (() => void)[] = []
    const scenes: {
      camera: THREE.PerspectiveCamera
      currentPitch: number
      currentYaw: number
      pivot: THREE.Group
      renderer: THREE.WebGLRenderer
      scene: THREE.Scene
      targetPitch: number
      targetYaw: number
    }[] = []

    const rememberMaterial = (material: THREE.Material) => {
      materials.add(material)
      Object.values(material).forEach((value) => {
        if (threeModule && value instanceof threeModule.Texture) textures.add(value)
      })
    }

    const rememberModelResources = (model: THREE.Object3D) => {
      model.traverse((child) => {
        if (!threeModule || !(child instanceof threeModule.Mesh)) return
        geometries.add(child.geometry)
        const childMaterials = Array.isArray(child.material)
          ? child.material
          : [child.material]
        childMaterials.forEach(rememberMaterial)
      })
    }

    const disposeResources = () => {
      resizeObservers.forEach((observer) => observer.disconnect())
      removePointerListeners.forEach((removeListener) => removeListener())
      renderers.forEach((renderer) => {
        renderer.dispose()
        renderer.forceContextLoss()
      })
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      geometries.forEach((geometry) => geometry.dispose())
      disposeDracoLoader()
      screenSettersRef.current = []
    }

    const addStudioLights = (scene: THREE.Scene) => {
      if (!threeModule) return
      scene.add(new threeModule.HemisphereLight(0xffffff, 0x30363d, 1.7))
      const keyLight = new threeModule.DirectionalLight(0xffffff, 3.15)
      keyLight.position.set(-3.5, 5.5, 6.5)
      scene.add(keyLight)
      const fillLight = new threeModule.DirectionalLight(0xeaf2ff, 1.45)
      fillLight.position.set(4, 1.5, 4)
      scene.add(fillLight)
      const rimLight = new threeModule.DirectionalLight(0xffffff, 2.1)
      rimLight.position.set(3.5, 3, -5)
      scene.add(rimLight)
    }

    const render = () => {
      if (disposed || !isVisible) {
        frameId = 0
        return
      }

      scenes.forEach((phoneScene) => {
        phoneScene.currentYaw +=
          (phoneScene.targetYaw - phoneScene.currentYaw) * 0.08
        phoneScene.currentPitch +=
          (phoneScene.targetPitch - phoneScene.currentPitch) * 0.08
        phoneScene.pivot.rotation.y += phoneScene.currentYaw
        phoneScene.pivot.rotation.x = phoneScene.currentPitch
        phoneScene.renderer.render(phoneScene.scene, phoneScene.camera)
        phoneScene.pivot.rotation.y -= phoneScene.currentYaw
      })
      frameId = requestAnimationFrame(render)
    }

    startRendering = () => {
      if (frameId === 0 && isVisible && scenes.length === phones.length) {
        frameId = requestAnimationFrame(render)
      }
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
        if (disposed) return

        const Three = ThreeModule
        threeModule = Three
        const dracoLoader = new DRACOLoader().setDecoderPath(DRACO_GLTF_CONFIG)
        disposeDracoLoader = () => {
          dracoLoader.dispose()
        }
        const textureLoader = new Three.TextureLoader()
        const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader)
        const [gltf, phoneTextures] = await Promise.all([
          gltfLoader.loadAsync(iphoneModelUrl),
          Promise.all(
            phones.map((phone) =>
              Promise.all(
                phone.screens.map((screen) => textureLoader.loadAsync(screen.imageSrc)),
              ),
            ),
          ),
        ])

        sourceModel = gltf.scene
        rememberModelResources(sourceModel)
        phoneTextures.flat().forEach((texture) => {
          texture.colorSpace = Three.SRGBColorSpace
          texture.flipY = false
          texture.center.set(0.5, 0.5)
          texture.rotation = Math.PI
          texture.wrapS = Three.RepeatWrapping
          texture.repeat.x = -1
          texture.updateMatrix()
          texture.needsUpdate = true
          textures.add(texture)
        })

        if (disposed) {
          disposeResources()
          return
        }

        phones.forEach((phone, index) => {
          const phoneElement = phoneElements[index]
          const canvas = canvases[index]
          const screenTextures = phoneTextures[index]
          if (!phoneElement || !canvas || !sourceModel || !screenTextures) return

          const renderer = new Three.WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas,
          })
          renderer.setClearColor(0x000000, 0)
          renderer.outputColorSpace = Three.SRGBColorSpace
          renderer.toneMapping = Three.ACESFilmicToneMapping
          renderer.toneMappingExposure = 0.94
          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, window.innerWidth <= 760 ? 1.35 : 1.75),
          )
          renderers.push(renderer)

          const scene = new Three.Scene()
          const camera = new Three.PerspectiveCamera(36, 1, 0.1, 100)
          camera.position.set(0, 0, 5.45)
          addStudioLights(scene)

          const pivot = new Three.Group()
          const model = sourceModel.clone(true)
          model.traverse((child) => {
            if (!(child instanceof Three.Mesh)) return
            const childMaterials = Array.isArray(child.material)
              ? child.material
              : [child.material]
            const clonedMaterials = childMaterials.map((material) => material.clone())
            clonedMaterials.forEach(rememberMaterial)
            child.material = Array.isArray(child.material)
              ? clonedMaterials
              : clonedMaterials[0]
          })

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
            map: screenTextures[0],
            toneMapped: false,
          })
          screenMesh.material = screenMaterial
          rememberMaterial(screenMaterial)
          screenSettersRef.current[index] = (screenIndex) => {
            const nextTexture = screenTextures[Math.min(screenIndex, screenTextures.length - 1)]
            if (!nextTexture || screenMaterial.map === nextTexture) return
            screenMaterial.map = nextTexture
            screenMaterial.needsUpdate = true
          }
          screenSettersRef.current[index](activeScreenRef.current)

          const bounds = new Three.Box3().setFromObject(model)
          const size = bounds.getSize(new Three.Vector3())
          model.scale.multiplyScalar(3.02 / size.y)
          const centeredBounds = new Three.Box3().setFromObject(model)
          const center = centeredBounds.getCenter(new Three.Vector3())
          model.position.sub(center)
          model.position.y -= 0.02
          pivot.rotation.y = Math.PI + Three.MathUtils.degToRad(phone.angle)
          pivot.add(model)
          scene.add(pivot)
          rememberModelResources(model)

          const phoneScene = {
            camera,
            currentPitch: 0,
            currentYaw: 0,
            pivot,
            renderer,
            scene,
            targetPitch: 0,
            targetYaw: 0,
          }
          scenes.push(phoneScene)

          const resize = () => {
            const width = Math.max(1, phoneElement.clientWidth)
            const height = Math.max(1, phoneElement.clientHeight)
            renderer.setSize(width, height, false)
            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderer.render(scene, camera)
          }
          const resizeObserver = new ResizeObserver(resize)
          resizeObserver.observe(phoneElement)
          resizeObservers.push(resizeObserver)
          resize()

          const handlePointerMove = (event: PointerEvent) => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
            const rect = phoneElement.getBoundingClientRect()
            phoneScene.targetYaw = Three.MathUtils.degToRad(
              ((event.clientX - rect.left) / rect.width - 0.5) * 4,
            )
            phoneScene.targetPitch = Three.MathUtils.degToRad(
              -((event.clientY - rect.top) / rect.height - 0.5) * 3,
            )
          }
          const handlePointerLeave = () => {
            phoneScene.targetYaw = 0
            phoneScene.targetPitch = 0
          }
          phoneElement.addEventListener("pointermove", handlePointerMove)
          phoneElement.addEventListener("pointerleave", handlePointerLeave)
          removePointerListeners.push(() => {
            phoneElement.removeEventListener("pointermove", handlePointerMove)
            phoneElement.removeEventListener("pointerleave", handlePointerLeave)
          })
        })

        if (scenes.length !== phones.length) {
          throw new Error("Not every 3D phone could be created")
        }

        setIsThreeReady(true)
        startRendering()
      } catch (error) {
        if (!disposed) {
          console.warn("YepBuddy 3D phones fallback:", error)
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
      { rootMargin: "0px" },
    )
    visibilityObserver.observe(card)

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      visibilityObserver.disconnect()
      disposeResources()
    }
  }, [phones])

  return (
    <article
      ref={cardRef}
      className={
        background === "canvas"
          ? "mx-auto max-w-content px-page-mobile phone:px-page"
          : background === "cool"
          ? "mx-auto max-w-content rounded-feature-mobile bg-surface-cool px-page-mobile py-14.5 phone:px-12 desktop:rounded-feature desktop:p-feature-card"
          : "mx-auto max-w-content rounded-feature-mobile bg-surface px-page-mobile py-14.5 phone:px-12 desktop:rounded-feature desktop:p-feature-card"
      }
    >
      <div
        ref={sequenceRef}
        className={
          steps.length > 1
            ? "relative min-h-[175svh] desktop:min-h-[145svh]"
            : isHomeSequence
              ? "relative min-h-[190svh]"
            : "relative"
        }
      >
        <div
          className={
            hasScrollSequence
              ? isHomeSequence
                ? "sticky top-header-mobile grid min-h-[calc(100svh-60px)] items-center gap-8 phone:top-header phone:min-h-[calc(100svh-64px)] desktop:grid-cols-[1fr_0.72fr] desktop:gap-23"
                : "sticky top-header-mobile grid min-h-[calc(100svh-60px)] items-center gap-6 phone:top-header phone:min-h-[calc(100svh-64px)] desktop:grid-cols-2 desktop:gap-16"
              : "grid min-h-140 items-center gap-8.5 desktop:grid-cols-[0.9fr_1.1fr] desktop:gap-16"
          }
        >
          <div
            ref={copyRef}
            className={
              visualPosition === "left"
                ? isHomeSequence
                  ? "max-w-720px desktop:order-2"
                  : "max-w-copy desktop:order-2"
                : isHomeSequence
                  ? "max-w-720px desktop:order-1"
                  : "max-w-copy desktop:order-1"
            }
          >
            {steps.map((step, stepIndex) => (
              <div
                hidden={stepIndex !== 0}
                key={`${step.eyebrow}-${step.titleLines.join("-")}`}
                ref={(element) => {
                  stepRefs.current[stepIndex] = element
                }}
              >
                {step.eyebrow ? (
                  <p className="m-0 text-eyebrow-mobile font-bold text-brand phone:text-eyebrow">
                    {step.eyebrow}
                  </p>
                ) : null}
                <Heading
                  className={
                    isHomeSequence
                      ? "m-0 break-keep text-statement-mobile font-emphasis text-ink desktop:text-statement"
                      : "my-4.5 break-keep text-[38px] leading-[1.12] font-heavy tracking-[-0.055em] text-ink desktop:my-6 desktop:text-[clamp(40px,4.4vw,58px)]"
                  }
                >
                  {step.titleLines.map((line, lineIndex) => (
                    <span
                      className={
                        lineIndex === step.accentLineIndex
                          ? "block text-brand"
                          : "block"
                      }
                      key={`${lineIndex}-${line}`}
                    >
                      {line}
                    </span>
                  ))}
                </Heading>
                {step.description ? (
                  <p className="m-0 max-w-copy break-keep text-body text-ink-secondary desktop:text-body-lg">
                    {step.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div
            ref={visualRef}
            className={
              hasScrollSequence
                ? isHomeSequence
                  ? visualPosition === "left"
                    ? "relative grid min-h-140 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-1 desktop:min-h-165 desktop:rounded-feature"
                    : "relative grid min-h-140 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-2 desktop:min-h-165 desktop:rounded-feature"
                  : visualPosition === "left"
                  ? "relative grid min-h-130 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-1 desktop:min-h-162.5 desktop:rounded-visual"
                  : "relative grid min-h-130 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-2 desktop:min-h-162.5 desktop:rounded-visual"
                : visualPosition === "left"
                  ? "relative grid min-h-125 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-1 desktop:min-h-140 desktop:rounded-visual"
                  : "relative grid min-h-125 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-2 desktop:min-h-140 desktop:rounded-visual"
            }
          >
            {phones.map((phone, phoneIndex) => (
              <div
                key={`${phone.screens[0].imageSrc}-${phone.angle}`}
                ref={(element) => {
                  phoneRefs.current[phoneIndex] = element
                }}
                className={
                  phones.length === 1
                    ? isHomeSequence
                      ? "relative col-start-1 row-start-1 aspect-phone w-[min(55vw,205px)] desktop:w-56.25"
                      : "relative col-start-1 row-start-1 aspect-phone w-[min(48vw,190px)] desktop:w-53.5"
                    : phoneIndex === 0
                      ? "relative col-start-1 row-start-1 aspect-phone w-[min(41vw,165px)] -translate-x-1/5 translate-y-10 desktop:w-47.5 desktop:-translate-x-23.75 desktop:translate-y-11.25"
                      : "relative col-start-1 row-start-1 aspect-phone w-[min(41vw,165px)] translate-x-1/5 -translate-y-8.75 desktop:w-47.5 desktop:translate-x-23.75 desktop:-translate-y-11.25"
                }
              >
                <div
                  className={
                    isThreeReady
                      ? "absolute inset-0 overflow-hidden rounded-phone-mobile border-phone border-ink bg-device opacity-0 shadow-phone transition-opacity duration-normal desktop:rounded-phone"
                      : "absolute inset-0 overflow-hidden rounded-phone-mobile border-phone border-ink bg-device opacity-100 shadow-phone transition-opacity duration-normal desktop:rounded-phone"
                  }
                >
                  {phone.screens.map((screen, screenIndex) => (
                    <img
                      alt={screen.imageAlt}
                      className={
                        screenIndex === 0
                          ? "absolute inset-0 h-full w-full bg-device object-cover opacity-100"
                          : "invisible absolute inset-0 h-full w-full bg-device object-cover opacity-0"
                      }
                      decoding="async"
                      fetchPriority="low"
                      height="2622"
                      key={screen.imageSrc}
                      loading="lazy"
                      ref={(element) => {
                        if (!screenImageRefs.current[phoneIndex]) {
                          screenImageRefs.current[phoneIndex] = []
                        }
                        screenImageRefs.current[phoneIndex][screenIndex] = element
                      }}
                      src={screen.imageSrc}
                      width="1206"
                    />
                  ))}
                </div>
                <canvas
                  aria-hidden="true"
                  ref={(element) => {
                    canvasRefs.current[phoneIndex] = element
                  }}
                  className={
                    isThreeReady
                      ? "pointer-events-none absolute inset-0 h-full w-full opacity-100 transition-opacity duration-slow"
                      : "pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-slow"
                  }
                />
                {hasStepSequence ? (
                  <span
                    aria-hidden="true"
                    ref={tapPulseRef}
                    className="pointer-events-none absolute top-[39%] left-1/2 z-10 aspect-square w-12 -translate-x-1/2 -translate-y-1/2 scale-[0.55] rounded-full border-2 border-white/90 opacity-0"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
