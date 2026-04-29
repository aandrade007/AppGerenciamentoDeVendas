import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Camera, Lock, LogOut, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Seguranca } from "../utils/seguranca"; // Importamos para poder salvar a edição do nome

interface PerfilProps {
  onNavigate: (tela: string) => void;
}

export default function Perfil({ onNavigate }: PerfilProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Dados do usuário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  
  // Estados para alteração de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (usuarioLogado) {
      const user = JSON.parse(usuarioLogado);
      setEmail(user.email);
      setNome(user.nome || "Usuário"); 
    } 
    else {
      onNavigate("login"); 
    }
  }, [onNavigate]);

  const handleSaveProfile = () => {
    if (!nome.trim()) {
      alert("O nome não pode ficar vazio.");
      return;
    }

    // 1. Atualiza o usuário logado atual
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
    const userAtualizado = { ...usuarioLogado, nome };
    localStorage.setItem("usuarioLogado", JSON.stringify(userAtualizado));

    // 2. Atualiza a lista criptografada de usuários
    const dadosCripto = localStorage.getItem("usuarios");
    if (dadosCripto) {
      const usuarios = Seguranca.descriptografar(dadosCripto) || [];
      const novosUsuarios = usuarios.map((u: any) => 
        u.email === email ? { ...u, nome } : u
      );
      localStorage.setItem("usuarios", Seguranca.criptografar(novosUsuarios));
    }

    setIsEditing(false);
    alert("Perfil atualizado com sucesso!");
  };

  const handleChangePassword = () => {
    setErro("");
    
    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    // Busca o banco de usuários para atualizar a senha
    const dadosCripto = localStorage.getItem("usuarios");
    const usuarios = dadosCripto ? Seguranca.descriptografar(dadosCripto) || [] : [];
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");

    // Verifica se a senha atual está correta
    if (usuarioLogado.senha !== senhaAtual) {
      setErro("A senha atual está incorreta.");
      return;
    }

    // Atualiza o array de usuários
    const novosUsuarios = usuarios.map((u: any) => 
      u.email === email ? { ...u, senha: novaSenha } : u
    );
    localStorage.setItem("usuarios", Seguranca.criptografar(novosUsuarios));
    localStorage.setItem("usuarioLogado", JSON.stringify({ ...usuarioLogado, senha: novaSenha }));
    alert("Senha alterada com sucesso!");
    setIsChangingPassword(false);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
  };

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair do SalesMaster?")) {
      localStorage.removeItem("usuarioLogado");
      onNavigate("login");
    }
  };

  // Pega as iniciais
  const getInitials = (name: string) => {
    if (!name) return "US";
    const parts = name.split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-10">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (isEditing || isChangingPassword) {
                  setIsEditing(false);
                  setIsChangingPassword(false);
                } 
                else {
                  onNavigate("estoque");
                }
              }} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {isChangingPassword ? "Alterar Senha" : "Meu Perfil"}
            </h1>
          </div>
          {!isEditing && !isChangingPassword && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      <main className="px-6 py-6 space-y-6 max-w-md mx-auto w-full">
        
        {/* FOTO DO PERFIL */}
        {!isChangingPassword && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {getInitials(nome)}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-lg border-2 border-white hover:bg-gray-800 transition-colors">
                  <Camera size={14} />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4">{nome}</h2>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        )}

        {/* TELA DE ALTERAR SENHA */}
        {isChangingPassword ? (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Senha Atual</label>
              <input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              />
            </div>
            
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">Nova Senha</label>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 bottom-3.5 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              />
            </div>

            {erro && <p className="text-sm text-red-500 font-medium">{erro}</p>}

            <button
              onClick={handleChangePassword}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all"
            >
              Salvar Nova Senha
            </button>
          </div>
        ) : (
          /* TELA DE PERFIL / INFORMAÇÕES PESSOAIS */
          <>
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Informações Pessoais</h3>
              <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
                
                {/* Campo Nome */}
                <div className="p-3">
                  <label className="text-xs font-semibold text-gray-500">Nome Completo</label>
                  <div className="flex items-center gap-3 mt-1">
                    <User size={18} className="text-gray-400" />
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 bg-transparent border-none text-gray-900 focus:outline-none disabled:text-gray-600 font-medium"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100 mx-4"></div>

                {/* Campo Email */}
                <div className="p-3">
                  <label className="text-xs font-semibold text-gray-500">E-mail (Login)</label>
                  <div className="flex items-center gap-3 mt-1">
                    <Mail size={18} className="text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="flex-1 bg-transparent border-none text-gray-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

              </div>

              {/* Botões de Salvar Edição */}
              {isEditing && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 shadow-sm"
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>

            {/* CONFIGURAÇÕES E SAIR */}
            {!isEditing && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Configurações e Segurança</h3>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                  
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Lock size={20} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Alterar Senha</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors group"
                  >
                    <LogOut size={20} className="text-red-500 group-hover:text-red-600" />
                    <span className="text-sm font-bold text-red-500 group-hover:text-red-600">Sair da Conta</span>
                  </button>

                </div>
              </div>
            )}

            {!isEditing && (
              <div className="text-center mt-8">
                <p className="text-xs text-gray-400 font-medium">SalesMaster v1.0.0</p>
                <p className="text-[10px] text-gray-300 mt-1">Desenvolvido para Gestão Inteligente</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}