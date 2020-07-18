var recentSearch =[]
var city

$("#search").click(function(event){
    event.preventDefault()
    
    city = $("input").val().toLowerCase().trim()
        if(recentSearch.length === 8){
            recentSearch.shift()
            console.log(recentSearch)
        }
        if(recentSearch.indexOf(city) === -1){
            recentSearch.push(city);
        }
        else if(recentSearch.indexOf(city) !== -1){
            //recentSearch.splice(recentSearch.indexOf(city), 1)
            //recentSearch.push(city)
        }
            localStorage.setItem("RecentList", JSON.stringify(recentSearch))
            getAPIday(city)
            recentSearchButtons()
})
load()
function load(){
    var firstCity = JSON.parse(localStorage.getItem("lastCity"))
    city = firstCity
    getAPIday(city)
    renderRencentSearch()
}

function renderRencentSearch(){
    var cityList = JSON.parse(localStorage.getItem("RecentList"))
    console.log(cityList)
    if(cityList === null){

    }
    else{
    recentSearch = cityList
    console.log(recentSearch)
    recentSearchButtons()
    }
}
function recentSearchButtons(){
    $("#searched").empty()
    $.each(recentSearch, function(){
        $('<button type="button" class="list-group-item cities list-group-item-action">').text(this).attr("id", this).prependTo($("#searched"))
    })

}

$(".cities").click(function(){
    console.log("click")
   // $(this).prependTo("#searched")
    city = $(this).text()
    getAPIday(city)
})

function getAPIday(city){
    $(".jumbotron").css("padding", "15px")
    localStorage.setItem("lastCity", JSON.stringify(city))
    var APIKey = "944757e03c4c560a64961cae626d9729";
    
    var queryURL = "https:api.openweathermap.org/data/2.5/weather?q=" + city +"&appid="+ APIKey;
    
    $.ajax({
        url: queryURL,
        method: "GET"
        //if response is invalid/null then delete that button and alert("not a valid entry")
    
    }).then(function(currentWeather){

      var long = currentWeather.coord.lon
      var lat = currentWeather.coord.lat

    $.ajax({
        url :"https:api.openweathermap.org/data/2.5/onecall?" + "lat=" + lat + "&lon=" + long + "&exclude=hourly,minutely&appid=" + APIKey,
        method: "GET"
    })
    
    .then(function(fiveDayForecast){
        console.log(fiveDayForecast)
        //current day
        var tempF = (fiveDayForecast.current.temp - 273.15) * 1.80 + 32;
        var UV = fiveDayForecast.current.uvi 
        var icon ="http://openweathermap.org/img/wn/" + fiveDayForecast.current.weather[0].icon +"@2x.png"
        
        $("#today").empty()
        $("#icon-today").empty()

        $("<h1>").text(city).appendTo($("#today"))
        $("<h4>").text(moment().format("dddd MMMM Do YYYY")).appendTo($("#today"))
        $("<img>").attr("src",icon).appendTo($("#icon-today"))
        $("<p class='temp'>").text("Temperature: " + tempF.toFixed(1)).appendTo($("#today"))
        $("<p class='humid'>").text("Humidity: " + fiveDayForecast.current.humidity + "%").appendTo($("#today"))
        $("<p class='wind'>").text("Wind Speed: " + fiveDayForecast.current.wind_speed + "mph").appendTo($("#today"))
        $("<p class='uv'>").text("UV Index: " + UV ).appendTo($("#today"))

        if(UV<3){
            $(".uv").css("background-color", "green")
        }
        else if((UV>3) && (UV<5)){
            $(".uv").css("background-color", "yellow")
        }
        else if((UV>5) && (UV<8)){
            $(".uv").css("background-color", "orange")
        }
        else if((UV>8) && (UV<10)){
            $(".uv").css("background-color", "red")
        }
        else{
            $(".uv").css("background-color", "purple")
            $(".uv").css("color", "white")
        }
        //current day

        //five day
        $(".card-body").empty()
        $(".card-body").each(function(){

            var cardData =$(this).attr("data-day")
            var tempF = (fiveDayForecast.daily[cardData].temp.max - 273.15) * 1.80 + 32;
            var forecastIcon = "http://openweathermap.org/img/wn/" + fiveDayForecast.daily[cardData].weather[0].icon +"@2x.png"

            $("<img>").attr("src", forecastIcon).appendTo($(this))
            $("<p class='card-text'>").text("Temp: " + tempF.toFixed(1)).appendTo($(this))
            $("<p class='card-text'>").text("Humidity: " + fiveDayForecast.daily[cardData].humidity + "%").appendTo($(this))
            
            $(".date").each(function(){
                if(cardData === $(this).attr("data-day")){
                    $(this).text(moment().add(cardData, 'days').format("L"))
                }

            })
            
        })

            
        
        
    })
    });
}
