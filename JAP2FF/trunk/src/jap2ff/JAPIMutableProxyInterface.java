/**
 * 
 */
package jap2ff;

import anon.infoservice.*;

/**
 * @author root
 *
 */
public class JAPIMutableProxyInterface implements IMutableProxyInterface {

	/**
	 * 
	 */
	
	private ProxyInterface pif = null;
	
	public JAPIMutableProxyInterface(ProxyInterface inp) {
		pif = inp;
	}

	/* (non-Javadoc)
	 * @see anon.infoservice.IMutableProxyInterface#getProxyInterface(boolean)
	 */
	public IProxyInterfaceGetter getProxyInterface(boolean a_bAnonInterface) {
		if (pif != null){
			return new JAPIProxyInterfaceGetter((anon.infoservice.ImmutableProxyInterface)pif);
		}
		return null;
	}

}


