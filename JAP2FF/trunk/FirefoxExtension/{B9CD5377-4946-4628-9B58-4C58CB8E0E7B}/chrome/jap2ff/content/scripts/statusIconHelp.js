
function initHelp(){
   try{
       var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
               
       var winEnum = wm.getEnumerator('navigator:browser');
       if (winEnum.hasMoreElements()){      
           var win = winEnum.getNext();
           if((win instanceof Components.interfaces.nsIDOMWindow)) {
               var domDoc = win.document;
               var icon = domDoc.getElementById('jap2ff-panel-icon') 
               if (icon.src == 'chrome://jap2ff/content/icons/jap/icon16_off.gif'){
                   document.getElementById('noAnon').setAttribute('style','border:3px solid black;');                       
               }else if (icon.src == 'chrome://jap2ff/content/icons/jap/icon16_anonLevel_uk.gif'){
                   document.getElementById('anonUk').setAttribute('style','border:3px solid black;');                       
               }else if (icon.src == 'chrome://jap2ff/content/icons/jap/icon16_anonLevel_red.gif'){
                   document.getElementById('anonLow').setAttribute('style','border:3px solid black;');                       
               }else if (icon.src == 'chrome://jap2ff/content/icons/jap/icon16_anonLevel_blue.gif'){
                   document.getElementById('anonMiddle').setAttribute('style','border:3px solid black;');                       
               }else if (icon.src == 'chrome://jap2ff/content/icons/jap/icon16_anonLevel_green.gif'){
                   document.getElementById('anonHigh').setAttribute('style','border:3px solid black;');                       
               }                 
           }
       }else{
          _trace('no AnonLevel Status!');
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