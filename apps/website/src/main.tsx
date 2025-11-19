import './index.css';
import '@iconify/iconify';
import { render } from '@zen/zen';
import { App } from './App';

const root = document.getElementById('app');
if (root) {
  render(() => <App />, root);
}
