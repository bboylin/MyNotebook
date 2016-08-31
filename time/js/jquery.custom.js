$(document).ready(function(){

    /* Tooltip */
    $('#social-icons li a').tooltip();

    /* Counter */
    var finished = false;
    var toDate = new Date('2017/03/01 00:00:00'); // Counter end date/time.

    function callback(event) {
      $this = $(this);
    	switch(event.type) {
    		case "seconds":
    		case "minutes":
    		case "hours":
    		case "days":
    		case "weeks":
    		case "daysLeft":
    		  $this.find('span#'+event.type).html(event.value);
    		  if(finished) {
    		    $this.fadeTo(0, 1);
    		    finished = false;
    		  }
    			break;
    		case "finished":
        $this.fadeTo('slow', .5);
        finished = true;
    			break;
    	}
    }

    $('div#countdown').countdown(toDate, callback);

    /* Google Map */
    $('#subscribe').on('shown', function () {
        var gMap = $('#map_canvas').gmap({'center': '27.7166667,85.3166667', 'zoom': 8, 'disableDefaultUI': true, 'callback': function() {
    		this.addMarker({'position': '27.7166667,85.3166667' });
            this.addMarker({'position': '27.672887,85.430031' });
    	}});
    });

});
