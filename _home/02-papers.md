---
layout: content
title: Papers
permalink: /papers/
---

# Papers & reports

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
