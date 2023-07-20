# HEP EVD

A header-only web-based event display for particle physics events.

## Installation + Usage

For now, needs the `httplib.h` file from
[cpp-httplib](https://github.com/yhirose/cpp-httplib) in the root of the repo.

To run example:

```
cd example/
make
./basic
```

## Motivation

It is often useful to be able to view how the interactions in a particle physics event
look, to get a better understanding of the event topology and how reconstruction
algorithms are operating.

However, most built-in or available event displays have two main issues:

 - Lack of availability: In a lot of cases, you can not easily spin up an event display
   whenever you want, meaning that if what you want to look at is not an input or an
   output, the raw hits or the final reconstruction, you are out of luck. This is not
   always the case however, but still, general availability of "I want an event display
   here, to show this thing" was a large motivation.

 - A secondary, and arguably even bigger limitation is the sorts of available event
   displays. You may be able to spin up an event display wherever you want in some
   cases, but they are limited by C++ based GUIs, restricting you to basic figures and
   requiring hacks and dodgy workarounds to show the actual information you want, rather
   than utilising more modern and easily hackable interfaces, such as those provided in
   the web browser.

The final goal of this library aims to fix those two issues: a simple, header-only
include that can be dropped in without changes to a build system or more, and allows
events to be easily shown in the browser. Using the browser means modern, flexible 3D
drawing tools can be used, not ROOT-based or similar GUIs, with a further advantage that
a web-based event display trivially works remotely, if you use SSH forwarding.

## Acknowledgements

The HTTP server in this project utilises
[cpp-httplib](https://github.com/yhirose/cpp-httplib), to make the server code as simple
as possible.

## Future Work

 - UI needs to be able to pick between multiple sets of 2D / 3D hits:
  - That is, say 3D hits, 3D hits with energy colouring, 3D hits with a score
    applied etcetc.

 - Start populating and passing over the other menu entries (vertices, 2D hits).

 - Helper functions for Pandora, LArSoft + more to convert bits.

 - Setup a client mode -> I.e. post JSON objects to it to add them to the state.
  - That would allow hits to be added to the server from anywhere, including
    different functions, classes, methods etcetc. This would require using a more
    sensible way of producing/understanding JSON.

 - Dropdown options should be unique (i.e. not multi select), whereas the hit class
   options should be multi select. Also remove all the caching and grouping code for
   now, to test performance. Should be better now that a single giant instanced mesh is
   made.
