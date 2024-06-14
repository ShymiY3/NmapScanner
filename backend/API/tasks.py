from celery import shared_task
from .models import Scan
import subprocess
from lxml import etree as ET

def _parse_results(res:str):
    xml_tree = ET.fromstring(res.encode('utf-8'))
    stylesheet_el = xml_tree.xpath('//processing-instruction("xml-stylesheet")')[0]
    href_arg: str = stylesheet_el.attrib.get('href')
    if href_arg is None:
        raise
    xsl_path = href_arg.replace('file://', '', 1)
    xsl_tree = ET.parse(href_arg)
    
    transform = ET.XSLT(xsl_tree)
    html_tree = transform(xml_tree)
    
    return  ET.tostring(html_tree, pretty_print=True).decode('utf-8')


@shared_task(bind=True)
def network_scan(self, scan_result_id, command):
    try:
        # Update status to 'IN_PROGRESS'
        scan_result = Scan.objects.get(id=scan_result_id)
        scan_result.status = 'IN_PROGRESS'
        scan_result.save()
    
        # Your network scanning logic here
        result = subprocess.run(command,stdout=subprocess.PIPE, text=True)

        if result.returncode != 0:
            raise Exception(result.stdout)
        
        html_result = _parse_results(result.stdout)
        # Save the scan result
        scan_result.result_xml = result.stdout
        scan_result.result_html = html_result
        scan_result.status = 'SUCCESS'
        scan_result.save()
    except Exception as e:
        # Update status to 'FAILURE' and save the error
        scan_result.status = 'FAILURE'
        scan_result.error = result.stdout
        scan_result.save()
        raise Exception(e)

    return scan_result.id
