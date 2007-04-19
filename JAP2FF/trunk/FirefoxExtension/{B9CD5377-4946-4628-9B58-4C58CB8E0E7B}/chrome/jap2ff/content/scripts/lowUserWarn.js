var minUserCountIn = 0;
var curUserCountIn = window.arguments[0];

function init(){
    try{
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        var userLevel = oPS.getIntPref("extensions.jap2ff.userLevel");
        minUserCountIn = oPS.getIntPref("extensions.jap2ff.minUserCount");
        var warnOn = oPS.getBoolPref('extensions.jap2ff.minUserWarn');
        if (warnOn){
            document.getElementById('warn_showAgain').setAttribute('checked',true);
        }else{
            document.getElementById('minUserCount').setAttribute('disabled',true);       
            document.getElementById('warn_showAgain').removeAttribute('checked');
        }
        if (userLevel>1){
            document.getElementById('minUserCount').value=minUserCountIn;
            document.getElementById('lowUserCountLabel1').removeAttribute('collapsed');
            document.getElementById('lowUserCountLabel2').removeAttribute('collapsed');
            document.documentElement.getButton('extra1').removeAttribute('collapsed',true);                   
        }else if (userLevel==1){
            document.getElementById('minUserCount').setAttribute('collapsed',true);
            document.getElementById('lowUserCountLabel1').setAttribute('collapsed',true);
            document.getElementById('lowUserCountLabel2').setAttribute('collapsed',true);
            document.documentElement.getButton('extra1').setAttribute('collapsed',true);            
        }else {
            document.getElementById('minUserCount').setAttribute('collapsed',true);
            document.getElementById('warn_showAgain').setAttribute('collapsed',true);
            document.getElementById('lowUserCountLabel1').setAttribute('collapsed',true);
            document.getElementById('lowUserCountLabel2').setAttribute('collapsed',true);
            document.documentElement.getButton('extra1').setAttribute('collapsed',true);            
        }
        
        //setting Stringbundle things ....
        
        var bundle = srGetStrBundle("chrome://jap2ff/locale/jap2ff.properties");

        var tmpString = bundle.GetStringFromName("jap2ff.lowUserWarn.tooltip.accept");      
        document.documentElement.getButton('accept').setAttribute('tooltiptext',tmpString);
        
        tmpString = bundle.GetStringFromName("jap2ff.lowUserWarn.tooltip.cancel");
        document.documentElement.getButton('cancel').setAttribute('tooltiptext',tmpString);

        tmpString = bundle.GetStringFromName("jap2ff.lowUserWarn.tooltip.extra1");
        document.documentElement.getButton('extra1').setAttribute('tooltiptext',tmpString);
        
        tmpString = bundle.GetStringFromName("jap2ff.lowUserWarn.tooltip.extra2");
        document.documentElement.getButton('extra2').setAttribute('tooltiptext',tmpString);
        
        
        tmpString = bundle.GetStringFromName("jap2ff.lowUserWarn.curCount");
        var helpValue = document.getElementById('lowUserCountLabel2').value;
        var tmpCountValue = 0;
        if (curUserCountIn >= 0){
            tmpCountValue = curUserCountIn;
        }else{
            tmpCountValue = bundle.GetStringFromName("jap2ff.browser.unknown");
        }
        document.getElementById('lowUserCountLabel2').value = helpValue+' ('+tmpString+' '+tmpCountValue+')';
        
        
    }catch(e){
        _trace(e);
    }

}

function changeWarning(inp){
   try{
       var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
       if (inp.checked){
           oPS.setBoolPref('extensions.jap2ff.minUserWarn',false);
           document.getElementById('minUserCount').setAttribute('disabled',true);       
       }else{
           document.getElementById('minUserCount').removeAttribute('disabled');       
           oPS.setBoolPref('extensions.jap2ff.minUserWarn',true);
       }
   }catch(e){
        _trace(e);   
   }
}

function doOK(){
    var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    oPS.setIntPref('extensions.jap2ff.minUserBack',0);
    //check_minUserCount();
    return true;
}

function doCancel(){
    var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    oPS.setIntPref('extensions.jap2ff.minUserBack',1);
    check_minUserCount();       
    return true;
}

function doExtra1(){
    var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    oPS.setIntPref('extensions.jap2ff.minUserBack',2);
    if (oPS.getIntPref("extensions.jap2ff.userLevel") == 2){
        check_minUserCount();
    }    
    self.close();       

}

function doExtra2(){
    var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    oPS.setIntPref('extensions.jap2ff.minUserBack',2);
    oPS.setIntPref('extensions.jap2ff.minUserCount',-1)
    self.close();
}

function check_minUserCount(){
    try{
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        if (oPS.getIntPref("extensions.jap2ff.userLevel") == 2 && minUserCountIn > -1){
            if (document.getElementById('minUserCount').value!=minUserCountIn && document.getElementById('minUserCount').value > 1){
                oPS.setIntPref('extensions.jap2ff.minUserCount',eval(document.getElementById('minUserCount').value));
            }else{
                oPS.setIntPref('extensions.jap2ff.minUserCount',eval(curUserCountIn));
            }    
        }
    }catch(e){_trace(e);}    
}

function _trace(msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
}