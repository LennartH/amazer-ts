# Amazer

Simple but easily extensible library to generate mazes, written in TypeScript.

## Installation

```
npm i amazer
```

## Usage

### Simple Example
```typescript
import amazer, { Area, RandomizedPrim, Emmure } from "amazer";

const _amazer = amazer().withSize({width: 15, height: 15})
                        .using(RandomizedPrim)
                        .andModifier(Emmure)
                        .build();
const area: Area = _amazer.generate();
```
Results in mazes like this:
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ # # # # # # # # # # # # # # # # # ┃
┃ #   #       #           #       # ┃
┃ #   # # #   # # #   # # #   # # # ┃
┃ #   #       #   #   #           # ┃
┃ #   # # #   #   #   # # #   # # # ┃
┃ #   #       #       #   #   #   # ┃
┃ #   # # #   # # #   #   #   #   # ┃
┃ #           #       #   #   #   # ┃
┃ # # # # #   #   # # #   #   #   # ┃
┃ #       #   #           #       # ┃
┃ # # #   #   # # # # #   # # #   # ┃
┃ #   #           #   #   #   #   # ┃
┃ #   # # # # #   #   #   #   #   # ┃
┃ #   #   #       #       #   #   # ┃
┃ #   #   # # #   # # #   #   #   # ┃
┃ #                               # ┃
┃ # # # # # # # # # # # # # # # # # ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Complex Example
```typescript
import amazer, { Area, Nystrom, Emmure, BreakPassages, RemoveDeadends } from "amazer";

const _amazer = amazer().withSize({width: 30, height: 30})
                        .using(Nystrom, {
                            minRoomSize: {width: 5, height: 5},
                            maxRoomSize: {width: 10, height: 10},
                            roomPlacementAttempts: 50
                        })
                        .andModifier(Emmure)
                        .andModifier(BreakPassages, {
                            amount: 100,
                            minimumShortcutDistance: 50
                        })
                        .andModifier(RemoveDeadends, {deadendsToRemove: 0.4})
                        .build();
const area: Area = _amazer.generate();
```
Results in mazes like this:
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # ┃
┃ # # #   #                           # # #       #           # ┃
┃ # # #   #   # # # # # # # # # # #   # # #   #   #           # ┃
┃ # # #       #           # #                 #   #           # ┃
┃ # # #   #   #   # # #   # # # # # # #   # # #               # ┃
┃ #       #       #       #                   #   #           # ┃
┃ #   # # # # # # #   #   #                   #   #           # ┃
┃ #   #           #   #   #                   #   #           # ┃
┃ #   #           #   # # #                   # # #           # ┃
┃ #   #           #   # # #                   # # #           # ┃
┃ #   #           #   # # # # # # # # #   # # # # # # #   # # # ┃
┃ #   #           #                   #   #                   # ┃
┃ #   #           # # #   # # # # #   #   #                   # ┃
┃ #   #           #       #           #   #                   # ┃
┃ #   # # # #   # #   # # #   # # # # #   #                   # ┃
┃ #   # # #           #       #           #                   # ┃
┃ #   # # # # # # #   #   # # #   # # #   #                   # ┃
┃ #   #               #           # # #   #                   # ┃
┃ #   #   #   # # # # # # #   # # # # #   # # #   # # # # # # # ┃
┃ #   #   #   #                   #   #                       # ┃
┃ #   #   # # #                   #   # # # # # # # # # # #   # ┃
┃ #       # # #                   #   #                   #   # ┃
┃ # #   # # # #                   #   #                   #   # ┃
┃ #           #                   #   #                       # ┃
┃ #                               #   #                   #   # ┃
┃ #           #                   #   #                   #   # ┃
┃ #           #                   #   #                   #   # ┃
┃ #           #                   #   #                   #   # ┃
┃ # # # # # # #   # # # # # # # # #   # # # # # # # # # # #   # ┃
┃ # # #                                                       # ┃
┃ # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Built-In Generator Algorithms

Algorithm                | Characteristics | Configuration
------------------------:|-----------------|--------------
**RecursiveBacktracker** | Generates dense, perfect areas with low branching factor and many long corridors. | /
**RandomizedPrim**       | Generates dense, perfect areas with high branching factor and many deadends that are easy to solve. | /
**RandomizedKruskal**    | Generates dense, perfect areas with high branching factor and many deadends that are easy to solve. | /
**Nystrom**              | Generates dense, perfect areas with rooms. Uses RecursiveBacktracker to fill the space between rooms. | <ul><li>Minimum room size</li><li>Maximum room size</li><li>Room placement attempts</li></ul>


### Built-In Area Modifiers

Modifier           | Effect | Configuration
------------------:|--------|--------------
**Emmure**         | Surrounds an area with a solid wall. May increase the areas size. | /
**BreakPassages**  | Replaces random wall tiles that have exactly 2 floor tiles as neighbours with floor tiles. The path length between the 2 floor tiles must be greater equals than a mininum distance. | <ul><li>Amount of walls to break</li><li>Minimum shortcut distance</li></ul>
**RemoveDeadends** | Removes a targeted amount of deadends (tiles with a single walkable neighbour), replacing them with wall tiles. | <ul><li>Amount of deadends to remove</li></ul>
