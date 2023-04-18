## Synopsis

**SyncWeather** is a javascript weather appplication designed to run on a Synchronet Bulletin Board System (BBS). It is based off of syncWXRemix which is the original [weather.js](https://github.com/KenDB3/syncWXremix) file designed by KenDB3. Weather data comes from [WeatherAPI](https://weatherapi.com). The icon files are designed in special coding using ASCII 1 character (Control-A) and then a letter to define a color or special property (ie. blinking text) which is similar to ANSI specifications. Reference for Synchronet Ctrl-A can be found [here](http://wiki.synchro.net/custom:ctrl-a_codes). The icon designs were inspired by a weather app called [wego](https://github.com/schachmat/wego), which was designed by Markus Teich. Markus was contacted, and his contribution/inspiration is mentioned in the (ISC) license in the "icons" folder. 

## Screenshots 
Not Available

## Code Example
The majority of what is happening in this app is based off of one query. Note, it combines four queries into one: conditions, forecast, astronomy, and alerts. It also adds through the "WXlang" variable the possibility for results in over 80 languages.

```
function callWeatherAPI(key,loc,day)
{
  // Setup request to get weather for user's zip code or system zip code
  var req = new HTTPRequest();
  var resp = req.Get("http://api.weatherapi.com/v1/forecast.json?key="+key+"&q="+loc+"&days="+day+"");
  var response = JSON.parse(resp); // Parse the JSON data returned
  return response;
}
```

## Installation
Check out [sysop.txt](https://github.com/mhansel7399/SyncWeather/blob/main/sysop.txt) for full installation instructions.

## License

This project is under ISC License, and so is the artwork in the "icons" folder. 
Please see the [LICENSE](https://github.com/KenDB3/syncWXremix/blob/master/LICENSE) file for the project, and the [LICENSE](https://github.com/KenDB3/syncWXremix/blob/master/icons/LICENSE) file for the icons.

## Revision History (change log)
