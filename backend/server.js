import express from 'express';
import cors from 'cors';
import { getZkLoginSignature } from '@mysten/sui/zklogin';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/zk-sign', async (req, res) => {
  try {
    const { jwt, ephemeralPublicKey, txBytes } = req.body;

    const signature = await getZkLoginSignature({
      jwt,
      ephemeralPublicKey,
      transactionBlockBytes: txBytes,
    });

    res.json(signature);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'zkLogin sign failed' });
  }
});

app.listen(3001, () => {
  console.log('✅ zkLogin backend running at http://localhost:3001');
});
