spatialsuite-formular
================

Dette modul giver brugeren en formular, som f.eks. kan bruges til ansøgninger.

--------------------
VEJLEDNING
--------------------

En formular er en page i CBkort. Indholdet af formularen styres vha. en parameter i URL'en, der refererer til en helt specifik navngivet konfiguration. Formularen kaldes med:

http://sandkasse.randers.dk/cbkort?page=formular&formular=soe

Dette giver en side, der kan indlejres som en Iframe i et CMS system. Stylingen er derfor gjort meget enkelt, så den vil passe ind (næsten) hvor som helst.

Konfigurationen er placeret vha. parameteren "module.formular.config", og er pt. sat i filen "cbinfo_k730.xml:
```xml
<param name="module.formular.config">[module:formular.dir]/config/formular_config.xml</param>
```

I filen er der angivet én eller flere formular konfigurationer. Hver konfiguration kan indeholde følgende:

```xml
    <formular name="soe">                                       <!-- name er navnet på formularen og refererer til værdien af URL-parameteren "formular" -->
        <title>Ansøgningsskema til vandhuller</title>           <!-- OPTIONAL - Angiver den tekst, der står som titel i browseren -->
        <header>Ansøgningsskema til vandhuller</header>         <!-- OPTIONAL - Angiver den tekst, der står øverst på siden -->
        <subheader>Ansøgning efter naturbeskyttelsesloven</subheader> <!-- OPTIONAL - Angiver den tekst, der står under overskriften på siden -->
        <submitpage>formular.send.soe</submitpage>              <!-- Den page, der skal kaldes for at gemme og danne kvitering - Denne page vil være specifik for hver formular. Se senere i dette dokument. -->
        <showreport>true</showreport>                           <!-- OPTIONAL - Skal der genereres et PDF-dokument når brugeren trykker på send (default er "true"). Hvis "false", så vises en simpel tekst hvis det er gået godt -->
        <reportprofile>alt</reportprofile>                      <!-- OPTIONAL - Profil, der skal anvendes til at danne kortet i kviteringen (default er "alt") -->
        <reportlayers>default</reportlayers>                    <!-- OPTIONAL - Layers, der skal anvendes til at danne kortet i kviteringen. Det kan være en liste adskilt af mellemrum (default er "default", der gør at det er profilen default viste temaer, der vises) -->
        <reportxsl>kvitering</reportxsl>                        <!-- OPTIONAL - UDEN XSL EXTENSTION! Hvis der er behov for at have en specifik xsl til at danne PDF-kviteringen (default er kvitering og peget på filen kvitering.xsl under modulet) -->
        <reportmapscale>500</reportmapscale>                    <!-- OPTIONAL - Den scale som kortet skal være i PDF-kviteringen (default er tilpasses til den tegnede feature plus 25+pct!400+minimum) -->
        <css>/css/custom/my.css</css>                           <!-- OPTIONAL - Hvis man gerne vil have sin egen css på siden -->
        <js>/js/custom/my.js</css>                              <!-- OPTIONAL - Hvis man gerne vil have sin egen js på siden. Kan bruges til at tilføje sine egne funktioner så det ikke er nødvendigt at skrive det hele i konfigurationen -->
        <content>
            <!-- content, kan bestå af et vilkårligt antal elementer i en vilkårlig rækkefølge. I følgende er de enkelte typer elementer beskrevet.
                 Generelt indeholder alle elementer, der indeholder noget, der skal sendes til serveren, atributten "urlparam". Dette er navnet på 
                 den parameter i URL'en, der kan bruges i f.eks. datasourcen når data skal gemmes. 
                 Alle elementer kan indeholde atributten "displayname", der vil stå som ledeteksten for det pågældende element. Denne værdi sendes IKKE til serveren
                 Alle elementer kan som udgangspunkt indeholde:
                 - urlparam
                 - displayname
                 - id
                 - class
                 - onchange
                 - onkeyup          - Funktion f.eks. til at lave beregninger. Brug "id"-atributten for at identificere specifikke inputfelter
                 - defaultvalue
                 - regexp           - Til validering på et felt. Skriv f.eks. "[0-9]" for at sikre at der altid bliver skrevet et tal
                 - validate         - Tekst til validering. Det skrives under feltet for at angive hvad der er gjort galt.
                  -->

            <!-- input - type="hidden" -->
            <!-- Kan bruges til at sende værdier, der ikke vedrører brugeren, til serveren -->
            <input type="hidden" urlparam="pdfheadertext1" defaultvalue="Dette er en tekst, der skal sættes ind i kviteringen."/>
            
            <!-- input - type="dropdown" -->
            <!-- Vil populere en dropdown, som brugeren kan vælge fra.
                 Defaultvalue kan angives med samme værdi som value for den options som skal vælges fra start. -->
            <input type="dropdown" displayname="Hvad søges:" urlparam="hvad" defaultvalue="oprensning af sø">
                <option value="ny sø" name="Ny sø"/>
                <option value="oprensning af sø" name="Oprensning af sø"/>
                <option value="udvidelse af sø" name="Udvidelse af sø"/>
            </input>
            
            <!-- input - type="radiobutton" -->
            <!-- Det samme som i dropdown -->
            <input type="radiobutton" displayname="Hvad søges:" urlparam="hvad">
                <option value="ny sø" name="Ny sø"/>
                <option value="oprensning af sø" name="Oprensning af sø"/>
                <option value="udvidelse af sø" name="Udvidelse af sø"/>
            </input>
            
            <!-- input - type="input" -->
            <!-- Et helt almindeligt input felt -->
            <input type="input" displayname="Navn:" urlparam="navn"/>

            <!-- input - type="textarea" -->
            <!-- Et helt almindeligt textarea felt hvor brugeren kan skrive flere linier -->
            <input type="textarea" urlparam="begrundelse" displayname="Begrundelse for ansøgning:"/>
            
            <!-- address -->
            <!-- Et felt hvor brugeren kan søge en adresse vha. SpatialAddress. Adressesøgningen benyttes som udgangspunkt til at finde noget i kortet.
                 vejen eller Adressepunktet markeres ikke i kortet. Hvis "urlparam" atributten er defineret, sendes den tekst, der står i feltet, videre til servere.
                 Derudover sendes adressepunktets wkt også til serveren som urlparam+"_wkt". Hvis urlparam="adresse" så vil adressepunktet blive sendt til serveren med adresse_wkt=POINT(XXXX YYYY)
                 Hvis der kun er valgt en vej, så vil adresse_wkt være tom! -->
            <address urlparam="address" displayname="Adresse:" apikey="[module.spatialaddress.apikey]" filter="komnr0153"></address>

            <!-- input - type="date" -->
            <!-- Datovælger felt hvor man kan skrive en dato eller vælge 
                 Hvis man angiver en "limitfromdatasource" attribut, så hentes der en liste af datoer ud fra den angivede datasource.
                 Datasourcen skal returnere flere rækker med en kolonne, der skal indeholde datoer, der ikke kan vælges. Formatet på
                 en dato skal pt være f.eks. 22.01.2013 -->
            <input type="date" displayname="Dato:" urlparam="date" limitfromdatasource="ds_formular_booking"/>

            <!-- input - type="file" -->
            <!-- Felt til at vedhæfte en fil -->
            <input type="file" displayname="Vedhæft tegning:" urlparam="filnavn"/>

            <!-- input - type="checkbox" -->
            <!-- En check boks hvor brugeren kan vælge til eller fra. Serveren modtager "true", hvis brugeren har valgt at klikke den til, ellers sendes "false".
                 Defaultvale kan bruges til at bestemme om den check boksen skal være klikket til eller fra. Default er "true" -->
            <input type="checkbox" displayname="Godkendt:" urlparam="godkendt" defaultvalue="true"/>

            <!-- area -->
            <!-- Et felt, der viser arealet af de tegnede. Brugeren har ikke mulighed for at skrive i dette. -->
            <area urlparam="areal" displayname="Areal:"/>

            <!-- input - type="text" -->
            <!-- Dette er til at vise en tekst for brugeren. Det kan bruges til at lave en deloverskrift -->
            <input type="text" displayname="Dette er en over skrift"/>
            
            <!-- maptools -->
            <!-- Maptool, er nogle knapper, som brugeren kan vælge imellem når der skal interageres med kortet. Nedenstående liste er dem, der pt. er implementeret. "pan" toolet vil altid default være slået til. -->
            <!-- På alle maptools kan man sætte displayname og herved få vist en tekst når musen føres over ikonet -->
            <maptools>
                <maptool displayname="" name="pan"/>
                <maptool displayname="" name="select" datasource="NAVN_PÅ_DATASOURCE"/>   <!-- Select udpager fra en datasource, der skal angives som attribut -->
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
            <!-- Når der er angivet et "conflicts" element, betyder det at der foretages en spatiel søgning når der tegnes i kortet.
                 Resultatet af den spatielle søgning, vises på det sted hvor dette element er angivet.
                 Ud over "displayname" og "urlparam", kan der kan sættes en række andre atributter:
                 - "class"         - angiver den css class, som feltet skal have. Det kan f.eks. være "warning", der gør at feltet bliver rødt.
                 - "targetset"     - angiver navnet på det targetset, som der skal søges i.
                 - "targetsetfile" - angiver hvilken fil targetsettet ligger i. Default er [module:formular.dir]/queries/spatialqueries.xml
                 På et targetset vil der typisk være anigvet ét target, men der kan godt være flere. På dette target er der knyttet en presentation. 
                 Inholdet af denne presentation, vil blive vist for brugeren. Hvis presentation ikke indeholder nogen columns, så vil der ikke blive vist 
                 noget resultat, men "displayname" vises. Det kan f.eks. bruges til at vise at der er fundet noget, men det er ikke interessant hvad det præcist er -->
            <conflicts class="warning" displayname="Vær opmærksom på at arealet ligger inden for 10 meter fra et §3 område" targerset="konflikt" targetsetfile="[cbinfo.queries.dir]/custom/mytargetsetfile.xml"/>

            <!-- submitbutton -->
            <!-- En knap, der vises når formularen er sendt og gået godt. Knappen kan f.eks. bruges til at sende brugeren videre
                 til en ny formular eller en betalingsside.
                 Man skal skrive lige den funktion som man har lyst til. F.eks. "window.open('http://dmi.dk')" eller man kan bruge
                 nogle af de standard funktioner der er i modulet f.eks. "formular.start()" der starte samme formular igen. Eller
                 "formular.load('http://dmi.dk/ref=')" der sørge for at sende en reference til lige præcis denne indberetning/ansøgning. -->
            <submitbutton displayname="Opret ny" function="formular.start();"/>

        </content>
    </formular>
```


Page:
I konfigurationen angives "submitpage", der er den page, der kaldes når brugeren trykker på "Send". Denne page, vil være en ny for hver ny formular. Dette skyldes at vi herved beskytter vores site mod misbrug.
Pagen indeholder tre elementer:
1. Kald til én eller flere datasources.
2. Include af standard page, der danner kviteringen m.m.

En page kan se ud som følger:
```xml
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
```

Hvis der er data, der skal registreres i DriftWeb, så tilføjes der en DriftWeb datasource til pagen:
```xml
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
```


