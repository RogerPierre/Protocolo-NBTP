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
            <div style="width: 100%; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 20px; padding: 24px; animation: fadeIn 0.3s ease-out;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                    <div style="background: ${accentColor}20; color: ${accentColor}; width: 48px; height: 48px; border-radius: 12px; display: flex; justify-content: center; align-items: center;">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div>
                        <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text);">${titulo}</h3>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">${resposta.message}</p>
                    </div>
                </div>
                
                <div style="background: var(--bg); border-radius: 12px; padding: 16px; border: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Saldo Atualizado</span>
                        <span style="font-size: 1.25rem; font-weight: 700; color: var(--text);">R$ ${resposta.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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