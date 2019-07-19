$(function() 
{
	 $("#infoBox")
	.css( 
	{
	   "background":"rgba(255,255,255,0.5)"
	})
	.dialog({ autoOpen: false, 
		show: { effect: 'fade', duration: 500 },
		hide: { effect: 'fade', duration: 500 } 
	});
	
	 $("#infoButton")
       .text("") // sets text to empty
	.css(
	{ "z-index":"2",
	  "background":"rgba(0,0,0,0)", "opacity":"0.9", 
	  "position":"absolute", "top":"8px", "left":"14px"
	}) // adds CSS
    .append("<img width='32' height='32' src='../assets/textures/icon-info.png'/>")
    .button()
	.click( 
		function() 
		{ 
			$("#infoBox").dialog("open");
		});


	 $("#color")
	.css({"z-index":"2", "background":"rgba(0,0,0,0)", "opacity":"0.9", "position":"absolute", "top":"8px", "right":"14px"})
	.append("<img width='32' id='red' height='32' src='../assets/textures/icon-red.png'/>")
    .append("<img width='32' id='green' height='32' src='../assets/textures/icon-green.png'/>")
    .append("<img width='32' id='blue' height='32' src='../assets/textures/icon-blue.png'/>")

	    $("#red").click(function(){
	    	selColor = 0xff0000;
	    });

	    $("#green").click(function(){
	    	selColor = 0x00ff00;
	    });

	    $("#blue").click(function(){
	    	selColor = 0x0000ff;
	    });

});