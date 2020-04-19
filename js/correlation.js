var margin = {top: 50, right: 75, bottom: 75, left: 75}
  , width = 500 - margin.left - margin.right
  , height = 500 - margin.top - margin.bottom;

function convert_row(d){
    cols_c = Object.keys(d);
    obj_c = {Variables: d.Variables};
    for (c in cols_c){
        if (c > 0){
            obj_c[cols_c[c]] = +d[cols_c[c]];
        }
    }
    return obj_c;
}

function convert_scatter_row(d){
    cols = Object.keys(d);
    // console.log(d['Indicator1']);
    obj = {Countries: d.Countries};
    // console.log(obj);

    for (c in cols){
        if (c > 0){
            obj[cols[c]] = +d[cols[c]];
        }
    }
    return obj;
}

d3.dsv(",", "../data/dummy_data_cor.csv", convert_row)
    .then(function(data){
        raw_data = data;
        //indicator_data = d3.nest().key(function(d) {return d.Variables; }).entries(raw_data)
        cols_c.splice(cols_c.indexOf('Variables'), 1);
        d3.dsv(",", "../data/dummy_data.csv", convert_scatter_row)
            .then(function(data){
                scatter_data = data;

        add_select_box(cols_c);
        for (col in cols_c){
            add_bar_chart(cols_c[col])
        }
        // add_bar_chart(cols_c);
        add_scatter_chart("Indicator1","Indicator2");
        });
    });

function add_select_box(){
    d3.select("#selector")
        .append("text")
        .attr("font-size", "12px")
        .text("Select Indicator: ");
        // .append("select", "svg")

        var selector = d3.select("#selector")
        .append("select")
        .attr("id", "dropselector")
        .style('margin-top','20px')
        .selectAll("option")
        .data(cols_c)
        .enter().append("option")
        .text(function(d) { return d; })
        .attr("value", function (d, i) {
            return d;
        });

    d3.select("#selector").property("selectedIndex", cols_c);
    d3.select("#selector")
        .on("change", function(d) {
            var selected = d3.select("#dropselector").node().value;
            change_chart(selected);
    })
}
function change_chart(indicator){
    d3.selectAll(".barchart").remove();
    add_bar_chart(""+indicator);
}



var svg_b = d3.select("#correlationChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

function add_bar_chart(target){
    console.log(target);
    console.log(raw_data);

    svg_bar = svg_b.append("g")
        .attr("class", "barchart")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var barPadding = 0.25;
    yScale = d3.scaleLinear().range([height, 0]),
    xScale = d3.scaleBand().range([0, width]).padding(barPadding);

    xScale.domain(raw_data.map(function(d){return d.Variables; }));
    yScale.domain([0, 1]);

    svg_bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg_bar.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg_bar.selectAll("rect")
         .data(raw_data)
         .enter().append("rect")
         .attr("class", "bar")
         .attr("fill", "steelblue")
         .attr("x", function(d) { return xScale(d.Variables); })
         .attr("y", function(d) { return yScale(d[target]); })
         .attr("width", function(d) { return xScale.bandwidth(); })
         .attr("height", function(d) {return yScale(1-d[target]); })
         .on('click', function(d){onMouseClick(target, d.Variables)});

    svg_bar.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .attr("font-size", "15px")
      .style("text-anchor", "middle")
      .text("Correlation Value");

    svg_bar.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.bottom/2) + ")")
      .style("text-anchor", "middle")
      .attr("font-size", "15px")
      .text("Variables");

}

//Scatter Plot
function onMouseClick(x, y){
    d3.selectAll(".bubblechart").remove();
    add_scatter_chart(x,y);
}
var svg_scatter = d3.select("#scatterChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);


function add_scatter_chart(x,y){

    var svg = svg_scatter.append("g")
                        .attr("class", "bubblechart")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    yScale = d3.scaleLinear().range([height, 0]),
    xScale = d3.scaleLinear().range([0, width]);

    xScale.domain([0, d3.max(scatter_data, function(d){return d[x]; })]);
    yScale.domain([0, d3.max(scatter_data, function(d) { return d[y]; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return "Country: "+d.Countries+"<br/>Indicator Value: "+d.Variables; });
    svg_scatter.call(tip);


    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg.append('g')
        .selectAll("dot")
        .data(scatter_data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d[x]); } )
        .attr("cy", function (d) { return yScale(d[y]); } )
        .attr("r", function(d){return d["Population"]/1000})
        .style("fill", "maroon")

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .attr("font-size", "15px")
      .style("text-anchor", "middle")
      .text("");

}