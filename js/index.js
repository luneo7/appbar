(function() {
    var root = this;
    var FuncProto = Function.prototype, ArrayProto = Array.prototype, ObjProto = Object.prototype;
    var slice = ArrayProto.slice, toString = ObjProto.toString;
    var nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind, nativeCreate = Object.create, getPrototypeOf = Object.getPrototypeOf;

    var Ctor = function(){};

    var AppBar = function(obj) {
        if (obj instanceof AppBar) return obj;
        if (!(this instanceof AppBar)) return new AppBar(obj);
        this._wrapped = obj;
    };

    root.AppBar = AppBar;

    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    var baseCreate = function(prototype) {
        if (!AppBar.isObject(prototype)) return {};
        if (nativeCreate) return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor();
        Ctor.prototype = null;
        return result;
    };

    AppBar.VERSION = '1.0';

    AppBar.InvalidCharacterError = function (message) {
        this.message = message;
    };

    AppBar.InvalidCharacterError.prototype = new Error();
    AppBar.InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    AppBar.bind = function(func, context) {
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!AppBar.isFunction(func)) throw new TypeError('Bind must be called on a function');
        var args = slice.call(arguments, 2);
        var bound = function() {
            return AppBar.executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
        };
        return bound;
    };

    AppBar.executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
        if (!(callingContext instanceof boundFunc))
            return sourceFunc.apply(context, args);
        var self = baseCreate(sourceFunc.prototype);
        var result = sourceFunc.apply(self, args);
        if (AppBar.isObject(result))
            return result;
        return self;
    };

    if (typeof /./ != 'function' && typeof Int8Array != 'object') {
        AppBar.isFunction = function(obj) {
            return typeof obj == 'function' || false;
        };
    }

    AppBar.has = function(obj, key) {
        return obj !== null && hasOwnProperty.call(obj, key);
    };

    AppBar.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };


    var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

    function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        var proto = (AppBar.isFunction(constructor) && constructor.prototype) || ObjProto;

        var prop = '';

        while (nonEnumIdx--) {
          prop = nonEnumerableProps[nonEnumIdx];
          if (prop in obj && obj[prop] !== proto[prop] && !AppBar.contains(keys, prop)) {
            keys.push(prop);
          }
        }

        // Constructor is a special case.
        prop = 'constructor';
        if (AppBar.has(obj, prop) && keys.indexOf(prop) < 0) keys.push(prop);
    }

    AppBar.values =  function(obj) {
        var keys = AppBar.keys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
          values[i] = obj[keys[i]];
        }
        return values;
    };

    AppBar.keys = function(obj) {
        if (!AppBar.isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj) if (AppBar.has(obj, key)) keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    AppBar.isArguments = function(obj) {
      return toString.call(obj) === '[object Arguments]';
    };

    if (!AppBar.isArguments(arguments)) {
            AppBar.isArguments = function(obj) {
          return AppBar.has(obj, 'callee');
        };
    }

    AppBar.isEmpty = function(obj) {
        if (obj === null)
            return true;
        if (AppBar.isArrayLike(obj) && (AppBar.isArray(obj) || AppBar.isString(obj) || AppBar.isArguments(obj))) return obj.length === 0;
        return AppBar.keys(obj).length === 0;
    };

    AppBar.isString = function(obj) {
      return toString.call(obj) === '[object String]';
    };

    AppBar.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    AppBar.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) === '[object Array]';
    };

    AppBar.toggleDisplay = function (el, a, b) {
        var elt = AppBar.isElement(el) ? el : document.getElementById(el);
        if (elt.style.display === a) {
            elt.style.display = b;
        } else {
            elt.style.display = a;
        }
    };

    AppBar.toggleClass = function (el, className){
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = classes.indexOf(className);

            if (existingIndex >= 0)
                classes.splice(existingIndex, 1);
            else
                classes.push(className);

            el.className = classes.join(' ');
        }
    };

    AppBar.addClass = function (el, className) {
        if (el.classList){
            el.classList.add(className);
        }
        else{
            var classes = el.className.split(' ');
            if(classes.indexOf(className) < 0){
                el.className += ' ' + className;
            }
        }
    };

    AppBar.addStyleToHead = function (url){
        var head = document.getElementsByTagName('head')[0];
        var l = document.createElement('link');
        l.href = url;
        l.rel = 'stylesheet';
        l.type = 'text/css';
        head.appendChild(l);
    };

    AppBar.removeClass = function (el, className) {
        if (el.classList)
            el.classList.remove(className);
        else
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    };

    AppBar.stopEventPropagation = function (e) {
        // If stopPropagation exists, run it on the original event
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        // Support: IE
        // Set the cancelBubble property of the original event to true
        e.cancelBubble = true;
    };

    AppBar.screenHeight = function(){
        var e = window, a = 'inner';
        if ( !( 'innerHeight' in window ) ){
            a = 'client';
            e = document.documentElement || document.body;
        }
        return e[ a+'Height' ];
    };

    AppBar.screenWidth = function(){
        var e = window, a = 'inner';
        if ( !( 'innerWidth' in window ) ){
            a = 'client';
            e = document.documentElement || document.body;
        }
        return e[ a+'Height' ];
    };

    AppBar.offset = function (el){
        var rect = el.getBoundingClientRect();
        return { top: rect.top + document.body.scrollTop, left: rect.left + document.body.scrollLeft };
    };

    AppBar.removeElement = function (el){
        el.parentNode.removeChild(el);
    };

    AppBar.addEventListener = function (selector, type, func, useCapture){
        useCapture = typeof useCapture !== 'undefined' ? useCapture : false;

        if(AppBar.isElement(selector)){
            selector.addEventListener(type, func, useCapture);
        }
        else if(AppBar.isString(selector)){
            selector = document.querySelectorAll(selector);
        }

        if(selector && selector.length > 0){
            for (var i = 0; i < selector.length; i++) {
                selector[i].addEventListener(type, func, useCapture);
            }
        }

    };

    AppBar.scrollElToY = function (el, scrollTargetY, speed, easing) {
        // speed: time in pixels per second
        // easing: easing equation to use

        var scrollY = el.scrollTop,
            currentTime = 0;
        scrollTargetY = scrollTargetY - (!( el.innerHeight ) ? el.clientHeight : el.innerHeight) || 0;
        speed = speed || 2000;
        easing = easing || 'easeOutSine';

        // min time .1, max time .8 seconds
        var time = Math.max(0.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, 0.8));

        // easing equations from https://github.com/danro/easing-js/blob/master/easing.js
        var easingEquations = {
            easeOutSine: function (pos) {
                return Math.sin(pos * (Math.PI / 2));
            },
            easeInOutSine: function (pos) {
                return (-0.5 * (Math.cos(Math.PI * pos) - 1));
            },
            easeInOutQuint: function (pos) {
                if ((pos /= 0.5) < 1) {
                    return 0.5 * Math.pow(pos, 5);
                }
                return 0.5 * (Math.pow((pos - 2), 5) + 2);
            }
        };

        // add animation loop
        function tick() {
            currentTime += 1 / 60;

            var p = currentTime / time;
            var t = easingEquations[easing](p);

            if (p < 1) {
                window.requestAnimFrame(tick);

                el.scrollTop = scrollY + ((scrollTargetY - scrollY) * t);
            } else {
                el.scrollTop = scrollTargetY;
            }
        }
        // call it once to get started
        tick();
    };

    AppBar.getCookie = function (name) {
        var start = document.cookie.indexOf(name + "=");

        var len = start + name.length + 1;

        if ((!start) && (name != document.cookie.substring(0, name.length))) {
            return null;
        }

        if (start == -1) return null;

        var end = document.cookie.indexOf(';', len);

        if (end == -1) end = document.cookie.length;

        return decodeURI(document.cookie.substring(len, end));
    };

    AppBar.createCookie = function (name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }
        document.cookie = name+"="+value+expires+"; path=/";
    };

    AppBar.eraseCookie = function (name) {
        AppBar.createCookie(name,"",-1);
    };

    AppBar.onReady = function ( fn ) {
        // Sanity check
        if ( !AppBar.isFunction(fn) ) return;

        // If document is already loaded, run method
        if ( document.readyState != 'loading') {
            fn();
        }
        else {
            document.addEventListener( 'DOMContentLoaded', function domContentLoaded(e) {
                    e.target.removeEventListener('DOMContentLoaded', domContentLoaded);
                    fn();
                }, false );
        }
    };

    AppBar.onComplete = function ( fn ) {
        // Sanity check
        if ( !AppBar.isFunction(fn) ) return;

        // If document is already loaded, run method
        if ( document.readyState == 'complete') {
            fn();
        }
        else if (typeof document.addEventListener != 'undefined'){
            document.addEventListener('readystatechange', function docStateChange(e) {
                if(e.target.readyState === 'complete') {
                    e.target.removeEventListener('readystatechange', docStateChange);
                    fn();
                }
            });
        }
        else {
            AppBar.onLoaded(fn);
        }
    };

    AppBar.onLoaded = function (fn) {
        //mozilla and friends
        if (typeof window.addEventListener != 'undefined') {
            window.addEventListener('load', fn, false);
        }
        //opera
        else if (typeof document.addEventListener != 'undefined') {
            document.addEventListener('load', fn, false);
        }
        //innernetz exploder
        else if (typeof window.attachEvent != 'undefined') {
            window.attachEvent('onload', fn);
        }
        //the rest is pretty much for browsers that I doubt your
        //CSS or anything else still supports like IE/Mac
        else {
            var oldfn = window.onload;
            if (typeof window.onload != 'function') {
                window.onload = fn;
            }
            else {
                window.onload = function() {
                    oldfn();
                    fn();
                };
            }
        }
    };

    AppBar.isArrayLike = function (obj) {
        // `null`, `undefined` and `window` are not array-like
        if (obj === null || AppBar.isWindow(obj)) return false;

        // arrays, strings and jQuery/jqLite objects are array like
        // * jqLite is either the jQuery or jqLite constructor function
        // * we have to check the existance of jqLite first as this method is called
        //   via the forEach method when constructing the jqLite object in the first place
        if (AppBar.isArray(obj) || AppBar.isString(obj)) return true;

        // Support: iOS 8.2 (not reproducible in simulator)
        // "length" in obj used to prevent JIT error (gh-11508)
        var length = "length" in Object(obj) && obj.length;
        // NodeList objects (with `item` method) and
        // other objects with suitable length characteristics are array-like
        return AppBar.isNumber(length) &&
            (length >= 0 && ((length - 1) in obj || obj instanceof Array) || typeof obj.item == 'function');
    };

    AppBar.isNumber = function (value) {return typeof value === 'number';};

    AppBar.isWindow = function(obj) {return obj && obj.window === obj;};

    AppBar.isBlankObject = function (value) {
        return value !== null && typeof value === 'object' && !getPrototypeOf(value);
    };

    AppBar.forEach = function (obj, iterator, context) {
        var key, length;
        if (obj) {
            if (AppBar.isFunction(obj)) {
                for (key in obj) {
                    // Need to check if hasOwnProperty exists,
                    // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                    if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (AppBar.isArray(obj) || AppBar.isArrayLike(obj)) {
                var isPrimitive = typeof obj !== 'object';
                for (key = 0, length = obj.length; key < length; key++) {
                    if (isPrimitive || key in obj) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (obj.forEach && obj.forEach !== AppBar.forEach) {
                obj.forEach(iterator, context, obj);
            } else if (AppBar.isBlankObject(obj)) {
                // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
                for (key in obj) {
                    iterator.call(context, obj[key], key, obj);
                }
            } else if (typeof obj.hasOwnProperty === 'function') {
                // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else {
                // Slow path for objects which do not have a method `hasOwnProperty`
                for (key in obj) {
                    if (hasOwnProperty.call(obj, key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            }
        }
        return obj;
    };

    AppBar.noop = function (){};

    AppBar.consoleLog = function (type){
        var console = window.console || {},
          logFn = console[type] || console.log || AppBar.noop,
          hasApply = false;

        try {
            hasApply = !!logFn.apply;
        } catch (e) {}

        if (hasApply) {
            return function() {
                var args = [];
                AppBar.forEach(arguments, function(arg) {
                    args.push(arg);
                });
                return logFn.apply(console, args);
            };
        }

        return function(arg1, arg2) {
            logFn(arg1, arg2 === null ? '' : arg2);
        };
    };

    AppBar.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    if (!root.atob) {
        root.atob = function (input) {
            var str = String(input).replace(/=+$/, '');
            if (str.length % 4 == 1) {
                throw new AppBar.InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
            }
            for (
                // initialize result and counters
                var bc = 0, bs, buffer, idx = 0, output = '';
                // get next character
                buffer = str.charAt(idx++);
                // character found in table? initialize bit storage and add its ascii value;
                ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                // and if not first of each 4 characters,
                // convert the first 8 bits to one ascii character
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
            ) {
                // try to find character in table (0-63, not found => -1)
                buffer = AppBar.chars.indexOf(buffer);
            }
            return output;
        };
    }

    AppBar.log = AppBar.consoleLog('log');

    AppBar.encodeQueryData = function (data) {
        var ret = [];
        for (var d in data){
            ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        }
        return ret.join("&");
    };

    AppBar.onMouseWheel = function (el, fn) {
        if (el.addEventListener) {
            // IE9, Chrome, Safari, Opera, Firefox
            var toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
            for ( var i = toBind.length; i; ) {
                el.addEventListener(toBind[--i], function (e){
                        var orgEvent = e || window.event; // old IE support
                        var deltaY=0;

                        if ( 'detail' in e ) { deltaY = orgEvent.detail * -1; }
                        if ( 'deltaY' in e ) { deltaY = e.deltaY * -1; }

                        orgEvent.deltaYFix = deltaY;

                        fn(orgEvent);
                    }, false);
            }
        }
        // IE 6/7/8
        else el.attachEvent("onmousewheel",  function (e){
                        e = window.event || e; // old IE support
                        e.deltaYFix = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                        fn(e);
                    });
    };

    AppBar.insertAfter = function (newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };

    AppBar.innerText = function (el, text) {
        el[("textContent" in el) ? "textContent" : "innerText"] = text;
    };

    AppBar.objectToArray = function (obj){
        var newArray = [];
        for (var prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            if(obj[prop]){
                newArray.push(obj[prop]);
            }
        }
        return newArray;
    };

    AppBar.dynamicSort = function (property){
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        };
    };

    AppBar.sortArray = function (array, prop) {
        array.sort(AppBar.dynamicSort(prop));
    };

    AppBar.arrayUnion = function (arr1, arr2, equalityFunc) {
        var union = arr1.concat(arr2);

        for (var i = 0; i < union.length; i++) {
            for (var j = i+1; j < union.length; j++) {
                if (equalityFunc(union[i], union[j])) {
                    union.splice(j, 1);
                    j--;
                }
            }
        }

        return union;
    };

    AppBar.supportsLocalStorage = function () {
        try {
            return 'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    };

    AppBar.AccountInfo = {
        open: false,

        $button: null,

        $accountPanel: null,

        $arrowShadow: null,

        $arrow: null,

        $userName: null,

        $userEmail: null,

        $userPhoto: null,

        $accountSettingsButton: null,

        $accountLogoutButton: null,

        scroll: false,

        initialise: function(callback) {
            // Setup elements
            // Button Container
            if(AppBar.Backend.isLoggedIn){
                var divAccountButton = document.createElement('div');
                divAccountButton.className = "sb-account-button";
                // Button
                this.$button = document.createElement('a');
                this.$button.href = 'javascript:void(0)';
                this.$button.title = "Account";
                this.$button.setAttribute('aria-expanded', 'false');
                this.$button.tabIndex = 0;
                // Button Icon
                var buttonIcon = document.createElement('i');
                buttonIcon.className = "material-icons";
                buttonIcon.appendChild( document.createTextNode("account_circle") );
                this.$button.appendChild( buttonIcon );
                // Arrow Shadow
                this.$arrowShadow = document.createElement('div');
                this.$arrowShadow.className = "sb-arrow-shadow";
                this.$button.appendChild( this.$arrowShadow );
                // Arrow
                this.$arrow = document.createElement('div');
                this.$arrow.className = "sb-arrow-back";
                this.$button.appendChild( this.$arrow );
                divAccountButton.appendChild( this.$button );

                // Account Panel
                this.$accountPanel = document.createElement('div');
                this.$accountPanel.className = "sb-account-panel";
                this.$accountPanel.setAttribute('aria-hidden', 'true');
                // Account Info
                var divAccountInfo = document.createElement('div');
                divAccountInfo.className = "sb-account-info";
                // User Photo
                this.$userPhoto = document.createElement('div');
                divAccountInfo.appendChild( this.$userPhoto );
                // User Attributes
                var divUserAttr = document.createElement('div');
                // User Name
                this.$userName = document.createElement('div');
                this.$userName.className = "sb-user-name";
                this.$userName.appendChild( document.createTextNode("John Doe") );
                divUserAttr.appendChild( this.$userName );
                // User Email
                this.$userEmail = document.createElement('div');
                this.$userEmail.className = "sb-user-mail";
                this.$userEmail.appendChild( document.createTextNode("johndoe@example.com") );
                divUserAttr.appendChild( this.$userEmail );
                // Add user attributes to account info
                divAccountInfo.appendChild( divUserAttr );
                // Add account info to account panel
                this.$accountPanel.appendChild( divAccountInfo );

                // Actions panel
                var divActionsPanel = document.createElement('div');
                divActionsPanel.className = "sb-actions";

                // --- Account Settings Begin ---
                // Account Settings Container
                var divAccountSettingsContainer = document.createElement('div');
                // Accounnt Settings Button
                this.$accountSettingsButton = document.createElement('a');
                var divAccountSettingsIcon = document.createElement('div');

                var accountSettingsIcon = document.createElement('i');
                accountSettingsIcon.className = "material-icons";
                accountSettingsIcon.appendChild( document.createTextNode("settings") );
                divAccountSettingsIcon.appendChild( accountSettingsIcon );

                this.$accountSettingsButton.appendChild( divAccountSettingsIcon );

                var divAccountSettingsText = document.createElement('div');
                divAccountSettingsText.appendChild( document.createTextNode("Account Configuration") );
                this.$accountSettingsButton.appendChild( divAccountSettingsText );

                divAccountSettingsContainer.appendChild( this.$accountSettingsButton );
                divActionsPanel.appendChild( divAccountSettingsContainer );
                // --- Account Settings End ---

                // --- Account Logout Begin ---
                // Account Logout Container
                var divAccountLogoutContainer = document.createElement('div');
                // Account Logout Button
                this.$accountLogoutButton = document.createElement('a');
                var divAccountLogoutIcon = document.createElement('div');

                var accountLogoutIcon = document.createElement('i');
                accountLogoutIcon.className = "material-icons";
                accountLogoutIcon.appendChild( document.createTextNode("power_settings_new") );
                divAccountLogoutIcon.appendChild( accountLogoutIcon );

                this.$accountLogoutButton.appendChild( divAccountLogoutIcon );


                var divAccountLogoutText = document.createElement('div');
                divAccountLogoutText.appendChild( document.createTextNode("Logout") );
                this.$accountLogoutButton.appendChild( divAccountLogoutText );

                divAccountLogoutContainer.appendChild( this.$accountLogoutButton );
                divActionsPanel.appendChild( divAccountLogoutContainer );

                // Add account actions to account panel
                this.$accountPanel.appendChild( divActionsPanel );
                // --- Account Logout End ---

                // Add elements to screen

                AppBar.$container.insertBefore(this.$accountPanel, AppBar.$container.firstChild);
                AppBar.$container.insertBefore(divAccountButton, AppBar.$container.firstChild);

                // Add actions
                this.$accountPanel.addEventListener('click',  AppBar.bind(this._onAccountPanelClick, this));
                this.$button.addEventListener('click', AppBar.bind(this._onButtonClick, this));
                this.$accountSettingsButton.addEventListener('click', AppBar.bind(this._onAccountSettingsButtonClick, this));
                this.$accountLogoutButton.addEventListener('click', AppBar.bind(this._onLogoutButtonClick, this));

                document.addEventListener('click', AppBar.bind(function() {
                   this.close();
                }, this));

                if(AppBar.Backend.userData) {
                    this.setUserName(AppBar.Backend.userData.cn[0]);
                    this.setUserEmail(AppBar.Backend.userData.mail[0]);
                    if(AppBar.Backend.userData.jpegPhoto && AppBar.Backend.userData.jpegPhoto.length >0){
                        this.setUserPhoto(AppBar.Backend.userData.jpegPhoto[0]);
                    }
                }
            }
            else {
                AppBar.AccountInfo.addLoginButton(AppBar.Backend.loginUrl);
            }

            if(callback) {
                callback();
            }
        },

        close: function() {
             if(this.open){
                this.scroll = false;

                this.$accountPanel.setAttribute('aria-hidden', 'true');
                this.$button.setAttribute('aria-expanded', 'false');

                AppBar.removeClass(this.$arrow,'sb-show');
                AppBar.removeClass(this.$arrowShadow,'sb-show');
                AppBar.removeClass(this.$accountPanel,'sb-show');

                this.open = false;
            }
        },

        setUserName: function (uname){
            this.$userName.innerHTML = "";
            this.$userName.appendChild( document.createTextNode(uname) );
        },

        setUserEmail: function (uemail){
            this.$userEmail.innerHTML = "";
            this.$userEmail.appendChild( document.createTextNode(uemail) );
        },

        setUserPhoto: function (uphoto){
            this.$userPhoto.style.backgroundImage = 'url(data:image/jpeg;base64,'+uphoto+')';
        },

        addLoginButton: function (url){
            var loginDiv = document.createElement('div');
            loginDiv.className = "sb-personal-info";

            var loginButton = document.createElement('a');
            loginButton.href = url;
            loginButton.className = "sb-login-button sb-button-colored";
            loginButton.tabIndex = 0;
            loginButton.appendChild( document.createTextNode("Login"));
            loginDiv.appendChild( loginButton );

            AppBar.$container.insertBefore(loginDiv, AppBar.$container.firstChild);
        },

        _onAccountPanelClick: function(event) {
            AppBar.stopEventPropagation(event);
        },

        _onLogoutButtonClick: function(event) {
            AppBar.stopEventPropagation(event);
            AppBar.Backend.logout();
        },

        _onAccountSettingsButtonClick: function(event) {
            AppBar.stopEventPropagation(event);
            AppBar.Backend.accountSettings();
        },

        _onButtonClick: function(event) {
            AppBar.stopEventPropagation(event);
            AppBar.toggleClass(this.$arrow,'sb-show');
            AppBar.toggleClass(this.$arrowShadow,'sb-show');
            AppBar.toggleClass(this.$accountPanel,'sb-show');
            var ariaValue = (!(this.$accountPanel.getAttribute('aria-hidden') == "true"));
            this.$button.setAttribute('aria-expanded', !ariaValue);
            this.$accountPanel.setAttribute('aria-hidden', ariaValue);
            if(!this.open){
                AppBar.Notifications.close();
                AppBar.AppLauncher.close();
            }
            this.open = !this.open;
        }

    };

    AppBar.Notifications = {

        open: false,

        $button: null,

        $notificationsDrawer: null,

        $notificationsTop: null,

        $notificationsBottom: null,

        $notificationsScrollPane: null,

        $notificationsList: null,

        $notificationsBadge: null,

        $arrowShadow: null,

        $arrow: null,

        launcherMaxHeight: 190,

        launcherMinHeight: 190,

        notificationsCount: 0,

        initialise: function(callback) {
            // Go!

            // Setup elements
            // Button Container
            var divNotificationsButton = document.createElement('div');
            divNotificationsButton.className = "sb-notifications-button";
            // Button
            this.$button = document.createElement('a');
            this.$button.tabIndex = 0;
            this.$button.href = "javascript:void(0)";
            this.$button.title = "Notificações";
            this.$button.setAttribute('aria-expanded', 'false');
            // Button Icons
            var i_0 = document.createElement('i');
            i_0.className = "material-icons sb-notification-not-empty";
            i_0.appendChild( document.createTextNode("notifications") );
            this.$button.appendChild( i_0 );

            var i_1 = document.createElement('i');
            i_1.className = "material-icons sb-notification-empty";
            i_1.appendChild( document.createTextNode("notifications_none") );
            this.$button.appendChild( i_1 );
            // Notifications Badge
            this.$notificationsBadge = document.createElement('span');
            this.$notificationsBadge.className = "sb-notifications-badge";
            this.$notificationsBadge.appendChild( document.createTextNode(0) );
            this.$button.appendChild( this.$notificationsBadge );
            // Arrow Shadow
            this.$arrowShadow = document.createElement('div');
            this.$arrowShadow.className = "sb-arrow-shadow";
            this.$button.appendChild( this.$arrowShadow );
            // Arrow
            this.$arrow = document.createElement('div');
            this.$arrow.className = "sb-arrow-back";
            this.$button.appendChild( this.$arrow );

            divNotificationsButton.appendChild( this.$button );

            ////////////
            this.$notificationsDrawer = document.createElement('div');
            this.$notificationsDrawer.className = "sb-notifications-drawer";
            this.$notificationsDrawer.setAttribute('aria-hidden','true');

            this.$notificationsTop = document.createElement('div');
            this.$notificationsTop.className = "sb-notifications-top";
            this.$notificationsTop.appendChild( document.createTextNode("\nThere are no notifications! =P\n") );
            this.$notificationsDrawer.appendChild( this.$notificationsTop );


            this.$notificationsScrollPane = document.createElement('div');
            this.$notificationsScrollPane.className = "sb-notifications-scrollpane";

            this.$notificationsList = document.createElement('ul');
            this.$notificationsList.className = "sb-notifications-list";
            this.$notificationsScrollPane.appendChild( this.$notificationsList );

            this.$notificationsDrawer.appendChild( this.$notificationsScrollPane );


            this.$notificationsBottom = document.createElement('div');
            this.$notificationsBottom.className = "sb-notifications-bottom";

            var seeAllNotifications = document.createElement('a');
            seeAllNotifications.tabIndex = 0;
            seeAllNotifications.href = "javascript:void(0)";
            var seeAllNotificationsSpan = document.createElement('span');
            seeAllNotificationsSpan.appendChild(document.createTextNode(" See all notifications"));
            seeAllNotifications.appendChild(seeAllNotificationsSpan);
            this.$notificationsBottom.appendChild( seeAllNotifications );

            this.$notificationsDrawer.appendChild( this.$notificationsBottom );

            AppBar.$container.insertBefore(this.$notificationsDrawer, AppBar.$container.firstChild);
            AppBar.$container.insertBefore(divNotificationsButton, AppBar.$container.firstChild);

            this.$notificationsDrawer.addEventListener('click',  AppBar.bind(this._onNotificationsDrawerClick, this));

            this.$button.addEventListener('click', AppBar.bind(this._onButtonClick, this));

            document.addEventListener('click', AppBar.bind(function() {
               this.close();
            }, this));

             // Resize event handler to maintain the max-height of the app launcher
            window.addEventListener('resize', AppBar.bind(function(){
                    this.$notificationsDrawer.style.maxHeight = (AppBar.screenHeight() - AppBar.offset(this.$notificationsDrawer).top) + "px";
            }, this));


            var doneNotifications = document.querySelectorAll('.app-bar .notification-controls .notification-done');

            AppBar.addEventListener(doneNotifications, 'click', AppBar.bind(this._onRemoveNotification, this));

            this.notificationsCount = doneNotifications.length;

            this.createDemoNotifications();

            if(callback) {
                callback();
            }
        },

        close: function (){
            if(this.open){
                this.$notificationsDrawer.setAttribute('aria-hidden', 'true');
                this.$button.setAttribute('aria-expanded', 'false');

                AppBar.removeClass(this.$notificationsDrawer, 'sb-overflow');
                AppBar.removeClass(this.$arrow,'sb-show');
                AppBar.removeClass(this.$arrowShadow,'sb-show');
                AppBar.removeClass(this.$notificationsDrawer,'sb-show');

                this.open = false;
            }
        },

        addNotification: function (opts){
            // Verify null parameter
            if (!opts || 0 === opts.length){
                AppBar.log('Trying to add notification with null parameter, action aborted.');
                return;
            }
            // Notification is empty, null or undefined
            if ( !opts.ttext || 0 === opts.ttext.length ){
                AppBar.log('Trying to add empty notification, action aborted.');
                return;
            }
            // Check if icon, btext and link are empty, null or undefined
            opts.iname = (!opts.iname || 0 === opts.iname.length) ? 'feedback' : opts.iname;
            opts.btext = (!opts.btext || 0 === opts.btext.length) ? '' : opts.btext;
            opts.link = (!opts.link || 0 === opts.link.length) ? "javascript:void(0)" : opts.link;

            var listItem = document.createElement('li');
            var itemAnchor = document.createElement('a');
            itemAnchor.tabIndex = 0;
            itemAnchor.href = opts.link;
            // Notification Left
            var divNotificationLeft = document.createElement('div');
            divNotificationLeft.className = "sb-notification-left";

            var spanNotificationIcon = document.createElement('span');
            spanNotificationIcon.className = "sb-notification-icon";

            var icon = document.createElement('i');
            icon.className = "material-icons";
            icon.appendChild( document.createTextNode(opts.iname) );
            spanNotificationIcon.appendChild( icon );

            divNotificationLeft.appendChild (spanNotificationIcon);

            // Notification Right - body
            var divNotificationBody = document.createElement('div');
            divNotificationBody.className = "sb-notification-body";

            var spanHeading = document.createElement('span');
            spanHeading.className = "sb-notification-heading";

            var headingText = document.createElement('strong');
            headingText.appendChild( document.createTextNode(opts.ttext) );
            spanHeading.appendChild( headingText );

            divNotificationBody.appendChild( spanHeading );


            var spanBody = document.createElement('span');
            spanBody.className = "sb-notification-time";

            var bodyText = document.createElement('small');
            bodyText.appendChild( document.createTextNode(opts.btext) );
            spanBody.appendChild( bodyText );

            divNotificationBody.appendChild( spanBody );

            // Notification Controls

            var divNotificationControls = document.createElement('div');
            divNotificationControls.className = "sb-notification-controls";

            var doneButton = document.createElement('button');
            doneButton.className = "sb-notification-done";

            var doneIcon = document.createElement('i');
            doneIcon.className = "material-icons";
            doneIcon.appendChild( document.createTextNode("done") );
            doneButton.appendChild( doneIcon );

            divNotificationControls.appendChild( doneButton );

            // Add itens to anchor
            itemAnchor.appendChild( divNotificationLeft );
            itemAnchor.appendChild( divNotificationBody );
            itemAnchor.appendChild( divNotificationControls );
            // Add anchor to list item
            listItem.appendChild( itemAnchor );
            // Add list item to list
            this.$notificationsList.appendChild( listItem );

            AppBar.addEventListener(doneButton, 'click', AppBar.bind(this._onRemoveNotification, this));
            this._ChangeNotificationsCount(1);
        },

        createDemoNotifications: function (){
            this.addNotification({iname:'lock', ttext:'Privacy setting changed.', btext:'8 min ago'});
            this.addNotification({iname:'shopping_cart', ttext:'Order completed.', btext:'24 mins atrás'});
            this.addNotification({iname:'perm_contact_calendar', ttext:'New event started!', btext:'16 hours ago'});
            this.addNotification({iname:'settings', ttext:'Updated app configuration.', btext:'2 days ago'});
            this.addNotification({iname:'comment', ttext:'Lucas sent you a new message.', btext:'4 days ago'});
        },

        _onRemoveNotification: function(event){
            AppBar.stopEventPropagation(event);
            if(event.target.nodeName.toUpperCase() === "I"){
                AppBar.removeElement(event.target.parentElement.parentElement.parentElement.parentElement);
            }
            else {
                AppBar.removeElement(event.target.parentElement.parentElement.parentElement);
            }
            this._ChangeNotificationsCount(-1);
        },

        _ChangeNotificationsCount: function(value) {
            var tmpCount = this.notificationsCount;
            this.notificationsCount = this.notificationsCount + value;

            if (tmpCount == 0 && value > 0){
                AppBar.addClass(this.$button.parentElement, 'sb-has-notification');
            }
            else if (this.notificationsCount < 0){
                this.notificationsCount = 0;
            }

            AppBar.innerText(this.$notificationsBadge, this.notificationsCount);

            if(this.notificationsCount < 1) {
                AppBar.removeClass(this.$button.parentElement, 'sb-has-notification');
                AppBar.innerText(this.$notificationsTop, 'There are no notifications! =P');
            } else if (this.notificationsCount == 1){
                AppBar.innerText(this.$notificationsTop, 'You have 1 new notification');

            } else {
                AppBar.innerText(this.$notificationsTop, 'You have ' + this.notificationsCount + ' new notifications');
            }
        },

        _onNotificationsDrawerClick: function(event) {
            AppBar.stopEventPropagation(event);
        },

        _onButtonClick: function(event) {
            AppBar.stopEventPropagation(event);
            AppBar.toggleClass(this.$arrow,'sb-show');
            AppBar.toggleClass(this.$arrowShadow,'sb-show');
            AppBar.toggleClass(this.$notificationsDrawer,'sb-show');
            var ariaValue = !(this.$notificationsDrawer.getAttribute('aria-hidden') == "true");
            this.$button.setAttribute('aria-expanded', !ariaValue);
            this.$notificationsDrawer.setAttribute('aria-hidden', ariaValue);
            if(!this.open){
                AppBar.AppLauncher.close();
                AppBar.AccountInfo.close();
            }
            this.open = !this.open;
        }
    };

    AppBar.OpenAM = {
        cookieName: null,
        cookieVal: null,
        serverUrl: 'https://10.40.1.154:8443/openam',
        baseUrl: 'https://10.40.1.154:8443/openam',
        loginUrl: 'https://10.40.1.154:8443/openam/UI/Login',
        profileUrl: 'https://10.40.1.154:8443/openam/XUI/#profile/details',
        returnUrl: 'https://10.40.1.154/AppLauncher',
        isLandingPage: false,
        userData: null,
        isLoggedIn: false,
        loginService: null,
        loginmodule: null,
        maxProfileCacheSeconds: 180,
        maxApplicationCacheSeconds: 180,
        useCache: true,
        globalApplications: [],
        userApplications: [],
        allApplications: [],
        realm: '/',
        _onApplicationFetched: function (callback) {
            this.allApplications = AppBar.arrayUnion(this.globalApplications, this.userApplications, function(g1, g2) { return g1.dashboardName[0] === g2.dashboardName[0]; });

            if(this.allApplications && this.allApplications.length >0){
                AppBar.sortArray(this.allApplications, 'dashboardName');
                var tmpList = [];

                for (var i=0; i < this.allApplications.length; i++){
                    var tmpObj = {icon: this.allApplications[i].dashboardIcon[0], text: this.allApplications[i].dashboardDisplayName[0], link: this.allApplications[i].dashboardLogin[0]};
                    if(tmpObj.icon.indexOf('http')<0){
                        tmpObj.icon = this.serverUrl + '/XUI/' + tmpObj.icon;
                    }
                    tmpList.push(tmpObj);
                }
                this.allApplications = tmpList;
            }

            callback();
        },
        _getCookieValue: function () {
            if((!this.cookieName || 0 === this.cookieName.length)){
               this.cookieName = "iPlanetDirectoryPro";
            }
            if((!this.cookieVal || 0 === this.cookieVal.length)){
               this.cookieVal = AppBar.getCookie(this.cookieName);
            }
            return this.cookieVal;
        },
        _fetchAvaliableApps: function (callback) {
            var fetchApps = true;
            if(AppBar.supportsLocalStorage() && this.useCache) {
                var tmpApplications = localStorage.getItem("sbGlobalApplications");
                if(tmpApplications) {
                    var updateTime = localStorage.getItem("sbApplicationsUpdateTime");
                    if (updateTime) {
                        updateTime = new Date(updateTime);
                        if (Math.abs((updateTime.getTime() - (new Date()).getTime())/1000) > this.maxApplicationCacheSeconds) {
                            localStorage.removeItem("sbGlobalApplications");
                            localStorage.removeItem("sbUserApplications");
                        } else {
                            this.globalApplications = JSON.parse(tmpApplications);
                            fetchApps = false;
                        }
                    }
                }
            }

            if(fetchApps) {
                var cookieVal = this._getCookieValue();

                var url = this.serverUrl + '/json/dashboard?_action=listAvailable&realm=' + encodeURIComponent(this.realm);

                var request = new XMLHttpRequest();

                request.open('POST', url, true);
                request.withCredentials = true;
                if(cookieVal != null){
                    request.setRequestHeader('iplanetDirectoryPro', cookieVal);
                }
                request.setRequestHeader('Cache-Control', 'no-cache');
                request.setRequestHeader('Content-Type', 'application/json');

                request.onload = AppBar.bind(function() {
                    if (request.status >= 200 && request.status < 400) {
                        this.globalApplications = AppBar.objectToArray(JSON.parse(request.responseText));
                        if(AppBar.supportsLocalStorage() && this.useCache) {
                            localStorage.setItem("sbGlobalApplications", JSON.stringify(this.globalApplications));
                            localStorage.setItem("sbApplicationsUpdateTime", (new Date()).toString());
                        }
                        if(this.isLoggedIn){
                            this._fetchAssignedApps(callback);
                        }
                        else {
                            this._onApplicationFetched(callback);
                        }
                    }
                    else{
                        this.globalApplications = [];
                        this._onApplicationFetched(callback);
                    }
                }, this);

                request.onerror = AppBar.bind(function() {
                    // There was a connection error of some sort
                    this._onApplicationFetched(callback);
                }, this);

                request.send();
            }
            else{
                if(this.isLoggedIn){
                    this._fetchAssignedApps(callback);
                }
                else {
                    this._onApplicationFetched(callback);
                }
            }
        },
        _fetchAssignedApps: function (callback) {
            var fetchApps = true;
            if(AppBar.supportsLocalStorage() && this.useCache) {
                var tmpApplications = localStorage.getItem("sbUserApplications");
                if(tmpApplications) {
                    this.userApplications = JSON.parse(tmpApplications);
                    fetchApps = false;
                }
            }

            if (fetchApps) {
                var cookieVal = this._getCookieValue();

                var url = this.serverUrl + '/json/dashboard/assigned?t=' + new Date().getTime();

                var request = new XMLHttpRequest();

                request.open('GET', url, true);
                request.withCredentials = true;

                if (cookieVal != null) {
                    request.setRequestHeader('iplanetDirectoryPro', cookieVal);
                }
                request.setRequestHeader('Content-Type', 'application/json');
                request.setRequestHeader('Cache-Control', 'no-cache');

                request.onload = AppBar.bind(function() {
                    if (request.status >= 200 && request.status < 400) {
                        this.userApplications = AppBar.objectToArray(JSON.parse(request.responseText));
                        if(AppBar.supportsLocalStorage() && this.useCache) {
                            localStorage.setItem("sbUserApplications", JSON.stringify(this.userApplications));
                        }
                        this._onApplicationFetched(callback);
                    }
                    else{
                        this.userApplications = [];
                        this._onApplicationFetched(callback);
                    }
                }, this);

                request.onerror = AppBar.bind(function() {
                    this._onApplicationFetched(callback);
                }, this);

                request.send();
            }
            else {
                this._onApplicationFetched(callback);
            }
        },
        _onAuthenticate: function (result, callback){
            this.isLoggedIn = result;
            this.applications(callback);
        },
        applications: function (callback){
            this._fetchAvaliableApps(callback);
        },
        initialise: function (callback){
            var queryData = {};
            if (this.realm != '/') {
                queryData.realm = this.realm;
            }
            if (this.loginModule) {
                queryData.module = this.loginModule;
            }
            if (this.loginService) {
                queryData.service = this.loginService;
            }
            if (this.returnUrl) {
                queryData.goto= this.returnUrl;
            }

            queryData = AppBar.encodeQueryData(queryData);

            this.loginUrl = this.baseUrl + '/UI/Login';

            if (queryData.length > 0) {
                this.loginUrl = this.loginUrl + '?' + queryData;
            }

            this.profileUrl = this.baseUrl + '/XUI/#profile/details';

            this.authenticate(callback);
        },
        authenticate: function (callback){
            var cookieVal = this._getCookieValue();

            var url = this.serverUrl + '/json/users?_action=idFromSession';

            var request = new XMLHttpRequest();
            request.open('POST', url, true);
            request.withCredentials = true;

            if(cookieVal != null){
                request.setRequestHeader('iplanetDirectoryPro', cookieVal);
            }
            request.setRequestHeader('Content-Type', 'application/json');
            request.setRequestHeader('Cache-Control', 'no-cache');

            request.onload = AppBar.bind(function() {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    var data = JSON.parse(request.responseText);
                    if(this.isLandingPage){
                        window.location = this.returnUrl;
                    }
                    else{

                        if(AppBar.supportsLocalStorage() && this.useCache){
                            this.userData = JSON.parse(localStorage.getItem("sbUserData"));
                            if(this.userData != null){
                                if(this.userData.uid != data.id) {
                                    this.userData = null;
                                    localStorage.removeItem("sbUserData");
                                    localStorage.removeItem("sbGlobalApplications");
                                    localStorage.removeItem("sbUserApplications");
                                }
                                else if((Math.abs(((new Date(this.userData.updateTime)).getTime() - (new Date()).getTime())/1000) > this.maxProfileCacheSeconds)) {
                                    this.userData = null;
                                    localStorage.removeItem("sbUserData");
                                }
                            }
                        }

                        if(!this.userData){
                            var url1 = this.serverUrl + '/json/users/' + data.id + '?_fields=uid,mail,cn,jpegPhoto&t=' + new Date().getTime();

                            var request1 = new XMLHttpRequest();

                            request1.open('GET', url1, true);
                            request1.withCredentials = true;

                            if(cookieVal != null){
                                request1.setRequestHeader('iplanetDirectoryPro', cookieVal);
                            }
                            request1.setRequestHeader('Content-Type', 'application/json');
                            request1.setRequestHeader('Cache-Control', 'no-cache');

                            request1.onload = AppBar.bind(function() {
                                if (request1.status >= 200 && request1.status < 400) {
                                    this.userData = JSON.parse(request1.responseText);
                                    this.userData.updateTime = (new Date()).toString();
                                    if(AppBar.supportsLocalStorage() && this.useCache){
                                        localStorage.setItem("sbUserData", JSON.stringify(this.userData));
                                    }
                                    this._onAuthenticate(true, callback);
                                }
                                else{
                                    this.userData = null;
                                    this._onAuthenticate(false, callback);
                                }
                            }, this);

                            request1.onerror = AppBar.bind(function() {
                                // There was a connection error of some sort
                                this._onAuthenticate(false, callback);
                            }, this);
                            request1.send();
                        }
                        else {
                            this._onAuthenticate(true, callback);
                        }
                    }
                } else {
                    this._onAuthenticate(false, callback);
//                    AppBar.AccountInfo.addLoginButton(this.loginUrl + '?goto=' + this.returnUrl);
                }
            }, this);

            request.onerror = AppBar.bind(function() {
              // There was a connection error of some sort
              this._onAuthenticate(false, callback);
            }, this);

            request.send();

        },
        logout: function () {
            var cookieVal = this._getCookieValue();

            var url = this.serverUrl + '/json/sessions/?_action=logout';
            var request = new XMLHttpRequest();
            request.open('POST', url, true);
            request.withCredentials = true;

            if(cookieVal != null){
                request.setRequestHeader('iplanetDirectoryPro', cookieVal);
            }
            request.setRequestHeader('Content-Type', 'application/json');
            request.setRequestHeader('Cache-Control', 'no-cache');

            request.onload = AppBar.bind(function() {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    AppBar.eraseCookie(this.cookieName);
                }
                if (this.returnUrl != null && this.returnUrl.length > 0) {
                    window.location = this.loginUrl;
                }
                else {
                    window.location = this.serverUrl;
                }
            }, this);

            request.onerror = AppBar.bind(function() {
                var logoutURL = this.baseUrl + '/UI/Logout';
                if (this.returnUrl) {
                    logoutURL =  logoutURL + '?goto=' + this.returnUrl;
                }
                window.location = logoutURL;
            }, this);

            request.send();
        },
        accountSettings: function (){
            if(this.profileUrl && this.profileUrl.length > 0){
                window.location = this.profileUrl;
            }
        }
    };

    AppBar.DummyAM = {
        cookieName: null,
        cookieVal: null,
        isLandingPage: false,
        isLoggedIn: false,
        maxProfileCacheSeconds: 180,
        maxApplicationCacheSeconds: 180,
        useCache: true,
        loginUrl: 'javascript:void(0)',
        globalApplications: [],
        userApplications: [],
        allApplications: [],
        _onApplicationFetched: function (callback) {
            this.allApplications = AppBar.arrayUnion(this.globalApplications, this.userApplications, function(g1, g2) { return g1.dashboardName[0] === g2.dashboardName[0]; });

            if(this.allApplications && this.allApplications.length >0){
                AppBar.sortArray(this.allApplications, 'dashboardName');
                var tmpList = [];

                for (var i=0; i < this.allApplications.length; i++){
                    var tmpObj = {icon: this.allApplications[i].dashboardIcon[0], text: this.allApplications[i].dashboardDisplayName[0], link: this.allApplications[i].dashboardLogin[0]};
                    if(tmpObj.icon.indexOf('http')<0){
                        tmpObj.icon = this.serverUrl + '/XUI/' + tmpObj.icon;
                    }
                    tmpList.push(tmpObj);
                }
                this.allApplications = tmpList;
            }

            callback();
        },
        _getCookieValue: function () {
            if((!this.cookieName || 0 === this.cookieName.length)){
               this.cookieName = "Dummy";
            }
            if((!this.cookieVal || 0 === this.cookieVal.length)){
               this.cookieVal = AppBar.getCookie(this.cookieName);
            }
            return this.cookieVal;
        },
        _fetchAvaliableApps: function (callback) {
            if(AppBar.supportsLocalStorage() && this.useCache) {
                var tmpApplications = localStorage.getItem("sbGlobalApplications");
                if(tmpApplications) {
                    var updateTime = localStorage.getItem("sbApplicationsUpdateTime");
                    if (updateTime) {
                        updateTime = new Date(updateTime);
                        if (Math.abs((updateTime.getTime() - (new Date()).getTime())/1000) > this.maxApplicationCacheSeconds) {
                            localStorage.removeItem("sbGlobalApplications");
                            localStorage.removeItem("sbUserApplications");
                        } else {
                            this.globalApplications = JSON.parse(tmpApplications);
                            fetchApps = false;
                        }
                    }
                }
            }

            if(this.isLoggedIn){
                this._fetchAssignedApps(callback);
            }
            else {
                this._onApplicationFetched(callback);
            }
        },
        _fetchAssignedApps: function (callback) {
            if(AppBar.supportsLocalStorage() && this.useCache) {
                var tmpApplications = localStorage.getItem("sbUserApplications");
                if(tmpApplications) {
                    this.userApplications = JSON.parse(tmpApplications);
                    fetchApps = false;
                }
            }

            this._onApplicationFetched(callback);
        },
        _onAuthenticate: function (result, callback){
            this.isLoggedIn = result;
            this.applications(callback);
        },
        applications: function (callback){
            this._fetchAvaliableApps(callback);
        },
        initialise: function (callback){
            this.authenticate(callback);
        },
        authenticate: function (callback){
            var cookieVal = this._getCookieValue();

            this._onAuthenticate(this.isLoggedIn, callback);
        },
        logout: function () {
            if(this.logoutURL && this.logoutURL.length > 0){
                window.location = this.logoutURL;
            }
        },
        accountSettings: function (){
            if(this.profileUrl && this.profileUrl.length > 0){
                window.location = this.profileUrl;
            }
        }
    };

    AppBar.AppLauncher = {

        open: false,

        $button: null,

        $launcher: null,

        $more: null,

        $moreContent: null,

        $arrowShadow: null,

        $arrow: null,

        scroll: false,

        launcherMaxHeight: 190,

        launcherMinHeight: 190,

        initialise: function(callback) {
            // Go!

            // Setup elements
            // Button Container
            var divAppLauncherButton = document.createElement('div');
            divAppLauncherButton.className = "sb-launcher-button";
            // Button
            this.$button = document.createElement('a');
            this.$button.href = "javascript:void(0)";
            this.$button.tabIndex = 0;
            this.$button.title = "Apps SERPRO";
            this.$button.setAttribute('aria-expanded', 'false');
            // Button Icon
            var buttonIcon = document.createElement('i');
            buttonIcon.className = "material-icons";
            buttonIcon.appendChild( document.createTextNode("apps") );
            this.$button.appendChild( buttonIcon );
            // Arrow Shadow
            this.$arrowShadow = document.createElement('div');
            this.$arrowShadow.className = "sb-arrow-shadow";
            this.$button.appendChild( this.$arrowShadow );
            // Arrow
            this.$arrow = document.createElement('div');
            this.$arrow.className = "sb-arrow-back";
            this.$button.appendChild( this.$arrow );

            divAppLauncherButton.appendChild( this.$button );

            // App Launcher
            this.$launcher = document.createElement('div');
            this.$launcher.className = "sb-app-launcher";
            this.$launcher.setAttribute('aria-hidden', 'true');

            var ulFirstSet = document.createElement('ul');
            ulFirstSet.className = "sb-first-set";
            ulFirstSet.setAttribute('aria-dropeffect', 'move');

            this.$launcher.appendChild( ulFirstSet );

            // More Button
            this.$more = document.createElement('a');
            this.$more.tabIndex = 0;
            this.$more.href = "javascript:void(0)";
            this.$more.className = "sb-more";
            var moreSpan = document.createElement('span');
            moreSpan.appendChild(document.createTextNode("More"));
            this.$more.appendChild( moreSpan );
            this.$more.setAttribute('aria-expanded', 'false');
            this.$more.setAttribute('aria-hidden', 'true');
            this.$launcher.appendChild( this.$more );

            // Second Set
            this.$moreContent = document.createElement('div');
            this.$moreContent.className = "sb-second-set sb-hide";
            this.$moreContent.appendChild( document.createTextNode("\nContact your products administrator to know about other products.\n\n"));
            this.$moreContent.setAttribute('aria-hidden', 'true');
            this.$moreContent.setAttribute('aria-dropeffect', 'move');
            this.$launcher.appendChild( this.$moreContent );

            AppBar.$container.insertBefore(this.$launcher, AppBar.$container.firstChild);
            AppBar.$container.insertBefore(divAppLauncherButton, AppBar.$container.firstChild);

            this.$launcher.addEventListener('click',  AppBar.bind(this._onAppLauncherClick, this));
            AppBar.onMouseWheel(this.$launcher, AppBar.bind(this._onAppLauncherMouseWheel, this));
            this.$launcher.addEventListener('scroll', AppBar.bind(this._onScroll, this));

            this.$button.addEventListener('click', AppBar.bind(this._onButtonClick, this));

            this.$more.addEventListener('click', AppBar.bind(this._onMoreClick, this));

            document.addEventListener('click', AppBar.bind(function() {
               this.close();
            }, this));

             // Resize event handler to maintain the max-height of the app launcher
            window.addEventListener('resize', AppBar.bind(function(){
                    this.$launcher.style.maxHeight = (AppBar.screenHeight() - AppBar.offset(this.$launcher).top) + "px";
            }, this));

            this.clearApplicationList();
            this.populateApplicationList();
            this.createDemoApps();
            if(callback) {
                callback();
            }
        },

        close: function() {
             if(this.open){
                this.scroll = false;
                this.$launcher.scrollTop = 0;

                this.$launcher.setAttribute('aria-hidden', 'true');
                this.$button.setAttribute('aria-expanded', 'false');
                this.$more.setAttribute('aria-hidden', 'true');
                this.$more.setAttribute('aria-expanded', 'false');
                this.$moreContent.setAttribute('aria-hidden','true');
                this.$launcher.style.height = this.launcherMaxHeight + 'px';

                AppBar.removeClass(this.$launcher, 'sb-overflow');
                AppBar.removeClass(this.$arrow,'sb-show');
                AppBar.removeClass(this.$arrowShadow,'sb-show');
                AppBar.removeClass(this.$launcher,'sb-show');
                AppBar.addClass(this.$moreContent, 'sb-hide');

                this.open = false;
            }
        },

        clearApplicationList: function (){
            this.$launcher.childNodes[0].innerHTML = "";
        },

        populateApplicationList: function (){
            if(AppBar.Backend.allApplications && AppBar.Backend.allApplications.length > 0) {
                for (var i=0; i < AppBar.Backend.allApplications.length; i++){
                    this.addAppButton(AppBar.Backend.allApplications[i]);
                }
            }
        },

        addAppButton: function (opts){
            // Verify null parameter
            if (!opts || 0 === opts.length){
                AppBar.log('Trying to add app button with null parameter, action aborted.');
                return;
            }

            if ((!opts.text || 0 === opts.text.length) || (!opts.icon || 0 === opts.icon.length)){
                AppBar.log('Trying to add app button without icon or text, action aborted.');
            }

            // Check if link is empty, null or undefined
            opts.link = (!opts.link || 0 === opts.link.length) ? "javascript:void(0)" : opts.link;

            var listItem = document.createElement('li');
            var appButton= document.createElement('a');
            appButton.tabIndex = 0;
            appButton.href = opts.link;

            var buttonImage = document.createElement('img');
            buttonImage.src = opts.icon;
            appButton.appendChild( buttonImage );

            var buttonText = document.createElement('span');
            buttonText.appendChild( document.createTextNode(opts.text) );
            appButton.appendChild( buttonText );

            listItem.appendChild( appButton );

            this.$launcher.childNodes[0].appendChild( listItem );
        },

        createDemoApps: function (){
            // Expresso Button
            this.addAppButton ({icon: 'http://icons.iconarchive.com/icons/hamzasaleem/stock/48/Mail-icon.png', text: 'Mail'});
            this.addAppButton ({icon: 'http://icons.iconarchive.com/icons/hamzasaleem/stock/48/Messages-icon.png', text: 'Chat'});
        },

        _onAppLauncherClick: function(event) {
            AppBar.stopEventPropagation(event);
        },

        _onAppLauncherMouseWheel: function(event) {
            if(event.deltaYFix > 0) {
              // Scrolling up
            }
            else{
                // Scrolling down
                if(!this.scroll){
                    AppBar.stopEventPropagation(event);
                    AppBar.removeClass(this.$moreContent, 'sb-hide');
                    this.$launcher.style.height = this.launcherMinHeight + 'px';
                    AppBar.addClass(this.$launcher, 'sb-overflow');
                    this.scroll = true;
                    AppBar.scrollElToY(this.$launcher.scrollTop, event.deltaYFix * -1);
                }
            }
        },

        _onScroll: function() {
            var pos = this.$launcher.scrollTop;
            if(pos == 0){
                this.scroll =false;
                this.$launcher.style.height = this.launcherMaxHeight + 'px';
                AppBar.removeClass(this.$launcher, 'sb-overflow');
                this.$more.setAttribute('aria-expanded', 'false');
                this.$moreContent.setAttribute('aria-hidden','true');
                AppBar.addClass(this.$moreContent,'sb-hide');
            }
        },

        _onButtonClick: function(event) {
            AppBar.stopEventPropagation(event);
            AppBar.toggleClass(this.$arrow,'sb-show');
            AppBar.toggleClass(this.$arrowShadow,'sb-show');
            AppBar.toggleClass(this.$launcher,'sb-show');
            var ariaValue = !(this.$launcher.getAttribute('aria-hidden') == "true");
            this.$button.setAttribute('aria-expanded', !ariaValue);
            this.$launcher.setAttribute('aria-hidden', ariaValue);
            this.$more.setAttribute('aria-hidden', ariaValue);
            if(!this.open){
                AppBar.Notifications.close();
                AppBar.AccountInfo.close();
            }
            this.open = !this.open;
        },

        _onMoreClick: function(event) {
            AppBar.stopEventPropagation(event);
            this.$moreContent.setAttribute('aria-hidden','false');
            AppBar.removeClass(this.$moreContent, 'sb-hide');
            this.$more.setAttribute('aria-expanded', 'sb-true');
            AppBar.addClass(this.$launcher,'sb-overflow');
            AppBar.scrollElToY(this.$launcher, this.$launcher.scrollHeight);
        }
    };

    AppBar.Backend = null;

    AppBar.toInit = [];

    AppBar.$container = null;

    AppBar.CONFIG = {
        notifications: false,
        applauncher: true,
        account: true,
        backend: 'OpenAM',
        skin: 'light',
        float: 'none',
        parentnode: null,
        insertmode: 'append',
        referencenode: null,
        topbar: false,
        fixed: false,
        customcss: null,
        styleurl: 'css/style.css',
        banckendconfig: {
            serverUrl: 'https://10.40.1.154:8443/openam',
            baseUrl: 'https://10.40.1.154:8443/openam',
            returnUrl: 'https://10.40.1.154/AppLauncher',
            isLandingPage: false
        }
    };

    AppBar.init = function (options) {
        AppBar.log(root.atob('DQogICAgX19fICAgICAgICAgICAgICAgIF9fX18gICAgICAgICAgICANCiAgIC8gICB8ICBfX19fICBfX19fICAvIF9fIClfX19fIF9fX19fXw0KICAvIC98IHwgLyBfXyBcLyBfXyBcLyBfXyAgLyBfXyBgLyBfX18vDQogLyBfX18gfC8gL18vIC8gL18vIC8gL18vIC8gL18vIC8gLyAgICANCi9fLyAgfF8vIC5fX18vIC5fX18vX19fX18vXF9fLF8vXy8gICAgIA0KICAgICAgL18vICAgL18vICAgICAgICAgICAgICAgICAgICAgICAgDQo='));
        AppBar.log('Version: ' + AppBar.VERSION);

        for(var key in options) {
            if(AppBar.CONFIG.hasOwnProperty(key)) {
                if(options[key]) {
                    AppBar.CONFIG[key] = options[key];
                }
            }
        }
        AppBar.addStyleToHead(AppBar.CONFIG.styleurl);

        AppBar.onReady(function() {
            var container = document.querySelectorAll('.app-bar .sb-bar-container');
            if(container && container.length > 0){
                AppBar.$container = container[0];
            }
            else{
                var classes = 'app-bar ' + 'app-bar-' + AppBar.CONFIG.skin;
                if(AppBar.CONFIG.float == 'left'){
                    classes = classes + ' app-bar-float-left';
                }
                else if (AppBar.CONFIG.float == 'right'){
                    classes = classes + ' app-bar-float-right';
                }

                if(AppBar.CONFIG.topbar){
                    classes = classes + ' app-bar-topbar';
                }
                if(AppBar.CONFIG.fixed){
                    classes = classes + ' app-bar-fixed';
                }

                var divAppBar = document.createElement('div');
                divAppBar.className = classes;

                if(AppBar.CONFIG.customcss != null && AppBar.CONFIG.customcss.length > 0) {
                    divAppBar.style.cssText = AppBar.CONFIG.customcss;
                }

                var divBarContainer = document.createElement('div');
                divBarContainer.className = "sb-bar-container";
                divAppBar.appendChild( divBarContainer );
                AppBar.$container = divBarContainer;

                if(AppBar.CONFIG.parentnode != null && AppBar.CONFIG.parentnode.length > 0) {
                    var parentNode = document.querySelectorAll(AppBar.CONFIG.parentnode);
                    if(parentNode != null && parentNode.length > 0) {
                        if(AppBar.CONFIG.topbar){
                            parentNode[0].insertBefore(divAppBar, parentNode[0].firstChild);
                        }
                        else if(AppBar.CONFIG.insertmode === 'append'){
                            parentNode[0].appendChild(divAppBar);
                        }
                        else {
                            if(AppBar.CONFIG.referencenode != null && AppBar.CONFIG.referencenode.length > 0) {
                                var referenceNode = document.querySelectorAll(AppBar.CONFIG.referencenode);
                                if(referenceNode != null && referenceNode.length > 0) {
                                    if(AppBar.CONFIG.insertmode === 'insertAfter' ){
                                        AppBar.insertAfter(divAppBar, referenceNode[0]);
                                    }
                                    else {
                                        parentNode[0].insertBefore(divAppBar, referenceNode[0]);
                                    }
                                }
                                else {
                                    if(AppBar.CONFIG.float == 'right'){
                                        parentNode[0].insertBefore(divAppBar, parentNode[0].firstElementChild);
                                    }
                                    else if (AppBar.CONFIG.float == 'left') {
                                        AppBar.insertAfter(divAppBar, parentNode[0].lastElementChild);
                                    }
                                    else {
                                        parentNode[0].appendChild(divAppBar);
                                    }
                                    AppBar.log('Error, reference node not found');
                                }
                            }
                            else{
                                AppBar.log('Trying to insert AppBar with insertAfter/insertBefore without node reference, thus aborted');
                            }
                        }
                    }
                    else{
                        AppBar.log('Parent node not informed.');
                    }
                }
                else if(AppBar.CONFIG.topbar || AppBar.CONFIG.fixed)
                {
                    document.body.insertBefore(divAppBar, document.body.firstChild);
                }
            }

            if (AppBar.CONFIG.account) {
                AppBar.toInit.push(AppBar.AccountInfo);
            }
            if (AppBar.CONFIG.notifications) {
                AppBar.toInit.push(AppBar.Notifications);
            }
            if (AppBar.CONFIG.applauncher) {
                AppBar.toInit.push(AppBar.AppLauncher);
            }

            AppBar.Backend = AppBar[AppBar.CONFIG.backend];

            if(AppBar.Backend) {
                if(AppBar.CONFIG.banckendconfig){
                    for (var prop in AppBar.CONFIG.banckendconfig) {
                        if (!AppBar.CONFIG.banckendconfig.hasOwnProperty(prop)) {
                            continue;
                        }
                        AppBar.Backend[prop] = AppBar.CONFIG.banckendconfig[prop];
                    }
                }
                AppBar.Backend.initialise(function () {
                    AppBar.queuedInitialization();
                });
            }
        });

    };

    AppBar.queuedInitialization = function (){
        if(AppBar.toInit && AppBar.toInit.length > 0){
            var initFunction = AppBar.toInit.shift();
            initFunction.initialise(AppBar.queuedInitialization);
        }
    };

}.call(this));
