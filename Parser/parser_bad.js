var TOKEN = {
  ANGOPEN: 1,
  ANGCLOSE: 2,
  GRAPHOPEN: 3,
  GRAPHCLOSE: 4,
  TAGCLOSE1: 5,
  TAGCLOSE2: 6,
  EQUAL: 7,
  QUOTE: 8
};

function Stream(string) {
  var p = 0;
  this.peak = function () {
    return string.charAt(p);
  };
  this.consume = function () {
    ++p;
  };
}

function Tokenaizer(stream) {
  var current_token = '';

  var remove_space = function () {
    while (stream.peak() && stream.peak() == ' ')
      stream.consume();
  };

  var parse_string = function () {
    remove_space();
    var str = '';
    while (stream.peak() &&
      stream.peak() != ' ' &&
      stream.peak() != '>' &&
      stream.peak() != '<' &&
      stream.peak() != '/' &&
      stream.peak() != '}' &&
      stream.peak() != '{' &&
      stream.peak() != '=' &&
      stream.peak() != '"') {
      str += stream.peak();
      stream.consume();
    }
    return str;
  };

  this.next = function () {
    remove_space();
    switch (stream.peak()) {
      case '<':
        stream.consume();
        if (stream.peak() == '/') {
          stream.consume();
          return current_token = TOKEN.TAGCLOSE1;
        } else
          return current_token = TOKEN.ANGOPEN;
      case '/':
        stream.consume();
        if (stream.peak() == '>') {
          stream.consume();
          return current_token = TOKEN.TAGCLOSE2;
        } else
          throw new Error("Wrong character after '/'");
      case '>':
        stream.consume();
        return current_token = TOKEN.ANGCLOSE;
      case '{':
        stream.consume();
        return current_token = TOKEN.GRAPHOPEN;
      case '}':
        stream.consume();
        return current_token = TOKEN.GRAPHCLOSE;
      case '=':
          stream.consume();
          return current_token = TOKEN.EQUAL;
      case '"':
        stream.consume();
        return current_token = TOKEN.QUOTE;
      case undefined:
        return undefined;
      default:
        return current_token = parse_string();
    }
  };

  this.get = function () {
    return current_token;
  };
}

//var stream = new Stream('<p>  <span /> <div > {asdasd } </div ></p>');
//var tokenaizer = new Tokenaizer(stream);
//
//while (tokenaizer.next()) {
//  console.log(tokenaizer.get());
//}



var Node = function(tag) {
    this.tag = tag;
};

var parser = function() {

    this.parse = function(text) {
        var nodes = [];
        var stream = new Stream(text);
        T = new Tokenaizer(stream);
        T.next();
        while (T.get()) {
            nodes.push(jsxel());
        }
        return nodes;
    };

    function jsxel(n) {
        if (T.get() === TOKEN.ANGOPEN) {
            T.next();
            if (typeof T.get() === "string") {
                var node = new Node(T.get());
                T.next();
                return jsxrec(node);
            }
        } else {
            return jsxval();
        }
    }

    function jsxrec(node) {
        if (T.get() === TOKEN.TAGCLOSE2) {
            T.next();
            return node;
        } else {
            jsxattr(node);
            if (T.get() === TOKEN.ANGCLOSE) {
                T.next();
                if (T.get() === TOKEN.TAGCLOSE1) {
                    tagClose(node);
                } else {
                    while (T.get() !== TOKEN.TAGCLOSE1) {
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
        while (T.get() !== TOKEN.ANGCLOSE) {
            if (typeof T.get() === "string") {
                attrname = T.get();
                T.next();
                if (T.get() === TOKEN.EQUAL) {
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
        if (T.get() === TOKEN.TAGCLOSE1) {
            T.next();
            if (typeof T.get() === "string" && T.get() === node.tag) {
                T.next();
                if (T.get() === TOKEN.ANGCLOSE) {
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
        if (T.get() === TOKEN.QUOTE) {

            T.next();

            if (typeof T.get() === "string") {
                value = T.get();
                T.next();
                if (T.get() === TOKEN.QUOTE) {
                    T.next();
                    return {
                        type: "string",
                        value: value
                    };
                } else {
                    throw new Error('jsxval string miss');
                }
            } else if (T.get() === TOKEN.QUOTE) {
                T.next();
                return {
                    type: "string",
                    value: ""
                };
            } else {
                throw new Error('ERROR');
            }
        } else if (T.get() === TOKEN.GRAPHOPEN) {
            T.next();
            if (typeof T.get() === "string") {
                value = T.get();
                T.next();
                if (T.get() === TOKEN.GRAPHCLOSE) {
                    T.next();
                    return {
                        type: "JS",
                        value: value
                    };
                } else {
                    throw new Error('jsxval string miss');
                }
            } else if (T.get() === TOKEN.GRAPHCLOSE) {
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

var jsx = '<span><span test= "sdas" asdsa={}><p /> <p>"ahs"</p></span></span><span test= "sdas" asdsa={dsa}>"dasda"</span>';


p = new parser();

console.log(JSON.stringify(p.parse(jsx)));
