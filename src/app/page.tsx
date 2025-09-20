import Link from 'next/link';
import ConnectBar from '@/components/ConnectBar';

export default function Home() {
  return (
    <main>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Nebullas • BSC Testnet</h2>
        <ConnectBar />
      </div>

      <p>Welcome. नीचे बटन से ख़रीद/पार्टनर/एडमिन पेज खोलें।</p>

      <div style={{ display:'flex', gap:10 }}>
        <Link href="/buy"><button>Go to Buy</button></Link>
        <Link href="/partner"><button>Partner Dashboard</button></Link>
        <Link href="/admin"><button>Admin Panel</button></Link>
      </div>
    </main>
  );
}
