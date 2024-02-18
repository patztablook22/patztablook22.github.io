---
layout: new-text
title: Papers
permalink: /papers/
background: "#303030"
---

<h1 style="font-size: 250%">PAPERS & REPORTS</h1>

<ul class="papers no-a">
{% for paper in site.papers reversed %}
    {% if paper.authors %}
        {% assign authors = paper.authors | split: "," %}
    {% else %}
        {% assign authors = "Patrik Zavoral" %}
    {% endif %}
    <li class="slide-from-bottom">
    <a href="{{ paper.link }}" class="paper">
    <div>
      <h2>{{ paper.title }}</h2>
      <div class="abstract">
      {{ paper.abstract }}
      </div>
    </div>
    </a>
    </li>
{% endfor %}
</ul>
