const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/service-orders/ServiceOrderForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { CustomerSection }')) {
  content = content.replace(
    "import { EquipmentSection } from './form-sections/EquipmentSection';",
    "import { EquipmentSection } from './form-sections/EquipmentSection';\nimport { CustomerSection } from './form-sections/CustomerSection';"
  );
}

const startMarker = '{/* Toggle Simplificado */}';
const endMarker = '{/* Equipamento Componentizado */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  const componentStr = `{/* Cliente e Data Componentizado */}
            <CustomerSection 
              isSimplified={isSimplified}
              setIsSimplified={setIsSimplified}
              customers={customers}
              onTriggerAddCustomer={onTriggerAddCustomer}
            />

            `;
            
  fs.writeFileSync(filePath, before + componentStr + after);
  console.log('Refatoração Cliente aplicada com sucesso!');
} else {
  console.error('Markers não encontrados!', { startIndex, endIndex });
}
