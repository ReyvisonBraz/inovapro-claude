const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/service-orders/ServiceOrderForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { AnalysisSection }')) {
  content = content.replace(
    "import { CustomerSection } from './form-sections/CustomerSection';",
    "import { CustomerSection } from './form-sections/CustomerSection';\nimport { AnalysisSection } from './form-sections/AnalysisSection';\nimport { ClosingSection } from './form-sections/ClosingSection';"
  );
}

// Substituir AnalysisSection
const startMarkerAnalysis = '{/* Problema e Análise */}';
const endMarkerAnalysis = '{/* Serviços e Peças Componentizado */}';

const startIndexAnalysis = content.indexOf(startMarkerAnalysis);
const endIndexAnalysis = content.indexOf(endMarkerAnalysis);

if (startIndexAnalysis !== -1 && endIndexAnalysis !== -1) {
  const beforeAnalysis = content.substring(0, startIndexAnalysis);
  const afterAnalysis = content.substring(endIndexAnalysis);
  
  const componentStrAnalysis = `{/* Problema e Análise Componentizado */}
            <AnalysisSection 
              isSimplified={isSimplified}
              statuses={statuses}
            />

            `;
            
  content = beforeAnalysis + componentStrAnalysis + afterAnalysis;
}

// Substituir ClosingSection
const startMarkerClosing = '{/* Seção de Fechamento (Apenas Edição) */}';
const endMarkerClosing = '          </div>\n\n          {/* Modal Footer */}';

const startIndexClosing = content.indexOf(startMarkerClosing);
const endIndexClosing = content.indexOf(endMarkerClosing);

if (startIndexClosing !== -1 && endIndexClosing !== -1) {
  const beforeClosing = content.substring(0, startIndexClosing);
  const afterClosing = content.substring(endIndexClosing);
  
  const componentStrClosing = `{/* Seção de Fechamento Componentizado */}
            <ClosingSection 
              editingOrder={editingOrder}
              setShowQRCodeModal={setShowQRCodeModal}
            />
`;
            
  content = beforeClosing + componentStrClosing + afterClosing;
}

fs.writeFileSync(filePath, content);
console.log('Refatoração Final aplicada com sucesso!');
