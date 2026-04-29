import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Trash2, Minus, Plus, Banknote, CreditCard, QrCode, PackagePlus } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  sku: string;
  precoVenda: number;
  quantidade: number;
}

interface ItemVenda extends Produto {
  quantidadeCarrinho: number;
}

interface VendasProps {
  onNavigate: (tela: string) => void;
}

export default function Vendas({ onNavigate }: VendasProps) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const API_URL = "http://localhost:3333";

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<string>("");

  // Busca os produtos direto do banco de dados ao carregar a tela
  useEffect(() => {
    if (usuario.id) {
      buscarProdutosDoBanco();
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
      console.error("Erro ao buscar produtos.");
    }
  }

  function adicionarProduto(produto: Produto) {
    if (produto.quantidade <= 0) {
      alert("Produto sem estoque!");
      return;
    }

    const itemNoCarrinho = carrinho.find((p) => p.id === produto.id);

    if (itemNoCarrinho && itemNoCarrinho.quantidadeCarrinho >= produto.quantidade) {
      alert("Quantidade máxima do estoque atingida!");
      return;
    }

    if (itemNoCarrinho) {
      setCarrinho(
        carrinho.map((p) =>
          p.id === produto.id ? { ...p, quantidadeCarrinho: p.quantidadeCarrinho + 1 } : p
        )
      );
    } 
    else {
      setCarrinho([...carrinho, { ...produto, quantidadeCarrinho: 1 }]);
    }
  }

  function alterarQuantidade(id: string, tipo: "mais" | "menos") {
    setCarrinho((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (tipo === "mais" && item.quantidadeCarrinho >= item.quantidade) {
            alert("Quantidade máxima do estoque atingida!");
            return item;
          }
          const novaQtd = tipo === "mais" ? item.quantidadeCarrinho + 1 : item.quantidadeCarrinho - 1;
          return { ...item, quantidadeCarrinho: novaQtd };
        }
        return item;
      }).filter((item) => item.quantidadeCarrinho > 0)
    );
  }

  function removerItem(id: string) {
    setCarrinho(carrinho.filter((p) => p.id !== id));
  }

  const subtotal = carrinho.reduce((total, item) => total + item.precoVenda * item.quantidadeCarrinho, 0);

  // Envia a venda para o Backend!
  async function finalizarVenda() {
    if (carrinho.length === 0) {
      alert("O carrinho está vazio!");
      return;
    }
    if (!formaPagamento) {
      alert("Por favor, selecione uma forma de pagamento.");
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/vendas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: subtotal,
          pagamento: formaPagamento,
          itens: carrinho,
          usuarioId: usuario.id
        })
      });

      if (resposta.ok) {
        alert(`Venda finalizada com sucesso!\nTotal: R$ ${subtotal.toFixed(2)}\nPagamento: ${formaPagamento}`);
        setCarrinho([]);
        setFormaPagamento("");
        // Atualiza a tela puxando o estoque novo (já descontado) do servidor
        buscarProdutosDoBanco(); 
      } else {
        alert("Erro ao registrar a venda.");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("estoque")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Ponto de Venda</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 pb-[340px]">
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Toque para adicionar</h2>
          <div className="grid grid-cols-2 gap-3">
            {produtos.map((p) => (
              <button
                key={p.id}
                onClick={() => adicionarProduto(p)}
                disabled={p.quantidade === 0}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[100px] ${
                  p.quantidade === 0 
                    ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed" 
                    : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm active:scale-95"
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900 leading-tight text-sm line-clamp-2">{p.nome}</p>
                </div>
                <div className="mt-2 flex justify-between items-end w-full">
                  <p className="font-bold text-blue-600">R$ {p.precoVenda.toFixed(2)}</p>
                  <p className={`text-[10px] font-bold px-2 py-1 rounded-md ${p.quantidade > 0 ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"}`}>
                    {p.quantidade > 0 ? `${p.quantidade} un` : "Esgotado"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShoppingCart size={16} /> Carrinho Atual
          </h2>
          
          {carrinho.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
              <PackagePlus className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">Carrinho vazio</p>
              <p className="text-sm">Adicione produtos acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {carrinho.map((item) => (
                <div key={item.id} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-gray-900 leading-tight">{item.nome}</h3>
                      <p className="text-sm text-gray-500 mt-1">R$ {item.precoVenda.toFixed(2)} / un</p>
                    </div>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                      <button
                        onClick={() => alterarQuantidade(item.id, "menos")}
                        className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 text-gray-700"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-gray-900 w-8 text-center">{item.quantidadeCarrinho}</span>
                      <button
                        onClick={() => alterarQuantidade(item.id, "mais")}
                        className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 text-gray-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="font-bold text-lg text-gray-900">
                      R$ {(item.precoVenda * item.quantidadeCarrinho).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-9 py-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
        <div className="flex justify-between items-end mb-1">
          <span className="text-gray-500 font-medium">Total da Venda</span>
          <span className="text-3xl font-black text-gray-900">R$ {subtotal.toFixed(2)}</span>
        </div>

        <div className="mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Forma de Pagamento</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setFormaPagamento("Dinheiro")}
              className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                formaPagamento === "Dinheiro" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              <Banknote size={20} />
              <span className="text-xs font-bold">Dinheiro</span>
            </button>
            <button
              onClick={() => setFormaPagamento("Cartão")}
              className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                formaPagamento === "Cartão" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              <CreditCard size={20} />
              <span className="text-xs font-bold">Cartão</span>
            </button>
            <button
              onClick={() => setFormaPagamento("Pix")}
              className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                formaPagamento === "Pix" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              <QrCode size={20} />
              <span className="text-xs font-bold">Pix</span>
            </button>
          </div>
        </div>

        <button
          onClick={finalizarVenda}
          className="w-64 h-14 text-base font-bold rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          Finalizar Venda
        </button>
      </div>
    </div>
  );
}