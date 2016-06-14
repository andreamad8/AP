function React(){
	var index = 0;
	this.clas= function(obj){
		
		for (var funName in obj){
			// to create bind name in a uniquly with the window
			if (funName !== "constructor" && funName !== "render"){
				var funId ='fun'+index++;
				obj[funName] = {name: funId, fun: obj[funName]}; 
			}
		}
		obj.constructor();
			return obj;
	}
	this.render = function(component,DOM){

		var virtualdom = component.render();
		DOM.innerHTML = generateHTML(virtualdom);

		function generateHTML(VDOM){
			var elem =""
			if(VDOM instanceof Array){
				elem += VDOM.map(generatenode);
			}
			else{
				elem += generatenode(VDOM);
			}
			return elem
		}


		function generatenode(node){
			if (typeof node !=="object") {return node;}
			else {
				var e='';
				e += "<"+ node.tag+" ";
				// add attribute
				for  (var key in node.attrs){
					var funobj = node.attrs[key];
					(function(funobj){
					window[funobj.name] = function(){	
						funobj.fun.bind(component)('?');
						this.react.render(component,DOM);
					}
					})(funobj)
					if (typeof funobj.name === "undefined"){e+=key+"='"+node.attrs[key]+"'"; }
					else {e+=key+"='"+funobj.name+"()'";}
				}
				// add children
				e+=">"
				if (node.children instanceof Array){
					e+=generateHTML(node.children);
				}
				else{
					e+=generatenode(node.children);
				}
				e+="</"+node.tag+">";
				return e;
			}
		}


	}
}
