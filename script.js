// render pie in javascript
d3.json('newnewdata.json', function (jsondata) {

    var verblabel = 'вернуться'
    var verbdata = jsondata[0][verblabel]

    d3.selectAll('.verblabel').text(verblabel)
    d3.select('#windowsize').text(1)
    d3.selectAll('#prep').text('...')

    var allPrepLabels = new Set();
    var allVerbLabels = Object.keys(jsondata[0])

    // sort verbs
    allVerbLabels.sort(function (a, b) {
        return a.localeCompare(b);
    })
    // add the options to the button
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allVerbLabels)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    $("#selectButton").val(verblabel);

    // set the dimensions and margins of the graph
    var width = 450
    height = 450
    margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // set the color scale
    var color = d3.scaleOrdinal()
        .domain(allPrepLabels)
        .range(d3.schemeTableau10);

    draw_pie(verblabel, verbdata)

    // slider
    var sliderStep = d3
        .sliderBottom()
        .min(1)
        .max(4)
        .width(120)
        .tickFormat(d3.format('.1'))
        .ticks(4)
        .step(1)
        .default(1)
        .on('onchange', val => {
            var windowsize = val - 1
            d3.select('#windowsize').text(val)
            d3.selectAll('.sentence').remove()
            var selectedVerb = d3.select('#selectButton').property("value")
            var piedata = jsondata[windowsize][selectedVerb]
            draw_pie(selectedVerb, piedata)
        });

    var gStep = d3
        .select('div#slider-step')
        .append('svg')
        .attr('width', 175)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gStep.call(sliderStep);

    // select button
    d3.select("#selectButton").on("change", function (d) {
        // recover the option that has been chosen
        var selectedVerb = d3.select(this).property("value")
        var windowsize = sliderStep.value() - 1
        // run the updateChart function with this selected option
        d3.selectAll('.verblabel').text(selectedVerb)
        d3.selectAll('#prep').text('...')
        d3.selectAll('.sentence').remove()
        var piedata = jsondata[windowsize][selectedVerb]
        if (Object.entries(piedata).length === 0) {
            draw_pie(selectedVerb, false)
        } else {
            draw_pie(selectedVerb, piedata)
        }
    })
    function draw_pie(verblabel, verbdata) {
        if (verbdata === false) {
            data = { "No prepositions in specified window": 1 }
        } else {
            var data = verbdata.counts
        }
        d3.selectAll(".svgclass").remove()
        // append the svg object to the div called 'my_dataviz'
        var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr('class', 'svgclass')
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .value(function (d) { return d.value; })
        var data_ready = pie(d3.entries(data))
        // Now I know that group A goes from 0 degrees to x degrees and so on.

        // shape helper to build arcs:
        var arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(radius)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        var slices = svg
            .selectAll('mySlices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', function (d) { return (color(d.data.key)) })
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)
        
        slices.on('mouseover', function (d) {
            d3.selectAll('.sentence').remove()
            slices.style('stroke-width', '2px').style('opacity', .7)
            d3.select(this).style('stroke-width', '5px').style('opacity', 1)
            var sentences = verbdata['sentences'][d.data.key]
            d3.selectAll('#prep').text(d.data.key)
            sentences.forEach(function (sent) {
                d3.select('#sentences')
                    .append('p')
                    .attr('class', 'sentence')
                    .text(sent)
            })
        })
        // Now add the annotation. Use the centroid method to get the best coordinates
        svg
            .selectAll('mySlices')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function (d) { return d.data.key + ' (' + d.data.value + ')' })
            .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
            .style("text-anchor", "middle")
            .style("font-size", 17)

    }
})