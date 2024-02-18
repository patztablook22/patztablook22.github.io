---
layout: new-text
title: "Other&nbsp;work"
permalink: /other/
---

<h1 style="font-size: 250%">OTHER WORK</h1>

<div class="other-work no-a">
{% for post in site.posts %}
    <a class="work slide-from-top" href="{{ post.url }}">
    <hr />
        <h2>{{ post.title }}</h2>
        <div class="excerpt">
        {{ post.excerpt }}
        </div>
    </a>
{% endfor %}
</div>
