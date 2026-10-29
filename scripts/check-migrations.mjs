import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'
import fs from 'node:fs'
const db=new PGlite({extensions:{pgcrypto}})
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql as $$ select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;create function auth.jwt() returns jsonb language sql as $$ select nullif(current_setting('request.jwt.claims',true),'')::jsonb $$;create schema extensions;create extension pgcrypto with schema extensions;set search_path=public;`)
// Reproduce the existing Volunteer Engine schema, with an isolated admin-session fixture.
await db.exec(`create function rye_admin_session_valid(text) returns boolean language sql as $$ select $1='test-admin' $$;`)
const paths=fs.readdirSync('supabase/migrations').filter(x=>x.startsWith('20260831')||x.startsWith('202610')).sort()
for(const path of paths){
 try{await db.exec(fs.readFileSync('supabase/migrations/'+path,'utf8'));console.log('PASS',path)}catch(e){console.error('FAIL',path,e.message,e.position);process.exit(1)}
}
console.log('Migration compilation passed')
await db.close()
