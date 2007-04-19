    function jap2ff_ShowJavaPref(){
		openPreferences("jap2ffPanePriv");
  }
  
    
  function jap2ff_setJavaOn(){
      try{
          var pS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
	      pS.setBoolPref("security.enable_java",true);
		  if (pS.getIntPref("extensions.jap2ff.startOption")==2)  pS.setBoolPref("extensions.jap2ff.setOn",true);
	      myGoQuitApplication();
	  }catch(e){_trace("setJavaOn: "+e)}
  }
  
  function myCanQuitApplication()
  {
      var os = Components.classes["@mozilla.org/observer-service;1"]
                     .getService(Components.interfaces.nsIObserverService);
      if (!os) return true;
  
      try {
        var cancelQuit = Components.classes["@mozilla.org/supports-PRBool;1"]
                              .createInstance(Components.interfaces.nsISupportsPRBool);
        os.notifyObservers(cancelQuit, "quit-application-requested", null);
    
        // Something aborted the quit process. 
        if (cancelQuit.data)
          return false;
        }
      catch (ex) { }
      os.notifyObservers(null, "quit-application-granted", null);
      return true;
  }
  
  function myGoQuitApplication()
  {
    if (!myCanQuitApplication())
      return false;

    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
    var windowManagerInterface = windowManager.QueryInterface( Components.interfaces.nsIWindowMediator);
    var enumerator = windowManagerInterface.getEnumerator( null );
      //  var appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].
      //                 getService(Components.interfaces.nsIAppStartup);

    while ( enumerator.hasMoreElements()  )
    {
       var domWindow = enumerator.getNext();
       if (("tryToClose" in domWindow) && !domWindow.tryToClose())
         return false;
       domWindow.close();
    };
    //appStartup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit | appStartup.eRestart);
    
    var appStartup = 
        Components.classes["@mozilla.org/toolkit/app-startup;1"].
        getService(Components.interfaces.nsIAppStartup);
    appStartup.quit(appStartup.eRestart); //appStartup.eAttemptQuit |
    return true; 
  }
  
  function jap2ff_showPlugins(){
      try{
          _trace('showPlugins');
          var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
          var myBrowser = (wm.getMostRecentWindow('navigator:browser').document).getElementById('content');
          
          var url = 'about:plugins';
          myBrowser.mCurrentBrowser.loadURIWithFlags( url ,  Components.interfaces.nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE , null , null); 
          //document.getElementById('noJavaPluginHelp').acceptDialog();
          return true;          
      }catch(e){
          _trace(e);
      }
      return false;    
  }
  
  function jap2ff_noJavaPluginHelp_init(){
      try{
          var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
          
          var myEnum = wm.getMostRecentWindow('navigator:browser');
          
          if (myEnum==null){
              document.getElementById('noJavaPluginHelp').getButton('extra1').setAttribute('collapsed',true);    
          }
          
          var pS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          document.getElementById('jap2ff_downloadJavaLabel').value = pS.getCharPref("extensions.jap2ff.downloadJava_1");
          document.getElementById('jap2ff_forumUrl').value = pS.getCharPref("extensions.jap2ff.pluginFailureJavaFourm");    
      }catch(e){
          _trace(e);
      }
  }
  
  function jap2ff_ShowSite(inp){
		
      opener.gBrowser.selectedTab = opener.getBrowser().addTab(inp);
    
  }
  
  function  _trace(msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
  }