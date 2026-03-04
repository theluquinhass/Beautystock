import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold mb-6 transition-colors">
                            <ArrowLeft size={16} /> Voltar para o início
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Termos de Uso</h1>
                        <p className="text-gray-500 mt-2 font-medium">Última atualização: 04 de março de 2026</p>
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#ec4899] to-[#d8b4fe]">B</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-12 prose prose-pink max-w-none text-gray-600">
                    <p className="text-lg font-medium text-gray-800 mb-8">
                        Bem-vindo ao BeautyStock.<br />
                        Estes Termos de Uso regulam o acesso e uso da plataforma BeautyStock, disponível via navegador web e dispositivos móveis.<br />
                        Ao acessar ou utilizar o BeautyStock, você concorda com estes termos.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Sobre o BeautyStock</h2>
                    <p>
                        O BeautyStock é uma plataforma digital (SaaS) criada para auxiliar revendedores de cosméticos, perfumes e produtos similares a:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>gerenciar estoque</li>
                        <li>organizar clientes</li>
                        <li>controlar vendas e fiado</li>
                        <li>compartilhar catálogos online</li>
                        <li>acompanhar relatórios de vendas</li>
                    </ul>
                    <p>O sistema funciona através de acesso online via navegador.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Cadastro do usuário</h2>
                    <p>Para utilizar o BeautyStock é necessário criar uma conta. O usuário se compromete a:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>fornecer informações verdadeiras</li>
                        <li>manter seus dados atualizados</li>
                        <li>manter sua senha segura</li>
                        <li>não compartilhar sua conta com terceiros</li>
                    </ul>
                    <p>O usuário é responsável por todas as atividades realizadas em sua conta.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Planos e pagamentos</h2>
                    <p>O BeautyStock pode oferecer:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>plano gratuito com limitações</li>
                        <li>plano pago (BeautyStock PRO)</li>
                    </ul>
                    <p>Os pagamentos podem ser processados por plataformas terceiras de pagamento.</p>
                    <p>Ao contratar um plano pago, o usuário concorda com:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>cobrança recorrente mensal</li>
                        <li>renovação automática (caso aplicável)</li>
                        <li>cancelamento conforme as regras da plataforma</li>
                    </ul>
                    <p>O usuário pode cancelar o plano a qualquer momento.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Período de teste</h2>
                    <p>O BeautyStock pode oferecer um período de teste gratuito, permitindo que o usuário experimente a plataforma antes da cobrança.</p>
                    <p>Após o término do período de teste, o acesso às funcionalidades premium poderá ser limitado caso o plano não seja contratado.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Uso adequado da plataforma</h2>
                    <p>O usuário concorda em não utilizar o BeautyStock para:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>atividades ilegais</li>
                        <li>fraudes</li>
                        <li>distribuição de conteúdo ilícito</li>
                        <li>tentativa de invasão ou exploração do sistema</li>
                    </ul>
                    <p>O descumprimento dessas regras pode resultar em suspensão ou encerramento da conta.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Responsabilidade sobre dados</h2>
                    <p>O usuário é responsável pelos dados inseridos na plataforma, incluindo:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>produtos cadastrados</li>
                        <li>clientes</li>
                        <li>valores de vendas</li>
                        <li>informações financeiras</li>
                    </ul>
                    <p>O BeautyStock não se responsabiliza por erros de cadastro realizados pelo usuário.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Disponibilidade do serviço</h2>
                    <p>O BeautyStock se compromete a manter a plataforma disponível, porém podem ocorrer:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>manutenções</li>
                        <li>atualizações</li>
                        <li>instabilidades temporárias</li>
                    </ul>
                    <p>Nesses casos, o serviço poderá ficar temporariamente indisponível.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Propriedade intelectual</h2>
                    <p>Todo o conteúdo da plataforma, incluindo:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>design</li>
                        <li>código</li>
                        <li>marca</li>
                        <li>logotipo</li>
                        <li>funcionalidades</li>
                    </ul>
                    <p>pertence ao BeautyStock e é protegido por leis de propriedade intelectual.</p>
                    <p>É proibida a reprodução ou cópia da plataforma sem autorização.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Cancelamento de conta</h2>
                    <p>O usuário pode solicitar o cancelamento de sua conta a qualquer momento.</p>
                    <p>O BeautyStock também poderá suspender ou encerrar contas que violem estes termos.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. Alterações nos termos</h2>
                    <p>O BeautyStock poderá atualizar estes Termos de Uso a qualquer momento.</p>
                    <p>Quando isso ocorrer, a nova versão será publicada nesta página.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">11. Contato</h2>
                    <p>Para dúvidas ou suporte, entre em contato através de:</p>
                    <p className="mt-2 text-pink-600 font-medium">Email: suporte@beautystockapp.com</p>
                </div>

            </div>
        </div>
    );
}
