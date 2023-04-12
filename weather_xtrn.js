// Inspired by SyncWX 
// Modified to use weatherapi.com 
// This version is used as the external program for users
// Add it under External programs as its own external program
// It asks the user for the zip code of the weather forecast they wish to see

// This is still under "construction"
// The goal is to re-incorporate some of the features from the original
// SyncWX code - icons, etc.

log(user.ip_address);

// This code is from the original inspiration - SyncWX 
// Left it in case I wanted to try to put info into that section 
// of modopts.ini
//Load modopts.ini info early so we can detect if the section exists for [SyncWX]
var opts=load({},"modopts.js","SyncWX");
if (opts === null) {
	log("ERROR in weather.js: opts is null.");
	log("ERROR in weather.js: Are you sure you have a section in modopts.ini labeled [SyncWX]? See sysop.txt for instructions.");
	exit();
}

load("http.js"); //this loads the http libraries which you will need to make requests to the web server
load("sbbsdefs.js"); //loads a bunch-o-stuff that is probably beyond the understanding of mere mortals 
load(js.exec_dir + 'websocket-helpers.js');

//Try to load new wxlanguage.js file, but default to English if it is missing
// More stuff from the original SyncWX code
/*
try {
	load(js.exec_dir + 'wxlanguage.js');
} catch (err) {
	log("ERROR in weather.js. " + err);
	log("ERROR in weather.js. Language will default to English. For alternate language support, get wxlanguage.js at https://raw.githubusercontent.com/KenDB3/syncWXremix/master/wxlanguage.js");
} finally {
	WXlang = "";
	LocationHeader = "Your Location: ";
	ConditionsHeader = "Current Conditions: ";
	TempHeader = "Temp: ";
	SunHeader = "Sunrise/Sunset: ";
	LunarHeader = "Lunar Phase: ";
	WindHeader = "Wind: ";
	UVHeader = "UV Index: ";
	AlertExpires = "Expires ";
	ReadAlert = "Read the Full Alert";
	degreeSymbol = "\370"; //ANSI/CP437 Degree Symbol
}
*/

// API key weatherapi.com
var wungrndAPIkey = opts.wungrndAPIkey; // This will pull the key from the modopts.ini file
var weatherIcon = opts.weathericon_ext; // Now defined in the file /sbbs/ctrl/modopts.ini - see the sysop.txt instructions.

// Get zip code for location
function getInfo()
{
    // Ask the user for input of the zip code they want for the weather
    console.clear();
    console.center("Get the weather for the area of your choice",80);
    console.putmsg("Enter the Zip Code: ");
    var wthrLocation = console.getstr();
    return wthrLocation;
}

// This function makes the http call to weatherapi.com
// then returns the parsed JSON as response
function callWeatherAPI(key,loc)
{
    // Setup request to get weather for user's zip code or system zip code
    var req = new HTTPRequest();
    var resp = req.Get("http://api.weatherapi.com/v1/forecast.json?key="+key+"&q="+loc+"&days=3");
    var response = JSON.parse(resp); // Parse the JSON data returned
    return response;
}

// Call the weather display function
function processWeatherData(response)
{
    // From original SyncWX
    // Making wind direction arrows in CP437/ANSI
    var windArrowDirN = "\001h\001y\031";
    var windArrowDirNNE = "\001h\001y\031\031\021";
    var windArrowDirNE = "\001h\001y\031\021";
    var windArrowDirENE = "\001h\001y\021\031\021";
    var windArrowDirE = "\001h\001y\021";
    var windArrowDirESE = "\001h\001y\021\030\021";
    var windArrowDirSE = "\001h\001y\030\021";
    var windArrowDirSSE = "\001h\001y\030\030\021";
    var windArrowDirS = "\001h\001y\030";
    var windArrowDirSSW = "\001h\001y\030\030\020";
    var windArrowDirSW = "\001h\001y\030\020";
    var windArrowDirWSW = "\001h\001y\020\030\020";
    var windArrowDirW = "\001h\001y\020";
    var windArrowDirWNW = "\001h\001y\020\031\020";
    var windArrowDirNW = "\001h\001y\031\020";
    var windArrowDirNNW = "\001h\001y\031\031\020";

   	// Color codes for Synchronet BBS
	var gy = "\1n\001w"; //Synchronet Ctrl-A Code for Normal White (which looks gray)
	var wh = "\001w\1h"; //Synchronet Ctrl-A Code for High Intensity White
	var drkyl = "\001n\001y"; //Synchronet Ctrl-A Code for Dark (normal) Yellow
	var yl = "\001y\1h"; //Synchronet Ctrl-A Code for High Intensity Yellow
	var drkbl = "\001n\001b"; //Synchronet Ctrl-A Code for Dark (normal) Blue
	var bl = "\001b\1h"; //Synchronet Ctrl-A Code for High Intensity Blue
	var drkrd = "\001n\001r"; //Synchronet Ctrl-A Code for Dark (normal) Red
	var rd = "\001r\1h"; //Synchronet Ctrl-A Code for High Intensity Red
	var drkcy = "\001n\001c"; //Synchronet Ctrl-A Code for Dark (normal) Cyan
	var cy = "\001c\1h"; //Synchronet Ctrl-A Code for High Intensity Cyan

	LocationHeader = "Your Location: ";
	ConditionsHeader = "Current Conditions: ";
	TempHeader = "Temp: ";
	SunHeader = "Sunrise/Sunset: ";
	LunarHeader = "Lunar Phase: ";
	WindHeader = "Wind: ";
	UVHeader = "UV Index: ";
	AlertExpires = "Expires ";
	ReadAlert = "Read the Full Alert";
	degreeSymbol = "\370"; //ANSI/CP437 Degree Symbol

    var locationCity = response.location.name;
    var locationState = response.location.region;
    var weatherCountry = response.location.country;
    var currentWindCompass = response.current.wind_dir;

    // Starting to add icons to the display
    // 4/11/2023 - need to convert icon url from weatherapi.com to ASC version
    var daynighticon = cu.current_observation.icon_url; //the icon_url has a default .gif icon that includes day vs. night
    var daynighticon2 = daynighticon.slice(0,-4); //remove .gif extension
    var daynighticon3 = daynighticon2.replace(/http:\/\/icons.wxug.com\/i\/c\/k\//i, ""); //remove url leading up to day or night icon name
    
    //use the icon line from the JSON response as a backup icon name, however this is always Day
    // icons and never Night icons so it is not preferable, but again is just a backup.
    var dayicononly = cu.current_observation.icon; 


    console.clear();
    if(console.term_supports(USER_ANSI)) 
    {
        console.gotoxy(20,2);
        console.putmsg(wh + LocationHeader + yl + locationCity+", "+locationState);
        console.gotoxy(20,3);
        console.putmsg(wh + ConditionsHeader + yl + response.current.condition.text);
        console.gotoxy(20,4);
        //USA gets Fahrenheit then Celsius, everyone else gets Celsius then Fahrenheit
        if (weatherCountry == "USA") {
            console.putmsg(wh + TempHeader + yl + Math.round(response.current.temp_f) + degreeSymbol + " F (" + Math.round(response.current.temp_c) + degreeSymbol + " C)");
        } else {
            console.putmsg(wh + TempHeader + yl + Math.round(response.current.temp_c) + degreeSymbol + " C (" + Math.round(response.current.temp_f) + degreeSymbol + " F)");
        }
        console.gotoxy(20,5);
        console.putmsg(wh + SunHeader + yl + response.forecast.forecastday[0].astro.sunrise + " / " + yl + response.forecast.forecastday[0].astro.sunset);
        console.gotoxy(20,6);
        console.putmsg(wh + LunarHeader + yl + response.forecast.forecastday[0].astro.moon_phase);
        console.gotoxy(20,7);
        console.putmsg(wh + WindHeader + yl + response.current.wind_mph+" MPH \t");
        if (currentWindCompass == "N" | currentWindCompass == "North") {
            console.putmsg(WindHeader+" " + windArrowDirN);
        } else if (currentWindCompass == "NNE") {
            console.putmsg(WindHeader+" " + windArrowDirNNE);
        } else if (currentWindCompass == "NE") {
            console.putmsg(WindHeader+" " + windArrowDirNE);
        } else if (currentWindCompass == "ENE") {
            console.putmsg(WindHeader+" " + windArrowDirENE);
        } else if (currentWindCompass == "E" | currentWindCompass == "East") {
            console.putmsg(WindHeader+" " + windArrowDirE);
        } else if (currentWindCompass == "ESE") {
            console.putmsg(WindHeader+" " + windArrowDirESE);
        } else if (currentWindCompass == "SE") {
            console.putmsg(WindHeader+" " + windArrowDirSE);
        } else if (currentWindCompass == "SSE") {
            console.putmsg(WindHeader+" " + windArrowDirSSE);
        } else if (currentWindCompass == "S" | currentWindCompass == "South") {
            console.putmsg(WindHeader+" " + windArrowDirS);
        } else if (currentWindCompass == "SSW") {
            console.putmsg(WindHeader+" " + windArrowDirSSW);
        } else if (currentWindCompass == "SW") {
            console.putmsg(WindHeader+" " + windArrowDirSW);
        } else if (currentWindCompass == "WSW") {
            console.putmsg(WindHeader+" " + windArrowDirWSW);
        } else if (currentWindCompass == "W" | currentWindCompass == "West") {
            console.putmsg(WindHeader+" " + windArrowDirW);
        } else if (currentWindCompass == "WNW") {
            console.putmsg(WindHeader+" " + windArrowDirWNW);
        } else if (currentWindCompass == "NW") {
            console.putmsg(WindHeader+" " + windArrowDirNW);
        } else if (currentWindCompass == "NNW") {
            console.putmsg(WindHeader+" " + windArrowDirNNW);
        } else {
            console.putmsg("");
        }

        console.gotoxy(20,8);
        console.putmsg(wh + UVHeader + yl + response.current.uv);
    
        //Forecast summary
        for (i = 0; i<3; i++)
        {
            console.gotoxy(4+i*19,11);
            console.putmsg(wh + response.forecast.forecastday[i].date);
            console.gotoxy(4+i*19,12);
            var dailyConditions = response.forecast.forecastday[i].day.condition.text;
            if(dailyConditions.length > 11){dailyConditions=dailyConditions.substring(0,11);}
            console.putmsg(yl + dailyConditions);
            console.gotoxy(4+i*19,13);
            /*if (weatherCountry == "USA") {
                var low = "Low  ";
                var dailyLowLen = 5 - cu.forecast.forecastday[i].low.fahrenheit.length;
                var dailyLow = Math.round(response.forecast.forecastday[i].day.mintemp_f);
                var high = "High ";
                var dailyHighLen = 5 - cu.forecast.simpleforecast.forecastday[i].high.fahrenheit.length;
                var dailyHigh = Math.round(response.forecast.forecastday[i].day.maxtemp_f);
            } else {
                var low = "Low  ";
                var dailyLowLen = 5 - cu.forecast.simpleforecast.forecastday[i].low.celsius.length;
                var dailyLow = Math.round(response.forecast.forecastday[i].mintemp_c);
                var high = "High ";
                var dailyHighLen = 5 - cu.forecast.simpleforecast.forecastday[i].high.celsius.length;
                var dailyHigh = Math.round(response.forecast.forecastday[i].maxtemp_c);
            }*/
            var dailyHigh = "High ";
            var dailyLow = "Low  ";
            console.putmsg(bl + dailyLow + wh + " / " + rd + dailyHigh);
            console.gotoxy(4+i*19,14);
            //US gets Fahrenheit, everyone else gets Celsius
            if (weatherCountry == "USA") {
                console.putmsg(bl + Math.round(response.forecast.forecastday[i].day.mintemp_f)
                    + wh + " / " + rd + Math.round(response.forecast.forecastday[i].day.maxtemp_f) + gy + " " + degreeSymbol + "F");
            } else {
                console.putmsg(bl + Math.round(response.forecast.forecastday[i].day.mintemp_c)
                    + wh + " / " + rd + Math.round(response.forecast.forecastday[i].day.maxtemp_c) + gy + " " + degreeSymbol + "C");
            }
            }
    }
    else
    { 	
        write("\r\n                   " + LocationHeader + locationCity+", "+locationState + "\r\n");
        write("                   " + ConditionsHeader + response.current.condition.text + "\r\n");
        //US gets Fahrenheit then Celsius, everyone else gets Celsius then Fahrenheit
        if (weatherCountry == "US") {
            write("                   " + TempHeader + response.current.temp_f + " F (" + response.current.temp_c + " C)" + "\r\n");
        } else {
            write("                   " + TempHeader + response.current.temp_c + " C (" + response.current.temp_f + " F)" + "\r\n");
        }
        write("                   " + SunHeader + response.forecast.forecastday[0].astro.sunrise + " / " + response.forecast.forecastday[0].astro.sunset + "\r\n");
        write("                   " + LunarHeader + response.forecast.forecastday[0].astro.moon_phase + "\r\n");
        write("                   " + WindHeader + response.current.wind_mph + "/ " + currentWindCompass + "\r\n");
        write("                   " + UVHeader + response.current.uv + "\r\n\r\n");

        //Forecast Summary
        for (i = 0; i < 3; i++) 
        {
            write("         " + response.forecast.forecastday[i].date + ": ");
            var dailyConditions = response.forecast.forecastday[i].condition.text;
            write(dailyConditions + " | ");
            //US gets Fahrenheit, everyone else gets Celsius
            if (weatherCountry == "USA") 
            {
                write("Lo " + response.forecast.forecastday[i].day.mintemp_f
                    + " / Hi " + response.forecast.forecastday[i].day.maxtemp_f + " F" + "\r\n");
            }
            else 
            {
                write("Lo " + response.forecast.forecastday[i].day.mintemp_c
                    + " / Hi " + response.forecast.forecastday[i].day.maxtemp_c + " C" + "\r\n");
            }
        }

        }
        
}


var userLoc = getInfo();
var wthrResp = callWeatherAPI(wungrndAPIkey,userLoc);
processWeatherData(wthrResp);
console.putmsg("\n\n");
console.pause();
