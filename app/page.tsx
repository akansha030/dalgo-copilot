import Link from 'next/link';

/** Neutral landing page. Exists mainly to host the floating Copilot button (mini-chat)
 *  over a "page", and to link into the full Copilot view and its settings. */
export default function Home() {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: '#1a1a2e' }}>Dalgo Copilot</div>
        <p style={{ color: '#7a7a8c', marginTop: 10, lineHeight: 1.6, fontSize: 15.5 }}>
          A clickable prototype of the chat-with-data Copilot. Open the full view, or try the quick chat from the
          glowing button at the bottom-right of this page.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <Link
            href="/copilot"
            style={{ background: '#00897b', color: '#fff', padding: '10px 20px', borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
          >
            Open Copilot
          </Link>
          <Link
            href="/settings/copilot"
            style={{ border: '1px solid #e8ecef', color: '#1a1a2e', padding: '10px 20px', borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: 'none', background: '#fff' }}
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
