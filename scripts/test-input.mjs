import assert from 'node:assert/strict'
import { isSameOrigin } from '../lib/request-origin.ts'
import {validDate,validSeasonalNeed,validSponsorEnquiry} from '../lib/community-input.ts'
assert.equal(isSameOrigin({headers:new Headers({host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'})}),true)
assert.equal(isSameOrigin({headers:new Headers({host:'runyourevent.com',origin:'https://attacker.example','x-forwarded-proto':'https'})}),false)
assert.equal(isSameOrigin({headers:new Headers({host:'runyourevent.com',origin:'https://runyourevent.com','x-forwarded-proto':'https'})}),true)
assert.equal(isSameOrigin({headers:new Headers({host:'runyourevent.com'})}),false)
assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2026-99-99'),false)
assert.equal(validSeasonalNeed({}),false)
console.log('PASS request origin and strict calendar validation')

const enquiry={organizationName:'Fixture Sponsor',contactName:'Fixture Contact',email:'quote@fixture.test',message:'Support local sports club activities',privacyAck:true,requestedHours:25}
assert.equal(validSponsorEnquiry(enquiry),true)
for(const requestedHours of [undefined,0,24,25.5,'25',1000001])assert.equal(validSponsorEnquiry({...enquiry,requestedHours}),false)
assert.equal(validSponsorEnquiry({...enquiry,enquiryType:'employee_project',requestedHours:null,teamSize:3,hoursPerEmployee:8}),true)
assert.equal(validSponsorEnquiry({...enquiry,enquiryType:'employee_project',teamSize:0,hoursPerEmployee:8}),false)
console.log('PASS sponsorship minimum, integer bounds and separate employee-project enquiry validation')
