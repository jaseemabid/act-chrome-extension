/*global console, document, XMLHttpRequest */
'use strict';

var packageHandler,
    render,
    onError;

render = function (consumed, fup) {
    document.getElementById("fup").innerHTML = fup;
    document.getElementById("consumed").innerHTML = consumed;
    document.querySelector("#bb-meter span").style.width =
        (((fup - consumed) / fup) * 100).toFixed(2) + "%";

    return this;
};

onError = function () {
    console.error("Firing onError");

    document.body.classList.remove("loading");
    document.getElementById("oops").classList.remove("hidden");
    return this;
};

console.info('Starting up');

// Find and update user's package.
packageHandler = new XMLHttpRequest();
packageHandler.onerror = onError;
packageHandler.open("GET", "http://portal.acttv.in/index.php/mypackage", true);
packageHandler.onreadystatechange = function () {
    var div,
        t,
        match,
        usage, // Total usage, in GigaBytes
        fup, // Users's package -> one among the list
        oops = document.getElementById("oops");

    if (this.readyState !== this.DONE) {
        console.info("Fetching remote data");
        return this;
    }

    console.log("Remove .loading");
    document.body.classList.remove("loading");

    if (this.status !== 200) {
        // ACT page gives a 500 when outside network. Weird :(
        console.error('Not within ACT Broadband');
        oops.classList.remove("hidden");
        this.onreadystatechange = null;
        return this;
    }

    console.info('success', 'Fetched package info');
    document.getElementById("content").classList.remove("hidden");

    div = document.createElement("div");
    div.innerHTML = this.responseText;

    t = div
        .querySelector('title')
        .textContent;

    if (t === 'Invalid Access') {
        return console.error("`Invalid Access` fetching package information");
    }

    // Sample: "59.04 GB (Quota 200.00 GB)"
    t = div
        .querySelector(".moduletable tr:nth-child(4) td:nth-child(2) label")
        .textContent
        .trim();

    // >> t.match(/([\d\.]+)\s*GB\s*\(Quota\s*([\d\.]+).*/);
    // ["59.05 GB (Quota 200.00 GB)", "59.05", "200.00"]

    try {
        match = t.match(/([\d\.]+)\s*GB\s*\(Quota\s*([\d\.]+)\sGB\)/);
        usage = parseFloat(match[1], 10);
        fup = parseFloat(match[2], 10);
    } catch (e) {
        console.error("Unable to parse response");
        return 1;
    }

    return render(usage, fup);
};

packageHandler.send();
