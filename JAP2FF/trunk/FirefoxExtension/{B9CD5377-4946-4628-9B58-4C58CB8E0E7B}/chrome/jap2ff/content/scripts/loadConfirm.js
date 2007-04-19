

function init(){
    try{
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        var userLevel = oPS.getIntPref("extensions.jap2ff.userLevel");
        if (userLevel>0){
            var warnOn = oPS.getBoolPref('extensions.jap2ff.loadConfirm');
            if (warnOn){
                document.getElementById('warn_showAgain').setAttribute('checked',true);
            }else{
                document.getElementById('warn_showAgain').removeAttribute('checked');
            }            
        }else{
            document.getElementById('warn_showAgain').setAttribute('collapsed',true);
        }
        
        
    }catch(e){
        _trace(e);
    }

}

function changeWarning(inp){
   try{
       var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
       if (inp.checked){
           oPS.setBoolPref('extensions.jap2ff.loadConfirm',false);       
       }else{
           oPS.setBoolPref('extensions.jap2ff.loadConfirm',true);
       }
   }catch(e){
        _trace(e);   
   }
}

function doOK(){
    var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    oPS.setBoolPref('extensions.jap2ff.loadConfirmBack',true);
    return true;
}

function doCancel(){
    var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    oPS.setBoolPref('extensions.jap2ff.loadConfirmBack',false);
    return true;
}

function _trace(msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
}