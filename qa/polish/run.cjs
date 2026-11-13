const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const file of ['save_regression.cjs','combat_parity.cjs','ui_regression.cjs','world_regression.cjs'])require(path.join(__dirname,file));
const root=path.join(__dirname,'../..'),html=fs.readFileSync(path.join(root,'game/builds/alpha-1.3.0/TORII_HUTUKARA_ALPHA_1_3_0_MOBILE_COOP.html'),'utf8');
new vm.Script(html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]);
const source=fs.readFileSync(path.join(root,'game/source/base/TORII_HUTUKARA_1_1_2_TRILHAS.html'),'utf8');
const album=s=>JSON.parse(s.slice(s.indexOf('const ALBUM11=')+14).split(';')[0]);
const originalAlbum=album(source),builtAlbum=album(html);
for(const [id,encoded] of Object.entries(originalAlbum))assert.equal(builtAlbum[id],encoded,'original soundtrack bytes: '+id);
console.log('Integrated build syntax and every original soundtrack preserved');
