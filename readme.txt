===============================================================
CBkort version 2.x, copyright Grontmij Carl Bro GIS&IT, 2009
===============================================================
$Archive: /Products/CBKort2/development/2.6/standard/wwwroot/WEB-INF/config/modules/standard/multiselect2/readme.txt $ 
$Date: 25-03-11 18:31 $
$Revision: 21 $ 
$Author: Nsm $
=============================================================== 
--------------------
FORMULAR
--------------------

Dette modul giver brugeren en formular, som f.eks. kan bruges til ans�gninger.

--------------------
VEJLEDNING
--------------------

En formular er en page i CBkort. Indholdet af formularen styres vha. en parameter i URL'en, der refererer til en helt specifik navngivet konfiguration. Formularen kaldes med:

http://sandkasse.randers.dk/cbkort?page=formular&formular=soe

Dette giver en side, der kan indlejres som en Iframe i et CMS system. Stylingen er derfor gjort meget enkelt, s� den vil passe ind (n�sten) hvor som helst.

Konfigurationen er placeret vha. parameteren "module.formular.config", og er pt. sat i filen "cbinfo_k730.xml:
<param name="module.formular.config">[module:formular.dir]/config/formular_config.xml</param>

I filen er der angivet �n eller flere formular konfigurationer. Hver konfiguration kan indeholde f�lgende:


    <formular name="soe">                                       <!-- name er navnet p� formularen og refererer til v�rdien af URL-parameteren "formular" -->
        <title>Ans�gningsskema til vandhuller</title>           <!-- OPTIONAL - Angiver den tekst, der st�r som titel i browseren -->
        <header>Ans�gningsskema til vandhuller</header>         <!-- OPTIONAL - Angiver den tekst, der st�r �verst p� siden -->
        <subheader>Ans�gning efter naturbeskyttelsesloven</subheader> <!-- OPTIONAL - Angiver den tekst, der st�r under overskriften p� siden -->
        <submitpage>formular.send.soe</submitpage>              <!-- Den page, der skal kaldes for at gemme og danne kvitering - Denne page vil v�re specifik for hver formular. Se senere i dette dokument. -->
        <showreport>true</showreport>                           <!-- OPTIONAL - Skal der genereres et PDF-dokument n�r brugeren trykker p� send (default er "true"). Hvis "false", s� vises en simpel tekst hvis det er g�et godt -->
        <reportprofile>alt</reportprofile>                      <!-- OPTIONAL - Profil, der skal anvendes til at danne kortet i kviteringen (default er "alt") -->
        <reportlayers>default</reportlayers>                    <!-- OPTIONAL - Layers, der skal anvendes til at danne kortet i kviteringen. Det kan v�re en liste adskilt af mellemrum (default er "default", der g�r at det er profilen default viste temaer, der vises) -->
        <reportxsl>kvitering</reportxsl>                        <!-- OPTIONAL - UDEN XSL EXTENSTION! Hvis der er behov for at have en specifik xsl til at danne PDF-kviteringen (default er kvitering og peget p� filen kvitering.xsl under modulet) -->
        <reportmapscale>500</reportmapscale>                    <!-- OPTIONAL - Den scale som kortet skal v�re i PDF-kviteringen (default er tilpasses til den tegnede feature plus 25+pct!400+minimum) -->
        <css>/css/custom/my.css</css>                           <!-- OPTIONAL - Hvis man gerne vil have sin egen css p� siden -->
        <js>/js/custom/my.js</css>                              <!-- OPTIONAL - Hvis man gerne vil have sin egen js p� siden. Kan bruges til at tilf�je sine egne funktioner s� det ikke er n�dvendigt at skrive det hele i konfigurationen -->
        <content>
            <!-- content, kan best� af et vilk�rligt antal elementer i en vilk�rlig r�kkef�lge. I f�lgende er de enkelte typer elementer beskrevet.
                 Generelt indeholder alle elementer, der indeholder noget, der skal sendes til serveren, atributten "urlparam". Dette er navnet p� 
                 den parameter i URL'en, der kan bruges i f.eks. datasourcen n�r data skal gemmes. 
                 Alle elementer kan indeholde atributten "displayname", der vil st� som ledeteksten for det p�g�ldende element. Denne v�rdi sendes IKKE til serveren
                 Alle elementer kan som udgangspunkt indeholde:
                 - urlparam
                 - displayname
                 - id
                 - class
                 - onchange
                 - onkeyup          - Funktion f.eks. til at lave beregninger. Brug "id"-atributten for at identificere specifikke inputfelter
                 - defaultvalue
                 - regexp           - Til validering p� et felt. Skriv f.eks. "[0-9]" for at sikre at der altid bliver skrevet et tal
                 - validate         - Tekst til validering. Det skrives under feltet for at angive hvad der er gjort galt.
                  -->

            <!-- input - type="hidden" -->
            <!-- Kan bruges til at sende v�rdier, der ikke vedr�rer brugeren, til serveren -->
            <input type="hidden" urlparam="pdfheadertext1" defaultvalue="Dette er en tekst, der skal s�ttes ind i kviteringen."/>
            
            <!-- input - type="dropdown" -->
            <!-- Vil populere en dropdown, som brugeren kan v�lge fra.
                 Defaultvalue kan angives med samme v�rdi som value for den options som skal v�lges fra start. -->
            <input type="dropdown" displayname="Hvad s�ges:" urlparam="hvad" defaultvalue="oprensning af s�">
                <option value="ny s�" name="Ny s�"/>
                <option value="oprensning af s�" name="Oprensning af s�"/>
                <option value="udvidelse af s�" name="Udvidelse af s�"/>
            </input>
            
            <!-- input - type="radiobutton" -->
            <!-- Det samme som i dropdown -->
            <input type="radiobutton" displayname="Hvad s�ges:" urlparam="hvad">
                <option value="ny s�" name="Ny s�"/>
                <option value="oprensning af s�" name="Oprensning af s�"/>
                <option value="udvidelse af s�" name="Udvidelse af s�"/>
            </input>
            
            <!-- input - type="input" -->
            <!-- Et helt almindeligt input felt -->
            <input type="input" displayname="Navn:" urlparam="navn"/>

            <!-- input - type="textarea" -->
            <!-- Et helt almindeligt textarea felt hvor brugeren kan skrive flere linier -->
            <input type="textarea" urlparam="begrundelse" displayname="Begrundelse for ans�gning:"/>
            
            <!-- address -->
            <!-- Et felt hvor brugeren kan s�ge en adresse vha. SpatialAddress. Adresses�gningen benyttes som udgangspunkt til at finde noget i kortet.
                 vejen eller Adressepunktet markeres ikke i kortet. Hvis "urlparam" atributten er defineret, sendes den tekst, der st�r i feltet, videre til servere.
                 Derudover sendes adressepunktets wkt ogs� til serveren som urlparam+"_wkt". Hvis urlparam="adresse" s� vil adressepunktet blive sendt til serveren med adresse_wkt=POINT(XXXX YYYY)
                 Hvis der kun er valgt en vej, s� vil adresse_wkt v�re tom! -->
            <address urlparam="address" displayname="Adresse:" apikey="[module.spatialaddress.apikey]" filter="komnr0153"></address>

            <!-- input - type="date" -->
            <!-- Datov�lger felt hvor man kan skrive en dato eller v�lge 
                 Hvis man angiver en "limitfromdatasource" attribut, s� hentes der en liste af datoer ud fra den angivede datasource.
                 Datasourcen skal returnere flere r�kker med en kolonne, der skal indeholde datoer, der ikke kan v�lges. Formatet p�
                 en dato skal pt v�re f.eks. 22.01.2013 -->
            <input type="date" displayname="Dato:" urlparam="date" limitfromdatasource="ds_formular_booking"/>

            <!-- input - type="file" -->
            <!-- Felt til at vedh�fte en fil -->
            <input type="file" displayname="Vedh�ft tegning:" urlparam="filnavn"/>

            <!-- input - type="checkbox" -->
            <!-- En check boks hvor brugeren kan v�lge til eller fra. Serveren modtager "true", hvis brugeren har valgt at klikke den til, ellers sendes "false".
                 Defaultvale kan bruges til at bestemme om den check boksen skal v�re klikket til eller fra. Default er "true" -->
            <input type="checkbox" displayname="Godkendt:" urlparam="godkendt" defaultvalue="true"/>

            <!-- area -->
            <!-- Et felt, der viser arealet af de tegnede. Brugeren har ikke mulighed for at skrive i dette. -->
            <area urlparam="areal" displayname="Areal:"/>

            <!-- input - type="text" -->
            <!-- Dette er til at vise en tekst for brugeren. Det kan bruges til at lave en deloverskrift -->
            <input type="text" displayname="Dette er en over skrift"/>
            
            <!-- maptools -->
            <!-- Maptool, er nogle knapper, som brugeren kan v�lge imellem n�r der skal interageres med kortet. Nedenst�ende liste er dem, der pt. er implementeret. "pan" toolet vil altid default v�re sl�et til. -->
            <!-- P� alle maptools kan man s�tte displayname og herved f� vist en tekst n�r musen f�res over ikonet -->
            <maptools>
                <maptool displayname="" name="pan"/>
                <maptool displayname="" name="select" datasource="NAVN_P�_DATASOURCE"/>   <!-- Select udpager fra en datasource, der skal angives som attribut -->
                <maptool displayname="" name="polygon"/>
                <maptool displayname="" name="line"/>
                <maptool displayname="" name="point"/>
                <maptool displayname="" name="circle"/>
            </maptools>

            <!-- map -->
            <!-- Det element, der indeholder kortet. -->
            <map>
                <extent>539430.4,6237856,591859.2,6290284.8</extent>                <!-- OPTIONAL -->
                <resolutions>0.4,0.8,1.6,3.2,6.4,12.8,25.6,51.2,102.4</resolutions> <!-- OPTIONAL -->
                <themes>
                    <theme name="theme-grundkort_2007" host="http://tile.randers.dk/service/wms"/>
                </themes>
            </map>
            
            <!-- conflicts -->
            <!-- N�r der er angivet et "conflicts" element, betyder det at der foretages en spatiel s�gning n�r der tegnes i kortet.
                 Resultatet af den spatielle s�gning, vises p� det sted hvor dette element er angivet.
                 Ud over "displayname" og "urlparam", kan der kan s�ttes en r�kke andre atributter:
                 - "class"         - angiver den css class, som feltet skal have. Det kan f.eks. v�re "warning", der g�r at feltet bliver r�dt.
                 - "targetset"     - angiver navnet p� det targetset, som der skal s�ges i.
                 - "targetsetfile" - angiver hvilken fil targetsettet ligger i. Default er [module:formular.dir]/queries/spatialqueries.xml
                 P� et targetset vil der typisk v�re anigvet �t target, men der kan godt v�re flere. P� dette target er der knyttet en presentation. 
                 Inholdet af denne presentation, vil blive vist for brugeren. Hvis presentation ikke indeholder nogen columns, s� vil der ikke blive vist 
                 noget resultat, men "displayname" vises. Det kan f.eks. bruges til at vise at der er fundet noget, men det er ikke interessant hvad det pr�cist er -->
            <conflicts class="warning" displayname="V�r opm�rksom p� at arealet ligger inden for 10 meter fra et �3 omr�de" targerset="konflikt" targetsetfile="[cbinfo.queries.dir]/custom/mytargetsetfile.xml"/>

            <!-- submitbutton -->
            <!-- En knap, der vises n�r formularen er sendt og g�et godt. Knappen kan f.eks. bruges til at sende brugeren videre
                 til en ny formular eller en betalingsside.
                 Man skal skrive lige den funktion som man har lyst til. F.eks. "window.open('http://dmi.dk')" eller man kan bruge
                 nogle af de standard funktioner der er i modulet f.eks. "formular.start()" der starte samme formular igen. Eller
                 "formular.load('http://dmi.dk/ref=')" der s�rge for at sende en reference til lige pr�cis denne indberetning/ans�gning. -->
            <submitbutton displayname="Opret ny" function="formular.start();"/>

        </content>
    </formular>


Page:
I konfigurationen angives "submitpage", der er den page, der kaldes n�r brugeren trykker p� "Send". Denne page, vil v�re en ny for hver ny formular. Dette skyldes at vi herved beskytter vores site mod misbrug.
Pagen indeholder tre elementer:
1. Kald til �n eller flere datasources.
2. Include af standard page, der danner kviteringen m.m.

En page kan se ud som f�lger:

    <page name="formular.send.soe" contenttype="text/xml" resultpassing="pass-all">
        <data handler="datasource" operation="execute-command">
            <url-parameters>
                <url-parameter name="dataspource">ds_formular_soe</url-parameter>
                <url-parameter name="command">write</url-parameter>
            </url-parameters>
        </data>
        
        <!-- REQUIRED -->
        <include src="[module:formular.dir]/pages/pages-includes.xml" nodes="/pages/page[@name='formular.send']/*" mustexist="true"/>
    </page>

Hvis der er data, der skal registreres i DriftWeb, s� tilf�jes der en DriftWeb datasource til pagen:

    <page name="formular.send.soe" contenttype="text/xml" resultpassing="pass-all">
        <data handler="datasource" operation="execute-command">
            <url-parameters>
                <url-parameter name="dataspource">ds_formular_soe</url-parameter>
                <url-parameter name="command">write</url-parameter>
            </url-parameters>
        </data>
        <data handler="datasource" operation="execute-command">
            <url-parameters>
                <url-parameter name="dataspource">driftweb_report</url-parameter>
                <url-parameter name="command">write</url-parameter>
                <url-parameter name="problemyypeid">81</url-parameter>
            </url-parameters>
        </data>
        
        <!-- REQUIRED -->
        <include src="[module:formular.dir]/pages/pages-includes.xml" nodes="/pages/page[@name='formular.send']/*" mustexist="true"/>
    </page>




--------------------
DEPENDENCIES
--------------------

SpatialMap 2.6 or newer

--------------------
CHANGES
--------------------

        
