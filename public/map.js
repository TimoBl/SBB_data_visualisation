

// return fill for kanton 
function get_kanton(kanton){
  let j = kantons.indexOf(kanton)

  arr = Array(100).fill("white")
  const g = parseInt(kanton_data[j]["GA%"])
  const a = parseInt(kanton_data[j]["HF%"])

  // ga 
  for (var i = 0; i < g; i++){
    arr[i] = "red"
  }

  // hf 
  for (var i = g; i < a + g; i++){
    arr[i] = "#adadad"
  }

  return arr
}


function initialize_kanton_plot(){
  var div = d3.select("#kanton_plot")

  var height = 500
  var width = 300

  var ga_max = d3.max(kanton_data, d => parseFloat(d["GA%"]))
  var hf_max = d3.max(kanton_data, d => parseFloat(d["HF%"]))

  var text_width = 40 // width of text box
  var border_height = 4
  var margin = 30
  var sw = (width - text_width - 2*margin) / (ga_max + hf_max)
  var sh = ((height - border_height*kanton_data.length - margin)/ kanton_data.length)

  var svg = div.append("svg")
              .attr("width", width)
              .attr("height", height)

  // Add x axis (left and right)
  var x1 = d3.scale.linear()
              .domain([ 0, hf_max ])
              .range([ 0, sw * hf_max ])

  var x2 = d3.scale.linear()
              .domain([ 0, ga_max ])
              .range([ 0, sw * ga_max ])

  // Add data
  var bar = svg.selectAll("g")
      .data(kanton_data)
      .enter()
      .append("g")
      .attr("width", width)
      .attr("height", sh)
      .attr("transform", (d, i) => "translate(" + ((sw*hf_max) + margin) + "," + ((sh + border_height) * i + margin)  + ")")

  // Kanton name
  bar.append("text")
    .text(d => d.KANTON)
    .attr("x", text_width/2)
    .attr("y", sh*0.75)
    .attr("width", text_width)
    .attr("height", sh)
    .style("text-anchor", "middle")
    .style("font-size", "16px")

  // add GA to the right
  bar.append("rect")
    .attr("x", text_width)
    .attr("width", (d, i) => x2(d["GA%"]))
    .attr("height", sh)
    .attr("fill", "red")

  // add count
  bar.append("text")
    .text(d => parseFloat(d["GA%"]).toFixed(1))
    .attr("x", (d, i) => text_width + x2(d["GA%"]) + 3)
    .attr("y", sh*0.75)
    .attr("width", sw)
    .attr("height", sh)
    .attr("fill", "red")
    .style("font-size", "16px")

  // add HF to the left
  bar.append("rect")
    .attr("x", (d, i) => -x1(d["HF%"]))
    .attr("width", (d, i) => x1(d["HF%"]) )
    .attr("height", sh)
    .attr("fill", "grey")

  // add count
  bar.append("text")
    .text(d => parseFloat(d["HF%"]).toFixed(1))
    .attr("x", (d, i) => -text_width - x1(d["HF%"]) + 3)
    .attr("y", sh*0.75)
    .attr("width", sw)
    .attr("height", sh)
    .attr("fill", "grey")
    .style("font-size", "14px")

  // add GA and HF name on plot
  svg.append("text")
    .text("GA")
    .attr("text-anchor", "start")
    .attr("x", text_width + (sw*hf_max) + margin)
    .attr("y", margin-10)
    .attr("width", sw)
    .attr("height", sh)
    .attr("font-weight", 500)
    .attr("fill", "black")
    .style("font-size", "17px")

  svg.append("text")
    .text("Halbtax")
    .attr("text-anchor", "end")
    .attr("x", text_width + (sw*hf_max) - 10)
    .attr("y", margin-10)
    .attr("width", sw)
    .attr("height", sh)
    .attr("font-weight", 500)
    .attr("fill", "black")
    .style("font-size", "17px")
}


// creates a bar plot for yearly GA/HF 
function initialize_year_plot() {
  // give selection
  var div = d3.select("#year_plot")
  
  var width = div[0][0].clientWidth
  var height = 500
  var margin = 20

  var svg = div.append("svg")
                .attr("width", width)
                .attr("height", height)

  height = height - 2 * margin

  var ga_ag = year_data.map(a => parseInt(a.GA_AG))
  var hta = year_data.map(a => parseInt(a.HTA_ADT))
  var years = year_data.map(a => parseInt(a.Jahr_An_Anno))


  // x axis 
  var x = d3.scale.linear()
      .domain([ d3.min(years)-1, d3.max(years)+1 ])
      .range([ 0, width ])

  var x_axis = d3.svg.axis()
                   .scale(x)
                   .orient("bottom")
                   .tickValues(years)
                   .tickSize(1)
                   .tickFormat(d3.format(""))

  svg.append("g")
      .attr("transform", "translate(0, " + ((height/2)-10).toString() + ")")
      .call(x_axis)
  

  // top graph GA
  var y1 = d3.scale.linear()
      .domain([ d3.max(ga_ag), d3.min(ga_ag) ])
      .range([ margin, (height/2)-20])

  svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .datum(year_data)
    .attr("d", d3.svg.line()
      .x(d => x(parseInt(d.Jahr_An_Anno)))
      .y(d => y1(parseInt(d.GA_AG)))
      .interpolate("basis") )
  
  // bottom graph HTA
  var y2 = d3.scale.linear()
      .domain([ d3.max(hta), d3.min(hta) ])
      .range([ (height/2) + 20, height])

  var path = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", 1.5)
    .datum(year_data)
    .attr("d", d3.svg.line()
      .x(d => x(parseInt(d.Jahr_An_Anno)))
      .y(d => y2(parseInt(d.HTA_ADT)))
      .interpolate("basis")
      )


    var selectCircle = svg.selectAll(".circle").data(year_data)

    selectCircle.enter().append("circle")
                .attr("class", "circle")
                .attr("r", 3.5)
                .attr("cx", (d, i) => x(parseInt(d.Jahr_An_Anno)))
                .attr("cy", (d, i) => y1(parseInt(d.GA_AG)))
                .attr("fill", "red")

    selectCircle.enter().append("text")
                .text(function(d, i){
                        if (i == 0 || d.Jahr_An_Anno==2019 || d.Jahr_An_Anno==2021) {
                          return parseInt(d.GA_AG / 1000) + "k"
                        } else {
                          return ""
                        }
                      })
                .style("font-size", "14px")
                .attr("x", (d, i) => x(parseInt(d.Jahr_An_Anno)) + 5)
                .attr("y", (d, i) => y1(parseInt(d.GA_AG)) - 5)


  selectCircle.enter().append("circle")
                .attr("class", "circle")
                .attr("r", 3.5)
                .attr("fill", "grey")
                .attr("cx", (d, i) => x(parseInt(d.Jahr_An_Anno)))
                .attr("cy", (d, i) => y2(parseInt(d.HTA_ADT)))

    selectCircle.enter().append("text")
                .text(function(d, i){
                        if (i == 0 || d.Jahr_An_Anno==2019 || d.Jahr_An_Anno==2021) {
                          return (d.HTA_ADT / 1000000).toFixed(1) + "m"
                        } else {
                          return ""
                        }
                      })
                .style("font-size", "14px")
                .attr("x", (d, i) => x(parseInt(d.Jahr_An_Anno)) + 5)
                .attr("y", (d, i) => y2(parseInt(d.HTA_ADT)) + 20)

}