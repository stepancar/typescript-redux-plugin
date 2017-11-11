
import * as ts_module from "typescript/lib/tsserverlibrary";
declare var require;
const fs = require('fs');
function init(modules: {typescript: typeof ts_module}) {
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {
        // Get a list of things to remove from the completion list from the config object.
        // If nothing was specified, we'll just remove 'caller'
        const whatToRemove: string[] = info.config.remove || ['caller'];

        // Diagnostic logging
        info.project.projectService.logger.info("This message will appear in your logfile if the plugin loaded correctly");

        // Set up decorator
   	    const proxy = Object.create(null) as ts.LanguageService;
	    const oldLS = info.languageService;
	    for (const k in oldLS) {
	        (<any>proxy)[k] = function () {
	            return oldLS[k].apply(oldLS, arguments);
	        }
	    }

        // Remove specified entries from completion list
        proxy.getCompletionsAtPosition = (fileName, position) => {
            const prior = info.languageService.getCompletionsAtPosition(fileName, position);
            const oldLength = prior.entries.length;
            prior.entries = [{"name":"this is autocomplete","kind":"var","kindModifiers":"declare","sortText":"0"}, ...prior.entries.filter(e => whatToRemove.indexOf(e.name) < 0)];
            // fs.writeFileSync('./index.txt', JSON.stringify(prior.entries) + fileName)
            //fs.writeFileSync('./index.txt', JSON.stringify(prior.entries))
            // Sample logging for diagnostic purposes
            if (oldLength !== prior.entries.length) {
                info.project.projectService.logger.info(`Removed ${oldLength - prior.entries.length} entries from the completion list`);
            }

            return prior;
        };

        return proxy;
    }

    return { create };
}

export = init;