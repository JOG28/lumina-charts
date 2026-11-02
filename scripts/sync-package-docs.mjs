import {copyFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const destination=new URL('projects/lumina-charts/docs/',root);
await mkdir(destination,{recursive:true});
for(const name of ['MOBILE.md','FEATURES.md']) await copyFile(new URL(`docs/${name}`,root),new URL(name,destination));
await copyFile(new URL('LICENSE',root),new URL('projects/lumina-charts/LICENSE',root));
