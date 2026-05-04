const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/service-orders/ServiceOrderForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remover a declaração antiga
content = content.replace(/  const \[isSimplified, setIsSimplified\] = useState\(false\);\n/g, '');

// Injetar acima de skipEquipmentValidation
content = content.replace(
  '  // Estado para pular validação de equipamento',
  '  const [isSimplified, setIsSimplified] = useState(false);\n  // Estado para pular validação de equipamento'
);

fs.writeFileSync(filePath, content);
console.log('Ordem de declaração corrigida!');
