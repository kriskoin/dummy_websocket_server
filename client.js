$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:7475');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'login_request') { // e
            //
            /*
              var data = {
                user : (,
                pass: ,
                vendor: //always 0
                
              };
            */
        } else if (json.type === 'login_response') { // e
            //
            /*
              var data = {
                time: (new Date()).getTime(),
                err: 0 = ok ,
                token: token, | err_msg:
                
              };
            */
        } else if (json.type === 'new_token') { // e
            //
            /*
              var data = {
                time: (new Date()).getTime(),
                token: token // new token value
                
              };
            */
        } else if (json.type === 'place_bet_request') { // e
            //
            /*
              var data = {
                time: (new Date()).getTime(),
                token: token // new token value
                value: //btc choseen value
                status: //up,down
              };
            */
        } else if (json.type === 'place_bet_response') { // e
            //
            /*
              var data = {
                time: (new Date()).getTime(),
                txid: // new token value
                
              };
            */
        } else if (json.type === 'bet_update') { // e
            //
            /*
              var data = {
                time: (new Date()).getTime(),
                txids: // array with the all tx/bets status
                
              };
            */
        } else if (json.type === 'btc_feed') { // the btc data
            input.removeAttr('disabled'); // let the user write another message
            addMessage(new Date(json.data.time),json.data.value,json.data.status);
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);

    function addMessage(dt, value, status) {
        var color = "red";
        if (status=="up"){
           color = "green";
        }
        content.prepend('<p><span style="color:' + color + '"></span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + value + '</p>');
    }

});
