package jap2ff;

import anon.infoservice.ImmutableProxyInterface;
import anon.infoservice.IMutableProxyInterface.IProxyInterfaceGetter;

public class JAPIProxyInterfaceGetter implements IProxyInterfaceGetter {
    
	private ImmutableProxyInterface ipif = null;
	public JAPIProxyInterfaceGetter(ImmutableProxyInterface inp) {
		ipif = inp;		
	}

	public ImmutableProxyInterface getProxyInterface() {
		if (ipif!=null){
			return ipif;
		}
		return null;
	}

	

}
