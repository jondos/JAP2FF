package jap2ff;

import anon.AnonServerDescription;
import anon.AnonServiceEventListener;
import logging.*;

public class JapProxyEventListener implements AnonServiceEventListener {

	private JapController jc = null;
	
	public JapProxyEventListener(JapController inp) {
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "New JapProxyEventListener");
		this.jc = inp;
	}

	final public void connectionError(){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "connectionError");
		jc.setIsConnect2MixCascade(false);
	}

	final public void disconnected(){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "disconnected");
		jc.setIsConnect2MixCascade(false);
	}

	final public void connecting(AnonServerDescription a_serverDescription){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "connecting");
	}

	final public void connectionEstablished(AnonServerDescription a_serverDescription){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "connectionEstablished");
		jc.setIsConnect2MixCascade(true);
	}

	final public void packetMixed(long a_totalBytes){
		//LogHolder.log(LogLevel.DEBUG, LogType.GUI, "packetMixed");
	}

	final public void dataChainErrorSignaled(){
		LogHolder.log(LogLevel.DEBUG, LogType.GUI, "dataChainErrorSignaled");
	}

}
