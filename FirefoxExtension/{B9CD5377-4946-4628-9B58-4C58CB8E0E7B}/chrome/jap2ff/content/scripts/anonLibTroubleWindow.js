var centerWindow = null;

function init(inp){
        
    centerWindow = inp.setInterval("doCenter()",2);
}

function doCenter(){
    try{
        window.clearInterval(centerWindow);
        var doc = document.getElementById('anonLibTroubleWindow');
        doc.centerWindowOnScreen();    
    }catch(e){
        _trace(e);
    }
}
function _trace(msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
}