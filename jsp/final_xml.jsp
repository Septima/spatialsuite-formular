<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
 pageEncoding="ISO-8859-1"
 import="com.carlbro.cbinfo.global.GlobalRessources"
 import="java.io.*"
 import="java.util.Properties"
 import="java.util.Enumeration"
 %><%
        response.setContentType("text/xml; charset=UTF-8");
        //Usage: /jsp/saveFromTmp.jsp?file=FILE&frid=FRID&formular=FORMULAR, where
        //  FILE is the name of a file in cbinfo.imagepath.dir, and
        //  FRID is the FEATURE ROW ID for the current object, and
        //  FORMULAR is the name of the current formular
        
        Properties requestParameters = getRequestParameters(request);
        String fileName  = requestParameters.getProperty("filename");
        String formular  = requestParameters.getProperty("formular");
        String dirParam  = "module.formular.pdf.dir";
        String newfilename  = formular+"_"+requestParameters.getProperty("frid")+".pdf";
       try {
            GlobalRessources gr = GlobalRessources.getInstance ();
            String cbinfoTempDir = GlobalRessources.getInstance ().getCBInfoParam ().getLocalStringValue ("cbinfo.imagepath.dir");
            String sourceFileName = cbinfoTempDir + "/" + fileName;
            
            String destDir = GlobalRessources.getInstance ().getCBInfoParam ().getLocalStringValue (dirParam);
            String destFileName =  destDir + "/" + newfilename;
            
            copyFile(out, sourceFileName, destFileName);
            out.println(createOkXML());
        }catch (Exception e){
            out.println(createErrorXML(e));
        }

%><%!
private Properties getRequestParameters(HttpServletRequest request) throws Exception{
    Enumeration parameters = request.getParameterNames();
    Properties requestParameters = new Properties();
    while (parameters.hasMoreElements()){
        String parameter = (String) parameters.nextElement();
        if (parameter == null){
        }else{
            requestParameters.setProperty(parameter, request.getParameter(parameter));
          }
    }
    return (requestParameters);
}

private void copyFile(JspWriter out, String sourceFileName, String destFileName) throws Exception{
    try{
        File f1 = new File(sourceFileName);
        File f2 = new File(destFileName);
        
        InputStream is = null;  new FileInputStream(f1);
        is = new FileInputStream(f1);
        OutputStream os = new FileOutputStream(f2);

        byte[] buf = new byte[1024];
        int len;
        while ((len = is.read(buf)) > 0){
            os.write(buf, 0, len);
          }
        is.close();
        os.close();
      }
      catch(FileNotFoundException ex){
            throw (ex);
      }
      catch(IOException e){
            throw (e);
      } 
    
}

private String createErrorXML(Exception e){
    StringBuilder jsonResult = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    jsonResult.append("<root>\n");
    jsonResult.append("  <result><message>ERROR</message></result>\n");
    //jsonResult.append("  <result><message>" + e.getMessage().replace("\\", "/") + "</message></result>\n");
    jsonResult.append("</root>"); 
    return jsonResult.toString(); 
}

private String createOkXML(){
    StringBuilder jsonResult = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    jsonResult.append("<root>\n");
    jsonResult.append("  <result><message>OK</message></result>\n");
    jsonResult.append("</root>");
    return jsonResult.toString(); 
}
%>