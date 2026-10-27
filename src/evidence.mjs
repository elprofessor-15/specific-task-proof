export function evidenceFor(proof,note='') {
 if(!proof?.id) throw new Error('Run proof before exporting');
 return {...proof,review:{note,status:proof.ready?'controls-passed-human-review-required':'blocked'}};
}
