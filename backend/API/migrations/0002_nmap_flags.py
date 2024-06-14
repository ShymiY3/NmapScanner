from django.db import migrations


def create_nmap_flags(apps, schema_editor):
    NmapFlag = apps.get_model("API", "NmapFlag")
    nmap_flags = [
        {"flag": "-iL", "description": "Input from list of hosts/networks"},
        {"flag": "-iR", "description": "Choose random targets"},
        {"flag": "--exclude", "description": "Exclude hosts/networks"},
        {"flag": "--excludefile", "description": "Exclude list from file"},
        {"flag": "-sL", "description": "List Scan - simply list targets to scan"},
        {"flag": "-sn", "description": "Ping Scan - disable port scan"},
        {
            "flag": "-Pn",
            "description": "Treat all hosts as online -- skip host discovery",
        },
        {
            "flag": "-PS",
            "description": "TCP SYN discovery",
        },
        {
            "flag": "-PA",
            "description": "TCP ACK discovery",
        },
        {
            "flag": "-PU",
            "description": "UDP discovery",
        },
        {
            "flag": "-PY",
            "description": "SCTP discovery",
        },
        {
            "flag": "-PE",
            "description": "ICMP echo request discovery probes",
        },
        {
            "flag": "-PP",
            "description": "ICMP timestamp request discovery probes",
        },
        {
            "flag": "-PM",
            "description": "ICMP netmask request discovery probes",
        },
        {"flag": "-PO[protocol list]", "description": "IP Protocol Ping"},
        {
            "flag": "-R",
            "description": "Always do DNS resolution",
        },
        {
            "flag": "-n",
            "description": "Never do DNS resolution",
        },
        {"flag": "--dns-servers", "description": "Specify custom DNS servers"},
        {"flag": "--system-dns", "description": "Use OS's DNS resolver"},
        {"flag": "--traceroute", "description": "Trace hop path to each host"},
        {
            "flag": "-sS",
            "description": "TCP SYN scan",
        },
        {
            "flag": "-sT",
            "description": "TCP Connect() scan",
        },
        {
            "flag": "-sA",
            "description": "TCP ACK scan",
        },
        {
            "flag": "-sW",
            "description": "TCP Window scan",
        },
        {
            "flag": "-sM",
            "description": "TCP Maimon scan",
        },
        {"flag": "-sU", "description": "UDP Scan"},
        {"flag": "-sN", "description": "TCP Null scan"},
        {"flag": "-sF", "description": "TCP FIN scan"},
        {"flag": "-sX", "description": "TCP Xmas scan"},
        {"flag": "--scanflags", "description": "Customize TCP scan flags"},
        {"flag": "-sI", "description": "Idle scan"},
        {"flag": "-sY", "description": "SCTP INIT scan"},
        {"flag": "-sZ", "description": "COOKIE-ECHO scan"},
        {"flag": "-sO", "description": "IP protocol scan"},
        {"flag": "-b", "description": "FTP bounce scan"},
        {"flag": "-p", "description": "Only scan specified ports"},
        {
            "flag": "--exclude-ports",
            "description": "Exclude the specified ports from scanning",
        },
        {
            "flag": "-F",
            "description": "Fast mode - Scan fewer ports than the default scan",
        },
        {"flag": "-r", "description": "Scan ports sequentially - don't randomize"},
        {"flag": "--top-ports", "description": "Scan <number> most common ports"},
        {"flag": "--port-ratio", "description": "Scan ports more common than <ratio>"},
        {
            "flag": "-sV",
            "description": "Probe open ports to determine service/version info",
        },
        {
            "flag": "--version-intensity",
            "description": "Set from 0 (light) to 9 (try all probes)",
        },
        {
            "flag": "--version-light",
            "description": "Limit to most likely probes (intensity 2)",
        },
        {
            "flag": "--version-all",
            "description": "Try every single probe (intensity 9)",
        },
        {
            "flag": "--version-trace",
            "description": "Show detailed version scan activity (for debugging)",
        },
        {"flag": "-sC", "description": "equivalent to --script=default"},
        {
            "flag": "--script",
            "description": "<Lua scripts> is a comma separated list of directories, script-files or script-categories",
        },
        {"flag": "--script-args", "description": "provide arguments to scripts"},
        {
            "flag": "--script-args-file",
            "description": "provide NSE script args in a file",
        },
        {"flag": "--script-trace", "description": "Show all data sent and received"},
        {"flag": "--script-updatedb", "description": "Update the script database."},
        {"flag": "--script-help", "description": "Show help about scripts."},
        {"flag": "-O", "description": "Enable OS detection"},
        {
            "flag": "--osscan-limit",
            "description": "Limit OS detection to promising targets",
        },
        {"flag": "--osscan-guess", "description": "Guess OS more aggressively"},
        {"flag": "-T0", "description": "Set timing template (higher is faster)"},
        {"flag": "-T1", "description": "Set timing template (higher is faster)"},
        {"flag": "-T2", "description": "Set timing template (higher is faster)"},
        {"flag": "-T3", "description": "Set timing template (higher is faster)"},
        {"flag": "-T4", "description": "Set timing template (higher is faster)"},
        {"flag": "-T5", "description": "Set timing template (higher is faster)"},
        {
            "flag": "--min-hostgroup",
            "description": "Parallel host scan group sizes",
        },
        {
            "flag": "--max-hostgroup",
            "description": "Parallel host scan group sizes",
        },
        {
            "flag": "--min-parallelism",
            "description": "Probe parallelization",
        },
        {
            "flag": "--max-parallelism",
            "description": "Probe parallelization",
        },
        {
            "flag": "--min-rtt-timeout",
            "description": "Specifies probe round trip time.",
        },
        {
            "flag": "--max-rtt-timeout",
            "description": "Specifies probe round trip time.",
        },
        {
            "flag": "--initial-rtt-timeout",
            "description": "Specifies probe round trip time.",
        },
        {
            "flag": "--max-retries",
            "description": "Caps number of port scan probe retransmissions.",
        },
        {"flag": "--host-timeout", "description": "Give up on target after this long"},
        {
            "flag": "--scan-delay/--max-scan-delay",
            "description": "Adjust delay between probes",
        },
        {
            "flag": "--min-rate",
            "description": "Send packets no slower than <number> per second",
        },
        {
            "flag": "--max-rate",
            "description": "Send packets no faster than <number> per second",
        },
        {
            "flag": "-f; --mtu",
            "description": "fragment packets (optionally w/given MTU)",
        },
        {"flag": "-D", "description": "Cloak a scan with decoys"},
        {"flag": "-S", "description": "Spoof source address"},
        {"flag": "-e", "description": "Use specified interface"},
        {"flag": "-g", "description": "Use given port number"},
        {"flag": "--source-port", "description": "Use given port number"},
        {
            "flag": "--proxies",
            "description": "Relay connections through HTTP/SOCKS4 proxies",
        },
        {"flag": "--data", "description": "Append a custom payload to sent packets"},
        {
            "flag": "--data-string",
            "description": "Append a custom ASCII string to sent packets",
        },
        {"flag": "--data-length", "description": "Append random data to sent packets"},
        {
            "flag": "--ip-options",
            "description": "Send packets with specified ip options",
        },
        {"flag": "--ttl", "description": "Set IP time-to-live field"},
        {"flag": "--spoof-mac", "description": "Spoof your MAC address"},
        {
            "flag": "--badsum",
            "description": "Send packets with a bogus TCP/UDP/SCTP checksum",
        },
        {
            "flag": "-oN",
            "description": "Output scan in normal format, respectively, to the given filename.",
        },
        {
            "flag": "-oX",
            "description": "Output scan in XML format, respectively, to the given filename.",
        },
        {
            "flag": "-oS",
            "description": "Output scan in s|<rIpt kIddi3 format, respectively, to the given filename.",
        },
        {
            "flag": "-oG",
            "description": "Output scan in Grepable format, respectively, to the given filename.",
        },
        {"flag": "-oA", "description": "Output in the three major formats at once"},
        {
            "flag": "-v",
            "description": "Increase verbosity level (use -vv or more for greater effect)",
        },
        {
            "flag": "-d",
            "description": "Increase debugging level (use -dd or more for greater effect)",
        },
        {
            "flag": "--reason",
            "description": "Display the reason a port is in a particular state",
        },
        {"flag": "--open", "description": "Only show open (or possibly open) ports"},
        {"flag": "--packet-trace", "description": "Show all packets sent and received"},
        {
            "flag": "--iflist",
            "description": "Print host interfaces and routes (for debugging)",
        },
        {
            "flag": "--append-output",
            "description": "Append to rather than clobber specified output files",
        },
        {"flag": "--resume", "description": "Resume an aborted scan"},
        {
            "flag": "--noninteractive",
            "description": "Disable runtime interactions via keyboard",
        },
        {
            "flag": "--stylesheet",
            "description": "XSL stylesheet to transform XML output to HTML",
        },
        {
            "flag": "--webxml",
            "description": "Reference stylesheet from Nmap.Org for more portable XML",
        },
        {
            "flag": "--no-stylesheet",
            "description": "Prevent associating of XSL stylesheet w/XML output",
        },
        {"flag": "-6", "description": "Enable IPv6 scanning"},
        {
            "flag": "-A",
            "description": "Enable OS detection, version detection, script scanning, and traceroute",
        },
        {"flag": "--datadir", "description": "Specify custom Nmap data file location"},
        {
            "flag": "--send-ip",
            "description": "Send using raw IP packets",
        },
        {
            "flag": "--send-eth",
            "description": "Send using raw ethernet frames",
        },
        {
            "flag": "--privileged",
            "description": "Assume that the user is fully privileged",
        },
        {
            "flag": "--unprivileged",
            "description": "Assume the user lacks raw socket privileges",
        },
        {"flag": "-V", "description": "Print version number"},
        {"flag": "-h", "description": "Print this help summary page."},
    ]

    for item in nmap_flags:
        NmapFlag.objects.create(**item)


class Migration(migrations.Migration):

    dependencies = [
        ("API", "0001_initial"),
    ]

    operations = [migrations.RunPython(create_nmap_flags)]
