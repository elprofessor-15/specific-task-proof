import {runProof} from './proof.mjs';
const mode=process.argv[2]??'strict';
try { const proof=await runProof(mode);console.log(JSON.stringify(proof,null,2));process.exitCode=proof.ready?0:1; } catch(e){console.error(e.message);process.exitCode=2;}
