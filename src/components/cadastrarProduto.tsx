import { useState, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

interface EstoqueProps {
  onNavigate: (tela: string) => void;
}

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  precoCusto: number;
  precoVenda: number;
  quantidade: number;
  usuarioId: string;
}

export default function CadastrarProduto({ onNavigate }: EstoqueProps) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const API_URL = "http://localhost:3333";

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [sku, setSku] = useState("");
  const [precoCusto, setPrecoCusto] = useState<number | "">("");
  const [precoVenda, setPrecoVenda] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<number | "">("");

  useEffect(() => {
    const idEdicao = localStorage.getItem("produtoEmEdicao");
    if (idEdicao) {
      setEditandoId(idEdicao);
      buscarProdutoParaEdicao(idEdicao);
    }
  }, []);

  async function buscarProdutoParaEdicao(id: string) {
    try {
      const resposta = await fetch(`${API_URL}/produtos/${id}`);
      if (resposta.ok) {
        const produto = await resposta.json();
        setNome(produto.nome);
        setSku(produto.sku);
        setPrecoCusto(produto.precoCusto);
        setPrecoVenda(produto.precoVenda);
        setQuantidade(produto.quantidade);
      }
    } catch (error) {
      alert("Erro ao buscar dados do produto.");
    }
  }

  function limparCampos() {
    setNome("");
    setSku("");
    setPrecoCusto("");
    setPrecoVenda("");
    setQuantidade("");
    setEditandoId(null);
    localStorage.removeItem("produtoEmEdicao");
  }

  function handleCancelar() {
    limparCampos();
    onNavigate("estoque");
  }

  async function salvarProduto() {
    if (
      !nome.trim() || 
      !sku.trim() || 
      precoVenda === "" || Number(precoVenda) <= 0 || 
      quantidade === "" || Number(quantidade) < 0 ||
      precoCusto === "" || Number(precoCusto) <= 0
    ) {
      alert("Preencha todos os campos obrigatórios corretamente (sem deixar apenas espaços).");
      return;
    }

    const produtoData = {
      nome: nome.trim(),
      sku: sku.trim().toUpperCase(),
      precoCusto: Number(precoCusto),
      precoVenda: Number(precoVenda),
      quantidade: Number(quantidade),
      usuarioId: usuario.id
    };

    try {
      if (editandoId) {
        const resposta = await fetch(`${API_URL}/produtos/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(produtoData)
        });

        if (resposta.ok) {
          alert("Produto atualizado com sucesso!");
        } else {
          alert("Erro ao atualizar o produto.");
          return;
        }
      } 
      else {
        const resposta = await fetch(`${API_URL}/produtos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(produtoData)
        });

        if (resposta.ok) {
          alert("Produto cadastrado com sucesso!");
        } else {
          alert("Erro ao cadastrar o produto.");
          return;
        }
      }

      limparCampos();
      onNavigate("estoque");

    } catch (error) {
      alert("Erro de conexão com o servidor.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 p-6 font-sans pb-24">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={handleCancelar}
          className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl text-gray-800 font-bold">
          {editandoId ? "Editar Produto" : "Cadastrar Produto"}
        </h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700">Nome do Produto</label>
          <input
            type="text"
            placeholder="Ex: Iphone 17"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Código SKU</label>
          <input
            type="text"
            placeholder="Ex: AP-001"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Preço de Custo</label>
            <input
              type="number"
              placeholder="R$ 0,00"
              value={precoCusto}
              onChange={(e) => setPrecoCusto(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Preço de Venda</label>
            <input
              type="number"
              placeholder="R$ 0,00"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            {editandoId ? "Estoque Atual" : "Quantidade Inicial"}
          </label>
          <input
            type="number"
            placeholder="Ex: 10"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleCancelar}
            className="w-1/2 border border-gray-300 rounded-xl py-3 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
          >
            <X size={20} /> Cancelar
          </button>

          <button
            onClick={salvarProduto}
            className="w-1/2 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <Save size={20} /> {editandoId ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}