from nmap3.utils import get_nmap_path
import nmap3
import sys

args = sys.argv[1:]
flags = ['-oX', '-']

def extract_target():
    if not args:
        raise Exception('No target specified')
    return args.pop()
    
def compose_command():
    target = extract_target()
    nmap_path = get_nmap_path()
    flags.extend(args)
    return [nmap_path, *flags, target]

try:
    command = compose_command()
    nmap = nmap3.Nmap()
    res = nmap.run_command(command)
    print(res)
except Exception as e:
    print(str(e))
    sys.exit(1)