import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as lil from 'lil-gui'

const canvas = document.querySelector('canvas.webgl')

const parameters = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Scene
const scene = new THREE.Scene()

// Textures 
const cubeTextureLoader = new THREE.CubeTextureLoader() 
const environmentMap = cubeTextureLoader.load([
    '/environmentMaps/0/px.jpg',
    '/environmentMaps/0/nx.jpg',
    '/environmentMaps/0/py.jpg',
    '/environmentMaps/0/ny.jpg',
    '/environmentMaps/0/pz.jpg',
    '/environmentMaps/0/nz.jpg',
])

environmentMap.outputEncoding = THREE.sRGBEncoding

const drawer = [null, 0]

const updateAllMaterials = () => {
    scene.traverse(child => {
        window.addEventListener('keydown', ({ key }) => {
            if (key === ' ') {
                if (child.name === 'Drawer') {
                    drawer[0] = child 
                    drawer[1]++
                }
            }
        })

        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMap = environmentMap
            child.material.envMapIntensity = 4.8

            child.castShadow = true 
            child.receiveShadow = true 
        }
    })
}

// 3d Model 
const dracoLoader = new DRACOLoader() 
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load('/glTF/3DRoom.glb', gltf => {
    gltf.scene.rotation.y = 5.5

    scene.add(gltf.scene)

    updateAllMaterials()
})

// Lights 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4) 
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.64) 
directionalLight.position.set(0.8, 0.7, 0.7)
directionalLight.castShadow = true 
directionalLight.shadow.mapSize.set(1024, 1024) 
directionalLight.shadow.camera.far = 4
scene.add(directionalLight)

const lamp = new THREE.SpotLight(0xffff00, 0)
lamp.position.set(- 0.57, 0.413, 0.413)
lamp.castShadow = true
lamp.shadow.mapSize.set(1024, 1024) 
lamp.shadow.camera.near = 1
lamp.shadow.camera.far = 2
lamp.shadow.camera.fov = 30
scene.add(lamp)

// Camera
const camera = new THREE.PerspectiveCamera(75, parameters.width / parameters.height, 0.1, 100) 
camera.position.set(0, 0.8, 2)
scene.add(camera) 

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true 
})
renderer.setSize(parameters.width, parameters.height) 
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.4
renderer.shadowMap.enabled = true 
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Event Listeners
window.addEventListener('resize', () => {
    parameters.width = window.innerWidth
    parameters.height = window.innerHeight
    camera.aspect = parameters.width / parameters.height
    camera.updateProjectionMatrix()
    renderer.setSize(parameters.width, parameters.height) 
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
})

const switchLamp = ({ key }) => {
    if (key.toLowerCase() === 'o') lamp.intensity = lamp.intensity === 0 ? 1.5 : 0
}

window.addEventListener('keydown', switchLamp)

// Controls
const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true 
orbitControls.minDistance = 1.5
orbitControls.maxDistance = 2
orbitControls.maxAzimuthAngle = 0.5
orbitControls.minAzimuthAngle = - 0.5
orbitControls.maxPolarAngle = 1.5
orbitControls.minPolarAngle = 1
orbitControls.enablePan = false

// Animations
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    if (drawer[0]) {
        if (drawer[0].position.x > - 0.27 && drawer[1] % 2 !== 0) {
            drawer[0].position.x += (- 0.27 * deltaTime)
        } else if (drawer[0].position.x < - 0.24 && drawer[1] % 2 === 0) {
            drawer[0].position.x += (0.27 * deltaTime)
        }   
    }

    camera.position.x += Math.sin(elapsedTime) * 0.0015

    orbitControls.update()

    renderer.render(scene, camera) 

    window.requestAnimationFrame(tick) 
}
tick()