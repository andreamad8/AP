var at, // current index of JSON text
    ch; // character at current index
var result;
var next = function() {
    at += 1;
    ch = tex.charAt(at); // json is the JSON text passed into our parser
    return ch;
};

var error = function(message) { // throw error for bad syntax
    console.log(message);
    throw undefined;
};

var ignoreSpace = function() {
    while (ch === " ") {
        next();
    }
}

var jsxel = function() {
    switch (ch) {
        case '<':
            return opentag();
        case "'":
            return jsxval();
        case "{":
            return jsxval();
            //   default:
            //      if(ch === '-' || (ch && ch >= 0 && ch <= 9)) { // number
            //        return number();
            //      } else {
            //        error('bad JSON');
            //      }
            //      break;
    }
};

var jsxval = function() {
    ignoreSpace();
    var checker = 0;
    if (ch === "'") {
        next();
        var value = string("'");
    } else if (ch === "{") {
        next();
        var value = string("}");
        checker = 1;
    } else {
        return error('miss } or \'');
    }
    next();
    return {
        val: value,
        SoJ: checker
    };
};


var opentag = function() {
    var ris = '{';
    if (next() === ' ') return error('empty tag');
    var tag = "";
    while (ch !== " " && ch != ">") {
        tag += ch;
        next();
    }
    ris += "tag:" + "'" + tag + "'";
    ignoreSpace();
    if (ch !== ">") {
        var att = "{";
        att += attribute();
        while (ch !== ">") {
            att += "," + attribute();
        }
        ris += ",attrs:" + att + "}";
    }
    ignoreSpace();
    if (ch !== ">") {
        return error('missing open tag');
    }
    next();
    ignoreSpace();
    var child = jsxel();
    if (typeof child !== "object") {
        ris += ",children:" + child;
    } else {
        if (child.SoJ == 1)
            ris += ",children:" + child.val;
        else {
            ris += ",children:'" + child.val + "'";
        }

    }
    ignoreSpace();

    if (ch === '<') {
        next();
        if (ch === '/') {
            next()
            ignoreSpace();
            var closetag = '';
            for (var i = 0; i < tag.length; i++) {
                closetag += ch;
                next();
            }
            ignoreSpace();
            if (tag === closetag) {
                ignoreSpace();
                if (ch === ">") {
                    next()
                    ris += '}';
                } else {
                    return error('wrong closing tag1');
                }
            } else {
                return error('wrong closing tag2');
            }
        } else {
            return error('wrong closing tag3');
        }
    } else {
        return error('wrong closing tag4');
    }
    return ris;
};

var attribute = function() {
    if (ch === "=") {
        return error('wrong character')
    }
    var attName = token("=");

    ignoreSpace();
    if (ch != "=") {
        return error('wrong character')
    } else {
        next()
        var value = jsxval();
    }
    ignoreSpace();
    if (value.SoJ == 1) {
        return attName + ":" + value.val + "";
    } else {
        return attName + ":'" + value.val + "'";
    }
}

var token = function(limit) {
    var val = "";
    while (ch !== " " && ch !== limit) {
        val += ch;
        next();
    }
    return val;
};

var string = function(limit) {
    var val = "";
    while (ch !== limit) {
        val += ch;
        next();
    }
    return val;
};

//<span test= 'sdasdasdsa' test1= {this.pippo} a='1' > {this.count} </span>
//         <button onClick={this.count++}> 'Increment' </button> \
//         <a href='ciao' /> \
//         <div> <p> {prova} </p> </div>

function parseJSX(jsx) {
    at = 0;
    ch = jsx.charAt(at);
    ignoreSpace();
    var ris = "[" + jsxel();
    ignoreSpace();
    while (ch === "<") {
        ris += "," + jsxel();
        ignoreSpace();
    }
    ris += "]";
    return ris;
}
var tex = "<span id='ciao'> <div id='2'> <p id='1'> {this.count} </p> </div> </span> <button onClick={this.fun}> 'Increment' </button>";

console.log(parseJSX(tex));
