window.onload = function() {

    $("#loginUser").submit(function(event) {
        console.log("password submitted");
        var password = $("#loginUser #password").val();

        var privateKey = openpgp.key.readArmored(keys.privateKey).keys[0];
        var publicKey = openpgp.key.readArmored(keys.privateKey).keys[0];


        var success = privateKey.decrypt(password);

        if (success) {

            chrome.runtime.sendMessage({
                id: "loginUser",
                publicKey: publicKey,
                privateKey: privateKey
            }, function() {});


        } else {

            //remove previous error
            $("#error").remove();
            $("h1").after("<span id='error'> Wrong Password.</span>");


        }
        event.preventDefault();

    });

}
