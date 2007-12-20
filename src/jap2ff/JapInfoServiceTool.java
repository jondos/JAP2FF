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

import anon.infoservice.InfoServiceHolder;
import java.util.Hashtable;
import logging.*;


public class JapInfoServiceTool extends Thread {
	
	private static Hashtable mixCascades=null;
	private InfoServiceHolder ifh;
	private static Hashtable infoservices=null;
	
	public JapInfoServiceTool(){
	    ifh = InfoServiceHolder.getInstance();
	    this.start();
	}
	
	
	final public void run(){
	    try{
	    	LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Start thread load mixCascades");
		    byte lockCounter = 0;
	    	while(true){
		    	
		    	mixCascades = ifh.getMixCascades();
		    	infoservices = ifh.getInfoServices();
		 	
		    	if (mixCascades!=null && !mixCascades.isEmpty() || lockCounter > 10 ){
		    		LogHolder.log(LogLevel.DEBUG, LogType.GUI, ""+mixCascades);
		    		lockCounter = 0;
		    		JapInfoServiceTool.sleep(60000);
		    	}else{
		    		JapInfoServiceTool.sleep(500);
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
	
	final public Hashtable getMixCascades(){
		if (mixCascades!=null){
			return JapInfoServiceTool.mixCascades;
		}else{
			return new Hashtable();			
		}
	}
	
	final public boolean isMixCascadesNULL(){
		if (mixCascades == null){
			return true;
		}else{
			return false;
		}
	} 
	

	

}
