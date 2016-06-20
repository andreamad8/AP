var React = (function() {

    var index = 0;
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
            e += "<" + node.tag + " ";
            // to render attr we use reflexion
            for (var key in node.attrs) {
                var funobj = node.attrs[key];
                (function(funobj) {
                    window[funobj.name] = function() {
                        funTemplate(funobj.fun);
                    };
                })(funobj);
                if (typeof funobj.name === "undefined") {
                    e += key + "='" + node.attrs[key] + "'";
                } else {
                    e += key + "='" + funobj.name + "()'";
                }
            }
            e += ">";
            e += generateHTML(node.children, funTemplate);
            e += "</" + node.tag + ">";
            return e;
        }
    };

    return {
        class: function(obj) {

            for (var funName in obj) {
                // to create bind name in a uniquly with the window
                if (funName !== "constructor" && funName !== "render") {
                    var funId = 'fun' + index++;
                    obj[funName] = {
                        name: funId,
                        fun: obj[funName]
                    };
                }
            }
            obj.constructor();
            return obj;
        },
        render: function renderer(component, DOM) {

            var virtualdom = component.render();
            DOM.innerHTML = generateHTML(virtualdom, function(f) {
                f.bind(component)('?');
                renderer(component, DOM);
            });

            //if (typeof component.old === "undefined"){
            //	DOM.innerHTML=generateHTML(virtualdom);
            //}
            //else{
            //	diff(component.old,virtualdom);
            //	}


            // 	function generateHTML(node){
            // 	if (typeof node !=="object") {
            // 		return node;
            // 	}
            // 	else if(node instanceof Array){
            // 		var elem =""
            // 		for (var i = 0; i < node.length; i++) {
            // 			elem += generateHTML(node[i]);
            // 		}
            // 		return elem;
            // 	}
            // 	else {
            // 		var e='';
            // 		e += "<"+ node.tag+" ";
            // 		// to render attr we use reflexion
            // 		for  (var key in node.attrs){
            // 			var funobj = node.attrs[key];
            // 			(function(funobj){
            // 			window[funobj.name] = function(){
            // 				funobj.fun.bind(component)('?');
            // 				this.react.render(component,DOM);
            // 			}
            // 			})(funobj)
            // 			if (typeof funobj.name === "undefined"){e+=key+"='"+node.attrs[key]+"'"; }
            // 			else {e+=key+"='"+funobj.name+"()'";}
            // 		}
            // 		e+=">"
            // 		e+=generateHTML(node.children);
            // 		e+="</"+node.tag+">";
            // 		return e;
            // 	}
            //
            // };

            component.old = virtualdom;


            function diff(oldVdom, newVdom) {
                for (var i = 0; i < newVdom.length; i++)
                    diffR(oldVdom[i], newVdom[i]);
            }

            function diffR(oldVdom, newVdom) {
                if (typeof oldVdom !== "object" && newVdom !== "object") {
                    if (oldVdom !== newVdom) {
                        return 1;
                    }
                } else if (oldVdom.tag !== newVdom.tag) {
                    return 1;
                } else {
                    if (oldVdom.children instanceof Array && newVdom.children instanceof Array) {
                        diff(oldVdom.children, newVdom.children);
                    } else if (diffR(oldVdom.children, newVdom.children) == 1) {
                        document.getElementById(newVdom.attrs.id).innerHTML = generateHTML(newVdom.children);
                    }
                }
            }
        }
    };

})();
