import {Path} from 'https://deno.land/x/path/mod.ts';

const path = new Path(Deno.cwd())
console.log(path.elements.join('/'))