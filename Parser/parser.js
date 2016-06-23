var TK = {
    OPENTAG: "OPENTAG",
    CLOSETAG: "CLOSETAG",
    OPENWITHCLOSE: "OPENWITHCLOSE",
    CLOSEWITHOPEN: "CLOSEWITHOPEN",
    BACKSLASH: "BACKSLASH",
    CURLYOPEN: "CURLYOPEN",
    CURLYCLOSE: "CURLYCLOSE",
    QUOTE: "QUOTE",
    EQUAL: "EQUAL",
    EOF: "EOF",
    STRING: "STRING"
};
var val = {
    "<": {
        token: TK.OPENTAG
    },
    ">": {
        token: TK.CLOSETAG
    },
    "{": {
        token: TK.CURLYOPEN
    },
    "}": {
        token: TK.CURLYCLOSE
    },
    "\"": {
        token: TK.QUOTE
    },
    "=": {
        token: TK.EQUAL
    }
};

var Tokenizer = function(t) {
    var len = t.length;
    var at = 0;
    var currentToken = "empty";

    function parseString() {
        var ch = t.charAt(at);
        var str = '';
        console.log(str, ch);
        while (ch !== " " && at < len) {
          // console.log(str, ch);
            if (ch == '/' || val[t.charAt(at)] !== undefined || t.charAt(at) == " ") {
                return {
                    token: TK.STRING,
                    value: str
                };
            } else {
                str += ch;
            }
            at++;
            ch = t.charAt(at);
        }

        return {
            token: TK.EOF
        };
    }

    this.next = function() {

        var ch = t.charAt(at);
        while (ch === " ") {
            at++;
            ch = t.charAt(at);
        }
        var prec = '';
        while (at < len) {
            console.log(prec,ch);
            if (prec === '' && (val[ch] !== undefined || ch == '/')) {
                if ((ch == '<' || ch == '/')) {
                    at++;
                } else {
                    currentToken = val[ch];
                    at++;
                    return currentToken;
                }
            } else if (prec === "/" && ch === ">") {
                at++;
                currentToken = {
                    token: TK.CLOSEWITHOPEN
                };
                return currentToken;
            } else if (prec === "<") {
                if (ch === "/") {
                    at++;
                    currentToken = {
                        token: TK.OPENWITHCLOSE
                    };
                    return currentToken;
                } else {
                    return currentToken = {
                        token: TK.OPENTAG
                    };
                }
            } else {
                currentToken = parseString();
                return currentToken;
            }
            prec = ch;
            ch = t.charAt(at);
        }
        return currentToken = {
            token: TK.EOF
        };

    };

    this.get = function() {
        return currentToken;
    };
};

//var jsx = ' <span asdasd= "dasdas"><p></p> <p> "hsad" </p> </span>';
var jsx = ' <spsaasdsasan asdasd= "dasdas"><p></p> <p> "hsad" </p> </span>';

T = new Tokenizer(jsx);

T.next();
console.log(T.get());
while (T.get().token != TK.EOF) {
    T.next();
    console.log(T.get());

}





var Node = function(tag) {
    this.tag = tag;
};

var parser = function() {
    var nodes = [];
    this.parse = function(text) {
        T = new Tokenizer(text);

        T.next();
        while (T.get().token != TK.EOF) {
            nodes.push(jsxel());
        }
        return nodes;
    };

    function jsxel(n) {
        if (T.get().token === TK.OPENTAG) {
            T.next();
            if (T.get().token === TK.STRING) {
                var node = new Node(T.get().value);
                T.next();
                return jsxrec(node);
            }
        } else {
            return jsxval();
        }

    }

    function jsxrec(node) {
        if (T.get().token === TK.CLOSEWITHOPEN) {
            T.next();
            return node;
        } else {
            jsxattr(node);
            if (T.get().token === TK.CLOSETAG) {
                T.next();
                if (T.get().token === TK.OPENWITHCLOSE) {
                    tagClose(node);
                } else {
                    while (T.get().token !== TK.OPENWITHCLOSE) {
                        var val = jsxel(node);
                        if (val.type) {
                            node.children = val.value;
                        } else {
                            if (!node.children)
                                node.children = [];
                            node.children.push(val);
                        }
                    }
                    tagClose(node);
                }

            } else {
                throw new Error("missing closing tag");
            }
            return node;
        }
    }

    function jsxattr(node) {
        var attr = {},
            attrname, attrvalue;
        while (T.get().token !== TK.CLOSETAG) {
            if (T.get().token === TK.STRING) {
                attrname = T.get().value;
                T.next();
                if (T.get().token === TK.EQUAL) {
                    T.next();
                    attrvalue = jsxval().value;
                } else {
                    throw new Error('miss equal');
                }
            } else {
                throw new Error('attributt error');
            }
            attr[attrname] = attrvalue;
        }
        if (Object.keys(attr).length !== 0) {
            node.attr = attr;
        }
    }

    function tagClose(node) {
        if (T.get().token === TK.OPENWITHCLOSE) {
            T.next();
            if (T.get().token === TK.STRING && T.get().value === node.tag) {
                T.next();
                if (T.get().token === TK.CLOSETAG) {
                    T.next();
                } else {
                    throw new Error('missing and >');
                }
            } else {
                throw new Error('tag name is wrong');
            }
        } else {
            throw new Error('missing and </');
        }
    }


    function jsxval() {
        var value;
        if (T.get().token === TK.QUOTE) {
            T.next();
            if (T.get().token === TK.STRING) {
                value = T.get().value;
                T.next();
                if (T.get().token === TK.QUOTE) {
                    T.next();
                    return {
                        type: "string",
                        value: value
                    };
                } else {
                    throw new Error('jsxval string miss');
                }
            } else if (T.get().token === TK.QUOTE) {
                T.next();
                return {
                    type: "string",
                    value: ""
                };
            } else {
                throw new Error('ERROR');
            }
        } else if (T.get().token === TK.CURLYOPEN) {
            T.next();
            if (T.get().token === TK.STRING) {
                value = T.get().value;
                T.next();
                if (T.get().token === TK.CURLYCLOSE) {
                    T.next();
                    return {
                        type: "JS",
                        value: value
                    };
                } else {
                    throw new Error('jsxval string miss');
                }
            } else if (T.get().token === TK.CURLYCLOSE) {
                T.next();
                return {
                    type: "JS",
                    value: ""
                };
            } else {
                throw new Error('"ERROR"');
            }
        } else {
            throw new Error('wrong jsxval');
        }
    }
};


p = new parser();

console.log(JSON.stringify(p.parse(jsx)));
// var fs = require('fs');
// fs.readFile('Testcomponent.txt', function(err, data) {
//     if (err) throw err;
//     console.log(data);
// });
