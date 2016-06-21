function Component(obj){
	return {
		constructor: obj.constructor || function(){},
		render: obj.render || function(){return '';}
	};
}

function React() {
    this.class = function(obj) {
				comp = Component(obj);
				comp.constructor();
        return comp;
    };

    this.render = function(component, DOM) {
        var virtualdom = component.render();
        DOM.innerHTML = generateHTML(virtualdom);
    };

    var generateHTML = function(node) {
        if (typeof node !== "object") {
            return node;
        } else if (node instanceof Array) {
            var elem = ""
            for (var i = 0; i < node.length; i++) {
                elem += generateHTML(node[i]);
            }
            return elem;
        } else {
            var e = '';
            e += "<" + node.tag + " ";
            // to render attr we use reflexion
            for (var key in node.attrs) {
                e += key + "='" + node.attrs[key] + "()'";
            }
            e += ">"
            e += generateHTML(node.children);
            e += "</" + node.tag + ">";
            return e;
        }

    };

}
