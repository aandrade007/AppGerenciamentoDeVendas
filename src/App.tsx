import { useState } from 'react';
import Login from './components/login';
import Estoque from './components/estoque';
import CadastrarProduto from './components/cadastrarProduto';
import Vendas from './components/vendas';
import Relatorios from './components/relatorios';
import Perfil from './components/perfil';
import Admin from './components/admin';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('login');


  if (telaAtual === 'login') return <Login onNavigate={setTelaAtual} />;  
  if (telaAtual === 'estoque') return <Estoque onNavigate={setTelaAtual} />;
  if (telaAtual === 'cadastro') return <CadastrarProduto onNavigate={setTelaAtual} />;
  if (telaAtual === 'pdv') return <Vendas onNavigate={setTelaAtual} />; 
  if (telaAtual === 'relatorios') return <Relatorios onNavigate={setTelaAtual} />; 
  if (telaAtual === 'perfil') return <Perfil onNavigate={setTelaAtual} />; 
  
  if (telaAtual === 'admin') return <Admin onNavigate={setTelaAtual} />;

  return null;
}