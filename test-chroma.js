import { env as TransformersEnv, pipeline } from '@huggingface/transformers';

async function test() {
  TransformersEnv.cacheDir = './ai-cache';
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'fp32' });
  const out1 = await embedder(['Hello world'], { pooling: 'mean', normalize: true });
  const out2 = await embedder(['Hello world'], { pooling: 'mean', normalize: true });
  const out3 = await embedder(['The quick brown fox jumps over the lazy dog'], { pooling: 'mean', normalize: true });
  
  const v1 = out1.tolist()[0];
  const v2 = out2.tolist()[0];
  const v3 = out3.tolist()[0];
  
  let sqL2_1_2 = 0;
  for(let i=0; i<v1.length; i++) sqL2_1_2 += Math.pow(v1[i]-v2[i], 2);
  
  let sqL2_1_3 = 0;
  let dot_1_3 = 0;
  for(let i=0; i<v1.length; i++) {
    sqL2_1_3 += Math.pow(v1[i]-v3[i], 2);
    dot_1_3 += v1[i]*v3[i];
  }
  
  console.log('Same vectors squared L2:', sqL2_1_2);
  console.log('Diff vectors squared L2:', sqL2_1_3);
  console.log('Diff vectors dot product:', dot_1_3);
  console.log('Formula (2 - d)/2 for same:', (2 - sqL2_1_2)/2);
  console.log('Formula (2 - d)/2 for diff:', (2 - sqL2_1_3)/2);
}

test().catch(console.error);
