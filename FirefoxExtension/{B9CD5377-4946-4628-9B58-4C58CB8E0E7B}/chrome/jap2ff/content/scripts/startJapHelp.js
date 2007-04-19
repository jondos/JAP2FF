var autoClose = null;
var centerWindow = null;
function init(inp){
    try{
        
        var cbox = document.getElementById('startAnonlibInfoShowAgainCheckbox');
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    
        if (oPS.getBoolPref("extensions.jap2ff.startAnonLibInfo")){
            cbox.checked=true;
        }
        
        autoClose = inp.setInterval("closeDia()",1000);
        centerWindow = inp.setInterval("doCenter()",2);
        var doc = document.getElementById('startJapHelp');	
        doc.centerWindowOnScreen();
    }catch(e){
        _trace(e);
    }
    
}

var closeCounter = 0;
function closeDia(){
    try{
        var lab = document.getElementById('counterClose');
        lab.value=19-closeCounter+' s';
        if (closeCounter == 19) {
            var doc = document.getElementById('startJapHelp');
            doc.acceptDialog();
        }
        closeCounter++;    
    }catch(e){
        _trace(e);
    }
}

function doCenter(){
    try{
        window.clearInterval(centerWindow);
        var doc = document.getElementById('startJapHelp');
        doc.centerWindowOnScreen();    
    }catch(e){
        _trace(e);
    }
}

function removeCloser(){
   try{
       window.clearInterval(autoClose);
   }catch(e){
       _trace(e);
   }
}

function jap2ff_showAgain(){
    try{
        var cbox = document.getElementById('startAnonlibInfoShowAgainCheckbox');
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        
        if (cbox.checked){
            oPS.setBoolPref("extensions.jap2ff.startAnonLibInfo",true);
        }else{
            oPS.setBoolPref("extensions.jap2ff.startAnonLibInfo",false);
        }
        
    }catch(e){
        _trace(e);
    }
}

function _trace(msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
}