define(["Element"], function(DOMElement, slice) {
    "use strict";

    // STYLES MANIPULATION
    // -------------------
    
    (function() {
        var getStyleHooks = {},
            setStyleHooks = {},
            rdash = /\-./g,
            rcamel = /[A-Z]/g,
            dashSeparatedToCamelCase = function(str) { return str[1].toUpperCase(); },
            camelCaseToDashSeparated = function(str) { return "-" + str.toLowerCase(); },
            computed = getComputedStyle(document.documentElement),
            // In Opera CSSStyleDeclaration objects returned by getComputedStyle have length 0
            props = computed.length ? slice.call(computed) : _.map(_.keys(computed), function(key) { return key.replace(rcamel, camelCaseToDashSeparated); });
        
        _.forEach(props, function(propName) {
            var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
                unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
                stylePropName = propName.replace(rdash, dashSeparatedToCamelCase);

            // some browsers start vendor specific props in lowecase
            if (!(stylePropName in computed)) {
                stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
            }

            if (stylePropName !== propName) {
                getStyleHooks[unprefixedName] = function(style) {
                    return style[stylePropName];
                };

                setStyleHooks[unprefixedName] = function(name, value) {
                    return propName + ":" + value;
                };
            }
        });

        // shortcuts
        _.forOwn({
            font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
            padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
            margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
            "border-width": ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
            "border-style": ["borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle"]
        }, function(value, key) {
            getStyleHooks[key] = function(style) {
                var result = [],
                    hasEmptyStyleValue = function(prop, index) {
                        result.push(prop === "/" ? prop : style[prop]);

                        return !result[index];
                    };

                return _.some(value, hasEmptyStyleValue) ? "" : result.join(" ");
            };
        });

        // normalize float css property
        if ("cssFloat" in computed) {
            getStyleHooks.float = function(style) {
                return style.cssFloat;
            };
        } else {
            getStyleHooks.float = function(style) {
                return style.styleFloat;
            };
        }

        _.forEach("fill-opacity font-weight line-height opacity orphans widows z-index zoom".split(" "), function(propName) {
            // Exclude the following css properties to add px
            setStyleHooks[propName] = function(name, value) {
                return name + ":" + value;
            };
        });

        /**
         * Get css style from element
         * @memberOf DOMElement.prototype
         * @param  {String} name property name
         * @return {String} property value
         */
        DOMElement.prototype.getStyle = function(name) {
            var style = this._node.style,
                hook, result;

            if (typeof name !== "string") {
                throw this.makeError("getStyle");
            }

            hook = getStyleHooks[name];

            result = hook ? hook(style) : style[name];

            if (!result) {
                style = getComputedStyle(this._node);

                result = hook ? hook(style) : style[name];
            }

            return result || "";
        };

        /**
         * Set css style for element
         * @memberOf DOMElement.prototype
         * @param {String} name  property name
         * @param {String} value property value
         * @return {DOMElement} reference to this
         */
        DOMElement.prototype.setStyle = function(name, value) {
            var nameType = typeof name,
                hook, cssText;

            if (nameType === "string") {
                hook = setStyleHooks[name];

                cssText = ";" + (hook ? hook(name, value) : name + ":" + (typeof value === "number" ? value + "px" : value));
            } else if (nameType === "object") {
                cssText = _.reduce(_.keys(name), function(cssText, key) {
                    value = name[key];
                    hook = setStyleHooks[key];

                    return cssText + ";" + (hook ? hook(key, value) : key + ":" + (typeof value === "number" ? value + "px" : value));
                }, "");
            } else {
                throw this.makeError("setStyle");
            }

            this._node.style.cssText += cssText;

            return this;
        };
    })();
});