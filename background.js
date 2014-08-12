console.log("this code is executed once more");



chrome.runtime.onStartup.addListener(function() {


    //setting alarms for notifications
    chrome.alarms.create("notifications alarm", {
        "when": Date.now() + 10000,
        "periodInMinutes": 1
    });


    console.log("chrome restarted");
});

chrome.alarms.onAlarm.addListener(function(alarm) {

    console.log("An alarm was triggered ");

    chrome.notifications.create("", {
        type: "basic",
        title: "New Work",
        iconUrl: "stream-128.png",
        message: "Deliver potatoes"
    }, function(id) {
        console.log("inside Background Notification created...    last error:", chrome.runtime.lastError);
    });
});


chrome.app.runtime.onLaunched.addListener(function() {



    if (!window.indexedDB) {
        console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    }

    var db;

    var request = indexedDB.open("ryaki", 1);


    request.onupgradeneeded = function(event) {
        console.log("I created the objectStore");
        var db = event.target.result;

        // Create an objectStore for this database
        var objectStore = db.createObjectStore("mypgpkeys", {
            keyPath: "mykeys"
        });
    };

    request.onerror = function(event) {
        console.log("An error occured - indexedDB not allowed to open");
    }

    request.onsuccess = function(event) {
        db = this.result;

        db.onerror = function(event) {
            // Generic error handler for all errors targeted at this database's
            // requests!
            console.log("Database error: " + event.target.message);

        };



        //it checks the initialization of the database by the existence of the mypgpkeys
        // needed by chrome
        if (!db.objectStoreNames.contains("mypgpkeys")) {
            var versionRequest = db.setVersion("1");
            versionRequest.onsuccess = function(e) {
                var objectStore = db.createObjectStore("mypgpkeys", {
                    keyPath: "mykeys"
                });
            }
        }



        var transaction = db.transaction("mypgpkeys", "readwrite");


        var objectStore = transaction.objectStore("mypgpkeys");

        objectStore.get(0).onsuccess = function(event) {

            var keys;

            if (event.target.result == null) {
                console.log("no keys available");
                chrome.app.window.create('newUser.html', {
                    "bounds": {
                        "width": 500,
                        "height": 300
                    },
                    "resizable": false,
                    "id": "newUser",
                    "state": "normal"
                }, function(createdWindow) {
                    createdWindow.contentWindow.db = db;
                });


            } else {

                console.log("keys were created successfully");
                keys = event.target.result;
                chrome.app.window.create('loginUser.html', {
                        "bounds": {
                            "width": 500,
                            "height": 150
                        },
                        "resizable": false,
                        "id": "loginUser",
                        "state": "normal"
                    },
                    function(createdWindow) {
                        createdWindow.contentWindow.db = db;
                        createdWindow.contentWindow.keys = keys;
                    });

            }

        }
    }


    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log("hello");
            switch (request.id) {
                case "loginUser":
                    chrome.app.window.get("loginUser").close();

                    chrome.app.window.create('notifications.html', {
                            "id": "notifications",
                            "state": "maximized"
                        },
                        function(createdWindow) {
                            createdWindow.contentWindow.db = db;
                            createdWindow.contentWindow.privateKey = request.privateKey;
                            createdWindow.contentWindow.publicKey = request.publicKey;
                        });

                    break;


                case "newUser":
                    chrome.app.window.get("newUser").close();

                    chrome.app.window.create('loginUser.html', {
                            "bounds": {
                                "width": 500,
                                "height": 150
                            },
                            "resizable": false,
                            "id": "loginUser",
                            "state": "normal"
                        },
                        function(createdWindow) {
                            createdWindow.contentWindow.db = db;
                            createdWindow.contentWindow.keys = request.keys;
                        }
                    );


                    break;

                case "notifications":

                    switch (request.type) {

                        case "openGraph":
                            chrome.app.window.create('graph.html', {
                                    "id": "graph",
                                    "state": "maximized"
                                },
                                function(createdWindow) {
                                    createdWindow.contentWindow.db = db;
                                    createdWindow.contentWindow.privateKey = request.privateKey;
                                    createdWindow.contentWindow.publicKey = request.publicKey;
                                });
                            break;
                    }

                    break;



            }

        }

    );


});
