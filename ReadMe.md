# `hpm` - **H**ook **P**ackage **M**anager

Collection of binaries for installing packages using various package managers for various programming languages.

## Introduction

This module is the component which [hook.io](http://hook.io) uses to allow users to install custom packages.

You are encouraged to use this module as-is, or modify it to suite your needs. If you are interested in contributing please let us know!

## Goal

### Provide a simple unified interface to the standard package managers for many programming languages.

## Why?

At hook.io, we require that users can easily install dependencies for any of our supported programming languages.

In order to seamlessly integrate this functionality into our stack, the interface code for installing packages must be unified, despite the fact that each package manager must be loaded, configured, and run in it's own way.

Instead of maintaining the binary spawn contract code for each package manager inside our core application, we decided to make a separate project.

Hence, `hpm`!

## Features

 - Aims to support multiple well-known package mangers
 - Ships with friendly binaries wrapping each package manager with a unified api
 - Ships with a http server for remote package installations
 - Ships with simple Event Emitter based broadcast pattern
   - Defaults to Redis backend
 - Can be used programmatically in Node.js applications

## Supported Package Managers

 - `npm` - Provides node.js support
 
## Upcoming Support

 - `gems` - Provides Ruby support
 - `pip` - Provides Python support
 
Want to see another package manager supported? Please open a Pull Request and we'd be glad to accept it!

# `hpm` API

### Let's assume our package manager is called `foo`.

## Installing a package

### `hpm.foo.install(opts, cb)`

**opts**

```js
{
  where: "/path/to/target/install/dir,
  packages: ["amazing-package@latest", "anotherpackage@v1.9.1"]
}
```

**cb**

Callback with signature (err, result)