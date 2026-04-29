import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(cors()); 
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API rodando com sucesso!' });
});

app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
      }
    });

    res.status(201).json({ 
      mensagem: 'Usuário criado com sucesso!',
      usuario: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email }
    });

  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno no servidor ao cadastrar.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });

  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno no servidor ao fazer login.' });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
});

app.delete('/usuarios/:email', async (req, res) => {
  try {
    const { email } = req.params;
    await prisma.usuario.delete({
      where: { email }
    });
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar usuário.' });
  }
});

app.post('/produtos', async (req, res) => {
  try {
    const { nome, sku, precoCusto, precoVenda, quantidade, usuarioId } = req.body;

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        sku,
        precoCusto: Number(precoCusto),
        precoVenda: Number(precoVenda),
        quantidade: Number(quantidade),
        usuarioId
      }
    });

    res.status(201).json(novoProduto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao cadastrar produto.' });
  }
});

app.get('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await prisma.produto.findUnique({
      where: { id }
    });

    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
    
    res.status(200).json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar produto.' });
  }
});

app.put('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, sku, precoCusto, precoVenda, quantidade } = req.body;

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        nome,
        sku,
        precoCusto: Number(precoCusto),
        precoVenda: Number(precoVenda),
        quantidade: Number(quantidade)
      }
    });

    res.status(200).json(produtoAtualizado);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar produto.' });
  }
});

app.get('/produtos/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const produtos = await prisma.produto.findMany({
      where: { usuarioId }
    });
    res.status(200).json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar produtos do estoque.' });
  }
});

app.delete('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.produto.delete({
      where: { id }
    });
    res.status(200).json({ mensagem: 'Produto deletado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar produto.' });
  }
});

app.post('/vendas', async (req, res) => {
  try {
    const { total, pagamento, itens, usuarioId } = req.body;

    const novaVenda = await prisma.venda.create({
      data: {
        total: Number(total),
        pagamento,
        itens: JSON.stringify(itens),
        usuarioId
      }
    });

    for (const item of itens) {
      await prisma.produto.update({
        where: { id: item.id },
        data: {
          quantidade: {
            decrement: item.quantidadeCarrinho
          }
        }
      });
    }

    res.status(201).json({ mensagem: 'Venda finalizada com sucesso!', venda: novaVenda });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao registrar venda e atualizar estoque.' });
  }
});

app.get('/vendas/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    const vendas = await prisma.venda.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' }
    });

    res.status(200).json(vendas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar histórico de vendas.' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
