
var currentA = null;
var jiraRe = new RegExp("("
        /* GateIn */
        + "GTNPORTAL|GTNCOMMON|GTNWCM"
        /* Hawkular */
        + "|HAWKULAR|HWKAGENT|HWKALERTS|HWKBTM|HWKINVENT|HWKMETRICS"
        /* Keycloak */
        + "|KEYCLOAK"
        /* JBoss Tools */
        + "|JBIDE|JBDS|TOOLSDOC"
        /* JBoss AS, WildFly and EAP */
        + "AS7|JBAS|JBPAPP6|WFLY|WFCORE|UNDERTOW"
        /* Misc */
        + "|ARQ|ARQGRA|JBQA|JBPAPP|FORGE|FORGEPLUGINS|JDF|HIBERNATE|MODE|SHRINKRES|SHRINKWRAP|SHRINKDESC|RF|RFPL|RFSBOX"
        + ")-[0-9]+", "g");
var bugzillaRe = new RegExp("(BZ|Bug)[ #\\-]?[0-9]+", "gi");

function traverseDom(node, func) {
    var endA = false;
    if (node.nodeType == 1 && node.nodeName.toLowerCase() == "a") {
        currentA = node;
        endA = true;
    }
    func(node);
    node = node.firstChild;
    while (node) {
        traverseDom(node, func);
        node = node.nextSibling;
    }
    if (endA) {
        currentA = null;
    }
}

function linkJira(node) {
    if (node.nodeType == 3 && node.nodeValue.trim().length > 0) {
            var matches = node.nodeValue.match(jiraRe);
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    var newA = document.createElement("a");
                    newA.href = "https://issues.jboss.org/browse/"+ matches[i];
                    newA.className = "JBossJiraContentScriptBlock";
                    newA.target = "_blank";
                    newA.innerHTML = matches[i];
                    var insertBefore = currentA ? currentA : node;
                    insertBefore.parentNode.insertBefore(newA, insertBefore);
                }
            }
            matches = node.nodeValue.match(bugzillaRe);
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    var bugId = matches[i].match(new RegExp("[0-9]+$"));
                    var newA = document.createElement("a");
                    newA.href = "https://bugzilla.redhat.com/show_bug.cgi?id="+ bugId;
                    newA.className = "JBossJiraContentScriptBlock";
                    newA.target = "_blank";
                    newA.innerHTML = "BZ#"+ bugId;
                    var insertBefore = currentA ? currentA : node;
                    insertBefore.parentNode.insertBefore(newA, insertBefore);
                }
            }
    }
}

var nodeHandlers = function (node) {
    linkJira(node);
};

traverseDom(document.body, nodeHandlers);

