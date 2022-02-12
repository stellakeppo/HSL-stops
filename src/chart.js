import * as d3module from 'd3';
import { tip as d3tip } from "d3-v6-tip";
import React, { useEffect } from 'react';
import {geoAitoff} from "d3-geo-projection";
import './index.css';


const d3 = {
    ...d3module,
    tip: d3tip
}

function Chart(props){
    const data = props.dataprop;
    const selection2 = []; //an empty array where we can push brushed data
    //console.log(data);
    function showBackBtn(){
        var btn = document.getElementById('backBtn')
        btn.style.display = "block";
    }

    useEffect(() => {
    function drawChart() {


//getting max and min x values
var maxX = d3.max(data, function(d) {
    return d.geometry.coordinates[0];
  });
  var minX = d3.min(data, function(d) {
    //console.log(d.geometry.coordinates[0])
      return d.geometry.coordinates[0];
    })

//getting max and min y values
var maxY = d3.max(data, function(d) {
    return d.geometry.coordinates[1];
  });
  //console.log(maxY);
  var minY = d3.min(data, function(d) {
      return d.geometry.coordinates[1];
    })

// set the dimensions and margins of the graph
const margin = {top: 0, right: 0, bottom: 50, left: 50},
    width = 350 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom;


// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("viewBox", `10 -10 600 600`)
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr('id', 'chart')
    .attr("transform", `translate(${margin.left},${margin.top})`);

//trigger a function with enter. https://stackoverflow.com/questions/40252637/keypress-trigger-a-function-if-specific-pressed
function checkKey(e) {
    var key = e.which || e.keyCode;
    if(key === 13) {
        zooming();
        showBackBtn();
    }
  }
  document.addEventListener("keypress", checkKey);
// read data
//d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_for_density2d.csv").then( function(data) {
    const brush = d3.brush().extent([
        [0, 0],
        [width, height]
      ]); //stay within the chart
      //attach the brush to the chart
      const gBrush = svg.append('g')
      .attr('pointer-events', 'none')
      .attr('class', 'brush').call(brush);
      //brush event inside the first state
      brush.on('end', function(event, d) {
        const selection = event.selection; //the scope of the brush
        d3.selectAll('circle').each(function(d) { //go through the points
            if(selection && y(d.geometry.coordinates[1]) > selection[0][1] && y(d.geometry.coordinates[1]) < selection[1][1] && x(d.geometry.coordinates[0]) > selection[0][0] && x(d.geometry.coordinates[0]) < selection[1][0]) {
              selection2.push(d) //push data to the empty array
              //console.log(selection2);
            }
          })
      });


  // Add X axis
  const x = d3.scaleLinear()
    .domain([minX, maxX])
    .range([ 0,width ]);
    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "axis")
    .call(d3.axisBottom(x)
    //.tickFormat(d3.format("d"))
    .ticks(10)
    .tickSize(-height))
    //adjust tick labels
    .selectAll('text').style('font-size', '0.5em').style('opacity', 0.5);

    //add label
    svg.append("text")
    .text("West to East coordinates")
    .attr("x", width/2.2)
    .attr("y",  height + 30)
    .attr('class', 'axisLabel')
    .attr('fill', 'whitesmoke')
    .style('font-size', '0.4em');


  // Add Y axis
  const y = d3.scaleLinear()
  .domain([minY, maxY])
    .range([height,0]);
    svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y)
    //.tickFormat(d3.format("d"))
    .ticks(10)
    .tickSize(-width))
    //adjust tick labels
    .selectAll('text').style('font-size', '0.5em').style('opacity', 0.5);

    //add label
    svg.append("text")
    .text("South to North coordinates")
    .attr("x",-100)
    .attr("y", height / 2)
    .attr("transform", "translate(-230,120) rotate(-90)")
    .attr('class', 'axisLabel')
    .attr('fill', 'whitesmoke')
    .style('font-size', '0.4em');

    d3.selectAll('g.tick')
          //.select('line')
          .style('stroke-width', 0.1)
          .style('color', 'white')
          .style('opacity', 0.7);

          var tip = d3.tip()
          .attr("class", "d3-tip")
          .offset([-5, 0])
          .html((event, d) => {
              if(d.properties.VERKKO === 1){
                return "Address of the stop: &nbsp;" + d.properties.NIMI2 + '<br>' + "Type of stop: &nbsp;" + "Bus stop";
              }
              if(d.properties.VERKKO === 2){
                return "Address of the stop: &nbsp;" + d.properties.NIMI2 + '<br>' + "Type of stop: &nbsp;" + "Metro stop";
              }
              if(d.properties.VERKKO === 3){
                return "Address of the stop: &nbsp;" + d.properties.NIMI2 + '<br>' + "Type of stop: &nbsp;" + "Tram stop";
              }
              if(d.properties.VERKKO === 4){
                return "Address of the stop: &nbsp;" + d.properties.NIMI2 + '<br>' + "Type of stop: &nbsp;" + "Train stop";
              }
              if(d.properties.VERKKO === 7){
                return "Address of the stop: &nbsp;" + d.properties.NIMI2 + '<br>' + "Type of stop: &nbsp;" + "Ferry stop";
              }
              if(d.properties.VERKKO === 0){
                return "Address of the stop: &nbsp;" + d.properties.NIMI2 + '<br>' + "Type of stop: &nbsp;" + "Unknown type";
              }
        return "Address of the stop: &nbsp;" + d.properties.NIMI2 + '<br>' + "Type of stop: &nbsp;" + d.properties.VERKKO;
          });
          svg.call(tip);
              

  // Prepare a color palette
  var color = d3.scaleLinear()
  .domain([0, 0.1]) // Points per square pixel.
  .range(["#1C1C1C", "#69b3a2"]);
  // compute the density data
  const densityData = d3.contourDensity()
    .x(function(d) { 
        return x(d.geometry.coordinates[0])
    })
    .y(function(d) { 
        return y(d.geometry.coordinates[1]); 
    })
    .size([width, height])
    .bandwidth(10)
    (data)

    var g = svg.append('g')
     // Add dots
     g.append('g')
     .selectAll('circle')
     .data(data)
     .join("circle")
         .attr("cx", function (d) { return x(d.geometry.coordinates[0]); } )
         .attr("cy", function (d) { return y(d.geometry.coordinates[1]); } )
         .attr("r", 1)
         .attr("fill", 'white')
         .attr('opacity', 0.5)
          //tooltip
          .on('mouseover.tip', tip.show, function() {
            d3.select(this)
                .transition()
                .duration('100')
          })
          //highlight color
          .on('mouseover.color', function() {
            d3.select(this).transition().duration('200')
            .style('opacity', 1)
            .attr('r', 2)
            .style("stroke-width", "0.5px")
            .style("stroke", "#1C1C1C")})

          .on('mouseout.tip', tip.hide)
          .on('mouseout.color', function() {
            d3.select(this).transition().duration('200').style('opacity', 0.6)
            .attr('r', 1)
            .style("stroke-width", "0px")});

  // show the shape!
  svg.insert("g", "g")
    .selectAll("path")
    .data(densityData)
    .enter().append("path")
      .attr("d", d3.geoPath())
      .attr("fill", function(d) { return color(d.value); })
//})

// Map and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
  .scale(138000)
  .center([24.915,60.190])
  .translate([width / 2, height / 2]);

// Data and color scale
let mapData = new Map()
// Load external data and boot
Promise.all([
//d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
d3.json("https://raw.githubusercontent.com/tomimick/mapcolorizer/master/data-finland/data/kuntarajat.geojson"),
]).then(function(loadData){
    let topo = loadData[0]

    topo.features = topo.features.filter(function(d){
        console.log(d) ; 
        return d.properties.name=="Helsinki"})
    // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features.filter(function(d){
        //console.log(topo.features.name);
        return topo.features;
    }))
    .join("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("stroke", "whitesmoke")
      .attr('fill', 'none')
      .style('opacity', 0.5)
      .style('stroke-width', 0.5)
      .style('stroke-dasharray',"2,2");
})


/*-----------------------------------------------------*/
/*-----------------------zooming-----------------------*/
/*-----------------------------------------------------*/
function zooming(){
d3.selectAll('circle').remove();
d3.select('g.brush').remove(); //remove old brush while changing the view
d3.selectAll('g.axis').remove();
d3.selectAll('path').remove();
//getting new max and min x values
var newMaxX = d3.max(selection2, function(d) {
    return d.geometry.coordinates[0];
  });
  //console.log(newMaxX);
  var newMinX = d3.min(selection2, function(d) {
    //console.log(d.properties.coordinates);
      return d.geometry.coordinates[0];
    })
//getting max and min y values
var newMaxY = d3.max(selection2, function(d) {
    return d.geometry.coordinates[1];
  });
  var newMinY = d3.min(selection2, function(d) {
      return d.geometry.coordinates[1];
    })
// Add X axis
  const x = d3.scaleLinear()
  .domain([newMinX, newMaxX])
  .range([ 0,width ]);
  svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .attr("class", "axis")
  .call(d3.axisBottom(x)
  .tickFormat(d3.format("d"))
  .ticks(10)
  .tickSize(-height))
  .selectAll('text').style('font-size', '0.5em').style('opacity', 0.5);//adjust tick labels
// Add Y axis
const y = d3.scaleLinear()
.domain([newMinY, newMaxY])
  .range([height,0]);
  svg.append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(y)
  .tickFormat(d3.format("d"))
  .ticks(10)
  .tickSize(-width))
  .selectAll('text').style('font-size', '0.5em').style('opacity', 0.5); //adjust tick labels
  d3.selectAll('g.tick')
          //.select('line')
          .style('stroke-width', 0.1)
          .style('color', 'white')
          .style('opacity', 0.7);
// Prepare a color palette
var color = d3.scaleLinear()
.domain([0, 0.1]) // Points per square pixel.
.range(["#1C1C1C", "#69b3a2"]);
// compute the density data
const densityData = d3.contourDensity()
  .x(function(d) { 
      return x(d.geometry.coordinates[0])
  })
  .y(function(d) { 
      return y(d.geometry.coordinates[1]); 
  })
  .size([width, height])
  .bandwidth(10)
  (selection2)
// show the shape!
svg.insert("g", "g")
.selectAll("path")
.data(densityData)
.enter().append("path")
  .attr("d", d3.geoPath())
  .attr("fill", function(d) { return color(d.value); })
// Add dots
svg.append('g')
.selectAll('circle')
.data(selection2)
.join("circle")
    .attr("cx", function (d) { return x(d.geometry.coordinates[0]); } )
    .attr("cy", function (d) { return y(d.geometry.coordinates[1]); } )
    .attr("r", 1)
    .attr("fill", 'white')
    .attr('opacity', 0.5)
     //tooltip
     .on('mouseover.tip', tip.show, function() {
       d3.select(this)
           .transition()
           .duration('100')
     })
     //highlight color
     .on('mouseover.color', function() {
        d3.select(this).transition().duration('200')
        .style('opacity', 1)
        .attr('r', 2)
        .style("stroke-width", "0.5px")
        .style("stroke", "#1C1C1C")})
    .on('mouseout.tip', tip.hide)
    .on('mouseout.color', function() {
        d3.select(this).transition().duration('200').style('opacity', 0.6)
        .attr('r', 1)
        .style("stroke-width", "0px")});
     
        document.getElementById('backBtn').onclick = function() {
        //return alert('back')
        window.location.reload();
      };
}//end of zoom

}//end of draw chart
drawChart(props);

})

return (
    <>
    <div className='mainContainer'>

        <div>

            <div className='textContainer'>
                <div>
                    <h1>Where can you stop?</h1>
                    <h2>HSL public transport stops in Helsinki</h2>
                    <p>This visualisation shows regional public transportation (HSL) stops around downtown Helsinki and beyond. Both density and individual stops are calculated and visualised based on their coordinates.</p>
                    <div className='line'></div>
                    <p>You can brush datapoints and hit enter to zoom on a specific area or hover them to get more information of each stop.</p>
                    <div className='line2'></div>
                    <div className='linkContainer'><a href='https://www.avoindata.fi/data/en_GB/dataset/hsl-n-joukkoliikenteen-pysakit1'><p style={{opacity:'0.5'}}>Transportation stops data</p></a>
                    <a href='https://github.com/tomimick/mapcolorizer/blob/master/data-finland/data/kuntarajat.geojson'><p style={{opacity:'0.5'}}>Helsinki geodata json</p></a></div>
                </div>
            </div>

            <div id="map"></div>
            <div id="my_dataviz">
                <button id="backBtn">&#8592;</button>
            </div>
            
        </div> 

    </div>
    </>
    
    );
}

export default Chart;