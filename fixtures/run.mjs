import {charge} from './billing.mjs';
const [variant,mode] = process.argv.slice(2);
const period={start:'2026-04-01',end:'2026-05-01',price:1001};
const cases=[
{id:'full',name:'Full month stays unchanged',seat:{started:'2026-03-01'},expected:1001,requirement:'R1'},
{id:'join',name:'Mid-month activation',seat:{started:'2026-04-16'},expected:501,requirement:'R2'},
{id:'cancel',name:'Cancellation ends billing',seat:{started:'2026-03-01',ended:'2026-04-16'},expected:501,requirement:'R3'},
{id:'outside',name:'No overlap means no charge',seat:{started:'2026-05-03'},expected:0,requirement:'R4'},
{id:'round',name:'Round once at invoice line',seat:{started:'2026-04-30'},expected:33,requirement:'R5'}];
// Weak version deliberately omits cancellation. Strong version adds that assertion.
const selected=mode==='strict'?cases:cases.filter(c=>c.id!=='cancel');
console.log(JSON.stringify(selected.map(c=>({...c,actual:charge(c.seat,period,variant),pass:charge(c.seat,period,variant)===c.expected}))));
