/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness loads isolated TypeScript modules with mocks. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const bcrypt = require('bcryptjs');

function load(file, mocks = {}) {
  const exports = {};
  const filename = path.resolve(file);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true}}).outputText;
  const localRequire = (id) => {
    if (id in mocks) return mocks[id];
    if (id.startsWith('.')) return load(path.resolve(path.dirname(filename), id + '.ts'), mocks);
    return require(id);
  };
  new Function('require', 'exports', js)(localRequire, exports);
  return exports;
}

test('participation: counts each audience once and includes unanswered fields', () => {
  const { participationIndicators } = load('src/lib/participation-indicators.ts');
  const stats = participationIndicators([
    {beneficiaries:'femmes,jeunes,femmes',heardAbout:'reseaux'},
    {beneficiaries:null,heardAbout:null},
    {beneficiaries:'producteurs,unknown',heardAbout:'reseaux'},
  ]);
  assert.deepEqual(stats, {byBeneficiary:{femmes:1,jeunes:1,producteurs:1},byHeardAbout:{reseaux:2},missingBeneficiaries:1,missingHeardAbout:1});
});

test('attachments: verifies PDF and image signatures, rejects spoofed types', () => {
  const { validAttachment } = load('src/lib/attachment-types.ts');
  assert.ok(validAttachment(Buffer.from('%PDF-1.7'), 'application/pdf'));
  assert.ok(validAttachment(Buffer.from([137,80,78,71,13,10,26,10]), 'image/png'));
  assert.ok(validAttachment(Buffer.from([255,216,255,224]), 'image/jpeg'));
  assert.ok(validAttachment(Buffer.from('GIF89a'), 'image/gif'));
  assert.ok(validAttachment(Buffer.from('RIFF0000WEBP'), 'image/webp'));
  assert.equal(validAttachment(Buffer.from('<script>bad</script>'), 'application/pdf'), false);
  assert.equal(validAttachment(Buffer.from('%PDF-1.7'), 'image/png'), false);
});

test('attachment endpoint: owner, administrator, auditor and authorized jury only', async () => {
  let role = 'CANDIDATE', userId = 'other', total = 1, mine = 0, status = 'FINALIST';
  const prisma = {
    attachment:{findUnique:async args => args.select ? {team:{id:'team',leaderId:'owner',status}} : {filename:'pièce.pdf',mimeType:'application/pdf',size:8,data:Buffer.from('%PDF-1.7')}},
    assignment:{count:async args => args.where.juryId ? mine : total},
  };
  const { GET } = load('src/app/api/attachments/[id]/route.ts', {
    '@/auth':{auth:async()=>userId ? {user:{id:userId,role}} : null}, '@/lib/prisma':{prisma},
  });
  const request = () => GET(new Request('https://example.test/api/attachments/file?download=1'), {params:Promise.resolve({id:'file'})});
  assert.equal((await request()).status,403);
  userId='owner'; assert.equal((await request()).status,200);
  userId='other';
  for (role of ['ADMIN','AUDITOR']) assert.equal((await request()).status,200);
  role='JURY'; assert.equal((await request()).status,403);
  mine=1; assert.equal((await request()).status,200);
  mine=0;total=0;assert.equal((await request()).status,200);
  status='DRAFT';assert.equal((await request()).status,403);
  role='ADMIN';const response=await request();
  assert.match(response.headers.get('content-disposition'),/^attachment;/);
  assert.equal(response.headers.get('cache-control'),'private, no-store');
  userId=null;assert.equal((await request()).status,401);
});

test('user management: authorized creation, password hashing, self and last-admin protections', async () => {
  let allowed=true, created, saved, current={id:'target',role:'ADMIN',isActive:true}, adminCount=1;
  const tx={user:{findUnique:async()=>current,count:async()=>adminCount,create:async({data})=>{created=data;return {id:'new'}},update:async({data})=>{saved=data;return {id:'target'}}}};
  const {saveUserAction}=load('src/lib/user-management-actions.ts',{
    'next/cache':{revalidatePath:()=>{}}, '@/lib/admin':{requireAdmin:async()=>{if(!allowed)throw new Error('denied');return {id:'actor',role:'ADMIN',email:'admin@example.test'}}},
    '@/lib/prisma':{prisma:{$transaction:async callback=>callback(tx)}}, '@/lib/audit':{logEvent:async()=>{}},
  });
  const form=(id,role='AUDITOR',active=true)=>{const f=new FormData();for(const [key,val]of Object.entries({name:'Test user',email:'test@example.test',role,password:'Secure-test-password',locale:'fr'}))f.set(key,val);if(id)f.set('id',id);if(active)f.set('isActive','on');return f};
  assert.equal((await saveUserAction({},form())).status,'success');
  assert.equal(created.role,'AUDITOR');assert.ok(await bcrypt.compare('Secure-test-password',created.passwordHash));assert.ok(created.emailVerified instanceof Date);
  assert.equal((await saveUserAction({},form('actor'))).error,'self');
  assert.equal((await saveUserAction({},form('target'))).error,'lastAdmin');
  adminCount=2;assert.equal((await saveUserAction({},form('target'))).status,'success');assert.equal(saved.role,'AUDITOR');assert.equal(saved.passwordHash,undefined);
  allowed=false;await assert.rejects(saveUserAction({},form()),/denied/);
});

test('session privileges follow current database role and account activation', async () => {
  let config, current={role:'AUDITOR',isActive:true,name:'Auditor',email:'a@example.test'};
  load('src/auth.ts',{
    'next-auth':(options)=>{config=options;return {}},
    'next-auth/providers/credentials':(options)=>options,
    '@auth/prisma-adapter':{PrismaAdapter:()=>({})},
    '@/lib/prisma':{prisma:{user:{findUnique:async()=>current}}},
    '@/lib/audit':{logEvent:async()=>{}},
  });
  const token=await config.callbacks.jwt({token:{id:'account',role:'ADMIN'}});
  assert.equal(token.role,'AUDITOR');
  current.isActive=false;assert.equal(await config.callbacks.jwt({token}),null);
  current=null;assert.equal(await config.callbacks.jwt({token}),null);
});
