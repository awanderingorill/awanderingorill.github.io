var container;
var backgroundCamera, backgroundScene;
var foregroundCamera, foregroundScene;
var reverbCamera, reverbScene;
var topLevelCamera, topLevelScene;
var uniforms;
var triangleMesh;

var bufferTextures = [];
var triangleDestTexture;
var currentBufferTextureIndex = 0;
var topLevelMaterial;

init();
animate();

function init() {
		container = document.getElementById( 'container' );

		uniforms = {
				u_time: { type: "f", value: 1.0 },
				u_resolution: { type: "v2", value: new THREE.Vector2() },
				u_mouse: { type: "v2", value: new THREE.Vector2() },
				u_texture_1: { type: "t", value: null },
				u_texture_2: { type: "t", value: null}
		};

		initBackgroundScene();
		initForegroundScene();
		initReverbScene();
		initTopLevelScene();

		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.autoClear = false;

		container.appendChild( renderer.domElement );

		onWindowResize();
		window.addEventListener( 'resize', onWindowResize, false );

		document.onmousemove = function(e){
			uniforms.u_mouse.value.x = e.pageX
			uniforms.u_mouse.value.y = e.pageY
		}
}

function initBackgroundScene() {
	backgroundCamera = new THREE.Camera();
	backgroundCamera.position.z = 1;

	backgroundScene = new THREE.Scene();

	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	var material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'backgroundVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'backgroundFragmentShader' ).textContent
	} );

	var mesh = new THREE.Mesh( geometry, material );
	backgroundScene.add( mesh );
}

function initForegroundScene() {
	foregroundCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 50 );
	foregroundCamera.position.z = 10;
	foregroundCamera.up.set( 0, 1, 0 );
	foregroundCamera.lookAt(new THREE.Vector3(0, 0, 0));

	triangleDestTexture = new THREE.WebGLRenderTarget(
		window.innerWidth,
		window.innerHeight,
		{ minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter}
	);

	for (var i=0; i<2; i++) {
		var bufferTexture = new THREE.WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight,
			{ minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter}
		);
		bufferTextures.push(bufferTexture);
	}

	foregroundScene = new THREE.Scene();

	var triangleShape = new THREE.Shape();
	triangleShape.moveTo(0, 1);
	triangleShape.lineTo(Math.sin(Math.PI * 2 / 3), Math.cos(Math.PI * 2 / 3));
	triangleShape.lineTo(Math.sin(Math.PI * 4 / 3), Math.cos(Math.PI * 4 / 3));

	var geo = new THREE.ShapeBufferGeometry( triangleShape );
	var mat = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'foregroundVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'foregroundFragmentShader' ).textContent
	} );
	triangleMesh = new THREE.Mesh(geo, mat);
	triangleMesh.scale.set(2, 2, 1);

	foregroundScene.add(triangleMesh);
}

function initReverbScene() {
	reverbCamera = new THREE.Camera();
	reverbCamera.position.z = 1;

	reverbScene = new THREE.Scene();

	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	var material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'reverbVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'reverbFragmentShader' ).textContent
	} );

	var mesh = new THREE.Mesh( geometry, material );
	reverbScene.add( mesh );
}

function initTopLevelScene() {
	topLevelCamera = new THREE.Camera();
	topLevelCamera.position.z = 1;

	topLevelScene = new THREE.Scene();

	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	topLevelMaterial = new THREE.MeshBasicMaterial({
		map: bufferTextures[0].texture,
		transparent: true
	});

	var mesh = new THREE.Mesh( geometry, topLevelMaterial );
	topLevelScene.add( mesh );
}

function onWindowResize( event ) {
		renderer.setSize( window.innerWidth, window.innerHeight );
		foregroundCamera.aspect =  window.innerWidth / window.innerHeight ;
		foregroundCamera.updateProjectionMatrix();
		uniforms.u_resolution.value.x = renderer.domElement.width;
		uniforms.u_resolution.value.y = renderer.domElement.height;
		// triangleDestTexture.width = renderer.domElement.width;
		// triangleDestTexture.height = renderer.domElement.height;
		// bufferTextures[0].width = renderer.domElement.width;
		// bufferTextures[0].height = renderer.domElement.height;
		// bufferTextures[1].width = renderer.domElement.width;
		// bufferTextures[1].height = renderer.domElement.height;
}


function animate() {
		requestAnimationFrame( animate );
		render();
}

function render() {
	const historyTexture = bufferTextures[(currentBufferTextureIndex + 1) % 2];
	const destTexture = bufferTextures[currentBufferTextureIndex];
	uniforms.u_time.value += 0.05;
	renderer.clear();
	renderer.render( backgroundScene, backgroundCamera );
	renderer.clearTarget(triangleDestTexture);
	renderer.render( foregroundScene, foregroundCamera, triangleDestTexture );
	uniforms.u_texture_1.value = triangleDestTexture.texture;
	uniforms.u_texture_2.value = historyTexture.texture;
	renderer.clearTarget(destTexture);
	renderer.render( reverbScene, reverbCamera, destTexture);
	topLevelMaterial.map = destTexture.texture;
	renderer.clearDepth();
	renderer.render( topLevelScene, topLevelCamera );

	// triangleMesh.position.setX(Math.sin(uniforms.u_time.value * 0.3));
	triangleMesh.rotateZ(Math.sin(uniforms.u_time.value * -0.0010));
	triangleMesh.scale.set(Math.sin(uniforms.u_time.value * 0.138) * 1.5 + 2, Math.sin(uniforms.u_time.value * 0.284) * 1.5 + 2, 1);

	currentBufferTextureIndex = (currentBufferTextureIndex + 1) % 2;
	topLevelMaterial.map = bufferTextures[currentBufferTextureIndex].texture;
}