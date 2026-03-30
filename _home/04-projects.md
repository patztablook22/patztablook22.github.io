---
layout: content
title: Repos
permalink: /repos/
background: "#1d1c21"
content_width_class: "max-content-width"
---

# Some repos

<div class="repos">

{% assign repos = site.github.repositories %}
{% assign order = "matcha,patztabot22,jaq,hmm,sci-hub,shellbot,live-music-projection,genbot,metacentrum-llm-quickstart,length-based-overfitting,kali,mandelbrot-viewer-qt-quick,npfl129,dotfiles,mp3-tree-metadata,matcha-benchmark" | split: "," %}

{% for name in order %}
  {% for repo in site.github.public_repositories %}
    {% if repo.name == name %}


    {% assign license_label = repo.license.name | default: 'No License' %}

    <div class="repo-badge">
        <span class="repo-name"><a href="{{ repo.html_url }}" target="_blank">{{ repo.name }}</a></span>
        <span class="repo-description">{{ repo.description }}</span>
        <span class="repo-stats">
            <span>
                <i class="fas fa-code"></i> {{ repo.language | default: "Code" }}
            </span>

            <span>
                <i class="fas fa-star"></i> {{ repo.stargazers_count }}
            </span>

            <span>
              <i class="fas fa-code-branch"></i> {{ repo.forks_count }}
            </span>

            <span>
              <i class="fas fa-balance-scale"></i> {{ repo.license.key | upcase | default: "No License" }}
            </span>
        </span>
    </div>

    {% endif %}
  {% endfor %}
{% endfor %}


</div>
<div class="more-repos slide-from-right">
  <a href="{{ site.github.owner_url }}">See more...</a>
</div>
