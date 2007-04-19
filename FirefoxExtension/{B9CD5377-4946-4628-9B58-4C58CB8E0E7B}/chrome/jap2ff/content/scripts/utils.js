  function jap2ff_ShowAbout(){
		window.openDialog("chrome://jap2ff/content/dialogs/about.xul","Jap2FF - About","centerscreen, chrome, modal");
  }
	
  function jap2ff_ShowPref(){
		openPreferences("jap2ffPanePriv");
  }
  
  function jap2ff_showHelp(inpElement, inpEvent, checkPref){
      try{
          var pS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          if (inpElement == "statusbarIcon" && (!checkPref || pS.getPrefType("extensions.jap2ff.showStatusIconHelp") == pS.PREF_BOOL && pS.getBoolPref("extensions.jap2ff.showStatusIconHelp")) ){
              window.openDialog("chrome://jap2ff/content/dialogs/statusIconHelp.xul","Help","centerscreen, chrome, modal");
          }
          
          if (inpElement == "toolbarHelp" && (!checkPref || pS.getPrefType("extensions.jap2ff.showToolbarHelp") == pS.PREF_BOOL && pS.getBoolPref("extensions.jap2ff.showToolbarHelp")) ){
             window.openDialog("chrome://jap2ff/content/dialogs/toolbarHelp.xul","Help","centerscreen, chrome,modal");
          }
          
      }catch(e){_trace("showHelp: "+e);}
  
  }
  
  function jap2ff_showMore(inpElement){
      try{
          
          if (inpElement == "toolbarOnOff" ){
             
              window.openDialog("chrome://jap2ff/content/dialogs/toolbarOnOffMoreHelp.xul","Help","centerscreen, chrome,modal");
          }else{
             _trace('noch keine Funktion hinterlegt :-(');
          }
          
      }catch(e){_trace("showMore: "+e);}
  
  }
   
  function jap2ff_preloadSettings(){
      try{
      	  
          var pS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          
          if (pS.getBoolPref('extensions.jap2ff.pluginFailureJava')){
              
                 document.getElementById('jap2ff_tabBoxPrefs').setAttribute('collapsed',true);
                 document.getElementById('jap2ff_reset2default_hbox').setAttribute('collapsed',true);
                 
                 document.getElementById('jap2ff_noJavaPluginPane').removeAttribute('collapsed');
          
          }else{	  
      	  
      	  //set rdf database
      	  var servicesList = document.getElementById('jap2ff_infoservice-list');
      	  servicesList.database.AddDataSource(jap2ff_rdfService.GetDataSourceBlocking(getDataBaseDir()+infoserviceDatabase));
      	  if (servicesList.builder)
      	  { 
      	      servicesList.builder.rebuild();
              servicesList.builder.refresh();
          }    	   
		  
		  //preload settings
	     
          var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
          var datasource = rdfService.GetDataSource("rdf:local-store");
          
          var toolbar = rdfService.GetResource('chrome://browser/content/browser.xul#jap2ff-toolbar');
          var toolbarState = rdfService.GetResource('collapsed');
          var target = datasource.GetTarget(toolbar, toolbarState, true);
          
          var oPrefBranch = Components.classes["@mozilla.org/preferences;1"].createInstance(Components.interfaces.nsIPrefBranch);
          var isShow = oPrefBranch.getBoolPref("extensions.jap2ff.showToolbar");
          var toolbar_collapsed = false;
		  if (target instanceof Components.interfaces.nsIRDFLiteral){
		     if(target.Value=="true"){
			     toolbar_collapsed = true;
			 }
		  }       
          
          if (target instanceof Components.interfaces.nsIRDFLiteral){
             if (toolbar_collapsed){ 
                document.getElementById('shToolbar_0').setAttribute('checked',false);
                document.getElementById('shToolbar_1').setAttribute('checked',false);
                if (isShow) oPrefBranch.setBoolPref("extensions.jap2ff.showToolbar",false);                
             }else{
                document.getElementById('shToolbar_0').setAttribute('checked',true);
                document.getElementById('shToolbar_1').setAttribute('checked',true);
                if (!isShow) oPrefBranch.setBoolPref("extensions.jap2ff.showToolbar",true);
             }
          }else{
              if (!isShow){
                  oPrefBranch.setBoolPref("extensions.jap2ff.showToolbar",true);
                  document.getElementById('shToolbar_0').setAttribute('checked',true);
                  document.getElementById('shToolbar_1').setAttribute('checked',true);   
              }
          }
          
          // Anpassung an UserLevel
          jap2ff_setUserLevel(-1);
          // nur eine Wahlmoeglichkeite
          jap2ff_setJapStart(); 
                   
          var isDummy = pS.getBoolPref("extensions.jap2ff.sendDummy");
          if (!isDummy){
              document.getElementById('dummytrafficTime').setAttribute('disabled',true); 
              document.getElementById('dummywhenoff').setAttribute('disabled','true');                           
          }else{
              var dt = pS.getIntPref("extensions.jap2ff.DummyTraffic");
              if (dt<1) pS.resetBranch("extensions.jap2ff.DummyTraffic");
              document.getElementById('dummytrafficTime').removeAttribute('disabled');                            
              document.getElementById('dummywhenoff').removeAttribute('disabled');
          }
          
          var isFakeAgent = pS.getBoolPref("extensions.jap2ff.fakeAgent");
          if (!isFakeAgent){
              document.getElementById('anonDetailFakeAgentType1').setAttribute('disabled',true); 
              document.getElementById('anonDetailFakeAgentType2').setAttribute('disabled',true); 
          }else{
              document.getElementById('anonDetailFakeAgentType1').removeAttribute('disabled'); 
              document.getElementById('anonDetailFakeAgentType2').removeAttribute('disabled'); 
          }
          
          var useProxyBroadcaster = document.getElementById('jap2ff_isUseProxyBroadcaster');
                
          if (oPrefBranch.getBoolPref("extensions.jap2ff.isUseProxy")){
              useProxyBroadcaster.setAttribute('class','jap2ff_isOn_class');
              useProxyBroadcaster.removeAttribute('disabled');
          
          } else {
              useProxyBroadcaster.setAttribute('class','jap2ff_isOff_class');
              useProxyBroadcaster.setAttribute('disabled',true);
          }
          
          }//End else extensions.jap2ff.pluginFailureJava
          
      }catch(e){_trace('preloadSettings: '+e);}
  }
  
  
  
  function jap2ff_setUserLevel(inp){
      try{
          var userLevel = 0;
          var oPrefBranch = Components.classes["@mozilla.org/preferences;1"].createInstance(Components.interfaces.nsIPrefBranch);
          if (oPrefBranch.getPrefType("extensions.jap2ff.userLevel") == oPrefBranch.PREF_INT) userLevel = oPrefBranch.getIntPref("extensions.jap2ff.userLevel");            
          if (inp != userLevel){ 
              if ((inp!=null) && (inp > -1) && (inp==0||inp==1||inp==2))userLevel = eval(inp);
              switch(userLevel){
                case 0: {    
                             //Disable Pref Elements! 
                             document.getElementById('jap2ff_userLevel_Help_spacer').removeAttribute('collapsed',true);
				             document.getElementById('jap2ff_userLevel_Help').removeAttribute('collapsed');
				         
				             document.getElementById('jap2ff_gui_pref').removeAttribute('collapsed');
    				         document.getElementById('jap2ff_proxy_pref').setAttribute('collapsed',true);
	    		             document.getElementById('jap2ff_toolbarTab').setAttribute('collapsed',true);
		    	             document.getElementById('jap2ff_warnTab').setAttribute('collapsed',true);
		    	             document.getElementById('jap2ff_anonTab').setAttribute('collapsed',true);
			                 document.getElementById('jap2ff_CascadeTab').setAttribute('collapsed',true);
			                 document.getElementById('jap2ff_InfoServiceTab').setAttribute('collapsed',true);
			                 document.getElementById('jap2ff_KontoTab').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_debug').setAttribute('collapsed',true);
                             if (inp!=null && inp == 0 ) {                
                                 //document.getElementById('shToolbar_0').removeAttribute('checked');
                                 //oPrefBranch.setBoolPref("extensions.jap2ff.showToolbar",false)
                             }

                             oPrefBranch.setIntPref("extensions.jap2ff.userLevel",0);
                             break;
                         
                        }
            
                case 1: {
                             document.getElementById('jap2ff_userLevel_Help_spacer').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_userLevel_Help').setAttribute('collapsed',true);
				         
				             document.getElementById('jap2ff_gui_pref').removeAttribute('collapsed');
				             document.getElementById('jap2ff_proxy_pref').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_toolbarTab').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_warnTab').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_anonTab').setAttribute('collapsed',true);
			                 document.getElementById('jap2ff_lowUser1').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_lowUser2').setAttribute('collapsed',true);
			                                              
                             document.getElementById('jap2ff_CascadeTab').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_InfoServiceTab').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_KontoTab').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_debug').setAttribute('collapsed',true);
                             
                             document.getElementById('jap2ff_shToolbarStateBox').setAttribute('collapsed',true);
                             //document.getElementById('jap2ff_showAnonLevel').removeAttribute('collapsed');
                             document.getElementById('jap2ff_shAnonmeter').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_shAnonbar').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_shAnontext').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_anonLevel').removeAttribute('collapsed');
                                                                                  
                             oPrefBranch.setIntPref("extensions.jap2ff.userLevel",1);

                             break;
                        }
            
                case 2: {    
                             document.getElementById('jap2ff_userLevel_Help_spacer').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_userLevel_Help').setAttribute('collapsed',true);
				         
				             document.getElementById('jap2ff_gui_pref').removeAttribute('collapsed');
				             document.getElementById('jap2ff_proxy_pref').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_toolbarTab').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_warnTab').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_anonTab').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_anonSettingsDetails').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_lowUser1').setAttribute('collapsed',true);
			                 document.getElementById('jap2ff_lowUser2').removeAttribute('collapsed');
			                 document.getElementById('jap2ff_CascadeTab').removeAttribute('collapsed');
                             document.getElementById('jap2ff_InfoServiceTab').removeAttribute('collapsed');
                             document.getElementById('jap2ff_KontoTab').setAttribute('collapsed',true);
                             
                             if (oPrefBranch.getBoolPref("extensions.jap2ff.showDebugPane")){
                                 document.getElementById('jap2ff_debug').removeAttribute('collapsed');
                             }else{
                                 document.getElementById('jap2ff_debug').setAttribute('collapsed',true);
                             }    
                             
                             document.getElementById('jap2ff_shToolbarStateBox').removeAttribute('collapsed');
                             //document.getElementById('jap2ff_showAnonLevel').setAttribute('collapsed',true);
                             document.getElementById('jap2ff_shAnonmeter').removeAttribute('collapsed');
                             document.getElementById('jap2ff_shAnonbar').removeAttribute('collapsed');
                             document.getElementById('jap2ff_shAnontext').removeAttribute('collapsed');
                             document.getElementById('jap2ff_anonLevel').setAttribute('collapsed',true);                         
                             
                             oPrefBranch.setIntPref("extensions.jap2ff.userLevel",2);
                         
                             break;
                        }                
                           
                
                
                default:{}
              }
          }
  
      
      }catch(e){_trace("setUserLevel: "+e);}
  }
  
  function jap2ff_setJapStart(){
  /*  try{
      var doc = document.getElementById('proxyOnStart');
      if (doc.getAttribute('checked')){
          document.getElementById('manJapStart').setAttribute('disabled',true);
          document.getElementById('manJapStartDescription').setAttribute('style','color:gray;');
      } else{
         document.getElementById('manJapStart').removeAttribute('disabled');
         document.getElementById('manJapStartDescription').removeAttribute('style');      
      }
    }catch(e){_trace('setJapStart: '+e)}  */
  }
  
  function jap2ff_loadTestPage(){
      try{
          var tab = (document.getElementById('content'));
          
          var pS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          if  (pS.getPrefType("extensions.jap2ff.testSiteURL") == pS.PREF_STRING){
          
              var url = pS.getCharPref("extensions.jap2ff.testSiteURL");
              tab.mCurrentBrowser.loadURIWithFlags( url ,  nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE , null , null);
              if (pS.getPrefType("extensions.jap2ff.userLevel") == pS.PREF_INT && pS.getIntPref("extensions.jap2ff.userLevel")==2){
			      if (pS.getPrefType("extensions.jap2ff.testSiteURL_Expert") == pS.PREF_STRING){
			          url = pS.getCharPref("extensions.jap2ff.testSiteURL_Expert");
					  BrowserOpenTab(); 
					  tab.mCurrentBrowser.loadURIWithFlags( url ,  nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE , null , null);
				  }	  			      
			  }
			  
		  }else{
              _trace("loadTestPage: no URL!");
          }
          
      }catch(e){ _trace('loadTestPage: '+e); }
      
  }
  
  function jap2ff_changeToolbar(inp){
      try{
          // braucht man nicht mehr ...
          if (false){
              var rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
              var datasource = rdfService.GetDataSource("rdf:local-store");
              var toolbar = rdfService.GetResource('chrome://browser/content/browser.xul#jap2ff-toolbar');
              var toolbarState = rdfService.GetResource('collapsed'); 
              var target = datasource.GetTarget(toolbar, toolbarState, true);
          
              var oPrefBranch = Components.classes["@mozilla.org/preferences;1"].createInstance(Components.interfaces.nsIPrefBranch);
              var isShow = oPrefBranch.getBoolPref("extensions.jap2ff.showToolbar");
              
              
              if(inp.getAttribute('checked')){ 
                  // ist noch checked, wird aber entfernt
                  target = rdfService.GetLiteral("true");
                  datasource.Assert(toolbar,toolbarState, target, true);
                  if (inp.id == 'shToolbar_0'){
                      document.getElementById('shToolbar_1').removeAttribute('checked');
                  }else{
                      document.getElementById('shToolbar_0').removeAttribute('checked');
                  }
                  if (isShow) {
                      oPrefBranch.setBoolPref("extensions.jap2ff.showToolbar",false);
                      oPrefBranch.setBoolPref("extensions.jap2ff.showToolbar",true);
                  }
              }else{
                  // ist noch nicht checked, wurde aber angeklickt
                  target = rdfService.GetLiteral("true");
                  datasource.Unassert(toolbar,toolbarState, target);
                  if (inp.id == 'shToolbar_0'){
                      document.getElementById('shToolbar_1').setAttribute('checked',true);
                  }else{
                      document.getElementById('shToolbar_0').setAttribute('checked',true);
                  }
                  if (isShow) {
                      oPrefBranch.setBoolPref("extensions.jap2ff.showToolbar",true);
                      oPrefBranch.setBoolPref("extensions.jap2ff.showToolbar",false);
                  }
              }
          }
      }catch(e){_trace('changeToolbar: '+e);}   
  }
  
  function jap2ff_reset2defaults(){
      try{
          
          //var oPrefService = Components.classes["@mozilla.org/preferences;1"].createInstance(Components.interfaces.nsIPrefService);
          // var japBranch  = oPrefService.getBranch("extensions.jap2ff.");
          // japBranch.resetBranch();
          
          const aBranch="extensions.jap2ff.";      
          const PREF = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
          const gPrefService = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
          const gPrefBranch = gPrefService.getBranch(null).QueryInterface(Components.interfaces.nsIPrefBranch2);
          
          //gPrefBranch.clearUserPref(aBranch+"showAnonbar");
          
          var japPrefBranchChildArray;
          var japPrefBranchChildArraySize = new Object();
          
          japPrefBranchChildArray  = PREF.getChildList(aBranch, japPrefBranchChildArraySize);
          
          for(i=0;i<japPrefBranchChildArraySize.value;i++){
              var help = japPrefBranchChildArray[i];
              var help2= "extensions.jap2ff.";
              if (PREF.prefHasUserValue(help)&& help!=help2+"noCookiesBackup" && help!=help2+"noJavaBackup" && help!=help2+"noJavaScriptBackup" ){
                  gPrefBranch.clearUserPref(help);    
              }
              
          }
          
          jap2ff_setUserLevel(-1);
          
          
      }catch(e){_trace('reset2defaults: '+e);}      
          
  }
  
  function jap2ff_setDummy(inp){
      try{
          var pS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");      
          if(document.getElementById('dummytraffic').getAttribute('checked')){
              
              document.getElementById('dummytrafficTime').setAttribute('disabled','true');
              document.getElementById('dummywhenoff').setAttribute('disabled','true');
          }else{
              
              document.getElementById('dummytrafficTime').removeAttribute('disabled');
              document.getElementById('dummywhenoff').removeAttribute('disabled');
          }
      }catch(e){
         _trace('setDummy: '+e);
      }
  }
  
  function jap2ff_setLogFile(){
      try{
           var pS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");      
           const nsIFilePicker = Components.interfaces.nsIFilePicker;
           var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
           fp.init(window, "Set Log File", nsIFilePicker.modeOpen);
           fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText | nsIFilePicker.filterImages |
                            nsIFilePicker.filterXML | nsIFilePicker.filterHTML);

           if (fp.show() == nsIFilePicker.returnOK){  
               var path = (fp.file.path);
               
               document.getElementById('jap2ff_filename').value = path;
               pS.setCharPref("extensions.jap2ff.LogFile",path);
           } 
      
      
      
      }catch(e){
          _trace(e);
      }
  }
  
  function jap2ff_checkLogFile(){
      try{
          var filename = document.getElementById('jap2ff_filename').value;
          
          if (!document.getElementById('jap2ff_log2file_checkbox').checked){
          
              if (filename.length ==0 )jap2ff_setLogFile();
          }
          
          return true;
      }catch(e){
          _trace(e);
          return false;
      }
  }
  
  var xmlReq;
  function jap2ff_getInfoServices(){
    try{
        //_trace('start xmlHttpRequest ...');
        xmlReq = new XMLHttpRequest();
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        
        var tmpP = oPS.getCharPref('extensions.jap2ff.InfoservicePort');
        var tmp1 = tmpP.split(',');
        var ports = new Array();
          
        for (var i=0;i<tmp1.length;i++){
              ports.push(eval(tmp1[i]));
        }
        //_trace("http://"+oPS.getCharPref('extensions.jap2ff.InfoserviceHostname')+':'+ports[0]+"/infoservices");
        xmlReq.open("Get","http://"+oPS.getCharPref('extensions.jap2ff.InfoserviceHostname')+':'+ports[0]+"/infoservices",true);
        xmlReq.onreadystatechange = function () {
            if (xmlReq.readyState == 4) {
                if(xmlReq.status == 200)
                   jap2ff_doXMLWorkInfoServices(xmlReq.responseXML);
                else
                   _trace("Error loading page jap2ff_getInfoServices\n");
            }
        }    
        xmlReq.send(null);
        
    }catch(e){
        _trace(e);
    }    
    
  }
  
  //loads cascads via xmlHttpRequest
  
  var xmlReq2;
  function jap2ff_getCascadesForList(inp){
    try{
        
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        var tmpP = oPS.getCharPref('extensions.jap2ff.InfoservicePort');
        var tmp1 = tmpP.split(',');
        var ports = new Array();         
        for (var i=0;i<tmp1.length;i++){
              ports.push(eval(tmp1[i]));
        }
        var tmpURL = 'http://'+oPS.getCharPref('extensions.jap2ff.InfoserviceHostname')+':'+ports[0]+'/cascades';
        switch (inp){
            
            case 0:{
                       //_trace('start getCascadesForList full ...');
                       AjaxRequest.get(
                           {
                                'url':tmpURL
                               ,'onSuccess':function(req){ jap2ff_doXMLWorkCascadeIds(req.responseXML,false); }
                               ,'timeout':10000
                               ,'onTimeout':function(req){ jap2ffGeneral.showInfoserviceTimeOut('getCascadesForList full'); }
                               ,'onError':function(req){_trace('Error getCascadesForList full\n'+req.responseText); }
                           }
                       );
                       //_trace('end getCascadesForList full');
                       break;
                   }
            
            case 1:{
                       //_trace('start getCascadesForList only idVector ...');
                       AjaxRequest.get(
                           {
                                'url':tmpURL
                               ,'onSuccess':function(req){ jap2ff_doXMLWorkCascadeIds(req.responseXML,true); }
                               ,'timeout':10000
                               ,'onTimeout':function(req){ jap2ffGeneral.showInfoserviceTimeOut('getCascadesForList only idVector'); }
                               ,'onError':function(req){_trace('Error getCascadesForList only idVector\n'+req.responseText); }
                           }
                       );
                       //_trace('end getCascadesForList only idVector');
                       break;
                   }       
        
            case 2:{   _trace('start getCascadesForList manual ...');
                       _trace(tmpURL);
                       AjaxRequest.get(
                           {
                                'url':tmpURL
                               ,'onSuccess':function(req){ jap2ff_doXMLWorkCascadeIds(req.responseXML,false);jap2ffGeneral.reloadCascadesTimeOut(false);}
                               ,'timeout':10000
                               ,'onTimeout':function(req){ 
							                                jap2ffGeneral.hasShowInfoserviceTimeOut = false;
														    jap2ffGeneral.showInfoserviceTimeOut('getCascadesForList manual');jap2ffGeneral.reloadCascadesTimeOut(true); 
														}
                               ,'onError':function(req){_trace('Error getCascadesForList manual\n'+req.responseText);jap2ffGeneral.reloadCascadesTimeOut(true); }
                           }
                       );
                       //_trace('end getCascadesForList manual');
                       break;
                   }
        
            default:{}
        }        
    }catch(e){
        _trace(e);
    }    
    
  }
  
  // loads cascades via xmlHttpRequest && update Cascade DB  
  var xmlReq3;
  function jap2ff_updateCascadeDB(){
    try{
        
        //_trace('start xmlHttpRequest ...');
        xmlReq3 = new XMLHttpRequest();
        var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        var tmpP = oPS.getCharPref('extensions.jap2ff.InfoservicePort');
        var tmp1 = tmpP.split(',');
        var ports = new Array();
          
        for (var i=0;i<tmp1.length;i++){
              ports.push(eval(tmp1[i]));
        }
        //_trace("http://"+oPS.getCharPref('extensions.jap2ff.InfoserviceHostname')+':'+ports[0]+"/cascades");
        xmlReq3.open("Get","http://"+oPS.getCharPref('extensions.jap2ff.InfoserviceHostname')+':'+ports[0]+"/cascades",true);
        
        xmlReq3.onreadystatechange = function () {
                if (xmlReq3.readyState == 4) {
                    if(xmlReq3.status == 200)
                       //insert in db -> database.js
                       jap2ff_processCascades(xmlReq3.responseXML);
                    else
                       _trace("Error loading page\n");
                }
        }
            
            
        xmlReq3.send(null);
        
    }catch(e){
        _trace(e);
    }    
    
  }
  
  function jap2ff_doXMLWorkInfoServices(inp){
      try{
          //_trace('start doXMLWorkInfoServices...');
          
          // check xmlDoc
          
          if (inp==null) return false;          
          
          // clear DB
          if(!jap2ff_clearInfoServices()) _trace('Error jap2ff_clearInfoServices()');
          
          var infoSerList = inp.getElementsByTagName('InfoService');
          var tmpIS;
          var tmpID;
          var tmpName;
           
          
          for(var i=0; i<infoSerList.length;i++){
              
              tmpIS = infoSerList.item(i);
              // get InfoService ID
              tmpID = tmpIS.getAttribute('id');
                      
              var tmpTagName = tmpIS.firstChild;
              // get Infoservice Name
              tmpName = tmpTagName.firstChild.nodeValue;
              
              // get Infoservice Hosts + Ports
              
              var tmpListnerIfs = tmpIS.getElementsByTagName('ListenerInterface');
              
              var tmpHost='';
              var tmpPorts='';
              
              for(var b=0;b<tmpListnerIfs.length;b++){
                  
                  var tmpLiIf = tmpListnerIfs.item(b);
                  //_trace('tmpLiIf '+tmpLiIf.nodeName+' '+tmpLiIf.nodeValue+' '+tmpLiIf.nodeType);
                  if (tmpLiIf.hasChildNodes()){
                      var nodeL = tmpLiIf.childNodes;
                      
                      for (var c=0;c<nodeL.length;c++){
                           if (nodeL[c].nodeName == 'Host' && tmpHost=='') tmpHost=nodeL[c].firstChild.nodeValue;                
                           if (nodeL[c].nodeName == 'Port') tmpPorts+=nodeL[c].firstChild.nodeValue+',';      
                      }   
                  }
                  
              } 
              
              if (tmpPorts.length-1 == tmpPorts.lastIndexOf(','))tmpPorts = tmpPorts.substring(0,tmpPorts.length-1);  
                            
              jap2ff_addInfoService(tmpID, tmpName, tmpHost, tmpPorts);
                      
              //_trace("hier: "+tmpTagName.firstChild.nodeValue);
                            
          
          }
          
          jap2ff_selectCascadeRow();   
          //_trace('end doXMLWorkInfoServices...');
      }catch(e){
          _trace(e);
      }
      return true;
  }
  
  
    
  var idVector;
  var mixesVector;
  var jap2ff_doXMLWorkCascadeIdsCounter = 0;
  function jap2ff_doXMLWorkCascadeIds(inp, bool){
      try{
          //_trace('start doXmlWorkCascadeIds...');
          if (!inp){
              //_trace('doXmlWorkCascadeIds inp==null');
              jap2ff_doXMLWorkCascadeIdsCounter++;
              if (jap2ff_doXMLWorkCascadeIdsCounter < 10){ 
                  if (bool){
                      jap2ff_getCascadesForList(1);              
                  }else{
                      jap2ff_getCascadesForList(0);
                  }
              }    
          }         
          jap2ff_doXMLWorkCascadeIdsCounter=0;
          var listCascades = inp.getElementsByTagName('MixCascade');
          //_trace('doXmlWorkCascadeIds listCascades: '+listCascades.length);
          
          if (listCascades.length == 0){ 
              if (idVector){    
                  return false; //only new if not null
              }else{
                  if (!mixesVector){
                      document.getElementById('jap2ff_casc-list-label').value = document.getElementById('jap2ff_casc-list-label_message').value; 
                      return false;
                  }
              }    
          }    
          
          idVector = new Array();
          mixesVector = new Array();
          var menu = (document.getElementById('kaskade-list'));
          
          var hasMenu = false;
          if (menu && !bool){
              hasMenu = true;
              menu.removeAllItems();
              //menuItem = menu.insertItemAt ( 0 , 'direkt'  , -1 , '' );
              //menuItem.setAttribute("oncommand","jap2ffGeneral.setMixCascade(-1)");
          }    
          
          
          for (var i=0;i<jap2ffGeneral.menuArray.length && !bool;i++){
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
          
          
          
                   
          for(var i=0;i<listCascades.length;i++){
              var tmpItem = listCascades.item(i);
              
              var tmpPay  = tmpItem.getElementsByTagName('Payment');
              var isPay = false;
              // only one Payment per Cascade             
              tmpPay = tmpPay.item(0);
              
              if (tmpPay && tmpPay.hasAttributes() && tmpPay.hasAttribute('required') && tmpPay.getAttribute('required') == 'true'){
                  isPay=true;
                   //_trace('isPay id: '+tmpItem.getAttribute('id'));
              }
              
              //check if payment in prefs
              var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
              if (!oPS.getBoolPref("extensions.jap2ff.noPayCasc")) isPay=false;
              
              if (!isPay){
                  idVector.push(tmpItem.getAttribute('id'));
                  //_trace('id: '+tmpItem.getAttribute('id'));
                  
                  //MixCount
                  var mixesNode = tmpItem.getElementsByTagName('Mixes');
                  mixesNode = mixesNode.item(0);
                  mixesVector.push(mixesNode.getAttribute('count'));
                  
                  
              }        
          }
          //_trace('length: '+idVector.length);
          
          for(var i=0;i<idVector.length && !bool;i++){
              var tmpID = idVector[i];
              var elem = jap2ff_getElemById(inp,tmpID); 
              
              if (hasMenu && elem!=null){
                  menuItem = menu.insertItemAt ( i , elem.firstChild.firstChild.nodeValue , i , '' );
                  menuItem.setAttribute("oncommand","jap2ffGeneral.setMixCascade("+i+");");
              }
              
              for (var b=0;b<jap2ffGeneral.menuArray.length;b++){ 
                  menu2 = document.getElementById(jap2ffGeneral.menuArray[b]);
              
                  if (menu2 && elem!=null){
                      menuItem = document.createElement("menuitem");
                      menuItem.setAttribute("label", elem.firstChild.firstChild.nodeValue);
                      menuItem.setAttribute("oncommand","jap2ffGeneral.setMixCascade("+i+")");
                      menuItem.setAttribute('image','chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[1]);    
                      menuItem.setAttribute('class','menuitem-iconic');
                      menu2.appendChild(menuItem);
                  }
              }
              
          }
          var tmpInt = jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.LastXMLCascade");
          //only if anonlib off!
          if (!bool){
                  if (tmpInt < idVector.length && tmpInt > -1){ 
             
                  menu.selectedIndex = jap2ffGeneral.oPS.getIntPref("extensions.jap2ff.LastXMLCascade");
                  var text = document.getElementById('jap2ff_casc-list-label');
                  text.value = menu.label; 
                  jap2ffGeneral.oPS.setCharPref('extensions.jap2ff.LastCascade',idVector[menu.selectedIndex]);
                 
                  for (var b=0;b<jap2ffGeneral.menuArray.length;b++){ 
                      menu2 = document.getElementById(jap2ffGeneral.menuArray[b]);
                      if (menu2){
                         if (menu2.hasChildNodes()){
                            var childs = menu2.childNodes;
                               for (var d=0;d<childs.length;d++){
                                  if (d == menu.selectedIndex) 
                                     childs[d].setAttribute('style','font-weight:bold;');
                                  else
                                      childs[d].removeAttribute('style');    
                               }
                               if (menu.selectedIndex>0) menu2.firstChild.removeAttribute('style');
                         }                         
                      }
                  }
               
              }else{
                  var text = document.getElementById('jap2ff_casc-list-label');
                  var bundle = srGetStrBundle("chrome://jap2ff/locale/jap2ff.properties");
                  text.value = bundle.GetStringFromName("jap2ff.list.noService");
              }
          }
          jap2ffGeneral.refreshToolbarStatus(1);   
          jap2ff_updateCascState(); 
      }catch(e){
          _trace(e);
      }
      return true;
  }
  
  
  function jap2ff_getXMLStatusInfo(inp){
      try{
           //_trace('try load XML StatusInfo');
          if (jap2ffGeneral._getJapC_JAPController==null){
              //_trace('try load XML StatusInfo');
              //_trace('inp '+inp);
              //block recall
              var input = 2;
              if (inp && inp==3){
                  input = 4;
              }    
                                  
              var menu = document.getElementById('kaskade-list');
          
              var selIndex = -1;
              
              //var b = menu.selectedItem;
              //var c = menu.selectedItem.value;
              //_trace('selItem: '+b+' value: '+c);
              
              var d = menu.selectedIndex;   
              
              //_trace('index '+ d );
          
              if (menu && menu.selectedItem && menu.selectedItem.value){
                  selIndex = menu.selectedItem.value;
              }else if (d > -1){
                  selIndex = d;
                  input = 2;
              }else{
                  return true;
              }
              //_trace('index: '+selIndex);
              if (!idVector) return true;     
              //_trace('has idVector');      
              var id = idVector[selIndex];
              var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
              //_trace('id '+id);
              var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(""); 
              var xmlreq = new XMLHttpRequest();
              var tmpP = oPS.getCharPref('extensions.jap2ff.InfoservicePort');
              var tmp1 = tmpP.split(',');
              var ports = new Array();
          
              for (var i=0;i<tmp1.length;i++){
                  ports.push(eval(tmp1[i]));
              }
              var tmpURL = "http://"+oPS.getCharPref('extensions.jap2ff.InfoserviceHostname')+':'+ports[0]+"/mixcascadestatus/"+id;
              //_trace(tmpURL+'\nXML StatusInfo');
              xmlreq.open("Get",tmpURL,true);
              xmlreq.onreadystatechange = function () {
                try{
                    if (xmlreq.readyState == 4) {
                        if(xmlreq.status == 200){
                            var xmlDoc = xmlreq.responseXML;
              
                            var xmlStatus = xmlDoc.getElementsByTagName('MixCascadeStatus');
                            xmlStatus = xmlStatus.item(0);
                            if (xmlStatus.hasAttributes() && xmlStatus.hasAttribute('nrOfActiveUsers') && xmlStatus.hasAttribute('trafficSituation')){
                          
                                jap2ffGeneral.userCount = xmlStatus.getAttribute('nrOfActiveUsers');
                            
                                var a_mixCascadeLength = eval(mixesVector[selIndex]);
                                var a_getNrOfActiveUsers = eval(jap2ffGeneral.userCount); 
                                var a_getTrafficSituation = eval(xmlStatus.getAttribute('trafficSituation')); 
                                //_trace(a_mixCascadeLength+' '+a_getNrOfActiveUsers+' '+a_getTrafficSituation);
                            
                                if ( (a_mixCascadeLength >= 0) && (a_getNrOfActiveUsers >= 0) && (a_getTrafficSituation >= 0)) {
                                    var userFactor = Math.min( (  a_getNrOfActiveUsers)  / 500.0, 1.0);
                                    //_trace('userFactor: '+userFactor);
                                    var trafficFactor = Math.min( ( a_getTrafficSituation ) / 100.0, 1.0);
                                    //_trace('trafficFactor: '+trafficFactor);
                                    var mixFactor = 1.0 - Math.pow(0.5, a_mixCascadeLength);
                                    //_trace('mixFactor: '+mixFactor);
                                    //_trace('erg: '+(userFactor * trafficFactor * mixFactor * 6.0)); 
                                    /* get the integer part of the product -> 0 <= anonLevel <= 5 because mixFactor is always < 1.0 */
                                    jap2ffGeneral.anonLevel = Math.round((userFactor * trafficFactor * mixFactor * 6.0)+2); //+2 wegen jap2ffGeneral.meter Array z.b.
                                }
                                  
                                  
                                //_trace('jap2ffGeneral.anonLevel: '+jap2ffGeneral.anonLevel); 
                          
                            }
              
                            //_trace("input: "+input);
                        
                            //refesh Elements
                            jap2ffGeneral.refreshToolbarStatus(input);
                    
                        }else{
                            jap2ffGeneral.userCount = 'n.a.';
                            jap2ffGeneral.anonLevel = 1;
                            //if (input==1) input = 2;
                            jap2ffGeneral.refreshToolbarStatus(input);
                           _trace("Error loading page getXMLStatusInfo()\n");
                        }   
                    }
                
                }catch(e){
                    _trace(e);
                }      
              }      
              xmlreq.send(null);
              return true;
          }
      }catch(e){
          _trace(e);
          return false;
      }
  }
  
  
  
  function jap2ff_getElemById(inp, id){
      try{
          //_trace(inp);
          //_trace(inp instanceof Element);
          if (inp.hasAttributes() && inp.hasAttribute('id')){
                  if (inp.getAttribute('id') == id){
                      return inp;
                  }else{
                      return null;
                  }
          }else if (inp.hasChildNodes()) {
              var tmpNodes = inp.childNodes; 
              for(var i=0;i<tmpNodes.length;i++){
                  var ret = jap2ff_getElemById(tmpNodes.item(i), id);               
                  if (ret!=null) return ret;
              }
          }
          return null;
      }catch(e){
          _trace(e);
          return null;
      }
  }
  
  var jap2ff_updateCascStateCounter = 0;
  function jap2ff_updateCascState(){
            
      //_trace('start jap2ff_updateCascState'); 
      if (!idVector){
           _trace('jap2ff_updateCascState idVector==null');
           jap2ff_getCascadesForList(1); //reload idVector 
           return true;
      }     
      
      
      var menu2 = document.getElementById(jap2ffGeneral.menuArray[0]);
              
      if (menu2 && menu2.hasChildNodes()){
              
          var childs = menu2.childNodes;
               
          for (var d=0;d<(childs.length);d++){
              var menuItem = childs[d];
                  
              var id = idVector[d];
              if (!id){
                  _trace('jap2ff_updateCascState reload ids');
                  if (jap2ff_updateCascStateCounter > 10){
                      jap2ff_updateCascStateCounter++;
                      jap2ff_getCascadesForList(1); //reload idVector
                  }
                  return true;
              }
                  
              var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
              if (!oPS) return false;
              var xmlreq = new XMLHttpRequest();
              var tmpP = oPS.getCharPref('extensions.jap2ff.InfoservicePort');
              var tmp1 = tmpP.split(',');
              var ports = new Array();
          
              for (var i=0;i<tmp1.length;i++){
                  ports.push(eval(tmp1[i]));
              }
              var tmpURL = "http://"+oPS.getCharPref('extensions.jap2ff.InfoserviceHostname')+':'+ports[0]+"/mixcascadestatus/"+id; 
              //_trace(tmpURL+'\njap2ff_updateCascState')
              xmlreq.open("Get",tmpURL,true);
              xmlreq.myItem = d;
              xmlreq.myURL = tmpURL;
              xmlreq.onload = function (event) {
                  try{
                      var self = event.target;
                      if (self.readyState == 4) {
                          if(self.status == 200){
                              var xmlDoc = self.responseXML;
              
                              var xmlStatus = xmlDoc.getElementsByTagName('MixCascadeStatus');
                              xmlStatus = xmlStatus.item(0);
                              
                              var lokalIndex = self.myItem;
                              var lokalAnonLevel = 1;
                              if (xmlStatus.hasAttributes() && xmlStatus.hasAttribute('nrOfActiveUsers') 
                                                            && xmlStatus.hasAttribute('trafficSituation')
                                 )
                              {
                                  var a_userCount = xmlStatus.getAttribute('nrOfActiveUsers');
                            
                                  var a_mixCascadeLength = eval(mixesVector[lokalIndex]);
                                  var a_getNrOfActiveUsers = eval(a_userCount); 
                                  var a_getTrafficSituation = eval(xmlStatus.getAttribute('trafficSituation')); 
                                  //_trace(a_mixCascadeLength+' '+a_getNrOfActiveUsers+' '+a_getTrafficSituation);
                                                                         
                                  if ( (a_mixCascadeLength >= 0) && (a_getNrOfActiveUsers >= 0) && (a_getTrafficSituation >= 0)) 
                                  {
                                      var userFactor = Math.min( (  a_getNrOfActiveUsers)  / 500.0, 1.0);
                                      //_trace('userFactor: '+userFactor);
                                      var trafficFactor = Math.min( ( a_getTrafficSituation ) / 100.0, 1.0);
                                      //_trace('trafficFactor: '+trafficFactor);
                                      var mixFactor = 1.0 - Math.pow(0.5, a_mixCascadeLength);
                                      //_trace('mixFactor: '+mixFactor);
                                      //_trace('erg: '+(userFactor * trafficFactor * mixFactor * 6.0)); 
                                      /* get the integer part of the product -> 0 <= anonLevel <= 5 because mixFactor is always < 1.0 */
                                      lokalAnonLevel = Math.round((userFactor * trafficFactor * mixFactor * 6.0)+2); //+2 wegen jap2ffGeneral.meter Array z.b.
                                  }
                              }else{
                                  _trace('Attributes? '+xmlStatus.hasAttributes());
                              }
                               
                              for (var b=0;b<jap2ffGeneral.menuArray.length;b++){ 
                                  menu2 = document.getElementById(jap2ffGeneral.menuArray[b]);
                                  if (menu2 && menu2.hasChildNodes()){
                                     if(menu2.childNodes[self.myItem]) menu2.childNodes[self.myItem].setAttribute('image','chrome://jap2ff/content/icons/jap/'+jap2ffGeneral.icons[lokalAnonLevel]);    
                                     if(menu2.childNodes[self.myItem]) menu2.childNodes[self.myItem].setAttribute('class','menuitem-iconic');
                                  }
                              } 
                               
                               
                              //_trace('hier:'+lokalIndex+' '+self.myItem+ ' '+lokalAnonLevel);
                    
                          }else{
                              _trace(self.myURL+"\nError loading page updateCascState");
                          }
                          return true;   
                      }
                  }catch(e){
                      _trace(e);
                  }
                  return true;
              }
              xmlreq.send(null);    
          }
      }
      jap2ff_updateCascStateCounter=0; // no error -> retry counter = 0;
      //_trace('jap2ff_updateCascState requests send');
      return true;                
  }
  
  function jap2ff_selectCascadeRow(){
      try{
          var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          var testID = oPS.getCharPref('extensions.jap2ff.InfoserviceId');
          
          var tree = document.getElementById('jap2ff_infoservice-list');
          //_trace('selectCascadeRow: '+tree.view.selection.currentIndex);
          
          
          var cols = tree.treeBoxObject.columns;
          
          if (cols){
              //_trace('cols count '+cols.count);
              var col = cols.getColumnAt(3);
              //_trace(tree.view.getCellText(0,col));
              if (cols.count > 0 && col){
                  var firstRow = tree.treeBoxObject.getFirstVisibleRow();
                  var lastRow  = tree.treeBoxObject.getLastVisibleRow();
                  var b=firstRow;
                  var hit = false;
                  //_trace('first: '+firstRow+' last: '+lastRow);
          
                  while(firstRow<=b && b<=lastRow){
                      //_trace('b: '+b);
                      var tmpID = tree.view.getCellText(b,col);
                      //_trace(tmpID)
                      if (testID == tmpID) {
                          hit=true;
                          break;
                      }
                      b++;         
                  }
                  if (hit) tree.view.selection.select(b);
              }    
          }     
      
      }catch(e){
          _trace(e);
      }
  }

  function jap2ff_selectInfoservice(){
      try{
          var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          var testID = oPS.getCharPref('extensions.jap2ff.InfoserviceId');
          var tree = document.getElementById('jap2ff_infoservice-list');
          var cIndex = tree.currentIndex;
          //_trace('cIndex '+cIndex);
          if (cIndex == -1){
              alert('Sie m?ssen einen IS w?hlen');
              return false;
          }
          
          var cols = tree.treeBoxObject.columns;
          for (var i=0;i<4;i++){
              var col = cols.getColumnAt(i);
              var text = tree.view.getCellText(cIndex,col);
              //_trace('text '+i+' '+text);
              if (i==0) oPS.setCharPref('extensions.jap2ff.Infoservice', text);
              if (i==1) oPS.setCharPref('extensions.jap2ff.InfoserviceHostname', text);
              if (i==2) oPS.setCharPref('extensions.jap2ff.InfoservicePort', text);
              if (i==3) oPS.setCharPref('extensions.jap2ff.InfoserviceId', text);
          }
          
          var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
          if (oPS.getBoolPref('extensions.jap2ff.setOn')) {
              _trace('setInfoService');
              observerService.notifyObservers(null,"changeInfoservice",null);
          }else{
              //reload cascade list
              observerService.notifyObservers(null,"reloadCascadeLists",null);
          }                        
          
          return true;
      }catch(e){
          _trace(e);
          return false;
      }
  }
  
    
  function jap2ff_setRadioBack(e){
      document.getElementById('jap2ff_proxyOn').selectedIndex = 0;
  }
  
  
  function jap2ff_sizePopup(inp){
      try{
          var label  = document.getElementById('jap2ff_casc-list-label');
          
          var curWidth = label.boxObject.width;
          //_trace('curWidth: '+curWidth+' : '+inp.parentNode.boxObject.width)
          inp.width = curWidth+inp.parentNode.boxObject.width;          
         
      }catch(e){
          _trace(e);
      }    
  }
  
  function jap2ff_clickFakeAgentCheckbox(){
      try{
          var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          var tmpCheckBox = document.getElementById('fakeAgentCheckbox');
          var isFakeAgent = tmpCheckBox.checked;
          if (!isFakeAgent){
              document.getElementById('anonDetailFakeAgentType1').setAttribute('disabled',true); 
              document.getElementById('anonDetailFakeAgentType2').setAttribute('disabled',true); 
              oPS.setBoolPref("extensions.jap2ff.fakeAgent",false);
              if (oPS.getPrefType("general.useragent.override")>0 && oPS.prefHasUserValue("general.useragent.override")){
                  oPS.clearUserPref("general.useragent.override");
              }
          }else{
              document.getElementById('anonDetailFakeAgentType1').removeAttribute('disabled'); 
              document.getElementById('anonDetailFakeAgentType2').removeAttribute('disabled'); 
              oPS.setBoolPref("extensions.jap2ff.fakeAgent",true);
			  jap2ff_clickFakeAgentType();
          }
      }catch(e){
          _trace(e);
      }
  } 
  
  function jap2ff_clickFakeAgentType(){
      try{
          var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          var tmpRadio = document.getElementById('fakeAgentType');
          if (oPS.getBoolPref("extensions.jap2ff.setOn")) {
              switch (eval(tmpRadio.value)){
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
          
      }catch(e){
          _trace(e);
      }
  }
  
  function jap2ff_anOnIsUseProxyClick(){
      try{         
          var oPS = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
          var elem = document.getElementById('jap2ff_isUseProxyBroadcaster');
          var cBox = document.getElementById('useAnonlibProxy');
          
		  
          if (cBox.checked){
              elem.setAttribute('class','jap2ff_isOn_class');
              elem.removeAttribute('disabled');
              oPS.setBoolPref("extensions.jap2ff.hasUserSetProxy",true);
          
          } else {
              elem.setAttribute('class','jap2ff_isOff_class');
              elem.setAttribute('disabled',true);
              oPS.setBoolPref("extensions.jap2ff.hasUserSetProxy",false);
          }
      }catch(e){
          _trace(e);
      }    
  }
    
  function  _trace(msg) {
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(msg);
  }