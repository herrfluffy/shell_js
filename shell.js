//Shell.js - a library to treat a javascript environment like a unix shell.
//Copyright 2011-2014 by Julius D'souza. Licensed under GPL 3.0.
//Uses jQuery for deep copy in the cp() function.

Shell = {path: ''};
//Shell.path is of the form 'x.y.z'

/*(function(obj){
    var exports = this['exports'];
    if (exports) {
        //CommonJS module handling
        exports.Shell = obj;
    }
})(Shell);*/

Shell.environment = (this['window'] ? window : GLOBAL);

if (!Shell.environment['Shell']) {
    console.warn('Can\'t access top level objects.');
}
//check for no this['Shell']? and return?
//Shell.environment = this['window'] ? window : GLOBAL;
//GLOBAL for node.js
//window for the browser

Shell.cd = function(x) {
    var paths =[];
    //change working object (directory)
    //cd() acts like cd ..
    //cd($string) switches to the object
    // -- local scoping followed by global scoping
    if (x == null) { //default no argument behavior
        if (Shell.path.indexOf('.') === -1) {
            Shell.path = ''; //ensure that path's a string
        } else {
            //move up the object chain: x.y.z -> x.y
            //tokenizes the path by '.' into an array,
            //pops the array and recreates the path string
            paths = Shell.path.split('.');
            paths.pop();
            Shell.path = paths.reduce(function(x, y){ return x.concat('.', y);});
        } } else if (x == '') {
        Shell.path = ''; //move to the top
    } else if (typeof(Shell.reference(Shell.path + '.' + x)) === 'object') {
        Shell.path = Shell.path + '.' + x; //move to local object
    } else if (typeof(Shell.reference(x)) === 'object') {
        Shell.path = x; //move to global object
    } else {
        return 'No such object exists.';
    }
}

Shell.cp = function(origin, finish) {
    //hard copy from origin to destination
    //slightly hairy, but copying is a hairy operation anyway
    //in a dynamic language with 'interesting' moduling and scoping
    var newObj = '',
        destinationContext = '',
        local = [],
        destinationPathArray = finish.split('.'),
        destinationPathString = '';

    if (Shell.reference(Shell.path + '.' + origin) != undefined) {
        //check if the string refers to something local
        newObj = Shell.reference(Shell.path + '.' + origin);
    } else if (Shell.reference(origin) != undefined) {
        //check if the string refers to something global
        newObj = Shell.reference(origin);
    } else {
        return origin + ' doesn\'t exist!';
    }

    //check to see if the parent of the stuff we're copying to exists:
    //(can't copy to a non-existent directory!)
    local = destinationPathArray.pop();
    if (destinationPathArray != '') {
        destinationPathString = destinationPathArray.reduce(function(x, y){ return x.concat('.', y);});
    }
    if (destinationPathString == '') {
        destinationContext = Shell.reference(Shell.path);
        //a local reference
    } else if (typeof(Shell.reference(Shell.path + '.' + destinationPathString)) === 'object') {
        destinationContext = Shell.reference(Shell.path + '.' + destinationPathString);
        //traverse and create a local reference
    } else if (typeof(Shell.reference(destinationPathString)) === 'object') {
        destinationContext = Shell.reference(destinationPathString);
        //create global reference
    } else {
        return destinationPathString + ' is not an object.';
    }
    if ((typeof(newObj) == 'function')||(typeof(newObj) == 'string')||(typeof(newObj) == 'number')) {
        //about everything except objects does copy by value
        //objects do copy by reference
        destinationContext[local] = newObj;
    } else if (typeof(newObj) === 'object') {
        //deep copy's hard due to prototypes and dangling references
        //after chatting around on freenode, I've been convinced
        //that it's hard to beat jQuery's own implementation
        //TODO: add $.extend check or make a deep copy function
        if (destinationContext[local] == undefined)
            destinationContext[local] = $.extend(true, {}, newObj);
        else
            destinationContext[local] = $.extend(true, destinationContext[local], newObj);
    }
}

Shell.ls = function(key, params) {
    //declare contents of current path's object
    var keyPath = Shell.path + (key ? '.' + key : ''),
        currentObj = Shell.reference(keyPath) || {};
    //use Object.getOwnPropertyNames for hidden properties
    return Object.keys(currentObj).sort();
}

Shell.mkdir = function(son, father) {
    //mkdir(son) makes an empty object
    //mkdir(son, father) makes an object son with father as the prototype
    //so son inherits father's properties
    //in addition, son.proto gives the path to father
    if (father == null) {
        //normal mkdir behavior
        Shell.reference(Shell.path)[son] = {};
    } else if (typeof(Shell.reference(Shell.path)[father]) === 'object') {
        //local extension
        Shell.reference(Shell.path)[son] = Object.create(Shell.reference(Shell.path)[father]);
        Shell.reference(Shell.path)[son].proto = Shell.path + '.' + father;
    } else if (typeof(Shell.reference(father) === 'object')) {
        //global extension
        Shell.reference(Shell.path)[son] = Object.create(Shell.reference(father));
        Shell.reference(Shell.path)[son].proto = father;
    }
    return son;
}

Shell.pwd = function() {
    if (Shell.path === '') {
        return 'top';
    } else {
        return Shell.path;
    }
}

Shell.reference = function(x) {
    //takes a path string and returns what it refers to if it exists
    var array_path, ref;
    if (x !== '') {
        array_path = x.split('.');
        ref = Shell.environment;
    //if next token is an object, shift to it and repeat
        while ((array_path.length) && (typeof(ref) === 'object')) {
            ref = ref[array_path.shift()];
        }
        return ref;
    } else {
        return Shell.environment;
    }
}

Shell.reload = function() {
    //equivalent to clearing the environment
    location.reload();
}

Shell.rm = function(x) {
    //do nothing if there's nothing to delete
    if (x == null) {
        //clear out local variable
        return;
    } else if (typeof(Shell.reference(Shell.path)[x]) != 'undefined') {
        delete Shell.reference(Shell.path)[x]; //otherwise, clear out global variable
    } else if (typeof(Shell.reference(x)) != 'undefined') {
        delete Shell.environment[x];
    }
}
