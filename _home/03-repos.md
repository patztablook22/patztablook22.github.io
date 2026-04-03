---
layout: content
title: Repos
permalink: /repos/
background: "#1d1c21"
content_width_class: "max-content-width"
---

# GitHub <i class="fa-brands fa-github"></i>

<div class="repos">

<div class="repo-badge profile-badge">
  <div class="profile-header">
    <img src="{{ site.github.owner.avatar_url }}" class="avatar">
    <div>
      <span class="repo-name">
        <a href="{{ site.github.owner.html_url }}">
          {{ site.github.owner.name | default: site.github.owner.login }}
        </a>
      </span>
      <span class="repo-description">{{ site.github.owner.bio }}</span>
      <div class="profile-stats">
        <span><i class="fas fa-users"></i> {{ site.github.owner.followers }}</span>
        <span><i class="fas fa-code-branch"></i> {{ site.github.owner.public_repos }}</span>
        </div>
    </div>
  </div>

  <div class="profile-info">
    <span><i class="fas fa-envelope"></i> {{ site.github.owner.email }}</span>
    <span><i class="fas fa-building"></i> {{ site.github.owner.company }}</span>
    <span><i class="fas fa-location-dot"></i> {{ site.github.owner.location }}</span>
    <span><i class="fas fa-link"></i> <a href="https://{{ site.github.owner.blog }}">{{ site.github.owner.blog }}</a></span>
  </div>
</div>

{% assign repos = site.github.repositories %}
{% assign order = "matcha,patztabot22,jaq,hmm,sci-hub,shellbot,live-music-projection,genbot,metacentrum-llm-quickstart,length-based-overfitting,kali,mandelbrot-viewer-qt-quick,npfl129,dotfiles,mp3-tree-metadata,matcha-benchmark" | split: "," %}

{% for name in order %}
  {% for repo in site.github.public_repositories %}
    {% if repo.name == name %}


    {% assign license_label = repo.license.name | default: 'No License' %}

    <div class="repo-badge">
        <span class="repo-name"><a href="{{ repo.html_url }}">{{ repo.name }}</a></span>
        <span class="repo-description">{{ repo.description }}</span>
        <span class="repo-stats">
            {% if repo.language %}
                <span>
                    <i class="fas fa-code"></i> {{ repo.language | default: "Code" }}
                </span>
            {% endif %}

            <span>
                <i class="fas fa-star"></i> {{ repo.stargazers_count }}
            </span>

            <span>
              <i class="fas fa-code-branch"></i> {{ repo.forks_count }}
            </span>

            {% if repo.license.key %}
                <span>
                  <i class="fas fa-balance-scale"></i> {{ repo.license.key | upcase | default: "No License" }}
                </span>
            {% endif %}
        </span>
    </div>

    {% endif %}
  {% endfor %}
{% endfor %}


</div>
<div class="more-repos slide-from-right">
  <a href="{{ site.github.owner_url }}?tab=repositories">See more...</a>
</div>
