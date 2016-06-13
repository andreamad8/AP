function React(){
	this.clas= function(obj){
		obj.constructor();
		return obj;
	}
	this.render = function(component,DOM){
		var elemtorend = component.render();
		var elem="";
		for (var i = 0; i < elemtorend.length; i++) {
			// create element 
			elem+=generateHTML(elemtorend[i],component,DOM);
				
		}

			//append to dom
		DOM.innerHTML=elem;

	}

	function generateHTML(node,component,DOM){
		if (typeof node !=="object") {return node;}
		else {
			var e='';
			e += "<"+ node.tag+" ";
			// add attribute
			for  (var key in node.attrs){
					window.onClick= function(){
						component[key]('?');
						this.react.render(component,DOM);}
				e+=key+"='onClick()'";
			}
			// add children
			e+=">"+generateHTML(node.children,component,DOM);
			e+="</"+node.tag+">";
			return e;
		}

	}
}

