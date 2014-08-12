window.onload = function() {

    $("#newIdentity").submit(function(event) {

        //remove previous error
        $("#error").remove();

        var fname = $("#newIdentity #first_name").val();
        var lname = $("#newIdentity #last_name").val();

        var npass = $("#newIdentity #password").val();
        var npass2 = $("#newIdentity #retyped_password").val();

        if (fname == "" || lname == "") {

            $("h1").after("<span id='error'> Please provide both your first and last name.</span>");
        } else {

            if (npass != npass2) {

                $("h1").after("<span id='error'> The 2 passwords do not match.</span>");

            } else {

                if (npass.length < 8) {

                    $("h1").after("<span id='error'> The password must be of at least 8 length.</span>");
                } else {

                    $("body").empty();
                    $("body").append("Your Ryaki identity is generated. Please Wait... ");
                    setTimeout(function() {
                        var key = openpgp.generateKeyPair({
                            numBits: 2048,
                            userId: (fname + " " + lname),
                            passphrase: npass
                        });

                        var keys = {};
                        keys.mykeys = 0;
                        keys.privateKey = key.privateKeyArmored;
                        keys.publicKey = key.publicKeyArmored;

                        db.transaction("mypgpkeys", "readwrite").objectStore("mypgpkeys").add(keys);

                        console.log("ok");

                        db.transaction("mypgpkeys", "readonly").objectStore("mypgpkeys").get(0).onsuccess = function(event) {
                            keys = event.target.result;
                        }


                        chrome.runtime.sendMessage({
                            id: "newUser",
                            keys: keys,
                        }, function() {});


                    }, 10);
                }
            }
        }
        event.preventDefault();

    });
}
