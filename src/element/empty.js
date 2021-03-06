import _ from "../util/index";

_.register({

    /**
     * Remove child nodes of current element from the DOM
     * @memberof! $Element#
     * @alias $Element#empty
     * @return {$Element}
     * @function
     * @example
     * var div = DOM.create("div>a+b"); // <div><a></a><b></b></div>
     * div.empty();                     // <div></div>
     */
    empty() {
        return this.set("");
    }

});
