import CryptoJS from "crypto-js";

// Puxando a chave do arquivo .env
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "chave-reserva-caso-de-erro";

export const Seguranca = {
  criptografar: (dados: any) => {
    return CryptoJS.AES.encrypt(JSON.stringify(dados), SECRET_KEY).toString();
  },
  descriptografar: (textoCripto: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(textoCripto, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      return null;
    }
  }
};