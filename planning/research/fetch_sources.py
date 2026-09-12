import subprocess,concurrent.futures,json,pathlib,datetime
root=pathlib.Path('planning/research'); urls={
'rules':'https://hack2skill.com/event/codeforcommunities2',
'gdg':'https://gdg.community.dev/events/details/google-gdg-cloud-bhubaneswar-presents-code-for-communities-20/',
'speech-languages':'https://cloud.google.com/speech-to-text/v2/docs/speech-to-text-supported-languages',
'speech-limits':'https://cloud.google.com/speech-to-text/v2/quotas',
'translation-languages':'https://cloud.google.com/translate/docs/languages',
'translation-limits':'https://cloud.google.com/translate/quotas',
'gemini-limits':'https://ai.google.dev/gemini-api/docs/rate-limits',
'gemini-structured':'https://ai.google.dev/gemini-api/docs/structured-output',
'cpcb':'https://www.data.gov.in/resource/real-time-air-quality-index-various-locations',
'agmarknet':'https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi',
'bhuvan':'https://bhuvan.nrsc.gov.in/home/index.php',
'imd':'https://mausam.imd.gov.in/imd_latest/contents/api.pdf',
'who':'https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=SpatialDim%20eq%20%27IND%27&$top=2',
'br-health':'https://apidadosabertos.saude.gov.br/v1/cnes/estabelecimentos?limit=2&offset=0',
'br-civic':'https://dados.recife.pe.gov.br/api/3/action/package_search?q=ouvidoria&rows=1',
'br-agri':'https://servicodados.ibge.gov.br/api/v3/agregados/5457/periodos/2023/variaveis/214?localidades=N1[all]&classificacao=782[40124]',
'br-air':'https://api.openaq.org/v3/locations?iso=BRA&limit=1',
'fao':'https://fenixservices.fao.org/faostat/api/v1/en/data/QCL?area_code=100&year=2023&item_code=15&element_code=5510',
}
def go(item):
 k,u=item;p=root/'sources'/f'{k}.md';r=subprocess.run(['/home/sparxz/.local/bin/scrapling','extract','get',u,str(p),'--timeout','18'],capture_output=True,text=True);return {'id':k,'url':u,'exit':r.returncode,'bytes':p.stat().st_size if p.exists() else 0,'log':(r.stderr+r.stdout)[-1800:]}
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
 rows=list(ex.map(go,urls.items()))
(root/'scrapling-log.json').write_text(json.dumps(rows,indent=2));print(json.dumps(rows,indent=2))
