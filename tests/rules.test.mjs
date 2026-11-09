import {test} from 'node:test';
import assert from 'node:assert/strict';
import {endDate,extendDate,isActive,allow,jurisdictionAllowed} from '../lib/rules.mjs';
test('90-day exclusion activates immediately and expires at exact boundary',()=>{const now=1700000000000;const ex={start:now,end:endDate(90,now)};assert.equal(ex.end,now+7776000000);assert.ok(isActive(ex,now));assert.ok(isActive(ex,ex.end-1));assert.equal(isActive(ex,ex.end),false)});
test('extensions add to existing end, never to current time',()=>{const now=1700000000000;const ex={end:endDate(90,now)};assert.equal(extendDate(ex,30,now),now+120*86400000);assert.throws(()=>extendDate(ex,-30,now));assert.throws(()=>extendDate({end:now},30,now))});
test('only supported durations are accepted',()=>{for(const d of [-1,0,2,Infinity,NaN,'oops'])assert.throws(()=>endDate(d))});
test('shop and owner cannot invoke player or regulator operations',()=>{for(const role of ['shop','owner']){assert.throws(()=>allow(role,['player']));assert.throws(()=>allow(role,['regulator']));}assert.doesNotThrow(()=>allow('player',['player']))});
test('regulators see only their own jurisdiction',()=>{assert.equal(jurisdictionAllowed({role:'regulator',state:'Lagos'},'Oyo'),false);assert.equal(jurisdictionAllowed({role:'regulator',state:'Lagos'},'Lagos'),true);assert.equal(jurisdictionAllowed({role:'shop',state:'Lagos'},'Lagos'),false)});
