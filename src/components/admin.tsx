import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, ShieldCheck, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";

interface AdminProps {
  onNavigate: (tela: string) => void;
}

export default function Admin({ onNavigate }: AdminProps) {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [erro, setErro] = useState("");

  const API_URL = "http://localhost:3333";

  useEffect(() => {
    buscarUsuarios();
  }, []);

  async function buscarUsuarios() {
    try {
      const resposta = await fetch(`${API_URL}/usuarios`);
      const dados = await resposta.json();
      
      if (resposta.ok) {
        setUsuarios(dados);
      } else {
        setErro("Não foi possível carregar a lista de usuários.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    }
  }

  async function deletarUsuario(email: string) {
    if (window.confirm(`Deseja realmente remover o acesso de ${email}? Todos os dados dele serão apagados do banco.`)) {
      try {
        const resposta = await fetch(`${API_URL}/usuarios/${email}`, {
          method: "DELETE"
        });

        if (resposta.ok) {
          setUsuarios(usuarios.filter((u) => u.email !== email));
        } else {
          alert("Erro ao tentar deletar o usuário.");
        }
      } catch (error) {
        alert("Erro de conexão com o servidor.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("login")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Painel do Administrador</h1>
        </div>
        <ShieldCheck className="text-blue-600" size={28} />
      </div>

      {erro && (
        <div className="mb-6 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Usuário</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                Senha (Cryptografada)
                <button 
                  onClick={() => setMostrarSenhas(!mostrarSenhas)}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                  title={mostrarSenhas ? "Ocultar senhas" : "Mostrar senhas"}
                >
                  {mostrarSenhas ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((user) => (
              <tr key={user.email} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <span className="block text-sm font-medium text-gray-900">{user.nome}</span>
                      <span className="block text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {mostrarSenhas ? (
                    <span className="text-[10px] font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200 break-all max-w-[200px] inline-block">
                      {user.senha}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      ●●●●●●●●●●●●
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => deletarUsuario(user.email)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir Usuário"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && !erro && (
          <p className="text-center py-10 text-gray-500">Nenhum usuário cadastrado no banco de dados.</p>
        )}
      </div>
    </div>
  );
}