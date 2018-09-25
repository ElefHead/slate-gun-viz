var margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right:10
}, width = parseInt(d3.select('.viz').style('width'))
    , mapRatio = 0.5
    , height = width * mapRatio
    , active = d3.select(null);

let cityCountsData = null;
let cityVictimsData = null;
let stateCountsData = null;
let victims = null;
let isLoaded = false;

var color = d3.scaleSqrt()
    .domain([2, 20])
    .range(d3.schemeReds[9]);

function getColor(scheme) {
    return d3.scaleLinear()
        .domain([0, 3])
        .range(scheme)
}

Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
        return this.reduce(function (flat, toFlatten) {
            return flat.concat((Array.isArray(toFlatten) && (depth-1)) ? toFlatten.flat(depth-1) : toFlatten);
        }, []);
    }
});

const svg = d3.select('.viz').append('svg')
    .attr('class', 'center-container')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .on('click', function () {
        return reset();
    });

Promise.all([d3.json('data/us-states.topojson'), d3.json('data/stateCounts.json'), d3.json('data/cityCounts.json'), d3.json('data/cityVictims.json')])
    .then(([data, stateCounts, cityCounts, cityVictims]) => {
        ready(data, stateCounts, cityCounts, cityVictims)
    });

const projection = d3.geoAlbersUsa()
    .translate([width /2 , height / 2])
    .scale(width);

const path = d3.geoPath()
    .projection(projection);

const g = svg.append("g")
    .attr('class', 'center-container center-items us-state-g')
    .attr('transform', 'translate('+margin.left+','+margin.top+')')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const svg_grid = d3.select('.grid').append('svg')
    .attr('class', 'center-container center-items full-height grid-g')
    .attr('width', width + margin.left + margin.right)
    .attr('transform', 'translate('+margin.left+','+margin.top+')');

const g_grid = svg_grid.append('g')
    .attr('class', 'center-container center-items grid-g full-height')
    .attr('width', width + margin.left + margin.right)
    .attr('height', '100%')
    .attr('transform', 'translate('+margin.left+','+margin.top+')');


const gridRadius = 7;
const numPerRow = Math.floor(d3.select('.grid-g').attr('width')/(gridRadius * 2.5));
const size=Math.floor(d3.select('.grid-g').attr('width')/(numPerRow));

const scale = d3.scaleLinear()
    .domain([0, numPerRow - 1])
    .range([0, size * numPerRow - 5]);

function ready(data, stateCounts, cityCounts, cityVictims) {
    cityCountsData = cityCounts;
    cityVictimsData = cityVictims;
    stateCountsData = stateCounts;

    let usStates = topojson.feature(data, data.objects.collection).features;

    g.selectAll('.us-state')
        .data(usStates)
        .enter().append('path')
        .attr('class', 'us-state')
        .attr('d', path)
        .attr("fill", function(d) {
            let name = d.properties.NAME;
            if (name in stateCounts)
                return color(d.rate = stateCounts[d.properties.NAME]['count']);
            else
                return color(d.rate = 0)
        })
        .on("mousemove", function(d) {
            if (active.node() === this) return;

            var html = "";

            html += "<div class=\"tooltip_kv\">";
            html += "<span class=\"tooltip_key\">";
            html += d.properties.NAME;
            html += "</span>";
            html += "<span class=\"tooltip_value\">Deaths: ";
            html += stateCounts[d.properties.NAME].count;
            html += "";
            html += "</span>";
            html += "</div>";

            $("#tooltip-container").html(html);
            $(this).attr("fill-opacity", "0.8");
            $("#tooltip-container").show();

            // var coordinates = d3.mouse(this);

            var map_width = $('.us-state-g')[0].getBoundingClientRect().width;

            if (d3.event.layerX < map_width / 2) {
                d3.select("#tooltip-container")
                    .style("top", (d3.event.layerY + 15) + "px")
                    .style("left", (d3.event.layerX + 15) + "px");
            } else {
                var tooltip_width = $("#tooltip-container").width();
                d3.select("#tooltip-container")
                    .style("top", (d3.event.layerY + 15) + "px")
                    .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
            }
        })
        .on('mouseout', function () {
            $('#tooltip-container').hide();
        })
        .on('click', clicked);
}


function populateGrid(data, all=true) {
    if (all && isLoaded) {
        g_grid.select('g.grid-items').remove();
        d3.select('g.all-grid-items').classed('hidden', false);
    }
    else if (!all && isLoaded){
        d3.select('g.all-grid-items').classed('hidden', true);
    }

    if (!all || !isLoaded) {
        g_grid.select('g.grid-items').remove();

        let classVal;

        if (all === false){
            classVal = 'grid-items';
        }else{
            classVal = 'all-grid-items';
        }

        g_grid.append('g')
            .attr('class', classVal)
            .selectAll('.items')
            .data(data)
            .enter().append('a')
            .attr('href', (d) => {
                if (Array.isArray(d))
                    return d[1]['url']
                else
                    return d['url']
            })
            .attr('target', '_blank')
            .append('circle')
            .on('click', (d) => {
                console.log(d)
            })
            .attr('r', gridRadius)
            .attr('cx', (d, i) => {
                const n = i % numPerRow;
                return scale(n)
            })
            .attr('cy', (d, i) => {
                const n = Math.floor(i / numPerRow);
                return scale(n)
            })
            .attr('fill', (d) => {
                let obj = null;
                if (Array.isArray(d))
                    obj = d[1];
                else
                    obj = d;

                let {gender, ageGroup} = obj;
                let scheme = d3.schemeGreys[9];
                if (gender === 'M')
                    scheme = d3.schemeBlues[7];
                else if (gender === 'F')
                    scheme = d3.schemeRdPu[8];
                else
                    scheme = d3.schemeGreys[9];
                let circlecolor = getColor(scheme);

                if (ageGroup === '3')
                    return circlecolor(20);
                else if (ageGroup === '2')
                    return circlecolor(13);
                else if (ageGroup === '1')
                    return circlecolor(7);
                else
                    return circlecolor(100);

            })
            .attr('stroke-width', 2)
            .attr('stroke', 'white')
            .on("mousemove", function(d) {
                let obj = null;
                if (Array.isArray(d))
                    obj = d[1];
                else
                    obj = d;
                let html = "";
                html += "<div class=\"tooltip_kv\">";
                html += "<span class=\"tooltip_key\">";
                html += obj['name'];
                html += "</span>";
                html += "<span class=\"tooltip_value\">Age: ";
                html += obj['age'];
                html += "";
                html += "</span>";
                html += "</div>";
                html += '<div>';
                html += '<span class=\"subtext\">Date: ';
                html += obj['date'];
                html += "</span><br/>";
                html += '<span class=\"subtext\">Gender: ';
                html += obj['gender'];
                html += "</span><br/>";
                html += '<span class=\"subtext\">Location: ';
                html += obj['city'] + ', ' + obj['state'];
                html += "</span>";
                html += "</div>";

                $("#gridtip-container").html(html);
                $("#gridtip-container").show();

                let map_w = $('.grid-g')[0].getBoundingClientRect().width;
                let map_h = $('.grid-g')[0].getBoundingClientRect().height;

                if (d3.event.layerX < map_w / 2) {
                    d3.select("#gridtip-container")
                        .style("left", (d3.event.layerX + 15) + "px");
                } else {
                    let tooltip_w = $("#gridtip-container").width();
                    d3.select("#gridtip-container")
                        .style("left", (d3.event.layerX - tooltip_w - 30) + "px");
                }

                if (d3.event.layerY < map_h / 2) {
                    d3.select('#gridtip-container')
                        .style("top", (d3.event.layerY + 15) + "px")
                } else {
                    let tooltip_h = $("#gridtip-container").height();
                    d3.select("#gridtip-container")
                        .style("top", (d3.event.layerY - tooltip_h - 30) + "px");
                }
            })
            .on('mouseout', function () {
                $('#gridtip-container').hide();
            });

        if (all)
            isLoaded = true;
    }

    if (data.length === 0)
        d3.select('.death-count').text('12070');
    else
        d3.select('.death-count').text(data.length);

    let grid_height = data.length * 2.5 * gridRadius / numPerRow;

    // if (grid_height > height) {
        svg_grid.attr('height', grid_height+ 5*gridRadius);
        g_grid.attr('height', grid_height + 5*gridRadius);
    // }else {
    //     svg_grid.attr('height', height);
    //     g_grid.attr('height', height);
    // }
}

const radius = d3.scaleSqrt()
    .domain([0, 1e3])
    .range([0, 15]);

function clicked(d) {
    d3.event.stopPropagation();
    d3.selectAll('span.location-text')
        .text(d.properties.NAME);

    svg.selectAll('.us-state')
        .classed('blur', true);

    let stateName = d.properties.NAME;
    let cityDeaths = cityCountsData[d.properties.NAME];

    cityDeaths = d3.keys(cityDeaths).map((key) => {
        return [key, cityDeaths[key]]
    });

    cityDeaths.sort((a, b) => {
        return b[1].count - a[1].count
    });

    let stateVictims = cityVictimsData[stateName];
    stateVictims = d3.keys(stateVictims).map((key) => {
        return stateVictims[key]['victims']
    });

    stateVictims = stateVictims.flat(1);

    if (active.node() !== this) {

        svg.selectAll('g.bubble')
            .selectAll('circle')
            .transition()
            .delay(function (d, i) {
                return i;
            })
            .attr('r', 0)
            .remove();

        active.classed("active", false);
        active = d3.select(this).classed("active", true)
            .classed('blur', false);


        var bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .9 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

        g.transition()
            .duration(750)
            .style("stroke-width", 1.5 / scale + "px")
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

        svg.append('g')
            .attr('class', 'bubble center-container center-items')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .selectAll('circle')
            .data(cityDeaths)
            .enter().append('circle')
            .attr('class', 'location-bubble')
            .attr('cx', function (city) {
                let {lat, lon} = city[1];
                let coords = projection([lon, lat]);
                return coords[0];
            })
            .attr('cy', function (city) {
                let {lat, lon} = city[1];
                let coords = projection([lon, lat]);
                return coords[1];
            })
            .attr("transform", "translate(" + translate + ") scale(" + scale + ")")
            .attr('r', 0)
            .on('click', function (d) {
                d3.event.stopPropagation();
                bubbleClicked(d, stateName);
            })
            .on("mousemove", function (d) {
                let html = "";
                html += "<div class=\"tooltip_kv\">";
                html += "<span class=\"tooltip_key\">";
                html += d[0];
                html += "</span>";
                html += "<span class=\"tooltip_value\">Deaths: ";
                html += d[1].count;
                html += "";
                html += "</span>";
                html += "</div>";

                $("#tooltip-container").html(html);
                $("#tooltip-container").show();

                let map_width = $('.us-state-g')[0].getBoundingClientRect().width;

                if (d3.event.layerX < map_width / 2) {
                    d3.select("#tooltip-container")
                        .style("top", (d3.event.layerY + 15) + "px")
                        .style("left", (d3.event.layerX + 15) + "px");
                } else {
                    let tooltip_width = $("#tooltip-container").width();
                    d3.select("#tooltip-container")
                        .style("top", (d3.event.layerY + 15) + "px")
                        .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
                }
            })
            .on('mouseout', function () {
                $('#tooltip-container').hide();
            })
            .transition()
            .delay(function (d, i) {
                return 750 + 2 * i
            })
            .attr('r', function (city) {
                let {count} = city[1];
                return radius(count) * 5/scale;
            })
            .attr("fill", function (city) {
                let {count} = city[1];
                // return cityColor(d.rate = count);
                return 'darkred'
            });


    }

    $('.active').dblclick(function () {
        reset()
    });

    populateGrid(stateVictims, false);

}

function reset() {
    active.classed("active", false);
    active = d3.select(null);

    d3.selectAll('span.location-text')
        .text('USA');

    svg.selectAll('g.bubble')
        .selectAll('circle')
        .transition()
        .delay(function(d, i) {
            return i/2;
        })
        .attr('r', 0)
        .remove();

    svg.selectAll('g.bubble')
        .transition()
        .delay(function(d, i) {
            return i/2;
        })
        .remove();

    g.transition()
        .delay(100)
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

    svg.selectAll('.us-state')
        .classed('blur', false);

    populateGrid([], true);

}

function bubbleClicked(d, stateName) {
    [ city, properties ] = d;
    let state_details = stateCountsData[stateName];
    d3.select('span.location-text').text(city + ', ' + state_details.code);

    let cityVictims = cityVictimsData[stateName][city]['victims'];
    populateGrid(cityVictims, false);
}