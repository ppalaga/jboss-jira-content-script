
var currentA = null;
var trackers = [
    {
        id: "jbossJira",
        regExp: new RegExp("("
                /* Camel/Fuse */
                + "ENTESB"
                /* GateIn */
                + "|GTNPORTAL|GTNCOMMON|GTNWCM"
                /* Hawkular */
                + "|HAWKULAR|HWKAGENT|HWKALERTS|HWKBTM|HWKINVENT|HWKMETRICS"
                /* Keycloak */
                + "|KEYCLOAK"
                /* JBoss Tools */
                + "|JBIDE|JBDS|TOOLSDOC"
                /* JBoss AS, EAP */
                + "|AS7|JBAS|JBPAPP6|JBEAP"
                /* WildFly and its deps */
                + "|WFLY|WFCORE|UNDERTOW"
                + "|DMR|EJBCLIENT|EMB"
                + "|HAL|HIBERNATE"
                + "|JBADMCON|JBMANCON|JBASMP|JBASM|JBBOOT|JBCLUSTER|JBEE|JBMETA|JBPROFILE|JBTM|LOGMGR|MODULES"
                + "|REM3"
                + "|RELOADED|MSC"
                + "|SECURITY|SVCBIND|WFARQ"
                + "|WFCOM|WFGP|WFTC"
                /* Misc */
                + "|ARQ|ARQGRA|JBQA|JBPAPP|FORGE|FORGEPLUGINS|JDF|MODE"
                + "|SHRINKRES|SHRINKWRAP|SHRINKDESC"
                + "|SWARM"
                + "|RF|RFPL|RFSBOX"
                + ")-[0-9]+", "g"),
        getIssueIds: function (string) {
            return string.match(this.regExp);
        },
        getLinkUrl: function (id) {
            return "https://issues.jboss.org/browse/"+ id;
        },
        getLinkText: function (id) {
            return id;
        }
    },
    {
        id: "redHatBugzilla",
        regExp: new RegExp("(BZ|Bug)[ #\\-]?[0-9]+", "gi"),
        idRegExp: new RegExp("[0-9]+$"),
        getIssueIds: function (string) {
            var rawIds = string.match(this.regExp);
            if (rawIds) {
                for (var i = 0; i < rawIds.length; i++) {
                    rawIds[i] = rawIds[i].match(this.idRegExp);
                }
            }
            return rawIds;
        },
        getLinkUrl: function (id) {
            return "https://bugzilla.redhat.com/show_bug.cgi?id="+ id;
        },
        getLinkText: function (id) {
            return "BZ#" + id;
        }
    },
    {
        id: "hibernateJira",
        regExp: new RegExp("("
                /* Hibernate ORM */
                + "HHH"
                + ")-[0-9]+", "g"),
        getIssueIds: function (string) {
            return string.match(this.regExp);
        },
        getLinkUrl: function (id) {
            return "https://hibernate.atlassian.net/browse/"+ id;
        },
        getLinkText: function (id) {
            return id;
        }
    },
    {
        id: "asfJira",
        regExp: new RegExp("("
                /* Camel */
                + "CAMEL"
                + ")-[0-9]+", "g"),
        getIssueIds: function (string) {
            return string.match(this.regExp);
        },
        getLinkUrl: function (id) {
            return "https://issues.apache.org/jira/browse/"+ id;
        },
        getLinkText: function (id) {
            return id;
        }
    },];

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

function handleNode(node) {
    if (node.nodeType == 3 && node.nodeValue.trim().length > 0) {
        var linkDiv;
        var linkDivChildrenCount = 0;
        for (var j = 0; j < trackers.length; j++) {
            var tracker = trackers[j];
            var ids = tracker.getIssueIds(node.nodeValue);
            if (ids) {
                if (!linkDiv) {
                    linkDiv = document.createElement("div");
                }
                linkDiv.className = "JBossJiraContentScriptBlock";
                for (var i = 0; i < ids.length; i++) {
                    var newA = document.createElement("a");
                    newA.href = tracker.getLinkUrl(ids[i]);
                    newA.target = "_blank";
                    newA.innerHTML = tracker.getLinkText(ids[i]);
                    if (linkDivChildrenCount > 0) {
                        linkDiv.appendChild(document.createTextNode(" "));
                    }
                    linkDivChildrenCount++;
                    linkDiv.appendChild(newA);
                }
            }
        }
        if (linkDiv) {
            var insertBefore = currentA ? currentA : node;
            insertBefore.parentNode.insertBefore(linkDiv, insertBefore);
        }
    }
}

traverseDom(document.body, handleNode);

