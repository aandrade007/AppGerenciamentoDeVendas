import { useState } from "react";
import { ShoppingBag, Eye, EyeOff, AlertCircle, CheckCircle2, User } from "lucide-react";

interface LoginProps {
  onNavigate: (tela: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const API_URL = "http://localhost:3333";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!email || !senha) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!email.includes("@")) {
      setErro("Digite um e-mail válido.");
      return;
    }

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminSenha = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email === adminEmail && senha === adminSenha && !modoCadastro) {
      onNavigate("admin");
      return;
    }

    if (modoCadastro) {
      if (!nome.trim()) {
        setErro("Por favor, digite seu nome completo.");
        return;
      }
      if (senha.length < 6) {
        setErro("A senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (senha !== confirmarSenha) {
        setErro("As senhas não coincidem.");
        return;
      }

      try {
        const resposta = await fetch(`${API_URL}/cadastro`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, senha }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          setErro(dados.erro || "Erro ao cadastrar. Tente novamente.");
          return;
        }

        setSucesso("Conta criada com sucesso! Agora faça login.");
        setModoCadastro(false);
        setSenha("");
        setConfirmarSenha("");

      } 
      catch (error) {
        setErro("Erro ao conectar com o servidor.");
      }
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao fazer login.");
        return;
      }

      localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));
      onNavigate("estoque");

    } 
    catch (error) {
      setErro("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg">
            <ShoppingBag size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {modoCadastro ? "Criar Conta" : "SalesMaster"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {modoCadastro
              ? "Preencha os dados para se cadastrar"
              : "Gerenciamento de Vendas e Estoque"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modoCadastro && (
            <div className="animate-in fade-in duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
                <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>

          {/* SENHA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="******"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {modoCadastro && (
            <div className="animate-in fade-in duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              />
            </div>
          )}

          {erro && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle size={16} />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
              <CheckCircle2 size={16} />
              <span>{sucesso}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-blue-100 mt-2"
          >
            {modoCadastro ? "Finalizar Cadastro" : "Entrar no Sistema"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {modoCadastro ? "Já possui uma conta?" : "Ainda não tem acesso?"}{" "}
            <button
              onClick={() => {
                setModoCadastro(!modoCadastro);
                setErro("");
                setSucesso("");
                setSenha("");
                setConfirmarSenha("");
                setNome(""); 
              }}
              className="text-blue-600 font-bold hover:underline underline-offset-4"
            >
              {modoCadastro ? "Fazer Login" : "Criar uma conta"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}