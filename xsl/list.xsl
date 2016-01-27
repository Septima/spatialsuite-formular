<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" indent="yes" encoding="[cbinfo.html.encoding]"/>
    <xsl:param name="formular"/>
    <xsl:param name="sessionid"/>
    <xsl:template match="/">
        <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;</xsl:text>
        <xsl:text>&#xa;</xsl:text>
        <xsl:apply-templates select="config"/>
    </xsl:template>

    <xsl:template match="config">
        <html>
            <head>
                <meta charset="utf-8"></meta>
                <meta http-equiv="X-UA-Compatible" content="IE=edge"></meta>
                <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
                <title>List of all available formular</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"></link>
                <style>

                    .container {
                    padding-right: 50px;
                    padding-left: 50px;
                    }
                    .container > .row {
                    margin-top: 80px;
                    }

                </style>
            </head>
            <body>

                <nav class="navbar navbar-fixed-top navbar-inverse">
                    <div class="container">
                        <div class="navbar-header">
                            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                                <span class="sr-only">Toggle navigation</span>
                                <span class="icon-bar"></span>
                                <span class="icon-bar"></span>
                                <span class="icon-bar"></span>
                            </button>
                            <a class="navbar-brand" href="#">Formular</a>
                        </div>
                        <div id="navbar" class="collapse navbar-collapse">
                            <ul class="nav navbar-nav">
                                <li>
                                    <a href="https://github.com/Septima/spatialsuite-formular">Github</a>
                                </li>
                                <li>
                                    <a href="mailto:kontakt@septima.dk">Kontakt</a>
                                </li>
                            </ul>
                        </div><!-- /.nav-collapse -->
                    </div><!-- /.container -->
                </nav><!-- /.navbar -->

                <div class="container">

                    <div class="row">

                        <div class="col-xs-12 col-sm-12">
                            <div class="row">

                                <xsl:for-each select="formular">

                                    <div class="list-group">
                                        <xsl:element name="a">
                                            <xsl:attribute name="class">list-group-item</xsl:attribute>
                                            <xsl:attribute name="role">button</xsl:attribute>
                                            <xsl:attribute name="href">/cbkort?page=formular&amp;formular=<xsl:value-of select="@name"/>
                                            </xsl:attribute>
                                            <h4 class="list-group-item-heading">
                                                <xsl:value-of select="header"/>
                                                <small> -
                                                    <xsl:value-of select="@name"/>
                                                </small>
                                            </h4>
                                            <p class="list-group-item-text">
                                                <xsl:value-of select="subheader"/>
                                            </p>
                                        </xsl:element>
                                    </div>

                                </xsl:for-each>

                            </div><!--/row-->
                        </div><!--/.col-xs-12.col-sm-9-->

                    </div><!--/row-->

                    <hr/>

                    <footer>
                        <p>
                            <xsl:text>&#169;</xsl:text> 2015
                        </p>
                    </footer>

                </div><!--/.container-->


            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
