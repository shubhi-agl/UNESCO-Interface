var documentIdWithGender = [];
var regionlist = [
    "SDG: Africa (Northern)",
    "SDG: Africa (Sub-Saharan)",
    "SDG: Asia (Central and Southern)",
    "SDG: Asia (Eastern)",
    "SDG: Asia (South-eastern)",
    "SDG: Asia (Southern)",
    "SDG: Asia (Western)",
    "SDG: Europe",
    "SDG: Latin America and the Caribbean",
    "SDG: Northern America",
    "SDG: Oceania",
    "SDG: Oceania (Australia/New Zealand)",
    "SDG: Small Island Developing States",
    "SDG: Western Asia and Northern Africa"
];

function createBarChart(regionMap, currCountry, mData, fData) {
    $("#sub-title").text($("#factor option:selected").html() + ": " + regionMap.region.replace('SDG: ','') );
    $("#head-title").text("Regional Distribution");

    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(d => `<strong>Country: </strong><span class='details'>${getCountryName(d.COUNTRY_NAME)}<br></span><strong>Value: </strong><span class='details'>${d.VALUE}<br></span>`);

    let finalData = []
    let finalDataF = []

    mData.sort((a, b) => (a.COUNTRY_ID > b.COUNTRY_ID) ? 1 : -1)
    mData.forEach(d => {
        if ((Object.keys(regionMap).includes(d.COUNTRY_ID))) {
            finalData.push(d)
        }
    });

    //Preprocess data
    let groupData = [];
    console.log(fData)
    if (fData == undefined) {
        finalData.forEach(elem => {
            groupData.push({key: elem.COUNTRY_ID, values: [{COUNTRY_ID:'Country', VALUE:+elem.VALUE, COUNTRY_NAME: elem.COUNTRY_ID}]})
        });
    } else {
        fData.sort((a, b) => (a.COUNTRY_ID > b.COUNTRY_ID) ? 1 : -1)
        fData.forEach(d => {
            if ((Object.keys(regionMap).includes(d.COUNTRY_ID))) {
                finalDataF.push(d)
            }
        });

        finalData.forEach(elem => {
            groupData.push({key: elem.COUNTRY_ID, values: [{COUNTRY_ID:'Male', VALUE:+elem.VALUE, COUNTRY_NAME: elem.COUNTRY_ID}]})
        });
        finalDataF.forEach(elem => {
            groupData.forEach(d => {
                if (d.key == elem.COUNTRY_ID) {
                    d.values.push({COUNTRY_ID:'Female', VALUE: +elem.VALUE, COUNTRY_NAME: elem.COUNTRY_ID})
                }
            })
        });
    }

    console.log(groupData)

    let margin = {top: 20, right: 65, bottom: 60, left: 100},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;



    let x0  = d3.scaleBand().rangeRound([0, width], .5);
    let x1  = d3.scaleBand();
    let y   = d3.scaleLinear().rangeRound([height, 0]);

    let xAxis = d3.axisBottom().scale(x0)
        .tickValues(groupData.map(d => d.key));

    let yAxis = d3.axisLeft().scale(y);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    let svg = d3.select('#region')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let cNames = groupData.map(d => { return d.key; });
    let rNames = groupData[0].values.map(d => { return d.COUNTRY_ID; });

    x0.domain(cNames);
    x1.domain(rNames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, getMax(groupData)]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(2," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .style('opacity','0')
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight','bold')
        .text("Value");
    svg.call(tip);

    svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

    var slice = svg.selectAll(".slice")
        .data(groupData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", d => { return "translate(" + x0(d.key) + ",0)"; });

    slice.selectAll("rect")
        .data( d => { return d.values; })
        .enter().append("rect")
        .attr("width", x1.bandwidth())
        .attr("x", d => { return x1(d.COUNTRY_ID); })
        .style("fill", d => {
            return color(d.COUNTRY_ID)
        })
        .style('opacity', d => {
            if (d.COUNTRY_NAME == currCountry) {
                return 1
            }
            return .3
        })
        .attr("y", d => { return y(0); })
        .attr("height", d => { return height - y(0); })
        .on("mouseover", d => {
            console.log(d)
            tip.show(d)
            d3.select(this)
                .style("fill", "red")
                .style('stroke-width', .3);
        })
        .on("mouseout", d => {
            tip.hide(d)
            d3.select(this)
                .style("fill", color(d.COUNTRY_ID))
                .style('stroke-width',3);
        })
        .on('click', d => {
            $("#region").hide()
            $("#country").show()
            $("#view").val("Country")
            updateLineChart(d.COUNTRY_ID, d.COUNTRY_NAME )

        });


    slice.selectAll("rect")
        .transition()
        .delay(function (d) {return Math.random()*1000;})
        .duration(1000)
        .attr("y", d => { return y(d.VALUE); })
        .attr("height", d => { return height - y(d.VALUE); });

    svg.append("text")
        .attr("x", -height/2)
        .attr("y", -70).attr("transform", "rotate(-90)")
        .style("font-size", "20px")
        .style("font-family","Arial")
        .style("text-anchor", "middle")
        .text($("#factor option:selected").html());


    svg.append("text")
        .attr("x", width/2)
        .attr("y", height+35)
        .style("font-size", "20px")
        .style("font-family","Arial")
        .style("text-anchor", "middle")
        .text("Country");

    var legend = svg.selectAll(".legend")
        .data(groupData[0].values.map(d => { return d.COUNTRY_ID; }).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
        .style("opacity","0");

    legend.append("rect")
        .attr("x", width+45)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => { return color(d); });

    legend.append("text")
        .attr("x", width + 40)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => {return d; });

    legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

}

function updateBarChart(data) {

    console.log('here')
    let year = $("#year").val();
    var indicator_id = $("#factor").val().split(",")[0];
    var document_id = $("#factor").val().split(",")[1];
    let regionmap = {};
    let currRegion = undefined
    //let document_id = "SDG_REGION";
    barChartLabelRegionDBCall("SDG_REGION", data.id).then(dataSet => {
        dataSet.forEach(row => {
            regionlist.forEach(elem => {
                if(elem == row.REGION_ID.trim()) {
                    currRegion = row.REGION_ID
                }
            })
        });
        barChartLabelCountryDBCall("SDG_REGION", currRegion).then(dataSet2 => {
            regionmap.region = currRegion
            dataSet2.forEach(d => {
                regionmap[d.COUNTRY_ID] = d.REGION_ID
            });
            if (document_id in documentIdWithGender) {
                console.log('shouldnt be here plz')
            } else {
                queue()
                    .defer(d3.csv, 'data/inequality.csv')
                    .await(ready);

                function ready(error, inequalityLabel) {
                    console.log(inequalityLabel)
                    $("#worldMap").empty();
                    $("#region").empty();
                    $(".legend").empty();
                    $(".d3-tip").remove();
                    if (indicator_id.includes("XUNIT") || indicator_id.includes("SchBSP") || indicator_id.includes("NY.GDP") || indicator_id== "200101" || indicator_id === "ROFST.3.F.cp") {
                        //No male or female differentiation
                        genericDBCall(year, indicator_id, document_id).then(dataSet3 => {
                            createBarChart(regionmap, data.id, dataSet3, undefined);
                        });
                    } else {
                        //Male female differention
                        console.log(indicator_id)
                        if (indicator_id !== "ROFST.1.cp" && indicator_id !== "ROFST.2.cp") {
                            genericDBCall(year, indicator_id + ".M", document_id).then(maleData => {
                                genericDBCall(year, indicator_id + ".F", document_id).then(femaleData => {
                                createBarChart(regionmap, data.id, maleData, femaleData);
                                });
                            });
                        } else {
                            console.log(indicator_id.slice(0,7) + ".M" + indicator_id.slice(7))
                            genericDBCall(year, indicator_id.slice(0,7) + ".M" + indicator_id.slice(7), document_id).then(maleData => {
                                genericDBCall(year, indicator_id.slice(0,7) + ".F" + indicator_id.slice(7), document_id).then(femaleData => {
                                createBarChart(regionmap, data.id, maleData, femaleData);
                                });
                            });
                        }
                    }
                }
            }
        });
    });
}

/***
 .on('mouseover',d =>{
            console.log(d)
            tip.show(d)
            d3.select(this)
                .style('opacity', .5)
                .style('stroke-width', .3);
        }).on('mouseout', d =>{
            tip.hide(d)
            d3.select(this)
                .style('opacity', 1)
                .style('stroke-width',3);
        }).on('click', d => {
            $("#region").hide()
            $("#country").show()
            $("#view").val("Country")
            updateLineChart(d)
        });

 const tip = d3.tip()
 .attr('class', 'd3-tip')
 .offset([-10, 0])
 .html(d => `<strong>Value: </strong><span class='details'>${d.VALUE}<br></span>`);

 **/
function getMax(data) {
    var myMax = 0
    data.forEach(elem => {
        elem.values.forEach(val => {
            if (myMax < val.VALUE) {
                myMax = val.VALUE
            }
        })
    });
    console.log(myMax)
    return myMax;
    //d3.max(groupData, function(key) { return d3.max(key.values, d => { console.log(d.VALUE); return d.VALUE; }); })
}
//Used https://bl.ocks.org/LyssenkoAlex/21df1ce37906bdb614bbf4159618699d as a template for this chart