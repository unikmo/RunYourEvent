import assert from 'node:assert/strict'
import { isSameOrigin } from '../lib/request-origin.ts'
import {validDate,validSeasonalNeed} from '../lib/community-input.ts'
assert.equal(isSameOrigin({headers:new Headers({host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'})}),true)
assert.equal(isSameOrigin({headers:new Headers({host:'runyourevent.com',origin:'https://attacker.example','x-forwarded-proto':'https'})}),false)
assert.equal(isSameOrigin({headers:new Headers({host:'runyourevent.com',origin:'https://runyourevent.com','x-forwarded-proto':'https'})}),true)
assert.equal(isSameOrigin({headers:new Headers({host:'runyourevent.com'})}),false)
assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2026-99-99'),false)
assert.equal(validSeasonalNeed({}),false)
console.log('PASS request origin and strict calendar validation')
