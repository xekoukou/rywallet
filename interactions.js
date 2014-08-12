'use strict';

var interactions = function(view) {

    var parentId = 0;
    var prevNode = null;
    var escKey = 27;
    var iKey = 73;
    var cKey = 67;
    var dKey = 68;
    var rKey = 82;
    var lKey = 76;
    var pKey = 80;
    var mouseX;
    var mouseY;

    var ms = 15; //mouse multiplier


    //tracking the mouse 
    var mouseTracking = function(e) {
        if (actOnEvent) {
            mouseX = e.pageX;
            mouseY = e.pageY;
            actOnEvent = false;
        }
    };

    // these var should have been local
    var initX;
    var initY;

    var moveSpace = function(e) {
        if (actOnEvent) {
            e.preventDefault();
            mouseX = e.pageX;
            mouseY = e.pageY;
            var nposX = view.posX + ((-e.pageX + initX) / view.zoom);
            var nposY = view.posY + ((-e.pageY + initY) / view.zoom);
            if (nposX >= 0) {
                view.posX = nposX;
            }
            if (nposY >= 0) {
                view.posY = nposY;
            }

            var changedIds = Object.keys(view.data.nodes);
            view.softChangeView(view.cleanUnNodes(changedIds));
            initX = mouseX;
            initY = mouseY;
            actOnEvent = false;
        }
    };
    var moveNode = function(e) {
        e.preventDefault();
        mouseX = e.pageX;
        mouseY = e.pageY;
        var nposX = view.data.nodes[ids[0]].posX + ((e.pageX - initX) / view.zoom);
        var nposY = view.data.nodes[ids[0]].posY + ((e.pageY - initY) / view.zoom);
        if (nposX >= 0) {
            view.data.nodes[ids[0]].posX = nposX;
        }
        if (nposY >= 0) {
            view.data.nodes[ids[0]].posY = nposY;
        }
        var node = view.data.nodes[ids[0]];
        var diffX = node.posX - view.posX;
        var diffY = node.posY - view.posY;

        $('.' + node.id + '.nestedGraphNode').css('-webkit-transform', 'translate(' + (diffX * view.zoom) + 'px' + ',' + (diffY * view.zoom) + 'px' + ')');
        $('.' + node.id + '.nestedGraphNode').css('transform', 'translate(' + (diffX * view.zoom) + 'px' + ',' + (diffY * view.zoom) + 'px' + ')');


        view.arrowCanvas.drawArrows(view.posX, view.posY, view.zoom);
        initX = mouseX;
        initY = mouseY;
    };

    $(window).on('mousemove', mouseTracking);


    //disable context menu so as to use right click
    document.oncontextmenu = function() {
        return false;
    };

    // right clicking moves the map
    $(window).on('mousedown', function(e) {
        if (e.which == 3 && !editing) {
            initX = e.pageX;
            initY = e.pageY;

            $(window).off('mousemove', mouseTracking);
            $(window).on('mousemove', moveSpace);

        }
        if (e.which == 1 && inside == 1 && !editing) {
            initX = e.pageX;
            initY = e.pageY;
            index++;
            $(window).off('mousemove', mouseTracking);
            $(window).on('mousemove', moveNode);

        }
    });

    $(window).on('mouseup', function(e) {
        if (e.which == 3 && !editing) {

            $(window).off('mousemove', moveSpace);
            $(window).on('mousemove', mouseTracking);
            view.data.requestData(view.posX, view.posY, view.zoom);
        }
        if (e.which == 1 && !editing) {

            $(window).off('mousemove', moveNode);
            $(window).on('mousemove', mouseTracking);
            index = 0;
            var node = view.data.nodes[ids[0]];
            node.posX = Math.floor(node.posX);
            node.posY = Math.floor(node.posY);
            view.data.updatePosition(node.posX, node.posY, ids[0]);
        }
    });


    //zoom event
    $(window).on('mousewheel', function(e) {

        if (!editing) {
            var oldzoom = view.zoom;
            var nzoom = view.zoom * (1 + 0.1 * e.deltaY);
            var nposX = Math.floor(view.posX + (view.width / 2) * ((1 / oldzoom) - (1 / nzoom)));
            var nposY = Math.floor(view.posY + (view.height / 2) * ((1 / oldzoom) - (1 / nzoom)));
            if ((nzoom > 0) && (nposY >= 0) && (nposX >= 0)) {
                view.zoom = nzoom;
                view.posX = nposX;
                view.posY = nposY;
                var changedIds = Object.keys(view.data.nodes);
                view.softChangeView(view.cleanUnNodes(changedIds));
            }
        }
    });


    //Esc and i are used to allow or disallow keydown actions

    //the ace editor
    var editor;
    var editing = 0;

    var escUp = function(view) {
        $(window).on('keyup', function(e) {
            if (e.which == escKey) {

                $(window).off('keyup');

                commandsUp(view);
                if (editor != null) {
                    var value = editor.getValue();
                    editor.destroy();
                    if (productView) {

                        $("." + ids[0] + "." + productId[0] + ".summary").empty();
                        $("." + ids[0] + "." + productId[0] + ".summary").css("width", "").css("height", "");
                        $("." + ids[0] + "." + productId[0] + ".nestedGraphNode").css("z-index", "");
                        //TODO fix that
                        view.data.newNodeData(ids[0], value, null);

                    } else {
                        $("." + ids[0] + ".summary").empty();
                        $("." + ids[0] + ".summary").css("width", "").css("height", "");
                        $("." + ids[0] + ".nestedGraphNode").css("z-index", "");
                        view.data.newNodeData(ids[0], value, null);
                    }
                    index = 0;
                    editing = 0;
                }

            }
        });

    };

    var commandsUp = function(view) {
        var nkeys = {
            lKey: 0,
            rKey: 0,
            dKey: 0
        };

        var cleanAllBut = function(key) {
            Object.keys(nkeys).forEach(function(nkey) {
                if (key != nkey) {
                    nkeys[nkey] = 0;
                }
            });
        };


        $(window).on('keydown', function(event) {


            if (event.which == iKey) {

                $(window).off('keydown');
                escUp(view);
                if (inside == 1) {
                    editing = 1;
                    index++;
                    $("." + ids[0] + ".nestedGraphNode").css("z-index", 5);
                    if (productView) {
                        $("." + ids[0] + "." + productId[0] + ".summary").css("width", "400px").css("height", "500px");
                        $("." + ids[0] + "." + productId[0] + ".summary").empty();
                        var DocElement = $("." + ids[0] + "." + productId[0] + ".summary").get(0);
                        editor = ace.edit(DocElement);
                        editor.getSession().setMode("ace/mode/markdown");
                        var node = view.data.nodes[ids[0]].node;
                        var j;
                        for (j = 0; j < node.output.length; j++) {
                            if (node.output[j].linkData.id == productId[0]) {
                                editor.setValue(node.output[j].linkData.summary, -1);
                                break;
                            }
                        }

                    } else {
                        $("." + ids[0] + ".summary").css("width", "400px").css("height", "500px");
                        $("." + ids[0] + ".summary").empty();
                        var DocElement = $("." + ids[0] + ".summary").get(0);
                        editor = ace.edit(DocElement);
                        editor.getSession().setMode("ace/mode/markdown");
                        editor.setValue(view.data.nodes[ids[0]].node.nodeData.summary, -1);
                    }
                }
            }

            if (event.which == escKey) {
                $('div#commands').css('visibility', function(i, visibility) {
                    return (visibility == 'visible') ? 'hidden' : 'visible';
                });
                cleanAllBut("");
            }


            if (event.which == cKey) {
                var node = new Object();
                node.parentId = parentId;
                var posY = Math.floor(view.posY + mouseY / view.zoom);
                var posX = Math.floor(view.posX + mouseX / view.zoom);
                view.data.newNode(posX, posY);
                cleanAllBut("");
            }

            if (event.which == lKey && inside == 1) {

                if (nkeys["lKey"] === 0) {
                    nkeys["lKey"]++;
                    index++;

                } else {
                    if (nkeys["lKey"] == 1) {
                        if (!productView) {
                            productId[0] = -1;
                        }
                        console.log("inserted link:ids:" + ids[0] + ' , ' + ids[1] + " productId:" + productId[0]);
                        view.data.newLink(ids[0], ids[1], {
                            id: productId[0],
                            summary: "product",
                            content: "product content"
                        });
                        nkeys["lKey"] = 0;
                        index = 0;
                    }
                }
                cleanAllBut("lKey");
            }
            if (event.which == rKey && inside == 1) {

                if (nkeys["rKey"] === 0) {
                    nkeys["rKey"]++;
                    index++;
                } else {
                    if (nkeys["rKey"] == 1) {
                        console.log("deleted link:ids:" + ids[0] + ' , ' + ids[1] + " productId:" + productId[0]);
                        //find the link
                        var output = view.data.nodes[ids[0]].node.output;
                        var id = -1;
                        if (productView) {
                            id = productId[0];
                        } else {
                            var i;
                            for (i = 0; i < output.length; i++) {
                                if (output[i].endId == ids[1]) {
                                    id = output[i].linkData.id;
                                    break;
                                }
                            }
                        }
                        if (id != -1) {
                            view.data.delLink(ids[0], ids[1], id);
                        } else {
                            //TODO inform the user that there is no such link
                        }
                        nkeys["rKey"] = 0;
                        index = 0;
                    }
                }
                cleanAllBut("rKey");
            }

            if (event.which == dKey && inside == 1) {

                if (nkeys["dKey"] === 0) {
                    nkeys["dKey"]++;
                } else {
                    if (nkeys["dKey"] == 1) {
                        console.log("deleted Node:id:" + ids[0]);
                        if (ids[0]) {
                            view.data.delNode(ids[0]);
                        } else {
                            //TODO no node was picked
                        }
                        nkeys["dKey"] = 0;
                    }
                }
                cleanAllBut("dKey");
            }
            if (event.which == pKey) {
                productView = !productView;

                var idss = Object.keys(view.data.nodes);
                view.removeAllNodeDoms();
                view.hardChangeView(idss);

            }


            //TODO add more actions 
            //they should only send data to server
            // the server will have to accept the action and send back a verification
        });


    };

    escUp(view);








};
