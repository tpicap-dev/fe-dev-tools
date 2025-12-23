import { parse } from 'https://deno.land/std/flags/mod.ts';

const args = parse(Deno.args);

console.log(args)