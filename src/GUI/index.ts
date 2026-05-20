import { BancoService } from "../RegrasNegocio/BancoService";
import { GBTPResponse } from "../protocolo/GBTPResponse";

declare global {
    interface Window {
        lucide: {
            createIcons: () => void;
        };
    }
}

export class Index {

    private bancoService: BancoService;

    constructor() {
        this.bancoService = new BancoService();

        this.configurarEventos();
    }

    private configurarEventos(): void {

        const btnSaldo = document.getElementById('btnSaldo');
        const btnDeposito = document.getElementById('btnDeposito');
        const btnSaque = document.getElementById('btnSaque');
        const btnTransferencia = document.getElementById('btnTransferencia');

        btnSaldo?.addEventListener('click', () => this.consultarSaldo());

        btnDeposito?.addEventListener('click', () => this.depositar());

        btnSaque?.addEventListener('click', () => this.sacar());

        btnTransferencia?.addEventListener('click', () => this.transferir());
    }

    private async consultarSaldo(): Promise<void> {
        const conta = this.getValorInput('accountId');
        if (!conta) return this.mostrarErro('Informe o ID da conta');

        await this.executarOperacao('btnSaldo', () => this.bancoService.consultarSaldo(conta));
    }

    private async depositar(): Promise<void> {
        const conta = this.getValorInput('accountId');
        const valor = Number(this.getValorInput('value'));

        if (!conta) return this.mostrarErro('Informe o ID da conta');
        if (isNaN(valor) || valor <= 0) return this.mostrarErro('Informe um valor válido');

        await this.executarOperacao('btnDeposito', () => this.bancoService.depositar(conta, valor));
    }

    private async sacar(): Promise<void> {
        const conta = this.getValorInput('accountId');
        const valor = Number(this.getValorInput('value'));

        if (!conta) return this.mostrarErro('Informe o ID da conta');
        if (isNaN(valor) || valor <= 0) return this.mostrarErro('Informe um valor válido');

        await this.executarOperacao('btnSaque', () => this.bancoService.sacar(conta, valor));
    }

    private async transferir(): Promise<void> {
        const contaOrigem = this.getValorInput('accountId');
        const contaDestino = this.getValorInput('toAccountId');
        const valor = Number(this.getValorInput('value'));

        if (!contaOrigem) return this.mostrarErro('Informe a conta de origem');
        if (!contaDestino) return this.mostrarErro('Informe a conta de destino');
        if (isNaN(valor) || valor <= 0) return this.mostrarErro('Informe um valor válido');

        await this.executarOperacao('btnTransferencia', () => 
            this.bancoService.transferir(contaOrigem, contaDestino, valor)
        );
    }

    private async executarOperacao(btnId: string, operacao: () => Promise<GBTPResponse>): Promise<void> {
        const btn = document.getElementById(btnId) as HTMLButtonElement;
        const originalContent = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin"></i> Processando...`;
            if (window.lucide) window.lucide.createIcons();

            const resposta = await operacao();
            this.exibirResposta(resposta);
        } catch (error) {
            this.mostrarErro('Erro de conexão com o servidor');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    private mostrarErro(mensagem: string): void {
        this.exibirResposta({
            status: 'ERROR',
            message: mensagem,
            balance: 0
        });
    }

    private getValorInput(id: string): string {

        const elemento = document.getElementById(id) as HTMLInputElement;

        return elemento.value;
    }

    private exibirResposta(resposta: GBTPResponse): void {

        const resultado = document.getElementById('resultado');

        if (!resultado) return;

        const isSucesso = String(resposta.status).toUpperCase() === 'OK';
        const accentColor = isSucesso ? 'var(--success)' : 'var(--error)';
        const iconName = isSucesso ? 'check-circle' : 'alert-triangle';
        const titulo = isSucesso ? 'Sucesso' : 'Erro na Operação';

        resultado.innerHTML = `
            <div style="width: 100%; background: var(--card-bg); border: 1px solid var(--border); border-radius: 20px; padding: 24px; animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px;">
                    <div style="background: ${accentColor}15; color: ${accentColor}; width: 48px; height: 48px; border-radius: 12px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; border: 1px solid ${accentColor}30;">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text); margin-bottom: 4px;">${titulo}</h3>
                        <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">${resposta.message}</p>
                    </div>
                </div>
                
                <div style="background: linear-gradient(to right, var(--bg), rgba(255,255,255,0.02)); border-radius: 16px; padding: 20px; border: 1px solid var(--border); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: ${accentColor}; filter: blur(40px); opacity: 0.1;"></div>
                    <div style="display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 1;">
                        <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Saldo Atualizado</span>
                        <div style="display: flex; align-items: baseline; gap: 4px;">
                            <span style="font-size: 0.875rem; font-weight: 600; color: var(--text-muted);">R$</span>
                            <span style="font-size: 1.75rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em;">${resposta.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            </style>
        `;

        // Re-run Lucide to render the new icon
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

new Index();