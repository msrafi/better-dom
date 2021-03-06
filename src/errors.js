import _ from "./util/index";

// customized errors

function MethodError(methodName, args, type = "$Element") {
    var url = "<%= pkg.docs %>/" + type + ".html#" + methodName,
        line = "invalid call `" + type + (type === "DOM" ? "." : "#") + methodName + "(";

    line += _.map.call(args, (arg) => String(arg)).join(", ") + ")`;";

    this.message = line + " check " + url + " to verify the function arguments";
}

MethodError.prototype = new TypeError();

function StaticMethodError(methodName, args) {
    MethodError.call(this, methodName, args, "DOM");
}

StaticMethodError.prototype = new TypeError();

export { MethodError, StaticMethodError };
