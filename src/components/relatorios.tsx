import { useState, useEffect, useRef } from "react";
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Calendar, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface RelatoriosProps {
  onNavigate: (tela: string) => void;
}

export default function Relatorios({ onNavigate }: RelatoriosProps) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
  const chaveHistorico = `historicoVendas_${usuario.email}`;
  const [vendasTotais, setVendasTotais] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [produtosVendidos, setProdutosVendidos] = useState<{nome: string, quantidade: number, receita: number}[]>([]);
  const [pagamentos, setPagamentos] = useState<{metodo: string, valor: number, porcentagem: number}[]>([]);
  
  const relatorioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const historicoRaw = localStorage.getItem(chaveHistorico);
    const historico = historicoRaw ? JSON.parse(historicoRaw) : [];
    const totalVendido = historico.reduce((sum: number, venda: any) => sum + venda.total, 0);
    const qtdPedidos = historico.length;
    const ticket = qtdPedidos > 0 ? totalVendido / qtdPedidos : 0;
    setVendasTotais(totalVendido);
    setTotalPedidos(qtdPedidos);
    setTicketMedio(ticket);

    const contagemProdutos: Record<string, { quantidade: number, receita: number }> = {};
    historico.forEach((venda: any) => {
      venda.itens.forEach((item: any) => {
        if (!contagemProdutos[item.nome]) {
          contagemProdutos[item.nome] = { quantidade: 0, receita: 0 };
        }
        contagemProdutos[item.nome].quantidade += item.quantidadeCarrinho;
        contagemProdutos[item.nome].receita += (item.precoVenda * item.quantidadeCarrinho);
      });
    });

    const listaProdutos = Object.keys(contagemProdutos).map(nome => ({
      nome,
      quantidade: contagemProdutos[nome].quantidade,
      receita: contagemProdutos[nome].receita
    })).sort((a, b) => b.receita - a.receita);

    setProdutosVendidos(listaProdutos);

    const contagemPagamentos: Record<string, number> = { "Pix": 0, "Cartão": 0, "Dinheiro": 0 };
    historico.forEach((venda: any) => {
      if (contagemPagamentos[venda.pagamento] !== undefined) {
        contagemPagamentos[venda.pagamento] += venda.total;
      }
    });

    const listaPagamentos = Object.keys(contagemPagamentos).map(metodo => ({
      metodo,
      valor: contagemPagamentos[metodo],
      porcentagem: totalVendido > 0 ? Math.round((contagemPagamentos[metodo] / totalVendido) * 100) : 0
    })).filter(p => p.valor > 0);

    setPagamentos(listaPagamentos);
  }, [chaveHistorico]);

  const handleExport = async () => {
    if (!relatorioRef.current) return;
    
    try {
      const canvas = await html2canvas(relatorioRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio_${usuario.email.split('@')[0]}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      alert("Erro ao gerar PDF.");
      console.error(error);
    }
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("estoque")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Relatório de Performance</h1>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-28">
        <div ref={relatorioRef} className="bg-gray-50">
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 w-fit px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium capitalize">{dataAtual}</span>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="space-y-4">
              <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Vendas Totais</p>
                    <p className="text-3xl font-black text-gray-900">
                      R$ {vendasTotais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Pedidos</p>
                      <p className="text-2xl font-bold text-gray-900">{totalPedidos}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <ShoppingCart size={16} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Ticket Médio</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {ticketMedio.toFixed(2)}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Produtos Mais Vendidos</h2>
              {produtosVendidos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 bg-white rounded-2xl border border-gray-200">Nenhuma venda registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {produtosVendidos.map((product, index) => (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.nome}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{product.quantidade} unidades vendidas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          R$ {product.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pagamentos.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Por Forma de Pagamento</h2>
                <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-5">
                  {pagamentos.map((payment, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{payment.metodo}</span>
                        <span className="text-sm font-bold text-gray-600">
                          R$ {payment.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${payment.porcentagem}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-400 mt-1.5">{payment.porcentagem}% do total</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30">
        <button
          onClick={handleExport}
          className="w-64 h-14 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <Download size={20} />
          Exportar Relatório (PDF)
        </button>
      </div>
    </div>
  );
}