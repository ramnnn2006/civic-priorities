import pathlib,subprocess,concurrent.futures,json,datetime
r=pathlib.Path('planning/research')
urls={
'ps1-india':'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2085649&lang=2&reg=48',
'ps1-brazil':'https://dados.recife.pe.gov.br/api/3/action/package_show?id=manifestacoes-recebidas-via-ouvidoria',
'ps2-india':'https://api.worldbank.org/v2/country/IND/indicator/EN.ATM.PM25.MC.M3?format=json&date=2020&per_page=2',
'ps2-brazil':'https://api.worldbank.org/v2/country/BRA/indicator/EN.ATM.PM25.MC.M3?format=json&date=2020&per_page=2',
'ps3-brazil':'https://apidadosabertos.saude.gov.br/cnes/estabelecimentos?limit=2&offset=0',
'ps4-india':'https://api.worldbank.org/v2/country/IND/indicator/AG.YLD.CREL.KG?format=json&date=2022&per_page=2',
'prior-civic':'https://github.com/theabhishek4u/JanMitra-AI',
'prior-air':'https://github.com/Akhila-Dubasi/GA-KELM-AQI-Predictor',
'prior-health':'https://github.com/archer-paul/pharmacy-inventory-management',
'prior-agri':'https://github.com/SnoozeScript/404',
'cpgrams-pdf':'https://darpg.gov.in/sites/default/files/2024-07-01-state.pdf'
}
def go(pair):
 k,u=pair;p=r/'sources'/f'{k}.md';a=subprocess.run(['/home/sparxz/.local/bin/scrapling','extract','get',u,str(p),'--timeout','8'],capture_output=True,text=True,timeout=35)
 row={'id':k,'url':u,'method':'Scrapling CLI','exit':a.returncode,'log':(a.stderr+a.stdout)[-700:]}
 if k.startswith('ps') or k=='cpgrams-pdf':
  dest=r/'samples'/(k+('.pdf' if k=='cpgrams-pdf' else '.json' if k!='ps1-india' else '.html'))
  b=subprocess.run(['curl','-g','-L','--max-time','10','-sS','-o',str(dest),'-w','%{http_code} %{content_type}',u],capture_output=True,text=True);row.update(raw_status=b.stdout,raw_error=b.stderr,bytes=dest.stat().st_size if dest.exists() else 0)
 return row
with concurrent.futures.ThreadPoolExecutor(max_workers=11) as ex:
 rows=[]
 for f in ex.map(go,urls.items()):rows.append(f);print(f,flush=True)
(r/'final-probes.json').write_text(json.dumps(rows,indent=2))
a=subprocess.run(['/home/sparxz/.local/bin/scrapling','extract','fetch','https://hack2skill.com/event/codeforcommunities2',str(r/'sources/rules-dynamic.md'),'--executable-path','/usr/bin/chromium','--timeout','12000','--wait','1000'],capture_output=True,text=True,timeout=25)
(r/'rules-dynamic.log').write_text(a.stdout+a.stderr)
