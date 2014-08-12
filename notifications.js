window.onload = function() {

    $("#graph").click(function() {

        chrome.runtime.sendMessage({
            id: "notifications",
            type: "openGraph",
            publicKey: publicKey,
            privateKey: privateKey
        }, function() {});

        event.preventDefault();

    });
};
