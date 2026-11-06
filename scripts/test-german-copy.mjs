import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {createRequire} from 'node:module'
import ts from 'typescript'
const require=createRequire(import.meta.url),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
const cache=new Map()
function moduleFile(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const source=fs.readFileSync(file,'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const localRequire=name=>{if(name==='next/link')return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};if(name==='next/navigation')return {useRouter:()=>({refresh(){},push(){}}),usePathname:()=>'/'};if(name.startsWith('@/')){const base=name.slice(2);return moduleFile(fs.existsSync(base+'.ts')?base+'.ts':base+'.tsx')}return require(name)};new Function('require','module','exports',js)(localRequire,mod,mod.exports);cache.set(file,mod.exports);return mod.exports}
const fixtures=[
 ['VolunteerSignupForm',{},['Vorname','E-Mail','Altersgruppe','ab 26 Jahren','name="firstName"','name="ageBand"']],
 ['SponsorEnquiryForm',{},['mindestens 25','name="requestedHours"','min="25"','Sponsoringangebot anfragen','Datenschutzhinweise</a> gelesen.']],
 ['SponsorEnquiryForm',{mode:'employee_project'},['Dein Team','name="teamSize"','name="hoursPerEmployee"','Angebot für deinen Teameinsatz anfragen']],
 ['SeasonalNeedsForm',{},['Saisonbeginn','Materialbudget','name="volunteerCount"','Datenschutzhinweise']],
 ['VolunteerOrganizerForm',{},['Ansprechperson','An- und Abreise','name="organizationName"']],
 ['AccessForm',{},['E-Mail-Adresse deiner Registrierung','Anmeldelink per E-Mail senden','value="club"','value="volunteer"']],
 ['VolunteerProfileSettings',{displayName:'Alex',slug:'alex',enabled:false,isMinor:false,country:'DE',champsboard:false},['Anzeigename','Deutschland','Profileinstellungen speichern']],
 ['ActivityJoinButton',{opportunityId:'test',available:true},['Meinen Platz bestätigen','Freunde einladen']],
 ['CompanyWorkspace',{token:'synthetic',data:{booking:{title:'Vereinsprojekt',amount_cents:123450,status:'draft',paid:false},employees:[{id:'e',email:'fixture@example.test',status:'accepted',verified_minutes:90}]}},['1.234,50','Zugesagt','1,5','Teameinladungen senden']],
 ['BillingPanel',{billing:{account:{address:''},unbilled_cents:1000,invoices:[{id:'i',amount_cents:1000,status:'open'}]}},['Rechnungsanschrift deines Vereins','10,00','Offen']],
 ['EmployeeAccept',{token:'synthetic'},['Meine Teilnahme bestätigen']],
 ['NotificationCenter',{},['Deine Nachrichten werden geladen']],
 ['PrintCertificateButton',{},['Drucken oder als PDF speichern']],
 ['CommunityOpsConsole',{data:{needs:[],sponsors:[],campaigns:[],rewards:[],certificates:[],placements:[],opportunities:[],issues:[],corporateBookings:[]}},['Vereinbartes Sponsoring anlegen','Nummer des angenommenen Angebots']],
 ['AutomationConsole',{data:{exception_count:0,jobs:[],invoices:[],orders:[]},config:{}},['Freischaltung','Rechnungen']]
]
const noEnglish=/\b(?:Your|Choose|Submit|Sign in|volunteer hours|Request a|Send invitation|Could not|confirmed place|Silver)\b/
for(const [name,props,expected] of fixtures){const component=moduleFile('components/'+name+'.tsx').default;const html=renderToStaticMarkup(React.createElement(component,props));for(const text of expected)assert.ok(html.includes(text),name+' missing '+text);assert.ok(!noEnglish.test(html.replace(/<[^>]+>/g,'')),name+' contains English UI');if(name==='SponsorEnquiryForm'&&props.mode==='employee_project')assert.ok(!html.includes('name="requestedHours"'))}
console.log('PASS 15 rendered German UI states, native labels, correct consent sentence, decimal formatting and unchanged form field names')
const {statusLabel,systemText}=moduleFile('lib/german.ts'),{userMessage}=moduleFile('lib/user-message.ts')
assert.equal(statusLabel('silver'),'Silber');assert.equal(statusLabel('checked_in'),'Vor Ort angemeldet');assert.equal(systemText('Activity accepted'),'Dein Einsatz: Zugesagt');assert.equal(systemText('Club A. Remember to check in when you arrive.'),'Club A. Denk daran, dich bei deiner Ankunft anzumelden.');assert.equal(systemText('My club’s user-written title'),'My club’s user-written title');assert.match(userMessage('Choose 25–1000000 volunteer-hours'),/Bitte wähle/);assert.match(userMessage('TypeError: technical provider details'),/^Das hat/);assert.ok(!userMessage('TypeError: technical provider details').includes('TypeError'))
const source=fs.readFileSync('components/SponsorEnquiryForm.tsx','utf8');assert.ok(/q\.get\(['"]hours['"]\)/.test(source));assert.ok(!source.includes('q.get("Stunden")'))
const {countries}=moduleFile('lib/countries.ts');assert.equal(countries.find(c=>c.code==='DE').name,'Deutschland');assert.equal(countries.find(c=>c.code==='FR').name,'Frankreich')
for(const file of ['magic-link.de.html','confirmation.de.html']){const email=fs.readFileSync('supabase/templates/'+file,'utf8');assert.ok(email.includes('lang="de"'));assert.ok(email.includes('{{ .ConfirmationURL }}'));assert.ok(email.includes('{{ .Token }}'))}
console.log('PASS German errors/system notifications, unchanged user-written text, ISO country labels, hour-query protocol and auth template placeholders')
