var Demonixis = window.Demonixis || {};
Demonixis.GraphicsHelper = Demonixis.GraphicsHelper || {};

Demonixis.GraphicsHelper.repeatTexture = function(texture, size) {
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.x = size.x;
	texture.repeat.y = size.y;
	return texture;
};

Demonixis.GraphicsHelper.createCube = function(material, position, size, scale, rotation) {
	var object3D;
	var oMaterial = material || new THREE.MeshBasicMaterial({
		color: 0x0000AA
	});
	var oPosition = position || {
		x: 1,
		y: 1,
		z: 1
	};
	var oSize = size || {
		x: 50,
		y: 50,
		z: 50
	};
	var oScale = scale || {
		x: 1,
		y: 1,
		z: 1
	};
	var oRotation = rotation || {
		x: 0,
		y: 0,
		z: 0
	};

	object3D = new THREE.Mesh(new THREE.BoxGeometry(oSize.x, oSize.y, oSize.z), oMaterial);
	object3D.scale.set(oScale.x, oScale.y, oScale.z);
	object3D.position.set(oPosition.x, oPosition.y, oPosition.z);
	object3D.rotation.set(oRotation.x, oRotation.y, oRotation.z);
	object3D.overdraw = true;

	return object3D;
};