

var React = (function() {
    var index = 0;
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
    var fl = {
        MARKER: 3,
        LEAF: 1,
        NEWNODE: 2,
        TAG: 4,
        ATT: 5,
        DEL: 6
    };
    var generateHTML = function(node, funTemplate) {
        if (typeof node !== "object") {
            return node;
        } else if (node instanceof Array) {
            var elem = "";
            for (var i = 0; i < node.length; i++) {
                elem += generateHTML(node[i], funTemplate);
            }
            return elem;
        } else {
            var e = '';
            e += "<" + node.tag;
            for (var key in node.attrs) {
                var funobj = node.attrs[key];
                (function(funobj) {
                    window[funobj.name] = function(e) {
                        funTemplate(funobj.fun, e);
                    };
                })(funobj);
                if (!funobj.name) {
                    e += " " + key + "='" + node.attrs[key] + "'";
                } else {
                    e += " " + key + "='" + funobj.name + "(event)'";
                }
            }
            e += ">";
            e += generateHTML(node.children, funTemplate);
            e += "</" + node.tag + ">";
            return e;
        }
    };
    var diff = function(oldVdom, newVdom) {
        switch (type(oldVdom, newVdom)) {
            case "array":
                for (var i = 0; i < newVdom.length; i++) {
                    var val = diff(oldVdom[i], newVdom[i]);
                    if (val) {
                        newVdom.flag = fl.MARKER;
                        return val;
                    }
                }
                break;
            case "object":
                if (oldVdom.tag !== newVdom.tag) {
                    newVdom.flag = fl.TAG;
                    return fl.MARKER;
                } else {
                    for (var key in newVdom.attrs) {
                        if (key !== "onClick" && newVdom.attrs[key] !== oldVdom.attrs[key]) {
                            newVdom.flag = fl.ATT;
                            return fl.MARKER;
                        }
                    }

                }
                var childVal = diff(oldVdom.children, newVdom.children);
                if (childVal === fl.LEAF || childVal === fl.NEWNODE ||
                    childVal === fl.MARKER || childVal === fl.DEL) {
                    newVdom.flag = childVal;
                    return fl.MARKER;
                }
                break;
            case "literal":
                if (oldVdom !== newVdom) {
                    return fl.LEAF;
                }
                break;
            case "del":
                return fl.DEL;
            case "ins":
                return fl.NEWNODE;

        }
    };
    var type = function(oldVdom, newVdom) {
        if (oldVdom instanceof Array && newVdom instanceof Array) {
            if (oldVdom.length > newVdom.length) {
                return "del";
            } else if (oldVdom.length < newVdom.length) {
                return "ins";
            } else {
                return "array";
            }
        } else if (typeof oldVdom === "object" && typeof newVdom === "object")
            return "object";
        else if (typeof oldVdom === "string" && typeof newVdom === "string" ||
            typeof oldVdom === "number" && typeof newVdom === "number")
            return "literal";
        else
            return null;
    };
    var patch = function(newVdom, DOM, f) {
        if (typeof newVdom !== "object") {
            return newVdom;
        } else if (newVdom instanceof Array) {
            for (var i = 0; i < newVdom.length; i++) {
                patch(newVdom[i], DOM[i]);
            }
        } else {
            switch (newVdom.flag) {
                case fl.LEAF:
                    DOM.innerHTML = newVdom.children;
                    break;
                case fl.TAG:
                    DOM.outerHTML = generateHTML(newVdom, f);
                    break;
                case fl.ATT:
                    for (var key in newVdom.attrs) {
                        DOM.setAttribute(key, newVdom.attrs[key]);
                    }
                    break;
                case fl.DEL:
                    DOM.outerHTML = generateHTML(newVdom, f);
                    break;
                case fl.NEWNODE:
                    DOM.outerHTML = generateHTML(newVdom, f);
                    //var elemtoadd = newVdom.children[newVdom.children.length - 1];
                    //var node = document.createElement(elemtoadd.tag);
                    //node.innerHTML = generateHTML(elemtoadd.children, f);
                    //DOM.appendChild(node);
                    break;
                case fl.MARKER:
                    if (typeof newVdom.children === "object" &&
                        !(newVdom.children instanceof Array)) {
                        patch([newVdom.children], DOM.children);
                    } else {
                        patch(newVdom.children, DOM.children);
                    }
                    break;
            }

        }
    };
    return {
        class: function(obj) {
            var comp = new Component(obj);
            for (var funName in comp) {
                if (funName !== "constructor" &&
                    funName !== "render" &&
                    funName !== "old") {
                    var funId = 'fun' + index++;
                    comp[funName] = {
                        name: funId,
                        fun: comp[funName]
                    };
                }
            }
            comp.constructor();
            return comp;
        },
        render: function renderer(component, DOM) {
            var virtualdom = component.render();
            //check wherether is a node or a component
            if (!(virtualdom instanceof Component)) {
                var f = function(f, e) {
                    f.bind(component)(e);
                    renderer(component, DOM);
                };
                if (component.old === null) {
                    DOM.innerHTML = generateHTML(virtualdom, f);
                } else {
                    if (diff(component.old, virtualdom) !== undefined) {
                        console.log(virtualdom);
                        patch(virtualdom, DOM.children, f);
                    }
                }
                component.old = JSON.parse(JSON.stringify(virtualdom));
            } else {
                renderer(virtualdom, DOM);
            }
        }
    };

})();
