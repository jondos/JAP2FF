package jap2ff;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import HTTPClient.NVPair;
import anon.infoservice.ImmutableProxyInterface;

public class ProxyInterface implements ImmutableProxyInterface {

	private boolean valid = false;
	private String host=null;
	private int port=-1;
	private int protocol=-1;
	
	public ProxyInterface(){
		
	}
	
	public ProxyInterface(String host, int port, int protocol) {
		
		this.valid = true;
		
		this.host = host;
		this.port = port;
		this.protocol = protocol;
		
		
	}

	public boolean isAuthenticationUsed() {
		// TODO Auto-generated method stub
		return false;
	}

	public String getAuthenticationPassword() {
		// TODO Auto-generated method stub
		return null;
	}

	public String getAuthenticationUserID() {
		// TODO Auto-generated method stub
		return null;
	}

	public String getProxyAuthorizationHeaderAsString() {
		// TODO Auto-generated method stub
		return null;
	}

	public NVPair getProxyAuthorizationHeader() {
		// TODO Auto-generated method stub
		return null;
	}

	public int getProtocol() {
		return this.protocol;
	}

	public String getHost() {
		return this.host;
	}

	public int getPort() {
		return this.port;
	}

	public boolean isValid() {
		return valid;
	}

	public Element toXmlElement(Document a_doc) {
		// TODO Auto-generated method stub
		return null;
	}

}
