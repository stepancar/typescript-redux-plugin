"use strict";
var fs = require('fs');
function init(modules) {
    var ts = modules.typescript;
    function create(info) {
        // Get a list of things to remove from the completion list from the config object.
        // If nothing was specified, we'll just remove 'caller'
        var whatToRemove = info.config.remove || ['caller'];
        // Diagnostic logging
        info.project.projectService.logger.info("This message will appear in your logfile if the plugin loaded correctly");
        // Set up decorator
        var proxy = Object.create(null);
        var oldLS = info.languageService;
        var _loop_1 = function (k) {
            proxy[k] = function () {
                return oldLS[k].apply(oldLS, arguments);
            };
        };
        for (var k in oldLS) {
            _loop_1(k);
        }
        // Remove specified entries from completion list
        proxy.getCompletionsAtPosition = function (fileName, position) {
            var prior = info.languageService.getCompletionsAtPosition(fileName, position);
            var oldLength = prior.entries.length;
            prior.entries = [{ "name": "this is autocomplete", "kind": "var", "kindModifiers": "declare", "sortText": "0" }].concat(prior.entries.filter(function (e) { return whatToRemove.indexOf(e.name) < 0; }));
            fs.writeFileSync('./index.txt', JSON.stringify(prior.entries) + fileName);
            //fs.writeFileSync('./index.txt', JSON.stringify(prior.entries))
            // Sample logging for diagnostic purposes
            if (oldLength !== prior.entries.length) {
                info.project.projectService.logger.info("Removed " + (oldLength - prior.entries.length) + " entries from the completion list");
            }
            return prior;
        };
        return proxy;
    }
    return { create: create };
}
module.exports = init;
