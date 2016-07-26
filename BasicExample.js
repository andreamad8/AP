function Component(obj) {
    this.constructor = function() {};
    this.render = function() {
        return '';
    };
    for (var key in obj) {
        this[key] = obj[key];
    }
    this.old = null;
}

var React = (function() {
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
            var comp = new Component(obj);
            comp.constructor();
            return comp;
        },
        render: function renderer(component, DOM) {
            var virtualdom = component.render();
            if (!(virtualdom instanceof Component)) {
                DOM.innerHTML = generateHTML(virtualdom);
            } else {
                renderer(virtualdom, DOM);
            }
        }
    };
})();
