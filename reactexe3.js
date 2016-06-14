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
		component.old = virtualdom
		var elem="";
		for (var i = 0; i < virtualdom.length; i++) {
			// create element 
			elem+=generateHTML(virtualdom[i]);	
		}
		//append to dom
		DOM.innerHTML=elem;

		function generateHTML(node){
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
					e+=key+"='"+funobj.name+"()'";
				}
				// add children
				e+=">"+generateHTML(node.children,component,DOM);
				e+="</"+node.tag+">";
				return e;
			}
		}

	

	}
}
