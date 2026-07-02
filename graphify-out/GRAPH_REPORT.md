# Graph Report - unit-converter  (2026-06-13)

## Corpus Check
- 3 files · ~13,687 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 23 nodes · 26 edges · 5 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4fcca111`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]

## God Nodes (most connected - your core abstractions)
1. `MeasureMate — Universal Unit Converter` - 5 edges
2. `updateUnits()` - 4 edges
3. `updateCooking()` - 4 edges
4. `fmt()` - 3 edges
5. `parseAmount()` - 3 edges
6. `convertUnits()` - 2 edges
7. `convertCooking()` - 2 edges
8. `http` - 1 edges
9. `fs` - 1 edges
10. `path` - 1 edges

## Surprising Connections (you probably didn't know these)
- `updateUnits()` --calls--> `fmt()`  [EXTRACTED]
  app.js → app.js  _Bridges community 3 → community 4_

## Import Cycles
- None detected.

## Communities (5 total, 0 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (5): Before going live, Deploying, Files, MeasureMate — Universal Unit Converter, Presets / deep links

### Community 2 - "Community 2"
Cohesion: 0.40
Nodes (4): fs, http, MIME, path

### Community 3 - "Community 3"
Cohesion: 0.67
Nodes (3): convertCooking(), fmt(), updateCooking()

### Community 4 - "Community 4"
Cohesion: 0.67
Nodes (3): convertUnits(), parseAmount(), updateUnits()

## Knowledge Gaps
- **8 isolated node(s):** `http`, `fs`, `path`, `MIME`, `Files` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `updateUnits()` connect `Community 4` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `updateCooking()` connect `Community 3` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `http`, `fs`, `path` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._