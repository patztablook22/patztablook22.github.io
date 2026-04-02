---
layout: content
title: "Other"
permalink: /other/
---


# Other

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
