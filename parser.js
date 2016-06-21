var TK = {
    OPENTAG: "OPENTAG",
    CLOSETAG: "CLOSETAG",
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
                return {
                    token: TK.STRING,
                    value: str
                };
            }
            at++;
            ch = t.charAt(at);
            str += ch;
        }
        currentToken = {
            token: TK.EOF
        };
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
        while (ch !== " " && at < len) {
            if (val[ch] !== undefined) {
                at++;
                currentToken = val[ch];
                return val[ch];
            } else {
                var stri = parseString();
                currentToken = stri;
                return stri;
            }
        }
        currentToken = {
            token: TK.EOF
        };
        return {
            token: TK.EOF
        };
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
            T.next();
        }
        console.log(JSON.stringify(nodes))
    };


    function jsxel() {
        if (T.get().token === TK.OPENTAG) {
            T.next();
            if (T.get().token === TK.STRING) {
                var node = new Node(T.get().value);
                T.next();
                return jsxelrec(node);
            }
        } else {
            return jsxval();
        }

    }

    function jsxelrec(node) {
        if (T.get().token === TK.BACKSLASH) {
            T.next();
            if (T.get().token === TK.CLOSETAG) {
                console.log("TAGCLOSE");
            }
        } else {
            jsxelattr(node);
            if (T.get().token === TK.CLOSETAG) {
                T.next();
                var val = jsxel();
                if (val.type) {
                    node.children = val.value;
                } else {
                    if (!node.children)
                        node.children = [];
                    node.children.push(val);
                }

            }
            tagClose(node);
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
        if (T.get().token === TK.OPENTAG) {
            T.next();
            if (T.get().token === TK.BACKSLASH) {
                T.next();
                if (T.get().token === TK.STRING) {
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
                error('miss /');
            }
        } else {
            error('missing and <');
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
var jsx = ' <span test="sdasdasdsa" test1={this.pippo} a="12">  <div><p>"dasda"</p></div></span>  ';

p = new parser(jsx);
p.parse();
