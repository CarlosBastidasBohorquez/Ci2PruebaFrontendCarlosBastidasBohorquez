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
//urls
var api_url = "https://drsgps.co/protectedapi"
var authority_url = "https://drsgps.co/identity"; // IdentityServer4
var this_url = "http://localhost:5003"; // entorno de desarrollo
//identity
var config = {
    authority: authority_url,
    client_id: "js",
    redirect_uri: this_url + "/callback.html",
    response_type: "id_token token",
    scope: "openid profile api1",
    post_logout_redirect_uri: this_url + "/index.html",
};
var mgr = new Oidc.UserManager(config);

//Validacion autenticación
mgr.getUser().then(function (user) {
    if (user) {
        $("#NameUser").text(user.profile.name);
        document.getElementById("filtroTareTodas").checked = true;
        Filtro();
    }
    else {
        location.href = "index.html";
    }
});

function login() {
    mgr.signinRedirect();
}



//función cerrar sesión
function logout() {
    mgr.signoutRedirect();
}

//valida datos pra crear una tarea
function CrearTarea()
{
    if ($("#descripCrear").val() == "" || $("#fechaVencCrear").val() == "")
    {
        if ($("#descripCrear").val() == "")
            document.getElementById("descripCrear").style.border = "1px solid red"; 
        if ($("#fechaVencCrear").val() == "")
            document.getElementById("fechaVencCrear").style.border = "1px solid red"; 
    }
    else
    {
    var Vlrtarea = {
        descripcion: $("#descripCrear").val(),
        fechaVencimiento: $("#fechaVencCrear").val()
    }
        CrearTareaAPI(Vlrtarea);
    }
}

//Función para llamar el servicio de agregar una nueva tarea
function CrearTareaAPI(Vlrtarea)
{
    mgr.getUser().then(function (user) {
        var urlapi = api_url + "/tareas/crear"
        var xmlHRe = new XMLHttpRequest();
        xmlHRe.open("POST", urlapi);
        xmlHRe.setRequestHeader("Content-Type", "application/json");
        xmlHRe.onload = function () {
            $("#MdAgregarTarea").modal("hide");
            $("#AlertaExtio").hide();
            $("#AlertaExtio").show();
            limpiarModalCrear();
            $("#lblAlerta").text("La tarea se agrego satisfactoriamente");
            Filtro();
        }
        xmlHRe.setRequestHeader("Authorization", "Bearer " + user.access_token);
        xmlHRe.send(JSON.stringify(Vlrtarea));
    });
}

function limpiarModalCrear()
{
    $("#descripCrear").val("");
    $("#fechaVencCrear").val("");
}
function limpiarModalActualizar() {
    $("#descAct").val("");
    $("#fechaVencAct").val("");
    document.getElementById("InpPendiente").checked = true;
    document.getElementById("InpFinalizada").checked = true;
}

function ValidarVa()
{
    if ($("#descripCrear").val() != "") 
        document.getElementById("descripCrear").style.border = ""; 
    if ($("#fechaVencCrear").val() != "")
        document.getElementById("fechaVencCrear").style.border = ""; 

}

function ValidarAc() {
    if ($("#descAct").val() != "")
        document.getElementById("descAct").style.border = "";
    if ($("#fechaVencAct").val() != "")
        document.getElementById("fechaVencAct").style.border = "";
}

function LimpiarBorA(){
        document.getElementById("descAct").style.border = "";
        document.getElementById("fechaVencAct").style.border = "";
}
function LimpiarBorC() {
        document.getElementById("descripCrear").style.border = "";
        document.getElementById("fechaVencCrear").style.border = ""; 
}



function CerrarAlerta(n)
{
    if (n==1)
        $("#AlertaExtio").hide();
    if (n == 2)
        $("#AlertaAdver").hide();
}

//Función para llamar el servicio de listar tareas
function ListarTareasApi(Filtro) {
    mgr.getUser().then(function (user) {
        var urlapi = api_url + "/tareas/consultar?" + Filtro;
        var xmlHRe = new XMLHttpRequest();
        xmlHRe.open("GET", urlapi);
        xmlHRe.onload = function () {
            var Listatareas = JSON.parse(xmlHRe.responseText);
            var card = '';
            var No = 'No';
            var Si = 'Si';
            Listatareas.forEach(function (ConTarea) {

                $("#AlertaAdver").hide();

                card += '<li id="' + ConTarea.id + '" onmouseout="cambiarColorout(\'' + ConTarea.id + '\')" class="list-group-item" onmouseover="cambiarColorover(\'' + ConTarea.id + '\')" class="list-group-item" style="border-radius:25px"><div class="card-body" >';
                card += '<h5 class="card-title">Descripción:';
                card += '<label id="desc' + ConTarea.id + '">' + ConTarea.descripcion + '</label></h5>';
                card += '<h6 class="card-subtitle mb-2 text-muted">Fecha de vencimiento: '
                card += '<label id="fechaVenc' + ConTarea.id + '">' + ConTarea.fechaVencimiento.substring(0, 10) + '</label></h6>'
                card += '<p class="card-text">Finalizada:';
                card += '<label id="Estado' + ConTarea.id + '">' + (ConTarea.finalizada == true ? Si : No) + '</label></p>';
                card += '<a class="card-button" style="margin-left:5%"><button value="' + ConTarea.id + '" onclick="MdActuali(\'' + ConTarea.id + '\')" name="actualizarTarea" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-edit"></span> Actualizar</button></a>';
                card += '<a class="card-button" style="margin-left:60%"><button value="' + ConTarea.id + '" onclick="MdBorrar(\'' + ConTarea.id + '\')" name="actualizarTarea" type="button" class="btn btn-primary" style="background-color:darkslategray;border-color:darkslategray"><span class="glyphicon glyphicon-trash"></span> Borrar</button></a>';
                card += '</div></li>';

              
            });
            document.getElementById("ListaTareas").innerHTML = card;
            if (Listatareas.length == 0)
            {
                $("#AlertaAdver").hide();
                $("#AlertaAdver").show();
                $("#lblAlertaAdver").text("No hay tareas registradas con los filtros seleccionados");
            }
        }
        xmlHRe.setRequestHeader("Authorization", "Bearer " + user.access_token);
        xmlHRe.send(null);
    });
}


//cambiar el fondo de las card
function cambiarColorover(n)
{
    document.getElementById(n).style.background = "gainsboro";
}
function cambiarColorout(n) {
    document.getElementById(n).style.background = "";
}

//datos para filtrar al llamar el servicio de consulta de tareas
function Filtro()
{
    var FiltroDescipcion = "";
    var filtroConsultaGlobal = "";

    if ($("#textoTareDescripcion").val() != "") {
        FiltroDescipcion = "descripcion=" + $("#textoTareDescripcion").val();
        filtroConsultaGlobal = FiltroDescipcion;
    }

    if ($('#filtroTareTodas').is(':checked'))
    {
    }
    if ($('#filtroTareFinalizadas').is(':checked')) {

        if (filtroConsultaGlobal != "")
        {
            filtroConsultaGlobal += "&";
        }
        filtroConsultaGlobal += "finalizada=true";
     
    }
    if ($('#filtroTarePendientes').is(':checked')) {
        if (filtroConsultaGlobal != "") {
            filtroConsultaGlobal += "&";
        }
        filtroConsultaGlobal += "finalizada=false";      
    }

    ListarTareasApi(filtroConsultaGlobal);

}


function FiltroBoton()
{
    var consultaRadio = Filtro();
    var consulGLobal = "";

    if ($("#textoTareDescripcion").val() != "") {
        consulGLobal = "descripcion=" + $("#textoDescripcion").val();
        consulGLobal += consultaRadio;
    }
}

//abre el modal de eliminar tarea
function MdBorrar(id) {
    $("#lblidElimi").text(id);
    $("#descElimi").text($("#desc" + id).text());
    $("#fechaVencElimi").val($("#fechaVenc" + id).text().substring(0, 10));
    if ($("#Estado" + id).text() == 'No') {
        $("#InpPendienteElimi").attr("checked", true);
        
    }
    else {
        $("#InpFinalizadaElimi").attr("checked", true);
       
    }

    $("#MdEliminarTarea").modal("show");
}

//abre el modal de actualizar tarea
function MdActuali(id)
{
    LimpiarBorA();
    $("#lblid").text(id);
    $("#descAct").val($("#desc" + id).text());
    $("#fechaVencAct").val($("#fechaVenc" + id).text().substring(0, 10));
    if ($("#Estado" + id).text() == 'No') {
        //$("#InpPendiente").attr("checked", true);
       
       
        document.getElementById("InpPendiente").checked = true;
    }
    else {
        //$("#InpFinalizada").attr("checked", true);
       
        document.getElementById("InpFinalizada").checked = true;
    }
    
    $("#MdActualizarTarea").modal("show");
}

//Función para llamar el servicio de eliminar una tarea
function EliminarTarea() {

    var idTar = $("#lblidElimi").text()
    mgr.getUser().then(function (user) {
        var urlapi = api_url + "/tareas/borrar"
        var xmlHRe = new XMLHttpRequest();
        xmlHRe.open("POST", urlapi);
        xmlHRe.setRequestHeader("Content-Type", "application/json");
        xmlHRe.onload = function () {
            $("#MdEliminarTarea").modal("hide");
            $("#AlertaExtio").hide();
            $("#AlertaExtio").show();
            $("#lblAlerta").text("La tarea se elimnino satisfactoriamente");
            $("#lblidElimi").text(null);
            Filtro();
        }
        xmlHRe.setRequestHeader("Authorization", "Bearer " + user.access_token);
        xmlHRe.send(JSON.stringify({ id: idTar }));
    });
}

//Función para llamar el servicio de actualizar una tarea
function ActualizarTarea()
{
    if ($("#descAct").val() == "" || $("#fechaVencAct").val() == "") {
        if ($("#descAct").val() == "")
            document.getElementById("descAct").style.border = "1px solid red";
        if ($("#fechaVencAct").val() == "")
            document.getElementById("fechaVencAct").style.border = "1px solid red";
    }
    else
    {
    if ($("#lblid").text() != null) {
        var Detalletarea = {
            id: $("#lblid").text(),
            descripcion: $("#descAct").val(),
            fechaVencimiento: $("#fechaVencAct").val(),
            finalizada: $('#InpFinalizada').is(':checked')
        }

        mgr.getUser().then(function (user) {
            var urlapi = api_url + "/tareas/actualizar"
            var xmlHRe = new XMLHttpRequest();
            xmlHRe.open("POST", urlapi);
            xmlHRe.setRequestHeader("Content-Type", "application/json");
            xmlHRe.onload = function () {
                $("#MdActualizarTarea").modal("hide");
                $("#AlertaExtio").hide();
                $("#AlertaExtio").show();
                limpiarModalActualizar();
                $("#lblAlerta").text("La tarea se actualizo satisfactoriamente");
                $("#lblid").text(null);
                Filtro();
            }
            xmlHRe.setRequestHeader("Authorization", "Bearer " + user.access_token);
            xmlHRe.send(JSON.stringify(Detalletarea));
        });
        
        }
    }
}

