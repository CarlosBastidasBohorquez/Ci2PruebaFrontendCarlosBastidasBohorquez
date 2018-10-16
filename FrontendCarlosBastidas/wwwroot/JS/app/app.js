function log() {
    document.getElementById('results').innerText = '';

    Array.prototype.forEach.call(arguments, function (msg) {
        if (msg instanceof Error) {
            msg = "Error: " + msg.message;
        }
        else if (typeof msg !== 'string') {
            msg = JSON.stringify(msg, null, 2);
        }
        document.getElementById('results').innerHTML += msg + '\r\n';
    });
}

var authority_url = "https://drsgps.co/identity"; // IdentityServer4
var this_url = "http://localhost:5003"; // entorno de desarrollo

var config = {
    authority: authority_url,
    client_id: "js",
    redirect_uri: this_url+ "/callback.html",
    response_type: "id_token token",
    scope: "openid profile api1",
    post_logout_redirect_uri: this_url+"/index.html",
};
var mgr = new Oidc.UserManager(config);

mgr.getUser().then(function (user) {
    if (user) {
        //log("User logged in", user.profile);
        location.href = "Tareas.html";
    }
    else {
        log("User not logged in");
    }
});

function login() {
    mgr.signinRedirect();
}

function api() {
    mgr.getUser().then(function (user) {
        var url = "http://localhost:5001/identity";

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            log(xhr.status, JSON.parse(xhr.responseText));
        }
        xhr.setRequestHeader("Authorization", "Bearer " + user.access_token);
        xhr.send();
    });
}

function logout() {
    mgr.signoutRedirect();
}

function cambiarColorover(n) {
    document.getElementById(n).style.background = "gainsboro";
}
function cambiarColorout(n) {
    document.getElementById(n).style.background = "";
}



