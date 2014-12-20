var packageHandler,
    render,
    onError,

    logCache = [],
    log;

render = function (consumed, fup) {

    document.body.classList.remove("loading");
    document.getElementById("log").remove();
    document.getElementById("fup").innerHTML = fup;
    document.getElementById("consumed").innerHTML = consumed;
    document.getElementById("bb-meter").innerHTML =
        (((fup - consumed) / fup) * 100).toFixed(2) + "%";

    return this;
};

onError = function (message) {
    document.body.classList.add("error");
    message = message || this.statusText;
    if (this.status === 0) {
        log('error', "Unable to connect to the Internet");
    } else {
        log('error', message);
    }
};

log = function (level, message) {
    level = level || 'info';
    message = message || ' ';

    // Cache message till DOM is ready
    logCache.push([level, message]);

    if (document.readyState !== 'complete') {
        return;
    }

    var $log = document.getElementById("log"),
        span;

    logCache.forEach(function (message) {
        span = document.createElement("span");
        span.className = message[0];
        span.innerHTML = message[1];

        $log.appendChild(span);
    });

    logCache = [];
};

log('info', 'Starting up');

// Find and update user's package.
packageHandler = new XMLHttpRequest();
packageHandler.onerror = onError;
packageHandler.open("GET", "http://portal.acttv.in/index.php/mypackage", true);
packageHandler.onreadystatechange = function () {
    var div,
        t,
        match,
        usage, // Total usage, in GigaBytes
        fup; // Users's package -> one among the list

    if (this.readyState !== 4 || this.status !== 200) {
        log('non-act', 'Not within ACT Broadband');
        return this;
    }

    log('success', 'Fetched package info');

    div = document.createElement("div");
    div.innerHTML = this.responseText;

    t = div
        .querySelector('title')
        .textContent;

    if (t === 'Invalid Access') {
        return log('error', "`Invalid Access` fetching package information");
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
        log('error', "Unable to parse response");
        return 1;
    }

    return render(usage, fup);
};
log('info', 'Fetching package info');
packageHandler.send();
