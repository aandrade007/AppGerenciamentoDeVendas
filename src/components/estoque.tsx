import { useState, useEffect } from "react";
import { Search, Package, AlertTriangle, Plus, ShoppingCart, BarChart3, User, Trash2, Edit } from "lucide-react";
import type { Produto } from "./cadastrarProduto";

interface EstoqueProps {
  onNavigate: (tela: string) => void;
}

export default function Estoque({ onNavigate }: EstoqueProps) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const API_URL = "http://localhost:3333";

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (usuario.id) {
      buscarProdutosDoBanco();
    } else {
      onNavigate("login");
    }
  }, []);

  async function buscarProdutosDoBanco() {
    try {
      const resposta = await fetch(`${API_URL}/produtos/usuario/${usuario.id}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setProdutos(dados);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor para buscar produtos.");
    }
  }

  async function removerProduto(id: string) {
    if (window.confirm("Tem certeza que deseja remover este produto?")) {
      try {
        const resposta = await fetch(`${API_URL}/produtos/${id}`, {
          method: "DELETE"
        });

        if (resposta.ok) {
          const novaLista = produtos.filter((p) => p.id !== id);
          setProdutos(novaLista);
        } else {
          alert("Erro ao tentar remover o produto.");
        }
      } catch (error) {
        alert("Erro de conexão com o servidor.");
      }
    }
  }

  function editarProduto(id: string) {
    localStorage.setItem("produtoEmEdicao", id);
    onNavigate("cadastro");
  }

  const produtosFiltrados = produtos.filter(
    (product) =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItens = produtos.reduce((sum, p) => sum + p.quantidade, 0);
  const alertasReposicao = produtos.filter((p) => p.quantidade < 10).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-gray-900 font-bold">Estoque</h1>

          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("relatorios")} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
              <BarChart3 size={20} />
            </button>

            <button onClick={() => onNavigate("perfil")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* BUSCA */}
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Total de Itens</p>
              <p className="text-2xl font-bold text-gray-900">{totalItens}</p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Package size={20} />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Alertas (Baixo)</p>
              <p className="text-2xl font-bold text-orange-600">{alertasReposicao}</p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* PRODUTOS (GRID) */}
      <div className="px-6 mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        {produtosFiltrados.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-8">
            Nenhum produto encontrado no seu estoque.
          </p>
        ) : (
          produtosFiltrados.map((product) => (
            <div key={product.id} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">

              <h3 className="font-semibold text-gray-900">
                {product.nome}
              </h3>

              <p className="text-xs text-gray-500 mt-1 mb-2">
                SKU: {product.sku}
              </p>

              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">
                  <span className="text-gray-500">Qtd: </span>
                  <span className={`font-bold ${product.quantidade < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                    {product.quantidade}
                  </span>
                </p>

                <p className="text-sm font-bold text-gray-900">
                  R$ {product.precoVenda.toFixed(2)}
                </p>
              </div>

              <div className="flex justify-end gap-1 mt-3">
                <button
                  onClick={() => editarProduto(product.id)}
                  className="w-9 h-9 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => removerProduto(product.id)}
                  className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))
        )}

      </div>

      {/* BOTÃO FLUTUANTE */}
      <button
        onClick={() => {
          localStorage.removeItem("produtoEmEdicao");
          onNavigate("cadastro");
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
      >
        <Plus size={28} />
      </button>

      {/* NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 pb-6 flex justify-around z-20">
        <button onClick={() => onNavigate("estoque")} className="flex flex-col items-center gap-1 text-blue-600">
          <Package size={24} />
          <span className="text-[10px] font-bold">Estoque</span>
        </button>

        <button onClick={() => onNavigate("pdv")} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <ShoppingCart size={24} />
          <span className="text-[10px] font-semibold">PDV</span>
        </button>
      </nav>

    </div>
  );
}