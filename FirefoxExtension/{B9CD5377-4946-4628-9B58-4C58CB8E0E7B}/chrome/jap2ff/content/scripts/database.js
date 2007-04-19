const cascades = "chrome://jap2ff/content/scripts/database/cascades";
const cascade  = "chrome://jap2ff/content/scripts/database/cascade";


const databaseString = "file:///C://data2.rdf";

const infoserviceDatabase = 'infoservices.rdf';

const baseInfoService = "chrome://jap2ff/content/scripts/database/InfoServices";
const infoService = "chrome://jap2ff/content/scripts/database/InfoService#";

var   iServiceId = '';
var   iServiceIp = '';
var   iServicePorts = '';

const jap2ff_contUtil = Components.classes["@mozilla.org/rdf/container-utils;1"].getService(Components.interfaces.nsIRDFContainerUtils);
const jap2ff_rdfService = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);


var jap2ff_datasource; 
var jap2ff_container = Components.classes["@mozilla.org/rdf/container;1"].createInstance(Components.interfaces.nsIRDFContainer);

var cascadeStore = "cascades.rdf";
var cascadeBackupStore = "cascadesBackup.rdf";


// getExtension directory
function getDataBaseDir(){
    try{
       
       const id = "{B9CD5377-4946-4628-9B58-4C58CB8E0E7B}";
       var ext = Components.classes["@mozilla.org/extensions/manager;1"]
                    .getService(Components.interfaces.nsIExtensionManager)
                    .getInstallLocation(id)
                    .getItemLocation(id); 
       
	   var extPath='';
	   try{
	       //for win
	       extPath = ext.target+'';
           extPath = extPath.replace(/\\/g,"//");
	   }catch(e){
	       //for linux ..
		   extPath = ext.path+'';
	   }
	   //_trace('extPath: '+extPath); 
       var ret = 'file:///'+extPath+"//chrome//jap2ff//content//database//"; 
       //_trace('ret: '+ret);
	   return ret;
           
    }catch(e){
        _trace(e)
        return null
    }
}


// load dataSource


function jap2ff_loadDB() {
   try{       
           var observer = {
               onBeginLoad : function(sink){},
               onInterrupt : function(sink){},
               onResume : function(sink){},
               onError : function(sink,status,msg){},
               onEndLoad : function(sink){
                   try{
                       sink.removeXMLSinkObserver(this);
                       sink.QueryInterface(Components.interfaces.nsIRDFDataSource);
                       try{
                          jap2ff_rdfService.RegisterDataSource(jap2ff_datasource, false);
                       }catch(e){
                          _trace('jap2ff_loadDB replace')
                          jap2ff_rdfService.RegisterDataSource(jap2ff_datasource, true);
                       }
                       var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
                       observerService.notifyObservers(null,"jap2ff_db_init",null);   
                       _trace('jap2ff_loadDB Done!');
                       
                   }catch(e){
                       _trace(e);
                   }    
               }
           };
           
           var path = getDataBaseDir()+cascadeStore+'';
           //i
           jap2ff_datasource = jap2ff_rdfService.GetDataSource(path);
           jap2ff_datasource.QueryInterface(Components.interfaces.nsIRDFXMLSink);
           jap2ff_datasource.addXMLSinkObserver(observer);
           
        
   }catch(e){
       jap2ff_blockLoad = false;
       _trace(e);
   }
}

function jap2ff_loadDB2(inp) {
   try{       
           var observer = {
               onBeginLoad : function(sink){},
               onInterrupt : function(sink){},
               onResume : function(sink){},
               onError : function(sink,status,msg){},
               onEndLoad : function(sink){
                   try{
                       sink.removeXMLSinkObserver(this);
                       sink.QueryInterface(Components.interfaces.nsIRDFDataSource);
                       try{
                          jap2ff_rdfService.RegisterDataSource(datasource, false);
                       }catch(e){
                          _trace('jap2ff_loadDB2 replace')
                          jap2ff_rdfService.RegisterDataSource(datasource, true);
                       }
                       _trace('jap2ff_loadDB2 Done!');
                       
                   }catch(e){
                       _trace(e);
                   }    
               }
           };
           
           var path = getDataBaseDir()+inp+'';
           var datasource = jap2ff_rdfService.GetDataSource(path);
           datasource.QueryInterface(Components.interfaces.nsIRDFXMLSink);
           datasource.addXMLSinkObserver(observer);
           
           return datasource; 
        
   }catch(e){
       jap2ff_blockLoad = false;
       _trace(e);
       return null;
   }
}






/**
 *  leeren der gespeicherten Infoserviceeintraege, damit die alten rausfliegen! 
 */
function jap2ff_clearInfoServices(){
    try{
        _trace('clearInfoServices...');
        var infoServices = jap2ff_rdfService.GetResource(baseInfoService);
         
        var datasource = jap2ff_rdfService.GetDataSourceBlocking(getDataBaseDir()+infoserviceDatabase);   
        
        if (jap2ff_contUtil.IsContainer(datasource, infoServices) && !jap2ff_contUtil.IsEmpty(datasource, infoServices) ){
            jap2ff_container.Init(datasource, infoServices);    
            
            if (!jap2ff_contUtil.IsEmpty(datasource, infoServices)) {
                var el = jap2ff_container.GetElements();
                while(el.hasMoreElements()){
        
                    var tmpElement = el.getNext()
                    if (tmpElement instanceof Components.interfaces.nsIRDFResource)
                    {
                        //_trace('tmpElement '+tmpElement.Value);
                        var enumr1 = datasource.ArcLabelsOut(tmpElement);
                        var counter2=0;
                        while (enumr1.hasMoreElements()&&counter2<200){
                            counter2++;
                            var tmpRes = enumr1.getNext();
                            if (tmpRes instanceof Components.interfaces.nsIRDFResource)
                            {
                                //_trace('tmpRes '+tmpRes.Value);
                                var enumr2 = datasource.GetTargets(tmpElement ,tmpRes, true);
                                var counter=0;
                                while (enumr2.hasMoreElements()&&counter<200){
                                    counter++;
                                    var tmpRes2 = enumr2.getNext();
                                    if(tmpRes2 instanceof Components.interfaces.nsIRDFNode)
                                    { 
                                        if(tmpRes2 instanceof Components.interfaces.nsIRDFLiteral){
                                            //_trace('loeschen: '+tmpRes2.Value);
                                        }else{
                                            //_trace('loeschen: '+tmpRes2);
                                        }    
                                    
                                        datasource.Unassert(tmpElement, tmpRes, tmpRes2);
                                    }   
                                }
                            }    
                        }
                    }
                    jap2ff_container.RemoveElement(tmpElement,false);
                }
            }
        }
        // clear rest ...
        var allRes = datasource.GetAllResources();    
        
        if (allRes){
            while(allRes.hasMoreElements()){
                var tmp1 = allRes.getNext();
                if (tmp1 instanceof Components.interfaces.nsIRDFResource){
                    //_trace('tmp1: '+tmp1.Value);
                    var tmp2 = datasource.ArcLabelsOut(tmp1);
                    while (tmp2.hasMoreElements()){
                        var tmp3 = tmp2.getNext();
                        if (tmp3 instanceof Components.interfaces.nsIRDFResource){
                            //_trace('tmp3: '+tmp3.Value);
                            var tmp4 = datasource.GetTargets(tmp1 ,tmp3, true);
                            while (tmp4.hasMoreElements()){
                                var tmp5 = tmp4.getNext();
                                if(tmp5 instanceof Components.interfaces.nsIRDFLiteral){
                                    //_trace('loeschen: '+tmp5.Value);
                                    datasource.Unassert(tmp1, tmp3, tmp5);
                                }else{
                                    //_trace('typeof tmp5: '+typeof tmp5);
                                    if(tmp5 instanceof Components.interfaces.nsIRDFNode){
                                        //_trace('loeschen: tmp5: '+tmp5);
                                        datasource.Unassert(tmp1, tmp3, tmp5);
                                    }
                                }
                            }
                        }else{
                            //_trace('typeof tmp3: '+typeof tmp3);
                        }
                    }
                }else{
                    //_trace('typeof tmp1: '+typeof tmp1);
                }
            }
        }
                
        _trace('clearInfoServices done');
        return true;
        
    }catch(e){
        _trace(e);
        return false;
    }
}
/**
 *  fuegt einen InfoService zur DB hinzu
 */
function jap2ff_addInfoService(id, name, host, ports){
    try{
        var infoServices = jap2ff_rdfService.GetResource(baseInfoService);
        var relName;  
        var relName2;
        var litValue;
        
        var datasource = jap2ff_rdfService.GetDataSourceBlocking(getDataBaseDir()+infoserviceDatabase);
        
        if (jap2ff_contUtil.IsContainer(datasource, infoServices) && !jap2ff_contUtil.IsEmpty(datasource, infoServices)){
            jap2ff_container.Init(datasource, infoServices);    
        }else{
            jap2ff_container = jap2ff_contUtil.MakeSeq(datasource, infoServices);
        }
        
        if (datasource==null || jap2ff_container == null){
             return false;
        }
        
        //insert into container
        relName   = jap2ff_rdfService.GetResource(infoService+id)
        //_trace('relName: '+relName.Value);
        jap2ff_container.AppendElement(relName);
        
        //insert Details
        
        relName2  = jap2ff_rdfService.GetResource(infoService+'id');        
        litValue  = jap2ff_rdfService.GetLiteral(id)
        datasource.Assert(relName,relName2,litValue,true);
        
        relName2  = jap2ff_rdfService.GetResource(infoService+'name');        
        litValue  = jap2ff_rdfService.GetLiteral(name)
        datasource.Assert(relName,relName2,litValue,true);
        
        relName2  = jap2ff_rdfService.GetResource(infoService+'host');        
        litValue  = jap2ff_rdfService.GetLiteral(host)
        datasource.Assert(relName,relName2,litValue,true);
 
        relName2  = jap2ff_rdfService.GetResource(infoService+'ports');        
        litValue  = jap2ff_rdfService.GetLiteral(ports)
        datasource.Assert(relName,relName2,litValue,true);
        
        //flush to disk
        if (datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource))
            datasource.Flush();
        
        return true;
            
    }catch(e){
        _trace(e);
        return false;
    }
}

/*funct111ion test(){
  try{
     
     
  
  //jap2ff_datasource.
      var proxy = jap2ff_rdfService.GetResource(base_1);
      var name1 =  jap2ff_rdfService.GetResource(base_2+name_1);
      var name2 =  jap2ff_rdfService.GetLiteral(inpName);
      //jap2ff_datasource.Assert(proxy, name1, name2, true);
      alert('test');
      
      var mcs = jap2ffGeneral._getJapC().getMixCascades();
      
      if (mcs!=null){
          
             for(i=0;i<mcs.size();i++){              
                alert( ((anon.infoservice.MixCascadeMixCascade)mcs.get(i)).getId());
                
              }
      }
  }catch(e){alert('test: '+e.message);}
  
}*/

function storeInfoService(id){
    try{
        _trace('try Store Info...');
        var iService  = jap2ff_rdfService.GetResource(baseInfoService);
        var relName;
        var inp;
        var relName2;
        
        

        
        
        jap2ff_datasource = jap2ff_rdfService.GetDataSource('file:///C:/data2.rdf');   
                
                
        if (!jap2ff_contUtil.IsEmpty(jap2ff_datasource, iService)) {
            _trace('isNotEmpty!');
            var el = jap2ff_container.GetElements();
            while(el.hasMoreElements()){
                jap2ff_container.RemoveElement(el.getNext(),false);
            }
        }else{
            _trace('isEmpty!');
            jap2ff_container = jap2ff_contUtil.MakeSeq ( jap2ff_datasource , iService );

        }
        
        
        relName   = jap2ff_rdfService.GetResource(infoService+'123456')
        jap2ff_container.AppendElement(relName);

        relName2  = jap2ff_rdfService.GetResource(infoService+'id');        
        inp       = jap2ff_rdfService.GetLiteral('123456')
        jap2ff_datasource.Assert(relName,relName2,inp,true);
        relName2   = jap2ff_rdfService.GetResource(infoService+'name');
        inp       = jap2ff_rdfService.GetLiteral('Dresden');
        jap2ff_datasource.Assert(relName,relName2,inp,true);
        relName2   = jap2ff_rdfService.GetResource(infoService+'ip');
        inp       = jap2ff_rdfService.GetLiteral('141.168.0.1');
        jap2ff_datasource.Assert(relName,relName2,inp,true);
        
        relName   = jap2ff_rdfService.GetResource(infoService+'123455');
        jap2ff_container.AppendElement(relName);
        
        relName2  = jap2ff_rdfService.GetResource(infoService+'id');        
        inp       = jap2ff_rdfService.GetLiteral('123455')
        jap2ff_datasource.Assert(relName,relName2,inp,true);
        relName2   = jap2ff_rdfService.GetResource(infoService+'name');
        inp       = jap2ff_rdfService.GetLiteral('Regensburg');
        jap2ff_datasource.Assert(relName,relName2,inp,true);
        relName2   = jap2ff_rdfService.GetResource(infoService+'ip');
        inp       = jap2ff_rdfService.GetLiteral('192.168.0.1');
        jap2ff_datasource.Assert(relName,relName2,inp,true);
        
        /*iService  = jap2ff_rdfService.GetResource(infoService+'123456');
        relName   = jap2ff_rdfService.GetResource(infoService+'name');
        inp       = jap2ff_rdfService.GetLiteral('Dresden');
        jap2ff_datasource.Assert(iService,relName,inp,true);*/
        
        /*iService  = jap2ff_rdfService.GetResource(baseInfoService);
        relName   = jap2ff_rdfService.GetResource(infoService+'id');
        inp       = jap2ff_rdfService.GetLiteral('123455');
        jap2ff_datasource.Assert(iService,relName,inp,true);
        
        /*iService  = jap2ff_rdfService.GetResource(infoService+'123455');
        relName   = jap2ff_rdfService.GetResource(infoService+'name');
        inp       = jap2ff_rdfService.GetLiteral('Regensburg');
        jap2ff_datasource.Assert(iService,relName,inp,true);*/
        
        /*iService  = jap2ff_rdfService.GetResource(baseInfoService);
        relName   = jap2ff_rdfService.GetResource(infoService+'id');
        inp       = jap2ff_rdfService.GetLiteral('123454');
        jap2ff_datasource.Assert(iService,relName,inp,true);
        
        /*iService  = jap2ff_rdfService.GetResource(infoService+'123454');
        relName   = jap2ff_rdfService.GetResource(infoService+'name');
        inp       = jap2ff_rdfService.GetLiteral('Berlin');
        jap2ff_datasource.Assert(iService,relName,inp,true);*/
        
        jap2ff_datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        jap2ff_datasource.Flush();
        
        //loadInfoService(id);
    }catch(e){
        _trace(e);
    }   
}

function loadInfoService(id){
    try{
        _trace('try load Info...');
        var iService  = jap2ff_rdfService.GetResource(baseInfoService);
        var relName   = jap2ff_rdfService.GetResource(infoService+'id');       
        
        var enumr      = jap2ff_datasource.GetTargets(iService,relName,true);
        var target;
        var taget2;
        
        while (enumr.hasMoreElements()){
            target = enumr.getNext();
            if (target instanceof Components.interfaces.nsIRDFLiteral){
                _trace('ID: '+target.Value);
                iService = jap2ff_rdfService.GetResource(infoService+target.Value);
                relName  = jap2ff_rdfService.GetResource(infoService+'name');
                target2  = jap2ff_datasource.GetTarget(iService,relName,true);
                if (target2 instanceof Components.interfaces.nsIRDFLiteral){
                    _trace('Name: '+target2.Value);
                }
            }    
        }
            
    }catch(e){
        _trace(e);
    }
}

var hasTestLoad=false;
function loadTestDB(){
     try{
        var observer = {
               onBeginLoad : function(sink){},
               onInterrupt : function(sink){},
               onResume : function(sink){},
               onError : function(sink,status,msg){},
               onEndLoad : function(sink){
                   try{
                       sink.removeXMLSinkObserver(this);
                       sink.QueryInterface(Components.interfaces.nsIRDFDataSource);
                       try{
                          jap2ff_rdfService.RegisterDataSource(jap2ff_datasource, false);
                       }catch(e){
                          _trace('loadTestDB replace')
                          jap2ff_rdfService.RegisterDataSource(jap2ff_datasource, true);
                       }
                       _trace('loadTestDB Done!');
                       
                       var test = document.getElementById('testDatasource');
                       hasTestLoad=true;
                       
                       test.database.AddDataSource(jap2ff_datasource);
                       test.setAttribute('ref', 'chrome://jap2ff/content/scrips/database/cascades');
                       _trace("tryLoad_SINK: "+test.datasource)
                       test.builder.rebuild();
                       test.builder.refresh();
                       
                   }catch(e){
                       _trace(e);
                   }    
               }
           };
           
           jap2ff_datasource = jap2ff_rdfService.GetDataSource('file:///c://data2.rdf');//file:///c://cascades.rdf
           jap2ff_datasource.QueryInterface(Components.interfaces.nsIRDFXMLSink);
           jap2ff_datasource.addXMLSinkObserver(observer);
       
        
   }catch(e){
       _trace(e);
   }

} 

function tryLoad(){
    try{
        
        if (false && !hasTestLoad)loadTestDB();
        else{
          //jap2ff_datasource = jap2ff_rdfService.GetDataSource('file:///C:/data1.rdf');  
        
          //test.database.AddDataSource(jap2ff_datasource);
          //test.setAttribute('ref', 'chrome://jap2ff/content/scripts/database/InfoService');
          var test = document.getElementById('testIS');
          var test2 = document.getElementById('test2');
          _trace("tryLoad: "+test+'  '+test2)
          test.builder.rebuild();
          test.builder.refresh();
          test2.builder.rebuild();
          test2.builder.refresh();
        }
    }catch(e){
        _trace(e);
    }
}


function jap2ff_processCascades(inp){
     try{
         testCount=0;
         //create Observer
         /*var watchDataBase = {
	         QueryInterface: function(aIID){
                 if (aIID.equals(Components.interfaces.nsIRDFObserver) ||
                     aIID.equals(Components.interfaces.nsISupports))
                     return this;
                     throw Components.results.NS_NOINTERFACE;
             },
            
             onAssert: function( dataSource, source , property , target){
                 
             },
             
             onBeginUpdateBatch: function(dataSource){
                 _trace('begin update');
             },
             
             onChange: function(dataSource, source, property, oldTarget, newTarget){
             },
             
             onEndUpdateBatch: function(dataSource){
                 _trace('end update');
             },
             
             onMove: function(dataSource, oldSource, newSource, property, target){
             },
             
             onUnassert: function( dataSource, source, property, target){
             }      

                  
         }*/
         
         // no doubles
         jap2ff_clearCascades();
         
         var listCascades = inp.getElementsByTagName('MixCascade');
                                    
         var local_datasource = jap2ff_rdfService.GetDataSource(getDataBaseDir()+cascadeStore+''); 
         //local_datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
         //local_datasource.Refresh(true);
         
         
         // init resources
                
         var urlResource = jap2ff_rdfService.GetResource(cascades);
                
         var local_container  = Components.classes["@mozilla.org/rdf/container;1"].createInstance(Components.interfaces.nsIRDFContainer);
                
         // container check
         if (jap2ff_contUtil.IsContainer(local_datasource, urlResource)){
             local_container.Init(local_datasource, urlResource);    
         }else{
             local_container = jap2ff_contUtil.MakeSeq(local_datasource, urlResource);
         }
                
         // things all right?
         if (local_datasource==null || local_container == null){
             _trace('local_datasource: '+local_datasource+' local_container: '+local_container);
             return false;
         }    
        
                 
         
         
         
         //local_datasource.AddObserver(watchDataBase);   
         local_datasource.beginUpdateBatch();
         for(var i=0;i<listCascades.length;i++){
             var node = listCascades.item(i);
             var id = '-1';
             if (node.hasAttributes()) id = node.getAttribute('id');
             if (id!='-1'){
                  _trace('CascadeID: '+id);
                  //insert into container
                  var arcResource = jap2ff_rdfService.GetResource(cascade+''+id);
                  local_container.AppendElement(arcResource);
                  //process childNodes
                  jap2ff_processNode(node,(cascade+'/'+id+'#'), local_datasource);
                  break;
             }     
         }
         local_datasource.endUpdateBatch();
         local_datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
         local_datasource.Flush();
         jap2ff_testdb();
         return true;
     }catch(e){
         _trace(e);
         return false
     }             

}

       
function jap2ff_processNode(node, url, local_datasource){
    try{
        _trace('processNode Start: '+node.nodeName+' '+url);
        // #text leaf? 
        if (!(node.hasChildNodes() && node.firstChild.nodeType != 3)){
            _trace('leaf: '+node.nodeName+' '+node.firstChild.nodeValue);
            if (false && node.firstChild){
                var urlResource = jap2ff_rdfService.GetResource(url);
                var targetURL = url+'/'+node.firstChild.nodeName;
                var targetURLResource = jap2ff_rdfService.GetResource(targetURL);
                var targetValue = node.firstChild.nodeValue;
                var targetValueLiteral = jap2ff_rdfService.GetLiteral(targetValue);
                
                //assert to db
                local_datasource.Assert(urlResource, targetURLResource, targetValueLiteral, true);                 
                //local_datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
                //local_datasource.Flush();
                
            }else{
               _trace('no First: '+node.nodeName);
               if (false && node.nodeName == 'Mix'){
                   var urlResource = jap2ff_rdfService.GetResource(url);
                   var targetURL = url+'/'+'#text';
                   var targetURLResource = jap2ff_rdfService.GetResource(targetURL);
                   var targetValue = node.getAttribute('id');
                   var targetValueLiteral = jap2ff_rdfService.GetLiteral(targetValue);
               
                   local_datasource.Assert(urlResource, targetURLResource, targetValueLiteral, true);      
               
               }
               if (false && node.nodeName == 'Payment'){
                   _trace(url);
                   var urlResource = jap2ff_rdfService.GetResource(url);
                   var targetURL = url+'/'+'#text';
                   var targetURLResource = jap2ff_rdfService.GetResource(targetURL);
                   var targetValue = node.getAttribute('required');
                   var targetValueLiteral = jap2ff_rdfService.GetLiteral(targetValue);
               
                   local_datasource.Assert(urlResource, targetURLResource, targetValueLiteral, true);      
                   
               }
            }   
            
            
        }else{
            
            //if (testCount>4) return false;
            //_trace('processNode URL: '+url);
            _trace('nodes -> :');
            if(node.hasChildNodes()){
                var nodeList = node.childNodes;
                var helpCounter = 0;
                for (var i = 0;i<nodeList.length;i++){
                    var child = nodeList.item(i);
                    //has child childs?
                    if (child.hasChildNodes()){      
                       _trace('child:test '+child.nodeName+' '+child.firstChild.nodeName+' '+child.firstChild.nodeType+' '+child.firstChild.hasChildNodes());                    
                    }else{
                        _trace('child:test '+child.nodeName);
                    }
                    
                    if (child.hasChildNodes() && !child.firstChild.hasChildNodes() && child.firstChild.nodeType == '3'){
                        
                        
                        
                        var urlResource = jap2ff_rdfService.GetResource(url);
                        var targetURL='';
                        if (url.length > (url.lastIndexOf('#'))+1 ){
                               targetURL = url+'/'+child.nodeName;
                            }else{
                               targetURL = url+''+child.nodeName;
                            }  
                        
                        var targetURLResource = jap2ff_rdfService.GetResource(targetURL);
                        var targetValue = child.firstChild.nodeValue;
                        var targetValueLiteral = jap2ff_rdfService.GetLiteral(targetValue);
                        _trace('nodes -> leaf: '+url+' '+targetURL+' '+targetValue);
                        //assert to db
                        local_datasource.Assert(urlResource, targetURLResource, targetValueLiteral, true);  
                        
                    
                    }else{
                        
                        var targetURL=null;
                        
                        if ((child.nextSibling && child.nodeName == child.nextSibling.nodeName)
                            || (child.previousSibling && child.nodeName == child.previousSibling.nodeName) ){
                            targetURL = url+'/'+child.nodeName+'/'+helpCounter;                
                            helpCounter++;
                        }else{
                            if (url.length > (url.lastIndexOf('#'))+1 ){
                               targetURL = url+'/'+child.nodeName;
                            }else{
                               targetURL = url+''+child.nodeName;
                            }                                             
                        }    
                        // init resources
                
                        var urlResource = jap2ff_rdfService.GetResource(url);
                
                        var local_container  = Components.classes["@mozilla.org/rdf/container;1"].createInstance(Components.interfaces.nsIRDFContainer);
                
                        // container check
                        if (jap2ff_contUtil.IsContainer(local_datasource, urlResource)){
                            local_container.Init(local_datasource, urlResource);    
                        }else{
                            local_container = jap2ff_contUtil.MakeSeq(local_datasource, urlResource);
                        }
                
                        // things all right?
                        if (local_datasource==null || local_container == null){
                            _trace('local_datasource: '+local_datasource+' local_container: '+local_container);
                            return false;
                        }    
        
                        //insert into container
                        var arcResource = jap2ff_rdfService.GetResource(targetURL)
                        local_container.AppendElement(arcResource);
                        //local_datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
                        //local_datasource.Flush();
                
                
                        jap2ff_processNode(nodeList.item(i),targetURL, local_datasource);
                    }
                }
            }
        }
        return true;
    }catch(e){
        _trace(e);
        return true;
    }
}

function jap2ff_testdb(){
   try{
       _trace('testDb: ');
       var local_datasource = jap2ff_rdfService.GetDataSource(getDataBaseDir()+cascadeStore+'');   
       //_trace(local_datasource);
       //var urlResource = jap2ff_rdfService.GetResource(cascades);
       var b = local_datasource.GetAllResources();
       _trace('db length: '+b.hasMoreElements());
       while(b.hasMoreElements())
       {
           _trace('Node: '+b.getNext().Value);
       }
       
       
   }catch(e){
       _trace(e);
   }
}          

function jap2ff_clearCascades(inp){
    try{
        _trace('ClearCascades: Start');
                       
        var local_datasource = jap2ff_rdfService.GetDataSource(getDataBaseDir()+cascadeStore+''); 
        local_datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        local_datasource.Refresh(true);
          
        var cascadesResource = jap2ff_rdfService.GetResource(cascades);
        jap2ff_delRDFNode(cascadesResource, null, local_datasource);
        
        local_datasource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
        local_datasource.Flush();
        _trace('ClearCascades: Done.');
        if(inp) jap2ff_testdb();
        
    }catch(e){
        _trace(e);
    }
}   

function jap2ff_delRDFNode(rdfObject, rdfPredicate, local_datasource){
    try{
        _trace('delRDFNode: Start '+rdfObject.Value+' '+(rdfPredicate?rdfPredicate.Value:"NULL"));               
        //container ??
        if (jap2ff_contUtil.IsContainer(local_datasource, rdfObject) && rdfPredicate == null){
            _trace('delRDFNode: Container '+rdfObject.Value);
            var enumr = local_datasource.ArcLabelsOut(rdfObject);
            _trace('delRDFNode: Container more Arcs ? '+enumr.hasMoreElements());
            while(enumr.hasMoreElements()){
                var res = enumr.getNext();
                if (res instanceof Components.interfaces.nsIRDFResource) 
                
                if (res.Value != 'http://www.w3.org/1999/02/22-rdf-syntax-ns#instanceOf' 
                              && res.Value != 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nextVal'){ 
                    
                    _trace('delRDFNode: Container arcValue '+res.Value );
                    var localTarget = local_datasource.GetTarget(rdfObject,res, true); 
                    if (localTarget instanceof Components.interfaces.nsIRDFResource){
                        _trace('delRDFNode: Container: localTarget '+localTarget.Value);
                    }
                     
                    if (jap2ff_contUtil.IsContainer(local_datasource, localTarget)){
                        jap2ff_delRDFNode(local_datasource.GetTarget(rdfObject,res, true), null, local_datasource); 
                    }else{
                        jap2ff_delRDFNode(rdfObject, res, local_datasource); 
                    }    
                
                }    
                
                var rdfTargets = local_datasource.GetTargets(rdfObject, res, true); 
                while (rdfTargets.hasMoreElements()) {
                    var rdfTarget = rdfTargets.getNext();
                    local_datasource.Unassert(rdfObject, res, rdfTarget);
                }
                       
            }
        
        }else if(rdfPredicate!=null) 
        {   
             
            var rdfTargets = local_datasource.GetTargets(rdfObject ,rdfPredicate ,true);
            while(rdfTargets.hasMoreElements()){
                var rdfTarget = rdfTargets.getNext(); 
                if ((rdfTarget instanceof Components.interfaces.nsIRDFResource)){
                    _trace('delRDFNode: rdfTarget '+rdfTarget.Value); 
                }
                if (!(rdfTarget instanceof Components.interfaces.nsIRDFResource)){
                    if (rdfTarget instanceof Components.interfaces.nsIRDFLiteral){
                        _trace('delRDFNode: rdfLeaf '+ rdfTarget.Value);
                        local_datasource.Unassert(rdfObject, rdfPredicate, rdfTarget);
                    }else
                        _trace('delRDFNode: rdfLeaf kein LIT'); 
                }else{
                
                    var enumr = local_datasource.ArcLabelsOut(rdfTarget);
                    _trace('delRDFNode: rdfNode moreElements ? '+enumr.hasMoreElements());
                    while(enumr.hasMoreElements()){
                        var res = enumr.getNext();
                        if (res instanceof Components.interfaces.nsIRDFResource){
                           _trace('delRDFNode: resValue '+res.Value);
                           if (res.Value != 'http://www.w3.org/1999/02/22-rdf-syntax-ns#instanceOf' 
                              && res.Value != 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nextVal') 
                    
                           jap2ff_delRDFNode(rdfTarget, res, local_datasource);
                        }else{
                            _trace('delRDFNode: no Resource');
                        }
                    }
                }
            }    
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