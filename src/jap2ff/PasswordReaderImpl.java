package jap2ff;

import anon.util.IMiscPasswordReader;

public class PasswordReaderImpl implements IMiscPasswordReader {

	private String passW = new String(""); 
	 
	public String readPassword(Object message) {
		return passW;
	}
	
	public void setPassW(String inp){
		
		if (inp!=null) this.passW = inp;
		
	}

}
