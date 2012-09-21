define [
    'Kendo'
    'mylibs/file/filewrapper'
    'mylibs/config/config'
    'text!mylibs/settings/views/settings.html' 
], (kendo, filewrapper, config, template) ->
    SETTINGS_VIEW = "#settings"

    view = null
    previous = "#home"

    viewModel = kendo.observable
        flash:
            enabled: false
            change: (e) ->
                config.set "flash", viewModel.flash.enabled
        show: ->
            $.publish "/postman/deliver", [ false, "/menu/enable" ]
            previous = window.APP.app.view().id
            window.APP.app.navigate SETTINGS_VIEW
        hide: ->
            $.publish "/postman/deliver", [ true, "/menu/enable" ]
            window.APP.app.navigate previous
        gallery:
            clear: ->
                # TODO: PROMPT BEFORE DELETING EVERYTHING.
                filewrapper.clear().done ->
                    console.log "Everything was deleted"

    pub = 
        init: (selector) ->
            view = new kendo.View(selector, template)
            view.render(viewModel, true)

            config.get "flash", (value) ->
                viewModel.flash.enabled = value

            $.subscribe '/menu/click/chrome-cam-settings-menu', ->
                viewModel.show()