/* Â© 2009 ROBO Design
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var tool_default = 'line';

  var penSize = 3;

  function init () {
    // Find the canvas element.
    canvaso = document.getElementById('imageView');
    if (!canvaso) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvaso.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    if (!contexto) {
      alert('Error: failed to getContext!');
      return;
    }

    var hudCanvas = document.createElement('canvas');

    if (!hudCanvas) {
      alert('Error: I cannot create a new canvas');
      return;
    }

    hudCanvas.id     = 'imageTemp';
    hudCanvas.width  = canvaso.width;
    hudCanvas.height = canvaso.height;
    canvaso.parentNode.appendChild(hudCanvas);
    var hudContext = hudCanvas.getContext('2d');
    drawNextRegionHUD(hudContext);


    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');
    if (!canvas) {
      alert('Error: I cannot create a new canvas element!');
      return;
    }

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');

    // Get the tool select input.
    var tool_select = document.getElementById('dtool');
    if (!tool_select) {
      alert('Error: failed to get the dtool element!');  
      return;
    }     
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }



    //set default penSize:
    context.lineWidth = penSize;


    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);


    var increasePenSizeButton = document.getElementById('increase');
    var decreasePenSizeButton = document.getElementById('decrease');

    increasePenSizeButton.addEventListener('click', function() {
      context.lineWidth = context.lineWidth + 1;
    }, 'false');


    decreasePenSizeButton.addEventListener('click', function() {
      context.lineWidth = context.lineWidth - 1;
    }, 'false');


    var colorSelector = document.getElementById('color');

    colorSelector.addEventListener('change', function() {
      //alert(colorSelector.value);
      context.strokeStyle="#"+colorSelector.value;
      //context.fillStyle ="#"+colorSelector.value;
    }, 'false');


    var eraseButton = document.getElementById('eraseAll');

    eraseButton.addEventListener('click', function() {
      eraseAll(canvaso);
    }, 'false');


    var saveButton = document.getElementById('saveImage');

    if(saveButton){
      saveButton.addEventListener('click', function() {
          save_image(canvaso);    
       }, 'false');
    } else {

      var addNextRegionButton = document.getElementById('saveImage-addregion');
      var params = document.URL.split("/")
      var corpseId = params[params.length - 1]

      addNextRegionButton.addEventListener('click', function() {
        add_next_image(canvaso, corpseId);
      }, 'false');
    } 
      

  }


  function eraseAll(canvas) {
    //clear canvas
    canvas.width = canvas.width;

  }

  function drawNextRegionHUD(canvasContext) {
    if (!canvasContext.setLineDash) {
      canvasContext.setLineDash = function () {} 
    } else {
      canvasContext.setLineDash([5]);
    }

    //change color to red
    canvasContext.strokeStyle="#FF0000";
    canvasContext.strokeRect(canvaso.width-50, 0, 50, canvaso.height);

    //write "what next artist sees" on canvas
    canvasContext.font = "12px Arial";
    canvasContext.fillStyle = '#FF0000';
    canvasContext.fillText("Next", canvaso.width-45, 15);
    canvasContext.fillText("artist", canvaso.width-45, 25);
    canvasContext.fillText("sees", canvaso.width-45, 35);
    canvasContext.fillText("this", canvaso.width-45, 45);

     if (!canvasContext.setLineDash) {
      canvasContext.setLineDash = function () {}
    } else {
      canvasContext.setLineDash([0]);
    }

  }

  function add_next_image(canvas, corpseId) {
    var base64Image = canvas.toDataURL();
    var request = '{' 
                  + '"body" : "' + base64Image +'"'
                  + '}';
    $.ajax({
      type: "PUT",
      url: "http://rocky-plains-6210.herokuapp.com/corpse/"+corpseId,
      data: request,
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    }).done(function(childNodes) {
        newCorpseId = childNodes;     

      //display a link to view the current image so far (GET /corpse/:id)
      var nextCorpseDiv = document.getElementById('next-corpse-link');
      var nextCorpseLink = "http://rocky-plains-6210.herokuapp.com/corpse/"+newCorpseId;
      nextCorpseDiv.innerHTML = '<p>Send this link to someone to let them add the next part: ' + nextCorpseLink + '</p>'
                              + '<a href=' + nextCorpseLink +'>Click to Add to add the next part to this corpse</a>'
                              + '<p>Click <a href=http://rocky-plains-6210.herokuapp.com/corpse/complete/' + newCorpseId + '>here</a> to view the complete corpse so far</p>'


      }).fail(function(jqXHR, textStatus, errorThrown){
        alert(textStatus + ", " + errorThrown);
      });

  }

  function save_image(canvas) {
    var base64Image = canvas.toDataURL();    
    var request = '{' 
                  + '"body" : "' + base64Image +'"'
                  + '}';

    var newCorpseId;

   $.ajax({
      type: "POST",
      url: "http://rocky-plains-6210.herokuapp.com/corpse",
      data: request,
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    }).done(function(childNodes) {
        newCorpseId = childNodes;     

      //`: display the link to GET /corpse/:id
      var nextCorpseDiv = document.getElementById('next-corpse-link');
      var nextCorpseLink = "http://rocky-plains-6210.herokuapp.com/corpse/"+newCorpseId;
      nextCorpseDiv.innerHTML = '<p>Send this link to someone to let them add the next part: ' + nextCorpseLink + '</p>'
                              + '<a href=' + nextCorpseLink +'>Click to Add to add the next part to this corpse</a>';

      }).fail(function(jqXHR, textStatus, errorThrown){
        alert(textStatus + ", " + errorThrown);
      });

  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }

  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update () {
    contexto.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // This object holds the implementation of each drawing tool.
  var tools = {};

  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }

      context.strokeRect(x, y, w, h);
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };


  tools.eraser = function () {

    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.fillStyle = 'rgba(255,255,255,0.5)';
        context.strokeStyle = 'rgba(255,255,255,0.5)';
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();

        //reset color
        context.fillStyle = 'rgba(0,0,0,2)';
        context.strokeStyle = 'rgba(0,0,0,2)';
      }
    };

  };

  init();

}, false); }

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:
