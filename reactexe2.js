  
function React(){
	var index 		  = 0;
	var idAttribute   = 0;
	this.clas= function(obj){
		
		for (var funName in obj){
			// to create bind name in a uniquly with the window
			if (funName !== "constructor" && funName !== "render"){
				var funId ='fun'+index++;
				obj[funName] = {name: funId, fun: obj[funName]}; 
			}
		}
		obj.constructor();
		
//		var vnode=obj.render();
//		var temp = [];
//		for (var i = 0; i < vnode.length; i++) {
//			temp.push(generateID(vnode[i]));
//		}
//
//		obj.render= function(){return temp}
//
//		function generateID(node){
//			if (typeof node !=="object") {return node;}
//			else{
//				if (typeof node.attrs.id === "undefined"){
//					node.attrs.id=idAttribute++;
//				}
//				generateID(node.children);
//			}
//			return node
//		}

		return obj;
	}




	this.render = function(component,DOM){
		
		var virtualdom = component.render();
		if (typeof component.old === "undefined"){
			console.log(generateHTML(virtualdom));
			DOM.innerHTML=generateHTML(virtualdom);
		}
		else{
			diff(component.old,virtualdom);
			}



		function generateHTML(VDOM){
			var elem =""
			if(VDOM instanceof Array){
				for (var i = 0; i < VDOM.length; i++) {
					elem +=generatenode(VDOM[i]);
				}
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

		component.old = virtualdom;


		function diff(oldVdom,newVdom){
			for (var i = 0; i < newVdom.length; i++) {
				diffR(oldVdom[i],newVdom[i]);
			}		

		}

		function diffR(oldVdom,newVdom){
			if (typeof oldVdom !== "object" && newVdom !== "object") {
				if(oldVdom !== newVdom){return 1;}}
			else if(oldVdom.tag !== newVdom.tag){			
					return 1;}
			else{
				if(oldVdom.children instanceof Array && newVdom.children instanceof Array){	
					diff(oldVdom.children,newVdom.children);
				}else if(diffR(oldVdom.children,newVdom.children)==1){
					document.getElementById(newVdom.attrs.id).innerHTML=generateHTML(newVdom.children);
			} 
			}
			

		}
		

	}


}
