// Inspired by SyncWX 
// Modified to use weatherapi.com 
// This version is used as a "logon" option 
// Add it under External programs as its own external program
// You will have to copy it to its own folder in your /sbbs/xtrn/ folder
// Execute on event - Logon, only
// This will get it to execute at logon only and not show in the 
// external programs of your BBS

log(user.ip_address); // for error tracking purposes - keeps the user's IP

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

// Get data from modopts.ini
var wungrndAPIkey = opts.wungrndAPIkey; // This will pull the key from the modopts.ini file - free weatherapi.com API key
//var weatherIcon = opts.weathericon_ext; // Now defined in the file /sbbs/ctrl/modopts.ini - see the sysop.txt instructions.
var tempLocation = user.zipcode; // Pull user's zip code if available
var days = opts.wthrDays; // Now defined in the file /sbbs/ctrl/modopts.ini
var fallback = opts.fallback; // Now defined in the file /sbbs/ctrl/modopts.ini

// Get user's zip code
// This code is used at LOGON
function getInfo()
{
    if(tempLocation == "") // Check to see if the user has a zip code entered
    {
        var wthrLocation = fallback; // if not, set to system default zip code
    }
    else
    {
        var wthrLocation = tempLocation; // send user's zip code
    }
    return wthrLocation;
}

// This code is used when running as an external app
function askZipCode()
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
function callWeatherAPI(key,loc,day)
{
    // Setup request to get weather for user's zip code or system zip code
    var req = new HTTPRequest();
    var resp = req.Get("http://api.weatherapi.com/v1/forecast.json?key="+key+"&q="+loc+"&days="+day+"");
    var response = JSON.parse(resp); // Parse the JSON data returned
    return response;
}

function processWthrIcon(conditionCode,dayNightVal)
{
    // Matching weatherapi.com codes to icons
	switch(conditionCode)
	{
		case 1000:
            {
                if(dayNightVal == 'day')
                {
                    weatherIcon = "sunny.asc";
                }
                else
                {
                    weatherIcon = "clear.asc";
                }
                return weatherIcon;
            }
		case 1003:
			{
                weatherIcon = "partlycloudy.asc";
			    return weatherIcon;
            }
        case 1006:
            {
                weatherIcon = "cloudy.asc";
                return weatherIcon;
            }
        case 1009:
			{
                weatherIcon = "cloudy.asc";
                return weatherIcon;
            }
        case 1030: case 1063:
            {
                weatherIcon = "chancerain.asc";
                return weatherIcon;
            }
        case 1066:
            {
                weatherIcon = "chancesnow.asc";
                return weatherIcon;
            }
        case 1069: case 1072: case 1168:
            {
                weatherIcon = "chancesleet.asc";
                return weatherIcon;
            }
        case 1087:
            {
                weatherIcon = "chancetstorms.asc";
                return weatherIcon;
            }
        case 1114: case 1117: case 1210: case 1213: case 1216: case 1219: case 1222: case 1225: case 1237: case 1255: case 1258: case 1261: case 1264:
            {
                weatherIcon = "snow.asc";
                return weatherIcon;
            }
        case 1135: case 1147:
            {
                weatherIcon = "fog.asc";
                return weatherIcon;
            }
        case 1150: case 1153: case 1183: case 1186: case 1189: case 1192: case 1195: case 1240: case 1243: case 1246:
			{
                weatherIcon = "rain.asc";
                return weatherIcon;
            }
        case 1171: case 1198: case 1201: case 1204: case 1207: case 1249: case 1252:
            {
                weatherIcon = "sleet.asc";
                return weatherIcon;
            }
        case 1273: case 1276: case 1279: case 1282:
            {
                weatherIcon = "tstorms.asc";
                return weatherIcon;
            }
		default:
			{
                weatherIcon = "unknown.asc"
			    return weatherIcon;
            }
	}
	return weatherIcon;
}

// Call the weather display function
function processWeatherData(response,day)
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

    // Header definition
    LocationHeader = "Your Location: ";
	ConditionsHeader = "Current Conditions: ";
	TempHeader = "Temp: ";
	SunHeader = "Sunrise/Sunset: ";
	LunarHeader = "Lunar Phase: ";
	WindHeader = "Wind: ";
	UVHeader = "UV Index: ";
	AlertExpires = "Expires ";
	degreeSymbol = "\370"; //ANSI/CP437 Degree Symbol

    // Setting some basic variables 
    // Could probably change a lot of the calls in the display to variables
    var locationCity = response.location.name;
    var locationState = response.location.region;
    var weatherCountry = response.location.country;
    var currentWindCompass = response.current.wind_dir;

    // Creating informaiton to match code to ASCII icons
    var currentConditionCode = response.current.condition.code;	// get current condition code 
    var daynighticon = response.current.condition.icon; //the icon_url has a default .png icon that includes day vs. night
    var daynighticon2 = daynighticon.slice(0,-7); //remove filename and .png extension
    var daynighticon3 = daynighticon2.replace(/\/\/cdn.weatherapi.com\/weather\/64x64/i, ""); //remove url leading up to day or night
    var daynighticon4 = daynighticon3.replace(/\//gi,""); // strips away any remaining characters - leaving day or night

    var weatherIconFile = processWthrIcon(currentConditionCode,daynighticon4); // calls function to match icon and code

    // Clear screen and display data
    console.clear();

    // Checks if there use is using ANSI
    if(console.term_supports(USER_ANSI)) 
    {
        if (!file_exists(js.exec_dir + "icons/" + weatherIconFile)) 
        {
            var daynighticon4 = "";
        }
        if (!file_exists(js.exec_dir + "icons/" + weatherIconFile)) 
        {
            var dayicononly = "";
        }
        if (daynighticon3 != "") 
        {
            console.printfile(js.exec_dir + "icons/" + weatherIconFile);
        } 
        else if (dayicononly != "") 
        {
            console.printfile(js.exec_dir + "icons/" + weatherIconFile);
        } 
        else 
        {
            console.printfile(js.exec_dir + "icons/" + weatherIconFile);
        }
    //Force usage of .asc icons for NON-ANSI Terminal Users
    } else 
    {
        if (!file_exists(js.exec_dir + "icons/" + weatherIconFile)) {
            var daynighticon3 = "";
        }
        if (!file_exists(js.exec_dir + "icons/" + weatherIconFile)) {
            var dayicononly = "";
        }
        if (daynighticon3 != "") {
            console.printfile(js.exec_dir + "icons/" + weatherIconFile);
        } else if (dayicononly != "") {
            console.printfile(js.exec_dir + "icons/" + weatherIconFile);
        } else {
            console.printfile(js.exec_dir + "icons/" + weatherIconFile);
        }
    }

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
        for (i = 0; i < day; i++)
        {
            console.gotoxy(4+i*19,11);
            console.putmsg(wh + response.forecast.forecastday[i].date);
            console.gotoxy(4+i*19,12);
            var dailyConditions = response.forecast.forecastday[i].day.condition.text;
            if(dailyConditions.length > 11){dailyConditions=dailyConditions.substring(0,11);}
            console.putmsg(yl + dailyConditions);
            console.gotoxy(4+i*19,13);
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
        if (weatherCountry == "USA") {
            write("                   " + TempHeader + response.current.temp_f + " F (" + response.current.temp_c + " C)" + "\r\n");
        } else {
            write("                   " + TempHeader + response.current.temp_c + " C (" + response.current.temp_f + " F)" + "\r\n");
        }
        write("                   " + SunHeader + response.forecast.forecastday[0].astro.sunrise + " / " + response.forecast.forecastday[0].astro.sunset + "\r\n");
        write("                   " + LunarHeader + response.forecast.forecastday[0].astro.moon_phase + "\r\n");
        write("                   " + WindHeader + response.current.wind_mph + "/ " + currentWindCompass + "\r\n");
        write("                   " + UVHeader + response.current.uv + "\r\n\r\n");

        //Forecast Summary
        for (i = 0; i < day; i++) 
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

if(bbs.node_action == NODE_LOGN)
{
    var userLoc = getInfo();
}
else
{
    var userLoc = askZipCode();
}
//var userLoc = getInfo();
var wthrResp = callWeatherAPI(wungrndAPIkey,userLoc,days);
processWeatherData(wthrResp,days);
console.putmsg("\n\n");
console.pause();
