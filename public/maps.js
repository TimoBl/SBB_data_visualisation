// <-- contains the code for the two maps ->


// global variables
var map_width = 900, map_height = 500
var municipalities, cantons, lakes
var tooltip_values = {}

var projection = d3.geo.albers()
    .rotate([0, 0])
    .center([8.3, 46.8])
    .scale(14000)
    .translate([map_width / 2, map_height / 2])
    .precision(.1);
 
var path = d3.geo.path()
    .projection(projection)


// gradient from https://colordesigner.io/gradient-generator
var gradient = "#ffc9c9,#ff9797,#ff6464,#ff3232,#fe0000,#cc0000".split(",")
var scale_steps = {"GA_pro_100": 1, "HF_pro_100": 6, "GA_pro_stop": 5, "HF_pro_stop": 25}


// loads the geo data and initalize map
function get_map_data(geo_path, gemeinde_path){
  d3.json(geo_path, function(data) {
    municipalities = topojson.feature(data, data.objects.municipalities).features
    cantons = topojson.feature(data, data.objects.cantons).features
    lakes = topojson.feature(data, data.objects.lakes).features

    // load the data with the abonnement values
    d3.csv(gemeinde_path, function(data) {
      gemeinde_data = data

      // we initialite the map only after it's loaded so we don't see a black map
      initialize_map("#map1")
      initialize_map("#map2")

      // update the color map
      update_map("#map1", "GA_pro_100")
      update_map("#map2", "GA_pro_stop")
    })
  })
}

// we convert data to a dictionary based on selection
function filter_data(data, value){
  var gemeinde = {}
  
  for (var i = 0; i < data.length; i++){
    // we add the object to our dictionary
    gemeinde[data[i]["BFSNR"]] = parseFloat(data[i][value])
  }

  return gemeinde
}


// tooltip outpt
function get_gemeinde_info(d, value){
  var val = tooltip_values[value] // a bit hacky but we create a dictionary which stores the values for the tooltips
  var gemeinde = gemeinde_data.find(x => x.BFSNR == d.id)
  
  if (gemeinde != null){
      return "<b>" + gemeinde["gemeindename"] + "</b><br>" + parseFloat(gemeinde[val]).toFixed(1).toString() + " " +  val.replaceAll("_", " ")
  } else {
      return "missing"
  }
  
}


// used to create the swiss map
function initialize_map(id){
  // select map
  var svg = d3.select(id).append("svg")
    .attr("width", map_width)
    .attr("height", map_height)

  // add tooltip
  tooltip = d3.tip()
              .attr('class', 'd3-tip')
              .attr("id", "tool-" + id.substring(1))
              .offset([-5, 0])
              .html(d => get_gemeinde_info(d, "tool-" + id.substring(1)))

  // display the municipalities
  svg.append("g")
    .attr("class", "municipalities")
    .selectAll("path")
    .data(municipalities)
    .enter()
    .append("path")
    .attr("id", function(d){ return d.id })
    .attr("d", path)
    .on('mouseover', tooltip.show)
    .on('mouseout', tooltip.hide)

  // highlight the cantons
  svg.append("g")
    .attr("class", "cantons")
    .selectAll("path")
    .data(cantons)
    .enter()
    .append("path")
    .attr("id", function(d){ return d.id })
    .attr("d", path)

  // add lakes 
  svg.append("g")
    .attr("class", "lakes")
    .selectAll("path")
    .data(lakes)
    .enter()
    .append("path")
    .attr("id", function(d){ return d.id })
    .attr("d", path)


  // add color scale 
  var color_scale = svg.append("g")
                  .attr("class", "colorScale")
                  .selectAll("rect")
                  .data(gradient)
                  .enter()

  color_scale.append("rect")
      .attr("width", 15)
      .attr("height", 40)
      .attr("x", 0)
      .attr("y", function(d, i) {return (gradient.length - i) * 40})
      .attr("fill",  function(d) {return d})

  color_scale.append("text")
      .attr("x", 20)
      .attr("y", function(d, i) {return (gradient.length - i + 1) * 40})
      .attr("fill", "#6e6e6e")
      .style("font-size", "16px")
      .text("helloooo")

  svg.call(tooltip)
}



// update the map to the new informations
function update_map (id, value) {
  // select data
  selection = filter_data(gemeinde_data, value)

  // select map
  var svg = d3.select(id)

  // select tooltip
  var tooltip = d3.select()
  var name = "tool-" + id.substring(1)
  tooltip_values[name] = value

  // update map color
  svg.selectAll(".municipalities")
    .selectAll("path")
    .attr("fill", function(d) { return get_color(value, selection[d.id]) })

  // update scale number
  svg.selectAll(".colorScale")
    .selectAll("text")
    .text(function(d, i) { 
      if (i+1 === gradient.length){
        return (i * scale_steps[value]).toString() + " " + value.replaceAll("_", " ")
      } else {
        return (i * scale_steps[value]).toString()
      }
  })
}


// get color based on value and scale
function get_color(value, n) {
  if (n != null) {
    var i = Math.min(parseInt(n / scale_steps[value]), gradient.length - 1)
    var i = Math.max(Math.min(i, gradient.length - 1), 0)
    return gradient[i]
  } 
  return "#FFFFFF"
}


