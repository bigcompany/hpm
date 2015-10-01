# `hpm` - **H**ook **P**ackage **M**anager

Collection of binaries for installing packages using various package managers for various programming languages.

## Introduction

This module is the component which [hook.io](http://hook.io) uses to allow users to install custom packages.

You are encouraged to use this module as-is, or modify it to suite your needs. If you are interested in contributing please let us know!

## Goal

### Provide a simple unified interface to a package manager for many programming languages.

## Why?

At hook.io, we require that users can easily install dependencies using any package manager.

In order to seamlessly integrate this functionality into our stack, the interface code for installing packages must be unified, despite the fact that each package manager must be loaded, configured, and run in it's own way.

Instead of maintaining this binary spawn contract code inside our core application, we decided to make a separate project.

Hence, `hpm`!

## Supported Package Managers

 - `npm` - Provides node.js support
 
## Upcoming Support

 - `gems` - Provides Ruby support
 - `pip` - Provides Python support