export function getPdfHtml(report: any) {
  const content = report.conteudo_json
  const highlightsHtml =
    content.highlights?.map((h: string) => `<li>${h}</li>`).join('') || ''

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${report.titulo}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 24px; }
          h2 { color: #2b6cb0; margin-top: 30px; font-size: 18px; border-bottom: 1px solid #edf2f7; padding-bottom: 5px; }
          .meta { color: #718096; font-size: 0.9em; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 6px; }
          .section { margin-bottom: 20px; }
          .risk { display: inline-block; padding: 4px 8px; background: #fed7d7; color: #c53030; border-radius: 4px; font-weight: bold; }
          ul { margin-top: 10px; padding-left: 20px; }
          li { margin-bottom: 8px; }
          .insight-box { background: #f0fdf4; border-left: 4px solid #48bb78; padding: 15px; margin-top: 15px; border-radius: 0 6px 6px 0; }
          @media print {
            body { padding: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${report.titulo}</h1>
        <div class="meta">
          <p><strong>Data de Geração:</strong> ${new Date(report.data_geracao).toLocaleString('pt-BR')}</p>
          <p><strong>Escopo/Tipo:</strong> ${report.tipo}</p>
          ${report.escolas_instituicoes?.nome_escola ? `<p><strong>Instituição:</strong> ${report.escolas_instituicoes.nome_escola}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>Resumo Executivo</h2>
          <p>${content.summary || 'Não disponível'}</p>
        </div>

        <div class="section">
          <h2>Principais Destaques</h2>
          <ul>${highlightsHtml}</ul>
        </div>
        
        ${
          content.complaint_types
            ? `
        <div class="section">
          <h2>Análise de Denúncias</h2>
          <div class="insight-box">
            <p><strong>Tipos Incidentes:</strong> ${content.complaint_types}</p>
            <p><strong>Tratamento e Resolução:</strong> ${content.treatment_status}</p>
          </div>
        </div>
        `
            : ''
        }
        
        ${
          content.training_correlation
            ? `
        <div class="section">
          <h2>Correlação com Treinamentos</h2>
          <p>${content.training_correlation}</p>
        </div>
        `
            : ''
        }

        <div class="section">
          <h2>Matriz de Risco e Exposição</h2>
          <p>Nível de Risco Identificado Geral: <span class="risk">${content.risk_assessment || 'N/A'}</span></p>
          <p>${content.risk_matrix || ''}</p>
        </div>

        <div class="section">
          <h2>Recomendações Estratégicas</h2>
          <p>${content.recommendations || 'Não disponível'}</p>
        </div>
        
        <script>
          window.onload = () => { window.print(); }
        </script>
      </body>
    </html>
  `
}
