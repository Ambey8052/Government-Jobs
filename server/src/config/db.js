import dns from 'dns';
import mongoose from 'mongoose';

// Some routers/ISP DNS servers refuse SRV queries when Node's resolver
// hits them directly, even though OS-level lookups (e.g. nslookup) work.
// Point Node at public DNS to avoid `querySrv ECONNREFUSED`.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Copy server/.env.example to server/.env and fill it in.');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
