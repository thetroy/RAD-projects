var XXX  = 0;
var zeroQ = new THREE.Quaternion(0,0,0,1);

Myo.on('orientation', function(quat){
	if (XXX == 0) {
		console.log(myo.direction);
		zeroQ = new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
		zeroQ.inverse();
		XXX = 1;
		return;
	}
	var q = new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w)
	var xVec = new THREE.Vector3(-1, 0, 0);
	xVec.applyQuaternion( q );
	xVec.applyQuaternion( zeroQ );
	if (myo.direction == 'toward_elbow') {
		xVec.z =  -xVec.z
	}
	this.trigger('vector', xVec);
})

var gridSize = 0.2;
Myo.on('vector', function(v){

	var x = v.y;
	var y = v.z;

	var getSide = function(x){
		if(x < -gridSize) return 'left';
		if(x > gridSize) return 'right';
		return 'center';
	}

	var getBand = function(y){
		if(y < -gridSize) return 'upper';
		if(y > gridSize) return 'lower';
		return 'center';
	}

	this.trigger('grid', {
		band : getBand(y),
		side : getSide(x)
	});

})
