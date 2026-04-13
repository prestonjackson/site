# Modeler

This is the top level, or controller directory for the Modeler application.

The purpose of this project is to build a web-based 3D modeler for
collaboration with GenAI agents as well as other users.

## Collaboration
The collaboration is decentralized, no centralized server contains an
understanding of the model, only the clients. We will explore the use
of CRDTs, or MRDTs in accomplishing this.

## Communication
Communication between peers takes place via WebRTC, encrpyted via SSL.

## Central Server
A central shared server will provide access peer-discovery. This is not a
requirmenet for usability of the app, but a convenience. Gossip protocols can
be used to replace they discovery in the future.

Storage and durability may be provided through an encrypted log-store
on a centralized server, but the system will have no ability to decrypt
the content. They will be fully opaque to the central server.

Each directory represents a conceptual module. Relationshipas between the
modules is specified in the enclosing README.md, which has specific rules for
which other modeles and APIs can be used within it.

## Style
Always provide a JSDoc style type specifications for the method signatures.

Always keep lines 80 columns wide.

Otherwise, follow the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)


## Allowed modules:

- model
- gfx
- topo
- util
- math

## Allowed browser APIs:

- document
- console
- navigator

## Instructions for the Code-assist Agent
Read all of the README.md files in the subdirectories. Internalize the style
instructions noted in this file. Apply these to any code suggestions.