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

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;

import logging.LogHolder;
import logging.LogLevel;
import logging.LogType;

import anon.infoservice.Database;
import anon.infoservice.InfoServiceDBEntry;
import anon.infoservice.InfoServiceHolder;
import anon.infoservice.MixCascade;
import anon.infoservice.StatusInfo;



/**
 * @author 
 *
 */
public class JapInfoServiceTool3 extends Thread {
	
	
	private InfoServiceHolder ifh;
	private static Hashtable downloadedInfoServices = null;
	
	
	public JapInfoServiceTool3(){
	    
	    ifh = InfoServiceHolder.getInstance();
	    this.start();
	}
	
	final public void run(){
	    try{
	    	LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Start thread fetch Infoservices");
		    byte lockCounter = 0;
	    	while(true){
		    	
	    		downloadedInfoServices = ifh.getInfoServices();
		    	if (downloadedInfoServices!=null){
		    		LogHolder.log(LogLevel.DEBUG, LogType.GUI, downloadedInfoServices.toString());
		    		/* we have successfully downloaded the list of running infoservices -> update the
					 * internal database of known infoservices
					 */
					Enumeration infoservices = downloadedInfoServices.elements();
					while (infoservices.hasMoreElements())
					{
						InfoServiceDBEntry currentInfoService = (InfoServiceDBEntry) (
							infoservices.
							nextElement());
						Database.getInstance(InfoServiceDBEntry.class).update(currentInfoService);
						InfoServiceDBEntry preferredInfoService = InfoServiceHolder.getInstance().
							getPreferredInfoService();
						if (preferredInfoService != null)
						{
							/* if the current infoservice is equal to the preferred infoservice, update the
							 * preferred infoservice also
							 */
							if (preferredInfoService.equals(currentInfoService))
							{
								InfoServiceHolder.getInstance().setPreferredInfoService(
									currentInfoService);
							}
						}
					}
					
					// at this time no infoservice will be deleted
					
					/* now remove all non user-defined infoservices, which were not updated, from the
					 * database of known infoservices
					 */
				/*	Enumeration knownInfoServices = Database.getInstance(InfoServiceDBEntry.class).
						getEntryList().elements();
					while (knownInfoServices.hasMoreElements())
					{
						InfoServiceDBEntry currentInfoService = (InfoServiceDBEntry) (
							knownInfoServices.nextElement());
						if (!currentInfoService.isUserDefined() &&
							!downloadedInfoServices.contains(currentInfoService))
						{
							/* the InfoService was fetched from the Internet earlier, but it is not in the list
							 * fetched from the Internet this time -> remove that InfoService from the database
							 * of known InfoServices
							 */
					/*		Database.getInstance(InfoServiceDBEntry.class).remove(
								currentInfoService);
						}
					}*/
		    		
		    	}
		    	
		    	
		    	lockCounter++;
		    	
		    	if ((downloadedInfoServices==null && lockCounter < 10) || lockCounter < 2 ){
		    		JapInfoServiceTool3.sleep(500);
		    	}else{
		    		JapInfoServiceTool3.sleep(600000);		    		
		    	}    
	  	    }
	    }
	    catch(InterruptedException e){
	    	LogHolder.log(LogLevel.ERR, LogType.GUI, e);
	    }
	    catch(Exception e){
	    	LogHolder.log(LogLevel.ERR, LogType.GUI, e);
	    	
	    }    
		
	}
			
	
}
