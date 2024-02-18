---
layout: new-text
title: Projects
permalink: /projects/
background: "#0d1117"
---

<h1 style="font-size: 250%">PROJECTS</h1>

<div class="projects no-a">
{% for project in site.projects reversed %}
    {% unless %project.order %}
        {% continue %}
    {% endunless %}
    <a class="project slide-from-right" href="{{ project.link }}">
    <div>
        <div class="image">
            {% if project.image %}
            <img src="{{ project.image }}" />
            {% else %}
                <img src="https://cdn-icons-png.flaticon.com/128/2111/2111432.png" style="filter: invert(20%);" />
            {% endif %}
        </div>
        <div class="info">
            <h2>{{ project.title }}</h2>
            {{ project.description }}
        </div>
        <div class="technologies">
        {% assign technologies = project.technologies | split: " " %}
        {% for t in technologies %}
            {% assign tech = None %}
            {% for t2 in site.technologies %}
                {% if t2.ref == t %}
                    {% assign tech = t2 %}
                {% endif %}
            {% endfor %}

            <img src="{{ tech.icon }}" />

        {% endfor %}
        </div>
    </div>
    </a>
{% endfor %}
    <div class="more-projects slide-from-right">
        <a href="https://github.com/patztablook22/">See more...</a>
    </div>
</div>
