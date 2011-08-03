---
layout: post
title: the write stuff
---

I was eager to jump on front end performance optimization of tablethotels.com when the recommendations started emerging. Not far in to that effort, most of us find a little snippet like this that ends up being the biggest drag on the performance of the page:

{% highlight html %}
<div class="adblock">
    <script type="text/javascript">
    document.write('<script tpye="text/javascript" src="http://adnetwork.example/ad/mysite"></script>');
    </script>
</div>
{% endhighlight %}

The ad networks servers are often slow, and it's blocking the download of other resources to boot.

My first thought was, "no sweat, that `document.write` is serving no purpose, I'll defer loading that script." Then, I saw the contents of the `<script>`:

{% highlight js %}
document.write('<p><a href="http://adnetwork.example/click"><img src="someimage.jpg" /></a>');
{% endhighlight %}

And, nevermind.

One weekend in Philadelphia, another Tablet front end developer, [Matthew Story](https://github.com/matthewstory/), had enough and [thewritestuff.js](https://github.com/tablet/thewritestuff) emerged. A js library that wrestles `document.write` and wins. While not necessarily a good idea, this has been in use without (known) issue on [tablethotels.com](http://www.tablethotels.com) for several years.

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

Throw nested `<script>`'s inside the `document.write`'s, [and it still has the right stuff](/examples/tws/writestuff-2.html). And finally, [the ability to target multiple dom elements](/examples/tws/writestuff-3.html).

It works by storing the strings sent to `document.write` in an array, keyed by containing object. Each time a string contains a `<script>`, the element is appended to the containing element, and the result of the `<script>` is captured and it's place in the queue of stuff to be appended to the containing element is replaced by the output. When there are no more `<script>`s left, the string is appended to the original containing element.

The most enjoyable, maybe entertaining, code can come in an ugly but delightfully unique solution to a difficult problem. Or something like that.
