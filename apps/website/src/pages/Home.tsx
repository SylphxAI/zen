import { Comparison } from '../components/Comparison';
import { Demo } from '../components/Demo';
import { Features } from '../components/Features';
import { GetStarted } from '../components/GetStarted';
import { Hero } from '../components/Hero';
import { Packages } from '../components/Packages';

export function Home() {
  return (
    <div class="page-home">
      <Hero />
      <Features />
      <Demo />
      <Packages />
      <Comparison />
      <GetStarted />
    </div>
  );
}
