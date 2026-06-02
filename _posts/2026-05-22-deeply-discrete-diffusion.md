---
layout: post
title:  "Deeply discrete diffusion"
date:   2026-05-22 01:45:01 +0100
---

Motivation
• Graphs used as an abstract language throughout modern STEM
• Can encode discrete structures — molecules, social networks, etc.
Problem setup
A graph \\( G \\) over \\( n \\) vertices is represented as:
\\( G = (X,A), X \\in \\mathbb{R}^{n \times d}, A \in \\{0, 1\\}^{n \times n} \\)
Goal: learn a distribution over graphs and generate novel, faithful samples.
Classical generative models and their limitations:
• VAEs (Simonovsky and Komodakis, 2018) — expensive graph-matching for permutation invariance
• GANs (Wang et al., 2018) — mode collapse (reduction of diversity)
• Normalising flows (Luo, Yan, and Ji, 2021) — constrained to bijective mappings
Diffusion models have emerged as a compelling alternative.


[Link to pdf](https://drive.google.com/file/d/1om6W0XTADOH5nTCBTc6DNA63sjHuTsEH/view?usp=sharing)

Coursework for the [Applications of Neural Networks Theory](https://is.cuni.cz/studium/predmety/index.php?&do=predmet&kod=NAIL013&skr=2025) MFF UK module.
