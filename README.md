##Shell.js v0.83##
Shell.js: treat Javascript environments like a unix shell. Requires Javascript 1.6. GPL 3.0.

Paradigm: objects act like folders. So given `foo = new Shell()`, `foo.cd(x.y)` will shift to `{current_object}.x.y` and `foo.ls()` will give the contents of the current object. Using the `with()` keyword in appropriate places gives shell scripting functionality.

i.e.
```javascript
	foo = new Shell();
    with (foo) {
        with(foo._reference(foo.path)) {
            mkdir('obj');
            obj.y = 4;
            obj.z = 6;
            cd('obj');
            ls();
        }
    }
```

-- `ls()` returns x and y

-- the entire script runs in local scope

-- `local-tests.js` has basic tests

Current quirks:

Piping is in the works.

`cp()` acts like `cp -r`

`ls()` only supports `-a` for now

`mkdir()` supports prototypes as a second parameter

`pwd()` returns a reference to the current path by default

`_reference()` passes the last valid object encountered in the given path

Dev. mode is available with logging. Use `setMode('dev', true)`