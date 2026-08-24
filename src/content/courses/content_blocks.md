---
title: "Content blocks"
date: 2026-08-18T12:00:00+05:30
draft: true
math: true
tags: [markdown, diagrams]
description: "Demo of the multi-format content IR: diagrams, plots, scenes, and interactive fallbacks"
toc: true
footer: true
clip: false
---

## Why this note exists

This page is ordinary markdown, with ++underline++ available as an extension, plus typed **content blocks** that stay structured until HTML, PDF, audio, or video asks for a renderer.

Inline math still works: the regret identity $R_T = Tp^\star - \sum_t \mathbb{E}[r^t]$ is a real node in the IR, not leftover dollar signs for the browser to scrape.

## Static blocks

:::note
Callouts keep nested markdown. They print as boxes and speak their caption, then their body.
:::

A football diagram from a fenced block:

```svg-football-field
home=4-3-3
away=5-3-2
caption=Home 4-3-3 versus away 5-3-2
```

A bar chart from a JSON spec (the same SVG is reused for PDF and video stills):

```plot
{
  "type": "bar",
  "caption": "Toy regret for three epsilon-greedy variants",
  "x": ["G1", "G2", "G3"],
  "y": [12, 8, 3],
  "yLabel": "regret"
}
```

A map with two points:

```map
{
  "caption": "Mumbai and Pune",
  "points": [
    {"name": "Mumbai", "lat": 19.076, "lon": 72.877},
    {"name": "Pune", "lat": 18.520, "lon": 73.856}
  ]
}
```

A mermaid graph (HTML renders it; other targets use the caption):

```mermaid caption="Markdown compiles to an IR, then to HTML, PDF, audio, and video"
flowchart LR
  md[Markdown] --> ir[Content IR]
  ir --> html[HTML]
  ir --> pdf[PDF]
  ir --> audio[Audio]
  ir --> video[Video]
```

## Motion

:::clip
The short-form video renderer can isolate this section.

```scene
{
  "caption": "A marker travels left to right across the frame",
  "duration": 4,
  "width": 720,
  "height": 240,
  "objects": [
    {"id": "dot", "type": "circle", "r": 14, "fill": "#AA0000"},
    {"id": "label", "type": "text", "text": "t", "fill": "#111", "fontSize": 20}
  ],
  "keyframes": [
    {"t": 0, "dot": {"cx": 40, "cy": 120}, "label": {"x": 40, "y": 80}},
    {"t": 1, "dot": {"cx": 680, "cy": 120}, "label": {"x": 680, "y": 80}}
  ]
}
```
:::

Print/PDF hides the live SVG animation and shows the keyframe strip instead.

## Interactive (HTML only)

Non-HTML targets never run this. They read the caption (and a poster if you set one).

```interactive
{
  "kind": "dataset",
  "caption": "A tiny dataset of sepal measurements. On the live page you can sort columns.",
  "columns": ["sepal", "petal"],
  "rows": [
    [5.1, 1.4],
    [4.9, 1.4],
    [4.7, 1.3],
    [7.0, 4.7]
  ]
}
```

```json-tree
{
  "caption": "A nested JSON tree you can toggle open.",
  "data": {
    "algorithm": "epsilon-greedy",
    "params": { "epsilon": 0.1, "horizon": 1000 },
    "arms": ["a", "b", "c"]
  }
}
```

## Display math

$$
\lim_{T \to \infty} \frac{R_T}{T} = 0
$$
