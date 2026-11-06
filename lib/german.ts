// Product vocabulary only. Database identifiers, user-written text and access tokens stay unchanged.
const labels:Record<string,string>={bronze:'Bronze',silver:'Silber',gold:'Gold',none:'Noch kein Meilenstein',invited:'Eingeladen',applied:'Angemeldet',accepted:'Zugesagt',confirmed:'Bestätigt',reconfirmed:'Erneut bestätigt',checked_in:'Vor Ort angemeldet',completed:'Abgeschlossen',declined:'Abgesagt',cancelled:'Abgesagt',no_show:'Nicht erschienen',open:'Offen',draft:'Entwurf',pending:'Ausstehend',paid:'Bezahlt',expired:'Abgelaufen',review:'Wird geprüft',refunded:'Erstattet',void:'Storniert',uncollectible:'Nicht einziehbar',funded:'Finanziert',part_funded:'Teilweise finanziert',partially_funded:'Teilweise finanziert',recruiting:'Helfersuche läuft',filled:'Besetzt',verified:'Bestätigt',requested:'Angefragt',approved:'Freigegeben',available:'Verfügbar',claimed:'Angefordert',fulfilled:'Zugestellt',redeemed:'Eingelöst',active:'Aktiv',issued:'Ausgestellt',revoked:'Widerrufen',reserved:'Reserviert',sent:'Gesendet',used:'Verwendet'}
export function statusLabel(value:string|null|undefined){return value?labels[value.toLowerCase()]||'Stand noch nicht verfügbar':'Noch nicht erfasst'}
export function formatNumber(value:number,digits=1){return value.toLocaleString('de-DE',{maximumFractionDigits:digits})}
export function formatMoney(cents:number){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100)}
const system:Record<string,string>={
 'Volunteer activity update':'Neuigkeiten zu einer Teilnahme',
 'Activity details changed':'Die Einsatzdetails wurden geändert',
 'New message from your club':'Neue Nachricht von deinem Verein',
 'New volunteer message':'Neue Nachricht von einer freiwilligen Person',
 'Open your activity conversation to read and reply.':'Öffne das Gespräch zum Einsatz, um die Nachricht zu lesen und zu antworten.',
 'Open the conversation to read and reply.':'Öffne das Gespräch, um die Nachricht zu lesen und zu antworten.',
 'Your activity is coming up':'Dein Einsatz steht bevor',
 'Your activity starts soon':'Dein Einsatz beginnt bald',
 'Attendance needs review':'Eine Anwesenheit muss geprüft werden',
 'Your employee volunteering invitation':'Deine Einladung zum Teameinsatz',
 'Your company has invited you to a sports volunteering project. Review the activity and confirm your own participation.':'Dein Unternehmen hat dich zu einem Einsatz im Sportverein eingeladen. Schau dir die Aufgabe an und bestätige deine Teilnahme selbst.',
 'Certificate record updated':'Deine Urkundendaten wurden aktualisiert',
 'Bronze certificate ready':'Deine Bronze-Urkunde ist bereit',
 'Silver certificate ready':'Deine Silber-Urkunde ist bereit',
 'Gold certificate ready':'Deine Gold-Urkunde ist bereit',
 'Your verified contribution record has been updated.':'Deine bestätigten Engagementdaten wurden aktualisiert.',
 'Your milestone reward is ready':'Deine Prämie ist bereit',
 'RunYourEvent operations need attention':'RunYourEvent: Vorgänge müssen geprüft werden'
}
const suffixes:[string,string][]=[
 ['. Review the latest arrangements in your passport.','. Schau dir die aktuellen Absprachen in deinem Engagementpass an.'],
 ['. Check the venue and reconfirm your attendance.','. Prüfe den Einsatzort und bestätige deine Teilnahme noch einmal.'],
 ['. Remember to check in when you arrive.','. Denk daran, dich bei deiner Ankunft anzumelden.'],
 [' has a check-in without check-out. Review the attendance before crediting hours.',' hat eine Anmeldung ohne Abmeldung. Prüfe die Anwesenheit, bevor du Stunden bestätigst.'],
 [' has been assigned to you. Open your passport to see your private voucher.',' wurde dir zugeteilt. Deinen persönlichen Gutschein findest du im Engagementpass.']
]
export function systemText(value:string){
 if(system[value])return system[value]
 if(value.startsWith('Activity ')){const key=value.slice(9).replaceAll(' ','_');if(labels[key])return 'Dein Einsatz: '+labels[key]}
 for(const [suffix,replacement] of suffixes)if(value.endsWith(suffix))return value.slice(0,-suffix.length)+replacement
 const split=value.lastIndexOf(' · ');if(split>=0){const key=value.slice(split+3).replaceAll(' ','_');if(labels[key])return value.slice(0,split+3)+labels[key]}
 return value
}
