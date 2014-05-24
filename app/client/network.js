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


    this.newNode = function(x, y, node) {

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: {
                type: "newNode",
                node: {
                    posX: x,
                    posY: y,
                    node: node
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

    }


    this.delLink = function(origId, endId, id) {

        this.socket.emit("request", {
            clientRequestId: thiss.clientRequestId,
            request: {
                type: "delLink",
                link: {
                    origId: origId,
                    endId: endId,
                    id: id
                }
            }
        });

        console.log("delLink request transmitted");

    }

    this.socket.on("newData", function(data) {
        console.log("newData:" + JSON.stringify(data));

        var ids = new Array();
        var index = 0;


        if (typeof data.newNodes != 'undefined') {
            var newNodes = data.newNodes;

            for (i = 0; i < newNodes.length; i++) {
                var node = newNodes[i];
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
                ids[index] = id;
                index++;
                view.hardChangeView(view.cleanUnNodes(ids));

            }
        }

        if (typeof data.deletedNodes != 'undefined') {
            var deletedNodes = data.deletedNodes;

            for (i = 0; i < deletedNodes.length; i++) {
                var id = deletedNodes[i];
                //remove if it exists 
                if (id in thiss.nodes) {
                    thiss.view.removeNode(id);
                }

            }
        }

        if (typeof data.newLinks != 'undefined') {
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

        if (typeof data.delLinks != 'undefined') {
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
                        if (input[j].id == link.id) {
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
                        if (output[j].id == link.id) {
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

        Object.keys(this.nodes).forEach(this.view.removeNode(id));

    }
}
