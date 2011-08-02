---
layout: post
title: the write stuff
---

It was easy to get excited about front end performance optimization when it started becoming popular. Not far in to that effort, most of us find a little snippet like this that ends up being the biggest drag on the performance of the page:

{% highlight html %}
<div class="adblock">
    <script type="text/javascript">
document.write('<script tpye="text/javascript" src="http://adnetwork.example/ad/mysite"></script>');</script>
</div>
{% endhighlight %}

The ad networks servers are often slow, and it's blocking the download of other resources to boot.

My first thought was, "no sweat, I that `document.write` is serving no purpose, I'll load that script after page load." Then, I saw the contents of that `<script>`:

{% highlight js %}
document.write('<p><a href="http://adnetwork.example/click"><img src="someimage.jpg" /></a>');
{% endhighlight %}

And, nevermind.

One weekend in Philadelphia, another Tablet front end developer, [Matthew Story](https://github.com/matthewstory/), had enough and jammed out [thewritestuff.js](https://github.com/tablet/thewritestuff). A js library that wrestles `document.write` and wins. While not necessarily a good idea, this has been in use without (known) issue on [tablethotels.com](http://www.tablethotels.com) for a couple years.

thewritestuff.js allows you turn [this](../examples/tws/wrongstuff.html):

{% highlight html %}
<div id="wrongstuff-block">
    <script type="text/javascript">
        document.write('<scr'+'ipt type="text/javascript" src="js/inconsideratead.js"></scr'+'ipt>');
</script>
</div>
{% endhighlight %}

To [this](../examples/tws/writestuff.html):

{% highlight html %}
<div id="shitty-ad-block"></div>
<script type="text/javascript">
    Writes.waitingToWrite.push(function() {
        new Write('<scr'+'ipt type="text/javascript" src="inconsideratead.js"></scr'+'ipt>',
            document.getElementById('shitty-ad-block'));
});
</script>
{% endhighlight %}

