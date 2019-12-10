# Amazer

Simple but easily extensible library to generate mazes, written in TypeScript.

## Installation

```
npm i amazer
```

## Usage

**Simple Example**
```TypeScript
import amazer, { Area, RandomizedPrim, Emmure } from "amazer";

const amazer = amazer().withSize({width: 15, height: 15})
                       .using(RandomizedPrim)
                       .andModifier(Emmure)
                       .build();
const area: Area = amazer.generate();
```