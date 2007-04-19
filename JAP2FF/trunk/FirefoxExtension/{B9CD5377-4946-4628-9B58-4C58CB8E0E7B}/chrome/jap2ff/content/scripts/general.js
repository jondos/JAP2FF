/*
* 2006
* Copyright JAP-2-Firefox Project, All rights reserved
*/
  
  
var jap2ffGeneral = new Object();
  
jap2ffGeneral.meter = new Array("meterD_noBlink.gif","meterNnew.gif","meter1.gif","meter2.gif","meter3.gif","meter4.gif","meter5.gif","meter6.gif")
  
jap2ffGeneral.icons = new Array("icon16_off.gif","icon16_anonLevel_uk.gif","icon16_anonLevel_red.gif","icon16_anonLevel_red.gif","icon16_anonLevel_blue.gif","icon16_anonLevel_blue.gif","icon16_anonLevel_green.gif","icon16_anonLevel_green.gif");
jap2ffGeneral.iconsT = new Array("icon16_off.gif","icon16_anonLevel_uk.gif","icon16_anonLevel_red.gif","icon16_anonLevel_red.gif","icon16_anonLevel_blue.gif","icon16_anonLevel_blue.gif","icon16_anonLevel_green.gif","icon16_anonLevel_green.gif");
//jap2ffGeneral.iconsT = new Array("icon16_off.gif","icon16_anonLevel_uk_trans.gif","icon16_anonLevel_red_trans.gif","icon16_anonLevel_red_trans.gif","icon16_anonLevel_blue_trans.gif","icon16_anonLevel_blue_trans.gif","icon16_anonLevel_green_trans.gif","icon16_anonLevel_green_trans.gif");
 
jap2ffGeneral.anonbar = new Array("anonOff.jpg", "anonStateUnknown.jpg", "anon1.jpg", "anon2.jpg", "anon3.jpg", "anon4.jpg", "anon5.jpg", "anon6.jpg");
   
jap2ffGeneral.meterText = new Array(); //init later
                                      //'jap2ff_toolbar-casc-menu-list',  
jap2ffGeneral.menuArray = new Array('jap2ff_toolbar-casc-menu-list', 'jap2ff_menu-kasc-menu-list', 'jap2ff_statusbar-kask-menu-list', 'jap2ff_context-kask-menu-list');
jap2ffGeneral.menuArray2 = new Array('jap2ff_casc-list', 'jap2ff_casc-list-label', 'jap2ff_menu-kask-menu', 'jap2ff_statusbar-kask-menu', 'jap2ff-kask-context');
  
jap2ffGeneral.reloadIcons = new Array('reload.gif', 'reloadrollover.gif', 'reloaddisabled_anim.gif');
  
jap2ffGeneral.anonState = new Array(); //init later
  
jap2ffGeneral.aktive = null;
jap2ffGeneral.setOn = false; //is proxy set on ?
jap2ffGeneral.startJapManual = false; // is manual start set on?
jap2ffGeneral.setOnStart = false;
jap2ffGeneral.anonLevel = 0;
jap2ffGeneral.userCount = -1;   // init later 
jap2ffGeneral.cascName ='';     // set later
jap2ffGeneral.showJavaFailure = false;
jap2ffGeneral.winCount = 0; 
  
jap2ffGeneral.oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");

jap2ffGeneral.userLevel = jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.userLevel"); 

jap2ffGeneral.invisibleToolbar = true;
jap2ffGeneral.invisibleStateIcon = true;
jap2ffGeneral.isPopup = false;
  
jap2ffGeneral.refreshToolbar = null;
jap2ffGeneral.refreshCascState = null;
jap2ffGeneral.refreshCascStateCount = 0;
jap2ffGeneral.noMixCascadeWithMinUserCount = false;
jap2ffGeneral.listInitValue=null;
jap2ffGeneral._init = true;
jap2ffGeneral.connection2MixLost = false;
   
// Bug JAVA an JS, prevent run without full init 
jap2ffGeneral.reInitRef = null;
jap2ffGeneral.reInit = function(){
    if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.setOn") && jap2ffGeneral._getJapC_JAPController==null){
        jap2ffGeneral.jap2ff_init();
    }else{
        if (jap2ffGeneral.reInitRef != null){
            window.clearInterval(jap2ffGeneral.reInitRef);
        }  
    }    
}
  
    
  // init 
  
jap2ffGeneral.jap2ff_init = function(){
    window.removeEventListener("load", jap2ffGeneral.jap2ff_init, true);
	try{
	 
	    var bundle = srGetStrBundle("chrome://jap2ff/locale/jap2ff.properties");
	 
	    jap2ffGeneral.meterText = new Array(
            bundle.GetStringFromName("jap2ff.browser.n_a"),
            bundle.GetStringFromName("jap2ff.browser.unknown"),
            bundle.GetStringFromName("jap2ff.browser.low"),
            bundle.GetStringFromName("jap2ff.browser.low"),
            bundle.GetStringFromName("jap2ff.browser.middle"),
            bundle.GetStringFromName("jap2ff.browser.middle"),
            bundle.GetStringFromName("jap2ff.browser.high"),
            bundle.GetStringFromName("jap2ff.browser.high")
        );
	 
	    jap2ffGeneral.userCount = bundle.GetStringFromName("jap2ff.browser.n_a"); 
		
		jap2ffGeneral.anonState = new Array(
		    bundle.GetStringFromName("jap2ff.state.n_a"),
		    bundle.GetStringFromName("jap2ff.state.down"),
   	        bundle.GetStringFromName("jap2ff.state.ready"),
		    bundle.GetStringFromName("jap2ff.state.trans"),
		    bundle.GetStringFromName("jap2ff.state.start")
		);
		
		//check ob 1. Browser Fenster
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
        
		var enumr = wm.getEnumerator('navigator:browser'); 
        var winCount = 0;
        while(enumr.hasMoreElements()){
            if (winCount>1) break;
            winCount++;
            enumr.getNext();
        }
       
 	    var closeAfter = false;
        jap2ffGeneral.winCount = winCount;
       
        //check 
        if (!jap2ffGeneral.oPS.getBoolPref('security.enable_java')
            && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.enable_java")
           )
        {   //need reset!
            jap2ffGeneral.oPS.setBoolPref('extensions.jap2ff.enable_java',false)
        }       
            
        if (winCount>= 1 && !jap2ffGeneral.oPS.getBoolPref('security.enable_java') 
            && !jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.enable_java")
           )
        {
            closeAfter = true;
            var tmpWin = wm.getMostRecentWindow('navigator:browser');
            jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.enable_java",true);
            jap2ffGeneral.oPS.setBoolPref("security.enable_java",true);
	        
	        var args = tmpWin.arguments;
	        
	        var menubar     = tmpWin.menubar.visible;
	        var locationbar  = tmpWin.locationbar.visible;
	        var toolbar     = tmpWin.toolbar.visible;
	        var personalbar = tmpWin.personalbar.visible;
	        var scrollbars  = tmpWin.scrollbars.visible;
	        var statusbar   = tmpWin.statusbar.visible;
	        
	        
	        var options = '';
	        if (menubar)      options+=', menubar'; 
	        if (toolbar)      options+=', toolbar';
	        if (locationbar) options+=', location'; 
	        if (scrollbars)   options+=', scrollbars'; 
	        if (statusbar)   options+=', status'; 
	        
	        if (options == '') options = null;
			
	        var href = null;
	        //popups have no args :-(
            if ((args && args.length > 0) || winCount == 1 ){
	            if (winCount!=1)
	                href = args[0];
	            var charsetArg = null;
	            charsetArg = "charset=" + tmpWin.content.document.characterSet;
	            
	            var tmpURI = null;
	            if (args && args.length > 2) tmpURI = args[2];
	            var referrerURI = null;
	            if (tmpURI && tmpURI instanceof Components.interfaces.nsIURI){
	                referrerURI = tmpURI;
	            }
	            var postData = null; //last parameter postData not null check it!
	            
	            if (winCount>1 && tmpWin.opener){
	                if (!referrerURI){
	                    referrerURI = href ? makeURI(href) : null;
	                }
                    tmpWin.opener.jap2ffGeneral.openNewWinWith(href, charsetArg, referrerURI, postData, options); 
	            }else{
	                if (!referrerURI){
	                    referrerURI = href ? makeURI(href) : null;
	                }
	                tmpWin.jap2ffGeneral.openNewWinWith(href, charsetArg, referrerURI, postData);
	            }
	            
                tmpWin.close();
                
            }else{
                // is POPUP !!!
				closeAfter = true;
	            jap2ffGeneral.isPopup = true;
	        }
	       
        }
        
		if (winCount==1 && !closeAfter)
        {
            //check java plugin
            var testWin = wm.getMostRecentWindow('navigator:browser');
            var testNav = testWin.navigator;
            var testPlugins = testNav.plugins;
            var testFoundJavaPlugin = false;
            for (i=0;i<testPlugins.length;i++){
                var testPluginsItem = testPlugins[i];
				if (testPluginsItem.description
                    && (testPluginsItem.description.indexOf('Java') > -1) 						
						&& (testPluginsItem.description.indexOf('Plug-in') > -1)
					)
				{
                    testFoundJavaPlugin = true;
                    break;
                }
            }
            
            if (!testFoundJavaPlugin){
                jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.pluginFailureJava",true);
                window.setTimeout("window.openDialog('chrome://jap2ff/content/dialogs/noJavaPluginHelp.xul','Warning','centerscreen, chrome, modal')",800);
            }else{
                jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.pluginFailureJava",false);
                
                try{    
                    //anonlib starttrouble check
                    var dbDir = getDataBaseDir();
                    if (dbDir!=null){
                        var path = dbDir+'anonlibStart.rdf';
                        var rdfS = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
                        var dSource = rdfS.GetDataSourceBlocking(path);
                       
                        var startAnon = rdfS.GetResource('chrome://jap2ff/startAnonLib');
                        var startState = rdfS.GetResource('lastStartWithAnonLibOkay');
                        var target = dSource.GetTarget(startAnon, startState, true);
                        if (target instanceof Components.interfaces.nsIRDFInt){
                        }else{
                            jap2ffGeneral._trace('target = null');
                            target=null;
                        }
                       
                        if (target!=null && target.Value > 0 
                            && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.setOn") 
                           )
                        {   
                            jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.setOn",false);
                            jap2ffGeneral.removeAnonDetails();  
                            window.openDialog("chrome://jap2ff/content/dialogs/anonLibTroubleWindow.xul","","centerscreen, chrome, modal");
                            
                            dSource.Unassert(startAnon, startState, target);
                            target = rdfS.GetIntLiteral(0);
                            dSource.Assert(startAnon, startState, target, true);
                            if (dSource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource)){
                                dSource.Flush();
                                dSource.Refresh(true);
                            }    
                           
                        }else{
                            if (target!=null){
                                dSource.Unassert(startAnon, startState, target);
                            }
                            target = rdfS.GetIntLiteral(1);
                            dSource.Assert(startAnon, startState, target, true);
                            if (dSource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource)){
                                dSource.Flush();
                                 dSource.Refresh(true);
                            }    
                        }
                       
                        if (dSource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource)){
                            dSource.Flush();
                            dSource.Refresh(true);
                        }    
                    }
                }catch(e){
                    jap2ffGeneral._trace(e);
                }    
                
                // check and reset minUserCount 
                if ( jap2ffGeneral.oPS.prefHasUserValue("extensions.jap2ff.minUserCount") 
                    && jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.minUserCount") == -1)
                {
                    jap2ffGeneral.oPS.clearUserPref("extensions.jap2ff.minUserCount");
                }     
                 
                //init infoservice databases
                jap2ff_loadDB2('infoservices.rdf');
                 
                //init  mix databases
		        //jap2ff_loadDB(); still to buggy
		         
		        //check proxy settings
		          
		        if (jap2ffGeneral.oPS.getPrefType("network.proxy.type") == jap2ffGeneral.oPS.PREF_INT 
		            && jap2ffGeneral.oPS.getIntPref("network.proxy.type") == 1
		           )
		        {
		            jap2ffGeneral.setJapProxySettings(1);
		            if (jap2ffGeneral.oPS.getPrefType("network.proxy.share_proxy_settings") == jap2ffGeneral.oPS.PREF_BOOL 
		                && jap2ffGeneral.oPS.getBoolPref("network.proxy.share_proxy_settings")
		               )
		            {
		                if (jap2ffGeneral.oPS.getPrefType("network.proxy.http") == jap2ffGeneral.oPS.PREF_STRING 
		                    && jap2ffGeneral.oPS.getCharPref("network.proxy.http") == "127.0.0.1"
		                   )
		                {
		                    var portCurrentProxy = -1;
		                    if (jap2ffGeneral.oPS.getPrefType("network.proxy.http_port") == jap2ffGeneral.oPS.PREF_INT) 
		                        portCurrentProxy = jap2ffGeneral.oPS.getIntPref("network.proxy.http_port");
		                 
		                    if (portCurrentProxy == jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.anonlibPort"))
		                        jap2ffGeneral.oPS.setIntPref("network.proxy.type",0);
		                 
		                } 
		            }
		        }
		        //show FeedbackWindow ???
		        if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.showFeedbackWindow")){
		            window.openDialog("chrome://jap2ff/content/dialogs/feedbackWindow.xul","","centerscreen, chrome, modal");        
		        } 
		        //start anonlib info
		        if ((jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.startAnonLibInfo") && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.setOn"))){
		            window.openDialog("chrome://jap2ff/content/dialogs/startJapHelp.xul","","centerscreen, chrome, modal");        
		        }
		       
		    }//End else java plug- intest         
        }
        
        // no java plugin or popup -> hide all 
        if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.pluginFailureJava")
		    || jap2ffGeneral.isPopup)
        {
            jap2ffGeneral._hideAllElements();
            if (!closeAfter) closeAfter = true;
        }
        
		if (!closeAfter)
		{   
		    if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.enable_java") 
		        && jap2ffGeneral.oPS.getBoolPref("security.enable_java")
		       )
		    {
				jap2ffGeneral.oPS.setBoolPref("security.enable_java",false);
                jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.enable_java",false);
		    }
		    if (jap2ffGeneral.listInitValue==null){
		        jap2ffGeneral.listInitValue = document.getElementById('jap2ff_casc-list-label').value;
		    }
			// hack js failure, sometimes this part after breaks ....
		    if (jap2ffGeneral.oPS.getBoolPref('security.enable_java')) 
		        jap2ffGeneral.reInitRef = window.setInterval("jap2ffGeneral.reInit()",800);
		    // check: has win a toolbar?       
		    var win = wm.getMostRecentWindow('navigator:browser');
		    jap2ffGeneral.invisibleToolbar = !win.toolbar.visible;
		    jap2ffGeneral.invisibleStateIcon = !win.toolbar.visible;
		    
		    //show elements
		    jap2ffGeneral.jap2ff_show(0); 
		    
            if  (jap2ffGeneral.oPS.getPrefType("extensions.jap2ff.setOn") == jap2ffGeneral.oPS.PREF_BOOL 
			     && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.setOn")
				)
			{
                jap2ffGeneral.setOn = true;
            }
            
            var startOption = jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.startOption");  
           
            switch(startOption){
                //last state
				case 0: {
						if (!jap2ffGeneral.setOn){
						    //jap2ff_getCascadesForList(0);
							window.setTimeout("jap2ffGeneral.getMixCascades()",800);
						} 
                        break;
                }
				//always on
                case 1: {
                        jap2ffGeneral.setOn = true;
                        break;
                }
                //first use
				case 2: {
                        jap2ffGeneral.startJapManual = true;
                        //use intern fetch cascade method, if not set on
						if (!jap2ffGeneral.setOn) jap2ff_getCascadesForList(0);
                        break;
                }                
                default:{}
            }
            
			//var menue = (document.getElementById('kaskade-list'));
            //var menueItem = null;
            //menue.removeAllItems();
            //menuItem = menue.insertItemAt ( 0 , 'direkt'  , 0 , '' );
            //menuItem.setAttribute("oncommand","jap2ffGeneral.setMc(-1)");
            //menue.selectedIndex = 0;
            if (!jap2ffGeneral.startJapManual || jap2ffGeneral.setOn){
              
                if (jap2ffGeneral.setOn){
				      					  
                    //if  (jap2ffGeneral.oPS.getPrefType("extensions.jap2ff.MixName") == jap2ffGeneral.oPS.PREF_STRING){                    
                    //     menue.insertItemAt( 0 , jap2ffGeneral.oPS.getCharPref("extensions.jap2ff.MixName")  , 0 , '' );
                    //     menue.selectedIndex = 0;                       
                    //}
                    jap2ffGeneral.setOn = false; //damit die Kaskaden aktuallisiert werden k?nnen
                    if (winCount==1){
                        jap2ffGeneral.setJAP(true);
                        jap2ffGeneral.setProxyInfo(0);
                    }else{
                        while(jap2ffGeneral._getJapC_JAPController==null){
                            jap2ffGeneral.setJAP(false);
                        }    
                    }    
                }else if(!jap2ffGeneral.startJapManual){
                    jap2ffGeneral.removeJAP(false);
                }
                
               
            }else{
                jap2ffGeneral.removeJAP(false);
            }
           
            // Registrieren der Observer
            jap2ffGeneral.jap2ff_regObserver();
            
            //for state refresh                                 
            jap2ffGeneral.refreshToolbar = window.setInterval("jap2ffGeneral.refreshToolbarStatus()",10000);
            if (jap2ffGeneral.refreshCascState==null){
                jap2ffGeneral.refreshCascState = window.setInterval("jap2ffGeneral.refreshCascMenus(false)",3000);
            }    		  
		 
			if (jap2ffGeneral.setOn 
			    && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.noSecJava") 
				    && jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.noBackupSecJava") == 1)
			{
	            jap2ffGeneral.oPS.setBoolPref("security.enable_java",false);    
	        }
	        //intervall l?schen, hier ist die kritische stelle vorbei
	        if (jap2ffGeneral.reInitRef != null){
                window.clearInterval(jap2ffGeneral.reInitRef);
            }
            jap2ffGeneral._init = false;  
	    }   		        
	}catch(e){jap2ffGeneral._trace(e)};
};
  
    
    
  jap2ffGeneral.jap2ff_regObserver = function(){
      try{
          var oPrefBranch	= Components.classes["@mozilla.org/preferences-service;1"].createInstance(Components.interfaces.nsIPrefBranch2);
          var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
          //fuer Anderungen der Sichtbarkeiten von GUI Elementen     
          var oMenuObserver = {
			  observe: function(subject,topic,data){ 
			          try{
			              jap2ffGeneral.jap2ff_show(1);
			          }catch(e){jap2ffGeneral._trace('extensions.jap2ff.show: '+e);} 
			  }
		  };
          
		  oPrefBranch.addObserver("extensions.jap2ff.show",oMenuObserver, false);
		  oPrefBranch.addObserver("extensions.jap2ff.userLevel", oMenuObserver, false);
		  oPrefBranch.addObserver("extensions.jap2ff.anonLevel", oMenuObserver, false);
          
          //Aenderung von Debug LEVEL, TYP, File, Detail
          
          var oLogObserver = {
			  observe: function(subject,topic,data){ 
			          try{
			              jap2ffGeneral.jap2ff_changeLog();
			          }catch(e){jap2ffGeneral._trace('extensions.jap2ff.Log: '+e);} 
			  }
		  };
		  oPrefBranch.addObserver("extensions.jap2ff.Log", oLogObserver, false);
          
          //Aenderung von Autoreconnect
          
          var oAutoReConObserver = {
			  observe: function(subject,topic,data){ 
			          try{
			              jap2ffGeneral.jap2ff_changeAutoReCon();
			          }catch(e){jap2ffGeneral._trace('extensions.jap2ff.AutoReCon: '+e);} 
			  }
		  };
		  oPrefBranch.addObserver("extensions.jap2ff.AutoReCon", oAutoReConObserver, false);
          
          //Aenderung von DummyTraffic
          var oDummyTrafficObserver = {
			  observe: function(subject,topic,data){ 
			          try{
			              jap2ffGeneral.jap2ff_changeDummy();
			          }catch(e){jap2ffGeneral._trace('extensions.jap2ff.sendDummy: '+e);} 
			  }
		  };
		  oPrefBranch.addObserver("extensions.jap2ff.sendDummy", oDummyTrafficObserver, false);
		  oPrefBranch.addObserver("extensions.jap2ff.DummyTraffic", oDummyTrafficObserver, false);
	      
	      //Aenderung noPayCasc
	      var oNoPayCascObserver = {
	          observe: function(subject,topic,data){ 
			          try{
			              jap2ffGeneral.jap2ff_changeNoPayCasc();
			          }catch(e){jap2ffGeneral._trace('extensions.jap2ff.noPayCasc: '+e);} 
			  }
	      };
   		  oPrefBranch.addObserver("extensions.jap2ff.noPayCasc", oNoPayCascObserver, false);
	      
	      //Aenderung userLevel
	      var oUserLevelObserver = {
	          observe: function(subject,topic,data){ 
			          try{
			              jap2ffGeneral.userLevel = jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.userLevel");
			          }catch(e){jap2ffGeneral._trace('extensions.jap2ff.userLevel: '+e);} 
			  }
	      };
   		  oPrefBranch.addObserver("extensions.jap2ff.userLevel", oUserLevelObserver, false);
	      
	      // no java, no javascript ...
	      var oNoObserver = {
	          observe: function(subject,topic,data){ 
			          try{
			              if(jap2ffGeneral.setOn){
			                  jap2ffGeneral.removeAnonDetails();
			                  jap2ffGeneral.setAnonDetails();
			              }
			          }catch(e){jap2ffGeneral._trace('extensions.jap2ff.no: '+e);} 
			  }
	      };
   		  oPrefBranch.addObserver("extensions.jap2ff.noJavaScript", oNoObserver, false);
 		  oPrefBranch.addObserver("extensions.jap2ff.noSecJava", oNoObserver, false);
	      
	      //Ueberwachen von manuellen Anderungen des Proxys durch den Benutzer
	      var oSetProxyObserver = {
			  observe: function(subject,topic,data){ 
			          try{
			              if (data.indexOf('network.proxy.backup')==-1){
			                  jap2ffGeneral.changeProxySettingsManual(data);
			              }    
			          }catch(e){/*jap2ffGeneral._trace('network: '+e);*/} 
			  }
		  };
		  oPrefBranch.addObserver("network.proxy.", oSetProxyObserver, false);
	      
	      // set anonlib proxy
	      var oSetAnonlibProxyObserver = {
			  observe: function(subject,topic,data){ 
			          try{
			              if (jap2ffGeneral._getJapC_JAPController!=null){
			                  if(jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.isUseProxy")){
			                      jap2ffGeneral._getJapC().setProxy(jap2ffGeneral.oPS.getCharPref("extensions.jap2ff.proxyHost"), jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.proxyPort"), jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.proxyType") );
			                  }else{
			                      jap2ffGeneral._getJapC().removeProxy();
			                  }
			              }
			                  
			          }catch(e){} 
			  }
		  };
		  oPrefBranch.addObserver("extensions.jap2ff.isUseProxy", oSetAnonlibProxyObserver, false);
		  
		  // change proxy setting
		  var oChangeAnonlibProxySettingsObserver = {
			  observe: function(subject,topic,data){ 
			          try{
			              if (jap2ffGeneral._getJapC_JAPController!=null){
			                  if(jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.isUseProxy")){
			                      jap2ffGeneral._getJapC().setProxy(jap2ffGeneral.oPS.getCharPref("extensions.jap2ff.proxyHost"), jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.proxyPort"), jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.proxyType") );
			                  }
			              }
			                  
			          }catch(e){} 
			  }
		  };
		  oPrefBranch.addObserver("extensions.jap2ff.proxy", oChangeAnonlibProxySettingsObserver, false);
	      
	      //Entfernen der Intervallgesteuerten Methoden
	      //JAVA.enabled Handling
		  //save xml config File
	      var observeQuit = {
	          observe: function (subject, topic, data){
	              try{
	                  window.clearInterval(jap2ffGeneral.aktive); 
				  	  
					  if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.setOn") 
					      && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.noSecJava") 
					         && jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.noBackupSecJava") == 1)
					  {
	                      jap2ffGeneral.oPS.setBoolPref("security.enable_java",true); 
						     
	                  }
	                  if (jap2ffGeneral.oPS.getPrefType("general.useragent.override")>0 && jap2ffGeneral.oPS.prefHasUserValue("general.useragent.override")){
                          jap2ffGeneral.oPS.clearUserPref("general.useragent.override");
                      }
                      if (jap2ffGeneral._getJapC_JAPController!=null){
					      jap2ffGeneral._getJapC().shutdown();					  
					  }
	              }catch(e){jap2ffGeneral._trace('quit-application-granted'+e);}    
	          }
	      } 	      
	      observerService.addObserver(observeQuit,"quit-application-granted",false); //quit-application
	      
	      
	      
	      //Starte Jap nach dem Firefox laeuft wenn dies so gewuenscht wird ...
	      var anonlibStartObserver = { 
		                 observe: function(subject,topic,data){						 							 
							 jap2ffGeneral._trace('EndDocumentLoad');
							 try{
							    observerService.removeObserver(anonlibStartObserver,"EndDocumentLoad");							     
							    jap2ffGeneral._getJapC();
							    //jap2ffGeneral.getMixCascades();
							 }catch(e){jap2ffGeneral._trace('EndDocumentLoad: '+e);}
                         }
                       };
		
		
		
		  var oPS1 = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");		
		  if (oPS1.getIntPref("extensions.jap2ff.startOption") == 0){ 
		      jap2ffGeneral._trace('AddEndObserver');
              observerService.addObserver(anonlibStartObserver,"EndDocumentLoad",false);
          }
          
          var anonlibStartObserver2 = { 
		                 observe: function(subject,topic,data){						 							 
							 try{
							     observerService.removeObserver(anonlibStartObserver2,"EndDocumentLoad");							     
                                
                                 var dbDir = getDataBaseDir();
                                 if (dbDir!=null && jap2ffGeneral.oPS.getBoolPref('extensions.jap2ff.setOn')){
                                     var path = dbDir+'anonlibStart.rdf';
                                     var rdfS = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
                                     var dSource = rdfS.GetDataSourceBlocking(path);
                                                             
                                     var startAnon = rdfS.GetResource('chrome://jap2ff/startAnonLib');
                                     var startState = rdfS.GetResource('lastStartWithAnonLibOkay');
                                     var target = dSource.GetTarget(startAnon, startState, true);
                                     if (target instanceof Components.interfaces.nsIRDFInt){
                                         dSource.Unassert(startAnon, startState, target);
                                         target = rdfS.GetIntLiteral(0);
                                         dSource.Assert(startAnon, startState, target, true);
                                         if (dSource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource)){
                                             dSource.Flush();
                                             dSource.Refresh(true);
                                         }    
                                     }    
                                 }
							 }catch(e){jap2ffGeneral._trace('EndDocumentLoad2: '+e);}
                         }
          };
         
          observerService.addObserver(anonlibStartObserver2,"EndDocumentLoad",false);    
          
          var observe = {
                          observe: function(subject,topic,data){						 							 
							 
							 try{
							    if (jap2ffGeneral.oPS.getBoolPref('extensions.jap2ff.loadConfirm')){							     
    						        var browser = (document.getElementById('content'));
    						        var dat = data;
    						        var test1 = false;
    						        // test about:config ?? about:plugins ??
    						        if (dat.indexOf('jar:file:///')>-1 && dat.indexOf('content/global/plugins.html')>-1) test1=true;
    						        if (!test1 && dat.indexOf('jar:file:///')>-1 && dat.indexOf('content/global/config.xul')>-1) test1= true;
    						        // wenn nicht about: ... 
							        if (!test1 && !jap2ffGeneral.setOn){
			                            jap2ffGeneral._trace('Start');             
			                            window.openDialog("chrome://jap2ff/content/dialogs/loadConfirm.xul","Warnung","centerscreen, chrome, modal");    
			                            if(!jap2ffGeneral.oPS.getBoolPref('extensions.jap2ff.loadConfirmBack')){
                                            var tabs = browser.mTabs;
          
                                            for (var i=0;i<tabs.length;i++){
                                                tabs.item(i).linkedBrowser.stop();    
                                            }
			                            }
			                        }
			                    }        
							 }catch(e){jap2ffGeneral._trace('StartDocumentLoad: '+e);}
                         }
        
          };
          observerService.addObserver(observe,"StartDocumentLoad",false);
        
          var observeHttp = { 
		     observe: function(subject,topic,data){
		         
			     try{
			         var oChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			         if (jap2ffGeneral.setOn && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.noReferers")){
			             oChannel.setRequestHeader("Referer", "", false);
			             if (oChannel.referrer) oChannel.referrer.spec = '';
			         }
			        
			     }catch(e){}
			         
             }
          };
		  observerService.addObserver(observeHttp,"http-on-modify-request",false);        
                
          var observeCascadeChange = { 
		     observe: function(subject,topic,data){						 							 
			     try{
			         			         
			             var menu = document.getElementById('kaskade-list');
                         
                         if (menu.selectedIndex != data && data >-1){
                             menu.selectedIndex = data;
                             //if (data==0)jap2ffGeneral.removeJAP(false);                         
                         }
                         var text = document.getElementById('jap2ff_casc-list-label');
                         text.value = menu.label;
                         
                         if (jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.LastXMLCascade")!=data) jap2ffGeneral.oPS.setIntPref("extensions.jap2ff.LastXMLCascade",data);
                     
                         if (!jap2ffGeneral.setOn && !jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.refreshOnlyWhenSetOn"))
                         {
                             jap2ffGeneral.refreshToolbarStatus(1);
                         }else{
                             jap2ffGeneral.refreshToolbarStatus(3);
                         }    
                         
                                                  
                         for (var b=0;b<jap2ffGeneral.menuArray.length;b++){ 
                             menu2 = document.getElementById(jap2ffGeneral.menuArray[b]);
              
                         if (menu2){
                             if (menu2.hasChildNodes()){
                                 var childs = menu2.childNodes;
                                 for (var d=0;d<childs.length;d++){
                                     if (d == data) 
                                         childs[d].setAttribute('style','font-weight:bold;');
                                     else
                                         childs[d].setAttribute('style','font-weight:normal;');    
                                 }
                             }                         
                         }
                  }
                         
                     
			     }catch(e){jap2ffGeneral._trace(e);}
             }
          };
		  observerService.addObserver(observeCascadeChange,"changeCascade",false);             
	 
	      var observeDBLoad = { 
		     observe: function(subject,topic,data){						 							 
			     try{
			         jap2ff_updateCascadeDB();    			             
			     }catch(e){jap2ffGeneral._trace(e);}
             }
          };  
	      observerService.addObserver(observeDBLoad,"jap2ff_db_init",false);             	    
	    
	      var infoServiceChange = {
	         observe: function(subject,topic,data){						 							 
			     try{ 
			         //need time out 
			         jap2ffGeneral.getMixCascades();
			         //jap2ffGeneral.refreshCascMenus(true);
			         //jap2ff_getCascadesForList(1); 
			     }catch(e){jap2ffGeneral._trace(e);}
             }
          };
	      observerService.addObserver(infoServiceChange,"changeInfoservice",false);
	    
	      var reloadCascadeLists = {
	         observe: function(subject,topic,data){						 							 
			     try{
			         jap2ff_getCascadesForList(0); //util.js 
			     }catch(e){jap2ffGeneral._trace(e);}
             }
          };
	      observerService.addObserver(reloadCascadeLists,"reloadCascadeLists",false);      
        
         var reloadCascadesManual = {
	         observe: function(subject,topic,data){						 							 
			     try{
			         jap2ffGeneral.reloadCascades(data); 
			     }catch(e){jap2ffGeneral._trace(e);}
             }
          };
	      observerService.addObserver(reloadCascadesManual,"reloadCascadesManual",false);     
        
        
          // unregister observer etc.
          var closeWinObserver = {
              observe: function(subject,topic,data){ 
                  try{    
                      if (subject == window){
                          //window.clearInterval(jap2ffGeneral.refreshToolbar);
   	                      //window.clearInterval(jap2ffGeneral.refreshCascState); 
                           
                          oPrefBranch.removeObserver("extensions.jap2ff.show", oMenuObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.userLevel", oMenuObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.anonLevel", oMenuObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.Log", oLogObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.AutoReCon", oAutoReConObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.sendDummy", oDummyTrafficObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.DummyTraffic", oDummyTrafficObserver);                  
		                  oPrefBranch.removeObserver("extensions.jap2ff.noPayCasc", oNoPayCascObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.userLevel", oUserLevelObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.noJavaScript", oNoObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.noSecJava", oNoObserver);
		                  oPrefBranch.removeObserver("network.proxy.type", oSetProxyObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.isUseProxy", oSetAnonlibProxyObserver);
		                  oPrefBranch.removeObserver("extensions.jap2ff.proxy", oChangeAnonlibProxySettingsObserver);
		                  
		                  //observerService.removeObserver(observeQuit,"quit-application-granted");
   	                      observerService.removeObserver(observeHttp,"http-on-modify-request");
   	                      observerService.removeObserver(observe,"StartDocumentLoad");
   	                      observerService.removeObserver(observeCascadeChange,"changeCascade");
   	                      observerService.removeObserver(observeDBLoad,"jap2ff_db_init"); 
   	                      observerService.removeObserver(infoServiceChange,"changeInfoservice");
   	                      observerService.removeObserver(reloadCascadeLists,"reloadCascadeLists");
   	                      observerService.removeObserver(reloadCascadesManual,"reloadCascadesManual"); 
   	                      
   	                      //var myBrowser = document.getElementById('content');
	                      //myBrowser.removeProgressListener(jap2ffGeneral.watchProgress);
   	                      
   	                      //observerService.removeObserver(closeWinObserver,"domwindowclosed");
   	                      
   	                   }      
                  
                  }catch(e){
                      jap2ffGeneral._trace(e);
                  }               
              }
          }
          observerService.addObserver(closeWinObserver,"domwindowclosed",false);           
  
	  }catch(e){jap2ffGeneral._trace(e);}    
  };
   
  jap2ffGeneral.refreshToolbarStatusCounter = 0;
  jap2ffGeneral.timer = 0;
  jap2ffGeneral.refreshToolbarStatus = function(inp){
       
       if (inp!=3 && inp!=4){
           if (!this.setOn && jap2ffGeneral.refreshCascStateCount > 0 &&  jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.refreshOnlyWhenSetOn"))
                return false;
       }
       
       var jetzt = new Date();
       
      //var selInd = document.getElementById('kaskade-list').selectedIndex; 
      
      //_trace(jap2ffGeneral._getJapC_JAPController!=null);        
      if ((jap2ffGeneral._getJapC_JAPController!=null)){
         
         jap2ffGeneral.anonLevel = this._getJapC().getAnonLevel()+2;
         document.getElementById('jap2ff_anonmeter').src = "chrome://jap2ff/content/icons/anonmeter/"+jap2ffGeneral.meter[jap2ffGeneral.anonLevel];
         
         jap2ffGeneral.userCount = eval(this._getJapC().getNrOfActUsr());
         if (jap2ffGeneral.userCount>-1 || jap2ffGeneral.userCount!='-1')
             document.getElementById('jap2ff_user-text').value = jap2ffGeneral.userCount;  
         else    
             document.getElementById('jap2ff_user-text').value = jap2ffGeneral.meterText[0];
         var minUserCount = jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.minUserCount");
         if (this.setOn && jap2ffGeneral.userLevel == 0){
            if ((jap2ffGeneral.userCount < minUserCount && minUserCount>-1) || (jetzt.getTime() - jap2ffGeneral.timer > 120000)){
                jap2ffGeneral.timer = jetzt.getTime();
                jap2ffGeneral.autoSetMixCascade();
            }    
         }else if (this.setOn && (jap2ffGeneral.userCount < minUserCount && minUserCount>-1))
         {
           if (!this.isPopup) jap2ffGeneral.showLowUserWarning();
     
         }
         document.getElementById('jap2ff_anonbar').src = "chrome://jap2ff/content/icons/anonbar/"+jap2ffGeneral.anonbar[jap2ffGeneral.anonLevel];
         document.getElementById('jap2ff_anonlevel-text').value = jap2ffGeneral.meterText[jap2ffGeneral.anonLevel];
         if (this.setOn){    
             jap2ffGeneral.setStatusbarIcon(true);
         }else{
             jap2ffGeneral.setStatusbarIcon(false);
         }
             
      }else{
         
         var cascList = document.getElementById('kaskade-list'); 
         
         if (false && cascList.selectedIndex<=0){
         
             document.getElementById('jap2ff_anonmeter').src = "chrome://jap2ff/content/icons/anonmeter/"+jap2ffGeneral.meter[0];
             document.getElementById('jap2ff_user-text').value = jap2ffGeneral.meterText[0];
             document.getElementById('jap2ff_anonbar').src = "chrome://jap2ff/content/icons/anonbar/"+jap2ffGeneral.anonbar[0];
             document.getElementById('jap2ff_anonlevel-text').value = jap2ffGeneral.meterText[0];
         
         }else{
            
            if ( ((jetzt.getTime() - jap2ffGeneral.timer) > 60000)
                 || (jap2ffGeneral.anonLevel == 1 && jap2ffGeneral.refreshToolbarStatusCounter < 6 && (jetzt.getTime() - jap2ffGeneral.timer) > 15000 )  
                    || (inp && (inp == 1 || inp == 2 || inp == 3 || inp==4)) )
            {
                jap2ffGeneral.timer = jetzt.getTime();
                //_trace('Load xmlCascStatusInfo ...');
                
                if (jap2ffGeneral.anonLevel == 1) jap2ffGeneral.refreshToolbarStatusCounter++;
                    else jap2ffGeneral.refreshToolbarStatusCounter=0;  
                
                if (inp && inp==3){
                    jap2ff_getXMLStatusInfo(3);
                }else if(inp!=2 && inp!=4) jap2ff_getXMLStatusInfo();
                
                document.getElementById('jap2ff_anonmeter').src = "chrome://jap2ff/content/icons/anonmeter/"+jap2ffGeneral.meter[jap2ffGeneral.anonLevel];
                
                if (jap2ffGeneral.userCount==-1 || jap2ffGeneral.userCount=='-1'){
                    document.getElementById('jap2ff_user-text').value = jap2ffGeneral.meterText[0];
                }else{
                    document.getElementById('jap2ff_user-text').value = jap2ffGeneral.userCount;
                }    
                
                document.getElementById('jap2ff_anonbar').src = "chrome://jap2ff/content/icons/anonbar/"+jap2ffGeneral.anonbar[jap2ffGeneral.anonLevel];
                document.getElementById('jap2ff_anonlevel-text').value = jap2ffGeneral.meterText[jap2ffGeneral.anonLevel];
                
            }
         
         }
         
             
         jap2ffGeneral.setStatusbarIcon(false);
      }
        return true;
  };
  jap2ffGeneral.inShowLowUserWarn = false;
  jap2ffGeneral.showLowUserWarning = function(){
      if (!jap2ffGeneral.inShowLowUserWarn && jap2ffGeneral.oPS.getBoolPref('extensions.jap2ff.minUserWarn')){
          jap2ffGeneral.inShowLowUserWarn = true;
          var acUserCount = this._getJapC().getNrOfActUsr();
          window.openDialog("chrome://jap2ff/content/dialogs/lowUserWarn.xul","Warnung","centerscreen, chrome, modal",acUserCount);    
          var minUserBack = jap2ffGeneral.oPS.getIntPref('extensions.jap2ff.minUserBack');
          if (minUserBack == 0){
              jap2ffGeneral.autoSetMixCascade();
              window.setTimeout('jap2ffGeneral.getMixCascades()',50);    
          }else if (minUserBack == 1){
              jap2ffGeneral.removeJAP(true);
          }
          jap2ffGeneral.inShowLowUserWarn=false;
      }
  };
  
  jap2ffGeneral.blinkStatusIcon = function(inp){
      
      if (inp == 0){
         window.clearInterval(jap2ffGeneral.aktive);
         jap2ffGeneral.setStatusbarIcon(this.setOn);
         document.getElementById('jap2ff_status-text').style.color = 'black';
         
         
      }
      
      if (inp == 1 ){
         var icon = document.getElementById('jap2ff-panel-icon');
         icon.src='chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.iconsT[jap2ffGeneral.anonLevel];
         jap2ffGeneral.aktive = window.setInterval("jap2ffGeneral.blinkStatusIcon(2)",1000);
      }
      
      if (inp == 2){
         if (this.setOn){
             if(document.getElementById('jap2ff-panel-icon').src == 'chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.iconsT[jap2ffGeneral.anonLevel]){
                 document.getElementById('jap2ff-panel-icon').src = 'chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[jap2ffGeneral.anonLevel];
                 document.getElementById('jap2ff_status-text').style.color = 'gray';
             }else{
                 document.getElementById('jap2ff-panel-icon').src = 'chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.iconsT[jap2ffGeneral.anonLevel];
                 document.getElementById('jap2ff_status-text').style.color = 'black';
             }
         }
             
      }
  };
  
  
  
  //shows the jap2ff elements or not .-)
  jap2ffGeneral.jap2ff_show = function(inp){
      try{
          
          var preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          var userLevel = 0;
          if (preferencesService.getPrefType("extensions.jap2ff.userLevel") == preferencesService.PREF_INT) userLevel = preferencesService.getIntPref("extensions.jap2ff.userLevel");  
          
          //do userlevel things
          
          switch(userLevel){
		    case 0: {
			            //document.getElementById('jap2ff_toolbar_options_spacer').setAttribute('flex',1);
						break;
			}
            case 1: {
            }
            case 2: {
     		            //document.getElementById('jap2ff_toolbar_options_spacer').setAttribute('flex',0);
                        document.getElementById('kaskade_label_spacer').removeAttribute('collapsed') ;
                        document.getElementById('kaskade_label').removeAttribute('collapsed');
                        document.getElementById('kaskade-list').removeAttribute('collapsed');		
                       /* if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.showToolbarState")){
                            document.getElementById('jap2ff_toolbarStateSpacer').removeAttribute('collapsed');
                            document.getElementById('jap2ff_toolbarState').removeAttribute('collapsed');
                        }
                        if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.showToolbarUserCount")){
                            document.getElementById('jap2ff_toolbarUserCountSpacer').removeAttribute('collapsed');
                            document.getElementById('jap2ff_toolbarUserCount').removeAttribute('collapsed');
                        }
                        if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.showAnonmeter")){
                            document.getElementById('jap2ff_anonmeterSpacer').removeAttribute('collapsed');
                            document.getElementById('jap2ff_anonmeter').removeAttribute('collapsed');
                        }
                        if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.showAnonbar")){
                            document.getElementById('jap2ff_anonbarSpacer').removeAttribute('collapsed');
                            document.getElementById('jap2ff_anonbar').removeAttribute('collapsed');
                        }
                        if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.showAnontext")){                        
                            document.getElementById('jap2ff_anonTextBox').removeAttribute('collapsed');
                        }*/
                        
                        document.getElementById('jap2ff_reloadCascadesImage').removeAttribute('collapsed');
                        
                        if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.showToolbar")){
                            document.getElementById('jap2ff-toolbar').removeAttribute('collapsed');
                        }
                        
                        //enable all casc menus
                        
                        for (var i=0;i<jap2ffGeneral.menuArray2.length;i++){
                            var menu2 = (document.getElementById(jap2ffGeneral.menuArray2[i]));
                            if (menu2)
                                  
                               menu2.removeAttribute('collapsed');    
                        }  
                        
                        break;
                    }
             default:{}       
          }
         
          var show = false;
          //show UrlbarIcon
          if (preferencesService.getBoolPref("extensions.jap2ff.showUrlbarIcon")){
              document.getElementById('jap2ff-urlbar-icon').removeAttribute('collapsed');    
          }else{
              document.getElementById('jap2ff-urlbar-icon').setAttribute('collapsed',true);
          }
          
              
          //show toolbar aber nur wenn ueber Settings, bei init nimmt man das FF selber speichert
          if (preferencesService.getPrefType("extensions.jap2ff.showToolbar") == preferencesService.PREF_BOOL){
              show  = preferencesService.getBoolPref("extensions.jap2ff.showToolbar");
          }
          // inp == 1 wenn settings geaendert
          if (inp == 1) {
              if (show){
		          document.getElementById('jap2ff-toolbar').removeAttribute('collapsed');
		      }else{
		          document.getElementById('jap2ff-toolbar').setAttribute('collapsed',true);  
		      }
		  }else{
		      if (document.getElementById('jap2ff-toolbar').collapsed && show){		          
		          preferencesService.setBoolPref("extensions.jap2ff.showToolbar",false);    
		      }
		  }
		  //test ob Fenster ohne toolbar! if win has no ff toolbar then hide
		  if (jap2ffGeneral.invisibleToolbar){
		      document.getElementById('jap2ff-toolbar').setAttribute('hidden',true);
		  }
		  
		  //show toolbarState, toolbarUserCount, anonmeter, anonbar, anontext? 
		  show = false;
		  if (preferencesService.getPrefType("extensions.jap2ff.showToolbarState") == preferencesService.PREF_BOOL 
		      && preferencesService.getIntPref("extensions.jap2ff.userLevel") == 2 
		     )
		  {
		      show = preferencesService.getBoolPref("extensions.jap2ff.showToolbarState");
		  }
		  if(show){
		      document.getElementById('jap2ff_toolbarStateSpacer').removeAttribute('collapsed');
		      document.getElementById('jap2ff_toolbarState').removeAttribute('collapsed');
		  }else{
   		      document.getElementById('jap2ff_toolbarStateSpacer').setAttribute('collapsed',true);
		      document.getElementById('jap2ff_toolbarState').setAttribute('collapsed',true);
		  }
		  show = false;
		  if (preferencesService.getPrefType("extensions.jap2ff.showToolbarUserCount") == preferencesService.PREF_BOOL){
		      show = preferencesService.getBoolPref("extensions.jap2ff.showToolbarUserCount");
		  }
		  if(show){
		      document.getElementById('jap2ff_toolbarUserCountSpacer').removeAttribute('collapsed');
		      document.getElementById('jap2ff_toolbarUserCount').removeAttribute('collapsed');
		  }else{
		      document.getElementById('jap2ff_toolbarUserCountSpacer').setAttribute('collapsed',true);
		      document.getElementById('jap2ff_toolbarUserCount').setAttribute('collapsed',true);
		  }
		  
		  // Anonmeter PART
		  if (userLevel == 2){
		      show = false;
		      if (preferencesService.getPrefType("extensions.jap2ff.showAnonmeter") == preferencesService.PREF_BOOL){
		          show = preferencesService.getBoolPref("extensions.jap2ff.showAnonmeter");
		      }
		      if(show){
		          document.getElementById('jap2ff_anonmeterSpacer').removeAttribute('collapsed');
		          document.getElementById('jap2ff_anonmeter').removeAttribute('collapsed');
		      }else{
		          document.getElementById('jap2ff_anonmeterSpacer').setAttribute('collapsed',true);
		          document.getElementById('jap2ff_anonmeter').setAttribute('collapsed',true);
		      }
		      show = false;
		      if (preferencesService.getPrefType("extensions.jap2ff.showAnonbar") == preferencesService.PREF_BOOL){
		          show = preferencesService.getBoolPref("extensions.jap2ff.showAnonbar");
		      }
		      if(show){
		          document.getElementById('jap2ff_anonbarSpacer').removeAttribute('collapsed');
		          document.getElementById('jap2ff_anonbar').removeAttribute('collapsed');
		      }else{
		          document.getElementById('jap2ff_anonbarSpacer').setAttribute('collapsed',true);
		          document.getElementById('jap2ff_anonbar').setAttribute('collapsed',true);
		      }
		      show = false;
		      if (preferencesService.getPrefType("extensions.jap2ff.showAnontext") == preferencesService.PREF_BOOL){
		          show = preferencesService.getBoolPref("extensions.jap2ff.showAnontext");
		      }
		      if(show){
		          document.getElementById('jap2ff_anonTextSpacer').removeAttribute('collapsed');
		          document.getElementById('jap2ff_anonTextBox').removeAttribute('collapsed');
		      }else{
		          document.getElementById('jap2ff_anonTextSpacer').setAttribute('collapsed',true);
		          document.getElementById('jap2ff_anonTextBox').setAttribute('collapsed',true);
		      }
		  }else{
		      var anonLevel = preferencesService.getIntPref("extensions.jap2ff.showAnonLevel");
		      switch(anonLevel){
		          case 0: {
		                       document.getElementById('jap2ff_anonmeterSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonmeter').setAttribute('collapsed',true);
                               document.getElementById('jap2ff_anonbarSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonbar').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonTextSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonTextBox').setAttribute('collapsed',true); 
		                       break;
		          }
		          
		          case 1: {    
                               document.getElementById('jap2ff_anonmeterSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonmeter').setAttribute('collapsed',true);
                               document.getElementById('jap2ff_anonbarSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonbar').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonTextSpacer').removeAttribute('collapsed');
		                       document.getElementById('jap2ff_anonTextBox').removeAttribute('collapsed'); 
		                       break;
		          }
		          
		          case 2: {
		                       document.getElementById('jap2ff_anonmeterSpacer').removeAttribute('collapsed');
		                       document.getElementById('jap2ff_anonmeter').removeAttribute('collapsed');
                               document.getElementById('jap2ff_anonbarSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonbar').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonTextSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonTextBox').setAttribute('collapsed',true); 
		                       break;
		          }
		          
		          case 3: {  
                               document.getElementById('jap2ff_anonmeterSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonmeter').setAttribute('collapsed',true);
                               document.getElementById('jap2ff_anonbarSpacer').removeAttribute('collapsed');
		                       document.getElementById('jap2ff_anonbar').removeAttribute('collapsed');
                               document.getElementById('jap2ff_anonTextSpacer').setAttribute('collapsed',true);
		                       document.getElementById('jap2ff_anonTextBox').setAttribute('collapsed',true); 
		                       break;
		          }
		          		      
		          default:{}
		      } 
		  
		  } 		   		   		  
		      
		  //show statusbar icon?
		  show = false;
          if (preferencesService.getPrefType("extensions.jap2ff.showStatusbar") == preferencesService.PREF_BOOL){
             show  = preferencesService.getBoolPref("extensions.jap2ff.showStatusbar");
          }
          if (show){
		      document.getElementById('jap2ff-panel').removeAttribute('collapsed');
		  }else{
		      document.getElementById('jap2ff-panel').setAttribute('collapsed',true);  
		  }
		  //check popup?
		  if (jap2ffGeneral.invisibleStateIcon){
		      document.getElementById('jap2ff-panel').setAttribute('hidden',true);
		  }
		      
		  //show contextmenu?
		  show = false;
          if (preferencesService.getPrefType("extensions.jap2ff.showContext") == preferencesService.PREF_BOOL){
             show  = preferencesService.getBoolPref("extensions.jap2ff.showContext");
          }
          if (show){
              document.getElementById('jap2ff-context-separator').removeAttribute('collapsed');
		      document.getElementById('jap2ff-context-menu').removeAttribute('collapsed');
		  }else{
		      document.getElementById('jap2ff-context-separator').setAttribute('collapsed',true);
		      document.getElementById('jap2ff-context-menu').setAttribute('collapsed',true); 
		  }
		  if (jap2ffGeneral.invisibleStateIcon){
		      document.getElementById('jap2ff-context-separator').setAttribute('hidden',true);
		      document.getElementById('jap2ff-context-menu').setAttribute('hidden',true);
		  }
		  
		  
		  
          
          switch(userLevel){
            case 0: {   
                        //Disable all Toolbar Elements! 

                        document.getElementById('kaskade_label_spacer').setAttribute('collapsed',true);
                        document.getElementById('kaskade_label').setAttribute('collapsed',true);
                        document.getElementById('kaskade-list').setAttribute('collapsed',true);		
                        document.getElementById('jap2ff_toolbarStateSpacer').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_toolbarState').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_toolbarUserCountSpacer').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_toolbarUserCount').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_anonmeterSpacer').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_anonmeter').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_anonbarSpacer').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_anonbar').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_anonTextBox').setAttribute('collapsed',true);
                        document.getElementById('jap2ff_reloadCascadesImage').setAttribute('collapsed',true);
                        //document.getElementById('jap2ff-toolbar').setAttribute('collapsed',true);	
                        
                        //disable all casc menus
                        
                        for (var i=0;i<jap2ffGeneral.menuArray2.length;i++){
                            var menu2 = (document.getElementById(jap2ffGeneral.menuArray2[i]));
                            if (menu2)
                                  
                                   menu2.setAttribute('collapsed',true);    
                        }  
                        			
				
			
                        
                        break;
                    }
                    
            default:{
                       
                    }
          }
		  
		  
      }catch(e){jap2ffGeneral._trace(e);}
  };
  
  
  jap2ffGeneral.setProxyInfo = function(inp){
      try{
          if (inp==0){
              jap2ffGeneral.anonLevel = this._getJapC().getAnonLevel()+2
              document.getElementById('jap2ff_anonmeter').src = "chrome://jap2ff/content/icons/anonmeter/"+jap2ffGeneral.meter[jap2ffGeneral.anonLevel];
              document.getElementById('jap2ff_anonbar').src = "chrome://jap2ff/content/icons/anonbar/"+jap2ffGeneral.anonbar[jap2ffGeneral.anonLevel];
              document.getElementById('jap2ff_anonlevel-text').value = jap2ffGeneral.meterText[jap2ffGeneral.anonLevel];
              var tmpUserCount = this._getJapC().getNrOfActUsr();
              if (tmpUserCount >-1){
                  document.getElementById('jap2ff_user-text').value = tmpUserCount;
              }else{
                  document.getElementById('jap2ff_user-text').value = jap2ffGeneral.meterText[0];
              }    
          }    
          /*if (inp==1){
              document.getElementById('jap2ff_anonmeter').src = "chrome://jap2ff/content/icons/anonmeter/"+jap2ffGeneral.meter[0];
              document.getElementById('jap2ff_user-text').value = 'n.a.';
              document.getElementById('jap2ff_anonlevel-text').value = jap2ffGeneral.meterText[0];
          }*/
      }catch(e){
          jap2ffGeneral._trace(e);
      }
  };
  
  
  jap2ffGeneral.changeProxySettingsManual = function(data){
              //check set anonproxy manual
              try{
                  var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");		
                  var portJap = -1;
                  if (jap2ffGeneral._getJapC_JAPController!=null) portJap = this._getJapC().getPort();
                  if (!jap2ffGeneral.setOn){
                      
                      if (data=='network.proxy.share_proxy_settings'){
                         if (oPS.getBoolPref('network.proxy.share_proxy_settings')
                             && oPS.getIntPref("network.proxy.type")==1
                               && oPS.getCharPref("network.proxy.http")== "127.0.0.1"
                                 && ( oPS.getIntPref("network.proxy.http_port") == jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.anonlibPort")
                                      || oPS.getIntPref("network.proxy.http_port") == portJap
                                    )   
                            )
                         {
                             jap2ffGeneral.setJAP(false);  
                         }else{
                             jap2ffGeneral.removeJAP(false);
                         }    
                      }
                      
                      if (data=='network.proxy.type'){
                         if (oPS.getBoolPref('network.proxy.share_proxy_settings')
                             && oPS.getIntPref("network.proxy.type")==1
                               && oPS.getCharPref("network.proxy.http")== "127.0.0.1"
                                 && ( oPS.getIntPref("network.proxy.http_port") == jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.anonlibPort")
                                      || oPS.getIntPref("network.proxy.http_port") == portJap
                                    )
                            )
                         {   
                             jap2ffGeneral.setJAP(false);
                         }else{
                             jap2ffGeneral.removeJAP(false);
                         }       
                      }
                      
                      if (data=='network.proxy.http'){
                         if (oPS.getBoolPref('network.proxy.share_proxy_settings')
                             && oPS.getIntPref("network.proxy.type")==1
                               && oPS.getCharPref("network.proxy.http")== "127.0.0.1"
                                 && ( oPS.getIntPref("network.proxy.http_port") == jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.anonlibPort")
                                      || oPS.getIntPref("network.proxy.http_port") == portJap
                                    )
                            )
                         {   
                             jap2ffGeneral.setJAP(false);  
                         }else{
                             jap2ffGeneral.removeJAP(false);
                         }     
                      }
                      
                      if (data=='network.proxy.http_port'){
                         if (oPS.getBoolPref('network.proxy.share_proxy_settings')
                             && oPS.getIntPref("network.proxy.type")==1
                               && oPS.getCharPref("network.proxy.http")== "127.0.0.1"
                                 && ( oPS.getIntPref("network.proxy.http_port") == jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.anonlibPort")
                                      || oPS.getIntPref("network.proxy.http_port") == portJap
                                    )
                            )
                         {
                             jap2ffGeneral.setJAP(false);
                         }else{
                             jap2ffGeneral.removeJAP(false);
                         }       
                      }
                     
                      
                  }else{
                      if (!oPS.getBoolPref('network.proxy.share_proxy_settings')
                             || !(oPS.getIntPref("network.proxy.type")==1)
                               || !(oPS.getCharPref("network.proxy.http")== "127.0.0.1")
                                 || !( oPS.getIntPref("network.proxy.http_port") == portJap)
                         ) 
                      {
                          jap2ffGeneral.removeJAP(false);
                      } 
                  }
                 
              }catch(e){jap2ffGeneral._trace(e);}
  
  };

  jap2ffGeneral.setJapProxySettings = function(inp){
      try{ 
          if (inp==0){
              
              //backup proxy settings
              //ftp
              if (this.oPS.prefHasUserValue("network.proxy.ftp"))
              {
                  this.oPS.setCharPref("extensions.jap2ff.network.proxy.backup.ftp",
                      this.oPS.getCharPref("network.proxy.ftp") );
              }
              if (this.oPS.prefHasUserValue("network.proxy.ftp_port"))
              {
                  this.oPS.setIntPref("extensions.jap2ff.network.proxy.backup.ftp_port",
                      this.oPS.getIntPref("network.proxy.ftp_port") );
              }
              //gopher
              if (this.oPS.prefHasUserValue("network.proxy.gopher"))
              {
                  this.oPS.setCharPref("extensions.jap2ff.network.proxy.backup.gopher",
                      this.oPS.getCharPref("network.proxy.gopher") );
              }
              if (this.oPS.prefHasUserValue("network.proxy.gopher_port"))
              {
                  this.oPS.setIntPref("extensions.jap2ff.network.proxy.backup.gopher_port",
                      this.oPS.getIntPref("network.proxy.gopher_port") );
              }
              //socks
              if (this.oPS.prefHasUserValue("network.proxy.socks"))
              {
                  this.oPS.setCharPref("extensions.jap2ff.network.proxy.backup.socks",
                      this.oPS.getCharPref("network.proxy.socks") );
              }
              if (this.oPS.prefHasUserValue("network.proxy.socks_port"))
              {
                  this.oPS.setIntPref("extensions.jap2ff.network.proxy.backup.socks_port",
                      this.oPS.getIntPref("network.proxy.backup.socks_port") );
              }
              //ssl
              if (this.oPS.prefHasUserValue("network.proxy.ssl"))
              {
                  this.oPS.setCharPref("extensions.jap2ff.network.proxy.backup.ssl",
                      this.oPS.getCharPref("network.proxy.ssl") );
              }
              if (this.oPS.prefHasUserValue("network.proxy.ssl_port"))
              {
                  this.oPS.setIntPref("extensions.jap2ff.network.proxy.backup.ssl_port",
                      this.oPS.getIntPref("network.proxy.ssl_port") );
              }
              //http
              if (this.oPS.prefHasUserValue("network.proxy.http"))
              {
                  this.oPS.setCharPref("extensions.jap2ff.network.proxy.backup.http",
                      this.oPS.getCharPref("network.proxy.http") );
              }
              if (this.oPS.prefHasUserValue("network.proxy.http_port"))
              {
                  this.oPS.setIntPref("extensions.jap2ff.network.proxy.backup.http_port",
                      this.oPS.getIntPref("network.proxy.http_port") );
              }
              //share settings
              if (this.oPS.prefHasUserValue("network.proxy.share_proxy_settings"))
              {
                  this.oPS.setBoolPref("extensions.jap2ff.network.proxy.backup.share_proxy_settings",
                      this.oPS.getBoolPref("network.proxy.share_proxy_settings") );
              }
              //proxyType
              if (this.oPS.prefHasUserValue("network.proxy.type"))
              {
                  this.oPS.setIntPref("extensions.jap2ff.network.proxy.backup.type",
                      this.oPS.getIntPref("network.proxy.type") );
              }else{
                  if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.type"))
                      this.oPS.clearUserPref("extensions.jap2ff.network.proxy.backup.type");
              }
              
              
              //set jap as proxy for firefox              
              var japC = this._getJapC();
              
              if (this.oPS.getIntPref("network.proxy.type")!=1) 
                  this.oPS.setIntPref("network.proxy.type",1);
              if (this.oPS.getCharPref("network.proxy.http")!="127.0.0.1")
                  this.oPS.setCharPref("network.proxy.http","127.0.0.1");
              if (this.oPS.getIntPref("network.proxy.http_port")!=japC.getPort())
                  this.oPS.setIntPref("network.proxy.http_port",japC.getPort());
              if (!this.oPS.getBoolPref("network.proxy.share_proxy_settings"))
                  this.oPS.setBoolPref("network.proxy.share_proxy_settings",true);
              
             
          }
          
          if (inp==1){
          
              //restore proxy settings
              //ftp
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.ftp"))
              {
                  this.oPS.setCharPref("network.proxy.ftp",
                      this.oPS.getCharPref("extensions.jap2ff.network.proxy.backup.ftp") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.ftp"))
                      this.oPS.clearUserPref("network.proxy.ftp");
              }
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.ftp_port"))
              {
                  this.oPS.setIntPref("network.proxy.ftp_port",
                      this.oPS.getIntPref("extensions.jap2ff.network.proxy.backup.ftp_port") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.ftp_port"))
                      this.oPS.clearUserPref("network.proxy.ftp_port");
              }
              //gopher
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.gopher"))
              {
                  this.oPS.setCharPref("network.proxy.gopher",
                      this.oPS.getCharPref("extensions.jap2ff.network.proxy.backup.gopher") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.gopher"))
                      this.oPS.clearUserPref("network.proxy.gopher");
              }
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.gopher_port"))
              {
                  this.oPS.setIntPref("network.proxy.gopher_port",
                      this.oPS.getIntPref("extensions.jap2ff.network.proxy.backup.gopher_port") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.gopher_port"))
                      this.oPS.clearUserPref("network.proxy.gopher_port");
              }
              //socks
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.socks"))
              {
                  this.oPS.setCharPref("network.proxy.socks",
                      this.oPS.getCharPref("extensions.jap2ff.network.proxy.backup.socks") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.socks"))
                      this.oPS.clearUserPref("network.proxy.socks");
              }
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.socks_port"))
              {
                  this.oPS.setIntPref("network.proxy.backup.socks_port",
                      this.oPS.getIntPref("extensions.jap2ff.network.proxy.backup.socks_port") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.socks_port"))
                      this.oPS.clearUserPref("network.proxy.socks_port");
              }
              //ssl
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.ssl"))
              {
                  this.oPS.setCharPref("network.proxy.ssl",
                      this.oPS.getCharPref("extensions.jap2ff.network.proxy.backup.ssl") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.ssl"))
                      this.oPS.clearUserPref("network.proxy.ssl");
              }
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.ssl_port"))
              {
                  this.oPS.setIntPref("network.proxy.ssl_port",
                      this.oPS.getIntPref("extensions.jap2ff.network.proxy.backup.ssl_port") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.ssl_port"))
                      this.oPS.clearUserPref("network.proxy.ssl_port");
              }
              //http
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.http"))
              {
                  this.oPS.setCharPref("network.proxy.http",
                      this.oPS.getCharPref("extensions.jap2ff.network.proxy.backup.http") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.http"))
                      this.oPS.clearUserPref("network.proxy.http");
              }
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.http_port"))
              {
                  this.oPS.setIntPref("network.proxy.http_port",
                      this.oPS.getIntPref("extensions.jap2ff.network.proxy.backup.http_port") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.http_port"))
                      this.oPS.clearUserPref("network.proxy.http_port");
              }
              //share settings
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.share_proxy_settings"))
              {
                  this.oPS.setBoolPref("network.proxy.share_proxy_settings",
                      this.oPS.getBoolPref("extensions.jap2ff.network.proxy.backup.share_proxy_settings") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.share_proxy_settings"))
                      this.oPS.clearUserPref("network.proxy.share_proxy_settings");
              }
              //proxyType
              if (this.oPS.prefHasUserValue("extensions.jap2ff.network.proxy.backup.type"))
              {
                  this.oPS.setIntPref("network.proxy.type",
                      this.oPS.getIntPref("extensions.jap2ff.network.proxy.backup.type") );
              }else{
                  if (this.oPS.prefHasUserValue("network.proxy.type"))
                      this.oPS.clearUserPref("network.proxy.type");
              }
              
              //remove auto proxy settings
              if (!this.oPS.getBoolPref("extensions.jap2ff.hasUserSetProxy"))
              {
                  if (this.oPS.prefHasUserValue("extensions.jap2ff.isUseProxy"))
                      this.oPS.clearUserPref("extensions.jap2ff.isUseProxy"); 
                  if (this.oPS.prefHasUserValue("extensions.jap2ff.proxyPort"))
                      this.oPS.clearUserPref("extensions.jap2ff.proxyPort");
                  if (this.oPS.prefHasUserValue("extensions.jap2ff.proxyHost"))    
                      this.oPS.clearUserPref("extensions.jap2ff.proxyHost");    
              }
          
          }
          
      }catch(e){jap2ffGeneral._trace(e);}
  }
  
  jap2ffGeneral.setAutoProxyForJap = function(){
      try{
          //set Proxy for JAP
          if (!this.oPS.getBoolPref("extensions.jap2ff.hasUserSetProxy"))
          {
              if (this.oPS.prefHasUserValue("network.proxy.type")
                     && !(
                           this.oPS.getIntPref("network.proxy.type")==1 
                             &&  this.oPS.getCharPref("network.proxy.http")=="127.0.0.1" 
                               &&  this.oPS.getIntPref("network.proxy.http_port")==this._getJapC().getPort()
                                 &&  this.oPS.getBoolPref("network.proxy.share_proxy_settings")
                         )
                 )
              {   
                  var bundle = srGetStrBundle("chrome://jap2ff/locale/jap2ff.properties");
                  var message = bundle.GetStringFromName("jap2ff.browser.useProxyForJAP");
                  if (confirm(message)){
                      if (this.oPS.getIntPref("network.proxy.type") == 4){
                          alert('AutomaticProxyConf is not supported yet!');
                      }else{
                          this.oPS.setIntPref("extensions.jap2ff.proxyPort",
                              this.oPS.getIntPref("network.proxy.http_port") );
                      
                          this.oPS.setCharPref("extensions.jap2ff.proxyHost",
                              this.oPS.getCharPref("network.proxy.http") );
                          
                          this.oPS.setBoolPref("extensions.jap2ff.isUseProxy", true); 

                      }
                  }else{
                      if (this.oPS.prefHasUserValue("extensions.jap2ff.isUseProxy"))
                          this.oPS.clearUserPref("extensions.jap2ff.isUseProxy"); 
                  }
              }else{
                  if (this.oPS.prefHasUserValue("extensions.jap2ff.isUseProxy"))
                      this.oPS.clearUserPref("extensions.jap2ff.isUseProxy"); 
                  if (this.oPS.prefHasUserValue("extensions.jap2ff.proxyPort"))
                      this.oPS.clearUserPref("extensions.jap2ff.proxyPort");
                  if (this.oPS.prefHasUserValue("extensions.jap2ff.proxyHost"))    
                      this.oPS.clearUserPref("extensions.jap2ff.proxyHost");
              }
          }
      }catch(e){
          this._trace(e);
      }   
  }
  
  
  jap2ffGeneral.switchOnOff = function(ev){
      try{
          if (ev){
              ev.preventDefault();
              ev.preventBubble();
              ev.preventCapture();
              ev.stopPropagation(); 
          }
          if (!jap2ffGeneral.setOn){
              jap2ffGeneral.setJAP(true);
          }else{
              jap2ffGeneral.removeJAP(true);
          }
      }catch(e){
          jap2ffGeneral._trace(e);
      }
          
  }
  
  jap2ffGeneral.anOnClick = function(){
      try{
          
          var inp = document.getElementById('jap2ff_onCheckbox');          
          if (inp.checked){
              jap2ffGeneral.setJAP(true);
          }else{
              jap2ffGeneral.removeJAP(true);
          }
      }catch(e){
          jap2ffGeneral._trace(e);
      }
  }
  
  jap2ffGeneral.setJAP = function(fullSet){
    try{
      if (!jap2ffGeneral.setOn) {
          
          if (fullSet)
              jap2ffGeneral.setAutoProxyForJap();
              
             
          if (!jap2ffGeneral.getMixCascades()){ 
              document.getElementById('jap2ff_onCheckbox').checked = false;
              jap2ffGeneral.setJapProxySettings(1);
              return false;
          }
       
	  
	      jap2ffGeneral.setProxyInfo(0);
               
          //document.getElementById('kaskade-list').setAttribute('disabled', false);
          //document.getElementById('kaskade-list').setAttribute('disableautoselect', false);
          document.getElementById('jap2ff_status-text').value=jap2ffGeneral.anonState[2];
          
          //document.getElementById('jap2ff_proxyOn').selectedIndex = 0;
          
          /* Beginn  Set the on/off switches */
          
          document.getElementById('jap2ff_onCheckbox').checked = true;
          
          document.getElementById("setJAP").style.fontWeight = 'normal';
          document.getElementById("setJAP").setAttribute('disabled',true);  
          document.getElementById("removeJAP").style.fontWeight = 'bold';
          document.getElementById("removeJAP").removeAttribute('disabled');

          document.getElementById("jap2ff.setJAP.menu").style.fontWeight = 'normal';
          document.getElementById("jap2ff.setJAP.menu").setAttribute('disabled',true);        
          document.getElementById("jap2ff.removeJAP.menu").style.fontWeight = 'bold';
          document.getElementById("jap2ff.removeJAP.menu").removeAttribute('disabled');
      
          document.getElementById("jap2ff.setJAP.context").style.fontWeight = 'normal';
          document.getElementById("jap2ff.setJAP.context").setAttribute('disabled',true);        
          document.getElementById("jap2ff.removeJAP.context").style.fontWeight = 'bold';
          document.getElementById("jap2ff.removeJAP.context").removeAttribute('disabled');
      
          //document.getElementById("jap2ff_on").setAttribute('disabled',true);        
          //document.getElementById("jap2ff_off").removeAttribute('disabled');        
      
          /* End  Set the on/off switches */
          
	      //style toolbar elements
	      document.getElementById("jap2ff_isAnonOn").setAttribute('class', 'jap2ff_isOn_class');
          
          if (fullSet) {
              jap2ffGeneral.setAnonDetails();
		      jap2ffGeneral.setOn = true;
              jap2ffGeneral.setJapProxySettings(0);
              jap2ffGeneral.setStatusbarIcon(jap2ffGeneral.setOn);
              var help = jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.DummyTraffic");
              if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.sendDummy")) this._getJapC().startDummy(help);
              this._getJapC().startJap();
              
              try{ 
                  jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.setOn",true);
              }catch(e){jap2ffGeneral._trace(e);}
              
          }else{
              jap2ffGeneral.setOn = true;
              jap2ffGeneral.setStatusbarIcon(jap2ffGeneral.setOn);
          }
      
          
      }else{
          jap2ffGeneral._trace('allready set on!');
      }
    }catch(e){
      jap2ffGeneral._trace(e);  
    }  
    return true; 
  };
  
  jap2ffGeneral.removeJAP = function(fullRemove, e){
      try{   
          if ((fullRemove && (jap2ffGeneral.noMixCascadeWithMinUserCount 
                              || jap2ffGeneral.hasNoJavaPlugin 
                                 || jap2ffGeneral.connection2MixLost 
                                    || jap2ffGeneral.showWarn() 
                              ) 
               ) 
               || (!fullRemove)){
              jap2ffGeneral.setOn = false;
              jap2ffGeneral.setStatusbarIcon(jap2ffGeneral.setOn);
              
              //jap2ffGeneral.setProxyInfo(1);
              
              //var menu = (document.getElementById('kaskade-list'));
              //menu.selectedIndex = 0;
              //menu.setAttribute('disabled', true);
              //menu.setAttribute('disableautoselect', true);
  
              //document.getElementById('jap2ff_proxyOn').selectedIndex = 1;
              /* Beginn  Set the on/off switches */
          
              document.getElementById('jap2ff_onCheckbox').checked = false;
          
              document.getElementById("setJAP").style.fontWeight = 'bold';
              document.getElementById("setJAP").removeAttribute('disabled');
              document.getElementById("removeJAP").style.fontWeight = 'normal';
              document.getElementById("removeJAP").setAttribute('disabled', true);
          
              document.getElementById("jap2ff.setJAP.menu").style.fontWeight = 'bold';
              document.getElementById("jap2ff.setJAP.menu").removeAttribute('disabled');        
              document.getElementById("jap2ff.removeJAP.menu").style.fontWeight = 'normal';
              document.getElementById("jap2ff.removeJAP.menu").setAttribute('disabled',true);
          
              document.getElementById("jap2ff.setJAP.context").style.fontWeight = 'bold';
              document.getElementById("jap2ff.setJAP.context").removeAttribute('disabled');        
              document.getElementById("jap2ff.removeJAP.context").style.fontWeight = 'normal';
              document.getElementById("jap2ff.removeJAP.context").setAttribute('disabled',true);
          
              //document.getElementById("jap2ff_off").setAttribute('disabled',true);        
              //document.getElementById("jap2ff_on").removeAttribute('disabled');
          
              /* End Set the on/off switches */     
          
              jap2ffGeneral.stopAllTraffic();
                   
              //style toolbar elements
     	      document.getElementById("jap2ff_isAnonOn").setAttribute('class', 'jap2ff_isOff_class');
              
              if (fullRemove && !jap2ffGeneral.hasNoJavaPlugin){
                  jap2ffGeneral.removeAnonDetails();
                  jap2ffGeneral.setJapProxySettings(1);
              }
     
              var oPrefBranch = Components.classes["@mozilla.org/preferences;1"].createInstance(Components.interfaces.nsIPref);
              oPrefBranch.SetBoolPref("extensions.jap2ff.setOn",false); 
              
              if (fullRemove && !jap2ffGeneral.hasNoJavaPlugin){
                  if (!(jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.sendDummy") 
                        && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.DummyWhenOff")
                       )
                     )
                    this._getJapC().stopJap();
              }
              if (jap2ffGeneral.hasNoJavaPlugin) jap2ffGeneral.hasNoJavaPlugin=false;
          }else{
              if (e) e.stopPropagation();
          }
      }catch(e){jap2ffGeneral._trace(e);}
  };
  
  jap2ffGeneral.showWarn = function(){
      if (!jap2ffGeneral.setOn) return false;
      if (jap2ffGeneral.userLevel > 0 && !jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.onOffWarning"))return true;
      window.openDialog("chrome://jap2ff/content/dialogs/warningOnOff.xul","Info","centerscreen, chrome, modal");
      return jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.onOffBack");
  }
  
  //stop all traffic 
  jap2ffGeneral.stopAllTraffic = function(){
      try{
          if (!jap2ffGeneral._init){
              var browser = (document.getElementById('content'));
              var tabs = browser.mTabs;
          
              for (var i=0;i<tabs.length;i++){
                  tabs.item(i).linkedBrowser.stop();    
              }
          }    
      }catch(e){
          jap2ffGeneral._trace(e);
      }
  };
  
  jap2ffGeneral.mc = null;
  jap2ffGeneral.mcId = null;
  
  jap2ffGeneral.getMixCascades = function(){
      var menuItem = null;
      var back=true;
      try{
          
          //only if  (this._getJapC()).getInfoServiceId() != null &&
		  //             (this._getJapC()).getInfoServiceId() != jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.InfoserviceId')
          jap2ffGeneral.setInfoService();
         
                 
          jap2ffGeneral.mc = (this._getJapC()).getMixCascades();
          var jetzt = new Date();
          
          
          var tmpCounter = 0;
          while(this.mc.isEmpty() && tmpCounter < 6){          
              this.mc = (this._getJapC()).getMixCascades();
              var tmpTime = jetzt.getTime();
			  while ((jetzt.getTime() - tmpTime) < 4850 ){
                  jetzt = new Date();
              }
              if (tmpCounter>1) jap2ffGeneral._trace('retry getMixCascades() ... ');
              tmpCounter++;
          }
          if (this.mc.isEmpty()){
              jap2ffGeneral._trace('getMixCascades() ... mc.isEmpty!');
              (this._getJapC()).stopJap();
              window.openDialog("chrome://jap2ff/content/dialogs/noCascadesTrouble.xul","","centerscreen, chrome, modal");
              //set failure info to cascade list, if first cascade load ...
              if (jap2ffGeneral.listInitValue == document.getElementById('jap2ff_casc-list-label').value){
                 document.getElementById('jap2ff_casc-list-label').value = document.getElementById('jap2ff_casc-list-label_message').value; 
              }
              jap2ffGeneral.removeJAP(true);
              return false;
          }        
          
          
          
          var menu = (document.getElementById('kaskade-list'));
          menu.removeAllItems();
          //menuItem = menu.insertItemAt ( 0 , 'no Service'  , -1 , '' );
          //menuItem.setAttribute("oncommand","jap2ffGeneral.setMixCascade(-1)");
             
          for (var i=0;i<jap2ffGeneral.menuArray.length;i++){
              var menu2 = (document.getElementById(jap2ffGeneral.menuArray[i]));
                  if (menu2){
                      //remove all items
                      while(menu2.hasChildNodes()){
                         var tmp = menu2.firstChild;
                         menu2.removeChild(tmp);
                      }
                      //menuItem = document.createElement("menuitem");
                      //menuItem.setAttribute("label", 'direkt');
                      //menuItem.setAttribute("oncommand","jap2ffGeneral.setMixCascade(-1)");
                      //menuItem.setAttribute('image','chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[0]);    
                      //menuItem.setAttribute('class','menuitem-iconic');
                      //menu2.appendChild(menuItem);
                  }
          }
          
          //insertItemAt ( index , label , value , description )
          for(i=0;i<jap2ffGeneral.mc.size();i++){ 
              menuItem =  menu.insertItemAt ( (i) , jap2ffGeneral.mc.get(i) , i , '' );
              menuItem.setAttribute("oncommand","jap2ffGeneral.setMixCascade(this.value)");
                
              for (var b=0;b<jap2ffGeneral.menuArray.length;b++){ 
                  menu2 = document.getElementById(jap2ffGeneral.menuArray[b]);
              
                  if (menu2){
                      menuItem = document.createElement("menuitem");
                      menuItem.setAttribute("label", jap2ffGeneral.mc.get(i) );
                      menuItem.setAttribute("oncommand","jap2ffGeneral.setMixCascade("+i+")");
                      menuItem.setAttribute('image','chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[1]);    
                      menuItem.setAttribute('class','menuitem-iconic');
                      menu2.appendChild(menuItem);
                  }
              }
                
          }
              
          //test userLevel!
          if (jap2ffGeneral.userLevel==0){
              jap2ffGeneral._trace(" autoSetMixCascade() ");
              back = jap2ffGeneral.autoSetMixCascade();  
              return back;          
          }else{
              if (jap2ffGeneral.oPS.prefHasUserValue('extensions.jap2ff.LastCascade')){
                  var i = this._getJapC().getCurrentMixNumberForId(jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.LastCascade'));
                      
                  if (i>-1){ 
                      jap2ffGeneral.setMixCascade(i);
                      jap2ffGeneral.oPS.setIntPref('extensions.jap2ff.LastXMLCascade',i);
                   }else{
                      //jap2ffGeneral.oPS.clearUserPref('extensions.jap2ff.LastCascade');
                      if (jap2ffGeneral.oPS.prefHasUserValue('extensions.jap2ff.LastXMLCascade'))
                          jap2ffGeneral.oPS.clearUserPref('extensions.jap2ff.LastXMLCascade');
                   }
                         
              }
          }                  
              
          var helpI = this._getJapC().getCurrentMixCascadeNumber();
          //jap2ffGeneral._trace('current# '+helpI);
          if (helpI == -1) {
              /*menu.selectedIndex = 0;
              for (var b=0;b<jap2ffGeneral.menuArray.length;b++){ 
                  menu2 = document.getElementById(jap2ffGeneral.menuArray[b]);
                  if (menu2){
                      if (menu2.hasChildNodes() && menu.selectedIndex==0) menu2.firstChild.setAttribute('style','font-weight:bold;');    
                  }
              }*/
              var text = document.getElementById('jap2ff_casc-list-label');
              var bundle = srGetStrBundle("chrome://jap2ff/locale/jap2ff.properties");
              text.value = bundle.GetStringFromName("jap2ff.list.noService");
              
              window.setTimeout('jap2ffGeneral.removeJAP(true)',2000);
                             
          }else{
              menu.selectedIndex = (helpI);
              if (!jap2ffGeneral.oPS.prefHasUserValue('extensions.jap2ff.LastCascade')){
                  var id = this._getJapC().getCurrentMixId();
                  jap2ffGeneral.oPS.setCharPref('extensions.jap2ff.LastCascade',id);
              }    
              var text = document.getElementById('jap2ff_casc-list-label');
              text.value = menu.label; 
              for (var b=0;b<jap2ffGeneral.menuArray.length;b++){ 
                  menu2 = document.getElementById(jap2ffGeneral.menuArray[b]);
              
                  if (menu2){
                      if (menu2.hasChildNodes()){
                          var childs = menu2.childNodes;
                          for (var d=0;d<childs.length;d++){
                              if (d == helpI) 
                                  childs[d].setAttribute('style','font-weight:bold;');
                              else
                                  childs[d].removeAttribute('style');    
                          }
                          if (helpI>0) menu2.firstChild.removeAttribute('style');
                      }                         
                  }
              }
                
          }
           
          jap2ffGeneral.refreshCascMenus(true);  
      }catch(e){jap2ffGeneral._trace(e);}
      return back;
  };
  
  
  jap2ffGeneral.setMixCascade = function(inp){
      try{
          //this._trace("setMixCascade: "+inp);
          /*only before anonlib has started*/
          if (jap2ffGeneral._getJapC_JAPController != null){
              this._getJapC().setCurrentMixCascade(inp);
              //check Mix Connection
              window.setTimeout("jap2ffGeneral.isConnected2Mix()",500);
              var id = this._getJapC().getCurrentMixIdForNumber(inp);
              jap2ffGeneral.oPS.setCharPref('extensions.jap2ff.LastCascade',id);    
              jap2ffGeneral.oPS.setCharPref('extensions.jap2ff.MixId',id);
              if (jap2ffGeneral.oPS.getIntPref('extensions.jap2ff.minUserCount')==-1){
                  jap2ffGeneral.oPS.clearUserPref('extensions.jap2ff.minUserCount');
              }    
              jap2ffGeneral.refreshToolbarStatus();              
             
           }else{
               if (idVector!=null && inp < idVector.length){
                   jap2ffGeneral.oPS.setCharPref('extensions.jap2ff.LastCascade',idVector[inp]);
                   jap2ffGeneral.oPS.setCharPref('extensions.jap2ff.MixId',idVector[inp]);    
               }
           }
           
           //notify other windows 
           var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
           //var menue = document.getElementById('kaskade-list');  menue.selectedIndex
                            
           observerService.notifyObservers(null,"changeCascade",eval(inp));
                 
           
      }catch(e){jap2ffGeneral._trace(e);}
  };
  
  jap2ffGeneral.autoSetMixCascade = function(){
      try{
          var userCount = jap2ffGeneral.oPS.getIntPref('extensions.jap2ff.minUserCount');
          var num = this._getJapC().autoSetMixCascade(userCount);
          jap2ffGeneral.noMixCascadeWithMinUserCount = false;
          if (num >-1){
              jap2ffGeneral.setMixCascade(num);
          }else{
              //keine gefunden!!
              var bundle = srGetStrBundle("chrome://jap2ff/locale/jap2ff.properties");
		      alert(bundle.GetStringFromName('jap2ff.warn.noService'));
		      jap2ffGeneral.noMixCascadeWithMinUserCount = true;
		      jap2ffGeneral.removeJAP(true);
		      return false;
          }
              
      }catch(e){
          jap2ffGeneral._trace(e);
      }
      return true;
  };
  
  jap2ffGeneral.setInfoService = function(){
      try{
           
          if ( (this._getJapC()).getInfoServiceId() != null &&
		       (this._getJapC()).getInfoServiceId() != jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.InfoserviceId')
			 )
          {
                        
              //setInfoService(String id, String name, String hostname, int[] ports)
              var id   = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.InfoserviceId');
              var name = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.Infoservice');
              var host = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.InfoserviceHostname');
              var tmpP = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.InfoservicePort');
              var tmp1 = tmpP.split(',');
              var ports = new Array();
                    
              for (var i=0;i<tmp1.length;i++){
                  ports.push(eval(tmp1[i]));
                  //_trace(ports[i]);
              }
           
              this._getJapC().setInfoService(id, name, host, ports);    
          }
                       
      }catch(e){
          jap2ffGeneral._trace(e);
      }
  };
  
  jap2ffGeneral.setStatusbarIcon = function(inp){
      try{
          var icon = document.getElementById('jap2ff-panel-icon');
          var icon2 = document.getElementById('jap2ff_anonbar');
          var icon3 = document.getElementById('jap2ff-urlbar-icon');
          var bundle = srGetStrBundle("chrome://jap2ff/locale/jap2ff.properties");
          if (inp){
          
              
		      var menu = (document.getElementById('kaskade-list'));                                                   
              jap2ffGeneral.cascName = menu.label;
              
			  var tmpStr = jap2ffGeneral.cascName+'  '+bundle.GetStringFromName("jap2ff.label.userCount")+': '+(jap2ffGeneral.userCount>-1?jap2ffGeneral.userCount+'':'n.a.')+'  '+bundle.GetStringFromName("jap2ff.label.level")+': '+jap2ffGeneral.meterText[jap2ffGeneral.anonLevel];     
			  
              icon.src='chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[jap2ffGeneral.anonLevel];
			  icon.tooltipText=tmpStr;
              icon3.src='chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[jap2ffGeneral.anonLevel]; 
              
              icon3.tooltipText=tmpStr;
              //icon2.src = 'chrome://jap2ff/content/icons/anonbar/'+jap2ffGeneral.anonbar[jap2ffGeneral.anonLevel]; 
              //document.getElementById('jap2ff_anonlevel-text').value = jap2ffGeneral.meterText[jap2ffGeneral.anonLevel];     
          }else{
              icon.src='chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[0];
              icon.removeAttribute('tooltipText');
			  icon3.src='chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[0];
              icon3.tooltipText=bundle.GetStringFromName("jap2ff.browser.tooltip.urlBarIcon");
              //icon2.src = 'chrome://jap2ff/content/icons/anonbar/'+jap2ffGeneral.anonbar[0];
              //document.getElementById('jap2ff_anonlevel-text').value = jap2ffGeneral.meterText[0];          
          }
      }catch(e){
          jap2ffGeneral._trace(e);
      }
  };
  
  
  jap2ffGeneral.setAnonDetails = function(){
      try{
      var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
      
      var intPref = -1;
      //cookies
      if (oPS.getPrefType("extensions.jap2ff.noCookies") == oPS.PREF_BOOL && oPS.getBoolPref("extensions.jap2ff.noCookies") ){
      
          if (oPS.getPrefType("network.cookie.cookieBehavior") == oPS.PREF_INT){
              intPref = oPS.getIntPref("network.cookie.cookieBehavior"); 
          }
          if (intPref>-1 && oPS.getIntPref("extensions.jap2ff.noCookiesBackup")==-1 ) oPS.setIntPref("extensions.jap2ff.noCookiesBackup",intPref);
          
          oPS.setIntPref("network.cookie.cookieBehavior",2);
      }
      
      //javascript     
      if (oPS.getBoolPref("extensions.jap2ff.noJavaScript")){
          if (oPS.getBoolPref("javascript.enabled")
                 && !oPS.getBoolPref("extensions.jap2ff.setOn") 
             )
          {
              oPS.setIntPref("extensions.jap2ff.noBackupJavaScript",1); 
          }else if (!oPS.getBoolPref("extensions.jap2ff.setOn")){
              oPS.setIntPref("extensions.jap2ff.noBackupJavaScript",0); 
          }else if (oPS.getBoolPref("javascript.enabled")
                       && oPS.getBoolPref("extensions.jap2ff.setOn") 
                   )
          {
              oPS.setIntPref("extensions.jap2ff.noBackupJavaScript",1); 
          }         
          oPS.setBoolPref("javascript.enabled",false);  
      }else{
          if (!oPS.getBoolPref("extensions.jap2ff.setOn"))
              oPS.setIntPref("extensions.jap2ff.noBackupJavaScript",-1);
      }
      
      //java
      if (oPS.getBoolPref("extensions.jap2ff.noSecJava")){
          if (oPS.getBoolPref("security.enable_java")
                 && !oPS.getBoolPref("extensions.jap2ff.setOn")
             )
          {   
          
              oPS.setIntPref("extensions.jap2ff.noBackupSecJava",1); 
          }else if (!oPS.getBoolPref("extensions.jap2ff.setOn")){
              oPS.setIntPref("extensions.jap2ff.noBackupSecJava",0); 
          }else if (oPS.getBoolPref("security.enable_java")
                    && oPS.getBoolPref("extensions.jap2ff.setOn")
                   )
          {
                   
              oPS.setIntPref("extensions.jap2ff.noBackupSecJava",1);              
          }         
          
          oPS.setBoolPref("security.enable_java",false);                
      }else{
          if (!oPS.getBoolPref("extensions.jap2ff.setOn"))
              oPS.setIntPref("extensions.jap2ff.noBackupSecJava",-1); 
      }
      
      //fakeAgent
      
      if (oPS.getBoolPref("extensions.jap2ff.fakeAgent")){
          switch (oPS.getIntPref("extensions.jap2ff.fakeAgentType")){
              case 0: {   
                          oPS.setCharPref("general.useragent.override", oPS.getCharPref("extensions.jap2ff.fakeAgentString0"));
                          break;
              }
              case 1: {
                          oPS.setCharPref("general.useragent.override", oPS.getCharPref("extensions.jap2ff.fakeAgentString1"));
                          break;  
              }
              default:{}
          }
      }
      
      
      }catch(e){jap2ffGeneral._trace('setAnonDetails: '+e);}
      
  }
  
  jap2ffGeneral.removeAnonDetails = function(){
      try{
      var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
      //cookies
      if (oPS.getIntPref("extensions.jap2ff.noCookiesBackup")>-1){
          oPS.setIntPref("network.cookie.cookieBehavior",oPS.getIntPref("extensions.jap2ff.noCookiesBackup"));
          oPS.setIntPref("extensions.jap2ff.noCookiesBackup",-1);
      }     
      //java script
      var JSB = oPS.getIntPref("extensions.jap2ff.noBackupJavaScript");
      if (JSB >-1){
          if(JSB==1){
             oPS.setBoolPref("javascript.enabled",true);                
          }
          if(JSB==0 && !oPS.getBoolPref("javascript.enabled") ){
             oPS.setBoolPref("javascript.enabled",false);                
          }
      }
      //java
      var JB = oPS.getIntPref("extensions.jap2ff.noBackupSecJava"); 
      if (JB > -1){
          if (JB == 1){
              oPS.setBoolPref("security.enable_java",true);
          }
          if (JB == 0 && !oPS.getBoolPref("security.enable_java") ){
              oPS.setBoolPref("security.enable_java",false);
          }
      }
      // fake Agent
      if (oPS.getPrefType("general.useragent.override")>0 && oPS.prefHasUserValue("general.useragent.override")){
          oPS.clearUserPref("general.useragent.override");
      }
      }catch(e){jap2ffGeneral._trace('removeAnonDetails: '+e);};                
  }
  
  
  jap2ffGeneral.jap2ff_changeLog = function(){
      if (this._getJapC_JAPController != null){
          var LogLevel = jap2ffGeneral.oPS.getIntPref('extensions.jap2ff.LogLevel');    
          var LogType = jap2ffGeneral.oPS.getIntPref('extensions.jap2ff.LogType');       
          var LogDetail = jap2ffGeneral.oPS.getIntPref('extensions.jap2ff.LogDetail');       
          var Log2File = jap2ffGeneral.oPS.getBoolPref('extensions.jap2ff.Log2File');       
          var LogFileName = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.LogFile');       
                    
          this._getJapC().setLogLevel(LogLevel);
          this._getJapC().setLogType(LogType);
          this._getJapC().setLogDetail(LogDetail);
          
          if (Log2File){
              if (LogFileName.length > 0){
                  this._getJapC().setLogFile(LogFileName,jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.LogFileSize"),jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.LogFileBackups"));              
              }else{
                  jap2ffGeneral._trace('no logFile Filename!');
              }    
          }else{
             this._getJapC().stopFileLog();          
          }
          
          
      }
  }
  
  jap2ffGeneral.jap2ff_changeAutoReCon = function(){
      if (this._getJapC_JAPController != null){
          var AutoReCon = jap2ffGeneral.oPS.getBoolPref('extensions.jap2ff.AutoReCon');
          this._getJapC().setAutoReCon(AutoReCon);    
      }
  }
  
  jap2ffGeneral.jap2ff_changeDummy = function(){
      if (this._getJapC_JAPController != null){
          var dummyTrafficTime = jap2ffGeneral.oPS.getIntPref('extensions.jap2ff.DummyTraffic');
          var isDummy = jap2ffGeneral.oPS.getBoolPref('extensions.jap2ff.sendDummy');
          if (isDummy){
              this._getJapC().startDummy(dummyTrafficTime);
          }else{
              this._getJapC().stopDummy();
          }        
      }
  }
  
  jap2ffGeneral.jap2ff_changeNoPayCasc = function(){
      if (this._getJapC_JAPController != null){
          var noPay = jap2ffGeneral.oPS.getBoolPref('extensions.jap2ff.noPayCasc');
          this._getJapC().setNoPay(noPay);
          this._getJapC().clearMixCascadeCache();
          jap2ffGeneral.getMixCascades();    
      }
  }
  
  jap2ffGeneral.refreshCascMenus = function(inp){
     
      if (jap2ffGeneral.refreshCascStateCount < 0) jap2ffGeneral.refreshCascStateCount++;
      if (inp && inp == true){
          if (jap2ffGeneral.refreshCascState!=null) window.clearInterval(jap2ffGeneral.refreshCascState);
          jap2ffGeneral.refreshCascStateCount = -2;
          jap2ffGeneral.refreshCascState = window.setInterval("jap2ffGeneral.refreshCascMenus(false)",4000);
      }    
      //2 mal ehe intervall verlaengert ... sonst immer keine anzeige
      if (jap2ffGeneral.refreshCascStateCount == 0){  
          jap2ffGeneral.refreshCascStateCount++;
          window.clearInterval(jap2ffGeneral.refreshCascState);
          jap2ffGeneral.refreshCascState = window.setInterval("jap2ffGeneral.refreshCascMenus(false)",60000);
      }else{
          if (!this.setOn && jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.refreshOnlyWhenSetOn"))
            return false;
      }
      if (!this.setOn && jap2ffGeneral.refreshCascStateCount > 0 &&  jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.refreshOnlyWhenSetOn"))
      {
          //nothing
      }else{      
          
          if (jap2ffGeneral._getJapC_JAPController == null){
          
              //xmlHttpRequest 
              jap2ff_updateCascState();
          
          }else{
              
              var menu2 = document.getElementById(jap2ffGeneral.menuArray[0]);
              if (menu2 && menu2.hasChildNodes()){
              
                  var childs = menu2.childNodes;
               
                  for (var d=0;d<(childs.length);d++){
                      var lokalAnonLevel = 1; //unknown
                      
                      var tmpId = this._getJapC().getCurrentMixIdForNumber(d);
                      if (tmpId!=''){
                          var tmpAnonLevel = this._getJapC().getAnonLevelForId(tmpId);
                          if (tmpAnonLevel) lokalAnonLevel = tmpAnonLevel + 2;
                      }
                  
                      for (var b=0;b<jap2ffGeneral.menuArray.length;b++){ 
                          menu2 = document.getElementById(jap2ffGeneral.menuArray[b]);
                              if (menu2 && menu2.hasChildNodes()){
                                  if(menu2.childNodes[d]) menu2.childNodes[d].setAttribute('image','chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[lokalAnonLevel]);    
                                  if(menu2.childNodes[d]) menu2.childNodes[d].setAttribute('class','menuitem-iconic');
                              }
                      } 
                  
                  }
              }        
              
              
              
          }    
      }
      return true;
  }
  
  jap2ffGeneral.notifyReloadCascadesObserver = function(inp){
      try{
          var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
          observerService.notifyObservers(null,"reloadCascadesManual",eval(inp));
      }catch(e){
          jap2ffGeneral._trace(e);
      }
  }
  
  
  jap2ffGeneral.isReloadingCascades = false;
  jap2ffGeneral.reloadCascades = function(inp){     
      try{
          var img = document.getElementById('jap2ff_reloadCascadesImage');
          if (!jap2ffGeneral.isReloadingCascades && inp==1){
              img.src="chrome://jap2ff/content/icons/reloadCascades/"+jap2ffGeneral.reloadIcons[1];
          }
          if (!jap2ffGeneral.isReloadingCascades && inp==2){
              img.src="chrome://jap2ff/content/icons/reloadCascades/"+jap2ffGeneral.reloadIcons[0];
          }
          if (!jap2ffGeneral.isReloadingCascades && inp==0){
              jap2ffGeneral.notifyReloadCascadesObserver(3);      
          }
          if (inp==3){
              jap2ffGeneral.isReloadingCascades=true;
              img.src="chrome://jap2ff/content/icons/reloadCascades/"+jap2ffGeneral.reloadIcons[2];
              if(jap2ffGeneral._getJapC_JAPController != null){
                  if(this.getMixCascades()){
                      jap2ffGeneral.reloadCascadesTimeOut(false);
                  }else{
                      jap2ffGeneral.reloadCascadesTimeOut(true);
                  }              
              }else{
                  jap2ff_getCascadesForList(2); //util.js true -> reload manual
              }    
          }
      }catch(e){
          jap2ffGeneral._trace(e);
      }
  
  }
  
  jap2ffGeneral.reloadCascadesTimeOut = function(inp){
      try{
          jap2ffGeneral._trace('reloadCascadesTimeOut('+inp+')');
          var img = document.getElementById('jap2ff_reloadCascadesImage');
          img.src="chrome://jap2ff/content/icons/reloadCascades/"+jap2ffGeneral.reloadIcons[0];
          jap2ffGeneral.isReloadingCascades=false;
          if (inp){
              //set failure info to cascade list, if first cascade load ...
              if (jap2ffGeneral.listInitValue == document.getElementById('jap2ff_casc-list-label').value){
                 document.getElementById('jap2ff_casc-list-label').value = document.getElementById('jap2ff_casc-list-label_message').value; 
              }
              //jap2ffGeneral._trace('no Info found!');
          }
      }catch(e){
          jap2ffGeneral._trace(e);
      }
  }
  
  jap2ffGeneral.isShowInfoserviceTimeOut = false;
  jap2ffGeneral.hasShowInfoserviceTimeOut = false;
  jap2ffGeneral.isShowInfoserviceTimer = 0;
  jap2ffGeneral.showInfoserviceTimeOut = function(inp){
      try{
          var jetzt = new Date();  
          if (!jap2ffGeneral.isShowInfoserviceTimeOut 
		       && !jap2ffGeneral.hasShowInfoserviceTimeOut
                   && ( (jetzt.getTime() - jap2ffGeneral.isShowInfoserviceTimer) > 8000 )
             )
          {   
              jap2ffGeneral.isShowInfoserviceTimeOut = true;
              jap2ffGeneral.hasShowInfoserviceTimeOut = true;
			  jap2ffGeneral.isShowInfoserviceTimer = jetzt.getTime();
              jap2ffGeneral._trace('showInfoserviceTimeOut: '+inp); 
              window.openDialog("chrome://jap2ff/content/dialogs/noInfoserviceWindow.xul","","centerscreen, chrome, modal");
              if (jap2ffGeneral.listInitValue == document.getElementById('jap2ff_casc-list-label').value){
                 document.getElementById('jap2ff_casc-list-label').value = document.getElementById('jap2ff_casc-list-label_message').value; 
              }    
              jap2ffGeneral.isShowInfoserviceTimeOut = false;
          }    
      }catch(e){
          jap2ffGeneral._trace(e);
          jap2ffGeneral.isShowInfoserviceTimeOut = false;
      }
      
  }
  
  jap2ffGeneral.isConnected2MixTimer=0;
  jap2ffGeneral.isConnected2Mix = function(){
      var isCon = jap2ffGeneral._getJapC().getIsConnect2MixCascade();
      var jetzt = new Date();
      if (jetzt.getTime() - jap2ffGeneral.isConnected2MixTimer > 5000){
          jap2ffGeneral.isConnected2MixTimer = jetzt.getTime();
          if (!isCon){
              jap2ffGeneral.connection2MixLost = true;
              jap2ffGeneral.removeJAP(true);
              alert("Connection to Mix Lost!");
          }else{
              jap2ffGeneral._trace("connected to mix");
          }
      }    
  }
  
  jap2ffGeneral.hasNoJavaPlugin = false;
  jap2ffGeneral.checkTimeOutStartJava = function(){
      try{
          this._trace("checkTimeOutStartJava ...");
          if (!jap2ffGeneral.isPopup && jap2ffGeneral._getJapC_JAPController == null)
          {
              jap2ffGeneral.hasNoJavaPlugin = true;
              jap2ffGeneral.removeJAP(true);
              window.openDialog("chrome://jap2ff/content/dialogs/noJavaPluginHelp.xul","Warning","centerscreen, chrome, modal");
          }
         
      }catch(e){
          this._trace(e);
      }    
  }
  
  jap2ffGeneral.openNewWinWith = function(href, charsetArg, referrerURI, postData, options){
      try{
          if (options==null){
              window.openDialog(getBrowserURL(), "_blank", "chrome,all,dialog=no", href, charsetArg, referrerURI, postData); 
          }else{
              window.openDialog(getBrowserURL(), "_blank", "chrome,dialog=no"+options, href, charsetArg, referrerURI, postData); 
          }    
      }catch(e){
          this._trace(e);
      }
  }
  
  jap2ffGeneral._hideAllElements = function(){
      document.getElementById('jap2ff-urlbar-icon').setAttribute('hidden',true);
      document.getElementById('jap2ff-toolbar').setAttribute('hidden',true);
      document.getElementById('jap2ff-panel').setAttribute('hidden',true);
      document.getElementById('jap2ff-context-separator').setAttribute('hidden',true);
      document.getElementById('jap2ff-context-menu').setAttribute('hidden',true);
      //only some part form toolsmenu
      document.getElementById('jap2ff.setJAP.menu').setAttribute('hidden',true);
      document.getElementById('jap2ff.removeJAP.menu').setAttribute('hidden',true);
      document.getElementById('jap2ff_toolsmenuSeparator_1').setAttribute('hidden',true);
      document.getElementById('jap2ff_menu-kask-menu').setAttribute('hidden',true);
      document.getElementById('jap2ff.menu.loadTestSite').setAttribute('hidden',true);
      
      document.getElementById('jap2ff.menu.noJavaPluginHelp').removeAttribute('collapsed');
  }
  
  jap2ffGeneral._getJapC_first = true;
  jap2ffGeneral._getJapC_JAPController = null;
  jap2ffGeneral._showISAlert = false;
  jap2ffGeneral._getJapC = function(){ // JapC -> JapController
       try{          
          if (!jap2ffGeneral.isPopup && ( this._getJapC_first || this._getJapC_JAPController==null ) ){
              window.setTimeout("jap2ffGeneral.checkTimeOutStartJava()", 12000);  
              //set java on if need
              if (!jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.enable_java")
                    && !jap2ffGeneral.oPS.getBoolPref("security.enable_java")
                 )
              {
                  jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.enable_java",true);
                  jap2ffGeneral.oPS.setBoolPref("security.enable_java",true);
              }        
              this._trace("getJapC: start...");
              var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
                          var JAP2FFClassLoader = Components.classes["@jap2ff;1"].getService(Components.interfaces.nsISupports); 
              document.getElementById('jap2ff_status-text').value=jap2ffGeneral.anonState[4];
              if (!JAP2FFClassLoader.wrappedJSObject.initialize(java, true)) {
                  jap2ffGeneral._trace(JAP2FFClassLoader.wrappedJSObject.error);
	          } 
	          document.getElementById('jap2ff_status-text').value=jap2ffGeneral.anonState[2];
	          //set java off if need
	          if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.enable_java")
                    && jap2ffGeneral.oPS.getBoolPref("security.enable_java")
                 )
              {
                  jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.enable_java",false);
                  jap2ffGeneral.oPS.setBoolPref("security.enable_java",false);
              }
	          var japStarter = JAP2FFClassLoader.wrappedJSObject.getJapStarter();
	          if (!japStarter.getIsStart()){
	              this._trace("getJapC: init once... ");
	              japStarter.getJc().setLogDetail(oPS.getIntPref("extensions.jap2ff.LogDetail"));
                  // einlesen des Pfades fuers Logfile
	              var filepath = oPS.getCharPref("extensions.jap2ff.LogFile")
	              if (oPS.getBoolPref("extensions.jap2ff.Log2File") && (filepath.length > 0))
	              {
  	                japStarter.getJc().setLogFile(oPS.getCharPref("extensions.jap2ff.LogFile"),oPS.getIntPref("extensions.jap2ff.LogFileSize"),oPS.getIntPref("extensions.jap2ff.LogFileBackups"));
  	              }	          
	              japStarter.getJc().setLogType(oPS.getIntPref("extensions.jap2ff.LogType"));
	              japStarter.getJc().setLogLevel(oPS.getIntPref("extensions.jap2ff.LogLevel"));
	              japStarter.getJc().setAutoReCon(oPS.getBoolPref("extensions.jap2ff.AutoReCon"));
	              if (oPS.getBoolPref("extensions.jap2ff.sendDummy")){
	                  japStarter.getJc().setDummyTraffic(oPS.getIntPref("extensions.jap2ff.DummyTraffic"));
	              }else{
	                  japStarter.getJc().setDummyTraffic(-1);
	              }    
	              japStarter.getJc().setNoPay(oPS.getBoolPref("extensions.jap2ff.noPayCasc"));
	              var tmpId = oPS.getCharPref("extensions.jap2ff.MixId");
	              japStarter.getJc().setCascadeId(tmpId);
                                    
                  //setInfoService(String id, String name, String hostname, int[] ports)
                  var id   = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.InfoserviceId');
                  var name = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.Infoservice');
                  var host = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.InfoserviceHostname');
                  var tmpP = jap2ffGeneral.oPS.getCharPref('extensions.jap2ff.InfoservicePort');
                  var tmp1 = tmpP.split(',');
                  var ports = new Array();
                  
                  //set databaseDir
                  japStarter.getJc().setDatabaseDir(getDataBaseDir());	                    
				  
                  for (var i=0;i<tmp1.length;i++){
                      ports.push(eval(tmp1[i]));
                      //_trace(ports[i]);
                  } 	              
                  japStarter.getJc().setInfoService(id, name, host, ports );
	              // only localhost ?
	              if (!this.oPS.getBoolPref("extensions.jap2ff.network.onlyLoopback")){
	                 japStarter.getJc().setOnlyLocalAdress(false);
	              }
	              
	              //set anonlibPort
	              japStarter.getJc().setPort(oPS.getIntPref("extensions.jap2ff.anonlibPort"));    
	              
	              //set proxy for anonlib
	              if (oPS.getBoolPref("extensions.jap2ff.isUseProxy") 
	                   && oPS.getCharPref("extensions.jap2ff.proxyHost")!="-1"
	                     && oPS.getIntPref("extensions.jap2ff.proxyPort") != -1
	                 )
	              {
	                  japStarter.getJc().setInitProxy(oPS.getCharPref("extensions.jap2ff.proxyHost"), oPS.getIntPref("extensions.jap2ff.proxyPort"), oPS.getIntPref("extensions.jap2ff.proxyType") );
	              }
	              
	              japStarter.startJap();
	              
	          }
	          this._getJapC_JAPController = japStarter.getJc();
  	          this._trace("getJapC: getJAPController Done.");
  	          this._getJapC_first = false;
	         
              return this._getJapC_JAPController;
          }else{              
              return this._getJapC_JAPController;
          }
       }catch(e){
           this._trace(e);
           if  (e.message && e.message == 'java is not defined'){
			   if (!jap2ffGeneral.showJavaFailure){
				   try{
						// check popup
						if (!jap2ffGeneral.isPopup){
						    if (jap2ffGeneral.oPS.getPrefType("security.enable_java") == jap2ffGeneral.oPS.PREF_BOOL && !jap2ffGeneral.oPS.getBoolPref("security.enable_java")){
		                       // show no Java enabled
			                   window.openDialog("chrome://jap2ff/content/dialogs/noJavaHelp.xul","Warning","centerscreen, chrome, modal"); 
		                    }else{
						       // no Java Plugin
						       window.openDialog("chrome://jap2ff/content/dialogs/noJavaPluginHelp.xul","Warning","centerscreen, chrome, modal");
		                    }
		                }
		                //set java off if need
	                    if (jap2ffGeneral.oPS.getBoolPref("extensions.jap2ff.enable_java")
                             && jap2ffGeneral.oPS.getBoolPref("security.enable_java")
                           )
                        {
                           jap2ffGeneral.oPS.setBoolPref("extensions.jap2ff.enable_java",false);
                           jap2ffGeneral.oPS.setBoolPref("security.enable_java",false);
                        }
		                 
				        jap2ffGeneral.removeJAP(true);
				   }catch(e){
				       this._trace("getJapC_catch: "+e);
				   }
				   jap2ffGeneral.showJavaFailure = true; 
			   }else{
			       jap2ffGeneral.showJavaFailure = false; 
			   }	   
			   
		   }
       }
       return null;   
  };
  
    
  jap2ffGeneral._trace = function (msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
  };
  
  jap2ffGeneral._chromeReload = function(){
      try {
          Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIXULChromeRegistry).reloadChrome();
      } catch(e) { jap2ffGeneral._trace(e) }
  };
  