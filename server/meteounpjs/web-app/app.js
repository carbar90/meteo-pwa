let _appTitle="meteo@uniparthenope"
let _appLogo="/images/meteo_uniparthenope_logo.png"
let _appDescription="Center for Monitoring and Modelling Marine and Atmosphere Applications @ University of Naples Parthenope. https://app.meteo.uniparthenope.it"
let apiBaseUrl="https://api.meteo.uniparthenope.it"
let dataBaseUrl="https://data.meteo.uniparthenope.it/opendap/opendap/"
let wmsBaseUrl="https://data.meteo.uniparthenope.it/ncWMS2/wms/lds/opendap/"

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getAppUrl() {
    let getUrl = window.location
    return getUrl .protocol + "//" + getUrl.host + "/"
}
function getURLParameter(sParam, defaultValue) {

    let sPageURL = window.location.search.substring(1);

    let sURLVariables = sPageURL.split('&');

    for (let i = 0; i < sURLVariables.length; i++) {
        let sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return defaultValue;
}

let _lang=getURLParameter("lang",(navigator.language || navigator.userLanguage));

let _page=getURLParameter("page","home");

let oMap=null;


let _place=getURLParameter("place","it000");
let _prod=getURLParameter("prod","wrf5");
let _output=getURLParameter("output","gen");

const dateTime=new Date()
defaultNcepDate=dateTime.getUTCFullYear()+pad(dateTime.getUTCMonth()+1,2)+pad(dateTime.getUTCDate(),2)+"Z"+pad(dateTime.getUTCHours(),2)+"00";

let _ncepDate=getURLParameter("date",defaultNcepDate);




let _hours=getURLParameter("hours",0);
let _step=getURLParameter("step",1);
let _mapName=getURLParameter("mapName","muggles");

let box=null;
let chart=null;
let control=null;
let plot=null;

function expandUrl( baseUrl ) {
    if (baseUrl == null) {
        baseUrl=""
    }
    return baseUrl
        .replace("{lang}",_lang)
        .replace("{place}",_place)
        .replace("{prod}",_prod)
        .replace("{output}",_output)
        .replace("{date}",_ncepDate)
        .replace("{hours}",_hours)
        .replace("{step}",_step)
        .replace("{mapName}",_mapName)
        .replace("{random}",Math.random())
}

function pythonEncode(s) {
    return s
        .replace(/:/g,"__cl__")
        .replace(/\//g,"__sl__")
        .replace(/ /g,"__sp__")
        .replace( /&/g,"__am__")
        .replace(/\?/g,"__qm__")
        .replace(/=/g,"__eq__")
        .replace(/\+/g,"__pl__")
        .replace(/@/g,"__at__")
        .replace(/#/g,"__sh__")
        .replace(/,/g,"__cm__")
        .replace(/[.]/g,"__pt__")
}



function rewriteUrl(title, description, prepend, previewImage) {

    if (title==="") {
        title=_appTitle
    } else {
        title=_appTitle+": "+title
    }

    if (description==="") {
        description=_appDescription
    }

    if (previewImage==="") {
        previewImage=getAppUrl()+_appLogo
    } else {
        if (!(previewImage.startsWith("https://") || previewImage.startsWith("http://"))) {
            if (previewImage.startsWith("/")==false) {
                previewImage="/"+previewImage
            }
            previewImage=getAppUrl()+previewImage
        }
    }

    console.log("Update urls")
    let params=expandUrl("place={place}&prod={prod}&output={output}&date={date}&step={step}&hours={hours}")
    let url="index.html?"+prepend+"&"+params
    let fullUrl=getAppUrl()+"/"+url
    let encodedShareUrl=
        apiBaseUrl+"/share/"+pythonEncode(title)+
        "/"+pythonEncode(description)+
        "/"+pythonEncode(previewImage)+
        "/"+pythonEncode(fullUrl)

    window.history.pushState("",title,url)
    $("a.navbar-brand").attr("href","index.html?"+params)

    $("#urlShareFacebook")
        .attr("href","https://facebook.com/sharer.php?u="+encodedShareUrl)
        .attr("data-url",encodedShareUrl)
    $("#urlShareTwitter")
        .attr("href","https://twitter.com/intent/tweet?url="+encodedShareUrl)
        .attr("data-url",encodedShareUrl)

}


function footer() {
    let legalDisclaimerUrl=apiBaseUrl+"/legal/disclaimer?lang="+_lang

    $.getJSON( legalDisclaimerUrl, function( data ) {
        console.log("legalDisclaimer")
        let localizedData=data["i18n"][_lang]
        $("#container_footer").append(localizedData["disclaimer"]);
        $("#container_footer").css("display","block")
    });

}

function navBar() {
    let navBarUrl=apiBaseUrl+"/v2/navbar?lang="+_lang
    console.log("navBarUrl:"+navBarUrl)



    $.getJSON( navBarUrl, function( data ) {

        let navBarBrandUrl="index.html"
        let items = [];

        $.each( data, function( key, values ) {
            values.forEach(function(item, index) {
                let html="";
                let localizedItem=item["i18n"][_lang]

                if ("items" in localizedItem) {
                    if ("isHome" in item && item["isHome"]) {
                        navBarBrandUrl=localizedItem["href"]
                    }

                    html += "<li class='nav-item dropdown'>"
                    html += "    <a class='nav-link dropdown-toggle' href='"+expandUrl(localizedItem["href"])+"' role='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false\'>"+localizedItem["text"]+"</a>"
                    html += "    <div class='dropdown-menu' aria-labelledby='navbarDropdown'>"
                    localizedItem["items"].forEach(function(item1, index1) {

                        if (item1["text"]==="-") {
                            html += "        <div class='dropdown-divider'></div>"
                        } else {
                            html += "        <a class='dropdown-item' href='" + expandUrl(item1["href"]) + "'>" + item1["text"]+ "</a>"
                        }

                        if ("isHome" in item1 && item1["isHome"]) {
                            navBarBrandUrl=item1["href"]
                        }
                    })
                    html += "    </div>"
                    html += "</li>"
                } else {
                    html += "<li class='nav-item active'>"
                    html += "    <a class='nav-link' href='"+expandUrl(localizedItem["href"])+"'>"+localizedItem["text"]+"</a>"
                    html += "</li>"

                    if ("isHome" in item && item["isHome"]) {
                        navBarBrandUrl=localizedItem["href"]
                    }
                }
                items.push(  html );
            });
        });
        $("a.navbar-brand").attr("href",expandUrl(navBarBrandUrl))
        $("#navbar_items").append(items.join("\n"));
    });
}

function weatherReports() {
    let weatherReportsUrl=apiBaseUrl+"/v2/weatherreports/latest/json?lang="+_lang

    $.getJSON( weatherReportsUrl, function( data ) {
        let localizedItem=data["i18n"][_lang]
        let html=""
        html+="<div class=\"row\">"
        html+="  <div class=\"col\">"

        html+="    <div class=\"card\">"
        html+="      <div class=\"card-body\">"
        html+="        <h5 class=\"card-title\">"+localizedItem["title"]+"</h5>"
        html+=localizedItem["summary"]
        html+="      </div>"
        html+="    </div>"
        html+="  </div>"
        html+="</div>"



        $("#container_weatherreports")
            .html(html)
            .css("display","block")

        rewriteUrl(localizedItem["title"],"","page=weatherreports",expandUrl(apiBaseUrl+"/products/wrf5/forecast/reg15/map/image"))
    });

}

function cards() {
    let cardsUrl=apiBaseUrl+"/v2/cards?lang="+_lang
    console.log("cardsUrl:"+cardsUrl)

    $.getJSON( cardsUrl, function( data ) {

        $("#container_cards_row").empty()



        $.each( data, function( key, values ) {
            values.forEach(function(item, index) {
                let localizedItem=item["i18n"][_lang]
                let cardId="card_"+item["_id"]



                let html=""
                html+="<div id=\""+cardId+"_container\" class=\"col\" style=\"display: none\">"
                html+="  <div class=\"card\" id=\""+cardId+"\">"
                html+="    <a href=\""+expandUrl(localizedItem["button"]["href"])+"\">"
                html+="      <img id=\""+cardId+"_image\" class=\"card-img-top\" src=\""+expandUrl(localizedItem["image"]["src"])+"\" alt=\""+localizedItem["image"]["alt"]+"\">"
                html+="    </a>"
                html+="    <div class=\"card-body\">"
                html+= "      <h5 id=\""+cardId+"_title\" class=\"card-title\"></h5>"
                html+= "      <p id=\""+cardId+"_text\" class=\"card-text\"></p>"
                html+="      <a href=\""+expandUrl(localizedItem["button"]["href"])+"\" class=\"btn btn-primary\">"+localizedItem["button"]["text"]+"</a>"
                html+="    </div>"
                html+="  </div>"
                html+="</div>"


                $("#container_cards_row").append(html)

                if ("timeout" in item) {
                    (function(){
                        let imageUrl=expandUrl(localizedItem["image"]["src"])
                        console.log("Update:"+imageUrl)
                        $("#"+cardId+"_image").attr("src",imageUrl)
                        setTimeout(arguments.callee, parseInt(item["timeout"])*1000);
                    })();

                }

                let title=localizedItem["title"]



                if (title instanceof Object) {

                    if ( "url" in title) {
                        let titleUrl=apiBaseUrl+"/v2/weatherreports/latest/title/json?lang="+_lang

                        $.getJSON( titleUrl, function( data ) {
                            title=data["title"]
                            $("#"+cardId+"_title").html(title)
                        })

                    }
                } else {
                    $("#"+cardId+"_title").html(title)
                }

                let text=localizedItem["text"]
                if (text instanceof Object) {
                    if ( "url" in text) {
                        let textUrl=apiBaseUrl+"/v2/weatherreports/latest/text/json?lang="+_lang

                        $.getJSON(textUrl, function (data) {
                            text = data["summary"]
                            $("#" + cardId + "_text").html(text)
                        })
                    }
                } else {
                    $("#"+cardId+"_text").html(text)
                }

                if ("avail" in item && item["avail"]!=="") {
                    let availUrl=expandUrl(item["avail"])

                    $.getJSON(availUrl, function (data) {

                        if (data["avail"].length > 0) {
                            $("#"+cardId+"_container").css("display","block")
                        }
                    })

                } else {
                    $("#"+cardId+"_container").css("display","block")
                }
            });
        });

        $("#container_cards").css("display","block")
    });
}

function map() {
    console.log("Map _ncepDate:"+_ncepDate)
    oMap = $("#map").MeteoUniparthenopeMap(_place, _ncepDate, {
        "noPopup": false,
        "mapName": _mapName,
        "baseLink": "index.html?page=products"
    });

    $(window).on('resize', function() {
        //console.log("RESIZE")
        $("#map").css('height', "50vh");
    });

    control=$("#control").MeteoUniparthenopeControl(_place,null,null,_ncepDate);
    control.on( "update", function( event, place, prod, output, ncepDate ) {


        oMap = $("#map").MeteoUniparthenopeMap(place, ncepDate, {
            "noPopup": false,
            "mapName": _mapName,
            "baseLink": "index.html?page=products"
        });

        _place=place;
        _ncepDate=ncepDate;

        cards()

        rewriteUrl("",_appDescription,"",expandUrl(apiBaseUrl+"/products/{prod}/forecast/{place}/map/image"))
    });

    //$("#container_carousel").css("display","block")
    $("#container_control").css("display","block")
    $("#container_map").css("display","block")
}

function products() {
    box=$("#box").MeteoUniparthenopeDayBox(_place,_prod,"#box_title");
    chart=$("#chart").MeteoUniparthenopeChart(_place,_prod,_output,_hours,_step,_ncepDate,$("#chart_title"));
    plot=$("#plot").MeteoUniparthenopePlot(_place,_prod,_output,_ncepDate,
        "topBarImage",
        "leftBarImage",
        "rightBarImage",
        "bottomBarImage");

    $(window).on('resize', function() {
        //console.log("RESIZE")
        $("#chart").css('height', "50vh");
    });

    control=$("#control").MeteoUniparthenopeControl(_place,_prod,_output,_ncepDate);
    control.on( "update", function( event, place, prod, output, ncepDate ) {


        plot.update(place,prod,output,ncepDate);

        if (place !== _place) {
            box=$("#box").MeteoUniparthenopeDayBox(place,prod,"#box_title");
            chart=$("#chart").MeteoUniparthenopeChart(place,prod,output,_hours,_step,_ncepDate,null);
        }
        else if (prod!==_prod || output !== _output) {
            chart=$("#chart").MeteoUniparthenopeChart(place,prod,output,_hours,_step,_ncepDate,null);
        }

        _prod=prod;
        _place=place;
        _output=output;
        _ncepDate=ncepDate;

        let placeUrl=apiBaseUrl + "/places/"+place
        $.getJSON( placeUrl, function( data ) {

            // Get the long name
            let longName=""
            if (_lang in data["long_name"]) {
                longName=data["long_name"][_lang]
            } else if (_lang.split("-")[0] in data["long_name"]) {
                longName=data["long_name"][_lang.split("-")[0]]
            } else {
                longName=data["long_name"]["it"]
            }

            // Get the domain and the resolution
            let domain=Object.keys(data["prods"][prod])[0];
            let res=data["prods"][prod][domain]["res"].toFixed(4)

            let cLat=data["cLat"]
            let cLon=data["cLon"]

            console.log("cLon:"+cLon+" cLat:"+cLat)

            let d2r=0.0174533
            resKm=(res*111.3199*Math.cos(cLat*d2r)).toFixed(2)

            let fileName=prod+"_"+domain+"_"+ncepDate+".nc"

            let year=ncepDate.substring(0,4)
            let month=ncepDate.substring(4,6)
            let day=ncepDate.substring(6,8)

            let prodsUrl=apiBaseUrl+"/products/"+prod
            $.getJSON( prodsUrl, function( data ) {


                // Get the description
                let description=""
                if (_lang in data["outputs"]["desc"]) {
                    description+=data["outputs"]["desc"][_lang]
                } else if (_lang.split("-")[0] in data["outputs"]["desc"]) {
                    description+=data["outputs"]["desc"][_lang.split("-")[0]]
                } else {
                    description+=data["outputs"]["desc"]["it"]
                }

                description+=". "

                if (_lang in data["outputs"]["outputs"][output]) {
                    description+=data["outputs"]["outputs"][output][_lang]
                } else if (_lang.split("-")[0] in data["outputs"]["outputs"][output]) {
                    description+=data["outputs"]["outputs"][output][_lang.split("-")[0]]
                } else {
                    description+=data["outputs"]["outputs"][output]["it"]
                }

                description += ". Resolution:" + res + "&deg; ("+resKm+"Km)."

                rewriteUrl(longName + ".", description, "page=products", expandUrl(apiBaseUrl + "/products/{prod}/forecast/{place}/plot/image?output={output}&opt=bars"))

                $("#card_title").html(longName)
                $("#card_text").html(description)

                $("#place_link").attr("href", expandUrl(apiBaseUrl + "/places/{place}"))
                $("#plot_link").attr("href", expandUrl(apiBaseUrl + "/products/{prod}/forecast/{place}/plot/image?output={output}&opt=bars"))
                $("#json_link").attr("href", expandUrl(apiBaseUrl + "/products/{prod}/timeseries/{place}"))
                $("#csv_link").attr("href", expandUrl(apiBaseUrl + "/products/{prod}/timeseries/{place}/csv"))
                $("#opendap_history_link").attr("href", expandUrl(dataBaseUrl + "/{prod}/" + domain + "/history/" + year + "/" + month + "/" + day + "/" + fileName + ".html"))
                $("#wms_history_link").attr("href", expandUrl(wmsBaseUrl + "/{prod}/" + domain + "/history/" + year + "/" + month + "/" + day + "/" + fileName + "?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0"))
                $("#opendap_archive_link").attr("href", expandUrl(dataBaseUrl + "/{prod}/" + domain + "/archive/" + year + "/" + month + "/" + day + "/" + fileName + ".html"))
                $("#wms_archive_link").attr("href", expandUrl(wmsBaseUrl + "/{prod}/" + domain + "/archive/" + year + "/" + month + "/" + day + "/" + fileName + "?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0"))

            })
        })
    });
    $("#container_control").css("display","block")
    $("#container_plot").css("display","block")
    $("#container_chart").css("display","block")
    $("#container_box").css("display","block")
    $("#container_opendata").css("display","block")
}

function pages() {
    let pageUrl=apiBaseUrl+"/v2/pages/"+_page+"?lang="+_lang
    console.log("pageUrl:"+pageUrl)

    $.getJSON( pageUrl, function( data ) {
        let localizedData=data["i18n"][_lang]
        let imageUrl=""
        if ("image" in localizedData) {
            $("#page_image").attr("src",localizedData["image"]["src"])
            $("#page_image").attr("alt",localizedData["image"]["alt"])
            imageUrl=localizedData["image"]["src"]
        }
        $("#page_title").text(localizedData["title"])

        let subtitle=""
        if ("subtitle" in localizedData) {
            $("#page_subtitle").text(localizedData["subtitle"])
            subtitle=localizedData["subtitle"]
        }
        $("#page_body").html(localizedData["body"])

        if ("links" in localizedData) {
            localizedData["links"].forEach(function(link, index) {
                $("#page_links").append("<a href=\""+link["href"]+"\" class=\"card-link\">"+link["text"]+"</a>")
            })
        }

        $("#container_pages").css("display","block")




        rewriteUrl(localizedData["title"], subtitle,"page="+_page,imageUrl)
    });
}


$( document ).ready(function() {

    console.log("READY _ncepDate:"+_ncepDate)

    navBar()

    console.log("PAGE:"+_page)
    if (_page==="home") {
        console.log("HOME")
        map()
        // Cards is automatically isued by update
        //cards()
    } else if (_page==="products") {
        console.log("PRODUCTS")
        products()
    } else if (_page==="weatherreports") {
        console.log("weatherreports")
        weatherReports()
    } else {
        console.log("PAGES")
        pages()
    }
    footer()
    console.log("FINISH")
});
