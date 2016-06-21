var React = (function() {

    var Component = function(obj) {
        if (typeof obj.constructor !== "function")
            obj.constructor = function() {};
        if (typeof obj.render !== "function")
            obj.render = function() {
                return '';
            };
        return obj;
    };

    var generateHTML = function(node) {
        if (typeof node !== "object") {
            return node;
        } else if (node instanceof Array) {
            var elem = "";
            for (var i = 0; i < node.length; i++) {
                elem += generateHTML(node[i]);
            }
            return elem;
        } else {
            var e = '';
            e += "<" + node.tag + " ";
            for (var key in node.attrs) {
                e += key + "='" + node.attrs[key] + "'";
            }
            e += ">";
            e += generateHTML(node.children);
            e += "</" + node.tag + ">";
            return e;
        }
    };
    return {
        class: function(obj) {
            comp = Component(obj);
            comp.constructor();
            return comp;
        },
        render: function renderer(component, DOM) {
            var virtualdom = component.render();
            DOM.innerHTML = generateHTML(virtualdom);
        }
    };
})();
