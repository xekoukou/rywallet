var id_connector = 'graphCanvas';
var maxWidth = 1920;
var maxHeight = 1080;

var actOnEvent = true;
var timer = window.setInterval(function() {
    actOnEvent = true;
}, 20);

//used by interactions mouseenter
var ids = new Array();
var index = 0;
var inside = 0;


var divNode = function(id, content) {

    return "<div class='" + id + " nestedGraphNode'>" + content + "</div>";

}

// zoom , the zoom level in centimeters per real centimeter



//rootId has #
    function ArrowCanvas(rootId, nodes) {

        var nodes = nodes;

        var vis = d3.select("#graphCanvas").append("svg").attr("width", maxWidth).attr("height", maxHeight);

        this.drawArrows = function(posX, posY, zoom) {

            var links = new Array();
            Object.keys(nodes).forEach(function(id) {
                var output = nodes[id].node.output;
                var i;
                for (i = 0; i < output.length; i++) {

                    if (nodes[output[i].endId] != null) {
                        links.push(

                            {
                                x: (nodes[output[i].origId].posX - posX) * zoom,
                                y: (nodes[output[i].origId].posY - posY) * zoom,
                                toX: (nodes[output[i].endId].posX - posX) * zoom,
                                toY: (nodes[output[i].endId].posY - posY) * zoom
                            }
                        );
                    }
                }
            });

            vis.selectAll(".line").remove();

            var lines = vis.selectAll(".line").data(links);
            lines.enter().append("line").attr("x1", function(d) {
                return d.x;
            }).attr("y1", function(d) {
                return d.y;
            })
                .attr("x2", function(d) {
                    return d.toX;
                })
                .attr("y2", function(d) {
                    return d.toY;
                }).attr("class", "line")
                .style("stroke", "rgb(0, 131, 81)")
                .style("stroke-width", "3");

            var llinks = new Array();
            var rlinks = new Array();
            for (i = 0; i < links.length; i++) {
                var headlen = 10;
                var angle = Math.atan2(links[i].toY - links[i].y, links[i].toX - links[i].x);

                llinks.push({
                    x: (links[i], links[i].toX + links[i].x) / 2,
                    y: (links[i].toY + links[i].y) / 2,
                    toX: (links[i].toX + links[i].x) / 2 - headlen * Math.cos(angle - Math.PI / 6),
                    toY: (links[i].toY + links[i].y) / 2 - headlen * Math.sin(angle - Math.PI / 6)
                });

                rlinks.push({
                    x: (links[i], links[i].toX + links[i].x) / 2,
                    y: (links[i].toY + links[i].y) / 2,
                    toX: (links[i].toX + links[i].x) / 2 - headlen * Math.cos(angle + Math.PI / 6),
                    toY: (links[i].toY + links[i].y) / 2 - headlen * Math.sin(angle + Math.PI / 6)
                });


            }

            vis.selectAll(".lline").remove();

            var llines = vis.selectAll(".lline").data(llinks);
            llines.enter().append("line").attr("x1", function(d) {
                return d.x;
            }).attr("y1", function(d) {
                return d.y;
            })
                .attr("x2", function(d) {
                    return d.toX;
                })
                .attr("y2", function(d) {
                    return d.toY;
                }).attr("class", "lline")
                .style("stroke", "rgb(0, 131, 81)")
                .style("stroke-width", "3");



            vis.selectAll(".rline").remove();

            var rlines = vis.selectAll(".rline").data(rlinks);

            rlines.enter().append("line").attr("x1", function(d) {
                return d.x;
            }).attr("y1", function(d) {
                return d.y;
            })
                .attr("x2", function(d) {
                    return d.toX;
                })
                .attr("y2", function(d) {
                    return d.toY;
                }).attr("class", "rline")
                .style("stroke", "rgb(0, 131, 81)")
                .style("stroke-width", "3");


        }

    }


    function View(posX, posY, zoom, id_connector, width, height) {

        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);
        this.zoom = zoom;
        this.data = new Data(this);

        this.width = width;
        this.height = height;
        this.rootId = "#" + id_connector;


        this.arrowCanvas = new ArrowCanvas(this.rootId, this.data.nodes);

        //for closures
        var thiss = this;


        this.cleanUnNodes = function(ids) {
            var remIds = new Array();

            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var node = this.data.nodes[id];


                var diffX = (node.posX - this.posX) * this.zoom;
                var diffY = (node.posY - this.posY) * this.zoom;
                if (diffX < 0 || diffY < 0 || diffX > this.width || diffY > this.height) {
                    this.removeNode(id);

                } else {
                    remIds.push(id);
                }
            }
            return remIds;
        }

        //no new data
        this.softChangeView = function(ids) {
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var node = this.data.nodes[id];
                var diffX = node.posX - this.posX;
                var diffY = node.posY - this.posY;
                $('.' + node.id + '.nestedGraphNode').css('-webkit-transform', 'translate(' + (diffX * this.zoom) + 'px' + ',' + (diffY * this.zoom) + 'px' + ')');
                $('.' + node.id + '.nestedGraphNode').css('transform', 'translate(' + (diffX * this.zoom) + 'px' + ',' + (diffY * this.zoom) + 'px' + ')');
            }
            //draw Arrows
            this.arrowCanvas.drawArrows(this.posX, this.posY, this.zoom);


        };

        this.hardChangeView = function(changedIds) {

            for (var i = 0; i < changedIds.length; i++) {

                var node = this.data.nodes[changedIds[i]];
                $(this.rootId).append(divNode(node.id, node.node.nodeData.summary));
            }

            $(".nestedGraphNode").on("mouseenter",

                function(e) {
                    ids[index] = parseInt(e.target.className.split(' ', 2)[0]);
                    inside = 1;
                }
            );
            $(".nestedGraphNode").on("mouseout",

                function(e) {
                    inside = 0;
                }
            );


            this.softChangeView(changedIds);

        };

        this.removeNode = function(id) {
            $('.' + id + '.nestedGraphNode').remove();
            delete thiss.data.nodes[id];
            this.arrowCanvas.drawArrows(this.posX, this.posY, this.zoom);


        };

        //load the interactions
        interactions(this);

        //first actions of the View function
        this.data.requestData(this.posX, this.posY, this.zoom);

    }

    //global context of view
var view;
$(window).load(function(e) {
    view = new View(0, 0, 1, id_connector, maxWidth, maxHeight);

});
