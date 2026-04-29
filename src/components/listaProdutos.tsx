import { Trash2 } from "lucide-react";
import type { Produto } from "./cadastrarProduto";

interface Props {
  produtos: Produto[];
  onRemover: (id: string) => void;
}

export default function ListaProdutos({ produtos, onRemover }: Props) {
  if (produtos.length === 0) {
    return (
      <p className="text-gray-500 text-center py-6 bg-white rounded-2xl border border-dashed border-gray-200">
        Nenhum produto cadastrado.
      </p>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl text-gray-800 font-bold mb-4">Produtos</h2>

      <ul className="space-y-3">
        {produtos.map((p) => (
          <li
            key={p.id}
            className="flex justify-between items-center border border-gray-100 bg-gray-50 p-4 rounded-xl hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div>
              <p className="font-bold text-gray-900">{p.nome}</p>
              <p className="text-sm text-gray-500 mt-1">
                SKU: <span className="font-medium text-gray-700">{p.sku}</span>
              </p>
              <p className="text-sm text-gray-500">
                Venda: <span className="font-bold text-green-600">R$ {p.precoVenda.toFixed(2)}</span>
                <span className="mx-2 text-gray-300">|</span>
                Estoque: <span className="font-bold text-blue-600">{p.quantidade}</span>
              </p>
            </div>

            <button
              onClick={() => onRemover(p.id)}
              className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
              title="Remover produto"
            >
              <Trash2 size={20} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}