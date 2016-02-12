This is a specifications sheet for a Favorite Neighborhood Spots App

Features:
	Full page map (Google Maps API)
	Local storage of map
	Ability to place pins of varying types on the map
	Hook those pins into other APIs (Yelp, TripAdvisor, personal notes)
	List view of pins
	Search pins and map

Specifications:
	Framework: Knockout
	Libraries: jQuery
	APIs: Google Maps, TripAdvisor
	Views: Map View, Menu View, Search View, List View
	Model: Marker, Markers
	ViewModel: receives API data and relays that to the model, sends the relevant model to the view

	Files:
		js/ 
			lib/
				knockout
				jquery
				perfmatters
			app.js
			?model.js
			?view.js
			?viewmodel.js
		css/ 
			main.css
			** various media css files **
		images/
			** icons and image resources **

		index.html
		README

Tools:
	Bower:
		jQuery
		Knockout?
	AJAX:
		API calls
	Grunt:
		Image processing
		Minification
	Git: 
		Track changes
	Pomodoro:
		Work time!