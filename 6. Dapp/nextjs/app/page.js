
import Link from "next/link";


export default function Home() {
  return (
        <nav>
        <Link href="/">Home</Link>
        <Link href="/cv">cv</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/jeu">Jeu</Link>
        </nav>
  );
}
