// ── imports के पास जोड़ें:
import { useSearchParams } from 'next/navigation';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';
import { partnerTreeAbi } from '@/lib/abi/partnerTree';
import { ADDR } from '@/config/contracts';
import type { Address } from 'viem';
import { BaseError } from 'viem';

// ── component के अंदर:
const params = useSearchParams();
const refFromUrl = params?.get('ref') as Address | null;

// helper: safe address?
const isAddr = (a?: string | null): a is Address =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

// Reads (optional: show who referred)
const refApprovedRead = useReadContract({
  address: ADDR.REG as Address,
  abi: partnerRegistryAbi,
  functionName: 'partnerState',
  args: [isAddr(refFromUrl) ? (refFromUrl as Address) : ('0x0000000000000000000000000000000000000000' as Address)],
  query: { enabled: isAddr(refFromUrl) },
});

// ── USDT approve / buy से ठीक पहले **auto‑bind** डालें:
async function bindIfNeeded(buyer: Address) {
  try {
    if (!isAddr(refFromUrl)) return;                  // ref invalid
    const state = Number(refApprovedRead.data ?? 0);  // 2 => APPROVED mapping UI में
    if (state !== 2) return;                          // ref not approved partner

    // Check current referrer
    const current = await client.readContract({
      address: ADDR.TREE as Address,
      abi: partnerTreeAbi,
      functionName: 'referrerOf',
      args: [buyer],
    }) as Address;

    if (!/^0x0{40}$/i.test(current)) return;          // already bound

    // Prevent self‑ref or circular edge
    if (buyer.toLowerCase() === (refFromUrl as string).toLowerCase()) return;

    const hash = await writeContractAsync({
      address: ADDR.TREE as Address,
      abi: partnerTreeAbi,
      functionName: 'bindReferrer',
      args: [refFromUrl as Address],
    });
    await client.waitForTransactionReceipt({ hash });
  } catch (e: unknown) {
    // binding failure should not block purchase — swallow nicely
    console.warn('bindReferrer skip:', e instanceof BaseError ? e.shortMessage : (e as Error).message);
  }
}

// ── जहां आप "Approve USDT" या "Buy" call करते हैं, वहाँ:
await bindIfNeeded(address as Address);
// उसके बाद आपका existing approve/buy flow…
