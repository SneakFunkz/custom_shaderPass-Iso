import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import fragment1 from "./shader/fragment1.glsl";
import vertex from "./shader/vertex.glsl";
let OrbitControls = require("three-orbit-controls")(THREE);

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js" 
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js" 
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js" 
import { PixelShader } from "three/examples/jsm/shaders/PixelShader" 
import { PostProcessing } from "./postprocessing" 


import landscape from '../1.jpg'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true         
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);

    // this.composer.setPixelRatio(window.devicePixelRatio);
    // this.composer.setSize(this.width, this.height);
    
    this.renderer.setClearColor(0x111111, 1); 
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    
    this.addObjects();
    this.addPost();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  addPost() {

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene,this.camera));

    this.customPass = new ShaderPass(PostProcessing);
    this.customPass.uniforms["resolution"].value = new THREE.Vector2(window.innerWidth, window.innerHeight);

    this.customPass.uniforms["resolution"].value.multiplyScalar(window.devicePixelRatio);
    this.composer.addPass(this.customPass)
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * //////ADDDDDD OBJECTS
   */
  addObjects() {
    let that = this;
    let t = new THREE.TextureLoader().load(landscape)
    t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping
/**
 * MATERIAL
 */
  
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        landscape: { value: t},
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });
/**
 * MATERIAL1
 */
    this.material1 = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        landscape: { value: t},
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment1
    });

    this.geometry = new THREE.IcosahedronGeometry(1, 1);
    this.geometry1 = new THREE.IcosahedronBufferGeometry(1.001, 1);

    let length = this.geometry1.attributes.position.array.length;

    // alert(length)

    let bary = [];

    for (let i = 0; i < length/3; i++) {
      bary.push(0,0,1,   0,1,0,    1,0,0)
    }

    let aBary = new Float32Array(bary);
    this.geometry1.setAttribute('aBary', new THREE.BufferAttribute(aBary,3),)

    this.ico = new THREE.Mesh(this.geometry1, this.material);
    this.icolines = new THREE.Mesh(this.geometry1, this.material1);
    this.scene.add(this.ico);
    this.scene.add(this.icolines);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.01;
    this.scene.rotation.x += 0.001;
    this.scene.rotation.y += 0.001;
    // this.scene.rotation.z += 0.0005;
    // this.scene.rotation.y = this.time;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();

  }
}

new Sketch({
  dom: document.getElementById("container")
});
