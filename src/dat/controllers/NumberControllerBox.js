/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

define([
  'dat/controllers/NumberController',
  'dat/dom/dom',
  'dat/utils/common'
], function(NumberController, dom, common) {

  /**
   * @class Represents a given property of an object that is a number and
   * provides an input element with which to manipulate it.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberControllerBox = function(object, property, params) {

    this.__truncationSuspended = false;
	this.__mouseIsDown = false;
	
    NumberControllerBox.superclass.call(this, object, property, params);

    var _this = this;
	
    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    var prev_y;

    this.__input = document.createElement('input');
   
	if (this.__step != undefined) {
		this.__input.setAttribute('step', this.__step);
		this.__input.setAttribute('type', 'number');
	}
	else  this.__input.setAttribute('type', 'text');

    // Makes it so manually specified values are not truncated.

	dom.bind(this.__input, 'input', onInput);
    dom.bind(this.__input, 'change', onChange);
    dom.bind(this.__input, 'blur', onBlur);
	dom.bind(this.__input, "mousedown", onMouseDownDetect);
   // dom.bind(this.__input, 'mousedown', onMouseDown);
    dom.bind(this.__input, 'keydown', function(e) {

      // When pressing entire, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      }
	  else if (  (e.keyCode === 38 || e.keyCode === 40) && _this.__step) {
		onChange();
	  }

    });
	
	function onMouseDownDetect() {
		_this.__mouseIsDown = true;
		dom.bind(window, 'mouseup', onMouseUpDetect);
	}
	
	function onMouseUpDetect() {
		_this.__mouseIsDown = false;
		dom.unbind(window, 'mouseup', onMouseUpDetect);
	}

    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
	 
    }
	
	function onInput() {
	  if (!_this.__mouseIsDown) {
		return;
	  }
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
    }

    function onBlur() {
	  var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
	  else _this.updateDisplay();
	  
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
		
      }
    }

    function onMouseDown(e) {
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      prev_y = e.clientY;
    }

    function onMouseDrag(e) {

      var diff = prev_y - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prev_y = e.clientY;

    }

    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);

  };

  NumberControllerBox.superclass = NumberController;

  common.extend(

      NumberControllerBox.prototype,
      NumberController.prototype,

      {

        updateDisplay: function() {

          this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
          return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
        },
		 step: function(v) {
			if (this.__input.getAttribute("type") != "number") this.__input.setAttribute("type", "number");
			this.__input.setAttribute("step", v);
          return NumberControllerBox.superclass.prototype.step.apply(this, arguments);
        }

      }

  );

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }

  return NumberControllerBox;

});

