let planet_data;
let planet_data1;

const totalMass = 26.66698;
const totalRadius = 203274;

var startYear = 1995;
var endYear = 2023;
var distance = 60;
var planetType_selected = "all";

var from_distance = 0;
var to_distance = 60;


document.addEventListener("DOMContentLoaded", function () {
    
    Promise.all([
        d3.csv("data/updated_planets.csv", (d) => {
            return {
                name: d.name,
                distance: +d.distance,
                stellar_magnitude: +d.stellar_magnitude,
                planet_type: d.planet_type,
                discovery_year: d.discovery_year,
                mass_multiplier: +d.mass_multiplier,
                mass_wrt: (d.mass_wrt == "Earth") ? (0.0597) : (18.981),
                radius_multiplier: +d.radius_multiplier,
                radius_wrt: (d.radius_wrt == "Earth") ? (6378.1) : (69911),
                orbital_radius: +d.orbital_radius,
                orbital_period: +d.orbital_period,
                eccentricity: +d.eccentricity,
                detection_method: d.detection_method,
            };
          }),
    ]).then(function (values) {
        //save our data
        planet_data = values[0];
        planet_data1 = values[0];
        //console.log(planet_data);
        
        drawChart(planet_data, planetType_selected, startYear, endYear, from_distance, to_distance);
    });
});

function drawChart(planet_data, planetType_selected, startYear, endYear, from_distance, to_distance){
    //clear old chart 
    d3.selectAll("#winArea > *").remove();
    
    // console.log("trace:drawChart()");
    // console.log(planetType_selected);

    //filtering data based on the filters applied from Control Panel
    if(planetType_selected === "all"){
        const pt = planet_data1.filter((d) => d.distance >= from_distance && d.distance <= to_distance && d.discovery_year >= startYear && d.discovery_year <= endYear);
        planet_data = pt;
    }
    else{
        const pt = planet_data1.filter((d) => d.planet_type === planetType_selected && d.distance >= from_distance && d.distance <= to_distance && d.discovery_year >= startYear && d.discovery_year <= endYear);
        planet_data = pt;
    }

    //adding margin
    let margin = { top: 10, right: 90, bottom: 200, left: 60 };
    const width = 1600 - margin.right - margin.left;
    const height = 1000 - margin.top - margin.bottom;

    //adding svg
    const svg = d3
        .select("#winArea")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //adding x scale
    const xScale = d3.scaleLinear()
            .domain([startYear,endYear])
            .range([0, width]);

    //appending x scale
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .transition()
        .duration(300)
        .ease(d3.easeLinear)
        .call(d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
        .ticks(endYear-startYear));
        
    //adding y scale
    const yScale = d3.scaleLinear()
        .domain([from_distance,to_distance])
        .range([height, 0]).nice();
        
    //appending y scale
    svg.append("g")
    .transition()
    .duration(300)
    .ease(d3.easeLinear)
    .call(d3.axisLeft(yScale));

    //adding scale for transitioning planet radius to a smaller proprtion so that it can be displayed
    const rScale = d3.scaleSqrt()
        .domain(d3.extent(planet_data, d => d.radius_multiplier * d.radius_wrt))
        .range([20, 40]);

    //adding color scale based on planet type
    const cScale = d3.scaleOrdinal()
        .domain(["Terrestrial", "Gas Giant", "Neptune-like", "Super Earth", "Unknown"])
        .range(["#D2691E", "#ffa500", "#ADD8E6", "#008000", "#808080"]);

    // Add x axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height +50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .text("Year Found");

    //adding y axis label
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", - 50)
        .attr("transform", `rotate(-90)`)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .text("Distance (light years)");


    //adding tooltip
    const tooltip = d3.select("body")
        .append("g")
        .attr("class", "tooltip")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("color", "black");

    // Create bubble chart
    const bubbles = svg.selectAll("circle")
        .data(planet_data)
        .join("circle")
        .attr("cx", d => xScale(d.discovery_year))
        .attr("cy", d => yScale(d.distance))
        .attr("r", d => rScale(d.radius_multiplier * d.radius_wrt))
        .attr("fill", d => cScale(d.planet_type))
        .attr("opacity", d => 1 - (d.stellar_magnitude/16))
        .attr("stroke", "white")
        .on("mouseover", (event, d) => {
            tooltip.html(`<strong>${d.name}</strong><br>
            Planet Type: ${d.planet_type}<br>
            Discover Year: ${d.discovery_year}
            Distance from Earth: ${d.distance}<br>
            Stellar Magnitude: ${d.stellar_magnitude}<br>
            Mass : ${(d.mass_multiplier * d.mass_wrt).toFixed(3)} x 10<sup>27</sup> kg<br>
            Radius: ${(d.radius_multiplier * d.radius_wrt).toLocaleString()} km<br>
            Detection Method: ${d.detection_method}`)
            .style("opacity", 1)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
        })
        .on("mouseout", (event, d) => {
            tooltip.style("opacity", 0);
        });

    //adding transitions
     bubbles.transition().duration(300).ease(d3.easeLinear).attr("r", d => rScale(d.radius_multiplier * d.radius_wrt) * 1.5)
        .transition().duration(300).ease(d3.easeLinear).attr("r", d => rScale(d.radius_multiplier * d.radius_wrt));

    //adding label as name of the planet just above the planet
    svg.selectAll("label")
        .data(planet_data)
        .join("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.discovery_year)-20 )
        .attr("y", d => yScale(d.distance) - rScale(d.radius_multiplier * d.radius_wrt) -5)
        .style("fill", "white")
        .text(d => d.name);

    // Add pie charts to the bubbles
    //reference:
    //https://observablehq.com/@analyzer2004/bubble-pie-chart
    // https://d3-graph-gallery.com/graph/pie_changeData.html

    //adding the doughnut chart on top of the buuble
    svg.selectAll("donut")
        .data(planet_data)
        .join("g")
        .attr("transform", d => `translate(${xScale(d.discovery_year)}, ${yScale(d.distance)})`)
        .each( function(d){
            const d_data = d3.pie().sort(null).value(d => d.value);
            const radius_d = rScale(d.radius_multiplier * d.radius_wrt);

            //creating data required -> mass/radius as percentage of mass/radius of all the planets in our solar system
            var data2 = [{label: "Mass", name: d.name, value: ((d.mass_multiplier*d.mass_wrt)/ totalMass)*100},
             {label: "Radius", name: d.name, value: ((d.radius_multiplier*d.radius_wrt)/totalRadius)*100}];
            const colorScale_d = d3.scaleOrdinal().domain([0,1]).range(["red", "purple"]);

            d3.select(this)
                .selectAll("path")
                .data(d_data(data2))
                .join("path")
                .attr("d", d3.arc().innerRadius(radius_d/2).outerRadius(radius_d/1.2))
                .attr("fill", d => colorScale_d(d.value))
                .attr("stroke", "white")
                .on("mouseover", (event, d) => {
                    d3.select(this).attr("stroke-width", 2);

                    tooltip.html(`<strong>${d.data.name} ${d.data.label}</strong> is 
                        <b>${d.value.toFixed(2)}% </b><br> of the total ${d.data.label} of planets in our solar system.<br>`)
                        .style("opacity", 1)
                        .style("top", event.pageY - 10 + "px")
                        .style("left", event.pageX + 10 + "px");
                    })
                .on("mouseout", (event, d) => {
                    d3.select(this).attr("stroke-width", 1);
                    tooltip.style("opacity", 0);
                });
        });

    // Adding legend
    const bubble_legend = svg.append("g")
        .attr("transform", `translate(${width - 28}, ${height - 100})`);

    const bubble_type = bubble_legend.selectAll("g")
        .data(cScale.domain())
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);
        
    // adding key circles to the legend
    bubble_type.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 5)
        .attr("fill", cScale);

    // adding text to the legend
    bubble_type.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .style("fill", "white")
        .text(d => d);
}


//function to update the chart based on planet type selected
function getPlanetType(){
    planetType_selected = document.getElementById("planetType").value;
    //console.log(planetType_selected);
    drawChart(planet_data1, planetType_selected, startYear, endYear, from_distance, to_distance);
}


// function to update the chart based on date range selected
function getYear(){
    const slider1 = document.getElementById("startYear");
    const slider2 = document.getElementById("endYear")
    var startYear1 = parseInt(document.getElementById("startYear").value);
    var endYear1 = parseInt(document.getElementById("endYear").value);
    //if date is right filter the required data
    if (startYear1 <= endYear1) {
        startYear = startYear1;
        endYear = endYear1;
        
        drawChart(planet_data1, planetType_selected, startYear, endYear, from_distance, to_distance);
      }
      //else give a alert and reset the values
      else{
        alert("Start Year cannot be greater than end Year.");
        //resetting the values to the last value
        startYear1 = startYear;
        endYear1 = endYear;

        slider1.value = startYear;
        slider2.value = endYear;
      }
}

//function to update the chart based on distance range selected
function getDistance(){

    const slider1 = document.getElementById("to_input");
    const slider2 = document.getElementById("from_input")
    var to_distance1 = parseInt(document.getElementById("to_input").value);
    document.getElementById('character-name1').textContent=to_distance1;

    var from_distance1 = parseInt(document.getElementById("from_input").value);
    document.getElementById('character-name2').textContent=from_distance1;

    //if distance is right filter the required data
    if (from_distance1 <= to_distance1) {
        to_distance = to_distance1;
        from_distance = from_distance1;
        drawChart(planet_data1, planetType_selected, startYear, endYear, from_distance, to_distance);
      }
      //else give a alert and reset the values
      else{
        alert("From distance cannot be greater than end distance.");
        //resetting the values to the last value
        to_distance1 = to_distance;
        from_distance1 = from_distance;
        document.getElementById('character-name1').textContent=to_distance1;
        slider1.value = to_distance;
        document.getElementById('character-name2').textContent=from_distance1;
        slider2.value = from_distance;
      }
}