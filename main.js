var width = window.outerWidth,
    height = window.outerHeight;

var randomX = d3.random.normal(width / 2, 100),
    randomY = d3.random.normal(height / 2, 100);

var data = d3.range(1000).map(function() {
  return [
    randomX(),
    randomY()
  ];
});

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([height, 0]);

var color = d3.scale.linear()
    .domain([0, Math.max(width, height) / 3.5, Math.max(width, height) / 1.5])
    .range(['white', 'red', 'black']);

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 10]).on("zoom", zoom));

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);

var circle = svg.selectAll("circle")
    .data(data)
  .enter().append("circle")
    .attr("r", 3);

svg.on("mousemove", zoom);
zoom();

function zoom() {
  var mouseCoords = d3.mouse(document.body);
    
  circle
      .attr("transform", transform)
      .attr("fill", function(d){ var c = [x(d[0]), y(d[1])]; return color(distance(c, mouseCoords)); });
}

function distance(c1, c2){
    return Math.sqrt((c2[1] - c1[1])*(c2[1] - c1[1]) + (c2[0] - c1[0])*(c2[0] - c1[0]));
}

function transform(d) {
  return "translate(" + x(d[0]) + "," + y(d[1]) + ")";
}