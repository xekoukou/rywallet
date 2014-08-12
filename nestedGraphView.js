'use strict'

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
var productId = new Array();

//view switch from product to process etc.
var productView = false;

var markdown = new Markdown.Converter();

var divNode = function(id, summary, content) {

    if (content == null) {
        content = "";
    }
    return "<div class='" + id + " nestedGraphNode'> <div class='" + id + " summary'>" + markdown.makeHtml(summary) + "</div> <div class='" + id + " content'>" + markdown.makeHtml(content) + "</div></div>";

}

var divProductNodes = function(id, products) {

    var result = "<div class='" + id + " nestedGraphNode'> ";
    var lids = Object.keys(products);
    if (lids.length == 0) {
        products[-1] = ({
            id: -1,
            summary: "no product"
        });
        lids = Object.keys(products);
    }
    lids.forEach(function(lid) {

        var product = products[lid];

        if (product.content == null) {
            product.content = "";
        }

        result = result + "<div class='" + id + " " + product.id + " summary'>" + markdown.makeHtml(product.summary) + "</div> <div class='" + id + " content'>" + markdown.makeHtml(product.content) + "</div>";

    });

    return result + "</div>";
}

// zoom , the zoom level in centimeters per real centimeter



//rootId has #
    function ArrowCanvas(rootId, nodess) {

        var nodes = nodess;

        var vis = d3.select("#graphCanvas").append("svg").attr("width", maxWidth).attr("height", maxHeight);

        this.drawArrows = function(posX, posY, zoom) {

            var links = new Array();
            Object.keys(nodes).forEach(function(id) {
                var output = nodes[id].node.output;
                var i = 0;
                //used by productView
                var totalHeight = {};
                if (output.length > 0) {
                    totalHeight[output[i].linkData.id] = {
                        h: 0,
                        once: 0
                    };
                }
                for (i = 0; i < output.length; i++) {


                    if (productView) {
                        var lid = output[i].linkData.id;

                        var origWidth = $("." + output[i].origId + "." + output[i].linkData.id + '.summary').css('width');
                        origWidth = parseInt(origWidth.split("p", 1)[0]) + 4;
                        var origHeight = $("." + output[i].origId + "." + output[i].linkData.id + '.summary').css('height');
                        origHeight = parseInt(origHeight.split("p", 1)[0]) + 4 + totalHeight[lid].h;

                        if (totalHeight[lid].once == 0) {
                            var j = i;
                            for (j = i; j < output.length; j++) {
                                var nlid = output[j].linkData.id;
                                if (totalHeight[nlid] == null) {
                                    totalHeight[nlid] = {
                                        h: 2 * origHeight - totalHeight[lid].h,
                                        once: 0
                                    };
                                    break;
                                }
                            }
                            totalHeight[lid].once = 1;
                        }

                        if (nodes[output[i].endId] != null) {
                            //TODO
                            var endHeight = $("." + output[i].endId + '.summary').css('height');
                            endHeight = parseInt(endHeight.split("p", 1)[0]) + 4;
                        }
                    } else {
                        if (nodes[output[i].endId] != null) {
                            var origWidth = $("." + output[i].origId + '.summary').css('width');
                            origWidth = parseInt(origWidth.split("p", 1)[0]) + 4;
                            var origHeight = $("." + output[i].origId + '.summary').css('height');
                            origHeight = parseInt(origHeight.split("p", 1)[0]) + 4;
                            var endHeight = $("." + output[i].endId + '.summary').css('height');
                            endHeight = parseInt(endHeight.split("p", 1)[0]) + 4;
                            //4 is the padding
                        }
                    }

                    if (nodes[output[i].endId] != null) {
                        links.push(

                            {
                                x: (nodes[output[i].origId].posX - posX) * zoom + origWidth,
                                y: (nodes[output[i].origId].posY - posY) * zoom + origHeight / 2,
                                toX: (nodes[output[i].endId].posX - posX) * zoom,
                                toY: (nodes[output[i].endId].posY - posY) * zoom + endHeight / 2
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
            var i;
            for (i = 0; i < links.length; i++) {
                var headlen = 15;
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
                if (productView) {
                    var products = {};
                    node.node.output.forEach(function(link) {
                        products[link.linkData.id] = link.linkData;
                    });
                    $(this.rootId).append(divProductNodes(node.id, products));
                } else {
                    $(this.rootId).append(divNode(node.id, node.node.nodeData.summary, node.node.nodeData.content));
                }
            }

            $(".nestedGraphNode").on("mouseenter",

                function(e) {
                    ids[index] = parseInt(e.target.className.split(' ', 2)[0]);
                    inside = 1;
                }
            );
            $(".nestedGraphNode").on("mouseleave",

                function(e) {
                    inside = 0;
                }
            );
            $(".summary").on("mouseenter",

                function(e) {
                    //this is only relevant when productView is true else it returns summary
                    productId[index] = parseInt(e.target.className.split(' ', 2)[1]);
                }
            );



            this.softChangeView(changedIds);

        };
        this.removeAllNodeDoms = function() {
            var ids = Object.keys(view.data.nodes);
            ids.forEach(function(id) {
                thiss.removeNodeDom(id);
            });

        };
        this.removeNodeDom = function(id) {
            $('.' + id + '.nestedGraphNode').remove();
        };
        this.removeNode = function(id) {
            this.removeNodeDom(id);
            delete this.data.nodes[id];
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
