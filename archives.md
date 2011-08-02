---
layout: default
title: archives
---

<ul>
{% for post in site.posts %}
    <li>{{ post.date | date_to_string }} <a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
</ul>