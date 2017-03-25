// TODO: replace timeouts with delays

const url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
const parse = d3.timeParse("%M:%S")
const format = d3.timeFormat("%M:%S")

d3.json(url, (err, data) => {
  if (err !== null) {
    console.error(err)
  }
  else {
    const dataset = data.map(data => {
      data.Time = parse(data.Time) 
      return data
    })
    document.getElementById("chart").onload = makeChart(dataset, 800, 500)
  }
})


const makeChart = function(dataset, width, height) {
  
  const xPadding = 60
  const yPadding = 40

  var minTime = d3.min(dataset, d => d.Time)

  var maxTime = d3.max(dataset, d => d.Time).toString()
  maxTime = new Date(maxTime)
  maxTime.setSeconds(maxTime.getSeconds() + 35)

  const xScale = d3.scaleTime()
                    .domain([ minTime, maxTime ])
                    .range([width - xPadding, xPadding])

  const yScale = d3.scaleLinear()
                    .domain([1, d3.max(dataset, d => d.Place) + 1])
                    .range([yPadding, height - yPadding])

  // Canvas
  var svg = d3.select("#chart")
                .append("div")
                  .attr("id", "chart-container")
                  .style("width", width + "px")
                  .style("height", height + "px")
                .append("svg")                
                  .attr("width", width)
                  .attr("height", height)
  
  var offsetLeft = document.getElementById("chart-container").offsetLeft

  // Background
  svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#EEE")

  // Title
  svg.append("text")
      .text("35 Fastest Times Up Alpe d'Huez")
        .attr("text-anchor", "middle")
        .attr("font-size", 20)
        .attr("transform", "translate(" + width/2 + "," + (yPadding/2 + 10) + ")")
  
  svg.append("text")
      .text("Normalized to 13.8 KM")
        .attr("text-anchor", "middle")
        .attr("font-size", 15)
        .attr("transform", "translate(" + width/2 + "," + (yPadding/2 + 30) + ")")

  // Setting up the axes
  var xAxis = d3.axisBottom(xScale).tickFormat(d => format(d - minTime))

  svg.append("g")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - yPadding) + ")")

  svg.append("text")
        .text("Minutes Behind Fastest Time (MM:SS)")
        .attr("width", width).attr("text-anchor", "middle")
        .attr("transform", "translate("+ ((width - xPadding)/2) + "," + (height - 5)+")")

  var yAxis = d3.axisLeft(yScale)

  svg.append("g")
      .call(yAxis)
      .attr("transform", "translate(" + xPadding + ",0)")

  svg.append("text")
        .text("Ranking")
          .attr("width", height)
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (yPadding/2) + "," +(height/2)+")rotate(-90)")

  // Making a containers for each point
  var points = svg.selectAll("circle")
                    .data(dataset)

  // Adding dots for each point
  points.enter()
          .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.Time))
            .attr("cy", d => yScale(d.Place))
            .attr("r", 4)      
            .attr("fill", d => d.Doping ? "red" : "green")
            .attr("stroke", d => d.Doping ? "red" : "green")
          .on("mouseover", mouseOver)
          .on("mousemove", mouseMove)
          .on("mouseout", mouseOut)

  points.enter().append("g").attr("class", "label")
          .append("text")
            .text(d => d.Name)
              .attr("text-anchor", "end")
              .attr("x", d => xScale(d.Time) - 8)
              .attr("y", d => yScale(d.Place) + 3)
              .attr("font-family", "sans-serif")
              .attr("font-size", "11px")
              .attr("fill", "black");
  
  // Legend
  svg.append("circle")
        .attr("cx", 535)
        .attr("cy", 375)
        .attr("r", 5)
        .attr("fill", "red")
  svg.append("text")
        .text("Doping Allegation")
        .attr("x", 545)
        .attr("y", 379)
  
  svg.append("circle")
        .attr("cx", 535)
        .attr("cy", 400)
        .attr("r", 5)
        .attr("fill", "green")
  svg.append("text")
        .text("No Doping Allegation")
        .attr("x", 545)
        .attr("y", 404)
  
  // Tooltip  
  var tooltip = d3.select("#chart")
                    .append("div")
                      .attr("class", "tooltip")
                      .style("left", (525 + offsetLeft) + "px")
                      .style("top", 300 + "px")

  function mouseOver() {
    tooltip
      .style("display", "inline")
      .transition()
        .duration(100)
        .style("opacity", 1)
  }

  function mouseMove(info) {
    tooltip.html(formatInfo(info))
  }

  function mouseOut() {
    tooltip
      .transition()
        .delay(3000)
        .duration(500)
        .style("opacity", 0)
    
    tooltip
      .transition()
        .delay(3500)
        .style("display", "none")
  }

  function formatInfo(info) {
    let output = info.Name + "<br />" + 
                "Nationality: " + info.Nationality + "<br />" + 
                "Rank: " + info.Place + "<br />" + 
                "Time: " + format(info.Time) + "<br />" +
                "Year: " + info.Year + "<br />"
    if (info.Doping) {
      output += "<br /><a href=\"" + info.URL + "\" target=\"blank\">"+ info.Doping +"</a>"

    }
    return output
  }
}



