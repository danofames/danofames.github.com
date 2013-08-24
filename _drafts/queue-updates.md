---
layout: post
title: exercise in shell commands
---

The scenario: fields on db records within a web application are synced to fields in an external application. A recent task had me adding new fields to be Salesforce synced. Once the sync script was updated, existing records should be synced to pull in those new fields.

* The syncing takes place through directory/file based queues ([fsq](https://github.com/axialmarket/fsq)).
* There is a program that writes the appropriate file to the queue given a record type and id.
* The queue directory is writable only to the application's user, `appuser`.

I want to provide a script or commands that could be used in the release environments to queue the updates to the external application.

Getting a list of the records that should be updated was easy:

{% highlight sql %}
mysql -udbuser db -ss -e 'select id from this_table where necessary_conditions = true;'
{% endhighlight %}

That gives me a list of record ids to work with. Which can be passed to the queueing program.

{% highlight bash %}
mysql -udbuser db -ss -e 'select id from this_table where necessary_conditions = true;' | \
    xargs -I{} sync -t RECORD_TYPE {}
{% endhighlight %}

`sync` is python, and needs some path set to import some modules.

{% highlight bash %}
export PYTHONPATH="$PYTHONPATH:/path/to/lib"
mysql -udbuser db -ss -e 'select id from this_table where necessary_conditions = true;' | \
    xargs -I{} sync -t RECORD_TYPE {}
{% endhighlight %}

`sync` runs, but I see directory permission errors, my user can't write to the queue directory.

{% highlight bash %}
export PYTHONPATH="$PYTHONPATH:/path/to/lib"
mysql -udbuser db -ss -e 'select id from this_table where necessary_conditions = true;' | \
    xargs -I{} sudo -u appuser sync -t RECORD_TYPE {}
{% endhighlight %}

Back to the import errors, the path isn't pulled in. There's this `-E` option to preserve environment. 

{% highlight bash %}
export PYTHONPATH="$PYTHONPATH:/path/to/lib"
mysql -udbuser db -ss -e 'select id from this_table where necessary_conditions = true;' | \
    xargs -I{} sudo -E -u appuser sync -t RECORD_TYPE {}
{% endhighlight %}

Same import error. Which part isn't working?

{% highlight bash %}
SOMEVAR="this"
echo $SOMEVAR
> this
sudo echo $SOMEVAR
> this
{% endhighlight %}

Look, see, 'this' is there!

{% highlight bash %}
printenv SOMEVAR
>
{% endhighlight %}

But not there.

{% highlight bash %}
export SOMEVAR
printenv SOMEVAR
> this
{% endhighlight %}

Now it's there.

{% highlight bash %}
sudo printenv SOMEVAR
>
{% endhighlight %}

But not here.

{% highlight bash %}
mysql -udbuser db -ss -e 'select id from this_table where necessary_conditions = true;' | \
    xargs -I{} sudo -u appuser bash -c 'export PYTHONPATH="$PYTHONPATH:/path/to/lib"; sync -t RECORD_TYPE {};'
{% endhighlight %}

