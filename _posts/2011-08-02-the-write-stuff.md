---
layout: post
title: the write stuff
---

Many a developer looking to improve the front-end peformance of a site has found there way to the worst performing block of code on the site:

{% highlight html %}
<div class="adblock">
    <script type="text/javascript">
    document.write('<scri'+'pt tpye="text/javascript" src="http://adnetwork.example/ad/mysite"></scr'+'ipt>');
    </script>
</div>
{% endhighlight %}

A fair number of naive but smart developers have responded with, "`document.write` is serving no useful purpose on *my* site, I'll overwite the function and figure out how to defer loading that script."

And several brave developers have been lost down this path, finding the contents of the `<script>`:

{% highlight js %}
document.write('<p><a href="http://adnetwork.example/click"><img src="someimage.jpg" /></a>');
{% endhighlight %}

One weekend in Philadelphia, a Tablet front end developer, [Matthew Story](https://github.com/matthewstory/), had enough and [thewritestuff.js (yet to be posted)](https://github.com/tablet/thewritestuff) emerged. A js library that wrestles `document.write` and wins. Though not necessarily a good idea, this has been in use without (significant) issue on [tablethotels.com](http://www.tablethotels.com) for several years.

## Some illustration

thewritestuff.js allows you turn [this](/examples/tws/wrongstuff.html):

{% highlight html %}
<div id="wrongstuff-block">
    <script type="text/javascript">
        document.write('<scr'+'ipt type="text/javascript" src="js/inconsideratead.js"></scr'+'ipt>');
    </script>
</div>
{% endhighlight %}

To [this](/examples/tws/writestuff.html):

{% highlight html %}
<div id="writestuff-block"></div>
<script type="text/javascript">
    Writes.waitingToWrite.push(function() {
        new Write('<scr'+'ipt type="text/javascript" src="inconsideratead.js"></scr'+'ipt>',
            document.getElementById('writestuff-block'));
});
</script>
{% endhighlight %}

Throw further `<script>`'s inside the `document.write`'s, [and it still has the right stuff](/examples/tws/writestuff-2.html). And finally, [the ability to target multiple dom elements](/examples/tws/writestuff-3.html).

## An amateur's attempt at explaining how it works.

It works by overwriting `document.write`, storing the strings sent to the function in an array that serves as a queue of "stuff to be `write`n. Any `<script>` elements that would be written in one of these strings is appended to the targeted element, the result is captured and it's place in the "stuff to be `write`n to the targeted element is replaced by the output. When there are no more `<script>`s left, the string is finally written/appended to the original targeted element.

## Reflection

I appreciate, maybe even entertained, by the utility, ugliness, and uniqueness of this solution to a difficult problem. Cheers to entertaining javascript!