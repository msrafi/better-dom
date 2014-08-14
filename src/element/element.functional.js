import { $Element } from "../types";

var reInvoke = /cb\.call\(([^)]+)\)/g,
    defaults = {
        BEGIN: "",
        BODY:   "",
        END:  "return this"
    },
    makeLoopMethod = (options) => {
        var code = "%BEGIN%\nfor(var i=0,n=this.length;i<n;++i){%BODY%}%END%", key;

        for (key in defaults) {
            code = code.replace("%" + key + "%", options[key] || defaults[key]);
        }
        // improve performance by using call method on demand
        code = code.replace(reInvoke, (expr, args) => {
            return "(that?" + expr + ":cb(" + args.split(",").slice(1).join() + "))";
        });

        return Function("cb", "that", "undefined", code);
    };

/**
 * Execute callback on each element in the collection
 * @memberof! $Element.prototype
 * @alias $Element#each
 * @param  {Function} callback  function that accepts (element, index, self)
 * @param  {Object}   [context] callback context
 * @return {$Element}
 * @function
 */
$Element.prototype.each = makeLoopMethod({
    BODY:  "cb.call(that, this[i], i, this)"
});

/**
 * Check if the callback returns true for any element in the collection
 * @memberof! $Element.prototype
 * @alias $Element#some
 * @param  {Function} callback   function that accepts (element, index, self)
 * @param  {Object}   [context]  callback context
 * @return {Boolean} true, if any element in the collection return true
 * @function
 */
$Element.prototype.some = makeLoopMethod({
    BODY:  "if (cb.call(that, this[i], i, this) === true) return true",
    END:   "return false"
});

/**
 * Check if the callback returns true for all elements in the collection
 * @memberof! $Element.prototype
 * @alias $Element#every
 * @param  {Function} callback   function that accepts (element, index, self)
 * @param  {Object}   [context]  callback context
 * @return {Boolean} true, if all elements in the collection returns true
 * @function
 */
$Element.prototype.every = makeLoopMethod({
    BEGIN: "var out = true",
    BODY:  "out = cb.call(that, this[i], i, this) && out",
    END:   "return out"
});

/**
 * Create an array of values by running each element in the collection through the callback
 * @memberof! $Element.prototype
 * @alias $Element#map
 * @param  {Function} callback   function that accepts (element, index, self)
 * @param  {Object}   [context]  callback context
 * @return {Array} new array of the results of each callback execution
 * @function
 */
$Element.prototype.map = makeLoopMethod({
    BEGIN: "var out = Array(this && this.length || 0)",
    BODY:  "out[i] = cb.call(that, this[i], i, this)",
    END:   "return out"
});

/**
 * Examine each element in a collection, returning an array of all elements the callback returns truthy for
 * @memberof! $Element.prototype
 * @alias $Element#filter
 * @param  {Function} callback   function that accepts (element, index, self)
 * @param  {Object}   [context]  callback context
 * @return {Array} new array with elements where callback returned true
 * @function
 */
$Element.prototype.filter = makeLoopMethod({
    BEGIN: "var out = []",
    BODY:  "if (cb.call(that, this[i], i, this)) out.push(this[i])",
    END:   "return out"
});

/**
 * Boil down a list of values into a single value (from start to end)
 * @memberof! $Element.prototype
 * @alias $Element#reduce
 * @param  {Function} callback function that accepts (memo, element, index, self)
 * @param  {Object}   [memo]   initial value of the accumulator
 * @return {Object} the accumulated value
 * @function
 */
$Element.prototype.reduce = makeLoopMethod({
    BEGIN: "var len = arguments.length; if (len < 2) that = this[0]",
    BODY:  "that = cb(that, this[len < 2 ? i + 1 : i], i, this)",
    END:   "return that"
});

/**
 * Boil down a list of values into a single value (from end to start)
 * @memberof! $Element.prototype
 * @alias $Element#reduceRight
 * @param  {Function} callback function that accepts (memo, element, index, self)
 * @param  {Object}   [memo]   initial value of the accumulator
 * @return {Object} the accumulated value
 * @function
 */
$Element.prototype.reduceRight = makeLoopMethod({
    BEGIN: "var j, len = arguments.length; if (len < 2) that = this[this.length - 1]",
    BODY:  "j = n - i - 1; that = cb(that, this[len < 2 ? j - 1 : j], j, this)",
    END:   "return that"
});

/**
 * Execute code in a 'unsafe' block where the first callback argument is native object.
 * @memberof! $Element.prototype
 * @alias $Element#legacy
 * @param  {Function} callback function that accepts (node, element, index, self)
 * @return {$Element}
 * @function
 */
$Element.prototype.legacy = makeLoopMethod({
    BODY:  "cb.call(that, this[i]._._node, this[i], i, this)"
});