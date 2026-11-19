import test from 'node:test';
import assert from 'node:assert/strict';
import {supportedNode,serverPort,startupMessage} from '../server/startup.mjs';
test('startup supports env-file capable Node and validates ports',()=>{
 assert(!supportedNode('18.20.0'));assert(!supportedNode('20.11.1'));assert(supportedNode('20.12.0'));assert(supportedNode('22.0.0'));
 assert.equal(serverPort({}),3000);assert.equal(serverPort({PORT:'3010'}),3010);
 for(const PORT of ['abc','0','65536','3.5'])assert.throws(()=>serverPort({PORT}),/PORT/);
 assert.match(startupMessage({code:'EADDRINUSE'}),/Cổng/);
});
