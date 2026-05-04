const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/service-orders/ServiceOrderForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Adicionar import
if (!content.includes('import { ServicesAndPartsSection }')) {
  content = content.replace(
    "import { SearchableSelect } from '../ui/SearchableSelect';",
    "import { SearchableSelect } from '../ui/SearchableSelect';\nimport { ServicesAndPartsSection } from './form-sections/ServicesAndPartsSection';"
  );
}

// Substituir seção
const startMarker = '{/* Serviços e Peças */}';
const endMarker = '{/* Seção de Fechamento (Apenas Edição) */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  const componentStr = `{/* Serviços e Peças Componentizado */}
            <ServicesAndPartsSection 
              inventoryItems={inventoryItems}
              serviceFields={serviceFields}
              watchedServices={watchedServices}
              appendService={appendService}
              removeService={removeService}
              partFields={partFields}
              watchedParts={watchedParts}
              appendPart={appendPart}
              removePart={removePart}
              updatePart={updatePart}
            />

            `;
            
  fs.writeFileSync(filePath, before + componentStr + after);
  console.log('Refatoração aplicada com sucesso!');
} else {
  console.error('Markers não encontrados!', { startIndex, endIndex });
}
