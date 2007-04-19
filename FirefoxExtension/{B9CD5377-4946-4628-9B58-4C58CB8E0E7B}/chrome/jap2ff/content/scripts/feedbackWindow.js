
function jap2ff_showAgain(){
    try{
        var cbox = document.getElementById('feedbackWindowShowAgainCheckbox');
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        
        if (cbox.checked){
            oPS.setBoolPref("extensions.jap2ff.showFeedbackWindow",true);
        }else{
            oPS.setBoolPref("extensions.jap2ff.showFeedbackWindow",false);
        }
        
    }catch(e){
        _trace(e);
    }
}

var centerWindow = null;

function init(inp){
    
    var cbox = document.getElementById('feedbackWindowShowAgainCheckbox');
    var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    
    if (oPS.getBoolPref("extensions.jap2ff.showFeedbackWindow")){
        cbox.checked=true;
    }
    var tmpDesc = document.getElementById("feedbackWinDesc_5");
    var tmpValue = tmpDesc.value;
    tmpDesc.value = tmpValue+oPS.getCharPref("extensions.jap2ff.mail"); 
    centerWindow = inp.setInterval("doCenter()",2);
}

function doCenter(){
    try{
        window.clearInterval(centerWindow);
        var doc = document.getElementById('feedBackWin');
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