//declare global array and global variable city so all functions can access
var recentSearch =[]
var city

//when page loads, dislays the last city chosen before reload 
//and makes the now empty array the stored array
load();
function load(){
    var firstCity = JSON.parse(localStorage.getItem("lastCity"));
    city = firstCity;
    getAPIday(city);
    
    var cityList = JSON.parse(localStorage.getItem("RecentList"));
    console.log(cityList);
    if(cityList === null){
    
    }
    else{
    recentSearch = cityList;
    searchHistoryButtons();
    }
}

//compare searched city the the array of recently searched cities
$("#search").on("click", function(event){
    event.preventDefault();
    city = $("input").val().toLowerCase().trim();
    
    if(city === ""){
        alert("Must enter a City");
        return
    }
    
    if(recentSearch.length === 8){
        recentSearch.shift();        
    }
        //and change the array accordingly
        if(recentSearch.indexOf(city) === -1){
            recentSearch.push(city);
        }
        else{
            reorganizeButtons(city);
        }
            
getAPIday(city);
searchHistoryButtons();
localStorage.setItem("RecentList", JSON.stringify(recentSearch));
$("input").val("");
});

//take the text from button pushed and run functions accordingly
$("#searchHistory").on("click", "button", function(event){
    event.preventDefault();

    city = $(this).text();
    reorganizeButtons(city);
    getAPIday(city);
})

//changes the array according to the most recent city chosen and stores the array
function reorganizeButtons(){
    recentSearch.splice(recentSearch.indexOf(city), 1);
    recentSearch.push(city);
    searchHistoryButtons();
    localStorage.setItem("RecentList", JSON.stringify(recentSearch));
}

//clears out the buttons and generates new buttons according to the current array
function searchHistoryButtons(){
    $("#searchHistory").empty();

    $.each(recentSearch, function(){
       $('<button type="button" class="list-group-item cities list-group-item-action">').text(this).prependTo($("#searchHistory"));
    });
}

//retrieve the API information and make html including that information
function getAPIday(city){
    $(".jumbotron").css("padding", "15px");
    localStorage.setItem("lastCity", JSON.stringify(city));


    var APIKey = "944757e03c4c560a64961cae626d9729";
    var queryURL = "https:api.openweathermap.org/data/2.5/weather?q=" + city +"&appid="+ APIKey;
    
    $.ajax({
        url: queryURL,
        method: "GET"
    
    }).then(function(currentWeather){

      var long = currentWeather.coord.lon;
      var lat = currentWeather.coord.lat;

    $.ajax({
        url :"https:api.openweathermap.org/data/2.5/onecall?" + "lat=" + lat + "&lon=" + long + "&exclude=hourly,minutely&appid=" + APIKey,
        method: "GET"
    })
    
    .then(function(fiveDayForecast){
        
        //declare variables for certain API information
        var tempF = (fiveDayForecast.current.temp - 273.15) * 1.80 + 32;
        var UV = fiveDayForecast.current.uvi ;
        var icon ="http://openweathermap.org/img/wn/" + fiveDayForecast.current.weather[0].icon +"@2x.png";
        //empty the divs holding the previous city's info
        $("#today").empty();
        $("#icon-today").empty();
        //create current weather html to reflect the city selected
        $("<h1>").text(city).appendTo($("#today"));
        $("<h4>").text(moment().format("dddd MMMM Do YYYY")).appendTo($("#today"));
        $("<img>").attr("src",icon).appendTo($("#icon-today"));
        $("<p class='temp'>").text("Temperature: " + tempF.toFixed(1)).appendTo($("#today"));
        $("<p class='humid'>").text("Humidity: " + fiveDayForecast.current.humidity + "%").appendTo($("#today"));
        $("<p class='wind'>").text("Wind Speed: " + fiveDayForecast.current.wind_speed + "mph").appendTo($("#today"));
        $("<p class='uv'>").text("UV Index: " + UV ).appendTo($("#today"));
        
        
        
        //change the css of the uv index based on severity
        if(UV<3){
            $(".uv").css("background-color", "green");
        }
        else if((UV>3) && (UV<5)){
            $(".uv").css("background-color", "yellow");
        }
        else if((UV>5) && (UV<8)){
            $(".uv").css("background-color", "orange");
        }
        else if((UV>8) && (UV<10)){
            $(".uv").css("background-color", "red");
        }
        else{
            $(".uv").css("background-color", "purple");
            $(".uv").css("color", "white");
        }


        //empty the card bodies holding the previous city's info
        $(".card-body").empty();
        //loop over card bodies
        $(".card-body").each(function(){
            //declare variable to determine which part of the API to use
            var cardData =$(this).attr("data-day");
            var tempF = (fiveDayForecast.daily[cardData].temp.max - 273.15) * 1.80 + 32;
            var forecastIcon = "http://openweathermap.org/img/wn/" + fiveDayForecast.daily[cardData].weather[0].icon +"@2x.png";
            //generate html for the current card body that reflects the selected city
            $("<img>").attr("src", forecastIcon).appendTo($(this));
            $("<p class='card-text'>").text("Temp: " + tempF.toFixed(1)).appendTo($(this));
            $("<p class='card-text'>").text("Humidity: " + fiveDayForecast.daily[cardData].humidity + "%").appendTo($(this));
            //loop over the header of each card body
            $(".date").each(function(){
                if(cardData === $(this).attr("data-day")){
                    //assign the date for the next five days
                    $(this).text(moment().add(cardData, 'days').format("L"));
                }

            });
            
        });    
    });
    });
}
