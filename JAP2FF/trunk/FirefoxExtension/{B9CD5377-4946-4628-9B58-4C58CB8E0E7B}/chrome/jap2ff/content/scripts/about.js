var centerWindow = null;

function init(inp){
    
    //init 
    try{
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        var pSite = document.getElementById('jap2ff_projectSite');
        pSite.value = oPS.getCharPref("extensions.jap2ff.projectSite");
        var pMail = document.getElementById('jap2ff_mail');
        pMail.value = oPS.getCharPref("extensions.jap2ff.mail");
    }catch(e){
        _trace(e);
    }
    getVersions();    
    centerWindow = inp.setInterval("doCenter()",2);

}

function doCenter(){
    try{
        window.clearInterval(centerWindow);
        var doc = document.getElementById('aboutJap2FF');
        doc.centerWindowOnScreen();    
    }catch(e){
        _trace(e);
    }
}

function getVersions(){
             
    //jap2ff extension version
    try{
        
        var extManager = Components.classes["@mozilla.org/extensions/manager;1"].createInstance(Components.interfaces.nsIExtensionManager);
        var tmpUpdateItem = extManager.getItemForID('{B9CD5377-4946-4628-9B58-4C58CB8E0E7B}');
        var tmpVers='';
        if (tmpUpdateItem instanceof Components.interfaces.nsIUpdateItem){
            tmpVers = tmpUpdateItem.version;
        }     
        var labe = document.getElementById('jap2ff_version');
        labe.value = tmpVers;    
    }catch(e){
        _trace(e);
    }
    //anonlib version
    try{
        var JAP2FFClassLoader = Components.classes["@jap2ff;1"].getService(Components.interfaces.nsISupports); 
        if (!JAP2FFClassLoader.wrappedJSObject.initialize(java, true)) {
	    } 
	    var japStarter = JAP2FFClassLoader.wrappedJSObject.getJapStarter();
	    var text = japStarter.getLibVers();	     
	    var lab = document.getElementById('anonlibVersion');
        lab.value=text;
    }catch(e){
        _trace(e);
    }
}

function jap2ff_ShowProjectSite(inp){
		
			opener.gBrowser.selectedTab = opener.getBrowser().addTab(inp);
    
}

function jap2ff_sendMail2Team(inp){
  
    var mailtoUrl = inp ? "mailto:"+inp : "mailto:";

    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var uri = ioService.newURI(mailtoUrl, null, null);
    
    var extProtocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"].getService(Components.interfaces.nsIExternalProtocolService);
    if (extProtocolSvc)
       extProtocolSvc.loadUrl(uri);
 
}


function _trace(msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
}