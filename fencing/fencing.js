var myo = Myo.create();



var getDummyData = function(){
	return _.times(500, function(index){
		return 0
	});
}

var data = {
	x : getDummyData(),
	y : getDummyData(),
	z : getDummyData()
};


var genData = function(){
	return _.map(data, function(vals, key){
		return {
			label : key,
			data : _.map(vals, function(d, index){
				return [index, d]
			})
		}
	})
}

var graph = $.plot('#plot', genData(),{
	series: {shadowSize: 0},
	colors: [ '#04fbec', '#ebf1be', '#c14b2a', '#8aceb5'],
	/*yaxis : {
		min : -3,
		max : 3
	},*/
});

var addData = function(v){
	data.x.shift();
	data.y.shift();
	data.z.shift();

	data.x.push(v.x)
	data.y.push(v.y)
	data.z.push(v.z)
}

myo.on('vector', function(v){
	addData(v);
	graph.setData(genData());
	graph.draw();
});

myo.on('grid', function(grid){

	$('.grid').removeClass('show');

	var gridNumber = 0;
	if(grid.band === 'upper') gridNumber = 1;
	if(grid.band === 'center') gridNumber = 4;
	if(grid.band === 'lower') gridNumber = 7;

	if(grid.side === 'left') gridNumber += 0;
	if(grid.side === 'center') gridNumber += 1;
	if(grid.side === 'right') gridNumber += 2;



	$('#grid' + gridNumber).addClass('show');

})


var	jabState = 'idle'
var	jabMaxAccel = 0
var	jabMinAccel = 0

function setJabState(newState) {
	if (newState != jabState) {
		console.log(jabState + " --> " + newState);
		jabState = newState;
	}
}

function trustDetected(x) {
	setJabState('trusting');
	jabMaxAccel = x
	jabMinAccel = x
	setTimeout(function(){ jabTimeout(); }, 250);
}

function hitStarted() {
	setJabState('hitting');
}

function hitFinished() {
	reportHit(jabMaxAccel - jabMinAccel)
	setJabState('hit');
}

function reportHit() {
	console.log("hit with strength " + jabMaxAccel)
}

function jabTimeout() {
	if (jabState == 'hitting') {
		hitFinished()
	}
	setJabState('idle')
	jabMaxAccel = 0
	jabMinAccel = 0
}

myo.on('accelerometer', function(accel) {
	if (jabState == 'idle' && accel.x > 1.5) {
		trustDetected(accel.x)
	} else if (jabState == 'trusting' || jabState == 'hitting' ) {
		if (accel.x > jabMaxAccel) {
			jabMaxAccel = accel.x;
		}
		if (accel.x < jabMinAccel) {
			jabMinAccel = accel.x;
		}
		if (jabState == 'trusting' && jabMaxAccel - jabMinAccel > 2.5) {
			hitStarted();
		}
	}

});
