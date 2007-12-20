/*
 Copyright (c) 2006, The JAP2FF-Team
 All rights reserved.
 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 - Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

 - Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

 - Neither the name of the University of Technology Dresden, Germany nor the names of its contributors
  may be used to endorse or promote products derived from this software without specific
  prior written permission.


 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS ``AS IS'' AND ANY EXPRESS
 OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
 AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS
 BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE
 */
package jap2ff;

import java.util.Hashtable;
import java.util.Vector;

import logging.LogHolder;
import logging.LogLevel;
import logging.LogType;

import anon.infoservice.InfoServiceHolder;
import anon.infoservice.MixCascade;
import anon.infoservice.StatusInfo;



/**
 * @author 
 *
 */
public class JapInfoServiceTool2 extends Thread {
	
	private static Hashtable mixCascades=null;
	private InfoServiceHolder ifh;
	private Vector allCascadesStatusInfo = new Vector();;
	private boolean noPay=true;
	
	public JapInfoServiceTool2(boolean noPay){
		this.noPay = noPay;
	    ifh = InfoServiceHolder.getInstance();
	    this.start();
	}
	
	final public void run(){
	    try{
	    	LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Start thread fetch States (noPay: "+noPay+")");
		    byte lockCounter = 0;
	    	while(true){
		    	
		    	mixCascades = ifh.getMixCascades();
		    	
		    	if (mixCascades!=null){
		    	
		    	    java.util.Enumeration tmpEnum = mixCascades.elements();
		    	    Vector tmpV = new Vector();
		    	    while (tmpEnum.hasMoreElements()){
		    		    MixCascade tmpM = (MixCascade) tmpEnum.nextElement();
		    		    if (!tmpM.isPayment()||!noPay){
		    		    	tmpV.add(tmpM.fetchCurrentStatus());
		    		    }
		    	    }
		    	    if (!tmpV.isEmpty())
		    	        allCascadesStatusInfo = tmpV;
		    	       
		    	}    
		    	
		 	
		    	if (mixCascades!=null && !mixCascades.isEmpty() || lockCounter > 25 ){
		    		LogHolder.log(LogLevel.DEBUG, LogType.GUI, ""+mixCascades);
		    		lockCounter = 0;
		    		JapInfoServiceTool2.sleep(60000);
		    	}else{
		    		JapInfoServiceTool2.sleep(500);
		    	}
		    	lockCounter++;
			
	  	    }
	    }
	    catch(InterruptedException e){
	    	LogHolder.log(LogLevel.ERR, LogType.GUI, e);
	    }
	    catch(Exception e){
	    	LogHolder.log(LogLevel.ERR, LogType.GUI, e);
	    	
	    }    
		
	}
			
	final public void wakeUp(){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "wakeup thread fetch States");
		try{
		    if (this.isAlive()) this.stop();
		    this.start();
		}catch(Exception e){
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);	
		}    
	}
	
	final public Vector getStatusVector(){
		if (allCascadesStatusInfo!=null)
		    return allCascadesStatusInfo;
		else
			return new Vector();
	}
	
	final public StatusInfo getStatusInfoForId(String id){
		StatusInfo tmpSI = StatusInfo.createDummyStatusInfo(id);
		try{
			Vector tmpV = allCascadesStatusInfo; 
		    if (tmpV==null || tmpV.isEmpty()) return tmpSI;		
		    for (int i=0;i<tmpV.size();i++){
			    StatusInfo tmp2SI = (StatusInfo) tmpV.get(i);
			    if (tmp2SI !=null && tmpSI.getId()!=null && (tmp2SI.getId()).equals(id) ) return tmp2SI;
		    }
		}catch(Exception e){
			LogHolder.log(LogLevel.ERR, LogType.GUI, "getStatusInfoForId with "+id);
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);	
		}    
		return tmpSI;
	}
	
	final public boolean isMixCascadesNULL(){
		if (mixCascades==null){
			return true;
		}else{
			return false;
		}
	}


}
