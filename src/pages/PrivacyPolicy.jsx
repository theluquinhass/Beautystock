import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold mb-6 transition-colors">
                            <ArrowLeft size={16} /> Voltar para o início
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Política de Privacidade</h1>
                        <p className="text-gray-500 mt-2 font-medium">Última atualização: 04 de março de 2026</p>
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ec4899] to-[#d8b4fe]">B</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-12 prose prose-pink max-w-none text-gray-600">
                    <p className="text-lg font-medium text-gray-800 mb-8">
                        Esta Política de Privacidade explica como o BeautyStock coleta, utiliza e protege as informações dos usuários da plataforma.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Informações coletadas</h2>
                    <p>Podemos coletar as seguintes informações:</p>

                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">Informações de cadastro</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li>nome</li>
                        <li>email</li>
                        <li>senha criptografada</li>
                    </ul>

                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">Informações de uso</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li>produtos cadastrados</li>
                        <li>clientes registrados</li>
                        <li>dados de vendas</li>
                        <li>estoque</li>
                    </ul>

                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2">Informações técnicas</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>endereço IP</li>
                        <li>navegador utilizado</li>
                        <li>dispositivo</li>
                        <li>cookies</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Como utilizamos as informações</h2>
                    <p>As informações coletadas são utilizadas para:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>permitir o funcionamento da plataforma</li>
                        <li>melhorar a experiência do usuário</li>
                        <li>fornecer suporte</li>
                        <li>gerar relatórios e funcionalidades do sistema</li>
                        <li>garantir segurança da plataforma</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Compartilhamento de dados</h2>
                    <p><strong>O BeautyStock não vende dados pessoais.</strong></p>
                    <p>Podemos compartilhar informações apenas com:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>serviços de hospedagem</li>
                        <li>provedores de pagamento</li>
                        <li>ferramentas necessárias para funcionamento da plataforma</li>
                    </ul>
                    <p>Sempre respeitando a legislação vigente.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Segurança dos dados</h2>
                    <p>Adotamos medidas técnicas e organizacionais para proteger os dados dos usuários. Isso inclui:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>criptografia de senha</li>
                        <li>proteção contra acesso não autorizado</li>
                        <li>uso de provedores de infraestrutura seguros</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Cookies</h2>
                    <p>O BeautyStock pode utilizar cookies para:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>manter o usuário logado</li>
                        <li>melhorar a experiência de navegação</li>
                        <li>analisar o uso da plataforma</li>
                    </ul>
                    <p>O usuário pode gerenciar cookies nas configurações do navegador.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Direitos do usuário (LGPD)</h2>
                    <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), o usuário pode:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>solicitar acesso aos seus dados</li>
                        <li>solicitar correção de dados</li>
                        <li>solicitar exclusão de dados</li>
                        <li>solicitar portabilidade</li>
                    </ul>
                    <p>Para isso, basta entrar em contato com o suporte.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Retenção de dados</h2>
                    <p>Os dados são armazenados enquanto a conta estiver ativa ou enquanto forem necessários para funcionamento da plataforma.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Alterações nesta política</h2>
                    <p>Esta Política de Privacidade pode ser atualizada periodicamente.</p>
                    <p>A versão mais recente estará sempre disponível nesta página.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Contato</h2>
                    <p>Para dúvidas relacionadas à privacidade de dados:</p>
                    <p className="mt-2 text-pink-600 font-medium">Email: suporte@beautystockapp.com</p>
                </div>

            </div>
        </div>
    );
}
