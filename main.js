var width = window.outerWidth,
    height = window.outerHeight;

var randomX = d3.random.normal(width / 2, width / 5),
    randomY = d3.random.normal(height / 2, height / 5);

var data = d3.range(1000).map(function () {
    return [
    randomX(),
    randomY()
  ];
});

var constants = {
    aberration: false,
    speedOfLight: 3,
    thrust: 0.5
};

window.onload = function() {
  var gui = new dat.GUI();
  gui.add(constants, 'aberration');
  gui.add(constants, 'speedOfLight', 0, 5);
  gui.add(constants, 'thrust', 0, 1);
};

var ship = {
    position: {
        x: width / 2,
        y: height / 2
    },
    velocity: {
        x: 0,
        y: 0
    },
    direction: 0
};

var speedOfLight = 3;

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([height, 0]);

var color = d3.scale.linear()
    .domain([-Math.PI / 2, 0, Math.PI / 2])
    .range(['red', 'white', 'blue']);

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    //.call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 10]).on("zoom", render));

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);

var star = svg.selectAll("circle.star")
    .data(data)
    .enter().append("circle")
    .attr('class', 'star')
    .attr("r", 3);

var shipSprite = svg.selectAll('circle.ship')
    .data([JSON.parse(JSON.stringify(ship))]);

shipSprite
    .enter().append('circle')
    .attr('class', 'ship')
    .attr('r', 5)
    .attr('fill', 'green');

function render() {
    star
        .attr('transform', function (d, i) {
            var starX, starY
            if(constants.aberration){
                var c = [d[0], d[1]];
                var dist = distance(c, [ship.position.x, ship.position.y]);
                var lorentz = 1 / Math.sqrt(1 - Math.pow(ship.totalSpeed / constants.speedOfLight, 2));
                var stretchDist = dist*lorentz;


                var starDirection = Math.atan2(ship.position.y - c[1], ship.position.x - c[0]);
                var angleDifference = ship.direction - starDirection;
                angleDifference *= (180 / Math.PI);
                angleDifference = (angleDifference + 180) % 360 - 180;
                angleDifference *= (Math.PI / 180);
                var stretchAngle = Math.atan2(constants.speedOfLight * Math.sin(angleDifference), ship.totalSpeed + constants.speedOfLight * Math.cos(angleDifference));

                var stretchX = ship.position.x - Math.cos(stretchAngle)*stretchDist;
                var stretchY = ship.position.y - Math.sin(stretchAngle)*stretchDist;

                if (i === 0) {
                    console.log(Math.round(d[0]), Math.round(d[1]), Math.round(ship.position.x), Math.round(ship.position.y));
                    //console.log(Math.round(100*ship.velocity.total / speedOfLight)/100, lorentz, Math.round(180*ship.direction/Math.PI), Math.round(180*stretchAngle/Math.PI));
                }
        
                starX = x(stretchX);
                starY = y(stretchY);
            } else {
                starX = x(d[0]);
                starY = y(d[1]);
            }
            return "translate(" + starX + "," + starY + ")";
        })
        .attr("fill", function (d, i) {
            var c = [d[0], d[1]];

            var dist = distance(c, [ship.position.x, ship.position.y]);
            var starDirection = Math.atan2(ship.position.y - c[1], ship.position.x - c[0]);

            var angleDifference = ship.direction - starDirection;
            angleDifference *= (180 / Math.PI);
            angleDifference = Math.abs((angleDifference + 180) % 360 - 180) - 90;
            angleDifference *= (Math.PI / 180);
            var doppler = angleDifference * ship.totalSpeed / constants.speedOfLight;
//            if (i === 0) {
//                console.log(d[0], d[1], ship.position.x, ship.position.y, Math.round(100 * ship.direction / Math.PI) / 100, Math.round(100 * starDirection / Math.PI) / 100, Math.round(100 * angleDifference / Math.PI) / 100);
//            }
            if (i === 0) return 'green';
        
            var normalColor = color(doppler);
            var brightnessAdjustedColor = d3.hsl(normalColor)
            if(doppler < 0) brightnessAdjustedColor = brightnessAdjustedColor.darker(-dist*doppler/50);
            return brightnessAdjustedColor;
        });

    shipSprite
        .attr('transform', function (d) {
            return transform([ship.position.x, ship.position.y]);
        });
}

function distance(c1, c2) {
    return Math.sqrt((c2[1] - c1[1]) * (c2[1] - c1[1]) + (c2[0] - c1[0]) * (c2[0] - c1[0]));
}

function transform(d) {
    var starX = x(d[0]);
    var starY = y(d[1]);
    return "translate(" + starX + "," + starY + ")";
}

$(window).on('keypress', function (e) {
    //    console.log(e.which);
    if (e.which === 115) {
        ship.velocity.y -= constants.thrust;
    }
    if (e.which === 119) {
        ship.velocity.y += constants.thrust;
    }
    if (e.which === 97) {
        ship.velocity.x -= constants.thrust;
    }
    if (e.which === 100) {
        ship.velocity.x += constants.thrust;
    }
});

$('svg').on('mousedown touchmove',function(e){
    var angleToCursor = Math.atan2(ship.position.y - e.pageY, ship.position.x - e.pageX);
    ship.velocity.x -= Math.cos(angleToCursor)*constants.thrust;
    ship.velocity.y += Math.sin(angleToCursor)*constants.thrust;
});

d3.timer(function () {
    ship.direction = Math.atan2(ship.velocity.y, ship.velocity.x);
    ship.totalSpeed = Math.sqrt(Math.pow(ship.velocity.x, 2) + Math.pow(ship.velocity.y, 2));
    if(ship.totalSpeed > constants.speedOfLight){
        ship.totalSpeed = constants.speedOfLight;
        ship.velocity.x = Math.cos(ship.direction)*ship.totalSpeed;
        ship.velocity.y = Math.sin(ship.direction)*ship.totalSpeed;
    }


    ship.position.x += ship.velocity.x;
    ship.position.y += ship.velocity.y;

    render();
});