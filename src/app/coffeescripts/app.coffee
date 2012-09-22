define([
  'Kendo'
  'Glfx'
  'mylibs/camera/camera'
  'mylibs/bar/bottom'
  'mylibs/bar/top'
  'mylibs/bar/confirm'
  'mylibs/preview/preview'
  'mylibs/full/full'
  'mylibs/postman/postman'
  'mylibs/utils/utils'
  'mylibs/gallery/gallery'
  'mylibs/gallery/details'
  'mylibs/events/events'
  'mylibs/file/filewrapper'
  'mylibs/settings/settings'
  'mylibs/assets/assets'
  'libs/record/record'
], (kendo, glfx, camera, bottom, top, confirm, preview, full, postman, utils, gallery, details, events, filewrapper, settings, assets, record ) ->
	
	initAbout = (selector) ->
		about = $(selector)
		aboutView = selector
		oldView = "#home"

		$.subscribe '/menu/click/chrome-cam-about-menu', ->
			$.publish "/postman/deliver", [ false, "/menu/enable" ]
			oldView = window.APP.app.view().id
			window.APP.app.navigate aboutView
		
		about.find("button").click ->
			$.publish "/postman/deliver", [ true, "/menu/enable" ]
			window.APP.app.navigate oldView

		about.find("a").click ->
			$.publish "/postman/deliver", [@getAttribute("href"), "/tab/open"]

	pub = 
		    
		init: ->

			APP = window.APP = {}

			APP.full = full
			APP.filters = preview
			APP.gallery = gallery
			APP.settings = settings

			# bind document level events
			events.init()
			
			# fire up the postman!
			postman.init window.top
			
			# initialize the asset pipeline
			assets.init()
			
			$.subscribe('/camera/unsupported', ->
			    $('#pictures').append(intro)
			)

			$.publish "/postman/deliver", [ true, "/menu/enable" ]
			initAbout "#about"

			# initialize the camera
			camera.init "countdown", ->

				# create the top and bottom bars
				APP.bottom = bottom.init(".bottom")
				APP.top = top.init(".top")
				APP.confirm = confirm.init("#gallery")

				# initialize the previews
				preview.init "#filters"

				# initialize the full screen capture mode
				full.init "#capture"

				# initialize gallery details view
				details.init "#details"

				# initialize the thumbnail gallery
				gallery.init "#thumbnails"

				# initialize the settings view
				settings.init "#settings"

				# start drawing some previews
				preview.draw()

				# we are done loading the app. have the postman deliver that msg.
				$.publish "/postman/deliver", [ { message: ""}, "/app/ready" ]

				window.APP.app = new kendo.mobile.Application document.body, { platform: "blackberry" }

)
