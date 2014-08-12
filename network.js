'use strict';

var surl = "192.168.1.3:8081";

var searchArrayf = function(posX, posY, zoom, searchArray) {
    var power = Math.floor(Math.log(maxHeight / zoom) / Math.LN2) - 1;
    var x = posX - (posX % Math.pow(2, power));
    var y = posY - (posY % Math.pow(2, power));
    var dx = Math.floor(maxWidth / zoom);
    var dy = Math.floor(maxHeight / zoom);
    var xorig = x;
    do {
        do {
            searchArray.push({
                posX: x,
                posY: y,
                crit_pos: 63 - power
            });
            x = x + Math.pow(2, power);
        } while (x < posX + dx);
        y = y + Math.pow(2, power);
        var x = xorig;
    } while (y < posY + dy);
};

function Data(view) {
    this.view = view;
    this.nodes = new Object();
    this.socket = io.connect('https://' + surl + '/graph');
    authenticate(this.socket);

    this.clientRequestId = 0;

    // passing data to the closure 
    var thiss = this;

    this.requestData = function(x, y, zoom) {
        var searchArray = new Array();
        searchArrayf(x, y, zoom, searchArray);
        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: {
                type: "searchRequest",
                searchArray: searchArray
            }
        });
        thiss.clientRequestId++;
    }


    this.newNode = function(x, y) {

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: {
                type: "newNode",
                node: {
                    posX: x,
                    posY: y
                }
            }
        });
        console.log("newNode request transmitted");
        thiss.clientRequestId++;

    }


    this.delNode = function(id) {

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: {
                type: "delNode",
                id: id
            }
        });
        console.log("delNode request transmitted");
        thiss.clientRequestId++;

    }


    this.updatePosition = function(posX, posY, id) {

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: {
                type: "newPosition",
                posX: posX,
                posY: posY,
                id: id

            }
        });
        console.log("newPosition request transmitted");
        thiss.clientRequestId++;
    }

    this.newLink = function(origId, endId, linkData) {

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: {
                type: "newLink",
                link: {
                    origId: origId,
                    endId: endId,
                    linkData: linkData
                }
            }

        });
        console.log("newLink request transmitted");
        thiss.clientRequestId++;

    }


    this.delLink = function(origId, endId, id) {

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: {
                type: "delLink",
                link: {
                    origId: origId,
                    endId: endId,
                    linkData: {
                        id: id
                    }
                }
            }
        });

        console.log("delLink request transmitted");
        thiss.clientRequestId++;

    }
    //one of summary or content should be null
    this.newNodeData = function(id, summary, content) {
        var data = {};
        data.id = id;
        data.type = 'newNodeData';
        data.nodeData = {};
        if (summary != null) {
            data.nodeData.summary = summary;
        }
        if (content != null) {
            data.nodeData.content = content;
        }

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: data

        });

        console.log("newNodeData request transmitted");
        thiss.clientRequestId++;


    }

    //one of summary or content should be null
    this.newLinkData = function(origId, endId, id, summary, content) {
        var data = {
            type: 'newLinkData',
            link: {
                origId: origId,
                endId: endId
            }
        };
        data.link.linkData = {};
        data.link.linkData.id = id;
        if (summary != null) {
            data.link.linkData.summary = summary;
        }
        if (content != null) {
            data.link.linkData.content = content;
        }

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: data

        });

        console.log("newLinkData request transmitted");
        thiss.clientRequestId++;


    }


    this.socket.on("newData", function(data) {
        console.log("newData:" + JSON.stringify(data));

        var ids = new Array();
        var index = 0;

        var id;
        if (data.newNodes != null) {
            var newNodes = data.newNodes;
            var i;
            for (i = 0; i < newNodes.length; i++) {
                var node = newNodes[i];
                id = node.id;
                //remove if it exists 
                if (id in thiss.nodes) {
                    thiss.view.removeNode(id);
                }
                if (node.node.input == null) {
                    node.node.input = new Array();
                }
                if (node.node.output == null) {
                    node.node.output = new Array();
                }
                thiss.nodes[id] = node;
                ids[index] = id;
                index++;

            }
        }

        if (data.deletedNodes != null) {
            var deletedNodes = data.deletedNodes;
            var i;
            for (i = 0; i < deletedNodes.length; i++) {
                id = deletedNodes[i];
                //remove if it exists 
                if (id in thiss.nodes) {
                    thiss.view.removeNode(id);
                }

            }
        }

        if (data.newLinks != null) {
            //TODO grab the two nodes and transfer the data
            var newLinks = data.newLinks;

            for (i = 0; i < newLinks.length; i++) {
                var link = newLinks[i];
                var origId = link.origId;
                var endId = link.endId;
                if (endId in thiss.nodes) {
                    var node = thiss.nodes[endId];
                    node.node.input.push(link);
                    thiss.view.removeNode(endId);
                    thiss.nodes[endId] = node;
                    ids[index] = endId;
                    index++;
                }
                if (origId in thiss.nodes) {
                    var node = thiss.nodes[origId];
                    node.node.output.push(link);
                    thiss.view.removeNode(origId);
                    thiss.nodes[origId] = node;
                    ids[index] = origId;
                    index++;
                }
            }
        }

        if (data.delLinks != null) {
            //TODO grab the two nodes and transfer the data
            var delLinks = data.delLinks;

            for (i = 0; i < delLinks.length; i++) {
                var link = delLinks[i];
                var origId = link.origId;
                var endId = link.endId;
                if (endId in thiss.nodes) {
                    var node = thiss.nodes[endId];
                    var input = node.node.input;
                    var j;
                    for (j = 0; j < input.length; j++) {
                        if ((input[j].linkData.id == link.linkData.id) && (input[j].origId == origId)) {
                            input.splice(j, 1);

                            break;
                        }
                    }
                    thiss.view.removeNode(endId);
                    thiss.nodes[endId] = node;
                    ids[index] = endId;
                    index++;
                }
                if (origId in thiss.nodes) {
                    var node = thiss.nodes[origId];
                    var output = node.node.output;
                    var j;
                    for (j = 0; j < output.length; j++) {
                        if ((output[j].linkData.id == link.linkData.id) && (output[j].endId == endId)) {
                            output.splice(j, 1);

                            break;
                        }
                    }
                    thiss.view.removeNode(origId);
                    thiss.nodes[origId] = node;
                    ids[index] = origId;
                    index++;
                }
            }
        }

        if (data.newNodeData != null) {
            var newNodeData = data.newNodeData;
            var i;
            for (i = 0; i < newNodeData.length; i++) {
                var nd = newNodeData[i];
                id = nd.id;
                var node;
                //remove if it exists 
                if (id in thiss.nodes) {
                    node = thiss.nodes[id];
                    if (nd.nodeData.summary != null) {
                        node.node.nodeData.summary = nd.nodeData.summary;
                    }
                    if (nd.nodeData.content != null) {
                        node.node.nodeData.content = nd.nodeData.content;
                    }
                    if (node.node.input == null) {
                        node.node.input = new Array();
                    }
                    if (node.node.output == null) {
                        node.node.output = new Array();
                    }
                    thiss.view.removeNode(id);
                    thiss.nodes[id] = node;
                    ids[index] = id;
                    index++;
                }
            }
        }

        //TODO
        if (data.newLinkData != null) {
            //TODO grab the two nodes and transfer the data
            var newLinkData = data.newLinkData;

            for (i = 0; i < newLinkData.length; i++) {
                var link = newLinkData[i];
                var origId = link.origId;
                var endId = link.endId;
                if (endId in thiss.nodes) {
                    var node = thiss.nodes[endId];
                    var j;
                    var input = node.node.input;
                    for (j = 0; j < input.length; j++) {
                        if (link.linkData.id == input[j].linkData.id) {
                            if (link.linkData.summary != null) {
                                input[j].linkData.summary = link.linkData.summary;
                            }
                            if (link.linkData.content != null) {
                                input[j].linkData.content = link.linkData.content;
                            }
                        }
                    }
                    thiss.view.removeNode(endId);
                    thiss.nodes[endId] = node;
                    ids[index] = endId;
                    index++;
                }
                if (origId in thiss.nodes) {
                    var node = thiss.nodes[origId];
                    var j;
                    var output = node.node.output;
                    for (j = 0; j < output.length; j++) {
                        if (link.linkData.id == output[j].linkData.id) {
                            if (link.linkData.summary != null) {
                                output[j].linkData.summary = link.linkData.summary;
                            }
                            if (link.linkData.content != null) {
                                output[j].linkData.content = link.linkData.content;
                            }
                        }
                        thiss.view.removeNode(origId);
                        thiss.nodes[origId] = node;
                        ids[index] = origId;
                        index++;
                    }
                }
            }
        }




        view.hardChangeView(view.cleanUnNodes(ids));


    });

    this.socket.on("response", function(data) {
        console.log("response:" + JSON.stringify(data));

        //TODO do something with the id
        var clientRequestId = data.clientRequestId;

        if (data.response.type == "searchResponse") {

            // delete everything
            Object.keys(thiss.nodes).forEach(function(id) {
                thiss.view.removeNode(id);

            });


            var nodeArray = data.response.nodeArray;


            var ids = new Array();


            var i;
            for (i = 0; i < nodeArray.length; i++) {
                var node = nodeArray[i];
                var id = node.id;
                //remove if it exists 
                if (id in thiss.nodes) {
                    thiss.view.removeNode(id);
                }
                if (typeof node.node.input == 'undefined' || node.node.input == null) {
                    node.node.input = new Array();
                }
                if (typeof node.node.output == 'undefined' || node.node.output == null) {
                    node.node.output = new Array();
                }
                thiss.nodes[id] = node;
                ids[i] = id;

            }

            view.hardChangeView(view.cleanUnNodes(ids));
        } else {
            //TODO handle the remaining cases
            // there are no other cases at the moment

        }
    });




    this.empty = function() {

        Object.keys(this.nodes).forEach(function(id) {
            this.view.removeNode(id)
        });

    }
}
