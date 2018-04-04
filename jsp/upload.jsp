<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@page import="java.util.List"%>
<%@page import="java.util.Iterator"%>
<%@page import="java.util.Random"%>
<%@page import="java.io.File"%>
<%@page import="org.apache.commons.fileupload.servlet.ServletFileUpload"%>
<%@page import="org.apache.commons.fileupload.FileItemFactory"%>
<%@page import="org.apache.commons.fileupload.disk.DiskFileItemFactory"%>
<%@page import="org.apache.commons.fileupload.FileItem"%>
<%@page import="org.apache.commons.io.FilenameUtils"%>
<%@page import="com.carlbro.cbinfo.global.GlobalRessources"%>
<%@page import="com.carlbro.cbinfo.global.CBInfoParam"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page import="org.apache.commons.fileupload.servlet.ServletRequestContext"%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
</head>
<%
    GlobalRessources.getInstance().reloadIfNeeded();
    String wwwrootDir = GlobalRessources.getInstance().getCBInfoParam().getLocalStringValue("cbinfo.wwwroot.dir");
    String tmpDir = GlobalRessources.getInstance().getCBInfoParam().getLocalStringValue("module.formular.upload.dir");


    String sessionID = "";
    String uploadedFilename = "";
    String filename = "";
    String callbackHandler = "";
    String callbackID = "";
    String formular = "formular";
    String orgFileName = "";
	double fileSize = -1;
	int maxFileSize = 0;
    FileItem fileUpload = null;
    request.setCharacterEncoding("UTF-8");
    ServletRequestContext src = new ServletRequestContext(request);
    boolean isMultipart = ServletFileUpload.isMultipartContent(src);
    
   if (isMultipart)
   {
     //Create a factory for disk-based file items
     FileItemFactory factory = new DiskFileItemFactory();

     //   Create a new file upload handler
     ServletFileUpload upload = new ServletFileUpload(factory);

     //   Parse the request
     List /* FileItem */items = upload.parseRequest(request);
     

     //Process the uploaded items
     Iterator iter = items.iterator();

     while (iter.hasNext())
     {
       FileItem item = (FileItem) iter.next();

       if (!item.isFormField())
       {
         String itemName = org.apache.commons.io.FilenameUtils.getName(item.getName());
         
         // IE er belastende som sædvanligt og sender hele stien med
         if (itemName.indexOf('\\') > 0)
         {
           int lastIndex = itemName.lastIndexOf('\\');
           itemName = itemName.substring(lastIndex+1, itemName.length());
         }
		 uploadedFilename = itemName;
         fileUpload = item;
       }
       else
       {
         String name = item.getFieldName();
         String value = item.getString();
         
         if (name.equalsIgnoreCase("id"))
        	 callbackID = value;
         if (name.equalsIgnoreCase("callbackhandler"))
             callbackHandler = value;
         if (name.equalsIgnoreCase("sessionid"))
             sessionID = value;
         if (name.equalsIgnoreCase("formular"))
             formular = value;
         if (name.equalsIgnoreCase("maxfilesize"))
             maxFileSize = Integer.parseInt(value);
       }
     }
   }
   
   if(fileUpload != null)
   {
	   //1024*1024 is the size for megbytes
	   if (fileUpload.getSize() <= (maxFileSize *1024 *1024)) {
		   Random rand = new Random(System.currentTimeMillis()) ;
		   long n = Math.abs(rand.nextLong() % 1000000);
		   orgFileName = uploadedFilename;
		   filename = formular+"_" + n +"_"+uploadedFilename;
		   filename = filename.replaceAll(",", "_");
		   filename = filename.replaceAll(";", "_");
		   uploadedFilename = tmpDir + File.separator + filename;
		   File uploadedFile = new File(uploadedFilename);
		   fileUpload.write(uploadedFile);
		   fileSize = uploadedFile.length()/(1024*1024); 
	   } else {
		   fileSize = fileUpload.getSize();
	   }
   }

   if (callbackID == null)
	   callbackID = "fileupload";
   if (callbackHandler == null)
         callbackHandler = "parent.uploadFilename";

   out.println("<body onload=\"" + callbackHandler + "('" + filename.replace('\\', '/') + "','"+callbackID+"','"+orgFileName+"','" + fileSize + "');\">");
//    out.println("Fil uploadet og skrevet til: " + uploadedFilename);
   out.println("</body>");
%>
</html>
