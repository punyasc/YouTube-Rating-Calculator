// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        //myApp.alert('Here comes About page');
    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page');
})


function getList() {
    $("#tl").empty();
    myApp.showPreloader();
    var channel_name = $("#channelfield").val();
    var maxResults = parseInt($("#numvidsfield").val());
    if (isNaN(maxResults) || maxResults < 1) {
        maxResults = 10;
    }
    var ordering = $("#sortbyfield").val();
    var channelReqByNameURL = "https://www.googleapis.com/youtube/v3/channels?key=AIzaSyC8xUZuOyRsWFNDl0V6MCKtnxkx4kr38Vo&forUsername=" + channel_name + "&part=id";
    var channel_id = "";
    var dataReceived = false;
    $.ajax({
        url: channelReqByNameURL,
        async: true,
        dataType: 'json',
        success: function (response) {
            channel_id = response.items[0].id;
            var videoListReqByIdURL = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyC8xUZuOyRsWFNDl0V6MCKtnxkx4kr38Vo&channelId=" + channel_id + "&part=id&maxResults=" + maxResults + "&order=" + ordering;
            var videoArray = {};
            $.ajax({
                url: videoListReqByIdURL,
                async: true,
                dataType: 'json',
                success: function (response) {
                    videoArray = response.items;
                    var maxItems = videoArray.length;
                    
                    var itemCount = 0;
                    
                    function getNextItem () {
                        var singleVideoRequestURL = "https://www.googleapis.com/youtube/v3/videos?id=" + videoArray[itemCount].id.videoId + "&key=AIzaSyC8xUZuOyRsWFNDl0V6MCKtnxkx4kr38Vo&part=statistics,snippet";   
                        $.ajax({
                                url: singleVideoRequestURL, 
                                async: true,
                                dataType: 'json',
                                success: function (response) {
                                    if (itemCount < maxItems) {
                                        
                                        
                                        var videoLikes = response.items[0].statistics.likeCount;
                                        var videoDislikes = response.items[0].statistics.dislikeCount;
                                        var videoRating = Math.round(parseInt(videoLikes)/(parseInt(videoLikes) + parseInt(videoDislikes)) * 100);
                                        var videoTitle = response.items[0].snippet.title;
                                        var videoDate = (response.items[0].snippet.publishedAt);
                                        var newVideoDate = videoDate.substring(5, 10) + "-" + videoDate.substring(0, 4);

                                        var listItem = document.createElement('div');
                                        listItem.className = 'timeline-item';
                                        document.getElementById('tl').appendChild(listItem);
                                        var listItemRating = document.createElement('h2');
                                        listItemRating.className = 'timeline-item-date';
                                        var listItemRatingText = document.createTextNode(videoRating + "%");
                                        listItemRating.appendChild(listItemRatingText);
                                        if (videoRating > 90) {
                                            listItemRating.style.color = "green";
                                        } else {
                                            listItemRating.style.color = "red";
                                        }
                                        listItem.appendChild(listItemRating);

                                        var listItemDivider = document.createElement('div');
                                        listItemDivider.className = "timeline-item-divider";
                                        listItem.appendChild(listItemDivider);

                                        var listItemContent = document.createElement('div');
                                        listItemContent.className = "timeline-item-content";
                                        var listItemInner = document.createElement('div');
                                        listItemInner.className = "timeline-item-inner";
                                        listItemContent.appendChild(listItemInner);

                                        var listItemTitle = document.createElement('div');
                                        listItemTitle.className = "timeline-item-title";
                                        var listItemTitleText = document.createTextNode(videoTitle);
                                        listItemTitle.appendChild(listItemTitleText);
                                        listItemInner.appendChild(listItemTitle);
                                        var listItemSubtitle = document.createElement('div');
                                        listItemSubtitle.className = "timeline-item-subtitle";
                                        var listItemSubtitleText = document.createTextNode(newVideoDate);
                                        listItemSubtitle.appendChild(listItemSubtitleText);
                                        listItemInner.appendChild(listItemSubtitle);
                                        listItem.appendChild(listItemContent); 
                                        itemCount++;
                                        getNextItem();
                                    }
                                }
                            });
                    }
                    getNextItem();
                    myApp.hidePreloader();
                } 
            });
        }
    });
}

$$('.form-to-data').on('click', function(){
    getList();
}); 

$$('#clearbutton').on('click', function(){
    $("#tl").empty();
}); 

$("#my-form").on("submit", function(e) {
    getList();
});

document.getElementById('channelfield').onkeydown = function(e){
   if(e.keyCode == 13){
     getList();
   }
};

/*
    var video_id = $("#urlfield").val().split('v=')[1];
    console.log("video id = " + video_id);
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition); 
    }
    var getFromRequest;
    var videoReqByIdUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + video_id + "&key=AIzaSyC8xUZuOyRsWFNDl0V6MCKtnxkx4kr38Vo&part=statistics";
    $.ajax({
        url: videoReqByIdUrl,
        async: false,
        dataType: 'json',
        success: function (response) {
                // do stuff with response.
            getFromRequest = response.items[0].statistics.likeCount;
        }
    });

    console.log("got from request: "  + getFromRequest);
    */