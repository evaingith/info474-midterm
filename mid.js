'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  const colors = {
    "Bug": "#547AAB",
    "Dark": "#A8CBE7",
    "Dragon": "#E79142",
    "Electric": "#F8BE82",
    "Fairy": "#A57CA0",
    "Fighting": "#62974A",
    "Fire": "#9ACC7C",
    "Flying": "#CEA4D2",
    "Ghost": "#B39A44",
    "Grass": "#EDD171",
    "Ground": "#5A9598",
    "Ice": "#8DBAB8",
    "Normal": "#D66064",
    "Poison": "#EEA39F",
    "Psychic": "#7A7078",
    "Rock": "#B3B2B7",
    "Steel": "#C8779D",
    "Water": "#F8C3DD"
  }

  window.onload = function() {
    svgContainer = d3.select('body')
                     .append('svg')
                     .attr('width', 1500)
                     .attr('height', 900);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("data/pokemon.csv")
      .then((data) => makeScatterPlot(data));  
  }
 
  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable

    // get arrays of fertility rate data and life Expectancy data
    let defense_data = data.map((row) => parseFloat(row["Sp. Def"]));
    let total_data = data.map((row) => parseFloat(row["Total"]));

    // find data limits
    let axesLimits = findMinMax(defense_data, total_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '20pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 800)
      .attr('y', 850)
      .style('font-size', '15pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 450)rotate(-90)')
      .style('font-size', '15pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    // append data to SVG and plot as points
    var dots = svgContainer.selectAll('.dot')
                           .data(data)
                           .enter()
                           .append('circle')
                           .attr('cx', xMap)
                           .attr('cy', yMap)
                           .attr('r', 10)
                           .attr('fill', function(d) { return colors[d['Type 1']]}) 
                           .attr('stroke', "#4E79A7")
                           // add tooltip functionality to points
                           .on("mouseover", (d) => {
                            div.transition()
                               .duration(200)
                               .style("opacity", 0.8);
                            div.html(d.Name + "<br/>" + 
                                      d["Type 1"] + "<br/>" + 
                                      d["Type 2"])
                               .style("left", (d3.event.pageX+10) + "px")
                               .style("top", (d3.event.pageY - 30) + "px");
                            })
                           .on("mouseout", (d) => {
                            div.transition()
                               .duration(500)
                               .style("opacity", 0);
                           });

    var thisL = document.querySelector('#legendary select');
    var thisG = document.querySelector('#generation select');

    var dropDownOne = d3.select("#legendary")
                        .append("select")
                        .attr("name", "legendary");
    var keysLegendary = d3.map(data, function(d){return d.Legendary;}).keys()
    keysLegendary[keysLegendary.length] = 'all';
    dropDownOne.selectAll("option")
               .data(keysLegendary)
               .enter()
               .append("option")
               .text(function (d) { return d;})
               .attr("value", function (d) { return d; });

    dropDownOne.on("change", function() {
      thisL = this;
      filterForDropdown(dots, thisL, thisG);
    });   

    var dropDownTwo = d3.select("#generation")
                        .append("select")
                        .attr("name", "generation");
    var keysGeneration = d3.map(data, function(d){return d.Generation;}).keys()
    keysGeneration[keysGeneration.length] = 'all';
    dropDownTwo.selectAll("option")
               .data(keysGeneration)
               .enter()
               .append("option")
               .text(function (d) { return d;})
               .attr("value", function (d) { return d; });
    
    dropDownTwo.on("change", function() {
      thisG = this;
      filterForDropdown(dots, thisL, thisG);
    });  
       
    // var color = d3.scaleOrdinal(d3.schemeCategory20b);
    // console.log(color);
    // console.log(typeof(color));
    
    var legendRectSize = 20;                                
    var legendSpacing = 5;        

    var legend = svgContainer.selectAll('.legend')               
    .data(Object.keys(colors))                                  
    .enter()                                            
    .append('g')                                       
    .attr('class', 'legend')                         
    .attr('transform', function(d, i) {            
      var height = legendRectSize + legendSpacing;          
      var offset =  height * Object.values(colors).length;  
      var horz = 70 * legendRectSize;                       
      var vert = 650 + i * height - offset;                 
      return 'translate(' + horz + ',' + vert + ')';        
    });                                                

  legend.append('rect')                                     
    .attr('width', legendRectSize)                     
    .attr('height', legendRectSize)                         
    .style('fill', function(d, i) { return Object.values(colors)[i]})   
    
  legend.append('text')                                 
    .attr('x', legendRectSize + legendSpacing)          
    .attr('y', legendRectSize - legendSpacing)             
    .text(function(d) { return d; });  

  }

  
  function filterForDropdown(dots, thisL, thisG) {
    var all = 'all';
    if (thisL == null) {
      thisL = document.querySelector('#legendary select');;
    }
    if (thisG == null) {
      thisG = document.querySelector('#generation select');;
    } 

    var selectedL = thisL.value;
    var displayOthersL = thisL.checked ? "inline" : "none";
    var displayL = thisL.checked ? "none" : "inline";

    var selectedG = thisG.value;
    var displayOthersG = thisG.checked ? "inline" : "none";
    var displayG = thisG.checked ? "none" : "inline";

    dots.filter(function(d) {return selectedG != d.Generation || selectedL != d.Legendary;})
        .attr("display", displayOthersL && displayOthersG);
              
    dots.filter(function(d) {return ((selectedG == d.Generation || selectedG == all) && (selectedL == d.Legendary || selectedL == all)) ;})
        .attr("display", displayL && displayG);
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 15, limits.xMax + 15]) // give domain buffer room
      .range([50, 1400]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 800)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 50, limits.yMin - 50]) // give domain buffer
      .range([50, 800]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

})();
