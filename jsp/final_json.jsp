<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
 pageEncoding="ISO-8859-1"
 import="com.carlbro.cbinfo.global.GlobalRessources"
 import="java.io.*"
 import="java.util.Properties"
 import="java.util.Enumeration"
 %><%
        Properties requestParameters = getRequestParameters(request);
        String fileName  = requestParameters.getProperty("frpdf");
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
            out.println(createOkJSON());
        }catch (Exception e){
            out.println(createErrorJSON(e));
        }

%>
<%!
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

private String createErrorJSON(Exception e){
    StringBuilder jsonResult = new StringBuilder("");
    jsonResult.append("{\n");
    jsonResult.append("\"result\": \"ERROR\",\n");
    jsonResult.append("\"message\": \"" + e.getMessage().replace("\\", "/") + "\",\n");
    jsonResult.append("\"usage\": \" /jsp/modules/formular/final_json.jsp?frpdf=FILENAME&formular=FORMULARNAME&frid=SAVEID\"\n");
    jsonResult.append("}\n");
    return jsonResult.toString(); 
}

private String createOkJSON(){
    StringBuilder jsonResult = new StringBuilder("");
    jsonResult.append("{\n");
    jsonResult.append("\"result\": \"OK\"\n");
    jsonResult.append("}\n");
    return jsonResult.toString(); 
}
%>