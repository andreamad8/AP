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
    "/": {
        token: TK.BACKSLASH
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
        var str = ch;
        while (ch !== " " && at < len) {
            if (val[t.charAt(at + 1)] !== undefined ||
                t.charAt(at + 1) === " ") {
                at++;
                currentToken = {
                    token: TK.STRING,
                    value: str
                };
                return currentToken;
            }
            at++;
            ch = t.charAt(at);
            str += ch;
        }
        return currentToken;
    }

    this.next = function() {
        var ch = t.charAt(at);
        while (ch === " ") {
            at++;
            ch = t.charAt(at);
        }
        while (ch !== " " && at < len) {
            if (val[ch] !== undefined) {
                if (ch === "<" && t.charAt(at + 1) === "/") {
                    at += 2;
                    currentToken = {
                        token: TK.OPENWITHCLOSE
                    };
                    return currentToken;
                } else if (ch === "/" && t.charAt(at + 1) === ">") {
                    at += 2;
                    currentToken = {
                        token: TK.CLOSEWITHOPEN
                    };
                    return currentToken;
                } else {
                    at++;
                    currentToken = val[ch];
                    return currentToken;
                }


            } else {
                var stri = parseString();
                currentToken = stri;
                return stri;
            }
        }
        currentToken = {
            token: TK.EOF
        };
        return currentToken;
    };

    this.get = function() {
        return currentToken;
    };


};

/*
jsxel := <tag jsxelrec | jsxval
jsxelattr := [name=jsxval]* |\epsilon
jsxelrec  := jsxelattr> jsxel* tagClose | />
tagClose := </tag>
tag := string
name := string
jsxval := " string " | { JS }
JS := JavaScript expe
*/

var Node = function(tag) {
    this.tag = tag;
};


var error = function(message) { // throw error for bad syntax
    console.log(message);
    throw undefined;
};

var parser = function(text) {
    var T = new Tokenizer(text);
    var nodes = [];
    this.parse = function() {
        T.next();
        while (T.get().token != TK.EOF) {
            nodes.push(jsxel());
        }
        console.log(JSON.stringify(nodes));
    };


    function jsxel(n) {
        if (T.get().token === TK.OPENTAG) {
            T.next();
            if (T.get().token === TK.STRING) {
                var node = new Node(T.get().value);
                T.next();
                return jsxelrec(node);
            }
        } else if (T.get().token === TK.OPENWITHCLOSE) {
            tagClose(n);
        } else {
            return jsxval();
        }

    }

    function jsxelrec(node) {

        if (T.get().token === TK.CLOSEWITHOPEN) {
            T.next();
            return node;
        } else {
            jsxelattr(node);
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
                    console.log(T.get().token);
                }

            } else {
                return error("missing closing tag");
            }

            return node;
        }
    }

    function jsxelattr(node) {
        var attr = {};
        var attrname;
        var attrvalue;
        while (T.get().token !== TK.CLOSETAG) {
            if (T.get().token === TK.STRING) {
                attrname = T.get().value;
                T.next();
                if (T.get().token === TK.EQUAL) {
                    T.next();
                    attrvalue = jsxval().value;

                } else {
                    error('miss equal');
                }
            } else {
                error('attribute name error');
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
                    error('missing and >');
                }
            } else {
                error('tag name or tag name is wrong');
            }
        } else {
            error('missing and </');
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
                    error('jsxval string miss');
                }
            } else if (T.get().token === TK.QUOTE) {
                T.next();
                return {
                    type: "string",
                    value: ""
                };
            } else {
                error('ERROR');
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
                    error('jsxval string miss');
                }
            } else if (T.get().token === TK.CURLYCLOSE) {
                T.next();
                return {
                    type: "JS",
                    value: ""
                };
            } else {
                error('"ERROR"');
            }
        } else {
            error('wrong jsxval');
        }
    }


};

var jsx = ' <span> <span>"a"</span> <p>"b"</p>  </span> <span> <span>"a"</span> <p>"b"</p>  </span>';

p = new parser(jsx);
p.parse();
