document.addEventListener("DOMContentLoaded", function () {
    // Elementos do DOM
    const colaboradorForm = document.getElementById('colaboradorForm');
    const etapa2 = document.getElementById('etapa2');
    const reportForm = document.getElementById('reportForm');
    const exportPdfButton = document.getElementById('exportPdfButton');
    const entriesContainer = document.getElementById('entriesContainer');

    // Paleta de cores
    const theme = {
        primary: '#34495e',
        secondary: '#3498db',
        background: '#f8f9fa',
        headerBg: '#2c3e50',
        text: '#2c3e50',
        success: '#27ae60',
        warning: '#f1c40f',
        danger: '#e74c3c'
    };

    // Estrutura de dados
    let colaboradorData = {};
    let weeklyData = {
        seg: { entries: [], totals: { riocard: 0, jae: 0, outros: 0 } },
        ter: { entries: [], totals: { riocard: 0, jae: 0, outros: 0 } },
        qua: { entries: [], totals: { riocard: 0, jae: 0, outros: 0 } },
        qui: { entries: [], totals: { riocard: 0, jae: 0, outros: 0 } },
        sex: { entries: [], totals: { riocard: 0, jae: 0, outros: 0 } },
        sab: { entries: [], totals: { riocard: 0, jae: 0, outros: 0 } }
    };

    // Inicialização
    createDaySections();

    // Event Listeners
    colaboradorForm.addEventListener('submit', handleColaboradorSubmit);
    reportForm.addEventListener('submit', handleReportSubmit);
    exportPdfButton.addEventListener('click', generatePDF);

    function handleColaboradorSubmit(event) {
        event.preventDefault();
        if (!validateColaboradorForm()) return;

        // Coletar dados do formulário
        colaboradorData = {
            nomeCompleto: document.getElementById('nomeCompleto').value.toUpperCase(),
            endereco: document.getElementById('endereco').value.toUpperCase(),
            bairro: document.getElementById('bairro').value.toUpperCase(),
            cidade: document.getElementById('cidade').value.toUpperCase(),
            telefone: document.getElementById('telefone').value,
            dataEnvio: document.getElementById('dataEnvio').value,
            tipoRelatorio: document.getElementById('tipoRelatorio').value.toUpperCase(),
            equipe: document.getElementById('equipe').value.toUpperCase(),
        };

        // Ocultar Etapa 1 e exibir Etapa 2
        colaboradorForm.style.display = 'none';
        etapa2.style.display = 'block';
    }

    function handleReportSubmit(event) {
        event.preventDefault();
        if (!validateReportForm()) return;

        const report = {
            dataVisita: document.getElementById('dataVisita').value,
            partida: document.getElementById('partida').value.toUpperCase(),
            destino: document.getElementById('destino').value.toUpperCase(),
            modal: document.getElementById('modal').value.toUpperCase(),
            tipoLinha: document.getElementById('tipoLinha').value.toUpperCase(),
            valor: parseFloat(document.getElementById('valor').value.replace(',', '.')) || 0,
            bilhetagem: document.getElementById('bilhetagem').value
        };

        const day = getDayKey(report.dataVisita);
        weeklyData[day].entries.push(report);
        updateTotals(day, report.bilhetagem, report.valor);
        updateDayTable(day);
        reportForm.reset();
    }

    function getDayKey(fullDayName) {
        return fullDayName.toLowerCase().substring(0, 3);
    }

    function updateTotals(day, type, value) {
        const totals = weeklyData[day].totals;
        totals[type] = (totals[type] || 0) + value;
    }

    function createDaySections() {
        const days = [
            { key: 'seg', name: 'SEGUNDA-FEIRA' },
            { key: 'ter', name: 'TERÇA-FEIRA' },
            { key: 'qua', name: 'QUARTA-FEIRA' },
            { key: 'qui', name: 'QUINTA-FEIRA' },
            { key: 'sex', name: 'SEXTA-FEIRA' },
            { key: 'sab', name: 'SÁBADO' }
        ];

        days.forEach(day => {
            const section = document.createElement('div');
            section.className = 'day-section';
            section.innerHTML = `
                <div class="day-header" style="background: ${theme.headerBg}; color: white;">
                    <h3>${day.name}</h3>
                </div>
                <div class="day-content">
                    <table class="styled-table">
                        <thead>
                            <tr>
                                <th>Partida</th>
                                <th>Destino</th>
                                <th>Modal</th>
                                <th>Tipo Linha</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="${day.key}-entries"></tbody>
                    </table>
                    <div class="day-totals">
                        <div class="total-item" style="border-color: ${theme.success}">
                            <span>Rio Card</span>
                            <strong id="${day.key}-riocard">R$ 0.00</strong>
                        </div>
                        <div class="total-item" style="border-color: ${theme.warning}">
                            <span>JAÉ</span>
                            <strong id="${day.key}-jae">R$ 0.00</strong>
                        </div>
                        <div class="total-item" style="border-color: ${theme.danger}">
                            <span>Outros</span>
                            <strong id="${day.key}-outros">R$ 0.00</strong>
                        </div>
                        <div class="total-day" style="background: ${theme.primary}">
                            <span>Total Dia</span>
                            <strong id="${day.key}-total">R$ 0.00</strong>
                        </div>
                    </div>
                </div>
            `;
            entriesContainer.appendChild(section);
        });
    }

    function updateDayTable(dayKey) {
        const tbody = document.getElementById(`${dayKey}-entries`);
        const { entries, totals } = weeklyData[dayKey];
        const totalDay = totals.riocard + totals.jae + totals.outros;

        tbody.innerHTML = entries.map((entry, index) => `
            <tr style="background: ${getRowBackground(entry.bilhetagem)}">
                <td>${entry.partida}</td>
                <td>${entry.destino}</td>
                <td>${entry.modal}</td>
                <td>${entry.tipoLinha}</td>
                <td>R$ ${entry.valor.toFixed(2)}</td>
                <td>
                    <button class="remove-btn" onclick="removeEntry('${dayKey}', ${index})">
                        ✕
                    </button>
                </td>
            </tr>
        `).join('');

        document.getElementById(`${dayKey}-riocard`).textContent = `R$ ${totals.riocard.toFixed(2)}`;
        document.getElementById(`${dayKey}-jae`).textContent = `R$ ${totals.jae.toFixed(2)}`;
        document.getElementById(`${dayKey}-outros`).textContent = `R$ ${totals.outros.toFixed(2)}`;
        document.getElementById(`${dayKey}-total`).textContent = `R$ ${totalDay.toFixed(2)}`;
    }

    function getRowBackground(bilhetagem) {
        const backgrounds = {
            riocard: '#e8f4fc',
            jae: '#e8f6ec',
            outros: '#f4f4f4'
        };
        return backgrounds[bilhetagem] || theme.background;
    }

    window.removeEntry = function(dayKey, index) {
        const entry = weeklyData[dayKey].entries[index];
        weeklyData[dayKey].entries.splice(index, 1);
        weeklyData[dayKey].totals[entry.bilhetagem] -= entry.valor;
        updateDayTable(dayKey);
    };

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        
        // Configuração do documento
        doc.setFont('helvetica');
        doc.setProperties({ title: 'Relatório Completo de Passagens' });

        // Cabeçalho
        doc.setFontSize(16);
        doc.setTextColor(theme.headerBg);
        doc.text("RELATÓRIO DE PASSAGENS", 105, 15, { align: 'center' });

        // Informações do Promotor
        doc.setFontSize(10);
        doc.setTextColor(theme.text);
        doc.text(`Nome: ${colaboradorData.nomeCompleto}`, 20, 25);
        doc.text(`Endereço: ${colaboradorData.endereco}`, 20, 30);
        doc.text(`Bairro: ${colaboradorData.bairro}`, 20, 35);
        doc.text(`Cidade: ${colaboradorData.cidade}`, 20, 40);
        doc.text(`Telefone: ${colaboradorData.telefone}`, 20, 45);

        // Conteúdo principal
        let y = 60;
        Object.entries(weeklyData).forEach(([dayKey, dayData]) => {
            if(dayData.entries.length > 0) {
                createDayPDFSection(doc, dayKey, dayData, 20, y);
                y = doc.lastAutoTable.finalY + 20;
            }
        });

        // Total Geral
        const totalGeral = Object.values(weeklyData).reduce((acc, day) => 
            acc + day.totals.riocard + day.totals.jae + day.totals.outros, 0);
        
        doc.setFontSize(12);
        doc.setTextColor(theme.primary);
        doc.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`, 105, y + 10, { align: 'center' });

        doc.save('relatorio_completo.pdf');
    }

    function createDayPDFSection(doc, dayKey, dayData, x, y) {
        const dayName = {
            seg: 'SEGUNDA-FEIRA',
            ter: 'TERÇA-FEIRA',
            qua: 'QUARTA-FEIRA',
            qui: 'QUINTA-FEIRA',
            sex: 'SEXTA-FEIRA',
            sab: 'SÁBADO'
        }[dayKey];

        // Cabeçalho da seção
        doc.setFillColor(theme.headerBg);
        doc.rect(x, y, 170, 8, 'F');
        doc.setTextColor(255);
        doc.setFontSize(12);
        doc.text(dayName, x + 85, y + 5, { align: 'center' });

        // Tabela de dados
        doc.autoTable({
            startY: y + 10,
            startX: x,
            head: [['Partida', 'Destino', 'Modal', 'Tipo Linha', 'Valor']],
            body: dayData.entries.map(entry => [
                entry.partida,
                entry.destino,
                entry.modal,
                entry.tipoLinha,
                `R$ ${entry.valor.toFixed(2)}`
            ]),
            styles: {
                fillColor: 255,
                textColor: theme.text,
                fontSize: 9
            },
            headStyles: {
                fillColor: theme.headerBg,
                textColor: 255
            },
            bodyStyles: {
                fillColor: row => 
                    row.dataIndex % 2 === 0 ? theme.background : 255
            }
        });

        // Totais
        const finalY = doc.lastAutoTable.finalY + 5;
        doc.setFontSize(10);
        doc.setTextColor(theme.text);
        doc.text(`Rio Card: R$ ${dayData.totals.riocard.toFixed(2)}`, x, finalY);
        doc.text(`JAÉ: R$ ${dayData.totals.jae.toFixed(2)}`, x + 60, finalY);
        doc.text(`Outros: R$ ${dayData.totals.outros.toFixed(2)}`, x + 120, finalY);
        
        doc.setFontStyle('bold');
        doc.text(`TOTAL ${dayName}: R$ ${(dayData.totals.riocard + dayData.totals.jae + dayData.totals.outros).toFixed(2)}`, 
            x, finalY + 10);
    }

    // Validações
    function validateColaboradorForm() {
        if (!document.getElementById('autorizacao').checked) {
            showError('Você precisa marcar a caixa de autorização antes de salvar os dados.');
            return false;
        }
        return true;
    }

    function validateReportForm() {
        const requiredFields = ['dataVisita', 'partida', 'destino', 'modal'];
        return requiredFields.every(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                showError(`Campo obrigatório: ${element.labels[0].textContent}`);
                element.focus();
                return false;
            }
            return true;
        });
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
});
