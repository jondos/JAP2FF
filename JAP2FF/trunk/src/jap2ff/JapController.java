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

/**
 * @author root
 *
 */

import jap2ff.JAPConstants;
import jap2ff.ProxyInterface;


import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.BindException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.util.Vector;

import logging.*;

import anon.crypto.SignatureVerifier;

import anon.infoservice.CascadeIDEntry;
import anon.infoservice.Database;
import anon.infoservice.InfoServiceDBEntry;
import anon.infoservice.InfoServiceHolder;
import anon.infoservice.ListenerInterface;
import anon.infoservice.MixCascade;
import anon.infoservice.MixInfo;

import anon.infoservice.StatusInfo;

import anon.pay.PayAccountsFile;
import anon.proxy.AnonProxy;
import anon.util.XMLUtil;
import anon.infoservice.SimpleMixCascadeContainer;

import java.util.Hashtable;
import java.util.Enumeration;


import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;




public class JapController extends Thread
{

	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////
	private static SystemErrLog log = new SystemErrLog();
	private static FileLog logF = null;
	private static ChainedLog logC = null;
	private static boolean fileLog = false;
	private AnonProxy theProxy = null;
	private ServerSocket serverSocket = null;
	private static int defPort = 4005;
	private int port = defPort;
	private int rPort = port - 1;
	private int maxPort = port + 20;
	private MixCascade prefMixCascade = null;
	private boolean autoReCon = true;
	//private boolean isDummy = false;
	private int dummyTraffic = -1;
	private int extLogLevel = -1; //LogLevel.DEBUG;
	private int extLogType = -1; //LogType.ALL;

	private long currentStatusTime = System.currentTimeMillis();
	private StatusInfo m_statusinfoCurrentMixCascade = null;
	private long currentMcTime = System.currentTimeMillis();
	private final static long LOCK_TIME = 60 * 1000; //fetch status every minute at most
	private boolean firstStatus = true;

	private InfoServiceHolder ifh;
	private InfoServiceDBEntry defaultInfoService;
	private InfoServiceDBEntry userSetInfoService;
	private boolean noPay = true;
	private boolean clearMixCascades = false;

	private boolean first = true;
	//private boolean isStart = false;
	private String cascadeId;
	private PayAccountsFile payFile;
	//get mixCascades
	private JapInfoServiceTool infoServiceTool;
	//get Statusinfos
	private JapInfoServiceTool2 infoServiceTool2;
	//get InfoServices
	private JapInfoServiceTool3 infoServiceTool3;

	private boolean isUseProxy = false;
	private jap2ff.ProxyInterface proxyIf = null;
	private boolean onlyLocalAdress = true;
	private boolean isConnect2MixCascade = false;
	private JapProxyEventListener japProxyEvListener = null;
	private String databaseDir = null;
	private final String confFile = "anonlib.conf";
	private String osName = null;

	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////

	private static JapController theInstance = null;

	public static JapController getInstance(){
		if (JapController.theInstance!=null){
			return JapController.theInstance;
		}else{
			return (JapController.theInstance = new JapController());
			}
		}

	private JapController()
		{
		osName = System.getProperty("os.name");

		//default setLogType
			log.setLogType(LogType.ALL);
			if (fileLog && logF != null)
			{
				logF.setLogLevel(LogType.NUL);
			}

		//default setLogLevel
			log.setLogLevel(LogLevel.DEBUG);
			if (fileLog && logF != null)
			{
			logF.setLogLevel(LogLevel.DEBUG);
			}

		LogHolder.setLogInstance(log);
		japProxyEvListener = new JapProxyEventListener(this);

	}

	public void run()
	{
		initOnceJAP();
	}

    ///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////

	final private boolean initOnceJAP()
	{
		if (first)
		{
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "OS: "+osName);

			//try to get a server socket ...
			while (port > (rPort) && port < maxPort)
			{
				LogHolder.log(LogLevel.DEBUG, LogType.NET, "try Port " + port);
				try
				{
					if (onlyLocalAdress){
						serverSocket = new ServerSocket(port, 50, InetAddress.getByName("127.0.0.1"));
					}else{
						serverSocket = new ServerSocket(port);
					}
					break;

				}
				catch (BindException e1)
				{
					LogHolder.log(LogLevel.DEBUG, LogType.NET, "Port " + port + " already in use!");
					port++;
				}
				catch (Exception e)
				{
					LogHolder.log(LogLevel.EXCEPTION, LogType.NET, e.toString());
					return false;
				}
			}


			try
								{
				//try load config file
			try
			{
				FileInputStream f = new FileInputStream(new File(this.databaseDir+this.confFile));
				Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(f);
				try
				{
					f.close();
				}
				catch (Exception ex2)
				{}

				Element root = doc.getDocumentElement();
				XMLUtil.removeComments(root);

				/* load the signature verification settings */
				try
				{
					Element signatureVerificationNode = (Element) (XMLUtil.getFirstChildByName(root,
						SignatureVerifier.getXmlSettingsRootNodeName()));
					if (signatureVerificationNode != null)
					{
						SignatureVerifier.getInstance().loadSettingsFromXml(signatureVerificationNode);
					}
					else
					{
						throw (new Exception("JAPController: loadConfigFile: No SignatureVerification node found. Using default settings for signature verification."));
					}
				}
				catch (Exception e)
				{
					LogHolder.log(LogLevel.ERR, LogType.GUI, e);
				}


			    // load the infoservice management settings
				try
				{
					Element infoserviceManagementNode = (Element) (XMLUtil.getFirstChildByName(root,
						InfoServiceHolder.getXmlSettingsRootNodeName()));
					if (infoserviceManagementNode != null)
					{
						ifh = InfoServiceHolder.getInstance();
						ifh.loadSettingsFromXml(infoserviceManagementNode, true);
						LogHolder.log(LogLevel.INFO, LogType.GUI, "InfoServiceManagement node found.");

						// check default infoservice
						if (userSetInfoService!=null){
						    InfoServiceDBEntry dbe = ifh.getPreferredInfoService();
						    String currentID = null;
						    if (dbe!=null) currentID = dbe.getId();
						    if (currentID!=null && !currentID.equals(userSetInfoService.getId())){
						    	ifh.setPreferredInfoService(userSetInfoService);
						    }
						}

					}
					else
					{

					        throw (new Exception("loadConfigFile: No InfoServiceManagement node found. Using default settings for infoservice management in InfoServiceHolder."));
						}
						}
				    catch (Exception e)
				    {
					    LogHolder.log(LogLevel.ERR, LogType.GUI, e);
					}

				    /* try to load information about cascades */
					Node nodeCascades = XMLUtil.getFirstChildByName(root, MixCascade.XML_ELEMENT_CONTAINER_NAME);
					MixCascade currentCascade;
					if (nodeCascades != null)
					{
						Node nodeCascade = nodeCascades.getFirstChild();
						while (nodeCascade != null)
						{
							if (nodeCascade.getNodeName().equals(MixCascade.XML_ELEMENT_NAME))
							{
								try
								{
									currentCascade = new MixCascade( (Element) nodeCascade, Long.MAX_VALUE);
									try
									{
										Database.getInstance(MixCascade.class).update(currentCascade);
				}
				catch (Exception e)
									{}
									/* register loaded cascades as known cascades */
									Database.getInstance(CascadeIDEntry.class).update(
										new CascadeIDEntry(currentCascade));
								}
								catch (Exception a_e)
				{
								}
							}
							nodeCascade = nodeCascade.getNextSibling();
						}
						LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Cascade Info from configFile loaded!");
					}else{
						LogHolder.log(LogLevel.DEBUG, LogType.GUI, "no Cascade Info from configFile!");
					}

					/* load the list of known cascades */
					Database.getInstance(CascadeIDEntry.class).loadFromXml(
									(Element) XMLUtil.getFirstChildByName(root,
						CascadeIDEntry.XML_ELEMENT_CONTAINER_NAME));

				}catch(Exception e){
					LogHolder.log(LogLevel.ERR, LogType.GUI, e);
				}
                // setup the default InfoService
		        if (ifh==null || ifh.getPreferredInfoService() == null){
		            if (ifh==null) ifh = InfoServiceHolder.getInstance();
		            defaultInfoService = createDefaultInfoService();
			        ifh.setPreferredInfoService(defaultInfoService);
			        LogHolder.log(LogLevel.INFO, LogType.GUI, "Use default InfoService!");
		        }

                //set autochange after failure
				if (!ifh.isChangeInfoServices()) ifh.setChangeInfoServices(true);

				//we need to disbale certificate checks (better: set valid root certifcates for productive environments!)
				SignatureVerifier.getInstance().setCheckSignatures(false);

				if(infoServiceTool3 == null){
					infoServiceTool3 = new JapInfoServiceTool3();
				}
				if (infoServiceTool == null){
				    infoServiceTool = new JapInfoServiceTool();
				}
				if(infoServiceTool2 == null){
					infoServiceTool2 = new JapInfoServiceTool2(this.noPay);
				}

				if (isUseProxy && proxyIf!=null){
				    try{
					LogHolder.log(LogLevel.DEBUG, LogType.GUI, "use proxy: host:" + proxyIf.getHost() +" port: "+proxyIf.getPort()+" protocol: "+proxyIf.getProtocol());
					    theProxy = new AnonProxy(serverSocket, new JAPIMutableProxyInterface(proxyIf), null);
				    }catch(Exception e){
				    	LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, e);
				    	isUseProxy = false;
				    }

				}else{

					LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Use no proxy.");
					theProxy = new AnonProxy(serverSocket, null, null);

				}

			}
			catch (Exception e)
			{
				LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, e);
				return false;
			}
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "finish InitOnce");
			this.first = false;
		}
		//startProxy();
		return true;
	}

	final public boolean startProxy()
	{
		try
		{

			SimpleMixCascadeContainer theCascade =  new SimpleMixCascadeContainer(new MixCascade("Dresden-Dresden",
						                                 "141.76.1.120%3A6544",
						                                 "mix.inf.tu-dresden.de", 443)); //141.76.1.123;
			boolean useDefaultCascade = false;
			if (prefMixCascade != null)
			{

				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "setDefaultMixCascade: " + this.prefMixCascade);
				theCascade = new SimpleMixCascadeContainer(prefMixCascade);

			}
			else if (this.cascadeId !=null){

				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "setDefaultMixCascadeId: " + this.cascadeId);
				try{
				    MixCascade mc = ifh.getMixCascadeInfo(this.cascadeId);
				    theCascade = new SimpleMixCascadeContainer(mc);
				}catch(Exception e){
					useDefaultCascade = true;
					LogHolder.log(LogLevel.DEBUG, LogType.GUI, e);
				}

			}
			if (useDefaultCascade)
			{
				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "setDefaultMixCascade: ");
			}
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "setAutoReCon: " + autoReCon);
			theCascade.setAutoReConnect(autoReCon);

			//for testing
			if (theProxy==null){
				if (isUseProxy && proxyIf!=null){
				    try{
					    LogHolder.log(LogLevel.DEBUG, LogType.GUI, "use proxy: host:" + proxyIf.getHost() +" port: "+proxyIf.getPort()+" protocol: "+proxyIf.getProtocol());
					    theProxy = new AnonProxy(serverSocket, new JAPIMutableProxyInterface(proxyIf), null);
				    }catch(Exception e){
				    	LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, e);
				    	try{
				    		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Use no proxy.");
							theProxy = new AnonProxy(serverSocket, null, null);
				    	}catch(Exception es){
				    		LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, es);
				    	}
				    }

				}else{

					LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Use no proxy.");
					theProxy = new AnonProxy(serverSocket, null, null);

				}
			}

			//theProxy.setMixCascade(theCascade);
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "dummyTraffic: " + dummyTraffic);
			theProxy.setDummyTraffic(dummyTraffic);
			theProxy.addEventListener(japProxyEvListener);
			theProxy.start(theCascade);
		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, e);
		}

		return true;
	}

	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////




	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	//////////  pre JapController.init()  /////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	final public boolean setOnlyLocalAdress(boolean inp){
		if (!inp){
		    LogHolder.log(LogLevel.DEBUG, LogType.GUI, "setOnlyLocalAdress false");
		    this.onlyLocalAdress = inp;
		    return true;
		}
		return false;
	}

	final public boolean setPort(int inp)
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setPort: " + inp);
		if (inp > 1024)
		{
			port = inp;
			rPort = port - 1;
			maxPort = port + 20;
			return true;
		}
		else
		{
			return false;
		}
	}

	final public boolean setMaxPort(int inp)
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setMaxPort: " + inp);
		if (inp > 1024 && inp > port)
		{
			maxPort = inp;
			return true;
		}
		else
		{
			return false;
		}
	}

	final public void setInitProxy(String host, int port, int protocol){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to set proxy: host: " + host +" port: "+port+" protocol: "+protocol);
	    this.proxyIf = new ProxyInterface(host, port, protocol);
	    this.isUseProxy = true;
	}

	final public void setProxy(String host, int port, int protocol){
		if (!this.isUseProxy
				|| (this.proxyIf!=null
						&& (this.proxyIf.getPort() != port
							   || this.proxyIf.getProtocol() != protocol
							         || (host!=null
							        		 && !host.equals(this.proxyIf.getHost())
							        	 )
						   )
				   )

		    )
		{
			this.isUseProxy = true;
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to set proxy: host: " + host +" port: "+port+" protocol: "+protocol);
			this.stopJap();
		    this.proxyIf = new ProxyInterface(host, port, protocol);

	        theProxy = new AnonProxy(serverSocket, new JAPIMutableProxyInterface(proxyIf), null);

	        this.startJap();
		}
	}

	final public void removeProxy(){
		if(this.isUseProxy){
		    this.isUseProxy = false;
		    LogHolder.log(LogLevel.DEBUG, LogType.GUI, "remove proxy ");
		    this.stopJap();
		    theProxy = new AnonProxy(serverSocket, null, null);
		    this.proxyIf = null;

		    this.startJap();
		}
	}

	final public void setLogLevel(int inp)
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setLogLevel: " + inp);
		extLogLevel = inp;
		log.setLogLevel(inp);
		if (fileLog && logF != null)
		{
			logF.setLogLevel(inp);
		}
	}

	final public void setLogType(int inp)
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setLogType: " + inp);
        if (LogType.isValidLogType(inp) || inp == 127){
        	if(inp != 127){
        		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setLogType: " + LogType.getLogTypeName(inp));
		extLogType = inp;
        	}else{
        		extLogType = LogType.ALL;
        		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setLogType: ALL");
        	}
		log.setLogType(inp);
		if (fileLog && logF != null)
		{
			logF.setLogType(inp);
		}
        }else{
        	LogHolder.log(LogLevel.WARNING, LogType.GUI, "LogType: " + inp + " is not defined");
        }
	}

	final public boolean setDefaultMixCascade(String name, String id, String host, int port)
	{
		//("Dresden-Dresden", "141.76.1.120%3A6544", "mix.inf.tu-dresden.de", 443)
		LogHolder.log(LogLevel.DEBUG, LogType.GUI,
					  "try to setDefaultMixCascade: " + name + " id: " + id + " host:" + host + " port: " +
					  port);
		try
		{
			this.prefMixCascade = new MixCascade(name, id, host, port);
			return true;
		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "setDefaultMixCascade: " + e);
			return false;
		}

	}

	final public void setAutoReCon(boolean inp)
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setAutoReCon: " + inp);
		this.autoReCon = inp;
	}

	final public void setDummyTraffic(int inp)
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setDummyTraffic: " + inp);
		this.dummyTraffic = inp;
	}

	final public void setNoPay(boolean inp)
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setNoPay: " + inp);
		this.noPay = inp;
	}

	/**
	 * set the logdetail level
	 * @param inp
	 */

	final public void setLogDetail(int inp)
	{
		try
		{
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to setLogDetail: " + inp);

			if (inp == LogHolder.DETAIL_LEVEL_HIGHEST ||
				inp == LogHolder.DETAIL_LEVEL_HIGH ||
				inp == LogHolder.DETAIL_LEVEL_LOWER ||
				inp == LogHolder.DETAIL_LEVEL_LOWEST)
			{

				LogHolder.setDetailLevel(inp);
			}

		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
		}

	}

	/**
	 * starts writing log to file
	 * @param inp path for logfile
	 */

	final public void setLogFile(String inp, int fileSize, int backups)
	{
		try
		{
			if (true || !fileLog)
			{
				LogHolder.log(LogLevel.DEBUG, LogType.GUI,
							  "try to setLogFile: " + inp + " fileSize: " + fileSize + " backups: " + backups);
				logF = new FileLog(inp, fileSize, backups);
				logC = new ChainedLog(log, logF);

				logC.setLogLevel(this.extLogLevel);
				logC.setLogType(this.extLogType);

				LogHolder.setLogInstance(logC);

				fileLog = true;
			}

		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
		}

	}

	/**
	 * stops writeing logs to file
	 *
	 */
	final public void stopFileLog()
	{
		try
		{
			if (fileLog || true)
			{
				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try to stopFileLog");
				fileLog = false;
				LogHolder.setLogInstance(log);
			}
		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
		}
	}

	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	//////////  after JapController.init    ///////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////

	final public int getAnonLevel()
	{
		//LogHolder.log(LogLevel.DEBUG,LogType.NET,"try to get current AnonLevel() ..."+(System.currentTimeMillis()-currentStatusTime));
		try
		{
			updateStatus();
			if (m_statusinfoCurrentMixCascade!=null){
				// an.on extension only supports 6 steps
				int tmpAnonLevel = m_statusinfoCurrentMixCascade.getAnonLevel();
				if (tmpAnonLevel<=-1){

				}else{
					tmpAnonLevel = (int)((double)tmpAnonLevel/(double)(StatusInfo.ANON_LEVEL_MAX+1)*(double)(6));
				}
				if (tmpAnonLevel > 6) tmpAnonLevel = 6;
			    return tmpAnonLevel;
			}

		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
		}
		return -1;
	}

	final public int getTrafficSit()
	{
		try
		{
			updateStatus();
			if (m_statusinfoCurrentMixCascade!=null)
			    return m_statusinfoCurrentMixCascade.getTrafficSituation();
		}
		catch (Exception e)
		{}
		return -1;
	}

	final public int getNrOfActUsr()
	{
		try
		{
			updateStatus();
			if (m_statusinfoCurrentMixCascade!=null)
				return m_statusinfoCurrentMixCascade.getNrOfActiveUsers();

		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
		}
		return -1;
	}
    private byte updateCounter = 0;
	private final boolean updateStatus()
	{

		try{
		    if (firstStatus || System.currentTimeMillis() > (currentStatusTime + LOCK_TIME))
		    {
		    	if (updateCounter < 126) updateCounter++;
		    	  else updateCounter = 0;
		    	LogHolder.log(LogLevel.DEBUG, LogType.GUI, "fetch current state...("+updateCounter+")");
		        MixCascade cascade=null;


		        if (this.cascadeId!=null && infoServiceTool2!=null){
		        	m_statusinfoCurrentMixCascade = infoServiceTool2.getStatusInfoForId(this.cascadeId);
		        	if (m_statusinfoCurrentMixCascade.getNrOfActiveUsers()>-1){
		        	    firstStatus = false;
                        currentStatusTime = System.currentTimeMillis();
		        	}
		        	LogHolder.log(LogLevel.DEBUG, LogType.GUI, "fetch current state from id -> cascade ("+updateCounter+")");
                    return true;
		        }else{
		        	LogHolder.log(LogLevel.DEBUG, LogType.GUI, "fetch current state this.cascadeId==null ("+updateCounter+")");
		        }

		        if (firstStatus && theProxy != null && (cascade = theProxy.getMixCascade())!=null )
		        {

		            firstStatus = false;

		        }else if (this.firstStatus && this.updateCounter>10 )
		        {

		        	this.firstStatus = false;

		        }

		        if (theProxy!=null && isConnected() && (cascade=theProxy.getMixCascade())!=null){
		            LogHolder.log(LogLevel.DEBUG, LogType.GUI, "fetch current state from proxy -> cascade ("+updateCounter+")");
		            m_statusinfoCurrentMixCascade=infoServiceTool2.getStatusInfoForId(cascade.getId());
		        }else{
		        	if (theProxy==null){
		        		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "fetch current state theProxy == null ("+updateCounter+")");
		        	}else if (!isConnected()){
		        		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "fetch current state theProxy.isConnected == false ("+updateCounter+")");
		        	}else{
		        		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "fetch current state cascade == null ("+updateCounter+")");
		        	}
		        }
		        if(updateCounter > 25 || !firstStatus){
		            currentStatusTime = System.currentTimeMillis();
			    }
		        LogHolder.log(LogLevel.DEBUG, LogType.GUI, "got current state...("+updateCounter+")");

		    }else{
		    	//LogHolder.log(LogLevel.DEBUG, LogType.GUI, "block current state...("+updateCounter+")");
		    }
		}catch(Exception e){
	        LogHolder.log(LogLevel.ERR, LogType.GUI, "err! current state...("+updateCounter+")"+e);
		}
		return true;
	}



	final public int getPort()
	{
		return port;
	}

	final public int getCurrentMixCascadeNumber()
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentMixCascadeNumber");
		if (m_MixCascades != null && (this.theProxy != null || this.startProxy()))
		{

			if (theProxy==null || theProxy.getMixCascade()==null){
				int tmpI =-1;
				if (this.cascadeId!=null)
				    tmpI = getCurrentMixNumberForId(cascadeId);

				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentMixCascadeNumber is "+tmpI);
				return tmpI;
			}

			String curCasId = (theProxy.getMixCascade()).getId();
			int saveI = -1;

			for (int i = 0; i < m_MixCascades.size(); i++)
			{
				if (curCasId != null && curCasId.equals( ( (MixCascade) m_MixCascades.get(i)).getId()))
				{
					saveI = i;
					break;
				}
			}
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentMixCascadeNumber is "+saveI);
			return saveI;
		}
		else
		{
			int tmpI =-1;
			if (this.cascadeId!=null)
			    tmpI = getCurrentMixNumberForId(cascadeId);

			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentMixCascadeNumber is "+tmpI);
			return tmpI;

		}
	}

	final public boolean startJap()
	{
		try{
		    LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try start JAP");
		    startProxy();
		    return true;
		}catch(Exception e){
			return false;
		}
	}

	final public void stopJap()
	{

		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try stop JAP");
		if (theProxy != null)
		{
			theProxy.stop();
		}
	}

	final public void startDummy()
	{
		startDummy(1000);
	}

	final public void startDummy(int time)
	{

		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try start Dummy with " + time);
		//this.isDummy = true;
		this.dummyTraffic = time;
		theProxy.setDummyTraffic(time);

	}

	final public void stopDummy()
	{

		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try stop Dummy");
		//this.isDummy=false;
		this.dummyTraffic = -1;
		theProxy.setDummyTraffic( -1);
	}

	private byte isConnectedCounter=0;
	final public boolean isConnected()
	{
		try{

		    LogHolder.log(LogLevel.DEBUG, LogType.GUI,
			    		  "isConnected: " + theProxy.getMixCascade() + " || " + theProxy.isConnected());
		}catch(Exception e){
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "isConnected err!");
		}

		boolean tmpBool=false;
		if(theProxy!=null)
			tmpBool = theProxy.isConnected();

		if (!tmpBool){
			isConnectedCounter++;
			if (isConnectedCounter > 3){
			    int tmpN=autoSetMixCascade(-2);
			    if (tmpN>-1){
			    	setCurrentMixCascade(tmpN);
			    }
			}
		}else{
			isConnectedCounter=0;
		}

		return tmpBool;
	}

	final public boolean isConnectedWithProxy(){
		try{
			if (theProxy!=null){

			}
		}catch(Exception e){
			LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, e);
		}
		return false;
	}

	final public void shutdown()
	{
		try
		{
			this.saveConfigToDisk();
			if (infoServiceTool !=null) infoServiceTool.stop();
			if (infoServiceTool2!=null) infoServiceTool2.stop();
			if (infoServiceTool3!=null) infoServiceTool3.stop();
			if (theProxy!=null)
			theProxy.stop();

		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
		}

	}

	private boolean m_bChangeInfoService = false;
	private Vector m_MixCascades = new Vector();

	final public Vector getMixCascades()
	{

		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getMixCascades()");
		try
		{
			Hashtable tmpMixCascades;
			if (clearMixCascades || m_MixCascades.isEmpty() || m_bChangeInfoService ||
				System.currentTimeMillis() > (currentMcTime + (500)))
			{
				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Cascaden:");
				if (infoServiceTool!=null){
				tmpMixCascades = infoServiceTool.getMixCascades();
				}else{
					tmpMixCascades = new Hashtable();
				}
				if (!m_MixCascades.isEmpty())
				{
					m_MixCascades.clear();
				}
				Enumeration enumer = tmpMixCascades.elements();
				int i = 0;
				while (enumer.hasMoreElements())
				{
					i++;
					MixCascade cascade = (MixCascade) enumer.nextElement();
					LogHolder.log(LogLevel.DEBUG, LogType.GUI,
								  i + ". " + cascade.getId() + "  " +
								  cascade.getName());
					if (!this.noPay || !cascade.isPayment())
					{
						LogHolder.log(LogLevel.DEBUG, LogType.GUI,
									  i + ". " + cascade.getId() + "  " +
									  cascade.getName() + " isn't Payment");
						m_MixCascades.addElement(cascade);

					}
				}
				if (clearMixCascades)
				{
					clearMixCascades = false;
				}
				currentMcTime = System.currentTimeMillis();
			}
			else
			{
				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "use MC-Cache Info");
			}

			return m_MixCascades;
		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
			return new Vector();
		}

	}

	final private InfoServiceDBEntry createDefaultInfoService() throws Exception
	{
		Vector listeners = new Vector();
		for (int i = 0; i < JAPConstants.DEFAULT_INFOSERVICE_PORT_NUMBERS.length; i++)
		{
			listeners.addElement(new ListenerInterface(JAPConstants.DEFAULT_INFOSERVICE_HOSTNAME,
				JAPConstants.DEFAULT_INFOSERVICE_PORT_NUMBERS[i]));
		}

		InfoServiceDBEntry defaultInfoService = new InfoServiceDBEntry(
				                                       JAPConstants.DEFAULT_INFOSERVICE_NAME,
				                                       JAPConstants.DEFAULT_INFOSERVICE_ID,
				                                       listeners,
				                                       true,
				                                       true,
				                                       System.currentTimeMillis(),
				                                       System.currentTimeMillis()
				                                );
		defaultInfoService.setUserDefined(false);
		return defaultInfoService;
	}

	final public String getInfoServiceId()
	{
		try
		{
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "try getting InfoserviceID");
			if (this.ifh==null || this.ifh.getPreferredInfoService()==null){
				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "get InfoserviceID: null");
				return null;
			}
			String tmpId = (this.ifh.getPreferredInfoService()).getId();
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "get InfoserviceID: "+tmpId);
			return tmpId;

		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
			return "";
		}
	}

	final public boolean setInfoService(String id, String name, String hostname, int[] ports)
	{
		try
		{
			LogHolder.log(LogLevel.DEBUG, LogType.GUI,
						  "try setting Infoservice: " + name + ' ' + id + ' ' + hostname + ' ' + ports);

			if (this.first){

				userSetInfoService = createUserSetInfoService(id, name, hostname, ports);
				LogHolder.log(LogLevel.DEBUG, LogType.GUI, "userSetInfoService created");
			}else
			{
				if (this.ifh==null)
	                this.ifh = InfoServiceHolder.getInstance();

				this.ifh.setPreferredInfoService(createUserSetInfoService(id, name, hostname, ports));

			    if (this.infoServiceTool != null && this.infoServiceTool.isAlive())
			        this.infoServiceTool.stop();
			    this.infoServiceTool = new JapInfoServiceTool();

			    if (this.infoServiceTool2 != null && this.infoServiceTool2.isAlive())
			        this.infoServiceTool2.stop();
			    this.infoServiceTool2 = new JapInfoServiceTool2(noPay);

			    if (theProxy!=null){
				    this.stopJap();
				    this.startJap();
			    }
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "setting Infoservice success");
		}

		}
		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
			return false;
		}
		return true;

	}

	final private InfoServiceDBEntry createUserSetInfoService(String id, String name, String hostname,
		int[] ports) throws Exception
	{
		Vector listeners = new Vector();
		for (int i = 0; i < ports.length; i++)
		{
			listeners.addElement(new ListenerInterface(hostname, ports[i]));
		}

		InfoServiceDBEntry userSetInfoService = new InfoServiceDBEntry(
				                                               name,
				                                               id,
				                                               listeners,
				                                               true,
				                                               true,
				                                               System.currentTimeMillis(),
				                                               System.currentTimeMillis()
		                                        );
		userSetInfoService.setUserDefined(true);
		return userSetInfoService;
	}

	protected int currentMixNumber = -1;
	final public void setCurrentMixCascade(int cId)
	{
		try
		{
			if (this.currentMixNumber != cId)
			{
				this.currentMixNumber = cId;
				LogHolder.log(LogLevel.DEBUG, LogType.GUI,
							  "try setting Mix Cascade: " + cId + " currentID is: " +
							  (theProxy != null && theProxy.getMixCascade() !=null  ? theProxy.getMixCascade().getId() : "theProxy == null"));

				MixCascade tmpMC;
				String tmpID = null;
				if (theProxy != null && (tmpMC=theProxy.getMixCascade()) !=null ){
					tmpID = tmpMC.getId();
				}

				Vector tmpV = getMixCascades();
				byte tmpCounter = 0;
				while ((tmpV.isEmpty() && cId>=0 || tmpV.size() < cId ) && tmpCounter<100){
					tmpV = getMixCascades();
					tmpCounter++;
				}

				prefMixCascade = (MixCascade) tmpV.get(cId);
				this.cascadeId = prefMixCascade.getId();
				currentStatusTime = -1;
				if ((tmpID != null && !tmpID.equals(prefMixCascade.getId()))){
				    this.stopJap();
				    this.startJap();

				}

			}
		}

		catch (Exception e)
		{
			LogHolder.log(LogLevel.ERR, LogType.GUI, e);
		}
	}

	final public void clearMixCascadeCache()
	{
		this.clearMixCascades = true;
	}

	final public String getCurrentMixId()
	{
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentMixId ...");
		if (!(theProxy!= null &&  theProxy.getMixCascade() != null
				 && theProxy.getMixCascade().getId() != null))
		{
			if (theProxy == null) this.startProxy();
			String tmp1 = "";
			if (this.cascadeId!=null){
				tmp1 = this.cascadeId;
			}
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "CurrentMixId is: "+tmp1+"!");
			return tmp1;
		}
		String tmp2="";
		if ( theProxy.getMixCascade() != null
				 && theProxy.getMixCascade().getId() != null) tmp2 = theProxy.getMixCascade().getId();
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "CurrentMixId is: "+tmp2+"!");
		return tmp2;
	}

	final public int getCurrentMixNumberForId(String id)
	{
		try{
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentNumberForId: "+id);
		    Vector v = this.getMixCascades();
		    byte tmpCounter=0;
		    while(v.isEmpty() && tmpCounter < 5 ){
			    Thread.sleep(200);
			    v = this.getMixCascades();
			    tmpCounter++;
		    }
		    for (int i = 0; i < v.size(); i++)
		    {
			    if ( ( (MixCascade) v.get(i)).getId() != null && ( ( (MixCascade) v.get(i)).getId()).equals(id))
			    {
			    	LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentNumberForId: "+id+ " is "+i);
			    	return i;
			    }
		    }
		}catch(Exception e){

		}
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentNumberForId: "+id+ " is -1");
		return -1;
	}

	final public String getCurrentMixIdForNumber(int inp){
		try{
			LogHolder.log(LogLevel.DEBUG, LogType.GUI, "getCurrentIdForNumber: "+inp);
			Vector v = this.getMixCascades();
		    byte tmpCounter=0;
		    while(v.isEmpty() && tmpCounter < 5 ){
			    Thread.sleep(200);
			    v = this.getMixCascades();
			    tmpCounter++;
		    }
		    if (inp < v.size()){
		    	MixCascade tmpMc = (MixCascade) v.get(inp);
		    	if (tmpMc!=null && tmpMc.getId()!=null){
		    		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "gotCurrentIdForNumber: "+tmpMc.getId());
		    		return tmpMc.getId();
		    	}

		    }

		}catch(Exception e){

		}
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "gotCurrentIdForNumber: ''");
		return "";
	}

	final public int autoSetMixCascade(int minUserCount)
	{

		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "autoSetMixCascade: minUser: " + minUserCount);
		int bestI = -1;
		int tmpAnonLevel = -3;
		int anonLevel = -3;
		int tmpUserCount = -1;
		Vector v = this.getMixCascades();
		StatusInfo si;
		for (int i = 0; i < v.size(); i++)
		{
			if (minUserCount==-2){
				bestI = i;
				break;
			}
			si = null;
			try{
				si = ((MixCascade) v.get(i)).fetchCurrentStatus();
			}catch(Exception e){
				LogHolder.log(LogLevel.WARNING, LogType.GUI, "error while fetch status for "+((MixCascade) v.get(i)).getName());
			}
			if (si!=null){
			    tmpAnonLevel = si.getAnonLevel();
			    tmpUserCount = si.getNrOfActiveUsers();

			    if (anonLevel <= tmpAnonLevel && tmpUserCount > minUserCount)
			    {
				    anonLevel = tmpAnonLevel;
				    bestI = i;
			    }
			}

		}
		LogHolder.log(LogLevel.DEBUG, LogType.GUI,
					  "try Cascade: " + (bestI > -1 ? ( (MixCascade) v.get(bestI)).getName() : "no results!"));
		return bestI;
	}

	final public void setCascadeId(String id){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI,"try setCascadeId: " + id );
		this.cascadeId = id;
	}

	final public int getAnonLevelForId(String id){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI,"try getAnonLevelForId: " + id);
		StatusInfo tmpInfo;
		if (infoServiceTool2!=null && (tmpInfo=infoServiceTool2.getStatusInfoForId(id))!=null)
		{
			int tmpAnonLevel = tmpInfo.getAnonLevel();
			if (tmpAnonLevel<=-1){

			}else{
				tmpAnonLevel = (int)((double)tmpAnonLevel/(double)(StatusInfo.ANON_LEVEL_MAX+1)*(double)(6));
			}
			if (tmpAnonLevel > 6) tmpAnonLevel = 6;
		    return tmpAnonLevel;

		}else{
			return -1;
		}

	}

	final public void setIsConnect2MixCascade(boolean inp){
		this.isConnect2MixCascade = inp;
	}

	final public boolean getIsConnect2MixCascade(){
		return this.isConnect2MixCascade;
	}

	final public void setDatabaseDir(String inp){
		try{
		    this.databaseDir = inp;
		    if (this.databaseDir!=null){
                // remove file:///
		        if (this.databaseDir.indexOf("file:///")>-1){
		        	this.databaseDir=this.databaseDir.substring(this.databaseDir.indexOf("file:///")+((new String("file:///")).length()),this.databaseDir.length());
		        }
		        LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Get this databaseDir: "+this.databaseDir);
		        if (this.osName!=null && this.osName.indexOf("Linux")>-1)
		        {
		        	if (this.databaseDir.indexOf("//")>-1){
		    	        this.databaseDir=this.databaseDir.replaceAll("//","/");
		            }
		        }else if (this.osName!=null && this.osName.indexOf("Mac")>-1)
		        {
		        	LogHolder.log(LogLevel.EMERG, LogType.GUI, "no rule for MacOs !");
		        }else{

		            if (this.databaseDir.indexOf("//")>-1){
		    	        this.databaseDir=this.databaseDir.replaceAll("//","\\\\");
		            }
		        }
		        LogHolder.log(LogLevel.DEBUG, LogType.GUI, "Use this databaseDir: "+this.databaseDir);
		    }
		}catch(Exception e){
			LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, e);
		}
	}

	/**
	 * only testet for windows
	 *
	 */
	final private void saveConfigToDisk(){
		try{
			String confString = getConfigurationAsXmlString();
			if (this.databaseDir!=null && confString!=null){
			    String path = this.databaseDir;
			    path+=this.confFile;
			    File f = new File(path);
			    if (f.isFile() && !f.exists()){
			    	f.createNewFile();
			    }else{
			    	f.delete();
			    	f.createNewFile();
			    }
			    FileOutputStream fos = new FileOutputStream(f);

			    fos.write(confString.getBytes());
			    fos.flush();
			    fos.close();


			}else{
				LogHolder.log(LogLevel.EMERG, LogType.GUI, "Can't save config file, no database directory "+this.databaseDir+" or empty confString! "+confString);
			}

		}catch(Exception e){
			LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, e);
		}
	}

	/**
	 *
	 * @return xmlConfigString
	 */

	final private String getConfigurationAsXmlString()
	{
		// Save config to xml file
		// Achtung!! Fehler im Sun-XML --> NULL-Attribute koennen hinzugefuegt werden,
		// beim Abspeichern gibt es dann aber einen Fehler!

		try
		{
			Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
			Element e = doc.createElement("JAP");
			doc.appendChild(e);
			XMLUtil.setAttribute(e, JAPConstants.CONFIG_VERSION, "0.22");
			// save payment configuration
			/*try
			{
				PayAccountsFile accounts = PayAccountsFile.getInstance();
				if (accounts != null)
				{
					Element elemPayment = doc.createElement(JAPConstants.CONFIG_PAYMENT);
					e.appendChild(elemPayment);

					//Save the known PIs
					Element elemPIs = doc.createElement(JAPConstants.CONFIG_PAYMENT_INSTANCES);
					elemPayment.appendChild(elemPIs);
					Enumeration pis = accounts.getKnownPIs();
					while (pis.hasMoreElements())
					{
						elemPIs.appendChild( ( (BI) pis.nextElement()).toXmlElement(doc));
					}
					if (PayAccountsFile.getInstance().getNumAccounts() > 0)
					{
						Element elemAccounts = accounts.toXmlElement(doc);
						elemPayment.appendChild(elemAccounts);

						if (getPaymentPassword() != null && !getPaymentPassword().equals(""))
						{
							// encrypt XML
							XMLEncryption.encryptElement(elemAccounts, getPaymentPassword());
						}
					}
				}
			}
			catch (Exception ex)
			{
				LogHolder.log(LogLevel.EXCEPTION, LogType.MISC, "Error saving payment configuration");
				return null;
			}*/


			/* infoservice configuration options */
			XMLUtil.setAttribute(e, JAPConstants.CONFIG_INFOSERVICE_DISABLED, false);
			XMLUtil.setAttribute(e, JAPConstants.CONFIG_INFOSERVICE_TIMEOUT,jap2ff.JAPConstants.DEFAULT_INFOSERVICE_TIMEOUT);

			//XMLUtil.setAttribute(e, JAPConstants.CONFIG_DUMMY_TRAFFIC_INTERVALL,JAPModel.getDummyTraffic());
			//XMLUtil.setAttribute(e, JAPConstants.CONFIG_AUTO_CONNECT, JAPModel.getAutoConnect());
			//XMLUtil.setAttribute(e, JAPConstants.CONFIG_AUTO_RECONNECT, JAPModel.getAutoReConnect());
			/*stores user defined MixCascades*/
			// Empty

			/* adding signature verification settings */
			e.appendChild(SignatureVerifier.getInstance().toXmlElement(doc));

			/* adding infoservice settings */
			e.appendChild(InfoServiceHolder.getInstance().toXmlElement(doc));

			/*stores MixCascades*/
			Element elemCascades = doc.createElement(MixCascade.XML_ELEMENT_CONTAINER_NAME);
			e.appendChild(elemCascades);
			Enumeration enumer = Database.getInstance(MixCascade.class).getEntrySnapshotAsEnumeration();
			while (enumer.hasMoreElements())
			{
				elemCascades.appendChild(((MixCascade) enumer.nextElement()).toXmlElement(doc));
			}

			/* stores known cascades */
			e.appendChild(Database.getInstance(CascadeIDEntry.class).toXmlElement(
						 doc, CascadeIDEntry.XML_ELEMENT_CONTAINER_NAME));

			/*stores mixes */
			Element elemMixes = doc.createElement(MixInfo.XML_ELEMENT_CONTAINER_NAME);
			e.appendChild(elemMixes);
			Enumeration enumerMixes = Database.getInstance(MixInfo.class).getEntrySnapshotAsEnumeration();
			while (enumerMixes.hasMoreElements())
			{
				Element element = ((MixInfo) enumerMixes.nextElement()).toXmlElement(doc);
				if (element != null) // do not write MixInfos of first mixes derived from cascade
				{
					elemMixes.appendChild(element);
				}
			}

			/* store the current MixCascade */
			/*MixCascade defaultMixCascade = getCurrentMixCascade();
			if (defaultMixCascade != null)
			{
				Element elem = defaultMixCascade.toXmlElement(doc);
				e.appendChild(elem);
			}*/


			/* add tor*/
			// Empty

			/* add mixminion*/
			// Empty
			XMLUtil.formatHumanReadable(doc);
			return XMLUtil.toString(doc);
		}
		catch (Throwable ex)
		{
			LogHolder.log(LogLevel.EXCEPTION, LogType.GUI, "" + ex.getMessage());
		}
		return null;
	}


}
