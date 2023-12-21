var FragBuilder = (function () {
    var applyStyles = function (element, style_object) {
        for (var prop in style_object) {
            element.style[prop] = style_object[prop];
        }
    };
    var generateFragmentFromJSON = function (json) {
        var tree = document.createDocumentFragment();
        json.forEach(function (obj) {
            if (!("tagName" in obj) && "textContent" in obj) {
                tree.appendChild(document.createTextNode(obj["textContent"]));
            } else if ("tagName" in obj) {
                var el = document.createElement(obj.tagName);
                delete obj.tagName;
                for (part in obj) {
                    var val = obj[part];
                    switch (part) {
                        case "textContent":
                            el.appendChild(document.createTextNode(val));
                            break;
                        case "style":
                            applyStyles(el, val);
                            break;
                        case "childNodes":
                            el.appendChild(generateFragmentFromJSON(val));
                            break;
                        default:
                            if (part in el) {
                                el[part] = val;
                            }
                            break;
                    }
                }
                tree.appendChild(el);
            } else {
                throw "Error: Malformed JSON Fragment";
            }
        });
        return tree;
    };
    var generateFragmentFromString = function (HTMLstring) {
        var div = document.createElement("div"),
            tree = document.createDocumentFragment();
        div.innerHTML = HTMLstring;
        while (div.hasChildNodes()) {
            tree.appendChild(div.firstChild);
        }
        return tree;
    };
    return function (fragment) {
        if (typeof fragment === "string") {
            return generateFragmentFromString(fragment);
        } else {
            return generateFragmentFromJSON(fragment);
        }
    };
})();

function jsonp(url) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("body")[0].appendChild(script);
}

function replacestyle(url) {
    if (!document.getElementById("style_tag")) {
        var style_tag = document.createElement("link");
        style_tag.rel = "stylesheet";
        style_tag.id = "style_tag";
        style_tag.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(style_tag);
        replacestyle(url);
    }
    document.getElementById("style_tag").href = url;
}

function loadFonts(json) {
    var select_frag = [
        {
            tagName: "select",
            id: "font-selection",
            childNodes: [
                {
                    tagName: "option",
                    value: "default",
                    textContent: "Default",
                },
            ],
        },
    ];
    json["items"].forEach(function (item) {
        var family_name = item.family,
            value = family_name.replace(/ /g, "+");

        if (item.variants.length > 0) {
            item.variants.forEach(function (variant) {
                value += ":" + variant;
            });
        }

        select_frag[0].childNodes.push({
            tagName: "option",
            value: value,
            textContent: family_name,
        });
    });

    document.getElementById("font-select-container").appendChild(FragBuilder(select_frag));
    document.getElementById("font-selection").onchange = function (e) {
        var font = this.options[this.selectedIndex].value,
            name = this.options[this.selectedIndex].textContent;
        if (font === "default") {
            document.getElementById("picture-output").style.fontFamily =
                "inherit";
        } else {
            document.getElementById("picture-output").style.fontFamily = name;
            replacestyle("https://fonts.googleapis.com/css?family=" + font);
        }
        changeText();
    };
}

jsonp(
    "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDBzzPRqWl2eU_pBMDr_8mo1TbJgDkgst4&sort=trending&callback=loadFonts"
);
