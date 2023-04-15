---
layout: default2
title: Series
series: [Category theory]
---

<h1>Series</h1>

{% for s in page.series %}
<h2>{{ s }}</h2>
<ul>
  {% for post in site.posts %}
    {% if post.series == s %}
    <li>
      <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
    </li>
    {% endif %}
  {% endfor %}
</ul>
{% endfor %}
