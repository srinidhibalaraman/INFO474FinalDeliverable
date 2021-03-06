// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    updateChart(category);
}

// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        Type: row.Type,
        Occupation: row.Occupation,
        All_workers: +row.All_workers,
        All_weekly: +row.All_weekly,
        M_workers: +row.M_workers,
        M_weekly: +row.M_weekly,
        F_workers: +row.F_workers,
        F_weekly: +row.F_weekly
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 500};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all 538 occupations
var barBand = chartHeight / 112;
var barHeight = barBand * .7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// A map with arrays for each category of letter sets
var jobsMap = {
    'all-jobs': 'MANAGEMENT, BUSINESS, COMPUTATIONAL, ENGINEERING, SCIENCE, SOCIAL SERVICE, LEGAL, EDUCATION, ARTS, HEALTHCARE PROFESSIONAL, PROTECTIVE SERVICE, CULINARY, GROUNDSKEEPING, SERVICE, SALES, OFFICE, AGRICULTURAL, CONSTRUCTION, MAINTENANCE, PRODUCTION, TRANSPORTATION'.split(', '),
    'management': 'MANAGEMENT',
    'business': 'BUSINESS',
    'computational': 'COMPUTATIONAL',
    'engineering': 'ENGINEERING',
    'science': 'SCIENCE',
    'social service': 'SOCIAL SERVICE',
    'legal': 'LEGAL',
    'education': 'EDUCATION',
    'arts': 'ARTS',
    'healthcare': 'HEALTHCARE',
    'protective service': 'PROTECTIVE SERVICE',
    'culinary': 'CULINARY',
    'groundskeeping': 'GROUNDSKEEPING',
    'service': 'SERVICE',
    'sales': 'SALES',
    'office': 'OFFICE',
    'agricultural': 'AGRICULTURAL',
    'production': 'PRODUCTION',
    'transportation': 'TRANSPORTATION'
};

d3.csv('occ_pay_by_gender.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart
    incomes = dataset;
    console.log(incomes);

    var subgroups = [incomes.columns[5], incomes.columns[7]];
    console.log(subgroups);

    var groups = d3.map(incomes, function(d){return(d.Occupation)}).keys()
    console.log(groups);

    xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function(d) { return d.M_weekly; })])
    .range([0, chartWidth]);

    // **** Your JavaScript code goes here ****

    var xAxis = d3.axisTop(xScale).ticks(6).tickFormat(function(d) {
        return '$' + (d);
    })

    var xAxisBottom = d3.axisBottom(xScale).ticks(6).tickFormat(function(d) {
        return '$' + (d);
    })



    // axis
    svg.append('g')
    .attr("transform", "translate(500, 50)")
    .call(xAxis);

    svg.append('g')
    .attr("transform", "translate(500, 4170)")
    .call(xAxisBottom);

    svg.append('text')
    .attr('x', 500)
    .attr('y', 20)
    .attr('fill', 'white')
    .text('Weekly Wage ($1000)');

    var legend = d3.select("#my_dataviz")

// Handmade legend
    legend.append("text").attr('x', 190).attr('y', 100).text('Legend').attr('font-size', '20px').attr('font-weight', 'bold').attr('fill', 'white');
    legend.append("circle").attr("cx",170).attr("cy",130).attr("r", 6).style("fill", "#013F94")
    legend.append("circle").attr("cx",170).attr("cy",160).attr("r", 6).style("fill", "#C7E6F9")
    legend.append("text").attr("x", 190).attr("y", 130).text("Male Workers").style("font-size", "15px").attr("alignment-baseline","middle").attr('fill', 'white')
    legend.append("text").attr("x", 190).attr("y", 160).text("Female Workers").style("font-size", "15px").attr("alignment-baseline","middle").attr('fill', 'white')

    //hoverChart(incomes);


    // Update the chart for all letters to initialize
    updateChart('all-jobs');
});

function hoverChart(dataset) {
    // for each player..
    for (i = 0; i < dataset.length; i++) {
        var x = scaleYear(dataset[i]['year'])
        var y = scaleHomeruns(dataset[i]['homeruns'])

        // identify their position
        var position = 'translate(' + x + ', ' + y + ')'
        var group = d3.select('svg').append('g')

        // group.attr('transform', position)
        //     .attr('align-items', 'center')

        // group.append('circle')
        //     .attr('r', '2px')
        //     .style('fill', '#3ca0d9')

        // and put their name by it
        group.append('text')
            .text(dataset[i]['name'])
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('fill', 'white');
    }
}


function updateChart(filterKey) {
    var filteredJobs = incomes.filter(function(d){
        return jobsMap[filterKey].includes(d.Type);
    });
    // Create a filtered array of letters based on the filterKey

    // **** Draw and Update your chart here ****
    var bars = chartG.selectAll('.bar')
    .data(filteredJobs, function(d) {
        return d.Occupation;
    })

    var barEnter = bars.enter()
        .append("g")
        .attr('class', 'bar');

        barEnter.merge(bars)
        .attr('transform', function(d, i) {
            return 'translate(' + [0, i * barBand + 4] + ')';
        })

        barEnter.append('rect')
        .attr('width', function(d) {
            return xScale(d.M_weekly);
        })
        .attr('height', barHeight)
        .attr('fill', '#013F94');

        barEnter.append('rect')
        .attr('width', function(d) {
            return xScale(d.F_weekly);
        })
        .attr('height', barHeight)
        .attr('fill', '#C7E6F9');

        barEnter.append('text')
        .attr('x', 10)
        .attr('dy', '0.93m')
        .html(function(d) {
            return ("weekly male income: $" + d.M_weekly + ", weekly female income: $" + d.F_weekly);
        })
        .attr('class', 'hover-label')
        .attr('fill', '#ffffde');

        barEnter.append('text')
        .attr('x', -490)
        .attr('dy', '0.93m')
        .attr('fill', 'white')
        .attr('font-weight', '200')
        .text(function(d) {
            return d.Occupation;
        })

    bars.exit().remove();
}

// Remember code outside of the data callback function will run before the data loads