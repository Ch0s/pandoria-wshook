// ==UserScript==
// @name         Pandoria WSHookUP
// @namespace    Airodnep_is_awesome
// @version      0.1
// @description  Hooks to the websocket communication and broadcasts the various messages as custom events
// @author       Airodnep
// @run-at       document-start
// @match        https://pendoria.net/game
// @grant        none
// ==/UserScript==

(function(window) {
    'use strict';

    var OriginalWS = window.WebSocket;
    var initOWS    = OriginalWS.apply.bind(OriginalWS);
    var wsListener = OriginalWS.prototype.addEventListener;
        wsListener = wsListener.call.bind(wsListener);
    var hooked = false;
    function MyWS(url, opts) {
        var ws;
        if (this instanceof WebSocket) {
            if (arguments.length === 1) {
                ws = new OriginalWS(url);
            } else if (arguments.length >= 2) {
                ws = new OriginalWS();
            } else {
                ws = new OriginalWS();
            }
        } else {
            ws = initOWS(this, arguments);
        }
        wsListener(ws, "message", function(event){
            hooked = true;
            var data = event.data;
            try {
                data = JSON.parse(data);
                paTrigger(data);
            } catch (e) {
                data = data.replace(/^[0-9]+/, "");
                try {
                    data = JSON.parse(data);
                    paTrigger(data);
                } catch (e) {
                    console.error("well, eff me I guess", event.data, e.message);
                    paTrigger(event.data);
                }
            }
            function paTrigger(data) {
                var etype = "pa-ws:";
                var args = [];
                if (Array.isArray(data)) {
                    args.push(etype+(data[0].replace(/\s+/, "-")));
                    args.push(data.slice(1));
                    //console.log(etype+(data[0].replace(/\s+/, "-")), data.slice(1));
                } else {
                    if (typeof data === "string") {
                        data = data.replace(/\s+/, "-");
                    }
                    args.push(etype+data);
                    args.push(data);
                }
                $(document).trigger(args[0], args[1]);
            }
        });
        return ws;
    }
    window.WebSocket = MyWS.bind();
    window.WebSocket.prototype = OriginalWS.prototype;
    window.WebSocket.prototype.constructor = window.WebSocket;
})(window);
