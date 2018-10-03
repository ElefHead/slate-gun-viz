# Gun Deaths Visualization
A [D3.js application](https://cjagad2.people.uic.edu/hw2/) to visualize Gun Death victims data from Slate Magazine

# Methodology
Here are a few points about how to navigate about this visualization

* Upon loading, the first visual will be a chloropleth showing the deaths per state. Darker implies greater.
* Click on state to zoom in onto a state and get details. This will also show a grid with details about each person.
* Double click on state to zoom out.
* You can hover over any element to even more details.
* The bubbles on the map are colored blue and red to show male and female deaths(respectively) normalized by the population in that city/town/county.
* On the grid, the reds show female deaths and the blues show male deaths. The greys depicts unknown gender. The darkness of the colors are based on the age groups(Child/Adoloscent/Adult) of the victim. Darker colors correspond to higher age group.

# Credits
This visualization was a project for [CS 594 Visual Data Science](https://www.evl.uic.edu/cs594/), made using HTML, CSS, JQuery and D3.js and data from Slate Magazine. I claim no ownership or credits for the libraries used in this project and convey my sincere gratitude to the developers, original content creators, and the data aggregators.

* Project: [D3.js](https://d3js.org/)  
License: BSD
* Project: [Topojson](https://github.com/topojson/topojson)
* [Mike Bostock](https://bost.ocks.org/mike/)'s [bl.ocks](https://bl.ocks.org/mbostock)
* Project: [jQuery](https://code.jquery.com/)  
License: MIT and jQuery License
* Project: [Bootstrap](http://getbootstrap.com/)  
License: MIT and docs released under Creative Commons
* Data from [Slate Magazine](http://www.slate.com/articles/news_and_politics/crime/2012/12/gun_death_tally_every_american_gun_death_since_newtown_sandy_hook_shooting.html)
